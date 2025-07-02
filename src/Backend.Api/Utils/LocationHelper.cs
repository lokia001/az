// Backend.Api/Utils/LocationHelper.cs
using System;

namespace Backend.Api.Utils
{
    /// <summary>
    /// Utility class for location-based calculations
    /// </summary>
    public static class LocationHelper
    {
        /// <summary>
        /// Calculate distance between two points using Haversine formula
        /// </summary>
        /// <param name="lat1">Latitude of first point</param>
        /// <param name="lon1">Longitude of first point</param>
        /// <param name="lat2">Latitude of second point</param>
        /// <param name="lon2">Longitude of second point</param>
        /// <returns>Distance in kilometers</returns>
        public static double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2)
        {
            if (lat1 == lat2 && lon1 == lon2)
            {
                return 0;
            }

            const double R = 6371; // Earth's radius in kilometers

            var lat1Rad = ToRadians(lat1);
            var lat2Rad = ToRadians(lat2);
            var deltaLatRad = ToRadians(lat2 - lat1);
            var deltaLonRad = ToRadians(lon2 - lon1);

            var a = Math.Sin(deltaLatRad / 2) * Math.Sin(deltaLatRad / 2) +
                    Math.Cos(lat1Rad) * Math.Cos(lat2Rad) *
                    Math.Sin(deltaLonRad / 2) * Math.Sin(deltaLonRad / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c;
        }

        /// <summary>
        /// Convert degrees to radians
        /// </summary>
        private static double ToRadians(double degrees)
        {
            return degrees * (Math.PI / 180);
        }
    }
}
