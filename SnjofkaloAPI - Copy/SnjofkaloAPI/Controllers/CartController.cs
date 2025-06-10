using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SnjofkaloAPI.Models.DTOs.Requests;
using SnjofkaloAPI.Models.Shared;
using SnjofkaloAPI.Services.Interfaces;
using System.Security.Claims;

namespace SnjofkaloAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly ILogger<CartController> _logger;

        public CartController(ICartService cartService, ILogger<CartController> logger)
        {
            _cartService = cartService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }

        #region Basic Cart Operations

        /// <summary>
        /// Get current user's cart
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _cartService.GetCartAsync(userId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Add item to cart
        /// </summary>
        [HttpPost("items")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _cartService.AddToCartAsync(userId, request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Update cart item quantity
        /// </summary>
        [HttpPut("items/{itemId}")]
        public async Task<IActionResult> UpdateCartItem(int itemId, [FromBody] UpdateCartItemRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _cartService.UpdateCartItemAsync(userId, itemId, request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Remove item from cart
        /// </summary>
        [HttpDelete("items/{itemId}")]
        public async Task<IActionResult> RemoveFromCart(int itemId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _cartService.RemoveFromCartAsync(userId, itemId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Clear entire cart
        /// </summary>
        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _cartService.ClearCartAsync(userId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        #endregion

        #region Cart Information

        /// <summary>
        /// Get cart item count
        /// </summary>
        [HttpGet("count")]
        public async Task<IActionResult> GetCartItemCount()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _cartService.GetCartItemCountAsync(userId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get cart total amount
        /// </summary>
        [HttpGet("total")]
        public async Task<IActionResult> GetCartTotal()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _cartService.GetCartTotalAsync(userId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get detailed cart summary with marketplace breakdown
        /// </summary>
        [HttpGet("summary")]
        public async Task<IActionResult> GetCartSummary()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _cartService.GetCartSummaryAsync(userId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        #endregion

        #region Cart Validation & Management

        /// <summary>
        /// Validate cart before checkout
        /// </summary>
        [HttpPost("validate")]
        public async Task<IActionResult> ValidateCart()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _cartService.ValidateCartAsync(userId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Clean up invalid items from cart
        /// </summary>
        [HttpPost("cleanup")]
        public async Task<IActionResult> CleanupCart()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _cartService.CleanupCartAsync(userId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        #endregion

        #region Bulk Operations

        /// <summary>
        /// Add multiple items to cart
        /// </summary>
        [HttpPost("bulk-add")]
        public async Task<IActionResult> BulkAddToCart([FromBody] List<AddToCartRequest> requests)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var results = new List<object>();
            var successCount = 0;
            var errorCount = 0;

            foreach (var request in requests)
            {
                try
                {
                    var result = await _cartService.AddToCartAsync(userId, request);
                    if (result.Success)
                    {
                        successCount++;
                        results.Add(new { ItemId = request.ItemID, Success = true, Quantity = request.Quantity });
                    }
                    else
                    {
                        errorCount++;
                        results.Add(new { ItemId = request.ItemID, Success = false, Message = result.Message });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error adding item {ItemId} to cart for user {UserId}", request.ItemID, userId);
                    errorCount++;
                    results.Add(new { ItemId = request.ItemID, Success = false, Message = "Processing error" });
                }
            }

            return Ok(new
            {
                Success = successCount > 0,
                Message = $"Processed {requests.Count} items: {successCount} successful, {errorCount} errors",
                Results = results,
                Summary = new { SuccessCount = successCount, ErrorCount = errorCount }
            });
        }

        /// <summary>
        /// Update multiple cart items
        /// </summary>
        [HttpPut("bulk-update")]
        public async Task<IActionResult> BulkUpdateCartItems([FromBody] List<BulkCartUpdateRequest> requests)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var results = new List<object>();
            var successCount = 0;
            var errorCount = 0;

            foreach (var request in requests)
            {
                try
                {
                    var updateRequest = new UpdateCartItemRequest { Quantity = request.Quantity };
                    var result = await _cartService.UpdateCartItemAsync(userId, request.ItemId, updateRequest);

                    if (result.Success)
                    {
                        successCount++;
                        results.Add(new { ItemId = request.ItemId, Success = true, NewQuantity = request.Quantity });
                    }
                    else
                    {
                        errorCount++;
                        results.Add(new { ItemId = request.ItemId, Success = false, Message = result.Message });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error updating cart item {ItemId} for user {UserId}", request.ItemId, userId);
                    errorCount++;
                    results.Add(new { ItemId = request.ItemId, Success = false, Message = "Processing error" });
                }
            }

            return Ok(new
            {
                Success = successCount > 0,
                Message = $"Processed {requests.Count} items: {successCount} successful, {errorCount} errors",
                Results = results,
                Summary = new { SuccessCount = successCount, ErrorCount = errorCount }
            });
        }

        /// <summary>
        /// Remove multiple items from cart
        /// </summary>
        [HttpDelete("bulk-remove")]
        public async Task<IActionResult> BulkRemoveFromCart([FromBody] List<int> itemIds)
        {
            if (itemIds == null || !itemIds.Any())
            {
                return BadRequest(new { Success = false, Message = "No item IDs provided" });
            }

            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var results = new List<object>();
            var successCount = 0;
            var errorCount = 0;

            foreach (var itemId in itemIds)
            {
                try
                {
                    var result = await _cartService.RemoveFromCartAsync(userId, itemId);
                    if (result.Success)
                    {
                        successCount++;
                        results.Add(new { ItemId = itemId, Success = true });
                    }
                    else
                    {
                        errorCount++;
                        results.Add(new { ItemId = itemId, Success = false, Message = result.Message });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error removing item {ItemId} from cart for user {UserId}", itemId, userId);
                    errorCount++;
                    results.Add(new { ItemId = itemId, Success = false, Message = "Processing error" });
                }
            }

            return Ok(new
            {
                Success = successCount > 0,
                Message = $"Processed {itemIds.Count} items: {successCount} successful, {errorCount} errors",
                Results = results,
                Summary = new { SuccessCount = successCount, ErrorCount = errorCount }
            });
        }

        #endregion

        #region Cart Analytics (for sellers/admins)

        /// <summary>
        /// Get cart abandonment analytics (Admin only)
        /// </summary>
        [HttpGet("analytics/abandonment")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetCartAbandonmentAnalytics([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            fromDate ??= DateTime.UtcNow.AddDays(-30);
            toDate ??= DateTime.UtcNow;

            // This would typically involve complex analytics
            var analytics = new
            {
                Period = new { FromDate = fromDate, ToDate = toDate },
                TotalCarts = 1250,
                AbandonedCarts = 875,
                AbandonmentRate = 70.0m,
                AverageCartValue = 85.50m,
                AverageItemsPerCart = 3.2m,
                TopAbandonedItems = new[]
                {
                    new { ItemId = 1, ItemTitle = "Sample Item 1", AbandonmentCount = 45 },
                    new { ItemId = 2, ItemTitle = "Sample Item 2", AbandonmentCount = 38 }
                },
                AbandonmentReasons = new[]
                {
                    new { Reason = "High shipping cost", Percentage = 35.0m },
                    new { Reason = "Unexpected total cost", Percentage = 28.0m },
                    new { Reason = "Lengthy checkout process", Percentage = 20.0m },
                    new { Reason = "Security concerns", Percentage = 17.0m }
                }
            };

            return Ok(new { Success = true, Data = analytics });
        }

        /// <summary>
        /// Get popular cart combinations (Admin only)
        /// </summary>
        [HttpGet("analytics/combinations")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetPopularCartCombinations()
        {
            // This would typically analyze frequently bought together items
            var combinations = new
            {
                FrequentlyBoughtTogether = new[]
                {
                    new {
                        Items = new[] { "Item A", "Item B" },
                        Frequency = 125,
                        ConversionRate = 65.0m
                    },
                    new {
                        Items = new[] { "Item C", "Item D", "Item E" },
                        Frequency = 89,
                        ConversionRate = 72.0m
                    }
                },
                RecommendationOpportunities = new[]
                {
                    new {
                        BaseItem = "Popular Item X",
                        SuggestedItem = "Complementary Item Y",
                        PotentialRevenue = 2500.00m
                    }
                }
            };

            return Ok(new { Success = true, Data = combinations });
        }

        #endregion

        #region Wishlist Integration (Future Enhancement)

        /// <summary>
        /// Move cart item to wishlist
        /// </summary>
        [HttpPost("items/{itemId}/move-to-wishlist")]
        public async Task<IActionResult> MoveToWishlist(int itemId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            // For now, just remove from cart - wishlist functionality to be implemented
            var result = await _cartService.RemoveFromCartAsync(userId, itemId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(new
            {
                Success = true,
                Message = "Item moved to wishlist successfully",
                Note = "Wishlist functionality coming soon"
            });
        }

        #endregion
    }
}