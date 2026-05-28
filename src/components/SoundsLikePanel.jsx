/**
 * Right panel for Sounds Like results. Uses only `sounds-like-*` classes in index.css.
 * Projects panel (ProjectsPanel.jsx) uses `projects-panel-*` — keep namespaces separate.
 */
import { useRef, useEffect, useLayoutEffect, useState } from 'react';

const TRACK_THUMBNAILS = ['/project-thumb-1.png', '/project-thumb-2.png', '/project-thumb-3.png', '/project-thumb-4.png'];

const WAVEFORMS = ['/waveform.png', '/waveform2.png', '/waveform3.png', '/waveform4.png'];

const EXIT_ANIM_MS = 480;
/** Must match CSS `animation` duration on `.sounds-like-track-placeholder` */
const PLACEHOLDER_BLINK_DURATION_MS = 2400;
/** Must match CSS `sounds-like-track-content-fade-in` duration */
const CONTENT_FADE_IN_MS = 1100;

const STACK_THUMB_SIZE = 36;
const STACK_THUMB_OVERLAP = 14;
const STACK_ITEM_STEP = STACK_THUMB_SIZE - STACK_THUMB_OVERLAP;
const STACK_OVERFLOW_BADGE_SIZE = 36;
const STACK_OVERFLOW_GAP = 0;

function stackItemsWidth(count) {
  if (count <= 0) return 0;
  return STACK_THUMB_SIZE + (count - 1) * STACK_ITEM_STEP;
}

function computeCollapsedStackLayout(total, availableWidth) {
  if (total <= 0 || availableWidth <= 0) {
    return { visible: 0, overflow: 0 };
  }

  if (stackItemsWidth(total) <= availableWidth) {
    return { visible: total, overflow: 0 };
  }

  for (let visible = total; visible >= 0; visible -= 1) {
    const overflow = total - visible;
    const widthNeeded =
      stackItemsWidth(visible) +
      (overflow > 0 ? STACK_OVERFLOW_BADGE_SIZE + STACK_OVERFLOW_GAP : 0);
    if (widthNeeded <= availableWidth) {
      return { visible, overflow };
    }
  }

  return { visible: 0, overflow: total };
}

function SoundsLikePanel({
  isOpen,
  onClose,
  width = 263,
  onWidthChange,
  minWidth = 263,
  maxWidth = 600,
  sourceTracks = [],
  items = [],
  onRemoveSourceTrack,
  onRemoveItem,
  onAddComplete,
  onRefresh,
  onLoadMore,
  onItemEnterAnimationComplete,
}) {
  const hasSourceTracks = sourceTracks.length > 0;
  const [sourceTracksExpanded, setSourceTracksExpanded] = useState(false);
  const [collapsedStackLayout, setCollapsedStackLayout] = useState({ visible: 0, overflow: 0 });
  const collapsedStackRef = useRef(null);
  const resizeRef = useRef(null);
  const widthRef = useRef(width);
  widthRef.current = width;
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
    if (!isOpen) {
      setSourceTracksExpanded(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setSourceTracksExpanded(false);
  }, [sourceTracks.map((track) => track.id).join('|')]);

  useLayoutEffect(() => {
    if (sourceTracksExpanded || !hasSourceTracks) return;

    const measure = () => {
      const el = collapsedStackRef.current;
      if (!el) return;
      const styles = window.getComputedStyle(el);
      const horizontalPadding =
        parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const availableWidth = el.clientWidth - horizontalPadding;
      setCollapsedStackLayout(
        computeCollapsedStackLayout(sourceTracks.length, availableWidth)
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (collapsedStackRef.current) {
      observer.observe(collapsedStackRef.current);
    }
    return () => observer.disconnect();
  }, [sourceTracksExpanded, hasSourceTracks, sourceTracks.length, width, isOpen]);

  const visibleSourceTracks = sourceTracksExpanded
    ? sourceTracks
    : sourceTracks.slice(0, collapsedStackLayout.visible);
  const hiddenSourceTrackCount = sourceTracksExpanded ? 0 : collapsedStackLayout.overflow;

  const getSourceThumbSrc = (track) => {
    const thumbIndex = ((track.num ?? 1) - 1) % TRACK_THUMBNAILS.length;
    return TRACK_THUMBNAILS[thumbIndex];
  };

  useEffect(() => {
    if (!resizeRef.current || !onWidthChange || !isOpen) return;

    const handle = resizeRef.current;

    const onMouseDown = (e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = widthRef.current;

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
  }, [isOpen, onWidthChange, minWidth, maxWidth]);

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
      {hasSourceTracks && (
        <div
          className={`sounds-like-panel-source-tracks${sourceTracksExpanded ? '' : ' sounds-like-panel-source-tracks--collapsed'}`}
        >
          {sourceTracksExpanded ? (
            sourceTracks.map((track) => (
              <div key={track.id} className="sounds-like-panel-source-track">
                <button
                  type="button"
                  className="sounds-like-panel-source-remove"
                  aria-label={`Remove ${track.title}`}
                  onClick={() => onRemoveSourceTrack?.(track.id)}
                >
                  <img src="/Trash.svg" alt="" />
                </button>
                <button
                  type="button"
                  className="sounds-like-panel-source-thumb-btn"
                  aria-label="Collapse selected tracks"
                  onClick={() => setSourceTracksExpanded(false)}
                >
                  <img
                    src={getSourceThumbSrc(track)}
                    alt=""
                    className="sounds-like-panel-source-thumb"
                    aria-hidden
                  />
                </button>
                <div className="sounds-like-panel-source-text">
                  <span className="sounds-like-panel-source-title">{track.title}</span>
                  {track.id && (
                    <span className="sounds-like-panel-source-id">{track.id}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div
              ref={collapsedStackRef}
              className="sounds-like-panel-source-stack"
              role="button"
              tabIndex={0}
              aria-label={`Expand ${sourceTracks.length} selected tracks`}
              onClick={() => setSourceTracksExpanded(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSourceTracksExpanded(true);
                }
              }}
            >
              {visibleSourceTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="sounds-like-panel-source-stack-item"
                  style={{ zIndex: index + 1 }}
                >
                  <img
                    src={getSourceThumbSrc(track)}
                    alt=""
                    className="sounds-like-panel-source-stack-thumb"
                    aria-hidden
                  />
                  <span className="sounds-like-panel-source-stack-title">{track.title}</span>
                </div>
              ))}
              {hiddenSourceTrackCount > 0 && (
                <span className="sounds-like-panel-source-stack-overflow" aria-hidden>
                  +{hiddenSourceTrackCount}
                </span>
              )}
            </div>
          )}
        </div>
      )}
      <div className={`sounds-like-panel-content${hasSourceTracks ? ' sounds-like-panel-content--with-source' : ''}`}>
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
              {showContent && (
                <button
                  type="button"
                  className="sounds-like-track-remove"
                  aria-label={`Remove ${title}`}
                  onClick={() => onRemoveItem?.(item.id)}
                  disabled={exitingId != null}
                >
                  <img src="/Trash.svg" alt="" />
                </button>
              )}
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
