using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SnjofkaloAPI.Models.Entities
{
    [Table("ItemCategory")]
    public class ItemCategory
    {
        [Key]
        public int IDItemCategory { get; set; }

        [Required]
        [StringLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public int SortOrder { get; set; } = 0;

        public virtual ICollection<Item> Items { get; set; } = new List<Item>();
    }
}
