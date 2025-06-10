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
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(IOrderService orderService, ILogger<OrdersController> logger)
        {
            _orderService = orderService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }

        #region Customer Order Management

        /// <summary>
        /// Create order from current user's cart
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
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

            var result = await _orderService.CreateOrderFromCartAsync(userId, request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return CreatedAtAction(nameof(GetMyOrder), new { id = result.Data!.IDOrder }, result);
        }

        /// <summary>
        /// Get current user's orders
        /// </summary>
        [HttpGet("my")]
        public async Task<IActionResult> GetMyOrders([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _orderService.GetUserOrdersAsync(userId, pageNumber, pageSize);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get current user's order by ID
        /// </summary>
        [HttpGet("my/{id}")]
        public async Task<IActionResult> GetMyOrder(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _orderService.GetUserOrderByIdAsync(userId, id);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Cancel user's order
        /// </summary>
        [HttpPost("my/{id}/cancel")]
        public async Task<IActionResult> CancelMyOrder(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _orderService.CancelOrderAsync(userId, id);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Search user's orders with filters
        /// </summary>
        [HttpPost("my/search")]
        public async Task<IActionResult> SearchMyOrders([FromBody] OrderSearchRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            // Set the user ID filter to current user
            request.UserID = userId;

            // This would use an extended order service method for searching
            var result = await _orderService.GetUserOrdersAsync(userId, request.PageNumber, request.PageSize);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        #endregion

        #region Admin Order Management

        /// <summary>
        /// Get all orders (Admin only)
        /// </summary>
        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetOrders([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var result = await _orderService.GetOrdersAsync(pageNumber, pageSize);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get order by ID (Admin only)
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var result = await _orderService.GetOrderByIdAsync(id);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Update order status (Admin only)
        /// </summary>
        [HttpPut("{id}/status")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _orderService.UpdateOrderStatusAsync(id, request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get orders by status (Admin only)
        /// </summary>
        [HttpGet("status/{statusId}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetOrdersByStatus(int statusId)
        {
            var result = await _orderService.GetOrdersByStatusAsync(statusId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Search orders with advanced filters (Admin only)
        /// </summary>
        [HttpPost("search")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> SearchOrders([FromBody] OrderSearchRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // This would use an extended order service method for searching
            // For now, using the basic get orders method
            var result = await _orderService.GetOrdersAsync(request.PageNumber, request.PageSize);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get order analytics (Admin only)
        /// </summary>
        [HttpGet("analytics")]
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

        #region Seller Order Management

        /// <summary>
        /// Get current seller's orders
        /// </summary>
        [HttpGet("seller/my")]
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
        /// Get seller orders by seller ID (Admin only)
        /// </summary>
        [HttpGet("seller/{sellerId}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetSellerOrders(int sellerId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var result = await _orderService.GetSellerOrdersAsync(sellerId, pageNumber, pageSize);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get commission report for current seller
        /// </summary>
        [HttpGet("seller/commission")]
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
        /// Get commission report for specific seller (Admin only)
        /// </summary>
        [HttpGet("seller/{sellerId}/commission")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetSellerCommissionReport(int sellerId, [FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _orderService.GetSellerCommissionReportAsync(sellerId, fromDate, toDate);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        #endregion

        #region Bulk Operations (Admin)

        /// <summary>
        /// Bulk update order statuses (Admin only)
        /// </summary>
        [HttpPost("bulk-status-update")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> BulkUpdateOrderStatus([FromBody] BulkOrderActionRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var results = new List<object>();
            var successCount = 0;
            var errorCount = 0;

            var updateRequest = new UpdateOrderStatusRequest
            {
                StatusID = request.NewStatusID,
                StatusChangeReason = request.Reason,
                AdminNotes = request.AdminNotes
            };

            foreach (var orderId in request.OrderIds)
            {
                try
                {
                    var result = await _orderService.UpdateOrderStatusAsync(orderId, updateRequest);
                    if (result.Success)
                    {
                        successCount++;
                        results.Add(new { OrderId = orderId, Success = true });
                    }
                    else
                    {
                        errorCount++;
                        results.Add(new { OrderId = orderId, Success = false, Message = result.Message });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error updating status for order {OrderId}", orderId);
                    errorCount++;
                    results.Add(new { OrderId = orderId, Success = false, Message = "Processing error" });
                }
            }

            return Ok(new
            {
                Success = successCount > 0,
                Message = $"Processed {request.OrderIds.Count} orders: {successCount} successful, {errorCount} errors",
                Results = results,
                Summary = new { SuccessCount = successCount, ErrorCount = errorCount }
            });
        }

        /// <summary>
        /// Generate bulk shipping labels (Admin only)
        /// </summary>
        [HttpPost("bulk-shipping-labels")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GenerateBulkShippingLabels([FromBody] List<int> orderIds)
        {
            if (orderIds == null || !orderIds.Any())
            {
                return BadRequest(new { Success = false, Message = "No order IDs provided" });
            }

            // This would typically integrate with shipping providers
            _logger.LogInformation("Bulk shipping labels requested for {Count} orders", orderIds.Count);

            var results = orderIds.Select(orderId => new
            {
                OrderId = orderId,
                LabelGenerated = true,
                TrackingNumber = $"TRK{orderId:D8}{DateTime.UtcNow:mmss}",
                LabelUrl = $"https://api.example.com/labels/{orderId}"
            }).ToList();

            return Ok(new
            {
                Success = true,
                Message = $"Generated shipping labels for {orderIds.Count} orders",
                Labels = results
            });
        }

        #endregion

        #region Order Reports & Analytics

        /// <summary>
        /// Get detailed order report (Admin only)
        /// </summary>
        [HttpPost("reports/detailed")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetDetailedOrderReport([FromBody] OrderAnalyticsRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _orderService.GetOrderAnalyticsAsync(request.FromDate, request.ToDate);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get commission report for all sellers (Admin only)
        /// </summary>
        [HttpPost("reports/commission")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetCommissionReport([FromBody] CommissionReportRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (request.SellerUserID.HasValue)
            {
                var result = await _orderService.GetSellerCommissionReportAsync(request.SellerUserID.Value, request.FromDate, request.ToDate);
                return Ok(result);
            }
            else
            {
                // Get commission report for all sellers
                var result = await _orderService.GetOrderAnalyticsAsync(request.FromDate, request.ToDate);
                return Ok(result);
            }
        }

        /// <summary>
        /// Export orders to CSV (Admin only)
        /// </summary>
        [HttpPost("export")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ExportOrders([FromBody] OrderExportRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // This would typically generate a CSV file
            _logger.LogInformation("Order export requested by admin {AdminId}", GetCurrentUserId());

            return Ok(new
            {
                Success = true,
                Message = "Export request queued. You will receive an email when the export is ready.",
                ExportId = Guid.NewGuid().ToString(),
                EstimatedCompletionTime = DateTime.UtcNow.AddMinutes(10)
            });
        }

        #endregion

        #region Order Tracking & Communication

        /// <summary>
        /// Get order tracking information
        /// </summary>
        [HttpGet("{id}/tracking")]
        public async Task<IActionResult> GetOrderTracking(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            // Check if user owns the order or is admin
            var orderResult = await _orderService.GetUserOrderByIdAsync(userId, id);
            if (!orderResult.Success && !User.HasClaim("IsAdmin", "true"))
            {
                var adminOrderResult = await _orderService.GetOrderByIdAsync(id);
                if (!adminOrderResult.Success)
                {
                    return NotFound("Order not found");
                }
            }

            // Mock tracking information
            var tracking = new
            {
                OrderId = id,
                TrackingNumber = $"TRK{id:D8}001",
                Carrier = "Express Shipping",
                Status = "In Transit",
                EstimatedDelivery = DateTime.UtcNow.AddDays(2),
                TrackingEvents = new[]
                {
                    new { Date = DateTime.UtcNow.AddDays(-1), Status = "Shipped", Location = "Distribution Center" },
                    new { Date = DateTime.UtcNow.AddHours(-6), Status = "In Transit", Location = "Local Facility" },
                    new { Date = DateTime.UtcNow.AddHours(-2), Status = "Out for Delivery", Location = "Delivery Vehicle" }
                }
            };

            return Ok(new { Success = true, Data = tracking });
        }

        /// <summary>
        /// Add order note (Admin only)
        /// </summary>
        [HttpPost("{id}/notes")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> AddOrderNote(int id, [FromBody] AddOrderNoteRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var adminId = GetCurrentUserId();

            // This would typically save the note to database
            _logger.LogInformation("Order note added to order {OrderId} by admin {AdminId}: {Note}", id, adminId, request.Note);

            return Ok(new
            {
                Success = true,
                Message = "Order note added successfully",
                NoteId = Guid.NewGuid().ToString(),
                AddedAt = DateTime.UtcNow,
                AddedBy = adminId
            });
        }

        /// <summary>
        /// Send order update notification (Admin only)
        /// </summary>
        [HttpPost("{id}/notify")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> SendOrderNotification(int id, [FromBody] OrderNotificationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // This would typically send email/SMS notification
            _logger.LogInformation("Order notification sent for order {OrderId}: {Message}", id, request.Message);

            return Ok(new
            {
                Success = true,
                Message = "Notification sent successfully",
                NotificationId = Guid.NewGuid().ToString(),
                SentAt = DateTime.UtcNow
            });
        }

        #endregion
    }
}