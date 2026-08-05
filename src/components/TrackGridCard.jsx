import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getTrackThumbStyle } from './trackThumb';
import { ICON_PLAY_IN_CIRCLE_ON, ICON_PAUSE_IN_CIRCLE } from '../constants/designSystem';
import { resolveThemedAsset, useThemeName } from '../utils/theme';
import { CompactTrackOverflowMenuItems } from './TrackRow';
import { useOverflowDropdownMenu } from '../hooks/useOverflowDropdownMenu';
import { getOverflowDropdownStyle, getTrackOverflowMenuHeight } from '../utils/overflowDropdownPosition';

function TrackGridCardOverflowMenu({ item, isAlbum, onSoundsLikeClick, visible }) {
  const getStyle = useCallback((triggerEl) => {
    if (!triggerEl) return null;
    return {
      ...getOverflowDropdownStyle(triggerEl.getBoundingClientRect(), {
        menuHeight: getTrackOverflowMenuHeight({ compact: true }),
      }),
      zIndex: 2100,
    };
  }, []);

  const { open, style, triggerRef, containerRef, toggle, close } = useOverflowDropdownMenu({
    getStyle,
    group: 'track-grid-overflow-menu',
  });

  return (
    <div
      className={`track-grid-card-overflow-wrap${visible || open ? ' track-grid-card-overflow-wrap--visible' : ''}`}
      ref={containerRef}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`track-grid-card-overflow-menu${open ? ' track-grid-card-overflow-menu--open' : ''}`}
        aria-label={`More options for ${item.title}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={toggle}
      >
        <img src="/icons/moreMenu.svg" alt="" aria-hidden />
      </button>
      {open && createPortal(
        <div
          data-track-dropdown-portal
          className="track-actions-overflow-dropdown track-actions-overflow-dropdown--portal track-actions-overflow-dropdown--segment-style"
          style={style ?? { position: 'fixed', zIndex: 2100, visibility: 'hidden' }}
          role="menu"
          aria-label={`Actions for ${item.title}`}
        >
          <CompactTrackOverflowMenuItems
            item={item}
            isAlbum={isAlbum}
            onSoundsLikeClick={onSoundsLikeClick}
            onClose={close}
          />
        </div>,
        document.body
      )}
    </div>
  );
}

export default function TrackGridCard({
  track,
  album,
  variant = 'track',
  trackList,
  onPlay,
  onTogglePause,
  onSoundsLikeClick,
  isCurrentTrack,
  isPlaying,
  isSelected,
  onSelectChange,
  enterHighlight,
  titleBadge,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useThemeName();
  const item = album || track;
  const isAlbum = variant === 'album';
  const thumbStyle = getTrackThumbStyle(item, isAlbum);
  const canPlay = item.audioUrl && onPlay;
  const showPlayingIcon = isCurrentTrack && isPlaying;
  const showPauseIcon = isCurrentTrack && !isPlaying;
  const showSelectCheckbox = isHovered || isSelected;
  const showOverflowMenu = isHovered || isSelected;

  const handlePlay = (e) => {
    e?.stopPropagation?.();
    if (canPlay && trackList) onPlay(item, trackList);
    else if (canPlay) onPlay(item);
  };

  const handlePause = (e) => {
    e?.stopPropagation?.();
    onTogglePause?.();
  };

  const handleArtClick = () => {
    if (showPlayingIcon) handlePause();
    else if (showPauseIcon || canPlay) handlePlay();
  };

  return (
    <article
      className={`track-grid-card${isCurrentTrack ? ' track-grid-card--playing' : ''}${isSelected ? ' track-grid-card--selected' : ''}${enterHighlight ? ' track-grid-card--enter-highlight' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {enterHighlight && <span className="track-grid-card-enter-flash" aria-hidden />}
      <div className="track-grid-card-art-wrap">
        {showSelectCheckbox && (
          <span className="track-grid-card-checkbox-slot">
            <input
              type="checkbox"
              className="track-checkbox"
              checked={isSelected}
              onChange={(event) => onSelectChange?.(item.id, event.target.checked)}
              aria-label={`Select ${item.title}`}
              onClick={(event) => event.stopPropagation()}
            />
          </span>
        )}
        <button
          type="button"
          className="track-grid-card-art-btn"
          onClick={handleArtClick}
          aria-label={showPlayingIcon ? `Pause ${item.title}` : `Play ${item.title}`}
        >
          <span className="track-grid-card-art" style={thumbStyle} />
          {(showPlayingIcon || showPauseIcon || (canPlay && isHovered)) && (
            <span className="track-grid-card-play-overlay" aria-hidden>
              <img
                src={resolveThemedAsset(
                  showPlayingIcon ? ICON_PAUSE_IN_CIRCLE : ICON_PLAY_IN_CIRCLE_ON,
                  theme
                )}
                alt=""
              />
            </span>
          )}
        </button>
        {titleBadge && (
          <span className="track-version-badge track-version-badge--on-thumb">{titleBadge}</span>
        )}
      </div>
      <div className="track-grid-card-title-row">
        <p className="track-grid-card-title">{item.title}</p>
        <TrackGridCardOverflowMenu
          item={item}
          isAlbum={isAlbum}
          onSoundsLikeClick={onSoundsLikeClick}
          visible={showOverflowMenu}
        />
      </div>
      <div className="track-id-row track-grid-card-id-row">
        <span className="track-id">{item.id}</span>
        <button
          type="button"
          className="track-id-icon-btn"
          aria-label={isAlbum ? 'Album info' : 'Track info'}
        >
          <img src="/icons/TrackInfo.svg" alt="" />
        </button>
      </div>
    </article>
  );
}
