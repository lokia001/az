using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddOwnerRegistrationRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OwnerRegistrationRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CompanyName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    BusinessPhone = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    BusinessAddress = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Website = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    BusinessLicense = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ProcessedBy = table.Column<Guid>(type: "TEXT", nullable: true),
                    ProcessedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AdminNotes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    RejectionReason = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OwnerRegistrationRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OwnerRegistrationRequests_Users_ProcessedBy",
                        column: x => x.ProcessedBy,
                        principalSchema: "user_related",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_OwnerRegistrationRequests_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "user_related",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OwnerRegistrationRequests_CreatedAt",
                table: "OwnerRegistrationRequests",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_OwnerRegistrationRequests_ProcessedBy",
                table: "OwnerRegistrationRequests",
                column: "ProcessedBy");

            migrationBuilder.CreateIndex(
                name: "IX_OwnerRegistrationRequests_Status",
                table: "OwnerRegistrationRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_OwnerRegistrationRequests_UserId",
                table: "OwnerRegistrationRequests",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_OwnerRegistrationRequests_UserId_Status_Unique",
                table: "OwnerRegistrationRequests",
                columns: new[] { "UserId", "Status" },
                unique: true,
                filter: "[Status] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OwnerRegistrationRequests");
        }
    }
}
