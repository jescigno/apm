export const SEARCH_LAYOUT_TYPES = {
  LIST: 'list',
  GRID: 'grid',
};

export const SEARCH_LIST_LAYOUTS = {
  COMPACT: 'compact',
  DEFAULT: 'default',
  EXPANDED: 'expanded',
};

export const SEARCH_POSTER_SIZES = {
  S: 's',
  M: 'm',
  L: 'l',
};

export const SEARCH_DISPLAY_FIELD_OPTIONS = [
  { id: 'genre', label: 'Genre' },
  { id: 'bpm', label: 'BPM' },
  { id: 'duration', label: 'Duration' },
  { id: 'key', label: 'Key' },
  { id: 'tags', label: 'Tags' },
];

export const DEFAULT_SEARCH_CUSTOMIZE = {
  layoutType: SEARCH_LAYOUT_TYPES.LIST,
  listLayout: SEARCH_LIST_LAYOUTS.DEFAULT,
  posterSize: SEARCH_POSTER_SIZES.M,
  displayFields: {
    genre: true,
    bpm: true,
    duration: true,
    key: false,
    tags: false,
  },
};

export const SEARCH_LIST_LAYOUT_OPTIONS = [
  { id: SEARCH_LIST_LAYOUTS.COMPACT, label: 'Compact' },
  { id: SEARCH_LIST_LAYOUTS.DEFAULT, label: 'Default' },
  { id: SEARCH_LIST_LAYOUTS.EXPANDED, label: 'Expanded' },
];

export const SEARCH_POSTER_SIZE_OPTIONS = [
  { id: SEARCH_POSTER_SIZES.S, label: 'S' },
  { id: SEARCH_POSTER_SIZES.M, label: 'M' },
  { id: SEARCH_POSTER_SIZES.L, label: 'L' },
];

export function getTrackViewModeFromCustomize(customize) {
  if (customize.layoutType === SEARCH_LAYOUT_TYPES.GRID) return 'grid';
  if (customize.listLayout === SEARCH_LIST_LAYOUTS.COMPACT) return 'condensed';
  if (customize.listLayout === SEARCH_LIST_LAYOUTS.EXPANDED) return 'expanded';
  return 'default';
}

export function isCompactListLayout(customize) {
  return (
    customize.layoutType === SEARCH_LAYOUT_TYPES.LIST &&
    customize.listLayout === SEARCH_LIST_LAYOUTS.COMPACT
  );
}
