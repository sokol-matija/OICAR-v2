using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SnjofkaloAPI.Models.Entities
{
    [Table("CartItem")]
    public class CartItem
    {
        [Key]
        public int IDCartItem { get; set; }

        [Required]
        public int UserID { get; set; }

        [Required]
        public int ItemID { get; set; }

        [Required]
        public int Quantity { get; set; }

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserID")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("ItemID")]
        public virtual Item Item { get; set; } = null!;
    }
}