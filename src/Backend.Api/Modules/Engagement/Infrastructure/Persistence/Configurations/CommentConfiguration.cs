using Backend.Api.Modules.Engagement.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class CommentConfiguration : IEntityTypeConfiguration<Comment>
{
    public void Configure(EntityTypeBuilder<Comment> builder)
    {
        builder.ToTable("Comments", "engagement");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.UserId).IsRequired();
        builder.Property(c => c.ParentEntityType).IsRequired().HasConversion<string>().HasMaxLength(50);
        builder.Property(c => c.ParentEntityId).IsRequired();
        builder.HasIndex(c => new { c.ParentEntityType, c.ParentEntityId }).HasDatabaseName("IX_Comments_Parent"); // Index

        builder.Property(c => c.Content).IsRequired().HasMaxLength(2000);
        builder.Property(c => c.IsDeleted).IsRequired().HasDefaultValue(false);
        builder.HasQueryFilter(c => !c.IsDeleted);
        builder.Property(c => c.CreatedAt).IsRequired();

        builder.HasMany(c => c.Replies)
               .WithOne(r => r.ParentComment)
               .HasForeignKey(r => r.ParentCommentId)
               .OnDelete(DeleteBehavior.ClientSetNull); // Nếu ParentCommentId là nullable và muốn giữ replies
                                                        // Hoặc Restrict nếu ParentCommentId không nullable
                                                        // Hiện tại ParentCommentId là Guid?, ClientSetNull phù hợp.
        builder.HasIndex(c => c.ParentCommentId); // Index
    }
}