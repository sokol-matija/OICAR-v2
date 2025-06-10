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
    public class ItemsController : ControllerBase
    {
        private readonly IItemService _itemService;
        private readonly ILogger<ItemsController> _logger;

        public ItemsController(IItemService itemService, ILogger<ItemsController> logger)
        {
            _itemService = itemService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }

        #region Public Item Endpoints

        /// <summary>
        /// Get items with search and pagination
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetItems([FromQuery] ItemSearchRequest request)
        {
            // For public access, ensure only approved and active items are shown
            if (!User.Identity!.IsAuthenticated || !User.HasClaim("IsAdmin", "true"))
            {
                request.IsApproved = true;
                request.IsActive = true;
                request.ItemStatus = "Active";
            }

            var result = await _itemService.GetItemsAsync(request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get item by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetItem(int id)
        {
            var result = await _itemService.GetItemByIdAsync(id);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get featured items
        /// </summary>
        [HttpGet("featured")]
        public async Task<IActionResult> GetFeaturedItems()
        {
            var result = await _itemService.GetFeaturedItemsAsync();

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get items by category
        /// </summary>
        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetItemsByCategory(int categoryId)
        {
            var result = await _itemService.GetItemsByCategoryAsync(categoryId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Check item stock availability
        /// </summary>
        [HttpGet("{id}/stock/{quantity}")]
        public async Task<IActionResult> CheckStock(int id, int quantity)
        {
            if (quantity <= 0)
            {
                return BadRequest(new { Success = false, Message = "Quantity must be positive" });
            }

            var result = await _itemService.CheckStockAsync(id, quantity);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Search items with advanced filters
        /// </summary>
        [HttpPost("search")]
        public async Task<IActionResult> SearchItems([FromBody] ItemSearchRequest request)
        {
            // For public access, ensure only approved and active items are shown
            if (!User.Identity!.IsAuthenticated || !User.HasClaim("IsAdmin", "true"))
            {
                request.IsApproved = true;
                request.IsActive = true;
                request.ItemStatus = "Active";
            }

            var result = await _itemService.GetItemsAsync(request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        #endregion

        #region Admin Item Management

        /// <summary>
        /// Create new item (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> CreateItem([FromBody] CreateItemRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _itemService.CreateItemAsync(request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return CreatedAtAction(nameof(GetItem), new { id = result.Data!.IDItem }, result);
        }

        /// <summary>
        /// Update item (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateItem(int id, [FromBody] UpdateItemRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _itemService.UpdateItemAsync(id, request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Delete item (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var result = await _itemService.DeleteItemAsync(id);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Update item stock (Admin only)
        /// </summary>
        [HttpPatch("{id}/stock")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] int quantity)
        {
            if (quantity < 0)
            {
                return BadRequest(new { Success = false, Message = "Quantity cannot be negative" });
            }

            var result = await _itemService.UpdateStockAsync(id, quantity);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get all items including inactive/pending (Admin only)
        /// </summary>
        [HttpGet("admin/all")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAllItems([FromQuery] ItemSearchRequest request)
        {
            // Admin can see all items regardless of status
            var result = await _itemService.GetItemsAsync(request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        #endregion

        #region Seller Item Management

        /// <summary>
        /// Get current user's seller items
        /// </summary>
        [HttpGet("my-items")]
        [Authorize]
        public async Task<IActionResult> GetMyItems([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var sellerId = GetCurrentUserId();
            if (sellerId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _itemService.GetItemsBySellerAsync(sellerId, pageNumber, pageSize);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Create seller item
        /// </summary>
        [HttpPost("seller")]
        [Authorize]
        public async Task<IActionResult> CreateSellerItem([FromBody] CreateSellerItemRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var sellerId = GetCurrentUserId();
            if (sellerId == 0)
            {
                return Unauthorized("Invalid token");
            }

            // Check if user can sell items
            var canSellResult = await _itemService.CanUserSellItemsAsync(sellerId);
            if (!canSellResult.Success || canSellResult.Data != true)
            {
                return BadRequest(new { Success = false, Message = "You are not authorized to sell items" });
            }

            var result = await _itemService.CreateSellerItemAsync(sellerId, request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return CreatedAtAction(nameof(GetItem), new { id = result.Data!.IDItem }, result);
        }

        /// <summary>
        /// Update seller item
        /// </summary>
        [HttpPut("seller/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateSellerItem(int id, [FromBody] UpdateSellerItemRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var sellerId = GetCurrentUserId();
            if (sellerId == 0)
            {
                return Unauthorized("Invalid token");
            }

            // Check if item belongs to current seller
            var itemResult = await _itemService.GetItemByIdAsync(id);
            if (!itemResult.Success)
            {
                return NotFound(itemResult);
            }

            if (itemResult.Data!.SellerUserID != sellerId && !User.HasClaim("IsAdmin", "true"))
            {
                return Forbid("You can only update your own items");
            }

            // Convert to regular update request for now
            var updateRequest = new UpdateItemRequest
            {
                ItemCategoryID = request.ItemCategoryID,
                Title = request.Title,
                Description = request.Description,
                StockQuantity = request.StockQuantity,
                Price = request.Price,
                IsFeatured = request.IsFeatured,
                IsActive = request.IsActive
            };

            var result = await _itemService.UpdateItemAsync(id, updateRequest);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Check if current user can sell items
        /// </summary>
        [HttpGet("can-sell")]
        [Authorize]
        public async Task<IActionResult> CanSellItems()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _itemService.CanUserSellItemsAsync(userId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get items by seller ID (Public)
        /// </summary>
        [HttpGet("seller/{sellerId}")]
        public async Task<IActionResult> GetItemsBySeller(int sellerId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var result = await _itemService.GetItemsBySellerAsync(sellerId, pageNumber, pageSize);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            // Filter to only show approved and active items for public
            if (result.Data != null)
            {
                result.Data.Data = result.Data.Data.Where(i => i.IsApproved && i.IsAvailableForPurchase).ToList();
                result.Data.TotalCount = result.Data.Data.Count;
            }

            return Ok(result);
        }

        #endregion

        #region Item Approval (Admin)

        /// <summary>
        /// Get pending approval items (Admin only)
        /// </summary>
        [HttpGet("pending-approval")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetPendingApprovalItems([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var result = await _itemService.GetPendingApprovalItemsAsync(pageNumber, pageSize);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Approve item (Admin only)
        /// </summary>
        [HttpPost("{id}/approve")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ApproveItem(int id, [FromBody] ApproveItemRequest? request = null)
        {
            var adminId = GetCurrentUserId();
            if (adminId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _itemService.ApproveItemAsync(id, adminId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Reject item (Admin only)
        /// </summary>
        [HttpPost("{id}/reject")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> RejectItem(int id, [FromBody] RejectItemRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _itemService.RejectItemAsync(id, request.RejectionReason);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        #endregion

        #region Bulk Operations (Admin)

        /// <summary>
        /// Bulk update stock for multiple items (Admin only)
        /// </summary>
        [HttpPost("bulk-stock-update")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> BulkUpdateStock([FromBody] List<BulkStockUpdate> updates)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var results = new List<object>();
            var successCount = 0;
            var errorCount = 0;

            foreach (var update in updates)
            {
                try
                {
                    var result = await _itemService.UpdateStockAsync(update.ItemID, update.NewStock);
                    if (result.Success)
                    {
                        successCount++;
                        results.Add(new { ItemId = update.ItemID, Success = true, NewStock = update.NewStock });
                    }
                    else
                    {
                        errorCount++;
                        results.Add(new { ItemId = update.ItemID, Success = false, Message = result.Message });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error updating stock for item {ItemId}", update.ItemID);
                    errorCount++;
                    results.Add(new { ItemId = update.ItemID, Success = false, Message = "Processing error" });
                }
            }

            return Ok(new
            {
                Success = successCount > 0,
                Message = $"Processed {updates.Count} items: {successCount} successful, {errorCount} errors",
                Results = results,
                Summary = new { SuccessCount = successCount, ErrorCount = errorCount }
            });
        }

        /// <summary>
        /// Bulk approve/reject items (Admin only)
        /// </summary>
        [HttpPost("bulk-approval")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> BulkApprovalAction([FromBody] BulkItemActionRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var adminId = GetCurrentUserId();
            if (adminId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var results = new List<object>();
            var successCount = 0;
            var errorCount = 0;

            foreach (var itemId in request.ItemIds)
            {
                try
                {
                    switch (request.Action.ToLower())
                    {
                        case "approve":
                            var approveResult = await _itemService.ApproveItemAsync(itemId, adminId);
                            if (approveResult.Success) successCount++;
                            else errorCount++;
                            results.Add(new { ItemId = itemId, Success = approveResult.Success, Message = approveResult.Message });
                            break;

                        case "reject":
                            var rejectResult = await _itemService.RejectItemAsync(itemId, request.Reason ?? "Bulk rejection");
                            if (rejectResult.Success) successCount++;
                            else errorCount++;
                            results.Add(new { ItemId = itemId, Success = rejectResult.Success, Message = rejectResult.Message });
                            break;

                        default:
                            results.Add(new { ItemId = itemId, Success = false, Message = "Invalid action" });
                            errorCount++;
                            break;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing bulk action for item {ItemId}", itemId);
                    results.Add(new { ItemId = itemId, Success = false, Message = "Processing error" });
                    errorCount++;
                }
            }

            return Ok(new
            {
                Success = successCount > 0,
                Message = $"Processed {request.ItemIds.Count} items: {successCount} successful, {errorCount} errors",
                Results = results,
                Summary = new { SuccessCount = successCount, ErrorCount = errorCount }
            });
        }

        #endregion
    }
}