import { useRef, useState, useCallback, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

const TRACK_THUMBNAILS = ['/project-thumb-1.png', '/project-thumb-2.png', '/project-thumb-3.png', '/project-thumb-4.png'];
const DRAG_THRESHOLD = 4;
const MIN_SEGMENT_SECONDS = 10;
const MIN_SEGMENT_PX = 100;

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

function clampPct(p) {
  return Math.max(0, Math.min(1, p));
}

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
    setLoopSegment,
  } = usePlayer();
  const progressRef = useRef(null);
  const dragStateRef = useRef(null);
  const durationRef = useRef(0);
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);
  const [dragState, setDragState] = useState(null);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [selectionFavorited, setSelectionFavorited] = useState(false);
  const optionsMenuRef = useRef(null);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  const getPctFromEvent = useCallback((e) => {
    if (!progressRef.current) return 0;
    const rect = progressRef.current.getBoundingClientRect();
    return clampPct((e.clientX - rect.left) / rect.width);
  }, []);

  useEffect(() => {
    if (!selection) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelection(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selection]);

  useEffect(() => {
    if (!currentTrack) setSelection(null);
  }, [currentTrack]);

  useEffect(() => {
    if (!selection || duration <= 0) return;
    const waveWidth = progressRef.current?.getBoundingClientRect().width ?? 0;
    const minSecondsFromPx = waveWidth > 0 ? (MIN_SEGMENT_PX * duration) / waveWidth : MIN_SEGMENT_SECONDS;
    const minSpanSec = Math.max(MIN_SEGMENT_SECONDS, minSecondsFromPx);
    if (duration < minSpanSec) return;
    const span = selection.end - selection.start;
    if (span < minSpanSec) {
      setSelection((prev) => {
        const newEnd = Math.min(prev.start + minSpanSec, duration);
        const newStart = Math.max(0, newEnd - minSpanSec);
        return { start: newStart, end: newEnd };
      });
    }
  }, [selection, duration]);

  useEffect(() => {
    if (!selection) {
      setOptionsMenuOpen(false);
      setSelectionFavorited(false);
      setLoopSegment(null);
    }
  }, [selection, setLoopSegment]);

  useEffect(() => {
    if (!optionsMenuOpen) return;
    const handleClickOutside = (e) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target)) {
        setOptionsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [optionsMenuOpen]);

  const handleWaveformMouseDown = useCallback(
    (e) => {
      if (!progressRef.current || !duration) return;
      const pct = getPctFromEvent(e);
      setDragState({
        phase: 'select',
        startX: e.clientX,
        startPct: pct,
        currentPct: pct,
      });
    },
    [duration, getPctFromEvent]
  );

  useEffect(() => {
    if (!dragState) return;
    const getMinSpanPct = () => {
      const dur = durationRef.current;
      const waveWidth = progressRef.current?.getBoundingClientRect().width ?? 0;
      if (dur <= 0) return 1;
      const minSecondsFromPx = waveWidth > 0 ? (MIN_SEGMENT_PX * dur) / waveWidth : MIN_SEGMENT_SECONDS;
      const minSeconds = Math.max(MIN_SEGMENT_SECONDS, minSecondsFromPx);
      return Math.min(minSeconds / dur, 0.99);
    };
    const getMinSpanSeconds = () => {
      const dur = durationRef.current;
      const waveWidth = progressRef.current?.getBoundingClientRect().width ?? 0;
      if (dur <= 0) return MIN_SEGMENT_SECONDS;
      const minSecondsFromPx = waveWidth > 0 ? (MIN_SEGMENT_PX * dur) / waveWidth : MIN_SEGMENT_SECONDS;
      return Math.max(MIN_SEGMENT_SECONDS, minSecondsFromPx);
    };
    const handleMouseMove = (e) => {
      const pct = getPctFromEvent(e);
      const dx = Math.abs(e.clientX - dragState.startX);
      const dur = durationRef.current;
      setDragState((prev) => {
        if (!prev) return prev;
        if (prev.phase === 'select' && dx > DRAG_THRESHOLD) {
          return {
            ...prev,
            phase: 'selecting',
            currentPct: pct,
          };
        }
        if (prev.phase === 'selecting') {
          const minSpanPct = getMinSpanPct();
          let clampedPct = pct;
          if (pct > prev.startPct) {
            clampedPct = Math.max(pct, Math.min(prev.startPct + minSpanPct, 1));
          } else {
            clampedPct = Math.min(pct, Math.max(prev.startPct - minSpanPct, 0));
          }
          return { ...prev, currentPct: clampedPct };
        }
        if (prev.phase === 'resize') {
          const minSpan = getMinSpanPct();
          if (prev.handle === 'left') {
            const newStart = clampPct(pct);
            const end = prev.initialEnd ?? prev.initialStart + minSpan;
            return {
              ...prev,
              currentStart: Math.min(newStart, end - minSpan),
              currentEnd: end,
            };
          } else {
            const newEnd = clampPct(pct);
            const start = prev.initialStart ?? prev.initialEnd - minSpan;
            return {
              ...prev,
              currentStart: start,
              currentEnd: Math.max(newEnd, start + minSpan),
            };
          }
        }
        if (prev.phase === 'move') {
          const waveWidth = progressRef.current?.getBoundingClientRect().width ?? 0;
          if (waveWidth <= 0) return prev;
          const deltaX = e.clientX - prev.startX;
          const deltaSec = (deltaX / waveWidth) * dur;
          let newStart = prev.initialStart + deltaSec;
          let newEnd = prev.initialEnd + deltaSec;
          const span = prev.initialEnd - prev.initialStart;
          if (newStart < 0) {
            newStart = 0;
            newEnd = span;
          } else if (newEnd > dur) {
            newEnd = dur;
            newStart = dur - span;
          }
          return { ...prev, currentStart: newStart, currentEnd: newEnd };
        }
        return prev;
      });
    };
    const handleMouseUp = () => {
      const prev = dragStateRef.current;
      const dur = durationRef.current;
      if (prev?.phase === 'select') {
        seek(prev.startPct * dur);
      } else if (prev?.phase === 'selecting') {
        const start = Math.min(prev.startPct, prev.currentPct);
        const end = Math.max(prev.startPct, prev.currentPct);
        const minSpanPct = getMinSpanPct();
        if (end - start >= minSpanPct) {
          setSelection({ start: start * dur, end: end * dur });
        }
      } else if (prev?.phase === 'resize') {
        let start = (prev.currentStart ?? prev.initialStart) * dur;
        let end = (prev.currentEnd ?? prev.initialEnd) * dur;
        const minSpanSec = getMinSpanSeconds();
        if (end - start < minSpanSec && dur >= minSpanSec) {
          if (prev.handle === 'left') {
            start = end - minSpanSec;
          } else {
            end = start + minSpanSec;
          }
          start = Math.max(0, start);
          end = Math.min(dur, end);
        }
        setSelection({ start, end });
      } else if (prev?.phase === 'move') {
        const start = prev.currentStart ?? prev.initialStart;
        const end = prev.currentEnd ?? prev.initialEnd;
        setSelection({ start, end });
      }
      setDragState(null);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, duration, seek, getPctFromEvent]);

  const handleHandleMouseDown = useCallback((e, handle) => {
    e.stopPropagation();
    if (!selection || !duration) return;
    const startPct = selection.start / duration;
    const endPct = selection.end / duration;
    setDragState({
      phase: 'resize',
      handle,
      initialStart: startPct,
      initialEnd: endPct,
      currentStart: startPct,
      currentEnd: endPct,
    });
  }, [selection, duration]);

  const handleSelectionMoveDown = useCallback(
    (e) => {
      if (!selection || !duration || optionsMenuRef.current?.contains(e.target)) return;
      e.stopPropagation();
      setDragState({
        phase: 'move',
        startX: e.clientX,
        initialStart: selection.start,
        initialEnd: selection.end,
      });
    },
    [selection, duration]
  );

  if (!currentTrack) return null;

  const thumbIndex = (currentTrack.num || 1) - 1;
  const thumbSrc = TRACK_THUMBNAILS[thumbIndex % TRACK_THUMBNAILS.length];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  let selectionStartPct = 0;
  let selectionEndPct = 0;
  if (dragState?.phase === 'selecting') {
    selectionStartPct = Math.min(dragState.startPct, dragState.currentPct) * 100;
    selectionEndPct = Math.max(dragState.startPct, dragState.currentPct) * 100;
  } else if (dragState?.phase === 'resize') {
    selectionStartPct = (dragState.currentStart ?? dragState.initialStart) * 100;
    selectionEndPct = (dragState.currentEnd ?? dragState.initialEnd) * 100;
  } else if (dragState?.phase === 'move') {
    const start = dragState.currentStart ?? dragState.initialStart;
    const end = dragState.currentEnd ?? dragState.initialEnd;
    selectionStartPct = duration > 0 ? (start / duration) * 100 : 0;
    selectionEndPct = duration > 0 ? (end / duration) * 100 : 0;
  } else if (selection) {
    selectionStartPct = (selection.start / duration) * 100;
    selectionEndPct = (selection.end / duration) * 100;
  }
  const hasSelection = selectionStartPct < selectionEndPct;

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
              onMouseDown={handleWaveformMouseDown}
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
              style={{ '--progress': `${progress}%`, '--progress-pct': progress }}
            >
              <div className="audio-player-waveform-bg" />
              <div className="audio-player-waveform-played" />
              <div className="audio-player-waveform-unplayed" />
              {hasSelection && (
                <>
                  <div
                    className={`audio-player-selection-wrap${dragState?.phase === 'resize' || dragState?.phase === 'selecting' ? ' audio-player-selection-wrap--active' : ''}`}
                    style={{
                      left: `${selectionStartPct}%`,
                      width: `${selectionEndPct - selectionStartPct}%`,
                    }}
                    onMouseDown={handleSelectionMoveDown}
                  >
                    {dragState?.phase === 'resize' && (
                      <div className="audio-player-selection-timecodes">
                        {formatTime((selectionStartPct / 100) * duration)} – {formatTime((selectionEndPct / 100) * duration)}
                      </div>
                    )}
                    <div
                      className="audio-player-waveform-selection"
                    />
                    <div className="audio-player-selection-options-wrap" ref={optionsMenuRef}>
                      <button
                        type="button"
                        className="audio-player-selection-options"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => setOptionsMenuOpen((o) => !o)}
                        aria-label="Options"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <circle cx="4" cy="8" r="1.5" />
                          <circle cx="8" cy="8" r="1.5" />
                          <circle cx="12" cy="8" r="1.5" />
                        </svg>
                      </button>
                      {optionsMenuOpen && (
                        <div className="audio-player-selection-menu" onMouseDown={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="audio-player-selection-menu-item"
                            onClick={() => {
                              onSoundsLikeClick?.();
                              setOptionsMenuOpen(false);
                            }}
                          >
                            <img src="/player-actions/SoundsLike.svg" alt="" />
                            Sounds Like
                          </button>
                          <button type="button" className="audio-player-selection-menu-item" onClick={() => setSelectionFavorited((f) => !f)}>
                            <img src={selectionFavorited ? '/icons/Favorite.svg' : '/player-actions/Favorite.svg'} alt="" />
                            {selectionFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                          </button>
                          <button
                            type="button"
                            className="audio-player-selection-menu-item"
                            onClick={() => {
                              setLoopSegment({ start: selection.start, end: selection.end });
                              seek(selection.start);
                              if (!isPlaying) togglePlayPause();
                              setOptionsMenuOpen(false);
                            }}
                          >
                            <img src="/player-icons/PlaybackEntireSong.svg" alt="" />
                            Loop
                          </button>
                          <button type="button" className="audio-player-selection-menu-item" onClick={() => setOptionsMenuOpen(false)}>
                            <img src="/icons/Upload.svg" alt="" />
                            Share
                          </button>
                          <button type="button" className="audio-player-selection-menu-item" onClick={() => setOptionsMenuOpen(false)}>
                            <img src="/icons/Add.svg" alt="" />
                            Add to a Project
                          </button>
                          <button type="button" className="audio-player-selection-menu-item" onClick={() => { setSelection(null); setOptionsMenuOpen(false); }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                            Deselect
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className="audio-player-waveform-handle audio-player-waveform-handle-left"
                    style={{ left: `${selectionStartPct}%` }}
                    onMouseDown={(e) => handleHandleMouseDown(e, 'left')}
                  />
                  <div
                    className="audio-player-waveform-handle audio-player-waveform-handle-right"
                    style={{ left: `${selectionEndPct}%` }}
                    onMouseDown={(e) => handleHandleMouseDown(e, 'right')}
                  />
                </>
              )}
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
