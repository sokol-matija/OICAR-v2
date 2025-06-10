using System.ComponentModel.DataAnnotations;

namespace SnjofkaloAPI.Models.DTOs.Requests
{
    // NEW: Marketplace analytics request
    public class MarketplaceAnalyticsRequest
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? MetricType { get; set; } = "Overview"; // Overview, Revenue, Sellers, Items, GDPR
        public bool IncludeTrends { get; set; } = true;
        public bool IncludeComparisons { get; set; } = false;
        public string? ComparisonPeriod { get; set; } = "PreviousPeriod"; // PreviousPeriod, SamePeriodLastYear
    }

    // NEW: Seller onboarding request
    public class SellerOnboardingRequest
    {
        [Required]
        [StringLength(100)]
        public string BusinessName { get; set; } = string.Empty;

        [StringLength(500)]
        public string? BusinessDescription { get; set; }

        [Required]
        [StringLength(200)]
        public string ContactPerson { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(254)]
        public string BusinessEmail { get; set; } = string.Empty;

        [Phone]
        [StringLength(20)]
        public string? BusinessPhone { get; set; }

        [StringLength(500)]
        public string? BusinessAddress { get; set; }

        [Required]
        public bool AgreeToSellerTerms { get; set; }

        [Required]
        public bool AgreeToCommissionStructure { get; set; }

        public decimal? PreferredCommissionRate { get; set; }

        [StringLength(1000)]
        public string? AdditionalNotes { get; set; }
    }

    // NEW: Seller verification request
    public class SellerVerificationRequest
    {
        [Required]
        public int SellerUserID { get; set; }

        [Required]
        public bool IsVerified { get; set; }

        [StringLength(500)]
        public string? VerificationNotes { get; set; }

        public List<string>? VerificationDocuments { get; set; }

        public DateTime? VerificationExpiryDate { get; set; }
    }

    // NEW: Platform settings update request
    public class PlatformSettingsRequest
    {
        [Range(0, 1)]
        public decimal? DefaultCommissionRate { get; set; }

        [Range(0, 1000)]
        public decimal? DefaultPlatformFee { get; set; }

        public bool? RequireItemApproval { get; set; }

        public bool? AllowUserRegistration { get; set; }

        public bool? RequireSellerVerification { get; set; }

        [Range(1, 365)]
        public int? ItemApprovalTimeoutDays { get; set; }

        [Range(1, 90)]
        public int? GdprResponseTimeDays { get; set; }

        [StringLength(1000)]
        public string? SellerTermsAndConditions { get; set; }

        [StringLength(1000)]
        public string? BuyerTermsAndConditions { get; set; }
    }

    // NEW: Performance metrics request
    public class PerformanceMetricsRequest
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }

        public List<string>? MetricTypes { get; set; } = new()
        {
            "Revenue", "Orders", "Users", "Items", "Commission", "Conversion"
        };

        public string? GroupBy { get; set; } = "Day"; // Hour, Day, Week, Month
        public bool IncludePredictions { get; set; } = false;
        public bool IncludeComparisons { get; set; } = true;
        public int? TopItemsCount { get; set; } = 10;
        public int? TopSellersCount { get; set; } = 10;
    }

    // NEW: Notification settings request
    public class NotificationSettingsRequest
    {
        public bool EmailNotifications { get; set; } = true;
        public bool OrderStatusUpdates { get; set; } = true;
        public bool SellerNewSale { get; set; } = true;
        public bool AdminItemApproval { get; set; } = true;
        public bool AdminGdprRequests { get; set; } = true;
        public bool MarketingEmails { get; set; } = false;
        public bool WeeklyReports { get; set; } = true;
        public bool MonthlyReports { get; set; } = true;

        [StringLength(100)]
        public string? NotificationEmail { get; set; }

        [StringLength(20)]
        public string? NotificationPhone { get; set; }
    }

    // NEW: Data export request
    public class DataExportRequest
    {
        [Required]
        public string ExportType { get; set; } = string.Empty; // Users, Orders, Items, Sellers, Commission, GDPR

        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }

        [Required]
        public string Format { get; set; } = "CSV"; // CSV, JSON, XML, PDF

        public List<string>? Fields { get; set; }
        public List<int>? EntityIds { get; set; }

        public bool IncludeRelatedData { get; set; } = false;
        public bool EncryptSensitiveData { get; set; } = true;

        [StringLength(500)]
        public string? ExportReason { get; set; }
    }
}