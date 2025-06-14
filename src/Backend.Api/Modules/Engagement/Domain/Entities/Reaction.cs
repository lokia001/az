// File: Backend.Api/Modules/Engagement/Domain/Entities/Reaction.cs
using System;
using System.ComponentModel.DataAnnotations;
using Backend.Api.Modules.Engagement.Domain.Enums;

namespace Backend.Api.Modules.Engagement.Domain.Entities
{
    public class Reaction
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; } // FK UserRelated
        public EngageableEntityType TargetEntityType { get; set; }
        public Guid TargetEntityId { get; set; }
        public ReactionType Type { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Reaction() { Id = Guid.NewGuid(); }
    }
}