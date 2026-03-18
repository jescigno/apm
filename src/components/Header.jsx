import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const HEADER_MENU_OPTIONS = [
  { label: 'Settings', href: '#' },
  { label: 'Help', href: '#' },
  { label: 'About', href: '#' },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
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
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
          <div className="header-menu-divider" />
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
