using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SnjofkaloAPI.Models.Entities
{
    [Table("Logs")]
    public class Log
    {
        [Key]
        public long Id { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(20)]
        public string Level { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Logger { get; set; }

        [Required]
        public string Message { get; set; } = string.Empty;

        public string? Exception { get; set; }

        public int? UserID { get; set; }

        [StringLength(50)]
        public string? MachineName { get; set; }

        [ForeignKey("UserID")]
        public virtual User? User { get; set; }
    }
}