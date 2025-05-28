using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc;
using OICAR.DTOs;

public class AdminItemsModel : PageModel
{
    private readonly IHttpClientFactory _httpClientFactory;

    public List<ItemDTO> Items { get; set; } = new List<ItemDTO>();
    public string ErrorMessage { get; set; }

    [BindProperty]
    public ItemDTO Item { get; set; }

    public ItemCategoryDTO Category { get; set; }

    public List<ItemCategoryDTO> Categories { get; set; } = new List<ItemCategoryDTO>();


    public AdminItemsModel(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<IActionResult> OnGetAsync()
    {
        var client = _httpClientFactory.CreateClient("BackendAPI");
        var fetchItems = await client.GetAsync("/api/item");

        if (fetchItems.IsSuccessStatusCode)
        {
            Items = await fetchItems.Content.ReadFromJsonAsync<List<ItemDTO>>() ?? new List<ItemDTO>();
        }
        else
        {
            ErrorMessage = "Failed to retrieve items.";
        }

        var fetchCategories = await client.GetAsync("/api/itemcategory");
        if (fetchCategories.IsSuccessStatusCode)
        {
            Categories = await fetchCategories.Content.ReadFromJsonAsync<List<ItemCategoryDTO>>();
        }

        return Page();
    }

    public async Task<IActionResult> OnPostAddAsync()
    {
        var client = _httpClientFactory.CreateClient("BackendAPI");
        var response = await client.PostAsJsonAsync("/api/item", Item);

        if (response.IsSuccessStatusCode)
        {
            TempData["SuccessMessage"] = "Item added successfully!";
            return RedirectToPage();
        }
        else
        {
            ErrorMessage = "Failed to add the item.";
            return Page();
        }
    }

    public async Task<IActionResult> OnPostEditAsync()
    {
        var client = _httpClientFactory.CreateClient("BackendAPI");
        var response = await client.PutAsJsonAsync($"/api/item/{Item.IDItem}", Item);
        var categoryResponse = await client.GetAsync($"/api/itemcategory/{Item.ItemCategoryID}");

        if (categoryResponse.IsSuccessStatusCode)
        {
            Category = await categoryResponse.Content.ReadFromJsonAsync<ItemCategoryDTO>();
        }

        if (response.IsSuccessStatusCode)
        {
            TempData["SuccessMessage"] = "Item updated successfully!";
            return RedirectToPage();
        }
        else
        {
            ErrorMessage = "Failed to update the item.";
            return Page();
        }
    }

    public async Task<IActionResult> OnPostDeleteAsync(int itemId)
    {
        var client = _httpClientFactory.CreateClient("BackendAPI");
        var response = await client.DeleteAsync($"/api/item/{itemId}");

        if (response.IsSuccessStatusCode)
        {
            TempData["SuccessMessage"] = "Item deleted successfully!";
            return RedirectToPage();
        }
        else
        {
            ErrorMessage = "Failed to delete the item.";
            return Page();
        }
    }

    public async Task<IActionResult> OnPostPopulateEditModalAsync(int itemId, string title, decimal price,
    int stockQuantity, string description, int itemCategoryId)
    {
        Item = new ItemDTO
        {
            IDItem = itemId,
            Title = title,
            Price = price,
            StockQuantity = stockQuantity,
            Description = description,
            ItemCategoryID = itemCategoryId,
        };

        var client = _httpClientFactory.CreateClient("BackendAPI");
        var fetchCategories = await client.GetAsync("/api/itemcategory");
        if (fetchCategories.IsSuccessStatusCode)
        {
            Categories = await fetchCategories.Content.ReadFromJsonAsync<List<ItemCategoryDTO>>();
        }

        return Page();
    }
}
