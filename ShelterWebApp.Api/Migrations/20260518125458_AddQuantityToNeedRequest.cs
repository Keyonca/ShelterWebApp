using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShelterCoordinationSystem.Migrations
{
    /// <inheritdoc />
    public partial class AddQuantityToNeedRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Quantity",
                table: "NeedRequests",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "NeedRequests");
        }
    }
}
