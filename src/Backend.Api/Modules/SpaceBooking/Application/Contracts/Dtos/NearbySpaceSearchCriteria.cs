// Backend.Api/Modules/SpaceBooking/Application/Contracts/Dtos/NearbySpaceSearchCriteria.cs
using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos
{
    public class NearbySpaceSearchCriteria
    {
        [Required]
        [Range(-90, 90)]
        public double UserLatitude { get; set; }

        [Required]
        [Range(-180, 180)]
        public double UserLongitude { get; set; }

        [Range(0.1, 50)]
        public double MaxDistanceKm { get; set; } = 5.0;

        [Range(1, 100)]
        public int MaxResults { get; set; } = 20;
    }
}
