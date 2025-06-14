// File: Backend.Api/Modules/UserRelated/Application/Services/AuthService.cs
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;
using AutoMapper; // Sẽ dùng sau khi cấu hình AutoMapper
using Backend.Api.Data; // Để inject AppDbContext cho Unit of Work
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;
using Backend.Api.Modules.UserRelated.Application.Contracts.Infrastructure; // IJwtService
using Backend.Api.Modules.UserRelated.Application.Contracts.Services;
using Backend.Api.Modules.UserRelated.Domain.Entities;
using Backend.Api.Modules.UserRelated.Domain.Enums;
using Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens; // Để đọc RefreshTokenExpiresInDays
// using MediatR; // Nếu dùng events

namespace Backend.Api.Modules.UserRelated.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly IMapper _mapper; // Sẽ inject sau khi cấu hình AutoMapper
        private readonly AppDbContext _dbContext; // Dùng cho SaveChanges (Unit of Work)
        private readonly IConfiguration _configuration;
        // private readonly IMediator _mediator; // Nếu dùng events

        public AuthService(
            IUserRepository userRepository,
            IJwtService jwtService,
            IMapper mapper, // Sẽ được inject
            AppDbContext dbContext,
            IConfiguration configuration
            // IMediator mediator // Nếu dùng events
            )
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
            _mapper = mapper;
            _dbContext = dbContext;
            _configuration = configuration;
            // _mediator = mediator;
        }


        public async Task<AuthResponse> RegisterAsync(RegisterUserRequest request)
        {
            if (await _userRepository.ExistsByUsernameAsync(request.Username))
            {
                throw new ArgumentException($"Username '{request.Username}' is already taken.");
            }

            if (await _userRepository.ExistsByEmailAsync(request.Email))
            {
                throw new ArgumentException($"Email '{request.Email}' is already registered.");
            }

            var user = _mapper.Map<User>(request); // Sử dụng AutoMapper
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password); // Hash mật khẩu sau khi map

            await _userRepository.AddAsync(user);
            // await _dbContext.SaveChangesAsync(); // SaveChangesAsync lần 1 để user có Id (nếu Id là identity)
            // và để các thao tác sau không bị lỗi FK.
            // Trong trường hợp này Id là Guid tự tạo nên có thể gộp SaveChanges.

            // Tạo claims cho access token
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var accessToken = _jwtService.GenerateAccessToken(claims);
            var refreshToken = _jwtService.GenerateRefreshToken();

            var refreshTokenExpiresInDays = _configuration.GetValue<int>("Jwt:RefreshTokenExpiresInDays", 7);
            user.SetRefreshToken(refreshToken, DateTime.UtcNow.AddDays(refreshTokenExpiresInDays));
            // Không cần gọi _userRepository.Update(user) ở đây nếu user đã được AddAsync
            // và EF Core đang theo dõi nó. Thay đổi trên user sẽ được lưu khi SaveChangesAsync tiếp theo.
            // Tuy nhiên, để đảm bảo tính tường minh và nhất quán, việc gọi Update không gây hại.
            // _userRepository.Update(user); // Có thể bỏ qua nếu SaveChangesAsync ngay sau AddAsync đã xử lý user.Id

            await _dbContext.SaveChangesAsync(); // Lưu user và refresh token vào DB (một lần là đủ nếu Id là Guid)

            return new AuthResponse(
                AccessToken: accessToken,
                AccessTokenExpiration: DateTime.UtcNow.AddMinutes(_configuration.GetValue<int>("Jwt:AccessTokenExpiresInMinutes", 15)),
                RefreshToken: refreshToken
            );
        }


        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository.GetByUsernameAsync(request.UsernameOrEmail)
                       ?? await _userRepository.GetByEmailAsync(request.UsernameOrEmail);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid username/email or password."); // Hoặc custom exception
            }

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var accessToken = _jwtService.GenerateAccessToken(claims);
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            var refreshTokenExpiresInDays = _configuration.GetValue<int>("Jwt:RefreshTokenExpiresInDays", 7);
            user.SetRefreshToken(newRefreshToken, DateTime.UtcNow.AddDays(refreshTokenExpiresInDays));
            _userRepository.Update(user);
            await _dbContext.SaveChangesAsync();

            return new AuthResponse(
                AccessToken: accessToken,
                AccessTokenExpiration: DateTime.UtcNow.AddMinutes(_configuration.GetValue<int>("Jwt:AccessTokenExpiresInMinutes", 15)),
                RefreshToken: newRefreshToken
            );
        }

        public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request)
        {
            var principal = _jwtService.GetPrincipalFromExpiredToken(request.ExpiredAccessToken);
            if (principal?.Identity?.Name == null) // principal.Identity.Name thường là username hoặc ID từ claim Name
            {
                throw new SecurityTokenException("Invalid access token or claims principal.");
            }

            // Lấy UserId từ claims của access token cũ (an toàn hơn là chỉ dựa vào username)
            var userIdString = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdString, out var userId))
            {
                throw new SecurityTokenException("Invalid user identifier in token.");
            }

            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null || !user.IsRefreshTokenValid(request.RefreshToken))
            {
                throw new SecurityTokenException("Invalid refresh token or user not found.");
            }

            // Tạo access token mới
            var newClaims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };
            var newAccessToken = _jwtService.GenerateAccessToken(newClaims);

            // (Tùy chọn - bảo mật cao hơn): Tạo refresh token mới (xoay vòng token)
            var newRefreshToken = _jwtService.GenerateRefreshToken();
            var refreshTokenExpiresInDays = _configuration.GetValue<int>("Jwt:RefreshTokenExpiresInDays", 7);
            user.SetRefreshToken(newRefreshToken, DateTime.UtcNow.AddDays(refreshTokenExpiresInDays));
            _userRepository.Update(user);
            await _dbContext.SaveChangesAsync();

            return new AuthResponse(
                AccessToken: newAccessToken,
                AccessTokenExpiration: DateTime.UtcNow.AddMinutes(_configuration.GetValue<int>("Jwt:AccessTokenExpiresInMinutes", 15)),
                RefreshToken: newRefreshToken // Trả về refresh token mới
            );
        }

        public async Task ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user != null)
            {
                // Tạo token reset mật khẩu
                var resetToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)); // Token ngẫu nhiên
                var expiryDate = DateTime.UtcNow.AddHours(1); // Token có hạn 1 giờ

                user.GeneratePasswordResetToken(resetToken, expiryDate);
                _userRepository.Update(user);
                await _dbContext.SaveChangesAsync();

                // Gửi email chứa resetToken và email cho user
                // Ví dụ: _emailService.SendPasswordResetEmail(user.Email, resetToken);
                // Hiện tại chúng ta chưa có EmailService, có thể log ra console để test
                Console.WriteLine($"Password reset token for {user.Email}: {resetToken}");
            }
            // Luôn trả về thành công (hoặc không có thông báo gì) để tránh lộ thông tin email có tồn tại hay không
        }

        public async Task ResetPasswordAsync(ResetPasswordRequest request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user == null || !user.IsPasswordResetTokenValid(request.Token))
            {
                throw new ArgumentException("Invalid token or email, or token has expired.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.ClearPasswordResetToken(); // Xóa token sau khi đã sử dụng
            user.MarkAsUpdated(); // Đánh dấu thời gian cập nhật
            _userRepository.Update(user);
            await _dbContext.SaveChangesAsync();
        }
    }
}