using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SnjofkaloAPI.Attributes;

namespace SnjofkaloAPI.Models.Entities
{
    [Table("User")]
    public class User
    {
        [Key]
        public int IDUser { get; set; }

        // UPDATED: Increased field sizes for encryption
        [Required]
        [StringLength(200)] // Was 50
        [Encrypted]
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(200)] // Was 100
        [Encrypted]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(200)] // Was 100
        [Encrypted]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        [Encrypted]
        public string Email { get; set; } = string.Empty;

        [StringLength(100)]
        [Encrypted]
        public string? PhoneNumber { get; set; }

        public bool IsAdmin { get; set; } = false;

        [Required]
        public byte[] PasswordSalt { get; set; } = Array.Empty<byte>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
        public int FailedLoginAttempts { get; set; } = 0;

        // NEW: GDPR Anonymization Fields
        public bool RequestedAnonymization { get; set; } = false;
        public DateTime? AnonymizationRequestDate { get; set; }

        [StringLength(1000)]
        public string? AnonymizationReason { get; set; }

        [StringLength(1000)]
        public string? AnonymizationNotes { get; set; }

        // Existing navigation properties
        public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<Log> Logs { get; set; } = new List<Log>();

        // NEW: Marketplace navigation properties
        public virtual ICollection<Item> SellerItems { get; set; } = new List<Item>();
        public virtual ICollection<Item> ApprovedItems { get; set; } = new List<Item>();
    }
}