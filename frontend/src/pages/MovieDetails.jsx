
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    getMovieById,
    updateMovieTracking,
    getMovieWatches,
    addMovieWatch,
    deleteMovieWatch
} from "../services/api";

import "./MovieDetails.css";

function MovieDetails() {
    const { id } = useParams();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedStatus, setSelectedStatus] = useState(0);
    const [selectedRating, setSelectedRating] = useState("");

    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    const [watches, setWatches] = useState([]);
    const [selectedWatchDate, setSelectedWatchDate] = useState(() => {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    });

    const [watchLoading, setWatchLoading] = useState(false);

    useEffect(() => {
        async function loadMovie() {
            try {
                const data = await getMovieById(id);
                const watchData = await getMovieWatches(id);
                setWatches(watchData);

                setMovie(data);
                setSelectedStatus(data.status);
                setSelectedRating(data.rating ?? "");
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadMovie();
    }, [id]);

    async function handleSave() {
        try {
            setSaving(true);
            setSaveMessage("");

            const updatedMovie = await updateMovieTracking(id, {
                status: Number(selectedStatus),
                rating: selectedRating === ""
                    ? null
                    : Number(selectedRating)
            });

            setMovie(prev => ({
                ...prev,
                status: updatedMovie.status,
                rating: updatedMovie.rating
            }));

            setSaveMessage("Changes saved successfully.");
        } catch (error) {
            setSaveMessage(`Error: ${error.message}`);
        } finally {
            setSaving(false);
        }
    }
    async function handleAddWatch() {
        try {
            setWatchLoading(true);
            setSaveMessage("");

            const watchedAt = `${selectedWatchDate}T12:00:00.000Z`;

            await addMovieWatch(id, watchedAt);

            const updatedWatches = await getMovieWatches(id);
            setWatches(updatedWatches);

        } catch (error) {
            setSaveMessage(`Error: ${error.message}`);
        } finally {
            setWatchLoading(false);
        }
    }

    async function handleDeleteWatch(watchId) {
        try {
            await deleteMovieWatch(id, watchId);

            setWatches(prev =>
                prev.filter(watch => watch.id !== watchId)
            );
        } catch (error) {
            setSaveMessage(`Error: ${error.message}`);
        }
    }

    if (loading) return <p>Loading movie...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!movie) return <p>Movie not found.</p>;

    return (
        <div className="movie-details-page">
            <div
                className="movie-hero"
                style={
                    movie.backdropPath
                        ? {
                            backgroundImage: `linear-gradient(to right, rgba(27,27,27,0.95), rgba(27,27,27,0.7)), url(https://image.tmdb.org/t/p/original${movie.backdropPath})`
                        }
                        : {}
                }
            >
                {movie.posterPath && (
                    <img
                        className="movie-poster"
                        src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                        alt={movie.title}
                    />
                )}

                <div className="movie-hero-info">
                    <h1>{movie.title}</h1>

                    <div className="movie-metadata">
                        {movie.releaseDate && (
                            <span>{movie.releaseDate}</span>
                        )}

                        {movie.runtime && (
                            <span>{movie.runtime} min</span>
                        )}
                    </div>

                    <p className="movie-overview">
                        {movie.overview || "No description available."}
                    </p>
                </div>
            </div>

            <div className="movie-settings">
                <h2>My Tracking</h2>

                <div>
                    <label htmlFor="movie-status">Status</label>
                    <select
                        id="movie-status"
                        value={selectedStatus}
                        onChange={e => setSelectedStatus(Number(e.target.value))}
                    >
                        <option value={0}>Plan to Watch</option>
                        <option value={1}>Watching</option>
                        <option value={2}>Watched</option>
                        <option value={3}>On Hold</option>
                        <option value={4}>Dropped</option>
                        <option value={5}>Completed</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="movie-rating">My Rating</label>
                    <select
                        id="movie-rating"
                        value={selectedRating}
                        onChange={e => setSelectedRating(e.target.value)}
                    >
                        <option value="">Not rated</option>

                        {Array.from(
                            { length: 10 },
                            (_, i) => i + 1
                        ).map(rating => (
                            <option key={rating} value={rating}>
                                {rating}/10
                            </option>
                        ))}
                    </select>
                </div>

                <button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </button>

                {saveMessage && (
                    <p className="movie-save-message">
                        {saveMessage}
                    </p>
                )}
            </div>

            <div className="movie-watches">
                <h2>Watch History</h2>

                <div className="movie-watch-form">
                    <div>
                        <label htmlFor="watch-date">
                            Watched date
                        </label>

                        <input
                            id="watch-date"
                            type="date"
                            value={selectedWatchDate}
                            onChange={e => setSelectedWatchDate(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleAddWatch}
                        disabled={watchLoading || !selectedWatchDate}
                    >
                        {watchLoading ? "Adding..." : "Add Watch"}
                    </button>
                </div>

                {watches.length === 0 ? (
                    <p>No watch history yet.</p>
                ) : (
                    <div className="movie-watch-list">
                        {watches.map(watch => (
                            <div className="movie-watch-item" key={watch.id}>
                                <span>
                                    {new Date(watch.watchedAt).toLocaleDateString()}
                                </span>

                                <button
                                    onClick={() => handleDeleteWatch(watch.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MovieDetails;
