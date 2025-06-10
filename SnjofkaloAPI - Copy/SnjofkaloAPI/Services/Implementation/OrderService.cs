using Microsoft.EntityFrameworkCore;
using AutoMapper;
using SnjofkaloAPI.Data;
using SnjofkaloAPI.Models.DTOs.Common;
using SnjofkaloAPI.Models.DTOs.Requests;
using SnjofkaloAPI.Models.DTOs.Responses;
using SnjofkaloAPI.Models.Entities;
using SnjofkaloAPI.Services.Interfaces;
using SnjofkaloAPI.Extensions;

namespace SnjofkaloAPI.Services.Implementation
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<OrderService> _logger;
        private readonly IDataEncryptionService _encryptionService;

        public OrderService(ApplicationDbContext context, IMapper mapper, ILogger<OrderService> logger, IDataEncryptionService encryptionService)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _encryptionService = encryptionService;
        }

        public async Task<ApiResponse<OrderResponse>> CreateOrderFromCartAsync(int userId, CreateOrderRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var cartItems = await _context.CartItems
                    .Include(ci => ci.Item)
                        .ThenInclude(i => i.Seller)
                    .Include(ci => ci.Item)
                        .ThenInclude(i => i.ItemCategory)
                    .Where(ci => ci.UserID == userId)
                    .ToListDecryptedAsync(_encryptionService);

                if (!cartItems.Any())
                {
                    return ApiResponse<OrderResponse>.ErrorResult("Cart is empty");
                }

                // NEW: Enhanced validation for marketplace items
                foreach (var cartItem in cartItems)
                {
                    if (!cartItem.Item.IsActive)
                    {
                        return ApiResponse<OrderResponse>.ErrorResult($"Item '{cartItem.Item.Title}' is no longer active");
                    }

                    // NEW: Check if item is approved
                    if (!cartItem.Item.IsApproved)
                    {
                        return ApiResponse<OrderResponse>.ErrorResult($"Item '{cartItem.Item.Title}' is pending approval and cannot be ordered");
                    }

                    // NEW: Check item status
                    if (cartItem.Item.ItemStatus != "Active")
                    {
                        return ApiResponse<OrderResponse>.ErrorResult($"Item '{cartItem.Item.Title}' is not available for purchase (Status: {cartItem.Item.ItemStatus})");
                    }

                    if (cartItem.Item.StockQuantity < cartItem.Quantity)
                    {
                        return ApiResponse<OrderResponse>.ErrorResult($"Insufficient stock for '{cartItem.Item.Title}'. Available: {cartItem.Item.StockQuantity}");
                    }

                    // NEW: Prevent users from buying their own items
                    if (cartItem.Item.SellerUserID == userId)
                    {
                        return ApiResponse<OrderResponse>.ErrorResult($"You cannot purchase your own item: '{cartItem.Item.Title}'");
                    }
                }

                var pendingStatus = await _context.Statuses
                    .FirstOrDefaultAsync(s => s.Name == "Pending" && s.IsActive);

                if (pendingStatus == null)
                {
                    return ApiResponse<OrderResponse>.ErrorResult("Order status configuration error");
                }

                var order = new Order
                {
                    UserID = userId,
                    StatusID = pendingStatus.IDStatus,
                    OrderNumber = GenerateOrderNumber(),
                    OrderDate = DateTime.UtcNow,
                    ShippingAddress = request.ShippingAddress,
                    BillingAddress = request.BillingAddress,
                    OrderNotes = request.OrderNotes,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                var orderItems = new List<OrderItem>();
                var sellerNotifications = new List<object>(); // Track seller notifications

                foreach (var cartItem in cartItems)
                {
                    var orderItem = new OrderItem
                    {
                        OrderID = order.IDOrder,
                        ItemID = cartItem.ItemID,
                        Quantity = cartItem.Quantity,
                        PriceAtOrder = cartItem.Item.Price,
                        ItemTitle = cartItem.Item.Title,
                        CreatedAt = DateTime.UtcNow
                    };

                    orderItems.Add(orderItem);

                    // Update stock
                    cartItem.Item.StockQuantity -= cartItem.Quantity;
                    cartItem.Item.UpdatedAt = DateTime.UtcNow;

                    // NEW: Track sold items and seller notifications
                    if (cartItem.Item.SellerUserID.HasValue)
                    {
                        // Mark item as sold if stock reaches zero
                        if (cartItem.Item.StockQuantity == 0)
                        {
                            cartItem.Item.ItemStatus = "Sold";
                        }

                        sellerNotifications.Add(new
                        {
                            SellerId = cartItem.Item.SellerUserID.Value,
                            SellerName = $"{cartItem.Item.Seller!.FirstName} {cartItem.Item.Seller.LastName}",
                            ItemTitle = cartItem.Item.Title,
                            QuantitySold = cartItem.Quantity,
                            Revenue = cartItem.Quantity * cartItem.Item.Price,
                            Commission = cartItem.Quantity * cartItem.Item.Price * (cartItem.Item.CommissionRate ?? 0)
                        });
                    }
                }

                _context.OrderItems.AddRange(orderItems);
                _context.CartItems.RemoveRange(cartItems);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Load the created order with all relationships
                var createdOrder = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.Status)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Item)
                            .ThenInclude(i => i.Seller)
                    .Where(o => o.IDOrder == order.IDOrder)
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                // Decrypt related entities
                foreach (var oi in createdOrder!.OrderItems)
                {
                    _encryptionService.DecryptEntity(oi.Item);
                    if (oi.Item.Seller != null)
                    {
                        _encryptionService.DecryptEntity(oi.Item.Seller);
                    }
                }

                var orderResponse = _mapper.Map<OrderResponse>(createdOrder);

                // NEW: Add marketplace-specific information to response
                orderResponse.MarketplaceInfo = new
                {
                    ContainsUserItems = sellerNotifications.Any(),
                    SellerNotifications = sellerNotifications,
                    TotalCommissionGenerated = sellerNotifications.Sum(s => (decimal)s.GetType().GetProperty("Commission")!.GetValue(s)!),
                    PlatformFeesGenerated = orderItems.Where(oi => cartItems.Any(ci => ci.ItemID == oi.ItemID && ci.Item.SellerUserID != null))
                        .Sum(oi => oi.Quantity * (cartItems.First(ci => ci.ItemID == oi.ItemID).Item.PlatformFee ?? 0))
                };

                _logger.LogInformation("Order {OrderId} created successfully for user {UserId} with {ItemCount} items, {SellerCount} sellers involved",
                    order.IDOrder, userId, orderItems.Count, sellerNotifications.Count);

                return ApiResponse<OrderResponse>.SuccessResult(orderResponse, "Order created successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating order for user {UserId}", userId);
                return ApiResponse<OrderResponse>.ErrorResult("An error occurred while creating order");
            }
        }

        public async Task<ApiResponse<PagedResult<OrderListResponse>>> GetOrdersAsync(int pageNumber, int pageSize)
        {
            try
            {
                var query = _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.Status)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Item)
                    .OrderByDescending(o => o.OrderDate);

                var totalCount = await query.CountAsync();
                var orders = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListDecryptedAsync(_encryptionService);

                // Decrypt order items
                foreach (var order in orders)
                {
                    foreach (var oi in order.OrderItems)
                    {
                        _encryptionService.DecryptEntity(oi.Item);
                    }
                }

                var orderResponses = _mapper.Map<List<OrderListResponse>>(orders);

                var pagedResult = new PagedResult<OrderListResponse>
                {
                    Data = orderResponses,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };

                return ApiResponse<PagedResult<OrderListResponse>>.SuccessResult(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders");
                return ApiResponse<PagedResult<OrderListResponse>>.ErrorResult("An error occurred while retrieving orders");
            }
        }

        public async Task<ApiResponse<PagedResult<OrderListResponse>>> GetUserOrdersAsync(int userId, int pageNumber, int pageSize)
        {
            try
            {
                var query = _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.Status)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Item)
                    .Where(o => o.UserID == userId)
                    .OrderByDescending(o => o.OrderDate);

                var totalCount = await query.CountAsync();
                var orders = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListDecryptedAsync(_encryptionService);

                // Decrypt order items
                foreach (var order in orders)
                {
                    foreach (var oi in order.OrderItems)
                    {
                        _encryptionService.DecryptEntity(oi.Item);
                    }
                }

                var orderResponses = _mapper.Map<List<OrderListResponse>>(orders);

                var pagedResult = new PagedResult<OrderListResponse>
                {
                    Data = orderResponses,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };

                return ApiResponse<PagedResult<OrderListResponse>>.SuccessResult(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for user {UserId}", userId);
                return ApiResponse<PagedResult<OrderListResponse>>.ErrorResult("An error occurred while retrieving user orders");
            }
        }

        public async Task<ApiResponse<OrderResponse>> GetOrderByIdAsync(int orderId)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.Status)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Item)
                            .ThenInclude(i => i.Seller)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Item)
                            .ThenInclude(i => i.ItemCategory)
                    .Where(o => o.IDOrder == orderId)
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                if (order == null)
                {
                    return ApiResponse<OrderResponse>.ErrorResult("Order not found");
                }

                // Decrypt related entities
                foreach (var oi in order.OrderItems)
                {
                    _encryptionService.DecryptEntity(oi.Item);
                    if (oi.Item.Seller != null)
                    {
                        _encryptionService.DecryptEntity(oi.Item.Seller);
                    }
                }

                var orderResponse = _mapper.Map<OrderResponse>(order);
                return ApiResponse<OrderResponse>.SuccessResult(orderResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order by ID {OrderId}", orderId);
                return ApiResponse<OrderResponse>.ErrorResult("An error occurred while retrieving order");
            }
        }

        public async Task<ApiResponse<OrderResponse>> GetUserOrderByIdAsync(int userId, int orderId)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.Status)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Item)
                            .ThenInclude(i => i.Seller)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Item)
                            .ThenInclude(i => i.ItemCategory)
                    .Where(o => o.IDOrder == orderId && o.UserID == userId)
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                if (order == null)
                {
                    return ApiResponse<OrderResponse>.ErrorResult("Order not found");
                }

                // Decrypt related entities
                foreach (var oi in order.OrderItems)
                {
                    _encryptionService.DecryptEntity(oi.Item);
                    if (oi.Item.Seller != null)
                    {
                        _encryptionService.DecryptEntity(oi.Item.Seller);
                    }
                }

                var orderResponse = _mapper.Map<OrderResponse>(order);
                return ApiResponse<OrderResponse>.SuccessResult(orderResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order {OrderId} for user {UserId}", orderId, userId);
                return ApiResponse<OrderResponse>.ErrorResult("An error occurred while retrieving order");
            }
        }

        public async Task<ApiResponse<OrderResponse>> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusRequest request)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.Status)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Item)
                            .ThenInclude(i => i.Seller)
                    .FirstOrDefaultAsync(o => o.IDOrder == orderId);

                if (order == null)
                {
                    return ApiResponse<OrderResponse>.ErrorResult("Order not found");
                }

                var newStatus = await _context.Statuses.FindAsync(request.StatusID);
                if (newStatus == null || !newStatus.IsActive)
                {
                    return ApiResponse<OrderResponse>.ErrorResult("Invalid status");
                }

                var oldStatusName = order.Status.Name;
                order.StatusID = request.StatusID;
                order.UpdatedAt = DateTime.UtcNow;

                // NEW: Handle marketplace-specific status changes
                if (newStatus.Name == "Delivered")
                {
                    // Mark user items as sold if delivered
                    foreach (var orderItem in order.OrderItems.Where(oi => oi.Item.SellerUserID != null))
                    {
                        if (orderItem.Item.ItemStatus != "Sold")
                        {
                            orderItem.Item.ItemStatus = "Sold";
                            orderItem.Item.UpdatedAt = DateTime.UtcNow;
                        }
                    }
                }

                // Entity will be automatically encrypted by the interceptor before saving
                await _context.SaveChangesAsync();

                await _context.Entry(order)
                    .Reference(o => o.Status)
                    .LoadAsync();

                // Decrypt for response
                _encryptionService.DecryptEntity(order);
                foreach (var oi in order.OrderItems)
                {
                    _encryptionService.DecryptEntity(oi.Item);
                    if (oi.Item.Seller != null)
                    {
                        _encryptionService.DecryptEntity(oi.Item.Seller);
                    }
                }

                var orderResponse = _mapper.Map<OrderResponse>(order);
                _logger.LogInformation("Order {OrderId} status updated from {OldStatus} to {NewStatus}",
                    orderId, oldStatusName, newStatus.Name);

                return ApiResponse<OrderResponse>.SuccessResult(orderResponse, "Order status updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order status for order {OrderId}", orderId);
                return ApiResponse<OrderResponse>.ErrorResult("An error occurred while updating order status");
            }
        }

        public async Task<ApiResponse<List<OrderListResponse>>> GetOrdersByStatusAsync(int statusId)
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.Status)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Item)
                    .Where(o => o.StatusID == statusId)
                    .OrderByDescending(o => o.OrderDate)
                    .ToListDecryptedAsync(_encryptionService);

                // Decrypt order items
                foreach (var order in orders)
                {
                    foreach (var oi in order.OrderItems)
                    {
                        _encryptionService.DecryptEntity(oi.Item);
                    }
                }

                var orderResponses = _mapper.Map<List<OrderListResponse>>(orders);
                return ApiResponse<List<OrderListResponse>>.SuccessResult(orderResponses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders by status {StatusId}", statusId);
                return ApiResponse<List<OrderListResponse>>.ErrorResult("An error occurred while retrieving orders by status");
            }
        }

        public async Task<ApiResponse> CancelOrderAsync(int userId, int orderId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Item)
                    .Where(o => o.IDOrder == orderId && o.UserID == userId)
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                if (order == null)
                {
                    return ApiResponse.ErrorResult("Order not found");
                }

                var currentStatus = await _context.Statuses.FindAsync(order.StatusID);
                if (currentStatus?.Name != "Pending" && currentStatus?.Name != "Processing")
                {
                    return ApiResponse.ErrorResult("Order cannot be cancelled at this stage");
                }

                var cancelledStatus = await _context.Statuses
                    .FirstOrDefaultAsync(s => s.Name == "Cancelled" && s.IsActive);

                if (cancelledStatus == null)
                {
                    return ApiResponse.ErrorResult("Order status configuration error");
                }

                // Restore stock for all items
                foreach (var orderItem in order.OrderItems)
                {
                    var item = await _context.Items.FindAsync(orderItem.ItemID);
                    if (item != null)
                    {
                        // Decrypt item if needed for stock update
                        _encryptionService.DecryptEntity(item);
                        item.StockQuantity += orderItem.Quantity;
                        item.UpdatedAt = DateTime.UtcNow;

                        // NEW: Reset item status if it was marked as sold
                        if (item.ItemStatus == "Sold" && item.StockQuantity > 0)
                        {
                            item.ItemStatus = "Active";
                        }
                        // Entity will be automatically encrypted by the interceptor before saving
                    }
                }

                order.StatusID = cancelledStatus.IDStatus;
                order.UpdatedAt = DateTime.UtcNow;

                // Entity will be automatically encrypted by the interceptor before saving
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Order {OrderId} cancelled by user {UserId}", orderId, userId);
                return ApiResponse.SuccessResult("Order cancelled successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error cancelling order {OrderId} for user {UserId}", orderId, userId);
                return ApiResponse.ErrorResult("An error occurred while cancelling order");
            }
        }

        // NEW: Enhanced marketplace methods

        /// <summary>
        /// Get seller's orders (items they sold)
        /// </summary>
        public async Task<ApiResponse<PagedResult<object>>> GetSellerOrdersAsync(int sellerId, int pageNumber, int pageSize)
        {
            try
            {
                var query = _context.OrderItems
                    .Include(oi => oi.Order)
                        .ThenInclude(o => o.User)
                    .Include(oi => oi.Order)
                        .ThenInclude(o => o.Status)
                    .Include(oi => oi.Item)
                    .Where(oi => oi.Item.SellerUserID == sellerId)
                    .OrderByDescending(oi => oi.Order.OrderDate);

                var totalCount = await query.CountAsync();
                var orderItems = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Decrypt entities
                foreach (var oi in orderItems)
                {
                    _encryptionService.DecryptEntity(oi.Order);
                    _encryptionService.DecryptEntity(oi.Order.User);
                    _encryptionService.DecryptEntity(oi.Item);
                }

                var sellerOrders = orderItems.Select(oi => new
                {
                    OrderId = oi.Order.IDOrder,
                    OrderNumber = oi.Order.OrderNumber,
                    OrderDate = oi.Order.OrderDate,
                    CustomerName = $"{oi.Order.User.FirstName} {oi.Order.User.LastName}",
                    ItemTitle = oi.ItemTitle,
                    Quantity = oi.Quantity,
                    PriceAtOrder = oi.PriceAtOrder,
                    LineTotal = oi.Quantity * oi.PriceAtOrder,
                    Commission = oi.Quantity * oi.PriceAtOrder * (oi.Item.CommissionRate ?? 0),
                    NetEarnings = oi.Quantity * oi.PriceAtOrder * (1 - (oi.Item.CommissionRate ?? 0)),
                    OrderStatus = oi.Order.Status.Name
                }).ToList();

                var pagedResult = new PagedResult<object>
                {
                    Data = sellerOrders.Cast<object>().ToList(),
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };

                return ApiResponse<PagedResult<object>>.SuccessResult(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting seller orders for seller {SellerId}", sellerId);
                return ApiResponse<PagedResult<object>>.ErrorResult("An error occurred while retrieving seller orders");
            }
        }

        /// <summary>
        /// Get order analytics for admin dashboard
        /// </summary>
        public async Task<ApiResponse<object>> GetOrderAnalyticsAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                fromDate ??= DateTime.UtcNow.AddMonths(-1);
                toDate ??= DateTime.UtcNow;

                var orders = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Item)
                    .Where(o => o.OrderDate >= fromDate && o.OrderDate <= toDate)
                    .ToListAsync();

                var orderItems = orders.SelectMany(o => o.OrderItems).ToList();
                var userItems = orderItems.Where(oi => oi.Item.SellerUserID != null).ToList();
                var adminItems = orderItems.Where(oi => oi.Item.SellerUserID == null).ToList();

                var analytics = new
                {
                    Period = new { FromDate = fromDate, ToDate = toDate },

                    Overview = new
                    {
                        TotalOrders = orders.Count,
                        TotalRevenue = orderItems.Sum(oi => oi.Quantity * oi.PriceAtOrder),
                        TotalItemsSold = orderItems.Sum(oi => oi.Quantity),
                        AverageOrderValue = orders.Any() ? orderItems.Sum(oi => oi.Quantity * oi.PriceAtOrder) / orders.Count : 0
                    },

                    MarketplaceSplit = new
                    {
                        StoreRevenue = adminItems.Sum(oi => oi.Quantity * oi.PriceAtOrder),
                        UserItemRevenue = userItems.Sum(oi => oi.Quantity * oi.PriceAtOrder),
                        CommissionEarned = userItems.Sum(oi => oi.Quantity * oi.PriceAtOrder * (oi.Item.CommissionRate ?? 0)),
                        PlatformFeesEarned = userItems.Sum(oi => oi.Quantity * (oi.Item.PlatformFee ?? 0))
                    },

                    StatusBreakdown = orders
                        .GroupBy(o => o.Status.Name)
                        .Select(g => new
                        {
                            Status = g.Key,
                            Count = g.Count(),
                            Revenue = g.SelectMany(o => o.OrderItems).Sum(oi => oi.Quantity * oi.PriceAtOrder)
                        })
                        .ToList(),

                    DailyTrends = orders
                        .GroupBy(o => o.OrderDate.Date)
                        .Select(g => new
                        {
                            Date = g.Key,
                            OrderCount = g.Count(),
                            Revenue = g.SelectMany(o => o.OrderItems).Sum(oi => oi.Quantity * oi.PriceAtOrder),
                            ItemsSold = g.SelectMany(o => o.OrderItems).Sum(oi => oi.Quantity)
                        })
                        .OrderBy(d => d.Date)
                        .ToList()
                };

                return ApiResponse<object>.SuccessResult(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order analytics from {FromDate} to {ToDate}", fromDate, toDate);
                return ApiResponse<object>.ErrorResult("An error occurred while retrieving order analytics");
            }
        }

        /// <summary>
        /// Get commission report for a specific seller
        /// </summary>
        public async Task<ApiResponse<object>> GetSellerCommissionReportAsync(int sellerId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                fromDate ??= DateTime.UtcNow.AddMonths(-1);
                toDate ??= DateTime.UtcNow;

                var sellerOrderItems = await _context.OrderItems
                    .Include(oi => oi.Order)
                    .Include(oi => oi.Item)
                    .Where(oi => oi.Item.SellerUserID == sellerId &&
                                oi.Order.OrderDate >= fromDate &&
                                oi.Order.OrderDate <= toDate)
                    .ToListAsync();

                var report = new
                {
                    SellerId = sellerId,
                    Period = new { FromDate = fromDate, ToDate = toDate },

                    Summary = new
                    {
                        TotalSales = sellerOrderItems.Sum(oi => oi.Quantity * oi.PriceAtOrder),
                        TotalCommission = sellerOrderItems.Sum(oi => oi.Quantity * oi.PriceAtOrder * (oi.Item.CommissionRate ?? 0)),
                        TotalPlatformFees = sellerOrderItems.Sum(oi => oi.Quantity * (oi.Item.PlatformFee ?? 0)),
                        NetEarnings = sellerOrderItems.Sum(oi => oi.Quantity * oi.PriceAtOrder * (1 - (oi.Item.CommissionRate ?? 0)) - (oi.Item.PlatformFee ?? 0)),
                        TotalOrders = sellerOrderItems.Select(oi => oi.OrderID).Distinct().Count(),
                        ItemsSold = sellerOrderItems.Sum(oi => oi.Quantity)
                    },

                    ItemBreakdown = sellerOrderItems
                        .GroupBy(oi => new { oi.ItemID, oi.ItemTitle })
                        .Select(g => new
                        {
                            ItemId = g.Key.ItemID,
                            ItemTitle = g.Key.ItemTitle,
                            UnitsSold = g.Sum(oi => oi.Quantity),
                            Revenue = g.Sum(oi => oi.Quantity * oi.PriceAtOrder),
                            Commission = g.Sum(oi => oi.Quantity * oi.PriceAtOrder * (oi.Item.CommissionRate ?? 0)),
                            NetEarnings = g.Sum(oi => oi.Quantity * oi.PriceAtOrder * (1 - (oi.Item.CommissionRate ?? 0)))
                        })
                        .OrderByDescending(i => i.Revenue)
                        .ToList()
                };

                return ApiResponse<object>.SuccessResult(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting commission report for seller {SellerId}", sellerId);
                return ApiResponse<object>.ErrorResult("An error occurred while generating commission report");
            }
        }

        private string GenerateOrderNumber()
        {
            return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }
    }
}