// File: Backend.Api/Modules/Engagement/Application/Contracts/Dtos/ReviewDtos.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Modules.Engagement.Application.Contracts.Dtos
{
    public class ReviewDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; } // ID của người viết review
        public string? UserName { get; set; } // Thêm property để hiển thị tên người review
        // public string? UserAvatarUrl { get; set; } // Sẽ không làm giàu ở đây
        public Guid SpaceId { get; set; } // ID của Space được review
        // public string? SpaceName { get; set; } // Sẽ không làm giàu ở đây
        public Guid? BookingId { get; set; } // ID của Booking liên quan (nếu có)
        public int Rating { get; set; }
        public string? CommentText { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsVerifiedOwnerReply { get; set; } // Nếu có chức năng chủ space phản hồi

        public ReviewDto() // Constructor không tham số
        {
            CommentText = string.Empty; // Khởi tạo để tránh null nếu không được set
        }
    }

    public class CreateReviewRequest
    {
        [Required]
        public Guid SpaceId { get; set; }

        public Guid? BookingId { get; set; } // Tùy chọn, nhưng nên có để liên kết review với một trải nghiệm cụ thể

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int Rating { get; set; }

        [StringLength(2000, ErrorMessage = "Comment text cannot exceed 2000 characters.")]
        public string? CommentText { get; set; }
        // UserId sẽ được lấy từ user đang đăng nhập
    }

    public class UpdateReviewRequest
    {
        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int Rating { get; set; }

        [StringLength(2000, ErrorMessage = "Comment text cannot exceed 2000 characters.")]
        public string? CommentText { get; set; }
        // UserId (người sửa) và ReviewId sẽ được lấy từ context/route
    }

    // DTO cho tiêu chí tìm kiếm Review (ví dụ)
    public class ReviewSearchCriteriaDto
    {
        public Guid? SpaceId { get; set; }
        public Guid? UserId { get; set; }
        public int? MinRating { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}