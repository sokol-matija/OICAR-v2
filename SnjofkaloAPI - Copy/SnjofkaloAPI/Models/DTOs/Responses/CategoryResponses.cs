namespace SnjofkaloAPI.Models.DTOs.Responses
{
	public class CategoryResponse
	{
		public int IDItemCategory { get; set; }
		public string CategoryName { get; set; } = string.Empty;
		public string? Description { get; set; }
		public bool IsActive { get; set; }
		public int SortOrder { get; set; }
		public int ItemCount { get; set; }
	}
}