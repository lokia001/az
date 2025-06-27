using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSpaceIcalSettingsAndSyncStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SpaceIcalSettings_SpaceId",
                table: "SpaceIcalSettings");

            migrationBuilder.RenameTable(
                name: "Spaces",
                schema: "space_booking",
                newName: "Spaces");

            migrationBuilder.CreateIndex(
                name: "IX_SpaceIcalSettings_SpaceId",
                table: "SpaceIcalSettings",
                column: "SpaceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SpaceIcalSettings_SpaceId",
                table: "SpaceIcalSettings");

            migrationBuilder.RenameTable(
                name: "Spaces",
                newName: "Spaces",
                newSchema: "space_booking");

            migrationBuilder.CreateIndex(
                name: "IX_SpaceIcalSettings_SpaceId",
                table: "SpaceIcalSettings",
                column: "SpaceId",
                unique: true);
        }
    }
}
