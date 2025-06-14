// File: Backend.Api/Modules/UserRelated/Application/Contracts/Infrastructure/IJwtService.cs
using System.Collections.Generic;
using System.Security.Claims;

namespace Backend.Api.Modules.UserRelated.Application.Contracts.Infrastructure
{
    public interface IJwtService
    {
        string GenerateAccessToken(IEnumerable<Claim> claims);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }
}