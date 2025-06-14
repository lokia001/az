// File: Backend.Api/Modules/Engagement/Application/Mappings/EngagementProfile.cs
using AutoMapper;
using Backend.Api.Modules.Engagement.Application.Contracts.Dtos;
using Backend.Api.Modules.Engagement.Domain.Entities;
using Backend.Api.Modules.Engagement.Domain.Enums; // Cho các Enums
using System.Linq; // Cho .Select, .ToList

namespace Backend.Api.Modules.Engagement.Application.Mappings
{
    public class EngagementProfile : Profile
    {
        public EngagementProfile()
        {
            // --- Review Mappings ---
            CreateMap<CreateReviewRequest, Review>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.UserId, opt => opt.Ignore()) // Sẽ được set trong service
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore()) // Mặc định là false
                .ForMember(dest => dest.IsVerifiedOwnerReply, opt => opt.Ignore()) // Mặc định là false
                .ForMember(dest => dest.CommentText, opt => opt.MapFrom(src => src.CommentText)); // Sửa dòng này

            CreateMap<UpdateReviewRequest, Review>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // Không map các trường không có trong DTO hoặc không nên thay đổi
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.SpaceId, opt => opt.Ignore())
                .ForMember(dest => dest.BookingId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore()) // Sẽ được set trong service
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.IsVerifiedOwnerReply, opt => opt.Ignore());

            CreateMap<Review, ReviewDto>();


            // --- Comment Mappings ---
            CreateMap<CreateCommentRequest, Comment>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.UserId, opt => opt.Ignore()) // Sẽ được set trong service
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.ParentComment, opt => opt.Ignore()) // Navigation property
                .ForMember(dest => dest.Replies, opt => opt.Ignore());      // Collection

            CreateMap<UpdateCommentRequest, Comment>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.ParentEntityType, opt => opt.Ignore())
                .ForMember(dest => dest.ParentEntityId, opt => opt.Ignore())
                .ForMember(dest => dest.ParentCommentId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore()) // Sẽ được set trong service
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.ParentComment, opt => opt.Ignore())
                .ForMember(dest => dest.Replies, opt => opt.Ignore());

            CreateMap<Comment, CommentDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.ParentEntityType, opt => opt.MapFrom(src => src.ParentEntityType))
                .ForMember(dest => dest.ParentEntityId, opt => opt.MapFrom(src => src.ParentEntityId))
                .ForMember(dest => dest.ParentCommentId, opt => opt.MapFrom(src => src.ParentCommentId))
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt))
                .ForMember(dest => dest.ReplyCount, opt => opt.Ignore()) // Sẽ được service tính toán và gán
                .ForMember(dest => dest.Replies, opt => opt.MapFrom((src, dest) =>
                    src.Replies != null
                        ? src.Replies.Where(r => !r.IsDeleted).OrderBy(r => r.CreatedAt)
                        : Enumerable.Empty<Comment>()
                ));


            // --- Reaction Mappings ---
            // SetReactionRequest không map trực tiếp sang Reaction entity vì logic phức tạp hơn
            // (kiểm tra existing, xóa cũ, thêm mới). Service sẽ tạo Reaction entity thủ công.

            CreateMap<Reaction, ReactionDto>(); // Map đơn giản

            // ReactionSummaryDto sẽ được tạo thủ công trong ReactionService, không cần mapping ở đây.
        }
    }
}