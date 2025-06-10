using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SnjofkaloAPI.Models.Entities
{
    [Table("Item")]
    public class Item
    {
        [Key]
        public int IDItem { get; set; }

        [Required]
        public int ItemCategoryID { get; set; }

        public int? SellerUserID { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public int StockQuantity { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsFeatured { get; set; } = false;

        public bool IsApproved { get; set; } = true;
        public int? ApprovedByAdminID { get; set; }
        public DateTime? ApprovalDate { get; set; }

        [StringLength(500)]
        public string? RejectionReason { get; set; }

        [StringLength(20)]
        public string ItemStatus { get; set; } = "Active";

        [Column(TypeName = "decimal(5,4)")]
        public decimal? CommissionRate { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? PlatformFee { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ItemCategoryID")]
        public virtual ItemCategory ItemCategory { get; set; } = null!;

        public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public virtual ICollection<ItemImage> Images { get; set; } = new List<ItemImage>();

        [ForeignKey("SellerUserID")]
        public virtual User? Seller { get; set; }

        [ForeignKey("ApprovedByAdminID")]
        public virtual User? ApprovedByAdmin { get; set; }
    }
}