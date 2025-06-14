// File: Backend.Api/Modules/UserRelated/Domain/Enums/UserRole.cs
namespace Backend.Api.Modules.UserRelated.Domain.Enums
{
    public enum UserRole
    {
        User,       // Người thuê
        Owner,      // Chủ không gian
        SysAdmin    // Quản trị viên hệ thống
        // Có thể thêm Admin, Moderator sau nếu CommunityContent module cần
    }
}

// File: Backend.Api/Modules/UserRelated/Domain/Enums/UserGender.cs
namespace Backend.Api.Modules.UserRelated.Domain.Enums
{
    public enum UserGender
    {
        Male,
        Female,
        Other,
        Unknown // Mặc định
    }
}