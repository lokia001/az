// File: Backend.Api/Modules/UserRelated/Application/Contracts/Dtos/UserDtos.cs
using System;
using Backend.Api.Modules.UserRelated.Domain.Enums; // Sử dụng lại Enums từ Domain

namespace Backend.Api.Modules.UserRelated.Application.Contracts.Dtos
{
    // DTO cho việc hiển thị thông tin User
    public record UserDto(
        Guid Id,
        string Username,
        string Email,
        string? FullName,
        UserGender Gender,
        DateTime? DateOfBirth,
        string? Bio,
        string? PhoneNumber,
        string? Address,
        string? AvatarUrl,
        UserRole Role,
        DateTime CreatedAt
    );

    // DTO cho việc đăng ký User mới
    public record RegisterUserRequest(
        [Required][StringLength(150, MinimumLength = 3)] string Username,
        [Required][EmailAddress][StringLength(256)] string Email,
        [Required][StringLength(100, MinimumLength = 6)] string Password, // Mật khẩu thô
        [Required] UserRole Role = UserRole.User // Mặc định là User, có thể cho phép chọn Owner
    );

    // DTO cho việc đăng nhập
    public record LoginRequest(
        [Required] string UsernameOrEmail,
        [Required] string Password
    );

    // DTO chứa token trả về sau khi đăng nhập thành công
    public record AuthResponse(
        string AccessToken,
        DateTime AccessTokenExpiration,
        string RefreshToken
    // Guid UserId, // Có thể thêm UserId nếu client cần
    // UserRole Role // Có thể thêm Role nếu client cần
    );

    // DTO cho yêu cầu quên mật khẩu
    public record ForgotPasswordRequest(
        [Required][EmailAddress] string Email
    );

    // DTO cho việc đặt lại mật khẩu
    public record ResetPasswordRequest(
        [Required] string Token,
        [Required][EmailAddress] string Email,
        [Required][StringLength(100, MinimumLength = 6)] string NewPassword
    );

    // DTO cho việc làm mới token
    public record RefreshTokenRequest(
        [Required] string ExpiredAccessToken, // Gửi cả access token cũ để có thể lấy thông tin user nếu cần
        [Required] string RefreshToken
    );

    // DTO để cập nhật thông tin User
    public record UpdateUserProfileRequest(
        [StringLength(100)] string? FullName,
        UserGender? Gender, // Nullable để cho phép không cập nhật
        DateTime? DateOfBirth,
        [StringLength(500)] string? Bio,
        [Phone][StringLength(20)] string? PhoneNumber,
        [StringLength(255)] string? Address,
        [Url][StringLength(512)] string? AvatarUrl
    // Không cho phép cập nhật Email, Username, Role qua đây (cần quy trình riêng)
    );


    public record UserSearchCriteriaDto(
    string? Username,
    string? Email,
    UserRole? Role,
    bool? IsActive, // Nếu User entity có trường IsActive
    int PageNumber = 1,
    int PageSize = 10
);
}
