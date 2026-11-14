using Microsoft.EntityFrameworkCore;
using ReelTrack.Api.Models;

namespace ReelTrack.Api.Data {
    public class ReelTrackContext : DbContext {
        public ReelTrackContext(DbContextOptions<ReelTrackContext> options)
            : base(options) {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<EpisodeWatch>()
                .HasIndex(watch => watch.EpisodeId)
                .IsUnique();
        }

        // Database tables
        public DbSet<Movie> Movies => Set<Movie>();
        public DbSet<MovieWatch> MovieWatches => Set<MovieWatch>();

        public DbSet<Series> Series => Set<Series>();
        public DbSet<Season> Seasons => Set<Season>();
        public DbSet<Episode> Episodes => Set<Episode>();
        public DbSet<EpisodeWatch> EpisodeWatches => Set<EpisodeWatch>();
    }
}
