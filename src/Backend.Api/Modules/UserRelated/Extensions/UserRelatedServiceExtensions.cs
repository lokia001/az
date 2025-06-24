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
using Microsoft.AspNetCore.Authentication;

public static class UserRelatedServiceExtensions
{
    public static IServiceCollection AddUserRelatedModule(this IServiceCollection services, IConfiguration configuration)
    {
        // services.AddScoped<IUserService, UserService>();
        // services.AddScoped<JwtService>(); // Đăng ký JwtService

        services.AddControllers();

        // Register repositories
        services.AddScoped<IUserRepository, UserRepository>();

        // Register services
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuthenticationService, AuthenticationService>();

        // Register seeders
        services.AddScoped<IDataSeeder, UserSeeder>();

        return services;
    }
}