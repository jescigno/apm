import { useState, useEffect, useRef, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { LAYOUT_WIDE_MIN_WIDTH } from '../constants/layout';
import { ROUTE_FAVORITES, ROUTE_PROJECT_DETAILS } from '../constants/routes';

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
  { label: 'Projects', action: 'projectsPanel' },
  { label: 'Project Details', to: ROUTE_PROJECT_DETAILS },
  { label: 'Notifications', to: '/notifications' },
  { label: 'Favorites', to: ROUTE_FAVORITES },
  { label: 'History', to: '/history' },
  { label: 'APM Classic', to: '/apm-classic' },
  { type: 'divider' },
  { label: 'My Account', to: '/account' },
  { label: 'Logout', action: 'logout' },
];

/**
 * Items shown under the “My APM” hamburger accordion only (stops at APM Classic).
 * Excludes the divider, My Account, Logout, and Mode — those are not part of this dropdown.
 */
const PROFILE_MENU_MY_APM_SUBITEMS = PROFILE_MENU_ITEMS.filter(
  (o) => o.type !== 'divider' && o.action !== 'logout' && o.label !== 'My Account'
);

function ModeToggle({ isDark, setIsDark, className = '' }) {
  return (
    <button
      type="button"
      className={`header-menu-mode-switch ${isDark ? 'header-menu-mode-switch--dark' : 'header-menu-mode-switch--light'} ${className}`.trim()}
      onClick={() => setIsDark((d) => !d)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="header-menu-mode-switch-track">
        <svg className="header-menu-mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg className="header-menu-mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
    </button>
  );
}

function Header({ onOpenProjectsPanel }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [myApmOpen, setMyApmOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(null);
  const menuRef = useRef(null);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('apm-theme');
    if (stored === 'light' || stored === 'dark') return stored === 'dark';
    return true;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('apm-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

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
          <img src="/APMLogo.svg" alt="apm music" className="logo-img" />
        </a>
        <div className="search-bar">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Add keywords, paste a link, or try a prompt like 'climactic mountain summit at dawn'" />
        </div>
        <div className="header-end-wide">
          <nav className="header-nav-wide" aria-label="Main navigation">
            {HEADER_MENU_OPTIONS.map(({ label, href }) => {
              const items = HEADER_NAV_DROPDOWNS[label] ?? [];
              return (
                <div key={label} className="header-nav-wide__dropdown-wrap">
                  <a href={href} className="header-nav-wide__link">
                    {label}
                  </a>
                  <div className="header-nav-wide__dropdown" role="menu" aria-label={`${label} menu`}>
                    <div className="header-nav-wide__dropdown-panel">
                      {items.map((item) => (
                        <a key={item.label} href={item.href} className="header-nav-wide__dropdown-item" role="menuitem">
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
            <div className="header-profile-wrap">
              <button type="button" className="icon-btn header-profile-btn" aria-haspopup="true" title="Account">
                <svg
                  className="header-profile-icon"
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 21v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" />
                </svg>
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
                      onClick={() => onOpenProjectsPanel?.()}
                    >
                      {opt.label}
                    </button>
                  ) : opt.action === 'logout' ? (
                    <button
                      key={opt.label}
                      type="button"
                      className="header-profile-dropdown__item header-profile-dropdown__item--logout"
                      role="menuitem"
                    >
                      {opt.label}
                    </button>
                  ) : (
                    <Link
                      key={opt.label}
                      to={opt.to}
                      className="header-profile-dropdown__item"
                      role="menuitem"
                      onClick={() => navigate(opt.to)}
                    >
                      {opt.label}
                    </Link>
                  )
                )}
              </div>
            </div>
            <div className="header-wide-mode">
              <ModeToggle isDark={isDark} setIsDark={setIsDark} />
            </div>
          </div>
        </div>
        <div className="header-menu-spacer" aria-hidden="true" />
      </header>
      <div className="header-actions header-actions-floating">
        <button
          type="button"
          className={`icon-btn header-menu-btn ${menuOpen ? 'header-menu-btn--active' : ''}`}
          title={menuOpen ? 'Close menu' : 'Menu'}
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          {menuOpen ? (
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
          <div className="header-menu-item header-menu-mode-row">
            <span>Mode</span>
            <ModeToggle isDark={isDark} setIsDark={setIsDark} />
          </div>
          <button
            type="button"
            className="header-menu-item header-menu-logout-outline"
            onClick={() => {
              setMyApmOpen(false);
              setMenuOpen(false);
            }}
          >
            {PROFILE_MENU_ITEMS.find((o) => o.action === 'logout')?.label ?? 'Logout'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Header;
