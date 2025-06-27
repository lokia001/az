using Backend.Api.Data.Seeders;
using Backend.Api.Data;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Services;
using Backend.Api.Modules.SpaceBooking.Application.Services;
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories;
using Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Repositories;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Infrastructure;
using Backend.Api.Modules.SpaceBooking.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Backend.Api.Modules.SpaceBooking.Extensions
{
    public static class SpaceBookingServiceExtensions
    {
        public static IServiceCollection AddSpaceBookingModule(this IServiceCollection services)
        {
            // Add iCal services
            services.AddIcalServices(); // Using the merged IcalServiceExtensions

            // Register repositories
            services.AddScoped<ISystemAmenityRepository, SystemAmenityRepository>();
            services.AddScoped<ISystemSpaceServiceRepository, SystemSpaceServiceRepository>();
            services.AddScoped<ISpaceRepository, SpaceRepository>();
            services.AddScoped<IBookingRepository, BookingRepository>();

            // Register application services
            services.AddScoped<ISystemAmenityService, SystemAmenityService>();
            services.AddScoped<ISystemSpaceServiceService, SystemSpaceServiceService>();
            services.AddScoped<ISpaceService, Backend.Api.Modules.SpaceBooking.Application.Services.SpaceService>();
            services.AddScoped<IBookingService, BookingService>();

            // Register infrastructure services
            services.AddScoped<IFileStorageService, LocalFileStorageService>();

            // Register seeders
            services.AddScoped<IDataSeeder, SystemAmenitySeeder>();
            services.AddScoped<IDataSeeder, SystemSpaceServiceSeeder>();
            services.AddScoped<IDataSeeder, SpaceSeeder>();

            return services;
        }
    }
}