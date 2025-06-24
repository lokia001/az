using System;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Data.Seeders
{
    public class SystemAmenitySeeder : IDataSeeder
    {
        private readonly ISystemAmenityRepository _systemAmenityRepository;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<SystemAmenitySeeder> _logger;

        public SystemAmenitySeeder(
            ISystemAmenityRepository systemAmenityRepository,
            AppDbContext dbContext,
            ILogger<SystemAmenitySeeder> logger)
        {
            _systemAmenityRepository = systemAmenityRepository;
            _dbContext = dbContext;
            _logger = logger;
        }

        public int Order => 2; // After users, before services

        public async Task SeedAsync()
        {
            _logger.LogInformation("Checking for system amenities...");

            var amenities = new[]
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

            foreach (var amenity in amenities)
            {
                if (!await _systemAmenityRepository.ExistsByNameAsync(amenity.Name))
                {
                    _logger.LogInformation("Creating system amenity: {Name}...", amenity.Name);
                    await _systemAmenityRepository.AddAsync(amenity);
                }
            }

            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("System amenities seeded successfully.");
        }
    }
}
