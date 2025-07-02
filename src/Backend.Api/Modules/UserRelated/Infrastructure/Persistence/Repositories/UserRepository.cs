// File: Backend.Api/Modules/UserRelated/Infrastructure/Persistence/Repositories/UserRepository.cs
using System;
using System.Linq;
using System.Threading.Tasks;
using Backend.Api.Data; // Using AppDbContext
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;
using Backend.Api.Modules.UserRelated.Domain.Entities;
using Backend.Api.Modules.UserRelated.Domain.Enums; // Thêm using này cho UserRole
using Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Modules.UserRelated.Infrastructure.Persistence.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            return await _context.Set<User>()
                                 .Include(u => u.OwnerProfile) // Tải luôn OwnerProfile nếu có
                                 .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _context.Set<User>()
                                 .Include(u => u.OwnerProfile)
                                 .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Set<User>()
                                 .Include(u => u.OwnerProfile)
                                 .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                return null;

            return await _context.Set<User>()
                                 .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        }

        public async Task AddAsync(User user)
        {
            await _context.Set<User>().AddAsync(user);
        }

        public void Update(User user)
        {
            // EF Core tự động theo dõi các thay đổi trên entity được attach.
            // Chỉ cần gọi Update nếu entity không được theo dõi hoặc bạn muốn đánh dấu tất cả thuộc tính là Modified.
            // Trong trường hợp phổ biến, nếu bạn lấy entity từ context, sửa đổi nó,
            // thì khi SaveChanges được gọi, các thay đổi sẽ được lưu.
            // Tuy nhiên, gọi _context.Set<User>().Update(user); là một cách rõ ràng để đảm bảo.
            _context.Set<User>().Update(user);
        }

        public async Task<bool> ExistsByUsernameAsync(string username)
        {
            return await _context.Set<User>().AnyAsync(u => u.Username.ToLower() == username.ToLower());
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _context.Set<User>().AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<IEnumerable<User>> GetUsersByRoleAsync(UserRole role)
        {
            return await _context.Set<User>().Where(u => u.Role == role).ToListAsync();
        }




        // IMPLEMENT PHƯƠNG THỨC MỚI
        public async Task<(IEnumerable<User> Items, int TotalCount)> SearchUsersAsync(UserSearchCriteriaDto criteria) // criteria không còn nullable ở đây theo IUserRepository
        {
            var query = _context.Set<User>()
                                .Include(u => u.OwnerProfile)
                                .AsQueryable();

            // Luôn áp dụng filter IsDeleted = false nếu không có HasQueryFilter trong UserConfiguration
            // query = query.Where(u => !u.IsDeleted); // Quyết định có nên để ở đây hay không

            // criteria sẽ không null nếu IUserRepository.SearchUsersAsync cũng yêu cầu criteria không null
            // Tuy nhiên, nếu bạn muốn giữ sự linh hoạt ở đây, có thể kiểm tra:
            // if (criteria != null)
            // {
            if (!string.IsNullOrWhiteSpace(criteria.Username))
            {
                query = query.Where(u => u.Username.ToLower().Contains(criteria.Username.ToLower()));
            }
            if (!string.IsNullOrWhiteSpace(criteria.Email))
            {
                query = query.Where(u => u.Email.ToLower().Contains(criteria.Email.ToLower()));
            }
            if (criteria.Role.HasValue)
            {
                query = query.Where(u => u.Role == criteria.Role.Value);
            }
            if (criteria.IsActive.HasValue)
            {
                query = query.Where(u => u.IsActive == criteria.IsActive.Value);
            }
            // }

            var totalCount = await query.CountAsync();

            query = query.OrderBy(u => u.Username);

            // Sử dụng giá trị mặc định từ DTO nếu criteria được truyền vào
            // Hoặc nếu criteria có thể null ở đây, thì cần kiểm tra null trước khi truy cập PageNumber, PageSize
            var pageNumber = criteria.PageNumber; // Vì criteria.PageNumber có giá trị mặc định là 1
            var pageSize = criteria.PageSize;   // Vì criteria.PageSize có giá trị mặc định là 10

            query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

            var items = await query.ToListAsync();
            return (items, totalCount);
        }

        public async Task<IEnumerable<User>> SearchUsersSimpleAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Enumerable.Empty<User>();
            }

            var searchTerm = query.ToLower();
            var users = await _context.Set<User>()
                .Where(u => !u.IsDeleted && u.IsActive &&
                    ((u.FullName != null && u.FullName.ToLower().Contains(searchTerm)) ||
                     u.Username.ToLower().Contains(searchTerm) ||
                     u.Email.ToLower().Contains(searchTerm)))
                .OrderBy(u => u.FullName ?? u.Username)
                .Take(20) // Limit to 20 results for performance
                .ToListAsync();

            return users;
        }
    }
}