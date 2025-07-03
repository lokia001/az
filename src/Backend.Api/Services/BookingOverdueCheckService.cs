// File: Backend.Api/Services/BookingOverdueCheckService.cs
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Backend.Api.Modules.SpaceBooking.Application.Services;
using Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Repositories;
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories;
using System.Linq;

namespace Backend.Api.Services
{
    /// <summary>
    /// Background service to automatically check and update overdue bookings
    /// </summary>
    public class BookingOverdueCheckService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BookingOverdueCheckService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(15); // Check every 15 minutes

        public BookingOverdueCheckService(
            IServiceProvider serviceProvider, 
            ILogger<BookingOverdueCheckService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Booking Overdue Check Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckOverdueBookings();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while checking overdue bookings");
                }

                // Wait for the next check interval
                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("Booking Overdue Check Service stopped");
        }

        private async Task CheckOverdueBookings()
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var bookingRepository = scope.ServiceProvider.GetRequiredService<IBookingRepository>();
                var bookingService = scope.ServiceProvider.GetRequiredService<BookingService>();

                // Get all active bookings (not in final states)
                var activeBookings = await bookingRepository.GetActiveBookingsAsync();
                
                if (activeBookings.Any())
                {
                    var overdueCount = await bookingService.CheckAndMarkOverdueBookingsAsync(activeBookings);
                    
                    if (overdueCount > 0)
                    {
                        _logger.LogInformation("Marked {OverdueCount} bookings as overdue during scheduled check", overdueCount);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to check overdue bookings");
                throw;
            }
        }
    }
}
