using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SnjofkaloAPI.Data;
using SnjofkaloAPI.Models.DTOs.Common;
using SnjofkaloAPI.Models.DTOs.Requests;
using SnjofkaloAPI.Models.DTOs.Responses;
using SnjofkaloAPI.Models.Entities;
using SnjofkaloAPI.Services.Interfaces;
using SnjofkaloAPI.Utilities;
using SnjofkaloAPI.Configurations;
using SnjofkaloAPI.Extensions;
using AutoMapper;
using System.Security.Claims;

namespace SnjofkaloAPI.Services.Implementation
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtHelper _jwtHelper;
        private readonly IMapper _mapper;
        private readonly JwtSettings _jwtSettings;
        private readonly ILogger<AuthService> _logger;
        private readonly IDataEncryptionService _encryptionService;

        public AuthService(
            ApplicationDbContext context,
            IOptions<JwtSettings> jwtSettings,
            IMapper mapper,
            ILogger<AuthService> logger,
            IDataEncryptionService encryptionService)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
            _jwtHelper = new JwtHelper(_jwtSettings);
            _mapper = mapper;
            _logger = logger;
            _encryptionService = encryptionService;
        }

        public async Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request)
        {
            try
            {
                // Get all users and decrypt to find matching username
                var allUsers = await _context.Users.ToListDecryptedAsync(_encryptionService);
                var user = allUsers.FirstOrDefault(u => u.Username == request.Username);

                if (user == null)
                {
                    await LogFailedLoginAttempt(request.Username);
                    return ApiResponse<LoginResponse>.ErrorResult("Invalid username or password");
                }

                if (!PasswordHelper.VerifyPassword(request.Password, user.PasswordHash))
                {
                    await LogFailedLoginAttempt(request.Username, user.IDUser);

                    // Get the actual entity from context to update failed attempts
                    var userEntity = await _context.Users.FindAsync(user.IDUser);
                    if (userEntity != null)
                    {
                        _encryptionService.DecryptEntity(userEntity);
                        userEntity.FailedLoginAttempts++;
                        // Entity will be encrypted by interceptor on save
                        await _context.SaveChangesAsync();
                    }

                    return ApiResponse<LoginResponse>.ErrorResult("Invalid username or password");
                }

                // Update login info on the actual entity
                var actualUser = await _context.Users.FindAsync(user.IDUser);
                if (actualUser != null)
                {
                    _encryptionService.DecryptEntity(actualUser);
                    actualUser.FailedLoginAttempts = 0;
                    actualUser.LastLoginAt = DateTime.UtcNow;
                    // Entity will be encrypted by interceptor on save
                    await _context.SaveChangesAsync();
                }

                var accessToken = _jwtHelper.GenerateAccessToken(user);
                var refreshToken = _jwtHelper.GenerateRefreshToken();

                var response = new LoginResponse
                {
                    Token = accessToken,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryInMinutes),
                    User = _mapper.Map<UserResponse>(user)
                };

                _logger.LogInformation("User {Username} logged in successfully", user.Username);
                return ApiResponse<LoginResponse>.SuccessResult(response, "Login successful");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for user {Username}", request.Username);
                return ApiResponse<LoginResponse>.ErrorResult("An error occurred during login");
            }
        }

        public async Task<ApiResponse<LoginResponse>> RegisterAsync(RegisterRequest request)
        {
            try
            {
                // Check for existing users by decrypting all users
                var allUsers = await _context.Users.ToListDecryptedAsync(_encryptionService);
                var existingUser = allUsers.FirstOrDefault(u => u.Username == request.Username || u.Email == request.Email);

                if (existingUser != null)
                {
                    var field = existingUser.Username == request.Username ? "Username" : "Email";
                    return ApiResponse<LoginResponse>.ErrorResult($"{field} already exists");
                }

                var passwordHash = PasswordHelper.HashPassword(request.Password, out byte[] salt);

                var user = new User
                {
                    Username = request.Username,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    PasswordHash = passwordHash,
                    PasswordSalt = salt,
                    IsAdmin = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                // Entity will be encrypted by interceptor on save
                await _context.SaveChangesAsync();

                // Decrypt user for token generation and response
                _encryptionService.DecryptEntity(user);

                var accessToken = _jwtHelper.GenerateAccessToken(user);
                var refreshToken = _jwtHelper.GenerateRefreshToken();

                var response = new LoginResponse
                {
                    Token = accessToken,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryInMinutes),
                    User = _mapper.Map<UserResponse>(user)
                };

                _logger.LogInformation("New user {Username} registered successfully", user.Username);
                return ApiResponse<LoginResponse>.SuccessResult(response, "Registration successful");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for user {Username}", request.Username);
                return ApiResponse<LoginResponse>.ErrorResult("An error occurred during registration");
            }
        }

        public async Task<ApiResponse<LoginResponse>> RefreshTokenAsync(RefreshTokenRequest request)
        {
            try
            {
                var principal = _jwtHelper.GetPrincipalFromToken(request.Token);
                if (principal == null)
                {
                    return ApiResponse<LoginResponse>.ErrorResult("Invalid token");
                }

                var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return ApiResponse<LoginResponse>.ErrorResult("Invalid token");
                }

                var user = await _context.Users
                    .Where(u => u.IDUser == userId)
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                if (user == null)
                {
                    return ApiResponse<LoginResponse>.ErrorResult("User not found");
                }

                var newAccessToken = _jwtHelper.GenerateAccessToken(user);
                var newRefreshToken = _jwtHelper.GenerateRefreshToken();

                var response = new LoginResponse
                {
                    Token = newAccessToken,
                    RefreshToken = newRefreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryInMinutes),
                    User = _mapper.Map<UserResponse>(user)
                };

                return ApiResponse<LoginResponse>.SuccessResult(response, "Token refreshed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                return ApiResponse<LoginResponse>.ErrorResult("An error occurred during token refresh");
            }
        }

        public async Task<ApiResponse> ChangePasswordAsync(int userId, ChangePasswordRequest request)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.IDUser == userId)
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                if (user == null)
                {
                    return ApiResponse.ErrorResult("User not found");
                }

                if (!PasswordHelper.VerifyPassword(request.CurrentPassword, user.PasswordHash))
                {
                    return ApiResponse.ErrorResult("Current password is incorrect");
                }

                // Get the actual entity to update
                var userEntity = await _context.Users.FindAsync(userId);
                if (userEntity != null)
                {
                    var newPasswordHash = PasswordHelper.HashPassword(request.NewPassword, out byte[] salt);
                    _encryptionService.DecryptEntity(userEntity);
                    userEntity.PasswordHash = newPasswordHash;
                    userEntity.PasswordSalt = salt;
                    userEntity.UpdatedAt = DateTime.UtcNow;
                    // Entity will be encrypted by interceptor on save
                    await _context.SaveChangesAsync();
                }

                _logger.LogInformation("Password changed for user {UserId}", userId);
                return ApiResponse.SuccessResult("Password changed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user {UserId}", userId);
                return ApiResponse.ErrorResult("An error occurred while changing password");
            }
        }

        public async Task<ApiResponse> LogoutAsync(int userId)
        {
            try
            {
                // In production, blacklist the token
                _logger.LogInformation("User {UserId} logged out", userId);
                return ApiResponse.SuccessResult("Logged out successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout for user {UserId}", userId);
                return ApiResponse.ErrorResult("An error occurred during logout");
            }
        }

        private async Task LogFailedLoginAttempt(string username, int? userId = null)
        {
            try
            {
                var log = new Log
                {
                    Level = "WARN",
                    Message = $"Failed login attempt for username: {username}",
                    UserID = userId,
                    Timestamp = DateTime.UtcNow,
                    Logger = nameof(AuthService),
                    MachineName = Environment.MachineName
                };

                _context.Logs.Add(log);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging failed login attempt");
            }
        }
    }
}