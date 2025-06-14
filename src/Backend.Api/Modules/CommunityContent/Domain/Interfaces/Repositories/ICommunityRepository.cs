// File: Backend.Api/Modules/CommunityContent/Domain/Interfaces/Repositories/ICommunityRepository.cs
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Backend.Api.Modules.CommunityContent.Domain.Entities;

namespace Backend.Api.Modules.CommunityContent.Domain.Interfaces.Repositories
{
    public interface ICommunityRepository
    {
        Task<Community?> GetByIdAsync(Guid id, bool includeMembers = false, bool includePosts = false);
        Task<Community?> GetByNameAsync(string name, bool includeMembers = false, bool includePosts = false); // Tên Community là unique
        Task<IEnumerable<Community>> GetAllAsync(bool includeMembers = false, bool includePosts = false); // Có thể thêm phân trang sau
        Task<IEnumerable<Community>> FindAsync(Expression<Func<Community, bool>> predicate, bool includeMembers = false, bool includePosts = false);
        Task<IEnumerable<Community>> GetByUserMembershipAsync(Guid userId); // Lấy các community mà user là thành viên
        Task AddAsync(Community community);
        void Update(Community community);
        void Delete(Community community); // Service sẽ xử lý soft delete
        Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null);
    }
}