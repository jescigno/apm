const SAMPLE_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

/** Track counts per Fresh Fifteen subfolder (each between 5–15). */
export const FRESH_FIFTEEN_FOLDER_TRACK_COUNTS = {
  'fft-drama-romance': 12,
  'fft-sound-design': 8,
  'fft-action-adventure': 15,
  'fft-sci-fi': 11,
  'fft-vocal': 9,
  'fft-hybrid': 14,
  'fft-intros-orchestral-hybrid': 7,
  'fft-intros-piano': 6,
  'fft-comedy': 10,
  'fft-world-influenced': 13,
  'fft-drums-percussion': 5,
  'fft-family-adventure': 12,
  'fft-fantasy': 11,
  'fft-horror': 8,
  'fft-suspense-thriller': 14,
};

const TITLE_POOLS = {
  'fft-drama-romance': [
    'Heartstrings Rising', 'Last Goodbye', 'Tender Horizon', 'Unspoken Promise', 'Fading Light',
    'Golden Hour Waltz', 'Letters Never Sent', 'Moonlit Confession', 'Quiet Devotion', 'Second Chance',
    'Through the Rain', 'Woven Memories', 'Breathless Embrace', 'Echoes of Us', 'Starlit Reverie',
  ],
  'fft-sound-design': [
    'Impact Hit Alpha', 'Riser Tension Build', 'Sub Drop Pulse', 'Whoosh Transition', 'Glitch Stutter',
    'Metallic Clang', 'Reverse Swell', 'Braam Low End', 'Tick Tock Countdown', 'Static Burst',
    'Deep Boom Tail', 'Shimmer Tail', 'Drone Underscore', 'Pulse Alarm', 'Fractured Glass',
  ],
  'fft-action-adventure': [
    'Chase Sequence', 'Rooftop Pursuit', 'Escape Velocity', 'Battle Ready', 'Thunder Run',
    'Adrenaline Surge', 'Breakout Force', 'Cliffhanger Dash', 'Full Throttle', 'Hero Ascending',
    'Impact Zone', 'Last Stand', 'Mission Critical', 'No Retreat', 'Velocity Strike',
  ],
  'fft-sci-fi': [
    'Neon Horizon', 'Orbital Drift', 'Quantum Pulse', 'Synthetic Dawn', 'Deep Space Signal',
    'Gravity Well', 'Hyperlane', 'Machine Awakening', 'Photon Drive', 'Stellar Cartography',
    'Void Walker', 'Cryo Sleep', 'Exoplanet Probe', 'Laser Grid', 'Terraforming',
  ],
  'fft-vocal': [
    'Rise Up Together', 'Carry Me Home', 'Light the Sky', 'Never Look Back', 'Open Your Eyes',
    'Shout It Out', 'Stand Tall', 'Take the Leap', 'Voices United', 'We Are the Fire',
    'Echo Chamber Choir', 'Midnight Serenade', 'Power Anthem', 'Soul on Fire', 'Unbreakable',
  ],
  'fft-hybrid': [
    'Orchestral Impact', 'Brass Meets Beat', 'Cinematic Pulse', 'Epic Hybrid Drive', 'Trailer Forge',
    'Massive Hybrid', 'Percussion Orchestra', 'Rise and Strike', 'Strings and Sub', 'Thunder Hybrid',
    'Dark Hybrid March', 'Hybrid Uprising', 'Power Hybrid', 'Colossal Hybrid', 'Final Hybrid Push',
  ],
  'fft-intros-orchestral-hybrid': [
    'Opening Statement', 'Grand Entrance', 'Main Title Rise', 'Prologue Fanfare', 'Title Sequence',
    'Curtain Rise', 'Logo Sting Hybrid', 'Orchestral Intro', 'Prelude to Action', 'Title Card Hit',
  ],
  'fft-intros-piano': [
    'Soft Opening', 'Gentle Keys', 'Morning Light', 'Piano Prelude', 'Quiet Beginning',
    'Reflective Intro', 'Simple Grace', 'First Notes', 'Warm Piano', 'Opening Reflection',
  ],
  'fft-comedy': [
    'Silly Walk', 'Bouncy Mishap', 'Cartoon Caper', 'Quirky Quest', 'Wacky Wheels',
    'Pratfall Parade', 'Goofy Groove', 'Lighthearted Hijinks', 'Comic Timing', 'Playful Pandemonium',
    'Whistle While You Work', 'Zany Zingers', 'Bumbling Along', 'Happy Accident', 'Jolly Japes',
  ],
  'fft-world-influenced': [
    'Desert Caravan', 'Eastern Spice', 'Global Pulse', 'Nomad Rhythm', 'Silk Road',
    'Tribal Fire', 'Andean Sunrise', 'Mediterranean Breeze', 'African Drum Circle', 'Celtic Journey',
    'Flamenco Heat', 'Indian Raga Rise', 'Japanese Koto', 'Latin Heatwave', 'World Fusion',
  ],
  'fft-drums-percussion': [
    'War Drums', 'Tribal Stomp', 'Pulse Kit', 'Percussion Forward', 'Rhythm Assault',
    'Taiko Strike', 'Hand Drum Circle', 'Breakbeat Battery', 'Marching Snare', 'Thunder Perc',
  ],
  'fft-family-adventure': [
    'Wonder Awaits', 'Magic Map', 'Friendly Quest', 'Happy Discovery', 'Imagination Station',
    'Journey Together', 'Playful Explorer', 'Rainbow Trail', 'Secret Treehouse', 'Sunny Adventure',
    'Treasure Hunt', 'Up and Away', 'Wide-Eyed Wonder', 'Young Explorers', 'Zoom and Bloom',
  ],
  'fft-fantasy': [
    'Dragon\'s Lair', 'Enchanted Forest', 'Fairy Tale Rise', 'Kingdom of Light', 'Mystic Portal',
    'Quest of Legends', 'Spellbound', 'Sword and Sorcery', 'Wizard\'s Tower', 'Elven Dawn',
    'Dark Enchantment', 'Heroic Fantasy', 'Magic Awakens', 'Realm Beyond', 'Ancient Prophecy',
  ],
  'fft-horror': [
    'Creeping Dread', 'Dark Corridor', 'Eerie Whisper', 'Haunted Hollow', 'Night Terror',
    'Sinister Pulse', 'Unseen Presence', 'Blood Moon', 'Graveyard Shift', 'Lurking Shadow',
  ],
  'fft-suspense-thriller': [
    'Tension Mounts', 'Edge of Fear', 'Hidden Threat', 'Paranoia Rising', 'Silent Stalker',
    'Countdown Clock', 'Dark Revelation', 'Fractured Trust', 'No Way Out', 'Pulse of Danger',
    'Shadow Pursuit', 'Twisted Truth', 'Unraveling', 'Vanishing Point', 'Zero Hour',
  ],
};

const DESC_POOL = [
  'Cinematic trailer underscore with bold dynamics and a polished, broadcast-ready mix.',
  'Tight rhythmic drive with layered percussion and evolving harmonic tension.',
  'Atmospheric intro building to a powerful, anthemic climax for peak moments.',
  'Hybrid orchestral and electronic textures with punchy hits and wide stereo imaging.',
  'Mood-forward arrangement with clear edit points for teasers and full trailers.',
  'Driving pulse with dramatic swells—ideal for montage and title-card sequences.',
  'Dark, brooding undertones with strategic lifts for reveal and payoff beats.',
  'Bright, energetic production with crisp transients and modern trailer sensibility.',
];

const RECORDED_LABELS = [
  '02/04/2004', '2011', '11/20/2018', '2015', '2019', '03/15/2016', '2020', '2017',
  '10/01/2023', '2014', '2012', '08/12/2019', '2021', '04/22/2021', '2023',
];

const STEMS = [3, 4, 5, 4, 6, 3, 4, 5, 4, 4, 3, 4, 5, 3, 4];

function buildTrackId(folderId, index) {
  const prefix = folderId.replace(/^fft-/, '').slice(0, 3).toUpperCase();
  return `${prefix}-${String(index + 1).padStart(3, '0')}`;
}

function buildTracksForFolder(folderId) {
  const count = FRESH_FIFTEEN_FOLDER_TRACK_COUNTS[folderId];
  if (!count) return [];

  const titles = TITLE_POOLS[folderId] ?? [];

  return Array.from({ length: count }, (_, index) => ({
    num: index + 1,
    title: titles[index % titles.length] ?? `Track ${index + 1}`,
    versions: 2 + (index % 4),
    commentCount: index % 7,
    desc: DESC_POOL[index % DESC_POOL.length],
    audioUrl: SAMPLE_AUDIO,
    id: buildTrackId(folderId, index),
    hasLyrics: folderId === 'fft-vocal' ? index % 2 === 0 : index % 3 === 0,
    stems: STEMS[index % STEMS.length],
    recorded: RECORDED_LABELS[index % RECORDED_LABELS.length],
    folderId,
  }));
}

const FRESH_FIFTEEN_TRACKS_BY_FOLDER = Object.fromEntries(
  Object.keys(FRESH_FIFTEEN_FOLDER_TRACK_COUNTS).map((folderId) => [
    folderId,
    buildTracksForFolder(folderId),
  ])
);

/** Returns tracks for a Fresh Fifteen subfolder, or null if not in that set. */
export function getFreshFifteenTracksForFolder(folderId) {
  return FRESH_FIFTEEN_TRACKS_BY_FOLDER[folderId] ?? null;
}

/** Whether `folderId` is a Fresh Fifteen subfolder with its own track list. */
export function isFreshFifteenSubfolder(folderId) {
  return folderId in FRESH_FIFTEEN_FOLDER_TRACK_COUNTS;
}
