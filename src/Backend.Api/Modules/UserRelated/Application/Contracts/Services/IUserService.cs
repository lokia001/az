
// File: Backend.Api/Modules/UserRelated/Application/Contracts/Services/IUserService.cs
using System;
using System.Threading.Tasks;
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;
using Backend.Api.Modules.UserRelated.Domain.Enums;
using Backend.Api.SharedKernel.Dtos;

namespace Backend.Api.Modules.UserRelated.Application.Contracts.Services
{
    public interface IUserService
    {
        Task<UserDto?> GetUserByIdAsync(Guid userId);
        Task<UserDto?> GetUserByUsernameAsync(string username);
        Task UpdateUserProfileAsync(Guid userId, UpdateUserProfileRequest request);
        // Task ChangePasswordAsync(Guid userId, string oldPassword, string newPassword);
        // Task<bool> CheckIfUserIsOwnerAsync(Guid userId); // Ví dụ một query nghiệp vụ

        Task<PagedResultDto<UserDto>> GetAllUsersAsync(UserSearchCriteriaDto criteria); // Lấy tất cả user, có thể kèm tiêu chí tìm kiếm/phân trang
                                                                                        // Hoặc nếu muốn phân trang ngay:
                                                                                        // Task<PagedResultDto<UserDto>> GetAllUsersAsync(UserSearchCriteriaDto criteria);
        Task<UserDto?> GetUserByIdForAdminAsync(Guid userId);
        Task<bool> SetUserActiveStatusAsync(Guid userId, bool isActive, Guid adminUserId); // Kích hoạt/Vô hiệu hóa
        Task<bool> ChangeUserRoleAsync(Guid userId, UserRole newRole, Guid adminUserId);
    }
}