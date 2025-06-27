using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Configurations
{
    public class SpaceIcalSettingConfiguration : IEntityTypeConfiguration<SpaceIcalSetting>
    {
        public void Configure(EntityTypeBuilder<SpaceIcalSetting> builder)
        {
            builder.HasKey(x => x.Id);
            
            builder.Property(x => x.SpaceId)
                .IsRequired();

            builder.Property(x => x.IcalUrl)
                .HasMaxLength(2000)
                .IsRequired();

            builder.Property(x => x.ExportIcalUrl)
                .HasMaxLength(2000);

            builder.Property(x => x.ImportIcalUrlsJson)
                .HasMaxLength(4000);

            builder.Property(x => x.LastSyncTime)
                .IsRequired(false);

            builder.Property(x => x.LastSyncAttempt)
                .IsRequired(false);

            builder.Property(x => x.LastSyncError)
                .HasMaxLength(1000);

            builder.Property(x => x.SyncStatus)
                .IsRequired();

            // Relationships
            builder.HasOne(x => x.Space)
                .WithMany()
                .HasForeignKey(x => x.SpaceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.CreatedBy)
                .WithMany()
                .HasForeignKey(x => x.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.UpdatedBy)
                .WithMany()
                .HasForeignKey(x => x.UpdatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
