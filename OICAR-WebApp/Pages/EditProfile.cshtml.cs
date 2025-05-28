using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using OICAR.DTOs;
using System.Net.Http.Headers;

namespace Webshop.Pages
{
    [Authorize]
    public class EditProfileModel : PageModel
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public EditProfileModel(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [BindProperty]
        public UserDTO UserProfile { get; set; }
        public string UserToken { get; private set; }
        public int UserId { get; private set; }

        public async Task<IActionResult> OnGetAsync()
        {
            var userId = int.Parse(User.FindFirst("id").Value);
            var client = _httpClientFactory.CreateClient("BackendAPI");
            var token = Request.Cookies["JwtToken"];

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }

            var response = await client.GetAsync($"/api/user/{userId}");
            if (!response.IsSuccessStatusCode)
            {
                TempData["Error"] = "Failed to load user data.";
                return Page();
            }

            UserProfile = await response.Content.ReadFromJsonAsync<UserDTO>();
            return Page();
        }


        public async Task<IActionResult> OnGetAuthInfoAsync()
        {
            var userId = int.Parse(User.FindFirst("id").Value);
            var token = Request.Cookies["JwtToken"];

            if (string.IsNullOrEmpty(token))
            {
                return new JsonResult(new { success = false });
            }

            return new JsonResult(new { success = true, userId, token });
        }

        public async Task<IActionResult> OnGetUserDataAsync(int userId)
        {
            var client = _httpClientFactory.CreateClient("BackendAPI");
            var token = Request.Cookies["JwtToken"];

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }

            var response = await client.GetAsync($"/api/user/{userId}");
            if (!response.IsSuccessStatusCode)
            {
                return new JsonResult(new { success = false, message = "Failed to retrieve user data" });
            }

            var userData = await response.Content.ReadFromJsonAsync<UserDTO>();
            return new JsonResult(userData);
        }

        public async Task<IActionResult> OnPostUpdateProfileAsync([FromBody] UserDTO user)
        {
            var userId = int.Parse(User.FindFirst("id").Value);

            if (userId != user.IDUser)
            {
                return new JsonResult(new { success = false, message = "User ID mismatch" });
            }

            var client = _httpClientFactory.CreateClient("BackendAPI");
            var token = Request.Cookies["JwtToken"];

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }

            var response = await client.PutAsJsonAsync($"/api/user/{userId}", user);

            if (response.IsSuccessStatusCode)
            {
                return new JsonResult(new { success = true, message = "Profile updated successfully" });
            }
            else
            {
                return new JsonResult(new { success = false, message = "Failed to update profile" });
            }
        }

    }
}