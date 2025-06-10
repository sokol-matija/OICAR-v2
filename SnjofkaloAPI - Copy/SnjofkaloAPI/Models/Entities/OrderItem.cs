using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SnjofkaloAPI.Models.Entities
{
    [Table("OrderItem")]
    public class OrderItem
    {
        [Key]
        public int IDOrderItem { get; set; }

        [Required]
        public int OrderID { get; set; }

        [Required]
        public int ItemID { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal PriceAtOrder { get; set; }

        [Required]
        [StringLength(200)]
        public string ItemTitle { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("OrderID")]
        public virtual Order Order { get; set; } = null!;

        [ForeignKey("ItemID")]
        public virtual Item Item { get; set; } = null!;
    }
}