// File: Backend.Api/Modules/UserRelated/Application/Contracts/Services/IAuthService.cs
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;
// Thêm using cho Result pattern nếu bạn dùng (ví dụ: FluentResults, OneOf)
// using FluentResults;

namespace Backend.Api.Modules.UserRelated.Application.Contracts.Services;

using System.Threading.Tasks;

public interface IAuthService
{
    // Sử dụng Result<T> để trả về kết quả thành công hoặc lỗi một cách rõ ràng
    // Nếu không dùng Result pattern, có thể throw exceptions cho lỗi
    Task<AuthResponse> RegisterAsync(RegisterUserRequest request); // Hoặc Task<Result<AuthResponse>>
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request);
    Task ForgotPasswordAsync(ForgotPasswordRequest request);
    Task ResetPasswordAsync(ResetPasswordRequest request);
    // Task LogoutAsync(Guid userId, string refreshTokenToRevoke); // Nếu cần thu hồi refresh token khi logout
}



