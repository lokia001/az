using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper; // Cần IMapper
using Backend.Api.Data; // Cần AppDbContext cho Unit of Work
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Services;
using Backend.Api.Modules.SpaceBooking.Domain.Entities; // SystemAmenity entity
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories; // ISystemAmenityRepository
using Microsoft.Extensions.Logging; // Cho ILogger

namespace Backend.Api.Modules.SpaceBooking.Application.Services
{
    public class SystemAmenityService : ISystemAmenityService
    {
        private readonly ISystemAmenityRepository _systemAmenityRepository;
        private readonly IMapper _mapper;
        private readonly AppDbContext _dbContext; // Unit of Work
        private readonly ILogger<SystemAmenityService> _logger;

        public SystemAmenityService(
            ISystemAmenityRepository systemAmenityRepository,
            IMapper mapper,
            AppDbContext dbContext,
            ILogger<SystemAmenityService> logger)
        {
            _systemAmenityRepository = systemAmenityRepository;
            _mapper = mapper;
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<SystemAmenityDto> CreateAsync(CreateSystemAmenityRequest request)
        {
            _logger.LogInformation("Attempting to create system amenity with name: {Name}", request.Name);

            // Kiểm tra tên amenity đã tồn tại chưa
            if (await _systemAmenityRepository.ExistsByNameAsync(request.Name))
            {
                throw new ArgumentException($"System amenity with name '{request.Name}' already exists.");
            }

            var amenity = _mapper.Map<SystemAmenity>(request); // Mapping từ DTO sang Entity
            // Id sẽ được tự gán trong constructor của SystemAmenity hoặc bởi AutoMapper nếu cấu hình

            await _systemAmenityRepository.AddAsync(amenity);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("System amenity created successfully with ID: {Id}", amenity.Id);
            return _mapper.Map<SystemAmenityDto>(amenity);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            _logger.LogInformation("Attempting to delete system amenity with ID: {Id}", id);
            var amenity = await _systemAmenityRepository.GetByIdAsync(id);
            if (amenity == null)
            {
                _logger.LogWarning("System amenity with ID: {Id} not found for deletion.", id);
                return false; // Hoặc throw KeyNotFoundException
            }

            // Kiểm tra xem amenity này có đang được sử dụng bởi Space nào không (qua bảng join SpaceSystemAmenity)
            // Nếu có, có thể không cho xóa hoặc cần logic xử lý phức tạp hơn.
            // Hiện tại, ISystemAmenityRepository.Delete sẽ là hard delete.
            // OnDelete behavior trong SpaceSystemAmenityConfiguration là Cascade,
            // nghĩa là nếu SystemAmenity bị xóa, các bản ghi trong SpaceSystemAmenity cũng sẽ bị xóa.
            // Điều này có thể là mong muốn hoặc không, tùy thuộc vào yêu cầu.
            // Nếu không muốn cascade delete các liên kết, hãy đặt OnDelete là Restrict và kiểm tra ở đây.
            bool isUsed = await _dbContext.Set<SpaceSystemAmenity>().AnyAsync(link => link.SystemAmenityId == id);
            if (isUsed)
            {
                // Quyết định: throw lỗi, hoặc cho phép xóa và các liên kết sẽ bị cascade delete.
                // Hiện tại, với Cascade, nó sẽ được xóa. Nếu muốn ngăn chặn, throw lỗi ở đây:
                // throw new InvalidOperationException($"System amenity '{amenity.Name}' is currently in use and cannot be deleted.");
                _logger.LogWarning("System amenity {Id} is in use but will be deleted due to cascade behavior.", id);
            }


            _systemAmenityRepository.Delete(amenity);
            var result = await _dbContext.SaveChangesAsync();

            if (result > 0)
            {
                _logger.LogInformation("System amenity with ID: {Id} deleted successfully.", id);
                return true;
            }
            _logger.LogWarning("System amenity with ID: {Id} was not deleted (no changes saved).", id);
            return false;
        }

        public async Task<IEnumerable<SystemAmenityDto>> GetAllAsync()
        {
            _logger.LogInformation("Fetching all system amenities.");
            var amenities = await _systemAmenityRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<SystemAmenityDto>>(amenities);
        }

        public async Task<SystemAmenityDto?> GetByIdAsync(Guid id)
        {
            _logger.LogInformation("Fetching system amenity with ID: {Id}", id);
            var amenity = await _systemAmenityRepository.GetByIdAsync(id);
            if (amenity == null)
            {
                _logger.LogWarning("System amenity with ID: {Id} not found.", id);
                return null;
            }
            return _mapper.Map<SystemAmenityDto>(amenity);
        }

        public async Task<SystemAmenityDto?> UpdateAsync(Guid id, UpdateSystemAmenityRequest request)
        {
            _logger.LogInformation("Attempting to update system amenity with ID: {Id}", id);
            var amenity = await _systemAmenityRepository.GetByIdAsync(id);
            if (amenity == null)
            {
                _logger.LogWarning("System amenity with ID: {Id} not found for update.", id);
                return null; // Hoặc throw KeyNotFoundException
            }

            // Kiểm tra nếu tên mới (nếu có thay đổi) đã tồn tại cho amenity khác
            if (amenity.Name.ToLower() != request.Name.ToLower() && await _systemAmenityRepository.ExistsByNameAsync(request.Name, id))
            {
                throw new ArgumentException($"System amenity with name '{request.Name}' already exists.");
            }

            _mapper.Map(request, amenity); // Áp dụng thay đổi từ DTO vào entity
            // amenity.UpdatedAt = DateTime.UtcNow; // Nếu SystemAmenity có UpdatedAt

            _systemAmenityRepository.Update(amenity);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("System amenity with ID: {Id} updated successfully.", id);
            return _mapper.Map<SystemAmenityDto>(amenity);
        }
    }
}