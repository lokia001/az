// File: Backend.Api/Modules/SpaceBooking/SpaceBookingModuleServices.cs


namespace Backend.Api.Modules.SpaceBooking;

using Backend.Api.Modules.SpaceBooking.Application.Contracts.Infrastructure;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Services;
using Backend.Api.Modules.SpaceBooking.Application.Services;
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories;
using Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Repositories;
using Backend.Api.Modules.SpaceBooking.Infrastructure.Services; // Cho LocalFileStorageService
using Microsoft.Extensions.DependencyInjection;
public static class SpaceBookingModuleServices
{
    public static IServiceCollection AddSpaceBookingModule(this IServiceCollection services)
    {
        // Đăng ký Repositories
        services.AddScoped<ISpaceRepository, SpaceRepository>();
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<ISystemAmenityRepository, SystemAmenityRepository>();
        services.AddScoped<ISystemSpaceServiceRepository, SystemSpaceServiceRepository>();
        // Thêm các repository khác nếu có (ví dụ: ISpaceImageRepository nếu bạn tạo riêng)

        // Đăng ký Application Services
        services.AddScoped<ISpaceService, SpaceService>();
        services.AddScoped<IBookingService, BookingService>(); // Sẽ implement sau
        services.AddScoped<ISystemAmenityService, SystemAmenityService>(); // Sẽ implement sau
        services.AddScoped<ISystemSpaceServiceService, SystemSpaceServiceService>(); // Sẽ implement sau

        // Đăng ký Infrastructure Services
        services.AddScoped<IFileStorageService, LocalFileStorageService>(); // << ĐĂNG KÝ Ở ĐÂY

        return services;
    }
}