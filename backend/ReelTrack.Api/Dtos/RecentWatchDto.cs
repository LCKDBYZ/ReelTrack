namespace ReelTrack.Api.Dtos {
    public class RecentWatchDto {
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? PosterPath { get; set; }
        public DateTime WatchedAt { get; set; }

        public string? SeriesTitle { get; set; }
        public int? SeasonNumber { get; set; }
        public int? EpisodeNumber { get; set; }
    }
}
