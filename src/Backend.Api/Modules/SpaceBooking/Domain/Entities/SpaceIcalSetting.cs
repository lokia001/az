// File: Backend.Api/Modules/SpaceBooking/Domain/Entities/SpaceIcalSetting.cs
using System;
using System.Collections.Generic;
using Backend.Api.Modules.SpaceBooking.Domain.Enums;

namespace Backend.Api.Modules.SpaceBooking.Domain.Entities
{
    public class SpaceIcalSetting
    {
        public Guid Id { get; set; }
        public Guid SpaceId { get; set; }
        
        // Navigation properties with required modifier
        public required Space Space { get; set; }

        // iCal Import URLs from external platforms
        public string ImportIcalUrlsJson { get; set; } = string.Empty;

        // Generated Export iCal URL for this space
        public string ExportIcalUrl { get; set; } = string.Empty;

        // Sync Status
        public DateTime? LastSyncAttempt { get; set; }
        public bool IsSyncInProgress { get; set; }
        public SyncStatus SyncStatus { get; set; } = SyncStatus.None;
        public DateTime? LastSyncSuccess { get; set; }
        public string? LastSyncError { get; set; }

        // Audit Fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
    }
}
