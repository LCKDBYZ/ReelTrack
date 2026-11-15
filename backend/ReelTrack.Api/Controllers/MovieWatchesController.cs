using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReelTrack.Api.Data;
using ReelTrack.Api.Dtos;
using ReelTrack.Api.Models;
namespace ReelTrack.Api.Controllers {
    [ApiController]
    [Route("api/movies/{movieId}/watches")]
    public class MovieWatchesController : ControllerBase {
        private readonly ReelTrackContext context;

        public MovieWatchesController(ReelTrackContext context) {
            this.context = context;
        }

        // Get movie watch history
        [HttpGet]
        public async Task<IActionResult> GetAll(int movieId) {
            var movieExists = await context.Movies
                .AnyAsync(m => m.Id == movieId);

            if (!movieExists) {
                return NotFound("Movie not found.");
            }

            var watches = await context.MovieWatches
                .AsNoTracking()
                .Where(w => w.MovieId == movieId)
                .OrderByDescending(w => w.WatchedAt)
                .Select(w => new {
                    w.Id,
                    w.MovieId,
                    w.WatchedAt
                })
                .ToListAsync();

            return Ok(watches);

            return Ok(watches);
        }

        // Add a movie watch
        [HttpPost]
        public async Task<IActionResult> Create(
            int movieId,
            CreateMovieWatchRequest request) {
            var movie = await context.Movies.FindAsync(movieId);

            if (movie == null) {
                return NotFound("Movie not found.");
            }

            var watch = new MovieWatch {
                MovieId = movieId,
                WatchedAt = request.WatchedAt ?? DateTime.UtcNow
            };

            context.MovieWatches.Add(watch);

            await context.SaveChangesAsync();

            return Ok(new {
                watch.Id,
                watch.MovieId,
                watch.WatchedAt
            });
        }

        // Delete a movie watch
        [HttpDelete("{watchId}")]
        public async Task<IActionResult> Delete(int movieId, int watchId) {
            var watch = await context.MovieWatches
                .FirstOrDefaultAsync(w =>
                    w.Id == watchId && w.MovieId == movieId);

            if (watch == null) {
                return NotFound("Watch record not found.");
            }

            context.MovieWatches.Remove(watch);

            await context.SaveChangesAsync();

            return NoContent();
        }
    }
}
