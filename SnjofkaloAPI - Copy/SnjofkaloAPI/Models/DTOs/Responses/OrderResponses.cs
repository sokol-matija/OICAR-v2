namespace SnjofkaloAPI.Models.DTOs.Responses
{
    // UPDATED: Enhanced OrderResponse with marketplace information
    public class OrderResponse
    {
        public int IDOrder { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public int UserID { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int StatusID { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public string? ShippingAddress { get; set; }
        public string? BillingAddress { get; set; }
        public string? OrderNotes { get; set; }
        public decimal TotalAmount { get; set; }
        public List<OrderItemResponse> Items { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // NEW: Marketplace information
        public object? MarketplaceInfo { get; set; }

        // Computed marketplace properties
        public bool ContainsUserItems => Items.Any(i => i.IsUserGenerated);
        public decimal StoreItemsTotal => Items.Where(i => !i.IsUserGenerated).Sum(i => i.LineTotal);
        public decimal UserItemsTotal => Items.Where(i => i.IsUserGenerated).Sum(i => i.LineTotal);
        public decimal TotalCommissionGenerated => Items.Sum(i => i.EstimatedCommission);
        public decimal TotalPlatformFeesGenerated => Items.Sum(i => i.EstimatedPlatformFee);
        public int UniqueSellerCount => Items.Where(i => i.IsUserGenerated).Select(i => i.SellerUserID).Distinct().Count();
        public string OrderType => ContainsUserItems ? "Marketplace" : "Store";

        // Status tracking
        public bool CanBeCancelled => StatusName == "Pending" || StatusName == "Processing";
        public bool IsCompleted => StatusName == "Delivered";
        public bool IsCancelled => StatusName == "Cancelled" || StatusName == "Refunded";
    }

    // UPDATED: Enhanced OrderItemResponse
    public class OrderItemResponse
    {
        public int IDOrderItem { get; set; }
        public int ItemID { get; set; }
        public string ItemTitle { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal PriceAtOrder { get; set; }
        public decimal LineTotal { get; set; }

        // NEW: Marketplace fields
        public int? SellerUserID { get; set; }
        public string? SellerName { get; set; }
        public decimal? CommissionRate { get; set; }
        public decimal? PlatformFee { get; set; }
        public string? CategoryName { get; set; }

        // Computed properties
        public bool IsUserGenerated => SellerUserID.HasValue;
        public string ItemSource => IsUserGenerated ? "User" : "Store";
        public decimal EstimatedCommission => IsUserGenerated ? LineTotal * (CommissionRate ?? 0) : 0;
        public decimal EstimatedPlatformFee => IsUserGenerated ? Quantity * (PlatformFee ?? 0) : 0;
        public decimal EstimatedSellerEarnings => IsUserGenerated ? LineTotal - EstimatedCommission - EstimatedPlatformFee : 0;
        public decimal TotalFeesForPlatform => EstimatedCommission + EstimatedPlatformFee;
    }

    // UPDATED: Enhanced OrderListResponse
    public class OrderListResponse
    {
        public int IDOrder { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string StatusName { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }

        // NEW: Marketplace indicators
        public bool ContainsUserItems { get; set; }
        public int TotalItems { get; set; }
        public int UniqueSellerCount { get; set; }
        public decimal EstimatedCommission { get; set; }

        // Computed properties
        public string OrderType => ContainsUserItems ? "Marketplace" : "Store";
        public string OrderSource => UniqueSellerCount > 1 ? "Multi-Seller" : OrderType;
        public bool IsHighValue => TotalAmount > 500;
        public int DaysOld => (DateTime.UtcNow - OrderDate).Days;
    }

    // NEW: Order analytics response
    public class OrderAnalyticsResponse
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }

        // Overview metrics
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageOrderValue { get; set; }
        public int TotalItemsSold { get; set; }
        public int UniqueCustomers { get; set; }

        // Marketplace breakdown
        public OrderTypeBreakdown StoreOrders { get; set; } = new();
        public OrderTypeBreakdown MarketplaceOrders { get; set; } = new();
        public decimal TotalCommissionEarned { get; set; }
        public decimal TotalPlatformFeesEarned { get; set; }
        public decimal MarketplaceRevenueShare { get; set; }

        // Status breakdown
        public List<OrderStatusStats> StatusBreakdown { get; set; } = new();

        // Time series data
        public List<DailyOrderStats> DailyTrends { get; set; } = new();
        public List<MonthlyOrderStats> MonthlyTrends { get; set; } = new();

        // Performance metrics
        public decimal ConversionRate { get; set; }
        public decimal RepeatCustomerRate { get; set; }
        public decimal AverageFulfillmentTime { get; set; }
        public decimal CancellationRate { get; set; }

        // Top performers
        public List<TopSellerStats> TopSellers { get; set; } = new();
        public List<TopCustomerStats> TopCustomers { get; set; } = new();
        public List<TopItemStats> TopItems { get; set; } = new();
    }

    // NEW: Seller order history response
    public class SellerOrderResponse
    {
        public int OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string ItemTitle { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal PriceAtOrder { get; set; }
        public decimal LineTotal { get; set; }
        public decimal Commission { get; set; }
        public decimal PlatformFee { get; set; }
        public decimal NetEarnings { get; set; }
        public string OrderStatus { get; set; } = string.Empty;
        public DateTime? ShippedDate { get; set; }
        public DateTime? DeliveredDate { get; set; }

        // Payment status
        public bool IsPaid => OrderStatus == "Delivered";
        public bool IsShipped => ShippedDate.HasValue;
        public bool IsDelivered => DeliveredDate.HasValue;
        public int DaysToShip => ShippedDate.HasValue ? (ShippedDate.Value - OrderDate).Days : (DateTime.UtcNow - OrderDate).Days;
    }

    // NEW: Commission report response
    public class CommissionReportResponse
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int? SellerUserId { get; set; }
        public string? SellerName { get; set; }

        // Summary metrics
        public decimal TotalSales { get; set; }
        public decimal TotalCommission { get; set; }
        public decimal TotalPlatformFees { get; set; }
        public decimal NetSellerEarnings { get; set; }
        public decimal PlatformNetRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int TotalItemsSold { get; set; }

        // Rates and averages
        public decimal AverageCommissionRate { get; set; }
        public decimal AverageOrderValue { get; set; }
        public decimal AveragePlatformFee { get; set; }

        // Breakdowns
        public List<SellerCommissionBreakdown> SellerBreakdown { get; set; } = new();
        public List<ItemCommissionBreakdown> ItemBreakdown { get; set; } = new();
        public List<MonthlyCommissionStats> MonthlyBreakdown { get; set; } = new();

        // Performance indicators
        public decimal CommissionGrowthRate { get; set; }
        public decimal VolumeGrowthRate { get; set; }
        public string TrendDirection => CommissionGrowthRate > 5 ? "Growing" :
                                       CommissionGrowthRate < -5 ? "Declining" : "Stable";
    }

    // Supporting classes for analytics
    public class OrderTypeBreakdown
    {
        public int OrderCount { get; set; }
        public decimal Revenue { get; set; }
        public decimal AverageOrderValue { get; set; }
        public int ItemCount { get; set; }
        public decimal RevenueShare { get; set; }
    }

    public class OrderStatusStats
    {
        public string StatusName { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Revenue { get; set; }
        public decimal Percentage { get; set; }
    }

    public class DailyOrderStats
    {
        public DateTime Date { get; set; }
        public int OrderCount { get; set; }
        public decimal Revenue { get; set; }
        public int ItemsSold { get; set; }
        public decimal AverageOrderValue { get; set; }
        public int NewCustomers { get; set; }
    }

    public class MonthlyOrderStats
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public int OrderCount { get; set; }
        public decimal Revenue { get; set; }
        public int ItemsSold { get; set; }
        public decimal GrowthRate { get; set; }
    }

    public class TopSellerStats
    {
        public int SellerUserId { get; set; }
        public string SellerName { get; set; } = string.Empty;
        public int OrderCount { get; set; }
        public decimal Revenue { get; set; }
        public decimal Commission { get; set; }
        public int ItemsSold { get; set; }
        public decimal AverageOrderValue { get; set; }
    }

    public class TopCustomerStats
    {
        public int UserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int OrderCount { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal AverageOrderValue { get; set; }
        public DateTime LastOrderDate { get; set; }
    }

    public class TopItemStats
    {
        public int ItemId { get; set; }
        public string ItemTitle { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public int UnitsSold { get; set; }
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
        public bool IsUserGenerated { get; set; }
    }

    public class SellerCommissionBreakdown
    {
        public int SellerUserId { get; set; }
        public string SellerName { get; set; } = string.Empty;
        public decimal Sales { get; set; }
        public decimal Commission { get; set; }
        public decimal PlatformFees { get; set; }
        public decimal NetEarnings { get; set; }
        public int ItemsSold { get; set; }
        public decimal CommissionRate { get; set; }
    }

    public class ItemCommissionBreakdown
    {
        public int ItemId { get; set; }
        public string ItemTitle { get; set; } = string.Empty;
        public int UnitsSold { get; set; }
        public decimal Revenue { get; set; }
        public decimal Commission { get; set; }
        public decimal PlatformFees { get; set; }
        public decimal CommissionRate { get; set; }
    }

    public class MonthlyCommissionStats
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public decimal Commission { get; set; }
        public decimal PlatformFees { get; set; }
        public decimal Sales { get; set; }
        public decimal GrowthRate { get; set; }
    }
}