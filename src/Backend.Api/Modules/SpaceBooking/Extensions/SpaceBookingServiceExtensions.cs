using Backend.Api.Data.Seeders;
using Backend.Api.Data;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Services;
using Backend.Api.Modules.SpaceBooking.Application.Services;
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories;
using Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Repositories;
using Backend.Api.Modules.SpaceBooking.Infrastructure.Repositories;
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
            services.AddIcalServices(); // Using IcalServiceExtensions from the same namespace

            // Register repositories
            services.AddScoped<ISystemAmenityRepository, SystemAmenityRepository>();
            services.AddScoped<ISystemSpaceServiceRepository, SystemSpaceServiceRepository>();
            services.AddScoped<ISpaceRepository, SpaceRepository>();
            services.AddScoped<IBookingRepository, BookingRepository>();
            services.AddScoped<IPrivateServiceRepository, PrivateServiceRepository>();
            services.AddScoped<IBookingServiceRepository, BookingServiceRepository>();

            // Register application services
            services.AddScoped<ISystemAmenityService, SystemAmenityService>();
            services.AddScoped<ISystemSpaceServiceService, SystemSpaceServiceService>();
            services.AddScoped<ISpaceService, Backend.Api.Modules.SpaceBooking.Application.Services.SpaceService>();
            services.AddScoped<IBookingService, BookingService>();
            services.AddScoped<IPrivateServiceService, PrivateServiceService>();
            // services.AddScoped<IBookingServiceService, BookingServiceService>(); // TODO: Implement this service

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