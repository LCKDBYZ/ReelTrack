import "./SyncResultModal.css";

function SyncResultModal({ result, onClose, title }) {
    if (!result) {
        return null;
    }

    const hasChanges =
        result.newSeasons > 0 ||
        result.newEpisodes > 0 ||
        result.updatedSeasons > 0 ||
        result.updatedEpisodes > 0;

    return (
        <div className="sync-modal-overlay" onClick={onClose}>
            <div
                className="sync-modal"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="sync-modal-header">
                    <h2>{title || "Synchronization successful!"}</h2>

                    <button
                        className="sync-modal-close"
                        onClick={onClose}
                    >
                        x
                    </button>
                </div>

                <div className="sync-modal-content">
                    {result.syncedSeries != null && (
                        <p>
                            Synced series: {result.syncedSeries}
                        </p>
                    )}

                    <p>New seasons: {result.newSeasons}</p>
                    <p>New episodes: {result.newEpisodes}</p>
                    <p>Updated seasons: {result.updatedSeasons}</p>
                    <p>Updated episodes: {result.updatedEpisodes}</p>

                    {!hasChanges && (
                        <p className="no-sync-changes">
                            No changes found.
                        </p>
                    )}
                </div>

                <div className="sync-modal-footer">
                    <button onClick={onClose}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SyncResultModal;
