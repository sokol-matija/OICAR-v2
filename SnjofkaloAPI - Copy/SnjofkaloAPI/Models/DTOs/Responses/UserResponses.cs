namespace SnjofkaloAPI.Models.DTOs.Responses
{
    // UPDATED: Enhanced UserResponse with marketplace and GDPR metrics
    public class UserResponse
    {
        public int IDUser { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public bool IsAdmin { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }

        // NEW: GDPR fields
        public bool RequestedAnonymization { get; set; }
        public DateTime? AnonymizationRequestDate { get; set; }
        public string? AnonymizationReason { get; set; }

        // NEW: Marketplace metrics (optional - populated when requested)
        public bool IsSeller { get; set; }
        public int? TotalItemsListed { get; set; }
        public int? ActiveItemsCount { get; set; }
        public decimal? TotalRevenue { get; set; }

        // Computed GDPR properties
        public int? DaysUntilAnonymizationDeadline => AnonymizationRequestDate.HasValue
            ? Math.Max(0, 30 - (DateTime.UtcNow - AnonymizationRequestDate.Value).Days)
            : null;
        public bool IsAnonymizationUrgent => DaysUntilAnonymizationDeadline.HasValue && DaysUntilAnonymizationDeadline <= 5;
        public string GdprStatus => RequestedAnonymization
            ? (IsAnonymizationUrgent ? "Urgent" : "Pending")
            : "None";

        // User type classification
        public string UserType => IsAdmin ? "Admin" : IsSeller ? "Seller" : "Customer";
        public string DisplayName => $"{FirstName} {LastName}";
    }

    // UPDATED: Enhanced UserListResponse
    public class UserListResponse
    {
        public int IDUser { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsAdmin { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        // NEW: Marketplace and GDPR indicators
        public bool IsSeller { get; set; }
        public bool RequestedAnonymization { get; set; }
        public int? DaysUntilAnonymizationDeadline { get; set; }

        // Computed properties
        public bool IsAnonymizationUrgent => DaysUntilAnonymizationDeadline.HasValue && DaysUntilAnonymizationDeadline <= 5;
        public string UserType => IsAdmin ? "Admin" : IsSeller ? "Seller" : "Customer";
        public string DisplayName => $"{FirstName} {LastName}";
        public string StatusIndicator => !IsActive ? "Inactive" :
                                        RequestedAnonymization ? "GDPR Request" :
                                        "Active";
    }

    // NEW: GDPR anonymization request response
    public class AnonymizationRequestResponse
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public DateTime RequestDate { get; set; }
        public string Reason { get; set; } = string.Empty;
        public int DaysRemaining { get; set; }
        public bool IsUrgent => DaysRemaining <= 5;
        public string Status => DaysRemaining <= 0 ? "Overdue" : IsUrgent ? "Urgent" : "Pending";
        public string PriorityLevel => DaysRemaining <= 0 ? "Critical" :
                                      DaysRemaining <= 5 ? "High" :
                                      DaysRemaining <= 15 ? "Medium" : "Normal";

        // Additional context
        public bool IsSeller { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalSpent { get; set; }
        public DateTime LastActivity { get; set; }
    }

    // NEW: User analytics response
    public class UserAnalyticsResponse
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int InactiveUsers { get; set; }
        public int AdminUsers { get; set; }
        public int SellerUsers { get; set; }
        public int CustomerUsers { get; set; }

        // Registration trends
        public int NewUsersThisMonth { get; set; }
        public int NewUsersLastMonth { get; set; }
        public decimal UserGrowthRate { get; set; }

        // Activity metrics
        public int ActiveUsersLast30Days { get; set; }
        public int ActiveUsersLast7Days { get; set; }
        public decimal UserRetentionRate { get; set; }
        public decimal AverageSessionDuration { get; set; }

        // GDPR metrics
        public int PendingAnonymizationRequests { get; set; }
        public int UrgentAnonymizationRequests { get; set; }
        public int CompletedAnonymizations { get; set; }
        public int OverdueAnonymizationRequests { get; set; }

        // Seller metrics
        public int ActiveSellers { get; set; }
        public int VerifiedSellers { get; set; }
        public int PendingSellers { get; set; }
        public decimal AverageSellerRevenue { get; set; }

        // Geographic breakdown
        public List<UserLocationStats> LocationBreakdown { get; set; } = new();

        // User type trends
        public List<UserTypeGrowth> UserTypeGrowth { get; set; } = new();
    }

    // NEW: Seller profile response
    public class SellerProfileResponse
    {
        public int SellerUserId { get; set; }
        public string SellerName { get; set; } = string.Empty;
        public string BusinessName { get; set; } = string.Empty;
        public string? BusinessDescription { get; set; }
        public string ContactEmail { get; set; } = string.Empty;
        public string? ContactPhone { get; set; }
        public DateTime JoinedDate { get; set; }
        public bool IsVerified { get; set; }
        public DateTime? VerificationDate { get; set; }
        public string? VerificationStatus { get; set; }

        // Performance metrics
        public int TotalItemsListed { get; set; }
        public int ActiveItems { get; set; }
        public int SoldItems { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalCommissionPaid { get; set; }
        public decimal NetEarnings { get; set; }
        public decimal AverageItemPrice { get; set; }
        public decimal AverageCommissionRate { get; set; }

        // Rating and reviews
        public decimal AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public int PositiveReviews { get; set; }
        public int NegativeReviews { get; set; }

        // Recent activity
        public DateTime? LastItemListed { get; set; }
        public DateTime? LastSale { get; set; }
        public DateTime? LastLogin { get; set; }

        // Performance indicators
        public string PerformanceLevel => TotalRevenue > 10000 ? "Platinum" :
                                         TotalRevenue > 5000 ? "Gold" :
                                         TotalRevenue > 1000 ? "Silver" : "Bronze";
        public bool IsTopSeller => TotalRevenue > 5000 && AverageRating >= 4.5m;
    }

    // Supporting classes for analytics
    public class UserLocationStats
    {
        public string Country { get; set; } = string.Empty;
        public string? State { get; set; }
        public string? City { get; set; }
        public int UserCount { get; set; }
        public decimal Percentage { get; set; }
    }

    public class UserTypeGrowth
    {
        public string UserType { get; set; } = string.Empty;
        public DateTime Period { get; set; }
        public int Count { get; set; }
        public decimal GrowthRate { get; set; }
    }
}