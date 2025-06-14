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
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Modules.CommunityContent.Application.Services
{
    public class CommunityMemberService : ICommunityMemberService
    {
        private readonly ICommunityMemberRepository _communityMemberRepository;
        private readonly ICommunityRepository _communityRepository;
        private readonly IMapper _mapper;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<CommunityMemberService> _logger;

        public CommunityMemberService(
            ICommunityMemberRepository communityMemberRepository,
            ICommunityRepository communityRepository,
            IMapper mapper,
            AppDbContext dbContext,
            ILogger<CommunityMemberService> logger)
        {
            _communityMemberRepository = communityMemberRepository;
            _communityRepository = communityRepository;
            _mapper = mapper;
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<CommunityMemberDto> JoinCommunityAsync(Guid communityId, Guid userId)
        {
            _logger.LogInformation("User {UserId} attempting to join Community {CommunityId}", userId, communityId);

            var community = await _communityRepository.GetByIdAsync(communityId);
            if (community == null || community.IsDeleted) // Kiểm tra cả IsDeleted
            {
                throw new KeyNotFoundException($"Community with ID {communityId} not found or has been deleted.");
            }
            if (!community.IsPublic)
            {
                throw new UnauthorizedAccessException("This community is private and requires an invitation to join.");
            }

            if (await _communityMemberRepository.IsUserMemberAsync(communityId, userId))
            {
                throw new InvalidOperationException("User is already a member of this community.");
            }

            var newMember = new CommunityMember
            {
                CommunityId = communityId,
                UserId = userId,
                Role = CommunityRole.Member,
                JoinedAt = DateTime.UtcNow
            };

            await _communityMemberRepository.AddAsync(newMember);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("User {UserId} successfully joined Community {CommunityId} as Member", userId, communityId);
            // Cần đảm bảo CommunityMemberDto được định nghĩa và có mapping
            // Giả sử mapping đơn giản từ CommunityMember sang CommunityMemberDto
            return _mapper.Map<CommunityMemberDto>(newMember);
        }

        public async Task<bool> LeaveCommunityAsync(Guid communityId, Guid userId)
        {
            _logger.LogInformation("User {UserId} attempting to leave Community {CommunityId}", userId, communityId);
            var membership = await _communityMemberRepository.GetByIdAsync(communityId, userId);
            if (membership == null)
            {
                _logger.LogWarning("User {UserId} is not a member of Community {CommunityId}, cannot leave.", userId, communityId);
                return false;
            }

            if (membership.Role == CommunityRole.Admin)
            {
                var otherAdmins = await _dbContext.Set<CommunityMember>()
                    .AnyAsync(cm => cm.CommunityId == communityId &&
                                     cm.UserId != userId &&
                                     cm.Role == CommunityRole.Admin);
                if (!otherAdmins)
                {
                    throw new InvalidOperationException("The last admin cannot leave the community. Please transfer admin rights first or delete the community.");
                }
            }

            _communityMemberRepository.Delete(membership); // Repository thực hiện hard delete bản ghi membership
            var result = await _dbContext.SaveChangesAsync();
            _logger.LogInformation("User {UserId} successfully left Community {CommunityId}. Result: {DbResult}", userId, communityId, result);
            return result > 0;
        }

        public async Task<IEnumerable<CommunityMemberDto>> GetCommunityMembersAsync(Guid communityId)
        {
            // Kiểm tra community tồn tại và có public không nếu cần (tùy yêu cầu)
            var community = await _communityRepository.GetByIdAsync(communityId);
            if (community == null || community.IsDeleted)
            {
                throw new KeyNotFoundException($"Community with ID {communityId} not found or has been deleted.");
            }
            // TODO: Nếu community không public, chỉ member/admin mới được xem danh sách thành viên

            var members = await _communityMemberRepository.GetMembersByCommunityIdAsync(communityId);
            // CommunityMemberDto không chứa thông tin User chi tiết (Username, Avatar)
            // Client sẽ tự lấy nếu cần.
            return _mapper.Map<IEnumerable<CommunityMemberDto>>(members);
        }

        public async Task<IEnumerable<UserCommunityMembershipDto>> GetUserMembershipsAsync(Guid userId)
        {
            var memberships = await _communityMemberRepository.GetCommunitiesByUserIdAsync(userId);
            // GetCommunitiesByUserIdAsync trong repo đã Include(cm => cm.Community)
            // và lọc Community.IsDeleted.
            // AutoMapper Profile sẽ map từ CommunityMember (có Community) sang UserCommunityMembershipDto
            // (bao gồm CommunityName, CommunityCoverImageUrl).
            return _mapper.Map<IEnumerable<UserCommunityMembershipDto>>(memberships);
        }

        public async Task<CommunityMemberDto?> GetMembershipDetailsAsync(Guid communityId, Guid userId)
        {
            var membership = await _communityMemberRepository.GetByIdAsync(communityId, userId);
            return _mapper.Map<CommunityMemberDto>(membership);
        }

        public async Task<bool> IsUserMemberOfCommunityAsync(Guid communityId, Guid userId)
        {
            // Kiểm tra community có tồn tại không trước khi kiểm tra thành viên
            var community = await _communityRepository.GetByIdAsync(communityId);
            if (community == null || community.IsDeleted)
            {
                return false; // Nếu community không tồn tại, user không thể là thành viên
            }
            return await _communityMemberRepository.IsUserMemberAsync(communityId, userId);
        }

        // ĐÂY LÀ PHƯƠNG THỨC CẦN KIỂM TRA CHỮ KÝ
        public async Task<CommunityRole?> GetUserRoleInCommunityAsync(Guid communityId, Guid userId)
        {
            var member = await _communityMemberRepository.GetByIdAsync(communityId, userId);
            return member?.Role; // Trả về vai trò nếu là thành viên, null nếu không phải
        }

        public async Task<bool> UserHasPermissionAsync(Guid communityId, Guid userId, CommunityRole requiredRole)
        {
            var memberRole = await GetUserRoleInCommunityAsync(communityId, userId); // Gọi phương thức đã có
            if (!memberRole.HasValue) return false; // Không phải thành viên

            if (requiredRole == CommunityRole.Admin) return memberRole.Value == CommunityRole.Admin;
            if (requiredRole == CommunityRole.Moderator) return memberRole.Value == CommunityRole.Admin || memberRole.Value == CommunityRole.Moderator;
            if (requiredRole == CommunityRole.Member) return true; // Admin, Mod cũng là Member

            return false;
        }

        // --- CÁC PHƯƠNG THỨC CẦN HOÀN THIỆN ---
        public async Task<CommunityMemberDto?> UpdateMemberRoleAsync(Guid communityId, Guid targetUserId, CommunityRole newRole, Guid adminUserId)
        {
            _logger.LogInformation("Admin {AdminUserId} attempting to update role of User {TargetUserId} in Community {CommunityId} to {NewRole}",
                adminUserId, targetUserId, communityId, newRole);

            // 1. Kiểm tra community tồn tại
            var community = await _communityRepository.GetByIdAsync(communityId);
            if (community == null || community.IsDeleted)
            {
                throw new KeyNotFoundException($"Community with ID {communityId} not found or has been deleted.");
            }

            // 2. Kiểm tra quyền của adminUserId: Phải là Admin của community này
            if (!await UserHasPermissionAsync(communityId, adminUserId, CommunityRole.Admin))
            {
                throw new UnauthorizedAccessException($"User {adminUserId} is not an Admin of community {communityId} and cannot change member roles.");
            }

            // 3. Lấy thông tin membership của targetUserId
            var targetMembership = await _communityMemberRepository.GetByIdAsync(communityId, targetUserId);
            if (targetMembership == null)
            {
                throw new KeyNotFoundException($"User {targetUserId} is not a member of community {communityId}.");
            }

            // 4. Các quy tắc nghiệp vụ:
            //    - Không cho phép tự thay đổi vai trò của chính mình qua API này (Admin có thể cần API riêng hoặc logic khác)
            if (targetUserId == adminUserId)
            {
                throw new InvalidOperationException("Admins cannot change their own role using this method. Please use a dedicated admin management tool or another admin.");
            }
            //    - Không cho phép hạ vai trò của Admin cuối cùng (nếu targetUser là Admin và là Admin cuối cùng, và newRole không phải Admin)
            if (targetMembership.Role == CommunityRole.Admin && newRole != CommunityRole.Admin)
            {
                var otherAdmins = await _dbContext.Set<CommunityMember>()
                    .AnyAsync(cm => cm.CommunityId == communityId &&
                                     cm.UserId != targetUserId &&
                                     cm.Role == CommunityRole.Admin);
                if (!otherAdmins)
                {
                    throw new InvalidOperationException("Cannot change the role of the last admin. Assign another admin first.");
                }
            }
            //    - Admin không thể bị hạ cấp bởi Moderator (đã được xử lý bởi UserHasPermissionAsync ở trên nếu Mod không có quyền)

            targetMembership.Role = newRole;
            // targetMembership.UpdatedAt = DateTime.UtcNow; // Nếu CommunityMember có UpdatedAt

            _communityMemberRepository.Update(targetMembership);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Role of User {TargetUserId} in Community {CommunityId} updated to {NewRole} by Admin {AdminUserId}",
                targetUserId, communityId, newRole, adminUserId);

            return _mapper.Map<CommunityMemberDto>(targetMembership);
        }

        public async Task<bool> RemoveMemberAsync(Guid communityId, Guid targetUserId, Guid adminOrModUserId)
        {
            _logger.LogInformation("Admin/Mod {AdminOrModUserId} attempting to remove User {TargetUserId} from Community {CommunityId}",
                adminOrModUserId, targetUserId, communityId);

            var community = await _communityRepository.GetByIdAsync(communityId);
            if (community == null || community.IsDeleted)
            {
                throw new KeyNotFoundException($"Community with ID {communityId} not found or has been deleted.");
            }

            var targetMembership = await _communityMemberRepository.GetByIdAsync(communityId, targetUserId);
            if (targetMembership == null)
            {
                _logger.LogWarning("User {TargetUserId} is not a member of Community {CommunityId}, cannot remove.", targetUserId, communityId);
                return false; // Hoặc throw lỗi "Not a member"
            }

            // Kiểm tra quyền của adminOrModUserId: Phải là Admin hoặc Moderator của community này
            bool canKick = await UserHasPermissionAsync(communityId, adminOrModUserId, CommunityRole.Moderator); // Mod trở lên có thể kick

            if (!canKick)
            {
                throw new UnauthorizedAccessException($"User {adminOrModUserId} is not authorized to remove members from community {communityId}.");
            }

            // Quy tắc nghiệp vụ:
            // - Không cho phép tự kick chính mình
            if (targetUserId == adminOrModUserId)
            {
                throw new InvalidOperationException("You cannot remove yourself from the community using this method. Please use 'Leave Community'.");
            }
            // - Moderator không thể kick Admin
            if (targetMembership.Role == CommunityRole.Admin &&
                (await GetUserRoleInCommunityAsync(communityId, adminOrModUserId)) == CommunityRole.Moderator)
            {
                throw new UnauthorizedAccessException("Moderators cannot remove Admins from the community.");
            }
            // - Không cho phép kick Admin cuối cùng (trừ khi người kick là creator và cũng là admin đó - logic này phức tạp hơn)
            //   Đơn giản là nếu target là Admin, kiểm tra xem có admin nào khác không.
            if (targetMembership.Role == CommunityRole.Admin)
            {
                var otherAdmins = await _dbContext.Set<CommunityMember>()
                    .AnyAsync(cm => cm.CommunityId == communityId &&
                                     cm.UserId != targetUserId &&
                                     cm.Role == CommunityRole.Admin);
                if (!otherAdmins)
                {
                    // Nếu người thực hiện là creator của community và cũng là admin cuối cùng này, thì có thể cho phép "xóa" member này
                    // đồng nghĩa với việc community không còn admin (cần logic xử lý community không admin).
                    // Hoặc đơn giản là không cho phép.
                    if (community.CreatedByUserId != adminOrModUserId) // Chỉ creator mới có thể xóa admin cuối cùng (nếu logic cho phép)
                    {
                        throw new InvalidOperationException("Cannot remove the last admin from the community unless you are the community creator and intend to leave it adminless or delete it.");
                    }
                    // Nếu cho phép creator xóa admin cuối cùng, cần cân nhắc hậu quả.
                    // Hiện tại, để an toàn, vẫn throw lỗi nếu không phải creator.
                    // Nếu adminOrModUserId là creator, và targetUserId cũng là creator (admin cuối cùng),
                    // thì có thể họ đang muốn xóa chính mình và là admin cuối cùng -> lỗi này đã được chặn bởi "cannot remove yourself".
                    // Trường hợp này là adminOrModUserId (creator) muốn xóa targetUserId (admin cuối cùng, không phải creator).
                    // => Vẫn nên throw lỗi để đảm bảo community có admin.
                    throw new InvalidOperationException("Cannot remove the last admin from the community. Assign another admin first or delete the community.");
                }
            }

            _communityMemberRepository.Delete(targetMembership);
            var result = await _dbContext.SaveChangesAsync();
            _logger.LogInformation("User {TargetUserId} removed from Community {CommunityId} by Admin/Mod {AdminOrModUserId}. Result: {DbResult}",
                targetUserId, communityId, adminOrModUserId, result);
            return result > 0;
        }
    }
}