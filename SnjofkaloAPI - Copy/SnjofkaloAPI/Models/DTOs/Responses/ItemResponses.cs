namespace SnjofkaloAPI.Models.DTOs.Responses
{
    // UPDATED: Enhanced ItemResponse with marketplace fields
    public class ItemResponse
    {
        public int IDItem { get; set; }
        public int ItemCategoryID { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int StockQuantity { get; set; }
        public decimal Price { get; set; }
        public bool IsActive { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public int? SellerUserID { get; set; }
        public string? SellerName { get; set; }
        public bool IsApproved { get; set; }
        public string ItemStatus { get; set; } = string.Empty;
        public string? RejectionReason { get; set; }
        public decimal? CommissionRate { get; set; }
        public decimal? PlatformFee { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public string? ApprovedByAdminName { get; set; }

        public List<ItemImageResponse> Images { get; set; } = new();

        public bool IsUserGenerated => SellerUserID.HasValue;
        public bool NeedsApproval => IsUserGenerated && !IsApproved && ItemStatus == "Pending";
        public string ItemSource => IsUserGenerated ? "User" : "Store";

        public decimal EstimatedCommission => IsUserGenerated ? Price * (CommissionRate ?? 0) : 0;
        public decimal EstimatedSellerEarnings => IsUserGenerated ? Price - EstimatedCommission - (PlatformFee ?? 0) : 0;
        public string AvailabilityStatus => !IsActive ? "Inactive" :
                                           !IsApproved ? "Pending Approval" :
                                           ItemStatus != "Active" ? ItemStatus :
                                           StockQuantity == 0 ? "Out of Stock" : "Available";
    }


    // UPDATED: Enhanced ItemListResponse with marketplace indicators
    public class ItemListResponse
    {
        public int IDItem { get; set; }
        public string Title { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime CreatedAt { get; set; }

        public int? SellerUserID { get; set; }
        public string? SellerName { get; set; }
        public string ItemStatus { get; set; } = string.Empty;
        public bool IsApproved { get; set; }

        public ItemImageResponse? PrimaryImage { get; set; }
        public int ImageCount { get; set; }

        public bool IsUserGenerated => SellerUserID.HasValue;
        public string ItemSource => IsUserGenerated ? "User" : "Store";
        public bool IsAvailableForPurchase => IsActive && IsApproved && ItemStatus == "Active";
        public string StatusDisplay => !IsActive ? "Inactive" :
                                      !IsApproved ? "Pending" :
                                      ItemStatus;
    }

    // NEW: Seller item response (extended item response for sellers)
    public class SellerItemResponse : ItemResponse
    {
        public decimal TotalRevenue { get; set; }
        public decimal TotalCommissionPaid { get; set; }
        public decimal TotalPlatformFeesPaid { get; set; }
        public decimal NetEarnings { get; set; }
        public int TotalUnitsSold { get; set; }
        public int TotalOrders { get; set; }
        public DateTime? LastSaleDate { get; set; }
        public decimal AverageRating { get; set; }
        public int ReviewCount { get; set; }

        // Performance metrics
        public int ViewCount { get; set; }
        public int CartAddCount { get; set; }
        public decimal ConversionRate => ViewCount > 0 ? (decimal)TotalOrders / ViewCount * 100 : 0;
    }

    // NEW: Item approval queue response
    public class ItemApprovalResponse
    {
        public int IDItem { get; set; }
        public string Title { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string SellerName { get; set; } = string.Empty;
        public int SellerUserID { get; set; }
        public DateTime SubmissionDate { get; set; }
        public int DaysPending { get; set; }
        public string? SellerNotes { get; set; }
        public decimal? DesiredCommissionRate { get; set; }

        // Risk indicators
        public bool IsHighValue => Price > 1000;
        public bool IsUrgent => DaysPending > 7;
        public string PriorityLevel => IsUrgent ? "High" : IsHighValue ? "Medium" : "Normal";
    }

    // NEW: Item analytics response
    public class ItemAnalyticsResponse
    {
        public int TotalItems { get; set; }
        public int AdminItems { get; set; }
        public int UserItems { get; set; }
        public int PendingApproval { get; set; }
        public int ApprovedItems { get; set; }
        public int RejectedItems { get; set; }
        public int ActiveItems { get; set; }
        public int InactiveItems { get; set; }

        public decimal TotalInventoryValue { get; set; }
        public decimal AverageItemPrice { get; set; }
        public int TotalStockQuantity { get; set; }
        public int LowStockItems { get; set; }
        public int OutOfStockItems { get; set; }

        // Approval metrics
        public double AverageApprovalTime { get; set; }
        public decimal ApprovalRate { get; set; }
        public int ItemsApprovedToday { get; set; }
        public int ItemsPendingOverWeek { get; set; }

        // Category breakdown
        public List<CategoryItemStats> CategoryBreakdown { get; set; } = new();

        // Seller breakdown
        public List<SellerItemStats> TopSellers { get; set; } = new();
    }

    // Supporting classes for analytics
    public class CategoryItemStats
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int ItemCount { get; set; }
        public decimal TotalValue { get; set; }
        public int ActiveItems { get; set; }
        public int UserItems { get; set; }
        public decimal AveragePrice { get; set; }
    }

    public class SellerItemStats
    {
        public int SellerUserId { get; set; }
        public string SellerName { get; set; } = string.Empty;
        public int TotalItems { get; set; }
        public int ActiveItems { get; set; }
        public int PendingItems { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalCommission { get; set; }
        public DateTime LastItemListed { get; set; }
        public decimal ApprovalRate { get; set; }
    }
    public class ItemImageResponse
    {
        public int IDItemImage { get; set; }
        public string ImageData { get; set; } = string.Empty;
        public int ImageOrder { get; set; }
        public string? FileName { get; set; }
        public string? ContentType { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}