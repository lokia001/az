using Microsoft.EntityFrameworkCore;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.UserRelated.Domain.Entities;
using Backend.Api.Modules.Logging.Domain.Entities;
using Backend.Api.Modules.Engagement.Domain.Entities;
using Backend.Api.Modules.CommunityContent.Domain.Entities;

namespace Backend.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // SpaceBooking Module DbSets
        public DbSet<Space> Spaces { get; set; } = default!;
        public DbSet<Booking> Bookings { get; set; } = default!;
        public DbSet<SpaceImage> SpaceImages { get; set; } = default!;
        public DbSet<SpaceIcalSetting> SpaceIcalSettings { get; set; } = default!;
        public DbSet<SystemAmenity> SystemAmenities { get; set; } = default!;
        public DbSet<SystemSpaceService> SystemSpaceServices { get; set; } = default!;
        public DbSet<SpaceCustomAmenity> SpaceCustomAmenities { get; set; } = default!;
        public DbSet<SpaceCustomService> SpaceCustomServices { get; set; } = default!;
        public DbSet<SpaceSystemAmenity> SpaceSystemAmenities { get; set; } = default!;
        public DbSet<SpaceSystemSpaceService> SpaceSystemSpaceServices { get; set; } = default!;

        // UserRelated Module DbSets
        public DbSet<User> Users { get; set; } = default!;
        public DbSet<OwnerProfile> OwnerProfiles { get; set; } = default!;

        // Engagement Module DbSets
        public DbSet<Review> Reviews { get; set; } = default!;
        public DbSet<Comment> Comments { get; set; } = default!;
        public DbSet<Reaction> Reactions { get; set; } = default!;

        // CommunityContent Module DbSets
        public DbSet<Post> Posts { get; set; } = default!;
        public DbSet<Community> Communities { get; set; } = default!;
        public DbSet<CommunityMember> CommunityMembers { get; set; } = default!;

        // Logging Module DbSets
        public DbSet<SystemLog> SystemLogs { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Apply all entity configurations from all modules automatically
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
    }
}