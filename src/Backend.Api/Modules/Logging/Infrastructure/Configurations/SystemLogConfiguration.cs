using Backend.Api.Modules.Logging.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Modules.Logging.Infrastructure.Configurations
{
    public class SystemLogConfiguration : IEntityTypeConfiguration<SystemLog>
    {
        public void Configure(EntityTypeBuilder<SystemLog> builder)
        {
            // Table name
            builder.ToTable("SystemLogs");

            // Primary key
            builder.HasKey(x => x.Id);

            // Properties
            builder.Property(x => x.Id)
                .IsRequired()
                .HasMaxLength(36); // String GUID length

            builder.Property(x => x.Timestamp)
                .IsRequired()
                .HasDefaultValueSql("datetime('now')");

            builder.Property(x => x.Level)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(x => x.Source)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Message)
                .IsRequired()
                .HasMaxLength(1000);

            builder.Property(x => x.UserId)
                .HasMaxLength(450); // No FK constraint - modular design

            builder.Property(x => x.RelatedEntityId)
                .HasMaxLength(450); // No FK constraint - modular design

            builder.Property(x => x.ErrorDetails)
                .HasColumnType("TEXT"); // For long error messages

            builder.Property(x => x.IpAddress)
                .HasMaxLength(100);

            builder.Property(x => x.UserAgent)
                .HasMaxLength(500);

            // Indexes for better query performance
            builder.HasIndex(x => x.Timestamp)
                .HasDatabaseName("IX_SystemLogs_Timestamp");

            builder.HasIndex(x => x.Level)
                .HasDatabaseName("IX_SystemLogs_Level");

            builder.HasIndex(x => new { x.Level, x.Timestamp })
                .HasDatabaseName("IX_SystemLogs_Level_Timestamp");

            builder.HasIndex(x => x.UserId)
                .HasDatabaseName("IX_SystemLogs_UserId");
        }
    }
}
