using System.ComponentModel.DataAnnotations;

namespace SnjofkaloAPI.Models.DTOs.Requests
{
    public class CreateOrderRequest
    {
        [StringLength(1500)] // Increased for encryption
        public string? ShippingAddress { get; set; }

        [StringLength(1500)] // Increased for encryption
        public string? BillingAddress { get; set; }

        [StringLength(1000)]
        public string? OrderNotes { get; set; }
    }

    public class UpdateOrderStatusRequest
    {
        [Required]
        public int StatusID { get; set; }

        [StringLength(500)]
        public string? StatusChangeReason { get; set; }

        [StringLength(1000)]
        public string? AdminNotes { get; set; }
    }

    // NEW: Order search/filter request
    public class OrderSearchRequest
    {
        public string? OrderNumber { get; set; }
        public int? UserID { get; set; }
        public int? StatusID { get; set; }
        public DateTime? OrderDateFrom { get; set; }
        public DateTime? OrderDateTo { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public bool? ContainsUserItems { get; set; }
        public int? SellerUserID { get; set; }

        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SortBy { get; set; } = "OrderDate";
        public string SortDirection { get; set; } = "desc";
    }

    // NEW: Order analytics request
    public class OrderAnalyticsRequest
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? GroupBy { get; set; } = "Day"; // Day, Week, Month, Year
        public bool IncludeMarketplaceBreakdown { get; set; } = true;
        public bool IncludeSellerBreakdown { get; set; } = false;
        public int? SellerUserID { get; set; }
    }

    // NEW: Commission report request
    public class CommissionReportRequest
    {
        [Required]
        public DateTime FromDate { get; set; }

        [Required]
        public DateTime ToDate { get; set; }

        public int? SellerUserID { get; set; }
        public bool IncludeSellerBreakdown { get; set; } = true;
        public bool IncludeItemBreakdown { get; set; } = false;
        public string? ReportFormat { get; set; } = "Summary"; // Summary, Detailed, CSV
    }

    // NEW: Bulk order operations
    public class BulkOrderActionRequest
    {
        [Required]
        public List<int> OrderIds { get; set; } = new();

        [Required]
        public int NewStatusID { get; set; }

        [StringLength(500)]
        public string? Reason { get; set; }

        [StringLength(1000)]
        public string? AdminNotes { get; set; }
    }
}