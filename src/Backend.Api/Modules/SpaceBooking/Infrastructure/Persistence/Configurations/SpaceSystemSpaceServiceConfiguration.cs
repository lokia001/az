// File: Backend.Api/Modules/SpaceBooking/Infrastructure/Persistence/Configurations/SpaceSystemSpaceServiceConfiguration.cs
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Configurations
{
    public class SpaceSystemSpaceServiceConfiguration : IEntityTypeConfiguration<SpaceSystemSpaceService>
    {
        public void Configure(EntityTypeBuilder<SpaceSystemSpaceService> builder)
        {
            builder.ToTable("SpaceSystemSpaceServices", "space_booking");

            // *** ĐỊNH NGHĨA KHÓA CHÍNH KẾT HỢP ***
            builder.HasKey(sss => new { sss.SpaceId, sss.SystemSpaceServiceId });

            // Cấu hình mối quan hệ từ bảng join đến Space
            builder.HasOne(sss => sss.Space)
                   .WithMany(s => s.SystemServicesLink) // Trỏ đến ICollection trong Space entity
                   .HasForeignKey(sss => sss.SpaceId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Cấu hình mối quan hệ từ bảng join đến SystemSpaceService
            builder.HasOne(sss => sss.SystemSpaceService)
                   .WithMany(ss => ss.SpaceLinks) // Trỏ đến ICollection trong SystemSpaceService entity
                   .HasForeignKey(sss => sss.SystemSpaceServiceId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Cấu hình các thuộc tính bổ sung của bảng join
            builder.Property(sss => sss.PriceOverride)
                .HasColumnType("decimal(18,2)");

            builder.Property(sss => sss.Notes)
                .HasMaxLength(500);

            builder.Property(sss => sss.IsIncludedInBasePrice)
                .IsRequired(); // bool thường không cần cấu hình nhiều


        }
    }
}