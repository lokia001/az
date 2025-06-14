// File: Backend.Api/Modules/Engagement/Application/Services/ReactionService.cs
using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Backend.Api.Data;
using Backend.Api.Modules.Engagement.Application.Contracts.Dtos;
using Backend.Api.Modules.Engagement.Application.Contracts.Services;
using Backend.Api.Modules.Engagement.Domain.Entities;
using Backend.Api.Modules.Engagement.Domain.Enums;
using Backend.Api.Modules.Engagement.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;
// Using cho các repository của các module khác để kiểm tra TargetEntity tồn tại
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories;
using Backend.Api.Modules.CommunityContent.Domain.Interfaces.Repositories;


namespace Backend.Api.Modules.Engagement.Application.Services
{
    public class ReactionService : IReactionService
    {
        private readonly IReactionRepository _reactionRepository;
        private readonly IMapper _mapper; // Có thể không cần nhiều nếu DTO đơn giản
        private readonly AppDbContext _dbContext;
        private readonly ILogger<ReactionService> _logger;
        // Inject các repository cần thiết để kiểm tra TargetEntity
        private readonly ISpaceRepository _spaceRepository;
        private readonly IPostRepository _postRepository;
        private readonly IReviewRepository _reviewRepository;
        private readonly ICommentRepository _commentRepository;


        public ReactionService(
            IReactionRepository reactionRepository,
            IMapper mapper,
            AppDbContext dbContext,
            ILogger<ReactionService> logger,
            ISpaceRepository spaceRepository,
            IPostRepository postRepository,
            IReviewRepository reviewRepository,
            ICommentRepository commentRepository)
        {
            _reactionRepository = reactionRepository;
            _mapper = mapper;
            _dbContext = dbContext;
            _logger = logger;
            _spaceRepository = spaceRepository;
            _postRepository = postRepository;
            _reviewRepository = reviewRepository;
            _commentRepository = commentRepository;
        }

        private async Task<bool> TargetEntityExistsAndAccessible(EngageableEntityType targetType, Guid targetId, Guid? requestorUserId)
        {
            // Tương tự ParentEntityExistsAndAccessible trong CommentService
            // TODO: Implement logic kiểm tra quyền truy cập vào target entity nếu nó private
            switch (targetType)
            {
                case EngageableEntityType.Space:
                    var space = await _spaceRepository.GetByIdAsync(targetId);
                    return space != null; // Sau này kiểm tra IsPublic
                case EngageableEntityType.Post:
                    var post = await _postRepository.GetByIdAsync(targetId, includeCommunity: true);
                    if (post == null || post.IsDeleted) return false;
                    return post.Community.IsPublic; // Ví dụ
                case EngageableEntityType.Review:
                    return await _reviewRepository.GetByIdAsync(targetId) != null;
                case EngageableEntityType.Comment:
                    return await _commentRepository.GetByIdAsync(targetId) != null;
                default:
                    return false;
            }
        }

        public async Task<ReactionSummaryDto> SetReactionAsync(SetReactionRequest request, Guid userId)
        {
            _logger.LogInformation("User {UserId} attempting to set reaction {ReactionType} on {TargetType}:{TargetId}",
                userId, request.ReactionType, request.TargetEntityType, request.TargetEntityId);

            if (!await TargetEntityExistsAndAccessible(request.TargetEntityType, request.TargetEntityId, userId))
            {
                throw new KeyNotFoundException($"Target entity {request.TargetEntityType} with ID {request.TargetEntityId} not found or not accessible.");
            }

            // Unique constraint trong DB là (UserId, TargetEntityType, TargetEntityId, ReactionType)
            // Logic: Một user chỉ có thể có MỘT reaction cho một target. Nếu họ chọn reaction khác, reaction cũ sẽ bị xóa và reaction mới được thêm.
            // Nếu họ chọn lại reaction cũ, reaction đó sẽ bị xóa (toggle off).

            var existingReactionOfSameType = await _reactionRepository.GetUserReactionAsync(userId, request.TargetEntityType, request.TargetEntityId, request.ReactionType);

            if (existingReactionOfSameType != null)
            {
                // User bấm lại vào reaction cùng loại -> Xóa reaction đó (unlike, unlove, etc.)
                _reactionRepository.Delete(existingReactionOfSameType);
                _logger.LogInformation("User {UserId} removed existing reaction {ReactionType} from {TargetType}:{TargetId}",
                    userId, request.ReactionType, request.TargetEntityType, request.TargetEntityId);
            }
            else
            {
                // User chưa có reaction này, hoặc có reaction khác loại.
                // Xóa reaction khác loại (nếu có) của user cho target này (đảm bảo 1 user chỉ có 1 reaction cho 1 target)
                var anyExistingReactionForTarget = await _reactionRepository.GetUserReactionForTargetAsync(userId, request.TargetEntityType, request.TargetEntityId);
                if (anyExistingReactionForTarget != null)
                {
                    _reactionRepository.Delete(anyExistingReactionForTarget);
                    _logger.LogInformation("User {UserId} removed previous reaction {OldReactionType} before setting new one on {TargetType}:{TargetId}",
                       userId, anyExistingReactionForTarget.Type, request.TargetEntityType, request.TargetEntityId);
                }

                // Tạo reaction mới
                var newReaction = new Reaction
                {
                    UserId = userId,
                    TargetEntityType = request.TargetEntityType,
                    TargetEntityId = request.TargetEntityId,
                    Type = request.ReactionType,
                    CreatedAt = DateTime.UtcNow
                };
                await _reactionRepository.AddAsync(newReaction);
                _logger.LogInformation("User {UserId} added new reaction {ReactionType} to {TargetType}:{TargetId}",
                    userId, request.ReactionType, request.TargetEntityType, request.TargetEntityId);
            }

            await _dbContext.SaveChangesAsync();
            return await GetReactionSummaryAsync(request.TargetEntityType, request.TargetEntityId, userId);
        }

        public async Task<ReactionSummaryDto> RemoveReactionAsync(RemoveReactionRequest request, Guid userId)
        {
            _logger.LogInformation("User {UserId} attempting to remove reaction (Type: {ReactionTypeToRemove}) from {TargetType}:{TargetId}",
               userId, request.ReactionTypeToRemove, request.TargetEntityType, request.TargetEntityId);

            if (!await TargetEntityExistsAndAccessible(request.TargetEntityType, request.TargetEntityId, userId))
            {
                // Không throw lỗi ở đây nếu target không tồn tại, vì user chỉ muốn xóa reaction của họ
                // Nếu target không tồn tại, thì chắc chắn không có reaction nào để xóa.
                _logger.LogWarning("RemoveReaction: Target entity {TargetType}:{TargetId} not found, no reaction to remove for User {UserId}.",
                   request.TargetEntityType, request.TargetEntityId, userId);
                return await GetReactionSummaryAsync(request.TargetEntityType, request.TargetEntityId, userId); // Trả về summary hiện tại (sẽ là rỗng)
            }

            Reaction? reactionToRemove;
            if (request.ReactionTypeToRemove.HasValue)
            {
                reactionToRemove = await _reactionRepository.GetUserReactionAsync(userId, request.TargetEntityType, request.TargetEntityId, request.ReactionTypeToRemove.Value);
            }
            else
            {
                // Xóa bất kỳ reaction nào của user cho target đó
                reactionToRemove = await _reactionRepository.GetUserReactionForTargetAsync(userId, request.TargetEntityType, request.TargetEntityId);
            }

            if (reactionToRemove != null)
            {
                _reactionRepository.Delete(reactionToRemove);
                await _dbContext.SaveChangesAsync();
                _logger.LogInformation("User {UserId} removed reaction successfully from {TargetType}:{TargetId}",
                    userId, request.TargetEntityType, request.TargetEntityId);
            }
            else
            {
                _logger.LogInformation("User {UserId} attempted to remove a non-existent reaction from {TargetType}:{TargetId}",
                   userId, request.TargetEntityType, request.TargetEntityId);
            }
            return await GetReactionSummaryAsync(request.TargetEntityType, request.TargetEntityId, userId);
        }

        public async Task<ReactionSummaryDto?> GetReactionSummaryAsync(EngageableEntityType targetType, Guid targetId, Guid? currentUserId)
        {
            _logger.LogInformation("Fetching reaction summary for {TargetType}:{TargetId}, CurrentUserId: {CurrentUserId}",
                targetType, targetId, currentUserId);

            if (!await TargetEntityExistsAndAccessible(targetType, targetId, currentUserId))
            {
                _logger.LogWarning("GetReactionSummary: Target entity {TargetType}:{TargetId} not found or not accessible.", targetType, targetId);
                return null;
            }

            var counts = await _reactionRepository.GetReactionCountsAsync(targetType, targetId);
            ReactionType? currentUserReactionType = null;

            if (currentUserId.HasValue)
            {
                var userReaction = await _reactionRepository.GetUserReactionForTargetAsync(currentUserId.Value, targetType, targetId);
                currentUserReactionType = userReaction?.Type;
            }

            return new ReactionSummaryDto
            {
                TargetEntityType = targetType,
                TargetEntityId = targetId,
                Counts = counts,
                CurrentUserReactionType = currentUserReactionType
            };
        }
    }
}