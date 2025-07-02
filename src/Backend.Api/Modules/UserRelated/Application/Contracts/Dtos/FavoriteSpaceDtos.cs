// File: Backend.Api/Modules/UserRelated/Application/Contracts/Dtos/FavoriteSpaceDtos.cs
using System;

namespace Backend.Api.Modules.UserRelated.Application.Contracts.Dtos
{
    public class FavoriteSpaceDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid SpaceId { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Optional: Space details if needed
        public string? SpaceName { get; set; }
        public string? SpaceAddress { get; set; }
        public decimal? SpacePricePerHour { get; set; }
        public string? SpaceImageUrl { get; set; }
    }

    public class AddFavoriteSpaceRequest
    {
        public Guid SpaceId { get; set; }
    }

    public class RemoveFavoriteSpaceRequest
    {
        public Guid SpaceId { get; set; }
    }

    public class FavoriteSpaceStatusDto
    {
        public Guid SpaceId { get; set; }
        public bool IsFavorited { get; set; }
        public int TotalFavorites { get; set; }
    }
}
