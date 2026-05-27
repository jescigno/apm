/**
 * Right panel for project history (clock icon). Uses only `clock-panel-*` classes in index.css.
 */
import { useRef, useEffect } from 'react';

function ClockPanel({
  isOpen,
  onClose,
  width = 263,
  onWidthChange,
  minWidth = 263,
  maxWidth = 600,
  items = [],
}) {
  const resizeRef = useRef(null);
  const widthRef = useRef(width);
  widthRef.current = width;

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

  return (
    <aside
      className={`clock-panel ${isOpen ? 'open' : ''}${isOpen && width > minWidth ? ' clock-panel--overlay' : ''}`}
      role="dialog"
      aria-label="History"
      style={isOpen ? { width: `${width}px`, minWidth: `${width}px` } : undefined}
    >
      {isOpen && (
        <div
          ref={resizeRef}
          className="clock-panel-resize-handle"
          aria-label="Drag to resize panel"
        />
      )}
      <div className="clock-panel-header">
        <div className="clock-panel-title-row">
          <h2 className="clock-panel-title">History</h2>
          <span className="clock-panel-count">{items.length}</span>
        </div>
        <div className="clock-panel-actions">
          <button type="button" className="clock-panel-icon-btn" onClick={onClose} aria-label="Close">
            <img src="/icons/Close.svg" alt="" />
          </button>
        </div>
      </div>
      <div className="clock-panel-content">
        <div className="clock-panel-list-clip">
          <div className="clock-panel-list">
            {items.map((item) => (
              <article key={item.id} className="clock-panel-item">
                <div className="clock-panel-divider" aria-hidden="true" />
                <div className="clock-panel-item-wrap">
                  <p className="clock-panel-user">{item.user}</p>
                  <p className="clock-panel-text">{item.text}</p>
                  <time className="clock-panel-date">{item.date}</time>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default ClockPanel;
