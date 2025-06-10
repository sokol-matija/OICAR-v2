namespace SnjofkaloAPI.Models.Shared
{
    /// <summary>
    /// Bulk stock update model used across multiple controllers
    /// </summary>
    public class BulkStockUpdate
    {
        public int ItemID { get; set; }
        public int NewStock { get; set; }
    }

    /// <summary>
    /// Bulk cart update request model
    /// </summary>
    public class BulkCartUpdateRequest
    {
        public int ItemId { get; set; }
        public int Quantity { get; set; }
    }

    /// <summary>
    /// User notification request model
    /// </summary>
    public class UserNotificationRequest
    {
        public string Message { get; set; } = string.Empty;
        public string NotificationType { get; set; } = "Email"; // Email, SMS, InApp, All
        public bool IsUrgent { get; set; } = false;
        public string? Subject { get; set; }
    }

    /// <summary>
    /// Bulk notification request model
    /// </summary>
    public class BulkNotificationRequest
    {
        public List<int> UserIds { get; set; } = new();
        public string Message { get; set; } = string.Empty;
        public string NotificationType { get; set; } = "Email";
        public string? Subject { get; set; }
        public bool IsUrgent { get; set; } = false;
    }

    /// <summary>
    /// User verification request model
    /// </summary>
    public class UserVerificationRequest
    {
        public bool IsVerified { get; set; }
        public string? VerificationNotes { get; set; }
        public List<string>? VerificationDocuments { get; set; }
        public DateTime? VerificationExpiryDate { get; set; }
    }

    /// <summary>
    /// Admin password reset request model
    /// </summary>
    public class AdminPasswordResetRequest
    {
        public bool SendEmail { get; set; } = true;
        public bool RequirePasswordChange { get; set; } = true;
        public string? Reason { get; set; }
    }

    /// <summary>
    /// Lock account request model
    /// </summary>
    public class LockAccountRequest
    {
        public bool IsLocked { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime? LockUntil { get; set; }
        public bool NotifyUser { get; set; } = true;
    }

    /// <summary>
    /// Anonymize user request model
    /// </summary>
    public class AnonymizeUserRequest
    {
        public string? Reason { get; set; }
        public string? Notes { get; set; }
    }

    /// <summary>
    /// Delete account request model
    /// </summary>
    public class DeleteAccountRequest
    {
        public string? Reason { get; set; }

        [System.ComponentModel.DataAnnotations.Required]
        public bool ConfirmDeletion { get; set; }
    }

    /// <summary>
    /// Order export request model
    /// </summary>
    public class OrderExportRequest
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string Format { get; set; } = "CSV";
        public List<string>? Fields { get; set; }
        public bool IncludeOrderItems { get; set; } = true;
    }

    /// <summary>
    /// Add order note request model
    /// </summary>
    public class AddOrderNoteRequest
    {
        public string Note { get; set; } = string.Empty;
        public bool IsPublic { get; set; } = false;
    }

    /// <summary>
    /// Order notification request model
    /// </summary>
    public class OrderNotificationRequest
    {
        public string Message { get; set; } = string.Empty;
        public string NotificationType { get; set; } = "Email"; // Email, SMS, Both
        public bool IsUrgent { get; set; } = false;
    }

    /// <summary>
    /// System configuration request models
    /// </summary>
    public class SystemConfigurationRequest
    {
        public MarketplaceConfig? Marketplace { get; set; }
        public GdprConfig? Gdpr { get; set; }
        public SecurityConfig? Security { get; set; }
    }

    public class MarketplaceConfig
    {
        public decimal? DefaultCommissionRate { get; set; }
        public decimal? DefaultPlatformFee { get; set; }
        public bool? RequireItemApproval { get; set; }
        public bool? RequireSellerVerification { get; set; }
    }

    public class GdprConfig
    {
        public int? DataRetentionYears { get; set; }
        public int? AnonymizationDeadlineDays { get; set; }
        public bool? AutoCleanupEnabled { get; set; }
    }

    public class SecurityConfig
    {
        public bool? EncryptionEnabled { get; set; }
        public int? SessionTimeoutMinutes { get; set; }
        public bool? TwoFactorRequired { get; set; }
    }

    /// <summary>
    /// System data export request model
    /// </summary>
    public class SystemDataExportRequest
    {
        public string ExportType { get; set; } = string.Empty; // Full, Users, Orders, Items, Logs
        public string Format { get; set; } = "JSON"; // JSON, CSV, XML
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public bool IncludeSensitiveData { get; set; } = false;
        public bool EncryptExport { get; set; } = true;
    }

    /// <summary>
    /// Backup request model
    /// </summary>
    public class BackupRequest
    {
        public string BackupType { get; set; } = "Full"; // Full, Incremental, Differential
        public bool CompressBackup { get; set; } = true;
        public bool VerifyBackup { get; set; } = true;
        public string? BackupLocation { get; set; }
    }
}