import { useState } from 'react';
import TrackRow from './TrackRow';
import { usePlayer } from '../context/PlayerContext';

const SAMPLE_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

const TRACKS_BASE = [
  { num: 1, title: 'Rocking the Stadium', id: 'ROCK-0231 #1', versions: 4, commentCount: 2, desc: 'Big hard-hitting stadium rock sounds with fast paced anthemic rock guitars, high energy riffs and off beat synth melodies.', audioUrl: SAMPLE_AUDIO },
  { num: 2, title: '#3 Stadium Anthem - Narrartive Instrumental', id: 'ROCK-0232 #2', versions: 3, commentCount: 5, desc: 'Uplifting anthemic rock with soaring guitars and driving percussion.', audioUrl: SAMPLE_AUDIO },
  { num: 3, title: 'Victory March', id: 'ROCK-0233 #3', versions: 5, commentCount: 2, desc: 'Powerful march-style arrangement with brass and percussion.', audioUrl: SAMPLE_AUDIO },
  { num: 4, title: 'Game Day Energy- Stem One', id: 'ROCK-0234 #4', versions: 4, commentCount: 3, desc: 'High-energy rock for game day broadcast moments.', audioUrl: SAMPLE_AUDIO },
  { num: 5, title: 'Stadium Roar', id: 'ROCK-0235 #5', versions: 3, commentCount: 7, desc: 'Crowd-inspired intensity with powerful dynamics.', audioUrl: SAMPLE_AUDIO },
  { num: 6, title: 'Touchdown Charge', id: 'ROCK-0236 #6', versions: 4, commentCount: 1, desc: 'Buildup to the big moment with rising tension and payoff.', audioUrl: SAMPLE_AUDIO },
  { num: 7, title: 'Prime Time', id: 'ROCK-0237 #7', versions: 3, commentCount: 4, desc: 'Broadcast-ready rock with punchy hooks and tight production.', audioUrl: SAMPLE_AUDIO },
  { num: 8, title: 'Championship Drive', id: 'ROCK-0238 #8', versions: 5, commentCount: 6, desc: 'Epic climactic themes for championship coverage.', audioUrl: SAMPLE_AUDIO },
  { num: 9, title: 'Kickoff Frenzy', id: 'ROCK-0239 #9', versions: 3, commentCount: 2, desc: 'Explosive opener with driving drums and bold guitars.', audioUrl: SAMPLE_AUDIO },
  { num: 10, title: 'Overtime', id: 'ROCK-0240 #10', versions: 4, commentCount: 9, desc: 'Suspenseful extended tension with dramatic payoff.', audioUrl: SAMPLE_AUDIO },
];

const FAVORITES_TRACKS = [...TRACKS_BASE];

const PROJECTS_TRACKS = TRACKS_BASE.map((t) => {
  if (t.num === 2) return { ...t, title: 'Stadium Anthem' };
  if (t.num === 4) return { ...t, title: 'Game Day Energy' };
  return { ...t };
});

export { PROJECTS_TRACKS, FAVORITES_TRACKS };

const ALBUMS = [
  { num: 1, title: 'Stadium Anthems', id: 'ALB-001', commentCount: 3, desc: 'Collection of high-energy stadium rock tracks for Monday Night Football.', audioUrl: SAMPLE_AUDIO },
  { num: 2, title: 'Game Day Essentials', id: 'ALB-002', commentCount: 1, desc: 'Essential game day music with anthemic rock and driving percussion.', audioUrl: SAMPLE_AUDIO },
  { num: 3, title: 'Championship Pack', id: 'ALB-003', commentCount: 5, desc: 'Epic themes and victory marches for championship coverage.', audioUrl: SAMPLE_AUDIO },
  { num: 4, title: 'Prime Time Sounds', id: 'ALB-004', commentCount: 0, desc: 'Broadcast-ready tracks with punchy hooks and tight production.', audioUrl: SAMPLE_AUDIO },
];

export function TrackListTabs({ activeTab, onTabChange, className, showSearchesTab }) {
  return (
    <div className={`tabs ${className || ''}`.trim()}>
      <button
        type="button"
        className={`tab ${activeTab === 'tracks' ? 'active' : ''}`}
        onClick={() => onTabChange('tracks')}
      >
        Tracks
      </button>
      <button
        type="button"
        className={`tab ${activeTab === 'albums' ? 'active' : ''}`}
        onClick={() => onTabChange('albums')}
      >
        Albums
      </button>
      {showSearchesTab && (
        <button
          type="button"
          className={`tab ${activeTab === 'searches' ? 'active' : ''}`}
          onClick={() => onTabChange('searches')}
        >
          Searches
        </button>
      )}
    </div>
  );
}

export function TrackListTrackCount({ activeTab, tracks }) {
  const trackCount = (tracks || FAVORITES_TRACKS).length;
  const text = activeTab === 'tracks'
    ? `${trackCount} TITLES`
    : activeTab === 'albums'
      ? `${ALBUMS.length} Albums`
      : '0 Searches';
  return <span className="track-count">{text}</span>;
}

function TrackList({ soundsLikePanelOpen, onSoundsLikeClick, activeTab: controlledTab, onTabChange, tabsInBreadcrumb, showSearchesTab = false, tracks: tracksProp, enableTrackDetailsOverlay = false }) {
  const tracks = tracksProp ?? FAVORITES_TRACKS;
  const [internalTab, setInternalTab] = useState('tracks');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = onTabChange ?? setInternalTab;
  const { playTrack, playQueue, togglePlayPause, currentTrack, isPlaying } = usePlayer();

  const isCurrentTrack = (item) =>
    currentTrack && ((item.id && item.id === currentTrack.id) || (item.num === currentTrack.num));

  const hasHeaderContent = !tabsInBreadcrumb;
  const currentTracks = activeTab === 'tracks' ? tracks : ALBUMS;
  const handlePlayAll = () => playQueue(currentTracks, 0);

  return (
    <div className="tracks-section">
      {hasHeaderContent && (
        <div className="tracks-header">
          <TrackListTabs activeTab={activeTab} onTabChange={setActiveTab} showSearchesTab={showSearchesTab} />
          <span className="track-count">
            {activeTab === 'tracks'
              ? `${tracks.length} TITLES`
              : activeTab === 'albums'
                ? `${ALBUMS.length} Albums`
                : '0 Searches'}
          </span>
          <div className="tracks-actions">
            <button type="button" className="btn-secondary"><img src="/Reorder.svg" alt="" /> REORDER</button>
            <button type="button" className="btn-secondary btn-play-all" onClick={handlePlayAll}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> PLAY ALL
            </button>
            <button type="button" className="btn-secondary"><img src="/Customize.svg" alt="" /> CUSTOMIZE</button>
          </div>
        </div>
      )}
      <div className="track-list">
        {activeTab === 'tracks' &&
          tracks.map((track) => (
            <TrackRow
              key={`track-${track.num}`}
              track={track}
              trackList={tracks}
              isLiked
              soundsLikePanelOpen={soundsLikePanelOpen}
              onSoundsLikeClick={onSoundsLikeClick}
              onPlay={playTrack}
              onTogglePause={togglePlayPause}
              isCurrentTrack={isCurrentTrack(track)}
              isPlaying={isPlaying}
              compact={tabsInBreadcrumb}
              enableTrackDetailsOverlay={enableTrackDetailsOverlay}
            />
          ))}
        {activeTab === 'albums' &&
          ALBUMS.map((album) => (
            <TrackRow
              key={`album-${album.num}`}
              album={album}
              trackList={ALBUMS}
              variant="album"
              isLiked
              soundsLikePanelOpen={soundsLikePanelOpen}
              onSoundsLikeClick={onSoundsLikeClick}
              onPlay={playTrack}
              onTogglePause={togglePlayPause}
              isCurrentTrack={isCurrentTrack(album)}
              isPlaying={isPlaying}
              compact={tabsInBreadcrumb}
              enableTrackDetailsOverlay={enableTrackDetailsOverlay}
            />
          ))}
        {activeTab === 'searches' && (
          <div className="track-list-empty">No saved searches yet.</div>
        )}
      </div>
      <div className="track-list-boundary track-list-bottom" aria-hidden="true" />
    </div>
  );
}

export default TrackList;
