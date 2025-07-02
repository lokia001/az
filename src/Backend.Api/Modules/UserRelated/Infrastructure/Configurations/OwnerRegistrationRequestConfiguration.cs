using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend.Api.Modules.UserRelated.Domain.Entities;

namespace Backend.Api.Modules.UserRelated.Infrastructure.Configurations
{
    public class OwnerRegistrationRequestConfiguration : IEntityTypeConfiguration<OwnerRegistrationRequest>
    {
        public void Configure(EntityTypeBuilder<OwnerRegistrationRequest> builder)
        {
            builder.ToTable("OwnerRegistrationRequests");

            builder.HasKey(orr => orr.Id);

            builder.Property(orr => orr.CompanyName)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(orr => orr.Description)
                .HasMaxLength(1000);

            builder.Property(orr => orr.BusinessPhone)
                .HasMaxLength(20);

            builder.Property(orr => orr.BusinessAddress)
                .HasMaxLength(500);

            builder.Property(orr => orr.Website)
                .HasMaxLength(200);

            builder.Property(orr => orr.BusinessLicense)
                .HasMaxLength(100);

            builder.Property(orr => orr.AdminNotes)
                .HasMaxLength(1000);

            builder.Property(orr => orr.RejectionReason)
                .HasMaxLength(500);

            builder.Property(orr => orr.Status)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(orr => orr.CreatedAt)
                .IsRequired();

            // Foreign Key Relationships
            builder.HasOne(orr => orr.User)
                .WithMany() // A user can have multiple requests (though typically only one pending)
                .HasForeignKey(orr => orr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(orr => orr.ProcessedByAdmin)
                .WithMany()
                .HasForeignKey(orr => orr.ProcessedBy)
                .OnDelete(DeleteBehavior.SetNull);

            // Indexes for common queries
            builder.HasIndex(orr => orr.UserId)
                .HasDatabaseName("IX_OwnerRegistrationRequests_UserId");

            builder.HasIndex(orr => orr.Status)
                .HasDatabaseName("IX_OwnerRegistrationRequests_Status");

            builder.HasIndex(orr => orr.CreatedAt)
                .HasDatabaseName("IX_OwnerRegistrationRequests_CreatedAt");

            // Unique constraint: Only one pending request per user
            builder.HasIndex(orr => new { orr.UserId, orr.Status })
                .HasDatabaseName("IX_OwnerRegistrationRequests_UserId_Status_Unique")
                .HasFilter($"[Status] = {(int)Domain.Enums.OwnerRegistrationStatus.Pending}")
                .IsUnique();
        }
    }
}
