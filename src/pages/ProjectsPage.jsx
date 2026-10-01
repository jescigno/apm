import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import ProjectCollabBar from '../components/ProjectCollabBar';
import TrackList from '../components/TrackList';
import {
  DEFAULT_PROJECT_CUSTOMIZE,
  getProjectTrackViewMode,
  isProjectCompactList,
} from '../constants/projectTrackCustomize';
import { SEARCH_LAYOUT_TYPES } from '../constants/searchResultsCustomize';
import {
  PROJECT_PHASE_2,
  getProjectPhaseCapabilities,
  parseProjectPhase,
} from '../constants/projectPhases';
import { LAYOUT_COMPACT_MAX_WIDTH } from '../constants/layout';
import {
  EMPTY_PROJECT_FOLDER_ID,
  getFolderChildren,
  getFolderPath,
  PROJECTS_PANEL_FOLDER_TREE,
} from '../constants/projectsPanelTree';
import { COMMENTS_PANEL_INITIAL_ITEMS } from '../constants/commentsPanel';

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
  folderTree = PROJECTS_PANEL_FOLDER_TREE,
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
  enableTrackDragToFolder = false,
  activeTrackDragId = null,
  onTracksReorder,
  onTracksReorderCancel,
  onFoldersReorder,
  onFoldersReorderCancel,
  onProjectTitleChange,
  onProjectDescriptionChange,
}) {
  const [searchParams] = useSearchParams();
  const phase = parseProjectPhase(searchParams);
  const phaseCapabilities = getProjectPhaseCapabilities(phase);

  useEffect(() => {
    document.title = phase === PROJECT_PHASE_2 ? 'Project-Details · Phase 2' : 'Project-Details';
    return () => {
      document.title = DEFAULT_DOC_TITLE;
    };
  }, [phase]);

  const folderPath = useMemo(
    () => getFolderPath(folderTree, activeFolderId),
    [folderTree, activeFolderId]
  );
  const activeFolder = folderPath[folderPath.length - 1] ?? null;
  const childFolders = useMemo(
    () => getFolderChildren(folderTree, activeFolderId),
    [folderTree, activeFolderId]
  );
  const projectTitle = activeFolder?.name ?? 'Project';
  const projectDescription = activeFolder?.description ?? '';

  const [hideTracksHeader, setHideTracksHeader] = useState(false);
  const [projectCustomize, setProjectCustomize] = useState(DEFAULT_PROJECT_CUSTOMIZE);
  const phaseCustomize = useMemo(() => {
    if (phaseCapabilities.trackLayoutControls) return projectCustomize;
    return {
      ...projectCustomize,
      layoutType: SEARCH_LAYOUT_TYPES.LIST,
      listLayout: 'expanded',
    };
  }, [phaseCapabilities.trackLayoutControls, projectCustomize]);
  const trackViewMode = getProjectTrackViewMode(phaseCustomize);

  const handleProjectCustomizeChange = useCallback((next) => {
    if (phaseCapabilities.trackLayoutControls) {
      setProjectCustomize(next);
      return;
    }
    setProjectCustomize((prev) => ({
      ...prev,
      displayFields: next.displayFields,
    }));
  }, [phaseCapabilities.trackLayoutControls]);
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
                      <BreadcrumbSegment label={folder.name} />
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
          hiddenActionIds={phaseCapabilities.soundsLikeCollab ? [] : ['sounds-like']}
        />
      </div>

      <ProjectCard
        title={projectTitle}
        description={projectDescription}
        useDefaultThumbnail={tracks.length === 0}
        hasTracks={tracks.length > 0}
        soundsLikePanelOpen={soundsLikePanelOpen}
        commentsPanelOpen={commentsPanelOpen}
        clockPanelOpen={clockPanelOpen}
        onSoundsLikeClick={onPromoSoundsLikeClick}
        onTitleChange={
          activeFolderId && onProjectTitleChange
            ? (name) => onProjectTitleChange(activeFolderId, name)
            : undefined
        }
        onDescriptionChange={
          activeFolderId && onProjectDescriptionChange
            ? (nextDescription) => onProjectDescriptionChange(activeFolderId, nextDescription)
            : undefined
        }
        showSoundsLikePromo={phaseCapabilities.soundsLikePromo}
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
        compactTrackRows={isProjectCompactList(phaseCustomize)}
        trackViewMode={trackViewMode}
        searchCustomize={phaseCustomize}
        onSearchCustomizeChange={handleProjectCustomizeChange}
        showTrackLayoutControls={phaseCapabilities.trackLayoutControls}
        showShuffle={phaseCapabilities.mobileShuffle}
        emptyState={activeFolderId === EMPTY_PROJECT_FOLDER_ID ? 'empty-project' : undefined}
        emptyTracksMessage="No tracks yet."
        enableTrackDragToFolder={enableTrackDragToFolder}
        sourceFolderId={activeFolderId}
        activeTrackDragId={activeTrackDragId}
        onTracksReorder={onTracksReorder}
        onTracksReorderCancel={onTracksReorderCancel}
        onFoldersReorder={onFoldersReorder}
        onFoldersReorderCancel={onFoldersReorderCancel}
      />
    </div>
  );
}
