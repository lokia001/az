// File: Backend.Api/Modules/UserRelated/Infrastructure/Persistence/Configurations/OwnerProfileConfiguration.cs
using Backend.Api.Modules.UserRelated.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Modules.UserRelated.Infrastructure.Persistence.Configurations
{
    public class OwnerProfileConfiguration : IEntityTypeConfiguration<OwnerProfile>
    {
        public void Configure(EntityTypeBuilder<OwnerProfile> builder)
        {
            builder.ToTable("OwnerProfiles", "user_related");

            // UserId là khóa chính và cũng là khóa ngoại đến User.Id
            builder.HasKey(op => op.UserId);

            builder.Property(op => op.CompanyName)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(op => op.ContactInfo).HasMaxLength(500);
            builder.Property(op => op.Description).HasMaxLength(1000);
            builder.Property(op => op.BusinessLicenseNumber).HasMaxLength(100);
            builder.Property(op => op.TaxCode).HasMaxLength(50);
            builder.Property(op => op.Website).HasMaxLength(255);
            builder.Property(op => op.LogoUrl).HasMaxLength(512);

            // Mối quan hệ với User đã được định nghĩa từ phía UserConfiguration
            // EF Core đủ thông minh để hiểu mối quan hệ 1-1 này.
            // Dòng builder.HasOne(u => u.OwnerProfile).WithOne(op => op.User)... trong UserConfiguration
            // đã định nghĩa mối quan hệ này.
        }
    }
}