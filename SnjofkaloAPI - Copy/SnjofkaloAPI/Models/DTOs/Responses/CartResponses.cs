namespace SnjofkaloAPI.Models.DTOs.Responses
{
    // UPDATED: Enhanced CartResponse with marketplace breakdown
    public class CartResponse
    {
        public List<CartItemResponse> Items { get; set; } = new();

        // Basic totals
        public decimal TotalAmount => Items.Sum(x => x.LineTotal);
        public int TotalItems => Items.Sum(x => x.Quantity);

        // NEW: Marketplace breakdown
        public decimal StoreItemsTotal => Items.Where(x => !x.IsUserGenerated).Sum(x => x.LineTotal);
        public decimal UserItemsTotal => Items.Where(x => x.IsUserGenerated).Sum(x => x.LineTotal);
        public decimal EstimatedTotalCommission => Items.Sum(x => x.EstimatedCommission);
        public decimal EstimatedTotalPlatformFees => Items.Sum(x => x.EstimatedPlatformFee);

        public int StoreItemCount => Items.Where(x => !x.IsUserGenerated).Sum(x => x.Quantity);
        public int UserItemCount => Items.Where(x => x.IsUserGenerated).Sum(x => x.Quantity);
        public int UniqueSellerCount => Items.Where(x => x.IsUserGenerated).Select(x => x.SellerUserID).Distinct().Count();

        // Validation and availability
        public bool HasUnavailableItems => Items.Any(x => !x.IsAvailable);
        public List<CartItemResponse> UnavailableItems => Items.Where(x => !x.IsAvailable).ToList();
        public bool IsReadyForCheckout => Items.Any() && !HasUnavailableItems;

        // Summary by source
        public CartSourceSummary StoreSummary => new()
        {
            ItemCount = StoreItemCount,
            TotalAmount = StoreItemsTotal,
            Source = "Store"
        };

        public CartSourceSummary UserItemsSummary => new()
        {
            ItemCount = UserItemCount,
            TotalAmount = UserItemsTotal,
            Source = "Marketplace",
            EstimatedCommission = EstimatedTotalCommission,
            EstimatedPlatformFees = EstimatedTotalPlatformFees
        };

        // Seller breakdown
        public List<CartSellerSummary> SellerBreakdown => Items
            .Where(x => x.IsUserGenerated)
            .GroupBy(x => new { x.SellerUserID, x.SellerName })
            .Select(g => new CartSellerSummary
            {
                SellerUserId = g.Key.SellerUserID!.Value,
                SellerName = g.Key.SellerName ?? "Unknown Seller",
                ItemCount = g.Sum(x => x.Quantity),
                TotalAmount = g.Sum(x => x.LineTotal),
                EstimatedCommission = g.Sum(x => x.EstimatedCommission),
                EstimatedPlatformFees = g.Sum(x => x.EstimatedPlatformFee)
            })
            .OrderByDescending(x => x.TotalAmount)
            .ToList();
    }

    // UPDATED: Enhanced CartItemResponse with seller information
    public class CartItemResponse
    {
        public int IDCartItem { get; set; }
        public int ItemID { get; set; }
        public string ItemTitle { get; set; } = string.Empty;
        public decimal ItemPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }
        public DateTime AddedAt { get; set; }
        public bool IsInStock { get; set; }
        public int AvailableStock { get; set; }

        // NEW: Marketplace fields
        public int? SellerUserID { get; set; }
        public string? SellerName { get; set; }
        public string? CategoryName { get; set; }
        public string ItemStatus { get; set; } = string.Empty;
        public bool IsApproved { get; set; }
        public decimal? CommissionRate { get; set; }
        public decimal? PlatformFee { get; set; }

        // Computed properties
        public bool IsUserGenerated => SellerUserID.HasValue;
        public string ItemSource => IsUserGenerated ? "User" : "Store";
        public bool IsAvailable => IsInStock && IsApproved && ItemStatus == "Active";
        public decimal EstimatedCommission => IsUserGenerated ? LineTotal * (CommissionRate ?? 0) : 0;
        public decimal EstimatedPlatformFee => IsUserGenerated ? Quantity * (PlatformFee ?? 0) : 0;

        // Status indicators
        public string AvailabilityStatus => !IsInStock ? "Out of Stock" :
                                           !IsApproved ? "Pending Approval" :
                                           ItemStatus != "Active" ? ItemStatus :
                                           "Available";

        public bool HasIssues => !IsAvailable;
        public List<string> Issues
        {
            get
            {
                var issues = new List<string>();
                if (!IsInStock) issues.Add("Out of stock");
                if (!IsApproved) issues.Add("Pending approval");
                if (ItemStatus != "Active") issues.Add($"Status: {ItemStatus}");
                if (AvailableStock < Quantity) issues.Add("Insufficient stock");
                return issues;
            }
        }
    }

    // NEW: Cart validation response
    public class CartValidationResponse
    {
        public bool IsValid { get; set; }
        public int TotalItems { get; set; }
        public int ValidItems { get; set; }
        public int InvalidItems { get; set; }
        public List<CartValidationIssue> Issues { get; set; } = new();

        public CartSummary? ValidCartSummary { get; set; }

        // Recommendations
        public List<string> Recommendations { get; set; } = new();
        public bool CanProceedToCheckout => IsValid && ValidItems > 0;

        // Issue categorization
        public int StockIssues => Issues.Count(i => i.IssueType == "Stock");
        public int ApprovalIssues => Issues.Count(i => i.IssueType == "Approval");
        public int StatusIssues => Issues.Count(i => i.IssueType == "Status");
    }

    // NEW: Cart cleanup response
    public class CartCleanupResponse
    {
        public int RemovedItems { get; set; }
        public List<string> RemovedItemTitles { get; set; } = new();
        public int RemainingItems { get; set; }
        public List<CartCleanupReason> RemovalReasons { get; set; } = new();

        public bool HadInvalidItems => RemovedItems > 0;
        public string CleanupSummary => RemovedItems == 0
            ? "No invalid items found"
            : $"Removed {RemovedItems} invalid item(s)";
    }

    // NEW: Cart summary response (detailed breakdown)
    public class CartSummaryResponse
    {
        public int TotalItems { get; set; }
        public decimal TotalAmount { get; set; }

        // Source breakdown
        public CartSourceSummary StoreItems { get; set; } = new();
        public CartSourceSummary UserItems { get; set; } = new();

        // Seller breakdown
        public List<CartSellerSummary> SellerBreakdown { get; set; } = new();

        // Category breakdown
        public List<CartCategorySummary> CategoryBreakdown { get; set; } = new();

        // Financial summary
        public decimal EstimatedTotalCommission { get; set; }
        public decimal EstimatedTotalPlatformFees { get; set; }
        public decimal EstimatedPlatformRevenue { get; set; }

        // Logistics
        public bool RequiresMultipleShipments => SellerBreakdown.Count > 1;
        public int EstimatedPackages => SellerBreakdown.Any() ? SellerBreakdown.Count + (StoreItems.ItemCount > 0 ? 1 : 0) : 0;
    }

    // Supporting classes
    public class CartSourceSummary
    {
        public string Source { get; set; } = string.Empty;
        public int ItemCount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal EstimatedCommission { get; set; }
        public decimal EstimatedPlatformFees { get; set; }
        public decimal EstimatedSellerEarnings => TotalAmount - EstimatedCommission - EstimatedPlatformFees;
    }

    public class CartSellerSummary
    {
        public int SellerUserId { get; set; }
        public string SellerName { get; set; } = string.Empty;
        public int ItemCount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal EstimatedCommission { get; set; }
        public decimal EstimatedPlatformFees { get; set; }
        public decimal EstimatedSellerEarnings => TotalAmount - EstimatedCommission - EstimatedPlatformFees;
        public List<string> ItemTitles { get; set; } = new();
    }

    public class CartCategorySummary
    {
        public string CategoryName { get; set; } = string.Empty;
        public int ItemCount { get; set; }
        public decimal TotalAmount { get; set; }
        public int StoreItems { get; set; }
        public int UserItems { get; set; }
    }

    public class CartValidationIssue
    {
        public int ItemId { get; set; }
        public string ItemTitle { get; set; } = string.Empty;
        public string IssueType { get; set; } = string.Empty; // Stock, Approval, Status, Availability
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty; // Critical, Warning, Info
        public bool CanBeResolved { get; set; }
        public string? Resolution { get; set; }
    }

    public class CartCleanupReason
    {
        public string Reason { get; set; } = string.Empty;
        public int Count { get; set; }
        public List<string> AffectedItems { get; set; } = new();
    }

    public class CartSummary
    {
        public decimal TotalAmount { get; set; }
        public int TotalQuantity { get; set; }
        public int UniqueItems { get; set; }
        public bool IsValid { get; set; }
    }
}