using System;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Data.Seeders
{
    public class SystemSpaceServiceSeeder : IDataSeeder
    {
        private readonly ISystemSpaceServiceRepository _systemSpaceServiceRepository;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<SystemSpaceServiceSeeder> _logger;

        public SystemSpaceServiceSeeder(
            ISystemSpaceServiceRepository systemSpaceServiceRepository,
            AppDbContext dbContext,
            ILogger<SystemSpaceServiceSeeder> logger)
        {
            _systemSpaceServiceRepository = systemSpaceServiceRepository;
            _dbContext = dbContext;
            _logger = logger;
        }

        public int Order => 3; // After amenities

        public async Task SeedAsync()
        {
            _logger.LogInformation("Checking for system space services...");

            var services = new[]
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

            foreach (var service in services)
            {
                if (!await _systemSpaceServiceRepository.ExistsByNameAsync(service.Name))
                {
                    _logger.LogInformation("Creating system space service: {Name}...", service.Name);
                    await _systemSpaceServiceRepository.AddAsync(service);
                }
            }

            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("System space services seeded successfully.");
        }
    }
}
