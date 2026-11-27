import { useEffect, useState } from "react";
import { searchMovies, searchSeries } from "../services/api";
import "./Search.css";
import { useNavigate } from "react-router-dom";

function Search() {
    const [searchTerm, setSearchTerm] = useState(
        () => sessionStorage.getItem("reeltrackSearchTerm") || ""
    );
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [mediaType, setMediaType] = useState("all");
    const [sortBy, setSortBy] = useState("popularity");

    const navigate = useNavigate();

    useEffect(() => {
        if (searchTerm.trim()) {
            handleSearch({ preventDefault: () => { } });
        }
    }, []);

    async function handleSearch(event, selectedType = mediaType) {
        event?.preventDefault();

        if (!searchTerm.trim()) {
            return;
        }

        sessionStorage.setItem("reeltrackSearchTerm", searchTerm.trim());

        try {
            setLoading(true);
            setError(null);
            setHasSearched(true);

            if (selectedType === "all") {
                const [movieResults, seriesResults] = await Promise.all([
                    searchMovies(searchTerm.trim()),
                    searchSeries(searchTerm.trim())
                ]);

                setMovies(movieResults);
                setSeries(seriesResults);
            } else if (selectedType === "movie") {
                const movieResults = await searchMovies(searchTerm.trim());

                setMovies(movieResults);
                setSeries([]);
            } else if (selectedType === "series") {
                const seriesResults = await searchSeries(searchTerm.trim());

                setMovies([]);
                setSeries(seriesResults);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const results = [
        ...movies.map(movie => ({
            ...movie,
            mediaType: "movie",
            posterPath: movie.poster_path,
            releaseDate: movie.release_date
        })),
        ...series.map(item => ({
            ...item,
            mediaType: "series",
            posterPath: item.poster_path,
            firstAirDate: item.first_air_date
        }))
    ];

    const sortedResults = [...results].sort((a, b) => {
        const popularityA = a.popularity || 0;
        const popularityB = b.popularity || 0;

        const ratingA = a.vote_average ?? a.voteAverage ?? 0;
        const ratingB = b.vote_average ?? b.voteAverage ?? 0;

        const dateA = a.releaseDate || a.firstAirDate || "";
        const dateB = b.releaseDate || b.firstAirDate || "";

        if (sortBy === "popularity") {
            return popularityB - popularityA;
        }

        if (sortBy === "rating") {
            return ratingB - ratingA;
        }

        if (sortBy === "release-date") {
            return dateB.localeCompare(dateA);
        }

        if (sortBy === "title") {
            const titleA = a.title || a.name || "";
            const titleB = b.title || b.name || "";

            return titleA.localeCompare(titleB);
        }

        return 0;
    });

    return (
        <div className="search-page">
            <div className="search-header">
                <h1>Search</h1>
                <p>Find movies and TV shows on TMDB.</p>
            </div>

            <form className="search-form" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search movies and TV shows..."
                    value={searchTerm}
                    onChange={event => setSearchTerm(event.target.value)}
                />

                <button type="submit" disabled={loading}>
                    Search
                </button>
            </form>

            <div className="search-type-selector">
                <button
                    type="button"
                    className={mediaType === "all" ? "active" : ""}
                    onClick={() => {
                        setMediaType("all");
                        handleSearch(null, "all");
                    }}
                >
                    All
                </button>

                <button
                    type="button"
                    className={mediaType === "movie" ? "active" : ""}
                    onClick={() => {
                        setMediaType("movie");
                        handleSearch(null, "movie");
                    }}
                >
                    Movies
                </button>

                <button
                    type="button"
                    className={mediaType === "series" ? "active" : ""}
                    onClick={() => {
                        setMediaType("series");
                        handleSearch(null, "series");
                    }}
                >
                    Series
                </button>
            </div>

            <div className="search-sort">
                <label htmlFor="sortBy">Sort by:</label>

                <select
                    id="sortBy"
                    value={sortBy}
                    onChange={event => setSortBy(event.target.value)}
                >
                    <option value="popularity">Popularity</option>
                    <option value="rating">Rating</option>
                    <option value="release-date">Release Date</option>
                    <option value="title">Title (A-Z)</option>
                </select>
            </div>

            {loading && <p>Searching...</p>}

            {error && <p className="search-error">Error: {error}</p>}

            {!loading && hasSearched && !error && (
                results.length === 0 ? (
                    <p>No results found.</p>
                ) : (
                    <div className="search-results">
                        {sortedResults.map(item => (
                            <div
                                className="search-result-card"
                                key={`${item.mediaType}-${item.id}`}
                                onClick={() => navigate(`/search/${item.mediaType}/${item.id}`)}
                                style={{ cursor: "pointer" }}
                            >
                                {item.posterPath ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                                        alt={item.title || item.name}
                                    />
                                ) : (
                                    <div className="search-no-poster">
                                        No poster
                                    </div>
                                )}

                                <div className="search-result-info">
                                    <h3>{item.title || item.name}</h3>

                                    <span className={`search-media-type ${item.mediaType}`}>
                                        {item.mediaType === "movie" ? "Movie" : "TV Series"}
                                    </span>

                                    <p>
                                        {item.releaseDate || item.firstAirDate || "Unknown release date"}
                                    </p>

                                    <p className="search-rating">
                                        ★ {item.voteAverage?.toFixed(1) || "N/A"}
                                    </p>

                                    <p className="search-overview">
                                        {item.overview || "No description available."}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

export default Search;
