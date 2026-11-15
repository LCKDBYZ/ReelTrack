import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/layout/Layout";

import Dashboard from "./pages/DashBoard";
import Movies from "./pages/Movies";
import Series from "./pages/Series";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import SeriesDetails from "./pages/SeriesDetails";
import MovieDetails from "./pages/MovieDetails";
import TmdbDetails from "./pages/TmdbDetails";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/series" element={<Series />} />
        <Route path="/series/:id" element={<SeriesDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/search/:mediaType/:tmdbId" element={<TmdbDetails />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;