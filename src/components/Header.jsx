import { useState, useEffect, useRef, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { LAYOUT_WIDE_MIN_WIDTH } from '../constants/layout';
import { ROUTE_ADMIN, ROUTE_FAVORITES, ROUTE_ACCOUNT, ROUTE_NOTIFICATIONS } from '../constants/routes';
import ThemeModeToggle from './ThemeModeToggle';
import { useThemeName } from '../utils/theme';

const HEADER_MENU_OPTIONS = [
  { label: 'Discover', href: '#' },
  { label: 'Toolbox', href: '#' },
  { label: 'Resources', href: '#' },
];

/** Wide-header + mobile nav dropdowns. Set hrefs when routes are defined. */
const HEADER_NAV_DROPDOWNS = {
  Discover: [
    { label: 'New Releases', href: '#' },
    { label: 'Playlists', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Libraries', href: '#' },
    { label: 'Artists & Composers', href: '#' },
    { label: 'Indie Artists', href: '#' },
    { label: 'Film & TV', href: '#' },
    { label: 'Sports', href: '#' },
    { label: 'Brands', href: '#' },
    { label: 'Games', href: '#' },
    { label: 'NFL Films Signature Tracks', href: '#' },
  ],
  Toolbox: [
    { label: 'Music Directors', href: '#' },
    { label: 'Cue Sheet Tools', href: '#' },
    { label: 'Adobe Premiere', href: '#' },
    { label: 'Covers & Re-Records', href: '#' },
    { label: 'SoundFX', href: '#' },
    { label: 'Sound Design', href: '#' },
  ],
  Resources: [
    { label: 'Licensing 101', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Support Center', href: '#' },
    { label: 'FAQ', href: '#' },
  ],
};

/** Profile icon menu (wide + mobile My APM section). Set routes as pages exist. */
const PROFILE_MENU_ITEMS = [
  { label: 'Admin Console', to: ROUTE_ADMIN },
  { label: 'Projects', action: 'projectsPanel' },
  { label: 'Notifications', to: ROUTE_NOTIFICATIONS },
  { label: 'Favorites', to: ROUTE_FAVORITES },
  { label: 'History', to: '/history' },
  { label: 'My Account', to: ROUTE_ACCOUNT },
  { type: 'divider' },
  { label: 'Logout', action: 'logout' },
];

/**
 * Items under the “My APM” hamburger accordion (logout last). Excludes divider.
 */
const PROFILE_MENU_MY_APM_SUBITEMS = PROFILE_MENU_ITEMS.filter(
  (o) => o.type !== 'divider'
);

function blurMenuOnPointerLeave(event) {
  const focused = document.activeElement;
  if (focused instanceof HTMLElement && event.currentTarget.contains(focused)) {
    focused.blur();
  }
}

function preventPointerFocus(event) {
  event.preventDefault();
}

export function HeaderMenuButton({ open, onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`icon-btn header-menu-btn ${open ? 'header-menu-btn--active' : ''} ${className}`.trim()}
      aria-label={open ? 'Close menu' : 'Menu'}
      onClick={onClick}
      aria-expanded={open}
      aria-haspopup="true"
    >
      {open ? (
        <svg className="header-menu-close-icon" viewBox="0 0 18 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round">
          <path d="M3.66 3.86L8.78 9.27M8.78 9.27l5.13 5.41M8.78 9.27l5.13-5.41M8.78 9.27L3.66 14.68" />
        </svg>
      ) : (
        <span className="header-menu-icon">
          <span className="header-menu-icon-bar header-menu-icon-bar-top" />
          <span className="header-menu-icon-bar header-menu-icon-bar-mid" />
          <span className="header-menu-icon-bar header-menu-icon-bar-bot" />
        </span>
      )}
    </button>
  );
}

function Header({
  onOpenProjectsPanel,
  searchQuery = '',
  searchTerms = [],
  onSearchQueryChange,
  onSearchSubmit,
  onSearchClear,
  headerMenuRef,
}) {
  const navigate = useNavigate();
  const hasSearchTerms = searchTerms.length > 0;
  const hasSearchQuery = hasSearchTerms || searchQuery.trim().length > 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const [myApmOpen, setMyApmOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(null);
  /** Hamburger menu only: after Logout, hide Logout and show Login / Register below Mode. */
  const [hamburgerLoggedOut, setHamburgerLoggedOut] = useState(false);
  const menuRef = useRef(null);
  const menuOpenRef = useRef(false);
  const menuOpenListenersRef = useRef(new Set());
  const theme = useThemeName();
  const isDark = theme === 'dark';

  menuOpenRef.current = menuOpen;

  useEffect(() => {
    menuOpenListenersRef.current.forEach((listener) => listener(menuOpen));
  }, [menuOpen]);

  useEffect(() => {
    if (!headerMenuRef) return undefined;
    headerMenuRef.current = {
      toggleMenu: () => setMenuOpen((open) => !open),
      subscribe: (listener) => {
        menuOpenListenersRef.current.add(listener);
        listener(menuOpenRef.current);
        return () => menuOpenListenersRef.current.delete(listener);
      },
    };
    return () => {
      headerMenuRef.current = null;
    };
  }, [headerMenuRef]);

  useEffect(() => {
    if (menuOpen) {
      setMyApmOpen(true);
    } else {
      setMobileNavOpen(null);
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setMyApmOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LAYOUT_WIDE_MIN_WIDTH}px)`);
    const closeDrawer = () => {
      if (mq.matches) {
        setMenuOpen(false);
        setMyApmOpen(false);
      }
    };
    mq.addEventListener('change', closeDrawer);
    closeDrawer();
    return () => mq.removeEventListener('change', closeDrawer);
  }, []);

  return createPortal(
    <div className={`header-wrapper${menuOpen ? ' header-wrapper--menu-open' : ''}`} ref={menuRef}>
      <header className={`header ${menuOpen ? 'header--menu-open' : ''}`}>
        <a href="#" className="logo">
          <img
            src={isDark ? '/APMLogo.svg' : '/APMLogo-lightmode.svg'}
            alt="apm music"
            className="logo-img"
          />
        </a>
        <form
          className={`search-bar${hasSearchQuery ? ' search-bar--has-query' : ''}${hasSearchTerms ? ' search-bar--has-pills' : ''}`}
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit?.();
          }}
        >
          <img
            src="/icons/search.svg"
            alt=""
            className="search-icon"
            width={18}
            height={18}
            draggable={false}
            aria-hidden
          />
          {hasSearchTerms ? (
            <div className="search-bar__terms" aria-label="Search terms">
              {searchTerms.map((term, index) => (
                <span key={`${term}-${index}`} className="search-bar__pill">
                  {term}
                </span>
              ))}
            </div>
          ) : null}
          <div className="search-bar-input-wrap">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange?.(e.target.value)}
              placeholder={
                hasSearchTerms
                  ? 'Add keywords…'
                  : "Add keywords, paste a link, or try a prompt like 'climactic mountain summit at dawn'"
              }
            />
          </div>
          {hasSearchQuery && (
            <button
              type="button"
              className="search-bar-clear-btn"
              aria-label="Clear search"
              onClick={() => {
                onSearchClear?.();
              }}
            >
              <svg
                className="search-bar-clear-icon"
                viewBox="0 0 18 18"
                width={18}
                height={18}
                fill="none"
                aria-hidden
              >
                <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.25" />
                <path
                  d="M6.5 6.5L11.5 11.5M11.5 6.5L6.5 11.5"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </form>
        <div className="header-end-wide">
          <nav className="header-nav-wide" aria-label="Main navigation">
            {HEADER_MENU_OPTIONS.map(({ label, href }) => {
              const items = HEADER_NAV_DROPDOWNS[label] ?? [];
              return (
                <div
                  key={label}
                  className="header-nav-wide__dropdown-wrap"
                  onMouseLeave={blurMenuOnPointerLeave}
                >
                  <a href={href} className="header-nav-wide__link">
                    {label}
                  </a>
                  <div className="header-nav-wide__dropdown" role="menu" aria-label={`${label} menu`}>
                    <div className="header-nav-wide__dropdown-panel">
                      {items.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          className="header-nav-wide__dropdown-item"
                          role="menuitem"
                          onMouseDown={preventPointerFocus}
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
          <div className="header-wide-actions">
            <div className="header-profile-wrap" onMouseLeave={blurMenuOnPointerLeave}>
              <button type="button" className="icon-btn header-profile-btn" aria-haspopup="true" title="Account">
                <img
                  src="/nav-icons/Profile.svg"
                  alt=""
                  className="header-profile-icon"
                  width={24}
                  height={24}
                  aria-hidden="true"
                />
              </button>
              <div className="header-profile-dropdown" role="menu" aria-label="Account menu">
                {PROFILE_MENU_ITEMS.map((opt, i) =>
                  opt.type === 'divider' ? (
                    <div key={`profile-divider-${i}`} className="header-profile-dropdown__divider" />
                  ) : opt.action === 'projectsPanel' ? (
                    <button
                      key={opt.label}
                      type="button"
                      className="header-profile-dropdown__item"
                      role="menuitem"
                      onMouseDown={preventPointerFocus}
                      onClick={() => onOpenProjectsPanel?.()}
                    >
                      {opt.label}
                    </button>
                  ) : opt.action === 'logout' ? (
                    <button
                      key={opt.label}
                      type="button"
                      className="header-profile-dropdown__item"
                      role="menuitem"
                      onMouseDown={preventPointerFocus}
                    >
                      {opt.label}
                    </button>
                  ) : (
                    <Link
                      key={opt.label}
                      to={opt.to}
                      className="header-profile-dropdown__item"
                      role="menuitem"
                      onMouseDown={preventPointerFocus}
                      onClick={() => navigate(opt.to)}
                    >
                      {opt.label}
                    </Link>
                  )
                )}
              </div>
            </div>
            <div className="header-wide-mode">
              <ThemeModeToggle />
            </div>
          </div>
        </div>
        <div className="header-menu-spacer" aria-hidden="true" />
      </header>
      <div className="header-actions header-actions-floating">
        <HeaderMenuButton open={menuOpen} onClick={() => setMenuOpen((o) => !o)} />
      </div>
      <div
        className={`header-menu-bar ${menuOpen ? 'header-menu-bar--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="header-menu-bar-close"
          aria-label="Close menu"
          onClick={() => {
            setMenuOpen(false);
            setMyApmOpen(false);
          }}
        >
          <svg className="header-menu-close-icon" viewBox="0 0 18 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round" aria-hidden="true">
            <path d="M3.66 3.86L8.78 9.27M8.78 9.27l5.13 5.41M8.78 9.27l5.13-5.41M8.78 9.27L3.66 14.68" />
          </svg>
        </button>
        <div className="header-menu-bar-inner">
          {HEADER_MENU_OPTIONS.map(({ label, href }) => {
            const subitems = HEADER_NAV_DROPDOWNS[label] ?? [];
            const isOpen = mobileNavOpen === label;
            if (subitems.length > 0) {
              return (
                <Fragment key={label}>
                  <button
                    type="button"
                    className="header-menu-item header-menu-myapm-btn"
                    aria-expanded={isOpen}
                    onClick={() => setMobileNavOpen((k) => (k === label ? null : label))}
                  >
                    <span>{label}</span>
                    <svg
                      className={`header-menu-item-chevron ${isOpen ? 'header-menu-item-chevron--open' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {isOpen &&
                    subitems.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="header-menu-item header-menu-myapm-subitem"
                        role="menuitem"
                        onClick={() => {
                          setMenuOpen(false);
                          setMobileNavOpen(null);
                        }}
                      >
                        {item.label}
                      </a>
                    ))}
                </Fragment>
              );
            }
            return (
              <a key={label} href={href} className="header-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            );
          })}
          {!hamburgerLoggedOut ? (
            <>
              <div className="header-menu-divider" />
              <button
                type="button"
                className="header-menu-item header-menu-myapm-btn"
                onClick={() => setMyApmOpen((o) => !o)}
                aria-expanded={myApmOpen}
              >
                <span>My APM</span>
                <svg
                  className={`header-menu-item-chevron ${myApmOpen ? 'header-menu-item-chevron--open' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {myApmOpen &&
                PROFILE_MENU_MY_APM_SUBITEMS.map((opt) =>
                  opt.action === 'projectsPanel' ? (
                    <button
                      key={opt.label}
                      type="button"
                      className="header-menu-item header-menu-myapm-subitem"
                      onClick={() => {
                        onOpenProjectsPanel?.();
                        setMyApmOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ) : opt.action === 'logout' ? (
                    <button
                      key={opt.label}
                      type="button"
                      className="header-menu-item header-menu-myapm-subitem"
                      onClick={() => {
                        setHamburgerLoggedOut(true);
                        setMyApmOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ) : (
                    <Link
                      key={opt.label}
                      to={opt.to}
                      className="header-menu-item header-menu-myapm-subitem"
                      onClick={() => {
                        navigate(opt.to);
                        setMyApmOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      {opt.label}
                    </Link>
                  )
                )}
            </>
          ) : (
            <div className="header-menu-divider" />
          )}
          <div className="header-menu-item header-menu-mode-row">
            <span>Mode</span>
            <ThemeModeToggle />
          </div>
          {hamburgerLoggedOut && (
            <div className="header-menu-auth-buttons">
              <button
                type="button"
                className="header-menu-auth-btn header-menu-auth-btn--login"
                onClick={() => {
                  setHamburgerLoggedOut(false);
                  setMyApmOpen(true);
                }}
              >
                Login
              </button>
              <button
                type="button"
                className="header-menu-auth-btn header-menu-auth-btn--register"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Header;
