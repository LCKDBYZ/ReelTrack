import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    getSeriesById,
    markEpisodeAsWatched,
    removeEpisodeWatch,
    updateSeries,
    markSeasonAsWatched,
    syncSeries
} from "../services/api";

import "./SeriesDetails.css";
import SyncResultModal from "../components/common/SyncResultModal";

function SeriesDetails() {
    const { id } = useParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingEpisode, setUpdatingEpisode] = useState(null);
    const [expandedSeasons, setExpandedSeasons] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedRating, setSelectedRating] = useState("");
    const [savingDetails, setSavingDetails] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);

    useEffect(() => {
        async function loadSeries() {
            try {
                const result = await getSeriesById(id);
                setData(result);
                setSelectedStatus(String(result.series.status));
                setSelectedRating(result.series.rating ?? "");
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadSeries();
    }, [id]);

    async function handleMarkAsWatched(episodeId) {
        try {
            setUpdatingEpisode(episodeId);

            await markEpisodeAsWatched(episodeId);

            const updatedData = await getSeriesById(id);
            setData(updatedData);
        } catch (error) {
            setError(error.message);
        } finally {
            setUpdatingEpisode(null);
        }
    }

    async function handleMarkSeasonAsWatched(seasonId) {
        try {
            setUpdatingEpisode(seasonId);

            await markSeasonAsWatched(seasonId);

            const updatedData = await getSeriesById(id);
            setData(updatedData);
        } catch (error) {
            setError(error.message);
        } finally {
            setUpdatingEpisode(null);
        }
    }

    function toggleSeason(seasonId) {
        setExpandedSeasons(current =>
            current.includes(seasonId)
                ? current.filter(id => id !== seasonId)
                : [...current, seasonId]
        );
    }

    async function handleRemoveWatch(episodeId, watchId) {
        try {
            setUpdatingEpisode(episodeId);

            await removeEpisodeWatch(episodeId, watchId);

            const updatedData = await getSeriesById(id);
            setData(updatedData);
        } catch (error) {
            setError(error.message);
        } finally {
            setUpdatingEpisode(null);
        }
    }

    async function handleSaveDetails() {
        try {
            setSavingDetails(true);

            await updateSeries(id, {
                status: Number(selectedStatus),
                rating: selectedRating === "" ? null : Number(selectedRating)
            });

            const updatedData = await getSeriesById(id);
            setData(updatedData);
        } catch (error) {
            setError(error.message);
        } finally {
            setSavingDetails(false);
        }
    }

    async function handleSync() {
        try {
            setSyncing(true);

            const result = await syncSeries(id);
            setSyncResult(result);
            const updatedData = await getSeriesById(id);
            setData(updatedData);

        } catch (error) {
            setError(error.message);
        } finally {
            setSyncing(false);
        }
    }

    if (loading) {
        return <p>Loading series...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!data || !data.series) {
        return <p>Series not found.</p>;
    }

    const series = data.series;
    const totalEpisodes = series.seasons.reduce(
        (total, season) => total + season.episodes.length,
        0
    );

    const watchedEpisodes = series.seasons.reduce(
        (total, season) =>
            total + season.episodes.filter(episode => episode.isWatched).length,
        0
    );

    const progress = totalEpisodes > 0
        ? Math.round((watchedEpisodes / totalEpisodes) * 100)
        : 0;



    return (
        <div className="series-details">
            <div
                className="series-hero"
                style={{
                    backgroundImage: series.backdropPath
                        ? `linear-gradient(to right, #141414 20%, rgba(20, 20, 20, 0.7)), url(https://image.tmdb.org/t/p/original${series.backdropPath})`
                        : "none"
                }}
            >

                {series.posterPath && (
                    <img
                        className="series-poster"
                        src={`https://image.tmdb.org/t/p/w500${series.posterPath}`}
                        alt={series.title}
                    />
                )}

                <div className="series-hero-info">
                    <h1>{series.title}</h1>

                    <p>{series.overview}</p>

                    <div className="series-settings">
                        <div>
                            <label htmlFor="series-status">Status</label>
                            <select
                                id="series-status"
                                value={selectedStatus}
                                onChange={e => setSelectedStatus(e.target.value)}
                            >
                                <option value="0">Plan to Watch</option>
                                <option value="1">Watching</option>
                                <option value="2">Watched</option>
                                <option value="3">On Hold</option>
                                <option value="4">Dropped</option>
                                <option value="5">Completed</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="series-rating">Your rating</label>
                            <select
                                id="series-rating"
                                value={selectedRating}
                                onChange={e => setSelectedRating(e.target.value)}
                            >
                                <option value="">Not rated</option>
                                {Array.from({ length: 10 }, (_, i) => i + 1).map(rating => (
                                    <option key={rating} value={rating}>
                                        {rating} / 10
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleSaveDetails}
                            disabled={savingDetails}
                        >
                            {savingDetails ? "Saving..." : "Save changes"}
                        </button>

                        <button
                            onClick={handleSync}
                            disabled={syncing}
                        >
                            {syncing ? "Syncing..." : "Sync with TMDB"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="series-progress">
                <div className="series-progress-info">
                    <h2>Progress</h2>
                    <span>
                        {watchedEpisodes} / {totalEpisodes} episodes ({progress}%)
                    </span>
                </div>

                <div className="series-progress-bar">
                    <div
                        className="series-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="next-episode">
                <h2>Next Episode</h2>

                {data.nextEpisode ? (
                    <div className="next-episode-info">
                        <span className="next-episode-number">
                            S{data.nextEpisode.seasonNumber}E{data.nextEpisode.episodeNumber}
                        </span>

                        <h3>{data.nextEpisode.title}</h3>

                        <p>
                            {data.nextEpisode.overview || "No description available."}
                        </p>
                        <button
                            className="episode-watch-button"
                            onClick={() => handleMarkAsWatched(data.nextEpisode.id)}
                            disabled={updatingEpisode === data.nextEpisode.id}
                        >
                            {updatingEpisode === data.nextEpisode.id
                                ? "Updating..."
                                : "Mark as watched"}
                        </button>
                    </div>
                ) : (
                    <p>All episodes watched!</p>
                )}
            </div>

            <h2>Seasons</h2>

            {[...series.seasons]
                .sort((a, b) => a.seasonNumber - b.seasonNumber)
                .map(season => {
                    const watchedCount = season.episodes.filter(
                        episode => episode.isWatched
                    ).length;

                    const seasonProgress = season.episodes.length > 0
                        ? Math.round((watchedCount / season.episodes.length) * 100)
                        : 0;

                    const isExpanded = expandedSeasons.includes(season.id);

                    return (
                        <section className="season-section" key={season.id}>
                            <div
                                className="season-header"
                                onClick={() => toggleSeason(season.id)}
                            >
                                <div className="season-header-info">
                                    <h3>{season.name}</h3>
                                    <p>
                                        {watchedCount} / {season.episodes.length} episodes
                                        {" · "}
                                        {seasonProgress}%
                                    </p>

                                    <div className="season-progress-bar">
                                        <div
                                            className="season-progress-fill"
                                            style={{ width: `${seasonProgress}%` }}
                                        />
                                    </div>
                                </div>

                                <button
                                    className="season-watch-button"
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleMarkSeasonAsWatched(season.id);
                                    }}
                                    disabled={
                                        updatingEpisode === season.id ||
                                        season.episodes.every(episode => episode.isWatched)
                                    }
                                >
                                    {updatingEpisode === season.id
                                        ? "Updating..."
                                        : "Mark season as watched"}
                                </button>

                                <span>{isExpanded ? "-" : "+"}</span>
                            </div>

                            {isExpanded && (
                                <div className="season-episodes">
                                    {season.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber).map(episode => (
                                        <div className="episode-row" key={episode.id}>
                                            <div className="episode-info">
                                                <div className="episode-title">
                                                    <span>
                                                        S{season.seasonNumber}E{episode.episodeNumber}
                                                    </span>

                                                    <h4>{episode.title}</h4>

                                                    {episode.isWatched && <span className="watched-label">Watched ✓</span>}
                                                </div>

                                                {episode.overview && (
                                                    <p>{episode.overview}</p>
                                                )}

                                                <div className="episode-metadata">
                                                    {episode.airDate && (
                                                        <span>{episode.airDate}</span>
                                                    )}

                                                    {episode.runtime && (
                                                        <span>{episode.runtime} min</span>
                                                    )}
                                                </div>
                                            </div>

                                            {episode.isWatched ? (
                                                <button
                                                    onClick={() => handleRemoveWatch(episode.id, episode.watchId)}
                                                    disabled={updatingEpisode === episode.id}
                                                >
                                                    {updatingEpisode === episode.id
                                                        ? "Updating..."
                                                        : "Undo watched"}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleMarkAsWatched(episode.id)}
                                                    disabled={updatingEpisode === episode.id}
                                                >
                                                    {updatingEpisode === episode.id
                                                        ? "Updating..."
                                                        : "Mark as watched"}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    );
                })}
            <SyncResultModal
                result={syncResult}
                onClose={() => setSyncResult(null)}
                title="Series synchronized!"
            />
        </div>
    );
}

export default SeriesDetails;