using SnjofkaloAPI.Models.DTOs.Requests;
using SnjofkaloAPI.Models.DTOs.Responses;
using SnjofkaloAPI.Models.DTOs.Common;

namespace SnjofkaloAPI.Services.Interfaces
{
    public interface IUserService
    {
        // Existing methods
        Task<ApiResponse<UserResponse>> GetUserByIdAsync(int userId);
        Task<ApiResponse<PagedResult<UserListResponse>>> GetUsersAsync(int pageNumber, int pageSize);
        Task<ApiResponse<UserResponse>> UpdateUserAsync(int userId, UpdateUserRequest request);
        Task<ApiResponse<UserResponse>> UpdateUserByAdminAsync(int userId, UpdateUserAdminRequest request);
        Task<ApiResponse> DeleteUserAsync(int userId);
        Task<ApiResponse<List<UserListResponse>>> GetAdminUsersAsync();

        // Existing GDPR methods
        Task<ApiResponse<object>> ExportUserDataAsync(int userId);
        Task<ApiResponse> AnonymizeUserDataAsync(int userId);

        // NEW: Enhanced GDPR methods
        Task<ApiResponse> RequestAnonymizationAsync(int userId, string reason);
        Task<ApiResponse<PagedResult<AnonymizationRequestResponse>>> GetAnonymizationRequestsAsync(int pageNumber, int pageSize);

        // NEW: Marketplace/seller methods
        Task<ApiResponse<object>> GetSellerStatisticsAsync(int userId);
    }
}