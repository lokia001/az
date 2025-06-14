// Backend.Api/Data/AppDbContext.cs // Đường dẫn có thể khác tùy thuộc vào cấu trúc dự án của bạn

using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.UserRelated.Domain.Entities;
namespace Backend.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
 
        public DbSet<Booking> Bookings { get; set; } = default!;
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            #region Apply Entity Configurations
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            // modelBuilder.ApplyConfiguration(new UserConfiguration());
            // modelBuilder.ApplyConfiguration(new OwnerProfileConfiguration());

            // modelBuilder.ApplyConfiguration(new SpaceConfiguration());
            // modelBuilder.ApplyConfiguration(new SpaceImageConfiguration());
            // modelBuilder.ApplyConfiguration(new SpaceAmenityConfiguration());
            // modelBuilder.ApplyConfiguration(new SpaceServiceConfiguration());
            // modelBuilder.ApplyConfiguration(new ServiceEntityConfiguration());
            // modelBuilder.ApplyConfiguration(new SpaceServiceConfiguration());
            // modelBuilder.ApplyConfiguration(new SpaceDamageReportConfiguration());
            // modelBuilder.ApplyConfiguration(new PaymentConfiguration());
            // modelBuilder.ApplyConfiguration(new ReviewConfiguration());

            // modelBuilder.ApplyConfiguration(new BookingConfiguration());
            // Ví dụ: modelBuilder.ApplyConfiguration(new SomeOtherEntityConfiguration());
            #endregion
        }
    }
} 