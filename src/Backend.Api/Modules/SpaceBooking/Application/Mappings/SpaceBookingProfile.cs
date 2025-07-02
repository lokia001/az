// File: Backend.Api/Modules/SpaceBooking/Application/Mappings/SpaceBookingProfile.cs
using AutoMapper;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using System.Linq; // Cho .Select và .ToList()

namespace Backend.Api.Modules.SpaceBooking.Application.Mappings
{
    public class SpaceBookingProfile : Profile
    {
        public SpaceBookingProfile()
        {
            // --- Space Mappings ---
            CreateMap<CreateSpaceRequest, Space>()
                // OwnerId, CreatedByUserId, CreatedAt, Status sẽ được set trong service
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.OwnerId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.LastEditedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                // Các collection con (Amenities, Services, Images) sẽ được xử lý thủ công trong service
                // khi tạo Space, vì chúng liên quan đến việc tạo các entity liên kết.
                .ForMember(dest => dest.SpaceImages, opt => opt.Ignore())
                .ForMember(dest => dest.SystemAmenitiesLink, opt => opt.Ignore())
                .ForMember(dest => dest.CustomAmenities, opt => opt.Ignore())
                .ForMember(dest => dest.SystemServicesLink, opt => opt.Ignore())
                .ForMember(dest => dest.CustomServices, opt => opt.Ignore())
                .ForMember(dest => dest.Bookings, opt => opt.Ignore())
 .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());

            CreateMap<UpdateSpaceRequest, Space>()
                // Id, OwnerId, CreatedByUserId, CreatedAt không được thay đổi khi update qua DTO này
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.OwnerId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.LastEditedByUserId, opt => opt.Ignore()) // Sẽ được set trong service
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())     // Sẽ được set trong service
                                                                            // Status có thể được cập nhật nếu DTO có, nên không Ignore ở đây. Service sẽ xử lý.
                                                                            // Các collection con sẽ được xử lý thủ công trong service.
                .ForMember(dest => dest.SpaceImages, opt => opt.Ignore())
                .ForMember(dest => dest.SystemAmenitiesLink, opt => opt.Ignore())
                .ForMember(dest => dest.CustomAmenities, opt => opt.Ignore())
                .ForMember(dest => dest.SystemServicesLink, opt => opt.Ignore())
                .ForMember(dest => dest.CustomServices, opt => opt.Ignore())
                .ForMember(dest => dest.Bookings, opt => opt.Ignore())
.ForMember(dest => dest.IsDeleted, opt => opt.Ignore());

            CreateMap<Space, SpaceDto>()
    // Map các thuộc tính đơn giản trực tiếp từ Space entity
    .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
    .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
    .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
    .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address))
.ForMember(dest => dest.Latitude, opt => opt.MapFrom(src => src.Latitude))   // Đảm bảo có
    .ForMember(dest => dest.Longitude, opt => opt.MapFrom(src => src.Longitude)) // Đảm bảo có


    .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type))
    .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
    .ForMember(dest => dest.Capacity, opt => opt.MapFrom(src => src.Capacity))
    .ForMember(dest => dest.PricePerHour, opt => opt.MapFrom(src => src.PricePerHour))
    .ForMember(dest => dest.PricePerDay, opt => opt.MapFrom(src => src.PricePerDay))
    .ForMember(dest => dest.OpenTime, opt => opt.MapFrom(src => src.OpenTime))
    .ForMember(dest => dest.CloseTime, opt => opt.MapFrom(src => src.CloseTime))
    .ForMember(dest => dest.MinBookingDurationMinutes, opt => opt.MapFrom(src => src.MinBookingDurationMinutes))
    .ForMember(dest => dest.MaxBookingDurationMinutes, opt => opt.MapFrom(src => src.MaxBookingDurationMinutes))
    .ForMember(dest => dest.CancellationNoticeHours, opt => opt.MapFrom(src => src.CancellationNoticeHours))
    .ForMember(dest => dest.CleaningDurationMinutes, opt => opt.MapFrom(src => src.CleaningDurationMinutes))
    .ForMember(dest => dest.BufferMinutes, opt => opt.MapFrom(src => src.BufferMinutes))
    .ForMember(dest => dest.AccessInstructions, opt => opt.MapFrom(src => src.AccessInstructions))
    .ForMember(dest => dest.HouseRules, opt => opt.MapFrom(src => src.HouseRules))
    .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => src.Slug))
    .ForMember(dest => dest.OwnerId, opt => opt.MapFrom(src => src.OwnerId))
    .ForMember(dest => dest.CreatedByUserId, opt => opt.MapFrom(src => src.CreatedByUserId))
    .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
    .ForMember(dest => dest.LastEditedByUserId, opt => opt.MapFrom(src => src.LastEditedByUserId))
    .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt))

    // Map các collection
    .ForMember(dest => dest.SpaceImages, opt => opt.MapFrom(src =>
        src.SpaceImages != null
            ? src.SpaceImages.Select(img => new SpaceImageDto( // Map thủ công từng DTO con
                  img.Id, img.SpaceId, img.ImageUrl, img.CloudinaryPublicId, img.Caption, img.IsCoverImage, img.DisplayOrder, img.CreatedAt
              )).ToList()
            : Enumerable.Empty<SpaceImageDto>() // Trả về list rỗng nếu nguồn null
    ))
    .ForMember(dest => dest.SystemAmenities, opt => opt.MapFrom(src =>
        src.SystemAmenitiesLink != null
            ? src.SystemAmenitiesLink
                .Where(sal => sal.SystemAmenity != null) // Chỉ lấy những link có SystemAmenity không null
                .Select(sal => new SystemFeatureLinkDto(
                    sal.SystemAmenityId,
                    sal.SystemAmenity!.Name, // Dùng ! nếu chắc chắn không null sau Where, hoặc kiểm tra lại
                    null,
                    null,
                    false
                )).ToList()
            : Enumerable.Empty<SystemFeatureLinkDto>()
    ))
    .ForMember(dest => dest.CustomAmenities, opt => opt.MapFrom(src =>
        src.CustomAmenities != null
            ? src.CustomAmenities.Select(ca => new CustomFeatureDto(ca.Id, ca.Name)).ToList()
            : Enumerable.Empty<CustomFeatureDto>()
    ))
    .ForMember(dest => dest.SystemServices, opt => opt.MapFrom(src =>
        src.SystemServicesLink != null
            ? src.SystemServicesLink
                .Where(ssl => ssl.SystemSpaceService != null) // Chỉ lấy những link có SystemSpaceService không null
                .Select(ssl => new SystemFeatureLinkDto(
                    ssl.SystemSpaceServiceId,
                    ssl.SystemSpaceService!.Name, // Dùng ! nếu chắc chắn không null sau Where
                    ssl.PriceOverride,
                    ssl.Notes,
                    ssl.IsIncludedInBasePrice
                )).ToList()
            : Enumerable.Empty<SystemFeatureLinkDto>()
    ))
    .ForMember(dest => dest.CustomServices, opt => opt.MapFrom(src =>
        src.CustomServices != null
            ? src.CustomServices.Select(cs => new CustomFeatureDto(cs.Id, cs.Name)).ToList()
            : Enumerable.Empty<CustomFeatureDto>()
    ));


            // Ví dụ cho SpaceSummaryDto:
            CreateMap<Space, SpaceSummaryDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address))

.ForMember(dest => dest.Latitude, opt => opt.MapFrom(src => src.Latitude))   // Nếu có
    .ForMember(dest => dest.Longitude, opt => opt.MapFrom(src => src.Longitude)) // Nếu có



                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type))
                .ForMember(dest => dest.Capacity, opt => opt.MapFrom(src => src.Capacity))
                .ForMember(dest => dest.PricePerHour, opt => opt.MapFrom(src => src.PricePerHour))
                .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => src.Slug))
                .ForMember(dest => dest.OwnerId, opt => opt.MapFrom(src => src.OwnerId))
                .ForMember(dest => dest.CoverImageUrl, opt => opt.MapFrom(src =>
                    (src.SpaceImages != null && src.SpaceImages.Any(img => img.IsCoverImage))
                        ? src.SpaceImages.First(img => img.IsCoverImage).ImageUrl
                        : (src.SpaceImages != null && src.SpaceImages.Any())
                            ? src.SpaceImages.OrderBy(img => img.DisplayOrder).First().ImageUrl
                            : null
                ));

            // --- SpaceImage Mappings ---
            CreateMap<SpaceImage, SpaceImageDto>()
                .ForMember(dest => dest.CloudinaryPublicId, opt => opt.MapFrom(src => src.CloudinaryPublicId));
            // CreateMap<UploadSpaceImageRequest, SpaceImage>(); // Không map trực tiếp từ IFormFile
            // Việc tạo SpaceImage từ UploadSpaceImageRequest sẽ được xử lý trong service
            // vì nó liên quan đến việc lưu file và lấy URL.
            CreateMap<UpdateSpaceImageDetailsRequest, SpaceImage>()
     .ForMember(dest => dest.Id, opt => opt.Ignore())
     .ForMember(dest => dest.SpaceId, opt => opt.Ignore())
     .ForMember(dest => dest.ImageUrl, opt => opt.Ignore())
     .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
     .ForMember(dest => dest.Space, opt => opt.Ignore()) // << THÊM DÒNG NÀY
     .ForMember(dest => dest.IsDeleted, opt => opt.Ignore()); // << THÊM DÒNG NÀY (nếu SpaceImage có IsDeleted)

            // --- Booking Mappings ---
            CreateMap<CreateBookingRequest, Booking>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.UserId, opt => opt.Ignore()) // Sẽ được set từ user đang đăng nhập
                .ForMember(dest => dest.TotalPrice, opt => opt.Ignore()) // Sẽ được tính trong service
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Domain.Enums.BookingStatus.Pending))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore()) // Sẽ được set trong service
                .ForMember(dest => dest.ActualCheckIn, opt => opt.Ignore())
                .ForMember(dest => dest.ActualCheckOut, opt => opt.Ignore())
                .ForMember(dest => dest.BookingCode, opt => opt.Ignore()) // Có thể tự sinh trong service
                .ForMember(dest => dest.NotesFromOwner, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.Space, opt => opt.Ignore()); // Không map navigation property


            // Map cho CreateOwnerBookingRequest
            CreateMap<CreateOwnerBookingRequest, Booking>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.TotalPrice, opt => opt.Ignore()) // Sẽ được tính trong service
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore()) // Sẽ được set trong service
                .ForMember(dest => dest.ActualCheckIn, opt => opt.Ignore())
                .ForMember(dest => dest.ActualCheckOut, opt => opt.Ignore())
                .ForMember(dest => dest.BookingCode, opt => opt.Ignore()) // Sẽ được tự sinh
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.CheckedInByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.CheckedOutByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.ActualNumberOfPeople, opt => opt.Ignore())
                .ForMember(dest => dest.CancellationReason, opt => opt.Ignore())
                .ForMember(dest => dest.Notes, opt => opt.Ignore())
                .ForMember(dest => dest.ExternalCalendarEventId, opt => opt.Ignore())
                .ForMember(dest => dest.ExternalCalendarEventUrl, opt => opt.Ignore())
                .ForMember(dest => dest.ExternalIcalUrl, opt => opt.Ignore())
                .ForMember(dest => dest.ExternalIcalUid, opt => opt.Ignore())
                .ForMember(dest => dest.IsExternalBooking, opt => opt.Ignore())
                .ForMember(dest => dest.LastSyncedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Space, opt => opt.Ignore()); // Không map navigation property

            // Tương tự cho BookingDto
            CreateMap<Booking, BookingDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.SpaceId, opt => opt.MapFrom(src => src.SpaceId))
                .ForMember(dest => dest.SpaceName, opt => opt.MapFrom(src => src.Space != null ? src.Space.Name : string.Empty)) // Cần Include(b => b.Space)
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.UserFullName, opt => opt.Ignore()) // Will be set manually in service
                .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.StartTime))
                .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => src.EndTime))
                .ForMember(dest => dest.ActualCheckIn, opt => opt.MapFrom(src => src.ActualCheckIn))
                .ForMember(dest => dest.ActualCheckOut, opt => opt.MapFrom(src => src.ActualCheckOut))
                .ForMember(dest => dest.TotalPrice, opt => opt.MapFrom(src => src.TotalPrice))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ForMember(dest => dest.NumberOfPeople, opt => opt.MapFrom(src => src.NumberOfPeople))
                .ForMember(dest => dest.BookingCode, opt => opt.MapFrom(src => src.BookingCode))
                .ForMember(dest => dest.NotesFromUser, opt => opt.MapFrom(src => src.NotesFromUser))
                .ForMember(dest => dest.NotesFromOwner, opt => opt.MapFrom(src => src.NotesFromOwner))
                .ForMember(dest => dest.NotificationEmail, opt => opt.MapFrom(src => src.NotificationEmail))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt))
                .ForMember(dest => dest.UpdatedByUserId, opt => opt.MapFrom(src => src.UpdatedByUserId))
                .ForMember(dest => dest.CanReview, opt => opt.Ignore()) // CanReview được set trong service, không map tự động
                // Guest booking fields
                .ForMember(dest => dest.GuestName, opt => opt.MapFrom(src => src.GuestName))
                .ForMember(dest => dest.GuestEmail, opt => opt.MapFrom(src => src.GuestEmail))
                .ForMember(dest => dest.GuestPhone, opt => opt.MapFrom(src => src.GuestPhone))
                .ForMember(dest => dest.IsGuestBooking, opt => opt.MapFrom(src => src.UserId == null));

            // --- SystemAmenity Mappings ---
            // Trong SpaceBookingProfile.cs
            CreateMap<SystemAmenity, SystemAmenityDto>();
            CreateMap<CreateSystemAmenityRequest, SystemAmenity>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.SpaceLinks, opt => opt.Ignore());
            CreateMap<UpdateSystemAmenityRequest, SystemAmenity>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.SpaceLinks, opt => opt.Ignore());


            // --- SystemSpaceService Mappings ---
            CreateMap<SystemSpaceService, SystemSpaceServiceDto>();
            CreateMap<CreateSystemSpaceServiceRequest, SystemSpaceService>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.SpaceLinks, opt => opt.Ignore());
            CreateMap<UpdateSystemSpaceServiceRequest, SystemSpaceService>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.SpaceLinks, opt => opt.Ignore());

            // Các mapping cho CustomAmenity, CustomService, và các bảng join nếu cần thiết
            // Thường thì các entity bảng join không cần DTO riêng và không cần map trực tiếp.
            // CustomFeatureDto đã được dùng trong SpaceDto.
        }
    }
}