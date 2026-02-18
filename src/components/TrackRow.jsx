import { useState, useRef, useEffect } from 'react';

const TRACK_THUMBNAILS = ['/project-thumb-1.png', '/project-thumb-2.png', '/project-thumb-3.png', '/project-thumb-4.png'];
const ALBUM_THUMB_ORDER = [2, 3, 0, 1]; /* different cycle for albums */

function TrackRow({ track, album, isLiked, variant = 'track', soundsLikePanelOpen, onSoundsLikeClick }) {
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const overflowRef = useRef(null);

  const toggleLike = (e) => {
    e.stopPropagation();
    setLiked((prev) => !prev);
  };

  useEffect(() => {
    if (!overflowMenuOpen) return;
    function handleClickOutside(e) {
      if (overflowRef.current && !overflowRef.current.contains(e.target)) {
        setOverflowMenuOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [overflowMenuOpen]);
  const item = album || track;
  const isAlbum = variant === 'album';
  const thumbIndex = isAlbum
    ? ALBUM_THUMB_ORDER[(item.num - 1) % ALBUM_THUMB_ORDER.length]
    : (item.num - 1) % TRACK_THUMBNAILS.length;
  const thumbSrc = TRACK_THUMBNAILS[thumbIndex];
  return (
    <div className="track-row">
      <span className="track-num">{item.num}</span>
      <div className="track-thumb-col">
        <div
          className="track-thumb"
          style={{
            backgroundImage: `url('${thumbSrc}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="track-info-dropdowns">
          <div className="track-info">
            <span className="track-title">{item.title}</span>
            <span className="track-id">
              {item.id}
              {item.num === 1 && !isAlbum && (
                <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
              )}
            </span>
          </div>
          {isAlbum ? (
            <button type="button" className="show-all-tracks">
              Show all tracks
              <svg className="chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
          ) : (
            <div className="track-dropdowns">
              <select><option>Versions ({track.versions})</option></select>
              <select><option>Stems (4)</option></select>
            </div>
          )}
        </div>
      </div>
      <p className="track-desc">{item.desc}</p>
      <span className="track-label">Main</span>
      <input type="text" className="comment-input" placeholder="Click to add comment" />
      <div className="track-actions">
        <div className="track-action-icons track-actions-expanded">
          <button type="button" className={`icon-btn heart ${liked ? 'heart-filled' : 'heart-outline'}`} onClick={toggleLike} aria-label={liked ? 'Unlike' : 'Like'}>
            <img src={liked ? '/icons/Favorite.svg' : '/icons/FavoriteOutline.svg'} alt="" />
          </button>
          <button type="button" className="icon-btn" aria-label="Upload">
            <img src="/icons/Upload.svg" alt="" />
          </button>
          <button type="button" className="icon-btn" aria-label="Add">
            <img src="/icons/Add.svg" alt="" />
          </button>
          <button type="button" className="icon-btn" aria-label="Download">
            <img src="/icons/Download.svg" alt="" />
          </button>
          <button type="button" className="icon-btn" aria-label="Close">
            <img src="/icons/Close.svg" alt="" />
          </button>
        </div>
        <div className="track-actions-overflow track-actions-collapsed" ref={overflowRef}>
            <button
              type="button"
              className="icon-btn track-actions-menu-btn"
              onClick={() => setOverflowMenuOpen(!overflowMenuOpen)}
              aria-label="More actions"
              aria-expanded={overflowMenuOpen}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="19" cy="12" r="1.5" />
              </svg>
            </button>
            {overflowMenuOpen && (
              <div className="track-actions-overflow-dropdown">
                <button type="button" className={`icon-btn heart ${liked ? 'heart-filled' : 'heart-outline'}`} onClick={toggleLike} aria-label={liked ? 'Unlike' : 'Like'}>
                  <img src={liked ? '/icons/Favorite.svg' : '/icons/FavoriteOutline.svg'} alt="" />
                </button>
                <button type="button" className="icon-btn" aria-label="Upload">
                  <img src="/icons/Upload.svg" alt="" />
                </button>
                <button type="button" className="icon-btn" aria-label="Add">
                  <img src="/icons/Add.svg" alt="" />
                </button>
                <button type="button" className="icon-btn" aria-label="Download">
                  <img src="/icons/Download.svg" alt="" />
                </button>
                <button type="button" className="icon-btn" aria-label="Close">
                  <img src="/icons/Close.svg" alt="" />
                </button>
              </div>
            )}
          </div>
        {!isAlbum && (
          <button type="button" className="btn-sounds-like small track-sounds-like" onClick={onSoundsLikeClick}>
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M7.73242 1.26757C8.1425 1.24947 8.49219 1.62908 8.49219 2.02734V2.0459C8.50405 2.50778 8.49219 2.97363 8.49219 3.43847V13.4394C8.49219 13.865 8.1425 14.1816 7.73242 14.2002C7.32214 14.2186 6.97168 13.8379 6.97168 13.4394V13.4219C6.95981 12.96 6.97168 12.4941 6.97168 12.0293L6.97168 2.02734C6.97168 1.60162 7.32214 1.28539 7.73242 1.26757ZM4.83594 3.11035C5.24618 3.09199 5.5957 3.47173 5.5957 3.87011L5.5957 11.334C5.59544 11.7594 5.24603 12.0753 4.83594 12.0937C4.42582 12.1121 4.07645 11.7322 4.07617 11.334V3.87011C4.07617 3.44143 4.42566 3.12816 4.83594 3.11035ZM10.3643 3.11035C10.7744 3.09216 11.124 3.47182 11.124 3.87011V11.334C11.1238 11.7593 10.7742 12.0752 10.3643 12.0937C9.95414 12.1121 9.6038 11.7322 9.60352 11.334V3.87011C9.60352 3.44143 9.95398 3.12816 10.3643 3.11035ZM1.99707 4.39257C2.40726 4.37423 2.75675 4.75402 2.75684 5.15234L2.75684 10.0508C2.75662 10.4763 2.40718 10.7921 1.99707 10.8105C1.58693 10.8289 1.23754 10.449 1.2373 10.0508L1.2373 5.15234C1.23739 4.72729 1.58386 4.41098 1.99707 4.39257ZM13.2012 4.39257C13.6114 4.37417 13.9618 4.75399 13.9619 5.15234V10.0508C13.9617 10.4763 13.6113 10.7921 13.2012 10.8105C12.7912 10.8287 12.4416 10.4489 12.4414 10.0508V5.15234C12.4415 4.72742 12.7911 4.41115 13.2012 4.39257Z"/></svg>
            Sounds like
          </button>
        )}
      </div>
    </div>
  );
}

export default TrackRow;
