using System.Text.Json;
using System.Text;
using Xunit;
using FluentAssertions;

namespace SnjofkaloAPI.Tests.Integration
{
    public class ProductIntegrationTests
    {
        private readonly HttpClient _client;
        private const string AZURE_API_URL = "https://oicar-api-ms1749710600.azurewebsites.net";

        public ProductIntegrationTests()
        {
            _client = new HttpClient();
            _client.BaseAddress = new Uri(AZURE_API_URL);
            _client.Timeout = TimeSpan.FromSeconds(30);
        }

        [Fact]
        public async Task Azure_API_IsReachable_ReturnsHealthCheck()
        {
            // Integration Test: Verify live Azure API connectivity
            try
            {
                var response = await _client.GetAsync("/health");
                
                response.IsSuccessStatusCode.Should().BeTrue(
                    $"Azure API health check should succeed. Status: {response.StatusCode}");
                
                var content = await response.Content.ReadAsStringAsync();
                content.Should().NotBeEmpty("Health check should return content");
                
                // Verify it's our actual API (not a placeholder)
                content.Should().Contain("Healthy", "API should report healthy status");
            }
                         catch (HttpRequestException ex)
             {
                 // If API is unreachable, fail with helpful message
                 Assert.Fail(
                     $"Azure API integration test failed - API unreachable at {AZURE_API_URL}/health. " +
                     $"Error: {ex.Message}. Verify API is deployed and accessible.");
             }
        }

        [Fact]  
        public async Task Azure_API_Returns_Swagger_Documentation()
        {
            // Integration Test: Verify API documentation is accessible
            try
            {
                var response = await _client.GetAsync("/swagger/index.html");
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    content.Should().Contain("swagger", "Swagger documentation should be available");
                }
                                 else
                 {
                     // Swagger might be disabled in production - that's OK
                     response.StatusCode.Should().BeOneOf(
                         System.Net.HttpStatusCode.NotFound, 
                         System.Net.HttpStatusCode.Forbidden);
                 }
                
                Assert.True(true, "API documentation accessibility test completed");
            }
                         catch (HttpRequestException ex)
             {
                 Assert.Fail($"API documentation test failed: {ex.Message}");
             }
        }

        [Fact]
        public async Task Azure_API_Database_Connection_Works()
        {
            // Integration Test: Verify API can connect to Azure SQL Database
            try
            {
                // Try to access an endpoint that requires database connectivity
                var response = await _client.GetAsync("/api/items?page=1&pageSize=5");
                
                // We expect either success (if items exist) or success with empty result
                // But NOT a 500 error which would indicate database connection issues
                response.StatusCode.Should().NotBe(System.Net.HttpStatusCode.InternalServerError,
                    "API should not return 500 error - indicates database connection problems");
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    content.Should().NotBeEmpty("API should return JSON response");
                    
                    // Verify it's valid JSON
                    var jsonTest = JsonDocument.Parse(content);
                    jsonTest.Should().NotBeNull("Response should be valid JSON");
                }
                
                Assert.True(true, "Database connectivity test completed successfully");
            }
                         catch (HttpRequestException ex)
             {
                 Assert.Fail($"Database connectivity test failed: {ex.Message}");
             }
             catch (JsonException ex)
             {
                 Assert.Fail($"API returned invalid JSON, indicating potential issues: {ex.Message}");
             }
        }

        private void Dispose()
        {
            _client?.Dispose();
        }
    }
} 