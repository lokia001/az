// File: (Ví dụ) Backend.Api/SharedKernel/Dtos/PagedResultDto.cs
// Hoặc Backend.Api/Modules/SpaceBooking/Application/Contracts/Dtos/PagedResultDto.cs
namespace Backend.Api.SharedKernel.Dtos // Hoặc namespace DTO của module
{
    public record PagedResultDto<T>(
        IEnumerable<T> Items,
        int PageNumber,
        int PageSize,
        int TotalCount,
        int TotalPages
    ) where T : class
    {
        public PagedResultDto(IEnumerable<T> items, int pageNumber, int pageSize, int totalCount)
            : this(items, pageNumber, pageSize, totalCount, (totalCount == 0 || pageSize == 0) ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize))
        {
        }
    }
}