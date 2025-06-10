using SnjofkaloAPI.Models.DTOs.Common;
using SnjofkaloAPI.Models.DTOs.Requests;
using SnjofkaloAPI.Models.DTOs.Responses;

namespace SnjofkaloAPI.Services.Interfaces
{
    public interface ICartService
    {
        // Existing methods
        Task<ApiResponse<CartResponse>> GetCartAsync(int userId);
        Task<ApiResponse<CartItemResponse>> AddToCartAsync(int userId, AddToCartRequest request);
        Task<ApiResponse<CartItemResponse>> UpdateCartItemAsync(int userId, int itemId, UpdateCartItemRequest request);
        Task<ApiResponse> RemoveFromCartAsync(int userId, int itemId);
        Task<ApiResponse> ClearCartAsync(int userId);
        Task<ApiResponse<int>> GetCartItemCountAsync(int userId);
        Task<ApiResponse<decimal>> GetCartTotalAsync(int userId);

        // NEW: Enhanced marketplace methods
        Task<ApiResponse<object>> GetCartSummaryAsync(int userId);
        Task<ApiResponse<object>> ValidateCartAsync(int userId);
        Task<ApiResponse<object>> CleanupCartAsync(int userId);
    }
}