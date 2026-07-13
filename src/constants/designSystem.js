import { PROFILE_COLORS } from './profileColors';
import { CSS_VARS } from './theme';
import { VIEWPORT_BREAKPOINTS } from './layout';

function formatBreakpointMinWidth(minWidth) {
  return minWidth === 0 ? '0px' : `${minWidth}px`;
}

const VIEWPORT_BREAKPOINT_USAGE = {
  xsmall:
    'Smallest phones. Tighter mobile hero copy, narrow notification layouts, and extra-compact spacing below 390px.',
  small:
    'Primary mobile layout (390–768px). Hamburger header, project mobile hero, compact track rows, stacked panels, and mobile account/notifications patterns.',
  medium:
    'Tablet and small desktop (768–1024px). Transitional layouts: project card stacking, filters column behavior, and condensed track/toolbar patterns.',
  large:
    'Standard desktop (1024–1440px). Default sidebar + main content, full track rows, projects panel column layout, and desktop account tabs.',
  'x-large':
    'Wide desktop (1440–1920px). Roomier project cards, wider multiselect toolbars, and layouts that use additional horizontal space before the wide header tier.',
  xxlarge:
    'Large screens (1920–2560px). Inline header navigation (no hamburger), wide projects panel inline nav, and layouts tuned for large displays.',
  '2560+':
    'Ultra-wide displays (2560px and above). Maximum content width and spacing for very large monitors.',
};

/** Viewport tiers + component-specific container queries for the design system page. */
export const DESIGN_SYSTEM_BREAKPOINTS = [
  {
    group: 'Viewport breakpoints',
    items: VIEWPORT_BREAKPOINTS.map((bp) => ({
      name: bp.name,
      token: bp.token,
      minWidth: formatBreakpointMinWidth(bp.minWidth),
      usage: VIEWPORT_BREAKPOINT_USAGE[bp.name],
    })),
  },
  {
    group: 'Container & component queries',
    items: [
      {
        name: 'Track actions — expanded icons',
        token: 'TRACK_ACTIONS_EXPAND_MIN_CONTAINER',
        minWidth: '1101px',
        note: '@container app-content',
        usage: 'Track rows show all inline action icons; below this, actions collapse to the … menu.',
      },
      {
        name: 'Track actions — tight toolbar',
        token: null,
        minWidth: '≤1100px',
        note: '@container app-content',
        usage: 'Stem row action layout compresses.',
      },
      {
        name: 'Selection bar — icon-only actions',
        token: null,
        minWidth: '≤1076px',
        note: '@container app-content',
        usage: 'Multiselect toolbar action buttons show icons only (labels on hover).',
      },
      {
        name: 'Search home — 3-column carousels',
        token: null,
        minWidth: '≤1200px',
        note: '@container search-home',
        usage: 'Search home carousel grid columns reduce.',
      },
      {
        name: 'Search home — 2-column carousels',
        token: null,
        minWidth: '≤900px',
        note: '@container search-home',
        usage: 'Search home carousel grid to two columns.',
      },
      {
        name: 'Search home — single column',
        token: null,
        minWidth: '≤640px',
        note: '@container search-home',
        usage: 'Search home carousel cards stack in one column.',
      },
    ],
  },
];

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
    group: 'Brand',
    swatches: [
      {
        name: 'Red (brand)',
        token: CSS_VARS.accent.red,
      },
      {
        name: 'Red hover',
        token: CSS_VARS.accent.redHover,
      },
    ],
  },
  {
    group: 'Accents',
    swatches: [
      {
        name: 'Blue',
        token: CSS_VARS.accent.blue,
        usage: {
          dark: ['Reserved token — not currently used in UI'],
          light: ['Reserved token — not currently used in UI'],
        },
      },
      {
        name: 'Links (dark)',
        token: CSS_VARS.text.link,
        themeValue: 'dark',
        usage: {
          dark: [
            'Inline links and highlighted text',
            'Sounds Like button label color (.btn-sounds-like)',
            'Track dropdown open label background',
          ],
          light: [],
        },
      },
      {
        name: 'Select state (dark)',
        token: CSS_VARS.surface.selected,
        themeValue: 'dark',
        usage: {
          dark: ['Selected track rows, folders, and notifications'],
          light: [],
        },
      },
      {
        name: 'Select state (light)',
        token: CSS_VARS.surface.selected,
        themeValue: 'light',
        usage: {
          dark: [],
          light: ['Selected track rows, folders, and notifications'],
        },
      },
    ],
  },
  {
    group: 'Sounds Like',
    swatches: [
      {
        name: 'Sounds Like (light / dark)',
        token: CSS_VARS.accent.soundsLike,
        usage: {
          dark: [
            'Primary Sounds Like purple — promo buttons, add buttons, SOUNDS LIKE tag badge',
            'Player waveform selection borders, handles, and option chip',
            'Track row waveform outline and highlight accent',
          ],
          light: [
            'Primary Sounds Like purple — promo buttons, add buttons, SOUNDS LIKE tag badge',
            'Player waveform selection borders, handles, and option chip',
            'Track row waveform outline and highlight accent',
          ],
        },
      },
      {
        name: 'Sounds Like hover (light / dark)',
        value: '#6F1AAD',
        usage: {
          dark: [
            'Hover state for Sounds Like promo buttons (.sounds-like-box .btn-sounds-like)',
            'Hover state for Sounds Like panel add buttons (.sounds-like-track-add)',
          ],
          light: [
            'Hover state for Sounds Like promo buttons (.sounds-like-box .btn-sounds-like)',
            'Hover state for Sounds Like panel add buttons (.sounds-like-track-add)',
          ],
        },
      },
      {
        name: 'Sounds Like surface (dark)',
        value: '#312739',
        themeValue: 'dark',
        usage: {
          dark: [
            'Sounds Like panel track row backgrounds',
            'Project page Sounds Like promo box fill',
            'Mobile project hero Sounds Like promo fill',
          ],
          light: [],
        },
      },
      {
        name: 'Sounds Like surface (light)',
        value: '#F7EBFF',
        themeValue: 'light',
        usage: {
          dark: [],
          light: [
            'Sounds Like panel track row backgrounds',
            'Project page Sounds Like promo box fill',
            'Mobile project hero Sounds Like promo fill',
          ],
        },
      },
      {
        name: 'Enter highlight flash (light / dark)',
        value: 'rgba(132, 31, 204, 0.55)',
        usage: {
          dark: [
            'Brief flash overlay when a track is added to the list from Sounds Like (.track-row-enter-highlight-flash)',
          ],
          light: [
            'Brief flash overlay when a track is added to the list from Sounds Like (.track-row-enter-highlight-flash)',
          ],
        },
      },
      {
        name: 'Waveform selection tint (light / dark)',
        value: 'rgba(132, 31, 204, 0.3)',
        usage: {
          dark: [
            'Sounds Like waveform selection fill in the audio player',
            'Track waveform Sounds Like overlay fill',
          ],
          light: [
            'Sounds Like waveform selection fill in the audio player',
            'Track waveform Sounds Like overlay fill',
          ],
        },
      },
    ],
  },
  {
    group: 'Neutrals',
    sections: [
      {
        title: 'Dark mode',
        swatches: [
          {
            name: 'Black',
            token: CSS_VARS.bg.chrome,
            themeValue: 'dark',
            usage: {
              dark: [
                'Header, sidebar, dropdown surfaces',
                'Body/html background',
                'Strong borders and dividers',
              ],
              light: [],
            },
          },
          {
            name: 'Gray 900',
            token: CSS_VARS.bg.card,
            themeValue: 'dark',
            usage: { dark: ['Card backgrounds'], light: [] },
          },
          {
            name: 'Gray 850',
            token: CSS_VARS.bg.elevated,
            themeValue: 'dark',
            usage: { dark: ['Elevated surfaces and overlays'], light: [] },
          },
          {
            name: 'Gray 800',
            token: CSS_VARS.bg.page,
            themeValue: 'dark',
            usage: { dark: ['Main page background'], light: [] },
          },
          {
            name: 'Gray 750',
            token: CSS_VARS.bg.nested,
            themeValue: 'dark',
            usage: { dark: ['Nested panels, design system muted surfaces'], light: [] },
          },
          {
            name: 'Gray 700',
            token: CSS_VARS.border.default,
            themeValue: 'dark',
            usage: { dark: ['Default borders, table dividers, panel outlines'], light: [] },
          },
          {
            name: 'Gray 650',
            token: CSS_VARS.surface.default,
            themeValue: 'dark',
            chipBorderToken: CSS_VARS.bg.elevated,
            usage: {
              dark: [
                'Account cards and default UI surfaces (--account-surface, --surface-default)',
                'Raised surfaces (--surface-raised): expanded parent track when stems are open, nested stem rows, stems select-all bar',
                'Side panel token (--bg-panel)',
                'Muted inset surfaces (--surface-muted)',
                'Comments panel input fields',
                'Track comment compose backgrounds',
                'Sounds Like source stack hover labels',
              ],
              light: [],
            },
          },
          {
            name: 'Gray 600',
            token: CSS_VARS.surface.playing,
            themeValue: 'dark',
            chipBorderToken: CSS_VARS.bg.elevated,
            usage: {
              dark: [
                'Playing track and stem row backgrounds (--surface-playing)',
              ],
              light: [],
            },
          },
          {
            name: 'Gray 550',
            token: CSS_VARS.surface.hover,
            themeValue: 'dark',
            usage: { dark: ['Row hover states, icon button hover backgrounds'], light: [] },
          },
          {
            name: 'Gray 480',
            token: '--scrollbar-thumb',
            themeValue: 'dark',
            usage: { dark: ['Scrollbar thumbs'], light: [] },
          },
          {
            name: 'Gray 450',
            token: CSS_VARS.cta.secondaryBg,
            themeValue: 'dark',
            usage: { dark: ['Secondary CTA buttons, panel close buttons'], light: [] },
          },
          {
            name: 'Gray 400',
            token: CSS_VARS.text.muted,
            themeValue: 'dark',
            usage: { dark: ['Muted labels, timestamps, de-emphasized copy'], light: [] },
          },
          {
            name: 'Gray 380',
            token: CSS_VARS.account.surfaceBorder,
            value: '#808080',
            usage: {
              dark: ['Account dropdown strokes, form borders'],
              light: ['Account dropdown strokes, form borders'],
            },
          },
          {
            name: 'Gray 360',
            token: CSS_VARS.text.section,
            themeValue: 'dark',
            usage: { dark: ['Section labels, tab inactive text, column headers'], light: [] },
          },
          {
            name: 'Gray 320',
            token: CSS_VARS.text.secondary,
            themeValue: 'dark',
            usage: { dark: ['Secondary body text'], light: [] },
          },
        ],
      },
      {
        title: 'Light mode',
        swatches: [
          {
            name: 'Gray 250',
            token: CSS_VARS.bg.chrome,
            themeValue: 'light',
            usage: { dark: [], light: ['Header, sidebar, search field background'] },
          },
          {
            name: 'Gray 220',
            token: CSS_VARS.border.default,
            themeValue: 'light',
            usage: { dark: [], light: ['Borders and dividers'] },
          },
          {
            name: 'Gray 180',
            token: CSS_VARS.surface.playing,
            themeValue: 'light',
            usage: { dark: [], light: ['Playing track and stem row backgrounds (--surface-playing)'] },
          },
          {
            name: 'Gray 180 (account)',
            token: CSS_VARS.account.surface,
            themeValue: 'light',
            usage: { dark: [], light: ['Account card surfaces'] },
          },
          {
            name: 'Gray 160',
            token: CSS_VARS.surface.hover,
            themeValue: 'light',
            usage: { dark: [], light: ['Row hover states'] },
          },
          {
            name: 'Gray 140',
            token: CSS_VARS.bg.nested,
            themeValue: 'light',
            usage: { dark: [], light: ['Nested backgrounds, muted surfaces'] },
          },
          {
            name: 'White',
            token: CSS_VARS.bg.page,
            themeValue: 'light',
            usage: {
              dark: ['Primary text color'],
              light: ['Page background', 'Checkbox checked fill', 'Dropdown surfaces'],
            },
          },
        ],
      },
    ],
  },
  {
    group: 'Profile avatars',
    swatches: Object.entries(PROFILE_COLORS).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      token: `--profile-${name}`,
      value,
      usage: {
        dark: [
          `Notification avatar circles for ${name} profile color`,
          'Assigned by initials in getProfileColorVar()',
        ],
        light: [
          `Notification avatar circles for ${name} profile color`,
          'Assigned by initials in getProfileColorVar()',
        ],
      },
    })),
  },
];

/** Track row / stem play control — red circle (on) and triangle-only (off). */
export const ICON_PLAY_IN_CIRCLE_ON = '/icons/PlayinCircle.svg';
export const ICON_PLAY_IN_CIRCLE_OFF = '/icons/PlayinCircle-Off.svg';
export const ICON_PAUSE_IN_CIRCLE = '/icons/PauseinCircle.svg';

export const ICON_SHARE = '/icons/Upload.svg';
export const ICON_COPY = '/icons/copy.svg';
export const ICON_ADD = '/icons/add.svg';
export const ICON_MOVE_TO = '/icons/moveTo.svg';
export const ICON_DOWNLOAD = '/icons/download.svg';
export const ICON_FAVORITE = '/icons/favorite.svg';
export const ICON_FAVORITE_OUTLINE = '/player-actions/Favorite.svg';
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
export const ICON_FOLDER_FILLED = '/icons/folder-filled.svg';
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

/** Design system page tabs — one panel per tab. */
export const DESIGN_SYSTEM_TABS = [
  { id: 'typography', label: 'Typography' },
  { id: 'colors', label: 'Colors' },
  { id: 'icons', label: 'Icons' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'elements', label: 'Elements' },
  { id: 'layout', label: 'Layout & spacing' },
  { id: 'breakpoints', label: 'Breakpoints' },
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
      { name: 'Folder (filled)', src: ICON_FOLDER_FILLED },
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
