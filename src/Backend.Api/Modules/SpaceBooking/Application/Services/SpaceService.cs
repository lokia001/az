// Đảm bảo các using này là đúng và đủ
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Backend.Api.Data;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos; // Namespace chứa DTOs của bạn
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Infrastructure;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Services;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories;
using Backend.Api.SharedKernel.Dtos;

// using Backend.Api.Modules.UserRelated.Application.Contracts.Services; // CHỈ THÊM NẾU CẦN CHO LOGIC NGHIỆP VỤ, KHÔNG PHẢI ĐỂ LÀM GIÀU DTO
// using Backend.Api.Modules.UserRelated.Domain.Enums;
using Microsoft.EntityFrameworkCore; // Cho IgnoreQueryFilters và FirstOrDefaultAsync

namespace Backend.Api.Modules.SpaceBooking.Application.Services
{
    public class SpaceService : ISpaceService
    {
        private readonly IFileStorageService _fileStorageService; // << THÊM VÀO
        private readonly ISpaceRepository _spaceRepository;
        // private readonly IUserService _userService; // Xem xét lại sự cần thiết
        private readonly ISystemAmenityRepository _systemAmenityRepository;
        private readonly ISystemSpaceServiceRepository _systemSpaceServiceRepository;
        private readonly IMapper _mapper;
        private readonly AppDbContext _dbContext;


        private readonly ILogger<SpaceService> _logger;


        public SpaceService(
            ISpaceRepository spaceRepository,
            // IUserService userService, // Xem xét lại
            ISystemAmenityRepository systemAmenityRepository,
            ISystemSpaceServiceRepository systemSpaceServiceRepository,
            IMapper mapper,
            AppDbContext dbContext
            , IFileStorageService fileStorageService

            ,
ILogger<SpaceService> logger
            )
        {
            _spaceRepository = spaceRepository;
            // _userService = userService;
            _systemAmenityRepository = systemAmenityRepository;
            _systemSpaceServiceRepository = systemSpaceServiceRepository;
            _mapper = mapper;
            _dbContext = dbContext;
            _fileStorageService = fileStorageService; // << GÁN GIÁ TRỊ
            _logger = logger;
        }

        public async Task<SpaceDto> CreateSpaceAsync(CreateSpaceRequest request, Guid creatorUserId)
        {
            // 1. Kiểm tra quyền (ví dụ, creatorUserId phải là Owner)
            //    Logic này có thể nằm ở Controller hoặc nếu phức tạp thì gọi _userService.ValidateIsOwner(creatorUserId);
            //    Hiện tại, chúng ta giả định quyền đã được kiểm tra ở tầng trên hoặc sẽ thêm logic sau.

            if (!string.IsNullOrWhiteSpace(request.Slug) && await _spaceRepository.ExistsBySlugAsync(request.Slug))
            {
                throw new ArgumentException($"Slug '{request.Slug}' is already in use.");
            }

            var space = _mapper.Map<Space>(request); // DTO CreateSpaceRequest của bạn không có Images
            space.OwnerId = creatorUserId;
            space.CreatedByUserId = creatorUserId;
            space.CreatedAt = DateTime.UtcNow;
            space.Status = Domain.Enums.SpaceStatus.Available;

            space.Latitude = request.Latitude;
            space.Longitude = request.Longitude;

            // Xử lý System Amenities (SelectedSystemAmenityIds từ DTO của bạn)
            if (request.SelectedSystemAmenityIds != null && request.SelectedSystemAmenityIds.Any())
            {
                foreach (var amenityId in request.SelectedSystemAmenityIds)
                {
                    var systemAmenity = await _systemAmenityRepository.GetByIdAsync(amenityId);
                    if (systemAmenity != null)
                    {
                        space.SystemAmenitiesLink.Add(new SpaceSystemAmenity { SystemAmenityId = amenityId });
                    }
                }
            }

            // Xử lý Custom Amenities (CustomAmenityNames từ DTO của bạn)
            if (request.CustomAmenityNames != null && request.CustomAmenityNames.Any())
            {
                foreach (var amenityName in request.CustomAmenityNames.Where(name => !string.IsNullOrWhiteSpace(name)))
                {
                    space.CustomAmenities.Add(new SpaceCustomAmenity { Name = amenityName.Trim() });
                }
            }

            // Xử lý System Services (SelectedSystemServices từ DTO của bạn)
            if (request.SelectedSystemServices != null && request.SelectedSystemServices.Any())
            {
                foreach (var serviceLinkRequest in request.SelectedSystemServices) // DTO của bạn là CreateSpaceSystemFeatureLinkRequest
                {
                    var systemService = await _systemSpaceServiceRepository.GetByIdAsync(serviceLinkRequest.SystemFeatureId);
                    if (systemService != null)
                    {
                        space.SystemServicesLink.Add(new SpaceSystemSpaceService
                        {
                            SystemSpaceServiceId = serviceLinkRequest.SystemFeatureId,
                            PriceOverride = serviceLinkRequest.PriceOverride,
                            Notes = serviceLinkRequest.Notes,
                            IsIncludedInBasePrice = serviceLinkRequest.IsIncludedInBasePrice
                        });
                    }
                }
            }

            // Xử lý Custom Services (CustomServiceRequests từ DTO của bạn)
            if (request.CustomServiceRequests != null && request.CustomServiceRequests.Any())
            {
                foreach (var customServiceRequest in request.CustomServiceRequests) // DTO của bạn là CreateSpaceCustomServiceRequest
                {
                    if (!string.IsNullOrWhiteSpace(customServiceRequest.Name))
                    {
                        space.CustomServices.Add(new SpaceCustomService
                        {
                            Name = customServiceRequest.Name.Trim(),
                            Price = customServiceRequest.Price,
                            Notes = customServiceRequest.Notes,
                            IsIncludedInBasePrice = customServiceRequest.IsIncludedInBasePrice
                        });
                    }
                }
            }

            // PHẦN XỬ LÝ IMAGES SẼ BỊ XÓA KHỎI ĐÂY
            // Vì CreateSpaceRequest của bạn không có thuộc tính Images.
            // Việc thêm ảnh sẽ được thực hiện qua AddImageToSpaceAsync.

            await _spaceRepository.AddAsync(space);
            await _dbContext.SaveChangesAsync();

            var createdSpaceWithDetails = await _spaceRepository.GetByIdWithDetailsAsync(space.Id);
            // Map sang SpaceDto (DTO của bạn không có OwnerName, OwnerAvatarUrl)
            return _mapper.Map<SpaceDto>(createdSpaceWithDetails);
        }

        public async Task<SpaceDto?> GetSpaceByIdAsync(Guid spaceId)
        {
            var space = await _spaceRepository.GetByIdWithDetailsAsync(spaceId);
            if (space == null) return null;
            // Map sang SpaceDto (DTO của bạn không có OwnerName, OwnerAvatarUrl)
            return _mapper.Map<SpaceDto>(space);
        }



        // File: Backend.Api/Modules/SpaceBooking/Application/Services/SpaceService.cs
        // ... (using statements và constructor như đã có) ...
        // Đảm bảo có using:
        // using Backend.Api.Modules.UserRelated.Application.Contracts.Services; // Nếu cần IUserService
        // using Backend.Api.Modules.UserRelated.Domain.Enums; // Nếu cần UserRole
        // File: Backend.Api/Modules/SpaceBooking/Application/Services/SpaceService.cs
        // ... (using statements và constructor như đã có) ...

        // File: Backend.Api/Modules/SpaceBooking/Application/Services/SpaceService.cs
        // ... (using statements và constructor như đã có) ...

        public async Task<SpaceDto?> UpdateSpaceAsync(Guid spaceId, UpdateSpaceRequest request, Guid editorUserId)
        {
            _logger.LogInformation("Attempting to update space {SpaceId} by user {EditorUserId}", spaceId, editorUserId);

            // 1. Lấy Space hiện tại CÙNG VỚI TẤT CẢ CÁC COLLECTION CON CẦN CẬP NHẬT
            var space = await _dbContext.Set<Space>()
                .Include(s => s.SystemAmenitiesLink) // QUAN TRỌNG: Include collection cần cập nhật
                                                     // .ThenInclude(sal => sal.SystemAmenity) // Chỉ cần nếu bạn cần truy cập thuộc tính của SystemAmenity ngay ở đây
                .Include(s => s.CustomAmenities)
                .Include(s => s.SystemServicesLink)
                // .ThenInclude(ssl => ssl.SystemSpaceService)
                .Include(s => s.CustomServices)
                .FirstOrDefaultAsync(s => s.Id == spaceId);

            if (space == null)
            {
                _logger.LogWarning("Space {SpaceId} not found for update.", spaceId);
                return null;
            }

            // 2. Kiểm tra quyền (ví dụ)
            if (space.OwnerId != editorUserId /* && editor.Role != UserRole.SysAdmin */)
            {
                _logger.LogWarning("User {EditorUserId} unauthorized to update Space {SpaceId}.", editorUserId, spaceId);
                throw new UnauthorizedAccessException("User is not authorized to update this space.");
            }

            // 3. Cập nhật các thuộc tính đơn giản của Space (gán thủ công)
            // 3. Cập nhật các thuộc tính đơn giản của Space (gán thủ công từ request DTO)
            space.Name = request.Name; // Giả định Name là required trong DTO
            space.Description = request.Description; // Nullable


            space.Address = request.Address; // Giả định Address là required trong DTO
            space.Latitude = request.Latitude;
            space.Longitude = request.Longitude;


            space.Type = request.Type; // Giả định Type là required trong DTO

            if (request.Status.HasValue) // Status là nullable trong DTO
            {
                space.Status = request.Status.Value;
            }

            space.Capacity = request.Capacity; // Giả định Capacity là required trong DTO
            space.PricePerHour = request.PricePerHour; // Giả định PricePerHour là required trong DTO
            space.PricePerDay = request.PricePerDay; // Nullable

            space.OpenTime = request.OpenTime; // Nullable
            space.CloseTime = request.CloseTime; // Nullable

            // Các trường này có giá trị mặc định trong CreateSpaceRequest,
            // nhưng trong UpdateSpaceRequest chúng là nullable để cho phép không thay đổi.
            // Nếu DTO cung cấp giá trị, chúng ta cập nhật.
            if (request.MinBookingDurationMinutes.HasValue)
            {
                space.MinBookingDurationMinutes = request.MinBookingDurationMinutes.Value;
            }
            if (request.MaxBookingDurationMinutes.HasValue)
            {
                space.MaxBookingDurationMinutes = request.MaxBookingDurationMinutes.Value;
            }
            if (request.CancellationNoticeHours.HasValue)
            {
                space.CancellationNoticeHours = request.CancellationNoticeHours.Value;
            }
            if (request.CleaningDurationMinutes.HasValue)
            {
                space.CleaningDurationMinutes = request.CleaningDurationMinutes.Value;
            }
            if (request.BufferMinutes.HasValue)
            {
                space.BufferMinutes = request.BufferMinutes.Value;
            }

            space.AccessInstructions = request.AccessInstructions; // Nullable
            space.HouseRules = request.HouseRules; // Nullable

            // Cập nhật Slug
            if (!string.IsNullOrWhiteSpace(request.Slug) && request.Slug != space.Slug)
            {
                if (await _spaceRepository.ExistsBySlugAsync(request.Slug, spaceId))
                {
                    throw new ArgumentException($"Slug '{request.Slug}' is already in use by another space.");
                }
                space.Slug = request.Slug.Trim();
            }
            else if (string.IsNullOrWhiteSpace(request.Slug) && !string.IsNullOrWhiteSpace(space.Slug))
            {
                // Nếu request.Slug là rỗng/null và space.Slug hiện tại có giá trị, thì xóa slug
                space.Slug = null;
            }
            // Nếu request.Slug là null và space.Slug cũng là null, hoặc request.Slug giống space.Slug, thì không làm gì cả.

            // Audit fields
            space.LastEditedByUserId = editorUserId;
            space.UpdatedAt = DateTime.UtcNow;

            // --- Xử lý cập nhật các Collection con một cách có kiểm soát ---

            // 5. Cập nhật System Amenities (SpaceSystemAmenity - bảng join)
            var requestedSystemAmenityIds = request.SelectedSystemAmenityIds?.ToHashSet() ?? new HashSet<Guid>();
            var currentSystemAmenityIds = space.SystemAmenitiesLink.Select(l => l.SystemAmenityId).ToHashSet();

            // Xác định các link cần xóa
            var linksToRemove = space.SystemAmenitiesLink
                .Where(link => !requestedSystemAmenityIds.Contains(link.SystemAmenityId))
                .ToList();
            if (linksToRemove.Any())
            {
                _dbContext.Set<SpaceSystemAmenity>().RemoveRange(linksToRemove);
            }

            // Xác định các ID amenity cần thêm (những ID có trong request nhưng chưa có trong link hiện tại)
            var amenityIdsToAdd = requestedSystemAmenityIds
                .Where(id => !currentSystemAmenityIds.Contains(id))
                .ToList();

            foreach (var amenityId in amenityIdsToAdd)
            {
                // Kiểm tra xem SystemAmenity có tồn tại không trước khi tạo link
                if (await _systemAmenityRepository.GetByIdAsync(amenityId) != null)
                {
                    // Tạo và thêm link mới vào DbContext (EF Core sẽ tự gán SpaceId khi SaveChanges)
                    // Hoặc thêm vào collection của space nếu bạn muốn EF Core theo dõi qua navigation property
                    var newLink = new SpaceSystemAmenity { SpaceId = space.Id, SystemAmenityId = amenityId };
                    _dbContext.Set<SpaceSystemAmenity>().Add(newLink); // Thêm trực tiếp vào DbContext
                                                                       // Hoặc space.SystemAmenitiesLink.Add(newLink); // Nếu collection được cấu hình để cascade add
                }
                else
                {
                    _logger.LogWarning("SystemAmenity with ID {AmenityId} not found, skipping link creation for Space {SpaceId}.", amenityId, space.Id);
                }
            }

            // TƯƠNG TỰ CHO CÁC COLLECTION KHÁC: CustomAmenities, SystemServicesLink, CustomServices

            // 6. Cập nhật Custom Amenities (SpaceCustomAmenity - 1-N)
            var requestedCustomAmenityNames = request.CustomAmenityNames?.Where(n => !string.IsNullOrWhiteSpace(n)).Select(n => n.Trim().ToLowerInvariant()).ToHashSet() ?? new HashSet<string>();
            var currentCustomAmenities = space.CustomAmenities.ToList(); // Làm việc trên bản copy

            // Xóa
            var customAmenitiesToRemove = currentCustomAmenities
                .Where(ca => !requestedCustomAmenityNames.Contains(ca.Name.ToLowerInvariant()))
                .ToList();
            if (customAmenitiesToRemove.Any())
            {
                _dbContext.Set<SpaceCustomAmenity>().RemoveRange(customAmenitiesToRemove);
            }

            // Thêm
            var customAmenityNamesToAdd = requestedCustomAmenityNames
                .Where(name => !currentCustomAmenities.Any(ca => ca.Name.Equals(name, StringComparison.OrdinalIgnoreCase)))
                .ToList();
            foreach (var amenityName in customAmenityNamesToAdd)
            {
                _dbContext.Set<SpaceCustomAmenity>().Add(new SpaceCustomAmenity { SpaceId = space.Id, Name = amenityName });
            }


            // 7. Cập nhật System Services (SpaceSystemSpaceService - bảng join)
            var requestedSystemServices = request.SelectedSystemServices ?? new List<CreateSpaceSystemFeatureLinkRequest>();
            var currentSystemServicesLinks = space.SystemServicesLink.ToList();

            // Xóa
            var systemServiceLinksToRemove = currentSystemServicesLinks
                .Where(link => !requestedSystemServices.Any(r => r.SystemFeatureId == link.SystemSpaceServiceId))
                .ToList();
            if (systemServiceLinksToRemove.Any())
            {
                _dbContext.Set<SpaceSystemSpaceService>().RemoveRange(systemServiceLinksToRemove);
            }

            // Thêm hoặc Cập nhật
            foreach (var serviceLinkRequest in requestedSystemServices)
            {
                var existingLink = currentSystemServicesLinks
                    .FirstOrDefault(link => link.SystemSpaceServiceId == serviceLinkRequest.SystemFeatureId);

                if (existingLink != null) // Cập nhật link đã có
                {
                    bool changed = false;
                    if (existingLink.PriceOverride != serviceLinkRequest.PriceOverride) { existingLink.PriceOverride = serviceLinkRequest.PriceOverride; changed = true; }
                    if (existingLink.Notes != serviceLinkRequest.Notes) { existingLink.Notes = serviceLinkRequest.Notes; changed = true; }
                    if (existingLink.IsIncludedInBasePrice != serviceLinkRequest.IsIncludedInBasePrice) { existingLink.IsIncludedInBasePrice = serviceLinkRequest.IsIncludedInBasePrice; changed = true; }

                    if (changed) _dbContext.Set<SpaceSystemSpaceService>().Update(existingLink);
                }
                else // Thêm link mới
                {
                    if (await _systemSpaceServiceRepository.GetByIdAsync(serviceLinkRequest.SystemFeatureId) != null)
                    {
                        _dbContext.Set<SpaceSystemSpaceService>().Add(new SpaceSystemSpaceService
                        {
                            SpaceId = space.Id,
                            SystemSpaceServiceId = serviceLinkRequest.SystemFeatureId,
                            PriceOverride = serviceLinkRequest.PriceOverride,
                            Notes = serviceLinkRequest.Notes,
                            IsIncludedInBasePrice = serviceLinkRequest.IsIncludedInBasePrice
                        });
                    }
                }
            }

            // 8. Cập nhật Custom Services (SpaceCustomService - 1-N)
            var requestedCustomServices = request.CustomServiceRequests ?? new List<CreateSpaceCustomServiceRequest>();
            var currentCustomServices = space.CustomServices.ToList();

            // Xóa
            var customServicesToRemove = currentCustomServices
                .Where(cs => !requestedCustomServices.Any(r => r.Name.Equals(cs.Name, StringComparison.OrdinalIgnoreCase)))
                .ToList();
            if (customServicesToRemove.Any())
            {
                _dbContext.Set<SpaceCustomService>().RemoveRange(customServicesToRemove);
            }
            // Thêm hoặc Cập nhật
            foreach (var customServiceRequest in requestedCustomServices)
            {
                if (string.IsNullOrWhiteSpace(customServiceRequest.Name)) continue;
                var existingCustomService = currentCustomServices
                    .FirstOrDefault(cs => cs.Name.Equals(customServiceRequest.Name, StringComparison.OrdinalIgnoreCase));

                if (existingCustomService != null) // Cập nhật
                {
                    bool changed = false;
                    if (existingCustomService.Price != customServiceRequest.Price) { existingCustomService.Price = customServiceRequest.Price; changed = true; }
                    if (existingCustomService.Notes != customServiceRequest.Notes) { existingCustomService.Notes = customServiceRequest.Notes; changed = true; }
                    if (existingCustomService.IsIncludedInBasePrice != customServiceRequest.IsIncludedInBasePrice) { existingCustomService.IsIncludedInBasePrice = customServiceRequest.IsIncludedInBasePrice; changed = true; }

                    if (changed) _dbContext.Set<SpaceCustomService>().Update(existingCustomService);
                }
                else // Thêm mới
                {
                    _dbContext.Set<SpaceCustomService>().Add(new SpaceCustomService
                    {
                        SpaceId = space.Id,
                        Name = customServiceRequest.Name.Trim(),
                        Price = customServiceRequest.Price,
                        Notes = customServiceRequest.Notes,
                        IsIncludedInBasePrice = customServiceRequest.IsIncludedInBasePrice
                    });
                }
            }


            // 9. Đánh dấu Space là đã thay đổi (EF Core sẽ tự phát hiện thay đổi thuộc tính đơn giản)
            // Không cần gọi _dbContext.Update(space); một cách tường minh nếu space đã được theo dõi
            // và bạn chỉ thay đổi thuộc tính của nó. Tuy nhiên, nếu bạn đã thay đổi các collection
            // bằng cách Add/Remove trực tiếp vào DbContext.Set<ChildEntity>(), thì việc
            // EF Core tự động cập nhật mối quan hệ trên 'space' có thể không xảy ra như mong đợi
            // nếu không có .Update(space). Để an toàn, có thể vẫn gọi.
            // _dbContext.Update(space); // Hoặc _spaceRepository.Update(space);

            // 10. LƯU TẤT CẢ THAY ĐỔI MỘT LẦN DUY NHẤT
            try
            {
                await _dbContext.SaveChangesAsync();
                _logger.LogInformation("Space {SpaceId} and its collections updated successfully.", spaceId);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "DbUpdateConcurrencyException while updating Space {SpaceId} and its collections. This might be a genuine concurrency issue or an EF Core tracking problem.", spaceId);
                throw; // Rethrow để Controller bắt và trả về lỗi phù hợp
            }
            catch (Exception ex) // Bắt các lỗi khác có thể xảy ra khi SaveChanges
            {
                _logger.LogError(ex, "Unexpected error while saving changes for Space {SpaceId} and its collections.", spaceId);
                throw;
            }

            // 11. Lấy lại thông tin chi tiết và map sang DTO để trả về
            var updatedSpaceWithDetails = await _spaceRepository.GetByIdWithDetailsAsync(space.Id);
            return _mapper.Map<SpaceDto>(updatedSpaceWithDetails);
        }
        public async Task<bool> DeleteSpaceAsync(Guid spaceId, Guid deleterUserId)
        {
            // 1. Lấy Space, bỏ qua Global Query Filter để có thể "xóa" (đánh dấu IsDeleted)
            // một Space mà có thể đã bị soft delete trước đó (nếu logic cho phép "xóa lại").
            var space = await _dbContext.Set<Space>() // SỬA: Dùng _dbContext
                                      .IgnoreQueryFilters()
                                      .FirstOrDefaultAsync(s => s.Id == spaceId); // Đảm bảo s được hiểu là Space

            if (space == null)
            {
                // Không tìm thấy Space (kể cả đã soft delete trước đó)
                // throw new KeyNotFoundException($"Space with ID {spaceId} not found to delete.");
                return false;
            }

            // Nếu Space đã bị soft delete rồi, và bạn không muốn cho "xóa lại"
            if (space.IsDeleted)
            {
                // throw new InvalidOperationException("Space has already been deleted.");
                return true; // Coi như đã xóa thành công vì nó đã ở trạng thái IsDeleted
            }

            // 2. Kiểm tra quyền của deleterUserId
            //    (Logic kiểm tra quyền của bạn ở đây, ví dụ: space.OwnerId == deleterUserId)
            if (space.OwnerId != deleterUserId /* && !await _userService.IsUserSysAdminAsync(deleterUserId) */)
            {
                // throw new UnauthorizedAccessException("User is not authorized to delete this space.");
                return false; // Hoặc throw lỗi
            }

            // 3. Kiểm tra các ràng buộc nghiệp vụ (ví dụ: active bookings)
            bool hasActiveBookings = await _dbContext.Set<Booking>() // SỬA: Dùng _dbContext
                .AnyAsync(b => b.SpaceId == spaceId &&
                               !b.IsDeleted &&
                               (b.Status == Domain.Enums.BookingStatus.Pending ||
                                b.Status == Domain.Enums.BookingStatus.Confirmed ||
                                b.Status == Domain.Enums.BookingStatus.CheckedIn));

            if (hasActiveBookings)
            {
                throw new InvalidOperationException("Cannot delete space with active bookings. Please cancel or complete all bookings first.");
            }

            // 4. Thực hiện Soft Delete
            space.IsDeleted = true;
            space.UpdatedAt = DateTime.UtcNow;
            space.LastEditedByUserId = deleterUserId;

            _spaceRepository.Update(space); // Gọi Update để EF Core theo dõi thay đổi trạng thái IsDeleted

            var result = await _dbContext.SaveChangesAsync(); // SỬA: Dùng _dbContext
            return result > 0;
        }

        public async Task<IEnumerable<SpaceDto>> GetSpacesByOwnerAsync(Guid ownerId)
        {
            var spaces = await _spaceRepository.GetByOwnerIdWithDetailsAsync(ownerId);
            var spaceDtos = _mapper.Map<IEnumerable<SpaceDto>>(spaces).ToList();
            // ... (logic làm giàu DTO đã bị loại bỏ theo yêu cầu loose coupling) ...
            // Giờ chỉ còn:
            // return _mapper.Map<IEnumerable<SpaceDto>>(spaces);
            // Hoặc nếu bạn muốn giữ lại ToList() để xử lý tiếp:
            if (!spaces.Any()) return Enumerable.Empty<SpaceDto>();
            return _mapper.Map<IEnumerable<SpaceDto>>(spaces);
        }

        public async Task<SpaceDto?> GetSpaceBySlugAsync(string slug)
        {
            var space = await _spaceRepository.GetBySlugWithDetailsAsync(slug); // Sử dụng GetBySlugWithDetailsAsync từ ISpaceRepository
            if (space == null) return null;
            return _mapper.Map<SpaceDto>(space); // Chỉ map, không làm giàu
        }




        // CÁC PHƯƠNG THỨC CÒN LẠI CẦN IMPLEMENT (AddImageToSpaceAsync sẽ dùng UploadSpaceImageRequest)


        public async Task<SpaceImageDto> AddImageToSpaceAsync(Guid spaceId, UploadSpaceImageRequest request, Guid uploaderUserId)
        {
            var space = await _spaceRepository.GetByIdAsync(spaceId); // Không cần details ở đây
            if (space == null)
            {
                throw new KeyNotFoundException($"Space with ID {spaceId} not found.");
            }

            // Kiểm tra quyền của uploaderUserId (ví dụ: phải là Owner của Space)
            if (space.OwnerId != uploaderUserId /* && !await _userService.IsUserSysAdminAsync(uploaderUserId) */)
            {
                throw new UnauthorizedAccessException("User is not authorized to add images to this space.");
            }

            // Lưu file ảnh
            var relativeImagePath = await _fileStorageService.SaveFileAsync(request.ImageFile, $"spaces/{spaceId}/images");

            var spaceImage = new SpaceImage
            {
                SpaceId = spaceId,
                ImageUrl = relativeImagePath, // Lưu đường dẫn tương đối
                Caption = request.Caption,
                IsCoverImage = request.IsCoverImage,
                DisplayOrder = request.DisplayOrder,
                CreatedAt = DateTime.UtcNow
            };

            // Nếu IsCoverImage = true, đảm bảo các ảnh khác không phải là cover
            if (spaceImage.IsCoverImage)
            {
                var existingImages = await _dbContext.Set<SpaceImage>().Where(img => img.SpaceId == spaceId && img.IsCoverImage).ToListAsync();
                foreach (var img in existingImages)
                {
                    img.IsCoverImage = false;
                    _dbContext.Update(img); // Đánh dấu để cập nhật
                }
            }

            await _dbContext.Set<SpaceImage>().AddAsync(spaceImage); // Thêm ảnh mới vào DbContext
            space.UpdatedAt = DateTime.UtcNow; // Cập nhật thời gian của Space
            space.LastEditedByUserId = uploaderUserId;
            _spaceRepository.Update(space); // Đánh dấu Space đã thay đổi

            await _dbContext.SaveChangesAsync();

            return _mapper.Map<SpaceImageDto>(spaceImage);
        }

        public async Task<bool> RemoveImageFromSpaceAsync(Guid spaceId, Guid imageId, Guid removerUserId)
        {
            var space = await _spaceRepository.GetByIdAsync(spaceId);
            if (space == null)
            {
                throw new KeyNotFoundException($"Space with ID {spaceId} not found.");
            }

            if (space.OwnerId != removerUserId /* && !isSysAdmin */)
            {
                throw new UnauthorizedAccessException("User is not authorized to remove images from this space.");
            }

            var image = await _dbContext.Set<SpaceImage>().FirstOrDefaultAsync(img => img.Id == imageId && img.SpaceId == spaceId);
            if (image == null)
            {
                return false; // Hoặc throw KeyNotFoundException
            }

            // Xóa file vật lý trước khi xóa record trong DB
            await _fileStorageService.DeleteFileAsync(image.ImageUrl);

            _dbContext.Set<SpaceImage>().Remove(image);
            space.UpdatedAt = DateTime.UtcNow;
            space.LastEditedByUserId = removerUserId;
            _spaceRepository.Update(space);

            var result = await _dbContext.SaveChangesAsync();
            return result > 0;
        }

        public async Task<SpaceImageDto?> UpdateSpaceImageDetailsAsync(Guid spaceId, Guid imageId, UpdateSpaceImageDetailsRequest request, Guid editorUserId)
        {
            var space = await _spaceRepository.GetByIdAsync(spaceId);
            if (space == null)
            {
                throw new KeyNotFoundException($"Space with ID {spaceId} not found.");
            }
            if (space.OwnerId != editorUserId /* && !isSysAdmin */)
            {
                throw new UnauthorizedAccessException("User is not authorized to update image details for this space.");
            }

            var image = await _dbContext.Set<SpaceImage>().FirstOrDefaultAsync(img => img.Id == imageId && img.SpaceId == spaceId);
            if (image == null)
            {
                return null; // Hoặc throw KeyNotFoundException
            }

            bool hasChanges = false;
            if (request.Caption != null && image.Caption != request.Caption)
            {
                image.Caption = request.Caption;
                hasChanges = true;
            }
            if (request.DisplayOrder.HasValue && image.DisplayOrder != request.DisplayOrder.Value)
            {
                image.DisplayOrder = request.DisplayOrder.Value;
                hasChanges = true;
            }
            if (request.IsCoverImage.HasValue && image.IsCoverImage != request.IsCoverImage.Value)
            {
                if (request.IsCoverImage.Value) // Nếu đang set ảnh này làm cover
                {
                    var existingCovers = await _dbContext.Set<SpaceImage>()
                        .Where(img => img.SpaceId == spaceId && img.IsCoverImage && img.Id != imageId)
                        .ToListAsync();
                    foreach (var cover in existingCovers)
                    {
                        cover.IsCoverImage = false;
                        _dbContext.Update(cover);
                    }
                }
                image.IsCoverImage = request.IsCoverImage.Value;
                hasChanges = true;
            }

            if (hasChanges)
            {
                _dbContext.Set<SpaceImage>().Update(image);
                space.UpdatedAt = DateTime.UtcNow;
                space.LastEditedByUserId = editorUserId;
                _spaceRepository.Update(space);
                await _dbContext.SaveChangesAsync();
            }

            return _mapper.Map<SpaceImageDto>(image);
        }

        public async Task<bool> SetCoverImageAsync(Guid spaceId, Guid imageId, Guid ownerId)
        {
            var space = await _spaceRepository.GetByIdAsync(spaceId);
            if (space == null)
            {
                throw new KeyNotFoundException($"Space with ID {spaceId} not found.");
            }
            if (space.OwnerId != ownerId /* && !isSysAdmin */)
            {
                throw new UnauthorizedAccessException("User is not authorized to set cover image for this space.");
            }

            var imageToSetAsCover = await _dbContext.Set<SpaceImage>().FirstOrDefaultAsync(img => img.Id == imageId && img.SpaceId == spaceId);
            if (imageToSetAsCover == null)
            {
                return false; // Hoặc throw KeyNotFoundException
            }

            if (imageToSetAsCover.IsCoverImage) return true; // Đã là cover rồi, không cần làm gì

            // Bỏ cover cũ (nếu có)
            var currentCover = await _dbContext.Set<SpaceImage>()
                .FirstOrDefaultAsync(img => img.SpaceId == spaceId && img.IsCoverImage && img.Id != imageId);
            if (currentCover != null)
            {
                currentCover.IsCoverImage = false;
                _dbContext.Update(currentCover);
            }

            // Đặt cover mới
            imageToSetAsCover.IsCoverImage = true;
            _dbContext.Update(imageToSetAsCover);

            space.UpdatedAt = DateTime.UtcNow;
            space.LastEditedByUserId = ownerId; // Hoặc người thực hiện
            _spaceRepository.Update(space);

            var result = await _dbContext.SaveChangesAsync();
            return result > 0; // Chính xác hơn là result >= 1 (nếu chỉ có 1 ảnh được set cover) hoặc >=2 (nếu có cả bỏ cover cũ)
        }


        public async Task<PagedResultDto<SpaceDto>> SearchSpacesAsync(SpaceSearchCriteria criteria)
        {
            var (spaceEntities, totalCount) = await _spaceRepository.SearchAsync(criteria, includeDetails: true);
            var spaceDtos = _mapper.Map<IEnumerable<SpaceDto>>(spaceEntities);
            return new PagedResultDto<SpaceDto>(
                spaceDtos,
                criteria.PageNumber,
                criteria.PageSize,
                totalCount
            );
        }
    }
}