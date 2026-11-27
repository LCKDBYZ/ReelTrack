const API_BASE_URL = "https://localhost:7033/api";

async function request(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}

export const getMovies = () => request("/movies");

export const getSeries = () => request("/series");

export const getSeriesById = (id) => request(`/series/${id}`);

export const getEpisodeStats = () => request("/episodes/stats");

export const markEpisodeAsWatched = (id) =>
    fetch(`${API_BASE_URL}/episodes/${id}/watches`, {
        method: "POST"
    }).then(async response => {
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    });

export const removeEpisodeWatch = (episodeId, watchId) =>
    fetch(`${API_BASE_URL}/episodes/${episodeId}/watches/${watchId}`, {
        method: "DELETE"
    }).then(response => {
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
    });

export const updateSeries = (id, data) =>
    fetch(`${API_BASE_URL}/series/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(async response => {
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `API error: ${response.status}`);
        }

        return response.json();
    });

export const updateMovieTracking = (id, data) =>
    fetch(`${API_BASE_URL}/movies/${id}/tracking`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(async response => {
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `API error: ${response.status}`);
        }

        return response.json();
    });

export const getMovieById = (id) => request(`/movies/${id}`);

// Get movie watch history
export const getMovieWatches = (movieId) =>
    request(`/movies/${movieId}/watches`);

// Add a movie watch
export const addMovieWatch = (movieId, watchedAt = null) =>
    fetch(`${API_BASE_URL}/movies/${movieId}/watches`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ watchedAt })
    }).then(async response => {
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `API error: ${response.status}`);
        }

        return response.json();
    });

// Delete a movie watch
export const deleteMovieWatch = (movieId, watchId) =>
    fetch(`${API_BASE_URL}/movies/${movieId}/watches/${watchId}`, {
        method: "DELETE"
    }).then(response => {
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
    });

export const getRecentWatches = () =>
    request("/dashboard/recent-watches");

export const markSeasonAsWatched = (seasonId) =>
    fetch(`${API_BASE_URL}/series/seasons/${seasonId}/watch`, {
        method: "POST"
    }).then(async response => {
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `API error: ${response.status}`);
        }

        return response.json();
    });

export const deleteMovie = (id) =>
    fetch(`${API_BASE_URL}/movies/${id}`, {
        method: "DELETE"
    }).then(response => {
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
    });

export const deleteSeries = (id) =>
    fetch(`${API_BASE_URL}/series/${id}`, {
        method: "DELETE"
    }).then(response => {
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
    });

export const updateMovieFavorite = (id, isFavorite) =>
    fetch(`${API_BASE_URL}/movies/${id}/favorite`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ isFavorite })
    }).then(async response => {
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    });

export const updateSeriesFavorite = (id, isFavorite) =>
    fetch(`${API_BASE_URL}/series/${id}/favorite`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ isFavorite })
    }).then(async response => {
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    });

export const searchMovies = (query) =>
    request(`/movies/search?query=${encodeURIComponent(query)}`);

export const searchSeries = (query) =>
    request(`/series/search?query=${encodeURIComponent(query)}`);

export const getTmdbMovieDetails = (tmdbId) =>
    request(`/movies/tmdb/${tmdbId}`);

export const getTmdbSeriesDetails = (tmdbId) =>
    request(`/series/tmdb/${tmdbId}`);

export const importMovie = (tmdbId) =>
    fetch(`${API_BASE_URL}/movies/import/${tmdbId}`, {
        method: "POST"
    }).then(async response => {
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `API error: ${response.status}`);
        }

        return response.json();
    });

export const importSeries = (tmdbId) =>
    fetch(`${API_BASE_URL}/series/import/${tmdbId}`, {
        method: "POST"
    }).then(async response => {
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `API error: ${response.status}`);
        }

        return response.json();
    });

export const syncSeries = (id) =>
    fetch(`${API_BASE_URL}/series/${id}/sync`, {
        method: "POST"
    }).then(async response => {
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `API error: ${response.status}`);
        }

        return response.json();
    });

export const syncAllSeries = () =>
    fetch(`${API_BASE_URL}/series/sync`, {
        method: "POST"
    }).then(async response => {
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `API error: ${response.status}`);
        }

        return response.json();
    });


// Export application data as a JSON backup
export const exportData = async () => {
    const response = await fetch(`${API_BASE_URL}/data/export`);

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.blob();
};

// Import application data from a JSON backup
export const importData = async (data, mode) => {
    const response = await fetch(
        `${API_BASE_URL}/data/import?mode=${mode}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `API error: ${response.status}`);
    }

    return response.json();
};

// Create a complete PostgreSQL database backup
export const createDatabaseBackup = async () => {
    const response = await fetch(`${API_BASE_URL}/database/backup`);

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `API error: ${response.status}`);
    }

    return response.blob();
};

// Restore the PostgreSQL database from an SQL backup
export const restoreDatabaseBackup = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/database/restore`, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `API error: ${response.status}`);
    }

    return response.json();
};
