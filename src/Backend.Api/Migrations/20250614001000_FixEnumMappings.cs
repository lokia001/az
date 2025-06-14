using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    public partial class FixEnumMappings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Spaces SET Type = 'Individual' 
                WHERE Type NOT IN ('Individual', 'Group', 'MeetingRoom', 'EntireOffice', 'Studio');
                
                UPDATE Spaces SET Status = 'Available' 
                WHERE Status NOT IN ('Available', 'Booked', 'Maintenance');
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
