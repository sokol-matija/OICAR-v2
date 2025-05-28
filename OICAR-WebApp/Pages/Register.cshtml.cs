using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using OICAR.DTOs;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace UI.Pages
{
    public class RegisterModel : PageModel
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public RegisterModel(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [BindProperty]
        public RegisterDTO RegisterData { get; set; } = new RegisterDTO();

        public string Message { get; set; }

        public async Task<IActionResult> OnPostAsync()
        {
            try
            {
                var client = _httpClientFactory.CreateClient("BackendAPI");

                var response = await client.PostAsJsonAsync("/api/Auth/register", RegisterData);

                if (response.IsSuccessStatusCode)
                {
                    return RedirectToPage("/Login");
                }
                else
                {
                    var errorMessage = await response.Content.ReadAsStringAsync();
                    Message = $"Registration failed: {errorMessage}";
                }
            }
            catch (Exception ex)
            {
                Message = $"An error occurred: {ex.Message}";
            }

            return Page();
        }
    }
}