const TEAM_MEMBER_ROWS = [
  { id: 'matthew-robinson', name: 'Matthew Robinson', email: 'matthewrobinson@ucla.edu', lastActive: '16 minutes ago', joinedOn: 'Sept 1, 2026', status: 'Active', initials: 'MR' },
  { id: 'sarah-reed', name: 'Sarah Reed', email: 'sarahreed@ucla.edu', lastActive: '42 minutes ago', joinedOn: 'Aug 28, 2026', status: 'Active', initials: 'SR' },
  { id: 'jordan-lee', name: 'Jordan Lee', email: 'jordanlee@ucla.edu', lastActive: '1 hour ago', joinedOn: 'Aug 15, 2026', status: 'Active', initials: 'JL' },
  { id: 'daniel-kim', name: 'Daniel Kim', email: 'danielkim@ucla.edu', lastActive: '2 hours ago', joinedOn: 'Jul 30, 2026', status: 'Active', initials: 'DK' },
  { id: 'ava-wright', name: 'Ava Wright', email: 'avawright@ucla.edu', lastActive: 'Yesterday', joinedOn: 'Jul 12, 2026', status: 'Active', initials: 'AW' },
  { id: 'taylor-ross', name: 'Taylor Ross', email: 'taylorross@ucla.edu', lastActive: 'Yesterday', joinedOn: 'Jun 24, 2026', status: 'Active', initials: 'TR' },
  { id: 'emily-chen', name: 'Emily Chen', email: 'emilychen@ucla.edu', lastActive: '3 days ago', joinedOn: 'Jun 8, 2026', status: 'Active', initials: 'EC' },
  { id: 'marcus-johnson', name: 'Marcus Johnson', email: 'marcusjohnson@ucla.edu', lastActive: 'Pending invite', joinedOn: 'Sept 4, 2026', status: 'Pending', initials: 'MJ' },
  { id: 'priya-patel', name: 'Priya Patel', email: 'priyapatel@ucla.edu', lastActive: '5 days ago', joinedOn: 'May 19, 2026', status: 'Active', initials: 'PP' },
  { id: 'noah-martinez', name: 'Noah Martinez', email: 'noahmartinez@ucla.edu', lastActive: '1 week ago', joinedOn: 'May 2, 2026', status: 'Active', initials: 'NM' },
  { id: 'olivia-nguyen', name: 'Olivia Nguyen', email: 'olivianguyen@ucla.edu', lastActive: 'Pending invite', joinedOn: 'Sept 3, 2026', status: 'Pending', initials: 'ON' },
  { id: 'liam-foster', name: 'Liam Foster', email: 'liamfoster@ucla.edu', lastActive: '2 weeks ago', joinedOn: 'Apr 14, 2026', status: 'Active', initials: 'LF' },
  { id: 'hannah-brooks', name: 'Hannah Brooks', email: 'hannahbrooks@ucla.edu', lastActive: '3 weeks ago', joinedOn: 'Mar 27, 2026', status: 'Active', initials: 'HB' },
];

/** Cycle design-system profile colors so demo rows are visually distinct. */
const PROFILE_COLOR_CYCLE = ['amber', 'spring', 'cyan', 'magenta', 'rust', 'indigo'];

export const ADMIN_TEAM_MORE_ACTIONS = [
  { id: 'edit', label: 'Edit' },
  { id: 'activity', label: 'Activity' },
  { id: 'archive', label: 'Archive' },
];

export const ADMIN_TEAM_MEMBERS = TEAM_MEMBER_ROWS.map((member, index) => ({
  ...member,
  profileColor: PROFILE_COLOR_CYCLE[index % PROFILE_COLOR_CYCLE.length],
}));
