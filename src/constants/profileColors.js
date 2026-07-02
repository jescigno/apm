/** Profile color palette — only for user profile circles/avatars. */
export const PROFILE_COLORS = {
  amber: '#C17C2A',
  spring: '#2BC174',
  cyan: '#2AA3C1',
  magenta: '#C12BC0',
  rust: '#C12B2B',
  indigo: '#3C2BC1',
};

/** CSS custom property names (see index.css :root). */
export const PROFILE_COLOR_CSS_VARS = {
  amber: '--profile-amber',
  spring: '--profile-spring',
  cyan: '--profile-cyan',
  magenta: '--profile-magenta',
  rust: '--profile-rust',
  indigo: '--profile-indigo',
};

/** Stable profile color per notification author initials. */
export const PROFILE_COLOR_BY_INITIALS = {
  MR: 'cyan',
  SR: 'rust',
  JL: 'indigo',
  DK: 'amber',
  AW: 'magenta',
  TR: 'spring',
};

export function getProfileColorVar(initials, fallback = 'spring') {
  const key = PROFILE_COLOR_BY_INITIALS[initials] ?? fallback;
  return `var(${PROFILE_COLOR_CSS_VARS[key]})`;
}
