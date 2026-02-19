import { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProjectCard from './components/ProjectCard';
import TrackList from './components/TrackList';
import SoundsLikePanel from './components/SoundsLikePanel';

const FOLDER_HIERARCHY = [
  { id: 'music-for-sports', label: 'Music for Sports', visible: true },
  { id: 'nfl', label: 'NFL', visible: true },
  { id: 'mnf', label: 'Monday Night Football', visible: true },
];

const PANEL_MIN_WIDTH = 263;
const PANEL_MAX_WIDTH = 600;

function App() {
  const [folders, setFolders] = useState(FOLDER_HIERARCHY);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [soundsLikePanelOpen, setSoundsLikePanelOpen] = useState(false);
  const [soundsLikePanelWidth, setSoundsLikePanelWidth] = useState(PANEL_MIN_WIDTH);
  const breadcrumbRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e) {
      if (breadcrumbRef.current && !breadcrumbRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [dropdownOpen]);

  const visibleFolders = folders.filter((f) => f.visible || f.locked);

  const toggleFolder = (id) => {
    const folder = folders.find((f) => f.id === id);
    if (folder?.locked) return;
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f))
    );
  };

  return (
    <>
      <Header />
      <Sidebar />
      <div
        className={`app-content-wrapper ${soundsLikePanelOpen ? 'panel-open' : ''}`}
        style={soundsLikePanelOpen ? { marginRight: PANEL_MIN_WIDTH } : undefined}
      >
        <main className="main-content">
        <div className="breadcrumb-row">
          <div className="breadcrumb-wrapper" ref={breadcrumbRef}>
            <span
              className="breadcrumb breadcrumb-clickable"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setDropdownOpen(!dropdownOpen)}
            >
              <span className="breadcrumb-highlight">
                {visibleFolders.length ? (
                  visibleFolders.map((folder, i) => (
                    <span key={folder.id}>
                      {i > 0 && <span className="breadcrumb-sep"> / </span>}
                      {folder.label}
                    </span>
                  ))
                ) : (
                  'My Projects'
                )}
                <svg className="breadcrumb-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M7 10l5 5 5-5"/>
                </svg>
              </span>
            </span>
            {dropdownOpen && (
              <div className="breadcrumb-dropdown">
                {folders.map((folder) => (
                  <div key={folder.id} className="breadcrumb-dropdown-item">
                    <svg className="folder-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                    </svg>
                    <span>{folder.label}</span>
                    <button
                      type="button"
                      className={`breadcrumb-toggle ${folder.visible ? 'on' : ''} ${folder.locked ? 'locked' : ''}`}
                      onClick={() => toggleFolder(folder.id)}
                      disabled={folder.locked}
                      aria-label={folder.locked ? `${folder.label} (always visible)` : `${folder.visible ? 'Hide' : 'Show'} ${folder.label} in breadcrumb`}
                    >
                      <span className="breadcrumb-toggle-slider" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="project-collabs">
            <img src="/Collabs.svg" alt="Collaborators" className="project-collabs-icons" />
          </div>
        </div>

        <ProjectCard
          soundsLikePanelOpen={soundsLikePanelOpen}
          onSoundsLikeClick={() => setSoundsLikePanelOpen(true)}
        />
        <TrackList
          soundsLikePanelOpen={soundsLikePanelOpen}
          onSoundsLikeClick={() => setSoundsLikePanelOpen(true)}
        />
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
    </>
  );
}

export default App;
