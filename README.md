# ReelTrack

ReelTrack is a personal movie and TV series tracking application. It allows users to manage their watchlists, track their progress, rate movies and series, and keep a history of their viewing activity.

The application uses **TMDB (The Movie Database) API** to retrieve movie and TV series information, reducing the need for manual data entry.

## Technologies

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- C#
- ASP.NET Core Web API
- .NET 10
- Entity Framework Core

### Database
- PostgreSQL 17
- Docker

### External API
- TMDB API

## Features

### Movie Management
- Search for movies using TMDB.
- Import movies with their metadata and images.
- View detailed movie information.
- Track personal watch status:
  - Plan to Watch
  - Watching
  - Watched
  - On Hold
  - Dropped
  - Completed
- Add personal ratings.
- Add and manage viewing history, including multiple watches.
- Mark movies as favorites.
- Search, filter, and sort the movie collection.
- Delete movies from the collection.

### TV Series Management
- Search for TV series using TMDB.
- Import series along with their seasons and episodes.
- View detailed series and episode information.
- Track personal watch status and ratings.
- Mark individual episodes as watched or unwatched.
- Mark an entire season as watched.
- Track overall viewing progress.
- Automatically identify the next unwatched episode.
- Synchronize series information with TMDB.
- Synchronize all series at once.
- Mark series as favorites.
- Search, filter, sort, and manage the series collection.

### Dashboard
- View an overview of the personal media collection.
- Track viewing progress.

## How It Works

ReelTrack follows a client-server architecture.

### 1. Frontend

The React application provides the user interface. Users can browse their collections, search for new movies and series, update their tracking information, and manage their viewing history.

The frontend communicates with the backend through HTTP requests.

### 2. Backend

The ASP.NET Core Web API handles application logic and database operations.

It is responsible for:
- Processing frontend requests.
- Managing movies, series, seasons, and episodes.
- Saving user tracking information.
- Communicating with the TMDB API.
- Synchronizing series metadata and episode information.
- Managing viewing history.

### 3. Database

PostgreSQL stores the application's persistent data.

Entity Framework Core is used to communicate with the database.

The database contains information about:
- Movies
- Movie viewing history
- TV series
- Seasons
- Episodes
- Episode viewing history

### 4. TMDB Integration

When a user searches for a movie or series, the backend retrieves matching results from TMDB.

After selecting an item, the user can import it into their collection. The application retrieves the available metadata and stores it in the local database.

For TV series, synchronization can retrieve newly released seasons and episodes and update existing metadata without removing the user's viewing history.

## Project Structure

```text
ReelTrack/
├── backend/
│   └── ReelTrack.Api/
│       ├── Controllers/
│       ├── Data/
│       ├── Dtos/
│       ├── Migrations/
│       ├── Models/
│       └── Services/
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
│
├── database/
├── docs/
├── docker-compose.yml
└── .gitignore
```

## Requirements

Make sure the following tools are installed:

- .NET 10 SDK
- Node.js and npm
- Docker Desktop
- Git

A TMDB API key is also required for movie and series search and metadata retrieval.

## Configuration

The PostgreSQL connection settings are configured through environment variables in the root `.env` file.

Example:

```env
POSTGRES_DB=reeltrack
POSTGRES_USER=reeltrack_user
POSTGRES_PASSWORD=your_password
```

TMDB API configuration must also be provided to the backend.

Do not commit API keys, passwords, or other sensitive configuration files to Git.

## How to Run (Current Version)

Start the application components in separate terminals.

### 1. Start the Database

From the main project directory:

```bash
docker compose up
```

This starts the PostgreSQL database using Docker Compose.

### 2. Start the Frontend

Navigate to the frontend directory:

```bash
cd frontend
npm run dev
```

Vite starts the frontend development server.

### 3. Start the Backend

Navigate to the backend project directory:

```bash
cd backend/ReelTrack.Api
dotnet run --launch-profile https
```

The ASP.NET Core API starts using the HTTPS launch profile.

The frontend communicates with the backend through its configured API base URL.

## Current Development Status

ReelTrack is currently under active development.

The current version focuses on the core functionality of a personal movie and TV series tracking application. Additional features, improvements, and UI refinements may be introduced in future versions.

