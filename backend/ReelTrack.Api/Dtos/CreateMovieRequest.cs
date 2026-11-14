namespace ReelTrack.Api.Dtos {
    public class CreateMovieRequest {
        public int TmdbId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Overview { get; set; }

        public DateOnly? ReleaseDate { get; set; }

        public string? PosterPath { get; set; }

        public string? BackdropPath { get; set; }

        public int? Runtime { get; set; }
    }
}
