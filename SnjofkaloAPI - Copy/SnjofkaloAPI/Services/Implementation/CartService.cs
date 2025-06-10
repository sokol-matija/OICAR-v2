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
    public class CartService : ICartService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<CartService> _logger;
        private readonly IDataEncryptionService _encryptionService;

        public CartService(ApplicationDbContext context, IMapper mapper, ILogger<CartService> logger, IDataEncryptionService encryptionService)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _encryptionService = encryptionService;
        }

        public async Task<ApiResponse<CartResponse>> GetCartAsync(int userId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Include(ci => ci.Item)
                        .ThenInclude(i => i.Seller) // NEW: Include seller information
                    .Include(ci => ci.Item)
                        .ThenInclude(i => i.ItemCategory)
                    .Where(ci => ci.UserID == userId)
                    .OrderBy(ci => ci.AddedAt)
                    .ToListDecryptedAsync(_encryptionService);

                // Filter out items that are no longer available or approved
                var validCartItems = cartItems.Where(ci =>
                    ci.Item.IsActive &&
                    ci.Item.IsApproved && // NEW: Only show approved items
                    ci.Item.ItemStatus == "Active" // NEW: Only active items
                ).ToList();

                // Remove invalid items from cart automatically
                var invalidItems = cartItems.Except(validCartItems).ToList();
                if (invalidItems.Any())
                {
                    _context.CartItems.RemoveRange(invalidItems);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Removed {Count} invalid items from cart for user {UserId}",
                        invalidItems.Count, userId);
                }

                var cartItemResponses = _mapper.Map<List<CartItemResponse>>(validCartItems);

                var cartResponse = new CartResponse
                {
                    Items = cartItemResponses
                };

                return ApiResponse<CartResponse>.SuccessResult(cartResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart for user {UserId}", userId);
                return ApiResponse<CartResponse>.ErrorResult("An error occurred while retrieving cart");
            }
        }

        public async Task<ApiResponse<CartItemResponse>> AddToCartAsync(int userId, AddToCartRequest request)
        {
            try
            {
                // NEW: Enhanced item validation for marketplace
                var item = await _context.Items
                    .Include(i => i.Seller)
                    .Include(i => i.ItemCategory)
                    .Where(i => i.IDItem == request.ItemID &&
                               i.IsActive &&
                               i.IsApproved && // NEW: Must be approved
                               i.ItemStatus == "Active") // NEW: Must be active status
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                if (item == null)
                {
                    return ApiResponse<CartItemResponse>.ErrorResult("Item not found or not available for purchase");
                }

                // NEW: Check if user is trying to add their own item to cart
                if (item.SellerUserID == userId)
                {
                    return ApiResponse<CartItemResponse>.ErrorResult("You cannot add your own items to cart");
                }

                if (item.StockQuantity < request.Quantity)
                {
                    return ApiResponse<CartItemResponse>.ErrorResult($"Insufficient stock. Available: {item.StockQuantity}");
                }

                var existingCartItem = await _context.CartItems
                    .Include(ci => ci.Item)
                        .ThenInclude(i => i.Seller)
                    .Include(ci => ci.Item)
                        .ThenInclude(i => i.ItemCategory)
                    .FirstOrDefaultAsync(ci => ci.UserID == userId && ci.ItemID == request.ItemID);

                if (existingCartItem != null)
                {
                    var newQuantity = existingCartItem.Quantity + request.Quantity;

                    if (item.StockQuantity < newQuantity)
                    {
                        return ApiResponse<CartItemResponse>.ErrorResult(
                            $"Insufficient stock. Available: {item.StockQuantity}, Current in cart: {existingCartItem.Quantity}");
                    }

                    existingCartItem.Quantity = newQuantity;
                    await _context.SaveChangesAsync();

                    // Decrypt for response
                    _encryptionService.DecryptEntity(existingCartItem.Item);
                    if (existingCartItem.Item.Seller != null)
                    {
                        _encryptionService.DecryptEntity(existingCartItem.Item.Seller);
                    }

                    var updatedResponse = _mapper.Map<CartItemResponse>(existingCartItem);
                    return ApiResponse<CartItemResponse>.SuccessResult(updatedResponse, "Cart item quantity updated");
                }
                else
                {
                    var cartItem = new CartItem
                    {
                        UserID = userId,
                        ItemID = request.ItemID,
                        Quantity = request.Quantity,
                        AddedAt = DateTime.UtcNow
                    };

                    _context.CartItems.Add(cartItem);
                    await _context.SaveChangesAsync();

                    // Load relationships for response
                    await _context.Entry(cartItem)
                        .Reference(ci => ci.Item)
                        .LoadAsync();

                    if (cartItem.Item.SellerUserID.HasValue)
                    {
                        await _context.Entry(cartItem.Item)
                            .Reference(i => i.Seller)
                            .LoadAsync();
                    }

                    await _context.Entry(cartItem.Item)
                        .Reference(i => i.ItemCategory)
                        .LoadAsync();

                    // Decrypt for response
                    _encryptionService.DecryptEntity(cartItem.Item);
                    if (cartItem.Item.Seller != null)
                    {
                        _encryptionService.DecryptEntity(cartItem.Item.Seller);
                    }

                    var cartItemResponse = _mapper.Map<CartItemResponse>(cartItem);
                    _logger.LogInformation("Item {ItemId} added to cart for user {UserId}", request.ItemID, userId);

                    return ApiResponse<CartItemResponse>.SuccessResult(cartItemResponse, "Item added to cart successfully");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding item to cart for user {UserId}", userId);
                return ApiResponse<CartItemResponse>.ErrorResult("An error occurred while adding item to cart");
            }
        }

        public async Task<ApiResponse<CartItemResponse>> UpdateCartItemAsync(int userId, int itemId, UpdateCartItemRequest request)
        {
            try
            {
                var cartItem = await _context.CartItems
                    .Include(ci => ci.Item)
                        .ThenInclude(i => i.Seller)
                    .Include(ci => ci.Item)
                        .ThenInclude(i => i.ItemCategory)
                    .FirstOrDefaultAsync(ci => ci.UserID == userId && ci.ItemID == itemId);

                if (cartItem == null)
                {
                    return ApiResponse<CartItemResponse>.ErrorResult("Cart item not found");
                }

                // NEW: Validate item is still available
                if (!cartItem.Item.IsActive || !cartItem.Item.IsApproved || cartItem.Item.ItemStatus != "Active")
                {
                    // Remove invalid item from cart
                    _context.CartItems.Remove(cartItem);
                    await _context.SaveChangesAsync();
                    return ApiResponse<CartItemResponse>.ErrorResult("Item is no longer available and has been removed from your cart");
                }

                // Check stock availability
                if (cartItem.Item.StockQuantity < request.Quantity)
                {
                    return ApiResponse<CartItemResponse>.ErrorResult($"Insufficient stock. Available: {cartItem.Item.StockQuantity}");
                }

                cartItem.Quantity = request.Quantity;
                await _context.SaveChangesAsync();

                // Decrypt for response
                _encryptionService.DecryptEntity(cartItem.Item);
                if (cartItem.Item.Seller != null)
                {
                    _encryptionService.DecryptEntity(cartItem.Item.Seller);
                }

                var cartItemResponse = _mapper.Map<CartItemResponse>(cartItem);
                _logger.LogInformation("Cart item updated for user {UserId}, item {ItemId}", userId, itemId);

                return ApiResponse<CartItemResponse>.SuccessResult(cartItemResponse, "Cart item updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cart item for user {UserId}", userId);
                return ApiResponse<CartItemResponse>.ErrorResult("An error occurred while updating cart item");
            }
        }

        public async Task<ApiResponse> RemoveFromCartAsync(int userId, int itemId)
        {
            try
            {
                var cartItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.UserID == userId && ci.ItemID == itemId);

                if (cartItem == null)
                {
                    return ApiResponse.ErrorResult("Cart item not found");
                }

                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Item {ItemId} removed from cart for user {UserId}", itemId, userId);
                return ApiResponse.SuccessResult("Item removed from cart successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing item from cart for user {UserId}", userId);
                return ApiResponse.ErrorResult("An error occurred while removing item from cart");
            }
        }

        public async Task<ApiResponse> ClearCartAsync(int userId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Where(ci => ci.UserID == userId)
                    .ToListAsync();

                if (cartItems.Any())
                {
                    _context.CartItems.RemoveRange(cartItems);
                    await _context.SaveChangesAsync();
                }

                _logger.LogInformation("Cart cleared for user {UserId}", userId);
                return ApiResponse.SuccessResult("Cart cleared successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cart for user {UserId}", userId);
                return ApiResponse.ErrorResult("An error occurred while clearing cart");
            }
        }

        public async Task<ApiResponse<int>> GetCartItemCountAsync(int userId)
        {
            try
            {
                // NEW: Only count items that are still valid
                var totalItems = await _context.CartItems
                    .Include(ci => ci.Item)
                    .Where(ci => ci.UserID == userId &&
                                ci.Item.IsActive &&
                                ci.Item.IsApproved &&
                                ci.Item.ItemStatus == "Active")
                    .SumAsync(ci => ci.Quantity);

                return ApiResponse<int>.SuccessResult(totalItems);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart item count for user {UserId}", userId);
                return ApiResponse<int>.ErrorResult("An error occurred while getting cart item count");
            }
        }

        public async Task<ApiResponse<decimal>> GetCartTotalAsync(int userId)
        {
            try
            {
                // NEW: Only calculate total for valid items
                var cartTotal = await _context.CartItems
                    .Include(ci => ci.Item)
                    .Where(ci => ci.UserID == userId &&
                                ci.Item.IsActive &&
                                ci.Item.IsApproved &&
                                ci.Item.ItemStatus == "Active")
                    .SumAsync(ci => ci.Quantity * ci.Item.Price);

                return ApiResponse<decimal>.SuccessResult(cartTotal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart total for user {UserId}", userId);
                return ApiResponse<decimal>.ErrorResult("An error occurred while getting cart total");
            }
        }

        // NEW: Enhanced marketplace methods

        /// <summary>
        /// Get cart summary with detailed breakdown including seller information
        /// </summary>
        public async Task<ApiResponse<object>> GetCartSummaryAsync(int userId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Include(ci => ci.Item)
                        .ThenInclude(i => i.Seller)
                    .Include(ci => ci.Item)
                        .ThenInclude(i => i.ItemCategory)
                    .Where(ci => ci.UserID == userId &&
                                ci.Item.IsActive &&
                                ci.Item.IsApproved &&
                                ci.Item.ItemStatus == "Active")
                    .ToListDecryptedAsync(_encryptionService);

                var adminItems = cartItems.Where(ci => ci.Item.SellerUserID == null).ToList();
                var userItems = cartItems.Where(ci => ci.Item.SellerUserID != null).ToList();

                var summary = new
                {
                    TotalItems = cartItems.Sum(ci => ci.Quantity),
                    TotalAmount = cartItems.Sum(ci => ci.Quantity * ci.Item.Price),

                    // Breakdown by source
                    StoreItems = new
                    {
                        Count = adminItems.Sum(ci => ci.Quantity),
                        Amount = adminItems.Sum(ci => ci.Quantity * ci.Item.Price)
                    },

                    UserItems = new
                    {
                        Count = userItems.Sum(ci => ci.Quantity),
                        Amount = userItems.Sum(ci => ci.Quantity * ci.Item.Price),
                        EstimatedCommission = userItems.Sum(ci => ci.Quantity * ci.Item.Price * (ci.Item.CommissionRate ?? 0)),
                        EstimatedPlatformFees = userItems.Sum(ci => ci.Quantity * (ci.Item.PlatformFee ?? 0))
                    },

                    // Seller breakdown
                    SellerBreakdown = userItems
                        .GroupBy(ci => new { ci.Item.SellerUserID, SellerName = $"{ci.Item.Seller!.FirstName} {ci.Item.Seller.LastName}" })
                        .Select(g => new
                        {
                            SellerId = g.Key.SellerUserID,
                            SellerName = g.Key.SellerName,
                            ItemCount = g.Sum(ci => ci.Quantity),
                            Amount = g.Sum(ci => ci.Quantity * ci.Item.Price)
                        })
                        .ToList(),

                    // Category breakdown
                    CategoryBreakdown = cartItems
                        .GroupBy(ci => ci.Item.ItemCategory.CategoryName)
                        .Select(g => new
                        {
                            CategoryName = g.Key,
                            ItemCount = g.Sum(ci => ci.Quantity),
                            Amount = g.Sum(ci => ci.Quantity * ci.Item.Price)
                        })
                        .OrderByDescending(c => c.Amount)
                        .ToList()
                };

                return ApiResponse<object>.SuccessResult(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart summary for user {UserId}", userId);
                return ApiResponse<object>.ErrorResult("An error occurred while getting cart summary");
            }
        }

        /// <summary>
        /// Validate entire cart before checkout
        /// </summary>
        public async Task<ApiResponse<object>> ValidateCartAsync(int userId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Include(ci => ci.Item)
                        .ThenInclude(i => i.Seller)
                    .Where(ci => ci.UserID == userId)
                    .ToListDecryptedAsync(_encryptionService);

                var validationIssues = new List<object>();
                var validItems = new List<CartItem>();

                foreach (var cartItem in cartItems)
                {
                    var issues = new List<string>();

                    // Check if item is still active
                    if (!cartItem.Item.IsActive)
                    {
                        issues.Add("Item is no longer active");
                    }

                    // Check if item is approved
                    if (!cartItem.Item.IsApproved)
                    {
                        issues.Add("Item is pending approval");
                    }

                    // Check item status
                    if (cartItem.Item.ItemStatus != "Active")
                    {
                        issues.Add($"Item status is {cartItem.Item.ItemStatus}");
                    }

                    // Check stock
                    if (cartItem.Item.StockQuantity < cartItem.Quantity)
                    {
                        issues.Add($"Insufficient stock (Available: {cartItem.Item.StockQuantity}, In cart: {cartItem.Quantity})");
                    }

                    if (issues.Any())
                    {
                        validationIssues.Add(new
                        {
                            ItemId = cartItem.ItemID,
                            ItemTitle = cartItem.Item.Title,
                            Issues = issues
                        });
                    }
                    else
                    {
                        validItems.Add(cartItem);
                    }
                }

                var validation = new
                {
                    IsValid = !validationIssues.Any(),
                    TotalItems = cartItems.Count,
                    ValidItems = validItems.Count,
                    InvalidItems = validationIssues.Count,
                    Issues = validationIssues,

                    ValidCartSummary = validItems.Any() ? new
                    {
                        TotalAmount = validItems.Sum(ci => ci.Quantity * ci.Item.Price),
                        TotalQuantity = validItems.Sum(ci => ci.Quantity)
                    } : null
                };

                return ApiResponse<object>.SuccessResult(validation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating cart for user {UserId}", userId);
                return ApiResponse<object>.ErrorResult("An error occurred while validating cart");
            }
        }

        /// <summary>
        /// Remove invalid items from cart automatically
        /// </summary>
        public async Task<ApiResponse<object>> CleanupCartAsync(int userId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Include(ci => ci.Item)
                    .Where(ci => ci.UserID == userId)
                    .ToListAsync();

                var invalidItems = cartItems.Where(ci =>
                    !ci.Item.IsActive ||
                    !ci.Item.IsApproved ||
                    ci.Item.ItemStatus != "Active"
                ).ToList();

                if (invalidItems.Any())
                {
                    _context.CartItems.RemoveRange(invalidItems);
                    await _context.SaveChangesAsync();

                    var cleanup = new
                    {
                        RemovedItems = invalidItems.Count,
                        RemovedItemTitles = invalidItems.Select(ci => ci.Item.Title).ToList(),
                        RemainingItems = cartItems.Count - invalidItems.Count
                    };

                    _logger.LogInformation("Cleaned up {Count} invalid items from cart for user {UserId}",
                        invalidItems.Count, userId);

                    return ApiResponse<object>.SuccessResult(cleanup, $"{invalidItems.Count} invalid items removed from cart");
                }

                return ApiResponse<object>.SuccessResult(new { RemovedItems = 0, RemainingItems = cartItems.Count },
                    "No invalid items found in cart");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up cart for user {UserId}", userId);
                return ApiResponse<object>.ErrorResult("An error occurred while cleaning up cart");
            }
        }
    }
}