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
    public class ItemsControllerTests
    {
        private readonly Mock<IItemService> _mockItemService;
        private readonly Mock<ILogger<ItemsController>> _mockLogger;
        private readonly ItemsController _controller;

        public ItemsControllerTests()
        {
            _mockItemService = new Mock<IItemService>();
            _mockLogger = new Mock<ILogger<ItemsController>>();
            _controller = new ItemsController(_mockItemService.Object, _mockLogger.Object);
        }

        private void SetupUserContext(int userId = 1, bool isAdmin = false, bool isAuthenticated = true)
        {
            var claims = new List<Claim>();
            
            if (isAuthenticated)
            {
                claims.Add(new Claim(ClaimTypes.NameIdentifier, userId.ToString()));
            }

            if (isAdmin)
            {
                claims.Add(new Claim("IsAdmin", "true"));
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
        public async Task GetItems_PublicAccess_ReturnsItems()
        {
            // Arrange
            SetupUserContext(isAuthenticated: false);
            var request = new ItemSearchRequest
            {
                PageNumber = 1,
                PageSize = 20
            };

            var expectedResponse = new ApiResponse<PagedResult<ItemListResponse>>
            {
                Success = true,
                Data = new PagedResult<ItemListResponse>
                {
                    Data = new List<ItemListResponse>
                    {
                        new ItemListResponse 
                        { 
                            IDItem = 1, 
                            Title = "iPhone 15", 
                            CategoryName = "Electronics",
                            Price = 999.99m,
                            IsActive = true,
                            IsApproved = true,
                            ItemStatus = "Active"
                        }
                    },
                    TotalCount = 1,
                    PageNumber = 1,
                    PageSize = 20
                }
            };

            _mockItemService.Setup(x => x.GetItemsAsync(It.IsAny<ItemSearchRequest>()))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetItems(request);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task GetItem_ValidId_ReturnsItem()
        {
            // Arrange
            var itemId = 1;
            var expectedResponse = new ApiResponse<ItemResponse>
            {
                Success = true,
                Data = new ItemResponse
                {
                    IDItem = itemId,
                    Title = "iPhone 15",
                    CategoryName = "Electronics",
                    Description = "Latest iPhone model",
                    Price = 999.99m,
                    StockQuantity = 50,
                    IsActive = true,
                    IsApproved = true
                }
            };

            _mockItemService.Setup(x => x.GetItemByIdAsync(itemId))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetItem(itemId);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task GetItem_InvalidId_ReturnsNotFound()
        {
            // Arrange
            var itemId = 999;
            var expectedResponse = new ApiResponse<ItemResponse>
            {
                Success = false,
                Message = "Item not found"
            };

            _mockItemService.Setup(x => x.GetItemByIdAsync(itemId))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetItem(itemId);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task CheckStock_ValidQuantity_ReturnsStockStatus()
        {
            // Arrange
            var itemId = 1;
            var quantity = 5;
            var expectedResponse = new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Stock available"
            };

            _mockItemService.Setup(x => x.CheckStockAsync(itemId, quantity))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.CheckStock(itemId, quantity);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task CheckStock_InvalidQuantity_ReturnsBadRequest()
        {
            // Arrange
            var itemId = 1;
            var quantity = 0; // Invalid quantity

            // Act
            var result = await _controller.CheckStock(itemId, quantity);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
            var badRequestResult = result as BadRequestObjectResult;
            badRequestResult?.Value.Should().BeEquivalentTo(new { Success = false, Message = "Quantity must be positive" });
        }

        [Fact]
        public async Task GetFeaturedItems_ReturnsOnlyFeaturedItems()
        {
            // Arrange
            var expectedResponse = new ApiResponse<List<ItemListResponse>>
            {
                Success = true,
                Data = new List<ItemListResponse>
                {
                    new ItemListResponse 
                    { 
                        IDItem = 1, 
                        Title = "Featured iPhone", 
                        IsFeatured = true,
                        IsActive = true,
                        IsApproved = true
                    }
                }
            };

            _mockItemService.Setup(x => x.GetFeaturedItemsAsync())
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetFeaturedItems();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task GetItemsByCategory_ValidCategoryId_ReturnsItems()
        {
            // Arrange
            var categoryId = 1;
            var expectedResponse = new ApiResponse<List<ItemListResponse>>
            {
                Success = true,
                Data = new List<ItemListResponse>
                {
                    new ItemListResponse 
                    { 
                        IDItem = 1, 
                        Title = "Electronics Item", 
                        CategoryName = "Electronics"
                    }
                }
            };

            _mockItemService.Setup(x => x.GetItemsByCategoryAsync(categoryId))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetItemsByCategory(categoryId);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task CanSellItems_AuthenticatedUser_ReturnsCanSellStatus()
        {
            // Arrange
            SetupUserContext(userId: 1);
            var expectedResponse = new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "User can sell items"
            };

            _mockItemService.Setup(x => x.CanUserSellItemsAsync(1))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.CanSellItems();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }
    }
} 