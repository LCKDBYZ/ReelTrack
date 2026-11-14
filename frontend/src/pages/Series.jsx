import { useEffect, useState } from "react";
import { getSeries } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Series.css";

function Series() {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

            {series.length === 0 ? (
                <p>No series added yet.</p>
            ) : (
                <div className="series-list">
                    {series.map(item => {
                        const progress = item.totalEpisodes > 0
                            ? Math.round((item.watchedEpisodes / item.totalEpisodes) * 100)
                            : 0;

                        return (
                            <div
                                className="series-list-item"
                                key={item.id}
                                onClick={() => navigate(`/series/${item.id}`)}
                            >
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
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Series;