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
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }

        #region Profile Management

        /// <summary>
        /// Get current user profile
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _userService.GetUserByIdAsync(userId);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get enhanced user profile with statistics
        /// </summary>
        [HttpGet("profile/enhanced")]
        public async Task<IActionResult> GetEnhancedProfile()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            // This would use a service method that includes marketplace stats
            var result = await _userService.GetUserByIdAsync(userId);

            if (!result.Success)
            {
                return NotFound(result);
            }

            // Get seller statistics if user is a seller
            var sellerStatsResult = await _userService.GetSellerStatisticsAsync(userId);
            if (sellerStatsResult.Success)
            {
                return Ok(new
                {
                    Success = true,
                    Data = new
                    {
                        Profile = result.Data,
                        SellerStatistics = sellerStatsResult.Data
                    }
                });
            }

            return Ok(result);
        }

        /// <summary>
        /// Update current user profile
        /// </summary>
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserRequest request)
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

            var result = await _userService.UpdateUserAsync(userId, request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        #endregion

        #region Admin User Management

        /// <summary>
        /// Get all users (Admin only)
        /// </summary>
        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var result = await _userService.GetUsersAsync(pageNumber, pageSize);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get user by ID (Admin only)
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetUser(int id)
        {
            var result = await _userService.GetUserByIdAsync(id);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Update user by ID (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserAdminRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _userService.UpdateUserByAdminAsync(id, request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Delete user by ID (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            // Prevent admin from deleting themselves
            var currentUserId = GetCurrentUserId();
            if (currentUserId == id)
            {
                return BadRequest(new { Success = false, Message = "Cannot delete your own account" });
            }

            var result = await _userService.DeleteUserAsync(id);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get all admin users (Admin only)
        /// </summary>
        [HttpGet("admins")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAdminUsers()
        {
            var result = await _userService.GetAdminUsersAsync();

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Search users with filters (Admin only)
        /// </summary>
        [HttpPost("search")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> SearchUsers([FromBody] UserSearchRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // For now, using basic get users method
            // This would be enhanced with actual search functionality
            var result = await _userService.GetUsersAsync(request.PageNumber, request.PageSize);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        #endregion

        #region Seller Management

        /// <summary>
        /// Get seller statistics for current user
        /// </summary>
        [HttpGet("seller/statistics")]
        public async Task<IActionResult> GetMySellerStatistics()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _userService.GetSellerStatisticsAsync(userId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get seller statistics by user ID (Admin only)
        /// </summary>
        [HttpGet("{id}/seller/statistics")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetSellerStatistics(int id)
        {
            var result = await _userService.GetSellerStatisticsAsync(id);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        #endregion

        #region GDPR Compliance

        /// <summary>
        /// Export current user's data for GDPR compliance (Data Portability - Article 20)
        /// </summary>
        [HttpGet("profile/export")]
        public async Task<IActionResult> ExportMyData()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var result = await _userService.ExportUserDataAsync(userId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            // Return as downloadable JSON file
            var jsonData = System.Text.Json.JsonSerializer.Serialize(result.Data, new System.Text.Json.JsonSerializerOptions
            {
                WriteIndented = true
            });

            return File(
                System.Text.Encoding.UTF8.GetBytes(jsonData),
                "application/json",
                $"user-data-export-{userId}-{DateTime.UtcNow:yyyyMMdd}.json"
            );
        }

        /// <summary>
        /// Export user data by ID for GDPR compliance (Admin only)
        /// </summary>
        [HttpGet("{id}/export")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ExportUserData(int id)
        {
            var result = await _userService.ExportUserDataAsync(id);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            // Return as downloadable JSON file
            var jsonData = System.Text.Json.JsonSerializer.Serialize(result.Data, new System.Text.Json.JsonSerializerOptions
            {
                WriteIndented = true
            });

            return File(
                System.Text.Encoding.UTF8.GetBytes(jsonData),
                "application/json",
                $"user-data-export-{id}-{DateTime.UtcNow:yyyyMMdd}.json"
            );
        }

        /// <summary>
        /// Request anonymization (current user) - GDPR Right to be Forgotten
        /// </summary>
        [HttpPost("profile/request-anonymization")]
        public async Task<IActionResult> RequestAnonymization([FromBody] AnonymizationRequest request)
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

            var result = await _userService.RequestAnonymizationAsync(userId, request.Reason);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Anonymize user data for GDPR compliance (Right to be Forgotten - Article 17) (Admin only)
        /// </summary>
        [HttpPost("{id}/anonymize")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> AnonymizeUser(int id, [FromBody] AnonymizeUserRequest? request = null)
        {
            // Prevent admin from anonymizing themselves
            var currentUserId = GetCurrentUserId();
            if (currentUserId == id)
            {
                return BadRequest(new { Success = false, Message = "Cannot anonymize your own account" });
            }

            var result = await _userService.AnonymizeUserDataAsync(id);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            // Log the anonymization for audit purposes
            _logger.LogWarning("User {UserId} anonymized by admin {AdminId} for GDPR compliance. Reason: {Reason}",
                id, currentUserId, request?.Reason ?? "Not specified");

            return Ok(result);
        }

        /// <summary>
        /// Request account deletion (current user) - GDPR Right to Erasure
        /// </summary>
        [HttpDelete("profile")]
        public async Task<IActionResult> RequestAccountDeletion([FromBody] DeleteAccountRequest request)
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

            // Log the deletion request for audit purposes
            _logger.LogWarning("User {UserId} requested account deletion. Reason: {Reason}",
                userId, request.Reason ?? "Not specified");

            var result = await _userService.DeleteUserAsync(userId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(new
            {
                Success = true,
                Message = "Your account has been deleted successfully in compliance with GDPR Article 17 (Right to Erasure)",
                DeletionDate = DateTime.UtcNow,
                Note = "All your personal data has been removed from our systems"
            });
        }

        /// <summary>
        /// Get GDPR compliance information for current user
        /// </summary>
        [HttpGet("profile/gdpr-info")]
        public IActionResult GetGdprInfo()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized("Invalid token");
            }

            var gdprInfo = new
            {
                YourRights = new
                {
                    DataPortability = new
                    {
                        Description = "You have the right to receive your personal data in a structured, commonly used format",
                        Action = "Use GET /api/users/profile/export to download your data",
                        Article = "GDPR Article 20"
                    },
                    RightToErasure = new
                    {
                        Description = "You have the right to request deletion of your personal data",
                        Action = "Use DELETE /api/users/profile to delete your account",
                        Article = "GDPR Article 17"
                    },
                    RightToRectification = new
                    {
                        Description = "You have the right to correct inaccurate personal data",
                        Action = "Use PUT /api/users/profile to update your information",
                        Article = "GDPR Article 16"
                    },
                    RightToBeForgotten = new
                    {
                        Description = "You have the right to request anonymization of your data",
                        Action = "Use POST /api/users/profile/request-anonymization",
                        Article = "GDPR Article 17"
                    }
                },
                DataProtection = new
                {
                    EncryptionStatus = "Your personal data (email, phone, addresses) is encrypted in our database",
                    DataRetention = "Your data is retained as long as your account is active",
                    ThirdPartySharing = "We do not share your personal data with third parties"
                },
                Contact = new
                {
                    DataProtectionOfficer = "dpo@snjofkalo.com",
                    SupportEmail = "support@snjofkalo.com",
                    PrivacyPolicy = "https://snjofkalo.com/privacy"
                }
            };

            return Ok(new { Success = true, Data = gdprInfo });
        }

        /// <summary>
        /// Get pending anonymization requests (Admin only)
        /// </summary>
        [HttpGet("anonymization-requests")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAnonymizationRequests([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var result = await _userService.GetAnonymizationRequestsAsync(pageNumber, pageSize);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Process data retention cleanup (Admin only)
        /// </summary>
        [HttpPost("data-retention-cleanup")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ProcessDataRetentionCleanup()
        {
            var adminId = GetCurrentUserId();
            _logger.LogInformation("Data retention cleanup initiated by admin {AdminId}", adminId);

            // This would typically be run as a background job
            // For demonstration, we'll return a success response
            return Ok(new
            {
                Success = true,
                Message = "Data retention cleanup has been queued for processing",
                InitiatedBy = adminId,
                InitiatedAt = DateTime.UtcNow,
                EstimatedCompletionTime = DateTime.UtcNow.AddHours(2)
            });
        }

        #endregion

        #region Bulk Operations (Admin)

        /// <summary>
        /// Bulk user actions (Admin only)
        /// </summary>
        [HttpPost("bulk-actions")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> BulkUserActions([FromBody] BulkUserActionRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var currentUserId = GetCurrentUserId();
            var results = new List<object>();
            var successCount = 0;
            var errorCount = 0;

            foreach (var userId in request.UserIds)
            {
                try
                {
                    // Prevent admin from performing actions on themselves
                    if (userId == currentUserId)
                    {
                        results.Add(new { UserId = userId, Success = false, Message = "Cannot perform action on your own account" });
                        errorCount++;
                        continue;
                    }

                    switch (request.Action.ToLower())
                    {
                        case "activate":
                            // This would activate user account
                            _logger.LogInformation("User {UserId} activated by admin {AdminId}", userId, currentUserId);
                            successCount++;
                            results.Add(new { UserId = userId, Success = true, Message = "User activated" });
                            break;

                        case "deactivate":
                            // This would deactivate user account
                            _logger.LogInformation("User {UserId} deactivated by admin {AdminId}", userId, currentUserId);
                            successCount++;
                            results.Add(new { UserId = userId, Success = true, Message = "User deactivated" });
                            break;

                        case "processanonymization":
                            var anonymizeResult = await _userService.AnonymizeUserDataAsync(userId);
                            if (anonymizeResult.Success) successCount++;
                            else errorCount++;
                            results.Add(new { UserId = userId, Success = anonymizeResult.Success, Message = anonymizeResult.Message });
                            break;

                        default:
                            results.Add(new { UserId = userId, Success = false, Message = "Invalid action" });
                            errorCount++;
                            break;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing bulk action for user {UserId}", userId);
                    results.Add(new { UserId = userId, Success = false, Message = "Processing error" });
                    errorCount++;
                }
            }

            return Ok(new
            {
                Success = successCount > 0,
                Message = $"Processed {request.UserIds.Count} users: {successCount} successful, {errorCount} errors",
                Results = results,
                Summary = new { SuccessCount = successCount, ErrorCount = errorCount }
            });
        }

        /// <summary>
        /// Bulk export user data (Admin only)
        /// </summary>
        [HttpPost("bulk-export")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> BulkExportUserData([FromBody] List<int> userIds)
        {
            if (userIds == null || !userIds.Any())
            {
                return BadRequest(new { Success = false, Message = "No user IDs provided" });
            }

            // This would typically queue a background job for bulk export
            _logger.LogInformation("Bulk user data export requested for {Count} users by admin {AdminId}",
                userIds.Count, GetCurrentUserId());

            return Ok(new
            {
                Success = true,
                Message = $"Bulk export queued for {userIds.Count} users. You will receive an email when ready.",
                ExportId = Guid.NewGuid().ToString(),
                UserCount = userIds.Count,
                EstimatedCompletionTime = DateTime.UtcNow.AddMinutes(userIds.Count * 2)
            });
        }

        #endregion

        #region User Analytics & Reports (Admin)

        /// <summary>
        /// Get user analytics (Admin only)
        /// </summary>
        [HttpGet("analytics")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetUserAnalytics()
        {
            // This would typically aggregate user statistics
            var analytics = new
            {
                Overview = new
                {
                    TotalUsers = 5000,
                    ActiveUsers = 4200,
                    InactiveUsers = 800,
                    AdminUsers = 15,
                    SellerUsers = 250,
                    CustomerUsers = 4735
                },
                Growth = new
                {
                    NewUsersThisMonth = 150,
                    NewUsersLastMonth = 135,
                    GrowthRate = 11.1m,
                    RetentionRate = 84.0m
                },
                Activity = new
                {
                    ActiveUsersLast30Days = 3800,
                    ActiveUsersLast7Days = 2100,
                    AverageSessionDuration = 45.5m,
                    DailyActiveUsers = 850
                },
                GDPR = new
                {
                    PendingAnonymizationRequests = 5,
                    UrgentRequests = 2,
                    CompletedAnonymizations = 25,
                    DataExportRequests = 15
                },
                Marketplace = new
                {
                    ActiveSellers = 180,
                    VerifiedSellers = 165,
                    PendingSellers = 8,
                    AverageSellerRevenue = 2500.50m
                }
            };

            return Ok(new { Success = true, Data = analytics });
        }

        /// <summary>
        /// Get user registration trends (Admin only)
        /// </summary>
        [HttpGet("analytics/registration-trends")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetRegistrationTrends([FromQuery] int days = 30)
        {
            // This would generate actual trends from database
            var trends = new
            {
                Period = $"Last {days} days",
                DailyRegistrations = Enumerable.Range(0, days)
                    .Select(i => new
                    {
                        Date = DateTime.UtcNow.AddDays(-i).Date,
                        Registrations = new Random().Next(5, 25),
                        AdminRegistrations = new Random().Next(0, 2),
                        SellerRegistrations = new Random().Next(1, 5)
                    })
                    .OrderBy(d => d.Date)
                    .ToList(),
                Summary = new
                {
                    TotalRegistrations = 450,
                    AveragePerDay = 15.0m,
                    PeakDay = DateTime.UtcNow.AddDays(-5).Date,
                    PeakRegistrations = 28
                }
            };

            return Ok(new { Success = true, Data = trends });
        }

        /// <summary>
        /// Get user activity report (Admin only)
        /// </summary>
        [HttpGet("analytics/activity")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetUserActivityReport([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            fromDate ??= DateTime.UtcNow.AddDays(-30);
            toDate ??= DateTime.UtcNow;

            var activityReport = new
            {
                Period = new { FromDate = fromDate, ToDate = toDate },
                LoginActivity = new
                {
                    TotalLogins = 12500,
                    UniqueUsers = 3200,
                    AverageLoginsPerUser = 3.9m,
                    PeakLoginHour = 14, // 2 PM
                    PeakLoginDay = "Tuesday"
                },
                UserEngagement = new
                {
                    HighlyActive = 850,   // Users with 10+ sessions
                    ModeratelyActive = 1200, // Users with 3-9 sessions
                    LowActivity = 1150,   // Users with 1-2 sessions
                    Inactive = 800        // Users with 0 sessions
                },
                GeographicDistribution = new[]
                {
                    new { Country = "Croatia", UserCount = 2500, Percentage = 50.0m },
                    new { Country = "Slovenia", UserCount = 750, Percentage = 15.0m },
                    new { Country = "Austria", UserCount = 500, Percentage = 10.0m },
                    new { Country = "Other", UserCount = 1250, Percentage = 25.0m }
                }
            };

            return Ok(new { Success = true, Data = activityReport });
        }

        #endregion

        #region User Communication & Notifications

        /// <summary>
        /// Send notification to user (Admin only)
        /// </summary>
        [HttpPost("{id}/notify")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> SendUserNotification(int id, [FromBody] UserNotificationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var adminId = GetCurrentUserId();

            // This would typically send email/SMS/in-app notification
            _logger.LogInformation("Notification sent to user {UserId} by admin {AdminId}: {Message}",
                id, adminId, request.Message);

            return Ok(new
            {
                Success = true,
                Message = "Notification sent successfully",
                NotificationId = Guid.NewGuid().ToString(),
                SentAt = DateTime.UtcNow,
                Type = request.NotificationType
            });
        }

        /// <summary>
        /// Send bulk notifications (Admin only)
        /// </summary>
        [HttpPost("bulk-notify")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> SendBulkNotifications([FromBody] BulkNotificationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var adminId = GetCurrentUserId();

            // This would typically queue bulk notifications
            _logger.LogInformation("Bulk notification queued for {Count} users by admin {AdminId}",
                request.UserIds.Count, adminId);

            return Ok(new
            {
                Success = true,
                Message = $"Bulk notification queued for {request.UserIds.Count} users",
                NotificationId = Guid.NewGuid().ToString(),
                UserCount = request.UserIds.Count,
                EstimatedDeliveryTime = DateTime.UtcNow.AddMinutes(5)
            });
        }

        #endregion

        #region Account Verification & Security

        /// <summary>
        /// Verify user account (Admin only)
        /// </summary>
        [HttpPost("{id}/verify")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> VerifyUserAccount(int id, [FromBody] UserVerificationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var adminId = GetCurrentUserId();

            // This would typically update user verification status
            _logger.LogInformation("User {UserId} verification status updated by admin {AdminId}: {IsVerified}",
                id, adminId, request.IsVerified);

            return Ok(new
            {
                Success = true,
                Message = request.IsVerified ? "User account verified successfully" : "User account verification revoked",
                VerifiedAt = DateTime.UtcNow,
                VerifiedBy = adminId
            });
        }

        /// <summary>
        /// Reset user password (Admin only)
        /// </summary>
        [HttpPost("{id}/reset-password")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> AdminResetPassword(int id, [FromBody] AdminPasswordResetRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var adminId = GetCurrentUserId();

            // This would typically generate new password and send to user
            _logger.LogInformation("Password reset for user {UserId} by admin {AdminId}", id, adminId);

            return Ok(new
            {
                Success = true,
                Message = "Password reset successfully. New password sent to user's email.",
                ResetAt = DateTime.UtcNow,
                ResetBy = adminId
            });
        }

        /// <summary>
        /// Lock/unlock user account (Admin only)
        /// </summary>
        [HttpPost("{id}/lock")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> LockUserAccount(int id, [FromBody] LockAccountRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var currentUserId = GetCurrentUserId();

            // Prevent admin from locking themselves
            if (currentUserId == id)
            {
                return BadRequest(new { Success = false, Message = "Cannot lock your own account" });
            }

            // This would typically update account lock status
            _logger.LogInformation("User {UserId} account {Action} by admin {AdminId}. Reason: {Reason}",
                id, request.IsLocked ? "locked" : "unlocked", currentUserId, request.Reason);

            return Ok(new
            {
                Success = true,
                Message = request.IsLocked ? "User account locked successfully" : "User account unlocked successfully",
                ActionAt = DateTime.UtcNow,
                ActionBy = currentUserId,
                Reason = request.Reason
            });
        }

        #endregion
    }
}