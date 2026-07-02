import { PROFILE_COLORS } from './profileColors';

export const DESIGN_SYSTEM_FONTS = [
  {
    name: 'Poppins',
    family: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
    usage: 'Primary UI — headings, body copy, buttons, navigation',
    weights: [
      { label: 'Regular 400', weight: 400, sample: 'The quick brown fox jumps over the lazy dog.' },
      { label: 'Medium 500', weight: 500, sample: 'The quick brown fox jumps over the lazy dog.' },
      { label: 'Semibold 600', weight: 600, sample: 'The quick brown fox jumps over the lazy dog.' },
      { label: 'Bold 700', weight: 700, sample: 'The quick brown fox jumps over the lazy dog.' },
    ],
  },
  {
    name: 'Space Mono',
    family: "'Space Mono', monospace",
    usage: 'Monospace — track IDs, timestamps, technical labels',
    weights: [
      { label: 'Regular 400', weight: 400, sample: 'APM-2024-001 · 3:42' },
      { label: 'Bold 700', weight: 700, sample: 'APM-2024-001 · 3:42' },
    ],
  },
];

export const DESIGN_SYSTEM_COLORS = [
  {
    group: 'Backgrounds',
    swatches: [
      { name: 'Page dark', token: '--bg-dark', value: '#0a0a0a' },
      { name: 'Card', token: '--bg-card', value: '#141414' },
      { name: 'Elevated', token: '--bg-elevated', value: '#1e1e1e' },
      { name: 'Account page', token: null, value: '#232323' },
      { name: 'Account surface', token: '--account-surface', value: '#303030' },
      { name: 'Overlay panel', token: null, value: '#333333' },
      { name: 'Nested panel', token: null, value: '#262626' },
    ],
  },
  {
    group: 'Text',
    swatches: [
      { name: 'Primary', token: '--text-primary', value: '#ffffff' },
      { name: 'Secondary', token: '--text-secondary', value: '#b0b0b0' },
      { name: 'Muted', token: '--text-muted', value: '#6b6b6b' },
      { name: 'Section label', token: null, value: '#888888' },
    ],
  },
  {
    group: 'Accents',
    swatches: [
      { name: 'Red (brand)', token: '--accent-red', value: '#CC1E3C' },
      { name: 'Red hover', token: '--accent-red-hover', value: '#b01a33' },
      { name: 'Violet', token: '--accent-purple', value: '#7c3aed' },
      { name: 'Blue', token: '--accent-blue', value: '#3b82f6' },
      { name: 'Toggle on', token: null, value: '#26d0d6' },
    ],
  },
  {
    group: 'CTAs',
    swatches: [
      { name: 'Primary', token: '--cta-primary-bg', value: '#CC1E3C' },
      { name: 'Primary hover', token: '--cta-primary-bg-hover', value: '#b01a33' },
      { name: 'Secondary', token: '--cta-secondary-bg', value: '#565656' },
      { name: 'Secondary hover', token: '--cta-secondary-bg-hover', value: '#666666' },
    ],
  },
  {
    group: 'Profile avatars',
    swatches: Object.entries(PROFILE_COLORS).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      token: `--profile-${name}`,
      value,
    })),
  },
  {
    group: 'Borders & chrome',
    swatches: [
      { name: 'Border', token: '--border', value: '#2a2a2a' },
      { name: 'Sidebar', token: null, value: '#000000' },
      { name: 'Close button', token: null, value: '#565656' },
    ],
  },
];

/** Track row / stem play control — red circle (on) and triangle-only (off). */
export const ICON_PLAY_IN_CIRCLE_ON = '/icons/PlayinCircle.svg';
export const ICON_PLAY_IN_CIRCLE_OFF = '/icons/PlayinCircle-Off.svg';

export const ICON_SHARE = '/icons/Upload.svg';
export const ICON_COPY = '/icons/copy.svg';
export const ICON_ADD = '/icons/add.svg';
export const ICON_MOVE_TO = '/icons/moveTo.svg';
export const ICON_DOWNLOAD = '/icons/download.svg';
export const ICON_FAVORITE = '/icons/favorite.svg';
export const ICON_FAVORITE_OUTLINE = '/icons/favoriteOutline.svg';
export const ICON_ARCHIVE = '/icons/archive.svg';
export const ICON_DELETE = '/icons/Trash.svg';
export const ICON_SOUNDS_LIKE = '/icons/soundsLike.svg';
export const ICON_CUSTOMIZE = '/icons/customize.svg';
export const ICON_REORDER = '/icons/reorder.svg';
export const ICON_CLOSE = '/icons/close.svg';
export const ICON_COMMENTS = '/icons/comments.svg';
export const ICON_COMMENTS_ACTIVE = '/icons/comments-active.svg';
export const ICON_TRACK_DETAILS = '/icons/TrackDetails.svg';
export const ICON_SORT = '/icons/sort.svg';
export const ICON_REFRESH = '/icons/refresh.svg';
export const ICON_SEARCH = '/icons/search.svg';
export const ICON_MORE_MENU = '/icons/moreMenu.svg';
export const ICON_FOLDER = '/icons/folder.svg';
export const ICON_FOLDER_NEW = '/icons/folderNew.svg';
export const ICON_HISTORY = '/icons/history.svg';
export const ICON_COLLABS = '/icons/collabs.svg';
export const ICON_COLLABS_ACTIVE = '/icons/collabs-active.svg';

/** Breadcrumb collab actions on project details. */
export const PROJECT_COLLAB_ACTIONS = [
  { id: 'sounds-like', label: 'Sounds Like', src: ICON_SOUNDS_LIKE },
  { id: 'history', label: 'History', src: ICON_HISTORY },
  { id: 'comments', label: 'Comments', src: ICON_COMMENTS, activeSrc: ICON_COMMENTS_ACTIVE },
  { id: 'collabs', label: 'Collaborators', src: ICON_COLLABS, activeSrc: ICON_COLLABS_ACTIVE, wide: true },
];

/** Project details hero — actions under the thumbnail grid. */
export const PROJECT_DETAIL_ACTIONS = [
  { id: 'share', label: 'Share', src: ICON_SHARE },
  { id: 'copy', label: 'Copy', src: ICON_COPY },
  { id: 'add', label: 'Add', src: ICON_ADD },
  { id: 'move', label: 'Move', src: ICON_MOVE_TO },
  { id: 'download', label: 'Download', src: ICON_DOWNLOAD },
  { id: 'archive', label: 'Archive', src: ICON_ARCHIVE },
  { id: 'delete', label: 'Delete', src: ICON_DELETE },
];

/** Main sections — used for in-page jump navigation. */
export const DESIGN_SYSTEM_SECTIONS = [
  { id: 'typography', label: 'Typography' },
  { id: 'colors', label: 'Colors' },
  { id: 'icons', label: 'Icons' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'form-controls', label: 'Form controls' },
  { id: 'layout', label: 'Layout & spacing' },
];

export const DESIGN_SYSTEM_LAYOUT = [
  { name: 'Sidebar width', token: '--sidebar-width', value: '64px' },
  { name: 'Header height', token: '--header-height', value: '64px' },
  { name: 'Player height', token: '--player-height', value: '100px' },
  { name: 'Account card radius', token: '--account-surface-radius', value: '8px' },
  { name: 'CTA padding', token: null, value: '12px 20px' },
  { name: 'CTA font size', token: '--cta-font-size', value: '12px' },
  { name: 'CTA letter spacing', token: '--cta-letter-spacing', value: '0.4px' },
];

/** SVG icons referenced in app UI — grouped for the design system page. */
export const DESIGN_SYSTEM_ICONS = [
  {
    group: 'Brand',
    icons: [{ name: 'APM Logo', src: '/APMLogo.svg' }],
  },
  {
    group: 'Left navigation',
    icons: [
      { name: 'Home', src: '/nav-icons/Home.svg' },
      { name: 'Search (inactive)', src: '/icons/LeftNav-Search-Inactive.svg' },
      { name: 'Search (active)', src: '/icons/LeftNav-Search-Active.svg' },
      { name: 'Calendar', src: '/nav-icons/Calendar.svg' },
      { name: 'Playlists', src: '/nav-icons/Playlists.svg' },
      { name: 'Sound Effects', src: '/nav-icons/SoundEffects.svg' },
      { name: 'Design System', src: '/icons/design-system.svg' },
    ],
  },
  {
    group: 'Common UI',
    icons: [
      { name: 'Search', src: ICON_SEARCH },
      { name: 'Close', src: ICON_CLOSE },
      { name: 'Add', src: ICON_ADD },
      { name: 'Share', src: ICON_SHARE },
      { name: 'Copy', src: ICON_COPY },
      { name: 'Move', src: ICON_MOVE_TO },
      { name: 'Download', src: ICON_DOWNLOAD },
      { name: 'Favorite (filled)', src: ICON_FAVORITE },
      { name: 'Favorite (outline)', src: ICON_FAVORITE_OUTLINE },
      { name: 'Play (on)', src: ICON_PLAY_IN_CIRCLE_ON },
      { name: 'Play (off)', src: ICON_PLAY_IN_CIRCLE_OFF },
      { name: 'More menu', src: ICON_MORE_MENU },
      { name: 'Track info', src: '/icons/TrackInfo.svg' },
      { name: 'Track lyrics', src: '/icons/TrackLyrics.svg' },
      { name: 'Folder', src: ICON_FOLDER },
      { name: 'New folder', src: ICON_FOLDER_NEW },
      { name: 'Settings', src: '/icons/Settings.svg' },
      { name: 'Mark as read', src: '/icons/mark-as-read.svg' },
      { name: 'Mark as unread', src: '/icons/mark-as-unread.svg' },
    ],
  },
  {
    group: 'Track & list actions',
    icons: [
      { name: 'Track details', src: ICON_TRACK_DETAILS },
      { name: 'Comments', src: ICON_COMMENTS },
      { name: 'Comments (active)', src: ICON_COMMENTS_ACTIVE },
      { name: 'Sounds Like', src: ICON_SOUNDS_LIKE },
      { name: 'Trash', src: ICON_DELETE },
      { name: 'Customize', src: ICON_CUSTOMIZE },
      { name: 'Sort', src: ICON_SORT },
      { name: 'Reorder', src: ICON_REORDER },
      { name: 'Refresh', src: ICON_REFRESH },
      { name: 'Archive', src: ICON_ARCHIVE },
    ],
  },
  {
    group: 'Project detail actions',
    icons: PROJECT_DETAIL_ACTIONS.map(({ label, src }) => ({ name: label, src })),
  },
  {
    group: 'Project collab bar',
    icons: [
      { name: 'Sounds Like', src: ICON_SOUNDS_LIKE },
      { name: 'History', src: ICON_HISTORY },
      { name: 'Comments', src: ICON_COMMENTS },
      { name: 'Comments (active)', src: ICON_COMMENTS_ACTIVE },
      { name: 'Collabs', src: ICON_COLLABS, wide: true },
      { name: 'Collabs (active)', src: ICON_COLLABS_ACTIVE, wide: true },
    ],
  },
  {
    group: 'Projects & panels',
    icons: [
      { name: 'Search (panel)', src: '/nav-icons/Search.svg' },
    ],
  },
  {
    group: 'Search filters',
    icons: [
      { name: 'Quick filters', src: '/icons/filters_quickfilters.svg' },
      { name: 'Libraries', src: '/icons/filters_library.svg' },
      { name: 'Tags', src: '/icons/filters_tags.svg' },
    ],
  },
  {
    group: 'Player controls',
    icons: [
      { name: 'Play', src: '/player-icons/Play.svg' },
      { name: 'Pause', src: '/player-icons/Pause.svg' },
      { name: 'Skip back', src: '/player-icons/SkipTrackBack.svg' },
      { name: 'Skip forward', src: '/player-icons/SkipTrackFwd.svg' },
      { name: 'Playback entire song', src: '/player-icons/PlaybackEntireSong.svg' },
      { name: 'Player settings', src: '/player-icons/Player.svg' },
    ],
  },
  {
    group: 'Player actions',
    icons: [
      { name: 'Sounds Like', src: '/player-actions/SoundsLike.svg' },
      { name: 'Favorite', src: '/player-actions/Favorite.svg' },
      { name: 'Upload', src: '/player-actions/Upload.svg' },
      { name: 'Add', src: '/player-actions/Add.svg' },
      { name: 'Download', src: '/player-actions/Download.svg' },
    ],
  },
];
