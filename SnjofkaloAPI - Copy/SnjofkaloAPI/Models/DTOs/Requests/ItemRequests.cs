using System.ComponentModel.DataAnnotations;

namespace SnjofkaloAPI.Models.DTOs.Requests
{
    public class CreateItemRequest
    {
        [Required]
        public int ItemCategoryID { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        public bool IsFeatured { get; set; } = false;

        public List<ItemImageRequest>? Images { get; set; }
    }

    public class UpdateItemRequest : CreateItemRequest
    {
        public bool IsActive { get; set; } = true;
    }

    // UPDATED: Enhanced ItemSearchRequest with marketplace filters
    public class ItemSearchRequest
    {
        public string? Title { get; set; }
        public int? CategoryID { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public bool? IsActive { get; set; } = true;
        public bool? IsFeatured { get; set; }

        // NEW: Marketplace filters
        public int? SellerUserID { get; set; }
        public string? ItemStatus { get; set; }
        public bool? IsApproved { get; set; }
        public bool? UserItemsOnly { get; set; }
        public bool? StoreItemsOnly { get; set; }

        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SortBy { get; set; } = "Title";
        public string SortDirection { get; set; } = "asc";
    }

    // NEW: Seller item creation request
    public class CreateSellerItemRequest : CreateItemRequest
    {
        [Range(0, 1, ErrorMessage = "Commission rate must be between 0 and 100%")]
        public decimal? DesiredCommissionRate { get; set; }

        [Required(ErrorMessage = "You must agree to the terms and conditions")]
        public bool AgreeToTerms { get; set; }

        [StringLength(1000)]
        public string? SellerNotes { get; set; }

        [StringLength(500)]
        public string? SellerDescription { get; set; }
    }

    // NEW: Seller item update request
    public class UpdateSellerItemRequest : UpdateItemRequest
    {
        [StringLength(20)]
        public string? ItemStatus { get; set; }

        [StringLength(1000)]
        public string? SellerNotes { get; set; }
    }

    // NEW: Item approval request
    public class ApproveItemRequest
    {
        [StringLength(500)]
        public string? ApprovalNotes { get; set; }

        public decimal? AdjustedCommissionRate { get; set; }
        public decimal? AdjustedPlatformFee { get; set; }
    }

    // NEW: Item rejection request
    public class RejectItemRequest
    {
        [Required]
        [StringLength(500)]
        public string RejectionReason { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? AdminNotes { get; set; }

        public bool AllowResubmission { get; set; } = true;
    }

    // NEW: Bulk item operations
    public class BulkItemActionRequest
    {
        [Required]
        public List<int> ItemIds { get; set; } = new();

        [Required]
        [StringLength(20)]
        public string Action { get; set; } = string.Empty; // Approve, Reject, Activate, Deactivate

        [StringLength(500)]
        public string? Reason { get; set; }
    }
    public class ItemImageRequest
    {
        [Required]
        public string ImageData { get; set; } = string.Empty;

        public int ImageOrder { get; set; } = 0;

        [StringLength(255)]
        public string? FileName { get; set; }

        [StringLength(100)]
        public string? ContentType { get; set; }
    }

    

    

    

    
}