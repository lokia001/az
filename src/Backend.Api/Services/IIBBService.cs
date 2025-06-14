// File: Backend.Api/Services/IIBBService.cs (Ví dụ)
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace Backend.Api.Services // Hoặc namespace module của bạn
{
    public class ImgBBResponseData // DTO cho response từ ImgBB
    {
        public string? Id { get; set; }
        public string? Title { get; set; }
        public string? Url_viewer { get; set; } // Link xem ảnh
        public string? Url { get; set; }        // Link ảnh trực tiếp
        public string? Display_url { get; set; } // Link ảnh trực tiếp (thường giống Url)
        public int? Size { get; set; }
        public string? Time { get; set; }
        public string? Expiration { get; set; }
        public ImgBBImageData? Image { get; set; }
        public ImgBBImageData? Thumb { get; set; }
        public ImgBBImageData? Medium { get; set; } // Có thể có hoặc không
        public string? Delete_url { get; set; } // ImgBB API v1 có trả về nhưng không đảm bảo dùng được để xóa qua API
    }

    public class ImgBBImageData
    {
        public string? Filename { get; set; }
        public string? Name { get; set; }
        public string? Mime { get; set; }
        public string? Extension { get; set; }
        public string? Url { get; set; }
    }


    public class ImgBBUploadResponse
    {
        public ImgBBResponseData? Data { get; set; }
        public bool Success { get; set; }
        public int Status { get; set; }
    }


    public interface IIBBService
    {
        /// <summary>
        /// Uploads an image to ImgBB.
        /// </summary>
        /// <param name="imageFile">The image file to upload.</param>
        /// <returns>The ImgBBUploadResponse containing URLs and other data from ImgBB, or null if upload failed.</returns>
        Task<ImgBBUploadResponse?> UploadImageAsync(IFormFile imageFile);

        /// <summary>
        /// (Placeholder) Attempts to delete an image from ImgBB using a delete URL.
        /// NOTE: ImgBB API v1 might not support direct API deletion this way.
        /// </summary>
        /// <param name="deleteUrl">The delete URL provided by ImgBB (if any).</param>
        /// <returns>True if deletion was successful (or simulated), false otherwise.</returns>
        Task<bool> DeleteImageAsync(string deleteUrl);
    }
}