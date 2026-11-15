using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReelTrack.Api.Data;
using ReelTrack.Api.Dtos;
using ReelTrack.Api.Models;
using ReelTrack.Api.Services;

namespace ReelTrack.Api.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase {
        private readonly ReelTrackContext context;
        private readonly TmdbService tmdbService;

        public MoviesController(ReelTrackContext context, TmdbService tmdbService) {
            this.context = context;
            this.tmdbService = tmdbService;
        }

        // Get all movies
        [HttpGet]
        public async Task<IActionResult> GetAll() {
            var movies = await context.Movies
                .AsNoTracking()
                .ToListAsync();

            return Ok(movies);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id) {
            var movie = await context.Movies
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);

            if (movie == null) {
                return NotFound();
            }

            return Ok(movie);
        }

        // Get movie details from TMDB
        [HttpGet("tmdb/{tmdbId:int}")]
        public async Task<IActionResult> GetTmdbDetails(int tmdbId) {
            var movie = await tmdbService.GetMovieDetails(tmdbId);

            if (movie == null) {
                return NotFound("Movie not found on TMDB.");
            }

            return Ok(movie);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateMovieRequest request) {
            bool alreadyExists = await context.Movies
                .AnyAsync(m => m.TmdbId == request.TmdbId);

            if (alreadyExists) {
                return Conflict("This movie is already in your collection.");
            }

            var movie = new Movie {
                TmdbId = request.TmdbId,
                Title = request.Title,
                Overview = request.Overview,
                ReleaseDate = request.ReleaseDate,
                PosterPath = request.PosterPath,
                BackdropPath = request.BackdropPath,
                Runtime = request.Runtime
            };

            context.Movies.Add(movie);

            await context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = movie.Id },
                movie
            );
        }

        // Update a movie
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateMovieRequest request) {
            var movie = await context.Movies.FindAsync(id);

            if (movie == null) {
                return NotFound();
            }

            bool alreadyExists = await context.Movies
                .AnyAsync(m => m.TmdbId == request.TmdbId && m.Id != id);

            if (alreadyExists) {
                return Conflict("This movie is already in your collection.");
            }

            movie.TmdbId = request.TmdbId;
            movie.Title = request.Title;
            movie.Overview = request.Overview;
            movie.ReleaseDate = request.ReleaseDate;
            movie.PosterPath = request.PosterPath;
            movie.BackdropPath = request.BackdropPath;
            movie.Runtime = request.Runtime;

            await context.SaveChangesAsync();

            return NoContent();
        }

        // Update movie tracking information
        [HttpPut("{id}/tracking")]
        public async Task<IActionResult> UpdateTracking(
            int id,
            UpdateMovieTrackingRequest request) {
            var movie = await context.Movies.FindAsync(id);

            if (movie == null) {
                return NotFound("Movie not found.");
            }

            if (request.Rating.HasValue &&
                (request.Rating < 1 || request.Rating > 10)) {
                return BadRequest("Rating must be between 1 and 10.");
            }

            movie.Status = request.Status;
            movie.Rating = request.Rating;

            await context.SaveChangesAsync();

            return Ok(new {
                movie.Id,
                movie.Status,
                movie.Rating
            });
        }

        // Update movie favorite status
        [HttpPut("{id}/favorite")]
        public async Task<IActionResult> UpdateFavorite(
            int id,
            UpdateMovieFavoriteRequest request) {
            var movie = await context.Movies.FindAsync(id);

            if (movie == null) {
                return NotFound("Movie not found.");
            }

            movie.IsFavorite = request.IsFavorite;

            await context.SaveChangesAsync();

            return Ok(new {
                movie.Id,
                movie.IsFavorite
            });
        }

        // Delete a movie
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id) {
            var movie = await context.Movies.FindAsync(id);

            if (movie == null) {
                return NotFound();
            }

            context.Movies.Remove(movie);

            await context.SaveChangesAsync();

            return NoContent();
        }

        // Search movies on TMDB
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query) {
            if (string.IsNullOrWhiteSpace(query)) {
                return BadRequest("Search query cannot be empty.");
            }

            var results = await tmdbService.SearchMovies(query);

            return Ok(results?.Results ?? new List<TmdbMovieSearchResult>());
        }

        // Import a movie from TMDB
        [HttpPost("import/{tmdbId}")]
        public async Task<IActionResult> ImportFromTmdb(int tmdbId) {
            bool alreadyExists = await context.Movies
                .AnyAsync(m => m.TmdbId == tmdbId);

            if (alreadyExists) {
                return Conflict("This movie is already in your collection.");
            }

            var tmdbMovie = await tmdbService.GetMovieDetails(tmdbId);

            if (tmdbMovie == null) {
                return NotFound("Movie not found on TMDB.");
            }

            DateOnly? releaseDate = null;

            if (DateOnly.TryParse(tmdbMovie.ReleaseDate, out var parsedDate)) {
                releaseDate = parsedDate;
            }

            var movie = new Movie {
                TmdbId = tmdbMovie.Id,
                Title = tmdbMovie.Title,
                Overview = tmdbMovie.Overview,
                ReleaseDate = releaseDate,
                PosterPath = tmdbMovie.PosterPath,
                BackdropPath = tmdbMovie.BackdropPath,
                Runtime = tmdbMovie.Runtime
            };

            context.Movies.Add(movie);

            await context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = movie.Id },
                movie
            );
        }

    }
}
