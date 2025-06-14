// File: Backend.Api/Modules/UserRelated/Infrastructure/Security/JwtService.cs
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Backend.Api.Modules.UserRelated.Application.Contracts.Infrastructure; // Using interface
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Api.Modules.UserRelated.Infrastructure.Security
{
    public class JwtService : IJwtService // Implement interface
    {
        private readonly string _secretKey;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
            // Đảm bảo các key này tồn tại trong appsettings.json
            _secretKey = configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured in appsettings.json (Jwt:Key)");
            _issuer = configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured in appsettings.json (Jwt:Issuer)");
            _audience = configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience not configured in appsettings.json (Jwt:Audience)");
        }

        public string GenerateAccessToken(IEnumerable<Claim> claims)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_secretKey);
            var accessTokenExpiresInMinutes = _configuration.GetValue<int>("Jwt:AccessTokenExpiresInMinutes", 15);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(accessTokenExpiresInMinutes),
                Issuer = _issuer,
                Audience = _audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = true, // Nên validate audience và issuer nếu có thể
                ValidAudience = _audience,
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_secretKey)),
                ValidateLifetime = false // QUAN TRỌNG: Cho phép token đã hết hạn
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);
                if (!(securityToken is JwtSecurityToken jwtSecurityToken) ||
                    !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    // Log an error or throw a specific exception
                    // Console.WriteLine("Invalid token or algorithm mismatch.");
                    return null;
                }
                return principal;
            }
            catch (SecurityTokenException ex)
            {
                // Log the exception
                // Console.WriteLine($"Token validation failed: {ex.Message}");
                return null;
            }
            catch (Exception ex) // Bắt các lỗi chung khác
            {
                // Console.WriteLine($"An unexpected error occurred during token validation: {ex.Message}");
                return null;
            }
        }
    }
}