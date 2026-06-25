import { MILAN_UPDATES_FOLDER_ID } from './projectsPanelTree';

const SAMPLE_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

const MILAN_UPDATES_TRACK_TITLES = [
  'Torch Relay Anthem',
  'Medal Moment Rise',
  'Stadium Pulse Milano',
  'Alpine Summit Drive',
  'Podium Glory',
  'Olympic Fanfare 2026',
  'Closing Light Parade',
  'Host City Groove',
  'Champion\'s Walk',
  'Broadcast Opener Milano',
];

const MILAN_UPDATES_TRACK_DESCS = [
  'Uplifting orchestral opener built for torch relay and ceremony bumpers.',
  'Triumphant brass and drums for medal moments and athlete features.',
  'High-energy stadium rock with Italian flair for live venue cutaways.',
  'Driving winter sports bed with crisp percussion and bold guitars.',
  'Celebratory theme with wide dynamics for podium and recap packages.',
  'Classic Olympic-style fanfare with modern hybrid production.',
  'Emotional closing ceremony underscore with soaring strings.',
  'Contemporary host-city groove for lifestyle and venue segments.',
  'Victory lap anthem with anthemic hooks and broadcast-ready mix.',
  'Prime-time broadcast opener with punchy hits and tight edit points.',
];

const RECORDED_LABELS = [
  '3/26/2026',
  '3/25/2026',
  '3/24/2026',
  '3/23/2026',
  '3/22/2026',
  '3/21/2026',
  '3/20/2026',
  '3/19/2026',
  '3/18/2026',
  '3/17/2026',
];

const STEMS = [4, 3, 5, 4, 6, 3, 4, 5, 4, 4];

export const MILAN_UPDATES_TRACKS = MILAN_UPDATES_TRACK_TITLES.map((title, index) => ({
  num: index + 1,
  title,
  versions: 2 + (index % 4),
  commentCount: index % 5,
  desc: MILAN_UPDATES_TRACK_DESCS[index],
  audioUrl: SAMPLE_AUDIO,
  id: `MIL-${String(index + 1).padStart(3, '0')}`,
  hasLyrics: index % 3 === 0,
  stems: STEMS[index],
  recorded: RECORDED_LABELS[index],
  folderId: MILAN_UPDATES_FOLDER_ID,
}));

/** Returns the 10 root-level tracks for 2026 Milan Olympics Updates, or null. */
export function getMilanUpdatesTracksForFolder(folderId) {
  if (folderId === MILAN_UPDATES_FOLDER_ID) return MILAN_UPDATES_TRACKS;
  return null;
}
