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
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.CreatedByUserId)
                .IsRequired(false);

            builder.Property(x => x.UpdatedByUserId)
                .IsRequired(false);

            // Configure one-to-one relationship with Space
            builder.HasOne(x => x.Space)
                .WithOne(s => s.IcalSettings)
                .HasForeignKey<SpaceIcalSetting>(x => x.SpaceId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
