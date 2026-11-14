using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReelTrack.Api.Data;
using ReelTrack.Api.Models;

namespace ReelTrack.Api.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    public class EpisodesController : ControllerBase {
        private readonly ReelTrackContext context;

        public EpisodesController(ReelTrackContext context) {
            this.context = context;
        }

        // Get viewing history of an episode
        [HttpGet("{id}/watches")]
        public async Task<IActionResult> GetWatches(int id) {
            bool episodeExists = await context.Episodes
                .AnyAsync(e => e.Id == id);

            if (!episodeExists) {
                return NotFound("Episode not found.");
            }

            var watches = await context.EpisodeWatches
                .Where(w => w.EpisodeId == id)
                .OrderByDescending(w => w.WatchedAt)
                .AsNoTracking()
                .ToListAsync();

            return Ok(watches);
        }

        // Mark an episode as watched
        [HttpPost("{id}/watches")]
        public async Task<IActionResult> MarkAsWatched(int id) {
            bool episodeExists = await context.Episodes
                .AnyAsync(e => e.Id == id);

            if (!episodeExists) {
                return NotFound("Episode not found.");
            }

            var watch = new EpisodeWatch {
                EpisodeId = id,
                WatchedAt = DateTime.UtcNow
            };

            context.EpisodeWatches.Add(watch);

            await context.SaveChangesAsync();

            await UpdateSeriesStatus(id);

            return Ok(watch);
        }

        // Remove a viewing history entry
        [HttpDelete("{episodeId}/watches/{watchId}")]
        public async Task<IActionResult> RemoveWatch(int episodeId, int watchId) {
            var watch = await context.EpisodeWatches
                .FirstOrDefaultAsync(w =>
                    w.Id == watchId &&
                    w.EpisodeId == episodeId
                );

            if (watch == null) {
                return NotFound("Viewing history entry not found.");
            }

            context.EpisodeWatches.Remove(watch);

            await context.SaveChangesAsync();

            await UpdateSeriesStatus(episodeId);

            return NoContent();
        }

        private async Task UpdateSeriesStatus(int episodeId) {
            int? seriesId = await context.Episodes
                .Where(e => e.Id == episodeId)
                .Select(e => (int?)e.Season.SeriesId)
                .FirstOrDefaultAsync();

            if (seriesId == null) {
                return;
            }

            var series = await context.Series
                .FirstOrDefaultAsync(s => s.Id == seriesId);

            if (series == null) {
                return;
            }

            int totalEpisodes = await context.Episodes
                .CountAsync(e => e.Season.SeriesId == seriesId);

            int watchedEpisodes = await context.Episodes
                .CountAsync(e =>
                    e.Season.SeriesId == seriesId &&
                    e.Watches.Any()
                );

            if (totalEpisodes == 0 || watchedEpisodes == 0) {
                series.Status = WatchStatus.PlanToWatch;
            }
            else if (watchedEpisodes == totalEpisodes) {
                series.Status = WatchStatus.Completed;
            }
            else {
                series.Status = WatchStatus.Watching;
            }

            await context.SaveChangesAsync();
        }
    }
}
