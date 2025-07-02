// Backend.Api/Modules/SpaceBooking/Application/Contracts/Dtos/SpaceWithDistanceDto.cs
using System;
using System.Collections.Generic;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos
{
    public class SpaceWithDistanceDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? Description { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public decimal PricePerHour { get; set; }
        public string Type { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public double DistanceKm { get; set; }
        public string? CoverImageUrl { get; set; }
        public decimal? AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public bool IsAvailable { get; set; }
    }
}
