// File: Backend.Api/Modules/SpaceBooking/Infrastructure/Persistence/Configurations/SpaceSystemAmenityConfiguration.cs
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Configurations
{
    public class SpaceSystemAmenityConfiguration : IEntityTypeConfiguration<SpaceSystemAmenity>
    {
        public void Configure(EntityTypeBuilder<SpaceSystemAmenity> builder)
        {
            builder.ToTable("SpaceSystemAmenities", "space_booking");

            // Định nghĩa khóa chính kết hợp
            builder.HasKey(ssa => new { ssa.SpaceId, ssa.SystemAmenityId });

            // Cấu hình mối quan hệ từ bảng join đến Space
            builder.HasOne(ssa => ssa.Space)
                   .WithMany(s => s.SystemAmenitiesLink) // Trỏ đến ICollection trong Space entity
                   .HasForeignKey(ssa => ssa.SpaceId)
                   .OnDelete(DeleteBehavior.Cascade); // Nếu Space bị xóa, các liên kết này cũng bị xóa

            // Cấu hình mối quan hệ từ bảng join đến SystemAmenity
            builder.HasOne(ssa => ssa.SystemAmenity)
                   .WithMany(sa => sa.SpaceLinks) // Trỏ đến ICollection trong SystemAmenity entity
                   .HasForeignKey(ssa => ssa.SystemAmenityId)
                   .OnDelete(DeleteBehavior.Cascade); // Nếu SystemAmenity bị xóa, các liên kết này cũng bị xóa




        }
    }
}