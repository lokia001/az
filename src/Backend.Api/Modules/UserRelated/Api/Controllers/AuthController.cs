// File: Backend.Api/Modules/UserRelated/Api/Controllers/AuthController.cs
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;
using Backend.Api.Modules.UserRelated.Application.Contracts.Services;
using Microsoft.AspNetCore.Authorization; // Cho [AllowAnonymous]
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Backend.Api.Modules.UserRelated.Api.Controllers
{
    [ApiController]
    [Route("api/auth")] // Route cơ bản cho controller này
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        [AllowAnonymous] // Bất kỳ ai cũng có thể gọi endpoint này
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            // ModelState.IsValid sẽ tự động được kiểm tra nếu bạn dùng [ApiController]
            // và các Data Annotations trong DTO (Required, StringLength, etc.)
            // Nếu không valid, ASP.NET Core sẽ tự động trả về 400 Bad Request với chi tiết lỗi.

            try
            {
                var authResponse = await _authService.RegisterAsync(request);
                return Ok(authResponse);
            }
            catch (ArgumentException ex) // Bắt các lỗi nghiệp vụ cụ thể từ service
            {
                return BadRequest(new { message = ex.Message });
            }
            // Có thể bắt thêm các custom exceptions khác nếu service throw
            // catch (DuplicateUsernameException ex) { return Conflict(new { message = ex.Message }); }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var authResponse = await _authService.LoginAsync(request);
                return Ok(authResponse);
            }
            catch (UnauthorizedAccessException ex) // Lỗi sai credentials
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (ArgumentException ex) // Các lỗi khác (ví dụ: input không hợp lệ không bắt được bởi model validation)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("refresh-token")]
        [AllowAnonymous] // Hoặc có thể yêu cầu token cũ (đã hết hạn) trong header Authorization
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                var authResponse = await _authService.RefreshTokenAsync(request);
                return Ok(authResponse);
            }
            catch (Microsoft.IdentityModel.Tokens.SecurityTokenException ex) // Lỗi liên quan đến token
            {
                return BadRequest(new { message = $"Invalid token: {ex.Message}" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                await _authService.ForgotPasswordAsync(request);
                // Luôn trả về Ok để tránh tiết lộ email nào đã đăng ký
                return Ok(new { message = "If an account with that email exists, a password reset link has been sent." });
            }
            catch (Exception ex) // Bắt lỗi chung, không nên để lộ chi tiết lỗi
            {
                // Log lỗi ở đây
                // Elmah.Io, Serilog, etc. _logger.LogError(ex, "Error during forgot password for email {Email}", request.Email);
                return Ok(new { message = "If an account with that email exists, a password reset link has been sent." });
            }
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                await _authService.ResetPasswordAsync(request);
                return Ok(new { message = "Password has been reset successfully." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}