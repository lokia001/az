
// File: Backend.Api/Modules/UserRelated/Application/Contracts/Dtos/OwnerProfileDtos.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Modules.UserRelated.Application.Contracts.Dtos
{
    public record OwnerProfileDto(
        Guid UserId,
        string CompanyName,
        string? ContactInfo,
        string? Description,
        string? BusinessLicenseNumber,
        string? TaxCode,
        string? Website,
        string? LogoUrl,
        bool IsVerified,
        DateTime CreatedAt
    );

    // DTO để tạo hoặc cập nhật OwnerProfile
    // UserId sẽ được lấy từ user đang đăng nhập
    public record UpsertOwnerProfileRequest(
        [Required][StringLength(200)] string CompanyName,
        [StringLength(500)] string? ContactInfo,
        [StringLength(1000)] string? Description,
        [StringLength(100)] string? BusinessLicenseNumber,
        [StringLength(50)] string? TaxCode,
        [Url][StringLength(255)] string? Website,
        [Url][StringLength(512)] string? LogoUrl
    // IsVerified sẽ được quản lý bởi SysAdmin
    );
}