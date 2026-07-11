import { PROFILE_COLORS } from './profileColors';
import { CSS_VARS, THEME_PALETTES } from './theme';

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
      { name: 'Chrome (header/sidebar)', token: CSS_VARS.bg.chrome, value: THEME_PALETTES.dark[CSS_VARS.bg.chrome] },
      { name: 'Page', token: CSS_VARS.bg.page, value: THEME_PALETTES.dark[CSS_VARS.bg.page] },
      { name: 'Page dark (body)', token: CSS_VARS.bg.dark, value: THEME_PALETTES.dark[CSS_VARS.bg.dark] },
      { name: 'Card', token: CSS_VARS.bg.card, value: THEME_PALETTES.dark[CSS_VARS.bg.card] },
      { name: 'Elevated', token: CSS_VARS.bg.elevated, value: THEME_PALETTES.dark[CSS_VARS.bg.elevated] },
      { name: 'Panel / overlay', token: CSS_VARS.bg.panel, value: THEME_PALETTES.dark[CSS_VARS.bg.panel] },
      { name: 'Nested panel', token: CSS_VARS.bg.nested, value: THEME_PALETTES.dark[CSS_VARS.bg.nested] },
    ],
  },
  {
    group: 'Surfaces',
    swatches: [
      { name: 'Default surface', token: CSS_VARS.surface.default, value: THEME_PALETTES.dark[CSS_VARS.surface.default] },
      { name: 'Raised surface', token: CSS_VARS.surface.raised, value: THEME_PALETTES.dark[CSS_VARS.surface.raised] },
      { name: 'Muted surface', token: CSS_VARS.surface.muted, value: THEME_PALETTES.dark[CSS_VARS.surface.muted] },
      { name: 'Hover surface', token: CSS_VARS.surface.hover, value: THEME_PALETTES.dark[CSS_VARS.surface.hover] },
      { name: 'Selected surface', token: CSS_VARS.surface.selected, value: THEME_PALETTES.dark[CSS_VARS.surface.selected] },
    ],
  },
  {
    group: 'Text',
    swatches: [
      { name: 'Primary', token: CSS_VARS.text.primary, value: THEME_PALETTES.dark[CSS_VARS.text.primary] },
      { name: 'Secondary', token: CSS_VARS.text.secondary, value: THEME_PALETTES.dark[CSS_VARS.text.secondary] },
      { name: 'Muted', token: CSS_VARS.text.muted, value: THEME_PALETTES.dark[CSS_VARS.text.muted] },
      { name: 'On chrome', token: CSS_VARS.text.onChrome, value: THEME_PALETTES.dark[CSS_VARS.text.onChrome] },
      { name: 'Section label', token: CSS_VARS.text.section, value: THEME_PALETTES.dark[CSS_VARS.text.section] },
      { name: 'Link / highlight', token: CSS_VARS.text.link, value: THEME_PALETTES.dark[CSS_VARS.text.link] },
    ],
  },
  {
    group: 'Accents',
    swatches: [
      { name: 'Red (brand)', token: CSS_VARS.accent.red, value: THEME_PALETTES.dark[CSS_VARS.accent.red] },
      { name: 'Red hover', token: CSS_VARS.accent.redHover, value: THEME_PALETTES.dark[CSS_VARS.accent.redHover] },
      { name: 'Violet', token: CSS_VARS.accent.purple, value: THEME_PALETTES.dark[CSS_VARS.accent.purple] },
      { name: 'Blue', token: CSS_VARS.accent.blue, value: THEME_PALETTES.dark[CSS_VARS.accent.blue] },
      { name: 'Sounds Like', token: CSS_VARS.accent.soundsLike, value: THEME_PALETTES.dark[CSS_VARS.accent.soundsLike] },
      { name: 'Toggle on', token: CSS_VARS.accent.toggleOn, value: THEME_PALETTES.dark[CSS_VARS.accent.toggleOn] },
    ],
  },
  {
    group: 'CTAs',
    swatches: [
      { name: 'Primary', token: CSS_VARS.cta.primaryBg, value: THEME_PALETTES.dark[CSS_VARS.cta.primaryBg] },
      { name: 'Primary hover', token: CSS_VARS.cta.primaryBgHover, value: THEME_PALETTES.dark[CSS_VARS.cta.primaryBgHover] },
      { name: 'Secondary', token: CSS_VARS.cta.secondaryBg, value: THEME_PALETTES.dark[CSS_VARS.cta.secondaryBg] },
      { name: 'Secondary hover', token: CSS_VARS.cta.secondaryBgHover, value: THEME_PALETTES.dark[CSS_VARS.cta.secondaryBgHover] },
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
      { name: 'Border', token: CSS_VARS.border.default, value: THEME_PALETTES.dark[CSS_VARS.border.default] },
      { name: 'Border strong', token: CSS_VARS.border.strong, value: THEME_PALETTES.dark[CSS_VARS.border.strong] },
      { name: 'Divider', token: CSS_VARS.border.divider, value: THEME_PALETTES.dark[CSS_VARS.border.divider] },
      { name: 'Close button', token: CSS_VARS.control.closeButton, value: THEME_PALETTES.dark[CSS_VARS.control.closeButton] },
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
