import { useRef, useEffect } from 'react';

const SOUNDS_LIKE_TRACKS = [
  'Rocking the Stadium',
  'Signature Bend SFX 16 Freq',
  'Resolution Across Time',
  'Meet the Players',
  'Farewell Mon Amour',
  'Rocking the Stadium',
];

const TRACK_THUMBNAILS = ['/project-thumb-1.png', '/project-thumb-2.png', '/project-thumb-3.png', '/project-thumb-4.png'];

// Base waveform pattern - each track gets a varied version
const BASE_WAVEFORM = [
  1, 2, 3, 2, 4, 5, 3, 6, 7, 5, 8, 6, 9, 7, 10, 8, 11, 9, 12, 10,
  11, 8, 10, 11, 12, 10, 13, 11, 13, 9, 11, 12, 13, 11, 10, 9, 11, 12, 13, 11,
  10, 9, 8, 10, 11, 9, 8, 7, 9, 8, 10, 9, 8, 7, 6, 8, 9, 7, 6, 5,
  5, 4, 6, 5, 6, 4, 5, 3, 4, 5, 5, 4, 3, 2, 4, 3, 4, 3, 3, 4,
  5, 4, 5, 5, 4, 3, 3, 2, 2, 2, 1,
];

function getWaveformHeights(trackIndex) {
  const n = BASE_WAVEFORM.length;
  const shift = (trackIndex * 13) % n;
  const modOffset = (trackIndex * 7) % 5;
  return BASE_WAVEFORM.map((h, i) => {
    const base = BASE_WAVEFORM[(i + shift) % n];
    const mod = ((modOffset + i) % 5) - 2;
    return Math.max(1, Math.min(14, base + mod));
  });
}

function Waveform({ className, trackIndex = 0 }) {
  const heights = getWaveformHeights(trackIndex);
  const h = 16;
  const barWidth = 0.1;
  const barSpacing = 0.6; // bar + 0.5 gap
  const w = heights.length * barSpacing;

  const cy = h / 2;

  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {heights.map((barH, i) => {
        const height = Math.min(barH, h);
        return (
          <rect
            key={i}
            x={i * barSpacing}
            y={cy - height / 2}
            width={barWidth}
            height={height}
            fill="white"
          />
        );
      })}
    </svg>
  );
}

function SoundsLikePanel({ isOpen, onClose, width = 263, onWidthChange, minWidth = 263, maxWidth = 600 }) {
  const resizeRef = useRef(null);

  useEffect(() => {
    if (!resizeRef.current || !onWidthChange || !isOpen) return;

    const handle = resizeRef.current;

    const onMouseDown = (e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = width;

      const onMouseMove = (e) => {
        const delta = startX - e.clientX;
        const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + delta));
        onWidthChange(newWidth);
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);
    return () => handle.removeEventListener('mousedown', onMouseDown);
  }, [isOpen, width, onWidthChange, minWidth, maxWidth]);

  return (
    <aside
      className={`sounds-like-panel ${isOpen ? 'open' : ''}`}
      role="dialog"
      aria-label="Sounds like"
      style={isOpen ? { width: `${width}px`, minWidth: `${width}px` } : undefined}
    >
      {isOpen && (
        <div
          ref={resizeRef}
          className="sounds-like-panel-resize-handle"
          aria-label="Drag to resize panel"
        />
      )}
      <div className="sounds-like-panel-header">
        <div className="sounds-like-panel-title-row">
          <h2 className="sounds-like-panel-title">Sounds Like</h2>
        </div>
        <div className="sounds-like-panel-actions">
          <button type="button" className="sounds-like-panel-icon-btn" aria-label="Refresh">
            <img src="/Refresh.svg" alt="" />
          </button>
          <button type="button" className="sounds-like-panel-icon-btn" onClick={onClose} aria-label="Close">
            <img src="/icons/Close.svg" alt="" />
          </button>
        </div>
      </div>
      <div className="sounds-like-panel-content">
        {SOUNDS_LIKE_TRACKS.map((title, i) => (
          <div
            key={`${title}-${i}`}
            className={`sounds-like-track ${width >= 440 ? 'sounds-like-track-expanded' : ''}`}
          >
            <div className="sounds-like-track-row">
              <button type="button" className="sounds-like-track-play" aria-label={`Play ${title}`}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <img
                src={TRACK_THUMBNAILS[i % TRACK_THUMBNAILS.length]}
                alt=""
                className={`sounds-like-track-thumb ${width >= 440 ? 'visible' : ''}`}
                aria-hidden
              />
              <span className="sounds-like-track-title">{title}</span>
              <div className="sounds-like-track-actions">
                <div className={`sounds-like-track-extra-actions ${width >= 440 ? 'visible' : ''}`}>
                  <button type="button" className="sounds-like-track-icon" aria-label={`Upload ${title}`}>
                    <img src="/icons/Upload.svg" alt="" />
                  </button>
                  <button type="button" className="sounds-like-track-icon" aria-label={`Download ${title}`}>
                    <img src="/icons/Download.svg" alt="" />
                  </button>
                </div>
                <button type="button" className="sounds-like-track-add" aria-label={`Add ${title}`}>
                  <img src="/icons/Add.svg" alt="" />
                </button>
              </div>
            </div>
            <div className={`sounds-like-track-waveform-wrap ${width >= 440 ? 'visible' : ''}`}>
              <Waveform className="sounds-like-track-waveform" trackIndex={i} />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default SoundsLikePanel;
