using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using OICAR.DTOs;
using System.Net.Http.Headers;

[Authorize]
public class ItemModel : PageModel
{
    private readonly IHttpClientFactory _httpClientFactory;

    public ItemModel(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public ItemDTO Item { get; set; }
    public string ItemCategoryName { get; set; } = "Unknown";
    public string TagName { get; set; } = "Unknown";

    public async Task OnGetAsync(int id)
    {
        var client = _httpClientFactory.CreateClient("BackendAPI");

        var response = await client.GetAsync($"/api/item/{id}");
        if (response.IsSuccessStatusCode)
        {
            Item = await response.Content.ReadFromJsonAsync<ItemDTO>();
        }

        if (Item != null)
        {
            var categoryResponse = await client.GetAsync($"/api/itemcategory/{Item.ItemCategoryID}");
            if (categoryResponse.IsSuccessStatusCode)
            {
                var category = await categoryResponse.Content.ReadFromJsonAsync<ItemCategoryDTO>();
                ItemCategoryName = category?.CategoryName ?? "Unknown";
            }

            //if (Item.TagID.HasValue)
            //{
            //    var tagResponse = await client.GetAsync($"/api/tag/{Item.TagID.Value}");
            //    if (tagResponse.IsSuccessStatusCode)
            //    {
            //        var tag = await tagResponse.Content.ReadFromJsonAsync<TagDTO>();
            //        TagName = tag?.Name ?? "Unknown";
            //    }
            //}
        }
    }

    public async Task<IActionResult> OnPostAddToCartAsync(int itemId)
    {
        var client = _httpClientFactory.CreateClient("BackendAPI");
        var token = Request.Cookies["JwtToken"];

        if (!string.IsNullOrEmpty(token))
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }
        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            TempData["Error"] = "UserProfile ID is missing or invalid.";
            return RedirectToPage();
        }

        var cartResponse = await client.GetAsync($"/api/cart/users/{userId}");
        if (!cartResponse.IsSuccessStatusCode)
        {
            TempData["Error"] = "Unable to retrieve the cart information.";
            return RedirectToPage();
        }

        var cart = await cartResponse.Content.ReadFromJsonAsync<CartDTO>();
        if (cart == null || cart.IDCart <= 0)
        {
            TempData["Error"] = "Cart not found for the current user.";
            return RedirectToPage();
        }

        var cartItem = new CartItemDTO
        {
            CartID = cart.IDCart,
            ItemID = itemId,
            Quantity = 1
        };

        var response = await client.PostAsJsonAsync("/api/cartitem", cartItem);
        if (response.IsSuccessStatusCode)
        {
            TempData["Message"] = "Item added to cart successfully!";
        }
        else
        {
            TempData["Error"] = "Failed to add item to cart.";
        }

        return RedirectToPage("/Item", new { id = itemId });
    }

    private int? GetUserIdFromClaims()
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id");
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return null;
        }
        return userId;
    }

}
