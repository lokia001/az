using System;
using System.Collections.Generic;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos
{
    public class RecentActivityDto
    {
        public DateTime Date { get; set; }
        public string SpaceName { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class DashboardSummaryDto
    {
        public int TotalSpaces { get; set; }
        public int MaintenanceSpaces { get; set; }
        // Booking statistics for current month
        public int TotalBookings { get; set; }
        public int CompletedBookings { get; set; }
        public int UniqueUsers { get; set; }
        public decimal Revenue { get; set; }
    }
}
