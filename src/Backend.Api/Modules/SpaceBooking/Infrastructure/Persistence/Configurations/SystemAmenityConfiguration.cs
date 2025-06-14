// File: Backend.Api/Modules/SpaceBooking/Infrastructure/Persistence/Configurations/SystemAmenityConfiguration.cs
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Configurations
{
    public class SystemAmenityConfiguration : IEntityTypeConfiguration<SystemAmenity>
    {
        public void Configure(EntityTypeBuilder<SystemAmenity> builder)
        {
            builder.ToTable("SystemAmenities", "space_booking");

            builder.HasKey(sa => sa.Id);

            builder.Property(sa => sa.Name)
                .IsRequired()
                .HasMaxLength(100);
            builder.HasIndex(sa => sa.Name).IsUnique(); // Tên tiện ích hệ thống nên là duy nhất

            builder.Property(sa => sa.Description)
                .HasMaxLength(500);

            builder.Property(sa => sa.IconUrl)
                .HasMaxLength(255);

        }
    }
}