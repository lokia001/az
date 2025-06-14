// File: Backend.Api/Modules/SpaceBooking/Infrastructure/Persistence/Configurations/SpaceCustomAmenityConfiguration.cs
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Configurations
{
    public class SpaceCustomAmenityConfiguration : IEntityTypeConfiguration<SpaceCustomAmenity>
    {
        public void Configure(EntityTypeBuilder<SpaceCustomAmenity> builder)
        {
            builder.ToTable("SpaceCustomAmenities", "space_booking");

            builder.HasKey(ca => ca.Id);

            builder.Property(ca => ca.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(e => e.IsDeleted)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.HasQueryFilter(e => !e.IsDeleted);

            // Mối quan hệ với Space đã được cấu hình từ SpaceConfiguration (HasMany)
            // Hoặc có thể định nghĩa ở đây:
            // builder.HasOne(ca => ca.Space)
            //        .WithMany(s => s.CustomAmenities)
            //        .HasForeignKey(ca => ca.SpaceId)
            //        .IsRequired(); // Đảm bảo SpaceId không null
        }
    }
}