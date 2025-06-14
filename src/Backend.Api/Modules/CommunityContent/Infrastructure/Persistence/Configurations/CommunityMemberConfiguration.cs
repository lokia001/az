// File: Backend.Api/Modules/CommunityContent/Infrastructure/Persistence/Configurations/CommunityMemberConfiguration.cs
using Backend.Api.Modules.CommunityContent.Domain.Entities;
using Backend.Api.Modules.CommunityContent.Domain.Enums; // Cho CommunityRole
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Modules.CommunityContent.Infrastructure.Persistence.Configurations
{
    public class CommunityMemberConfiguration : IEntityTypeConfiguration<CommunityMember>
    {
        public void Configure(EntityTypeBuilder<CommunityMember> builder)
        {
            builder.ToTable("CommunityMembers", "community_content");

            // Khóa chính kết hợp
            builder.HasKey(cm => new { cm.CommunityId, cm.UserId });

            // Mối quan hệ đến Community (đã được định nghĩa từ CommunityConfiguration)
            // builder.HasOne(cm => cm.Community)
            //        .WithMany(c => c.Members)
            //        .HasForeignKey(cm => cm.CommunityId)
            //        .OnDelete(DeleteBehavior.Cascade); // Đã có ở CommunityConfiguration

            // UserId là khóa ngoại đến User (module khác), không định nghĩa navigation property
            builder.Property(cm => cm.UserId).IsRequired();

            builder.Property(cm => cm.Role)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(cm => cm.JoinedAt).IsRequired();
        }
    }
}