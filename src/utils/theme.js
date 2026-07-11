import { useEffect, useState } from 'react';
import { DEFAULT_THEME, THEME_STORAGE_KEY, THEMES } from '../constants/theme';

export function useThemeName() {
  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      setTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

export function isValidTheme(theme) {
  return THEMES.includes(theme);
}

export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isValidTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(theme = DEFAULT_THEME) {
  const resolved = isValidTheme(theme) ? theme : DEFAULT_THEME;
  document.documentElement.setAttribute('data-theme', resolved);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, resolved);
  } catch {
    /* ignore storage failures */
  }
  return resolved;
}

export function initTheme() {
  return applyTheme(getStoredTheme());
}

export function toggleTheme(currentTheme) {
  return applyTheme(currentTheme === 'light' ? 'dark' : 'light');
}

/** Base asset paths that ship a `-lightmode.svg` sibling in public/. */
const LIGHTMODE_ASSET_PATHS = new Set([
  '/APMLogo.svg',
  '/icons/favorite.svg',
  '/icons/favoriteOutline.svg',
  '/icons/PlayinCircle.svg',
  '/icons/PlayinCircle-Off.svg',
  '/icons/soundsLike.svg',
  '/icons/comments-active.svg',
  '/player-actions/SoundsLike.svg',
  '/nav-icons/Home.svg',
  '/icons/LeftNav-Search-Inactive.svg',
  '/nav-icons/Calendar.svg',
  '/nav-icons/Playlists.svg',
  '/nav-icons/SoundEffects.svg',
]);

function assetBasePath(path) {
  const queryIndex = path.indexOf('?');
  return queryIndex === -1 ? path : path.slice(0, queryIndex);
}

export function resolveThemedAsset(path, theme = getStoredTheme()) {
  if (theme === 'dark') return path;
  const base = assetBasePath(path);
  const query = path.slice(base.length);
  if (base.endsWith('-lightmode.svg')) return path;
  if (!LIGHTMODE_ASSET_PATHS.has(base)) return path;
  return `${base.replace(/\.svg$/, '-lightmode.svg')}${query}`;
}
