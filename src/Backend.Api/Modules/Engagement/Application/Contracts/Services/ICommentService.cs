// File: Backend.Api/Modules/Engagement/Application/Contracts/Services/ICommentService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.Engagement.Application.Contracts.Dtos;
using Backend.Api.Modules.Engagement.Domain.Enums;
using Backend.Api.SharedKernel.Dtos;
// using Backend.Api.SharedKernel.Dtos;

namespace Backend.Api.Modules.Engagement.Application.Contracts.Services
{
    public interface ICommentService
    {
        Task<CommentDto> CreateCommentAsync(CreateCommentRequest request, Guid userId);
        Task<CommentDto?> GetCommentByIdAsync(Guid commentId, bool includeReplies = false);
        Task<PagedResultDto<CommentDto>> GetCommentsForParentEntityAsync(EngageableEntityType parentType, Guid parentId, CommentSearchCriteriaDto criteria);
        Task<CommentDto?> UpdateCommentAsync(Guid commentId, UpdateCommentRequest request, Guid userId); // Chỉ người viết comment mới được sửa
        Task<bool> DeleteCommentAsync(Guid commentId, Guid userId); // Chỉ người viết comment hoặc Admin/Mod mới được xóa
    }
}