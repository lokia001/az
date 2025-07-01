using Microsoft.AspNetCore.Http;

namespace Backend.Api.Services
{
    public interface ICloudinaryService
    {
        Task<CloudinaryUploadResult?> UploadImageAsync(IFormFile imageFile, string folderName = "spaces");
        Task<bool> DeleteImageAsync(string publicId);
        string GetOptimizedImageUrl(string publicId, int? width = null, int? height = null, string? crop = null);
    }

    public class CloudinaryUploadResult
    {
        public string PublicId { get; set; } = string.Empty;
        public string SecureUrl { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public int Width { get; set; }
        public int Height { get; set; }
        public string Format { get; set; } = string.Empty;
        public long Bytes { get; set; }
    }
}
