import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getTmdbMovieDetails,
    getTmdbSeriesDetails,
    importMovie,
    importSeries
} from "../services/api";

import "./TmdbDetails.css";

function TmdbDetails() {
    const { mediaType, tmdbId } = useParams();

    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importMessage, setImportMessage] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        async function loadDetails() {
            try {
                setLoading(true);
                setError(null);

                const data = mediaType === "movie"
                    ? await getTmdbMovieDetails(tmdbId)
                    : await getTmdbSeriesDetails(tmdbId);

                setDetails(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadDetails();
    }, [mediaType, tmdbId]);

    async function handleImport() {
        try {
            setImporting(true);
            setImportMessage(null);

            if (mediaType === "movie") {
                await importMovie(tmdbId);
            } else {
                await importSeries(tmdbId);
            }

            setImportMessage("Successfully imported!");
        } catch (error) {
            setImportMessage(error.message);
        } finally {
            setImporting(false);
        }
    }

    if (loading) {
        return <p>Loading details...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!details) {
        return <p>No details found.</p>;
    }

    const title = details.title || details.name;
    const releaseDate = details.release_date || details.first_air_date;

    const genres = details.genres?.map(genre => genre.name) || [];

    const voteAverage = details.vote_average;

    const isMovie = mediaType === "movie";

    return (


        <div className="tmdb-details">
            {details.backdrop_path && (
                <div
                    className="tmdb-backdrop"
                    style={{
                        backgroundImage: `url(https://image.tmdb.org/t/p/original${details.backdrop_path})`
                    }}
                />
            )}

            <div className="tmdb-details-content">

                {importMessage && (
                    <p className="tmdb-import-message">{importMessage}</p>
                )}

                <div className="tmdb-main-info">
                    {details.poster_path && (
                        <img
                            className="tmdb-poster"
                            src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                            alt={title}
                        />
                    )}

                    <div className="tmdb-text-info">
                        <h1>{title}</h1>

                        <p className="tmdb-release-date">
                            {releaseDate || "Unknown release date"}

                        </p>

                        {genres.length > 0 && (
                            <div className="tmdb-genres">
                                {genres.map(genre => (
                                    <span key={genre}>{genre}</span>
                                ))}
                            </div>
                        )}

                        {voteAverage > 0 && (
                            <p className="tmdb-rating">
                                ★ {voteAverage.toFixed(1)} / 10
                            </p>
                        )}

                        <div className="tmdb-extra-info">
                            {isMovie ? (
                                details.runtime > 0 && (
                                    <span>{details.runtime} minutes</span>
                                )
                            ) : (
                                <>
                                    <span>{details.number_of_seasons} seasons</span>
                                    <span>{details.number_of_episodes} episodes</span>
                                    {details.status && <span>{details.status}</span>}
                                </>
                            )}
                        </div>

                        <h2>Overview</h2>

                        <p className="tmdb-overview">
                            {details.overview || "No description available."}
                        </p>
                    </div>
                </div>
                <div className="tmdb-details-actions">
                    <button onClick={() => navigate(-1)}>
                        ← Back to search
                    </button>

                    <button onClick={handleImport} disabled={importing}>
                        {importing ? "Importing..." : "Import"}
                    </button>
                </div>
                {!isMovie && details.seasons?.length > 0 && (
                    <div className="tmdb-seasons">
                        <h2>Seasons</h2>

                        <div className="tmdb-seasons-list">
                            {details.seasons.map(season => (
                                <div className="tmdb-season" key={season.id}>
                                    {season.poster_path && (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w200${season.poster_path}`}
                                            alt={season.name}
                                        />
                                    )}

                                    <div className="tmdb-season-info">
                                        <h3>{season.name}</h3>
                                        <p>{season.episode_count} episodes</p>
                                        <p>{season.air_date || "Unknown release date"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default TmdbDetails;