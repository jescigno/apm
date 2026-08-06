import {
  SEARCH_DISPLAY_FIELD_OPTIONS,
  SEARCH_LAYOUT_TYPES,
  SEARCH_POSTER_SIZES,
} from './searchResultsCustomize';

export const PROJECT_LIST_LAYOUT_OPTIONS = [
  { id: 'condensed', label: 'Condensed' },
  { id: 'simplified', label: 'Simplified' },
  { id: 'expanded', label: 'Expanded' },
];

export const DEFAULT_PROJECT_CUSTOMIZE = {
  layoutType: SEARCH_LAYOUT_TYPES.LIST,
  listLayout: 'expanded',
  posterSize: SEARCH_POSTER_SIZES.M,
  displayFields: {
    genre: true,
    bpm: true,
    duration: true,
    key: false,
    tags: false,
  },
};

export { SEARCH_DISPLAY_FIELD_OPTIONS };

export function getProjectTrackViewMode(customize) {
  if (customize.layoutType === SEARCH_LAYOUT_TYPES.GRID) return 'grid';
  return customize.listLayout;
}

export function isProjectCompactList(customize) {
  return (
    customize.layoutType !== SEARCH_LAYOUT_TYPES.GRID &&
    (customize.listLayout === 'condensed' || customize.listLayout === 'simplified')
  );
}
