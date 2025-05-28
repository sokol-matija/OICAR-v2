using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

public class LoginModel : PageModel
{
    private readonly IHttpClientFactory _httpClientFactory;

    public LoginModel(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    [BindProperty]
    public string Email { get; set; }

    [BindProperty]
    public string Password { get; set; }

    public string Message { get; set; }

    public async Task<IActionResult> OnPostAsync()
    {
        try
        {
            var client = _httpClientFactory.CreateClient("BackendAPI");

            var requestData = new { Email = Email, Password = Password };
            var response = await client.PostAsJsonAsync("/api/Auth/login", requestData);

            var responseContent = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                var jsonResponse = JsonSerializer.Deserialize<Dictionary<string, string>>(responseContent);
                var token = jsonResponse["token"];

                Response.Cookies.Append("JwtToken", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None, 
                    Expires = DateTime.UtcNow.AddMinutes(60),
                    Path = "/"
                });

                return RedirectToPage("/home");
            }
            else
            {
                Message = $"Error: {response.StatusCode} - {responseContent}";
            }
        }
        catch (Exception ex)
        {
            Message = $"An error occurred: {ex.Message}";

        }
        return Page();
    }
}
