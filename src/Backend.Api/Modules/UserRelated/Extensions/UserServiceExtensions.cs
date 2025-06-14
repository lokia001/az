namespace Backend.Api.Modules.UserService.Extensions;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer; // Thêm using
using Microsoft.IdentityModel.Tokens; // Thêm using
using System.Text;
using Backend.Api.Data; // Thêm using

public static class UserServiceExtensions
{
    public static IServiceCollection AddUserServiceModule(this IServiceCollection services, IConfiguration configuration)
    {
        // services.AddScoped<IUserService, UserService>();
        // services.AddScoped<JwtService>(); // Đăng ký JwtService

        services.AddControllers();

        return services;
    }
}