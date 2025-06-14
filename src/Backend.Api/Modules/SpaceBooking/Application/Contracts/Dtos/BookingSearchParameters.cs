using Backend.Api.Modules.SpaceBooking.Domain.Enums;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos;

public class BookingSearchParameters
{
    // Thêm các thuộc tính tìm kiếm cần thiết, ví dụ:
    public BookingStatus? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; } // Added property for sort order ("asc" or "desc")
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}