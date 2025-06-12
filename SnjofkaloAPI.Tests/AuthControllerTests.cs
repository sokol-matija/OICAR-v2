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

namespace SnjofkaloAPI.Tests
{
    public class AuthControllerTests
    {
        private readonly Mock<IAuthService> _mockAuthService;
        private readonly Mock<ILogger<AuthController>> _mockLogger;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _mockAuthService = new Mock<IAuthService>();
            _mockLogger = new Mock<ILogger<AuthController>>();
            _controller = new AuthController(_mockAuthService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task Login_WithValidCredentials_ReturnsOkResult()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Username = "testuser",
                Password = "testpassword"
            };

            var successResponse = new ApiResponse<LoginResponse>
            {
                Success = true,
                Data = new LoginResponse
                {
                    Token = "fake-jwt-token",
                    RefreshToken = "fake-refresh-token",
                    ExpiresAt = DateTime.UtcNow.AddHours(1),
                    User = new UserResponse
                    {
                        IDUser = 1,
                        Username = "testuser",
                        Email = "test@example.com"
                    }
                }
            };

            _mockAuthService.Setup(x => x.LoginAsync(It.IsAny<LoginRequest>()))
                          .ReturnsAsync(successResponse);

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(successResponse);
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_ReturnsBadRequest()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Username = "invaliduser",
                Password = "wrongpassword"
            };

            var failureResponse = new ApiResponse<LoginResponse>
            {
                Success = false,
                Message = "Invalid credentials"
            };

            _mockAuthService.Setup(x => x.LoginAsync(It.IsAny<LoginRequest>()))
                          .ReturnsAsync(failureResponse);

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task Register_WithValidData_ReturnsOkResult()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Username = "newuser",
                Email = "newuser@example.com",
                Password = "newpassword",
                FirstName = "New",
                LastName = "User"
            };

            var successResponse = new ApiResponse<LoginResponse>
            {
                Success = true,
                Data = new LoginResponse
                {
                    Token = "fake-jwt-token",
                    RefreshToken = "fake-refresh-token",
                    ExpiresAt = DateTime.UtcNow.AddHours(1),
                    User = new UserResponse
                    {
                        IDUser = 2,
                        Username = "newuser",
                        Email = "newuser@example.com"
                    }
                }
            };

            _mockAuthService.Setup(x => x.RegisterAsync(It.IsAny<RegisterRequest>()))
                          .ReturnsAsync(successResponse);

            // Act
            var result = await _controller.Register(registerRequest);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult?.Value.Should().BeEquivalentTo(successResponse);
        }
    }
} 