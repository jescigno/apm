/**
 * Right panel for project comments. Uses only `comments-panel-*` classes in index.css.
 */
import { useRef, useEffect, useState, useCallback } from 'react';

const COMMENT_EXIT_ANIM_MS = 220;

function formatCommentDate(date = new Date()) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function CommentsPanel({
  isOpen,
  onClose,
  width = 263,
  onWidthChange,
  minWidth = 263,
  maxWidth = 600,
  items = [],
}) {
  const resizeRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const widthRef = useRef(width);
  const [draft, setDraft] = useState('');
  const [commentItems, setCommentItems] = useState(() => [...items]);
  const [enteringIds, setEnteringIds] = useState(() => new Set());
  const [exitingIds, setExitingIds] = useState(() => new Set());
  const exitTimersRef = useRef(new Map());
  widthRef.current = width;

  const prefersReducedMotion = useCallback(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(
    () => () => {
      exitTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      exitTimersRef.current.clear();
    },
    []
  );

  const hasDraft = draft.length > 0;

  const syncInputHeight = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
  }, []);

  useEffect(() => {
    syncInputHeight();
  }, [draft, isOpen, syncInputHeight]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!resizeRef.current || !onWidthChange || !isOpen) return;

    const handle = resizeRef.current;

    const onMouseDown = (e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = widthRef.current;

      const onMouseMove = (moveEvent) => {
        const delta = startX - moveEvent.clientX;
        const next = Math.min(maxWidth, Math.max(minWidth, startWidth + delta));
        onWidthChange(next);
      };

      const onMouseUp = () => {
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);
    return () => handle.removeEventListener('mousedown', onMouseDown);
  }, [isOpen, onWidthChange, minWidth, maxWidth]);

  const finishExit = useCallback((itemId) => {
    const timerId = exitTimersRef.current.get(itemId);
    if (timerId != null) {
      window.clearTimeout(timerId);
      exitTimersRef.current.delete(itemId);
    }

    setExitingIds((prev) => {
      if (!prev.has(itemId)) return prev;
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
    setCommentItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    const id = `local-${Date.now()}`;
    setEnteringIds((prev) => new Set(prev).add(id));
    setCommentItems((prev) => [
      {
        id,
        author: 'Matthew',
        text,
        date: formatCommentDate(),
      },
      ...prev,
    ]);
    setDraft('');
    requestAnimationFrame(() => {
      syncInputHeight();
      listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      inputRef.current?.focus();
    });

    if (prefersReducedMotion()) {
      setEnteringIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDelete = (itemId) => {
    if (exitingIds.has(itemId)) return;

    if (prefersReducedMotion()) {
      finishExit(itemId);
      return;
    }

    setExitingIds((prev) => new Set(prev).add(itemId));
    const timerId = window.setTimeout(() => finishExit(itemId), COMMENT_EXIT_ANIM_MS);
    exitTimersRef.current.set(itemId, timerId);
  };

  const handleItemAnimationEnd = (itemId, event) => {
    if (event.target !== event.currentTarget) return;

    if (event.animationName === 'comments-panel-item-enter') {
      setEnteringIds((prev) => {
        if (!prev.has(itemId)) return prev;
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }

    if (event.animationName === 'comments-panel-item-exit') {
      finishExit(itemId);
    }
  };

  const handleDraftKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <aside
      className={`comments-panel ${isOpen ? 'open' : ''}${isOpen && width > minWidth ? ' comments-panel--overlay' : ''}`}
      role="dialog"
      aria-label="Comments"
      style={isOpen ? { width: `${width}px`, minWidth: `${width}px` } : undefined}
    >
      {isOpen && (
        <div
          ref={resizeRef}
          className="comments-panel-resize-handle"
          aria-label="Drag to resize panel"
        />
      )}
      <div className="comments-panel-header">
        <div className="comments-panel-title-row">
          <h2 className="comments-panel-title">Comments</h2>
          <span className="comments-panel-count">{commentItems.length}</span>
        </div>
        <div className="comments-panel-actions">
          <button type="button" className="comments-panel-icon-btn" onClick={onClose} aria-label="Close">
            <img src="/icons/Close.svg" alt="" />
          </button>
        </div>
      </div>
      <div className="comments-panel-content">
        <div className="comments-panel-list-clip">
          <div className="comments-panel-list" ref={listRef}>
            {commentItems.map((item) => {
              const isEntering = enteringIds.has(item.id);
              const isExiting = exitingIds.has(item.id);

              return (
              <article
                key={item.id}
                className={`comments-panel-item${isEntering ? ' comments-panel-item--enter' : ''}${isExiting ? ' comments-panel-item--exit' : ''}`}
                onAnimationEnd={(event) => handleItemAnimationEnd(item.id, event)}
              >
                <div className="comments-panel-divider" aria-hidden="true" />
                <div className="comments-panel-item-wrap">
                  <p className="comments-panel-author">{item.author}</p>
                  <p className="comments-panel-text">{item.text}</p>
                  <time className="comments-panel-date">{item.date}</time>
                  {item.author === 'Matthew' && (
                    <div className="comments-panel-item-actions">
                      <button
                        type="button"
                        className="comments-panel-action-btn"
                        aria-label="Delete comment"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(item.id);
                        }}
                        disabled={isExiting}
                      >
                        <img src="/Trash.svg" alt="" />
                      </button>
                    </div>
                  )}
                </div>
              </article>
              );
            })}
          </div>
        </div>
        <div className={`comments-panel-compose${hasDraft ? ' comments-panel-compose--active' : ''}`}>
          <div className="comments-panel-compose-field">
            <textarea
              ref={inputRef}
              rows={1}
              className="comments-panel-input"
              placeholder="Add a comment..."
              aria-label="Add a comment"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleDraftKeyDown}
            />
            {hasDraft && (
              <button
                type="button"
                className="comments-panel-send-btn"
                onClick={handleSend}
                aria-label="Send comment"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3.4 20.4 22 12 3.4 3.6 3 10.8l9.6 1.2-9.6 1.2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default CommentsPanel;
