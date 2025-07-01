// File: Backend.Api/Modules/SpaceBooking/Application/Contracts/Dtos/SpaceImageDtos.cs
using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http; // Cho IFormFile

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos
{
    public record SpaceImageDto(
        Guid Id,
        Guid SpaceId,
        string ImageUrl,
        string? CloudinaryPublicId, // Add Cloudinary public_id for deletion
        string? Caption,
        bool IsCoverImage,
        int DisplayOrder,
        DateTime CreatedAt
    );

    public record UploadSpaceImageRequest( // Dùng cho việc upload file
        [Required] IFormFile ImageFile, // File ảnh được upload
        string? Caption,
        bool IsCoverImage = false,
        int DisplayOrder = 0
    );

    public record UpdateSpaceImageDetailsRequest( // Dùng để cập nhật thông tin ảnh đã có
        string? Caption,
        bool? IsCoverImage,
        int? DisplayOrder
    );
}