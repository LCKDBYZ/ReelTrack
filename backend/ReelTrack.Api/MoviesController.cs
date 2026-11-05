using Microsoft.AspNetCore.Mvc;
using ReelTrack.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ReelTrack.Api {
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase {
        private readonly ReelTrackContext context;

        public MoviesController(ReelTrackContext context) {
            this.context = context;
        }

        // Get all movies
        [HttpGet]
        public async Task<IActionResult> GetAll() {
            var movies = await context.Movies
                .AsNoTracking()
                .ToListAsync();

            return Ok(movies);
        }
    }
}
