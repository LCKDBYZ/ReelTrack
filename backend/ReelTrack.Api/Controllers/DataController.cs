using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReelTrack.Api.Data;
using ReelTrack.Api.Dtos;
using ReelTrack.Api.Models;

namespace ReelTrack.Api.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    public class DataController : ControllerBase {
        private readonly ReelTrackContext context;

        public DataController(ReelTrackContext context) {
            this.context = context;
        }


        // Export all application data as a JSON file
        [HttpGet("export")]
        public async Task<IActionResult> Export() {
            var movies = await context.Movies
                .AsNoTracking()
                .Select(movie => new {
                    movie.Id,
                    movie.TmdbId,
                    movie.Title,
                    movie.Overview,
                    movie.ReleaseDate,
                    movie.PosterPath,
                    movie.BackdropPath,
                    movie.Runtime,
                    movie.Status,
                    movie.Rating,
                    movie.Notes,
                    movie.IsFavorite,
                    movie.AddedAt,

                    Watches = movie.Watches.Select(watch => new {
                        watch.Id,
                        watch.MovieId,
                        watch.WatchedAt
                    })
                })
                .ToListAsync();

            var series = await context.Series
                .AsNoTracking()
                .Select(item => new {
                    item.Id,
                    item.TmdbId,
                    item.Title,
                    item.Overview,
                    item.FirstAirDate,
                    item.LastAirDate,
                    item.PosterPath,
                    item.BackdropPath,
                    item.Status,
                    item.Rating,
                    item.Notes,
                    item.IsFavorite,
                    item.AddedAt,
                    item.LastSyncedAt,

                    Seasons = item.Seasons.Select(season => new {
                        season.Id,
                        season.TmdbId,
                        season.SeriesId,
                        season.SeasonNumber,
                        season.Name,
                        season.Overview,
                        season.AirDate,
                        season.PosterPath,

                        Episodes = season.Episodes.Select(episode => new {
                            episode.Id,
                            episode.TmdbId,
                            episode.SeasonId,
                            episode.EpisodeNumber,
                            episode.Title,
                            episode.Overview,
                            episode.AirDate,
                            episode.Runtime,
                            episode.StillPath,

                            Watches = episode.Watches.Select(watch => new {
                                watch.Id,
                                watch.EpisodeId,
                                watch.WatchedAt
                            })
                        })
                    })
                })
                .ToListAsync();

            var exportData = new {
                FormatVersion = 1,
                ExportedAt = DateTime.UtcNow,
                Movies = movies,
                Series = series
            };

            var options = new System.Text.Json.JsonSerializerOptions {
                WriteIndented = true,
                PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
            };

            byte[] json = System.Text.Json.JsonSerializer.SerializeToUtf8Bytes(
                exportData,
                options
            );

            return File(
                json,
                "application/json",
                "reeltrack-backup.json"
            );
        }


        // Import application data from a JSON backup
        [HttpPost("import")]
        public async Task<IActionResult> Import(
            [FromBody] DataImportDto request,
            [FromQuery] string mode = "merge") {

            if (request.FormatVersion != 1) {
                return BadRequest("Unsupported backup format version.");
            }

            if (request.Movies == null || request.Series == null) {
                return BadRequest("Invalid backup data.");
            }

            if (mode != "replace" && mode != "merge") {
                return BadRequest("Import mode must be 'replace' or 'merge'.");
            }

            await using var transaction =
                await context.Database.BeginTransactionAsync();

            if (mode == "replace") {
                var existingMovies = await context.Movies.ToListAsync();
                var existingSeries = await context.Series.ToListAsync();

                context.Movies.RemoveRange(existingMovies);
                context.Series.RemoveRange(existingSeries);

                await context.SaveChangesAsync();
            }

            var existingMovieIds = await context.Movies
                .Select(movie => movie.TmdbId)
                .ToHashSetAsync();

            var existingSeriesIds = await context.Series
                .Select(series => series.TmdbId)
                .ToHashSetAsync();

            var moviesToImport = new List<Movie>();

            foreach (var movieDto in request.Movies) {
                if (existingMovieIds.Add(movieDto.TmdbId)) {
                    moviesToImport.Add(MapMovie(movieDto));
                }
            }

            var seriesToImport = new List<Series>();

            foreach (var seriesDto in request.Series) {
                if (existingSeriesIds.Add(seriesDto.TmdbId)) {
                    seriesToImport.Add(MapSeries(seriesDto));
                }
            }

            context.Movies.AddRange(moviesToImport);
            context.Series.AddRange(seriesToImport);

            await context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new {
                Mode = mode,
                ImportedMovies = moviesToImport.Count,
                ImportedSeries = seriesToImport.Count,
                SkippedMovies = request.Movies.Count - moviesToImport.Count,
                SkippedSeries = request.Series.Count - seriesToImport.Count
            });
        }

        // Convert an imported movie DTO into a database entity
        private static Movie MapMovie(MovieImportDto dto) {
            return new Movie {
                TmdbId = dto.TmdbId,
                Title = dto.Title,
                Overview = dto.Overview,
                ReleaseDate = dto.ReleaseDate,
                PosterPath = dto.PosterPath,
                BackdropPath = dto.BackdropPath,
                Runtime = dto.Runtime,
                Status = dto.Status,
                Rating = dto.Rating,
                Notes = dto.Notes,
                IsFavorite = dto.IsFavorite,
                AddedAt = dto.AddedAt,

                Watches = dto.Watches.Select(watch => new MovieWatch {
                    WatchedAt = watch.WatchedAt
                }).ToList()
            };
        }

        // Convert an imported series DTO into a database entity
        private static Series MapSeries(SeriesImportDto dto) {
            return new Series {
                TmdbId = dto.TmdbId,
                Title = dto.Title,
                Overview = dto.Overview,
                FirstAirDate = dto.FirstAirDate,
                LastAirDate = dto.LastAirDate,
                PosterPath = dto.PosterPath,
                BackdropPath = dto.BackdropPath,
                Status = dto.Status,
                Rating = dto.Rating,
                Notes = dto.Notes,
                IsFavorite = dto.IsFavorite,
                AddedAt = dto.AddedAt,
                LastSyncedAt = dto.LastSyncedAt,

                Seasons = dto.Seasons.Select(season => new Season {
                    TmdbId = season.TmdbId,
                    SeasonNumber = season.SeasonNumber,
                    Name = season.Name,
                    Overview = season.Overview,
                    AirDate = season.AirDate,
                    PosterPath = season.PosterPath,

                    Episodes = season.Episodes.Select(episode => new Episode {
                        TmdbId = episode.TmdbId,
                        EpisodeNumber = episode.EpisodeNumber,
                        Title = episode.Title,
                        Overview = episode.Overview,
                        AirDate = episode.AirDate,
                        Runtime = episode.Runtime,
                        StillPath = episode.StillPath,

                        Watches = episode.Watches.Select(watch =>
                            new EpisodeWatch {
                                WatchedAt = watch.WatchedAt
                            }).ToList()
                    }).ToList()
                }).ToList()
            };
        }


    }
}
