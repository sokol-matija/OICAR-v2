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
    public class CartControllerTests
    {
        private readonly Mock<ICartService> _mockCartService;
        private readonly Mock<ILogger<CartController>> _mockLogger;
        private readonly CartController _controller;

        public CartControllerTests()
        {
            _mockCartService = new Mock<ICartService>();
            _mockLogger = new Mock<ILogger<CartController>>();
            _controller = new CartController(_mockCartService.Object, _mockLogger.Object);
        }

        private void SetupUserContext(int userId = 1, bool isAuthenticated = true)
        {
            var claims = new List<Claim>();
            
            if (isAuthenticated)
            {
                claims.Add(new Claim(ClaimTypes.NameIdentifier, userId.ToString()));
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
        public async Task GetCart_AuthenticatedUser_ReturnsCart()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var expectedResponse = new ApiResponse<CartResponse>
            {
                Success = true,
                Data = new CartResponse
                {
                    Items = new List<CartItemResponse>
                    {
                        new CartItemResponse
                        {
                            IDCartItem = 1,
                            ItemID = 1,
                            ItemTitle = "iPhone 15",
                            Quantity = 2,
                            ItemPrice = 999.99m,
                            LineTotal = 1999.98m
                        }
                    }
                }
            };

            _mockCartService.Setup(x => x.GetCartAsync(1))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetCart();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task GetCart_UnauthenticatedUser_ReturnsUnauthorized()
        {
            // Arrange
            SetupUserContext(isAuthenticated: false);

            // Act
            var result = await _controller.GetCart();

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
            var unauthorizedResult = result as UnauthorizedObjectResult;
            unauthorizedResult?.Value.Should().Be("Invalid token");
        }

        [Fact]
        public async Task AddToCart_ValidRequest_ReturnsCartItem()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var request = new AddToCartRequest
            {
                ItemID = 1,
                Quantity = 2
            };

            var expectedResponse = new ApiResponse<CartItemResponse>
            {
                Success = true,
                Data = new CartItemResponse
                {
                    IDCartItem = 1,
                    ItemID = 1,
                    ItemTitle = "iPhone 15",
                    Quantity = 2,
                    ItemPrice = 999.99m,
                    LineTotal = 1999.98m
                }
            };

            _mockCartService.Setup(x => x.AddToCartAsync(1, request))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.AddToCart(request);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task AddToCart_ServiceFailure_ReturnsBadRequest()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var request = new AddToCartRequest
            {
                ItemID = 999, // Non-existent item
                Quantity = 1
            };

            var expectedResponse = new ApiResponse<CartItemResponse>
            {
                Success = false,
                Message = "Item not found or out of stock"
            };

            _mockCartService.Setup(x => x.AddToCartAsync(1, request))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.AddToCart(request);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task UpdateCartItem_ValidRequest_ReturnsUpdatedItem()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var itemId = 1;
            var request = new UpdateCartItemRequest
            {
                Quantity = 5
            };

            var expectedResponse = new ApiResponse<CartItemResponse>
            {
                Success = true,
                Data = new CartItemResponse
                {
                    IDCartItem = 1,
                    ItemID = itemId,
                    ItemTitle = "iPhone 15",
                    Quantity = 5,
                    ItemPrice = 999.99m,
                    LineTotal = 4999.95m
                }
            };

            _mockCartService.Setup(x => x.UpdateCartItemAsync(1, itemId, request))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.UpdateCartItem(itemId, request);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task RemoveFromCart_ValidItemId_ReturnsSuccess()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var itemId = 1;
            var expectedResponse = new ApiResponse
            {
                Success = true,
                Message = "Item removed from cart successfully"
            };

            _mockCartService.Setup(x => x.RemoveFromCartAsync(1, itemId))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.RemoveFromCart(itemId);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task ClearCart_AuthenticatedUser_ReturnsSuccess()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var expectedResponse = new ApiResponse
            {
                Success = true,
                Message = "Cart cleared successfully"
            };

            _mockCartService.Setup(x => x.ClearCartAsync(1))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.ClearCart();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task GetCartItemCount_AuthenticatedUser_ReturnsCount()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var expectedResponse = new ApiResponse<int>
            {
                Success = true,
                Data = 3,
                Message = "Cart contains 3 items"
            };

            _mockCartService.Setup(x => x.GetCartItemCountAsync(1))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetCartItemCount();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task GetCartTotal_AuthenticatedUser_ReturnsTotal()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var expectedResponse = new ApiResponse<decimal>
            {
                Success = true,
                Data = 2999.97m,
                Message = "Cart total calculated"
            };

            _mockCartService.Setup(x => x.GetCartTotalAsync(1))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetCartTotal();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task GetCartSummary_AuthenticatedUser_ReturnsSummary()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var expectedResponse = new ApiResponse<object>
            {
                Success = true,
                Data = new
                {
                    TotalItems = 3,
                    TotalAmount = 2999.97m,
                    EstimatedShipping = 15.99m,
                    EstimatedTax = 240.00m,
                    GrandTotal = 3255.96m,
                    MarketplaceBreakdown = new[]
                    {
                        new { SellerName = "Store Items", ItemCount = 2, Amount = 1999.98m },
                        new { SellerName = "John's Electronics", ItemCount = 1, Amount = 999.99m }
                    }
                }
            };

            _mockCartService.Setup(x => x.GetCartSummaryAsync(1))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetCartSummary();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task ValidateCart_AuthenticatedUser_ReturnsValidationResult()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var expectedResponse = new ApiResponse<object>
            {
                Success = true,
                Data = new
                {
                    IsValid = true,
                    Issues = new string[0],
                    ValidItems = 3,
                    InvalidItems = 0,
                    TotalAmount = 2999.97m
                }
            };

            _mockCartService.Setup(x => x.ValidateCartAsync(1))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.ValidateCart();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task ValidateCart_WithIssues_ReturnsValidationIssues()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var expectedResponse = new ApiResponse<object>
            {
                Success = false,
                Data = new
                {
                    IsValid = false,
                    Issues = new[]
                    {
                        "Item 'iPhone 15' is out of stock",
                        "Item 'Samsung Galaxy' price has changed"
                    },
                    ValidItems = 1,
                    InvalidItems = 2,
                    TotalAmount = 999.99m
                }
            };

            _mockCartService.Setup(x => x.ValidateCartAsync(1))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.ValidateCart();

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }
    }
} 