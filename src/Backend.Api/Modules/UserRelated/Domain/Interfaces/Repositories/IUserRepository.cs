// File: Backend.Api/Modules/UserRelated/Domain/Interfaces/Repositories/IUserRepository.cs
using System;
using System.Threading.Tasks;
using System.Collections.Generic; // Thêm using này
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;
using Backend.Api.Modules.UserRelated.Domain.Entities;
using Backend.Api.Modules.UserRelated.Domain.Enums;

namespace Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByRefreshTokenAsync(string refreshToken); // Cần cho việc làm mới token
        Task AddAsync(User user);
        void Update(User user); // EF Core theo dõi thay đổi, không cần async cho Update
        Task<bool> ExistsByUsernameAsync(string username);
        Task<bool> ExistsByEmailAsync(string email);
        Task<IEnumerable<User>> GetUsersByRoleAsync(UserRole role); // Thêm phương thức này


        Task<(IEnumerable<User> Items, int TotalCount)> SearchUsersAsync(UserSearchCriteriaDto criteria);
        // Task SaveChangesAsync(); // Thường không đặt ở đây, Unit of Work sẽ xử lý
    }
}
