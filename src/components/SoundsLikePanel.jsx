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

const WAVEFORMS = ['/waveform.png', '/waveform2.png', '/waveform3.png', '/waveform4.png'];

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
              <img src={WAVEFORMS[i % WAVEFORMS.length]} alt="" className="sounds-like-track-waveform" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default SoundsLikePanel;
