namespace ReelTrack.Api.Models {
    public class MovieWatch {
        // Database identifier
        public int Id { get; set; }

        // Foreign key to the movie
        public int MovieId { get; set; }

        // Time when the movie was watched
        public DateTime WatchedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Movie Movie { get; set; } = null!;
    }
}
