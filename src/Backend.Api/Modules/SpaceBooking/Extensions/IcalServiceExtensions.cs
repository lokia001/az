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

            // Register HTTP client with custom configuration
            services.AddHttpClient("IcalSync", client =>
            {
                client.DefaultRequestHeaders.Add("User-Agent", "SpaceBooking-IcalSync/1.0");
                client.Timeout = TimeSpan.FromSeconds(30);
            });

            // Configure Quartz for background job scheduling
            services.AddQuartz(q =>
            {
                // Register the iCal sync job
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

                // Configure Quartz to use memory storage instead of persistent storage
                q.UseInMemoryStore();
                
                // Set default properties
                q.UseSimpleTypeLoader();
                q.UseDefaultThreadPool(tp =>
                {
                    tp.MaxConcurrency = 10;
                });

                // Set serializer type for job data
                q.SetProperty("quartz.serializer.type", "json");
            });

            // Add Quartz.NET hosted service
            services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

            return services;
        }
    }
}
