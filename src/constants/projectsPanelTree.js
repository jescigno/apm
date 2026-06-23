/**
 * Sample folder tree for Projects panel (folders only; max 3 levels of nesting).
 * Each node: { id, name, children?, description?, purpose?, lastUpdated?, updatedAt? }
 */
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
        trackCount: 0,
        children: [
          {
            id: 'italy',
            name: 'Winter Olympics 2026 - Contemporary Italy',
            description: 'Music beds for Italy-focused segments.',
            purpose: 'Regional broadcast',
            lastUpdated: 'Mar 25, 2026',
            updatedAt: '3/25/2026, 11:42 AM',
            children: [],
          },
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

/** Folder id for the project shown on the Project Details page (has tracks). */
export const CURRENT_PROJECT_FOLDER_ID = 'italy';

/** Top-level folder in the APM Marketing 2 hierarchy (folders only, no tracks). */
export const TOP_LEVEL_PROJECT_FOLDER_ID = 'apm-mkt';

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
  return folderId !== TOP_LEVEL_PROJECT_FOLDER_ID;
}

/** Display label for folder last-updated (prefers `updatedAt`, same as track-list folder rows). */
export function getFolderUpdatedAtLabel(folder) {
  if (!folder) return '—';
  const label = folder.updatedAt ?? folder.lastUpdated;
  return label != null && String(label).trim() !== '' ? String(label) : '—';
}

/** Track count shown on folder rows in the project track list. */
export function getFolderTrackCount(folder, projectTrackCount = 0) {
  if (!folder || folder.id === TOP_LEVEL_PROJECT_FOLDER_ID) return 0;
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
