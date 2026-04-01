import { useRef, useEffect, useState } from 'react';

const TRACK_THUMBNAILS = ['/project-thumb-1.png', '/project-thumb-2.png', '/project-thumb-3.png', '/project-thumb-4.png'];

const WAVEFORMS = ['/waveform.png', '/waveform2.png', '/waveform3.png', '/waveform4.png'];

const EXIT_ANIM_MS = 480;
/** Must match CSS `animation` duration on `.sounds-like-track-placeholder` */
const PLACEHOLDER_BLINK_DURATION_MS = 2400;
/** Must match CSS `sounds-like-track-content-fade-in` duration */
const CONTENT_FADE_IN_MS = 1100;

function SoundsLikePanel({
  isOpen,
  onClose,
  width = 263,
  onWidthChange,
  minWidth = 263,
  maxWidth = 600,
  items = [],
  onAddComplete,
  onRefresh,
  onLoadMore,
  onItemEnterAnimationComplete,
}) {
  const resizeRef = useRef(null);
  const [exitingId, setExitingId] = useState(null);
  const [revealedIds, setRevealedIds] = useState(() => new Set());
  const scheduledRevealRef = useRef(new Set());

  useEffect(() => {
    const itemIds = new Set(items.map((i) => i.id));
    for (const id of [...scheduledRevealRef.current]) {
      if (!itemIds.has(id)) scheduledRevealRef.current.delete(id);
    }
    setRevealedIds((prev) => {
      const next = new Set();
      for (const id of prev) {
        if (itemIds.has(id)) next.add(id);
      }
      return next;
    });
  }, [items]);

  useEffect(() => {
    const timers = [];
    items.forEach((item) => {
      if (!item.animateEnter) return;
      if (scheduledRevealRef.current.has(item.id)) return;
      scheduledRevealRef.current.add(item.id);

      const t1 = window.setTimeout(() => {
        setRevealedIds((prev) => new Set(prev).add(item.id));
        const t2 = window.setTimeout(() => {
          onItemEnterAnimationComplete?.(item.id);
        }, CONTENT_FADE_IN_MS);
        timers.push(t2);
      }, PLACEHOLDER_BLINK_DURATION_MS);
      timers.push(t1);
    });
    return () => timers.forEach((handle) => window.clearTimeout(handle));
  }, [items, onItemEnterAnimationComplete]);

  useEffect(() => {
    if (exitingId != null && !items.some((i) => i.id === exitingId)) {
      setExitingId(null);
    }
  }, [items, exitingId]);

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

  const handleAdd = (item) => {
    if (exitingId != null) return;
    setExitingId(item.id);
    window.setTimeout(() => {
      onAddComplete?.(item);
      setExitingId(null);
    }, EXIT_ANIM_MS);
  };

  return (
    <aside
      className={`sounds-like-panel ${isOpen ? 'open' : ''}${isOpen && width > minWidth ? ' sounds-like-panel--overlay' : ''}`}
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
          <button
            type="button"
            className="sounds-like-panel-icon-btn"
            aria-label="Refresh"
            onClick={() => onRefresh?.()}
            disabled={exitingId != null}
          >
            <img src="/Refresh.svg" alt="" />
          </button>
          <button type="button" className="sounds-like-panel-icon-btn" onClick={onClose} aria-label="Close">
            <img src="/icons/Close.svg" alt="" />
          </button>
        </div>
      </div>
      <div className="sounds-like-panel-content">
        {items.map((item) => {
          const i = item.waveformIndex ?? 0;
          const title = item.title;
          const isExiting = exitingId === item.id;
          const needsEnter = Boolean(item.animateEnter) && !isExiting;
          const showContent = !needsEnter || revealedIds.has(item.id);
          const showPlaceholder = needsEnter && !revealedIds.has(item.id);
          const contentFadeIn = needsEnter && revealedIds.has(item.id);

          return (
            <div
              key={item.id}
              className={`sounds-like-track ${width >= 440 ? 'sounds-like-track-expanded' : ''}${isExiting ? ' sounds-like-track--exiting' : ''}${showPlaceholder ? ' sounds-like-track--placeholder-phase' : ''}`}
            >
              {showPlaceholder && (
                <div className="sounds-like-track-placeholder" aria-hidden />
              )}
              {showContent && (
                <div
                  className={`sounds-like-track-inner${contentFadeIn ? ' sounds-like-track-inner--fade-in' : ''}`}
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
                      <button
                        type="button"
                        className="sounds-like-track-add"
                        aria-label={`Add ${title}`}
                        onClick={() => handleAdd(item)}
                        disabled={exitingId != null}
                      >
                        <img src="/icons/Add.svg" alt="" />
                      </button>
                    </div>
                  </div>
                  <div className={`sounds-like-track-waveform-wrap ${width >= 440 ? 'visible' : ''}`}>
                    <img src={WAVEFORMS[i % WAVEFORMS.length]} alt="" className="sounds-like-track-waveform" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <button
          type="button"
          className="sounds-like-panel-load-more"
          onClick={() => onLoadMore?.()}
          disabled={exitingId != null}
        >
          Load more tracks
        </button>
      </div>
    </aside>
  );
}

export default SoundsLikePanel;
