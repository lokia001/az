// File: Backend.Api/Modules/UserRelated/Application/Services/UserService.cs
using System;
using System.Threading.Tasks;
using AutoMapper;
using Backend.Api.Data; // For AppDbContext (Unit of Work)
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;
using Backend.Api.Modules.UserRelated.Application.Contracts.Services;
using Backend.Api.Modules.UserRelated.Domain.Entities; // User entity
using Backend.Api.Modules.UserRelated.Domain.Enums;
using Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories;
using Backend.Api.SharedKernel.Dtos;
// Thêm using cho custom exceptions nếu có, ví dụ:
// using Backend.Api.SharedKernel.Exceptions;

namespace Backend.Api.Modules.UserRelated.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly AppDbContext _dbContext; // Unit of Work
        private readonly ILogger<UserService> _logger; // Thêm logger

        public UserService(
            IUserRepository userRepository,
            IMapper mapper,
            AppDbContext dbContext
            ,
            ILogger<UserService> logger) // Thêm logger vào constructor

        {
            _userRepository = userRepository;
            _mapper = mapper;
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<PagedResultDto<UserDto>> GetAllUsersAsync(UserSearchCriteriaDto criteria) // Bỏ dấu ? và giá trị mặc định null
        {
            _logger.LogInformation("Admin: Fetching all users with criteria: {@Criteria}", criteria);

            var (userEntities, totalCount) = await _userRepository.SearchUsersAsync(criteria); // criteria giờ sẽ không null

            var userDtos = _mapper.Map<IEnumerable<UserDto>>(userEntities);

            return new PagedResultDto<UserDto>(
                userDtos,
                criteria.PageNumber, // Truy cập trực tiếp vì criteria không null
                criteria.PageSize,   // Truy cập trực tiếp
                totalCount
            );
        }

        public async Task<UserDto?> GetUserByIdForAdminAsync(Guid userId)
        {
            _logger.LogInformation("Admin: Fetching user by ID (admin access): {UserId}", userId);
            // Sử dụng _userRepository.GetByIdAsync() vì nó không tự động lọc IsActive/IsDeleted
            // (do UserConfiguration không có HasQueryFilter cho các trường đó)
            var user = await _userRepository.GetByIdAsync(userId);
            // Admin có thể xem cả user đã IsDeleted = true, nên không lọc ở đây.
            // Nếu bạn muốn admin không thấy user đã IsDeleted, thì thêm điều kiện if (user != null && user.IsDeleted) return null;
            if (user == null)
            {
                _logger.LogWarning("Admin: User with ID: {UserId} not found (admin access).", userId);
                return null;
            }
            return _mapper.Map<UserDto>(user);
        }

        public async Task<bool> SetUserActiveStatusAsync(Guid userId, bool isActive, Guid adminUserId)
        {
            _logger.LogInformation("Admin {AdminUserId}: Setting active status for User {UserId} to {IsActive}", adminUserId, userId, isActive);

            // Admin cần lấy user bất kể trạng thái IsActive hay IsDeleted hiện tại của nó.
            // Giả sử GetByIdAsync của repo không filter theo IsActive/IsDeleted.
            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null)
            {
                _logger.LogWarning("Admin {AdminUserId}: User {UserId} not found for SetUserActiveStatusAsync.", adminUserId, userId);
                return false;
            }

            // Ngăn SysAdmin tự vô hiệu hóa chính mình nếu là SysAdmin duy nhất còn active
            if (user.Id == adminUserId && !isActive && user.Role == UserRole.SysAdmin)
            {
                var otherActiveSysAdminsExist = await _dbContext.Set<User>()
                    .AnyAsync(u => u.Id != userId && u.Role == UserRole.SysAdmin && u.IsActive && !u.IsDeleted);
                if (!otherActiveSysAdminsExist)
                {
                    _logger.LogError("Admin {AdminUserId}: Attempt to deactivate the last active System Administrator (User {UserId}) was blocked.", adminUserId, userId);
                    throw new InvalidOperationException("Cannot deactivate the last active System Administrator.");
                }
            }

            user.IsActive = isActive;
            user.UpdatedAt = DateTime.UtcNow;
            // user.UpdatedBy = adminUserId; // Nếu có trường này

            _userRepository.Update(user);
            var result = await _dbContext.SaveChangesAsync();
            _logger.LogInformation("Admin {AdminUserId}: Active status for User {UserId} set to {IsActive}. Result: {DbResult}", adminUserId, userId, isActive, result);
            return result > 0;
        }

        public async Task<bool> ChangeUserRoleAsync(Guid userId, UserRole newRole, Guid adminUserId)
        {
            _logger.LogInformation("Admin {AdminUserId}: Changing role for User {UserId} to {NewRole}", adminUserId, userId, newRole);
            var user = await _userRepository.GetByIdAsync(userId); // Lấy user bất kể trạng thái

            if (user == null)
            {
                _logger.LogWarning("Admin {AdminUserId}: User {UserId} not found for ChangeUserRoleAsync.", adminUserId, userId);
                return false;
            }

            // Không cho SysAdmin tự đổi vai trò của mình thành vai trò thấp hơn nếu là SysAdmin duy nhất
            if (user.Id == adminUserId && user.Role == UserRole.SysAdmin && newRole != UserRole.SysAdmin)
            {
                var otherActiveSysAdminsExist = await _dbContext.Set<User>()
                    .AnyAsync(u => u.Id != userId && u.Role == UserRole.SysAdmin && u.IsActive && !u.IsDeleted);
                if (!otherActiveSysAdminsExist)
                {
                    _logger.LogError("Admin {AdminUserId}: Attempt to change role of the last active System Administrator (User {UserId}) was blocked.", adminUserId, userId);
                    throw new InvalidOperationException("Cannot change the role of the last active System Administrator.");
                }
            }

            // Xử lý OwnerProfile khi vai trò thay đổi
            if (user.Role == UserRole.Owner && newRole != UserRole.Owner)
            {
                // Nếu user không còn là Owner, có thể cần vô hiệu hóa/xóa OwnerProfile của họ
                // và các Space liên quan. Đây là logic nghiệp vụ phức tạp cần cân nhắc.
                // Hiện tại, chúng ta chỉ đổi vai trò.
                _logger.LogWarning("Admin {AdminUserId}: User {UserId} changed from Owner to {NewRole}. Associated OwnerProfile and Spaces may need manual review/archival.", adminUserId, userId, newRole);
                // Ví dụ: nếu OwnerProfile được load (cần Include trong GetByIdAsync)
                // if (user.OwnerProfile != null) { /* user.OwnerProfile.IsActive = false; */ }
            }
            else if (newRole == UserRole.Owner && user.Role != UserRole.Owner)
            {
                // Nếu user được thăng cấp thành Owner, có thể cần tạo OwnerProfile nếu chưa có
                // Hoặc yêu cầu tạo riêng.
                // Hiện tại, chúng ta chỉ đổi vai trò.
                // Nếu GetByIdAsync đã include OwnerProfile:
                // if (user.OwnerProfile == null)
                // {
                //     user.OwnerProfile = new OwnerProfile { UserId = user.Id, CompanyName = $"{user.Username}'s Company (Default)" };
                //     // _dbContext.Set<OwnerProfile>().Add(user.OwnerProfile); // Nếu OwnerProfile là entity riêng
                // }
                _logger.LogInformation("Admin {AdminUserId}: User {UserId} promoted to Owner. Ensure OwnerProfile is managed.", adminUserId, userId);
            }


            user.Role = newRole;
            user.UpdatedAt = DateTime.UtcNow;
            // user.UpdatedBy = adminUserId;

            _userRepository.Update(user);
            var result = await _dbContext.SaveChangesAsync();
            _logger.LogInformation("Admin {AdminUserId}: Role for User {UserId} changed to {NewRole}. Result: {DbResult}", adminUserId, userId, newRole, result);
            return result > 0;
        }


        public async Task<UserDto?> GetUserByIdAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                // Có thể throw NotFoundException hoặc trả về null tùy theo thiết kế API
                return null;
            }
            return _mapper.Map<UserDto>(user);
        }

        public async Task<UserDto?> GetUserByUsernameAsync(string username)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null)
            {
                return null;
            }
            return _mapper.Map<UserDto>(user);
        }

        public async Task UpdateUserProfileAsync(Guid userId, UpdateUserProfileRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                // throw new NotFoundException($"User with ID {userId} not found.");
                // Hoặc trả về một Result object báo lỗi
                // Hiện tại, nếu không tìm thấy user, sẽ không làm gì cả hoặc controller cần check null
                // Để đơn giản, chúng ta sẽ throw một exception nếu không tìm thấy
                throw new ArgumentException($"User with ID {userId} not found."); // Hoặc một custom NotFoundException
            }

            // Sử dụng AutoMapper để cập nhật các thuộc tính từ DTO vào entity đã tồn tại
            // Các thuộc tính không có trong DTO hoặc được .Ignore() trong Profile sẽ không bị ảnh hưởng
            // hoặc sẽ được xử lý theo cấu hình của AutoMapper (ví dụ: null sẽ ghi đè giá trị hiện có).
            // Cần đảm bảo DTO và mapping profile được thiết kế cẩn thận.
            _mapper.Map(request, user);

            user.MarkAsUpdated(); // Đặt thời gian UpdatedAt
            _userRepository.Update(user); // Đánh dấu entity là đã thay đổi
            await _dbContext.SaveChangesAsync(); // Lưu thay đổi
        }

        public async Task<IEnumerable<UserDto>> SearchUsersAsync(string query)
        {
            _logger.LogInformation("Searching users with query: {Query}", query);

            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                return Enumerable.Empty<UserDto>();
            }

            var users = await _userRepository.SearchUsersSimpleAsync(query);
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        // Ví dụ một phương thức nghiệp vụ khác có thể có trong UserService
        // public async Task<bool> CheckIfUserIsOwnerAsync(Guid userId)
        // {
        //     var user = await _userRepository.GetByIdAsync(userId);
        //     return user != null && user.Role == Domain.Enums.UserRole.Owner;
        // }
    }
}