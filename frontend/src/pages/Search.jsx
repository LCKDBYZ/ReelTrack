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

    const navigate = useNavigate();

    useEffect(() => {
        if (searchTerm.trim()) {
            handleSearch({ preventDefault: () => { } });
        }
    }, []);

    async function handleSearch(event) {
        event.preventDefault();

        if (!searchTerm.trim()) {
            return;
        }
        sessionStorage.setItem("reeltrackSearchTerm", searchTerm.trim());

        try {
            setLoading(true);
            setError(null);
            setHasSearched(true);

            const [movieResults, seriesResults] = await Promise.all([
                searchMovies(searchTerm.trim()),
                searchSeries(searchTerm.trim())
            ]);


            setMovies(movieResults);
            setSeries(seriesResults);
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

    results.sort((a, b) =>
        (b.voteAverage || 0) - (a.voteAverage || 0)
    );

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

            {loading && <p>Searching...</p>}

            {error && <p className="search-error">Error: {error}</p>}

            {!loading && hasSearched && !error && (
                results.length === 0 ? (
                    <p>No results found.</p>
                ) : (
                    <div className="search-results">
                        {results.map(item => (
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
