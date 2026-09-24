import { TRACK_THUMBNAILS } from '../components/trackThumb';
import { ADMIN_TEAM_DEFAULT_ID, ADMIN_TEAMS } from './adminTeam';

const ADMIN_ACTIVITY_SAMPLE_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

export function adminActivityDownloadToPlayerTrack(item) {
  return {
    id: item.id,
    title: item.title,
    audioUrl: item.audioUrl,
    num: item.sortOrder ?? 1,
  };
}

export const ADMIN_ACTIVITY_DATE_FILTERS = [
  { id: 'today', label: 'Today' },
  { id: 'this-week', label: 'This week' },
  { id: 'last-30-days', label: 'Last 30 days' },
  { id: 'year-to-date', label: 'Year to Date' },
  { id: 'custom', label: 'Custom Date' },
];

export const ADMIN_ACTIVITY_DEFAULT_DATE_FILTER = 'last-30-days';

/** Same teams as Admin → Team title dropdown (`ADMIN_TEAMS`). */
export const ADMIN_ACTIVITY_TEAMS = ADMIN_TEAMS;

export const ADMIN_ACTIVITY_DEFAULT_TEAM_ID = ADMIN_TEAM_DEFAULT_ID;

const ADMIN_ACTIVITY_TEAM_IDS = ADMIN_TEAMS.map((team) => team.id);

function adminActivityTeamIdForIndex(index) {
  return ADMIN_ACTIVITY_TEAM_IDS[index % ADMIN_ACTIVITY_TEAM_IDS.length];
}

export function filterAdminActivityByTeam(items, teamId) {
  if (!teamId) return items;
  return items.filter((item) => item.teamId === teamId);
}

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

export const ADMIN_ACTIVITY_STATS = [
  { id: 'searches', value: 325, label: 'Searches', trend: 5.6, trendDirection: 'up' },
  { id: 'downloads', value: 7, label: 'Downloads', trend: 12.9, trendDirection: 'up' },
  { id: 'auditions', value: 2682, label: 'Auditions', trend: -1.9, trendDirection: 'down' },
  { id: 'projects', value: 62, label: 'Projects', trend: 122.9, trendDirection: 'up' },
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
  if (id === 'downloads' || id === 'projects') {
    return String(value);
  }
  return value.toLocaleString('en-US');
}

function countAdminActivityInDateRange(items, dateKey, range) {
  return items.filter((item) => isWithinAdminActivityDateRange(item[dateKey], range)).length;
}

export function getAdminActivityStatsForRange(filterId, customRange, datasets = {}) {
  const range = getAdminActivityDateRange(filterId, customRange);
  const downloadList = datasets.downloads ?? ADMIN_ACTIVITY_DOWNLOADS;
  const searchList = datasets.searches ?? ADMIN_ACTIVITY_SEARCHES;
  const auditionList = datasets.auditions ?? ADMIN_ACTIVITY_AUDITIONS;
  const projectList = datasets.projects ?? ADMIN_ACTIVITY_PROJECTS;

  const countsByStatId = {
    downloads: countAdminActivityInDateRange(downloadList, 'downloadedAt', range),
    searches: countAdminActivityInDateRange(searchList, 'activityAt', range),
    auditions: countAdminActivityInDateRange(auditionList, 'activityAt', range),
    projects: countAdminActivityInDateRange(projectList, 'activityAt', range),
  };

  return ADMIN_ACTIVITY_STATS.map((stat) => {
    const count = countsByStatId[stat.id] ?? 0;
    return {
      ...stat,
      value: formatAdminActivityStatValue(stat.id, count),
      trend: stat.id === 'downloads' && filterId === 'today' ? 4.2 : stat.trend,
      trendDirection:
        stat.id === 'downloads' && filterId === 'today' ? 'up' : stat.trendDirection,
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

export function filterAdminActivityFeedByDate(items, filterId, customRange) {
  const range = getAdminActivityDateRange(filterId, customRange);
  return items.filter((item) => isWithinAdminActivityDateRange(item.activityAt, range));
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
  teamId: adminActivityTeamIdForIndex(index),
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
  { title: 'Silver Lining', code: 'SL-4410 #2', type: 'track', sortOrder: 9 },
  { title: 'Northbound', code: 'NB-9021 #1', type: 'album', sortOrder: 10 },
];

const ADMIN_ACTIVITY_DOWNLOAD_OFFSETS = [
  { hours: 2 },
  { hours: 18 },
  { days: 2 },
  { days: 4 },
  { days: 12 },
  { days: 20 },
  { days: 28 },
  { days: 35 },
  { days: 45 },
  { days: 60 },
  { days: 90 },
];

const ADMIN_ACTIVITY_FEED_MEMBER_NAMES = [
  'Matthew Robinson',
  'Sarah Chen',
  'Emily Davis',
  'Jordan Lee',
  'Olivia Martinez',
  'Daniel Kim',
  'Ava Wright',
  'Taylor Ross',
  'Priya Patel',
  'Hannah Brooks',
];

const ADMIN_ACTIVITY_FEED_TIME_LABELS = [
  '2 hours ago',
  '4 hours ago',
  '6 hours ago',
  '1 day ago',
  '2 days ago',
  '3 days ago',
  '5 days ago',
  '1 week ago',
  '10 days ago',
  '2 weeks ago',
];

function createAdminActivityFeedItems(type, titles) {
  return titles.map((title, index) => ({
    id: `${type}-${index + 1}`,
    title,
    meta: `${ADMIN_ACTIVITY_FEED_MEMBER_NAMES[index]} · ${ADMIN_ACTIVITY_FEED_TIME_LABELS[index]}`,
    activityAt: getAdminActivityUserActivityDate(index),
  }));
}

const ADMIN_ACTIVITY_SEARCH_ENTRIES = [
  { terms: ['uplifting', 'corporate', 'positive'] },
  { terms: ['dark cinematic', 'trailer', 'hybrid'] },
  { terms: ['acoustic folk', 'instrumental', 'warm'] },
  { terms: ['electronic', 'sports', 'hype', 'stadium'] },
  { terms: ['emotional piano', 'documentary', 'intimate'] },
  { terms: ['funk', 'groove', 'advertising'] },
  { terms: ['ambient', 'meditation', 'beds'] },
  { terms: ['hip hop', 'swagger', 'urban'] },
  { terms: ['orchestral', 'adventure', 'epic'] },
  { terms: ['retro', 'synthwave', '80s'] },
];

export const ADMIN_ACTIVITY_SEARCHES = ADMIN_ACTIVITY_SEARCH_ENTRIES.map((entry, index) => {
  const timeLabel = ADMIN_ACTIVITY_FEED_TIME_LABELS[index];
  return {
    id: `search-${index + 1}`,
    teamId: adminActivityTeamIdForIndex(index),
    terms: entry.terms,
    title: entry.terms.join(' '),
    meta: `${ADMIN_ACTIVITY_FEED_MEMBER_NAMES[index]} · ${timeLabel}`,
    activity: `Searched catalog ${timeLabel}`,
    activityAt: getAdminActivityUserActivityDate(index),
  };
});

const ADMIN_ACTIVITY_PROJECT_TITLES = [
  'Spring Campaign 2026',
  'Documentary Series S2',
  'Brand Refresh Spots',
  'Podcast Intro Package',
  'Stadium Tour Promo',
  'Holiday Retail Push',
  'Product Launch Sizzle',
  'Social Content Q1',
  'Streaming Trailer Cuts',
  'Internal Sizzle Reel',
];

const ADMIN_ACTIVITY_PROJECT_ACTIVITY_PREFIXES = ['Created a project', 'Updated a project'];

export const ADMIN_ACTIVITY_PROJECTS = ADMIN_ACTIVITY_PROJECT_TITLES.map((title, index) => {
  const member = ADMIN_ACTIVITY_FEED_MEMBER_NAMES[index];
  const timeLabel = ADMIN_ACTIVITY_FEED_TIME_LABELS[index];
  const activityPrefix =
    ADMIN_ACTIVITY_PROJECT_ACTIVITY_PREFIXES[index % ADMIN_ACTIVITY_PROJECT_ACTIVITY_PREFIXES.length];
  return {
    id: `project-${index + 1}`,
    teamId: adminActivityTeamIdForIndex(index),
    title,
    member,
    timeLabel,
    meta: `${member} · ${timeLabel}`,
    activity: `${member} · ${activityPrefix} ${timeLabel}`,
    activityAt: getAdminActivityUserActivityDate(index),
  };
});

function getAdminActivityDownloadDate(index) {
  const offset = ADMIN_ACTIVITY_DOWNLOAD_OFFSETS[index] ?? { days: 30 + index * 7 };
  if (offset.hours != null) return hoursAgo(offset.hours);
  return daysAgo(offset.days);
}

function getAdminActivityTrackFeedMeta(index) {
  const member = ADMIN_ACTIVITY_FEED_MEMBER_NAMES[index];
  const timeLabel = ADMIN_ACTIVITY_FEED_TIME_LABELS[index];
  return `${member} · ${timeLabel}`;
}

export const ADMIN_ACTIVITY_DOWNLOADS = ADMIN_ACTIVITY_DOWNLOAD_SAMPLES.map((download, index) => ({
  id: `download-${index + 1}`,
  teamId: adminActivityTeamIdForIndex(index),
  thumbSrc: TRACK_THUMBNAILS[index % TRACK_THUMBNAILS.length],
  downloadedAt: getAdminActivityDownloadDate(index),
  meta: getAdminActivityTrackFeedMeta(index),
  audioUrl: ADMIN_ACTIVITY_SAMPLE_AUDIO,
  ...download,
}));

export const ADMIN_ACTIVITY_AUDITIONS = ADMIN_ACTIVITY_DOWNLOAD_SAMPLES.map((sample, index) => ({
  id: `audition-${index + 1}`,
  teamId: adminActivityTeamIdForIndex(index),
  thumbSrc: TRACK_THUMBNAILS[index % TRACK_THUMBNAILS.length],
  activityAt: getAdminActivityDownloadDate(index),
  title: sample.title,
  code: sample.code,
  sortOrder: sample.sortOrder,
  meta: getAdminActivityTrackFeedMeta(index),
  audioUrl: ADMIN_ACTIVITY_SAMPLE_AUDIO,
}));
