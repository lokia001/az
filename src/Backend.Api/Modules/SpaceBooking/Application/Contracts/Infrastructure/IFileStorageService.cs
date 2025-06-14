// File: Backend.Api/Modules/SpaceBooking/Application/Contracts/Infrastructure/IFileStorageService.cs
using Microsoft.AspNetCore.Http; // Cho IFormFile
using System.Threading.Tasks;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Infrastructure
{
    public interface IFileStorageService
    {
        /// <summary>
        /// Saves the uploaded file to a specified subfolder and returns the relative path or URL.
        /// </summary>
        /// <param name="file">The IFormFile to save.</param>
        /// <param name="subFolder">The subfolder path (e.g., "spaces/images" or "users/avatars").</param>
        /// <returns>The relative path or URL of the saved file.</returns>
        Task<string> SaveFileAsync(IFormFile file, string subFolder);

        /// <summary>
        /// Deletes a file given its relative path.
        /// </summary>
        /// <param name="relativeFilePath">The relative path of the file to delete (e.g., "/uploads/spaces/images/filename.jpg").</param>
        Task DeleteFileAsync(string relativeFilePath);
    }
}