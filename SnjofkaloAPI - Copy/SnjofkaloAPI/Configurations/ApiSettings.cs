namespace SnjofkaloAPI.Configurations
{
    public class ApiSettings
    {
        public int PageSize { get; set; } = 20;
        public int MaxPageSize { get; set; } = 100;
        public string ApiVersion { get; set; } = "1.0";
        public bool EnableSwagger { get; set; } = true;
        public bool EnableCors { get; set; } = true;
        public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
    }
}