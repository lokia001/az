// File: Backend.Api/Modules/UserRelated/Application/Services/OwnerProfileService.cs
using System;
using System.Threading.Tasks;
using AutoMapper;
using Backend.Api.Data; // For AppDbContext (Unit of Work)
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;
using Backend.Api.Modules.UserRelated.Application.Contracts.Services;
using Backend.Api.Modules.UserRelated.Domain.Entities; // OwnerProfile, User entities
using Backend.Api.Modules.UserRelated.Domain.Enums;
using Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories;

namespace Backend.Api.Modules.UserRelated.Application.Services
{
    public class OwnerProfileService : IOwnerProfileService
    {
        private readonly IOwnerProfileRepository _ownerProfileRepository;
        private readonly IUserRepository _userRepository; // Cần để kiểm tra User và vai trò
        private readonly IMapper _mapper;
        private readonly AppDbContext _dbContext;

        public OwnerProfileService(
            IOwnerProfileRepository ownerProfileRepository,
            IUserRepository userRepository,
            IMapper mapper,
            AppDbContext dbContext)
        {
            _ownerProfileRepository = ownerProfileRepository;
            _userRepository = userRepository;
            _mapper = mapper;
            _dbContext = dbContext;
        }

        public async Task<OwnerProfileDto?> GetOwnerProfileByUserIdAsync(Guid userId)
        {
            var ownerProfile = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (ownerProfile == null)
            {
                return null;
            }
            return _mapper.Map<OwnerProfileDto>(ownerProfile);
        }

        public async Task CreateOwnerProfileAsync(Guid userId, UpsertOwnerProfileRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ArgumentException($"User with ID {userId} not found.");
            }

            // Kiểm tra xem user đã có OwnerProfile chưa
            var existingProfile = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (existingProfile != null)
            {
                throw new InvalidOperationException($"User with ID {userId} already has an Owner Profile.");
            }

            // Kiểm tra vai trò của User, chỉ Owner mới được tạo OwnerProfile
            // Hoặc có thể logic này nằm ở Controller/Authorization Policy
            // Nhưng để an toàn, service cũng nên kiểm tra
            if (user.Role != UserRole.Owner)
            {
                // Có thể nâng cấp vai trò của user thành Owner ở đây nếu logic cho phép
                // Hoặc throw lỗi nếu user không phải Owner
                // Ví dụ: user.Role = UserRole.Owner; _userRepository.Update(user);
                // Hiện tại, chúng ta sẽ yêu cầu user phải là Owner trước.
                throw new InvalidOperationException("User must have the 'Owner' role to create an Owner Profile.");
            }

            var ownerProfile = _mapper.Map<OwnerProfile>(request);
            ownerProfile.UserId = userId; // Gán UserId
            ownerProfile.CreatedAt = DateTime.UtcNow; // Set CreatedAt thủ công vì mapping có thể Ignore

            await _ownerProfileRepository.AddAsync(ownerProfile);
            await _dbContext.SaveChangesAsync();
        }

        public async Task UpdateOwnerProfileAsync(Guid userId, UpsertOwnerProfileRequest request)
        {
            var ownerProfile = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (ownerProfile == null)
            {
                // throw new NotFoundException($"Owner Profile for User ID {userId} not found.");
                throw new ArgumentException($"Owner Profile for User ID {userId} not found.");
            }

            // Kiểm tra xem người dùng hiện tại có quyền cập nhật profile này không
            // (thường thì userId này là của user đang đăng nhập và là chủ của profile)
            // Logic này có thể đã được xử lý bởi Authorization ở Controller.

            _mapper.Map(request, ownerProfile); // Áp dụng thay đổi từ DTO vào entity
            ownerProfile.MarkAsUpdated(); // Set UpdatedAt

            _ownerProfileRepository.Update(ownerProfile);
            await _dbContext.SaveChangesAsync();
        }
    }
}