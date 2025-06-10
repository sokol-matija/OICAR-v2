using Microsoft.EntityFrameworkCore;
using AutoMapper;
using SnjofkaloAPI.Data;
using SnjofkaloAPI.Models.DTOs.Common;
using SnjofkaloAPI.Models.DTOs.Requests;
using SnjofkaloAPI.Models.DTOs.Responses;
using SnjofkaloAPI.Models.Entities;
using SnjofkaloAPI.Services.Interfaces;

namespace SnjofkaloAPI.Services.Implementation
{
    public class CategoryService : ICategoryService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<CategoryService> _logger;

        public CategoryService(ApplicationDbContext context, IMapper mapper, ILogger<CategoryService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<ApiResponse<List<CategoryResponse>>> GetCategoriesAsync()
        {
            try
            {
                var categories = await _context.ItemCategories
                    .Include(c => c.Items.Where(i => i.IsActive))
                    .Where(c => c.IsActive)
                    .OrderBy(c => c.SortOrder)
                    .ThenBy(c => c.CategoryName)
                    .ToListAsync();

                var categoryResponses = _mapper.Map<List<CategoryResponse>>(categories);
                return ApiResponse<List<CategoryResponse>>.SuccessResult(categoryResponses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting categories");
                return ApiResponse<List<CategoryResponse>>.ErrorResult("An error occurred while retrieving categories");
            }
        }

        public async Task<ApiResponse<CategoryResponse>> GetCategoryByIdAsync(int categoryId)
        {
            try
            {
                var category = await _context.ItemCategories
                    .Include(c => c.Items.Where(i => i.IsActive))
                    .FirstOrDefaultAsync(c => c.IDItemCategory == categoryId && c.IsActive);

                if (category == null)
                {
                    return ApiResponse<CategoryResponse>.ErrorResult("Category not found");
                }

                var categoryResponse = _mapper.Map<CategoryResponse>(category);
                return ApiResponse<CategoryResponse>.SuccessResult(categoryResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category by ID {CategoryId}", categoryId);
                return ApiResponse<CategoryResponse>.ErrorResult("An error occurred while retrieving category");
            }
        }

        public async Task<ApiResponse<CategoryResponse>> CreateCategoryAsync(CreateCategoryRequest request)
        {
            try
            {
                var existingCategory = await _context.ItemCategories
                    .FirstOrDefaultAsync(c => c.CategoryName == request.CategoryName && c.IsActive);

                if (existingCategory != null)
                {
                    return ApiResponse<CategoryResponse>.ErrorResult("Category name already exists");
                }

                var category = _mapper.Map<ItemCategory>(request);
                category.IsActive = true;

                _context.ItemCategories.Add(category);
                await _context.SaveChangesAsync();

                var categoryResponse = _mapper.Map<CategoryResponse>(category);
                _logger.LogInformation("Category {CategoryId} created successfully", category.IDItemCategory);

                return ApiResponse<CategoryResponse>.SuccessResult(categoryResponse, "Category created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category");
                return ApiResponse<CategoryResponse>.ErrorResult("An error occurred while creating category");
            }
        }

        public async Task<ApiResponse<CategoryResponse>> UpdateCategoryAsync(int categoryId, UpdateCategoryRequest request)
        {
            try
            {
                var category = await _context.ItemCategories
                    .Include(c => c.Items.Where(i => i.IsActive))
                    .FirstOrDefaultAsync(c => c.IDItemCategory == categoryId);

                if (category == null)
                {
                    return ApiResponse<CategoryResponse>.ErrorResult("Category not found");
                }

                var existingCategory = await _context.ItemCategories
                    .FirstOrDefaultAsync(c => c.CategoryName == request.CategoryName &&
                                            c.IDItemCategory != categoryId && c.IsActive);

                if (existingCategory != null)
                {
                    return ApiResponse<CategoryResponse>.ErrorResult("Category name already exists");
                }

                _mapper.Map(request, category);
                await _context.SaveChangesAsync();

                var categoryResponse = _mapper.Map<CategoryResponse>(category);
                _logger.LogInformation("Category {CategoryId} updated successfully", categoryId);

                return ApiResponse<CategoryResponse>.SuccessResult(categoryResponse, "Category updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category {CategoryId}", categoryId);
                return ApiResponse<CategoryResponse>.ErrorResult("An error occurred while updating category");
            }
        }

        public async Task<ApiResponse> DeleteCategoryAsync(int categoryId)
        {
            try
            {
                var category = await _context.ItemCategories
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.IDItemCategory == categoryId);

                if (category == null)
                {
                    return ApiResponse.ErrorResult("Category not found");
                }

                var hasActiveItems = category.Items.Any(i => i.IsActive);
                if (hasActiveItems)
                {
                    return ApiResponse.ErrorResult("Cannot delete category with active items");
                }

                // Soft delete
                category.IsActive = false;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Category {CategoryId} soft deleted", categoryId);
                return ApiResponse.SuccessResult("Category deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category {CategoryId}", categoryId);
                return ApiResponse.ErrorResult("An error occurred while deleting category");
            }
        }
    }
}