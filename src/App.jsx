import { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProjectsPage from './pages/ProjectsPage';
import FavoritesPage from './pages/FavoritesPage';
import SearchPage from './pages/SearchPage';
import SearchFiltersPanel from './components/SearchFiltersPanel';
import SoundsLikePanel from './components/SoundsLikePanel';
import ProjectsPanel from './components/ProjectsPanel';
import CommentsPanel from './components/CommentsPanel';
import ClockPanel from './components/ClockPanel';
import AudioPlayer from './components/AudioPlayer';
import { ROUTE_FAVORITES, ROUTE_PROJECT_DETAILS, ROUTE_SEARCH } from './constants/routes';
import {
  PROJECTS_TRACKS,
  FAVORITES_TRACKS,
  SAMPLE_AUDIO,
  generateTrackId,
  generateSoundsLikeTrackDescription,
  pickRandomRecordedLabel,
} from './components/TrackList';
import { SOUNDS_LIKE_PANEL_INITIAL_ITEMS, createSoundsLikeItems } from './constants/soundsLikePanel';
import { COMMENTS_PANEL_INITIAL_ITEMS } from './constants/commentsPanel';
import { CLOCK_PANEL_INITIAL_ITEMS } from './constants/clockPanel';

const PANEL_MIN_WIDTH = 263;
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

function AppContent() {
  const location = useLocation();
  const [soundsLikePanelOpen, setSoundsLikePanelOpen] = useState(false);
  const [soundsLikePanelWidth, setSoundsLikePanelWidth] = useState(PANEL_MIN_WIDTH);
  const [projectsPanelOpen, setProjectsPanelOpen] = useState(false);
  const [commentsPanelOpen, setCommentsPanelOpen] = useState(false);
  const [commentsPanelWidth, setCommentsPanelWidth] = useState(PANEL_MIN_WIDTH);
  const [clockPanelOpen, setClockPanelOpen] = useState(false);
  const [clockPanelWidth, setClockPanelWidth] = useState(PANEL_MIN_WIDTH);
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
  const { currentTrack } = usePlayer();

  const mergedProjects = useMemo(() => [...PROJECTS_TRACKS, ...projectsExtraTracks], [projectsExtraTracks]);
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

  const openSoundsLikePanel = useCallback(() => {
    if (location.pathname !== ROUTE_PROJECT_DETAILS && location.pathname !== ROUTE_FAVORITES) return;
    setProjectsPanelOpen(false);
    setCommentsPanelOpen(false);
    setClockPanelOpen(false);
    setSoundsLikeSourceTracks([]);
    setSoundsLikePanelOpen(true);
  }, [location.pathname]);

  const openSoundsLikePanelWithSelection = useCallback((tracks) => {
    if (location.pathname !== ROUTE_PROJECT_DETAILS && location.pathname !== ROUTE_FAVORITES) return;
    if (!tracks?.length) return;
    setProjectsPanelOpen(false);
    setCommentsPanelOpen(false);
    setClockPanelOpen(false);
    setSoundsLikeSourceTracks(tracks);
    setSoundsLikePanelOpen(true);
  }, [location.pathname]);

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

  useEffect(() => {
    if (location.pathname !== ROUTE_PROJECT_DETAILS) {
      setCommentsPanelOpen(false);
      setClockPanelOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === ROUTE_SEARCH) {
      setProjectsPanelOpen(false);
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
    const onResize = () => {
      const next = getProjectsPanelMaxWidth();
      setProjectsPanelMaxWidth(next);
      setProjectsPanelWidth((w) => Math.min(w, next));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const rightPanelOpen = soundsLikePanelOpen || projectsPanelOpen || commentsPanelOpen || clockPanelOpen;

  const rightPanelWidth = projectsPanelOpen
    ? projectsPanelWidth
    : commentsPanelOpen
      ? commentsPanelWidth
      : clockPanelOpen
        ? clockPanelWidth
        : soundsLikePanelOpen
          ? soundsLikePanelWidth
          : 0;
  /** Reserve min panel width so main layout stays fixed; wider panel draws on top without reflow. */
  const mainPaddingRight = rightPanelOpen ? Math.min(rightPanelWidth, PANEL_MIN_WIDTH) : 0;
  const isSearchRoute = location.pathname === ROUTE_SEARCH;

  return (
    <div className={currentTrack ? 'app-root player-visible' : 'app-root'}>
      <Header onOpenProjectsPanel={openProjectsPanel} />
      <Sidebar />
      <div
        className={`app-content-wrapper${rightPanelOpen ? ' app-content--right-panel-open' : ''}${isSearchRoute ? ' app-content-wrapper--search' : ''}`}
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
                  soundsLikePanelOpen={soundsLikePanelOpen}
                  commentsPanelOpen={commentsPanelOpen}
                  clockPanelOpen={clockPanelOpen}
                  onSoundsLikeClick={openSoundsLikePanel}
                  onSoundsLikeWithSelection={openSoundsLikePanelWithSelection}
                  onCommentsClick={openCommentsPanel}
                  onClockClick={openClockPanel}
                  tracks={mergedProjects}
                  enterHighlightTrackNum={enterHighlightTrackNum}
                  scrollToBottomSignal={scrollToBottomSignal}
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
            <Route path={ROUTE_SEARCH} element={<SearchPage />} />
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
      <AudioPlayer onSoundsLikeClick={openSoundsLikePanel} />
    </div>
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
