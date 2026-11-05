namespace ReelTrack.Api.Models {
    public class Episode {
        // Database identifier
        public int Id { get; set; }

        // TMDB episode identifier
        public int TmdbId { get; set; }

        // Foreign key to the parent season
        public int SeasonId { get; set; }

        // Episode metadata from TMDB
        public int EpisodeNumber { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Overview { get; set; }
        public DateOnly? AirDate { get; set; }
        public int? Runtime { get; set; }
        public string? StillPath { get; set; }

        // Navigation properties
        public Season Season { get; set; } = null!;

        // Viewing history
        public ICollection<EpisodeWatch> Watches { get; set; } = new List<EpisodeWatch>();
    }
}
