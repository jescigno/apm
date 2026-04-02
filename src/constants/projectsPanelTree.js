/**
 * Sample folder tree for Projects panel (folders only; max 3 levels of nesting).
 * Each node: { id, name, children?, description?, purpose?, lastUpdated? }
 */
export const PROJECTS_PANEL_FOLDER_TREE = [
  {
    id: 'apm-mkt',
    name: 'APM Marketing 2',
    description: 'Primary marketing initiatives and seasonal campaigns.',
    purpose: 'Brand campaigns',
    lastUpdated: 'Mar 28, 2026',
    children: [
      {
        id: 'milan',
        name: '2026 Milan Olympics Updates',
        description: 'Olympic-themed promos and athlete features.',
        purpose: 'Event tie-ins',
        lastUpdated: 'Mar 27, 2026',
        children: [
          {
            id: 'italy',
            name: 'Winter Olympics 2026 - Contemporary Italy',
            description: 'Music beds for Italy-focused segments.',
            purpose: 'Regional broadcast',
            lastUpdated: 'Mar 25, 2026',
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'stadium',
    name: 'Stadium Anthems',
    description: 'High-energy tracks for arena and stadium use.',
    purpose: 'Live sports',
    lastUpdated: 'Mar 20, 2026',
    children: [
      {
        id: 'nfl',
        name: 'NFL Primetime',
        description: 'Sunday and primetime football packages.',
        purpose: 'NFL broadcast',
        lastUpdated: 'Mar 18, 2026',
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
    children: [],
  },
  {
    id: 'archive-root',
    name: 'Legacy Campaigns',
    description: 'Archived projects retained for reference.',
    purpose: 'Historical',
    lastUpdated: 'Feb 2, 2026',
    children: [
      {
        id: 'legacy-1',
        name: '2024 Archive',
        description: 'Year-end wrap and retrospective content.',
        purpose: 'Archive',
        lastUpdated: 'Jan 10, 2026',
        children: [
          {
            id: 'legacy-1-a',
            name: 'Q4 Highlights',
            description: 'Quarter four highlight reels.',
            purpose: 'Recap',
            lastUpdated: 'Dec 20, 2025',
            children: [],
          },
        ],
      },
    ],
  },
];

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
