namespace ReelTrack.Api.Models {
    public class Movie {
        // local db identifier
        public int Id { get; set; }

        // TMDB id
        public int TmdbId { get; set; }

        // data from TMDB
        public string Title { get; set; } = string.Empty;
        public string? Overview { get; set; }
        public DateOnly? ReleaseDate { get; set; }
        public string? PosterPath { get; set; }
        public string? BackdropPath { get; set; }
        public int? Runtime { get; set; }

        // local data
        public WatchStatus Status { get; set; } = WatchStatus.PlanToWatch;
        public decimal? Rating { get; set; }
        public string? Notes { get; set; }
        public bool IsFavorite { get; set; }

        // local timestamps
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;

        // Watch history
        public ICollection<MovieWatch> Watches { get; set; } = new List<MovieWatch>();
    }
}
