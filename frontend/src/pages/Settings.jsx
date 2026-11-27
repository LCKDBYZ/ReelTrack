
import "./Settings.css";

function Settings() {
    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>Settings</h1>
                <p>Manage your data and application information.</p>
            </div>

            <section className="settings-section">
                <h2>Data Management</h2>
                <p className="settings-description">
                    Manage your ReelTrack data and backups.
                </p>

                <div className="settings-options">
                    <div className="settings-option">
                        <div>
                            <h3>Export Data</h3>
                            <p>Export your movies, series and watch history.</p>
                        </div>
                        <button disabled>Export</button>
                    </div>

                    <div className="settings-option">
                        <div>
                            <h3>Import Data</h3>
                            <p>Import data from a previous ReelTrack export.</p>
                        </div>
                        <button disabled>Import</button>
                    </div>

                    <div className="settings-option">
                        <div>
                            <h3>Database Backup</h3>
                            <p>Create or restore a database backup.</p>
                        </div>
                        <button disabled>Backup</button>
                    </div>
                </div>
            </section>

            <section className="settings-section">
                <h2>About</h2>
                <p className="settings-description">
                    Information about ReelTrack.
                </p>

                <div className="about-content">
                    <h3>ReelTrack</h3>
                    <p>Personal movie and TV series tracking application.</p>
                    <p>Version: 1.0.0</p>
                    <p>Built with React, ASP.NET Core and PostgreSQL.</p>
                    <p>Movie and TV metadata provided by TMDB.</p>
                    <p>License: PolyForm Noncommercial License 1.0.0</p>
                </div>
            </section>
        </div>
    );
}

export default Settings;
