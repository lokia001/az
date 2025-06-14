
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Backend.Api.Data;

namespace Backend.Api.Modules.SpaceService.Extensions;

public static class SpaceServiceExtensions
{
    public static IServiceCollection AddSpaceServiceModule(this IServiceCollection services, IConfiguration configuration)
    {
        // Add DbContext
        // services.AddDbContext<SpaceDbContext>(options =>
        //     options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        // Add services
        // services.AddScoped<ISpaceService, SpaceService>();

        // Add controllers
        services.AddControllers();

        return services;
    }
}