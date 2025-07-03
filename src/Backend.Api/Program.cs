using Backend.Api.Modules.UserService.Extensions;
using Backend.Api.Modules.SpaceService.Extensions;
using Backend.Api.Modules.SpaceBooking.Extensions;
using Backend.Api.Modules.PaymentService.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Backend.Api.Security;
using Backend.Api.Data;
using Backend.Api.Data.Seeders;
using Microsoft.EntityFrameworkCore;
using Quartz;
using Quartz.AspNetCore;

using System.Security.Claims;
using Microsoft.Extensions.DependencyInjection;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.OpenApi.Models;
using Backend.Api.Services;
using Backend.Api.Services.Shared;
using Backend.Api.Modules.UserRelated.Infrastructure.Security;
using Backend.Api.Modules.UserRelated.Extensions;
using Backend.Api.Modules.UserRelated.Api.Controllers;
using Backend.Api.Modules.UserRelated.Application.Contracts.Services;
using Backend.Api.Modules.UserRelated.Application.Services;
using Backend.Api.Modules.SpaceBooking;
using System.Text.Json.Serialization;
using AutoMapper;
using Backend.Api.Modules.CommunityContent;
using Backend.Api.Modules.Engagement;
using Backend.Api.Modules.Chatbot;
using Microsoft.AspNetCore.Server.Kestrel.Core;

var builder = WebApplication.CreateBuilder(args);

// Thêm User Secrets cho Development environment
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}

// Configure logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddFilter("Microsoft.EntityFrameworkCore", LogLevel.Warning);
builder.Logging.AddFilter("Microsoft.AspNetCore", LogLevel.Information);
builder.Logging.AddFilter("Google", LogLevel.Information);
builder.Logging.AddFilter("Grpc", LogLevel.Information);
builder.Logging.AddFilter("Quartz", LogLevel.Debug); // Add Quartz logging

builder.Services.AddAutoMapper(typeof(Program).Assembly);

// Get configuration for service registration
var configuration = builder.Configuration;

// Register modules with their services and seeders
builder.Services.AddUserRelatedModule(configuration);
builder.Services.AddSpaceBookingModule();
builder.Services.AddCommunityContentModule();

// Register database initializer
builder.Services.AddScoped<DatabaseInitializer>();
builder.Services.AddEngagementModule();
builder.Services.AddChatbotModule(configuration);

// Register background services
builder.Services.AddHostedService<BookingOverdueCheckService>();


// Configure Kestrel to use non-privileged ports and avoid permission issues
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    // Get configured URLs from environment or config
    var urls = configuration["ASPNETCORE_URLS"];
    if (!string.IsNullOrEmpty(urls))
    {
        Console.WriteLine($"Kestrel is explicitly configured to use URLs via ASPNETCORE_URLS: {urls}");
    }
    else 
    {
        // If running in production and no explicit URL is set
        if (builder.Environment.IsProduction())
        {
            // Set safe port to avoid "Permission denied" errors on Linux
            // Port 5000 is above 1024 (non-privileged) but still may have issues on some systems
            serverOptions.ListenAnyIP(5000, listenOptions =>
            {
                Console.WriteLine("Explicitly configured Kestrel to listen on port 5000 on all IPs");
            });
            
            Console.WriteLine("Kestrel explicitly configured to use port 5000 to avoid permission issues");
        }
        else
        {
            Console.WriteLine("Using default Kestrel configuration for non-production environment");
        }
    }

    // Add logging for troubleshooting
    serverOptions.ConfigureEndpointDefaults(listenOptions =>
    {
        Console.WriteLine($"Configuring Kestrel endpoint defaults");
    });
});


// Add services to the container.
builder.Services.Configure<QuartzOptions>(options =>
{
    options.Scheduling.IgnoreDuplicates = true; // default: false
    options.Scheduling.OverWriteExistingData = true; // default: true
});

builder.Services.AddQuartz(q =>
{
    q.UseSimpleTypeLoader();
    q.UseDefaultThreadPool(tp =>
    {
        tp.MaxConcurrency = 10;
    });

    // Don't use persistence
    q.UseInMemoryStore();
});

// Add the Quartz.NET hosted service
builder.Services.AddQuartzHostedService(options => 
{
    options.WaitForJobsToComplete = true;
    options.AwaitApplicationStarted = true;
});

// Configure other services
builder.Services.AddControllers().AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        // options.JsonSerializerOptions.PropertyNameCaseInsensitive = true; // Cho phép tên thuộc tính JSON không phân biệt hoa thường
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // 1. Định nghĩa một scheme bảo mật (Security Scheme) cho JWT
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n " +
                      "Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\n" +
                      "Example: \"Bearer 12345abcdef\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http, // Chuẩn cho Bearer
        Scheme = "bearer", // Viết thường
        BearerFormat = "JWT"
    });



    

    // 2. Yêu cầu bảo mật (Security Requirement) cho các endpoint
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer" // Khớp với tên ở trên
                }
                // Không cần khai báo lại Scheme, Name, In ở đây khi đã có Reference
            },
            new List<string>()
        }
    });

    // (Tùy chọn) Thêm thông tin mô tả cho API của bạn
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "MyWorkspace API", // Đổi tên API cho phù hợp
        Description = "API for managing workspace bookings and user interactions.",
        // ... (các thông tin khác nếu cần)
    });

    // (Tùy chọn) Nếu bạn muốn hiển thị XML comments trong Swagger UI:
    // var xmlFilename = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    // if (File.Exists(Path.Combine(AppContext.BaseDirectory, xmlFilename)))
    // {
    //    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
    // }
});

// Configuration
Console.WriteLine($"Running in: {configuration}");

// Add HttpClientFactory
builder.Services.AddHttpClient(); //Thêm cái này
builder.Services.AddHttpClient<IIBBService, IBBService>();

// Add Cloudinary service
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();

// Add Cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("_myAllowSpecificOrigins",
        builder => builder.WithOrigins(
                            "http://localhost:5173",
                            "http://localhost:5174",
                            "http://localhost:5175",
                            "http://localhost:5176",
                            "http://localhost:5177"
                          )
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials());
});


// Authentication
builder.Services.AddAuthentication(options => // Làm rõ các scheme mặc định
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true; // Tùy chọn: lưu token
    options.RequireHttpsMetadata = builder.Environment.IsProduction(); // Quan trọng cho production

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)), // Thêm ! nếu dùng nullable
        NameClaimType = ClaimTypes.NameIdentifier,
        RoleClaimType = ClaimTypes.Role,
        ClockSkew = TimeSpan.Zero // Khuyến nghị: loại bỏ độ trễ mặc định
    };
});
////;;
;
// Authorization policy
builder.Services.AddAuthorization();

// Add custom authorization handler
builder.Services.AddScoped<IAuthorizationHandler, MinimumAgeAuthorizationHandler>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<ILogger<UsersController>, Logger<UsersController>>();  //Quan trọng :Logging
builder.Services.AddScoped<IEmailService, EmailService>(); // Hoặc AddTransient

// Add modules:
builder.Services.AddUserServiceModule(configuration);
builder.Services.AddSpaceServiceModule(configuration);
builder.Services.AddPaymentServiceModule(configuration);

// Add System Logging Service
builder.Services.AddScoped<ISystemLogService, SystemLogService>();


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"====> Connection String: {connectionString}");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString)
    );

builder.Services.AddScoped<DatabaseInitializer>();

builder.Services.AddScoped<IUserLookupService, MockUserLookupService>();

var app = builder.Build();

// Kiểm tra command tùy chỉnh để chạy seeder và thoát
if (args.Contains("seed-data"))
{
    Console.ForegroundColor = ConsoleColor.Yellow;
    Console.WriteLine("Executing 'seed-data' command...");
    Console.ResetColor();
    
    await InitializeDatabaseAsync(app);
    
    Console.ForegroundColor = ConsoleColor.Green;
    Console.WriteLine("Data seeding completed successfully. Exiting application.");
    Console.ResetColor();
    
    return; // Thoát ứng dụng sau khi seed xong
}

// --- Luồng khởi động ứng dụng web thông thường ---

// Initialize the database and run seeders
using (var scope = app.Services.CreateScope())
{
    try
    {
        var initializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
        await initializer.InitializeAsync();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while initializing the database.");
        throw; // Re-throw to prevent app from starting with uninitialized database
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Backend API v1");
        c.RoutePrefix = "swagger";
    });
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<Program>>();
        var env = services.GetRequiredService<IWebHostEnvironment>();
        // Automatic Migration
        // app.SeedDatabase(env);
    }
}

// https
app.UseHttpsRedirection();

// Serve static files with '/api/uploads' prefix
app.UsePathBase("/api");
app.UseStaticFiles(new StaticFileOptions
{
    RequestPath = "/uploads"
});

// ✅ Đặt ngay sau HTTPS và trước Auth
app.UseCors("_myAllowSpecificOrigins");

// Add logging middleware
app.UseMiddleware<Backend.Api.Middleware.LoggingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
// Enable Cors

app.MapControllers(); // Ensure controllers are mapped in all environments

try
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("Starting web application...");
    app.Run();
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    
    if (ex is System.Net.Sockets.SocketException socketEx && socketEx.Message.Contains("Permission denied"))
    {
        logger.LogError(socketEx, 
            "Socket permission denied error occurred when starting the application. " +
            "This typically happens when non-root users try to bind to privileged ports (below 1024) " +
            "or when the port is already in use.");
        
        logger.LogInformation(
            "SOLUTION OPTIONS:\n" +
            "1. Use a higher port number (e.g., 5000 instead of 80) and proxy with Nginx\n" +
            "2. Use setcap to grant permission: sudo setcap CAP_NET_BIND_SERVICE=+ep /path/to/dotnet\n" +
            "3. Run the application as root (not recommended for production)");
        
        // Attempt to restart on a fallback port if this was a permission issue 
        try
        {
            logger.LogInformation("Attempting to restart on fallback port 8000...");
            // Force a specific port by setting environment variable
            Environment.SetEnvironmentVariable("ASPNETCORE_URLS", "http://0.0.0.0:8000");
            
            // Create a new WebApplication with the updated environment
            var fallbackBuilder = WebApplication.CreateBuilder(args);
            fallbackBuilder.WebHost.UseUrls("http://0.0.0.0:8000");
            
            // Build and run the fallback app - simplified for emergency use
            var fallbackApp = fallbackBuilder.Build();
            fallbackApp.Run();
        }
        catch (Exception fallbackEx)
        {
            logger.LogError(fallbackEx, "Failed to start on fallback port as well. Application will exit.");
            // Exit with error code to signal failure
            Environment.Exit(1);
        }
    }
    else
    {
        logger.LogError(ex, "Application terminated unexpectedly");
        throw;
    }
}

// --- Helper method để gọi DatabaseInitializer ---
async Task InitializeDatabaseAsync(IHost appHost) // IHost thay vì WebApplication để tổng quát hơn
{
    using (var scope = appHost.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var initializer = services.GetRequiredService<DatabaseInitializer>();
            await initializer.InitializeAsync();
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>(); // Lấy logger cho Program
            logger.LogError(ex, "An error occurred during database initialization.");
            // Quyết định có nên dừng ứng dụng hay không nếu khởi tạo DB thất bại
            // throw; // Nếu muốn dừng ứng dụng
        }
    }
}

// Đặt class mock dưới cùng để không lỗi top-level statements
public class MockUserLookupService : IUserLookupService
{
    public Task<Dictionary<Guid, string>> GetUserNamesAsync(IEnumerable<Guid> userIds)
    {
        var dict = userIds.ToDictionary(id => id, id => $"User_{id.ToString().Substring(0, 8)}");
        return Task.FromResult(dict);
    }
}
