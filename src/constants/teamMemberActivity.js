export const TEAM_MEMBER_ACTIVITY_STATS = [
  { id: 'searches', value: '16', label: 'Searches' },
  { id: 'auditions', value: '52', label: 'Auditions' },
];

export const TEAM_MEMBER_ACTIVITY_DOWNLOAD_COUNT = 125;

import { TRACK_THUMBNAILS } from '../components/trackThumb';

export const TEAM_MEMBER_ACTIVITY_DOWNLOADS = Array.from({ length: 8 }, (_, index) => ({
  id: `team-member-download-${index + 1}`,
  title: 'Rocking the Stadium',
  code: 'ROCK-0231 #1',
  thumbSrc: TRACK_THUMBNAILS[index % TRACK_THUMBNAILS.length],
}));
