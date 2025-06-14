using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    public partial class UpdateEnumMappings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop existing Spaces table if it exists
            migrationBuilder.DropTable(
                name: "Spaces");

            // Recreate Spaces table with proper enum mappings
            migrationBuilder.CreateTable(
                name: "Spaces",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    Address = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false, defaultValue: "Individual"),
                    Status = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false, defaultValue: "Available"),
                    // ... other columns ...
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Spaces", x => x.Id);
                });

            // Add check constraint to ensure only valid enum values
            migrationBuilder.Sql(@"
                CREATE TRIGGER TR_Spaces_Type_Check
                BEFORE INSERT ON Spaces
                BEGIN
                    SELECT CASE
                        WHEN NEW.Type NOT IN ('Individual', 'Group', 'MeetingRoom', 'EntireOffice', 'Studio')
                        THEN RAISE(ABORT, 'Invalid space type')
                    END;
                END;
            ");

            migrationBuilder.Sql(@"
                CREATE TRIGGER TR_Spaces_Status_Check
                BEFORE INSERT ON Spaces
                BEGIN
                    SELECT CASE
                        WHEN NEW.Status NOT IN ('Available', 'Booked', 'Maintenance')
                        THEN RAISE(ABORT, 'Invalid space status')
                    END;
                END;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Spaces");
        }
    }
}
