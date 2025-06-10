using System.ComponentModel.DataAnnotations;

namespace SnjofkaloAPI.Models.DTOs.Requests
{
    public class UpdateUserRequest
    {
        [Required]
        [StringLength(200)] // Increased for encryption
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(200)] // Increased for encryption
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(200)] // Increased for encryption
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(500)] // Increased for encryption
        public string Email { get; set; } = string.Empty;

        [Phone]
        [StringLength(100)] // Increased for encryption
        public string? PhoneNumber { get; set; }
    }

    public class UpdateUserAdminRequest : UpdateUserRequest
    {
        public bool IsAdmin { get; set; }
    }

    // NEW: GDPR anonymization request
    public class AnonymizationRequest
    {
        [Required]
        [StringLength(1000)]
        public string Reason { get; set; } = string.Empty;

        [Required]
        public bool ConfirmRequest { get; set; }

        [StringLength(500)]
        public string? AdditionalDetails { get; set; }
    }

    // NEW: Process anonymization request (admin)
    public class ProcessAnonymizationRequest
    {
        [Required]
        public bool Approve { get; set; }

        [StringLength(1000)]
        public string? AdminNotes { get; set; }

        [StringLength(500)]
        public string? RejectionReason { get; set; }
    }

    // NEW: User search/filter request
    public class UserSearchRequest
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public bool? IsAdmin { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsSeller { get; set; }
        public bool? HasAnonymizationRequest { get; set; }
        public DateTime? CreatedAfter { get; set; }
        public DateTime? CreatedBefore { get; set; }
        public DateTime? LastLoginAfter { get; set; }
        public DateTime? LastLoginBefore { get; set; }

        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SortBy { get; set; } = "Username";
        public string SortDirection { get; set; } = "asc";
    }

    // NEW: Bulk user operations
    public class BulkUserActionRequest
    {
        [Required]
        public List<int> UserIds { get; set; } = new();

        [Required]
        [StringLength(20)]
        public string Action { get; set; } = string.Empty; // Activate, Deactivate, ProcessAnonymization

        [StringLength(500)]
        public string? Reason { get; set; }
    }
}