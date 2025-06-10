using SnjofkaloAPI.Models.DTOs.Common;
using SnjofkaloAPI.Models.DTOs.Requests;
using SnjofkaloAPI.Models.DTOs.Responses;

namespace SnjofkaloAPI.Services.Interfaces
{
    public interface IItemService
    {
        // Existing methods
        Task<ApiResponse<PagedResult<ItemListResponse>>> GetItemsAsync(ItemSearchRequest request);
        Task<ApiResponse<ItemResponse>> GetItemByIdAsync(int itemId);
        Task<ApiResponse<List<ItemListResponse>>> GetFeaturedItemsAsync();
        Task<ApiResponse<List<ItemListResponse>>> GetItemsByCategoryAsync(int categoryId);
        Task<ApiResponse<ItemResponse>> CreateItemAsync(CreateItemRequest request);
        Task<ApiResponse<ItemResponse>> UpdateItemAsync(int itemId, UpdateItemRequest request);
        Task<ApiResponse> DeleteItemAsync(int itemId);
        Task<ApiResponse> UpdateStockAsync(int itemId, int quantity);
        Task<ApiResponse<bool>> CheckStockAsync(int itemId, int requestedQuantity);

        // NEW: Marketplace methods
        Task<ApiResponse<PagedResult<ItemListResponse>>> GetItemsBySellerAsync(int sellerId, int pageNumber, int pageSize);
        Task<ApiResponse<PagedResult<ItemListResponse>>> GetPendingApprovalItemsAsync(int pageNumber, int pageSize);
        Task<ApiResponse<ItemResponse>> CreateSellerItemAsync(int sellerId, CreateSellerItemRequest request);
        Task<ApiResponse<ItemResponse>> ApproveItemAsync(int itemId, int adminId);
        Task<ApiResponse> RejectItemAsync(int itemId, string rejectionReason);
        Task<ApiResponse<bool>> CanUserSellItemsAsync(int userId);
    }
}