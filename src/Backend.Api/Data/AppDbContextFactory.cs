
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace Backend.Api.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
            var basePath = Directory.GetCurrentDirectory(); // Điều chỉnh đường dẫn nếu cần
            Console.WriteLine($"===>[AppDbContextFactory] BasePath for configuration: {basePath}");

            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json")
                .AddJsonFile($"appsettings.{environmentName}.json", optional: true) // Load file cấu hình theo môi trường
.AddEnvironmentVariables()
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            Console.WriteLine($"===> [AppDbContextFactory] Connection string from factory: {connectionString}");
            // Sử dụng query splitting để ngăn vấn đề "cartesian explosion" khi include nhiều collection.
            // Điều này giải quyết cảnh báo 'MultipleCollectionIncludeWarning' thấy trong log khi seeding.
            optionsBuilder.UseSqlite(connectionString,
                o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)
            )

            .LogTo(message => System.Diagnostics.Debug.WriteLine(message), LogLevel.Information)
           // Log ra Debug output
           // Hoặc LogTo(Console.WriteLine, LogLevel.Information) // Log ra Console
           .EnableSensitiveDataLogging(); // CHỈ DÙNG CHO DEVELOPMENT


            return new AppDbContext(optionsBuilder.Options);
        }
    }
}