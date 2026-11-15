using ReelTrack.Api.Models;

namespace ReelTrack.Api.Dtos {
    public class UpdateMovieTrackingRequest {
        public WatchStatus Status { get; set; }
        public decimal? Rating { get; set; }
    }
}
