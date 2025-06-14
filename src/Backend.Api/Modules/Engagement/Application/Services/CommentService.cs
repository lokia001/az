// File: Backend.Api/Modules/Engagement/Application/Services/CommentService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Backend.Api.Data;
using Backend.Api.Modules.Engagement.Application.Contracts.Dtos;
using Backend.Api.Modules.Engagement.Application.Contracts.Services;
using Backend.Api.Modules.Engagement.Domain.Entities;
using Backend.Api.Modules.Engagement.Domain.Enums;
using Backend.Api.Modules.Engagement.Domain.Interfaces.Repositories;
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories; // ISpaceRepository
using Backend.Api.Modules.CommunityContent.Domain.Interfaces.Repositories; // IPostRepository
// using Backend.Api.Modules.UserRelated.Application.Contracts.Services; // IUserService nếu cần kiểm tra quyền phức tạp
using Backend.Api.SharedKernel.Dtos; // PagedResultDto
using Microsoft.EntityFrameworkCore; // Cho AnyAsync, Include, ThenInclude
using Microsoft.Extensions.Logging;

namespace Backend.Api.Modules.Engagement.Application.Services
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepository;
        private readonly ISpaceRepository _spaceRepository; // Để kiểm tra ParentEntity Space
        private readonly IPostRepository _postRepository;   // Để kiểm tra ParentEntity Post
        private readonly IReviewRepository _reviewRepository; // Để kiểm tra ParentEntity Review
        private readonly IMapper _mapper;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<CommentService> _logger;
        // private readonly IUserService _userService;

        public CommentService(
            ICommentRepository commentRepository,
            ISpaceRepository spaceRepository,
            IPostRepository postRepository,
            IReviewRepository reviewRepository, // Thêm vào constructor
            IMapper mapper,
            AppDbContext dbContext,
            ILogger<CommentService> logger
            // IUserService userService
            )
        {
            _commentRepository = commentRepository;
            _spaceRepository = spaceRepository;
            _postRepository = postRepository;
            _reviewRepository = reviewRepository; // Gán giá trị
            _mapper = mapper;
            _dbContext = dbContext;
            _logger = logger;
            // _userService = userService;
        }

        private async Task<bool> ParentEntityExistsAndAccessible(EngageableEntityType parentType, Guid parentId, Guid? requestorUserId)
        {
            // TODO: Implement logic kiểm tra quyền truy cập vào parent entity nếu nó private (ví dụ: private community)
            // Hiện tại chỉ kiểm tra sự tồn tại.
            switch (parentType)
            {
                case EngageableEntityType.Space:
                    var space = await _spaceRepository.GetByIdAsync(parentId);
                    return space != null; // Sau này có thể kiểm tra space.IsPublic hoặc user có quyền xem không
                case EngageableEntityType.Post:
                    var post = await _postRepository.GetByIdAsync(parentId, includeCommunity: true); // Cần Community để check IsPublic
                    if (post == null || post.IsDeleted) return false;
                    return post.Community.IsPublic; // Ví dụ: chỉ cho comment nếu community của post là public
                                                    // Hoặc kiểm tra user là member nếu community private
                case EngageableEntityType.Review:
                    var review = await _reviewRepository.GetByIdAsync(parentId);
                    return review != null; // Review thường là public nếu Space/Post public
                case EngageableEntityType.Comment: // Khi trả lời một comment khác
                    var parentComment = await _commentRepository.GetByIdAsync(parentId);
                    return parentComment != null;
                default:
                    return false;
            }
        }

        public async Task<CommentDto> CreateCommentAsync(CreateCommentRequest request, Guid userId)
        {
            _logger.LogInformation("User {UserId} attempting to create comment on {ParentType}:{ParentId}, ReplyTo: {ReplyToId}",
                userId, request.ParentEntityType, request.ParentEntityId, request.ParentCommentId);

            if (!await ParentEntityExistsAndAccessible(request.ParentEntityType, request.ParentEntityId, userId))
            {
                throw new KeyNotFoundException($"Parent entity {request.ParentEntityType} with ID {request.ParentEntityId} not found or not accessible.");
            }

            if (request.ParentCommentId.HasValue)
            {
                var parentComment = await _commentRepository.GetByIdAsync(request.ParentCommentId.Value);
                if (parentComment == null || parentComment.IsDeleted)
                {
                    throw new KeyNotFoundException($"Parent comment with ID {request.ParentCommentId.Value} not found or deleted.");
                }
                // Đảm bảo reply đang nhắm đúng vào comment gốc của thread hoặc comment cha hợp lệ
                if (parentComment.ParentEntityType != request.ParentEntityType || parentComment.ParentEntityId != request.ParentEntityId)
                {
                    // Nếu comment cha (parentComment) không thuộc cùng ParentEntityType và ParentEntityId của comment mới
                    // (trừ khi comment mới đang trả lời trực tiếp một comment khác, lúc đó ParentEntityType của comment mới là Comment
                    // và ParentEntityId của comment mới là Id của comment được trả lời)
                    if (request.ParentEntityType != EngageableEntityType.Comment || request.ParentEntityId != request.ParentCommentId.Value)
                    {
                        throw new ArgumentException("Reply is not valid for the specified parent entity or parent comment.");
                    }
                }
                // Nếu ParentEntityType là Comment, thì ParentEntityId phải chính là ParentCommentId
                if (request.ParentEntityType == EngageableEntityType.Comment && request.ParentEntityId != request.ParentCommentId.Value)
                {
                    throw new ArgumentException("When replying to a comment, ParentEntityId must be the ID of the comment being replied to.");
                }
            }


            var comment = _mapper.Map<Comment>(request);
            comment.UserId = userId;
            comment.CreatedAt = DateTime.UtcNow;

            await _commentRepository.AddAsync(comment);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Comment {CommentId} created successfully by User {UserId}", comment.Id, userId);

            // Lấy lại comment với thông tin cần thiết cho DTO
            var createdCommentWithDetails = await GetCommentByIdAsync(comment.Id, true); // true để lấy replies (mặc dù mới tạo sẽ rỗng) và reply count
            if (createdCommentWithDetails == null) throw new Exception("Failed to retrieve comment after creation."); // Lỗi hiếm

            return createdCommentWithDetails;
        }

        public async Task<CommentDto?> GetCommentByIdAsync(Guid commentId, bool includeRepliesDeep = false) // includeRepliesDeep để tải nhiều cấp
        {
            _logger.LogInformation("Fetching comment by ID: {CommentId}, IncludeRepliesDeep: {IncludeRepliesDeep}", commentId, includeRepliesDeep);

            // CommentRepository.GetByIdAsync nên có tùy chọn includeReplies (1 cấp)
            // Nếu includeRepliesDeep = true, chúng ta cần logic đệ quy hoặc query phức tạp hơn để tải nhiều cấp replies.
            // Hiện tại, giả sử repo.GetByIdAsync(..., true) tải 1 cấp replies.
            var comment = await _commentRepository.GetByIdAsync(commentId, includeRepliesDeep);
            if (comment == null) return null; // HasQueryFilter đã lọc IsDeleted

            var commentDto = _mapper.Map<CommentDto>(comment);

            // AutoMapper đã map replies 1 cấp nếu includeRepliesDeep là true và repo đã tải.
            // Bây giờ tính ReplyCount cho comment chính và các replies của nó (nếu có).
            commentDto.ReplyCount = await _commentRepository.GetReplyCountAsync(comment.Id);
            if (commentDto.Replies != null && commentDto.Replies.Any())
            {
                foreach (var replyDto in commentDto.Replies)
                {
                    replyDto.ReplyCount = await _commentRepository.GetReplyCountAsync(replyDto.Id);
                    // Nếu muốn tải replies của replies (đệ quy), cần thêm logic ở đây hoặc trong mapping/repo
                    // if (includeRepliesDeep) { /* Tải thêm replies cho replyDto */ }
                }
            }
            return commentDto;
        }

        public async Task<PagedResultDto<CommentDto>> GetCommentsForParentEntityAsync(EngageableEntityType parentType, Guid parentId, CommentSearchCriteriaDto criteria)
        {
            _logger.LogInformation("Fetching comments for Parent {ParentType}:{ParentId}, Criteria: {@Criteria}", parentType, parentId, criteria);

            if (!await ParentEntityExistsAndAccessible(parentType, parentId, null)) // null cho requestorUserId vì đây là AllowAnonymous
            {
                throw new KeyNotFoundException($"Parent entity {parentType} with ID {parentId} not found or not accessible.");
            }

            // Cần phương thức SearchAsync trong ICommentRepository
            // Tạm thời, lọc và phân trang ở đây
            var query = _dbContext.Set<Comment>()
                .Where(c => c.ParentEntityType == parentType &&
                            c.ParentEntityId == parentId &&
                            c.ParentCommentId == null); // Chỉ lấy comment gốc

            // HasQueryFilter cho IsDeleted đã được áp dụng tự động.

            if (criteria.UserId.HasValue)
            {
                query = query.Where(c => c.UserId == criteria.UserId.Value);
            }

            var totalCount = await query.CountAsync();

            var comments = await query
                .OrderByDescending(c => c.CreatedAt) // Sắp xếp theo ngày tạo mới nhất
                .Skip((criteria.PageNumber - 1) * criteria.PageSize)
                .Take(criteria.PageSize)
                .ToListAsync();

            var commentDtos = new List<CommentDto>();
            foreach (var comment in comments)
            {
                var dto = _mapper.Map<CommentDto>(comment);
                dto.ReplyCount = await _commentRepository.GetReplyCountAsync(comment.Id);
                if (criteria.IncludeReplies) // Nếu client yêu cầu replies cho từng comment gốc
                {
                    // Lấy replies cấp 1
                    var replies = await _dbContext.Set<Comment>()
                                        .Where(r => r.ParentCommentId == comment.Id && !r.IsDeleted) // Luôn lọc IsDeleted cho replies
                                        .OrderBy(r => r.CreatedAt)
                                        .ToListAsync();
                    dto.Replies = _mapper.Map<List<CommentDto>>(replies);
                    // Tính ReplyCount cho các replies cấp 1
                    foreach (var replyDto in dto.Replies)
                    {
                        replyDto.ReplyCount = await _commentRepository.GetReplyCountAsync(replyDto.Id);
                    }
                }
                commentDtos.Add(dto);
            }

            return new PagedResultDto<CommentDto>(commentDtos, criteria.PageNumber, criteria.PageSize, totalCount);
        }

        public async Task<CommentDto?> UpdateCommentAsync(Guid commentId, UpdateCommentRequest request, Guid userId)
        {
            _logger.LogInformation("User {UserId} attempting to update Comment {CommentId}", userId, commentId);
            var comment = await _commentRepository.GetByIdAsync(commentId);
            if (comment == null) // HasQueryFilter đã lọc IsDeleted
            {
                _logger.LogWarning("UpdateCommentAsync: Comment {CommentId} not found or deleted, cannot be updated by User {UserId}.", commentId, userId);
                return null;
            }

            // Chỉ người viết comment mới được sửa
            if (comment.UserId != userId)
            {
                _logger.LogWarning("User {UserId} is not authorized to update Comment {CommentId} (Author: {AuthorId}).", userId, commentId, comment.UserId);
                throw new UnauthorizedAccessException("User is not authorized to update this comment.");
            }

            // Kiểm tra xem comment có bị khóa không (ví dụ: post cha bị khóa) - logic này cần thêm
            // if (IsParentLocked(comment.ParentEntityType, comment.ParentEntityId)) throw new InvalidOperationException("Cannot update comment on a locked entity.");

            _mapper.Map(request, comment); // Áp dụng thay đổi Content
            comment.UpdatedAt = DateTime.UtcNow;

            _commentRepository.Update(comment);
            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("Comment {CommentId} updated successfully by User {UserId}.", commentId, userId);

            // Lấy lại để có thể có replies nếu GetByIdAsync của repo có include
            var updatedComment = await _commentRepository.GetByIdAsync(commentId, true); // true để có thể lấy replies nếu cần
            return _mapper.Map<CommentDto>(updatedComment);
        }

        public async Task<bool> DeleteCommentAsync(Guid commentId, Guid userId)
        {
            _logger.LogInformation("User {UserId} attempting to delete Comment {CommentId}", userId, commentId);
            var comment = await _dbContext.Set<Comment>()
                                     .IgnoreQueryFilters() // Lấy cả comment đã soft delete
                                     .Include(c => c.Replies) // Include replies để xử lý (nếu cần)
                                     .FirstOrDefaultAsync(c => c.Id == commentId);

            if (comment == null)
            {
                _logger.LogWarning("DeleteCommentAsync: Comment {CommentId} not found for deletion by User {UserId}.", commentId, userId);
                return false;
            }
            if (comment.IsDeleted) return true; // Đã xóa rồi

            // Kiểm tra quyền: người viết comment, hoặc Mod/Admin của ParentEntity (Space, Post, Community)
            // Logic này phức tạp, cần ICommunityMemberService, ISpaceService, etc.
            // Hiện tại, chỉ cho phép người viết tự xóa.
            bool canDelete = false;
            if (comment.UserId == userId)
            {
                canDelete = true;
            }
            // else if (await CheckPermissionOnParentEntity(comment.ParentEntityType, comment.ParentEntityId, userId, RequiredPermission.DeleteComment))
            // {
            //    canDelete = true;
            // }

            if (!canDelete)
            {
                _logger.LogWarning("User {UserId} is not authorized to delete Comment {CommentId} (Author: {AuthorId}).", userId, commentId, comment.UserId);
                throw new UnauthorizedAccessException("User is not authorized to delete this comment.");
            }

            // Thực hiện Soft Delete cho comment và CÓ THỂ cả các replies của nó (tùy yêu cầu)
            comment.IsDeleted = true;
            comment.UpdatedAt = DateTime.UtcNow;
            _commentRepository.Update(comment);

            // Nếu muốn soft delete cả replies khi comment cha bị soft delete:
            // foreach (var reply in comment.Replies.Where(r => !r.IsDeleted))
            // {
            //     reply.IsDeleted = true;
            //     reply.UpdatedAt = DateTime.UtcNow;
            //     _commentRepository.Update(reply);
            // }
            // Hiện tại, CommentConfiguration có OnDelete(ClientSetNull) cho ParentCommentId,
            // điều đó áp dụng cho HARD DELETE. Với SOFT DELETE, replies sẽ không tự động bị soft delete.
            // HasQueryFilter trên Comment sẽ ẩn các replies nếu cha của chúng bị ẩn khi query theo kiểu cha-con.

            var result = await _dbContext.SaveChangesAsync();
            _logger.LogInformation("Comment {CommentId} soft deleted successfully by User {UserId}.", commentId, userId);
            return result > 0;
        }
    }
}