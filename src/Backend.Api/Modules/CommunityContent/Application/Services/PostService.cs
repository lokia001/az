// File: Backend.Api/Modules/CommunityContent/Application/Services/PostService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Backend.Api.Data;
using Backend.Api.Modules.CommunityContent.Application.Contracts.Dtos;
using Backend.Api.Modules.CommunityContent.Application.Contracts.Services;
using Backend.Api.Modules.CommunityContent.Domain.Entities;
using Backend.Api.Modules.CommunityContent.Domain.Enums;
using Backend.Api.Modules.CommunityContent.Domain.Interfaces.Repositories;
using Backend.Api.SharedKernel.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Modules.CommunityContent.Application.Services
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;
        private readonly ICommunityRepository _communityRepository;
        private readonly ICommunityMemberService _communityMemberService; // Đã inject
        private readonly IMapper _mapper;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<PostService> _logger;

        public PostService(
            IPostRepository postRepository,
            ICommunityRepository communityRepository,
            ICommunityMemberService communityMemberService,
            IMapper mapper,
            AppDbContext dbContext,
            ILogger<PostService> logger)
        {
            _postRepository = postRepository;
            _communityRepository = communityRepository;
            _communityMemberService = communityMemberService;
            _mapper = mapper;
            _dbContext = dbContext;
            _logger = logger;
        }

        // Helper method để làm giàu PostDto/PostSummaryDto với AuthorCommunityRole
        private async Task<TDto> EnrichPostDtoWithAuthorRole<TDto>(TDto postDto, Guid communityId, Guid authorUserId)
            where TDto : class // Thêm constraint để có thể gán lại
        {
            if (postDto == null) return null!; // Hoặc throw

            var authorRole = await _communityMemberService.GetUserRoleInCommunityAsync(communityId, authorUserId);

            // Cập nhật DTO. Cần đảm bảo DTO là class hoặc record có thể dùng 'with'
            if (postDto is PostDto concretePostDto)
            {
                concretePostDto.AuthorCommunityRole = authorRole;
                return concretePostDto as TDto;
            }
            if (postDto is PostSummaryDto concreteSummaryDto)
            {
                concreteSummaryDto.AuthorCommunityRole = authorRole;
                return concreteSummaryDto as TDto;
            }
            return postDto; // Trả về DTO gốc nếu không khớp kiểu
        }


        public async Task<PostDto> CreatePostAsync(CreatePostRequest request, Guid authorUserId)
        {
            _logger.LogInformation("User {AuthorUserId} attempting to create post in Community {CommunityId}", authorUserId, request.CommunityId);

            var community = await _communityRepository.GetByIdAsync(request.CommunityId);
            if (community == null || community.IsDeleted)
            {
                throw new KeyNotFoundException($"Community with ID {request.CommunityId} not found or has been deleted.");
            }

            if (!await _communityMemberService.IsUserMemberOfCommunityAsync(request.CommunityId, authorUserId))
            {
                throw new UnauthorizedAccessException("User is not a member of this community and cannot create posts.");
            }

            var post = _mapper.Map<Post>(request);
            post.AuthorUserId = authorUserId;
            post.CreatedAt = DateTime.UtcNow;

            await _postRepository.AddAsync(post);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Post {PostId} created successfully by User {AuthorUserId} in Community {CommunityId}", post.Id, authorUserId, request.CommunityId);

            var createdPostWithDetails = await _postRepository.GetByIdAsync(post.Id, includeCommunity: true);
            if (createdPostWithDetails == null) throw new Exception("Failed to retrieve post after creation.");

            var postDto = _mapper.Map<PostDto>(createdPostWithDetails);
            return await EnrichPostDtoWithAuthorRole(postDto, createdPostWithDetails.CommunityId, createdPostWithDetails.AuthorUserId);
        }

        public async Task<PostDto?> GetPostByIdAsync(Guid postId)
        {
            _logger.LogInformation("Fetching post by ID: {PostId}", postId);
            var post = await _postRepository.GetByIdAsync(postId, includeCommunity: true);
            if (post == null || post.IsDeleted) // PostRepository đã có HasQueryFilter cho IsDeleted
            {
                return null;
            }

            if (post.Community == null || post.Community.IsDeleted) // Kiểm tra community của post
            {
                _logger.LogWarning("Post {PostId} belongs to a non-existent or deleted community {CommunityId}.", postId, post.CommunityId);
                return null; // Hoặc throw lỗi nếu post không nên tồn tại nếu community bị xóa
            }

            // TODO: Logic kiểm tra quyền xem post trong community private (nếu User hiện tại không phải là member)
            // if (!post.Community.IsPublic && !(await _communityMemberService.IsUserMemberOfCommunityAsync(post.CommunityId, currentUserId)))
            // {
            //     return null;
            // }

            var postDto = _mapper.Map<PostDto>(post);
            return await EnrichPostDtoWithAuthorRole(postDto, post.CommunityId, post.AuthorUserId);
        }

        public async Task<PagedResultDto<PostSummaryDto>> GetPostsByCommunityAsync(Guid communityId, PostSearchCriteriaDto criteria)
        {
            _logger.LogInformation("Fetching posts for Community {CommunityId} with criteria {@Criteria}", communityId, criteria);
            var community = await _communityRepository.GetByIdAsync(communityId);
            if (community == null || community.IsDeleted)
            {
                throw new KeyNotFoundException($"Community with ID {communityId} not found or has been deleted.");
            }

            // TODO: Logic kiểm tra quyền xem posts trong community private
            // if (!community.IsPublic && !(await _communityMemberService.IsUserMemberOfCommunityAsync(communityId, currentUserId)))
            // {
            //     throw new UnauthorizedAccessException("Cannot view posts in a private community without being a member.");
            // }

            // Nên đẩy logic search xuống Repository
            IQueryable<Post> query = _dbContext.Set<Post>()
                .Where(p => p.CommunityId == communityId); // HasQueryFilter cho IsDeleted đã được áp dụng

            if (criteria != null)
            {
                if (!string.IsNullOrWhiteSpace(criteria.TitleKeyword))
                    query = query.Where(p => p.Title.ToLower().Contains(criteria.TitleKeyword.ToLower()));
                if (!string.IsNullOrWhiteSpace(criteria.ContentKeyword))
                    query = query.Where(p => p.Content.ToLower().Contains(criteria.ContentKeyword.ToLower()));
                if (criteria.AuthorUserId.HasValue)
                    query = query.Where(p => p.AuthorUserId == criteria.AuthorUserId.Value);
                if (criteria.IsPinned.HasValue)
                    query = query.Where(p => p.IsPinned == criteria.IsPinned.Value);
                if (criteria.IsLocked.HasValue)
                    query = query.Where(p => p.IsLocked == criteria.IsLocked.Value);
            }

            var totalCount = await query.CountAsync();

            var posts = await query.OrderByDescending(p => p.IsPinned)
                                   .ThenByDescending(p => p.CreatedAt)
                                   .Skip((criteria.PageNumber - 1) * criteria.PageSize)
                                   .Take(criteria.PageSize)
                                   .ToListAsync();

            var postSummaryDtos = _mapper.Map<List<PostSummaryDto>>(posts);

            // Làm giàu AuthorCommunityRole cho từng DTO
            for (int i = 0; i < postSummaryDtos.Count; i++)
            {
                postSummaryDtos[i] = await EnrichPostDtoWithAuthorRole(postSummaryDtos[i], posts[i].CommunityId, posts[i].AuthorUserId);
            }

            return new PagedResultDto<PostSummaryDto>(postSummaryDtos, criteria.PageNumber, criteria.PageSize, totalCount);
        }


        public async Task<PagedResultDto<PostSummaryDto>> GetPostsByAuthorAsync(Guid authorUserId, PostSearchCriteriaDto criteria)
        {
            _logger.LogInformation("Fetching posts by Author {AuthorUserId} with criteria {@Criteria}", authorUserId, criteria);
            IQueryable<Post> query = _dbContext.Set<Post>()
                .Where(p => p.AuthorUserId == authorUserId) // HasQueryFilter cho IsDeleted đã được áp dụng
                .Include(p => p.Community); // Cần Community để kiểm tra IsPublic và lấy CommunityId cho Enrich

            if (criteria != null)
            {
                if (criteria.CommunityId.HasValue)
                    query = query.Where(p => p.CommunityId == criteria.CommunityId.Value);
                // Thêm các filter khác từ criteria nếu cần
            }

            // Lọc thêm các post từ community đã bị xóa hoặc private (nếu không có quyền xem)
            // TODO: Cần currentUserId để kiểm tra quyền xem community private
            query = query.Where(p => p.Community != null && !p.Community.IsDeleted /* && (p.Community.IsPublic || await _communityMemberService.IsUserMemberOfCommunityAsync(p.CommunityId, currentUserId)) */);


            var totalCount = await query.CountAsync();
            var posts = await query.OrderByDescending(p => p.CreatedAt)
                                   .Skip((criteria.PageNumber - 1) * criteria.PageSize)
                                   .Take(criteria.PageSize)
                                   .ToListAsync();

            var postSummaryDtos = _mapper.Map<List<PostSummaryDto>>(posts);
            for (int i = 0; i < postSummaryDtos.Count; i++)
            {
                postSummaryDtos[i] = await EnrichPostDtoWithAuthorRole(postSummaryDtos[i], posts[i].CommunityId, posts[i].AuthorUserId);
            }
            return new PagedResultDto<PostSummaryDto>(postSummaryDtos, criteria.PageNumber, criteria.PageSize, totalCount);
        }


        public async Task<PostDto?> UpdatePostAsync(Guid postId, UpdatePostRequest request, Guid editorUserId)
        {
            _logger.LogInformation("User {EditorUserId} attempting to update Post {PostId}", editorUserId, postId);
            var post = await _postRepository.GetByIdAsync(postId, includeCommunity: true);
            if (post == null || post.IsDeleted)
            {
                _logger.LogWarning("Post {PostId} not found or deleted for update by User {EditorUserId}", postId, editorUserId);
                return null;
            }
            if (post.Community == null || post.Community.IsDeleted)
            {
                _logger.LogWarning("Post {PostId} for update belongs to a non-existent or deleted community {CommunityId}.", postId, post.CommunityId);
                throw new InvalidOperationException("Cannot update a post in a deleted community.");
            }


            bool isAuthor = post.AuthorUserId == editorUserId;
            bool isAdminOrModOfCommunity = await _communityMemberService.UserHasPermissionAsync(post.CommunityId, editorUserId, CommunityRole.Moderator); // Moderator trở lên

            if (!isAuthor && !isAdminOrModOfCommunity)
            {
                _logger.LogWarning("User {EditorUserId} is not authorized to update Post {PostId}", editorUserId, postId);
                throw new UnauthorizedAccessException("User is not authorized to update this post.");
            }

            _mapper.Map(request, post);
            post.UpdatedAt = DateTime.UtcNow;
            post.UpdatedByUserId = editorUserId;

            _postRepository.Update(post);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Post {PostId} updated successfully by User {EditorUserId}", postId, editorUserId);
            var updatedPostWithDetails = await _postRepository.GetByIdAsync(post.Id, includeCommunity: true);
            if (updatedPostWithDetails == null) throw new Exception("Failed to retrieve post after update.");

            var postDto = _mapper.Map<PostDto>(updatedPostWithDetails);
            return await EnrichPostDtoWithAuthorRole(postDto, updatedPostWithDetails.CommunityId, updatedPostWithDetails.AuthorUserId);
        }

        // DeletePostAsync, PinPostAsync, LockPostAsync giữ nguyên logic kiểm tra quyền và gọi _communityMemberService
        // Chúng không trả về DTO post nên không cần làm giàu ở đây.
        public async Task<bool> DeletePostAsync(Guid postId, Guid deleterUserId)
        {
            _logger.LogInformation("User {DeleterUserId} attempting to delete Post {PostId}", deleterUserId, postId);
            var post = await _dbContext.Set<Post>()
                                     .IgnoreQueryFilters()
                                     .Include(p => p.Community)
                                     .FirstOrDefaultAsync(p => p.Id == postId);
            if (post == null)
            {
                _logger.LogWarning("Post {PostId} not found for deletion by User {DeleterUserId}", postId, deleterUserId);
                return false;
            }
            if (post.IsDeleted) return true;

            if (post.Community == null || post.Community.IsDeleted)
            {
                _logger.LogWarning("Post {PostId} for deletion belongs to a non-existent or deleted community {CommunityId}.", postId, post.CommunityId);
                throw new InvalidOperationException("Cannot delete a post in a deleted community.");
            }

            bool isAuthor = post.AuthorUserId == deleterUserId;
            bool isAdminOrModOfCommunity = await _communityMemberService.UserHasPermissionAsync(post.CommunityId, deleterUserId, CommunityRole.Moderator);

            if (!isAuthor && !isAdminOrModOfCommunity)
            {
                _logger.LogWarning("User {DeleterUserId} is not authorized to delete Post {PostId}", deleterUserId, postId);
                throw new UnauthorizedAccessException("User is not authorized to delete this post.");
            }

            post.IsDeleted = true;
            post.UpdatedAt = DateTime.UtcNow;
            post.UpdatedByUserId = deleterUserId;

            _postRepository.Update(post);
            var result = await _dbContext.SaveChangesAsync();
            _logger.LogInformation("Post {PostId} soft deleted successfully by User {DeleterUserId}", postId, deleterUserId);
            return result > 0;
        }

        public async Task<bool> PinPostAsync(Guid postId, Guid adminOrModUserId, bool pin)
        {
            _logger.LogInformation("User {AdminOrModUserId} attempting to {Action} Post {PostId}", adminOrModUserId, pin ? "pin" : "unpin", postId);
            var post = await _postRepository.GetByIdAsync(postId, includeCommunity: true); // Cần includeCommunity để lấy CommunityId
            if (post == null || post.IsDeleted) return false;

            if (post.Community == null || post.Community.IsDeleted)
                throw new InvalidOperationException("Post is not associated with an active community.");

            if (!await _communityMemberService.UserHasPermissionAsync(post.CommunityId, adminOrModUserId, CommunityRole.Moderator))
            {
                throw new UnauthorizedAccessException("User is not authorized to pin/unpin posts in this community.");
            }

            if (post.IsPinned == pin) return true;

            post.IsPinned = pin;
            post.UpdatedAt = DateTime.UtcNow;
            post.UpdatedByUserId = adminOrModUserId;

            _postRepository.Update(post);
            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("Post {PostId} {Action} successfully by User {AdminOrModUserId}", postId, pin ? "pinned" : "unpinned", adminOrModUserId);
            return true;
        }

        public async Task<bool> LockPostAsync(Guid postId, Guid adminOrModUserId, bool lockPost)
        {
            _logger.LogInformation("User {AdminOrModUserId} attempting to {Action} Post {PostId}", adminOrModUserId, lockPost ? "lock" : "unlock", postId);
            var post = await _postRepository.GetByIdAsync(postId, includeCommunity: true);
            if (post == null || post.IsDeleted) return false;

            if (post.Community == null || post.Community.IsDeleted)
                throw new InvalidOperationException("Post is not associated with an active community.");

            if (!await _communityMemberService.UserHasPermissionAsync(post.CommunityId, adminOrModUserId, CommunityRole.Moderator))
            {
                throw new UnauthorizedAccessException("User is not authorized to lock/unlock posts in this community.");
            }

            if (post.IsLocked == lockPost) return true;

            post.IsLocked = lockPost;
            post.UpdatedAt = DateTime.UtcNow;
            post.UpdatedByUserId = adminOrModUserId;

            _postRepository.Update(post);
            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("Post {PostId} {Action} successfully by User {AdminOrModUserId}", postId, lockPost ? "locked" : "unlocked", adminOrModUserId);
            return true;
        }
    }
}