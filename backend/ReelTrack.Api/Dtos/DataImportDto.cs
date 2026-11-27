
using ReelTrack.Api.Models;

namespace ReelTrack.Api.Dtos {
    public class DataImportDto {
        public int FormatVersion { get; set; }
        public DateTime ExportedAt { get; set; }

        public List<MovieImportDto> Movies { get; set; } = new();
        public List<SeriesImportDto> Series { get; set; } = new();
    }

    public class MovieImportDto {
        public int Id { get; set; }
        public int TmdbId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Overview { get; set; }
        public DateOnly? ReleaseDate { get; set; }
        public string? PosterPath { get; set; }
        public string? BackdropPath { get; set; }
        public int? Runtime { get; set; }
        public WatchStatus Status { get; set; }
        public decimal? Rating { get; set; }
        public string? Notes { get; set; }
        public bool IsFavorite { get; set; }
        public DateTime AddedAt { get; set; }

        public List<MovieWatchImportDto> Watches { get; set; } = new();
    }

    public class MovieWatchImportDto {
        public int Id { get; set; }
        public int MovieId { get; set; }
        public DateTime WatchedAt { get; set; }
    }

    public class SeriesImportDto {
        public int Id { get; set; }
        public int TmdbId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Overview { get; set; }
        public DateOnly? FirstAirDate { get; set; }
        public DateOnly? LastAirDate { get; set; }
        public string? PosterPath { get; set; }
        public string? BackdropPath { get; set; }
        public WatchStatus Status { get; set; }
        public decimal? Rating { get; set; }
        public string? Notes { get; set; }
        public bool IsFavorite { get; set; }
        public DateTime AddedAt { get; set; }
        public DateTime? LastSyncedAt { get; set; }

        public List<SeasonImportDto> Seasons { get; set; } = new();
    }

    public class SeasonImportDto {
        public int Id { get; set; }
        public int TmdbId { get; set; }
        public int SeriesId { get; set; }
        public int SeasonNumber { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Overview { get; set; }
        public DateOnly? AirDate { get; set; }
        public string? PosterPath { get; set; }

        public List<EpisodeImportDto> Episodes { get; set; } = new();
    }

    public class EpisodeImportDto {
        public int Id { get; set; }
        public int TmdbId { get; set; }
        public int SeasonId { get; set; }
        public int EpisodeNumber { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Overview { get; set; }
        public DateOnly? AirDate { get; set; }
        public int? Runtime { get; set; }
        public string? StillPath { get; set; }

        public List<EpisodeWatchImportDto> Watches { get; set; } = new();
    }

    public class EpisodeWatchImportDto {
        public int Id { get; set; }
        public int EpisodeId { get; set; }
        public DateTime WatchedAt { get; set; }
    }
}
