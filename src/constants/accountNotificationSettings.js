/** Notification settings overlay — allow toggles and muted projects. */
export const ALLOW_NOTIFICATION_OPTIONS = [
  { id: 'offers', label: 'Offers and Announcements' },
  { id: 'accountActivity', label: 'Account Activity' },
  { id: 'mentions', label: 'Mentions' },
  { id: 'sharedProjects', label: 'Shared Projects' },
];

export const MUTED_PROJECTS = [
  { id: 'mp1', name: 'Winter Olympics 2026 – Contemporary Italy (Update 10.28.25)' },
  { id: 'mp2', name: 'Winter Olympics 2026 – Opening Ceremony (Update 10.15.25)' },
  { id: 'mp3', name: 'NFL Commercial' },
  { id: 'mp4', name: 'NFL Primetime' },
  { id: 'mp5', name: 'NFL Soundtrack' },
  { id: 'mp6', name: 'Stadium Anthems' },
  { id: 'mp7', name: 'College Game Day' },
  { id: 'mp8', name: 'Netflix Original Series – Season 2' },
  { id: 'mp9', name: 'Super Bowl LVIII – Halftime Prep' },
  { id: 'mp10', name: 'Olympic Figure Skating – Practice Cuts' },
];

export const DEFAULT_ALLOW_NOTIFICATIONS = Object.fromEntries(
  ALLOW_NOTIFICATION_OPTIONS.map(({ id }) => [id, true])
);
