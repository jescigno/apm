import { FRESH_FIFTEEN_FOLDER_TRACK_COUNTS } from './freshFifteenTracks';
import { MORE_LIKE_FOLDER_TRACK_COUNTS } from './moreLikeTracks';

const FOLDER_UPDATE_DATES = [
  { lastUpdated: 'Mar 23, 2026', updatedAt: '3/23/2026, 10:30 AM' },
  { lastUpdated: 'Mar 22, 2026', updatedAt: '3/22/2026, 2:15 PM' },
  { lastUpdated: 'Mar 21, 2026', updatedAt: '3/21/2026, 9:45 AM' },
  { lastUpdated: 'Mar 20, 2026', updatedAt: '3/20/2026, 4:00 PM' },
  { lastUpdated: 'Mar 19, 2026', updatedAt: '3/19/2026, 11:20 AM' },
  { lastUpdated: 'Mar 18, 2026', updatedAt: '3/18/2026, 1:55 PM' },
  { lastUpdated: 'Mar 17, 2026', updatedAt: '3/17/2026, 8:10 AM' },
  { lastUpdated: 'Mar 16, 2026', updatedAt: '3/16/2026, 3:40 PM' },
  { lastUpdated: 'Mar 15, 2026', updatedAt: '3/15/2026, 10:05 AM' },
  { lastUpdated: 'Mar 14, 2026', updatedAt: '3/14/2026, 5:25 PM' },
  { lastUpdated: 'Mar 13, 2026', updatedAt: '3/13/2026, 9:30 AM' },
  { lastUpdated: 'Mar 12, 2026', updatedAt: '3/12/2026, 2:50 PM' },
  { lastUpdated: 'Mar 11, 2026', updatedAt: '3/11/2026, 11:15 AM' },
  { lastUpdated: 'Mar 10, 2026', updatedAt: '3/10/2026, 4:35 PM' },
  { lastUpdated: 'Mar 9, 2026', updatedAt: '3/9/2026, 8:45 AM' },
  { lastUpdated: 'May 14, 2026', updatedAt: '5/14/2026, 3:20 PM' },
  { lastUpdated: 'May 13, 2026', updatedAt: '5/13/2026, 10:55 AM' },
  { lastUpdated: 'May 12, 2026', updatedAt: '5/12/2026, 1:40 PM' },
  { lastUpdated: 'May 11, 2026', updatedAt: '5/11/2026, 9:10 AM' },
  { lastUpdated: 'May 10, 2026', updatedAt: '5/10/2026, 4:05 PM' },
  { lastUpdated: 'May 9, 2026', updatedAt: '5/9/2026, 11:30 AM' },
  { lastUpdated: 'May 8, 2026', updatedAt: '5/8/2026, 2:00 PM' },
  { lastUpdated: 'May 7, 2026', updatedAt: '5/7/2026, 8:20 AM' },
  { lastUpdated: 'May 6, 2026', updatedAt: '5/6/2026, 5:15 PM' },
];

function folderDates(dateIndex) {
  return FOLDER_UPDATE_DATES[dateIndex % FOLDER_UPDATE_DATES.length];
}

function freshFifteenSubfolder(id, name, trackCount, dateIndex) {
  return {
    id,
    name,
    trackCount,
    children: [],
    ...folderDates(dateIndex),
  };
}

function moreLikeSubfolder(id, name, trackCount, dateIndex) {
  return {
    id,
    name,
    trackCount,
    children: [],
    ...folderDates(dateIndex),
  };
}

function milanSubfolder(id, name, trackCount, dateIndex, description, purpose) {
  return {
    id,
    name,
    trackCount,
    description,
    purpose,
    children: [],
    ...folderDates(dateIndex),
  };
}

export const PROJECTS_PANEL_FOLDER_TREE = [
  {
    id: 'apm-mkt',
    name: 'APM Marketing 2',
    description: 'Primary marketing initiatives and seasonal campaigns.',
    purpose: 'Brand campaigns',
    lastUpdated: 'Mar 28, 2026',
    updatedAt: '3/28/2026, 3:00 PM',
    children: [
      {
        id: 'milan',
        name: '2026 Milan Olympics Updates',
        description: 'Olympic-themed promos and athlete features.',
        purpose: 'Event tie-ins',
        lastUpdated: 'Mar 27, 2026',
        updatedAt: '3/27/2026, 4:15 PM',
        trackCount: 10,
        children: [
          milanSubfolder(
            'italy',
            'Winter Olympics 2026 - Contemporary Italy',
            15,
            0,
            'Music beds for Italy-focused segments.',
            'Regional broadcast'
          ),
          milanSubfolder(
            'milan-opening',
            'Opening Ceremony Highlights',
            10,
            1,
            'Grand opening packages and torch-lighting moments.',
            'Ceremony coverage'
          ),
          milanSubfolder(
            'milan-alpine',
            'Alpine Skiing Coverage',
            12,
            2,
            'Downhill and slalom broadcast beds.',
            'Winter sports'
          ),
          milanSubfolder(
            'milan-figure-skating',
            'Figure Skating Packages',
            9,
            3,
            'Performance underscores and recap themes.',
            'Winter sports'
          ),
          milanSubfolder(
            'milan-hockey',
            'Ice Hockey Broadcast Beds',
            11,
            4,
            'Arena energy and period-break stings.',
            'Winter sports'
          ),
          milanSubfolder(
            'milan-medals',
            'Medal Ceremony Underscores',
            8,
            5,
            'Podium moments and national anthem beds.',
            'Ceremony coverage'
          ),
          milanSubfolder(
            'milan-athletes',
            'Athlete Profile Features',
            14,
            6,
            'Human-interest and backstory packages.',
            'Feature segments'
          ),
          milanSubfolder(
            'milan-closing',
            'Closing Ceremony Mix',
            10,
            7,
            'Finale themes and farewell broadcast cuts.',
            'Ceremony coverage'
          ),
          milanSubfolder(
            'milan-venues',
            'Milano-Cortina Venue Themes',
            13,
            8,
            'Location-specific music for venue bumpers.',
            'Venue branding'
          ),
          milanSubfolder(
            'milan-village',
            'Olympic Village Lifestyle',
            7,
            9,
            'Day-in-the-life and host city atmosphere.',
            'Lifestyle features'
          ),
          milanSubfolder(
            'milan-international',
            'International Broadcast Cuts',
            11,
            10,
            'Global feed transitions and multilingual stings.',
            'International feed'
          ),
        ],
      },
      {
        id: 'spring-campaign',
        name: 'Spring 2026 Brand Campaign',
        description: 'Seasonal brand spots and cross-platform promos.',
        purpose: 'Brand awareness',
        lastUpdated: 'Mar 22, 2026',
        updatedAt: '3/22/2026, 9:30 AM',
        trackCount: 12,
        children: [],
      },
      {
        id: 'social-shorts',
        name: 'Social & Short-Form Content',
        description: 'Music for reels, stories, and vertical video packages.',
        purpose: 'Digital social',
        lastUpdated: 'Mar 19, 2026',
        updatedAt: '3/19/2026, 2:08 PM',
        trackCount: 8,
        children: [],
      },
      {
        id: 'podcast-beds',
        name: 'Podcast & Long-Form Beds',
        description: 'Underscore and intro beds for podcast and streaming series.',
        purpose: 'Long-form audio',
        lastUpdated: 'Mar 14, 2026',
        updatedAt: '3/14/2026, 10:20 AM',
        trackCount: 0,
        children: [],
      },
    ],
  },
  {
    id: 'fresh-fifteen',
    name: 'Fresh Fifteen Trailer Tracks',
    description: 'Curated trailer music organized by mood and genre.',
    purpose: 'Trailer production',
    lastUpdated: 'Mar 24, 2026',
    updatedAt: '3/24/2026, 11:00 AM',
    trackCount: 0,
    children: [
      freshFifteenSubfolder('fft-drama-romance', 'Drama & Romance', FRESH_FIFTEEN_FOLDER_TRACK_COUNTS['fft-drama-romance'], 0),
      freshFifteenSubfolder('fft-sound-design', 'Sound Design', FRESH_FIFTEEN_FOLDER_TRACK_COUNTS['fft-sound-design'], 1),
      freshFifteenSubfolder('fft-action-adventure', 'Action Adventure', FRESH_FIFTEEN_FOLDER_TRACK_COUNTS['fft-action-adventure'], 2),
      freshFifteenSubfolder('fft-sci-fi', 'Sci-Fi', FRESH_FIFTEEN_FOLDER_TRACK_COUNTS['fft-sci-fi'], 3),
      freshFifteenSubfolder('fft-vocal', 'Vocal', FRESH_FIFTEEN_FOLDER_TRACK_COUNTS['fft-vocal'], 4),
      freshFifteenSubfolder('fft-hybrid', 'Hybrid', FRESH_FIFTEEN_FOLDER_TRACK_COUNTS['fft-hybrid'], 5),
      freshFifteenSubfolder('fft-intros-orchestral-hybrid', 'Intros - Orchestral / Hybrid', FRESH_FIFTEEN_FOLDER_TRACK_COUNTS['fft-intros-orchestral-hybrid'], 6),
      freshFifteenSubfolder('fft-intros-piano', 'Intros - Piano', FRESH_FIFTEEN_FOLDER_TRACK_COUNTS['fft-intros-piano'], 7),
      freshFifteenSubfolder('fft-comedy', 'Comedy', FRESH_FIFTEEN_FOLDER_TRACK_COUNTS['fft-comedy'], 8),
      freshFifteenSubfolder('fft-world-influenced', 'World-Influenced', FRESH_FIFTEEN_FOLDER_TRACK_COUNTS['fft-world-influenced'], 9),
      freshFifteenSubfolder('fft-drums-percussion', 'Drums & Percussion', FRESH_FIFTEEN_FOLDER_TRACK_COUNTS['fft-drums-percussion'], 10),
      freshFifteenSubfolder('fft-family-adventure', 'Family Adventure', FRESH_FIFTEEN_FOLDER_TRACK_COUNTS['fft-family-adventure'], 11),
      freshFifteenSubfolder('fft-fantasy', 'Fantasy', FRESH_FIFTEEN_FOLDER_TRACK_COUNTS['fft-fantasy'], 12),
      freshFifteenSubfolder('fft-horror', 'Horror', FRESH_FIFTEEN_FOLDER_TRACK_COUNTS['fft-horror'], 13),
      freshFifteenSubfolder('fft-suspense-thriller', 'Suspense & Thriller', FRESH_FIFTEEN_FOLDER_TRACK_COUNTS['fft-suspense-thriller'], 14),
    ],
  },
  {
    id: 'more-like-tracks',
    name: 'APM Music - More like Tracks 5.15.26',
    description: 'Sounds Like collections grouped by source track.',
    purpose: 'Sounds Like',
    lastUpdated: 'May 15, 2026',
    updatedAt: '5/15/2026, 12:00 PM',
    children: [
      moreLikeSubfolder('ml-bib-0227-01701', "More like BIB_BIB_0227_01701 I'm Fire", MORE_LIKE_FOLDER_TRACK_COUNTS['ml-bib-0227-01701'], 15),
      moreLikeSubfolder('ml-bib-0227-02101', 'More like BIB_BIB_0227_02101 Next Level', MORE_LIKE_FOLDER_TRACK_COUNTS['ml-bib-0227-02101'], 16),
      moreLikeSubfolder('ml-cez-0024-01101', "More Like CEZ_ISCS_0024_01101 I'm On", MORE_LIKE_FOLDER_TRACK_COUNTS['ml-cez-0024-01101'], 17),
      moreLikeSubfolder('ml-cez-0024-01701', "More Like CEZ_ISCS_0024_01701 Got to Love it", MORE_LIKE_FOLDER_TRACK_COUNTS['ml-cez-0024-01701'], 18),
      moreLikeSubfolder('ml-cez-0024-01901', 'More like CEZ_ISCS_0024_01901 Know My Name', MORE_LIKE_FOLDER_TRACK_COUNTS['ml-cez-0024-01901'], 19),
      moreLikeSubfolder('ml-cez-0024-02301', "More Like CEZ_ISCS_0024_02301 I'm on Go", MORE_LIKE_FOLDER_TRACK_COUNTS['ml-cez-0024-02301'], 20),
      moreLikeSubfolder('ml-cez-0024-02701', 'More Like CEZ_ISCS_0024_02701 Hustle Hard', MORE_LIKE_FOLDER_TRACK_COUNTS['ml-cez-0024-02701'], 21),
      moreLikeSubfolder('ml-rtro-0191-01501', 'More like RTRO_RTRO_0191_01501 Ball Out', MORE_LIKE_FOLDER_TRACK_COUNTS['ml-rtro-0191-01501'], 22),
      moreLikeSubfolder('ml-rtro-0191-04801', 'More like RTRO_RTRO_0191_04801 Rise Up', MORE_LIKE_FOLDER_TRACK_COUNTS['ml-rtro-0191-04801'], 23),
    ],
  },
  {
    id: 'stadium',
    name: 'Stadium Anthems',
    description: 'High-energy tracks for arena and stadium use.',
    purpose: 'Live sports',
    lastUpdated: 'Mar 20, 2026',
    updatedAt: '3/20/2026, 1:45 PM',
    children: [
      {
        id: 'nfl',
        name: 'NFL Primetime',
        description: 'Sunday and primetime football packages.',
        purpose: 'NFL broadcast',
        lastUpdated: 'Mar 18, 2026',
        updatedAt: '3/18/2026, 11:20 AM',
        children: [],
      },
    ],
  },
  {
    id: 'broadcast',
    name: 'Broadcast Library',
    description: 'General-purpose broadcast and production cues.',
    purpose: 'Daily production',
    lastUpdated: 'Mar 15, 2026',
    updatedAt: '3/15/2026, 9:10 AM',
    children: [],
  },
  {
    id: 'empty-project',
    name: 'Empty Project',
    description: '',
    purpose: '',
    lastUpdated: 'Mar 24, 2026',
    updatedAt: '3/24/2026, 9:00 AM',
    trackCount: 0,
    children: [],
  },
  {
    id: 'archive-root',
    name: 'Legacy Campaigns',
    description: 'Archived projects retained for reference.',
    purpose: 'Historical',
    lastUpdated: 'Feb 2, 2026',
    updatedAt: '2/2/2026, 4:30 PM',
    children: [
      {
        id: 'legacy-1',
        name: '2024 Archive',
        description: 'Year-end wrap and retrospective content.',
        purpose: 'Archive',
        lastUpdated: 'Jan 10, 2026',
        updatedAt: '1/10/2026, 10:15 AM',
        children: [
          {
            id: 'legacy-1-a',
            name: 'Q4 Highlights',
            description: 'Quarter four highlight reels.',
            purpose: 'Recap',
            lastUpdated: 'Dec 20, 2025',
            updatedAt: '12/20/2025, 2:50 PM',
            children: [],
          },
        ],
      },
    ],
  },
];

/** Folder id for the 2026 Milan Olympics Updates parent (subfolders only, no tracks). */
export const MILAN_UPDATES_FOLDER_ID = 'milan';

/** Folder id for the project shown on the Project Details page (has tracks). */
export const CURRENT_PROJECT_FOLDER_ID = 'italy';

/** Top-level folder in the APM Marketing 2 hierarchy (folders only, no tracks). */
export const TOP_LEVEL_PROJECT_FOLDER_ID = 'apm-mkt';

/** Top-level Fresh Fifteen project (folders only, no tracks). */
export const FRESH_FIFTEEN_ROOT_FOLDER_ID = 'fresh-fifteen';

/** Empty project with no subfolders or tracks. */
export const EMPTY_PROJECT_FOLDER_ID = 'empty-project';

/** Top-level More Like Tracks project (subfolders only at root). */
export const MORE_LIKE_ROOT_FOLDER_ID = 'more-like-tracks';

/** Whether a folder belongs to the Fresh Fifteen hierarchy (no demo tracks). */
export function isFreshFifteenFolder(folderId) {
  const path = getFolderPath(PROJECTS_PANEL_FOLDER_TREE, folderId);
  return path[0]?.id === FRESH_FIFTEEN_ROOT_FOLDER_ID;
}

/** Whether a folder belongs to the More Like Tracks hierarchy. */
export function isMoreLikeFolder(folderId) {
  const path = getFolderPath(PROJECTS_PANEL_FOLDER_TREE, folderId);
  return path[0]?.id === MORE_LIKE_ROOT_FOLDER_ID;
}

/** Find a folder node by id anywhere in the tree. */
export function findFolderById(tree, targetId) {
  for (const node of tree) {
    if (node.id === targetId) return node;
    if (Array.isArray(node.children) && node.children.length > 0) {
      const found = findFolderById(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

/** Direct child folders of `folderId`, or [] if none / not found. */
export function getFolderChildren(tree, folderId) {
  const folder = findFolderById(tree, folderId);
  return Array.isArray(folder?.children) ? folder.children : [];
}

/** Path from root to `targetId` (inclusive), or [] if not found. */
export function getFolderPath(tree, targetId) {
  const path = [];

  function walk(nodes, acc) {
    for (const node of nodes) {
      const next = [...acc, node];
      if (node.id === targetId) {
        path.push(...next);
        return true;
      }
      if (Array.isArray(node.children) && node.children.length > 0 && walk(node.children, next)) {
        return true;
      }
    }
    return false;
  }

  walk(tree, []);
  return path;
}

/** Whether the folder shows a project track list (all except the top-level folder). */
export function folderHasProjectTracks(folderId) {
  if (
    folderId === TOP_LEVEL_PROJECT_FOLDER_ID ||
    folderId === FRESH_FIFTEEN_ROOT_FOLDER_ID ||
    folderId === MORE_LIKE_ROOT_FOLDER_ID ||
    folderId === EMPTY_PROJECT_FOLDER_ID
  ) {
    return false;
  }
  return true;
}

/** Display label for folder last-updated (prefers `updatedAt`, same as track-list folder rows). */
export function getFolderUpdatedAtLabel(folder) {
  if (!folder) return '—';
  const label = folder.updatedAt ?? folder.lastUpdated;
  return label != null && String(label).trim() !== '' ? String(label) : '—';
}

/** Track count shown on folder rows in the project track list. */
export function getFolderTrackCount(folder, projectTrackCount = 0) {
  if (
    !folder ||
    folder.id === TOP_LEVEL_PROJECT_FOLDER_ID ||
    folder.id === FRESH_FIFTEEN_ROOT_FOLDER_ID ||
    folder.id === MORE_LIKE_ROOT_FOLDER_ID ||
    folder.id === EMPTY_PROJECT_FOLDER_ID
  ) {
    return 0;
  }
  if (folder.trackCount != null) return folder.trackCount;
  return projectTrackCount;
}

/** Returns ancestor folder ids that must be expanded to reveal `targetId`. */
export function getFolderAncestorIds(tree, targetId) {
  const ancestors = [];

  function walk(nodes, path) {
    for (const node of nodes) {
      const nextPath = [...path, node.id];
      if (node.id === targetId) {
        ancestors.push(...path);
        return true;
      }
      if (Array.isArray(node.children) && node.children.length > 0 && walk(node.children, nextPath)) {
        return true;
      }
    }
    return false;
  }

  walk(tree, []);
  return ancestors;
}

/** Source filter keys for the headline dropdown */
export const PROJECTS_PANEL_SOURCES = [
  { id: 'myProjects', label: 'My Projects' },
  { id: 'sent', label: 'Sent' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'archive', label: 'Archives' },
  { id: 'deleted', label: 'Deleted' },
];

/**
 * Wide panel: horizontal source links (no dropdown). Order and labels match product spec.
 */
export const PROJECTS_PANEL_INLINE_NAV = [
  { id: 'myProjects', label: 'My Projects' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'sent', label: 'Sent' },
  { id: 'archive', label: 'Archive' },
];

/** Folder row ⋯ overflow menu (labels only; wire actions in app when needed). */
export const PROJECTS_PANEL_FOLDER_MORE_ACTIONS = [
  { id: 'view', label: 'View Project' },
  { id: 'editDetails', label: 'Edit Project Details' },
  { id: 'send', label: 'Send Project' },
  { id: 'download', label: 'Download' },
  { id: 'copy', label: 'Copy' },
  { id: 'moveTo', label: 'Move To' },
  { id: 'newSubProject', label: 'New Sub-Project' },
  { id: 'archive', label: 'Archive' },
  { id: 'delete', label: 'Delete' },
];
