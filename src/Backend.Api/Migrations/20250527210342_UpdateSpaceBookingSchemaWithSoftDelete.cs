using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSpaceBookingSchemaWithSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "space_booking",
                table: "Spaces",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "space_booking",
                table: "SpaceImages",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "space_booking",
                table: "SpaceCustomServices",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "space_booking",
                table: "SpaceCustomAmenities",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "space_booking",
                table: "Spaces");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "space_booking",
                table: "SpaceImages");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "space_booking",
                table: "SpaceCustomServices");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "space_booking",
                table: "SpaceCustomAmenities");
        }
    }
}
