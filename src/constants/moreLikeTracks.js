const SAMPLE_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

/** Track counts per More Like subfolder. */
export const MORE_LIKE_FOLDER_TRACK_COUNTS = {
  'ml-bib-0227-01701': 12,
  'ml-bib-0227-02101': 10,
  'ml-cez-0024-01101': 11,
  'ml-cez-0024-01701': 13,
  'ml-cez-0024-01901': 9,
  'ml-cez-0024-02301': 12,
  'ml-cez-0024-02701': 14,
  'ml-rtro-0191-01501': 10,
  'ml-rtro-0191-04801': 11,
};

const TITLE_POOLS = {
  'ml-bib-0227-01701': [
    'Blaze Forward', 'Heat Wave', 'Ignition Run', 'Fire Starter', 'Burn Bright',
    'Flame On', 'Hot Pursuit', 'Spark Rising', 'Inferno Drive', 'Ember Pulse',
    'Torch Anthem', 'Wildfire Groove',
  ],
  'ml-bib-0227-02101': [
    'Level Up', 'Next Phase', 'Higher Ground', 'Peak Performance', 'Top Tier',
    'Ascend Now', 'Breakthrough', 'Elevate', 'Prime Time', 'Game Changer',
  ],
  'ml-cez-0024-01101': [
    'On the Move', 'Switch On', 'Power Mode', 'Live Wire', 'Active State',
    'Go Time', 'Full Send', 'Locked In', 'Ready Set', 'Momentum On', 'Drive On',
  ],
  'ml-cez-0024-01701': [
    'Love the Beat', 'Feel Good Flow', 'Heart Sync', 'Sweet Groove', 'Good Vibes Only',
    'Sunshine Hook', 'Warm Embrace', 'Golden Love', 'Tender Pulse', 'Joy Ride',
    'Smile Wide', 'Happy Place', 'Pure Affection',
  ],
  'ml-cez-0024-01901': [
    'Name in Lights', 'Claim the Stage', 'Known Entity', 'Signature Sound', 'Main Character',
    'Spotlight On', 'Identity Rise', 'Bold Introduction', 'Recognized',
  ],
  'ml-cez-0024-02301': [
    'Go Mode', 'Full Throttle Go', 'Launch Pad', 'Green Light', 'Pedal Down',
    'Fast Lane', 'No Brake', 'Velocity Go', 'Turbo Start', 'Race Ready',
    'Off the Line', 'Sprint Start',
  ],
  'ml-cez-0024-02701': [
    'Grind Mode', 'Hard Hustle', 'Work Ethic', 'Nonstop Push', 'Relentless Drive',
    'Daily Grind', 'Street Hustle', 'Late Night Grind', 'No Days Off', 'Power Through',
    'Keep Pushing', 'All In', 'Never Settle', 'Overdrive',
  ],
  'ml-rtro-0191-01501': [
    'Court Vision', 'Full Court', 'Ball Game', 'Fast Break', 'Slam Energy',
    'Hoops Anthem', 'Baseline Drive', 'Jump Shot', 'Post Up', 'All Net',
  ],
  'ml-rtro-0191-04801': [
    'Rise Above', 'Stand Up', 'Lift Off', 'Higher Calling', 'Victory Rise',
    'Upward Bound', 'Summit Climb', 'Break Dawn', 'New Horizon', 'Ascension',
    'Skyward',
  ],
};

const DESC_POOL = [
  'Sounds Like match with similar energy, tempo, and instrumental palette to the source track.',
  'Related cue with comparable groove and mood—ideal for alternate edits and cutdowns.',
  'Same sonic family: punchy drums, bold hooks, and broadcast-ready mix.',
  'Matching vibe with tight edit points and a driving rhythmic foundation.',
  'Companion track with aligned instrumentation and comparable intensity.',
  'Similar feel with modern production and clear trailer-style dynamics.',
  'Related bed with overlapping texture and compatible BPM range.',
  'Sounds Like suggestion with parallel energy and mix-forward presentation.',
];

const RECORDED_LABELS = [
  '5/10/2026', '5/11/2026', '5/12/2026', '5/13/2026', '5/14/2026',
  '5/15/2026', '5/08/2026', '5/09/2026', '5/07/2026', '5/06/2026',
  '5/05/2026', '5/04/2026', '5/03/2026', '5/02/2026',
];

const STEMS = [4, 3, 5, 4, 6, 3, 4, 5, 4, 4, 3, 4, 5, 3];

function buildTrackId(folderId, index) {
  const parts = folderId.replace(/^ml-/, '').split('-');
  const prefix = parts.slice(0, 2).join('').toUpperCase().slice(0, 6);
  return `${prefix}-${String(index + 1).padStart(2, '0')}`;
}

function buildTracksForFolder(folderId) {
  const count = MORE_LIKE_FOLDER_TRACK_COUNTS[folderId];
  if (!count) return [];

  const titles = TITLE_POOLS[folderId] ?? [];

  return Array.from({ length: count }, (_, index) => ({
    num: index + 1,
    title: titles[index % titles.length] ?? `Similar Track ${index + 1}`,
    versions: 2 + (index % 3),
    commentCount: index % 5,
    desc: DESC_POOL[index % DESC_POOL.length],
    audioUrl: SAMPLE_AUDIO,
    id: buildTrackId(folderId, index),
    hasLyrics: index % 4 === 0,
    stems: STEMS[index % STEMS.length],
    recorded: RECORDED_LABELS[index % RECORDED_LABELS.length],
    folderId,
  }));
}

const MORE_LIKE_TRACKS_BY_FOLDER = Object.fromEntries(
  Object.keys(MORE_LIKE_FOLDER_TRACK_COUNTS).map((folderId) => [
    folderId,
    buildTracksForFolder(folderId),
  ])
);

/** Returns tracks for a More Like subfolder, or null if not in that set. */
export function getMoreLikeTracksForFolder(folderId) {
  return MORE_LIKE_TRACKS_BY_FOLDER[folderId] ?? null;
}

/** Whether `folderId` is a More Like subfolder with its own track list. */
export function isMoreLikeSubfolder(folderId) {
  return folderId in MORE_LIKE_FOLDER_TRACK_COUNTS;
}
