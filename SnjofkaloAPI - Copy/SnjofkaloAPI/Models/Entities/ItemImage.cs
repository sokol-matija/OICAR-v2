using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SnjofkaloAPI.Models.Entities
{
    [Table("ItemImage")]
    public class ItemImage
    {
        [Key]
        public int IDItemImage { get; set; }

        [Required]
        public int ItemID { get; set; }

        [Required]
        public string ImageData { get; set; } = string.Empty;

        public int ImageOrder { get; set; } = 0;

        [StringLength(255)]
        public string? FileName { get; set; }

        [StringLength(100)]
        public string? ContentType { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ItemID")]
        public virtual Item Item { get; set; } = null!;
    }
}