import { TRACK_THUMBNAILS } from '../components/trackThumb';

export const ADMIN_ACTIVITY_USER_STATUS_FILTERS = [
  { id: 'active', label: 'Active Members' },
  { id: 'pending', label: 'Pending Members' },
  { id: 'archived', label: 'Archived Members' },
];

export const ADMIN_ACTIVITY_DEFAULT_USER_STATUS_FILTERS = ['active', 'pending'];

export function getAdminActivityMemberStatusFilterLabel(selectedStatuses) {
  if (selectedStatuses.size === ADMIN_ACTIVITY_USER_STATUS_FILTERS.length) {
    return 'Members: All';
  }

  const checkedLabels = ADMIN_ACTIVITY_USER_STATUS_FILTERS.filter((option) =>
    selectedStatuses.has(option.id)
  ).map((option) => option.label.replace(' Members', ''));

  if (checkedLabels.length === 0) {
    return 'Members: None';
  }

  return `Members: ${checkedLabels.join(', ')}`;
}

export const ADMIN_ACTIVITY_DATE_FILTERS = [
  { id: 'today', label: 'Today' },
  { id: 'this-week', label: 'This week' },
  { id: 'last-30-days', label: 'Last 30 days' },
  { id: 'year-to-date', label: 'Year to Date' },
  { id: 'custom', label: 'Custom Date' },
];

export const ADMIN_ACTIVITY_DEFAULT_DATE_FILTER = 'last-30-days';

export const ADMIN_ACTIVITY_USER_LIST_FILTERS = [
  { id: 'all', label: 'All members' },
  { id: 'active', label: 'Active members' },
  { id: 'pending', label: 'Pending members' },
  { id: 'archived', label: 'Archived members' },
];

export const ADMIN_ACTIVITY_DEFAULT_USER_LIST_FILTER = 'all';

export const ADMIN_ACTIVITY_USER_LIST_SORTS = [
  { id: 'most-active', label: 'Most active', directional: true },
  { id: 'name', label: 'Name', directional: true },
  { id: 'last-login', label: 'Last login', directional: true },
];

export const ADMIN_ACTIVITY_USER_SORT_DIRECTION_LABELS = {
  'most-active': { asc: 'Least active', desc: 'Most active' },
  name: { asc: 'A to Z', desc: 'Z to A' },
  'last-login': { asc: 'Oldest', desc: 'Newest' },
};

export const ADMIN_ACTIVITY_DEFAULT_USER_LIST_SORT = {
  field: 'most-active',
  direction: 'desc',
};

export const ADMIN_ACTIVITY_DOWNLOAD_LIST_FILTERS = [
  { id: 'all', label: 'All downloads' },
  { id: 'tracks', label: 'Tracks' },
  { id: 'albums', label: 'Albums' },
];

export const ADMIN_ACTIVITY_DEFAULT_DOWNLOAD_LIST_FILTER = 'all';

export const ADMIN_ACTIVITY_DOWNLOAD_LIST_SORTS = [
  { id: 'most-recent', label: 'Most recent', directional: true },
  { id: 'title', label: 'Title', directional: true },
  { id: 'code', label: 'Track code', directional: true },
];

export const ADMIN_ACTIVITY_DOWNLOAD_SORT_DIRECTION_LABELS = {
  'most-recent': { asc: 'Oldest', desc: 'Newest' },
  title: { asc: 'A to Z', desc: 'Z to A' },
  code: { asc: 'A to Z', desc: 'Z to A' },
};

export const ADMIN_ACTIVITY_DEFAULT_DOWNLOAD_LIST_SORT = {
  field: 'most-recent',
  direction: 'desc',
};

export function getAdminActivitySortActiveLabel(value, options) {
  const option = options.find(({ id }) => id === value.field);
  return option?.label ?? '';
}

export const ADMIN_ACTIVITY_USER_MORE_ACTIONS = [
  { id: 'activity', label: 'Activity' },
  { id: 'edit', label: 'Edit' },
  { id: 'archive', label: 'Archive' },
];

export const ADMIN_ACTIVITY_STATS = [
  { id: 'members', value: '30', label: 'Active Members', trend: 12.9, trendDirection: 'up' },
  { id: 'searches', value: '325', label: 'Recent Searches', trend: 5.6, trendDirection: 'up' },
  { id: 'auditions', value: '2682', label: 'Recent Auditions', trend: -1.9, trendDirection: 'down' },
  { id: 'projects', value: '62', label: 'Recent Projects', trend: 122.9, trendDirection: 'up' },
];

const ADMIN_ACTIVITY_USER_SEEDS = [
  { name: 'Matthew Robinson', initials: 'MR', status: 'active' },
  { name: 'Sarah Chen', initials: 'SC', status: 'active' },
  { name: 'James Wilson', initials: 'JW', status: 'pending' },
  { name: 'Emily Davis', initials: 'ED', status: 'active' },
  { name: 'Michael Brown', initials: 'MB', status: 'archived' },
  { name: 'Olivia Martinez', initials: 'OM', status: 'active' },
  { name: 'Sarah Reed', initials: 'SR', status: 'active' },
  { name: 'Jordan Lee', initials: 'JL', status: 'active' },
  { name: 'Daniel Kim', initials: 'DK', status: 'active' },
  { name: 'Ava Wright', initials: 'AW', status: 'active' },
  { name: 'Taylor Ross', initials: 'TR', status: 'active' },
  { name: 'Emily Chen', initials: 'EC', status: 'active' },
  { name: 'Marcus Johnson', initials: 'MJ', status: 'pending' },
  { name: 'Priya Patel', initials: 'PP', status: 'active' },
  { name: 'Noah Martinez', initials: 'NM', status: 'active' },
  { name: 'Olivia Nguyen', initials: 'ON', status: 'pending' },
  { name: 'Liam Foster', initials: 'LF', status: 'active' },
  { name: 'Hannah Brooks', initials: 'HB', status: 'active' },
  { name: 'Ethan Moore', initials: 'EM', status: 'active' },
  { name: 'Sophia Turner', initials: 'ST', status: 'active' },
  { name: 'Lucas Gray', initials: 'LG', status: 'active' },
  { name: 'Mia Coleman', initials: 'MC', status: 'pending' },
  { name: 'Nathan Price', initials: 'NP', status: 'active' },
  { name: 'Grace Sullivan', initials: 'GS', status: 'active' },
  { name: 'Ryan Cooper', initials: 'RC', status: 'archived' },
  { name: 'Chloe Bennett', initials: 'CB', status: 'active' },
  { name: 'Andrew Hayes', initials: 'AH', status: 'active' },
  { name: 'Zoe Mitchell', initials: 'ZM', status: 'active' },
  { name: 'Caleb Ortiz', initials: 'CO', status: 'pending' },
  { name: 'Lily Washington', initials: 'LW', status: 'active' },
];

const ADMIN_ACTIVITY_LAST_LOGINS = [
  'Last login 3 hours ago',
  'Last login 5 hours ago',
  'Last login 6 hours ago',
  'Last login 1 day ago',
  'Last login 2 days ago',
  'Last login 4 days ago',
  'Last login 1 week ago',
  'Last login 2 weeks ago',
];

function adminActivityUserEmail(name) {
  return `${name.toLowerCase().replace(/\s+/g, '')}@ucla.edu`;
}

export const ADMIN_ACTIVITY_USERS = ADMIN_ACTIVITY_USER_SEEDS.map((seed, index) => ({
  id: `activity-user-${index + 1}`,
  initials: seed.initials,
  name: seed.name,
  email: adminActivityUserEmail(seed.name),
  lastLogin: ADMIN_ACTIVITY_LAST_LOGINS[index % ADMIN_ACTIVITY_LAST_LOGINS.length],
  status: seed.status,
}));

const ADMIN_ACTIVITY_DOWNLOAD_SAMPLES = [
  { title: 'Rocking the Stadium', code: 'ROCK-0231 #1', type: 'track', sortOrder: 1 },
  { title: 'Midnight Drive', code: 'MD-0892 #3', type: 'track', sortOrder: 2 },
  { title: 'City Lights', code: 'CL-0144 #2', type: 'album', sortOrder: 3 },
  { title: 'Horizon Line', code: 'HL-2201 #1', type: 'track', sortOrder: 4 },
  { title: 'Golden Hour', code: 'GH-3310 #5', type: 'album', sortOrder: 5 },
  { title: 'Neon Pulse', code: 'NP-1209 #2', type: 'track', sortOrder: 6 },
  { title: 'Wide Open', code: 'WO-7781 #1', type: 'track', sortOrder: 7 },
  { title: 'Afterglow', code: 'AG-5520 #4', type: 'album', sortOrder: 8 },
];

export const ADMIN_ACTIVITY_DOWNLOADS = ADMIN_ACTIVITY_DOWNLOAD_SAMPLES.map((download, index) => ({
  id: `download-${index + 1}`,
  thumbSrc: TRACK_THUMBNAILS[index % TRACK_THUMBNAILS.length],
  ...download,
}));
