using Microsoft.EntityFrameworkCore;
using AutoMapper;
using SnjofkaloAPI.Data;
using SnjofkaloAPI.Models.DTOs.Common;
using SnjofkaloAPI.Models.DTOs.Responses;
using SnjofkaloAPI.Services.Interfaces;
using SnjofkaloAPI.Extensions;

namespace SnjofkaloAPI.Services.Implementation
{
    public class MarketplaceService : IMarketplaceService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<MarketplaceService> _logger;
        private readonly IDataEncryptionService _encryptionService;

        public MarketplaceService(
            ApplicationDbContext context,
            IMapper mapper,
            ILogger<MarketplaceService> logger,
            IDataEncryptionService encryptionService)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _encryptionService = encryptionService;
        }

        /// <summary>
        /// Get comprehensive marketplace analytics for admin dashboard
        /// </summary>
        public async Task<ApiResponse<object>> GetMarketplaceAnalyticsAsync()
        {
            try
            {
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                var oneYearAgo = DateTime.UtcNow.AddYears(-1);

                var analytics = new
                {
                    // Platform Overview
                    Platform = new
                    {
                        TotalItems = await _context.Items.CountAsync(i => i.IsActive),
                        AdminItems = await _context.Items.CountAsync(i => i.IsActive && i.SellerUserID == null),
                        UserItems = await _context.Items.CountAsync(i => i.IsActive && i.SellerUserID != null),
                        PendingApproval = await _context.Items.CountAsync(i => !i.IsApproved && i.ItemStatus == "Pending"),
                        TotalSellers = await _context.Items.Where(i => i.SellerUserID != null).Select(i => i.SellerUserID).Distinct().CountAsync(),
                        ActiveSellers = await _context.Items.Where(i => i.SellerUserID != null && i.IsActive && i.IsApproved).Select(i => i.SellerUserID).Distinct().CountAsync()
                    },

                    // Revenue Analytics
                    Revenue = new
                    {
                        Last30Days = await GetRevenueForPeriod(thirtyDaysAgo, DateTime.UtcNow),
                        LastYear = await GetRevenueForPeriod(oneYearAgo, DateTime.UtcNow),
                        CommissionEarned = await GetCommissionForPeriod(oneYearAgo, DateTime.UtcNow),
                        PlatformFeesEarned = await GetPlatformFeesForPeriod(oneYearAgo, DateTime.UtcNow)
                    },

                    // Top Performers
                    TopSellers = await GetTopSellers(10),
                    TopSellingItems = await GetTopSellingItems(10),
                    CategoryPerformance = await GetCategoryPerformance(),

                    // Approval Workflow
                    ApprovalMetrics = new
                    {
                        PendingCount = await _context.Items.CountAsync(i => !i.IsApproved && i.ItemStatus == "Pending"),
                        AverageApprovalTime = await GetAverageApprovalTime(),
                        ApprovalRate = await GetApprovalRate(),
                        RejectedCount = await _context.Items.CountAsync(i => i.ItemStatus == "Rejected")
                    },

                    // GDPR Compliance
                    GdprMetrics = new
                    {
                        PendingAnonymizationRequests = await _context.Users.CountAsync(u => u.RequestedAnonymization),
                        UrgentRequests = await _context.Users.CountAsync(u => u.RequestedAnonymization &&
                            u.AnonymizationRequestDate != null &&
                            EF.Functions.DateDiffDay(u.AnonymizationRequestDate.Value, DateTime.UtcNow) > 25),
                        CompletedAnonymizations = await _context.Users.CountAsync(u => u.AnonymizationNotes == "Completed anonymization")
                    }
                };

                return ApiResponse<object>.SuccessResult(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting marketplace analytics");
                return ApiResponse<object>.ErrorResult("An error occurred while retrieving marketplace analytics");
            }
        }

        /// <summary>
        /// Get seller analytics for individual seller dashboard
        /// </summary>
        public async Task<ApiResponse<SellerAnalyticsResponse>> GetSellerAnalyticsAsync(int sellerId)
        {
            try
            {
                var seller = await _context.Users
                    .Where(u => u.IDUser == sellerId)
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                if (seller == null)
                {
                    return ApiResponse<SellerAnalyticsResponse>.ErrorResult("Seller not found");
                }

                var sellerItems = await _context.Items
                    .Include(i => i.OrderItems)
                    .Where(i => i.SellerUserID == sellerId)
                    .ToListAsync();

                var orderItems = sellerItems.SelectMany(i => i.OrderItems).ToList();

                // Calculate monthly sales for the last 12 months
                var monthlySales = new List<MonthlySalesData>();
                for (int i = 11; i >= 0; i--)
                {
                    var monthStart = DateTime.UtcNow.AddMonths(-i).Date.AddDays(1 - DateTime.UtcNow.AddMonths(-i).Day);
                    var monthEnd = monthStart.AddMonths(1).AddDays(-1);

                    var monthOrderItems = orderItems.Where(oi => oi.CreatedAt >= monthStart && oi.CreatedAt <= monthEnd).ToList();
                    var monthRevenue = monthOrderItems.Sum(oi => oi.Quantity * oi.PriceAtOrder);
                    var monthCommission = monthOrderItems.Sum(oi =>
                    {
                        var item = sellerItems.First(i => i.IDItem == oi.ItemID);
                        return oi.Quantity * oi.PriceAtOrder * (item.CommissionRate ?? 0);
                    });

                    monthlySales.Add(new MonthlySalesData
                    {
                        Year = monthStart.Year,
                        Month = monthStart.Month,
                        MonthName = monthStart.ToString("MMMM yyyy"),
                        ItemsSold = monthOrderItems.Sum(oi => oi.Quantity),
                        Revenue = monthRevenue,
                        Commission = monthCommission,
                        NetEarnings = monthRevenue - monthCommission
                    });
                }

                // Get top selling items
                var topItems = sellerItems
                    .Where(i => i.OrderItems.Any())
                    .Select(i => new TopSellingItem
                    {
                        ItemId = i.IDItem,
                        Title = i.Title,
                        UnitsSold = i.OrderItems.Sum(oi => oi.Quantity),
                        Revenue = i.OrderItems.Sum(oi => oi.Quantity * oi.PriceAtOrder)
                    })
                    .OrderByDescending(i => i.UnitsSold)
                    .Take(10)
                    .ToList();

                var totalRevenue = orderItems.Sum(oi => oi.Quantity * oi.PriceAtOrder);
                var totalCommission = orderItems.Sum(oi =>
                {
                    var item = sellerItems.First(i => i.IDItem == oi.ItemID);
                    return oi.Quantity * oi.PriceAtOrder * (item.CommissionRate ?? 0);
                });

                var analytics = new SellerAnalyticsResponse
                {
                    TotalItemsListed = sellerItems.Count,
                    ActiveItems = sellerItems.Count(i => i.ItemStatus == "Active" && i.IsActive),
                    PendingItems = sellerItems.Count(i => i.ItemStatus == "Pending"),
                    SoldItems = sellerItems.Count(i => orderItems.Any(oi => oi.ItemID == i.IDItem)),
                    TotalRevenue = totalRevenue,
                    CommissionPaid = totalCommission,
                    NetEarnings = totalRevenue - totalCommission,
                    MonthlySales = monthlySales,
                    TopItems = topItems
                };

                return ApiResponse<SellerAnalyticsResponse>.SuccessResult(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting seller analytics for seller {SellerId}", sellerId);
                return ApiResponse<SellerAnalyticsResponse>.ErrorResult("An error occurred while retrieving seller analytics");
            }
        }

        /// <summary>
        /// Get platform commission report for admin
        /// </summary>
        public async Task<ApiResponse<object>> GetCommissionReportAsync(DateTime fromDate, DateTime toDate)
        {
            try
            {
                var orderItems = await _context.OrderItems
                    .Include(oi => oi.Item)
                    .Include(oi => oi.Order)
                    .Where(oi => oi.CreatedAt >= fromDate && oi.CreatedAt <= toDate && oi.Item.SellerUserID != null)
                    .ToListAsync();

                var report = new
                {
                    Period = new { FromDate = fromDate, ToDate = toDate },
                    Summary = new
                    {
                        TotalSales = orderItems.Sum(oi => oi.Quantity * oi.PriceAtOrder),
                        TotalCommission = orderItems.Sum(oi => oi.Quantity * oi.PriceAtOrder * (oi.Item.CommissionRate ?? 0)),
                        TotalPlatformFees = orderItems.Sum(oi => oi.Quantity * (oi.Item.PlatformFee ?? 0)),
                        TotalOrders = orderItems.Select(oi => oi.OrderID).Distinct().Count(),
                        TotalItems = orderItems.Sum(oi => oi.Quantity)
                    },
                    SellerBreakdown = orderItems
                        .GroupBy(oi => oi.Item.SellerUserID)
                        .Select(g => new
                        {
                            SellerId = g.Key,
                            Sales = g.Sum(oi => oi.Quantity * oi.PriceAtOrder),
                            Commission = g.Sum(oi => oi.Quantity * oi.PriceAtOrder * (oi.Item.CommissionRate ?? 0)),
                            PlatformFees = g.Sum(oi => oi.Quantity * (oi.Item.PlatformFee ?? 0)),
                            ItemsSold = g.Sum(oi => oi.Quantity)
                        })
                        .OrderByDescending(s => s.Sales)
                        .ToList()
                };

                return ApiResponse<object>.SuccessResult(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating commission report from {FromDate} to {ToDate}", fromDate, toDate);
                return ApiResponse<object>.ErrorResult("An error occurred while generating commission report");
            }
        }

        #region Private Helper Methods

        private async Task<decimal> GetRevenueForPeriod(DateTime fromDate, DateTime toDate)
        {
            return await _context.OrderItems
                .Include(oi => oi.Order)
                .Where(oi => oi.CreatedAt >= fromDate && oi.CreatedAt <= toDate)
                .SumAsync(oi => oi.Quantity * oi.PriceAtOrder);
        }

        private async Task<decimal> GetCommissionForPeriod(DateTime fromDate, DateTime toDate)
        {
            return await _context.OrderItems
                .Include(oi => oi.Item)
                .Where(oi => oi.CreatedAt >= fromDate && oi.CreatedAt <= toDate && oi.Item.SellerUserID != null)
                .SumAsync(oi => oi.Quantity * oi.PriceAtOrder * (oi.Item.CommissionRate ?? 0));
        }

        private async Task<decimal> GetPlatformFeesForPeriod(DateTime fromDate, DateTime toDate)
        {
            return await _context.OrderItems
                .Include(oi => oi.Item)
                .Where(oi => oi.CreatedAt >= fromDate && oi.CreatedAt <= toDate && oi.Item.SellerUserID != null)
                .SumAsync(oi => oi.Quantity * (oi.Item.PlatformFee ?? 0));
        }

        private async Task<List<object>> GetTopSellers(int count)
        {
            return await _context.OrderItems
                .Include(oi => oi.Item)
                    .ThenInclude(i => i.Seller)
                .Where(oi => oi.Item.SellerUserID != null)
                .GroupBy(oi => oi.Item.SellerUserID)
                .Select(g => new
                {
                    SellerId = g.Key,
                    SellerName = g.First().Item.Seller!.FirstName + " " + g.First().Item.Seller.LastName,
                    TotalSales = g.Sum(oi => oi.Quantity * oi.PriceAtOrder),
                    ItemsSold = g.Sum(oi => oi.Quantity),
                    Commission = g.Sum(oi => oi.Quantity * oi.PriceAtOrder * (oi.Item.CommissionRate ?? 0))
                })
                .OrderByDescending(s => s.TotalSales)
                .Take(count)
                .Cast<object>()
                .ToListAsync();
        }

        private async Task<List<object>> GetTopSellingItems(int count)
        {
            return await _context.OrderItems
                .Include(oi => oi.Item)
                    .ThenInclude(i => i.ItemCategory)
                .GroupBy(oi => oi.ItemID)
                .Select(g => new
                {
                    ItemId = g.Key,
                    ItemTitle = g.First().Item.Title,
                    CategoryName = g.First().Item.ItemCategory.CategoryName,
                    UnitsSold = g.Sum(oi => oi.Quantity),
                    Revenue = g.Sum(oi => oi.Quantity * oi.PriceAtOrder),
                    IsUserItem = g.First().Item.SellerUserID != null
                })
                .OrderByDescending(i => i.UnitsSold)
                .Take(count)
                .Cast<object>()
                .ToListAsync();
        }

        private async Task<List<object>> GetCategoryPerformance()
        {
            return await _context.OrderItems
                .Include(oi => oi.Item)
                    .ThenInclude(i => i.ItemCategory)
                .GroupBy(oi => oi.Item.ItemCategoryID)
                .Select(g => new
                {
                    CategoryId = g.Key,
                    CategoryName = g.First().Item.ItemCategory.CategoryName,
                    ItemsSold = g.Sum(oi => oi.Quantity),
                    Revenue = g.Sum(oi => oi.Quantity * oi.PriceAtOrder),
                    AveragePrice = g.Average(oi => oi.PriceAtOrder)
                })
                .OrderByDescending(c => c.Revenue)
                .Cast<object>()
                .ToListAsync();
        }

        private async Task<double> GetAverageApprovalTime()
        {
            var approvedItems = await _context.Items
                .Where(i => i.IsApproved && i.ApprovalDate != null && i.SellerUserID != null)
                .Select(i => new { i.CreatedAt, i.ApprovalDate })
                .ToListAsync();

            if (!approvedItems.Any()) return 0;

            return approvedItems.Average(i => (i.ApprovalDate!.Value - i.CreatedAt).TotalHours);
        }

        private async Task<double> GetApprovalRate()
        {
            var totalUserItems = await _context.Items.CountAsync(i => i.SellerUserID != null);
            if (totalUserItems == 0) return 0;

            var approvedUserItems = await _context.Items.CountAsync(i => i.SellerUserID != null && i.IsApproved);
            return (double)approvedUserItems / totalUserItems * 100;
        }

        #endregion
    }
}