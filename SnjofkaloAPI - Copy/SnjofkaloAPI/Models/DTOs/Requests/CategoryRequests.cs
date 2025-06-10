using System.ComponentModel.DataAnnotations;

namespace SnjofkaloAPI.Models.DTOs.Requests
{
    public class CreateCategoryRequest
    {
        [Required]
        [StringLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        public int SortOrder { get; set; } = 0;
    }

    public class UpdateCategoryRequest : CreateCategoryRequest
    {
        public bool IsActive { get; set; } = true;
    }
}