// File: Backend.Api/Modules/UserRelated/Domain/Entities/User.cs
using System;
using System.ComponentModel.DataAnnotations;
using Backend.Api.Modules.UserRelated.Domain.Enums;

namespace Backend.Api.Modules.UserRelated.Domain.Entities
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Username { get; set; } = string.Empty; // Thường dùng để đăng nhập

        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? FullName { get; set; } // Có thể để user tự nhập sau

        public UserGender Gender { get; set; } = UserGender.Unknown;

        public DateTime? DateOfBirth { get; set; }

        public bool IsActive { get; set; } = true; // Mặc định là active khi tạo mới
        public bool IsDeleted { get; set; } = false; // Giữ lại IsDeleted nếu bạn vẫn muốn soft delete riêng

        [MaxLength(500)]
        public string? Bio { get; set; }

        [Phone]
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(255)]
        public string? Address { get; set; }

        [Url]
        [MaxLength(512)]
        public string? AvatarUrl { get; set; }

        [Required]
        public UserRole Role { get; set; } = UserRole.User;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Thuộc tính cho Password Reset
        [MaxLength(255)]
        public string? PasswordResetToken { get; private set; }
        public DateTime? PasswordResetTokenExpiry { get; private set; }

        // Thuộc tính cho Refresh Token
        [MaxLength(255)]
        public string? RefreshToken { get; private set; }
        public DateTime? RefreshTokenExpiry { get; private set; }

        // Navigation property (nội bộ module)
        public OwnerProfile? OwnerProfile { get; set; }


        // --- Domain Methods (Hành vi của User entity) ---

        public User()
        {
            Id = Guid.NewGuid();
            IsActive = true; // Đảm bảo giá trị mặc định
            IsDeleted = false;
        }

        public void GeneratePasswordResetToken(string token, DateTime expiryDate)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw new ArgumentException("Password reset token cannot be empty.", nameof(token));
            if (expiryDate <= DateTime.UtcNow)
                throw new ArgumentOutOfRangeException(nameof(expiryDate), "Expiry date must be in the future.");

            PasswordResetToken = token;
            PasswordResetTokenExpiry = expiryDate;
        }

        public void ClearPasswordResetToken()
        {
            PasswordResetToken = null;
            PasswordResetTokenExpiry = null;
        }

        public bool IsPasswordResetTokenValid(string tokenToValidate)
        {
            return !string.IsNullOrWhiteSpace(PasswordResetToken) &&
                   PasswordResetToken == tokenToValidate &&
                   PasswordResetTokenExpiry.HasValue &&
                   PasswordResetTokenExpiry.Value > DateTime.UtcNow;
        }

        public void SetRefreshToken(string token, DateTime expiryDate)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw new ArgumentException("Refresh token cannot be empty.", nameof(token));
            if (expiryDate <= DateTime.UtcNow)
                throw new ArgumentOutOfRangeException(nameof(expiryDate), "Expiry date must be in the future.");

            RefreshToken = token;
            RefreshTokenExpiry = expiryDate;
            // Có thể thêm logic: nếu user đã có refresh token cũ, thì vô hiệu hóa nó (nếu cần)
            // hoặc ghi đè như hiện tại là chấp nhận được cho trường hợp đơn giản.
        }

        public void ClearRefreshToken()
        {
            RefreshToken = null;
            RefreshTokenExpiry = null;
        }

        public bool IsRefreshTokenValid(string tokenToValidate)
        {
            return !string.IsNullOrWhiteSpace(RefreshToken) &&
                   RefreshToken == tokenToValidate &&
                   RefreshTokenExpiry.HasValue &&
                   RefreshTokenExpiry.Value > DateTime.UtcNow;
        }

        public void MarkAsUpdated()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }
}