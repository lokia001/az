// File: Backend.Api/Modules/Engagement/Application/Contracts/Services/IReviewService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.Engagement.Application.Contracts.Dtos;
using Backend.Api.SharedKernel.Dtos;
// using Backend.Api.SharedKernel.Dtos; // Nếu PagedResultDto ở SharedKernel

namespace Backend.Api.Modules.Engagement.Application.Contracts.Services
{
    public interface IReviewService
    {
        Task<ReviewDto> CreateReviewAsync(CreateReviewRequest request, Guid userId);
        Task<ReviewDto?> GetReviewByIdAsync(Guid reviewId);
        Task<PagedResultDto<ReviewDto>> GetReviewsForSpaceAsync(Guid spaceId, ReviewSearchCriteriaDto criteria);
        Task<IEnumerable<ReviewDto>> GetReviewsByUserAsync(Guid userId); // Lấy các review do user này viết
        Task<ReviewDto?> UpdateReviewAsync(Guid reviewId, UpdateReviewRequest request, Guid userId); // Chỉ người viết review mới được sửa
        Task<PagedResultDto<ReviewDto>> GetAllReviewsAsync(ReviewSearchCriteriaDto criteria);
        Task<bool> DeleteReviewAsync(Guid reviewId, Guid userId); // Chỉ người viết review hoặc Admin/Mod mới được xóa
    }
}