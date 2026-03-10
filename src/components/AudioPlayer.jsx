import { useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

const TRACK_THUMBNAILS = ['/project-thumb-1.png', '/project-thumb-2.png', '/project-thumb-3.png', '/project-thumb-4.png'];

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const RIGHT_ACTIONS = [
  { icon: '/player-actions/SoundsLike.svg', label: 'Sounds like', onClick: 'soundsLike' },
  { icon: '/player-actions/Favorite.svg', label: 'Favorite' },
  { icon: '/player-actions/Upload.svg', label: 'Upload' },
  { icon: '/player-actions/Add.svg', label: 'Add' },
  { icon: '/player-actions/Download.svg', label: 'Download' },
];

function AudioPlayer({ onSoundsLikeClick }) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
  } = usePlayer();
  const progressRef = useRef(null);

  if (!currentTrack) return null;

  const thumbIndex = (currentTrack.num || 1) - 1;
  const thumbSrc = TRACK_THUMBNAILS[thumbIndex % TRACK_THUMBNAILS.length];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(1, pct)) * duration);
  };

  const handleRestart = () => {
    seek(0);
    if (!isPlaying) togglePlayPause();
  };

  return (
    <div className="audio-player">
      <div className="audio-player-inner">
        <div className="audio-player-track-info">
          <div
            className="audio-player-thumb"
            style={{ backgroundImage: `url('${thumbSrc}')` }}
            aria-hidden
          />
          <div className="audio-player-track-meta">
            <div className="audio-player-icons">
              <button type="button" className="audio-player-icon-btn" onClick={handleRestart} aria-label="Playback from start">
                <img src="/player-icons/PlaybackEntireSong.svg" alt="" />
              </button>
              <button type="button" className="audio-player-icon-btn audio-player-icon-skip" onClick={playPrev} aria-label="Previous track">
                <img src="/player-icons/SkipTrackBack.svg" alt="" />
              </button>
              <button
                type="button"
                className="audio-player-icon-btn audio-player-icon-play-pause"
                onClick={togglePlayPause}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                <img src={isPlaying ? '/player-icons/Pause.svg' : '/player-icons/Play.svg'} alt="" />
              </button>
              <button type="button" className="audio-player-icon-btn audio-player-icon-skip" onClick={playNext} aria-label="Next track">
                <img src="/player-icons/SkipTrackFwd.svg" alt="" />
              </button>
              <button type="button" className="audio-player-icon-btn" aria-label="Player">
                <img src="/player-icons/Player.svg" alt="" />
              </button>
            </div>
            <span className="audio-player-title">{currentTrack.title}</span>
            <span className="audio-player-id">{currentTrack.id || ''}</span>
          </div>
        </div>

        <div className="audio-player-controls">
          <div className="audio-player-waveform-wrap">
            <div
              ref={progressRef}
              className="audio-player-waveform"
              onClick={handleProgressClick}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={currentTime}
              aria-label="Seek"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') seek(Math.max(0, currentTime - 5));
                if (e.key === 'ArrowRight') seek(Math.min(duration, currentTime + 5));
              }}
              style={{ '--progress': `${progress}%` }}
            >
              <div className="audio-player-waveform-bg" />
              <div className="audio-player-waveform-unplayed" />
            </div>
            {duration > 0 && (
              <div className="audio-player-timeline">
                {Array.from({ length: Math.floor(duration / 5) + 1 }, (_, i) => {
                  const t = i * 5;
                  if (t > duration) return null;
                  const is10Second = t % 10 === 0;
                  const is5Second = t % 5 === 0 && !is10Second;
                  const isLast = t >= duration || t === Math.floor(duration / 5) * 5;
                  const is30Second = t % 30 === 0;
                  const tenSecIndex = Math.floor(t / 10);
                  if (is5Second) {
                    return (
                      <div
                        key={t}
                        className={`audio-player-timeline-segment audio-player-timeline-segment-5 ${isLast ? 'audio-player-timeline-segment-last' : ''}`}
                      >
                        <div className="audio-player-timeline-line audio-player-timeline-line-5" />
                      </div>
                    );
                  }
                  return (
                    <div
                      key={t}
                      className={`audio-player-timeline-segment ${isLast ? 'audio-player-timeline-segment-last' : ''} ${is30Second ? 'audio-player-timeline-segment-30' : ''}`}
                    >
                      <div className={`audio-player-timeline-line ${tenSecIndex % 2 === 1 && !is30Second ? 'audio-player-timeline-line-subtle' : ''} ${is30Second ? 'audio-player-timeline-line-major' : ''}`} />
                      <span className="audio-player-timeline-mark">{formatTime(t)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="audio-player-right-actions">
          {RIGHT_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              className="audio-player-action-btn"
              onClick={action.onClick === 'soundsLike' ? onSoundsLikeClick : undefined}
              aria-label={action.label}
            >
              <img src={action.icon} alt="" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;
