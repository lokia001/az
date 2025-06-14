using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSpaceBookingModuleSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SpaceImages_Space_SpaceId",
                table: "SpaceImages");

            migrationBuilder.DropTable(
                name: "Booking");

            migrationBuilder.DropTable(
                name: "CommunityMember");

            migrationBuilder.DropTable(
                name: "Reaction");

            migrationBuilder.DropTable(
                name: "Report");

            migrationBuilder.DropTable(
                name: "ServicesSpaces");

            migrationBuilder.DropTable(
                name: "SpaceAmenity");

            migrationBuilder.DropTable(
                name: "CommunityPolicy");

            migrationBuilder.DropTable(
                name: "Comment");

            migrationBuilder.DropTable(
                name: "ServiceEntity");

            migrationBuilder.DropTable(
                name: "Amenity");

            migrationBuilder.DropTable(
                name: "Space");

            migrationBuilder.DropTable(
                name: "Post");

            migrationBuilder.DropTable(
                name: "Community");

            migrationBuilder.EnsureSchema(
                name: "space_booking");

            migrationBuilder.RenameTable(
                name: "SpaceImages",
                newName: "SpaceImages",
                newSchema: "space_booking");

            migrationBuilder.AlterColumn<int>(
                name: "DisplayOrder",
                schema: "space_booking",
                table: "SpaceImages",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Caption",
                schema: "space_booking",
                table: "SpaceImages",
                type: "TEXT",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "space_booking",
                table: "SpaceImages",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsCoverImage",
                schema: "space_booking",
                table: "SpaceImages",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "Spaces",
                schema: "space_booking",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    Address = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Capacity = table.Column<int>(type: "INTEGER", nullable: false),
                    PricePerHour = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PricePerDay = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OpenTime = table.Column<TimeSpan>(type: "TEXT", nullable: true),
                    CloseTime = table.Column<TimeSpan>(type: "TEXT", nullable: true),
                    MinBookingDurationMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    MaxBookingDurationMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    CancellationNoticeHours = table.Column<int>(type: "INTEGER", nullable: false),
                    CleaningDurationMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    BufferMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    AccessInstructions = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    HouseRules = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Slug = table.Column<string>(type: "TEXT", maxLength: 250, nullable: true),
                    OwnerId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastEditedByUserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Spaces", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemAmenities",
                schema: "space_booking",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    IconUrl = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemAmenities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemSpaceServices",
                schema: "space_booking",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSpaceServices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                schema: "space_booking",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SpaceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    StartTime = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndTime = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ActualCheckIn = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ActualCheckOut = table.Column<DateTime>(type: "TEXT", nullable: true),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    NumberOfPeople = table.Column<int>(type: "INTEGER", nullable: false),
                    BookingCode = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    NotesFromUser = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    NotesFromOwner = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_Spaces_SpaceId",
                        column: x => x.SpaceId,
                        principalSchema: "space_booking",
                        principalTable: "Spaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SpaceCustomAmenities",
                schema: "space_booking",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SpaceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpaceCustomAmenities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SpaceCustomAmenities_Spaces_SpaceId",
                        column: x => x.SpaceId,
                        principalSchema: "space_booking",
                        principalTable: "Spaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SpaceCustomServices",
                schema: "space_booking",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SpaceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    IsIncludedInBasePrice = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpaceCustomServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SpaceCustomServices_Spaces_SpaceId",
                        column: x => x.SpaceId,
                        principalSchema: "space_booking",
                        principalTable: "Spaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SpaceSystemAmenities",
                schema: "space_booking",
                columns: table => new
                {
                    SpaceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SystemAmenityId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpaceSystemAmenities", x => new { x.SpaceId, x.SystemAmenityId });
                    table.ForeignKey(
                        name: "FK_SpaceSystemAmenities_Spaces_SpaceId",
                        column: x => x.SpaceId,
                        principalSchema: "space_booking",
                        principalTable: "Spaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SpaceSystemAmenities_SystemAmenities_SystemAmenityId",
                        column: x => x.SystemAmenityId,
                        principalSchema: "space_booking",
                        principalTable: "SystemAmenities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SpaceSystemSpaceServices",
                schema: "space_booking",
                columns: table => new
                {
                    SpaceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SystemSpaceServiceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PriceOverride = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    IsIncludedInBasePrice = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpaceSystemSpaceServices", x => new { x.SpaceId, x.SystemSpaceServiceId });
                    table.ForeignKey(
                        name: "FK_SpaceSystemSpaceServices_Spaces_SpaceId",
                        column: x => x.SpaceId,
                        principalSchema: "space_booking",
                        principalTable: "Spaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SpaceSystemSpaceServices_SystemSpaceServices_SystemSpaceServiceId",
                        column: x => x.SystemSpaceServiceId,
                        principalSchema: "space_booking",
                        principalTable: "SystemSpaceServices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_BookingCode",
                schema: "space_booking",
                table: "Bookings",
                column: "BookingCode",
                unique: true,
                filter: "[BookingCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_SpaceId",
                schema: "space_booking",
                table: "Bookings",
                column: "SpaceId");

            migrationBuilder.CreateIndex(
                name: "IX_SpaceCustomAmenities_SpaceId",
                schema: "space_booking",
                table: "SpaceCustomAmenities",
                column: "SpaceId");

            migrationBuilder.CreateIndex(
                name: "IX_SpaceCustomServices_SpaceId",
                schema: "space_booking",
                table: "SpaceCustomServices",
                column: "SpaceId");

            migrationBuilder.CreateIndex(
                name: "IX_Spaces_Slug",
                schema: "space_booking",
                table: "Spaces",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SpaceSystemAmenities_SystemAmenityId",
                schema: "space_booking",
                table: "SpaceSystemAmenities",
                column: "SystemAmenityId");

            migrationBuilder.CreateIndex(
                name: "IX_SpaceSystemSpaceServices_SystemSpaceServiceId",
                schema: "space_booking",
                table: "SpaceSystemSpaceServices",
                column: "SystemSpaceServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_SystemAmenities_Name",
                schema: "space_booking",
                table: "SystemAmenities",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SystemSpaceServices_Name",
                schema: "space_booking",
                table: "SystemSpaceServices",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_SpaceImages_Spaces_SpaceId",
                schema: "space_booking",
                table: "SpaceImages",
                column: "SpaceId",
                principalSchema: "space_booking",
                principalTable: "Spaces",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SpaceImages_Spaces_SpaceId",
                schema: "space_booking",
                table: "SpaceImages");

            migrationBuilder.DropTable(
                name: "Bookings",
                schema: "space_booking");

            migrationBuilder.DropTable(
                name: "SpaceCustomAmenities",
                schema: "space_booking");

            migrationBuilder.DropTable(
                name: "SpaceCustomServices",
                schema: "space_booking");

            migrationBuilder.DropTable(
                name: "SpaceSystemAmenities",
                schema: "space_booking");

            migrationBuilder.DropTable(
                name: "SpaceSystemSpaceServices",
                schema: "space_booking");

            migrationBuilder.DropTable(
                name: "SystemAmenities",
                schema: "space_booking");

            migrationBuilder.DropTable(
                name: "Spaces",
                schema: "space_booking");

            migrationBuilder.DropTable(
                name: "SystemSpaceServices",
                schema: "space_booking");

            migrationBuilder.DropColumn(
                name: "Caption",
                schema: "space_booking",
                table: "SpaceImages");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "space_booking",
                table: "SpaceImages");

            migrationBuilder.DropColumn(
                name: "IsCoverImage",
                schema: "space_booking",
                table: "SpaceImages");

            migrationBuilder.RenameTable(
                name: "SpaceImages",
                schema: "space_booking",
                newName: "SpaceImages");

            migrationBuilder.AlterColumn<int>(
                name: "DisplayOrder",
                table: "SpaceImages",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.CreateTable(
                name: "Amenity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Amenity", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Community",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    AvatarUrl = table.Column<string>(type: "TEXT", nullable: true),
                    BannerUrl = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    IsArchived = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsPrivate = table.Column<bool>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Slug = table.Column<string>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Community", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ServiceEntity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    BasePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    IsAvailableAdHoc = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true),
                    IsPricedPerBooking = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    Unit = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceEntity", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Space",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Address = table.Column<string>(type: "TEXT", nullable: true),
                    BasePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BufferMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    CancellationNoticeHours = table.Column<int>(type: "INTEGER", nullable: false),
                    Capacity = table.Column<int>(type: "INTEGER", nullable: false),
                    CleaningDurationMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    CloseTime = table.Column<TimeSpan>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    DailyPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    HourlyPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LastEditedByUserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Latitude = table.Column<decimal>(type: "TEXT", nullable: false),
                    Longitude = table.Column<decimal>(type: "TEXT", nullable: false),
                    MaxBookingDurationMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    MinBookingDurationMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    OpenTime = table.Column<TimeSpan>(type: "TEXT", nullable: true),
                    OwnerProfileId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Space", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CommunityPolicy",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CommunityId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Content = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EffectiveDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Version = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommunityPolicy", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommunityPolicy_Community_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Community",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Post",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CommunityId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CommentCount = table.Column<int>(type: "INTEGER", nullable: false),
                    Content = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Downvotes = table.Column<int>(type: "INTEGER", nullable: false),
                    IsEdited = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsPinned = table.Column<bool>(type: "INTEGER", nullable: false),
                    Slug = table.Column<string>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Upvotes = table.Column<int>(type: "INTEGER", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Post", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Post_Community_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Community",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Booking",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SpaceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ActualCheckIn = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ActualCheckOut = table.Column<DateTime>(type: "TEXT", nullable: true),
                    BookingCode = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    BookingStatus = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndDateTime = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    Note = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    NumPeople = table.Column<int>(type: "INTEGER", nullable: false),
                    StartDateTime = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Booking", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Booking_Space_SpaceId",
                        column: x => x.SpaceId,
                        principalTable: "Space",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServicesSpaces",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ServiceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SpaceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    IsIncludedInBasePrice = table.Column<bool>(type: "INTEGER", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    PriceOverride = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServicesSpaces", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServicesSpaces_ServiceEntity_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "ServiceEntity",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServicesSpaces_Space_SpaceId",
                        column: x => x.SpaceId,
                        principalTable: "Space",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SpaceAmenity",
                columns: table => new
                {
                    SpaceAmenityId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AmenityId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SpaceId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpaceAmenity", x => x.SpaceAmenityId);
                    table.ForeignKey(
                        name: "FK_SpaceAmenity_Amenity_AmenityId",
                        column: x => x.AmenityId,
                        principalTable: "Amenity",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SpaceAmenity_Space_SpaceId",
                        column: x => x.SpaceId,
                        principalTable: "Space",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CommunityMember",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    AgreedPolicyId = table.Column<Guid>(type: "TEXT", nullable: true),
                    CommunityId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AgreedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    HasAgreedToRules = table.Column<bool>(type: "INTEGER", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Role = table.Column<int>(type: "INTEGER", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommunityMember", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommunityMember_CommunityPolicy_AgreedPolicyId",
                        column: x => x.AgreedPolicyId,
                        principalTable: "CommunityPolicy",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CommunityMember_Community_CommunityId",
                        column: x => x.CommunityId,
                        principalTable: "Community",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Comment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ParentCommentId = table.Column<Guid>(type: "TEXT", nullable: true),
                    PostId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Content = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Downvotes = table.Column<int>(type: "INTEGER", nullable: false),
                    IsEdited = table.Column<bool>(type: "INTEGER", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Upvotes = table.Column<int>(type: "INTEGER", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comment_Comment_ParentCommentId",
                        column: x => x.ParentCommentId,
                        principalTable: "Comment",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Comment_Post_PostId",
                        column: x => x.PostId,
                        principalTable: "Post",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reaction",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CommentId = table.Column<Guid>(type: "TEXT", nullable: true),
                    PostId = table.Column<Guid>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ReactionType = table.Column<int>(type: "INTEGER", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reaction", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reaction_Comment_CommentId",
                        column: x => x.CommentId,
                        principalTable: "Comment",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Reaction_Post_PostId",
                        column: x => x.PostId,
                        principalTable: "Post",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Report",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ReportedCommentId = table.Column<Guid>(type: "TEXT", nullable: true),
                    ReportedCommunityId = table.Column<Guid>(type: "TEXT", nullable: true),
                    ReportedPostId = table.Column<Guid>(type: "TEXT", nullable: true),
                    ReportedSpaceId = table.Column<Guid>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CustomReason = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Reason = table.Column<int>(type: "INTEGER", nullable: false),
                    ReportedUserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    ReporterUserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ResolutionNotes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ReviewedByUserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Report", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Report_Comment_ReportedCommentId",
                        column: x => x.ReportedCommentId,
                        principalTable: "Comment",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Report_Community_ReportedCommunityId",
                        column: x => x.ReportedCommunityId,
                        principalTable: "Community",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Report_Post_ReportedPostId",
                        column: x => x.ReportedPostId,
                        principalTable: "Post",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Report_Space_ReportedSpaceId",
                        column: x => x.ReportedSpaceId,
                        principalTable: "Space",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Booking_SpaceId",
                table: "Booking",
                column: "SpaceId");

            migrationBuilder.CreateIndex(
                name: "IX_Comment_ParentCommentId",
                table: "Comment",
                column: "ParentCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_Comment_PostId",
                table: "Comment",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityMember_AgreedPolicyId",
                table: "CommunityMember",
                column: "AgreedPolicyId");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityMember_CommunityId",
                table: "CommunityMember",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityPolicy_CommunityId_Version",
                table: "CommunityPolicy",
                columns: new[] { "CommunityId", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Post_CommunityId",
                table: "Post",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Reaction_CommentId",
                table: "Reaction",
                column: "CommentId");

            migrationBuilder.CreateIndex(
                name: "IX_Reaction_PostId",
                table: "Reaction",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_Report_ReportedCommentId",
                table: "Report",
                column: "ReportedCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_Report_ReportedCommunityId",
                table: "Report",
                column: "ReportedCommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Report_ReportedPostId",
                table: "Report",
                column: "ReportedPostId");

            migrationBuilder.CreateIndex(
                name: "IX_Report_ReportedSpaceId",
                table: "Report",
                column: "ReportedSpaceId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceEntity_Name",
                table: "ServiceEntity",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServicesSpaces_ServiceId",
                table: "ServicesSpaces",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_ServicesSpaces_SpaceId",
                table: "ServicesSpaces",
                column: "SpaceId");

            migrationBuilder.CreateIndex(
                name: "IX_SpaceAmenity_AmenityId",
                table: "SpaceAmenity",
                column: "AmenityId");

            migrationBuilder.CreateIndex(
                name: "IX_SpaceAmenity_SpaceId_AmenityId",
                table: "SpaceAmenity",
                columns: new[] { "SpaceId", "AmenityId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_SpaceImages_Space_SpaceId",
                table: "SpaceImages",
                column: "SpaceId",
                principalTable: "Space",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
