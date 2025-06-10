using Microsoft.EntityFrameworkCore;
using AutoMapper;
using SnjofkaloAPI.Data;
using SnjofkaloAPI.Models.DTOs.Common;
using SnjofkaloAPI.Models.DTOs.Requests;
using SnjofkaloAPI.Models.DTOs.Responses;
using SnjofkaloAPI.Services.Interfaces;
using SnjofkaloAPI.Extensions;

namespace SnjofkaloAPI.Services.Implementation
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<UserService> _logger;
        private readonly IDataEncryptionService _encryptionService;

        public UserService(ApplicationDbContext context, IMapper mapper, ILogger<UserService> logger, IDataEncryptionService encryptionService)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _encryptionService = encryptionService;
        }

        public async Task<ApiResponse<UserResponse>> GetUserByIdAsync(int userId)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.IDUser == userId)
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                if (user == null)
                {
                    return ApiResponse<UserResponse>.ErrorResult("User not found");
                }

                var userResponse = _mapper.Map<UserResponse>(user);
                return ApiResponse<UserResponse>.SuccessResult(userResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by ID {UserId}", userId);
                return ApiResponse<UserResponse>.ErrorResult("An error occurred while retrieving user");
            }
        }

        public async Task<ApiResponse<PagedResult<UserListResponse>>> GetUsersAsync(int pageNumber, int pageSize)
        {
            try
            {
                var query = _context.Users.OrderBy(u => u.Username);

                var totalCount = await query.CountAsync();
                var users = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListDecryptedAsync(_encryptionService);

                var userResponses = _mapper.Map<List<UserListResponse>>(users);

                var pagedResult = new PagedResult<UserListResponse>
                {
                    Data = userResponses,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };

                return ApiResponse<PagedResult<UserListResponse>>.SuccessResult(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users list");
                return ApiResponse<PagedResult<UserListResponse>>.ErrorResult("An error occurred while retrieving users");
            }
        }

        public async Task<ApiResponse<UserResponse>> UpdateUserAsync(int userId, UpdateUserRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return ApiResponse<UserResponse>.ErrorResult("User not found");
                }

                // Decrypt user data for comparison
                _encryptionService.DecryptEntity(user);

                // Check for duplicates by decrypting and comparing
                var allUsers = await _context.Users
                    .Where(u => u.IDUser != userId)
                    .ToListDecryptedAsync(_encryptionService);

                var existingUser = allUsers.FirstOrDefault(u =>
                    u.Email == request.Email || u.Username == request.Username);

                if (existingUser != null)
                {
                    var field = existingUser.Email == request.Email ? "Email" : "Username";
                    return ApiResponse<UserResponse>.ErrorResult($"{field} is already taken by another user");
                }

                // Update user properties
                _mapper.Map(request, user);
                user.UpdatedAt = DateTime.UtcNow;

                // Entity will be automatically encrypted by the interceptor before saving
                await _context.SaveChangesAsync();

                // Decrypt for response
                _encryptionService.DecryptEntity(user);
                var userResponse = _mapper.Map<UserResponse>(user);
                _logger.LogInformation("User {UserId} updated successfully", userId);

                return ApiResponse<UserResponse>.SuccessResult(userResponse, "User updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", userId);
                return ApiResponse<UserResponse>.ErrorResult("An error occurred while updating user");
            }
        }

        public async Task<ApiResponse<UserResponse>> UpdateUserByAdminAsync(int userId, UpdateUserAdminRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return ApiResponse<UserResponse>.ErrorResult("User not found");
                }

                // Decrypt user data for comparison
                _encryptionService.DecryptEntity(user);

                // Check for duplicates by decrypting and comparing
                var allUsers = await _context.Users
                    .Where(u => u.IDUser != userId)
                    .ToListDecryptedAsync(_encryptionService);

                var existingUser = allUsers.FirstOrDefault(u =>
                    u.Email == request.Email || u.Username == request.Username);

                if (existingUser != null)
                {
                    var field = existingUser.Email == request.Email ? "Email" : "Username";
                    return ApiResponse<UserResponse>.ErrorResult($"{field} is already taken by another user");
                }

                // Update user properties (including admin fields)
                _mapper.Map(request, user);
                user.UpdatedAt = DateTime.UtcNow;

                // Entity will be automatically encrypted by the interceptor before saving
                await _context.SaveChangesAsync();

                // Decrypt for response
                _encryptionService.DecryptEntity(user);
                var userResponse = _mapper.Map<UserResponse>(user);
                _logger.LogInformation("User {UserId} updated by admin", userId);

                return ApiResponse<UserResponse>.SuccessResult(userResponse, "User updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId} by admin", userId);
                return ApiResponse<UserResponse>.ErrorResult("An error occurred while updating user");
            }
        }

        public async Task<ApiResponse> DeleteUserAsync(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return ApiResponse.ErrorResult("User not found");
                }

                // GDPR Compliance: Complete data removal
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} deleted (GDPR compliance)", userId);
                return ApiResponse.SuccessResult("User deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", userId);
                return ApiResponse.ErrorResult("An error occurred while deleting user");
            }
        }

        public async Task<ApiResponse<List<UserListResponse>>> GetAdminUsersAsync()
        {
            try
            {
                var adminUsers = await _context.Users
                    .Where(u => u.IsAdmin)
                    .OrderBy(u => u.Username)
                    .ToListDecryptedAsync(_encryptionService);

                var adminResponses = _mapper.Map<List<UserListResponse>>(adminUsers);
                return ApiResponse<List<UserListResponse>>.SuccessResult(adminResponses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting admin users");
                return ApiResponse<List<UserListResponse>>.ErrorResult("An error occurred while retrieving admin users");
            }
        }

        // GDPR Compliance Methods

        /// <summary>
        /// Export user data for GDPR data portability requests
        /// </summary>
        public async Task<ApiResponse<object>> ExportUserDataAsync(int userId)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Orders)
                        .ThenInclude(o => o.OrderItems)
                    .Include(u => u.CartItems)
                        .ThenInclude(ci => ci.Item)
                    .Include(u => u.SellerItems) // NEW: Include user's listed items
                        .ThenInclude(i => i.ItemCategory)
                    .Where(u => u.IDUser == userId)
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                if (user == null)
                {
                    return ApiResponse<object>.ErrorResult("User not found");
                }

                // Decrypt all related data
                foreach (var order in user.Orders)
                {
                    _encryptionService.DecryptEntity(order);
                }

                var exportData = new
                {
                    PersonalInformation = new
                    {
                        user.Username,
                        user.FirstName,
                        user.LastName,
                        user.Email,
                        user.PhoneNumber,
                        user.CreatedAt,
                        user.LastLoginAt,
                        user.IsAdmin
                    },
                    // NEW: GDPR Information
                    GdprStatus = new
                    {
                        user.RequestedAnonymization,
                        user.AnonymizationRequestDate,
                        user.AnonymizationReason
                    },
                    Orders = user.Orders.Select(o => new
                    {
                        o.OrderNumber,
                        o.OrderDate,
                        o.ShippingAddress,
                        o.BillingAddress,
                        o.OrderNotes,
                        Items = o.OrderItems.Select(oi => new
                        {
                            oi.ItemTitle,
                            oi.Quantity,
                            oi.PriceAtOrder
                        })
                    }),
                    CartItems = user.CartItems.Select(ci => new
                    {
                        ItemTitle = ci.Item.Title,
                        ci.Quantity,
                        ci.AddedAt
                    }),
                    // NEW: Marketplace data (items user is selling)
                    SellerItems = user.SellerItems.Select(i => new
                    {
                        i.Title,
                        i.Description,
                        i.Price,
                        i.StockQuantity,
                        CategoryName = i.ItemCategory.CategoryName,
                        i.ItemStatus,
                        i.IsApproved,
                        i.CreatedAt,
                        CommissionRate = i.CommissionRate,
                        PlatformFee = i.PlatformFee
                    }),
                    ExportDate = DateTime.UtcNow,
                    ExportNote = "This data export was generated in compliance with GDPR Article 20 (Right to data portability)"
                };

                _logger.LogInformation("User {UserId} data exported for GDPR compliance", userId);
                return ApiResponse<object>.SuccessResult(exportData, "User data exported successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting user data for user {UserId}", userId);
                return ApiResponse<object>.ErrorResult("An error occurred while exporting user data");
            }
        }

        /// <summary>
        /// Anonymize user data for GDPR right to be forgotten (partial anonymization)
        /// </summary>
        public async Task<ApiResponse> AnonymizeUserDataAsync(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return ApiResponse.ErrorResult("User not found");
                }

                // Decrypt current data
                _encryptionService.DecryptEntity(user);

                // Anonymize personal data
                user.FirstName = "Anonymized";
                user.LastName = "User";
                user.Email = $"anonymized-{userId}@deleted.local";
                user.PhoneNumber = null;
                user.Username = $"anonymized-user-{userId}";
                user.UpdatedAt = DateTime.UtcNow;

                // Mark anonymization as completed
                user.RequestedAnonymization = false;
                user.AnonymizationRequestDate = null;
                user.AnonymizationReason = null;
                user.AnonymizationNotes = "Completed anonymization";

                // Also anonymize order addresses
                var orders = await _context.Orders
                    .Where(o => o.UserID == userId)
                    .ToListDecryptedAsync(_encryptionService);

                foreach (var order in orders)
                {
                    order.ShippingAddress = "Address Anonymized";
                    order.BillingAddress = "Address Anonymized";
                    order.OrderNotes = "Notes Anonymized";
                    order.UpdatedAt = DateTime.UtcNow;
                    _context.Orders.Update(order);
                }

                // NEW: Handle seller items - either anonymize or transfer ownership
                var sellerItems = await _context.Items
                    .Where(i => i.SellerUserID == userId)
                    .ToListAsync();

                foreach (var item in sellerItems)
                {
                    // Option 1: Transfer to admin (recommended for active listings)
                    if (item.ItemStatus == "Active" && item.IsApproved)
                    {
                        item.SellerUserID = null; // Convert to admin item
                    }
                    else
                    {
                        // Option 2: Deactivate pending/rejected items
                        item.IsActive = false;
                        item.ItemStatus = "Removed";
                    }
                    item.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} data anonymized for GDPR compliance", userId);
                return ApiResponse.SuccessResult("User data anonymized successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error anonymizing user data for user {UserId}", userId);
                return ApiResponse.ErrorResult("An error occurred while anonymizing user data");
            }
        }

        // NEW: GDPR-specific methods

        /// <summary>
        /// Request anonymization (user-initiated GDPR request)
        /// </summary>
        public async Task<ApiResponse> RequestAnonymizationAsync(int userId, string reason)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return ApiResponse.ErrorResult("User not found");
                }

                // Decrypt for updating
                _encryptionService.DecryptEntity(user);

                if (user.RequestedAnonymization)
                {
                    return ApiResponse.ErrorResult("Anonymization already requested");
                }

                user.RequestedAnonymization = true;
                user.AnonymizationRequestDate = DateTime.UtcNow;
                user.AnonymizationReason = reason;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} requested anonymization: {Reason}", userId, reason);
                return ApiResponse.SuccessResult("Anonymization request submitted. Will be processed within 30 days as required by GDPR.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing anonymization request for user {UserId}", userId);
                return ApiResponse.ErrorResult("An error occurred while processing anonymization request");
            }
        }

        /// <summary>
        /// Get pending anonymization requests (admin only)
        /// </summary>
        public async Task<ApiResponse<PagedResult<AnonymizationRequestResponse>>> GetAnonymizationRequestsAsync(int pageNumber, int pageSize)
        {
            try
            {
                var query = _context.Users
                    .Where(u => u.RequestedAnonymization && u.AnonymizationRequestDate != null)
                    .OrderBy(u => u.AnonymizationRequestDate);

                var totalCount = await query.CountAsync();
                var users = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListDecryptedAsync(_encryptionService);

                var requests = users.Select(u => new AnonymizationRequestResponse
                {
                    UserId = u.IDUser,
                    Username = u.Username,
                    Email = u.Email,
                    RequestDate = u.AnonymizationRequestDate!.Value,
                    Reason = u.AnonymizationReason ?? "",
                    DaysRemaining = Math.Max(0, 30 - (DateTime.UtcNow - u.AnonymizationRequestDate.Value).Days)
                }).ToList();

                var pagedResult = new PagedResult<AnonymizationRequestResponse>
                {
                    Data = requests,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };

                return ApiResponse<PagedResult<AnonymizationRequestResponse>>.SuccessResult(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting anonymization requests");
                return ApiResponse<PagedResult<AnonymizationRequestResponse>>.ErrorResult("An error occurred while retrieving anonymization requests");
            }
        }

        /// <summary>
        /// Get seller statistics for a user
        /// </summary>
        public async Task<ApiResponse<object>> GetSellerStatisticsAsync(int userId)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.SellerItems)
                        .ThenInclude(i => i.OrderItems)
                    .Where(u => u.IDUser == userId)
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                if (user == null)
                {
                    return ApiResponse<object>.ErrorResult("User not found");
                }

                var stats = new
                {
                    TotalItemsListed = user.SellerItems.Count,
                    ActiveItems = user.SellerItems.Count(i => i.ItemStatus == "Active" && i.IsActive),
                    PendingItems = user.SellerItems.Count(i => i.ItemStatus == "Pending"),
                    SoldItems = user.SellerItems.Count(i => i.ItemStatus == "Sold"),
                    TotalRevenue = user.SellerItems
                        .SelectMany(i => i.OrderItems)
                        .Sum(oi => oi.Quantity * oi.PriceAtOrder),
                    TotalCommission = user.SellerItems
                        .SelectMany(i => i.OrderItems)
                        .Sum(oi => oi.Quantity * oi.PriceAtOrder * (oi.Item.CommissionRate ?? 0)),
                    IsSeller = user.SellerItems.Any(),
                    NetEarnings = user.SellerItems
                        .SelectMany(i => i.OrderItems)
                        .Sum(oi => oi.Quantity * oi.PriceAtOrder * (1 - (oi.Item.CommissionRate ?? 0)))
                };

                return ApiResponse<object>.SuccessResult(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting seller statistics for user {UserId}", userId);
                return ApiResponse<object>.ErrorResult("An error occurred while retrieving seller statistics");
            }
        }

        /// <summary>
        /// Get user profile with enhanced marketplace and GDPR information
        /// </summary>
        public async Task<ApiResponse<UserResponse>> GetUserProfileWithStatsAsync(int userId)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.SellerItems)
                        .ThenInclude(i => i.OrderItems)
                    .Where(u => u.IDUser == userId)
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                if (user == null)
                {
                    return ApiResponse<UserResponse>.ErrorResult("User not found");
                }

                var userResponse = _mapper.Map<UserResponse>(user);

                // Add marketplace statistics
                userResponse.IsSeller = user.SellerItems.Any();
                userResponse.TotalItemsListed = user.SellerItems.Count;
                userResponse.ActiveItemsCount = user.SellerItems.Count(i => i.ItemStatus == "Active" && i.IsActive);
                userResponse.TotalRevenue = user.SellerItems
                    .SelectMany(i => i.OrderItems)
                    .Sum(oi => oi.Quantity * oi.PriceAtOrder);

                return ApiResponse<UserResponse>.SuccessResult(userResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user profile with stats for user {UserId}", userId);
                return ApiResponse<UserResponse>.ErrorResult("An error occurred while retrieving user profile");
            }
        }

        /// <summary>
        /// Process GDPR data retention cleanup (background service method)
        /// </summary>
        public async Task<ApiResponse<object>> ProcessDataRetentionCleanupAsync()
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddYears(-7); // 7-year retention policy

                // Find users with no activity for 7+ years
                var inactiveUsers = await _context.Users
                    .Where(u => u.LastLoginAt < cutoffDate || (u.LastLoginAt == null && u.CreatedAt < cutoffDate))
                    .Where(u => !u.IsAdmin) // Never auto-delete admin accounts
                    .Where(u => !u.RequestedAnonymization) // Don't interfere with pending GDPR requests
                    .ToListDecryptedAsync(_encryptionService);

                var processedCount = 0;
                var anonymizedCount = 0;

                foreach (var user in inactiveUsers)
                {
                    // Check if user has any recent orders or seller activity
                    var hasRecentActivity = await _context.Orders
                        .AnyAsync(o => o.UserID == user.IDUser && o.OrderDate > cutoffDate);

                    var hasActiveSellerItems = await _context.Items
                        .AnyAsync(i => i.SellerUserID == user.IDUser && i.IsActive);

                    if (!hasRecentActivity && !hasActiveSellerItems)
                    {
                        // Anonymize the user
                        await AnonymizeUserDataAsync(user.IDUser);
                        anonymizedCount++;
                    }

                    processedCount++;
                }

                var result = new
                {
                    ProcessedUsers = processedCount,
                    AnonymizedUsers = anonymizedCount,
                    RetentionCutoffDate = cutoffDate,
                    ProcessedAt = DateTime.UtcNow
                };

                _logger.LogInformation("Data retention cleanup completed: {ProcessedCount} users processed, {AnonymizedCount} anonymized",
                    processedCount, anonymizedCount);

                return ApiResponse<object>.SuccessResult(result, "Data retention cleanup completed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during data retention cleanup");
                return ApiResponse<object>.ErrorResult("An error occurred during data retention cleanup");
            }
        }
    }
}