// File: Backend.Api/Data/DatabaseInitializer.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Api.Data.Seeders;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Data
{
    public class DatabaseInitializer
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DatabaseInitializer> _logger;

        public DatabaseInitializer(
            IServiceProvider serviceProvider,
            ILogger<DatabaseInitializer> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task InitializeAsync()
        {
            // Tạo một scope mới để resolve các scoped services (như DbContext và các seeder).
            // Điều này rất quan trọng vì InitializeAsync được gọi khi ứng dụng khởi động,
            // nằm ngoài scope của một HTTP request thông thường.
            using (var scope = _serviceProvider.CreateScope())
            {
                var scopedProvider = scope.ServiceProvider;
                var dbContext = scopedProvider.GetRequiredService<AppDbContext>();

                try
                {
                    _logger.LogInformation("Attempting to apply migrations and initialize database...");

                    // Áp dụng các migrations đang chờ xử lý vào database.
                    // Đây là cách tiếp cận được khuyến nghị cho môi trường production.
                    await dbContext.Database.MigrateAsync();

                    _logger.LogInformation("Database migrations applied successfully (if any).");

                    // Tự động tìm tất cả các service đã đăng ký với interface IDataSeeder.
                    var seeders = scopedProvider.GetServices<IDataSeeder>().OrderBy(s => s.Order);

                    _logger.LogInformation("Found {SeederCount} data seeders to run.", seeders.Count());

                    // Thực thi từng seeder theo thứ tự đã định nghĩa.
                    foreach (var seeder in seeders)
                    {
                        _logger.LogInformation("Running seeder: {SeederName}...", seeder.GetType().Name);
                        await seeder.SeedAsync();
                        _logger.LogInformation("Seeder {SeederName} completed.", seeder.GetType().Name);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while initializing the database.");
                    // Việc throw lại exception là quan trọng để ngăn ứng dụng khởi động
                    // trong trạng thái có thể không hợp lệ.
                    throw;
                }
            }
        }
    }
}