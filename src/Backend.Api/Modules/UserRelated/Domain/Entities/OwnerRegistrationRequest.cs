using System;
using System.ComponentModel.DataAnnotations;
using Backend.Api.Modules.UserRelated.Domain.Enums;

namespace Backend.Api.Modules.UserRelated.Domain.Entities
{
    /// <summary>
    /// Represents a request from a User to become an Owner (space owner).
    /// This request needs to be approved by a SysAdmin before the user's role is changed.
    /// </summary>
    public class OwnerRegistrationRequest
    {
        [Key]
        public Guid Id { get; set; }

        /// <summary>
        /// The ID of the User who is requesting to become an Owner
        /// </summary>
        [Required]
        public Guid UserId { get; set; }

        /// <summary>
        /// Navigation property to the User who made the request
        /// </summary>
        public User User { get; set; } = default!;

        /// <summary>
        /// Company or business name for the owner profile
        /// </summary>
        [Required]
        [StringLength(200)]
        public string CompanyName { get; set; } = string.Empty;

        /// <summary>
        /// Business description
        /// </summary>
        [StringLength(1000)]
        public string? Description { get; set; }

        /// <summary>
        /// Business phone number
        /// </summary>
        [StringLength(20)]
        public string? BusinessPhone { get; set; }

        /// <summary>
        /// Business address
        /// </summary>
        [StringLength(500)]
        public string? BusinessAddress { get; set; }

        /// <summary>
        /// Website URL
        /// </summary>
        [StringLength(200)]
        public string? Website { get; set; }

        /// <summary>
        /// Business license/registration number
        /// </summary>
        [StringLength(100)]
        public string? BusinessLicense { get; set; }

        /// <summary>
        /// Current status of the registration request
        /// </summary>
        [Required]
        public OwnerRegistrationStatus Status { get; set; } = OwnerRegistrationStatus.Pending;

        /// <summary>
        /// When the request was submitted
        /// </summary>
        [Required]
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When the request was last updated (status change)
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// ID of the SysAdmin who processed this request (approved/rejected)
        /// </summary>
        public Guid? ProcessedBy { get; set; }

        /// <summary>
        /// Navigation property to the SysAdmin who processed the request
        /// </summary>
        public User? ProcessedByAdmin { get; set; }

        /// <summary>
        /// When the request was processed
        /// </summary>
        public DateTime? ProcessedAt { get; set; }

        /// <summary>
        /// Admin's notes/comments when processing the request
        /// </summary>
        [StringLength(1000)]
        public string? AdminNotes { get; set; }

        /// <summary>
        /// Rejection reason if the request was rejected
        /// </summary>
        [StringLength(500)]
        public string? RejectionReason { get; set; }

        public OwnerRegistrationRequest()
        {
            Id = Guid.NewGuid();
            CreatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Mark this request as updated
        /// </summary>
        public void MarkAsUpdated()
        {
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Process the request (approve or reject)
        /// </summary>
        public void ProcessRequest(OwnerRegistrationStatus newStatus, Guid adminUserId, string? adminNotes = null, string? rejectionReason = null)
        {
            if (Status != OwnerRegistrationStatus.Pending)
            {
                throw new InvalidOperationException($"Cannot process request that is already {Status}");
            }

            if (newStatus == OwnerRegistrationStatus.Pending)
            {
                throw new ArgumentException("Cannot set status back to Pending");
            }

            Status = newStatus;
            ProcessedBy = adminUserId;
            ProcessedAt = DateTime.UtcNow;
            AdminNotes = adminNotes;
            RejectionReason = rejectionReason;
            MarkAsUpdated();
        }
    }
}
