// Backend.Api/Modules/PaymentService/Entities/Payment.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Modules.PaymentService.Entities
{
    public enum PaymentMethod
    {
        CreditCard,
        Paypal,
        MoMo,
        BankTransfer,
        Cash,
        Other
    }

    public enum PaymentStatus
    {
        Pending,   // Giao dịch được khởi tạo, chờ thanh toán
        Processing,// Giao dịch đang được xử lý bởi gateway
        Completed, // Đã thanh toán thành công
        Failed,    // Giao dịch thất bại
        Refunded,  // Đã hoàn tiền toàn bộ
        PartialRefund // Đã hoàn tiền một phần
        // Add other statuses like Authorized, Captured depending on gateway flow
    }

    // Represents a payment transaction related to a Booking
    public class Payment
    {
        #region Properties

        [Key]
        public Guid Id { get; set; } // Primary Key

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; } // Amount of this specific payment transaction

        public PaymentMethod PaymentMethod { get; set; } // Method used for this payment

        public PaymentStatus PaymentStatus { get; set; } // Current status of this payment transaction

        #endregion

        #region Relationships

        // *** Relationship: Payment (Many) -> Booking (One) ***
        // A payment transaction belongs to a specific booking
        [Required]
        public Guid BookingId { get; set; } // FK to the Booking
        [ForeignKey("BookingId")]

        #endregion

        #region Timestamps

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Timestamp when the payment record was created (transaction initiated)

        public DateTime? PaidAt { get; set; } // Timestamp when the payment status became Completed (Nullable)

        public DateTime? UpdatedAt { get; set; } // Timestamp of last update to this payment record

        #endregion

        #region Transaction Details

        [StringLength(255)]
        public string? TransactionId { get; set; } // Unique ID provided by the payment gateway

        [StringLength(255)]
        public string? GatewayPaymentId { get; set; } // Optional: Sometimes gateway uses a different ID than TransactionId

        public string? GatewayResponse { get; set; } // Raw response or relevant details from the gateway

        #endregion

        #region Optional Polymorphic Relationship (Commented Out)

        // Optional: If Payment entity can apply to things other than Booking
        // public Guid? TargetEntityId { get; set; }
        // public string? TargetEntityType { get; set; } // (Polymorphic payment target)

        #endregion
    }
}