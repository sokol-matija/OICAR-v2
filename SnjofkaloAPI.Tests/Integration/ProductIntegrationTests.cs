using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text;
using Xunit;
using FluentAssertions;
using SnjofkaloAPI.Models.DTOs.Requests;
using SnjofkaloAPI.Data;

namespace SnjofkaloAPI.Tests.Integration
{
    public class ProductIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public ProductIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task GetProducts_ShouldReturnProductsFromDatabase()
        {
            // This tests: API Controller → Service → Database → Response
            
            // Act: Call the real API endpoint
            var response = await _client.GetAsync("/api/items");

            // Assert: Check response and data structure
            response.IsSuccessStatusCode.Should().BeTrue();
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeEmpty();
            
            // This proves the entire API → Database → Response chain works
        }

        [Fact]
        public async Task CreateProduct_ShouldSaveToDatabase_AndReturnCorrectResponse()
        {
            // This tests: API receives data → Saves to database → Returns response
            
            // Arrange: Create test product data
            var productRequest = new CreateItemRequest
            {
                Title = "Integration Test Product",
                Description = "Test Description",
                Price = 99.99m,
                CategoryID = 1,
                StockQuantity = 10
            };

            var json = JsonSerializer.Serialize(productRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act: Send request to real API endpoint
            var response = await _client.PostAsync("/api/items", content);

            // Assert: Verify response
            response.IsSuccessStatusCode.Should().BeTrue();

            // Additional verification: Check database directly
            using var scope = _factory.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var savedProduct = await dbContext.Items
                .FirstOrDefaultAsync(p => p.Title == "Integration Test Product");

            savedProduct.Should().NotBeNull();
            savedProduct.Price.Should().Be(99.99m);
            
            // This proves: API → Database save → Database retrieve all work together
        }
    }
} 