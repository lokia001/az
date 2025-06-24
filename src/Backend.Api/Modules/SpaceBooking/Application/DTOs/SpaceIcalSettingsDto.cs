using System;
using System.Collections.Generic;

namespace Backend.Api.Modules.SpaceBooking.Application.DTOs
{
    public class SpaceIcalSettingsDto
    {
        public Guid SpaceId { get; set; }
        public List<string> ImportIcalUrls { get; set; } = new();
        public string ExportIcalUrl { get; set; } = string.Empty;
        public DateTime? LastSyncAttempt { get; set; }
        public string LastSyncStatus { get; set; } = string.Empty;
        public string? LastSyncError { get; set; }
    }

    public class UpdateSpaceIcalSettingsDto
    {
        public List<string> ImportIcalUrls { get; set; } = new();
    }
}
