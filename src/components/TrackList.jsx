import { useState } from 'react';
import TrackRow from './TrackRow';

const TRACKS = [
  { num: 1, title: 'Rocking the Stadium', id: 'ROCK-0231 #1', versions: 4, desc: 'Big hard-hitting stadium rock sounds with fast paced anthemic rock guitars, high energy riffs and off beat synth melodies.' },
  { num: 2, title: 'Stadium Anthem', id: 'ROCK-0232 #2', versions: 3, desc: 'Uplifting anthemic rock with soaring guitars and driving percussion.' },
  { num: 3, title: 'Victory March', id: 'ROCK-0233 #3', versions: 5, desc: 'Powerful march-style arrangement with brass and percussion.' },
  { num: 4, title: 'Game Day Energy', id: 'ROCK-0234 #4', versions: 4, desc: 'High-energy rock for game day broadcast moments.' },
  { num: 5, title: 'Stadium Roar', id: 'ROCK-0235 #5', versions: 3, desc: 'Crowd-inspired intensity with powerful dynamics.' },
  { num: 6, title: 'Touchdown Charge', id: 'ROCK-0236 #6', versions: 4, desc: 'Buildup to the big moment with rising tension and payoff.' },
  { num: 7, title: 'Prime Time', id: 'ROCK-0237 #7', versions: 3, desc: 'Broadcast-ready rock with punchy hooks and tight production.' },
  { num: 8, title: 'Championship Drive', id: 'ROCK-0238 #8', versions: 5, desc: 'Epic climactic themes for championship coverage.' },
  { num: 9, title: 'Kickoff Frenzy', id: 'ROCK-0239 #9', versions: 3, desc: 'Explosive opener with driving drums and bold guitars.' },
  { num: 10, title: 'Overtime', id: 'ROCK-0240 #10', versions: 4, desc: 'Suspenseful extended tension with dramatic payoff.' },
];

const ALBUMS = [
  { num: 1, title: 'Stadium Anthems', id: 'ALB-001', desc: 'Collection of high-energy stadium rock tracks for Monday Night Football.' },
  { num: 2, title: 'Game Day Essentials', id: 'ALB-002', desc: 'Essential game day music with anthemic rock and driving percussion.' },
  { num: 3, title: 'Championship Pack', id: 'ALB-003', desc: 'Epic themes and victory marches for championship coverage.' },
  { num: 4, title: 'Prime Time Sounds', id: 'ALB-004', desc: 'Broadcast-ready tracks with punchy hooks and tight production.' },
];

function TrackList({ soundsLikePanelOpen, onSoundsLikeClick }) {
  const [activeTab, setActiveTab] = useState('tracks');

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
          <button type="button" className="btn-secondary btn-play-all"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> PLAY ALL</button>
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
                isLiked
                soundsLikePanelOpen={soundsLikePanelOpen}
                onSoundsLikeClick={onSoundsLikeClick}
              />
            ))
          : ALBUMS.map((album) => (
              <TrackRow
                key={`album-${album.num}`}
                album={album}
                variant="album"
                isLiked
                soundsLikePanelOpen={soundsLikePanelOpen}
                onSoundsLikeClick={onSoundsLikeClick}
              />
            ))}
      </div>
      <div className="track-list-boundary track-list-bottom" aria-hidden="true" />
    </div>
  );
}

export default TrackList;
