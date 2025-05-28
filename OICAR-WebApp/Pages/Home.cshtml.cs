using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using OICAR.DTOs;
using System.Net.Http.Headers;



[Authorize]
public class HomeModel : PageModel
{
    private readonly IHttpClientFactory _httpClientFactory;
    public bool IsAdmin { get; set; }


    public HomeModel(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public string SearchQuery { get; set; } = "";
    public List<ItemDTO> Items { get; set; } = new List<ItemDTO>();
    public List<ItemCategoryDTO> Categories { get; set; } = new List<ItemCategoryDTO>();

    public async Task OnGetAsync(string search = "", int categoryId = 0)
    {
        var client = _httpClientFactory.CreateClient("BackendAPI");
        isAdminAsync();

        string apiUrl = "/api/item";

        if (!string.IsNullOrEmpty(search))
        {
            apiUrl += $"?title={search}";
        }
        else if (categoryId > 0)
        {
            apiUrl += $"?categoryId={categoryId}";
        }

        var response = await client.GetAsync(apiUrl);
        if (response.IsSuccessStatusCode)
        {
            var allItems = await response.Content.ReadFromJsonAsync<List<ItemDTO>>();

            if (!string.IsNullOrEmpty(search))
            {
                Items = allItems.Where(i => i.Title.Contains(search, StringComparison.OrdinalIgnoreCase)).ToList();
            }
            else
            {
                Items = allItems;
            }
        }
        else
        {
            Items = new List<ItemDTO>();
        }

        var categoryResponse = await client.GetAsync("/api/itemcategory");
        if (categoryResponse.IsSuccessStatusCode)
        {
            Categories = await categoryResponse.Content.ReadFromJsonAsync<List<ItemCategoryDTO>>();
        }
        else
        {
            Categories = new List<ItemCategoryDTO>();
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

        return RedirectToPage();
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


    private async Task isAdminAsync() {

        var userId = User.FindFirst("id")?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            var client = _httpClientFactory.CreateClient("BackendAPI");
            var token = Request.Cookies["JwtToken"];
            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                var currentUserResponse = await client.GetAsync($"/api/user/{userId}");
                if (currentUserResponse.IsSuccessStatusCode)
                {
                    var currentUser = await currentUserResponse.Content.ReadFromJsonAsync<UserDTO>();
                    IsAdmin = currentUser?.IsAdmin ?? false;
                }
            }
        }
    }
}
