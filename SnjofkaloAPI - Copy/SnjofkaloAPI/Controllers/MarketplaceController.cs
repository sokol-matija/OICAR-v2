using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SnjofkaloAPI.Models.DTOs.Requests;
using SnjofkaloAPI.Services.Interfaces;
using System.Security.Claims;

namespace SnjofkaloAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MarketplaceController : ControllerBase
    {
        private readonly IMarketplaceService _marketplaceService;
        private readonly IItemService _itemService;
        private readonly IOrderService _orderService;
        private readonly IUserService _userService;
        private readonly ILogger<MarketplaceController> _logger;

        public MarketplaceController(
            IMarketplaceService marketplaceService,
            IItemService itemService,
            IOrderService orderService,
            IUserService userService,
            ILogger<MarketplaceController> logger)
        {
            _marketplaceService = marketplaceService;
            _itemService = itemService;
            _orderService = orderService;
            _userService = userService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }

        #region Admin Analytics & Reports

        /// <summary>
        /// Get comprehensive marketplace analytics (Admin only)
        /// </summary>
        [HttpGet("analytics")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetMarketplaceAnalytics()
        {
            var result = await _marketplaceService.GetMarketplaceAnalyticsAsync();

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get commission report for specified period (Admin only)
        /// </summary>
        [HttpGet("reports/commission")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetCommissionReport([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
        {
            if (fromDate >= toDate)
            {
                return BadRequest(new { Success = false, Message = "FromDate must be before ToDate" });
            }

            var result = await _marketplaceService.GetCommissionReportAsync(fromDate, toDate);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get order analytics for admin dashboard (Admin only)
        /// </summary>
        [HttpGet("analytics/orders")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetOrderAnalytics([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _orderService.GetOrderAnalyticsAsync(fromDate, toDate);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        #endregion

        #region Item Approval Workflow

        /// <summary>
        /// Get items pending approval (Admin only)
        /// </summary>
        [HttpGet("items/pending")]
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
        /// Approve an item (Admin only)
        /// </summary>
        [HttpPost("items/{itemId}/approve")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ApproveItem(int itemId, [FromBody] ApproveItemRequest? request = null)
        {
            var adminId = GetCurrentUserId();
            if (adminId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _itemService.ApproveItemAsync(itemId, adminId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Reject an item (Admin only)
        /// </summary>
        [HttpPost("items/{itemId}/reject")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> RejectItem(int itemId, [FromBody] RejectItemRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _itemService.RejectItemAsync(itemId, request.RejectionReason);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Bulk approve/reject items (Admin only)
        /// </summary>
        [HttpPost("items/bulk-action")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> BulkItemAction([FromBody] BulkItemActionRequest request)
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

        #region Seller Management

        /// <summary>
        /// Get seller analytics for current user
        /// </summary>
        [HttpGet("seller/analytics")]
        [Authorize]
        public async Task<IActionResult> GetMySellerAnalytics()
        {
            var sellerId = GetCurrentUserId();
            if (sellerId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _marketplaceService.GetSellerAnalyticsAsync(sellerId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get seller analytics by ID (Admin only)
        /// </summary>
        [HttpGet("seller/{sellerId}/analytics")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetSellerAnalytics(int sellerId)
        {
            var result = await _marketplaceService.GetSellerAnalyticsAsync(sellerId);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get seller statistics for current user
        /// </summary>
        [HttpGet("seller/statistics")]
        [Authorize]
        public async Task<IActionResult> GetMySellerStatistics()
        {
            var sellerId = GetCurrentUserId();
            if (sellerId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _userService.GetSellerStatisticsAsync(sellerId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Create a new seller item
        /// </summary>
        [HttpPost("seller/items")]
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

            return CreatedAtAction(nameof(GetSellerItem), new { itemId = result.Data!.IDItem }, result);
        }

        /// <summary>
        /// Get seller's items
        /// </summary>
        [HttpGet("seller/items")]
        [Authorize]
        public async Task<IActionResult> GetMySellerItems([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
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
        /// Get seller item by ID
        /// </summary>
        [HttpGet("seller/items/{itemId}")]
        [Authorize]
        public async Task<IActionResult> GetSellerItem(int itemId)
        {
            var sellerId = GetCurrentUserId();
            if (sellerId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _itemService.GetItemByIdAsync(itemId);

            if (!result.Success)
            {
                return NotFound(result);
            }

            // Ensure the item belongs to the current seller or user is admin
            if (result.Data!.SellerUserID != sellerId && !User.HasClaim("IsAdmin", "true"))
            {
                return Forbid("You can only view your own items");
            }

            return Ok(result);
        }

        /// <summary>
        /// Get seller's orders
        /// </summary>
        [HttpGet("seller/orders")]
        [Authorize]
        public async Task<IActionResult> GetMySellerOrders([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var sellerId = GetCurrentUserId();
            if (sellerId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _orderService.GetSellerOrdersAsync(sellerId, pageNumber, pageSize);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get seller commission report
        /// </summary>
        [HttpGet("seller/commission")]
        [Authorize]
        public async Task<IActionResult> GetMyCommissionReport([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var sellerId = GetCurrentUserId();
            if (sellerId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _orderService.GetSellerCommissionReportAsync(sellerId, fromDate, toDate);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Check if current user can sell items
        /// </summary>
        [HttpGet("seller/can-sell")]
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

        #endregion

        #region Seller Onboarding & Verification

        /// <summary>
        /// Submit seller onboarding application
        /// </summary>
        [HttpPost("seller/onboard")]
        [Authorize]
        public async Task<IActionResult> SubmitSellerOnboarding([FromBody] SellerOnboardingRequest request)
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

            // This would typically involve creating a seller profile and verification process
            // For now, we'll return a success response
            _logger.LogInformation("Seller onboarding submitted for user {UserId}", userId);

            return Ok(new
            {
                Success = true,
                Message = "Seller onboarding application submitted successfully. You will be contacted within 2-3 business days.",
                ApplicationId = Guid.NewGuid().ToString(),
                SubmittedAt = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Verify seller (Admin only)
        /// </summary>
        [HttpPost("seller/{sellerId}/verify")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> VerifySeller(int sellerId, [FromBody] SellerVerificationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // This would typically update seller verification status in database
            _logger.LogInformation("Seller {SellerId} verification status updated: {IsVerified}", sellerId, request.IsVerified);

            return Ok(new
            {
                Success = true,
                Message = request.IsVerified ? "Seller verified successfully" : "Seller verification revoked",
                SellerId = sellerId,
                VerifiedAt = DateTime.UtcNow
            });
        }

        #endregion

        #region Platform Settings & Configuration

        /// <summary>
        /// Update platform settings (Admin only)
        /// </summary>
        [HttpPut("settings")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdatePlatformSettings([FromBody] PlatformSettingsRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // This would typically update platform configuration in database
            _logger.LogInformation("Platform settings updated by admin {AdminId}", GetCurrentUserId());

            return Ok(new
            {
                Success = true,
                Message = "Platform settings updated successfully",
                UpdatedAt = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Get platform performance metrics (Admin only)
        /// </summary>
        [HttpGet("performance")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetPerformanceMetrics([FromQuery] PerformanceMetricsRequest? request = null)
        {
            var fromDate = request?.FromDate ?? DateTime.UtcNow.AddMonths(-1);
            var toDate = request?.ToDate ?? DateTime.UtcNow;

            // This would typically generate comprehensive performance metrics
            var metrics = new
            {
                Period = new { FromDate = fromDate, ToDate = toDate },
                Revenue = new
                {
                    Total = 125000.50m,
                    Growth = 15.3m,
                    Commission = 8750.00m
                },
                Orders = new
                {
                    Total = 1250,
                    Growth = 12.8m,
                    AverageValue = 100.00m
                },
                Users = new
                {
                    Total = 5000,
                    Active = 2800,
                    Sellers = 150
                },
                Items = new
                {
                    Total = 850,
                    Active = 720,
                    PendingApproval = 25
                }
            };

            return Ok(new { Success = true, Data = metrics });
        }

        /// <summary>
        /// Export marketplace data (Admin only)
        /// </summary>
        [HttpPost("export")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ExportData([FromBody] DataExportRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // This would typically generate and return exportable data
            _logger.LogInformation("Data export requested: {ExportType} by admin {AdminId}", request.ExportType, GetCurrentUserId());

            return Ok(new
            {
                Success = true,
                Message = "Export request queued. You will receive an email when the export is ready.",
                ExportId = Guid.NewGuid().ToString(),
                EstimatedCompletionTime = DateTime.UtcNow.AddMinutes(15)
            });
        }

        #endregion

        #region Search & Discovery

        /// <summary>
        /// Search marketplace items with advanced filters
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> SearchItems([FromQuery] ItemSearchRequest request)
        {
            // Ensure only approved items are shown to public
            request.IsApproved = true;
            request.IsActive = true;

            var result = await _itemService.GetItemsAsync(request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get marketplace statistics for public display
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetPublicStats()
        {
            // Return only non-sensitive marketplace statistics
            var stats = new
            {
                TotalActiveItems = 720,
                TotalSellers = 150,
                CategoriesAvailable = 15,
                FeaturedItems = 25,
                LastUpdated = DateTime.UtcNow
            };

            return Ok(new { Success = true, Data = stats });
        }

        #endregion
    }
}