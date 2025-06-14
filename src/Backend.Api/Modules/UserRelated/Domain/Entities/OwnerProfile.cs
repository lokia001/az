// File: Backend.Api/Modules/UserRelated/Domain/Entities/OwnerProfile.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Modules.UserRelated.Domain.Entities
{
    public class OwnerProfile
    {
        [Key]
        [ForeignKey("User")] // UserId này sẽ là khóa chính của OwnerProfile và là khóa ngoại đến User.Id
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(200)]
        public string CompanyName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? ContactInfo { get; set; } // Có thể là email, SĐT công ty

        [MaxLength(1000)]
        public string? Description { get; set; } // Mô tả về chủ sở hữu/công ty

        [MaxLength(100)]
        public string? BusinessLicenseNumber { get; set; }

        [MaxLength(50)]
        public string? TaxCode { get; set; }

        [Url]
        [MaxLength(255)]
        public string? Website { get; set; }

        [Url]
        [MaxLength(512)]
        public string? LogoUrl { get; set; }

        public bool IsVerified { get; set; } = false; // Trạng thái xác minh bởi SysAdmin

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation property (nội bộ module)
        public User User { get; set; } = default!; // Bắt buộc phải có User liên kết

        public void MarkAsUpdated()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }
}