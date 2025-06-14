namespace Backend.Api.Modules.PaymentService.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using Backend.Api.Modules.PaymentService.Services;

public static class PaymentServiceExtensions
{
    public static IServiceCollection AddPaymentServiceModule(this IServiceCollection services, IConfiguration configuration)
    {
        // services.AddDbContext<PaymentDbContext>(options =>
        //     options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IPaymentService, PaymentService>();

        services.AddControllers();

        return services;
    }
}