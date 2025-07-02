namespace Backend.Api.Modules.UserRelated.Extensions;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer; // Thêm using
using Microsoft.IdentityModel.Tokens; // Thêm using
using System.Text;
using Backend.Api.Data; // Thêm using
using Backend.Api.Data.Seeders;
using Backend.Api.Modules.UserRelated.Application.Contracts.Services;
using Backend.Api.Modules.UserRelated.Application.Services;
using Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories;
using Backend.Api.Modules.UserRelated.Infrastructure.Persistence.Repositories;
using Backend.Api.Modules.UserRelated.Infrastructure.Repositories;
using Backend.Api.Modules.UserRelated.Application.Contracts.Infrastructure;
using Backend.Api.Modules.UserRelated.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication;

public static class UserRelatedServiceExtensions
{
    public static IServiceCollection AddUserRelatedModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers();

        // Register repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IOwnerRegistrationRequestRepository, OwnerRegistrationRequestRepository>();
        services.AddScoped<IFavoriteSpaceRepository, FavoriteSpaceRepository>();
        services.AddScoped<Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories.IOwnerProfileRepository, Backend.Api.Modules.UserRelated.Infrastructure.Persistence.Repositories.OwnerProfileRepository>();

        // Register services
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuthenticationService, AuthenticationService>();
        services.AddScoped<IOwnerRegistrationRequestService, OwnerRegistrationRequestService>();
        services.AddScoped<IFavoriteSpaceService, FavoriteSpaceService>();
        services.AddScoped<Backend.Api.Modules.UserRelated.Application.Contracts.Services.IAuthService, Backend.Api.Modules.UserRelated.Application.Services.AuthService>();
        services.AddScoped<Backend.Api.Modules.UserRelated.Application.Contracts.Services.IOwnerProfileService, Backend.Api.Modules.UserRelated.Application.Services.OwnerProfileService>();
        
        // Register infrastructure services
        services.AddScoped<Backend.Api.Modules.UserRelated.Application.Contracts.Infrastructure.IJwtService, Backend.Api.Modules.UserRelated.Infrastructure.Security.JwtService>();

        // Register seeders
        services.AddScoped<IDataSeeder, UserSeeder>();

        return services;
    }
}