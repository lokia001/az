using System.Threading.Tasks;

namespace Backend.Api.Data.Seeders
{
    public interface IDataSeeder
    {
        Task SeedAsync();
        int Order { get; } // For controlling seeding order
    }
}
