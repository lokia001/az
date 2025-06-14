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
    dbContext.Database.Migrate();
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

app.Run();

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


