using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using OICAR.DTOs;
using System.Net;
using System.Net.Http.Headers;

[Authorize]
public class CartModel : PageModel
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CartModel> _logger;


    public CartModel(IHttpClientFactory httpClientFactory, ILogger<CartModel> logger)
    {
        _httpClient = httpClientFactory.CreateClient("BackendAPI");
        _logger = logger;
    }

    public List<CartItemWithDetailsDTO> CartItemsWithDetails { get; set; } = new List<CartItemWithDetailsDTO>();

    public async Task OnGetAsync()
    {

        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id");
        if (userIdClaim == null)
        {
            throw new UnauthorizedAccessException("UserProfile ID claim is missing. Ensure the user is authenticated.");
        }

        if (!int.TryParse(userIdClaim.Value, out var userId))
        {
            throw new InvalidCastException("The UserProfile ID claim is not a valid integer.");
        }

        try
        {
            var cart = await FetchCart(userId);
            foreach (var cartItem in cart.CartItems)
            {
                var itemDetails = await FetchItemDetailsAsync(cartItem.ItemID);
                CartItemsWithDetails.Add(new CartItemWithDetailsDTO
                {
                    CartItem = cartItem,
                    ItemDetails = itemDetails
                });
            }
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            CartItemsWithDetails = new List<CartItemWithDetailsDTO>();
        }
    }

    public async Task<IActionResult> OnPostUpdateQuantityAsync(int index, int quantity)
    {
        await EnsureCartItemsLoaded();
        CartItemsWithDetails[index].CartItem.Quantity = quantity;
        await UpdateCartItemQuantity(CartItemsWithDetails[index].CartItem);
        return RedirectToPage();
    }

    public async Task<IActionResult> OnPostRemoveItemAsync(int index)
    {
        await EnsureCartItemsLoaded();
        await RemoveCartItemFromBackend(CartItemsWithDetails[index].CartItem.IDCartItem);
        CartItemsWithDetails.RemoveAt(index);
        return RedirectToPage();
    }

    private int? GetUserIdFromClaims()
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id");
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            _logger.LogWarning("Failed to parse UserProfile ID from claims.");
            return null;
        }
        return userId;
    }
    private async Task<CartDTO> FetchCart(int userId)
    {
        var token = Request.Cookies["JwtToken"];
        if (string.IsNullOrEmpty(token))
        {
            _logger.LogWarning("JWT token is missing from cookies.");
            throw new UnauthorizedAccessException("JWT token not found.");
        }

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _httpClient.GetAsync($"/api/cart/users/{userId}");

        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<CartDTO>();
    }


    private async Task UpdateCartItemQuantity(CartItemDTO cartItem)
    {
        var response = await _httpClient.PutAsJsonAsync($"/api/cartitem/{cartItem.IDCartItem}", cartItem);
        response.EnsureSuccessStatusCode();
    }

    private async Task RemoveCartItemFromBackend(int itemId)
    {
        var response = await _httpClient.DeleteAsync($"/api/cartitem/{itemId}");
        response.EnsureSuccessStatusCode();
    }

    private async Task<ItemDTO> FetchItemDetailsAsync(int itemId)
    {
        var response = await _httpClient.GetAsync($"/api/item/{itemId}");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<ItemDTO>();
    }

    private async Task EnsureCartItemsLoaded()
    {
        if (CartItemsWithDetails == null || !CartItemsWithDetails.Any())
        {
            var userId = GetUserIdFromClaims();
            if (userId == null)
            {
                _logger.LogWarning("Attempt to load cart items with missing UserProfile ID.");
                throw new UnauthorizedAccessException("UserProfile is not authenticated.");
            }

            var cart = await FetchCart(userId.Value);
            foreach (var cartItem in cart.CartItems)
            {
                var itemDetails = await FetchItemDetailsAsync(cartItem.ItemID);
                CartItemsWithDetails.Add(new CartItemWithDetailsDTO
                {
                    CartItem = cartItem,
                    ItemDetails = itemDetails
                });
            }
        }
    }
}

public class CartItemWithDetailsDTO
{
    public CartItemDTO CartItem { get; set; }
    public ItemDTO ItemDetails { get; set; }
}