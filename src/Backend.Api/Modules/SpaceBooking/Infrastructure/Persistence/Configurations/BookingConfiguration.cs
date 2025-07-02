// File: Backend.Api/Modules/SpaceBooking/Infrastructure/Persistence/Configurations/BookingConfiguration.cs
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Configurations
{
    public class BookingConfiguration : IEntityTypeConfiguration<Booking>
    {
        public void Configure(EntityTypeBuilder<Booking> builder)
        {
            builder.ToTable("Bookings", "space_booking");

            builder.HasKey(b => b.Id);

            builder.Property(b => b.TotalPrice)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(b => b.Status)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(b => b.NumberOfPeople)
                .IsRequired();

            builder.Property(b => b.BookingCode)
                .HasMaxLength(20);
            builder.HasIndex(b => b.BookingCode).IsUnique().HasFilter("[BookingCode] IS NOT NULL"); // Unique nếu không null

            builder.Property(b => b.NotesFromUser).HasMaxLength(500);
            builder.Property(b => b.NotesFromOwner).HasMaxLength(500);

            // UserId is nullable to support guest bookings
            builder.Property(b => b.UserId).IsRequired(false); // FK đến User (module khác) - nullable for guest bookings
            builder.Property(b => b.CreatedByUserId).IsRequired(); // Thường là owner UserId

            // Guest booking properties
            builder.Property(b => b.GuestName).HasMaxLength(100).IsRequired(false);
            builder.Property(b => b.GuestEmail).HasMaxLength(255).IsRequired(false);
            builder.Property(b => b.GuestPhone).HasMaxLength(20).IsRequired(false);
            builder.Property(b => b.IsGuestBooking).IsRequired().HasDefaultValue(false);

            // Mối quan hệ với Space (cùng module)
            builder.HasOne(b => b.Space)
                   .WithMany(s => s.Bookings)
                   .HasForeignKey(b => b.SpaceId)
                   .IsRequired()
                   .OnDelete(DeleteBehavior.Restrict); // Không cho xóa Space nếu còn Booking

            // Cấu hình soft delete (nếu muốn áp dụng global filter)
            builder.Property(b => b.IsDeleted).IsRequired().HasDefaultValue(false);


            builder.HasQueryFilter(b => !b.IsDeleted); // Áp dụng global filter
        }
    }
}