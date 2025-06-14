// File: Backend.Api/Modules/CommunityContent/Application/Mappings/CommunityContentProfile.cs
using AutoMapper;
using Backend.Api.Modules.CommunityContent.Application.Contracts.Dtos;
using Backend.Api.Modules.CommunityContent.Domain.Entities;
using System.Linq;

namespace Backend.Api.Modules.CommunityContent.Application.Mappings
{
    public class CommunityContentProfile : Profile
    {
        public CommunityContentProfile()
        {
            // --- Community Mappings ---
            // (Giữ nguyên các mapping cho Community, CommunityMember như bạn đã cung cấp)
            CreateMap<CreateCommunityRequest, Community>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.Members, opt => opt.Ignore())
                .ForMember(dest => dest.Posts, opt => opt.Ignore());

            CreateMap<UpdateCommunityRequest, Community>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.Members, opt => opt.Ignore())
                .ForMember(dest => dest.Posts, opt => opt.Ignore());
            // IsPublic sẽ được AutoMapper xử lý nếu UpdateCommunityRequest.IsPublic là bool?

            CreateMap<Community, CommunityDto>()
               .ForMember(dest => dest.MemberCount, opt => opt.MapFrom(src => src.Members != null ? src.Members.Count : 0))
               .ForMember(dest => dest.PostCount, opt => opt.MapFrom(src => src.Posts != null ? src.Posts.Count : 0));

            CreateMap<Community, CommunitySummaryDto>()
                .ForMember(dest => dest.MemberCount, opt => opt.MapFrom(src => src.Members != null ? src.Members.Count : 0));

            // --- CommunityMember Mappings ---
            CreateMap<CommunityMember, CommunityMemberDto>();
            CreateMap<CommunityMember, UserCommunityMembershipDto>()
                .ForMember(dest => dest.CommunityName, opt => opt.MapFrom(src => src.Community != null ? src.Community.Name : string.Empty))
                .ForMember(dest => dest.CommunityCoverImageUrl, opt => opt.MapFrom(src => src.Community != null ? src.Community.CoverImageUrl : null))
.ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId)) // << ĐẢM BẢO CÓ DÒNG NÀY (HOẶC AUTOMAPPER TỰ LÀM)
                .ForMember(dest => dest.RoleInCommunity, opt => opt.MapFrom(src => src.Role))
                .ForMember(dest => dest.JoinedAt, opt => opt.MapFrom(src => src.JoinedAt));


            // --- Post Mappings ---
            CreateMap<CreatePostRequest, Post>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.AuthorUserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.ViewCount, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.IsPinned, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.IsLocked, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.Community, opt => opt.Ignore());

            CreateMap<UpdatePostRequest, Post>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CommunityId, opt => opt.Ignore())
                .ForMember(dest => dest.AuthorUserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.ViewCount, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.IsPinned, opt => opt.Ignore())
                .ForMember(dest => dest.IsLocked, opt => opt.Ignore())
                .ForMember(dest => dest.Community, opt => opt.Ignore());

            CreateMap<Post, PostDto>()
                // Map tường minh các thuộc tính của PostDto
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.CommunityId, opt => opt.MapFrom(src => src.CommunityId))
                .ForMember(dest => dest.AuthorUserId, opt => opt.MapFrom(src => src.AuthorUserId))
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
                .ForMember(dest => dest.ViewCount, opt => opt.MapFrom(src => src.ViewCount))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt))
                .ForMember(dest => dest.UpdatedByUserId, opt => opt.MapFrom(src => src.UpdatedByUserId))
                .ForMember(dest => dest.IsPinned, opt => opt.MapFrom(src => src.IsPinned))
                .ForMember(dest => dest.IsLocked, opt => opt.MapFrom(src => src.IsLocked))
                .ForMember(dest => dest.AuthorCommunityRole, opt => opt.Ignore()); // << THÊM IGNORE, service sẽ làm giàu

            CreateMap<Post, PostSummaryDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.CommunityId, opt => opt.MapFrom(src => src.CommunityId))
                .ForMember(dest => dest.AuthorUserId, opt => opt.MapFrom(src => src.AuthorUserId))
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
                .ForMember(dest => dest.ViewCount, opt => opt.MapFrom(src => src.ViewCount))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.IsPinned, opt => opt.MapFrom(src => src.IsPinned))
                .ForMember(dest => dest.IsLocked, opt => opt.MapFrom(src => src.IsLocked))
                .ForMember(dest => dest.AuthorCommunityRole, opt => opt.Ignore()); // << THÊM IGNORE, service sẽ làm giàu
        }
    }
}