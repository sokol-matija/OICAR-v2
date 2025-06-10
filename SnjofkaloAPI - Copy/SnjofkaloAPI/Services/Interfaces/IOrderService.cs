using SnjofkaloAPI.Models.DTOs.Common;
using SnjofkaloAPI.Models.DTOs.Requests;
using SnjofkaloAPI.Models.DTOs.Responses;

namespace SnjofkaloAPI.Services.Interfaces
{
    public interface IOrderService
    {
        // Existing methods
        Task<ApiResponse<OrderResponse>> CreateOrderFromCartAsync(int userId, CreateOrderRequest request);
        Task<ApiResponse<PagedResult<OrderListResponse>>> GetOrdersAsync(int pageNumber, int pageSize);
        Task<ApiResponse<PagedResult<OrderListResponse>>> GetUserOrdersAsync(int userId, int pageNumber, int pageSize);
        Task<ApiResponse<OrderResponse>> GetOrderByIdAsync(int orderId);
        Task<ApiResponse<OrderResponse>> GetUserOrderByIdAsync(int userId, int orderId);
        Task<ApiResponse<OrderResponse>> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusRequest request);
        Task<ApiResponse<List<OrderListResponse>>> GetOrdersByStatusAsync(int statusId);
        Task<ApiResponse> CancelOrderAsync(int userId, int orderId);

        // NEW: Marketplace methods
        Task<ApiResponse<PagedResult<object>>> GetSellerOrdersAsync(int sellerId, int pageNumber, int pageSize);
        Task<ApiResponse<object>> GetOrderAnalyticsAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<ApiResponse<object>> GetSellerCommissionReportAsync(int sellerId, DateTime? fromDate = null, DateTime? toDate = null);
    }
}