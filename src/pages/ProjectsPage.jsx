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

function BreadcrumbSeparator() {
  return (
    <span className="breadcrumb-sep" aria-hidden="true">
      <svg
        className="breadcrumb-chevron"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </span>
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
  onProjectPurposeChange,
  onMobileBack,
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
  const projectPurpose = activeFolder?.purpose ?? '';
  const headerTitleClipRef = useRef(null);
  const headerTitleTextRef = useRef(null);
  const [headerTitleTruncated, setHeaderTitleTruncated] = useState(false);
  const [headerTitlePhase, setHeaderTitlePhase] = useState('idle');

  const updateHeaderTitleTruncation = useCallback(() => {
    const clip = headerTitleClipRef.current;
    const text = headerTitleTextRef.current;
    if (!clip || !text || headerTitlePhase !== 'idle') return;
    setHeaderTitleTruncated(text.scrollWidth > clip.clientWidth + 1);
  }, [headerTitlePhase]);

  useEffect(() => {
    const clip = headerTitleClipRef.current;
    const text = headerTitleTextRef.current;
    if (!clip || !text) return;
    updateHeaderTitleTruncation();
    const observer = new ResizeObserver(() => updateHeaderTitleTruncation());
    observer.observe(clip);
    return () => observer.disconnect();
  }, [updateHeaderTitleTruncation, projectTitle]);

  const handleHeaderTitleActivate = useCallback(() => {
    const clip = headerTitleClipRef.current;
    const text = headerTitleTextRef.current;
    if (!clip || !text || !headerTitleTruncated || headerTitlePhase !== 'idle') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const overflow = text.scrollWidth - text.clientWidth;
    if (overflow <= 0) return;
    const seconds = Math.min(12, Math.max(4, overflow / 55));
    text.style.setProperty('--marquee-x', `-${overflow}px`);
    text.style.setProperty('--scroll-duration', `${seconds}s`);
    setHeaderTitlePhase('scroll');
  }, [headerTitleTruncated, headerTitlePhase]);

  const handleHeaderTitleAnimEnd = useCallback((event) => {
    const name = event.animationName ? String(event.animationName) : '';
    const text = headerTitleTextRef.current;
    if (name.includes('project-mobile-hero-title-scroll-once')) {
      setHeaderTitlePhase('fadeOut');
      return;
    }
    if (name.includes('project-mobile-hero-title-fade-out')) {
      if (text) {
        text.style.removeProperty('--marquee-x');
        text.style.removeProperty('--scroll-duration');
      }
      setHeaderTitlePhase('fadeIn');
      return;
    }
    if (name.includes('project-mobile-hero-title-fade-in')) {
      setHeaderTitlePhase('idle');
    }
  }, []);

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
    <div className={`projects-page${phase === PROJECT_PHASE_2 ? ' projects-page--phase-2' : ''}`}>
      {phase === PROJECT_PHASE_2 ? (
        <header className="project-details-mobile-header">
          <button
            type="button"
            className="project-details-mobile-back"
            aria-label="Back to projects"
            onClick={onMobileBack}
          >
            <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
              <path d="M18 11.5L13 16l5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1
            className={`project-details-mobile-header__title${headerTitleTruncated ? ' project-details-mobile-header__title--truncated' : ''}`}
            onClick={handleHeaderTitleActivate}
          >
            <span ref={headerTitleClipRef} className="project-details-mobile-header__title-clip">
              <span
                ref={headerTitleTextRef}
                className={[
                  'project-details-mobile-header__title-text',
                  headerTitlePhase === 'scroll' && 'project-details-mobile-header__title-text--scroll',
                  headerTitlePhase === 'fadeOut' && 'project-details-mobile-header__title-text--held-end project-details-mobile-header__title-text--fade-out-anim',
                  headerTitlePhase === 'fadeIn' && 'project-details-mobile-header__title-text--fade-in-anim',
                ].filter(Boolean).join(' ')}
                onAnimationEnd={handleHeaderTitleAnimEnd}
              >
                {projectTitle}
              </span>
            </span>
          </h1>
          <button type="button" className="btn-cta btn-cta--primary project-details-mobile-header__invite">
            INVITE
          </button>
        </header>
      ) : null}
      <div className="breadcrumb-row">
        <div className="breadcrumb-wrapper">
          <span className="breadcrumb">
            <span className="breadcrumb-highlight">
              <BreadcrumbText>
                {visibleFolders.length ? (
                  visibleFolders.map((folder, i) => (
                    <span key={folder.id} style={{ display: 'contents' }}>
                      {i > 0 && <BreadcrumbSeparator />}
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
        purpose={projectPurpose}
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
        onPurposeChange={
          activeFolderId && onProjectPurposeChange
            ? (nextPurpose) => onProjectPurposeChange(activeFolderId, nextPurpose)
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
        playAllBeforeCustomize={phase === PROJECT_PHASE_2}
        customizeFieldCheckboxes={phase === PROJECT_PHASE_2}
        expandableTrackDetails={phase === PROJECT_PHASE_2}
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
