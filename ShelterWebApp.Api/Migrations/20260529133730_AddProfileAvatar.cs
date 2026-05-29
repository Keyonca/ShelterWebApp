using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShelterCoordinationSystem.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileAvatar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarContentType",
                table: "Volunteers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "AvatarData",
                table: "Volunteers",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AvatarContentType",
                table: "Shelters",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "AvatarData",
                table: "Shelters",
                type: "bytea",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarContentType",
                table: "Volunteers");

            migrationBuilder.DropColumn(
                name: "AvatarData",
                table: "Volunteers");

            migrationBuilder.DropColumn(
                name: "AvatarContentType",
                table: "Shelters");

            migrationBuilder.DropColumn(
                name: "AvatarData",
                table: "Shelters");
        }
    }
}
