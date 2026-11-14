using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReelTrack.Api.Migrations
{
    /// <inheritdoc />
    public partial class UniqueEpisodeWatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EpisodeWatches_EpisodeId",
                table: "EpisodeWatches");

            migrationBuilder.CreateIndex(
                name: "IX_EpisodeWatches_EpisodeId",
                table: "EpisodeWatches",
                column: "EpisodeId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EpisodeWatches_EpisodeId",
                table: "EpisodeWatches");

            migrationBuilder.CreateIndex(
                name: "IX_EpisodeWatches_EpisodeId",
                table: "EpisodeWatches",
                column: "EpisodeId");
        }
    }
}
