namespace ReelTrack.Api.Models {
    public class EpisodeWatch {
        // Database identifier
        public int Id { get; set; }

        // Foreign key to the episode
        public int EpisodeId { get; set; }

        // Time when the episode was watched
        public DateTime WatchedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Episode Episode { get; set; } = null!;
    }
}
