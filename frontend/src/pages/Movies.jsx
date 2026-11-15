
import { useEffect, useState } from "react";
import {
    getMovies,
    deleteMovie,
    updateMovieFavorite
} from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Movies.css";

function Movies() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [sortBy, setSortBy] = useState("title-asc");
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadMovies() {
            try {
                const data = await getMovies();
                setMovies(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadMovies();
    }, []);

    async function handleDelete(movieId, movieTitle) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${movieTitle}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteMovie(movieId);

            setMovies(currentMovies =>
                currentMovies.filter(movie => movie.id !== movieId)
            );
        } catch (error) {
            setError(error.message);
        }
    }

    async function handleToggleFavorite(movie) {
        try {
            const newFavoriteStatus = !movie.isFavorite;

            await updateMovieFavorite(movie.id, newFavoriteStatus);

            setMovies(previousMovies =>
                previousMovies.map(item =>
                    item.id === movie.id
                        ? { ...item, isFavorite: newFavoriteStatus }
                        : item
                )
            );
        } catch (error) {
            setError(error.message);
        }
    }

    const filteredMovies = movies.filter(movie => {
        const matchesSearch = movie.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatus === "All" ||
            movie.status === [
                "Plan to Watch",
                "Watching",
                "Watched",
                "On Hold",
                "Dropped",
                "Completed"
            ].indexOf(selectedStatus);

        const matchesFavorite = !showFavoritesOnly || movie.isFavorite;

        return matchesSearch && matchesStatus && matchesFavorite;
    });

    const sortedMovies = [...filteredMovies].sort((a, b) => {
        if (sortBy === "title-asc") {
            return a.title.localeCompare(b.title);
        }

        if (sortBy === "title-desc") {
            return b.title.localeCompare(a.title);
        }

        if (sortBy === "date-desc") {
            return new Date(b.addedAt) - new Date(a.addedAt);
        }

        return 0;
    });

    if (loading) {
        return <p>Loading movies...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="movies-page">
            <div className="movies-header">
                <h1>Movies</h1>
                <p>Total movies: {movies.length}</p>
            </div>
            <div className="movies-controls">
                <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                />
                <label className="favorites-filter">
                    <input
                        type="checkbox"
                        checked={showFavoritesOnly}
                        onChange={event => setShowFavoritesOnly(event.target.checked)}
                    />
                    Only favorites
                </label>

                <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                >
                    <option value="All">All statuses</option>
                    <option value="Plan to Watch">Plan to Watch</option>
                    <option value="Watching">Watching</option>
                    <option value="Watched">Watched</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Dropped">Dropped</option>
                    <option value="Completed">Completed</option>
                </select>

                <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                >
                    <option value="title-asc">Title (A-Z)</option>
                    <option value="title-desc">Title (Z-A)</option>
                    <option value="date-desc">Recently Added</option>
                </select>
            </div>

            {movies.length === 0 ? (
                <p>No movies added yet.</p>
            ) : sortedMovies.length === 0 ? (
                <p>No matching movies found.</p>
            ) : (
                <div className="movies-list">
                    {sortedMovies.map(movie => (
                        <div
                            className="movie-list-item"
                            key={movie.id}
                            onClick={() => navigate(`/movies/${movie.id}`)}
                        >
                            <button
                                className={`favorite-button ${movie.isFavorite ? "active" : ""}`}
                                onClick={event => {
                                    event.stopPropagation();
                                    handleToggleFavorite(movie);
                                }}
                                title={movie.isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                {movie.isFavorite ? "★" : "☆"}
                            </button>
                            {movie.posterPath ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                                    alt={movie.title}
                                />
                            ) : (
                                <div className="movie-no-poster">
                                    No poster
                                </div>
                            )}

                            <div className="movie-list-info">
                                <h3>{movie.title}</h3>

                                <div className="movie-list-meta">
                                    <span className={`movie-status status-${movie.status}`}>
                                        {[
                                            "Plan to Watch",
                                            "Watching",
                                            "Watched",
                                            "On Hold",
                                            "Dropped",
                                            "Completed"
                                        ][movie.status]}
                                    </span>

                                    {movie.rating != null && (
                                        <span className="movie-rating">
                                            ★ {movie.rating}/10
                                        </span>
                                    )}
                                </div>

                                {movie.releaseDate && (
                                    <p>{movie.releaseDate}</p>
                                )}

                                <button
                                    className="delete-movie-button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleDelete(movie.id, movie.title);
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Movies;
