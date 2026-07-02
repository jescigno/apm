import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import ProjectCard from '../components/ProjectCard';
import ProjectCollabBar from '../components/ProjectCollabBar';
import TrackList from '../components/TrackList';
import { LAYOUT_COMPACT_MAX_WIDTH } from '../constants/layout';
import {
  CURRENT_PROJECT_FOLDER_ID,
  EMPTY_PROJECT_FOLDER_ID,
  getFolderChildren,
  getFolderPath,
  PROJECTS_PANEL_FOLDER_TREE,
} from '../constants/projectsPanelTree';
import { COMMENTS_PANEL_INITIAL_ITEMS } from '../constants/commentsPanel';

const ITALY_PROJECT_TITLE = 'Winter Olympics 2026 - Contemporary Italy (Update 10.28.25)';
const ITALY_PROJECT_TITLE_TOOLTIP = 'Winter Olympics 2026 - Contemporary Italy\n(Update 10.28.25)';
const ITALY_PROJECT_DESCRIPTION =
  'Duis nibh posuere elit ultrices. Nibh et id elementum et dolor leo. Sit lacus in purus orci. Egestas massa, tincidunt scelerisque lorem. Lacus vitae commodo in vulputate fusce placerat. Sapien quis id ut mattis mattis pharetra, vitae tristique sed.';

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

const DEFAULT_DOC_TITLE = 'apm music';

export default function ProjectsPage({
  activeFolderId,
  onFolderSelect,
  soundsLikePanelOpen,
  commentsPanelOpen,
  clockPanelOpen,
  onSoundsLikeClick,
  onPromoSoundsLikeClick,
  onSoundsLikeWithSelection,
  onCommentsClick,
  onClockClick,
  tracks,
  projectTrackCount = 0,
  enterHighlightTrackNum,
  scrollToBottomSignal,
}) {
  useEffect(() => {
    document.title = 'Project-Details';
    return () => {
      document.title = DEFAULT_DOC_TITLE;
    };
  }, []);

  const folderPath = useMemo(
    () => getFolderPath(PROJECTS_PANEL_FOLDER_TREE, activeFolderId),
    [activeFolderId]
  );
  const activeFolder = folderPath[folderPath.length - 1] ?? null;
  const childFolders = useMemo(
    () => getFolderChildren(PROJECTS_PANEL_FOLDER_TREE, activeFolderId),
    [activeFolderId]
  );
  const projectTitle =
    activeFolderId === CURRENT_PROJECT_FOLDER_ID
      ? ITALY_PROJECT_TITLE
      : activeFolder?.name ?? 'Project';
  const projectTitleTooltip =
    activeFolderId === CURRENT_PROJECT_FOLDER_ID
      ? ITALY_PROJECT_TITLE_TOOLTIP
      : activeFolder?.name ?? 'Project';
  const projectDescription =
    activeFolderId === CURRENT_PROJECT_FOLDER_ID
      ? ITALY_PROJECT_DESCRIPTION
      : activeFolder?.description ?? '';

  const [hideTracksHeader, setHideTracksHeader] = useState(false);
  const [trackViewMode, setTrackViewMode] = useState('expanded');
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${LAYOUT_COMPACT_MAX_WIDTH}px)`);
    const sync = () => setHideTracksHeader(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const visibleFolders = folderPath;

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
                      <BreadcrumbSegment
                        label={
                          folder.id === CURRENT_PROJECT_FOLDER_ID
                            ? ITALY_PROJECT_TITLE
                            : folder.name
                        }
                      />
                    </span>
                  ))
                ) : (
                  <BreadcrumbSegment label="Project-Details" />
                )}
              </BreadcrumbText>
            </span>
          </span>
        </div>
        <ProjectCollabBar
          onSoundsLikeClick={onSoundsLikeClick}
          soundsLikePanelOpen={soundsLikePanelOpen}
          onCommentsClick={onCommentsClick}
          commentsPanelOpen={commentsPanelOpen}
          commentsActive={COMMENTS_PANEL_INITIAL_ITEMS.length > 0}
          onClockClick={onClockClick}
          clockPanelOpen={clockPanelOpen}
          collabsActive
        />
      </div>

      <ProjectCard
        title={projectTitle}
        titleTooltip={projectTitleTooltip}
        mobileHeaderTitle={projectTitle}
        description={projectDescription}
        useDefaultThumbnail={tracks.length === 0}
        hasTracks={tracks.length > 0}
        soundsLikePanelOpen={soundsLikePanelOpen}
        commentsPanelOpen={commentsPanelOpen}
        clockPanelOpen={clockPanelOpen}
        onSoundsLikeClick={onPromoSoundsLikeClick}
      />
      <TrackList
        soundsLikePanelOpen={soundsLikePanelOpen}
        onSoundsLikeClick={onSoundsLikeClick}
        onSoundsLikeWithSelection={onSoundsLikeWithSelection}
        tracks={tracks}
        projectTrackCount={projectTrackCount}
        childFolders={childFolders}
        onFolderSelect={onFolderSelect}
        enterHighlightTrackNum={enterHighlightTrackNum}
        scrollToBottomSignal={scrollToBottomSignal}
        hideTracksHeader={hideTracksHeader}
        compactTrackRows={trackViewMode === 'condensed' || trackViewMode === 'simplified'}
        trackViewMode={trackViewMode}
        onTrackViewModeChange={setTrackViewMode}
        customizeViewOptions={[
          { id: 'condensed', label: 'Condensed' },
          { id: 'simplified', label: 'Simplified' },
          { id: 'expanded', label: 'Expanded' },
        ]}
        emptyState={activeFolderId === EMPTY_PROJECT_FOLDER_ID ? 'empty-project' : undefined}
        emptyTracksMessage="No tracks yet."
      />
    </div>
  );
}
