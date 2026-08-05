export const ADMIN_ACTIVITY_USER_STATUS_FILTERS = [
  { id: 'active', label: 'Active Users' },
  { id: 'pending', label: 'Pending Users' },
  { id: 'archived', label: 'Archived Users' },
];

export const ADMIN_ACTIVITY_DEFAULT_USER_STATUS_FILTERS = ['active', 'pending'];

export const ADMIN_ACTIVITY_DATE_FILTERS = [
  { id: 'today', label: 'Today' },
  { id: 'this-week', label: 'This week' },
  { id: 'last-30-days', label: 'Last 30 days' },
  { id: 'year-to-date', label: 'Year to Date' },
  { id: 'custom', label: 'Custom Date' },
];

export const ADMIN_ACTIVITY_DEFAULT_DATE_FILTER = 'last-30-days';

export const ADMIN_ACTIVITY_STATS = [
  { id: 'members', value: '30', label: 'Active Members' },
  { id: 'searches', value: '212', label: 'Recent Searches' },
  { id: 'auditions', value: '1526', label: 'Auditions' },
];

export const ADMIN_ACTIVITY_USERS = [
  {
    id: 'matthew-robinson-1',
    initials: 'MR',
    name: 'Matthew Robinson',
    email: 'matthewrobinson@ucla.edu',
    lastLogin: 'Last login 3 hours ago',
  },
  {
    id: 'matthew-robinson-2',
    initials: 'MR',
    name: 'Matthew Robinson',
    email: 'matthewrobinson@ucla.edu',
    lastLogin: 'Last login 3 hours ago',
  },
  {
    id: 'matthew-robinson-3',
    initials: 'MR',
    name: 'Matthew Robinson',
    email: 'matthewrobinson@ucla.edu',
    lastLogin: 'Last login 3 hours ago',
  },
  {
    id: 'matthew-robinson-4',
    initials: 'MR',
    name: 'Matthew Robinson',
    email: 'matthewrobinson@ucla.edu',
    lastLogin: 'Last login 3 hours ago',
  },
  {
    id: 'matthew-robinson-5',
    initials: 'MR',
    name: 'Matthew Robinson',
    email: 'matthewrobinson@ucla.edu',
    lastLogin: 'Last login 3 hours ago',
  },
  {
    id: 'matthew-robinson-6',
    initials: 'MR',
    name: 'Matthew Robinson',
    email: 'matthewrobinson@ucla.edu',
    lastLogin: 'Last login 3 hours ago',
  },
];

import { TRACK_THUMBNAILS } from '../components/trackThumb';

export const ADMIN_ACTIVITY_DOWNLOADS = Array.from({ length: 8 }, (_, index) => ({
  id: `download-${index + 1}`,
  title: 'Rocking the Stadium',
  code: 'ROCK-0231 #1',
  thumbSrc: TRACK_THUMBNAILS[index % TRACK_THUMBNAILS.length],
}));
