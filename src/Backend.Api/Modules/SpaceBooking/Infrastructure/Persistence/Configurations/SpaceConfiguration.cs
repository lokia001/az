// File: Backend.Api/Modules/SpaceBooking/Infrastructure/Persistence/Configurations/SpaceConfiguration.cs
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Enums; // Cho SpaceType, SpaceStatus
using Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Configurations
{
    public class SpaceConfiguration : IEntityTypeConfiguration<Space>
    {
        public void Configure(EntityTypeBuilder<Space> builder)
        {
            builder.ToTable("Spaces", "space_booking");

            builder.HasKey(s => s.Id);

            builder.Property(s => s.Name)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(s => s.Description)
                .HasMaxLength(2000); // Độ dài lớn hơn cho mô tả

            builder.Property(s => s.Address)
                .IsRequired()
                .HasMaxLength(500);


            builder.Property(s => s.Latitude)
                            .HasColumnType("decimal(9,6)"); // Ví dụ: 9 chữ số tổng, 6 chữ số sau dấu phẩy (đủ cho hầu hết tọa độ)
                                                            // Điều chỉnh nếu cần độ chính xác khác

            builder.Property(s => s.Longitude)
                .HasColumnType("decimal(9,6)"); // Ví dụ: 9 chữ số tổng, 6 chữ số sau dấu phẩy



            builder.Property(s => s.Type)
                .IsRequired()
                .HasMaxLength(50)
                .HasConversion(new SpaceTypeConverter())
                .HasDefaultValue(SpaceType.Individual);

            builder.Property(s => s.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasConversion(
                    v => v.ToString(),
                    v => (SpaceStatus)Enum.Parse(typeof(SpaceStatus), v))
                .HasDefaultValue(SpaceStatus.Available);

            builder.Property(s => s.Capacity)
                .IsRequired();

            // Pricing
            builder.Property(s => s.PricePerHour)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(s => s.PricePerDay)
                .HasColumnType("decimal(18,2)"); // Nullable

            // Time & Booking Constraints
            // TimeSpan được map tự động, không cần cấu hình đặc biệt trừ khi muốn kiểu dữ liệu DB khác
            // Các trường int như MinBookingDurationMinutes, etc. cũng được map tự động

            builder.Property(s => s.AccessInstructions)
                .HasMaxLength(1000);

            builder.Property(s => s.HouseRules)
                .HasMaxLength(1000);

            builder.Property(s => s.Slug)
                .HasMaxLength(250);
            builder.HasIndex(s => s.Slug).IsUnique(); // Slug phải là duy nhất

            // Foreign Keys & Audit
            builder.Property(s => s.OwnerId).IsRequired();
            // Không cần định nghĩa HasOne/WithMany ở đây cho OwnerId vì nó trỏ đến module khác
            // Mối quan hệ này sẽ chỉ là ở mức ID.

            builder.Property(s => s.CreatedByUserId).IsRequired();
            // Tương tự cho CreatedByUserId và LastEditedByUserId

            // Navigation Properties (Nội bộ module SpaceBooking)

            // 1-N: Space -> SpaceImages
            builder.HasMany(s => s.SpaceImages)
                   .WithOne(img => img.Space)
                   .HasForeignKey(img => img.SpaceId)
                   .OnDelete(DeleteBehavior.Cascade); // Nếu xóa Space, xóa luôn ảnh

            // 1-N: Space -> Bookings
            builder.HasMany(s => s.Bookings)
                   .WithOne(b => b.Space)
                   .HasForeignKey(b => b.SpaceId)
                   .OnDelete(DeleteBehavior.Restrict); // Không cho xóa Space nếu còn Booking (hoặc Cascade tùy nghiệp vụ)

            // 1-N: Space -> SpaceCustomAmenities
            builder.HasMany(s => s.CustomAmenities)
                   .WithOne(ca => ca.Space)
                   .HasForeignKey(ca => ca.SpaceId)
                   .OnDelete(DeleteBehavior.Cascade);

            // 1-N: Space -> SpaceCustomServices
            builder.HasMany(s => s.CustomServices)
                   .WithOne(cs => cs.Space)
                   .HasForeignKey(cs => cs.SpaceId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.Property(s => s.IsDeleted).IsRequired().HasDefaultValue(false);
            builder.HasQueryFilter(s => !s.IsDeleted);


            // Many-to-Many: Space <-> SystemAmenity (thông qua SpaceSystemAmenity)
            // Cấu hình này sẽ nằm trong SpaceSystemAmenityConfiguration

            // Many-to-Many: Space <-> SystemSpaceService (thông qua SpaceSystemSpaceService)
            // Cấu hình này sẽ nằm trong SpaceSystemSpaceServiceConfiguration
        }
    }
}