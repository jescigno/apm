export const PLAYLIST_PREFERENCE_OPTIONS = [
  'Last Modified (Default)',
  'Date Created',
  'Alphabetical',
];

export const SORT_ORDER_OPTIONS = ['Ascending', 'Descending'];

export const DOWNLOAD_FILE_TYPE_OPTIONS = [
  { id: 'mp3-128', label: 'MP3 (128kbps)' },
  { id: 'mp3-320', label: 'MP3 (320kbps)' },
  { id: 'wav-48', label: 'WAV (48kHz)' },
  { id: 'aiff-48', label: 'AIFF (48kHz)' },
  { id: 'metadata-csv', label: 'Metadata.csv' },
  { id: 'include-stems', label: 'Include Stems' },
];

export const DOWNLOAD_DEFAULT_FILE_TYPES = new Set(['mp3-320', 'wav-48', 'include-stems']);

export const DOWNLOAD_FOLDER_OPTIONS = ['None (Default)', 'By Album', 'By Project'];
export const DOWNLOAD_NAMING_OPTIONS = ['None (Default)', 'Track Title', 'Track ID'];

export const SEARCH_DISPLAY_OPTIONS = [
  { id: 'description', label: 'Description' },
  { id: 'genre', label: 'Genre' },
  { id: 'bpm', label: 'BPM' },
  { id: 'time', label: 'Time' },
  { id: 'key', label: 'Key' },
  { id: 'waveform', label: 'Waveform' },
  { id: 'tags', label: 'Tags' },
];

export const SEARCH_DISPLAY_DEFAULT = new Set(['description', 'genre', 'bpm', 'time']);

export const SORT_CRITERIA_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'release-date', label: 'Release Date' },
  { id: 'duration', label: 'Duration' },
  { id: 'track-id', label: 'Track ID' },
  { id: 'library', label: 'Library' },
  { id: 'track-title', label: 'Track Title' },
];

export const SEARCH_RESTRICTION_OPTIONS = [
  { id: 'apm-music', label: 'APM Music' },
  { id: 'apm-canada', label: 'APM Canada' },
  { id: 'morality', label: 'Morality' },
  { id: 'freeform', label: 'Freeform' },
  { id: 'global', label: 'Global' },
  { id: 'adobe', label: 'Adobe' },
  { id: 'facebook', label: 'Facebook' },
];
