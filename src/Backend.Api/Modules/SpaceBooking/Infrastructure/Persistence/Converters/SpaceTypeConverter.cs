using System;
using Backend.Api.Modules.SpaceBooking.Domain.Enums;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Converters
{
    public class SpaceTypeConverter : ValueConverter<SpaceType, string>
    {
        public SpaceTypeConverter() 
            : base(
                v => v.ToString(),
                v => ParseSpaceType(v))
        {
        }

        private static SpaceType ParseSpaceType(string value)
        {
            if (string.IsNullOrEmpty(value))
                return SpaceType.Individual;

            // Remove any whitespace and try to parse
            value = value.Replace(" ", "").Trim();
            
            if (Enum.TryParse<SpaceType>(value, true, out SpaceType result))
                return result;

            // If parse fails, return default
            return SpaceType.Individual;
        }
    }
}
