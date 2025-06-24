using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "space_booking");

            migrationBuilder.EnsureSchema(
                name: "engagement");

            migrationBuilder.EnsureSchema(
                name: "community_content");

            migrationBuilder.EnsureSchema(
                name: "user_related");

            migrationBuilder.CreateTable(
                name: "Comments",
                schema: "engagement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ParentEntityType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    ParentEntityId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ParentCommentId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Content = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comments_Comments_ParentCommentId",
                        column: x => x.ParentCommentId,
                        principalSchema: "engagement",
                        principalTable: "Comments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Communities",
                schema: "community_content",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CoverImageUrl = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: true),
                    IsPublic = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Communities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Reactions",
                schema: "engagement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TargetEntityType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    TargetEntityId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reactions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                schema: "engagement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SpaceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    BookingId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Rating = table.Column<int>(type: "INTEGER", nullable: false),
                    CommentText = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    IsVerifiedOwnerReply = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Spaces",
                schema: "space_booking",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    Address = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Latitude = table.Column<decimal>(type: "decimal(9,6)", nullable: true),
                    Longitude = table.Column<decimal>(type: "decimal(9,6)", nullable: true),
                    Type = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false, defaultValue: "Individual"),
                    Status = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false, defaultValue: "Available"),
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
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
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
                name: "Users",
                schema: "user_related",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Username = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    FullName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Gender = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    Bio = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    PhoneNumber = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    Address = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    AvatarUrl = table.Column<string>(type: "TEXT", maxLength: 512, nullable: true),
                    Role = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    PasswordResetToken = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    PasswordResetTokenExpiry = table.Column<DateTime>(type: "TEXT", nullable: true),
                    RefreshToken = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    RefreshTokenExpiry = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CommunityMembers",
                schema: "community_content",
                columns: table => new
                {
                    CommunityId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommunityMembers", x => new { x.CommunityId, x.UserId });
                    table.ForeignKey(
                        name: "FK_CommunityMembers_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalSchema: "community_content",
                        principalTable: "Communities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Posts",
                schema: "community_content",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CommunityId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AuthorUserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "TEXT", nullable: false),
                    ViewCount = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    IsPinned = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsLocked = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Posts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Posts_Communities_CommunityId",
                        column: x => x.CommunityId,
                        principalSchema: "community_content",
                        principalTable: "Communities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    NumberOfPeople = table.Column<int>(type: "INTEGER", nullable: false),
                    BookingCode = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    NotesFromUser = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    NotesFromOwner = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
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
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
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
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
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
                name: "SpaceImages",
                schema: "space_booking",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SpaceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ImageUrl = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    Caption = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    IsCoverImage = table.Column<bool>(type: "INTEGER", nullable: false),
                    DisplayOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpaceImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SpaceImages_Spaces_SpaceId",
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

            migrationBuilder.CreateTable(
                name: "OwnerProfiles",
                schema: "user_related",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CompanyName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    ContactInfo = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    BusinessLicenseNumber = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    TaxCode = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Website = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    LogoUrl = table.Column<string>(type: "TEXT", maxLength: 512, nullable: true),
                    IsVerified = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OwnerProfiles", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_OwnerProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "user_related",
                        principalTable: "Users",
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
                name: "IX_Comments_Parent",
                schema: "engagement",
                table: "Comments",
                columns: new[] { "ParentEntityType", "ParentEntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_Comments_ParentCommentId",
                schema: "engagement",
                table: "Comments",
                column: "ParentCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_Communities_Name",
                schema: "community_content",
                table: "Communities",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Posts_CommunityId",
                schema: "community_content",
                table: "Posts",
                column: "CommunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Reactions_Target",
                schema: "engagement",
                table: "Reactions",
                columns: new[] { "TargetEntityType", "TargetEntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_Reactions_UserTargetType",
                schema: "engagement",
                table: "Reactions",
                columns: new[] { "UserId", "TargetEntityType", "TargetEntityId", "Type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_BookingId",
                schema: "engagement",
                table: "Reviews",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_SpaceId",
                schema: "engagement",
                table: "Reviews",
                column: "SpaceId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_UserId",
                schema: "engagement",
                table: "Reviews",
                column: "UserId");

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
                name: "IX_SpaceImages_SpaceId",
                schema: "space_booking",
                table: "SpaceImages",
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

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                schema: "user_related",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                schema: "user_related",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bookings",
                schema: "space_booking");

            migrationBuilder.DropTable(
                name: "Comments",
                schema: "engagement");

            migrationBuilder.DropTable(
                name: "CommunityMembers",
                schema: "community_content");

            migrationBuilder.DropTable(
                name: "OwnerProfiles",
                schema: "user_related");

            migrationBuilder.DropTable(
                name: "Posts",
                schema: "community_content");

            migrationBuilder.DropTable(
                name: "Reactions",
                schema: "engagement");

            migrationBuilder.DropTable(
                name: "Reviews",
                schema: "engagement");

            migrationBuilder.DropTable(
                name: "SpaceCustomAmenities",
                schema: "space_booking");

            migrationBuilder.DropTable(
                name: "SpaceCustomServices",
                schema: "space_booking");

            migrationBuilder.DropTable(
                name: "SpaceImages",
                schema: "space_booking");

            migrationBuilder.DropTable(
                name: "SpaceSystemAmenities",
                schema: "space_booking");

            migrationBuilder.DropTable(
                name: "SpaceSystemSpaceServices",
                schema: "space_booking");

            migrationBuilder.DropTable(
                name: "Users",
                schema: "user_related");

            migrationBuilder.DropTable(
                name: "Communities",
                schema: "community_content");

            migrationBuilder.DropTable(
                name: "SystemAmenities",
                schema: "space_booking");

            migrationBuilder.DropTable(
                name: "Spaces",
                schema: "space_booking");

            migrationBuilder.DropTable(
                name: "SystemSpaceServices",
                schema: "space_booking");
        }
    }
}
