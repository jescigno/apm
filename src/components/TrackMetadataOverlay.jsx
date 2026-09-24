import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function TrackMetadataField({ label, value, className = '' }) {
  if (value == null || value === '') return null;

  return (
    <div className={`track-metadata-overlay__field ${className}`.trim()}>
      <span className="track-metadata-overlay__field-label">{label}</span>
      <span className="track-metadata-overlay__field-value">{value}</span>
    </div>
  );
}

function TrackMetadataFlag({ label, yes }) {
  return (
    <div className="track-metadata-overlay__flag">
      <span className={`track-metadata-overlay__flag-letter${yes ? ' track-metadata-overlay__flag-letter--yes' : ''}`}>
        {yes ? 'Y' : 'N'}
      </span>
      <span className="track-metadata-overlay__flag-label">{label}</span>
    </div>
  );
}

export default function TrackMetadataOverlay({ track, onClose }) {
  const [moodExpanded, setMoodExpanded] = useState(false);

  const handleEscape = useCallback(
    (event) => {
      if (event.key === 'Escape') onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  const copyPublishingInfo = useCallback(async () => {
    const text = track.publishingCopyText ?? `${track.composer}\n${track.publisher}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable */
    }
  }, [track]);

  const moodText = moodExpanded ? track.mood : track.moodPreview ?? track.mood;
  const showMoodToggle = track.mood && track.moodPreview && track.mood !== track.moodPreview;

  return createPortal(
    <div className="track-metadata-overlay" role="dialog" aria-modal="true" aria-labelledby="track-metadata-overlay-title">
      <div
        className="track-metadata-overlay__backdrop"
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClose?.();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close overlay"
      />
      <div className="track-metadata-overlay__panel-wrap">
        <div className="track-metadata-overlay__panel">
          <header className="track-metadata-overlay__header">
            <button type="button" className="track-metadata-overlay__back" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M9 6l6 6-6 6" />
              </svg>
              <span id="track-metadata-overlay-title">Track details</span>
            </button>
            <div className="track-metadata-overlay__header-actions">
              <button type="button" className="track-metadata-overlay__copy-btn" onClick={copyPublishingInfo}>
                <img src="/icons/copy.svg" alt="" aria-hidden="true" />
                <span>Copy publishing info</span>
              </button>
              <button type="button" className="track-metadata-overlay__close" onClick={onClose} aria-label="Close">
                <img src="/icons/close.svg" alt="" />
              </button>
            </div>
          </header>

          <div className="track-metadata-overlay__scroll">
            <section className="track-metadata-overlay__hero">
              <div
                className="track-metadata-overlay__thumb"
                style={track.thumbSrc ? { backgroundImage: `url('${track.thumbSrc}')` } : undefined}
                aria-hidden="true"
              />
              <div className="track-metadata-overlay__hero-main">
                <h2 className="track-metadata-overlay__track-title">{track.title}</h2>
                <p className="track-metadata-overlay__album">
                  Album Title: {track.albumTitle}
                  <button type="button" className="track-metadata-overlay__album-info" aria-label="Album info">
                    <img src="/icons/TrackInfo.svg" alt="" />
                  </button>
                </p>
                <p className="track-metadata-overlay__catalog">{track.catalogLine}</p>
                <p className="track-metadata-overlay__description">{track.description}</p>
              </div>
              <div className="track-metadata-overlay__hero-facts">
                <TrackMetadataField label="Track Title" value={track.title} />
                <TrackMetadataField label="Track ID" value={track.trackId} />
                <TrackMetadataField label="Library" value={track.library} />
                <TrackMetadataField label="Main Genre" value={track.mainGenre} />
                <TrackMetadataField label="Track type" value={track.trackType} />
                <TrackMetadataField label="Duration" value={track.duration} />
                <TrackMetadataField label="APM Release Date" value={track.apmReleaseDate} />
                <TrackMetadataField label="Recording Date" value={track.recordingDate} />
                <TrackMetadataField label="ISRC" value={track.isrc} />
              </div>
            </section>

            <section className="track-metadata-overlay__grid">
              <TrackMetadataField label="Genre" value={track.genre} />
              <div className="track-metadata-overlay__field track-metadata-overlay__field--mood">
                <span className="track-metadata-overlay__field-label">Mood</span>
                <span className="track-metadata-overlay__field-value">
                  {moodText}
                  {showMoodToggle ? (
                    <>
                      {' '}
                      <button
                        type="button"
                        className="track-metadata-overlay__see-more"
                        onClick={() => setMoodExpanded((open) => !open)}
                      >
                        {moodExpanded ? 'See less' : 'See more'}
                      </button>
                    </>
                  ) : null}
                </span>
              </div>
              <TrackMetadataField label="BPM" value={track.bpm} />
              <TrackMetadataField label="Tempo" value={track.tempo} />
              <TrackMetadataField label="Character" value={track.character} />
              <TrackMetadataField label="Movements" value={track.movements} />
              <TrackMetadataField label="Instruments & Grouping" value={track.instruments} />
              <TrackMetadataField label="Music for" value={track.musicFor} />
              <TrackMetadataField label="Voices & Groupings" value={track.voices} />
              <TrackMetadataField label="Music with FX" value={track.musicWithFx} />
              <TrackMetadataField label="Lyrics Subject" value={track.lyricsSubject} />
              <TrackMetadataField label="Musical Form" value={track.musicalForm} />
            </section>

            <section className="track-metadata-overlay__flags">
              {(track.flags ?? []).map((flag) => (
                <TrackMetadataFlag key={flag.label} label={flag.label} yes={flag.yes} />
              ))}
            </section>

            <footer className="track-metadata-overlay__credits">
              <TrackMetadataField label="Composer" value={track.composer} className="track-metadata-overlay__field--credit" />
              <TrackMetadataField label="Publisher" value={track.publisher} className="track-metadata-overlay__field--credit" />
            </footer>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
