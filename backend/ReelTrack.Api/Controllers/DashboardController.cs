using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReelTrack.Api.Data;
using ReelTrack.Api.Dtos;

namespace ReelTrack.Api.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase {
        private readonly ReelTrackContext context;

        public DashboardController(ReelTrackContext context) {
            this.context = context;
        }

        // Get recently watched movies and episodes
        [HttpGet("recent-watches")]
        public async Task<IActionResult> GetRecentWatches() {
            var movieWatches = await context.MovieWatches
                .AsNoTracking()
                .Select(w => new RecentWatchDto {
                    Type = "Movie",
                    Title = w.Movie.Title,
                    PosterPath = w.Movie.PosterPath,
                    WatchedAt = w.WatchedAt
                })
                .ToListAsync();

            var episodeWatches = await context.EpisodeWatches
                .AsNoTracking()
                .Select(w => new RecentWatchDto {
                    Type = "Episode",
                    Title = w.Episode.Title,
                    PosterPath = w.Episode.Season.Series.PosterPath,
                    WatchedAt = w.WatchedAt,
                    SeriesTitle = w.Episode.Season.Series.Title,
                    SeasonNumber = w.Episode.Season.SeasonNumber,
                    EpisodeNumber = w.Episode.EpisodeNumber
                })
                .ToListAsync();

            var recentWatches = movieWatches
                .Concat(episodeWatches)
                .OrderByDescending(w => w.WatchedAt)
                .Take(10)
                .ToList();

            return Ok(recentWatches);
        }
    }
}
