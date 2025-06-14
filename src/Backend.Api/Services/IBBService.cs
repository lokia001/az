// File: Backend.Api/Services/IBBService.cs
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration; // Để đọc API Key từ appsettings
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json; // System.Text.Json cho .NET Core 3.1+
using System.Threading.Tasks;

namespace Backend.Api.Services
{
    public class IBBService : IIBBService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<IBBService> _logger;
        private readonly string? _imgbbApiKey;

        public IBBService(HttpClient httpClient, IConfiguration configuration, ILogger<IBBService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            _imgbbApiKey = _configuration["ImgBBApiKey"]; // Đọc API Key từ appsettings.json

            if (string.IsNullOrEmpty(_imgbbApiKey))
            {
                _logger.LogError("ImgBB API Key is not configured in appsettings.json (ImgBBApiKey).");
                // throw new InvalidOperationException("ImgBB API Key is not configured.");
            }
        }

        public async Task<ImgBBUploadResponse?> UploadImageAsync(IFormFile imageFile)
        {
            if (string.IsNullOrEmpty(_imgbbApiKey))
            {
                _logger.LogError("ImgBB API Key is missing. Cannot upload image.");
                return null;
            }

            if (imageFile == null || imageFile.Length == 0)
            {
                _logger.LogWarning("UploadImageAsync called with no image file.");
                return null;
            }

            try
            {
                using var content = new MultipartFormDataContent();
                using var memoryStream = new MemoryStream();
                await imageFile.CopyToAsync(memoryStream);
                memoryStream.Position = 0; // Reset stream position

                // ImgBB yêu cầu file được gửi dưới dạng base64 string cho key "image"
                var imageBytes = memoryStream.ToArray();
                var base64Image = Convert.ToBase64String(imageBytes);

                content.Add(new StringContent(base64Image), "image");
                // Optional: Thêm tên file nếu muốn ImgBB lưu với tên đó
                // content.Add(new StringContent(Path.GetFileNameWithoutExtension(imageFile.FileName)), "name");

                // API URL của ImgBB
                var apiUrl = $"https://api.imgbb.com/1/upload?key={_imgbbApiKey}";

                var response = await _httpClient.PostAsync(apiUrl, content);

                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation("ImgBB upload response: {Response}", responseString);
                    var imgBbResponse = JsonSerializer.Deserialize<ImgBBUploadResponse>(responseString,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }); // Quan trọng: ImgBB trả về snake_case

                    if (imgBbResponse != null && imgBbResponse.Success && imgBbResponse.Data != null)
                    {
                        return imgBbResponse;
                    }
                    else
                    {
                        _logger.LogError("ImgBB upload reported failure or missing data. Status: {Status}, Response: {Response}", imgBbResponse?.Status, responseString);
                        return null;
                    }
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Failed to upload image to ImgBB. Status: {StatusCode}, Response: {ErrorResponse}", response.StatusCode, errorContent);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception during ImgBB upload.");
                return null;
            }
        }

        public async Task<bool> DeleteImageAsync(string deleteUrl)
        {
            // QUAN TRỌNG: API v1 của ImgBB CÓ VẺ KHÔNG HỖ TRỢ XÓA QUA API BẰNG delete_url này.
            // delete_url họ trả về dường như là link để người dùng tự vào xóa.
            // Phương thức này chỉ là placeholder.
            _logger.LogWarning("DeleteImageAsync is a placeholder. ImgBB API v1 may not support API-based deletion with the provided delete_url. Delete URL: {DeleteUrl}", deleteUrl);

            if (string.IsNullOrEmpty(deleteUrl))
            {
                return false;
            }
            // Nếu ImgBB có API xóa thực sự, bạn sẽ implement logic gọi API đó ở đây.
            // Ví dụ:
            // try
            // {
            //     var response = await _httpClient.PostAsync(deleteUrl, null); // Hoặc GET, tùy API
            //     return response.IsSuccessStatusCode;
            // }
            // catch (Exception ex)
            // {
            //     _logger.LogError(ex, "Exception during ImgBB (simulated) delete for URL: {DeleteUrl}", deleteUrl);
            //     return false;
            // }
            await Task.CompletedTask; // Để tránh warning async
            return false; // Giả định không xóa được qua API
        }
    }
}