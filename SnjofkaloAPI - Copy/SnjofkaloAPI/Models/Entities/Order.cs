using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SnjofkaloAPI.Attributes;

namespace SnjofkaloAPI.Models.Entities
{
    [Table("Order")]
    public class Order
    {
        [Key]
        public int IDOrder { get; set; }

        [Required]
        [StringLength(50)]
        public string OrderNumber { get; set; } = string.Empty;

        [Required]
        public int UserID { get; set; }

        [Required]
        public int StatusID { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        // UPDATED: Increased field sizes for encryption
        [StringLength(1500)] // Was 500
        [Encrypted]
        public string? ShippingAddress { get; set; }

        [StringLength(1500)] // Was 500
        [Encrypted]
        public string? BillingAddress { get; set; }

        [StringLength(1000)]
        public string? OrderNotes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties (unchanged)
        [ForeignKey("UserID")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("StatusID")]
        public virtual Status Status { get; set; } = null!;

        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

        [NotMapped]
        public decimal TotalAmount => OrderItems?.Sum(oi => oi.Quantity * oi.PriceAtOrder) ?? 0;
    }
}