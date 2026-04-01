/** Initial rows for the Sounds Like right panel (Add moves a copy to the main track list). */
export const SOUNDS_LIKE_PANEL_INITIAL_ITEMS = [
  { id: 'sl-0', title: 'Rocking the Stadium', waveformIndex: 0 },
  { id: 'sl-1', title: 'Signature Bend SFX 16 Freq', waveformIndex: 1 },
  { id: 'sl-2', title: 'Resolution Across Time', waveformIndex: 2 },
  { id: 'sl-3', title: 'Meet the Players', waveformIndex: 3 },
  { id: 'sl-4', title: 'Farewell Mon Amour', waveformIndex: 0 },
  { id: 'sl-5', title: 'Rocking the Stadium', waveformIndex: 1 },
];

const SOUNDS_LIKE_TITLE_POOL = [
  'Midnight Drive',
  'Arena Pulse',
  'Neon Sideline',
  'Fourth Quarter Rise',
  'Crowd Surge',
  'Locker Room Echo',
  'Halftime Heat',
  'Victory Lap Brass',
  'Underdog Theme',
  'Broadcast Sting A',
  'Broadcast Sting B',
  'Pregame Tension',
  'Overtime Strings',
  'Field Goal Fanfare',
  'Touchdown Synth',
  'Sideline Shuffle',
  'Press Box Pulse',
  'Replay Rise',
  'Championship Keys',
  'Tunnel Walk',
  'Hype Loop 808',
  'Ambient Stadium',
  'Drumline Break',
  'Synth Anthem Edit',
  'Narrative Underscore',
  'Cue Sheet C',
  'Riser Build 16',
  'Drop Zone',
  'Final Whistle',
  'Post-Game Fade',
];

function pickRandomTitles(count) {
  const shuffled = [...SOUNDS_LIKE_TITLE_POOL].sort(() => Math.random() - 0.5);
  if (count <= shuffled.length) return shuffled.slice(0, count);
  const out = [];
  let i = 0;
  while (out.length < count) {
    out.push(shuffled[i % shuffled.length]);
    i += 1;
  }
  return out;
}

/**
 * Creates Sounds Like panel rows with optional enter animation (same opacity ramp as main list).
 * @param {number} count
 * @param {string} idPrefix
 * @param {{ animateEnter?: boolean }} [options]
 */
export function createSoundsLikeItems(count, idPrefix, options = {}) {
  const { animateEnter = true } = options;
  const titles = pickRandomTitles(count);
  const base = Date.now();
  return titles.map((title, i) => ({
    id: `${idPrefix}-${base}-${i}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    waveformIndex: i % 4,
    ...(animateEnter ? { animateEnter: true } : {}),
  }));
}
