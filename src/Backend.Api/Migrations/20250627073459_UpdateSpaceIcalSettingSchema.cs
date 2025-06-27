using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSpaceIcalSettingSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ActualNumberOfPeople",
                schema: "space_booking",
                table: "Bookings",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                schema: "space_booking",
                table: "Bookings",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CheckedInByUserId",
                schema: "space_booking",
                table: "Bookings",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CheckedOutByUserId",
                schema: "space_booking",
                table: "Bookings",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalCalendarEventId",
                schema: "space_booking",
                table: "Bookings",
                type: "TEXT",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalCalendarEventUrl",
                schema: "space_booking",
                table: "Bookings",
                type: "TEXT",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalIcalUid",
                schema: "space_booking",
                table: "Bookings",
                type: "TEXT",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalIcalUrl",
                schema: "space_booking",
                table: "Bookings",
                type: "TEXT",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsExternalBooking",
                schema: "space_booking",
                table: "Bookings",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSyncedAt",
                schema: "space_booking",
                table: "Bookings",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                schema: "space_booking",
                table: "Bookings",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SpaceIcalSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SpaceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    IcalUrl = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    ExportIcalUrl = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    ImportIcalUrlsJson = table.Column<string>(type: "TEXT", maxLength: 4000, nullable: false),
                    IsAutoSyncEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsSyncInProgress = table.Column<bool>(type: "INTEGER", nullable: false),
                    SyncIntervalMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    LastSyncTime = table.Column<DateTime>(type: "TEXT", nullable: true),
                    LastSyncAttempt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    LastSyncError = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    SyncStatus = table.Column<int>(type: "INTEGER", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    SpaceId1 = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpaceIcalSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SpaceIcalSettings_Spaces_SpaceId",
                        column: x => x.SpaceId,
                        principalSchema: "space_booking",
                        principalTable: "Spaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SpaceIcalSettings_Spaces_SpaceId1",
                        column: x => x.SpaceId1,
                        principalSchema: "space_booking",
                        principalTable: "Spaces",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SpaceIcalSettings_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalSchema: "user_related",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_SpaceIcalSettings_Users_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalSchema: "user_related",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SpaceIcalSettings_CreatedByUserId",
                table: "SpaceIcalSettings",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SpaceIcalSettings_SpaceId",
                table: "SpaceIcalSettings",
                column: "SpaceId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SpaceIcalSettings_SpaceId1",
                table: "SpaceIcalSettings",
                column: "SpaceId1",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SpaceIcalSettings_UpdatedByUserId",
                table: "SpaceIcalSettings",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SpaceIcalSettings");

            migrationBuilder.DropColumn(
                name: "ActualNumberOfPeople",
                schema: "space_booking",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CancellationReason",
                schema: "space_booking",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CheckedInByUserId",
                schema: "space_booking",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CheckedOutByUserId",
                schema: "space_booking",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ExternalCalendarEventId",
                schema: "space_booking",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ExternalCalendarEventUrl",
                schema: "space_booking",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ExternalIcalUid",
                schema: "space_booking",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ExternalIcalUrl",
                schema: "space_booking",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "IsExternalBooking",
                schema: "space_booking",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "LastSyncedAt",
                schema: "space_booking",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Notes",
                schema: "space_booking",
                table: "Bookings");
        }
    }
}
