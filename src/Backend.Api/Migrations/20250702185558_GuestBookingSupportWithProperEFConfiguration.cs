using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class GuestBookingSupportWithProperEFConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                schema: "space_booking",
                table: "Bookings",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "TEXT");

            migrationBuilder.AddColumn<string>(
                name: "GuestEmail",
                schema: "space_booking",
                table: "Bookings",
                type: "TEXT",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GuestName",
                schema: "space_booking",
                table: "Bookings",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GuestPhone",
                schema: "space_booking",
                table: "Bookings",
                type: "TEXT",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsGuestBooking",
                schema: "space_booking",
                table: "Bookings",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GuestEmail",
                schema: "space_booking",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "GuestName",
                schema: "space_booking",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "GuestPhone",
                schema: "space_booking",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "IsGuestBooking",
                schema: "space_booking",
                table: "Bookings");

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                schema: "space_booking",
                table: "Bookings",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "TEXT",
                oldNullable: true);
        }
    }
}
