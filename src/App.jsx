import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProjectsPage from './pages/ProjectsPage';
import FavoritesPage from './pages/FavoritesPage';
import SoundsLikePanel from './components/SoundsLikePanel';
import AudioPlayer from './components/AudioPlayer';

const PANEL_MIN_WIDTH = 263;
const PANEL_MAX_WIDTH = 600;

function AppContent() {
  const [soundsLikePanelOpen, setSoundsLikePanelOpen] = useState(false);
  const [soundsLikePanelWidth, setSoundsLikePanelWidth] = useState(PANEL_MIN_WIDTH);
  const { currentTrack } = usePlayer();

  useEffect(() => {
    if (!soundsLikePanelOpen) {
      setSoundsLikePanelWidth(PANEL_MIN_WIDTH);
    }
  }, [soundsLikePanelOpen]);

  return (
    <div className={currentTrack ? 'app-root player-visible' : 'app-root'}>
      <Header />
      <Sidebar />
      <div
        className={`app-content-wrapper ${soundsLikePanelOpen ? 'panel-open' : ''}`}
        style={soundsLikePanelOpen ? { marginRight: PANEL_MIN_WIDTH } : undefined}
      >
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/history" element={<Navigate to="/projects" replace />} />
            <Route
              path="/projects"
              element={
                <ProjectsPage
                  soundsLikePanelOpen={soundsLikePanelOpen}
                  onSoundsLikeClick={() => setSoundsLikePanelOpen(true)}
                />
              }
            />
            <Route
              path="/favorites"
              element={
                <FavoritesPage
                  soundsLikePanelOpen={soundsLikePanelOpen}
                  onSoundsLikeClick={() => setSoundsLikePanelOpen(true)}
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
      />
      <AudioPlayer onSoundsLikeClick={() => setSoundsLikePanelOpen(true)} />
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
