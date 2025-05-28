using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net.Http.Headers;
using OICAR.Models;


public class LogsModel : PageModel
{

    private readonly IHttpClientFactory _httpClientFactory;

    public LogsModel(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public List<Log> Logs { get; set; } = new();
    public int TotalCount { get; set; }
    public int CurrentPage { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);

    public async Task<IActionResult> OnGetAsync(int? pageNumber, int? pageSize)
    {
        var client = _httpClientFactory.CreateClient("BackendAPI");

        var token = Request.Cookies["JwtToken"];

        if (!string.IsNullOrEmpty(token))
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        CurrentPage = pageNumber ?? 1;
        PageSize = pageSize ?? 10;

        var countResponse = await client.GetAsync("/api/logs/count");
        if (countResponse.IsSuccessStatusCode)
        {
            var countData = await countResponse.Content.ReadFromJsonAsync<CountResponse>();
            TotalCount = countData?.Count ?? 0;
        }

        var logsResponse = await client.GetAsync($"/api/logs/{PageSize}");
        if (logsResponse.IsSuccessStatusCode)
        {
            Logs = await logsResponse.Content.ReadFromJsonAsync<List<Log>>() ?? new List<Log>();
        }

        return Page();

    }
}

public class CountResponse
{
    public int Count { get; set; }
}
