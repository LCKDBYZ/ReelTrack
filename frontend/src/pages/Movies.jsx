
import { useEffect, useState } from "react";
import { getMovies, deleteMovie } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Movies.css";

function Movies() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

            {movies.length === 0 ? (
                <p>No movies added yet.</p>
            ) : (
                <div className="movies-list">
                    {movies.map(movie => (
                        <div
                            className="movie-list-item"
                            key={movie.id}
                            onClick={() => navigate(`/movies/${movie.id}`)}
                        >
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
