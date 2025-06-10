using Microsoft.EntityFrameworkCore;
using AutoMapper;
using SnjofkaloAPI.Data;
using SnjofkaloAPI.Models.DTOs.Common;
using SnjofkaloAPI.Models.DTOs.Requests;
using SnjofkaloAPI.Models.DTOs.Responses;
using SnjofkaloAPI.Models.Entities;
using SnjofkaloAPI.Services.Interfaces;
using SnjofkaloAPI.Extensions;

namespace SnjofkaloAPI.Services.Implementation
{
    public class ItemService : IItemService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<ItemService> _logger;
        private readonly IDataEncryptionService _encryptionService;

        public ItemService(ApplicationDbContext context, IMapper mapper, ILogger<ItemService> logger, IDataEncryptionService encryptionService)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _encryptionService = encryptionService;
        }

        public async Task<ApiResponse<PagedResult<ItemListResponse>>> GetItemsAsync(ItemSearchRequest request)
        {
            try
            {
                var query = _context.Items
                    .Include(i => i.ItemCategory)
                    .Include(i => i.Seller)
                    .Include(i => i.Images.OrderBy(img => img.ImageOrder))
                    .Where(i => i.IsActive && i.IsApproved);

                if (!string.IsNullOrEmpty(request.Title))
                {
                    query = query.Where(i => i.Title.Contains(request.Title));
                }

                if (request.CategoryID.HasValue)
                {
                    query = query.Where(i => i.ItemCategoryID == request.CategoryID.Value);
                }

                if (request.MinPrice.HasValue)
                {
                    query = query.Where(i => i.Price >= request.MinPrice.Value);
                }

                if (request.MaxPrice.HasValue)
                {
                    query = query.Where(i => i.Price <= request.MaxPrice.Value);
                }

                if (request.IsFeatured.HasValue)
                {
                    query = query.Where(i => i.IsFeatured == request.IsFeatured.Value);
                }

                if (request.SellerUserID.HasValue)
                {
                    query = query.Where(i => i.SellerUserID == request.SellerUserID.Value);
                }

                if (!string.IsNullOrEmpty(request.ItemStatus))
                {
                    query = query.Where(i => i.ItemStatus == request.ItemStatus);
                }

                query = request.SortBy.ToLower() switch
                {
                    "price" => request.SortDirection.ToLower() == "desc"
                        ? query.OrderByDescending(i => i.Price)
                        : query.OrderBy(i => i.Price),
                    "createdat" => request.SortDirection.ToLower() == "desc"
                        ? query.OrderByDescending(i => i.CreatedAt)
                        : query.OrderBy(i => i.CreatedAt),
                    _ => request.SortDirection.ToLower() == "desc"
                        ? query.OrderByDescending(i => i.Title)
                        : query.OrderBy(i => i.Title)
                };

                var totalCount = await query.CountAsync();
                var items = await query
                    .Skip((request.PageNumber - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListDecryptedAsync(_encryptionService);

                var itemResponses = _mapper.Map<List<ItemListResponse>>(items);

                var pagedResult = new PagedResult<ItemListResponse>
                {
                    Data = itemResponses,
                    TotalCount = totalCount,
                    PageNumber = request.PageNumber,
                    PageSize = request.PageSize
                };

                return ApiResponse<PagedResult<ItemListResponse>>.SuccessResult(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting items");
                return ApiResponse<PagedResult<ItemListResponse>>.ErrorResult("An error occurred while retrieving items");
            }
        }

        public async Task<ApiResponse<ItemResponse>> GetItemByIdAsync(int itemId)
        {
            try
            {
                var item = await _context.Items
                    .Include(i => i.ItemCategory)
                    .Include(i => i.Seller)
                    .Include(i => i.ApprovedByAdmin)
                    .Include(i => i.Images.OrderBy(img => img.ImageOrder))
                    .Where(i => i.IDItem == itemId && i.IsActive && i.IsApproved)
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                if (item == null)
                {
                    return ApiResponse<ItemResponse>.ErrorResult("Item not found");
                }

                var itemResponse = _mapper.Map<ItemResponse>(item);
                return ApiResponse<ItemResponse>.SuccessResult(itemResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting item by ID {ItemId}", itemId);
                return ApiResponse<ItemResponse>.ErrorResult("An error occurred while retrieving item");
            }
        }

        public async Task<ApiResponse<ItemResponse>> CreateItemAsync(CreateItemRequest request)
        {
            try
            {
                var categoryExists = await _context.ItemCategories
                    .AnyAsync(c => c.IDItemCategory == request.ItemCategoryID && c.IsActive);

                if (!categoryExists)
                {
                    return ApiResponse<ItemResponse>.ErrorResult("Invalid category");
                }

                var item = _mapper.Map<Item>(request);
                item.CreatedAt = DateTime.UtcNow;
                item.UpdatedAt = DateTime.UtcNow;
                item.IsActive = true;
                item.IsApproved = true;
                item.ItemStatus = "Active";
                item.SellerUserID = null;

                _context.Items.Add(item);
                await _context.SaveChangesAsync();

                if (request.Images?.Any() == true)
                {
                    var images = request.Images.Select((img, index) => new ItemImage
                    {
                        ItemID = item.IDItem,
                        ImageData = img.ImageData,
                        ImageOrder = img.ImageOrder > 0 ? img.ImageOrder : index,
                        FileName = img.FileName,
                        ContentType = img.ContentType,
                        CreatedAt = DateTime.UtcNow
                    }).ToList();

                    _context.ItemImages.AddRange(images);
                    await _context.SaveChangesAsync();
                }

                var createdItem = await _context.Items
                    .Include(i => i.ItemCategory)
                    .Include(i => i.Images.OrderBy(img => img.ImageOrder))
                    .FirstOrDefaultAsync(i => i.IDItem == item.IDItem);

                _encryptionService.DecryptEntity(createdItem);
                var itemResponse = _mapper.Map<ItemResponse>(createdItem);

                _logger.LogInformation("Admin item {ItemId} created successfully with {ImageCount} images",
                    item.IDItem, request.Images?.Count ?? 0);

                return ApiResponse<ItemResponse>.SuccessResult(itemResponse, "Item created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating item");
                return ApiResponse<ItemResponse>.ErrorResult("An error occurred while creating item");
            }
        }

        public async Task<ApiResponse<ItemResponse>> CreateSellerItemAsync(int sellerId, CreateSellerItemRequest request)
        {
            try
            {
                var categoryExists = await _context.ItemCategories
                    .AnyAsync(c => c.IDItemCategory == request.ItemCategoryID && c.IsActive);

                if (!categoryExists)
                {
                    return ApiResponse<ItemResponse>.ErrorResult("Invalid category");
                }

                var item = _mapper.Map<Item>(request);
                item.SellerUserID = sellerId;
                item.CreatedAt = DateTime.UtcNow;
                item.UpdatedAt = DateTime.UtcNow;
                item.IsActive = true;
                item.IsApproved = false;
                item.ItemStatus = "Pending";
                item.CommissionRate = request.DesiredCommissionRate ?? 0.05m;
                item.PlatformFee = 2.50m;

                _context.Items.Add(item);
                await _context.SaveChangesAsync();

                if (request.Images?.Any() == true)
                {
                    var images = request.Images.Select((img, index) => new ItemImage
                    {
                        ItemID = item.IDItem,
                        ImageData = img.ImageData,
                        ImageOrder = img.ImageOrder > 0 ? img.ImageOrder : index,
                        FileName = img.FileName,
                        ContentType = img.ContentType,
                        CreatedAt = DateTime.UtcNow
                    }).ToList();

                    _context.ItemImages.AddRange(images);
                    await _context.SaveChangesAsync();
                }

                var createdItem = await _context.Items
                    .Include(i => i.ItemCategory)
                    .Include(i => i.Seller)
                    .Include(i => i.Images.OrderBy(img => img.ImageOrder))
                    .FirstOrDefaultAsync(i => i.IDItem == item.IDItem);

                _encryptionService.DecryptEntity(createdItem);
                var itemResponse = _mapper.Map<ItemResponse>(createdItem);

                _logger.LogInformation("Seller item {ItemId} created by user {SellerId} with {ImageCount} images, pending approval",
                    item.IDItem, sellerId, request.Images?.Count ?? 0);

                return ApiResponse<ItemResponse>.SuccessResult(itemResponse, "Item submitted for approval");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating seller item for user {SellerId}", sellerId);
                return ApiResponse<ItemResponse>.ErrorResult("An error occurred while creating item");
            }
        }

        public async Task<ApiResponse<ItemResponse>> UpdateItemAsync(int itemId, UpdateItemRequest request)
        {
            try
            {
                var item = await _context.Items
                    .Include(i => i.ItemCategory)
                    .Include(i => i.Seller)
                    .Include(i => i.Images)
                    .FirstOrDefaultAsync(i => i.IDItem == itemId);

                if (item == null)
                {
                    return ApiResponse<ItemResponse>.ErrorResult("Item not found");
                }

                var categoryExists = await _context.ItemCategories
                    .AnyAsync(c => c.IDItemCategory == request.ItemCategoryID && c.IsActive);

                if (!categoryExists)
                {
                    return ApiResponse<ItemResponse>.ErrorResult("Invalid category");
                }

                _encryptionService.DecryptEntity(item);

                _mapper.Map(request, item);
                item.UpdatedAt = DateTime.UtcNow;

                if (request.Images != null)
                {
                    _context.ItemImages.RemoveRange(item.Images);

                    var newImages = request.Images.Select((img, index) => new ItemImage
                    {
                        ItemID = item.IDItem,
                        ImageData = img.ImageData,
                        ImageOrder = img.ImageOrder > 0 ? img.ImageOrder : index,
                        FileName = img.FileName,
                        ContentType = img.ContentType,
                        CreatedAt = DateTime.UtcNow
                    }).ToList();

                    _context.ItemImages.AddRange(newImages);
                }

                await _context.SaveChangesAsync();

                await _context.Entry(item)
                    .Collection(i => i.Images)
                    .LoadAsync();

                _encryptionService.DecryptEntity(item);
                var itemResponse = _mapper.Map<ItemResponse>(item);

                _logger.LogInformation("Item {ItemId} updated successfully", itemId);

                return ApiResponse<ItemResponse>.SuccessResult(itemResponse, "Item updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating item {ItemId}", itemId);
                return ApiResponse<ItemResponse>.ErrorResult("An error occurred while updating item");
            }
        }

        public async Task<ApiResponse<List<ItemListResponse>>> GetFeaturedItemsAsync()
        {
            try
            {
                var featuredItems = await _context.Items
                    .Include(i => i.ItemCategory)
                    .Include(i => i.Seller)
                    .Include(i => i.Images.OrderBy(img => img.ImageOrder))
                    .Where(i => i.IsFeatured && i.IsActive && i.IsApproved)
                    .OrderBy(i => i.Title)
                    .ToListDecryptedAsync(_encryptionService);

                var itemResponses = _mapper.Map<List<ItemListResponse>>(featuredItems);
                return ApiResponse<List<ItemListResponse>>.SuccessResult(itemResponses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured items");
                return ApiResponse<List<ItemListResponse>>.ErrorResult("An error occurred while retrieving featured items");
            }
        }

        public async Task<ApiResponse<List<ItemListResponse>>> GetItemsByCategoryAsync(int categoryId)
        {
            try
            {
                var items = await _context.Items
                    .Include(i => i.ItemCategory)
                    .Include(i => i.Seller)
                    .Include(i => i.Images.OrderBy(img => img.ImageOrder))
                    .Where(i => i.ItemCategoryID == categoryId && i.IsActive && i.IsApproved)
                    .OrderBy(i => i.Title)
                    .ToListDecryptedAsync(_encryptionService);

                var itemResponses = _mapper.Map<List<ItemListResponse>>(items);
                return ApiResponse<List<ItemListResponse>>.SuccessResult(itemResponses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting items by category {CategoryId}", categoryId);
                return ApiResponse<List<ItemListResponse>>.ErrorResult("An error occurred while retrieving items by category");
            }
        }

        public async Task<ApiResponse> DeleteItemAsync(int itemId)
        {
            try
            {
                var item = await _context.Items.FindAsync(itemId);
                if (item == null)
                {
                    return ApiResponse.ErrorResult("Item not found");
                }

                _encryptionService.DecryptEntity(item);

                item.IsActive = false;
                item.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Item {ItemId} soft deleted", itemId);
                return ApiResponse.SuccessResult("Item deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting item {ItemId}", itemId);
                return ApiResponse.ErrorResult("An error occurred while deleting item");
            }
        }

        public async Task<ApiResponse> UpdateStockAsync(int itemId, int quantity)
        {
            try
            {
                var item = await _context.Items.FindAsync(itemId);
                if (item == null || !item.IsActive)
                {
                    return ApiResponse.ErrorResult("Item not found");
                }

                _encryptionService.DecryptEntity(item);

                item.StockQuantity = quantity;
                item.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Stock updated for item {ItemId}: {Quantity}", itemId, quantity);
                return ApiResponse.SuccessResult("Stock updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stock for item {ItemId}", itemId);
                return ApiResponse.ErrorResult("An error occurred while updating stock");
            }
        }

        public async Task<ApiResponse<bool>> CheckStockAsync(int itemId, int requestedQuantity)
        {
            try
            {
                var item = await _context.Items.FindAsync(itemId);
                if (item == null || !item.IsActive)
                {
                    return ApiResponse<bool>.ErrorResult("Item not found");
                }

                var hasStock = item.StockQuantity >= requestedQuantity;
                return ApiResponse<bool>.SuccessResult(hasStock);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking stock for item {ItemId}", itemId);
                return ApiResponse<bool>.ErrorResult("An error occurred while checking stock");
            }
        }

        public async Task<ApiResponse<PagedResult<ItemListResponse>>> GetItemsBySellerAsync(int sellerId, int pageNumber, int pageSize)
        {
            try
            {
                var query = _context.Items
                    .Include(i => i.ItemCategory)
                    .Include(i => i.Seller)
                    .Include(i => i.Images.OrderBy(img => img.ImageOrder))
                    .Where(i => i.SellerUserID == sellerId)
                    .OrderByDescending(i => i.CreatedAt);

                var totalCount = await query.CountAsync();
                var items = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListDecryptedAsync(_encryptionService);

                var itemResponses = _mapper.Map<List<ItemListResponse>>(items);

                var pagedResult = new PagedResult<ItemListResponse>
                {
                    Data = itemResponses,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };

                return ApiResponse<PagedResult<ItemListResponse>>.SuccessResult(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting items for seller {SellerId}", sellerId);
                return ApiResponse<PagedResult<ItemListResponse>>.ErrorResult("An error occurred while retrieving seller items");
            }
        }

        public async Task<ApiResponse<PagedResult<ItemListResponse>>> GetPendingApprovalItemsAsync(int pageNumber, int pageSize)
        {
            try
            {
                var query = _context.Items
                    .Include(i => i.ItemCategory)
                    .Include(i => i.Seller)
                    .Include(i => i.Images.OrderBy(img => img.ImageOrder))
                    .Where(i => !i.IsApproved && i.ItemStatus == "Pending")
                    .OrderBy(i => i.CreatedAt);

                var totalCount = await query.CountAsync();
                var items = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListDecryptedAsync(_encryptionService);

                var itemResponses = _mapper.Map<List<ItemListResponse>>(items);

                var pagedResult = new PagedResult<ItemListResponse>
                {
                    Data = itemResponses,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };

                return ApiResponse<PagedResult<ItemListResponse>>.SuccessResult(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending approval items");
                return ApiResponse<PagedResult<ItemListResponse>>.ErrorResult("An error occurred while retrieving pending items");
            }
        }

        public async Task<ApiResponse<ItemResponse>> ApproveItemAsync(int itemId, int adminId)
        {
            try
            {
                var item = await _context.Items
                    .Include(i => i.ItemCategory)
                    .Include(i => i.Seller)
                    .Include(i => i.Images.OrderBy(img => img.ImageOrder))
                    .FirstOrDefaultAsync(i => i.IDItem == itemId);

                if (item == null)
                {
                    return ApiResponse<ItemResponse>.ErrorResult("Item not found");
                }

                _encryptionService.DecryptEntity(item);

                if (item.IsApproved)
                {
                    return ApiResponse<ItemResponse>.ErrorResult("Item is already approved");
                }

                item.IsApproved = true;
                item.ApprovedByAdminID = adminId;
                item.ApprovalDate = DateTime.UtcNow;
                item.ItemStatus = "Active";
                item.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _encryptionService.DecryptEntity(item);
                var itemResponse = _mapper.Map<ItemResponse>(item);
                _logger.LogInformation("Item {ItemId} approved by admin {AdminId}", itemId, adminId);

                return ApiResponse<ItemResponse>.SuccessResult(itemResponse, "Item approved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving item {ItemId}", itemId);
                return ApiResponse<ItemResponse>.ErrorResult("An error occurred while approving item");
            }
        }

        public async Task<ApiResponse> RejectItemAsync(int itemId, string rejectionReason)
        {
            try
            {
                var item = await _context.Items.FirstOrDefaultAsync(i => i.IDItem == itemId);
                if (item == null)
                {
                    return ApiResponse.ErrorResult("Item not found");
                }

                _encryptionService.DecryptEntity(item);

                item.IsApproved = false;
                item.ItemStatus = "Rejected";
                item.RejectionReason = rejectionReason;
                item.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Item {ItemId} rejected: {Reason}", itemId, rejectionReason);
                return ApiResponse.SuccessResult("Item rejected");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting item {ItemId}", itemId);
                return ApiResponse.ErrorResult("An error occurred while rejecting item");
            }
        }

        public async Task<ApiResponse<bool>> CanUserSellItemsAsync(int userId)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.IDUser == userId)
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                if (user == null)
                {
                    return ApiResponse<bool>.ErrorResult("User not found");
                }

                var canSell = !user.RequestedAnonymization;

                return ApiResponse<bool>.SuccessResult(canSell);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user {UserId} can sell", userId);
                return ApiResponse<bool>.ErrorResult("An error occurred while checking sell permissions");
            }
        }
    }
}