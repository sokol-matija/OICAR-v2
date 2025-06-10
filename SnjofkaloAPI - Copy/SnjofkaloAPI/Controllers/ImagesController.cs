using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SnjofkaloAPI.Data;
using SnjofkaloAPI.Models.DTOs.Requests;
using SnjofkaloAPI.Models.DTOs.Responses;
using SnjofkaloAPI.Models.Entities;
using SnjofkaloAPI.Services.Interfaces;
using SnjofkaloAPI.Extensions;
using System.Security.Claims;

namespace SnjofkaloAPI.Controllers
{
    [ApiController]
    [Route("api/items/{itemId}/images")]
    [Authorize]
    public class ItemImagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDataEncryptionService _encryptionService;
        private readonly ILogger<ItemImagesController> _logger;

        public ItemImagesController(
            ApplicationDbContext context,
            IDataEncryptionService encryptionService,
            ILogger<ItemImagesController> logger)
        {
            _context = context;
            _encryptionService = encryptionService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }

        /// <summary>
        /// Get all images for an item
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetItemImages(int itemId)
        {
            try
            {
                var images = await _context.ItemImages
                    .Where(i => i.ItemID == itemId)
                    .OrderBy(i => i.ImageOrder)
                    .Select(i => new ItemImageResponse
                    {
                        IDItemImage = i.IDItemImage,
                        ImageData = i.ImageData,
                        ImageOrder = i.ImageOrder,
                        FileName = i.FileName,
                        ContentType = i.ContentType,
                        CreatedAt = i.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new { Success = true, Data = images });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting images for item {ItemId}", itemId);
                return BadRequest(new { Success = false, Message = "Error retrieving item images" });
            }
        }

        /// <summary>
        /// Add image to item
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> AddItemImage(int itemId, [FromBody] ItemImageRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var item = await _context.Items
                    .Where(i => i.IDItem == itemId)
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                if (item == null)
                {
                    return NotFound(new { Success = false, Message = "Item not found" });
                }

                var userId = GetCurrentUserId();
                var isAdmin = User.HasClaim("IsAdmin", "true");

                // Check permissions
                if (!isAdmin && item.SellerUserID != userId)
                {
                    return Forbid("You can only add images to your own items");
                }

                var image = new ItemImage
                {
                    ItemID = itemId,
                    ImageData = request.ImageData,
                    ImageOrder = request.ImageOrder,
                    FileName = request.FileName,
                    ContentType = request.ContentType,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ItemImages.Add(image);
                await _context.SaveChangesAsync();

                var response = new ItemImageResponse
                {
                    IDItemImage = image.IDItemImage,
                    ImageData = image.ImageData,
                    ImageOrder = image.ImageOrder,
                    FileName = image.FileName,
                    ContentType = image.ContentType,
                    CreatedAt = image.CreatedAt
                };

                _logger.LogInformation("Image added to item {ItemId} by user {UserId}", itemId, userId);
                return Ok(new { Success = true, Data = response, Message = "Image added successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding image to item {ItemId}", itemId);
                return BadRequest(new { Success = false, Message = "Error adding image" });
            }
        }

        /// <summary>
        /// Update image order
        /// </summary>
        [HttpPut("{imageId}/order")]
        public async Task<IActionResult> UpdateImageOrder(int itemId, int imageId, [FromBody] int newOrder)
        {
            try
            {
                var image = await _context.ItemImages
                    .Include(i => i.Item)
                    .FirstOrDefaultAsync(i => i.IDItemImage == imageId && i.ItemID == itemId);

                if (image == null)
                {
                    return NotFound(new { Success = false, Message = "Image not found" });
                }

                var userId = GetCurrentUserId();
                var isAdmin = User.HasClaim("IsAdmin", "true");

                // Decrypt item to check ownership
                _encryptionService.DecryptEntity(image.Item);

                if (!isAdmin && image.Item.SellerUserID != userId)
                {
                    return Forbid("You can only modify your own item images");
                }

                image.ImageOrder = newOrder;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Image {ImageId} order updated to {Order} for item {ItemId}", imageId, newOrder, itemId);
                return Ok(new { Success = true, Message = "Image order updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating image order for image {ImageId}", imageId);
                return BadRequest(new { Success = false, Message = "Error updating image order" });
            }
        }

        /// <summary>
        /// Delete item image
        /// </summary>
        [HttpDelete("{imageId}")]
        public async Task<IActionResult> DeleteItemImage(int itemId, int imageId)
        {
            try
            {
                var image = await _context.ItemImages
                    .Include(i => i.Item)
                    .FirstOrDefaultAsync(i => i.IDItemImage == imageId && i.ItemID == itemId);

                if (image == null)
                {
                    return NotFound(new { Success = false, Message = "Image not found" });
                }

                var userId = GetCurrentUserId();
                var isAdmin = User.HasClaim("IsAdmin", "true");

                // Decrypt item to check ownership
                _encryptionService.DecryptEntity(image.Item);

                if (!isAdmin && image.Item.SellerUserID != userId)
                {
                    return Forbid("You can only delete your own item images");
                }

                _context.ItemImages.Remove(image);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Image {ImageId} deleted from item {ItemId} by user {UserId}", imageId, itemId, userId);
                return Ok(new { Success = true, Message = "Image deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image {ImageId}", imageId);
                return BadRequest(new { Success = false, Message = "Error deleting image" });
            }
        }

        /// <summary>
        /// Bulk add images to item
        /// </summary>
        [HttpPost("bulk")]
        public async Task<IActionResult> BulkAddImages(int itemId, [FromBody] List<ItemImageRequest> requests)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var item = await _context.Items
                    .Where(i => i.IDItem == itemId)
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                if (item == null)
                {
                    return NotFound(new { Success = false, Message = "Item not found" });
                }

                var userId = GetCurrentUserId();
                var isAdmin = User.HasClaim("IsAdmin", "true");

                if (!isAdmin && item.SellerUserID != userId)
                {
                    return Forbid("You can only add images to your own items");
                }

                var images = requests.Select((request, index) => new ItemImage
                {
                    ItemID = itemId,
                    ImageData = request.ImageData,
                    ImageOrder = request.ImageOrder > 0 ? request.ImageOrder : index,
                    FileName = request.FileName,
                    ContentType = request.ContentType,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                _context.ItemImages.AddRange(images);
                await _context.SaveChangesAsync();

                var responses = images.Select(img => new ItemImageResponse
                {
                    IDItemImage = img.IDItemImage,
                    ImageData = img.ImageData,
                    ImageOrder = img.ImageOrder,
                    FileName = img.FileName,
                    ContentType = img.ContentType,
                    CreatedAt = img.CreatedAt
                }).ToList();

                _logger.LogInformation("{ImageCount} images added to item {ItemId} by user {UserId}",
                    images.Count, itemId, userId);

                return Ok(new
                {
                    Success = true,
                    Data = responses,
                    Message = $"{images.Count} images added successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk adding images to item {ItemId}", itemId);
                return BadRequest(new { Success = false, Message = "Error adding images" });
            }
        }

        /// <summary>
        /// Replace all images for an item
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> ReplaceAllImages(int itemId, [FromBody] List<ItemImageRequest> requests)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var item = await _context.Items
                    .Include(i => i.Images)
                    .Where(i => i.IDItem == itemId)
                    .FirstOrDefaultDecryptedAsync(_encryptionService);

                if (item == null)
                {
                    return NotFound(new { Success = false, Message = "Item not found" });
                }

                var userId = GetCurrentUserId();
                var isAdmin = User.HasClaim("IsAdmin", "true");

                if (!isAdmin && item.SellerUserID != userId)
                {
                    return Forbid("You can only modify your own item images");
                }

                // Remove all existing images
                _context.ItemImages.RemoveRange(item.Images);

                // Add new images
                var newImages = requests.Select((request, index) => new ItemImage
                {
                    ItemID = itemId,
                    ImageData = request.ImageData,
                    ImageOrder = request.ImageOrder > 0 ? request.ImageOrder : index,
                    FileName = request.FileName,
                    ContentType = request.ContentType,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                _context.ItemImages.AddRange(newImages);
                await _context.SaveChangesAsync();

                var responses = newImages.Select(img => new ItemImageResponse
                {
                    IDItemImage = img.IDItemImage,
                    ImageData = img.ImageData,
                    ImageOrder = img.ImageOrder,
                    FileName = img.FileName,
                    ContentType = img.ContentType,
                    CreatedAt = img.CreatedAt
                }).ToList();

                _logger.LogInformation("All images replaced for item {ItemId} - {NewCount} images by user {UserId}",
                    itemId, newImages.Count, userId);

                return Ok(new
                {
                    Success = true,
                    Data = responses,
                    Message = $"All images replaced - {newImages.Count} images added"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error replacing images for item {ItemId}", itemId);
                return BadRequest(new { Success = false, Message = "Error replacing images" });
            }
        }
    }
}