using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Data.Models
{
    public class SystemLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime Timestamp { get; set; }

        [Required]
        [MaxLength(50)]
        public string Level { get; set; } = string.Empty; // INFO, WARNING, ERROR, ADMIN_ACTION, DEBUG

        [Required]
        [MaxLength(200)]
        public string Source { get; set; } = string.Empty; // Backend.SpaceService, Frontend, Backend.AuthService, etc.

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        [MaxLength(450)] // Same as User ID length, but no FK constraint
        public string? UserId { get; set; }

        [MaxLength(450)] // Generic entity ID, no FK constraint
        public string? RelatedEntityId { get; set; }

        public string? ErrorDetails { get; set; } // For ERROR level, can be long stack trace

        [MaxLength(100)]
        public string? IpAddress { get; set; }

        [MaxLength(500)]
        public string? UserAgent { get; set; }

        public SystemLog()
        {
            Timestamp = DateTime.UtcNow;
        }
    }
}
