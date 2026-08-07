export const SEARCH_SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
};

export const SEARCH_SORT_OPTIONS = [
  { id: 'random', label: 'Random' },
  { id: 'curated', label: 'Curated' },
  { id: 'relevance', label: 'Relevance' },
  { id: 'release-date', label: 'Release Date', directional: true },
  { id: 'recording-date', label: 'Recording Date', directional: true },
  { id: 'duration', label: 'Duration', directional: true },
  { id: 'album-id', label: 'Album ID', directional: true },
  { id: 'track-id', label: 'Track ID', directional: true },
  { id: 'track-title', label: 'Track Title', directional: true },
];

export const DEFAULT_SEARCH_SORT = {
  field: 'track-title',
  direction: SEARCH_SORT_DIRECTIONS.ASC,
};

export const SEARCH_SORT_DIRECTION_LABELS = {
  'release-date': { asc: 'Old to New', desc: 'New to Old' },
  'recording-date': { asc: 'Old to New', desc: 'New to Old' },
  duration: { asc: 'Low to High', desc: 'High to Low' },
  'album-id': { asc: 'Low to High', desc: 'High to Low' },
  'track-id': { asc: 'Low to High', desc: 'High to Low' },
  'track-title': { asc: 'A to Z', desc: 'Z to A' },
};

export function getSearchSortDirectionLabel(field, direction) {
  const labels = SEARCH_SORT_DIRECTION_LABELS[field];
  if (!labels) return '';
  return direction === SEARCH_SORT_DIRECTIONS.DESC ? labels.desc : labels.asc;
}

export function getSearchSortActiveLabel({ field } = DEFAULT_SEARCH_SORT) {
  const option = SEARCH_SORT_OPTIONS.find(({ id }) => id === field);
  return option?.label ?? '';
}

export function isDirectionalSearchSort(field) {
  return SEARCH_SORT_OPTIONS.some((option) => option.id === field && option.directional);
}
