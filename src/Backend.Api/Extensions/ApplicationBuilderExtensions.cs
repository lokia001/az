// Backend.Api/Extensions/ApplicationBuilderExtensions.cs
using Backend.Api.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;

namespace Backend.Api.Extensions
{
    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder SeedDatabase(this IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                using (var serviceScope = app.ApplicationServices.CreateScope())
                {
                    var context = serviceScope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var logger = serviceScope.ServiceProvider.GetRequiredService<ILogger<Program>>();

                    try
                    {
                        // Ensure database is created
                        context.Database.EnsureCreated();
                        logger.LogInformation("Database is created successfully");

                        // Apply migrations if any are pending
                        if (context.Database.GetPendingMigrations().Any())
                        {
                            logger.LogInformation("Applying migrations...");
                            context.Database.Migrate();
                            logger.LogInformation("Finished applying migrations.");
                        }



                        else
                        {
                            logger.LogInformation("Database already has data, skipping seeding.");
                        }
                    }
                    catch (Exception e)
                    {
                        logger.LogError(e, "Failed to seed the database.");
                    }
                }
            }
            return app;
        }
    }
}