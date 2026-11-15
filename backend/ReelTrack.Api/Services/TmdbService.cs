
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace ReelTrack.Api.Services;

public class TmdbService {
    private readonly HttpClient httpClient;
    private readonly string apiKey;

    public TmdbService(HttpClient httpClient, IConfiguration configuration) {
        this.httpClient = httpClient;

        apiKey = configuration["Tmdb:ApiKey"]
            ?? throw new InvalidOperationException("TMDB API key is missing.");
    }

    public async Task<TmdbMovieSearchResponse?> SearchMovies(string query) {
        string url = $"search/movie?query={Uri.EscapeDataString(query)}&api_key={apiKey}";

        return await httpClient.GetFromJsonAsync<TmdbMovieSearchResponse>(url);
    }

    public async Task<TmdbMovieDetails?> GetMovieDetails(int tmdbId) {
        string url = $"movie/{tmdbId}?api_key={apiKey}";

        return await httpClient.GetFromJsonAsync<TmdbMovieDetails>(url);
    }

    public async Task<TmdbSeriesSearchResponse?> SearchSeries(string query) {
        string url = $"search/tv?query={Uri.EscapeDataString(query)}&api_key={apiKey}";

        return await httpClient.GetFromJsonAsync<TmdbSeriesSearchResponse>(url);
    }

    public async Task<TmdbSeriesDetails?> GetSeriesDetails(int tmdbId) {
        string url = $"tv/{tmdbId}?api_key={apiKey}";

        return await httpClient.GetFromJsonAsync<TmdbSeriesDetails>(url);
    }

    public async Task<TmdbSeasonDetails?> GetSeasonDetails(int seriesTmdbId, int seasonNumber) {
        string url = $"tv/{seriesTmdbId}/season/{seasonNumber}?api_key={apiKey}";

        return await httpClient.GetFromJsonAsync<TmdbSeasonDetails>(url);
    }
}

public class TmdbMovieSearchResponse {
    [JsonPropertyName("results")]
    public List<TmdbMovieSearchResult> Results { get; set; } = new();
}

public class TmdbMovieSearchResult {
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("overview")]
    public string? Overview { get; set; }

    [JsonPropertyName("release_date")]
    public string? ReleaseDate { get; set; }

    [JsonPropertyName("poster_path")]
    public string? PosterPath { get; set; }

    [JsonPropertyName("backdrop_path")]
    public string? BackdropPath { get; set; }
}

public class TmdbMovieDetails {
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("overview")]
    public string? Overview { get; set; }

    [JsonPropertyName("release_date")]
    public string? ReleaseDate { get; set; }

    [JsonPropertyName("poster_path")]
    public string? PosterPath { get; set; }

    [JsonPropertyName("backdrop_path")]
    public string? BackdropPath { get; set; }

    [JsonPropertyName("runtime")]
    public int? Runtime { get; set; }

    [JsonPropertyName("vote_average")]
    public double VoteAverage { get; set; }

    [JsonPropertyName("genres")]
    public List<TmdbGenre> Genres { get; set; } = new();
}

public class TmdbSeriesSearchResponse {
    [JsonPropertyName("results")]
    public List<TmdbSeriesSearchResult> Results { get; set; } = new();
}

public class TmdbSeriesSearchResult {
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("overview")]
    public string? Overview { get; set; }

    [JsonPropertyName("first_air_date")]
    public string? FirstAirDate { get; set; }

    [JsonPropertyName("poster_path")]
    public string? PosterPath { get; set; }

    [JsonPropertyName("backdrop_path")]
    public string? BackdropPath { get; set; }
}

public class TmdbSeriesDetails {
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("overview")]
    public string? Overview { get; set; }

    [JsonPropertyName("first_air_date")]
    public string? FirstAirDate { get; set; }

    [JsonPropertyName("poster_path")]
    public string? PosterPath { get; set; }

    [JsonPropertyName("backdrop_path")]
    public string? BackdropPath { get; set; }

    [JsonPropertyName("seasons")]
    public List<TmdbSeasonSummary> Seasons { get; set; } = new();

    [JsonPropertyName("last_air_date")]
    public string? LastAirDate { get; set; }

    [JsonPropertyName("vote_average")]
    public double VoteAverage { get; set; }

    [JsonPropertyName("genres")]
    public List<TmdbGenre> Genres { get; set; } = new();

    [JsonPropertyName("number_of_seasons")]
    public int NumberOfSeasons { get; set; }

    [JsonPropertyName("number_of_episodes")]
    public int NumberOfEpisodes { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }
}

public class TmdbSeasonSummary {
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("season_number")]
    public int SeasonNumber { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("overview")]
    public string? Overview { get; set; }

    [JsonPropertyName("air_date")]
    public string? AirDate { get; set; }

    [JsonPropertyName("poster_path")]
    public string? PosterPath { get; set; }

    [JsonPropertyName("episode_count")]
    public int EpisodeCount { get; set; }
}

public class TmdbSeasonDetails {
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("season_number")]
    public int SeasonNumber { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("overview")]
    public string? Overview { get; set; }

    [JsonPropertyName("air_date")]
    public string? AirDate { get; set; }

    [JsonPropertyName("poster_path")]
    public string? PosterPath { get; set; }

    [JsonPropertyName("episodes")]
    public List<TmdbEpisode> Episodes { get; set; } = new();
}

public class TmdbEpisode {
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("episode_number")]
    public int EpisodeNumber { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("overview")]
    public string? Overview { get; set; }

    [JsonPropertyName("air_date")]
    public string? AirDate { get; set; }

    [JsonPropertyName("runtime")]
    public int? Runtime { get; set; }

    [JsonPropertyName("still_path")]
    public string? StillPath { get; set; }
}

public class TmdbGenre {
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}
