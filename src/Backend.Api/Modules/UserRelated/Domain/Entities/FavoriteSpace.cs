// File: Backend.Api/Modules/UserRelated/Domain/Entities/FavoriteSpace.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Modules.UserRelated.Domain.Entities
{
    public class FavoriteSpace
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid SpaceId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User User { get; set; } = null!;
        // Note: We don't add navigation to Space here to avoid cross-module dependencies
        // Space information will be fetched separately when needed

        public FavoriteSpace()
        {
            Id = Guid.NewGuid();
        }

        public FavoriteSpace(Guid userId, Guid spaceId) : this()
        {
            UserId = userId;
            SpaceId = spaceId;
        }
    }
}
