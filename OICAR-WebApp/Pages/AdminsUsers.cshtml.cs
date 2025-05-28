using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using OICAR.DTOs;
using System.Net;
using System.Net.Http.Headers;

public class AdminUsersModel : PageModel
{
    private readonly IHttpClientFactory _httpClientFactory;
    public AdminUsersModel(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public List<UserDTO> AllUsers { get; set; } = new();
    public List<UserDTO> AdminUsers { get; set; } = new();
    public string ErrorMessage { get; set; }

    public async Task<IActionResult> OnGetAsync()
    {
        var client = _httpClientFactory.CreateClient("BackendAPI");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Request.Cookies["JwtToken"]);

        try
        {
            var usersResponse = await client.GetAsync("/api/user");
            if (usersResponse.IsSuccessStatusCode)
            {
                AllUsers = await usersResponse.Content.ReadFromJsonAsync<List<UserDTO>>() ?? new();
            }
            else if (usersResponse.StatusCode == HttpStatusCode.Forbidden)
            {
                ErrorMessage = "You need to be an admin to perform this operation.";
            }

            var adminsResponse = await client.GetAsync("/api/user/admins");
            if (adminsResponse.IsSuccessStatusCode)
            {
                AdminUsers = await adminsResponse.Content.ReadFromJsonAsync<List<UserDTO>>() ?? new();
            }

            return Page();
        }
        catch (Exception)
        {
            ErrorMessage = "An error occurred while fetching user data.";
            return Page();
        }
    }

    public async Task<IActionResult> OnPostDeleteUserAsync(int userId)
    {
        var client = _httpClientFactory.CreateClient("BackendAPI");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Request.Cookies["JwtToken"]);

        try
        {
            var response = await client.DeleteAsync($"/api/user/{userId}");

            if (response.IsSuccessStatusCode)
            {
                var usersResponse = await client.GetAsync("/api/user");
                if (usersResponse.IsSuccessStatusCode)
                {
                    TempData["SuccessMessage"] = "User deleted successfully!";
                    AllUsers = await usersResponse.Content.ReadFromJsonAsync<List<UserDTO>>() ?? new();
                }
                else if (usersResponse.StatusCode == HttpStatusCode.Forbidden)
                {
                    ErrorMessage = "You need to be an admin to perform this operation.";
                }

                var adminsResponse = await client.GetAsync("/api/user/admins");
                if (adminsResponse.IsSuccessStatusCode)
                {
                    AdminUsers = await adminsResponse.Content.ReadFromJsonAsync<List<UserDTO>>() ?? new();
                }
            }
            else
            {
                ErrorMessage = "Failed to delete the user.";
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"An error occurred: {ex.Message}";
        }

        return Page();
    }

}