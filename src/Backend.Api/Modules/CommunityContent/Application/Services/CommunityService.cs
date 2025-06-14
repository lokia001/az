// File: Backend.Api/Modules/CommunityContent/Application/Services/CommunityService.cs

namespace Backend.Api.Modules.CommunityContent.Application.Services;

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
// using Backend.Api.Modules.UserRelated.Application.Contracts.Services; // IUserService nếu cần
// using Backend.Api.Modules.UserRelated.Domain.Enums; // UserRole nếu cần
using Backend.Api.SharedKernel.Dtos; // Cho PagedResultDto (nếu bạn đặt ở SharedKernel)
using Microsoft.EntityFrameworkCore; // Cho ToListAsync, AnyAsync
using Microsoft.Extensions.Logging;




public class CommunityService : ICommunityService
{
    private readonly ICommunityRepository _communityRepository;
    private readonly ICommunityMemberRepository _communityMemberRepository; // Vẫn cần cái này để AddAsync CommunityMember khi tạo Community
    private readonly ICommunityMemberService _communityMemberService; // << INJECT CÁI NÀY
    private readonly IMapper _mapper;
    private readonly AppDbContext _dbContext;
    private readonly ILogger<CommunityService> _logger;

    public CommunityService(
        ICommunityRepository communityRepository,
        ICommunityMemberRepository communityMemberRepository, // Giữ lại nếu CreateCommunityAsync dùng
        ICommunityMemberService communityMemberService, // << THÊM VÀO ĐÂY
        IMapper mapper,
        AppDbContext dbContext,
        ILogger<CommunityService> logger)
    {
        _communityRepository = communityRepository;
        _communityMemberRepository = communityMemberRepository; // Gán nếu giữ
        _communityMemberService = communityMemberService; // << GÁN GIÁ TRỊ
        _mapper = mapper;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<CommunityDto> CreateCommunityAsync(CreateCommunityRequest request, Guid creatorUserId)
    {
        _logger.LogInformation("User {CreatorUserId} attempting to create community with name: {Name}", creatorUserId, request.Name);

        if (await _communityRepository.ExistsByNameAsync(request.Name))
        {
            throw new ArgumentException($"Community with name '{request.Name}' already exists.");
        }

        // TODO: Kiểm tra quyền của creatorUserId nếu cần (ví dụ: chỉ Owner mới được tạo Community?)
        // Hoặc bất kỳ user nào cũng có thể tạo. Hiện tại, giả sử bất kỳ user nào cũng có thể.

        var community = _mapper.Map<Community>(request); // AutoMapper sẽ dùng CommunityContentProfile
        community.CreatedByUserId = creatorUserId;
        community.CreatedAt = DateTime.UtcNow;
        // IsPublic đã được map từ DTO (hoặc có giá trị mặc định trong DTO)

        await _communityRepository.AddAsync(community);

        // Tự động thêm người tạo làm Admin của Community
        var adminMembership = new CommunityMember
        {
            CommunityId = community.Id,
            UserId = creatorUserId,
            Role = CommunityRole.Admin,
            JoinedAt = DateTime.UtcNow
        };
        await _communityMemberRepository.AddAsync(adminMembership);

        await _dbContext.SaveChangesAsync(); // Lưu cả Community và CommunityMember

        _logger.LogInformation("Community {CommunityId} created successfully by User {CreatorUserId}", community.Id, creatorUserId);

        // Lấy lại để có MemberCount, PostCount (nếu DTO cần)
        // Hoặc tính toán thủ công nếu không muốn query lại
        var createdCommunity = await _communityRepository.GetByIdAsync(community.Id, includeMembers: true, includePosts: true);
        if (createdCommunity == null) throw new Exception("Failed to retrieve community after creation."); // Lỗi hiếm

        var communityDto = _mapper.Map<CommunityDto>(createdCommunity);
        // Manually map MemberCount and PostCount if not handled by AutoMapper from included collections
        // (AutoMapper Profile nên xử lý việc này nếu CommunityDto có MemberCount, PostCount và Community entity có Members, Posts collections)
        // Nếu CommunityDto có MemberCount, PostCount và AutoMapper không tự map:
        // communityDto = communityDto with {
        //    MemberCount = createdCommunity.Members.Count,
        //    PostCount = createdCommunity.Posts.Count
        // };
        return communityDto;
    }

    public async Task<CommunityDto?> GetCommunityByIdAsync(Guid communityId)
    {
        _logger.LogInformation("Fetching community by ID: {CommunityId}", communityId);
        // Lấy kèm members và posts để tính MemberCount, PostCount cho DTO
        var community = await _communityRepository.GetByIdAsync(communityId, includeMembers: true, includePosts: true);
        if (community == null) return null;

        var communityDto = _mapper.Map<CommunityDto>(community);
        // Đảm bảo AutoMapper Profile xử lý MemberCount, PostCount
        return communityDto;
    }

    public async Task<CommunityDto?> GetCommunityByNameAsync(string name)
    {
        _logger.LogInformation("Fetching community by Name: {Name}", name);
        var community = await _communityRepository.GetByNameAsync(name, includeMembers: true, includePosts: true);
        if (community == null) return null;
        return _mapper.Map<CommunityDto>(community);
    }

    public async Task<PagedResultDto<CommunitySummaryDto>> SearchCommunitiesAsync(CommunitySearchCriteriaDto criteria)
    {
        _logger.LogInformation("Searching communities with criteria: {@Criteria}", criteria);

        // Cần thêm phương thức SearchAsync vào ICommunityRepository và CommunityRepository
        // Tạm thời, chúng ta sẽ lọc đơn giản ở đây (không tối ưu)
        // Lý tưởng: _communityRepository.SearchAsync(criteria) trả về (items, totalCount)

        var query = _dbContext.Set<Community>().AsQueryable(); // Bắt đầu query

        // Áp dụng HasQueryFilter cho IsDeleted (từ CommunityConfiguration)

        if (!string.IsNullOrWhiteSpace(criteria.NameKeyword))
        {
            query = query.Where(c => c.Name.ToLower().Contains(criteria.NameKeyword.ToLower()));
        }
        if (criteria.IsPublic.HasValue)
        {
            query = query.Where(c => c.IsPublic == criteria.IsPublic.Value);
        }

        var totalCount = await query.CountAsync();

        query = query.OrderBy(c => c.Name)
                     .Skip((criteria.PageNumber - 1) * criteria.PageSize)
                     .Take(criteria.PageSize)
                     .Include(c => c.Members); // Include Members để có thể tính MemberCount cho CommunitySummaryDto

        var communities = await query.ToListAsync();
        var communityDtos = _mapper.Map<IEnumerable<CommunitySummaryDto>>(communities); // AutoMapper Profile cần map Community -> CommunitySummaryDto

        return new PagedResultDto<CommunitySummaryDto>(communityDtos, criteria.PageNumber, criteria.PageSize, totalCount);
    }


    public async Task<CommunityDto?> UpdateCommunityAsync(Guid communityId, UpdateCommunityRequest request, Guid updaterUserId)
    {
        _logger.LogInformation("User {UpdaterUserId} attempting to update community {CommunityId}", updaterUserId, communityId);
        var community = await _communityRepository.GetByIdAsync(communityId);
        if (community == null)
        {
            _logger.LogWarning("Community {CommunityId} not found for update by User {UpdaterUserId}", communityId, updaterUserId);
            return null;
        }

        // Kiểm tra quyền: updaterUserId phải là người tạo Community hoặc Admin/Mod của Community đó
        bool isAdminOrMod = await _communityMemberService.UserHasPermissionAsync(communityId, updaterUserId, CommunityRole.Admin) ||
                            await _communityMemberService.UserHasPermissionAsync(communityId, updaterUserId, CommunityRole.Moderator);

        if (community.CreatedByUserId != updaterUserId && !isAdminOrMod /* && !await _userService.IsUserSysAdminAsync(updaterUserId) */)
        {
            _logger.LogWarning("User {UpdaterUserId} is not authorized to update community {CommunityId}", updaterUserId, communityId);
            throw new UnauthorizedAccessException("User is not authorized to update this community.");
        }

        // Kiểm tra tên mới (nếu có thay đổi) đã tồn tại chưa
        if (community.Name.ToLowerInvariant() != request.Name.ToLowerInvariant() &&
            await _communityRepository.ExistsByNameAsync(request.Name, communityId))
        {
            throw new ArgumentException($"Community with name '{request.Name}' already exists.");
        }

        _mapper.Map(request, community); // Áp dụng thay đổi từ DTO
        community.UpdatedAt = DateTime.UtcNow;
        community.UpdatedByUserId = updaterUserId;

        _communityRepository.Update(community);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Community {CommunityId} updated successfully by User {UpdaterUserId}", communityId, updaterUserId);
        var updatedCommunity = await _communityRepository.GetByIdAsync(communityId, includeMembers: true, includePosts: true);
        return _mapper.Map<CommunityDto>(updatedCommunity);
    }

    public async Task<bool> DeleteCommunityAsync(Guid communityId, Guid deleterUserId)
    {
        _logger.LogInformation("User {DeleterUserId} attempting to delete community {CommunityId}", deleterUserId, communityId);
        var community = await _dbContext.Set<Community>()
                                    .IgnoreQueryFilters()
                                    .FirstOrDefaultAsync(c => c.Id == communityId);
        if (community == null)
        {
            _logger.LogWarning("Community {CommunityId} not found for deletion by User {DeleterUserId}", communityId, deleterUserId);
            return false;
        }

        if (community.IsDeleted) return true;

        // Kiểm tra quyền: deleterUserId phải là người tạo Community hoặc Admin của Community đó (hoặc SysAdmin)
        // SỬA Ở ĐÂY: Gọi _communityMemberService
        bool isAdminOfCommunity = await _communityMemberService.UserHasPermissionAsync(communityId, deleterUserId, CommunityRole.Admin);

        // Giả sử SysAdmin có quyền xóa mọi community (cần inject IUserService để kiểm tra vai trò SysAdmin)
        // bool isSysAdmin = await _userService.UserHasRoleAsync(deleterUserId, UserRole.SysAdmin);
        bool isSysAdmin = false; // Tạm thời, nếu không inject IUserService

        if (community.CreatedByUserId != deleterUserId && !isAdminOfCommunity && !isSysAdmin)
        {
            _logger.LogWarning("User {DeleterUserId} is not authorized to delete community {CommunityId}. Creator: {CreatorId}, IsAdminOfCommunity: {IsAdmin}",
                deleterUserId, communityId, community.CreatedByUserId, isAdminOfCommunity);
            throw new UnauthorizedAccessException("User is not authorized to delete this community.");
        }

        community.IsDeleted = true;
        community.UpdatedAt = DateTime.UtcNow;
        community.UpdatedByUserId = deleterUserId;

        // _communityRepository.Update(community); // Không cần thiết nếu community được theo dõi và bạn chỉ thay đổi thuộc tính
        // Tuy nhiên, nếu bạn muốn chắc chắn, hoặc nếu có logic đặc biệt trong Update của repo thì gọi.
        // Vì chúng ta đã IgnoreQueryFilters khi lấy community, có thể nó không được theo dõi đúng cách.
        // Gọi Update để đảm bảo.
        _dbContext.Update(community);


        // Logic soft delete các Posts và Members liên quan (NẾU CẦN)
        // Hiện tại, HasQueryFilter trên Post sẽ ẩn chúng đi.
        // CommunityMembers không có IsDeleted, chúng sẽ bị xóa bởi Cascade Delete nếu Community bị hard delete.
        // Với soft delete Community, các CommunityMember vẫn còn.

        var result = await _dbContext.SaveChangesAsync();
        _logger.LogInformation("Community {CommunityId} soft deleted successfully by User {DeleterUserId}", communityId, deleterUserId);
        return result > 0;
    }
}
