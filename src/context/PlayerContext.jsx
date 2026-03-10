import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const currentTrack = currentIndex >= 0 && queue[currentIndex] ? queue[currentIndex] : null;

  const playTrack = useCallback((track, trackList = []) => {
    const list = trackList.length > 0 ? trackList : [track];
    const idx = list.findIndex((t) => (t.id || t.num) === (track.id || track.num));
    const index = idx >= 0 ? idx : 0;
    setQueue(list);
    setCurrentIndex(index);
    setIsPlaying(true);
  }, []);

  const playQueue = useCallback((trackList, startIndex = 0) => {
    if (!trackList?.length) return;
    setQueue(trackList);
    setCurrentIndex(Math.min(startIndex, trackList.length - 1));
    setIsPlaying(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying((p) => !p);
  }, [currentTrack]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    setCurrentIndex((i) => (i + 1) % queue.length);
    setIsPlaying(true);
  }, [queue.length]);

  const playPrev = useCallback(() => {
    if (queue.length === 0) return;
    if (currentTime > 3) {
      setCurrentTime(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
      return;
    }
    setCurrentIndex((i) => (i - 1 + queue.length) % queue.length);
    setIsPlaying(true);
  }, [queue.length, currentTime]);

  const seek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolumeLevel = useCallback((v) => {
    const level = Math.max(0, Math.min(1, v));
    setVolume(level);
    if (audioRef.current) audioRef.current.volume = level;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    const src = currentTrack.audioUrl || currentTrack.src;
    if (src) {
      audio.src = src;
      audio.load();
      audio.play().catch(() => setIsPlaying(false));
    } else {
      setIsPlaying(false);
    }
  }, [currentTrack, currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => playNext();
    const onError = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [playNext]);

  const value = {
    queue,
    currentTrack,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    playTrack,
    playQueue,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
    setVolume: setVolumeLevel,
    audioRef,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
