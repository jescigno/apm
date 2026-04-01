import { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProjectsPage from './pages/ProjectsPage';
import FavoritesPage from './pages/FavoritesPage';
import SoundsLikePanel from './components/SoundsLikePanel';
import ProjectsPanel from './components/ProjectsPanel';
import AudioPlayer from './components/AudioPlayer';
import {
  PROJECTS_TRACKS,
  FAVORITES_TRACKS,
  SAMPLE_AUDIO,
  generateTrackId,
  generateSoundsLikeTrackDescription,
} from './components/TrackList';
import { SOUNDS_LIKE_PANEL_INITIAL_ITEMS, createSoundsLikeItems } from './constants/soundsLikePanel';

const PANEL_MIN_WIDTH = 263;
const PANEL_MAX_WIDTH = 600;

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
  };
}

function AppContent() {
  const location = useLocation();
  const [soundsLikePanelOpen, setSoundsLikePanelOpen] = useState(false);
  const [soundsLikePanelWidth, setSoundsLikePanelWidth] = useState(PANEL_MIN_WIDTH);
  const [projectsPanelOpen, setProjectsPanelOpen] = useState(false);
  const [projectsPanelWidth, setProjectsPanelWidth] = useState(PANEL_MIN_WIDTH);
  const [soundsLikeItems, setSoundsLikeItems] = useState(() => [...SOUNDS_LIKE_PANEL_INITIAL_ITEMS]);
  const [projectsExtraTracks, setProjectsExtraTracks] = useState([]);
  const [favoritesExtraTracks, setFavoritesExtraTracks] = useState([]);
  const [enterHighlightTrackNum, setEnterHighlightTrackNum] = useState(null);
  const [scrollToBottomSignal, setScrollToBottomSignal] = useState(0);
  const { currentTrack } = usePlayer();

  const mergedProjects = useMemo(() => [...PROJECTS_TRACKS, ...projectsExtraTracks], [projectsExtraTracks]);
  const mergedFavorites = useMemo(() => [...FAVORITES_TRACKS, ...favoritesExtraTracks], [favoritesExtraTracks]);

  const handleSoundsLikeRefresh = useCallback(() => {
    setSoundsLikeItems(createSoundsLikeItems(6, 'sl'));
  }, []);

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

  const handleSoundsLikeAddComplete = useCallback((item) => {
    const isFavorites = location.pathname.startsWith('/favorites');
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
    if (location.pathname !== '/project-details') return;
    setProjectsPanelOpen(false);
    setSoundsLikePanelOpen(true);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/project-details') {
      setSoundsLikePanelOpen(false);
    }
  }, [location.pathname]);

  const openProjectsPanel = () => {
    setSoundsLikePanelOpen(false);
    setProjectsPanelOpen(true);
  };

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

  const rightPanelOpen = soundsLikePanelOpen || projectsPanelOpen;
  const rightPanelWidth = projectsPanelOpen ? projectsPanelWidth : soundsLikePanelOpen ? soundsLikePanelWidth : 0;
  /** Reserve min panel width so main layout stays fixed; wider panel draws on top without reflow. */
  const mainPaddingRight = rightPanelOpen ? Math.min(rightPanelWidth, PANEL_MIN_WIDTH) : 0;

  return (
    <div className={currentTrack ? 'app-root player-visible' : 'app-root'}>
      <Header onOpenProjectsPanel={openProjectsPanel} />
      <Sidebar />
      <div
        className={`app-content-wrapper${rightPanelOpen ? ' app-content--right-panel-open' : ''}`}
        style={rightPanelOpen ? { paddingRight: `${mainPaddingRight}px` } : undefined}
      >
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/project-details" replace />} />
            <Route path="/history" element={<Navigate to="/project-details" replace />} />
            <Route path="/projects" element={<Navigate to="/project-details" replace />} />
            <Route
              path="/project-details"
              element={
                <ProjectsPage
                  soundsLikePanelOpen={soundsLikePanelOpen}
                  onSoundsLikeClick={openSoundsLikePanel}
                  tracks={mergedProjects}
                  enterHighlightTrackNum={enterHighlightTrackNum}
                  scrollToBottomSignal={scrollToBottomSignal}
                />
              }
            />
            <Route
              path="/favorites"
              element={
                <FavoritesPage
                  soundsLikePanelOpen={soundsLikePanelOpen}
                  onSoundsLikeClick={openSoundsLikePanel}
                  tracks={mergedFavorites}
                  enterHighlightTrackNum={enterHighlightTrackNum}
                  scrollToBottomSignal={scrollToBottomSignal}
                />
              }
            />
          </Routes>
        </main>
      </div>
      <SoundsLikePanel
        isOpen={soundsLikePanelOpen}
        onClose={() => setSoundsLikePanelOpen(false)}
        width={soundsLikePanelWidth}
        onWidthChange={setSoundsLikePanelWidth}
        minWidth={PANEL_MIN_WIDTH}
        maxWidth={PANEL_MAX_WIDTH}
        items={soundsLikeItems}
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
        maxWidth={PANEL_MAX_WIDTH}
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
