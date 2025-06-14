// File: Backend.Api/Modules/UserRelated/UserRelatedModuleServices.cs
namespace Backend.Api.Modules.UserRelated;

using Backend.Api.Modules.UserRelated.Application.Contracts.Infrastructure;
using Backend.Api.Modules.UserRelated.Application.Contracts.Services;
using Backend.Api.Modules.UserRelated.Application.Services;
using Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories;
using Backend.Api.Modules.UserRelated.Infrastructure.Persistence.Repositories;
using Backend.Api.Modules.UserRelated.Infrastructure.Security;


using Microsoft.Extensions.DependencyInjection; // Đảm bảo using này

public static class UserRelatedModuleServices
{
    public static IServiceCollection AddUserRelatedModule(this IServiceCollection services)
    {
        // Đăng ký Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IOwnerProfileRepository, OwnerProfileRepository>();

        // Đăng ký Application Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IOwnerProfileService, OwnerProfileService>();

        // Đăng ký Infrastructure Services
        services.AddScoped<IJwtService, JwtService>();

        return services;
    }
}
