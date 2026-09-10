import { TRACK_THUMBNAILS } from '../components/trackThumb';

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
  { id: 'members', value: 30, label: 'Active Members', trend: 12.9, trendDirection: 'up' },
  { id: 'searches', value: 325, label: 'Recent Searches', trend: 5.6, trendDirection: 'up' },
  { id: 'auditions', value: 2682, label: 'Recent Auditions', trend: -1.9, trendDirection: 'down' },
  { id: 'projects', value: 62, label: 'Recent Projects', trend: 122.9, trendDirection: 'up' },
];

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date) {
  const day = startOfDay(date);
  day.setHours(23, 59, 59, 999);
  return day;
}

function hoursAgo(hours) {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export function getAdminActivityDateRange(filterId, customRange = {}) {
  const now = new Date();

  switch (filterId) {
    case 'today':
      return { start: startOfDay(now), end: now };
    case 'this-week': {
      const start = startOfDay(now);
      start.setDate(start.getDate() - start.getDay());
      return { start, end: now };
    }
    case 'last-30-days':
      return { start: daysAgo(30), end: now };
    case 'year-to-date':
      return { start: new Date(now.getFullYear(), 0, 1), end: now };
    case 'custom': {
      const { start, end } = customRange;
      if (!start) return null;
      return {
        start: startOfDay(start),
        end: end ? endOfDay(end) : endOfDay(start),
      };
    }
    default:
      return { start: daysAgo(30), end: now };
  }
}

export function isWithinAdminActivityDateRange(date, range) {
  if (!range?.start || !date) return true;
  const time = date.getTime();
  return time >= range.start.getTime() && time <= range.end.getTime();
}

function getAdminActivityPeriodScale(filterId, range) {
  if (filterId === 'today') return 0.06;
  if (filterId === 'this-week') return 0.28;
  if (filterId === 'last-30-days') return 1;
  if (filterId === 'year-to-date') {
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    return Math.max(1, dayOfYear / 30);
  }
  if (filterId === 'custom' && range?.start && range?.end) {
    const days = Math.max(
      1,
      Math.round((startOfDay(range.end) - startOfDay(range.start)) / 86400000) + 1
    );
    return Math.min(4, days / 30);
  }
  return 1;
}

export function getAdminActivityTrendPeriodLabel(filterId) {
  switch (filterId) {
    case 'today':
      return 'vs yesterday';
    case 'this-week':
      return 'vs last week';
    case 'year-to-date':
      return 'vs last year';
    case 'custom':
      return 'vs prior period';
    default:
      return 'vs last month';
  }
}

function formatAdminActivityStatValue(id, value) {
  if (id === 'members' || id === 'projects') {
    return String(value);
  }
  return value.toLocaleString('en-US');
}

export function getAdminActivityStatsForRange(filterId, customRange, users) {
  const range = getAdminActivityDateRange(filterId, customRange);
  const activeMembersInRange = users.filter(
    (user) => user.status === 'active' && isWithinAdminActivityDateRange(user.activityAt, range)
  ).length;
  const scale = getAdminActivityPeriodScale(filterId, range);

  return ADMIN_ACTIVITY_STATS.map((stat) => {
    if (stat.id === 'members') {
      return {
        ...stat,
        value: formatAdminActivityStatValue(stat.id, activeMembersInRange),
        trend: filterId === 'today' ? 4.2 : stat.trend,
        trendDirection: filterId === 'today' ? 'up' : stat.trendDirection,
      };
    }

    const scaledValue = Math.max(1, Math.round(stat.value * scale));
    const scaledTrend = Number((stat.trend * (filterId === 'today' ? 0.35 : 0.65)).toFixed(1));

    return {
      ...stat,
      value: formatAdminActivityStatValue(stat.id, scaledValue),
      trend: Math.abs(scaledTrend) < 0.1 ? stat.trend : scaledTrend,
      trendDirection: scaledTrend < 0 ? 'down' : stat.trendDirection,
    };
  });
}

export function filterAdminActivityUsersByDate(users, filterId, customRange) {
  const range = getAdminActivityDateRange(filterId, customRange);
  return users.filter((user) => isWithinAdminActivityDateRange(user.activityAt, range));
}

export function filterAdminActivityDownloadsByDate(downloads, filterId, customRange) {
  const range = getAdminActivityDateRange(filterId, customRange);
  return downloads.filter((download) => isWithinAdminActivityDateRange(download.downloadedAt, range));
}

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

const ADMIN_ACTIVITY_RECENT_ACTION_PREFIXES = [
  'Created a project',
  'Audition songs',
  'Searched catalog',
  'Updated a project',
  'Last login',
];

const ADMIN_ACTIVITY_RECENT_TIME_PERIODS = [
  '3 hours ago',
  '5 hours ago',
  '6 hours ago',
  '1 day ago',
  '2 days ago',
  '4 days ago',
  '1 week ago',
  '2 weeks ago',
];

function adminActivityUserEmail(name) {
  return `${name.toLowerCase().replace(/\s+/g, '')}@ucla.edu`;
}

function getAdminActivityRecentAction(index) {
  const prefix =
    ADMIN_ACTIVITY_RECENT_ACTION_PREFIXES[index % ADMIN_ACTIVITY_RECENT_ACTION_PREFIXES.length];
  const time =
    ADMIN_ACTIVITY_RECENT_TIME_PERIODS[
      Math.floor(index / ADMIN_ACTIVITY_RECENT_ACTION_PREFIXES.length) %
        ADMIN_ACTIVITY_RECENT_TIME_PERIODS.length
    ];
  return `${prefix} ${time}`;
}

const ADMIN_ACTIVITY_USER_ACTIVITY_OFFSETS = [
  { hours: 2 },
  { hours: 3 },
  { hours: 5 },
  { hours: 6 },
  { hours: 8 },
  { days: 1 },
  { days: 2 },
  { days: 3 },
  { days: 4 },
  { days: 5 },
  { days: 6 },
  { days: 8 },
  { days: 10 },
  { days: 12 },
  { days: 14 },
  { days: 16 },
  { days: 18 },
  { days: 20 },
  { days: 22 },
  { days: 24 },
  { days: 26 },
  { days: 28 },
  { days: 32 },
  { days: 38 },
  { days: 45 },
  { days: 52 },
  { days: 60 },
  { days: 75 },
  { days: 90 },
  { days: 120 },
];

function getAdminActivityUserActivityDate(index) {
  const offset = ADMIN_ACTIVITY_USER_ACTIVITY_OFFSETS[index] ?? { days: 30 + index };
  if (offset.hours != null) return hoursAgo(offset.hours);
  return daysAgo(offset.days);
}

export const ADMIN_ACTIVITY_USERS = ADMIN_ACTIVITY_USER_SEEDS.map((seed, index) => ({
  id: `activity-user-${index + 1}`,
  initials: seed.initials,
  name: seed.name,
  email: adminActivityUserEmail(seed.name),
  recentActivity: getAdminActivityRecentAction(index),
  status: seed.status,
  activityAt: getAdminActivityUserActivityDate(index),
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

const ADMIN_ACTIVITY_DOWNLOAD_OFFSETS = [
  { hours: 2 },
  { hours: 18 },
  { days: 2 },
  { days: 4 },
  { days: 12 },
  { days: 20 },
  { days: 35 },
  { days: 90 },
];

function getAdminActivityDownloadDate(index) {
  const offset = ADMIN_ACTIVITY_DOWNLOAD_OFFSETS[index] ?? { days: 30 + index * 7 };
  if (offset.hours != null) return hoursAgo(offset.hours);
  return daysAgo(offset.days);
}

export const ADMIN_ACTIVITY_DOWNLOADS = ADMIN_ACTIVITY_DOWNLOAD_SAMPLES.map((download, index) => ({
  id: `download-${index + 1}`,
  thumbSrc: TRACK_THUMBNAILS[index % TRACK_THUMBNAILS.length],
  downloadedAt: getAdminActivityDownloadDate(index),
  ...download,
}));
