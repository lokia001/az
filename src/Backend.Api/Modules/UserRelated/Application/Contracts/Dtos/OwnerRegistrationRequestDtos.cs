using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Modules.UserRelated.Application.Contracts.Dtos
{
    /// <summary>
    /// DTO for creating a new owner registration request
    /// </summary>
    public record CreateOwnerRegistrationRequest
    {
        [Required(ErrorMessage = "Company name is required")]
        [StringLength(200, ErrorMessage = "Company name cannot exceed 200 characters")]
        public string CompanyName { get; init; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; init; }

        [StringLength(20, ErrorMessage = "Business phone cannot exceed 20 characters")]
        [Phone(ErrorMessage = "Invalid phone number format")]
        public string? BusinessPhone { get; init; }

        [StringLength(500, ErrorMessage = "Business address cannot exceed 500 characters")]
        public string? BusinessAddress { get; init; }

        [StringLength(200, ErrorMessage = "Website cannot exceed 200 characters")]
        [Url(ErrorMessage = "Invalid website URL format")]
        public string? Website { get; init; }

        [StringLength(100, ErrorMessage = "Business license cannot exceed 100 characters")]
        public string? BusinessLicense { get; init; }
    }

    /// <summary>
    /// DTO for admin processing owner registration request
    /// </summary>
    public record ProcessOwnerRegistrationRequest
    {
        [Required(ErrorMessage = "Approval decision is required")]
        public bool IsApproved { get; init; }

        [StringLength(1000, ErrorMessage = "Admin notes cannot exceed 1000 characters")]
        public string? AdminNotes { get; init; }

        [StringLength(500, ErrorMessage = "Rejection reason cannot exceed 500 characters")]
        public string? RejectionReason { get; init; }
    }

    /// <summary>
    /// DTO for owner registration request display
    /// </summary>
    public class OwnerRegistrationRequestDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? BusinessPhone { get; set; }
        public string? BusinessAddress { get; set; }
        public string? Website { get; set; }
        public string? BusinessLicense { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? ProcessedBy { get; set; }
        public string? ProcessedByUsername { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public string? AdminNotes { get; set; }
        public string? RejectionReason { get; set; }
    }

    /// <summary>
    /// DTO for paginated owner registration requests
    /// </summary>
    public class PagedOwnerRegistrationRequestDto
    {
        public List<OwnerRegistrationRequestDto> Requests { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
    }
}
