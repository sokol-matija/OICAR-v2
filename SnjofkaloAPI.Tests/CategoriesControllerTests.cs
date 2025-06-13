using Xunit;
using Microsoft.AspNetCore.Mvc;
using Moq;
using FluentAssertions;
using SnjofkaloAPI.Controllers;
using SnjofkaloAPI.Services.Interfaces;
using SnjofkaloAPI.Models.DTOs.Responses;
using SnjofkaloAPI.Models.DTOs.Common;
using Microsoft.Extensions.Logging;

namespace SnjofkaloAPI.Tests
{
    public class CategoriesControllerTests
    {
        private readonly Mock<ICategoryService> _mockCategoryService;
        private readonly Mock<ILogger<CategoriesController>> _mockLogger;
        private readonly CategoriesController _controller;

        public CategoriesControllerTests()
        {
            _mockCategoryService = new Mock<ICategoryService>();
            _mockLogger = new Mock<ILogger<CategoriesController>>();
            _controller = new CategoriesController(_mockCategoryService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetCategories_ReturnsAllCategories()
        {
            // Arrange
            var expectedResponse = new ApiResponse<List<CategoryResponse>>
            {
                Success = true,
                Data = new List<CategoryResponse>
                {
                    new CategoryResponse { IDItemCategory = 1, CategoryName = "Electronics", Description = "Electronic devices" },
                    new CategoryResponse { IDItemCategory = 2, CategoryName = "Clothing", Description = "Apparel and accessories" }
                }
            };

            _mockCategoryService.Setup(x => x.GetCategoriesAsync())
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetCategories();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task GetCategories_ServiceFailure_ReturnsBadRequest()
        {
            // Arrange
            var expectedResponse = new ApiResponse<List<CategoryResponse>>
            {
                Success = false,
                Message = "Database connection error"
            };

            _mockCategoryService.Setup(x => x.GetCategoriesAsync())
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetCategories();

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task GetCategory_ValidId_ReturnsCategory()
        {
            // Arrange
            var categoryId = 1;
            var expectedResponse = new ApiResponse<CategoryResponse>
            {
                Success = true,
                Data = new CategoryResponse 
                { 
                    IDItemCategory = categoryId, 
                    CategoryName = "Electronics", 
                    Description = "Electronic devices and gadgets" 
                }
            };

            _mockCategoryService.Setup(x => x.GetCategoryByIdAsync(categoryId))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetCategory(categoryId);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task GetCategory_InvalidId_ReturnsNotFound()
        {
            // Arrange
            var categoryId = 999;
            var expectedResponse = new ApiResponse<CategoryResponse>
            {
                Success = false,
                Message = "Category not found"
            };

            _mockCategoryService.Setup(x => x.GetCategoryByIdAsync(categoryId))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetCategory(categoryId);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
        }
    }
} 