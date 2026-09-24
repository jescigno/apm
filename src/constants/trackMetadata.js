/** Demo metadata shaped like production track details (used for admin activity info overlay). */
export const TRACK_METADATA_DEMO = {
  title: "It's Time To Rock A",
  albumTitle: "HIP HOP RAP 'N' ROCK",
  catalogLine: '#55 - Main ROCK-0247',
  description:
    "Huge motivational Hybrid Hip Hop/Rock anthem with male rap vocals, Rock guitars and energetic string hook for exciting action and sports. 90 bpm (Bmin) - Suggested for Contemporary Drama",
  trackId: 'SON_ROCK_0247_05501',
  library: 'Rockshop (ROCK)',
  mainGenre: 'Stadium Rock',
  trackType: 'Main',
  duration: '2:15',
  apmReleaseDate: '11/10/2021',
  recordingDate: '9/28/2021',
  isrc: 'DEB632134755',
  genre:
    'Stadium Rock, East Coast Hip Hop, Rap',
  mood:
    'Strong, Determined, Energetic, Anthemic, Inspirational or Motivational, Heavy or Hard, Powerful, Confident, Cool, Gritty, Edgy, Intense, Exciting, Driving, Aggressive, Bold, Swagger, Urban, Hip Hop, Rap, Rock, Hybrid, Sports, Action',
  moodPreview:
    'Strong, Determined, Energetic, Anthemic, Inspirational or Motivational, Heavy or...',
  tempo: '-',
  character: 'Gritty',
  movements: '-',
  instruments: 'Strings, Electric Guitar, Guitar',
  musicFor:
    'Urban Drama, Police, Legal & Courtroom Drama, Baseball, Documentary (Music For)',
  voices: 'Male',
  musicWithFx: '',
  lyricsSubject: '',
  musicalForm: '',
  bpm: '90',
  flags: [
    { label: 'Instrumental Only', yes: false },
    { label: 'Vintage Style', yes: false },
    { label: 'Has Stems', yes: true },
    { label: 'Stems Unavailable', yes: false },
    { label: 'Has lyrics', yes: true },
    { label: 'Archival Recording', yes: false },
    { label: 'Trailer Track', yes: false },
    { label: 'Solo', yes: false },
    { label: 'Well known Tune', yes: false },
    { label: 'Artist-Driven', yes: false },
    { label: 'Explicit lyrics', yes: false },
    { label: 'Amateur or Poorly Played', yes: false },
    { label: 'National Anthem', yes: false },
  ],
  composer: 'Michael Alan Raphael (ASCAP) 100%, IPI 129131694',
  publisher: 'Sonoton APM (ASCAP) 100%, IPI 443476156',
  publishingCopyText:
    'Composer: Michael Alan Raphael (ASCAP) 100%, IPI 129131694\nPublisher: Sonoton APM (ASCAP) 100%, IPI 443476156',
};

export function getTrackMetadataForAdminDownload(download) {
  if (!download) return { ...TRACK_METADATA_DEMO };

  const code = download.code ?? '';
  const catalogMatch = code.match(/([A-Z]+-\d+)/i);
  const catalogId = catalogMatch ? catalogMatch[1].toUpperCase() : 'ROCK-0247';

  return {
    ...TRACK_METADATA_DEMO,
    title: download.title ?? TRACK_METADATA_DEMO.title,
    thumbSrc: download.thumbSrc,
    catalogLine: code ? `#55 - Main ${catalogId}` : TRACK_METADATA_DEMO.catalogLine,
    trackId: `SON_${catalogId.replace('-', '_')}_05501`,
  };
}
