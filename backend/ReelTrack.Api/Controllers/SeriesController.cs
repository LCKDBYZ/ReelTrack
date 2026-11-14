using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReelTrack.Api.Data;
using ReelTrack.Api.Models;
using ReelTrack.Api.Services;

namespace ReelTrack.Api.Controllers {

    [ApiController]
    [Route("api/[controller]")]
    public class SeriesController : ControllerBase {
        private readonly ReelTrackContext context;
        private readonly TmdbService tmdbService;

        public SeriesController(ReelTrackContext context, TmdbService tmdbService) {
            this.context = context;
            this.tmdbService = tmdbService;
        }

        // Get all series with viewing progress
        [HttpGet]
        public async Task<IActionResult> GetAll() {
            var series = await context.Series
                .AsNoTracking()
                .Select(s => new {
                    s.Id,
                    s.TmdbId,
                    s.Title,
                    s.Overview,
                    s.FirstAirDate,
                    s.LastAirDate,
                    s.PosterPath,
                    s.Rating,
                    s.Status,
                    s.IsFavorite,

                    TotalEpisodes = s.Seasons
                        .SelectMany(season => season.Episodes)
                        .Count(),

                    WatchedEpisodes = s.Seasons
                        .SelectMany(season => season.Episodes)
                        .Count(episode => episode.Watches.Any()),

                    NextEpisode = s.Seasons
                        .SelectMany(season => season.Episodes)
                        .Where(episode => !episode.Watches.Any())
                        .OrderBy(episode => episode.Season.SeasonNumber)
                        .ThenBy(episode => episode.EpisodeNumber)
                        .Select(episode => new {
                            Id = episode.Id,
                            SeasonNumber = episode.Season.SeasonNumber,
                            EpisodeNumber = episode.EpisodeNumber,
                            Title = episode.Title
                        })
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(series);
        }

        // Search series on TMDB
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query) {
            if (string.IsNullOrWhiteSpace(query)) {
                return BadRequest("Search query cannot be empty.");
            }

            var results = await tmdbService.SearchSeries(query);

            return Ok(results?.Results ?? new List<TmdbSeriesSearchResult>());
        }


        // Get a series by its local database ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id) {
            var series = await context.Series
                .AsNoTracking()
                .Where(s => s.Id == id)
                .Select(s => new {
                    s.Id,
                    s.TmdbId,
                    s.Title,
                    s.Overview,
                    s.FirstAirDate,
                    s.LastAirDate,
                    s.PosterPath,
                    s.BackdropPath,
                    s.Status,
                    s.Rating,
                    Seasons = s.Seasons.Select(season => new {
                        season.Id,
                        season.TmdbId,
                        season.SeasonNumber,
                        season.Name,
                        episodes = season.Episodes.Select(episode => new
                        {
                            id = episode.Id,
                            tmdbId = episode.TmdbId,
                            episodeNumber = episode.EpisodeNumber,
                            title = episode.Title,
                            isWatched = episode.Watches.Any(),
                            overview = episode.Overview,
                            airDate = episode.AirDate,
                            runtime = episode.Runtime,
                            watchId = episode.Watches
                                .Select(watch => watch.Id)
                                .FirstOrDefault()
                        })
                    })
                })
                .FirstOrDefaultAsync();

            if (series == null) {
                return NotFound();
            }

            var nextEpisode = await context.Episodes
                .Where(e =>
                    e.Season.SeriesId == id &&
                    !e.Watches.Any()
                )
                .OrderBy(e => e.Season.SeasonNumber)
                .ThenBy(e => e.EpisodeNumber)
                .Select(e => new {
                    id = e.Id,
                    seasonNumber = e.Season.SeasonNumber,
                    episodeNumber = e.EpisodeNumber,
                    title = e.Title,
                    overview = e.Overview
                })
                .FirstOrDefaultAsync();

            return Ok(new {
                series,
                nextEpisode
            });
        }

        public class UpdateSeriesRequest {
            public WatchStatus Status { get; set; }
            public decimal? Rating { get; set; }
        }

        // Update a series status and rating
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateSeriesRequest request) {
            var series = await context.Series.FindAsync(id);

            if (series == null) {
                return NotFound("Series not found.");
            }

            if (request.Rating < 1 || request.Rating > 10) {
                if (request.Rating != null) {
                    return BadRequest("Rating must be between 1 and 10.");
                }
            }

            series.Status = request.Status;
            series.Rating = request.Rating;

            await context.SaveChangesAsync();

            return Ok(new {
                series.Id,
                series.Status,
                series.Rating
            });
        }

        // Import a series and all its seasons and episodes from TMDB
        [HttpPost("import/{tmdbId}")]
        public async Task<IActionResult> ImportFromTmdb(int tmdbId) {
            bool alreadyExists = await context.Series
                .AnyAsync(s => s.TmdbId == tmdbId);

            if (alreadyExists) {
                return Conflict("This series is already in your collection.");
            }

            var tmdbSeries = await tmdbService.GetSeriesDetails(tmdbId);

            if (tmdbSeries == null) {
                return NotFound("Series not found on TMDB.");
            }

            var series = new Series {
                TmdbId = tmdbSeries.Id,
                Title = tmdbSeries.Name,
                Overview = tmdbSeries.Overview,
                FirstAirDate = ParseDate(tmdbSeries.FirstAirDate),
                LastAirDate = ParseDate(tmdbSeries.LastAirDate),
                PosterPath = tmdbSeries.PosterPath,
                BackdropPath = tmdbSeries.BackdropPath,
                LastSyncedAt = DateTime.UtcNow
            };

            foreach (var seasonSummary in tmdbSeries.Seasons) {
                var tmdbSeason = await tmdbService.GetSeasonDetails(
                    tmdbSeries.Id,
                    seasonSummary.SeasonNumber
                );

                if (tmdbSeason == null) {
                    return StatusCode(502, "Failed to retrieve season data from TMDB.");
                }

                var season = new Season {
                    TmdbId = tmdbSeason.Id,
                    SeasonNumber = tmdbSeason.SeasonNumber,
                    Name = tmdbSeason.Name,
                    Overview = tmdbSeason.Overview,
                    AirDate = ParseDate(tmdbSeason.AirDate),
                    PosterPath = tmdbSeason.PosterPath
                };

                foreach (var tmdbEpisode in tmdbSeason.Episodes) {
                    var episode = new Episode {
                        TmdbId = tmdbEpisode.Id,
                        EpisodeNumber = tmdbEpisode.EpisodeNumber,
                        Title = tmdbEpisode.Name,
                        Overview = tmdbEpisode.Overview,
                        AirDate = ParseDate(tmdbEpisode.AirDate),
                        Runtime = tmdbEpisode.Runtime,
                        StillPath = tmdbEpisode.StillPath
                    };

                    season.Episodes.Add(episode);
                }

                series.Seasons.Add(season);
            }

            context.Series.Add(series);

            await context.SaveChangesAsync();

            int episodeCount = series.Seasons.Sum(s => s.Episodes.Count);

            return CreatedAtAction(
                nameof(GetById),
                new { id = series.Id },
                new {
                    series.Id,
                    series.TmdbId,
                    series.Title,
                    SeasonCount = series.Seasons.Count,
                    EpisodeCount = episodeCount
                }
            );
        }



        // Sync a single series with TMDB
        [HttpPost("{id}/sync")]
        public async Task<IActionResult> Sync(int id) {
            var series = await context.Series
                .Include(s => s.Seasons)
                    .ThenInclude(s => s.Episodes)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (series == null) {
                return NotFound("Series not found in your collection.");
            }

            var result = await SyncSeriesData(series);

            if (result == null) {
                return StatusCode(502, "Failed to retrieve series data from TMDB.");
            }

            await context.SaveChangesAsync();

            return Ok(new {
                series.Id,
                series.Title,
                result.Value.NewSeasons,
                result.Value.NewEpisodes,
                result.Value.UpdatedSeasons,
                result.Value.UpdatedEpisodes,
                series.LastSyncedAt
            });
        }



        // Sync all series in the collection
        [HttpPost("sync")]
        public async Task<IActionResult> SyncAll() {
            var seriesIds = await context.Series
                .Select(s => s.Id)
                .ToListAsync();

            int newSeasonCount = 0;
            int newEpisodeCount = 0;
            int updatedSeasonCount = 0;
            int updatedEpisodeCount = 0;

            foreach (int id in seriesIds) {
                var series = await context.Series
                    .Include(s => s.Seasons)
                        .ThenInclude(s => s.Episodes)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (series == null) {
                    continue;
                }

                var result = await SyncSeriesData(series);

                if (result == null) {
                    return StatusCode(
                        502,
                        $"Failed to sync series with ID {id}."
                    );
                }

                await context.SaveChangesAsync();

                newSeasonCount += result.Value.NewSeasons;
                newEpisodeCount += result.Value.NewEpisodes;
                updatedSeasonCount += result.Value.UpdatedSeasons;
                updatedEpisodeCount += result.Value.UpdatedEpisodes;
            }

            return Ok(new {
                SyncedSeries = seriesIds.Count,
                NewSeasons = newSeasonCount,
                NewEpisodes = newEpisodeCount,
                UpdatedSeasons = updatedSeasonCount,
                UpdatedEpisodes = updatedEpisodeCount
            });
        }


        private async Task<(int NewSeasons, int NewEpisodes, int UpdatedSeasons, int UpdatedEpisodes)?> SyncSeriesData(Series series) {
            var tmdbSeries = await tmdbService.GetSeriesDetails(series.TmdbId);

            if (tmdbSeries == null) {
                return null;
            }

            // Update series metadata
            series.Title = tmdbSeries.Name;
            series.Overview = tmdbSeries.Overview;
            series.FirstAirDate = ParseDate(tmdbSeries.FirstAirDate);
            series.LastAirDate = ParseDate(tmdbSeries.LastAirDate);
            series.PosterPath = tmdbSeries.PosterPath;
            series.BackdropPath = tmdbSeries.BackdropPath;

            int newSeasonCount = 0;
            int newEpisodeCount = 0;
            int updatedSeasonCount = 0;
            int updatedEpisodeCount = 0;

            foreach (var seasonSummary in tmdbSeries.Seasons) {
                var tmdbSeason = await tmdbService.GetSeasonDetails(
                    series.TmdbId,
                    seasonSummary.SeasonNumber
                );

                if (tmdbSeason == null) {
                    return null;
                }

                var season = series.Seasons
                    .FirstOrDefault(s => s.TmdbId == tmdbSeason.Id);

                if (season == null) {
                    season = new Season {
                        TmdbId = tmdbSeason.Id
                    };

                    series.Seasons.Add(season);
                    newSeasonCount++;
                }
                else {
                    updatedSeasonCount++;
                }

                // Update season metadata
                season.SeasonNumber = tmdbSeason.SeasonNumber;
                season.Name = tmdbSeason.Name;
                season.Overview = tmdbSeason.Overview;
                season.AirDate = ParseDate(tmdbSeason.AirDate);
                season.PosterPath = tmdbSeason.PosterPath;

                foreach (var tmdbEpisode in tmdbSeason.Episodes) {
                    var episode = season.Episodes
                        .FirstOrDefault(e => e.TmdbId == tmdbEpisode.Id);

                    if (episode == null) {
                        episode = new Episode {
                            TmdbId = tmdbEpisode.Id
                        };

                        season.Episodes.Add(episode);
                        newEpisodeCount++;
                    }
                    else {
                        updatedEpisodeCount++;
                    }

                    // Update episode metadata
                    episode.EpisodeNumber = tmdbEpisode.EpisodeNumber;
                    episode.Title = tmdbEpisode.Name;
                    episode.Overview = tmdbEpisode.Overview;
                    episode.AirDate = ParseDate(tmdbEpisode.AirDate);
                    episode.Runtime = tmdbEpisode.Runtime;
                    episode.StillPath = tmdbEpisode.StillPath;
                }
            }

            series.LastSyncedAt = DateTime.UtcNow;

            return (
                newSeasonCount,
                newEpisodeCount,
                updatedSeasonCount,
                updatedEpisodeCount
            );
        }




        private static DateOnly? ParseDate(string? date) {
            if (DateOnly.TryParse(date, out var parsedDate)) {
                return parsedDate;
            }

            return null;
        }

    }
}
