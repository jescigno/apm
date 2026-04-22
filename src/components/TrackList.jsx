import { useState, useRef, useEffect } from 'react';
import TrackRow from './TrackRow';
import { usePlayer } from '../context/PlayerContext';
import { LAYOUT_COMPACT_MAX_WIDTH } from '../constants/layout';

export const SAMPLE_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

/** Random `ABCD-1234` (4 uppercase letters, dash, 4 digits) for track / album `id` shown under the title */
export function generateTrackId() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let letters = '';
  for (let i = 0; i < 4; i++) {
    letters += alphabet[Math.floor(Math.random() * 26)];
  }
  const digits = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `${letters}-${digits}`;
}

/** One-line catalog-style description for a track added from Sounds Like */
export function generateSoundsLikeTrackDescription() {
  const pool = [
    'High-energy rock with driving drums and bold guitars, ready for broadcast highlights.',
    'Uplifting anthemic layers with punchy hooks and tight, modern production.',
    'Powerful dynamics and soaring guitars built for stadium and arena moments.',
    'Driving percussion and anthemic riffs with a crisp, broadcast-ready mix.',
    'Big-room energy with layered guitars and synth accents for peak moments.',
    'Tight, punchy arrangement with momentum and tension for sports coverage.',
    'Soaring leads and rhythmic grit—ideal for openers and hype segments.',
    'Epic build and release with brass and percussion for championship moments.',
    'Fast-paced rock grooves with off-beat synth melodies and high energy.',
    'Crowd-inspired intensity with bold guitars and a wide, cinematic feel.',
    'Suspenseful tension and dramatic payoff—great for overtime and late-game.',
    'Explosive opener energy with bold drums and anthemic guitar hooks.',
    'Prime-time rock with punchy hooks, polished stems, and a wide stereo image.',
    'Victory-lap energy with celebratory brass and driving rhythm section.',
    'Atmospheric verses and explosive choruses—tailored for highlight reels.',
    'Hard-hitting riffs with synth stabs and a tight, radio-friendly balance.',
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

const TRACKS_BASE = [
  { num: 1, title: 'Rocking the Stadium', versions: 4, commentCount: 2, desc: 'Big hard-hitting stadium rock sounds with fast paced anthemic rock guitars, high energy riffs and off beat synth melodies.', audioUrl: SAMPLE_AUDIO },
  { num: 2, title: '#3 Stadium Anthem - Narrartive Instrumental', versions: 3, commentCount: 5, desc: 'Uplifting anthemic rock with soaring guitars and driving percussion.', audioUrl: SAMPLE_AUDIO },
  { num: 3, title: 'Victory March', versions: 5, commentCount: 2, desc: 'Powerful march-style arrangement with brass and percussion.', audioUrl: SAMPLE_AUDIO },
  { num: 4, title: 'Game Day Energy- Stem One', versions: 4, commentCount: 3, desc: 'High-energy rock for game day broadcast moments.', audioUrl: SAMPLE_AUDIO },
  { num: 5, title: 'Stadium Roar', versions: 3, commentCount: 7, desc: 'Crowd-inspired intensity with powerful dynamics.', audioUrl: SAMPLE_AUDIO },
  { num: 6, title: 'Touchdown Charge', versions: 4, commentCount: 1, desc: 'Buildup to the big moment with rising tension and payoff.', audioUrl: SAMPLE_AUDIO },
  { num: 7, title: 'Prime Time', versions: 3, commentCount: 4, desc: 'Broadcast-ready rock with punchy hooks and tight production.', audioUrl: SAMPLE_AUDIO },
  { num: 8, title: 'Championship Drive', versions: 5, commentCount: 6, desc: 'Epic climactic themes for championship coverage.', audioUrl: SAMPLE_AUDIO },
  { num: 9, title: 'Kickoff Frenzy', versions: 3, commentCount: 2, desc: 'Explosive opener with driving drums and bold guitars.', audioUrl: SAMPLE_AUDIO },
  { num: 10, title: 'Overtime', versions: 4, commentCount: 9, desc: 'Suspenseful extended tension with dramatic payoff.', audioUrl: SAMPLE_AUDIO },
].map((t) => ({
  ...t,
  id: generateTrackId(),
  hasLyrics: Math.random() > 0.45,
  stems: [4, 4, 5, 4, 6, 3, 4, 5, 4, 4][t.num - 1],
}));

const FAVORITES_TRACKS = TRACKS_BASE.map((t) => {
  if (t.num === 1) return { ...t, commentCount: 0 };
  if (t.num === 3) return { ...t, commentCount: 1 };
  return t;
});

const PROJECTS_TRACKS = TRACKS_BASE.map((t) => {
  if (t.num === 2) return { ...t, title: 'Stadium Anthem' };
  if (t.num === 4) return { ...t, title: 'Game Day Energy' };
  return { ...t };
});

export { PROJECTS_TRACKS, FAVORITES_TRACKS };

const ALBUMS = [
  { num: 1, title: 'Stadium Anthems', commentCount: 0, desc: 'Collection of high-energy stadium rock tracks for Monday Night Football.', audioUrl: SAMPLE_AUDIO },
  { num: 2, title: 'Game Day Essentials', commentCount: 1, desc: 'Essential game day music with anthemic rock and driving percussion.', audioUrl: SAMPLE_AUDIO },
  { num: 3, title: 'Championship Pack', commentCount: 0, desc: 'Epic themes and victory marches for championship coverage.', audioUrl: SAMPLE_AUDIO },
  { num: 4, title: 'Prime Time Sounds', commentCount: 0, desc: 'Broadcast-ready tracks with punchy hooks and tight production.', audioUrl: SAMPLE_AUDIO },
  { num: 5, title: 'Victory Lap', commentCount: 2, desc: 'Celebratory anthems for winning moments and post-game highlights.', audioUrl: SAMPLE_AUDIO },
  { num: 6, title: 'Pregame Hype', commentCount: 4, desc: 'High-octane openers to energize the crowd before kickoff.', audioUrl: SAMPLE_AUDIO },
  { num: 7, title: 'Halftime Show', commentCount: 1, desc: 'Dynamic tracks for halftime performances and break segments.', audioUrl: SAMPLE_AUDIO },
  { num: 8, title: 'Overtime Drama', commentCount: 6, desc: 'Suspenseful and tense themes for nail-biting overtime moments.', audioUrl: SAMPLE_AUDIO },
  { num: 9, title: 'Broadcast Bumpers', commentCount: 0, desc: 'Short stingers and transition cues for commercial breaks.', audioUrl: SAMPLE_AUDIO },
  { num: 10, title: 'Fan Favorites', commentCount: 8, desc: 'Crowd-pleasing hits curated from the most requested game day tracks.', audioUrl: SAMPLE_AUDIO },
].map((a) => ({
  ...a,
  id: generateTrackId(),
  hasLyrics: Math.random() > 0.45,
}));

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

function TrackList({ soundsLikePanelOpen, onSoundsLikeClick, activeTab: controlledTab, onTabChange, tabsInBreadcrumb, showSearchesTab = false, tracks: tracksProp, enableTrackDetailsOverlay = false, trackTitleBadges, enterHighlightTrackNum, scrollToBottomSignal, showVersionsStems = false, hideTracksHeader = false }) {
  const tracks = tracksProp ?? FAVORITES_TRACKS;
  const [internalTab, setInternalTab] = useState('tracks');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = onTabChange ?? setInternalTab;
  const { playTrack, playQueue, togglePlayPause, currentTrack, isPlaying } = usePlayer();
  const listEndRef = useRef(null);
  const [mobileTrackLayout, setMobileTrackLayout] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${LAYOUT_COMPACT_MAX_WIDTH}px)`);
    const sync = () => setMobileTrackLayout(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (scrollToBottomSignal == null || scrollToBottomSignal === 0) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    });
    return () => cancelAnimationFrame(id);
  }, [scrollToBottomSignal]);

  const isCurrentTrack = (item) =>
    currentTrack && ((item.id && item.id === currentTrack.id) || (item.num === currentTrack.num));

  const hasHeaderContent = !tabsInBreadcrumb && !hideTracksHeader;
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
      {!(hideTracksHeader && activeTab === 'tracks') && !tabsInBreadcrumb && (
        <div className="track-list-boundary track-list-top" aria-hidden="true" />
      )}
      {hideTracksHeader && activeTab === 'tracks' && (
        <div className="tracks-mobile-toolbar">
          <span className="tracks-mobile-toolbar-count">{tracks.length} TITLES</span>
          <button type="button" className="btn-secondary tracks-mobile-toolbar-reorder">
            <img src="/Reorder.svg" alt="" /> REORDER
          </button>
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
              mobileTrackLayout={mobileTrackLayout}
              enableTrackDetailsOverlay={enableTrackDetailsOverlay}
              titleBadge={trackTitleBadges?.[track.num]}
              enterHighlight={
                enterHighlightTrackNum != null &&
                Number(track.num) === Number(enterHighlightTrackNum)
              }
              showVersionsStems={showVersionsStems}
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
              mobileTrackLayout={mobileTrackLayout}
              enableTrackDetailsOverlay={enableTrackDetailsOverlay}
              showVersionsStems={showVersionsStems}
            />
          ))}
        <div ref={listEndRef} className="track-list-scroll-anchor" aria-hidden="true" />
        {activeTab === 'searches' && (
          <div className="track-list-empty">No saved searches yet.</div>
        )}
      </div>
      <div className="track-list-boundary track-list-bottom" aria-hidden="true" />
    </div>
  );
}

export default TrackList;
