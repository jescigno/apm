import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProjectsPage from './pages/ProjectsPage';
import FavoritesPage from './pages/FavoritesPage';
import SearchPage from './pages/SearchPage';
import AccountPage from './pages/AccountPage';
import NotificationsPage from './pages/NotificationsPage';
import DesignSystemPage from './pages/DesignSystemPage';
import SearchFiltersPanel from './components/SearchFiltersPanel';
import SoundsLikePanel from './components/SoundsLikePanel';
import ProjectsPanel, { FolderReorderDragOverlay } from './components/ProjectsPanel';
import TrackDragThumbnail from './components/TrackDragThumbnail';
import CommentsPanel from './components/CommentsPanel';
import ClockPanel from './components/ClockPanel';
import TeamMemberActivityPanel from './components/TeamMemberActivityPanel';
import AudioPlayer from './components/AudioPlayer';
import {
  ROUTE_FAVORITES,
  ROUTE_PROJECT_DETAILS,
  ROUTE_SEARCH,
  ROUTE_ACCOUNT,
  ROUTE_NOTIFICATIONS,
  ROUTE_ACCOUNT_NOTIFICATIONS,
  ROUTE_ADMIN,
  ROUTE_ADMIN_TEAM,
  ROUTE_ADMIN_SETTINGS,
  ROUTE_ADMIN_NOTIFICATIONS,
  ROUTE_DESIGN_SYSTEM,
} from './constants/routes';
import AdminPage from './pages/AdminPage';
import {
  CURRENT_PROJECT_FOLDER_ID,
  folderHasProjectTracks,
  PROJECTS_PANEL_FOLDER_TREE,
  findFolderById,
  getSiblingFolders,
  reorderSiblingFolders,
} from './constants/projectsPanelTree';
import {
  PROJECTS_DND_HOLD_MS,
  PROJECTS_DND_HOLD_TOLERANCE_PX,
  PROJECTS_DROP_ANIMATION_MS,
  PROJECTS_FOLDER_REORDER_LAND_MS,
  projectsFolderReorderDropAnimation,
  projectsPanelCollisionDetection,
  getFolderDropTargetId,
} from './constants/projectsPanelDnD';
import {
  ensureLivePointerTracking,
  snapTrackReorderOverlayToCursor,
} from './constants/trackReorderDnD';
import {
  resolveFolderTracks,
  reorderFolderTracksSelection,
  moveTrackBetweenFolders,
  canDropTrackOnFolder,
  adjustFolderTreeTrackCounts,
} from './constants/projectTrackStorage';
import {
  PROJECTS_TRACKS,
  FAVORITES_TRACKS,
  SEARCH_RESULTS_TRACKS,
  SAMPLE_AUDIO,
  generateTrackId,
  generateSoundsLikeTrackDescription,
  pickRandomRecordedLabel,
} from './components/TrackList';
import { SOUNDS_LIKE_PANEL_INITIAL_ITEMS, createSoundsLikeItems } from './constants/soundsLikePanel';
import { COMMENTS_PANEL_INITIAL_ITEMS } from './constants/commentsPanel';
import { CLOCK_PANEL_INITIAL_ITEMS } from './constants/clockPanel';

const PANEL_MIN_WIDTH = 263;
const TEAM_MEMBER_ACTIVITY_PANEL_MIN_WIDTH = 360;
/** Max width for Sounds Like panel (fixed cap). */
const PANEL_MAX_WIDTH = 600;
/** Matches `--sidebar-width`; Projects panel can expand to the sidebar’s right edge. */
const SIDEBAR_WIDTH = 64;
/** Fine-tune max width so the panel’s left edge lines up with the main column (layout offset). */
const PROJECTS_PANEL_MAX_WIDTH_ADJUST = 6;

function getProjectsPanelMaxWidth() {
  if (typeof window === 'undefined') return 4000;
  return Math.max(PANEL_MIN_WIDTH, window.innerWidth - SIDEBAR_WIDTH - PROJECTS_PANEL_MAX_WIDTH_ADJUST);
}

function buildTrackFromSoundsLike(item, mergedTracks) {
  const maxNum = mergedTracks.reduce((m, t) => Math.max(m, t.num), 0);
  return {
    num: maxNum + 1,
    title: item.title,
    id: generateTrackId(),
    versions: 1,
    commentCount: 0,
    desc: generateSoundsLikeTrackDescription(),
    audioUrl: SAMPLE_AUDIO,
    hasLyrics: Math.random() > 0.45,
    stems: Math.floor(Math.random() * 5) + 2,
    recorded: pickRandomRecordedLabel(),
  };
}

const PROJECTS_TRACK_DROP_ANIMATION = {
  duration: PROJECTS_DROP_ANIMATION_MS,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [soundsLikePanelOpen, setSoundsLikePanelOpen] = useState(false);
  const [soundsLikePanelWidth, setSoundsLikePanelWidth] = useState(PANEL_MIN_WIDTH);
  const [projectsPanelOpen, setProjectsPanelOpen] = useState(false);
  const [commentsPanelOpen, setCommentsPanelOpen] = useState(false);
  const [commentsPanelWidth, setCommentsPanelWidth] = useState(PANEL_MIN_WIDTH);
  const [clockPanelOpen, setClockPanelOpen] = useState(false);
  const [clockPanelWidth, setClockPanelWidth] = useState(PANEL_MIN_WIDTH);
  const [teamMemberActivityPanelOpen, setTeamMemberActivityPanelOpen] = useState(false);
  const [teamMemberActivityPanelWidth, setTeamMemberActivityPanelWidth] = useState(
    TEAM_MEMBER_ACTIVITY_PANEL_MIN_WIDTH
  );
  const [activeTeamMemberForActivity, setActiveTeamMemberForActivity] = useState(null);
  const [projectsPanelWidth, setProjectsPanelWidth] = useState(PANEL_MIN_WIDTH);
  const [projectsPanelMaxWidth, setProjectsPanelMaxWidth] = useState(() =>
    getProjectsPanelMaxWidth()
  );
  const [soundsLikeItems, setSoundsLikeItems] = useState(() => [...SOUNDS_LIKE_PANEL_INITIAL_ITEMS]);
  const [soundsLikeSourceTracks, setSoundsLikeSourceTracks] = useState([]);
  const [projectsExtraTracks, setProjectsExtraTracks] = useState([]);
  const [favoritesExtraTracks, setFavoritesExtraTracks] = useState([]);
  const [enterHighlightTrackNum, setEnterHighlightTrackNum] = useState(null);
  const [scrollToBottomSignal, setScrollToBottomSignal] = useState(0);
  const [activeProjectFolderId, setActiveProjectFolderId] = useState(CURRENT_PROJECT_FOLDER_ID);
  const [folderTree, setFolderTree] = useState(() => PROJECTS_PANEL_FOLDER_TREE);
  const [folderTrackOverrides, setFolderTrackOverrides] = useState({});
  const [activeDrag, setActiveDrag] = useState(null);
  const [trackDropTargetFolderId, setTrackDropTargetFolderId] = useState(null);
  const [trackLandAnimation, setTrackLandAnimation] = useState(null);
  const [folderReorderLandAnimation, setFolderReorderLandAnimation] = useState(null);
  const suppressFolderClickRef = useRef(false);
  const projectsDragOverlayClearTimerRef = useRef(null);
  const folderReorderLandTimerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const headerMenuRef = useRef(null);
  const { currentTrack, isPlayerClosing } = usePlayer();

  const mergedProjects = useMemo(() => [...PROJECTS_TRACKS, ...projectsExtraTracks], [projectsExtraTracks]);
  const projectPageTracks = useMemo(() => {
    if (!folderHasProjectTracks(activeProjectFolderId)) return [];
    return resolveFolderTracks(activeProjectFolderId, folderTrackOverrides, mergedProjects);
  }, [activeProjectFolderId, folderTrackOverrides, mergedProjects]);

  const enableProjectTrackDrag = location.pathname === ROUTE_PROJECT_DETAILS && projectsPanelOpen;
  const activeTrackDragId =
    activeDrag?.type === 'track' && typeof activeDrag.id === 'string' ? activeDrag.id : null;

  const projectsDragSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: PROJECTS_DND_HOLD_MS,
        tolerance: PROJECTS_DND_HOLD_TOLERANCE_PX,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: PROJECTS_DND_HOLD_MS,
        tolerance: PROJECTS_DND_HOLD_TOLERANCE_PX,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const scheduleProjectsDragOverlayClear = useCallback((afterClear, duration = PROJECTS_DROP_ANIMATION_MS) => {
    if (projectsDragOverlayClearTimerRef.current != null) {
      window.clearTimeout(projectsDragOverlayClearTimerRef.current);
    }
    projectsDragOverlayClearTimerRef.current = window.setTimeout(() => {
      projectsDragOverlayClearTimerRef.current = null;
      setActiveDrag(null);
      setTrackDropTargetFolderId(null);
      afterClear?.();
    }, duration);
  }, []);

  const handleProjectsDragStart = useCallback((event) => {
    suppressFolderClickRef.current = true;
    const dragType = event.active.data.current?.type;
    if (dragType === 'track') {
      setActiveDrag({
        type: 'track',
        id: event.active.id,
        track: event.active.data.current.track,
      });
      setTrackDropTargetFolderId(null);
      return;
    }
    if (dragType === 'folder') {
      const folder = findFolderById(folderTree, event.active.id);
      if (folder) {
        setActiveDrag({ type: 'folder', id: event.active.id, folder });
      }
      setTrackDropTargetFolderId(null);
    }
  }, [folderTree]);

  const handleProjectsDragOver = useCallback((event) => {
    if (event.active.data.current?.type !== 'track') {
      setTrackDropTargetFolderId(null);
      return;
    }
    const targetFolderId = getFolderDropTargetId(event.over);
    const sourceFolderId = event.active.data.current?.sourceFolderId;
    if (targetFolderId && canDropTrackOnFolder(targetFolderId, sourceFolderId)) {
      setTrackDropTargetFolderId(targetFolderId);
      return;
    }
    setTrackDropTargetFolderId(null);
  }, []);

  const handleProjectsDragCancel = useCallback(() => {
    if (projectsDragOverlayClearTimerRef.current != null) {
      window.clearTimeout(projectsDragOverlayClearTimerRef.current);
      projectsDragOverlayClearTimerRef.current = null;
    }
    if (folderReorderLandTimerRef.current != null) {
      window.clearTimeout(folderReorderLandTimerRef.current);
      folderReorderLandTimerRef.current = null;
    }
    setActiveDrag(null);
    setTrackDropTargetFolderId(null);
    setFolderReorderLandAnimation(null);
    suppressFolderClickRef.current = false;
  }, []);

  const handleProjectsDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      const dragType = active.data.current?.type;

      if (dragType === 'track') {
        const track = active.data.current?.track;
        const sourceFolderId = active.data.current?.sourceFolderId;
        const targetFolderId = getFolderDropTargetId(over);
        if (
          track &&
          sourceFolderId &&
          targetFolderId &&
          canDropTrackOnFolder(targetFolderId, sourceFolderId)
        ) {
          setFolderTrackOverrides((prev) =>
            moveTrackBetweenFolders({
              track,
              sourceFolderId,
              targetFolderId,
              folderTrackOverrides: prev,
              mergedProjects,
            })
          );
          setFolderTree((prev) => adjustFolderTreeTrackCounts(prev, sourceFolderId, targetFolderId));
          setTrackLandAnimation({ folderId: targetFolderId, track, key: Date.now() });
        }
        scheduleProjectsDragOverlayClear(() => {
          suppressFolderClickRef.current = false;
        });
        return;
      }

      if (dragType === 'folder') {
        const didReorder = Boolean(over && active.id !== over.id);
        if (didReorder) {
          const activeParent = active.data.current?.parentId;
          const overParent = over.data.current?.parentId;
          if (activeParent === overParent) {
            const siblings = getSiblingFolders(folderTree, activeParent);
            const oldIndex = siblings.findIndex((folder) => folder.id === active.id);
            const newIndex = siblings.findIndex((folder) => folder.id === over.id);
            if (oldIndex >= 0 && newIndex >= 0) {
              const movedFolderId = String(active.id);
              setFolderTree(
                reorderSiblingFolders(
                  folderTree,
                  activeParent === 'root' ? null : activeParent,
                  oldIndex,
                  newIndex
                )
              );
              if (folderReorderLandTimerRef.current != null) {
                window.clearTimeout(folderReorderLandTimerRef.current);
              }
              folderReorderLandTimerRef.current = window.setTimeout(() => {
                folderReorderLandTimerRef.current = null;
                setFolderReorderLandAnimation({ folderId: movedFolderId, key: Date.now() });
              }, PROJECTS_DROP_ANIMATION_MS);
              scheduleProjectsDragOverlayClear(
                () => {
                  suppressFolderClickRef.current = false;
                },
                PROJECTS_DROP_ANIMATION_MS + PROJECTS_FOLDER_REORDER_LAND_MS
              );
              return;
            }
          }
        }
        scheduleProjectsDragOverlayClear(() => {
          if (!didReorder) {
            suppressFolderClickRef.current = false;
          }
        });
      }
    },
    [folderTree, mergedProjects, scheduleProjectsDragOverlayClear]
  );

  useEffect(() => {
    if (!folderReorderLandAnimation) return;
    const timer = window.setTimeout(() => setFolderReorderLandAnimation(null), PROJECTS_FOLDER_REORDER_LAND_MS);
    return () => window.clearTimeout(timer);
  }, [folderReorderLandAnimation]);

  useEffect(() => {
    return () => {
      if (projectsDragOverlayClearTimerRef.current != null) {
        window.clearTimeout(projectsDragOverlayClearTimerRef.current);
      }
      if (folderReorderLandTimerRef.current != null) {
        window.clearTimeout(folderReorderLandTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    ensureLivePointerTracking();
  }, []);

  useEffect(() => {
    if (!trackLandAnimation) return;
    const timer = window.setTimeout(() => setTrackLandAnimation(null), 1600);
    return () => window.clearTimeout(timer);
  }, [trackLandAnimation]);

  const activeDragFolder = useMemo(() => {
    if (activeDrag?.type !== 'folder') return null;
    return activeDrag.folder ?? findFolderById(folderTree, activeDrag.id);
  }, [activeDrag, folderTree]);

  const activeDragTrack = activeDrag?.type === 'track' ? activeDrag.track : null;

  const handleProjectFolderSelect = useCallback(
    (folderId) => {
      setActiveProjectFolderId(folderId);
      navigate(ROUTE_PROJECT_DETAILS);
    },
    [navigate]
  );

  const handleTracksReorder = useCallback(
    (activeId, overId, selectedIds) => {
      setFolderTrackOverrides((prev) =>
        reorderFolderTracksSelection({
          folderId: activeProjectFolderId,
          activeId,
          overId,
          selectedIds,
          folderTrackOverrides: prev,
          mergedProjects,
        })
      );
    },
    [activeProjectFolderId, mergedProjects]
  );

  const mergedFavorites = useMemo(() => [...FAVORITES_TRACKS, ...favoritesExtraTracks], [favoritesExtraTracks]);

  const refreshSoundsLikeResults = useCallback(() => {
    setSoundsLikeItems(createSoundsLikeItems(6, 'sl'));
  }, []);

  const handleSoundsLikeRefresh = refreshSoundsLikeResults;

  const handleSoundsLikeLoadMore = useCallback(() => {
    setSoundsLikeItems((prev) => [...prev, ...createSoundsLikeItems(3, 'sl')]);
  }, []);

  const handleSoundsLikeEnterComplete = useCallback((id) => {
    setSoundsLikeItems((prev) =>
      prev.map((item) =>
        item.id === id && item.animateEnter ? { ...item, animateEnter: false } : item
      )
    );
  }, []);

  const handleRemoveSourceTrack = useCallback((trackId) => {
    setSoundsLikeSourceTracks((prev) => prev.filter((track) => track.id !== trackId));
    refreshSoundsLikeResults();
  }, [refreshSoundsLikeResults]);

  const handleSoundsLikeAddComplete = useCallback((item) => {
    const isFavorites = location.pathname.startsWith(ROUTE_FAVORITES);
    const merged = isFavorites
      ? [...FAVORITES_TRACKS, ...favoritesExtraTracks]
      : [...PROJECTS_TRACKS, ...projectsExtraTracks];
    const newTrack = buildTrackFromSoundsLike(item, merged);
    setSoundsLikeItems((prev) => {
      const without = prev.filter((i) => i.id !== item.id);
      const [nextPanelRow] = createSoundsLikeItems(1, 'sl');
      return [...without, nextPanelRow];
    });
    if (isFavorites) {
      setFavoritesExtraTracks((prev) => [...prev, newTrack]);
    } else {
      setProjectsExtraTracks((prev) => [...prev, newTrack]);
    }
    setEnterHighlightTrackNum(newTrack.num);
    setScrollToBottomSignal((n) => n + 1);
  }, [location.pathname, favoritesExtraTracks, projectsExtraTracks]);

  useEffect(() => {
    if (enterHighlightTrackNum == null) return;
    const t = window.setTimeout(() => setEnterHighlightTrackNum(null), 2350);
    return () => window.clearTimeout(t);
  }, [enterHighlightTrackNum]);

  const openSoundsLikePanelFromPromo = useCallback(() => {
    if (location.pathname !== ROUTE_PROJECT_DETAILS) return;
    setProjectsPanelOpen(false);
    setCommentsPanelOpen(false);
    setClockPanelOpen(false);
    setSoundsLikeSourceTracks([]);
    setSoundsLikePanelOpen(true);
  }, [location.pathname]);

  const openSoundsLikePanel = useCallback((tracksOrTrack) => {
    if (location.pathname !== ROUTE_PROJECT_DETAILS && location.pathname !== ROUTE_FAVORITES) return;
    const sourceTracks = Array.isArray(tracksOrTrack)
      ? tracksOrTrack
      : tracksOrTrack
        ? [tracksOrTrack]
        : [];
    setProjectsPanelOpen(false);
    setCommentsPanelOpen(false);
    setClockPanelOpen(false);
    setSoundsLikeSourceTracks(sourceTracks);
    setSoundsLikePanelOpen(true);
  }, [location.pathname]);

  const openSoundsLikePanelWithSelection = useCallback((tracks) => {
    if (!tracks?.length) return;
    openSoundsLikePanel(tracks);
  }, [openSoundsLikePanel]);

  const closeSoundsLikePanel = useCallback(() => {
    setSoundsLikePanelOpen(false);
    setSoundsLikeSourceTracks([]);
  }, []);

  useEffect(() => {
    if (location.pathname !== ROUTE_PROJECT_DETAILS && location.pathname !== ROUTE_FAVORITES) {
      setSoundsLikePanelOpen(false);
      setSoundsLikeSourceTracks([]);
    }
  }, [location.pathname]);

  const openProjectsPanel = () => {
    setSoundsLikePanelOpen(false);
    setCommentsPanelOpen(false);
    setClockPanelOpen(false);
    setProjectsPanelOpen(true);
  };

  const handleHomeNavClick = useCallback(() => {
    openProjectsPanel();
    if (location.pathname !== ROUTE_PROJECT_DETAILS) {
      navigate(ROUTE_PROJECT_DETAILS);
    }
  }, [location.pathname, navigate]);

  const openCommentsPanel = useCallback(() => {
    if (location.pathname !== ROUTE_PROJECT_DETAILS) return;
    setSoundsLikePanelOpen(false);
    setProjectsPanelOpen(false);
    setClockPanelOpen(false);
    setCommentsPanelOpen((open) => !open);
  }, [location.pathname]);

  const openClockPanel = useCallback(() => {
    if (location.pathname !== ROUTE_PROJECT_DETAILS) return;
    setSoundsLikePanelOpen(false);
    setProjectsPanelOpen(false);
    setCommentsPanelOpen(false);
    setClockPanelOpen((open) => !open);
  }, [location.pathname]);

  const openTeamMemberActivityPanel = useCallback((member) => {
    setSoundsLikePanelOpen(false);
    setProjectsPanelOpen(false);
    setCommentsPanelOpen(false);
    setClockPanelOpen(false);
    setActiveTeamMemberForActivity(member);
    setTeamMemberActivityPanelOpen(true);
  }, []);

  const closeTeamMemberActivityPanel = useCallback(() => {
    setTeamMemberActivityPanelOpen(false);
    setActiveTeamMemberForActivity(null);
  }, []);

  useEffect(() => {
    if (location.pathname !== ROUTE_PROJECT_DETAILS) {
      setCommentsPanelOpen(false);
      setClockPanelOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === ROUTE_SEARCH) {
      setProjectsPanelOpen(false);
    } else {
      setSearchQuery('');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!soundsLikePanelOpen) {
      setSoundsLikePanelWidth(PANEL_MIN_WIDTH);
    }
  }, [soundsLikePanelOpen]);

  useEffect(() => {
    if (!projectsPanelOpen) {
      setProjectsPanelWidth(PANEL_MIN_WIDTH);
    }
  }, [projectsPanelOpen]);

  useEffect(() => {
    if (!commentsPanelOpen) {
      setCommentsPanelWidth(PANEL_MIN_WIDTH);
    }
  }, [commentsPanelOpen]);

  useEffect(() => {
    if (!clockPanelOpen) {
      setClockPanelWidth(PANEL_MIN_WIDTH);
    }
  }, [clockPanelOpen]);

  useEffect(() => {
    const adminRoutes = [
      ROUTE_ADMIN,
      ROUTE_ADMIN_TEAM,
      ROUTE_ADMIN_SETTINGS,
      ROUTE_ADMIN_NOTIFICATIONS,
    ];
    if (!adminRoutes.includes(location.pathname)) {
      setTeamMemberActivityPanelOpen(false);
      setActiveTeamMemberForActivity(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!teamMemberActivityPanelOpen) {
      setTeamMemberActivityPanelWidth(TEAM_MEMBER_ACTIVITY_PANEL_MIN_WIDTH);
    }
  }, [teamMemberActivityPanelOpen]);

  useEffect(() => {
    const onResize = () => {
      const next = getProjectsPanelMaxWidth();
      setProjectsPanelMaxWidth(next);
      setProjectsPanelWidth((w) => Math.min(w, next));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const rightPanelOpen =
    soundsLikePanelOpen ||
    projectsPanelOpen ||
    commentsPanelOpen ||
    clockPanelOpen ||
    teamMemberActivityPanelOpen;

  const rightPanelWidth = projectsPanelOpen
    ? projectsPanelWidth
    : commentsPanelOpen
      ? commentsPanelWidth
      : clockPanelOpen
        ? clockPanelWidth
        : teamMemberActivityPanelOpen
          ? teamMemberActivityPanelWidth
          : soundsLikePanelOpen
            ? soundsLikePanelWidth
            : 0;
  /** Reserve min panel width so main layout stays fixed; wider panel draws on top without reflow. */
  const mainPaddingRight = rightPanelOpen
    ? Math.min(
        rightPanelWidth,
        teamMemberActivityPanelOpen ? TEAM_MEMBER_ACTIVITY_PANEL_MIN_WIDTH : PANEL_MIN_WIDTH
      )
    : 0;
  const isSearchRoute = location.pathname === ROUTE_SEARCH;
  const isProjectsRoute = location.pathname === ROUTE_PROJECT_DETAILS;
  const isAccountRoute =
    location.pathname === ROUTE_ACCOUNT || location.pathname === ROUTE_ACCOUNT_NOTIFICATIONS;
  const isAdminRoute = [
    ROUTE_ADMIN,
    ROUTE_ADMIN_TEAM,
    ROUTE_ADMIN_SETTINGS,
    ROUTE_ADMIN_NOTIFICATIONS,
  ].includes(location.pathname);
  const isNotificationsRoute = location.pathname === ROUTE_NOTIFICATIONS;
  const isDesignSystemRoute = location.pathname === ROUTE_DESIGN_SYSTEM;
  const isFullBleedRoute =
    isAccountRoute || isAdminRoute || isNotificationsRoute || isDesignSystemRoute;

  const handleRecentSearchSelect = useCallback((item) => {
    setSearchQuery(item.label);
  }, []);

  return (
    <DndContext
      sensors={projectsDragSensors}
      collisionDetection={projectsPanelCollisionDetection}
      onDragStart={handleProjectsDragStart}
      onDragOver={handleProjectsDragOver}
      onDragEnd={handleProjectsDragEnd}
      onDragCancel={handleProjectsDragCancel}
    >
    <div className={currentTrack || isPlayerClosing ? 'app-root player-visible' : 'app-root'}>
      <Header
        onOpenProjectsPanel={openProjectsPanel}
        searchQuery={isSearchRoute ? searchQuery : ''}
        onSearchQueryChange={isSearchRoute ? setSearchQuery : undefined}
        headerMenuRef={headerMenuRef}
      />
      <Sidebar onHomeClick={handleHomeNavClick} />
      <div
        className={`app-content-wrapper${rightPanelOpen ? ' app-content--right-panel-open' : ''}${isSearchRoute ? ' app-content-wrapper--search' : ''}${isProjectsRoute ? ' app-content-wrapper--projects' : ''}${isFullBleedRoute ? ' app-content-wrapper--account' : ''}`}
        style={rightPanelOpen ? { paddingRight: `${mainPaddingRight}px` } : undefined}
      >
        {isSearchRoute && <SearchFiltersPanel />}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to={ROUTE_PROJECT_DETAILS} replace />} />
            <Route path="/history" element={<Navigate to={ROUTE_PROJECT_DETAILS} replace />} />
            <Route path="/projects" element={<Navigate to={ROUTE_PROJECT_DETAILS} replace />} />
            <Route
              path={ROUTE_PROJECT_DETAILS}
              element={
                <ProjectsPage
                  activeFolderId={activeProjectFolderId}
                  folderTree={folderTree}
                  onFolderSelect={handleProjectFolderSelect}
                  soundsLikePanelOpen={soundsLikePanelOpen}
                  commentsPanelOpen={commentsPanelOpen}
                  clockPanelOpen={clockPanelOpen}
                  onSoundsLikeClick={openSoundsLikePanel}
                  onPromoSoundsLikeClick={openSoundsLikePanelFromPromo}
                  onSoundsLikeWithSelection={openSoundsLikePanelWithSelection}
                  onCommentsClick={openCommentsPanel}
                  onClockClick={openClockPanel}
                  tracks={projectPageTracks}
                  projectTrackCount={projectPageTracks.length}
                  enterHighlightTrackNum={enterHighlightTrackNum}
                  scrollToBottomSignal={scrollToBottomSignal}
                  enableTrackDragToFolder={enableProjectTrackDrag}
                  activeTrackDragId={activeTrackDragId}
                  onTracksReorder={handleTracksReorder}
                />
              }
            />
            <Route
              path={ROUTE_FAVORITES}
              element={
                <FavoritesPage
                  soundsLikePanelOpen={soundsLikePanelOpen}
                  onSoundsLikeClick={openSoundsLikePanel}
                  onSoundsLikeWithSelection={openSoundsLikePanelWithSelection}
                  tracks={mergedFavorites}
                  enterHighlightTrackNum={enterHighlightTrackNum}
                  scrollToBottomSignal={scrollToBottomSignal}
                />
              }
            />
            <Route
              path={ROUTE_SEARCH}
              element={
                <SearchPage
                  searchQuery={searchQuery}
                  onRecentSearchSelect={handleRecentSearchSelect}
                  soundsLikePanelOpen={soundsLikePanelOpen}
                  onSoundsLikeClick={openSoundsLikePanel}
                  onSoundsLikeWithSelection={openSoundsLikePanelWithSelection}
                  tracks={SEARCH_RESULTS_TRACKS}
                  enterHighlightTrackNum={enterHighlightTrackNum}
                  scrollToBottomSignal={scrollToBottomSignal}
                />
              }
            />
            <Route path={ROUTE_NOTIFICATIONS} element={<NotificationsPage />} />
            <Route path={ROUTE_ACCOUNT_NOTIFICATIONS} element={<AccountPage headerMenuRef={headerMenuRef} />} />
            <Route path={ROUTE_ACCOUNT} element={<AccountPage headerMenuRef={headerMenuRef} />} />
            <Route path={ROUTE_ADMIN_NOTIFICATIONS} element={<AdminPage headerMenuRef={headerMenuRef} onOpenMemberActivity={openTeamMemberActivityPanel} />} />
            <Route path={ROUTE_ADMIN_SETTINGS} element={<AdminPage headerMenuRef={headerMenuRef} onOpenMemberActivity={openTeamMemberActivityPanel} />} />
            <Route path={ROUTE_ADMIN_TEAM} element={<AdminPage headerMenuRef={headerMenuRef} onOpenMemberActivity={openTeamMemberActivityPanel} />} />
            <Route path={ROUTE_ADMIN} element={<AdminPage headerMenuRef={headerMenuRef} onOpenMemberActivity={openTeamMemberActivityPanel} />} />
            <Route path={ROUTE_DESIGN_SYSTEM} element={<DesignSystemPage />} />
          </Routes>
        </main>
      </div>
      <SoundsLikePanel
        isOpen={soundsLikePanelOpen}
        onClose={closeSoundsLikePanel}
        width={soundsLikePanelWidth}
        onWidthChange={setSoundsLikePanelWidth}
        minWidth={PANEL_MIN_WIDTH}
        maxWidth={PANEL_MAX_WIDTH}
        sourceTracks={soundsLikeSourceTracks}
        items={soundsLikeItems}
        onRemoveSourceTrack={handleRemoveSourceTrack}
        onAddComplete={handleSoundsLikeAddComplete}
        onRefresh={handleSoundsLikeRefresh}
        onLoadMore={handleSoundsLikeLoadMore}
        onItemEnterAnimationComplete={handleSoundsLikeEnterComplete}
      />
      <ProjectsPanel
        isOpen={projectsPanelOpen}
        onClose={() => setProjectsPanelOpen(false)}
        width={projectsPanelWidth}
        onWidthChange={setProjectsPanelWidth}
        minWidth={PANEL_MIN_WIDTH}
        maxWidth={projectsPanelMaxWidth}
        selectedFolderId={location.pathname === ROUTE_PROJECT_DETAILS ? activeProjectFolderId : null}
        onFolderSelect={handleProjectFolderSelect}
        folderTree={folderTree}
        onFolderTreeChange={setFolderTree}
        trackDropTargetFolderId={trackDropTargetFolderId}
        trackLandAnimation={trackLandAnimation}
        folderReorderLandAnimation={folderReorderLandAnimation}
        trackDragActive={Boolean(activeTrackDragId)}
        suppressFolderClickRef={suppressFolderClickRef}
      />
      <CommentsPanel
        isOpen={commentsPanelOpen}
        onClose={() => setCommentsPanelOpen(false)}
        width={commentsPanelWidth}
        onWidthChange={setCommentsPanelWidth}
        minWidth={PANEL_MIN_WIDTH}
        maxWidth={PANEL_MAX_WIDTH}
        items={COMMENTS_PANEL_INITIAL_ITEMS}
      />
      <ClockPanel
        isOpen={clockPanelOpen}
        onClose={() => setClockPanelOpen(false)}
        width={clockPanelWidth}
        onWidthChange={setClockPanelWidth}
        minWidth={PANEL_MIN_WIDTH}
        maxWidth={PANEL_MAX_WIDTH}
        items={CLOCK_PANEL_INITIAL_ITEMS}
      />
      <TeamMemberActivityPanel
        isOpen={teamMemberActivityPanelOpen}
        onClose={closeTeamMemberActivityPanel}
        member={activeTeamMemberForActivity}
        width={teamMemberActivityPanelWidth}
        onWidthChange={setTeamMemberActivityPanelWidth}
        minWidth={TEAM_MEMBER_ACTIVITY_PANEL_MIN_WIDTH}
        maxWidth={PANEL_MAX_WIDTH}
      />
      <AudioPlayer onSoundsLikeClick={openSoundsLikePanel} />
    </div>
    <DragOverlay
      dropAnimation={
        activeDragFolder ? projectsFolderReorderDropAnimation : PROJECTS_TRACK_DROP_ANIMATION
      }
      modifiers={activeDragTrack ? [snapTrackReorderOverlayToCursor] : undefined}
      className={activeDragTrack ? 'track-drag-overlay-shell' : undefined}
      style={activeDragTrack ? { width: 'auto', height: 'auto' } : undefined}
    >
      {activeDragTrack ? (
        <TrackDragThumbnail track={activeDragTrack} />
      ) : activeDragFolder ? (
        <FolderReorderDragOverlay
          folder={activeDragFolder}
          folderTree={folderTree}
          panelWidth={projectsPanelWidth}
          selectedFolderId={
            location.pathname === ROUTE_PROJECT_DETAILS ? activeProjectFolderId : null
          }
          folderReorderLandAnimation={folderReorderLandAnimation}
        />
      ) : null}
    </DragOverlay>
    </DndContext>
  );
}

function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
}

export default App;
