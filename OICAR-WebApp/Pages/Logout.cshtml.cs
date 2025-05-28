using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace OICAR_WebApp.Pages
{
    public class LogoutModel : PageModel
    {
        public IActionResult OnPost()
        {
            Response.Cookies.Delete("JwtToken");

            return RedirectToPage("/Logout");
        }
    }
}
