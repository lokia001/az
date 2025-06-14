// File: Backend.Api/Data/SeedAmenityAndService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Api.Data;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Data
{
    public static class SeedAmenityAndService
    {
        public static async Task SeedAmenityAndServiceData(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

                try
                {
                    // Check if we already have amenities and services
                    if (!await dbContext.Set<SystemAmenity>().AnyAsync() && !await dbContext.Set<SystemSpaceService>().AnyAsync())
                    {
                        logger.LogInformation("Starting to seed amenities and services data...");
                        
                        // Seed SystemAmenity data
                        var amenities = new List<SystemAmenity>
                        {
                            new SystemAmenity 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Wi-Fi", 
                                Description = "High-speed wireless internet connection", 
                                IconUrl = "/icons/wifi.png" 
                            },
                            new SystemAmenity 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Air Conditioning", 
                                Description = "Climate control system for comfort", 
                                IconUrl = "/icons/air-conditioning.png" 
                            },
                            new SystemAmenity 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Projector", 
                                Description = "HD projector for presentations", 
                                IconUrl = "/icons/projector.png" 
                            },
                            new SystemAmenity 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Whiteboard", 
                                Description = "Large whiteboard with markers", 
                                IconUrl = "/icons/whiteboard.png" 
                            },
                            new SystemAmenity 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Coffee Machine", 
                                Description = "Premium coffee machine with various options", 
                                IconUrl = "/icons/coffee.png" 
                            },
                            new SystemAmenity 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Parking", 
                                Description = "Free on-site parking for guests", 
                                IconUrl = "/icons/parking.png" 
                            },
                            new SystemAmenity 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Kitchen Access", 
                                Description = "Access to a fully equipped kitchen", 
                                IconUrl = "/icons/kitchen.png" 
                            },
                            new SystemAmenity 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Restrooms", 
                                Description = "Clean private restrooms", 
                                IconUrl = "/icons/restroom.png" 
                            },
                            new SystemAmenity 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "TV/Monitor", 
                                Description = "Large screen TV/Monitor for presentations", 
                                IconUrl = "/icons/tv.png" 
                            },
                            new SystemAmenity 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Wheelchair Access", 
                                Description = "Easy access for persons with disabilities", 
                                IconUrl = "/icons/wheelchair.png" 
                            }
                        };

                        // Seed SystemSpaceService data
                        var services = new List<SystemSpaceService>
                        {
                            new SystemSpaceService 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Cleaning Service", 
                                Description = "Professional cleaning before and after events" 
                            },
                            new SystemSpaceService 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Catering", 
                                Description = "Food and beverage service options" 
                            },
                            new SystemSpaceService 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Technical Support", 
                                Description = "On-site technical assistance for AV equipment" 
                            },
                            new SystemSpaceService 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Event Setup", 
                                Description = "Setup of furniture and equipment for your event" 
                            },
                            new SystemSpaceService 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Security", 
                                Description = "Security personnel during the event" 
                            },
                            new SystemSpaceService 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Reception", 
                                Description = "Front desk reception services for guests" 
                            },
                            new SystemSpaceService 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Photography", 
                                Description = "Professional event photography" 
                            },
                            new SystemSpaceService 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Printing", 
                                Description = "Printing and copying services for attendees" 
                            },
                            new SystemSpaceService 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Decoration", 
                                Description = "Event space decoration services" 
                            },
                            new SystemSpaceService 
                            { 
                                Id = Guid.NewGuid(), 
                                Name = "Shuttle Service", 
                                Description = "Transportation to and from nearby locations" 
                            }
                        };

                        // Add to database and save
                        await dbContext.AddRangeAsync(amenities);
                        await dbContext.AddRangeAsync(services);
                        await dbContext.SaveChangesAsync();

                        logger.LogInformation("Successfully seeded amenity and service data.");
                    }
                    else
                    {
                        logger.LogInformation("Amenities or services already exist, skipping seeding.");
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An error occurred while seeding amenities and services.");
                    throw;
                }
            }
        }
    }
}
