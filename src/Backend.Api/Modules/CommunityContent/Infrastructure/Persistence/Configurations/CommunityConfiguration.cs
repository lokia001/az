// File: Backend.Api/Modules/CommunityContent/Infrastructure/Persistence/Configurations/CommunityConfiguration.cs
using Backend.Api.Modules.CommunityContent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Modules.CommunityContent.Infrastructure.Persistence.Configurations
{
    public class CommunityConfiguration : IEntityTypeConfiguration<Community>
    {
        public void Configure(EntityTypeBuilder<Community> builder)
        {
            builder.ToTable("Communities", "community_content");

            builder.HasKey(c => c.Id);

            builder.Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(100);
            builder.HasIndex(c => c.Name).IsUnique(); // Tên Community nên là duy nhất

            builder.Property(c => c.Description)
                .HasMaxLength(500);

            builder.Property(c => c.CoverImageUrl)
                .HasMaxLength(2048); // Độ dài cho URL

            builder.Property(c => c.IsPublic)
                .IsRequired();

            builder.Property(c => c.CreatedByUserId).IsRequired();
            // Không định nghĩa navigation property đến User ở đây (loose coupling)

            // Soft Delete
            builder.Property(c => c.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);
            builder.HasQueryFilter(c => !c.IsDeleted); // Tự động lọc các community đã xóa mềm

            // Mối quan hệ 1-N: Community -> CommunityMembers
            builder.HasMany(c => c.Members)
                   .WithOne(cm => cm.Community)
                   .HasForeignKey(cm => cm.CommunityId)
                   .OnDelete(DeleteBehavior.Cascade); // Nếu xóa Community, xóa luôn các thành viên liên quan

            // Mối quan hệ 1-N: Community -> Posts
            builder.HasMany(c => c.Posts)
                   .WithOne(p => p.Community)
                   .HasForeignKey(p => p.CommunityId)
                   .OnDelete(DeleteBehavior.Cascade); // Nếu xóa Community, xóa luôn các bài đăng
        }
    }
}