// File: Backend.Api/Modules/Engagement/Domain/Enums/EngageableEntityType.cs
namespace Backend.Api.Modules.Engagement.Domain.Enums
{
    public enum EngageableEntityType
    {
        Space,      // Đánh giá, bình luận, reaction cho Space
        Post,       // Bình luận, reaction cho Post
        Review,     // Bình luận, reaction cho Review (ví dụ: trả lời review)
        Comment     // Bình luận, reaction cho Comment (ví dụ: trả lời comment)
        // Thêm các loại khác nếu hệ thống mở rộng
    }
}