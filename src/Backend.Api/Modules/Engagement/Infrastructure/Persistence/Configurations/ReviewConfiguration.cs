using Backend.Api.Modules.Engagement.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("Reviews", "engagement");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.CommentText).HasMaxLength(2000);
        builder.Property(r => r.Rating).IsRequired();

        builder.Property(r => r.UserId).IsRequired();
        builder.HasIndex(r => r.UserId); // Index

        builder.Property(r => r.SpaceId).IsRequired();
        builder.HasIndex(r => r.SpaceId); // Index

        builder.HasIndex(r => r.BookingId); // Index cho BookingId (nếu thường xuyên query theo nó)

        builder.Property(r => r.IsVerifiedOwnerReply).IsRequired().HasDefaultValue(false);
        builder.Property(r => r.IsDeleted).IsRequired().HasDefaultValue(false);
        builder.HasQueryFilter(r => !r.IsDeleted);

        builder.Property(r => r.CreatedAt).IsRequired();
    }
}