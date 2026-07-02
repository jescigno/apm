/** Notification settings overlay — allow toggles and muted projects. */
export const ALLOW_NOTIFICATION_OPTIONS = [
  {
    id: 'offers',
    label: 'Offers and Announcements',
    description: 'Promotions, product updates, and company news.',
  },
  {
    id: 'accountActivity',
    label: 'Account Activity',
    description: 'Sign-ins, password changes, and billing updates.',
  },
  {
    id: 'mentions',
    label: 'Mentions',
    description: 'When someone tags or mentions you in a comment.',
  },
  {
    id: 'sharedProjects',
    label: 'Shared Projects',
    description: 'When a project is shared with you or updated.',
  },
];

export const DEFAULT_MUTED_PROJECT_IDS = [
  'mp1',
  'mp2',
  'mp3',
  'mp4',
  'mp5',
];

export const MUTED_PROJECTS = [
  { id: 'mp11', name: 'Amazon Prime Documentary – Trailers' },
  { id: 'mp7', name: 'College Game Day' },
  { id: 'mp12', name: 'ESPN College Basketball – March Highlights' },
  { id: 'mp13', name: 'Formula 1 – Race Day Broadcast' },
  { id: 'mp14', name: 'HBO Max Original – Teaser Cuts' },
  { id: 'mp15', name: 'MLB World Series – Broadcast Package' },
  { id: 'mp16', name: 'NBA Finals – Arena Mix' },
  { id: 'mp8', name: 'Netflix Original Series – Season 2' },
  { id: 'mp3', name: 'NFL Commercial' },
  { id: 'mp4', name: 'NFL Primetime' },
  { id: 'mp5', name: 'NFL Soundtrack' },
  { id: 'mp10', name: 'Olympic Figure Skating – Practice Cuts' },
  { id: 'mp17', name: 'Olympic Swimming – Finals Prep' },
  { id: 'mp18', name: 'PGA Tour – Championship Round' },
  { id: 'mp19', name: 'SportsCenter – Daily Recap' },
  { id: 'mp6', name: 'Stadium Anthems' },
  { id: 'mp9', name: 'Super Bowl LVIII – Halftime Prep' },
  { id: 'mp20', name: 'UEFA Champions League – Match Day' },
  { id: 'mp1', name: 'Winter Olympics 2026 – Contemporary Italy (Update 10.28.25)' },
  { id: 'mp2', name: 'Winter Olympics 2026 – Opening Ceremony (Update 10.15.25)' },
];

export const DEFAULT_ALLOW_NOTIFICATIONS = Object.fromEntries(
  ALLOW_NOTIFICATION_OPTIONS.map(({ id }) => [id, true])
);
