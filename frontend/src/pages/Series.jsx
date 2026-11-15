import { useEffect, useState } from "react";
import {
    getSeries,
    deleteSeries,
    updateSeriesFavorite
} from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Series.css";

function Series() {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [sortBy, setSortBy] = useState("title-asc");
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadSeries() {
            try {
                const data = await getSeries();
                setSeries(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadSeries();
    }, []);

    const filteredSeries = series.filter(item => {
        const matchesSearch = item.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatus === "All" ||
            item.status === [
                "Plan to Watch",
                "Watching",
                "Watched",
                "On Hold",
                "Dropped",
                "Completed"
            ].indexOf(selectedStatus);

        const matchesFavorite = !showFavoritesOnly || item.isFavorite;

        return matchesSearch && matchesStatus && matchesFavorite;
    });

    const sortedSeries = [...filteredSeries].sort((a, b) => {
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

    async function handleDelete(seriesId, seriesTitle) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${seriesTitle}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteSeries(seriesId);

            setSeries(currentSeries =>
                currentSeries.filter(item => item.id !== seriesId)
            );
        } catch (error) {
            setError(error.message);
        }
    }

    async function handleToggleFavorite(item) {
        try {
            const newFavoriteStatus = !item.isFavorite;

            await updateSeriesFavorite(item.id, newFavoriteStatus);

            setSeries(previousSeries =>
                previousSeries.map(seriesItem =>
                    seriesItem.id === item.id
                        ? { ...seriesItem, isFavorite: newFavoriteStatus }
                        : seriesItem
                )
            );
        } catch (error) {
            setError(error.message);
        }
    }

    if (loading) {
        return <p>Loading series...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="series-page">
            <div className="series-header">
                <h1>Series</h1>
                <p>Total series: {series.length}</p>
            </div>

            <div className="series-controls">
                <input
                    type="text"
                    placeholder="Search series..."
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

            {series.length === 0 ? (
                <p>No series added yet.</p>
            ) : filteredSeries.length === 0 ? (
                <p>No matching series found.</p>
            ) : (
                <div className="series-list">
                    {sortedSeries.map(item => {
                        const progress = item.totalEpisodes > 0
                            ? Math.round((item.watchedEpisodes / item.totalEpisodes) * 100)
                            : 0;

                        return (
                            <div
                                className="series-list-item"
                                key={item.id}
                                onClick={() => navigate(`/series/${item.id}`)}
                            >
                                <button
                                    className={`favorite-button ${item.isFavorite ? "active" : ""}`}
                                    onClick={event => {
                                        event.stopPropagation();
                                        handleToggleFavorite(item);
                                    }}
                                    title={item.isFavorite ? "Remove from favorites" : "Add to favorites"}
                                >
                                    {item.isFavorite ? "★" : "☆"}
                                </button>
                                {item.posterPath ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                                        alt={item.title}
                                    />
                                ) : (
                                    <div className="series-no-poster">
                                        No poster
                                    </div>
                                )}

                                <div className="series-list-info">
                                    <h3>{item.title}</h3>
                                    <div className="series-list-meta">
                                        <span className={`series-status status-${item.status}`}>
                                            {[
                                                "Plan to Watch",
                                                "Watching",
                                                "Watched",
                                                "On Hold",
                                                "Dropped",
                                                "Completed"
                                            ][item.status]}
                                        </span>

                                        {item.rating != null && (
                                            <span className="series-rating">
                                                ★ {item.rating}/10
                                            </span>
                                        )}
                                    </div>

                                    <p>
                                        {item.watchedEpisodes} / {item.totalEpisodes} episodes
                                    </p>

                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    <span>{progress}% completed</span>
                                </div>

                                <button
                                    className="delete-series-button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleDelete(item.id, item.title);
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Series;