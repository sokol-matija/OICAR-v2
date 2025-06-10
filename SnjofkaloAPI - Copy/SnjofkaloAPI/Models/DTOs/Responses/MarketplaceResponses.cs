namespace SnjofkaloAPI.Models.DTOs.Responses
{
    // NEW: Comprehensive marketplace dashboard response
    public class MarketplaceDashboardResponse
    {
        public PlatformMetrics Platform { get; set; } = new();
        public RevenueMetrics Revenue { get; set; } = new();
        public List<TopSellerStats> TopSellers { get; set; } = new();
        public List<TopItemStats> TopItems { get; set; } = new();
        public ApprovalMetrics Approval { get; set; } = new();
        public GdprMetrics Gdpr { get; set; } = new();
        public List<CategoryPerformanceStats> CategoryPerformance { get; set; } = new();
        public List<TrendData> RecentTrends { get; set; } = new();

        // Quick actions needed
        public List<ActionItem> RequiredActions { get; set; } = new();
        public List<AlertItem> SystemAlerts { get; set; } = new();
    }

    // NEW: Seller analytics response
    public class SellerAnalyticsResponse
    {
        public int TotalItemsListed { get; set; }
        public int ActiveItems { get; set; }
        public int PendingItems { get; set; }
        public int SoldItems { get; set; }
        public int RejectedItems { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal CommissionPaid { get; set; }
        public decimal PlatformFeesPaid { get; set; }
        public decimal NetEarnings { get; set; }
        public List<MonthlySalesData> MonthlySales { get; set; } = new();
        public List<TopSellingItem> TopItems { get; set; } = new();

        // Performance metrics
        public decimal AverageItemPrice => TotalItemsListed > 0 ? TotalRevenue / TotalItemsListed : 0;
        public decimal AverageCommissionRate => CommissionPaid > 0 && TotalRevenue > 0 ? CommissionPaid / TotalRevenue : 0;
        public int TotalOrderCount { get; set; }
        public decimal ConversionRate { get; set; }
        public decimal RepeatCustomerRate { get; set; }

        // Ratings and reviews
        public decimal AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public int PositiveReviews { get; set; }

        // Growth metrics
        public decimal RevenueGrowthRate { get; set; }
        public decimal ItemGrowthRate { get; set; }
        public string PerformanceTrend => RevenueGrowthRate > 10 ? "Excellent" :
                                         RevenueGrowthRate > 5 ? "Good" :
                                         RevenueGrowthRate > 0 ? "Stable" : "Declining";

        // Seller level and achievements
        public string SellerLevel => TotalRevenue > 50000 ? "Diamond" :
                                     TotalRevenue > 25000 ? "Platinum" :
                                     TotalRevenue > 10000 ? "Gold" :
                                     TotalRevenue > 5000 ? "Silver" : "Bronze";

        public List<string> Achievements { get; set; } = new();
        public List<SellerGoal> Goals { get; set; } = new();
    }

    // Platform metrics
    public class PlatformMetrics
    {
        public int TotalItems { get; set; }
        public int AdminItems { get; set; }
        public int UserItems { get; set; }
        public int PendingApproval { get; set; }
        public int TotalSellers { get; set; }
        public int ActiveSellers { get; set; }
        public int VerifiedSellers { get; set; }
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int NewUsersThisMonth { get; set; }

        // Health indicators
        public decimal SellerRetentionRate { get; set; }
        public decimal UserEngagementRate { get; set; }
        public decimal PlatformGrowthRate { get; set; }
        public string HealthStatus => PlatformGrowthRate > 5 ? "Healthy" :
                                     PlatformGrowthRate > 0 ? "Stable" : "Needs Attention";
    }

    public class RevenueMetrics
    {
        public decimal Last30Days { get; set; }
        public decimal LastYear { get; set; }
        public decimal ThisMonth { get; set; }
        public decimal LastMonth { get; set; }
        public decimal CommissionEarned { get; set; }
        public decimal PlatformFeesEarned { get; set; }
        public decimal TotalPlatformRevenue { get; set; }

        // Growth calculations
        public decimal MonthOverMonthGrowth => LastMonth > 0 ? ((ThisMonth - LastMonth) / LastMonth * 100) : 0;
        public decimal YearOverYearGrowth { get; set; }

        // Projections
        public decimal ProjectedMonthlyRevenue { get; set; }
        public decimal ProjectedYearlyRevenue { get; set; }

        // Revenue breakdown
        public decimal StoreRevenue { get; set; }
        public decimal MarketplaceRevenue { get; set; }
        public decimal MarketplaceShare => TotalPlatformRevenue > 0 ? (MarketplaceRevenue / TotalPlatformRevenue * 100) : 0;
    }

    public class ApprovalMetrics
    {
        public int PendingCount { get; set; }
        public double AverageApprovalTime { get; set; }
        public decimal ApprovalRate { get; set; }
        public int RejectedCount { get; set; }
        public int ApprovedToday { get; set; }
        public int ItemsOverdue { get; set; }

        // Performance indicators
        public string ApprovalEfficiency => AverageApprovalTime < 24 ? "Excellent" :
                                           AverageApprovalTime < 72 ? "Good" :
                                           AverageApprovalTime < 168 ? "Average" : "Needs Improvement";

        public bool HasBacklog => PendingCount > 50;
        public bool HasOverdueItems => ItemsOverdue > 0;
    }

    public class GdprMetrics
    {
        public int PendingAnonymizationRequests { get; set; }
        public int UrgentRequests { get; set; }
        public int OverdueRequests { get; set; }
        public int CompletedAnonymizations { get; set; }
        public decimal ComplianceRate { get; set; }
        public double AverageResponseTime { get; set; }

        // Compliance status
        public string ComplianceStatus => OverdueRequests > 0 ? "Critical" :
                                         UrgentRequests > 0 ? "Urgent" :
                                         PendingAnonymizationRequests > 0 ? "Pending" : "Compliant";

        public bool RequiresImmediateAttention => OverdueRequests > 0 || UrgentRequests > 5;
    }

    // Monthly sales data for analytics
    public class MonthlySalesData
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public int ItemsSold { get; set; }
        public decimal Revenue { get; set; }
        public decimal Commission { get; set; }
        public decimal NetEarnings { get; set; }
        public int OrderCount { get; set; }
        public decimal AverageOrderValue => OrderCount > 0 ? Revenue / OrderCount : 0;
        public decimal GrowthRate { get; set; }
    }

    // Top selling item data
    public class TopSellingItem
    {
        public int ItemId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public int UnitsSold { get; set; }
        public decimal Revenue { get; set; }
        public decimal Price { get; set; }
        public int OrderCount { get; set; }
        public decimal AverageRating { get; set; }
        public DateTime FirstSaleDate { get; set; }
        public DateTime LastSaleDate { get; set; }

        // Performance indicators
        public decimal SalesVelocity => (DateTime.UtcNow - FirstSaleDate).Days > 0 ?
                                       UnitsSold / (decimal)(DateTime.UtcNow - FirstSaleDate).Days : 0;
        public bool IsTrending => SalesVelocity > 1;
        public string PerformanceLevel => Revenue > 10000 ? "Star" :
                                         Revenue > 5000 ? "High" :
                                         Revenue > 1000 ? "Medium" : "Low";
    }

    // Category performance statistics
    public class CategoryPerformanceStats
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int ItemCount { get; set; }
        public int ActiveItems { get; set; }
        public int UserItems { get; set; }
        public int StoreItems { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AveragePrice { get; set; }
        public int TotalSales { get; set; }
        public decimal MarketShare { get; set; }
        public decimal GrowthRate { get; set; }

        // Performance indicators
        public string Trend => GrowthRate > 10 ? "Growing" :
                              GrowthRate > 0 ? "Stable" : "Declining";
        public bool IsTopPerformer => MarketShare > 15;
    }

    // Trend data for charts
    public class TrendData
    {
        public DateTime Date { get; set; }
        public string Metric { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public decimal Change { get; set; }
        public string Period { get; set; } = string.Empty; // Daily, Weekly, Monthly
    }

    // Action items requiring attention
    public class ActionItem
    {
        public string Type { get; set; } = string.Empty; // Approval, GDPR, Inventory, etc.
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty; // High, Medium, Low
        public int Count { get; set; }
        public string ActionUrl { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
        public bool IsOverdue => DateTime.UtcNow > DueDate;
    }

    // System alerts
    public class AlertItem
    {
        public string Type { get; set; } = string.Empty; // Warning, Error, Info
        public string Message { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty; // System, GDPR, Marketplace, etc.
        public DateTime Timestamp { get; set; }
        public bool IsResolved { get; set; }
        public string? Resolution { get; set; }
    }

    // Seller goals and achievements
    public class SellerGoal
    {
        public string GoalType { get; set; } = string.Empty; // Revenue, Items, Rating
        public string Description { get; set; } = string.Empty;
        public decimal TargetValue { get; set; }
        public decimal CurrentValue { get; set; }
        public decimal Progress => TargetValue > 0 ? (CurrentValue / TargetValue * 100) : 0;
        public DateTime TargetDate { get; set; }
        public bool IsAchieved => CurrentValue >= TargetValue;
        public int DaysRemaining => (TargetDate - DateTime.UtcNow).Days;
    }

    // Platform performance overview
    public class PlatformPerformanceResponse
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }

        // Key performance indicators
        public decimal TotalRevenue { get; set; }
        public decimal RevenueGrowth { get; set; }
        public int TotalOrders { get; set; }
        public decimal OrderGrowth { get; set; }
        public int ActiveUsers { get; set; }
        public decimal UserGrowth { get; set; }
        public decimal ConversionRate { get; set; }
        public decimal AverageOrderValue { get; set; }

        // Marketplace specific KPIs
        public int ActiveSellers { get; set; }
        public decimal SellerGrowth { get; set; }
        public decimal MarketplaceRevenue { get; set; }
        public decimal CommissionEarned { get; set; }
        public decimal SellerSatisfactionScore { get; set; }
        public decimal BuyerSatisfactionScore { get; set; }

        // Operational metrics
        public double AverageApprovalTime { get; set; }
        public decimal ApprovalRate { get; set; }
        public double AverageFulfillmentTime { get; set; }
        public decimal ReturnRate { get; set; }
        public decimal DisputeRate { get; set; }

        // Health scores (0-100)
        public decimal PlatformHealthScore { get; set; }
        public decimal MarketplaceHealthScore { get; set; }
        public decimal ComplianceScore { get; set; }

        // Detailed breakdowns
        public List<MetricTrend> Trends { get; set; } = new();
        public List<GeographicMetric> GeographicBreakdown { get; set; } = new();
        public List<DeviceMetric> DeviceBreakdown { get; set; } = new();
    }

    // Supporting metric classes
    public class MetricTrend
    {
        public string MetricName { get; set; } = string.Empty;
        public List<TrendPoint> DataPoints { get; set; } = new();
        public decimal OverallTrend { get; set; }
        public string TrendDirection => OverallTrend > 5 ? "Increasing" :
                                       OverallTrend < -5 ? "Decreasing" : "Stable";
    }

    public class TrendPoint
    {
        public DateTime Date { get; set; }
        public decimal Value { get; set; }
        public decimal Change { get; set; }
    }

    public class GeographicMetric
    {
        public string Country { get; set; } = string.Empty;
        public string? Region { get; set; }
        public int UserCount { get; set; }
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
        public decimal MarketShare { get; set; }
    }

    public class DeviceMetric
    {
        public string DeviceType { get; set; } = string.Empty; // Desktop, Mobile, Tablet
        public int Sessions { get; set; }
        public int Orders { get; set; }
        public decimal Revenue { get; set; }
        public decimal ConversionRate { get; set; }
        public decimal UsageShare { get; set; }
    }
}