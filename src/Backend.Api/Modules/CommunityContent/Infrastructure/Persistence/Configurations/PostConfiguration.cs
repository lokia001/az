// File: Backend.Api/Modules/CommunityContent/Infrastructure/Persistence/Configurations/PostConfiguration.cs
using Backend.Api.Modules.CommunityContent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Modules.CommunityContent.Infrastructure.Persistence.Configurations
{
    public class PostConfiguration : IEntityTypeConfiguration<Post>
    {
        public void Configure(EntityTypeBuilder<Post> builder)
        {
            builder.ToTable("Posts", "community_content");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.AuthorUserId).IsRequired();
            // Không định nghĩa navigation property đến User ở đây

            builder.Property(p => p.Title)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(p => p.Content)
                .IsRequired(); // Kiểu dữ liệu TEXT/NTEXT sẽ được DB tự xử lý độ dài lớn

            // Soft Delete
            builder.Property(p => p.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);
            builder.HasQueryFilter(p => !p.IsDeleted);

            // Mối quan hệ đến Community (đã được định nghĩa từ CommunityConfiguration)
            // builder.HasOne(p => p.Community)
            //        .WithMany(c => c.Posts)
            //        .HasForeignKey(p => p.CommunityId)
            //        .OnDelete(DeleteBehavior.Cascade); // Đã có ở CommunityConfiguration
        }
    }
}