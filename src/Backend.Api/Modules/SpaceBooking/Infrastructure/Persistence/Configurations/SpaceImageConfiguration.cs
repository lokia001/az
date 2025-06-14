// File: Backend.Api/Modules/SpaceBooking/Infrastructure/Persistence/Configurations/SpaceImageConfiguration.cs
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Configurations
{
    public class SpaceImageConfiguration : IEntityTypeConfiguration<SpaceImage>
    {
        public void Configure(EntityTypeBuilder<SpaceImage> builder)
        {
            builder.ToTable("SpaceImages", "space_booking");

            builder.HasKey(si => si.Id);

            builder.Property(si => si.ImageUrl)
                .IsRequired()
                .HasMaxLength(2048); // Độ dài lớn cho URL

            builder.Property(si => si.Caption)
                .HasMaxLength(255);


            builder.Property(e => e.IsDeleted)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.HasQueryFilter(e => !e.IsDeleted);
            // Mối quan hệ với Space đã được cấu hình từ SpaceConfiguration (s.SpaceImages)
            // Hoặc bạn có thể thêm ở đây để rõ ràng:
            // builder.HasOne(si => si.Space)
            //        .WithMany(s => s.SpaceImages)
            //        .HasForeignKey(si => si.SpaceId)
            //        .IsRequired();
        }
    }
}