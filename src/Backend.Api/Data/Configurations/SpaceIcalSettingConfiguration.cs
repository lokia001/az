using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Data.Configurations
{
    public class SpaceIcalSettingConfiguration : IEntityTypeConfiguration<SpaceIcalSetting>
    {
        public void Configure(EntityTypeBuilder<SpaceIcalSetting> builder)
        {
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).ValueGeneratedOnAdd();

            builder.HasOne(e => e.Space)
                  .WithOne(s => s.IcalSettings)
                  .HasForeignKey<SpaceIcalSetting>(e => e.SpaceId)
                  .OnDelete(DeleteBehavior.Cascade);

            builder.Property(e => e.ImportIcalUrlsJson).HasMaxLength(10000);
            builder.Property(e => e.ExportIcalUrl).HasMaxLength(1000);
            builder.Property(e => e.LastSyncError).HasMaxLength(4000);
            builder.Property(e => e.CreatedBy).HasMaxLength(100);
            builder.Property(e => e.UpdatedBy).HasMaxLength(100);

            // Ensure these are always set
            builder.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            builder.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
}
