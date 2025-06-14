// File: Backend.Api/Modules/SpaceBooking/Application/Contracts/Dtos/SpaceDtos.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Backend.Api.Modules.SpaceBooking.Domain.Enums; // Cho SpaceType, SpaceStatus

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos
{
    // DTO con cho tiện ích/dịch vụ tùy chỉnh hiển thị trong SpaceDto
    public record CustomFeatureDto(Guid? Id, string Name); // Id có thể null nếu chỉ là string

    // DTO con cho tiện ích/dịch vụ hệ thống hiển thị trong SpaceDto, kèm theo thông tin tùy chỉnh nếu có
    public record SystemFeatureLinkDto(
        Guid SystemFeatureId, // Id của SystemAmenity hoặc SystemSpaceService
        string Name,          // Tên của SystemAmenity hoặc SystemSpaceService
                              // Các thông tin tùy chỉnh từ bảng join (ví dụ cho SystemSpaceService)
        decimal? PriceOverride,
        string? Notes,
        bool IsIncludedInBasePrice
    );


    // Đặt tạm trong SpaceDtos.cs để test


    public class SpaceDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Address { get; set; } = string.Empty;

        public decimal? Latitude { get; set; } // << THÊM VÀO
        public decimal? Longitude { get; set; } // << THÊM VÀO

        public SpaceType Type { get; set; }
        public SpaceStatus Status { get; set; }
        public int Capacity { get; set; }
        public decimal PricePerHour { get; set; }
        public decimal? PricePerDay { get; set; }
        public TimeSpan? OpenTime { get; set; }
        public TimeSpan? CloseTime { get; set; }
        public int MinBookingDurationMinutes { get; set; }
        public int MaxBookingDurationMinutes { get; set; }
        public int CancellationNoticeHours { get; set; }
        public int CleaningDurationMinutes { get; set; }
        public int BufferMinutes { get; set; }
        public string? AccessInstructions { get; set; }
        public string? HouseRules { get; set; }
        public string? Slug { get; set; }
        public Guid OwnerId { get; set; }
        public Guid CreatedByUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? LastEditedByUserId { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public IEnumerable<SpaceImageDto> SpaceImages { get; set; } = Enumerable.Empty<SpaceImageDto>();
        public IEnumerable<SystemFeatureLinkDto> SystemAmenities { get; set; } = Enumerable.Empty<SystemFeatureLinkDto>();
        public IEnumerable<CustomFeatureDto> CustomAmenities { get; set; } = Enumerable.Empty<CustomFeatureDto>();
        public IEnumerable<SystemFeatureLinkDto> SystemServices { get; set; } = Enumerable.Empty<SystemFeatureLinkDto>();
        public IEnumerable<CustomFeatureDto> CustomServices { get; set; } = Enumerable.Empty<CustomFeatureDto>();

        public SpaceDto() { } // Constructor không tham số
    }


    public record CreateSpaceRequest(
        // Các tham số bắt buộc hoặc nullable không có giá trị mặc định tường minh lên đầu
        [Required][StringLength(200, MinimumLength = 3)] string Name,
        [StringLength(2000)] string? Description,
        [Required][StringLength(500)] string Address,
 [Range(-90, 90)] decimal? Latitude,   // Validate giá trị hợp lệ cho Latitude
    [Range(-180, 180)] decimal? Longitude, // Validate giá trị hợp lệ cho Longitude


        [Required] SpaceType Type,
        [Required] int Capacity,
        [Required][Range(0.01, (double)decimal.MaxValue)] decimal PricePerHour,
        [Range(0.01, (double)decimal.MaxValue)] decimal? PricePerDay,
        TimeSpan? OpenTime,
        TimeSpan? CloseTime,
        [StringLength(1000)] string? AccessInstructions,
        [StringLength(1000)] string? HouseRules,
        [StringLength(250)] string? Slug,
        List<Guid>? SelectedSystemAmenityIds,
        List<string>? CustomAmenityNames,
        List<CreateSpaceSystemFeatureLinkRequest>? SelectedSystemServices,
        List<CreateSpaceCustomServiceRequest>? CustomServiceRequests,
        // Các tham số có giá trị mặc định tường minh xuống cuối
        [Range(1, 1440)] int MinBookingDurationMinutes = 30,
        [Range(1, 10080)] int MaxBookingDurationMinutes = 1440,
        [Range(0, 168)] int CancellationNoticeHours = 24,
        [Range(0, 1440)] int CleaningDurationMinutes = 0,
        [Range(0, 1440)] int BufferMinutes = 0
    );

    // DTO con để truyền thông tin tùy chỉnh cho SystemService khi tạo/cập nhật Space
    public record CreateSpaceSystemFeatureLinkRequest(
        [Required] Guid SystemFeatureId,
        decimal? PriceOverride,
        string? Notes,
        bool IsIncludedInBasePrice = false
    );
    // DTO con để truyền thông tin cho CustomService khi tạo/cập nhật Space
    public record CreateSpaceCustomServiceRequest(
        [Required][StringLength(100)] string Name,
        decimal? Price,
        string? Notes,
        bool IsIncludedInBasePrice = false
    );


    public record UpdateSpaceRequest( // Tương tự CreateSpaceRequest, nhưng các trường có thể nullable hơn
        [Required][StringLength(200, MinimumLength = 3)] string Name,
        [StringLength(2000)] string? Description,
        [Required][StringLength(500)] string Address,

 [Range(-90, 90)] decimal? Latitude,
    [Range(-180, 180)] decimal? Longitude,

        [Required] SpaceType Type,
        SpaceStatus? Status, // Cho phép cập nhật status
        [Required] int Capacity,
        [Required][Range(0.01, (double)decimal.MaxValue)] decimal PricePerHour,
        [Range(0.01, (double)decimal.MaxValue)] decimal? PricePerDay,
        TimeSpan? OpenTime,
        TimeSpan? CloseTime,
        [Range(1, 1440)] int? MinBookingDurationMinutes,
        [Range(1, 10080)] int? MaxBookingDurationMinutes,
        [Range(0, 168)] int? CancellationNoticeHours,
        [Range(0, 1440)] int? CleaningDurationMinutes,
        [Range(0, 1440)] int? BufferMinutes,
        [StringLength(1000)] string? AccessInstructions,
        [StringLength(1000)] string? HouseRules,
        [StringLength(250)] string? Slug,
        List<Guid>? SelectedSystemAmenityIds,
        List<string>? CustomAmenityNames,
        List<CreateSpaceSystemFeatureLinkRequest>? SelectedSystemServices,
        List<CreateSpaceCustomServiceRequest>? CustomServiceRequests
    // Việc cập nhật amenities/services có thể phức tạp:
    // Client có thể gửi toàn bộ danh sách mới, hoặc chỉ gửi thay đổi.
    // Service sẽ cần logic để so sánh và cập nhật.
    );

    public class SpaceSummaryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;

        public decimal? Latitude { get; set; } // << THÊM VÀO (TÙY CHỌN)
        public decimal? Longitude { get; set; } // << THÊM VÀO (TÙY CHỌN)

        public SpaceType Type { get; set; }
        public int Capacity { get; set; }
        public decimal PricePerHour { get; set; }
        public string? CoverImageUrl { get; set; }
        public string? Slug { get; set; }
        public Guid OwnerId { get; set; }

        public SpaceSummaryDto() { } // Constructor không tham số
    }
}