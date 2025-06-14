// File: Backend.Api/Modules/CommunityContent/Application/Contracts/Services/IPostService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.CommunityContent.Application.Contracts.Dtos;
using Backend.Api.SharedKernel.Dtos;
// using Backend.Api.SharedKernel.Dtos;

namespace Backend.Api.Modules.CommunityContent.Application.Contracts.Services
{
    public interface IPostService
    {
        Task<PostDto> CreatePostAsync(CreatePostRequest request, Guid authorUserId);
        Task<PostDto?> GetPostByIdAsync(Guid postId);
        Task<PagedResultDto<PostSummaryDto>> GetPostsByCommunityAsync(Guid communityId, PostSearchCriteriaDto criteria); // Lấy bài đăng của một community, có tìm kiếm/phân trang
        Task<PagedResultDto<PostSummaryDto>> GetPostsByAuthorAsync(Guid authorUserId, PostSearchCriteriaDto criteria); // Lấy bài đăng của một tác giả
        Task<PostDto?> UpdatePostAsync(Guid postId, UpdatePostRequest request, Guid editorUserId); // Người sửa phải là tác giả hoặc Mod/Admin của Community
        Task<bool> DeletePostAsync(Guid postId, Guid deleterUserId); // Soft delete, người xóa phải là tác giả hoặc Mod/Admin

        // Các hành động khác trên Post (do Mod/Admin của Community thực hiện)
        Task<bool> PinPostAsync(Guid postId, Guid adminOrModUserId, bool pin); // true để ghim, false để bỏ ghim
        Task<bool> LockPostAsync(Guid postId, Guid adminOrModUserId, bool lockPost); // true để khóa, false để mở khóa
    }
}