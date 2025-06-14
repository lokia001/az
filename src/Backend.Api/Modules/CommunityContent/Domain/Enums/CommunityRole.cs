// File: Backend.Api/Modules/CommunityContent/Domain/Enums/CommunityRole.cs
namespace Backend.Api.Modules.CommunityContent.Domain.Enums
{
    public enum CommunityRole
    {
        Member,    // Thành viên thường
        Moderator, // Người kiểm duyệt nội dung
        Admin      // Quản trị viên của Community (có thể sửa thông tin Community, quản lý member)
    }
}