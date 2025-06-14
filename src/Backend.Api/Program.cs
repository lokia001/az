using Backend.Api.Modules.UserService.Extensions;
using Backend.Api.Modules.SpaceService.Extensions;
using Backend.Api.Modules.PaymentService.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Backend.Api.Security;
using Backend.Api.Data;

using System.Security.Claims;
using Microsoft.Extensions.DependencyInjection;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.OpenApi.Models;
using Backend.Api.Services;
using Backend.Api.Services.Shared;
using Backend.Api.Modules.UserRelated.Infrastructure.Security;
using Backend.Api.Modules.UserRelated;
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

// Add Google Cloud logging
builder.Logging.AddFilter("Google", LogLevel.Debug);
builder.Logging.AddFilter("Grpc", LogLevel.Debug);

builder.Services.AddAutoMapper(typeof(Program).Assembly);
builder.Services.AddUserRelatedModule(); // GỌI Ở ĐÂY
builder.Services.AddSpaceBookingModule();
builder.Services.AddCommunityContentModule();
builder.Services.AddEngagementModule();
var configuration = builder.Configuration;
builder.Services.AddChatbotModule(configuration);


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


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"====> Connection String: {connectionString}");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString)
    );

builder.Services.AddScoped<DatabaseInitializer>();

builder.Services.AddScoped<IUserLookupService, MockUserLookupService>();

var app = builder.Build();

// Seed amenity and service data
if (app.Environment.IsDevelopment())
{
    try
    {
        using (var scope = app.Services.CreateScope())
        {
            var serviceProvider = scope.ServiceProvider;
            await SeedAmenityAndService.SeedAmenityAndServiceData(serviceProvider);
        }
    }
    catch (Exception ex)
    {
        var logger = app.Services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}


// DÙNG CHO DEBUG AUTOMAPPER
using (var scope = app.Services.CreateScope())
{
    var mapper = scope.ServiceProvider.GetRequiredService<IMapper>();
    try
    {
        Console.WriteLine("=====> Asserting AutoMapper Configuration...");
        mapper.ConfigurationProvider.AssertConfigurationIsValid();
        Console.WriteLine("=====> AutoMapper configuration is VALID.");
    }
    catch (AutoMapperConfigurationException ex)
    {
        Console.WriteLine("====> AutoMapper configuration is INVALID:");
        Console.WriteLine(ex.ToString()); // In ra chi tiết lỗi mapping
        Console.WriteLine("====> AutoMapper End<<<<<<<<<<");
    }
}

await InitializeDatabaseAsync(app);

if (app.Environment.IsProduction())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        logger.LogInformation("Starting database migration...");
        dbContext.Database.Migrate();
        logger.LogInformation("Database migration completed successfully");
    }
    catch (InvalidOperationException ex) when (ex.Message?.Contains("Migrations.Pend") == true || 
                                    ex.Message?.Contains("Pending Model Changes") == true || 
                                    ex.Message?.Contains("Microsoft.EntityFrameworkCore.Migrations") == true ||
                                    ex.ToString().Contains("PendingModelChangesWarning"))
    {
        logger.LogWarning("Detected pending model changes, application will continue: {Message}", ex.Message);
        
        // Log thêm chi tiết về lỗi để debug
        logger.LogWarning("Exception details: {ExceptionType}, {StackTrace}", ex.GetType().FullName, ex.StackTrace);
        
        // Vẫn tiếp tục chạy ứng dụng thay vì dừng lại
        logger.LogWarning("Note: Please create and apply necessary migrations to avoid this warning");
        
        // Log thông tin về database để debug
        try {
            var pendingMigrations = dbContext.Database.GetPendingMigrations().ToList();
            var appliedMigrations = dbContext.Database.GetAppliedMigrations().ToList();
            
            logger.LogInformation("Pending migrations count: {Count}", pendingMigrations.Count);
            if (pendingMigrations.Any()) {
                logger.LogInformation("Pending migrations: {Migrations}", string.Join(", ", pendingMigrations));
            }
            
            logger.LogInformation("Applied migrations count: {Count}", appliedMigrations.Count);
            if (appliedMigrations.Any()) {
                logger.LogInformation("Last applied migration: {Migration}", appliedMigrations.Last());
            }
        }
        catch (Exception dbEx) {
            logger.LogError(dbEx, "Error when trying to get migration information");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred during database migration");
        
        // Kiểm tra nếu lỗi liên quan đến PendingModelChanges nhưng không bắt được ở catch trước
        if (ex.ToString().Contains("PendingModelChanges") || 
            ex.ToString().Contains("Migrations.Pend") ||
            ex.ToString().Contains("Microsoft.EntityFrameworkCore.Migrations"))
        {
            logger.LogWarning("Detected migration issue in general exception handler, application will continue");
            logger.LogWarning("Exception details: {ExceptionType}, {Message}", ex.GetType().FullName, ex.Message);
            // Không throw, cho phép ứng dụng tiếp tục chạy
        }
        else
        {
            // Đối với các lỗi khác không liên quan đến migrations
            throw; 
        }
    }
}

// Add logging for Kestrel binding and port configuration
if (app.Environment.IsProduction()) 
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("Starting Kestrel with the following configuration:");
    
    if (!string.IsNullOrEmpty(builder.Configuration["ASPNETCORE_URLS"]))
    {
        logger.LogInformation("ASPNETCORE_URLS: {Urls}", builder.Configuration["ASPNETCORE_URLS"]);
    }
    
    if (!string.IsNullOrEmpty(builder.Configuration["Kestrel:Endpoints:Http:Url"]))
    {
        logger.LogInformation("Kestrel endpoint from config: {Url}", builder.Configuration["Kestrel:Endpoints:Http:Url"]);
    }
    
    try 
    {
        // Log active ports and listeners that might be in use
        var processOutput = System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
        {
            FileName = "netstat",
            Arguments = "-tlnp",
            RedirectStandardOutput = true,
            UseShellExecute = false
        })?.StandardOutput.ReadToEnd();
        
        if (processOutput != null)
        {
            logger.LogInformation("Active ports (netstat output): {Output}", 
                processOutput.Split('\n')
                    .Where(line => line.Contains("LISTEN"))
                    .Take(10)
                    .Aggregate("", (current, line) => current + Environment.NewLine + line));
        }
    }
    catch (Exception ex)
    {
        logger.LogWarning("Failed to get netstat information: {Error}", ex.Message);
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); //Thêm
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


