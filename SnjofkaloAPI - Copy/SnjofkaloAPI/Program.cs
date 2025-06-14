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

// fixing for redeployment - testing Azure environment variables override

var builder = WebApplication.CreateBuilder(args);

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

// Configuration bindings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<ApiSettings>(builder.Configuration.GetSection("ApiSettings"));
builder.Services.Configure<EncryptionSettings>(builder.Configuration.GetSection("EncryptionSettings"));

// Controllers
builder.Services.AddControllers();

// Register encryption service first
builder.Services.AddScoped<IDataEncryptionService, DataEncryptionService>();

// Database with encryption service dependency injection
builder.Services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
{
    var encryptionService = serviceProvider.GetRequiredService<IDataEncryptionService>();

    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.AddInterceptors(new EncryptionInterceptor(encryptionService));
});

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()!;
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
var apiSettings = builder.Configuration.GetSection("ApiSettings").Get<ApiSettings>()!;
if (apiSettings.EnableCors)
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowSpecificOrigins", policy =>
        {
            if (apiSettings.AllowVercelDomains)
            {
                policy.SetIsOriginAllowed(origin =>
                {
                    // Allow configured origins
                    if (apiSettings.AllowedOrigins.Contains(origin))
                        return true;
                    
                    // Allow all vercel.app domains
                    if (origin.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase))
                        return true;
                    
                    return false;
                })
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .SetPreflightMaxAge(TimeSpan.FromSeconds(2520));
            }
            else
            {
                policy.WithOrigins(apiSettings.AllowedOrigins)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials()
                      .SetPreflightMaxAge(TimeSpan.FromSeconds(2520));
            }
        });
        
        // Add a more permissive policy for development
        options.AddPolicy("AllowAll", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
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
    var encryptionSettings = app.Services.GetRequiredService<IConfiguration>()
        .GetSection("EncryptionSettings").Get<EncryptionSettings>();

    return new
    {
        Status = "Healthy",
        Timestamp = DateTime.UtcNow,
        EncryptionEnabled = encryptionSettings?.EnableEncryption ?? false,
        GdprCompliant = true,
        MarketplaceEnabled = true,
        Version = "1.0.0"
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

    // Log encryption status on startup
    var encryptionSettings = builder.Configuration.GetSection("EncryptionSettings").Get<EncryptionSettings>();
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