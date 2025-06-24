using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.UserRelated.Domain.Entities;
using Backend.Api.Modules.UserRelated.Domain.Enums;
using Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Data.Seeders
{
    public class UserSeeder : Backend.Api.Data.Seeders.IDataSeeder
    {
        private readonly IUserRepository _userRepository;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<UserSeeder> _logger;
        private readonly IConfiguration _configuration;

        public int Order => 1; // Users should be seeded first

        public UserSeeder(
            IUserRepository userRepository,
            AppDbContext dbContext,
            ILogger<UserSeeder> logger,
            IConfiguration configuration)
        {
            _userRepository = userRepository;
            _dbContext = dbContext;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task SeedAsync()
        {
            await SeedSystemAdminAsync();
            await SeedAdditionalUsersAsync();
        }

        private async Task SeedSystemAdminAsync()
        {
            _logger.LogInformation("Checking for System Admin account...");

            var adminUsername = _configuration["SystemAdmin:Username"];
            var adminEmail = _configuration["SystemAdmin:Email"];
            var adminPassword = _configuration["SystemAdmin:Password"];

            if (string.IsNullOrWhiteSpace(adminUsername) ||
                string.IsNullOrWhiteSpace(adminEmail) ||
                string.IsNullOrWhiteSpace(adminPassword))
            {
                _logger.LogWarning("System Admin credentials not fully configured. Skipping admin creation.");
                return;
            }

            if (!await _userRepository.ExistsByUsernameAsync(adminUsername) &&
                !await _userRepository.ExistsByEmailAsync(adminEmail))
            {
                _logger.LogInformation("Creating System Admin account...");

                var adminUser = new User
                {
                    Id = Guid.NewGuid(),
                    Username = adminUsername,
                    Email = adminEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                    Role = UserRole.SysAdmin,
                    FullName = "System Administrator",
                    CreatedAt = DateTime.UtcNow
                };

                await _userRepository.AddAsync(adminUser);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("System Admin account created successfully.");
            }
        }

        private async Task SeedAdditionalUsersAsync()
        {
            var users = new[]
            {
                new User
                {
                    Id = Guid.Parse("2a000000-0000-0000-0000-000000000002"),
                    Username = "owner1",
                    Email = "owner1@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Role = UserRole.Owner,
                    FullName = "Owner One",
                    Gender = UserGender.Unknown,
                    IsActive = true,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.Parse("3a000000-0000-0000-0000-000000000003"),
                    Username = "testuser",
                    Email = "testuser@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Role = UserRole.User,
                    FullName = "Test User",
                    Gender = UserGender.Unknown,
                    IsActive = true,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.Parse("4a000000-0000-0000-0000-000000000004"),
                    Username = "user1",
                    Email = "user1@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Role = UserRole.User,
                    FullName = "User One",
                    Gender = UserGender.Unknown,
                    IsActive = true,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow
                }
            };

            foreach (var user in users)
            {
                // Tìm người dùng hiện có bằng ID đã xác định
                var existingUser = await _dbContext.Set<User>().FindAsync(user.Id);

                if (existingUser == null)
                {
                    // Nếu không tồn tại, thêm mới
                    _logger.LogInformation("Creating user account for {Username}...", user.Username);
                    await _userRepository.AddAsync(user);
                }
                else
                {
                    // Nếu tồn tại, kiểm tra và cập nhật các trường cần thiết
                    bool needsUpdate = false;
                    if (existingUser.FullName != user.FullName) { existingUser.FullName = user.FullName; needsUpdate = true; }
                    if (existingUser.Role != user.Role) { existingUser.Role = user.Role; needsUpdate = true; }
                    if (existingUser.IsActive != user.IsActive) { existingUser.IsActive = user.IsActive; needsUpdate = true; }
                    // Không cập nhật mật khẩu ở đây để tránh ghi đè mật khẩu mà người dùng có thể đã thay đổi.

                    if (needsUpdate)
                    {
                        _logger.LogInformation("Updating user account for {Username}...", existingUser.Username);
                        _userRepository.Update(existingUser);
                    }
                }
            }

            await _dbContext.SaveChangesAsync(); // Lưu tất cả các thay đổi (thêm mới và cập nhật) một lần
            _logger.LogInformation("Additional users seeded successfully.");
        }
    }
}
