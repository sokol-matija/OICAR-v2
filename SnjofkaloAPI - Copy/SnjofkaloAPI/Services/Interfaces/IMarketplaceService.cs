using SnjofkaloAPI.Models.DTOs.Common;
using SnjofkaloAPI.Models.DTOs.Responses;

namespace SnjofkaloAPI.Services.Interfaces
{
    public interface IMarketplaceService
    {
        /// <summary>
        /// Get comprehensive marketplace analytics for admin dashboard
        /// </summary>
        Task<ApiResponse<object>> GetMarketplaceAnalyticsAsync();

        /// <summary>
        /// Get seller analytics for individual seller dashboard
        /// </summary>
        Task<ApiResponse<SellerAnalyticsResponse>> GetSellerAnalyticsAsync(int sellerId);

        /// <summary>
        /// Get platform commission report for admin
        /// </summary>
        Task<ApiResponse<object>> GetCommissionReportAsync(DateTime fromDate, DateTime toDate);
    }
}