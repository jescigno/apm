import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

const HEADER_MENU_OPTIONS = [
  { label: 'Discover', href: '#' },
  { label: 'Toolbox', href: '#' },
  { label: 'Resources', href: '#' },
];

const MY_APM_OPTIONS = [
  { label: 'Projects', to: '/projects' },
  { label: 'Favorites', to: '/favorites' },
  { label: 'History', to: '/history' },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [myApmOpen, setMyApmOpen] = useState(true);
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

  return createPortal(
    <div className="header-wrapper" ref={menuRef}>
      <header className={`header ${menuOpen ? 'header--menu-open' : ''}`}>
        <a href="#" className="logo">
          <img src="/APMLogo.svg" alt="apm music" className="logo-img" />
        </a>
        <div className="search-bar">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Add keywords, paste a link, or try a prompt like 'climactic mountain summit at dawn'" />
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
        <div className="header-menu-bar-inner">
          {HEADER_MENU_OPTIONS.map(({ label, href }) => (
            <a key={label} href={href} className="header-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
              <span>{label}</span>
              <svg className="header-menu-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
          <div className="header-menu-divider" />
          <button
            type="button"
            className="header-menu-item header-menu-myapm-btn"
            onClick={() => setMyApmOpen((o) => !o)}
            aria-expanded={myApmOpen}
          >
            <span>My APM</span>
            <svg className={`header-menu-item-chevron ${myApmOpen ? 'header-menu-item-chevron--open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {myApmOpen && MY_APM_OPTIONS.map(({ label, to }) => (
            <Link key={label} to={to} className="header-menu-item header-menu-myapm-subitem" onClick={() => { setMyApmOpen(false); setMenuOpen(false); }}>
              {label}
            </Link>
          ))}
          <div className="header-menu-item header-menu-mode-row">
            <span>Mode</span>
            <button
              type="button"
              className={`header-menu-mode-switch ${isDark ? 'header-menu-mode-switch--dark' : 'header-menu-mode-switch--light'}`}
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
          </div>
          <button type="button" className="header-menu-logout" onClick={() => setMenuOpen(false)}>
            Logout
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Header;
