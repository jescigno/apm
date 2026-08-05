import { getTrackThumbStyle } from './trackThumb';

function TrackDragThumbnail({ track, isAlbum = false }) {
  const thumbStyle = getTrackThumbStyle(track, isAlbum);

  return (
    <div className="projects-track-drag-thumb" aria-hidden>
      <div className="projects-track-drag-thumb-art" style={thumbStyle} />
      <span className="projects-track-drag-thumb-title">{track.title}</span>
    </div>
  );
}

export default TrackDragThumbnail;
