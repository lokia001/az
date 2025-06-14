// File: Backend.Api/Modules/SpaceBooking/Application/Contracts/Dtos/SpaceSearchCriteria.cs
using System;
using System.Collections.Generic;
using Backend.Api.Modules.SpaceBooking.Domain.Enums; // Cần cho SpaceType

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos
{
    public record SpaceSearchCriteria(
        string? Keyword,
        string? Address,
decimal? CenterLatitude, // << THÊM VÀO (cho tìm kiếm theo vị trí sau này)
    decimal? CenterLongitude, // << THÊM VÀO
    double? RadiusKm, // << THÊM VÀO (bán kính tìm kiếm)

        SpaceType? Type,
        int? MinCapacity,
        decimal? MaxPricePerHour,
        DateTime? AvailabilityStartDate,
        DateTime? AvailabilityEndDate,
        List<Guid>? AmenityIds, // Tìm space có chứa các amenity này (SystemAmenity IDs)
        int PageNumber = 1,
        int PageSize = 10
    );
}