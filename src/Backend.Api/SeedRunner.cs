// File: Backend.Api/SeedRunner.cs
using System;
using System.Threading.Tasks;
using Backend.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Backend.Api
{
    public class SeedRunner
    {
        public static async Task<int> Main(string[] args)
        {
            Console.WriteLine("Starting amenity and service data seeding...");

            try
            {
                // Setup dependency injection
                var services = new ServiceCollection();

                // Register database services
                services.AddDbContext<AppDbContext>(options =>
                    options.UseSqlite("Data Source=app_development.db"));

                // Register logging
                services.AddLogging(builder =>
                {
                    builder.AddConsole();
                    builder.SetMinimumLevel(LogLevel.Information);
                });

                // Build service provider
                var serviceProvider = services.BuildServiceProvider();

                // Run the seeding
                await SeedAmenityAndService.SeedAmenityAndServiceData(serviceProvider);

                Console.WriteLine("Data seeding completed successfully!");
                return 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during data seeding: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return 1;
            }
        }
    }
}
