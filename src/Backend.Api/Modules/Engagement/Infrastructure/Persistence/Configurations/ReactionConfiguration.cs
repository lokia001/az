using Backend.Api.Modules.Engagement.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ReactionConfiguration : IEntityTypeConfiguration<Reaction>
{
    public void Configure(EntityTypeBuilder<Reaction> builder)
    {
        builder.ToTable("Reactions", "engagement");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.UserId).IsRequired();
        builder.Property(r => r.TargetEntityType).IsRequired().HasConversion<string>().HasMaxLength(50);
        builder.Property(r => r.TargetEntityId).IsRequired();
        builder.Property(r => r.Type).IsRequired().HasConversion<string>().HasMaxLength(50);
        builder.Property(r => r.CreatedAt).IsRequired();

        // Unique constraint: một user, một loại reaction cho một target
        builder.HasIndex(r => new { r.UserId, r.TargetEntityType, r.TargetEntityId, r.Type })
               .IsUnique()
               .HasDatabaseName("IX_Reactions_UserTargetType");

        // Index để query nhanh tất cả reactions của một target
        builder.HasIndex(r => new { r.TargetEntityType, r.TargetEntityId })
               .HasDatabaseName("IX_Reactions_Target");
    }
}