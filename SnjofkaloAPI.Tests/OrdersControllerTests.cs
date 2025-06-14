using Xunit;
using Microsoft.AspNetCore.Mvc;
using Moq;
using FluentAssertions;
using SnjofkaloAPI.Controllers;
using SnjofkaloAPI.Services.Interfaces;
using SnjofkaloAPI.Models.DTOs.Requests;
using SnjofkaloAPI.Models.DTOs.Responses;
using SnjofkaloAPI.Models.DTOs.Common;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace SnjofkaloAPI.Tests
{
    public class OrdersControllerTests
    {
        private readonly Mock<IOrderService> _mockOrderService;
        private readonly Mock<ILogger<OrdersController>> _mockLogger;
        private readonly OrdersController _controller;

        public OrdersControllerTests()
        {
            _mockOrderService = new Mock<IOrderService>();
            _mockLogger = new Mock<ILogger<OrdersController>>();
            _controller = new OrdersController(_mockOrderService.Object, _mockLogger.Object);
        }

        private void SetupUserContext(int userId = 1, bool isAuthenticated = true, bool isAdmin = false)
        {
            var claims = new List<Claim>();
            
            if (isAuthenticated)
            {
                claims.Add(new Claim(ClaimTypes.NameIdentifier, userId.ToString()));
                if (isAdmin)
                {
                    claims.Add(new Claim("IsAdmin", "true"));
                }
            }

            var identity = new ClaimsIdentity(claims, isAuthenticated ? "TestAuth" : null);
            var principal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = principal
                }
            };
        }

        [Fact]
        public async Task CreateOrder_ValidRequest_ReturnsCreatedOrder()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var request = new CreateOrderRequest
            {
                ShippingAddress = "123 Main St, City, State 12345",
                BillingAddress = "123 Main St, City, State 12345",
                OrderNotes = "Please deliver after 5 PM"
            };

            var expectedResponse = new ApiResponse<OrderResponse>
            {
                Success = true,
                Data = new OrderResponse
                {
                    IDOrder = 1,
                    OrderNumber = "ORD-2024-001",
                    UserID = 1,
                    UserName = "John Doe",
                    StatusID = 1,
                    StatusName = "Pending",
                    OrderDate = DateTime.UtcNow,
                    ShippingAddress = request.ShippingAddress,
                    BillingAddress = request.BillingAddress,
                    OrderNotes = request.OrderNotes,
                    TotalAmount = 1999.98m,
                    Items = new List<OrderItemResponse>
                    {
                        new OrderItemResponse
                        {
                            IDOrderItem = 1,
                            ItemID = 1,
                            ItemTitle = "iPhone 15",
                            Quantity = 2,
                            PriceAtOrder = 999.99m,
                            LineTotal = 1999.98m
                        }
                    }
                }
            };

            _mockOrderService.Setup(x => x.CreateOrderFromCartAsync(1, request))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.CreateOrder(request);

            // Assert
            result.Should().BeOfType<CreatedAtActionResult>();
            var createdResult = result as CreatedAtActionResult;
            createdResult?.Value.Should().BeEquivalentTo(expectedResponse);
            createdResult?.ActionName.Should().Be(nameof(_controller.GetMyOrder));
        }

        [Fact]
        public async Task CreateOrder_ServiceFailure_ReturnsBadRequest()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var request = new CreateOrderRequest
            {
                ShippingAddress = "123 Main St, City, State 12345"
            };

            var expectedResponse = new ApiResponse<OrderResponse>
            {
                Success = false,
                Message = "Cart is empty or contains invalid items"
            };

            _mockOrderService.Setup(x => x.CreateOrderFromCartAsync(1, request))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.CreateOrder(request);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task CreateOrder_UnauthenticatedUser_ReturnsUnauthorized()
        {
            // Arrange
            SetupUserContext(isAuthenticated: false);
            var request = new CreateOrderRequest();

            // Act
            var result = await _controller.CreateOrder(request);

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
            var unauthorizedResult = result as UnauthorizedObjectResult;
            unauthorizedResult?.Value.Should().Be("Invalid token");
        }

        [Fact]
        public async Task GetMyOrder_ValidOrderId_ReturnsOrder()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var orderId = 1;
            var expectedResponse = new ApiResponse<OrderResponse>
            {
                Success = true,
                Data = new OrderResponse
                {
                    IDOrder = orderId,
                    OrderNumber = "ORD-2024-001",
                    UserID = 1,
                    UserName = "John Doe",
                    StatusID = 1,
                    StatusName = "Pending",
                    OrderDate = DateTime.UtcNow.AddDays(-1),
                    TotalAmount = 1999.98m,
                    Items = new List<OrderItemResponse>
                    {
                        new OrderItemResponse
                        {
                            IDOrderItem = 1,
                            ItemID = 1,
                            ItemTitle = "iPhone 15",
                            Quantity = 2,
                            PriceAtOrder = 999.99m,
                            LineTotal = 1999.98m
                        }
                    }
                }
            };

            _mockOrderService.Setup(x => x.GetUserOrderByIdAsync(1, orderId))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetMyOrder(orderId);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task GetMyOrder_OrderNotFound_ReturnsNotFound()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var orderId = 999;
            var expectedResponse = new ApiResponse<OrderResponse>
            {
                Success = false,
                Message = "Order not found or does not belong to user"
            };

            _mockOrderService.Setup(x => x.GetUserOrderByIdAsync(1, orderId))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetMyOrder(orderId);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task CancelMyOrder_ValidOrder_ReturnsSuccess()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var orderId = 1;
            var expectedResponse = new ApiResponse
            {
                Success = true,
                Message = "Order cancelled successfully"
            };

            _mockOrderService.Setup(x => x.CancelOrderAsync(1, orderId))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.CancelMyOrder(orderId);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task CancelMyOrder_CannotCancel_ReturnsBadRequest()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var orderId = 1;
            var expectedResponse = new ApiResponse
            {
                Success = false,
                Message = "Order cannot be cancelled - already shipped"
            };

            _mockOrderService.Setup(x => x.CancelOrderAsync(1, orderId))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.CancelMyOrder(orderId);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task GetOrder_AdminUser_ReturnsOrder()
        {
            // Arrange
            SetupUserContext(userId: 1, isAdmin: true);
            var orderId = 1;
            var expectedResponse = new ApiResponse<OrderResponse>
            {
                Success = true,
                Data = new OrderResponse
                {
                    IDOrder = orderId,
                    OrderNumber = "ORD-2024-001",
                    UserID = 2,
                    UserName = "John Doe",
                    StatusID = 1,
                    StatusName = "Pending",
                    OrderDate = DateTime.UtcNow.AddDays(-1),
                    TotalAmount = 1999.98m,
                    Items = new List<OrderItemResponse>
                    {
                        new OrderItemResponse
                        {
                            IDOrderItem = 1,
                            ItemID = 1,
                            ItemTitle = "iPhone 15",
                            Quantity = 2,
                            PriceAtOrder = 999.99m,
                            LineTotal = 1999.98m
                        }
                    }
                }
            };

            _mockOrderService.Setup(x => x.GetOrderByIdAsync(orderId))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetOrder(orderId);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task UpdateOrderStatus_AdminUser_ReturnsUpdatedOrder()
        {
            // Arrange
            SetupUserContext(userId: 1, isAdmin: true);
            var orderId = 1;
            var request = new UpdateOrderStatusRequest
            {
                StatusID = 2,
                StatusChangeReason = "Payment confirmed",
                AdminNotes = "Order approved for processing"
            };

            var expectedResponse = new ApiResponse<OrderResponse>
            {
                Success = true,
                Data = new OrderResponse
                {
                    IDOrder = orderId,
                    OrderNumber = "ORD-2024-001",
                    UserID = 2,
                    UserName = "John Doe",
                    StatusID = 2,
                    StatusName = "Processing",
                    OrderDate = DateTime.UtcNow.AddDays(-1),
                    TotalAmount = 1999.98m
                }
            };

            _mockOrderService.Setup(x => x.UpdateOrderStatusAsync(orderId, request))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.UpdateOrderStatus(orderId, request);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task GetOrdersByStatus_AdminUser_ReturnsFilteredOrders()
        {
            // Arrange
            SetupUserContext(userId: 1, isAdmin: true);
            var statusId = 1; // Pending orders
            var expectedResponse = new ApiResponse<List<OrderListResponse>>
            {
                Success = true,
                Data = new List<OrderListResponse>
                {
                    new OrderListResponse
                    {
                        IDOrder = 1,
                        OrderNumber = "ORD-2024-001",
                        UserName = "John Doe",
                        StatusName = "Pending",
                        OrderDate = DateTime.UtcNow.AddDays(-1),
                        TotalAmount = 1999.98m
                    },
                    new OrderListResponse
                    {
                        IDOrder = 3,
                        OrderNumber = "ORD-2024-003",
                        UserName = "Bob Wilson",
                        StatusName = "Pending",
                        OrderDate = DateTime.UtcNow.AddHours(-2),
                        TotalAmount = 299.99m
                    }
                }
            };

            _mockOrderService.Setup(x => x.GetOrdersByStatusAsync(statusId))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetOrdersByStatus(statusId);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }
    }
} 