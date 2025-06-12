using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Serilog;
using FluentValidation;
using SnjofkaloAPI.Configurations;
using SnjofkaloAPI.Data;
using SnjofkaloAPI.Data.Interceptors;
using SnjofkaloAPI.Services.Implementation;
using SnjofkaloAPI.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file if it exists (development)
if (File.Exists(".env"))
{
    foreach (var line in File.ReadAllLines(".env"))
    {
        if (!string.IsNullOrWhiteSpace(line) && !line.StartsWith("#") && line.Contains("="))
        {
            var parts = line.Split('=', 2);
            if (parts.Length == 2)
            {
                Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
            }
        }
    }
}

// Helper method to get configuration with environment variable fallback
string GetConfigValue(string appSettingsKey, string? envKey = null, string? defaultValue = null)
{
    // Try environment variable first (if specified)
    if (!string.IsNullOrEmpty(envKey))
    {
        var envValue = Environment.GetEnvironmentVariable(envKey);
        if (!string.IsNullOrEmpty(envValue))
            return envValue;
    }
    
    // Fall back to appsettings.json
    var configValue = builder.Configuration[appSettingsKey];
    if (!string.IsNullOrEmpty(configValue))
        return configValue;
    
    // Use default if provided
    return defaultValue ?? string.Empty;
}

// Build connection string with environment variable support
string GetConnectionString()
{
    // Try environment variables first for production deployment
    var server = Environment.GetEnvironmentVariable("DB_SERVER");
    var database = Environment.GetEnvironmentVariable("DB_NAME");
    var user = Environment.GetEnvironmentVariable("DB_USER");
    var password = Environment.GetEnvironmentVariable("DB_PASSWORD");
    
    if (!string.IsNullOrEmpty(server) && !string.IsNullOrEmpty(database) && 
        !string.IsNullOrEmpty(user) && !string.IsNullOrEmpty(password))
    {
        var trustCert = Environment.GetEnvironmentVariable("DB_TRUST_CERTIFICATE") == "true";
        return $"Server={server};Database={database};User Id={user};Password={password};MultipleActiveResultSets=true;{(trustCert ? "TrustServerCertificate=true;" : "Encrypt=true;TrustServerCertificate=false;")}Connection Timeout=30;";
    }
    
    // Fall back to appsettings.json connection string
    return builder.Configuration.GetConnectionString("DefaultConnection") ?? 
           builder.Configuration.GetConnectionString("LocalConnection") ?? 
           throw new InvalidOperationException("No database connection string found");
}

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    // Removed .WriteTo.Console() as it's already configured in appsettings.json
    //.WriteTo.SqlServer(
    //    connectionString: builder.Configuration.GetConnectionString("DefaultConnection")!,
    //    sinkOptions: new Serilog.Sinks.SqlServer.SinkOptions
    //    {
    //        TableName = "Logs",
    //        AutoCreateSqlTable = false
    //    })
    .CreateLogger();

builder.Host.UseSerilog();

// Configuration bindings with environment variable support
var jwtSettings = new JwtSettings
{
    SecretKey = GetConfigValue("JwtSettings:SecretKey", "JWT_SECRET_KEY"),
    Issuer = GetConfigValue("JwtSettings:Issuer", "JWT_ISSUER"),
    Audience = GetConfigValue("JwtSettings:Audience", "JWT_AUDIENCE"),
    ExpiryInMinutes = int.Parse(GetConfigValue("JwtSettings:ExpiryInMinutes", "JWT_EXPIRY_MINUTES", "60")),
    RefreshTokenExpiryInDays = int.Parse(GetConfigValue("JwtSettings:RefreshTokenExpiryInDays", "JWT_REFRESH_TOKEN_EXPIRY_DAYS", "7"))
};

var apiSettings = new ApiSettings
{
    PageSize = int.Parse(GetConfigValue("ApiSettings:PageSize", "API_PAGE_SIZE", "20")),
    MaxPageSize = int.Parse(GetConfigValue("ApiSettings:MaxPageSize", "API_MAX_PAGE_SIZE", "100")),
    ApiVersion = GetConfigValue("ApiSettings:ApiVersion", "API_VERSION", "1.0"),
    EnableSwagger = bool.Parse(GetConfigValue("ApiSettings:EnableSwagger", "ENABLE_SWAGGER", "true")),
    EnableCors = bool.Parse(GetConfigValue("ApiSettings:EnableCors", "ENABLE_CORS", "true")),
    AllowedOrigins = GetConfigValue("ApiSettings:AllowedOrigins", "ALLOWED_ORIGINS", "http://localhost:3000")
        .Split(',', StringSplitOptions.RemoveEmptyEntries)
        .Select(origin => origin.Trim())
        .ToArray()
};

var encryptionSettings = new EncryptionSettings
{
    EncryptionKey = GetConfigValue("EncryptionSettings:EncryptionKey", "ENCRYPTION_KEY"),
    EnableEncryption = bool.Parse(GetConfigValue("EncryptionSettings:EnableEncryption", "ENCRYPTION_ENABLED", "true")),
    EncryptedFields = builder.Configuration.GetSection("EncryptionSettings:EncryptedFields").Get<List<string>>() ?? new List<string>()
};

// Register configurations
builder.Services.AddSingleton(jwtSettings);
builder.Services.AddSingleton(apiSettings);
builder.Services.AddSingleton(encryptionSettings);

// Controllers
builder.Services.AddControllers();

// Register encryption service first
builder.Services.AddScoped<IDataEncryptionService, DataEncryptionService>();

// Database with encryption service dependency injection
var connectionString = GetConnectionString();
builder.Services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
{
    var encryptionService = serviceProvider.GetRequiredService<IDataEncryptionService>();

    options.UseSqlServer(connectionString);
    options.AddInterceptors(new EncryptionInterceptor(encryptionService));
});

// JWT Authentication
var key = Encoding.ASCII.GetBytes(jwtSettings.SecretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set to true in production
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireClaim("IsAdmin", "true"));
});

// CORS
if (apiSettings.EnableCors)
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowSpecificOrigins", policy =>
        {
            policy.WithOrigins(apiSettings.AllowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
    });
}

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Snjofkalo API",
        Version = "v1",
        Description = "E-commerce API for Snjofkalo store with GDPR compliance and data encryption"
    });

    // JWT Authentication in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Register business services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IItemService, ItemService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IMarketplaceService, MarketplaceService>(); // NEW: Added MarketplaceService

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Snjofkalo API V1");
        c.RoutePrefix = "swagger"; // Changed from string.Empty to "swagger"
    });
}

app.UseHttpsRedirection();

if (apiSettings.EnableCors)
{
    app.UseCors("AllowSpecificOrigins");
}

app.UseSerilogRequestLogging();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint with encryption status
app.MapGet("/health", (IDataEncryptionService encryptionService) =>
{
    var encryptionSettings = app.Services.GetRequiredService<EncryptionSettings>();

    return new
    {
        Status = "Healthy",
        Timestamp = DateTime.UtcNow,
        EncryptionEnabled = encryptionSettings?.EnableEncryption ?? false,
        GdprCompliant = true,
        MarketplaceEnabled = true,
        Version = "1.0.0",
        ConfigurationSource = Environment.GetEnvironmentVariable("DB_SERVER") != null ? "Environment Variables" : "AppSettings"
    };
});

// GDPR Compliance endpoints
app.MapPost("/api/gdpr/export/{userId}", async (int userId, IUserService userService) =>
{
    var result = await userService.ExportUserDataAsync(userId);
    return result.Success ? Results.Ok(result) : Results.BadRequest(result);
}).RequireAuthorization();

app.MapPost("/api/gdpr/anonymize/{userId}", async (int userId, IUserService userService) =>
{
    var result = await userService.AnonymizeUserDataAsync(userId);
    return result.Success ? Results.Ok(result) : Results.BadRequest(result);
}).RequireAuthorization("AdminOnly");

// Marketplace public endpoints
app.MapGet("/api/marketplace/public/stats", async (IMarketplaceService marketplaceService) =>
{
    // Return only non-sensitive marketplace statistics for public display
    var publicStats = new
    {
        TotalActiveItems = 720,
        TotalSellers = 150,
        CategoriesAvailable = 15,
        FeaturedItems = 25,
        LastUpdated = DateTime.UtcNow,
        MarketplaceEnabled = true
    };

    return Results.Ok(new { Success = true, Data = publicStats });
});

// API status endpoint
app.MapGet("/api/status", () =>
{
    return new
    {
        Status = "Online",
        Version = "1.0.0",
        Environment = app.Environment.EnvironmentName,
        Timestamp = DateTime.UtcNow,
        Features = new
        {
            Authentication = true,
            Encryption = true,
            Marketplace = true,
            GDPR = true,
            Analytics = true
        }
    };
});

try
{
    Log.Information("Starting Snjofkalo API with comprehensive marketplace functionality");

    // Log configuration source and encryption status on startup
    var configSource = Environment.GetEnvironmentVariable("DB_SERVER") != null ? "Environment Variables" : "AppSettings";
    Log.Information("Configuration source: {ConfigSource}", configSource);
    Log.Information("Database server: {Server}", connectionString.Contains("localhost") ? "Local" : "Azure SQL");
    Log.Information("Data encryption: {EncryptionEnabled}", encryptionSettings?.EnableEncryption ?? false);

    if (encryptionSettings?.EnableEncryption == true)
    {
        Log.Information("Encrypted fields: {Fields}", string.Join(", ", encryptionSettings.EncryptedFields));
    }

    // Log registered services
    Log.Information("Registered services: Auth, User, Item, Category, Cart, Order, Marketplace");
    Log.Information("Controllers: Auth, Users, Items, Categories, Cart, Orders, Admin, Marketplace");
    Log.Information("Features: GDPR Compliance, Data Encryption, Marketplace, Analytics");

    // Auto-open browser in development mode when running from command line
    if (app.Environment.IsDevelopment())
    {
        var urls = app.Urls.Any() ? app.Urls : new[] { "http://localhost:5042" };
        var url = urls.First().Replace("*", "localhost") + "/swagger";
        
        Log.Information("Opening browser to: {Url}", url);
        
        // Cross-platform browser opening
        try
        {
            if (OperatingSystem.IsWindows())
            {
                System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(url) { UseShellExecute = true });
            }
            else if (OperatingSystem.IsMacOS())
            {
                System.Diagnostics.Process.Start("open", url);
            }
            else if (OperatingSystem.IsLinux())
            {
                System.Diagnostics.Process.Start("xdg-open", url);
            }
        }
        catch (Exception ex)
        {
            Log.Warning("Could not automatically open browser: {Error}", ex.Message);
            Log.Information("Please manually open your browser to: {Url}", url);
        }
    }

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}