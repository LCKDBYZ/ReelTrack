namespace ReelTrack.Api.Models {
    public class Series {
        // local db identifier
        public int Id { get; set; }

        // TMDB id
        public int TmdbId { get; set; }

        // data from TMDB
        public string Title { get; set; } = string.Empty;
        public string? Overview { get; set; }
        public DateOnly? FirstAirDate { get; set; }
        public DateOnly? LastAirDate { get; set; }
        public string? PosterPath { get; set; }
        public string? BackdropPath { get; set; }

        // local data
        public WatchStatus Status { get; set; } = WatchStatus.PlanToWatch;
        public decimal? Rating { get; set; }
        public string? Notes { get; set; }
        public bool IsFavorite { get; set; }

        // local timestamps
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastSyncedAt { get; set; }

        // Seasons
        public ICollection<Season> Seasons { get; set; } = new List<Season>();
    }
}
