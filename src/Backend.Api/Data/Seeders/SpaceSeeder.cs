using System;
using System.Linq;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.UserRelated.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Enums;
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories;
using Backend.Api.Modules.UserRelated.Domain.Enums;
using Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Data.Seeders
{
    public class SpaceSeeder : IDataSeeder
    {
        private readonly ISpaceRepository _spaceRepository;
        private readonly IUserRepository _userRepository;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<SpaceSeeder> _logger;

        public SpaceSeeder(
            ISpaceRepository spaceRepository,
            IUserRepository userRepository,
            AppDbContext dbContext,
            ILogger<SpaceSeeder> logger)
        {
            _spaceRepository = spaceRepository ?? throw new ArgumentNullException(nameof(spaceRepository));
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public int Order => 4; // Chạy sau khi đã seed users, amenities và services

        public async Task SeedAsync()
        {
            _logger.LogInformation("Seeding sample spaces...");

            // Tìm một owner để gán spaces
            var owners = await _userRepository.GetUsersByRoleAsync(UserRole.Owner);
            var owner = owners.FirstOrDefault();
            if (owner == null)
            {
                _logger.LogWarning("No owner found to assign spaces to. Creating an owner...");
                owner = new User
                {
                    Username = "sampleowner",
                    Email = "owner@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("sample123"),
                    Role = UserRole.Owner,
                    IsActive = true,
                    FullName = "Sample Owner"
                };
                await _userRepository.AddAsync(owner);
                await _dbContext.SaveChangesAsync();
            }

            // Sample spaces data
            var sampleSpaces = new List<Space>();

            // Space 1: Cozy Individual Desk
            var space1 = new Space
            {
                Name = "Cozy Individual Desk",
                Description = "Perfect for focused individual work",
                Address = "123 Main Street, Floor 2",
                Type = SpaceType.Individual,
                Status = SpaceStatus.Available,
                Capacity = 1,
                PricePerHour = 10.00M,
                PricePerDay = 70.00M,
                OpenTime = TimeSpan.FromHours(8),
                CloseTime = TimeSpan.FromHours(20),
                MinBookingDurationMinutes = 60,
                MaxBookingDurationMinutes = 480,
                OwnerId = owner.Id,
                CreatedByUserId = owner.Id,
                AccessInstructions = "Use keycard at main entrance. Desk is #A101.",
                HouseRules = "Please keep noise to a minimum."
            };

            var spaceImages1 = new[]
            {
                new SpaceImage
                {
                    ImageUrl = "/images/spaces/cozy-desk-main.jpg",
                    Caption = "Modern individual workspace with natural lighting",
                    IsCoverImage = true,
                    DisplayOrder = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new SpaceImage
                {
                    ImageUrl = "/images/spaces/cozy-desk-angle.jpg",
                    Caption = "Desk setup with ergonomic chair and monitor stand",
                    IsCoverImage = false,
                    DisplayOrder = 1,
                    CreatedAt = DateTime.UtcNow
                },
                new SpaceImage
                {
                    ImageUrl = "/images/spaces/cozy-desk-environment.jpg",
                    Caption = "Quiet surroundings perfect for focused work",
                    IsCoverImage = false,
                    DisplayOrder = 2,
                    CreatedAt = DateTime.UtcNow
                }
            };

            space1.SpaceImages.Clear();
            foreach (var image in spaceImages1)
            {
                space1.SpaceImages.Add(image);
            }

            new List<SpaceCustomAmenity> { 
                new() { Name = "Ergonomic Chair" }, 
                new() { Name = "Desk Lamp" }, 
                new() { Name = "Monitor Stand" } 
            }.ForEach(a => space1.CustomAmenities.Add(a));

            new List<SpaceCustomService> { 
                new() { 
                    Name = "Desktop Monitor Rental", 
                    Price = 5.00M, 
                    IsIncludedInBasePrice = false, 
                    Notes = "24-inch monitor available on request" 
                },
                new() { 
                    Name = "Mail Handling", 
                    Price = 0M, 
                    IsIncludedInBasePrice = true, 
                    Notes = "Basic mail collection service included" 
                }
            }.ForEach(s => space1.CustomServices.Add(s));

            sampleSpaces.Add(space1);

            // Space 2: Creative Meeting Room
            var space2 = new Space
            {
                Name = "Creative Meeting Room",
                Description = "Modern meeting room with whiteboard wall and projector",
                Address = "123 Main Street, Floor 3",
                Type = SpaceType.MeetingRoom,
                Status = SpaceStatus.Available,
                Capacity = 8,
                PricePerHour = 30.00M,
                PricePerDay = 200.00M,
                OpenTime = TimeSpan.FromHours(8),
                CloseTime = TimeSpan.FromHours(20),
                MinBookingDurationMinutes = 30,
                MaxBookingDurationMinutes = 240,
                OwnerId = owner.Id,
                CreatedByUserId = owner.Id,
                AccessInstructions = "Use meeting room code 2468#",
                HouseRules = "Please clean whiteboard after use."
            };

            var spaceImages2 = new[]
            {
                new SpaceImage
                {
                    ImageUrl = "/images/spaces/meeting-room-main.jpg",
                    Caption = "Spacious meeting room with modern AV equipment",
                    IsCoverImage = true,
                    DisplayOrder = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new SpaceImage
                {
                    ImageUrl = "/images/spaces/meeting-room-board.jpg",
                    Caption = "Interactive whiteboard wall for brainstorming",
                    IsCoverImage = false,
                    DisplayOrder = 1,
                    CreatedAt = DateTime.UtcNow
                },
                new SpaceImage
                {
                    ImageUrl = "/images/spaces/meeting-room-seating.jpg",
                    Caption = "Comfortable seating arrangement for 8 people",
                    IsCoverImage = false,
                    DisplayOrder = 2,
                    CreatedAt = DateTime.UtcNow
                }
            };

            space2.SpaceImages.Clear();
            foreach (var image in spaceImages2)
            {
                space2.SpaceImages.Add(image);
            }

            new List<SpaceCustomAmenity> { 
                new() { Name = "Interactive Display" }, 
                new() { Name = "Conference Phone" }, 
                new() { Name = "Magnetic Glass Board" } 
            }.ForEach(a => space2.CustomAmenities.Add(a));

            new List<SpaceCustomService> { 
                new() { 
                    Name = "Video Conferencing Setup", 
                    Price = 15.00M, 
                    IsIncludedInBasePrice = false, 
                    Notes = "Professional camera and mic setup" 
                },
                new() { 
                    Name = "Meeting Facilitation", 
                    Price = 50.00M, 
                    IsIncludedInBasePrice = false, 
                    Notes = "Professional facilitator available" 
                },
                new() { 
                    Name = "Recording Service", 
                    Price = 20.00M, 
                    IsIncludedInBasePrice = false, 
                    Notes = "Meeting recording and transcript" 
                }
            }.ForEach(s => space2.CustomServices.Add(s));

            sampleSpaces.Add(space2);

            // Space 3: Startup Office Suite
            var space3 = new Space
            {
                Name = "Startup Office Suite",
                Description = "Fully furnished office space for small teams",
                Address = "456 Innovation Drive",
                Type = SpaceType.EntireOffice,
                Status = SpaceStatus.Available,
                Capacity = 15,
                PricePerHour = 50.00M,
                PricePerDay = 350.00M,
                OpenTime = TimeSpan.FromHours(0),
                CloseTime = TimeSpan.FromHours(24),
                MinBookingDurationMinutes = 480,
                MaxBookingDurationMinutes = 10080,
                OwnerId = owner.Id,
                CreatedByUserId = owner.Id,
                AccessInstructions = "Key fob will be provided upon booking confirmation",
                HouseRules = "24/7 access. Please ensure all doors are locked when leaving."
            };

            var spaceImages3 = new[]
            {
                new SpaceImage
                {
                    ImageUrl = "/images/spaces/office-suite-main.jpg",
                    Caption = "Modern, fully-furnished open office space",
                    IsCoverImage = true,
                    DisplayOrder = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new SpaceImage
                {
                    ImageUrl = "/images/spaces/office-suite-kitchen.jpg",
                    Caption = "Fully equipped kitchen and break area",
                    IsCoverImage = false,
                    DisplayOrder = 1,
                    CreatedAt = DateTime.UtcNow
                },
                new SpaceImage
                {
                    ImageUrl = "/images/spaces/office-suite-meeting.jpg",
                    Caption = "Private meeting rooms and phone booths",
                    IsCoverImage = false,
                    DisplayOrder = 2,
                    CreatedAt = DateTime.UtcNow
                }
            };

            space3.SpaceImages.Clear();
            foreach (var image in spaceImages3)
            {
                space3.SpaceImages.Add(image);
            }

            new List<SpaceCustomAmenity> { 
                new() { Name = "Private Kitchen" }, 
                new() { Name = "Phone Booth" }, 
                new() { Name = "Storage Lockers" }, 
                new() { Name = "Reception Area" } 
            }.ForEach(a => space3.CustomAmenities.Add(a));

            new List<SpaceCustomService> { 
                new() { 
                    Name = "Daily Office Cleaning", 
                    Price = 0M, 
                    IsIncludedInBasePrice = true, 
                    Notes = "Included in base price" 
                },
                new() { 
                    Name = "IT Support", 
                    Price = 75.00M, 
                    IsIncludedInBasePrice = false, 
                    Notes = "Available on-call during business hours" 
                },
                new() { 
                    Name = "Virtual Office Service", 
                    Price = 100.00M, 
                    IsIncludedInBasePrice = false, 
                    Notes = "Mail handling and business address" 
                },
                new() { 
                    Name = "Office Management", 
                    Price = 200.00M, 
                    IsIncludedInBasePrice = false, 
                    Notes = "Full-time office manager service" 
                }
            }.ForEach(s => space3.CustomServices.Add(s));

            sampleSpaces.Add(space3);

            foreach (var space in sampleSpaces)
            {
                if (!await _spaceRepository.ExistsByNameAndOwnerAsync(space.Name, space.OwnerId))
                {
                    await _spaceRepository.AddAsync(space);
                    _logger.LogInformation($"Added space: {space.Name} with {space.SpaceImages.Count} images");
                }
            }

            try
            {
                await _dbContext.SaveChangesAsync();
                _logger.LogInformation("Sample spaces and their images seeding completed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while seeding spaces and images");
                throw;
            }
        }
    }
}
