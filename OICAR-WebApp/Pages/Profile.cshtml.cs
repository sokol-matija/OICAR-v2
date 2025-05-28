using Microsoft.AspNetCore.Mvc.RazorPages;
using OICAR.DTOs;
using System.Net.Http.Headers;


public class ProfileModel : PageModel
{
    private readonly IHttpClientFactory _httpClientFactory;

    public ProfileModel(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public UserDTO UserProfile { get; set; } = new UserDTO();

    public async Task OnGetAsync()
    {
        var client = _httpClientFactory.CreateClient("BackendAPI");
        var userId = GetUserIdFromClaims();
        var token = Request.Cookies["JwtToken"];

        if (!string.IsNullOrEmpty(token))
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        var response = await client.GetAsync($"/api/user/{userId}");
        if (response.IsSuccessStatusCode)
        {
            UserProfile = await response.Content.ReadFromJsonAsync<UserDTO>();
        }
        else
        {
            TempData["Error"] = "Failed to load profile.";
        }
    }

    private int GetUserIdFromClaims()
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id");
        return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
    }
}
