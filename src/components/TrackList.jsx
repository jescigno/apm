import { useState } from 'react';
import TrackRow from './TrackRow';
import { usePlayer } from '../context/PlayerContext';

const SAMPLE_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

const TRACKS = [
  { num: 1, title: 'Rocking the Stadium', id: 'ROCK-0231 #1', versions: 4, desc: 'Big hard-hitting stadium rock sounds with fast paced anthemic rock guitars, high energy riffs and off beat synth melodies.', audioUrl: SAMPLE_AUDIO },
  { num: 2, title: 'Stadium Anthem', id: 'ROCK-0232 #2', versions: 3, desc: 'Uplifting anthemic rock with soaring guitars and driving percussion.', audioUrl: SAMPLE_AUDIO },
  { num: 3, title: 'Victory March', id: 'ROCK-0233 #3', versions: 5, desc: 'Powerful march-style arrangement with brass and percussion.', audioUrl: SAMPLE_AUDIO },
  { num: 4, title: 'Game Day Energy', id: 'ROCK-0234 #4', versions: 4, desc: 'High-energy rock for game day broadcast moments.', audioUrl: SAMPLE_AUDIO },
  { num: 5, title: 'Stadium Roar', id: 'ROCK-0235 #5', versions: 3, desc: 'Crowd-inspired intensity with powerful dynamics.', audioUrl: SAMPLE_AUDIO },
  { num: 6, title: 'Touchdown Charge', id: 'ROCK-0236 #6', versions: 4, desc: 'Buildup to the big moment with rising tension and payoff.', audioUrl: SAMPLE_AUDIO },
  { num: 7, title: 'Prime Time', id: 'ROCK-0237 #7', versions: 3, desc: 'Broadcast-ready rock with punchy hooks and tight production.', audioUrl: SAMPLE_AUDIO },
  { num: 8, title: 'Championship Drive', id: 'ROCK-0238 #8', versions: 5, desc: 'Epic climactic themes for championship coverage.', audioUrl: SAMPLE_AUDIO },
  { num: 9, title: 'Kickoff Frenzy', id: 'ROCK-0239 #9', versions: 3, desc: 'Explosive opener with driving drums and bold guitars.', audioUrl: SAMPLE_AUDIO },
  { num: 10, title: 'Overtime', id: 'ROCK-0240 #10', versions: 4, desc: 'Suspenseful extended tension with dramatic payoff.', audioUrl: SAMPLE_AUDIO },
];

const ALBUMS = [
  { num: 1, title: 'Stadium Anthems', id: 'ALB-001', desc: 'Collection of high-energy stadium rock tracks for Monday Night Football.', audioUrl: SAMPLE_AUDIO },
  { num: 2, title: 'Game Day Essentials', id: 'ALB-002', desc: 'Essential game day music with anthemic rock and driving percussion.', audioUrl: SAMPLE_AUDIO },
  { num: 3, title: 'Championship Pack', id: 'ALB-003', desc: 'Epic themes and victory marches for championship coverage.', audioUrl: SAMPLE_AUDIO },
  { num: 4, title: 'Prime Time Sounds', id: 'ALB-004', desc: 'Broadcast-ready tracks with punchy hooks and tight production.', audioUrl: SAMPLE_AUDIO },
];

function TrackList({ soundsLikePanelOpen, onSoundsLikeClick }) {
  const [activeTab, setActiveTab] = useState('tracks');
  const { playTrack, playQueue, togglePlayPause, currentTrack, isPlaying } = usePlayer();
  const currentTracks = activeTab === 'tracks' ? TRACKS : ALBUMS;

  const handlePlayAll = () => playQueue(currentTracks, 0);

  const isCurrentTrack = (item) =>
    currentTrack && ((item.id && item.id === currentTrack.id) || (item.num === currentTrack.num));

  return (
    <div className="tracks-section">
      <div className="tracks-header">
        <div className="tabs">
          <button
            type="button"
            className={`tab ${activeTab === 'tracks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracks')}
          >
            Tracks
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'albums' ? 'active' : ''}`}
            onClick={() => setActiveTab('albums')}
          >
            Albums
          </button>
        </div>
        <span className="track-count">
          {activeTab === 'tracks' ? `${TRACKS.length} TITLES` : `${ALBUMS.length} Albums`}
        </span>
        <div className="tracks-actions">
          <button type="button" className="btn-secondary"><img src="/Reorder.svg" alt="" /> REORDER</button>
          <button type="button" className="btn-secondary btn-play-all" onClick={handlePlayAll}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> PLAY ALL
          </button>
          <button type="button" className="btn-secondary"><img src="/Customize.svg" alt="" /> CUSTOMIZE</button>
        </div>
      </div>

      <div className="track-list-boundary track-list-top" aria-hidden="true" />
      <div className="track-list">
        {activeTab === 'tracks'
          ? TRACKS.map((track) => (
              <TrackRow
                key={`track-${track.num}`}
                track={track}
                trackList={TRACKS}
                isLiked
                soundsLikePanelOpen={soundsLikePanelOpen}
                onSoundsLikeClick={onSoundsLikeClick}
                onPlay={playTrack}
                onTogglePause={togglePlayPause}
                isCurrentTrack={isCurrentTrack(track)}
                isPlaying={isPlaying}
              />
            ))
          : ALBUMS.map((album) => (
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
              />
            ))}
      </div>
      <div className="track-list-boundary track-list-bottom" aria-hidden="true" />
    </div>
  );
}

export default TrackList;
