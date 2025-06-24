using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.Infrastructure.Exceptions;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Enums;

namespace Backend.Api.Modules.SpaceBooking.Application.Services
{
    public interface IIcalExportService
    {
        Task<string> GenerateSpaceCalendarAsync(Guid spaceId);
    }

    public class IcalExportService : IIcalExportService
    {
        private readonly AppDbContext _context;

        public IcalExportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<string> GenerateSpaceCalendarAsync(Guid spaceId)
        {
            // Get space and its bookings
            var space = await _context.Spaces
                .FirstOrDefaultAsync(s => s.Id == spaceId);

            if (space == null)
            {
                throw new NotFoundException($"Space with ID {spaceId} not found");
            }

            // Get confirmed bookings
            var bookings = await _context.Bookings
                .Where(b => b.SpaceId == spaceId 
                       && (b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Pending)
                       && b.StartTime > DateTime.UtcNow.AddDays(-30)) // Only include bookings from last 30 days and future
                .OrderBy(b => b.StartTime)
                .ToListAsync();

            // Generate iCal content
            var sb = new StringBuilder();
            sb.AppendLine("BEGIN:VCALENDAR");
            sb.AppendLine("VERSION:2.0");
            sb.AppendLine("PRODID:-//AzSpaces//NONSGML v1.0//EN");
            sb.AppendLine("CALSCALE:GREGORIAN");
            sb.AppendLine("METHOD:PUBLISH");

            foreach (var booking in bookings)
            {
                sb.AppendLine("BEGIN:VEVENT");
                sb.AppendLine($"UID:{booking.Id}");
                sb.AppendLine($"DTSTAMP:{DateTime.UtcNow:yyyyMMddTHHmmssZ}");
                sb.AppendLine($"DTSTART:{booking.StartTime:yyyyMMddTHHmmssZ}");
                sb.AppendLine($"DTEND:{booking.EndTime:yyyyMMddTHHmmssZ}");
                sb.AppendLine($"STATUS:{GetIcalStatus(booking.Status)}");
                sb.AppendLine($"SUMMARY:{GetBookingSummary(space.Name)}");
                
                if (!string.IsNullOrEmpty(booking.Notes))
                {
                    sb.AppendLine($"DESCRIPTION:{EscapeIcalText(booking.Notes)}");
                }
                
                sb.AppendLine("END:VEVENT");
            }

            sb.AppendLine("END:VCALENDAR");
            return sb.ToString();
        }

        private string GetIcalStatus(BookingStatus status)
        {
            return status switch
            {
                BookingStatus.Confirmed => "CONFIRMED",
                BookingStatus.Pending => "TENTATIVE",
                _ => "CANCELLED"
            };
        }

        private string GetBookingSummary(string spaceName)
        {
            return $"Booked: {spaceName}";
        }

        private string EscapeIcalText(string text)
        {
            if (string.IsNullOrEmpty(text)) return string.Empty;
            
            return text
                .Replace("\\", "\\\\")
                .Replace(";", "\\;")
                .Replace(",", "\\,")
                .Replace("\n", "\\n")
                .Replace("\r", string.Empty);
        }
    }
}
