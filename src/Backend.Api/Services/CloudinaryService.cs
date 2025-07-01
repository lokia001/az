using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Services
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;
        private readonly ILogger<CloudinaryService> _logger;

        public CloudinaryService(IConfiguration configuration, ILogger<CloudinaryService> logger)
        {
            _logger = logger;
            
            var cloudName = configuration["Cloudinary:CloudName"];
            var apiKey = configuration["Cloudinary:ApiKey"];
            var apiSecret = configuration["Cloudinary:ApiSecret"];

            if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
            {
                throw new InvalidOperationException("Cloudinary configuration is missing. Please check CloudName, ApiKey, and ApiSecret in appsettings.json");
            }

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true; // Always use HTTPS
        }

        public async Task<CloudinaryUploadResult?> UploadImageAsync(IFormFile imageFile, string folderName = "spaces")
        {
            if (imageFile == null || imageFile.Length == 0)
            {
                _logger.LogWarning("UploadImageAsync called with no image file.");
                return null;
            }

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif" };
            if (!allowedTypes.Contains(imageFile.ContentType.ToLower()))
            {
                _logger.LogWarning("Invalid file type: {ContentType}", imageFile.ContentType);
                return null;
            }

            // Validate file size (10MB max for free tier)
            const long maxFileSize = 10 * 1024 * 1024; // 10MB
            if (imageFile.Length > maxFileSize)
            {
                _logger.LogWarning("File size exceeds limit: {Size} bytes", imageFile.Length);
                return null;
            }

            try
            {
                using var stream = imageFile.OpenReadStream();
                
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(imageFile.FileName, stream),
                    Folder = folderName, // Organize images in folders
                    UseFilename = false, // Let Cloudinary generate unique public_id
                    UniqueFilename = true,
                    Overwrite = false,
                    // Optimize for web delivery
                    Transformation = new Transformation()
                        .Quality("auto") // Auto quality optimization
                        .FetchFormat("auto"), // Auto format optimization (WebP when supported)
                    // Add tags for better organization
                    Tags = "webapp,space-images"
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    _logger.LogInformation("Image uploaded successfully. PublicId: {PublicId}, SecureUrl: {SecureUrl}", 
                        uploadResult.PublicId, uploadResult.SecureUrl);

                    return new CloudinaryUploadResult
                    {
                        PublicId = uploadResult.PublicId,
                        SecureUrl = uploadResult.SecureUrl.ToString(),
                        Url = uploadResult.Url.ToString(),
                        Width = uploadResult.Width,
                        Height = uploadResult.Height,
                        Format = uploadResult.Format,
                        Bytes = uploadResult.Bytes
                    };
                }
                else
                {
                    _logger.LogError("Cloudinary upload failed. Status: {Status}, Error: {Error}", 
                        uploadResult.StatusCode, uploadResult.Error?.Message);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception during Cloudinary upload.");
                return null;
            }
        }

        public async Task<bool> DeleteImageAsync(string publicId)
        {
            if (string.IsNullOrEmpty(publicId))
            {
                _logger.LogWarning("DeleteImageAsync called with empty publicId.");
                return false;
            }

            try
            {
                var deleteParams = new DeletionParams(publicId);
                var result = await _cloudinary.DestroyAsync(deleteParams);

                if (result.StatusCode == System.Net.HttpStatusCode.OK && result.Result == "ok")
                {
                    _logger.LogInformation("Image deleted successfully. PublicId: {PublicId}", publicId);
                    return true;
                }
                else
                {
                    _logger.LogWarning("Failed to delete image. PublicId: {PublicId}, Result: {Result}", 
                        publicId, result.Result);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception during Cloudinary delete. PublicId: {PublicId}", publicId);
                return false;
            }
        }

        public string GetOptimizedImageUrl(string publicId, int? width = null, int? height = null, string? crop = null)
        {
            if (string.IsNullOrEmpty(publicId))
                return string.Empty;

            try
            {
                var transformation = new Transformation()
                    .Quality("auto")
                    .FetchFormat("auto");

                if (width.HasValue)
                    transformation = transformation.Width(width.Value);

                if (height.HasValue)
                    transformation = transformation.Height(height.Value);

                if (!string.IsNullOrEmpty(crop))
                    transformation = transformation.Crop(crop);

                var url = _cloudinary.Api.UrlImgUp.Transform(transformation).BuildUrl(publicId);
                return url;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating optimized URL for PublicId: {PublicId}", publicId);
                return string.Empty;
            }
        }
    }
}
