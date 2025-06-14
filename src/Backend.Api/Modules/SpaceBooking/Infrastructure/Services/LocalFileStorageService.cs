// File: Backend.Api/Modules/SpaceBooking/Infrastructure/Services/LocalFileStorageService.cs
using System;
using System.IO;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Infrastructure;
using Microsoft.AspNetCore.Hosting; // Cho IWebHostEnvironment
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Services
{
    public class LocalFileStorageService : IFileStorageService
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<LocalFileStorageService> _logger;
        private readonly string _baseStorageFolderName = "uploads"; // Thư mục gốc trong wwwroot để lưu file

        public LocalFileStorageService(IWebHostEnvironment env, ILogger<LocalFileStorageService> logger)
        {
            _env = env;
            _logger = logger;
        }

        // File: Backend.Api/Modules/SpaceBooking/Infrastructure/Services/LocalFileStorageService.cs

        public async Task<string> SaveFileAsync(IFormFile file, string subFolder // subFolder ví dụ: "spaces/guid-của-space/images"
            )
        {
            if (file == null || file.Length == 0)
            {
                _logger.LogWarning("Attempted to save a null or empty file.");
                throw new ArgumentException("File is empty or null.", nameof(file));
            }

            var webRootPath = _env.WebRootPath;
            if (string.IsNullOrEmpty(webRootPath))
            {
                _logger.LogError("WebRootPath is not configured or wwwroot folder is missing.");
                throw new InvalidOperationException("WebRootPath is not configured. Ensure 'wwwroot' folder exists and app.UseStaticFiles() is configured if needed for serving.");
            }

            // Tách subFolder thành các phần riêng lẻ nếu nó chứa dấu phân cách
            // Ví dụ: subFolder = "spaces/guid-của-space/images"
            // Path.Combine sẽ tự xử lý dấu / hoặc \ cho đúng HĐH
            var fullTargetDirectory = Path.Combine(webRootPath, _baseStorageFolderName); // Ví dụ: wwwroot/uploads

            // Nếu subFolder có chứa các thư mục con, nối chúng vào
            if (!string.IsNullOrWhiteSpace(subFolder))
            {
                // Thay thế dấu / bằng dấu phân cách chuẩn của HĐH để Path.Combine hoạt động tốt hơn
                // Hoặc để Path.Combine tự xử lý. Tuy nhiên, việc tách ra có thể an toàn hơn.
                // string[] subFolderParts = subFolder.Split(new[] { '/', '\\' }, StringSplitOptions.RemoveEmptyEntries);
                // foreach (string part in subFolderParts)
                // {
                //     fullTargetDirectory = Path.Combine(fullTargetDirectory, part);
                // }
                // Cách đơn giản hơn là để Path.Combine xử lý:
                fullTargetDirectory = Path.Combine(fullTargetDirectory, subFolder.Replace('/', Path.DirectorySeparatorChar).Replace('\\', Path.DirectorySeparatorChar));
            }


            if (!Directory.Exists(fullTargetDirectory))
            {
                _logger.LogInformation("Creating directory: {DirectoryPath}", fullTargetDirectory);
                Directory.CreateDirectory(fullTargetDirectory);
            }

            var fileExtension = Path.GetExtension(file.FileName);
            // Đảm bảo fileExtension không rỗng và có dấu chấm, nếu không thì không thêm vào tên file
            if (string.IsNullOrEmpty(fileExtension) && !string.IsNullOrEmpty(file.FileName) && file.FileName.Contains("."))
            {
                // Cố gắng lấy extension nếu FileName có dạng name.ext nhưng Path.GetExtension không lấy được (hiếm)
                fileExtension = "." + file.FileName.Split('.').LastOrDefault();
            }
            else if (string.IsNullOrEmpty(fileExtension))
            {
                fileExtension = string.Empty; // Không có extension rõ ràng
            }


            var uniqueFileName = Guid.NewGuid().ToString() + fileExtension;
            var fullFilePath = Path.Combine(fullTargetDirectory, uniqueFileName);

            _logger.LogInformation("Attempting to save file to: {FilePath}", fullFilePath);

            try
            {
                using (var stream = new FileStream(fullFilePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                _logger.LogInformation("File saved successfully: {FilePath}", fullFilePath);

                // Trả về URL tương đối, đảm bảo dùng dấu /
                var relativePathForUrl = Path.Combine(_baseStorageFolderName, subFolder, uniqueFileName).Replace("\\", "/");
                return $"/{relativePathForUrl.TrimStart('/')}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving file {FileName} to {FilePath}", file.FileName, fullFilePath);
                throw;
            }
        }

        public Task DeleteFileAsync(string relativeFilePath)
        {
            if (string.IsNullOrWhiteSpace(relativeFilePath))
            {
                _logger.LogWarning("Attempted to delete file with null or empty path.");
                return Task.CompletedTask;
            }

            // Chuyển đổi URL tương đối (ví dụ: /uploads/...) thành đường dẫn vật lý
            // Bỏ dấu / ở đầu nếu có
            var filePathToDelete = relativeFilePath.TrimStart('/');
            var fullPath = Path.Combine(_env.WebRootPath, filePathToDelete);

            try
            {
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    _logger.LogInformation("File deleted successfully: {FilePath}", fullPath);
                }
                else
                {
                    _logger.LogWarning("Attempted to delete non-existent file: {FilePath}", fullPath);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file: {FilePath}", fullPath);
                // Quyết định có throw lỗi hay không. Thường thì nếu xóa file thất bại, có thể chỉ log lỗi.
            }
            return Task.CompletedTask;
        }
    }
}