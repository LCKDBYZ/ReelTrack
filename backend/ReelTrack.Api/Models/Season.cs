namespace ReelTrack.Api.Models {
    public class Season {
        // local db identifier
        public int Id { get; set; }

        // TMDB season identifier
        public int TmdbId { get; set; }

        // Foreign key to the parent series
        public int SeriesId { get; set; }

        // Season metadata from TMDB
        public int SeasonNumber { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Overview { get; set; }
        public DateOnly? AirDate { get; set; }
        public string? PosterPath { get; set; }

        // Navigation properties
        public Series Series { get; set; } = null!;
        public ICollection<Episode> Episodes { get; set; } = new List<Episode>();
    }
}
