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