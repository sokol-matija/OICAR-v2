using System.ComponentModel.DataAnnotations;

namespace SnjofkaloAPI.Models.DTOs.Requests
{
	public class AddToCartRequest
	{
		[Required]
		public int ItemID { get; set; }

		[Required]
		[Range(1, int.MaxValue)]
		public int Quantity { get; set; }
	}

	public class UpdateCartItemRequest
	{
		[Required]
		[Range(1, int.MaxValue)]
		public int Quantity { get; set; }
	}
}