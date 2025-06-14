// File: Backend.Api/Data/DatabaseInitializer.cs (Hoặc Backend.Api/Infrastructure/Initialization/DatabaseInitializer.cs)
using Backend.Api.Modules.UserRelated.Domain.Entities;
using Backend.Api.Modules.UserRelated.Domain.Enums;
using Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories; // Nếu dùng IUserRepository trực tiếp
using Microsoft.EntityFrameworkCore; // Cho EnsureCreatedAsync
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration; // Để đọc thông tin admin từ config
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Api.Data // Hoặc Backend.Api.Infrastructure.Initialization
{
    public class DatabaseInitializer
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DatabaseInitializer> _logger;
        private readonly IConfiguration _configuration;

        public DatabaseInitializer(
            IServiceProvider serviceProvider,
            ILogger<DatabaseInitializer> logger,
            IConfiguration configuration)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task InitializeAsync()
        {
            // Tạo một scope mới để resolve các scoped services (như DbContext, Repositories)
            // Điều này quan trọng vì InitializeAsync được gọi từ singleton (hoặc ngoài request pipeline)
            using (var scope = _serviceProvider.CreateScope())
            {
                var scopedProvider = scope.ServiceProvider;
                var dbContext = scopedProvider.GetRequiredService<AppDbContext>();
                var userRepository = scopedProvider.GetRequiredService<IUserRepository>(); // Lấy IUserRepository

                try
                {
                    _logger.LogInformation("Attempting to apply migrations and initialize database...");

                    // Đảm bảo database được tạo và migrations được áp dụng
                    // await dbContext.Database.EnsureCreatedAsync(); // Chỉ tạo DB nếu chưa có, không chạy migrations
                    await dbContext.Database.MigrateAsync(); // Áp dụng migrations (khuyến nghị)

                    _logger.LogInformation("Database migrations applied successfully (if any).");

                    await SeedSystemAdminAsync(userRepository, dbContext);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while initializing the database.");
                    // Cân nhắc throw lại exception nếu đây là lỗi nghiêm trọng không thể bỏ qua
                    // throw;
                }
            }
        }

        private async Task SeedSystemAdminAsync(IUserRepository userRepository, AppDbContext dbContext)
        {
            _logger.LogInformation("Checking for System Admin account...");

            // Lấy thông tin admin từ configuration
            var adminUsername = _configuration["SystemAdmin:Username"];
            var adminEmail = _configuration["SystemAdmin:Email"];
            var adminPassword = _configuration["SystemAdmin:Password"];

            if (string.IsNullOrWhiteSpace(adminUsername) ||
                string.IsNullOrWhiteSpace(adminEmail) ||
                string.IsNullOrWhiteSpace(adminPassword))
            {
                _logger.LogWarning("System Admin credentials not fully configured in appsettings.json (SystemAdmin:Username, SystemAdmin:Email, SystemAdmin:Password). Skipping admin creation.");
                return;
            }

            // Kiểm tra xem admin đã tồn tại chưa (bằng Username hoặc Email)
            if (!await userRepository.ExistsByUsernameAsync(adminUsername) &&
                !await userRepository.ExistsByEmailAsync(adminEmail))
            {
                _logger.LogInformation("System Admin account not found. Creating new System Admin...");

                var adminUser = new User
                {
                    Id = Guid.NewGuid(),
                    Username = adminUsername,
                    Email = adminEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword), // Hash mật khẩu
                    Role = UserRole.SysAdmin, // Gán vai trò SysAdmin
                    FullName = "System Administrator", // Tên đầy đủ mặc định
                    CreatedAt = DateTime.UtcNow,
                    // Các trường khác có thể để giá trị mặc định
                };

                await userRepository.AddAsync(adminUser);
                await dbContext.SaveChangesAsync(); // Lưu thay đổi

                _logger.LogInformation("System Admin account created successfully with Username: {Username}", adminUsername);
            }
            else
            {
                _logger.LogInformation("System Admin account already exists.");
            }
        }
    }
}