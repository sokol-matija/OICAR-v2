using SnjofkaloAPI.Models.DTOs.Common;
using SnjofkaloAPI.Models.DTOs.Requests;
using SnjofkaloAPI.Models.DTOs.Responses;

namespace SnjofkaloAPI.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<ApiResponse<List<CategoryResponse>>> GetCategoriesAsync();
        Task<ApiResponse<CategoryResponse>> GetCategoryByIdAsync(int categoryId);
        Task<ApiResponse<CategoryResponse>> CreateCategoryAsync(CreateCategoryRequest request);
        Task<ApiResponse<CategoryResponse>> UpdateCategoryAsync(int categoryId, UpdateCategoryRequest request);
        Task<ApiResponse> DeleteCategoryAsync(int categoryId);
    }
}