using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SnjofkaloAPI.Models.Entities;

namespace SnjofkaloAPI.Models.Entities
{
    [Table("Status")]
    public class Status
    {
        [Key]
        public int IDStatus { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
