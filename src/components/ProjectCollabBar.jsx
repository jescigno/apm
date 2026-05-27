/**
 * Breadcrumb collab icon strip (BC-icons.svg). Audio, clock, and comment icons open right panels.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function CollabHitButton({ label, className, onClick, ariaPressed }) {
  const hitRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipRect, setTooltipRect] = useState(null);

  const updateTooltipRect = () => {
    const el = hitRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTooltipRect({ left: rect.left + rect.width / 2, top: rect.top });
  };

  useEffect(() => {
    if (!isHovered) return;
    updateTooltipRect();
    const onUpdate = () => updateTooltipRect();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [isHovered]);

  const tooltip =
    isHovered &&
    tooltipRect &&
    createPortal(
      <span
        className="app-hover-tooltip app-hover-tooltip-portal"
        role="tooltip"
        style={{
          left: tooltipRect.left,
          bottom: window.innerHeight - tooltipRect.top + 6,
        }}
      >
        {label}
      </span>,
      document.body
    );

  return (
    <>
      <button
        ref={hitRef}
        type="button"
        className={className}
        aria-label={label}
        aria-pressed={ariaPressed}
        onClick={onClick}
        onMouseEnter={() => {
          setIsHovered(true);
          updateTooltipRect();
        }}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => {
          setIsHovered(true);
          updateTooltipRect();
        }}
        onBlur={() => setIsHovered(false)}
      />
      {tooltip}
    </>
  );
}

function ProjectCollabBar({
  onSoundsLikeClick,
  soundsLikePanelOpen,
  onCommentsClick,
  commentsPanelOpen,
  onClockClick,
  clockPanelOpen,
}) {
  return (
    <div className="project-collabs">
      <div className="project-collabs-strip">
        <img src="/BC-icons.svg" alt="" className="project-collabs-icons" aria-hidden="true" />
        <CollabHitButton
          label="Sounds like"
          className={`project-collabs-hit project-collabs-hit--sounds-like${soundsLikePanelOpen ? ' project-collabs-hit--active' : ''}`}
          ariaPressed={soundsLikePanelOpen}
          onClick={() => onSoundsLikeClick?.()}
        />
        <CollabHitButton
          label="History"
          className={`project-collabs-hit project-collabs-hit--clock${clockPanelOpen ? ' project-collabs-hit--active' : ''}`}
          ariaPressed={clockPanelOpen}
          onClick={() => onClockClick?.()}
        />
        <CollabHitButton
          label="Comments"
          className={`project-collabs-hit project-collabs-hit--comments${commentsPanelOpen ? ' project-collabs-hit--active' : ''}`}
          ariaPressed={commentsPanelOpen}
          onClick={() => onCommentsClick?.()}
        />
      </div>
    </div>
  );
}

export default ProjectCollabBar;
