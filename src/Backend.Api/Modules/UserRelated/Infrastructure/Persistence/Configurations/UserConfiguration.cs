// File: Backend.Api/Modules/UserRelated/Infrastructure/Persistence/Configurations/UserConfiguration.cs
using Backend.Api.Modules.UserRelated.Domain.Entities;
using Backend.Api.Modules.UserRelated.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Modules.UserRelated.Infrastructure.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            // Đặt tên bảng và schema (tùy chọn, nhưng nên có để phân tách logic)
            builder.ToTable("Users", "user_related");

            builder.HasKey(u => u.Id);
            builder.Property(u => u.Id).ValueGeneratedOnAdd();

            // By default, a DateTime property is not a concurrency token.
            // This line explicitly ensures it's not, which can be useful if you suspect
            // a convention or attribute is incorrectly marking it as one.
            // For this application, we are disabling optimistic concurrency on this property
            // to avoid issues during data seeding or complex update scenarios.
            builder.Property(u => u.UpdatedAt)
                .IsConcurrencyToken(false);

            builder.Property(u => u.Username)
                .IsRequired()
                .HasMaxLength(150);
            builder.HasIndex(u => u.Username).IsUnique(); // Username thường là duy nhất

            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(256);
            builder.HasIndex(u => u.Email).IsUnique(); // Email phải là duy nhất

            builder.Property(u => u.PasswordHash).IsRequired();

            builder.Property(u => u.FullName).HasMaxLength(100);
            builder.Property(u => u.Bio).HasMaxLength(500);
            builder.Property(u => u.PhoneNumber).HasMaxLength(20);
            builder.Property(u => u.Address).HasMaxLength(255);
            builder.Property(u => u.AvatarUrl).HasMaxLength(512);

            builder.Property(u => u.Role)
                .IsRequired()
                .HasConversion<string>() // Lưu trữ Enum dưới dạng string trong DB
                .HasMaxLength(50);

            builder.Property(u => u.Gender)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(u => u.PasswordResetToken).HasMaxLength(255);
            builder.Property(u => u.RefreshToken).HasMaxLength(255);
            // Cân nhắc tạo index cho RefreshToken nếu thường xuyên tìm kiếm bằng nó
            // builder.HasIndex(u => u.RefreshToken);

            // Cấu hình cho IsActive
            builder.Property(u => u.IsActive)
                .IsRequired()
                .HasDefaultValue(true); // Đặt giá trị mặc định trong database

            // Cấu hình cho IsDeleted (nếu bạn giữ lại)
            builder.Property(u => u.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);




            // Cấu hình mối quan hệ 1-0/1 với OwnerProfile
            // User có thể có hoặc không có OwnerProfile
            builder.HasOne(u => u.OwnerProfile)
                   .WithOne(op => op.User) // OwnerProfile phải có User
                   .HasForeignKey<OwnerProfile>(op => op.UserId) // Khóa ngoại là OwnerProfile.UserId
                   .IsRequired(false) // Một User không bắt buộc phải có OwnerProfile
                   .OnDelete(DeleteBehavior.Cascade); // Nếu User bị xóa, OwnerProfile liên quan cũng bị xóa
        }
    }
}