using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Api.Modules.SpaceBooking.Domain.Entities
{
    public class SpaceIcalSetting
    {
        public Guid Id { get; set; }

        [Required]
        public Guid SpaceId { get; set; }
        public Space Space { get; set; } = default!;

        [Required]
        [MaxLength(2000)]
        public string IcalUrl { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string ExportIcalUrl { get; set; } = string.Empty;

        [MaxLength(4000)]
        public string ImportIcalUrlsJson { get; set; } = "[]";

        public bool IsAutoSyncEnabled { get; set; }
        public bool IsSyncInProgress { get; set; }

        public int SyncIntervalMinutes { get; set; } = 30;

        public DateTime? LastSyncTime { get; set; }
        public DateTime? LastSyncAttempt { get; set; }
        public string LastSyncError { get; set; } = string.Empty;
        public string SyncStatus { get; set; } = "NotStarted";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid? CreatedByUserId { get; set; }

        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedByUserId { get; set; }
    }
}
