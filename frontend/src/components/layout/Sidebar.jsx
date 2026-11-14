import { NavLink } from "react-router-dom";
import {
    House,
    Clapperboard,
    Tv,
    Search,
    Settings
} from "lucide-react";

import "./Sidebar.css";

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <Clapperboard size={28} />
                <h2>ReelTrack</h2>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" end className={({ isActive }) =>
                    isActive ? "sidebar-link active" : "sidebar-link"
                }>
                    <House size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/movies" className={({ isActive }) =>
                    isActive ? "sidebar-link active" : "sidebar-link"
                }>
                    <Clapperboard size={20} />
                    <span>Movies</span>
                </NavLink>

                <NavLink to="/series" className={({ isActive }) =>
                    isActive ? "sidebar-link active" : "sidebar-link"
                }>
                    <Tv size={20} />
                    <span>Series</span>
                </NavLink>

                <NavLink to="/search" className={({ isActive }) =>
                    isActive ? "sidebar-link active" : "sidebar-link"
                }>
                    <Search size={20} />
                    <span>Search</span>
                </NavLink>
            </nav>

            <div className="sidebar-bottom">
                <NavLink to="/settings" className={({ isActive }) =>
                    isActive ? "sidebar-link active" : "sidebar-link"
                }>
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>
            </div>
        </aside>
    );
}

export default Sidebar;