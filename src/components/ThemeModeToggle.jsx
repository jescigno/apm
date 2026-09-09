import { useEffect, useState } from 'react';
import { applyTheme, getStoredTheme } from '../utils/theme';

export default function ThemeModeToggle({ className = '' }) {
  const [isDark, setIsDark] = useState(() => getStoredTheme() === 'dark');

  useEffect(() => {
    applyTheme(isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <button
      type="button"
      className={`header-menu-mode-switch ${isDark ? 'header-menu-mode-switch--dark' : 'header-menu-mode-switch--light'} ${className}`.trim()}
      onClick={() => setIsDark((d) => !d)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="header-menu-mode-switch-track">
        <span className="header-menu-mode-icon-slot">
          <svg className="header-menu-mode-icon header-menu-mode-icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
        </span>
        <span className="header-menu-mode-icon-slot">
          <svg className="header-menu-mode-icon header-menu-mode-icon--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
