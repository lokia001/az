using Microsoft.Extensions.DependencyInjection;
using Backend.Api.Modules.SpaceBooking.Application.Services;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Services;
using Backend.Api.Modules.SpaceBooking.Infrastructure.Jobs;
using Quartz;

namespace Backend.Api.Modules.SpaceBooking.Extensions
{
    public static class IcalServiceExtensions
    {
        public static IServiceCollection AddIcalServices(this IServiceCollection services)
        {
            // Register services
            services.AddScoped<IIcalExportService, IcalExportService>();
            services.AddScoped<IIcalSyncService, IcalSyncService>();
            services.AddScoped<IBookingNotificationService, BookingNotificationService>();

            // Register HTTP client
            services.AddHttpClient("IcalSync");

            // Configure Quartz
            services.AddQuartz(q =>
            {
                // Register the job
                var jobKey = new JobKey("IcalSyncJob");
                q.AddJob<IcalSyncJob>(opts => opts.WithIdentity(jobKey));

                // Create a trigger that runs every 15 minutes
                q.AddTrigger(opts => opts
                    .ForJob(jobKey)
                    .WithIdentity("IcalSyncTrigger")
                    .WithSimpleSchedule(x => x
                        .WithIntervalInMinutes(15)
                        .RepeatForever())
                );
            });

            // Add the Quartz hosted service
            services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

            return services;
        }
    }
}
