import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ProjectCard from '../components/ProjectCard';
import TrackList, { PROJECTS_TRACKS } from '../components/TrackList';

const FOLDER_HIERARCHY = [
  { id: 'music-for-sports', label: 'APM MARKETING 2', visible: true },
  { id: 'nfl', label: '2026 Milan Olympics Updates', visible: true },
  { id: 'mnf', label: 'Winter Olympics 2026 - Contemporary Italy (Update 10.28.25)', visible: true },
];

function BreadcrumbSegment({ label }) {
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipRect, setTooltipRect] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    const check = () => {
      const containerWidth = container.offsetWidth;
      const contentWidth = measure.scrollWidth;
      setIsTruncated(contentWidth > containerWidth);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(container);
    return () => ro.disconnect();
  }, [label]);

  const updateTooltipRect = () => {
    const el = containerRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setTooltipRect({ left: r.left, bottom: r.top });
    }
  };

  useEffect(() => {
    if (!isHovered || !isTruncated) return;
    updateTooltipRect();
    const onUpdate = () => updateTooltipRect();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [isHovered, isTruncated]);

  const tooltip = isTruncated && isHovered && tooltipRect && createPortal(
    <span
      className="breadcrumb-tooltip breadcrumb-tooltip-portal"
      role="tooltip"
      style={{
        left: tooltipRect.left,
        bottom: window.innerHeight - tooltipRect.bottom + 6,
      }}
    >
      {label}
    </span>,
    document.body
  );

  return (
    <>
      <span
        ref={containerRef}
        className="breadcrumb-segment-wrap"
        onMouseEnter={() => {
          setIsHovered(true);
          updateTooltipRect();
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="breadcrumb-segment">{label}</span>
        <span ref={measureRef} className="breadcrumb-segment-measure" aria-hidden="true">
          {label}
        </span>
      </span>
      {tooltip}
    </>
  );
}

function BreadcrumbText({ children }) {
  return (
    <span className="breadcrumb-text-wrap">
      <span className="breadcrumb-text">{children}</span>
    </span>
  );
}

export default function ProjectsPage({ soundsLikePanelOpen, onSoundsLikeClick }) {
  const visibleFolders = FOLDER_HIERARCHY.filter((f) => f.visible || f.locked);

  return (
    <div className="projects-page">
      <div className="breadcrumb-row">
        <div className="breadcrumb-wrapper">
          <span className="breadcrumb">
            <span className="breadcrumb-highlight">
              <BreadcrumbText>
                {visibleFolders.length ? (
                  visibleFolders.map((folder, i) => (
                    <span key={folder.id} style={{ display: 'contents' }}>
                      {i > 0 && <span className="breadcrumb-sep"> / </span>}
                      <BreadcrumbSegment label={folder.label} />
                    </span>
                  ))
                ) : (
                  <BreadcrumbSegment label="My Projects" />
                )}
              </BreadcrumbText>
            </span>
          </span>
        </div>
        <div className="project-collabs">
          <img src="/BC-icons.svg" alt="Breadcrumb icons" className="project-collabs-icons" />
        </div>
      </div>

      <ProjectCard
        soundsLikePanelOpen={soundsLikePanelOpen}
        onSoundsLikeClick={onSoundsLikeClick}
      />
      <TrackList
        soundsLikePanelOpen={soundsLikePanelOpen}
        onSoundsLikeClick={onSoundsLikeClick}
        tracks={PROJECTS_TRACKS}
      />
    </div>
  );
}
