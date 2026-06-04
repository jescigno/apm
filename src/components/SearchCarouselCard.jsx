import { useEffect, useRef, useState } from 'react';

const RECENT_SEARCH_MENU_ITEMS = [
  { id: 'search', label: 'Search', icon: '/icons/Search.svg' },
  { id: 'sounds-like', label: 'Sounds Like', icon: '/player-actions/SoundsLike.svg' },
  { id: 'share', label: 'Share', icon: '/icons/Upload.svg' },
  { id: 'add-to-favorites', label: 'Add to Favorites', icon: '/player-actions/Favorite.svg' },
  { id: 'remove-from-history', label: 'Remove from History', icon: '/icons/Close.svg' },
];

const RECENTLY_PLAYED_MENU_ITEMS = [
  { id: 'go-to-track', label: 'Go to Track', icon: '/TrackDetails.svg' },
  { id: 'sounds-like', label: 'Sounds Like', icon: '/player-actions/SoundsLike.svg' },
  { id: 'share', label: 'Share', icon: '/icons/Upload.svg' },
  { id: 'add-to-favorites', label: 'Add to Favorites', icon: '/player-actions/Favorite.svg' },
  { id: 'add-to-project', label: 'Add to a Project', icon: '/icons/Add.svg' },
  { id: 'remove-from-history', label: 'Remove from History', icon: '/icons/Close.svg' },
];

function SearchCarouselOverflowMenu({ itemLabel, itemId, menuItems, onRemoveFromHistory, showOnHover }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const overflowRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (!overflowRef.current?.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const handleMenuAction = (actionId) => {
    if (actionId === 'remove-from-history') {
      onRemoveFromHistory?.(itemId);
    }
    setMenuOpen(false);
  };

  return (
    <div
      className={`search-carousel-card-overflow-menu-wrap${showOnHover ? ' search-carousel-card-overflow-menu-wrap--hover' : ''}`}
      ref={overflowRef}
    >
      <button
        type="button"
        className={`search-carousel-card-overflow-menu${menuOpen ? ' search-carousel-card-overflow-menu--open' : ''}`}
        aria-label={`More options for ${itemLabel}`}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <img src="/icons/MoreMenu.svg" alt="" aria-hidden />
      </button>
      {menuOpen && (
        <div
          className="search-carousel-card-overflow-dropdown"
          role="menu"
          aria-label={`Actions for ${itemLabel}`}
        >
          {menuItems.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              className="search-carousel-card-overflow-dropdown-item"
              onClick={() => handleMenuAction(action.id)}
            >
              <img src={action.icon} alt="" aria-hidden />
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentSearchCard({ item, onRemoveFromHistory }) {
  return (
    <div className="search-carousel-card search-carousel-card--search">
      <button type="button" className="search-carousel-card-search-main">
        <img
          src="/icons/Search.svg"
          alt=""
          className="search-carousel-card-search-icon"
          width={18}
          height={18}
          draggable={false}
          aria-hidden
        />
        <span className="search-carousel-card-meta">
          <span className="search-carousel-card-label">{item.label}</span>
          {item.subtitle && <span className="search-carousel-card-subtitle">{item.subtitle}</span>}
        </span>
      </button>
      <SearchCarouselOverflowMenu
        itemLabel={item.label}
        itemId={item.id}
        menuItems={RECENT_SEARCH_MENU_ITEMS}
        onRemoveFromHistory={onRemoveFromHistory}
      />
    </div>
  );
}

function RecentlyPlayedCard({ item, onRemoveFromHistory }) {
  return (
    <div className="search-carousel-card search-carousel-card--recently-played">
      <button type="button" className="search-carousel-card-recently-played-main">
        <span className="search-carousel-card-art search-carousel-card-art--recently-played">
          <img src={item.image} alt="" />
        </span>
        <span className="search-carousel-card-meta">
          <span className="search-carousel-card-title">{item.title}</span>
          {item.subtitle && <span className="search-carousel-card-subtitle">{item.subtitle}</span>}
        </span>
      </button>
      <SearchCarouselOverflowMenu
        itemLabel={item.title}
        itemId={item.id}
        menuItems={RECENTLY_PLAYED_MENU_ITEMS}
        onRemoveFromHistory={onRemoveFromHistory}
      />
    </div>
  );
}

function SearchCarouselCard({ variant, item, onRemoveFromHistory }) {
  switch (variant) {
    case 'search':
      return <RecentSearchCard item={item} onRemoveFromHistory={onRemoveFromHistory} />;

    case 'project':
      return (
        <button type="button" className="search-carousel-card search-carousel-card--project">
          <span className="search-carousel-card-art search-carousel-card-art-grid">
            {(item.images ?? (item.image ? [item.image] : [])).slice(0, 4).map((src, i) => (
              <img key={i} className="search-carousel-card-art-grid-img" src={src} alt="" />
            ))}
          </span>
          <span className="search-carousel-card-meta">
            <span className="search-carousel-card-title">{item.title}</span>
            {item.subtitle && <span className="search-carousel-card-subtitle">{item.subtitle}</span>}
          </span>
        </button>
      );

    case 'featured':
      return (
        <button type="button" className="search-carousel-card search-carousel-card--featured">
          <span className="search-carousel-card-art search-carousel-card-art--featured">
            <img src={item.image} alt="" />
          </span>
          <span className="search-carousel-card-meta">
            <span className="search-carousel-card-title">{item.title}</span>
            {item.subtitle && <span className="search-carousel-card-subtitle">{item.subtitle}</span>}
          </span>
        </button>
      );

    case 'playlist':
      return (
        <button type="button" className="search-carousel-card search-carousel-card--playlist">
          <span
            className="search-carousel-card-art search-carousel-card-art--playlist"
            style={{ background: item.accent ?? '#3d3d3d' }}
          >
            <span className="search-carousel-card-playlist-labels">
              <span className="search-carousel-card-playlist-title">{item.title}</span>
              {item.subtitle && (
                <span className="search-carousel-card-playlist-subtitle">{item.subtitle}</span>
              )}
            </span>
          </span>
        </button>
      );

    case 'recently-played':
      return <RecentlyPlayedCard item={item} onRemoveFromHistory={onRemoveFromHistory} />;

    case 'track':
    default:
      return (
        <button type="button" className="search-carousel-card search-carousel-card--track">
          <span className="search-carousel-card-art search-carousel-card-art--square">
            <img src={item.image} alt="" />
          </span>
          <span className="search-carousel-card-meta">
            <span className="search-carousel-card-title">{item.title}</span>
            {item.subtitle && <span className="search-carousel-card-subtitle">{item.subtitle}</span>}
          </span>
        </button>
      );
  }
}

export default SearchCarouselCard;
