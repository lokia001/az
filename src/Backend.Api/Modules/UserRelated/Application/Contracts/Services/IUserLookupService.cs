using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Api.Modules.UserRelated.Application.Contracts.Services
{
    public interface IUserLookupService
    {
        /// <summary>
        /// Lấy tên hiển thị của nhiều user theo UserId. Nếu không tìm thấy, trả về "Ẩn danh".
        /// </summary>
        /// <param name="userIds">Danh sách UserId</param>
        /// <returns>Dictionary UserId - UserName</returns>
        Task<Dictionary<Guid, string>> GetUserNamesAsync(IEnumerable<Guid> userIds);
    }
}
