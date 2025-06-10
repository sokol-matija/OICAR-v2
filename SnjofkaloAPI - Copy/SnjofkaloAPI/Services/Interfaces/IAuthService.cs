using SnjofkaloAPI.Models.DTOs.Requests;
using SnjofkaloAPI.Models.DTOs.Responses;
using SnjofkaloAPI.Models.DTOs.Common;

namespace SnjofkaloAPI.Services.Interfaces
{
    public interface IAuthService
    {
        Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request);
        Task<ApiResponse<LoginResponse>> RegisterAsync(RegisterRequest request);
        Task<ApiResponse<LoginResponse>> RefreshTokenAsync(RefreshTokenRequest request);
        Task<ApiResponse> ChangePasswordAsync(int userId, ChangePasswordRequest request);
        Task<ApiResponse> LogoutAsync(int userId);
    }
}