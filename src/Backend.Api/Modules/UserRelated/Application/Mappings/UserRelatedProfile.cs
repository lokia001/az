// File: Backend.Api/Modules/UserRelated/Application/Mappings/UserRelatedProfile.cs
using AutoMapper;
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;
using Backend.Api.Modules.UserRelated.Domain.Entities;
using Backend.Api.Modules.UserRelated.Domain.Enums;
using System;

namespace Backend.Api.Modules.UserRelated.Application.Mappings
{
    public class UserRelatedProfile : Profile
    {
        public UserRelatedProfile()
        {
            // User -> UserDto
            CreateMap<User, UserDto>()
                .ConstructUsing(src => new UserDto(
                    src.Id,
                    src.Username,
                    src.Email,
                    src.FullName,
                    src.Gender,
                    src.DateOfBirth,
                    src.Bio,
                    src.PhoneNumber,
                    src.Address,
                    src.AvatarUrl,
                    src.Role,
                    src.CreatedAt
                ));

            // RegisterUserRequest -> User
            CreateMap<RegisterUserRequest, User>()
    .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
    .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()) // Sẽ được hash và set riêng
    .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.Username))
    .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => UserGender.Unknown))
    .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
    .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
    .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => false))
    .ForMember(dest => dest.DateOfBirth, opt => opt.Ignore())
    .ForMember(dest => dest.Bio, opt => opt.Ignore())
    .ForMember(dest => dest.PhoneNumber, opt => opt.Ignore())
    .ForMember(dest => dest.Address, opt => opt.Ignore())
    .ForMember(dest => dest.AvatarUrl, opt => opt.Ignore())
    .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
    .ForMember(dest => dest.PasswordResetToken, opt => opt.Ignore())
    .ForMember(dest => dest.PasswordResetTokenExpiry, opt => opt.Ignore())
    .ForMember(dest => dest.RefreshToken, opt => opt.Ignore())
    .ForMember(dest => dest.RefreshTokenExpiry, opt => opt.Ignore())
    .ForMember(dest => dest.OwnerProfile, opt => opt.Ignore())
    .ForSourceMember(src => src.Password, opt => opt.DoNotValidate());

            // UpdateUserProfileRequest -> User (Dùng cho việc cập nhật entity đã tồn tại)
            // AutoMapper sẽ ghi đè các thuộc tính của User bằng các giá trị từ UpdateUserProfileRequest
            // nếu tên thuộc tính khớp. Các thuộc tính không có trong DTO hoặc bị Ignore sẽ không bị ảnh hưởng.
            CreateMap<UpdateUserProfileRequest, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Username, opt => opt.Ignore())
                .ForMember(dest => dest.Email, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.Role, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordResetToken, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordResetTokenExpiry, opt => opt.Ignore())
                .ForMember(dest => dest.RefreshToken, opt => opt.Ignore())
                .ForMember(dest => dest.RefreshTokenExpiry, opt => opt.Ignore())
                .ForMember(dest => dest.OwnerProfile, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore()); // UpdatedAt sẽ được set thủ công

            // OwnerProfile -> OwnerProfileDto
            CreateMap<OwnerProfile, OwnerProfileDto>();

            // UpsertOwnerProfileRequest -> OwnerProfile
            CreateMap<UpsertOwnerProfileRequest, OwnerProfile>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore()) // Sẽ được set từ context
                .ForMember(dest => dest.IsVerified, opt => opt.Ignore()) // Quản lý bởi SysAdmin
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore()) // Sẽ được set thủ công khi tạo mới
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());// Sẽ được set thủ công khi cập nhật

            // Owner Registration Request mappings
            // CreateOwnerRegistrationRequest -> OwnerRegistrationRequest
            CreateMap<CreateOwnerRegistrationRequest, OwnerRegistrationRequest>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.UserId, opt => opt.Ignore()) // Set from context
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => OwnerRegistrationStatus.Pending))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.ProcessedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ProcessedByAdmin, opt => opt.Ignore())
                .ForMember(dest => dest.ProcessedAt, opt => opt.Ignore())
                .ForMember(dest => dest.AdminNotes, opt => opt.Ignore())
                .ForMember(dest => dest.RejectionReason, opt => opt.Ignore());

            // OwnerRegistrationRequest -> OwnerRegistrationRequestDto
            CreateMap<OwnerRegistrationRequest, OwnerRegistrationRequestDto>()
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : string.Empty))
                .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => src.User != null ? src.User.Email : string.Empty))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.ProcessedByUsername, opt => opt.MapFrom(src => src.ProcessedByAdmin != null ? src.ProcessedByAdmin.Username : null));
        }
    }
}