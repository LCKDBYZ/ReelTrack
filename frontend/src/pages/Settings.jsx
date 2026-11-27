
import { useRef, useState } from "react";
import {
    exportData,
    importData,
    createDatabaseBackup,
    restoreDatabaseBackup
} from "../services/api";
import "./Settings.css";

function Settings() {
    const importInputRef = useRef(null);
    const restoreInputRef = useRef(null);

    const [confirmation, setConfirmation] = useState(null);
    const [selectedImportFile, setSelectedImportFile] = useState(null);
    const [selectedRestoreFile, setSelectedRestoreFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const downloadFile = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        link.click();

        window.URL.revokeObjectURL(url);
    };

    const handleExport = async () => {
        try {
            setLoading(true);
            setMessage(null);

            const blob = await exportData();
            downloadFile(blob, "reeltrack-backup.json");

            setMessage({
                type: "success",
                text: "Data exported successfully."
            });
        } catch (error) {
            setMessage({
                type: "error",
                text: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!selectedImportFile) return;

        try {
            setLoading(true);
            setMessage(null);

            const content = await selectedImportFile.text();
            const data = JSON.parse(content);

            const result = await importData(data, confirmation.mode);

            setMessage({
                type: "success",
                text: `Import completed. Movies: ${result.importedMovies}, Series: ${result.importedSeries}, Skipped movies: ${result.skippedMovies}, Skipped series: ${result.skippedSeries}.`
            });

            setSelectedImportFile(null);
            setConfirmation(null);

            if (importInputRef.current) {
                importInputRef.current.value = "";
            }
        } catch (error) {
            setMessage({
                type: "error",
                text: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDatabaseBackup = async () => {
        try {
            setLoading(true);
            setMessage(null);

            const blob = await createDatabaseBackup();

            downloadFile(
                blob,
                `reeltrack-database-backup-${new Date().toISOString().slice(0, 10)}.zip`
            );

            setMessage({
                type: "success",
                text: "Database backup created successfully."
            });
        } catch (error) {
            setMessage({
                type: "error",
                text: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!selectedRestoreFile) return;

        try {
            setLoading(true);
            setMessage(null);

            await restoreDatabaseBackup(selectedRestoreFile);

            setMessage({
                type: "success",
                text: "Database restored successfully. Reload the application to refresh its data."
            });

            setSelectedRestoreFile(null);
            setConfirmation(null);

            if (restoreInputRef.current) {
                restoreInputRef.current.value = "";
            }
        } catch (error) {
            setMessage({
                type: "error",
                text: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const openImportConfirmation = (mode) => {
        if (!selectedImportFile) return;

        setConfirmation({
            type: "import",
            mode
        });
    };

    const openRestoreConfirmation = () => {
        if (!selectedRestoreFile) return;

        setConfirmation({
            type: "restore"
        });
    };

    const handleConfirmation = () => {
        if (confirmation.type === "import") {
            handleImport();
        } else if (confirmation.type === "restore") {
            handleRestore();
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>Settings</h1>
                <p>Manage your data and application information.</p>
            </div>

            {message && (
                <div className={`settings-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <section className="settings-section">
                <h2>Data Management</h2>
                <p className="settings-description">
                    Manage your ReelTrack data and backups.
                </p>

                <div className="settings-options">
                    <div className="settings-option">
                        <div>
                            <h3>Export Data</h3>
                            <p>
                                Export your movies, series and watch history
                                as a JSON file.
                            </p>
                        </div>

                        <button onClick={handleExport} disabled={loading}>
                            Export
                        </button>
                    </div>

                    <div className="settings-option">
                        <div>
                            <h3>Import Data</h3>
                            <p>
                                Import data from a previous ReelTrack JSON
                                export. Merge keeps existing data, while
                                Replace overwrites your collection.
                            </p>

                            <input
                                ref={importInputRef}
                                type="file"
                                accept=".json,application/json"
                                hidden
                                onChange={(event) => {
                                    setSelectedImportFile(
                                        event.target.files[0] || null
                                    );
                                    setMessage(null);
                                }}
                            />

                            <button
                                className="secondary-button"
                                onClick={() => importInputRef.current.click()}
                                disabled={loading}
                            >
                                Choose JSON file
                            </button>

                            {selectedImportFile && (
                                <p className="selected-file">
                                    Selected: {selectedImportFile.name}
                                </p>
                            )}

                            <div className="import-buttons">
                                <button
                                    onClick={() => openImportConfirmation("merge")}
                                    disabled={loading || !selectedImportFile}
                                >
                                    Merge
                                </button>

                                <button
                                    className="danger-button"
                                    onClick={() => openImportConfirmation("replace")}
                                    disabled={loading || !selectedImportFile}
                                >
                                    Replace
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="settings-option">
                        <div>
                            <h3>Database Backup</h3>
                            <p>
                                Create a signed PostgreSQL database backup
                                as a ZIP file.
                            </p>
                        </div>

                        <button
                            onClick={handleDatabaseBackup}
                            disabled={loading}
                        >
                            Backup
                        </button>
                    </div>

                    <div className="settings-option">
                        <div>
                            <h3>Database Restore</h3>
                            <p className="warning-text">
                                Warning: This will replace the entire current
                                database with the selected backup.
                            </p>
                            <p>
                                Database backups are installation-specific and cannot be restored on other ReelTrack installations. Use JSON Export/Import to transfer your data between users.
                            </p>

                            <input
                                ref={restoreInputRef}
                                type="file"
                                accept=".zip,application/zip"
                                hidden
                                onChange={(event) => {
                                    setSelectedRestoreFile(
                                        event.target.files[0] || null
                                    );
                                    setMessage(null);
                                }}
                            />

                            <button
                                className="secondary-button"
                                onClick={() => restoreInputRef.current.click()}
                                disabled={loading}
                            >
                                Choose ZIP file
                            </button>

                            {selectedRestoreFile && (
                                <p className="selected-file">
                                    Selected: {selectedRestoreFile.name}
                                </p>
                            )}

                            <button
                                className="danger-button"
                                onClick={openRestoreConfirmation}
                                disabled={loading || !selectedRestoreFile}
                            >
                                Restore
                            </button>
                        </div>
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

            {confirmation && (
                <div className="confirmation-overlay">
                    <div className="confirmation-modal">
                        <h2>
                            {confirmation.type === "restore"
                                ? "Restore Database?"
                                : confirmation.mode === "replace"
                                    ? "Replace Existing Data?"
                                    : "Merge Imported Data?"}
                        </h2>

                        <p>
                            {confirmation.type === "restore"
                                ? "Warning: This operation will replace the entire current database. All existing data will be lost."
                                : confirmation.mode === "replace"
                                    ? "Warning: Your current movies, series and watch history will be deleted and replaced with the imported data."
                                    : "Existing movies and series will be kept. Only records with new TMDB IDs will be imported."}
                        </p>

                        {confirmation.type === "restore" && (
                            <p className="warning-text">
                                Make sure you have a recent database backup
                                before continuing.
                            </p>
                        )}

                        <div className="confirmation-actions">
                            <button
                                className="secondary-button"
                                onClick={() => setConfirmation(null)}
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                className="danger-button"
                                onClick={handleConfirmation}
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;
