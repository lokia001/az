// File: Backend.Api/Modules/SpaceBooking/Infrastructure/Persistence/Configurations/SystemSpaceServiceConfiguration.cs
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Configurations
{
    public class SystemSpaceServiceConfiguration : IEntityTypeConfiguration<SystemSpaceService>
    {
        public void Configure(EntityTypeBuilder<SystemSpaceService> builder)
        {
            builder.ToTable("SystemSpaceServices", "space_booking");

            builder.HasKey(ss => ss.Id);

            builder.Property(ss => ss.Name)
                .IsRequired()
                .HasMaxLength(100);
            builder.HasIndex(ss => ss.Name).IsUnique(); // Tên dịch vụ hệ thống nên là duy nhất

            builder.Property(ss => ss.Description)
                .HasMaxLength(500);


        }
    }
}