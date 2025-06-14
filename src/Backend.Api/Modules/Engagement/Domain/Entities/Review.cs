// File: Backend.Api/Modules/Engagement/Domain/Entities/Review.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Modules.Engagement.Domain.Entities
{
    public class Review
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; } // FK UserRelated
        public Guid SpaceId { get; set; } // FK SpaceBooking
        public Guid? BookingId { get; set; } // FK SpaceBooking (optional)
        public int Rating { get; set; }
        public string? CommentText { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
        public bool IsVerifiedOwnerReply { get; set; } = false;
        public Review() { Id = Guid.NewGuid(); }
    }
}