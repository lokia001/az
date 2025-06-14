// File: Backend.Api/Modules/SpaceBooking/Infrastructure/Persistence/Configurations/SpaceCustomServiceConfiguration.cs
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Configurations
{
    public class SpaceCustomServiceConfiguration : IEntityTypeConfiguration<SpaceCustomService>
    {
        public void Configure(EntityTypeBuilder<SpaceCustomService> builder)
        {
            builder.ToTable("SpaceCustomServices", "space_booking");

            builder.HasKey(cs => cs.Id);

            builder.Property(cs => cs.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(cs => cs.Price)
                .HasColumnType("decimal(18,2)"); // Nullable decimal

            builder.Property(cs => cs.Notes)
                .HasMaxLength(500);

            builder.Property(e => e.IsDeleted)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.HasQueryFilter(e => !e.IsDeleted);

            // Mối quan hệ với Space đã được cấu hình từ SpaceConfiguration (s.CustomServices)
            // Hoặc bạn có thể thêm ở đây để rõ ràng:
            // builder.HasOne(cs => cs.Space)
            //        .WithMany(s => s.CustomServices)
            //        .HasForeignKey(cs => cs.SpaceId)
            //        .IsRequired();
        }
    }
}