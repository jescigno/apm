const ALBUM_ART = Array.from({ length: 16 }, (_, i) => {
  const index = i + 1;
  const path = `/AlbumArt/AlbumArt-${index}.png`;
  return index >= 11 ? `${path}?v=2` : path;
});

function shuffle(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/** Unique album art within a section (no repeats). */
function pickUniqueAlbumArt(count) {
  return shuffle(ALBUM_ART).slice(0, count);
}

/** Ensure no duplicates within a single project’s 2×2 grid. */
function dedupeWithinGrid(images) {
  const seen = new Set();
  const pool = shuffle(ALBUM_ART);
  let poolIndex = 0;

  return images.map((image) => {
    if (!seen.has(image)) {
      seen.add(image);
      return image;
    }
    while (poolIndex < pool.length && seen.has(pool[poolIndex])) {
      poolIndex += 1;
    }
    const replacement = pool[poolIndex] ?? ALBUM_ART.find((art) => !seen.has(art));
    seen.add(replacement);
    poolIndex += 1;
    return replacement;
  });
}

/**
 * Album art for project grids: repeats are allowed across the section,
 * but the same image won’t appear again within `minGap` slots.
 */
function pickSpacedProjectGridImages(projectCount, imagesPerProject, minGap = 3) {
  const total = projectCount * imagesPerProject;
  const sequence = [];
  const recent = [];

  while (sequence.length < total) {
    const blocked = new Set(recent);
    let candidates = ALBUM_ART.filter((art) => !blocked.has(art));
    if (candidates.length === 0) {
      candidates = ALBUM_ART.filter((art) => art !== recent[recent.length - 1]);
    }
    const pick = shuffle(candidates)[0];
    sequence.push(pick);
    recent.push(pick);
    if (recent.length > minGap) recent.shift();
  }

  return Array.from({ length: projectCount }, (_, index) =>
    dedupeWithinGrid(sequence.slice(index * imagesPerProject, (index + 1) * imagesPerProject))
  );
}

const RECENTLY_PLAYED_ART = pickUniqueAlbumArt(8);
const RECENTLY_PLAYED_ITEMS = [
  { id: 'rp-1', title: 'Rocking the Stadium Live Broadcast Mix', subtitle: '32 minutes ago' },
  { id: 'rp-2', title: 'Victory March Extended Version', subtitle: '3 hours ago' },
  { id: 'rp-3', title: 'Prime Time Sports Highlight Reel', subtitle: '1 day ago' },
  { id: 'rp-4', title: 'Stadium Roar Crowd Anthem', subtitle: '5 days ago' },
  { id: 'rp-5', title: 'Touchdown Charge High Energy', subtitle: '1 week ago' },
  { id: 'rp-6', title: 'Under the Lights Night Game Theme', subtitle: '2 weeks ago' },
  { id: 'rp-7', title: 'Arena Pulse Intro Stinger', subtitle: '3 weeks ago' },
  { id: 'rp-8', title: 'Postgame Victory Lap', subtitle: '1 month ago' },
].map((item, index) => ({ ...item, image: RECENTLY_PLAYED_ART[index] }));

const RECENT_PROJECT_ART = pickSpacedProjectGridImages(5, 4);
const RECENT_PROJECT_ITEMS = [
  { id: 'proj-1', title: 'APM Marketing 2', subtitle: '12 titles' },
  { id: 'proj-2', title: 'Stadium Anthems', subtitle: '8 titles' },
  { id: 'proj-3', title: 'Broadcast Library', subtitle: '24 titles' },
  { id: 'proj-4', title: 'Legacy Campaigns', subtitle: '6 titles' },
  { id: 'proj-5', title: '2026 Milan Olympics Updates', subtitle: '15 titles' },
].map((item, index) => ({ ...item, images: RECENT_PROJECT_ART[index] }));

const TOP_PICKS_ART = pickUniqueAlbumArt(10);
const TOP_PICKS_ITEMS = [
  { id: 'tp-1', title: 'Championship Drive', subtitle: 'FGHT-2219' },
  { id: 'tp-2', title: 'Halftime Hype', subtitle: 'JLMK-8843' },
  { id: 'tp-3', title: 'Crowd Wave', subtitle: 'NPQR-5501' },
  { id: 'tp-4', title: 'Fourth Quarter Surge', subtitle: 'STUV-4420' },
  { id: 'tp-5', title: 'Final Whistle', subtitle: 'WXYZ-9912' },
  { id: 'tp-6', title: 'Kickoff Frenzy', subtitle: 'ABCD-7733' },
  { id: 'tp-7', title: 'Game Day Pulse', subtitle: 'EFGH-1156' },
  { id: 'tp-8', title: 'Overtime Rush', subtitle: 'IJKL-3384' },
  { id: 'tp-9', title: 'Victory Lap', subtitle: 'MNOP-7721' },
  { id: 'tp-10', title: 'Opening Ceremony', subtitle: 'QRST-9044' },
].map((item, index) => ({ ...item, image: TOP_PICKS_ART[index] }));

/** Default center-panel carousels on the Search page (before results). */
export const SEARCH_HOME_CAROUSELS = [
  {
    id: 'recent-searches',
    title: 'Recent Searches',
    variant: 'search',
    items: [
      { id: 'rs-1', label: 'stadium rock anthem for live sports broadcast' },
      { id: 'rs-2', label: 'milan olympics broadcast package music' },
      { id: 'rs-3', label: 'promo 30 second uplifting corporate' },
      { id: 'rs-4', label: 'acoustic indie singer songwriter' },
      { id: 'rs-5', label: 'instrumental only no vocals' },
      { id: 'rs-6', label: 'uplifting orchestral build to climax' },
      { id: 'rs-7', label: 'epic trailer music hybrid orchestral' },
      { id: 'rs-8', label: 'news broadcast bed tension underscore' },
    ],
  },
  {
    id: 'recently-played',
    title: 'Recently Played',
    variant: 'recently-played',
    items: RECENTLY_PLAYED_ITEMS,
  },
  {
    id: 'recent-projects',
    title: 'Recent Projects',
    variant: 'project',
    items: RECENT_PROJECT_ITEMS,
  },
  {
    id: 'featured',
    title: 'Featured',
    variant: 'featured',
    items: [
      {
        id: 'feat-1',
        title: 'Countdown to the World Cup',
        subtitle: 'Curated for live sports',
        image: '/Featured1.png',
      },
      {
        id: 'feat-2',
        title: "Collections Built for America's 250th",
        subtitle: 'Cinematic builds and hits',
        image: '/Featured2.png',
      },
    ],
  },
  {
    id: 'top-picks',
    title: 'Top Picks for You',
    variant: 'track',
    items: TOP_PICKS_ITEMS,
  },
  {
    id: 'playlists-for-you',
    title: 'Playlists Made for You',
    variant: 'playlist',
    items: [
      { id: 'pl-1', title: 'Prime Time Broadcast', subtitle: '32 tracks', accent: '#5b4b8a' },
      { id: 'pl-2', title: 'Acoustic Mornings', subtitle: '18 tracks', accent: '#3d6b5c' },
      { id: 'pl-3', title: 'Epic Trailers', subtitle: '24 tracks', accent: '#8a4b4b' },
      { id: 'pl-4', title: 'Indie Energy', subtitle: '21 tracks', accent: '#4b6a8a' },
      { id: 'pl-5', title: 'Vintage Vault', subtitle: '40 tracks', accent: '#7a6840' },
      { id: 'pl-6', title: 'Sports Highlights', subtitle: '28 tracks', accent: '#6b4b8a' },
    ],
  },
];
