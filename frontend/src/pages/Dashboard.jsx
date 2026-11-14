import { useEffect, useState } from "react";
import {
    getMovies,
    getSeries,
    getEpisodeStats
} from "../services/api";
import "./Dashboard.css";

function Dashboard() {
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [episodeStats, setEpisodeStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [movieData, seriesData, episodeData] =
                    await Promise.all([
                        getMovies(),
                        getSeries(),
                        getEpisodeStats()
                    ]);

                setMovies(movieData);
                setSeries(seriesData);
                setEpisodeStats(episodeData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    const continueWatching = series.filter(
        item => item.watchedEpisodes > 0 &&
            item.watchedEpisodes < item.totalEpisodes
    );

    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Movies</h3>
                    <p>{movies.length}</p>
                </div>

                <div className="stat-card">
                    <h3>Series</h3>
                    <p>{series.length}</p>
                </div>

                <div className="stat-card">
                    <h3>Watched Episodes</h3>
                    <p>{episodeStats.watchedEpisodes}</p>
                </div>
            </div>

            <section className="continue-watching">
                <h2>Continue Watching</h2>

                {continueWatching.length === 0 ? (
                    <p>No series in progress yet.</p>
                ) : (
                    <div className="continue-watching-grid">
                        {continueWatching.map(item => {
                            const progress = Math.round(
                                (item.watchedEpisodes / item.totalEpisodes) * 100
                            );

                            return (
                                <div className="series-card" key={item.id}>
                                    {item.posterPath && (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                                            alt={item.title}
                                        />
                                    )}

                                    <div className="series-card-info">
                                        <h3>{item.title}</h3>

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

                                        {item.nextEpisode && (
                                            <p>
                                                Next: S{item.nextEpisode.seasonNumber}E
                                                {item.nextEpisode.episodeNumber} – {item.nextEpisode.title}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Dashboard;