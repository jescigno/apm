const FILM_101_FALL_2026_ROWS = [
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

const UCLA_ATHLETICS_ROWS = [
  { id: 'keisha-ward', name: 'Keisha Ward', email: 'keishaward@ucla.edu', lastActive: '8 minutes ago', joinedOn: 'Aug 20, 2026', status: 'Active', initials: 'KW' },
  { id: 'chris-park', name: 'Chris Park', email: 'chrispark@ucla.edu', lastActive: '25 minutes ago', joinedOn: 'Aug 18, 2026', status: 'Active', initials: 'CP' },
  { id: 'mia-santos', name: 'Mia Santos', email: 'miasantos@ucla.edu', lastActive: '3 hours ago', joinedOn: 'Jul 9, 2026', status: 'Active', initials: 'MS' },
  { id: 'owen-brady', name: 'Owen Brady', email: 'owenbrady@ucla.edu', lastActive: 'Yesterday', joinedOn: 'Jun 16, 2026', status: 'Active', initials: 'OB' },
  { id: 'nina-cole', name: 'Nina Cole', email: 'ninacole@ucla.edu', lastActive: '2 days ago', joinedOn: 'May 28, 2026', status: 'Active', initials: 'NC' },
  { id: 'gabe-myers', name: 'Gabe Myers', email: 'gabemyers@ucla.edu', lastActive: 'Pending invite', joinedOn: 'Sept 8, 2026', status: 'Pending', initials: 'GM' },
  { id: 'lucia-ramirez', name: 'Lucia Ramirez', email: 'luciaramirez@ucla.edu', lastActive: '4 days ago', joinedOn: 'Apr 22, 2026', status: 'Active', initials: 'LR' },
];

const DOCUMENTARY_WORKSHOP_ROWS = [
  { id: 'sofia-alvarez', name: 'Sofia Alvarez', email: 'sofia.alvarez@nyu.edu', lastActive: '11 minutes ago', joinedOn: 'Sept 2, 2026', status: 'Active', initials: 'SA' },
  { id: 'ravi-mehta', name: 'Ravi Mehta', email: 'ravi.mehta@nyu.edu', lastActive: '1 hour ago', joinedOn: 'Aug 21, 2026', status: 'Active', initials: 'RM' },
  { id: 'claire-dunn', name: 'Claire Dunn', email: 'claire.dunn@nyu.edu', lastActive: 'Yesterday', joinedOn: 'Aug 4, 2026', status: 'Active', initials: 'CD' },
  { id: 'isaac-brown', name: 'Isaac Brown', email: 'isaac.brown@nyu.edu', lastActive: 'Pending invite', joinedOn: 'Sept 9, 2026', status: 'Pending', initials: 'IB' },
  { id: 'lena-hoffman', name: 'Lena Hoffman', email: 'lena.hoffman@nyu.edu', lastActive: 'Pending invite', joinedOn: 'Sept 10, 2026', status: 'Pending', initials: 'LH' },
];

/** Cycle design-system profile colors so demo rows are visually distinct. */
const PROFILE_COLOR_CYCLE = ['amber', 'spring', 'cyan', 'magenta', 'rust', 'indigo'];

export const ADMIN_TEAM_MORE_ACTIONS = [
  { id: 'edit', label: 'Edit' },
  { id: 'activity', label: 'Activity' },
  { id: 'archive', label: 'Archive' },
];

export const ADMIN_TEAM_BULK_ACTIONS = [{ id: 'archive', label: 'Archive' }];

export const ADMIN_TEAM_SORT_COLUMNS = [
  { id: 'name', label: 'Team member' },
  { id: 'email', label: 'Email address' },
  { id: 'lastActive', label: 'Last active' },
  { id: 'joinedOn', label: 'Joined on' },
  { id: 'status', label: 'Status' },
];

export const ADMIN_TEAM_DEFAULT_SORT = { field: 'name', direction: 'asc' };

export function archiveTeamMembers(members, ids) {
  const idSet = ids instanceof Set ? ids : new Set(Array.isArray(ids) ? ids : [ids]);
  return members.map((member) =>
    idSet.has(member.id) ? { ...member, status: 'Archived' } : member
  );
}

function decorateTeamMembers(rows) {
  return rows.map((member, index) => ({
    ...member,
    profileColor: PROFILE_COLOR_CYCLE[index % PROFILE_COLOR_CYCLE.length],
  }));
}

export const ADMIN_TEAMS = [
  { id: 'film-101-fall-2026', label: 'Film 101 Fall 2026' },
  { id: 'ucla-athletics', label: 'UCLA Athletics' },
  { id: 'documentary-workshop', label: 'Documentary Workshop' },
];

export const ADMIN_TEAM_DEFAULT_ID = 'film-101-fall-2026';

export const ADMIN_TEAM_MEMBERS_BY_ID = {
  'film-101-fall-2026': decorateTeamMembers(FILM_101_FALL_2026_ROWS),
  'ucla-athletics': decorateTeamMembers(UCLA_ATHLETICS_ROWS),
  'documentary-workshop': decorateTeamMembers(DOCUMENTARY_WORKSHOP_ROWS),
};

export const ADMIN_TEAM_MEMBERS = ADMIN_TEAM_MEMBERS_BY_ID[ADMIN_TEAM_DEFAULT_ID];

export const ADMIN_TEAM_ADD_DEFAULT_SUBJECT = 'Music from [Sender_name]: Shared Tracks';

export const ADMIN_TEAM_BULK_IMPORT_TEMPLATE_FILENAME = 'team-members-template.csv';

export const ADMIN_TEAM_BULK_IMPORT_TEMPLATE = `First Name,Last Name,Email
Jane,Doe,jane.doe@example.com
`;

const JOINED_ON_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

function splitCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

function normalizeHeader(value) {
  return value.toLowerCase().replace(/[\s_-]/g, '');
}

export function initialsFromName(name, email) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  if (parts.length === 1 && parts[0][0]) return parts[0].slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export function splitMemberName(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export const ADMIN_TEAM_EDIT_STATUSES = ['Active', 'Pending'];

export function applyTeamMemberEdits(member, { firstName, lastName, email, status }) {
  const name = [firstName, lastName].map((part) => String(part || '').trim()).filter(Boolean).join(' ');
  const nextEmail = String(email || '').trim().toLowerCase();
  const nextStatus = ADMIN_TEAM_EDIT_STATUSES.includes(status) ? status : member.status;
  return {
    ...member,
    name: name || member.name,
    email: nextEmail || member.email,
    initials: initialsFromName(name || member.name, nextEmail || member.email),
    status: nextStatus,
    lastActive: nextStatus === 'Pending' ? 'Pending invite' : member.lastActive,
  };
}

export function formatTeamJoinedOn(date = new Date()) {
  return `${JOINED_ON_MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function lastActiveRank(value) {
  const text = String(value || '').toLowerCase();
  if (text.includes('pending')) return Number.POSITIVE_INFINITY;
  if (text === 'yesterday') return 24 * 60;
  const minutes = text.match(/(\d+)\s+minutes?\s+ago/);
  if (minutes) return Number(minutes[1]);
  const hours = text.match(/(\d+)\s+hours?\s+ago/);
  if (hours) return Number(hours[1]) * 60;
  const days = text.match(/(\d+)\s+days?\s+ago/);
  if (days) return Number(days[1]) * 24 * 60;
  const weeks = text.match(/(\d+)\s+weeks?\s+ago/);
  if (weeks) return Number(weeks[1]) * 7 * 24 * 60;
  return Number.POSITIVE_INFINITY;
}

function joinedOnTime(value) {
  const match = String(value || '').match(/^([A-Za-z]+)\s+(\d+),\s+(\d{4})$/);
  if (!match) return 0;
  const month = JOINED_ON_MONTHS.findIndex((name) => name.toLowerCase() === match[1].toLowerCase());
  if (month < 0) return 0;
  return new Date(Number(match[3]), month, Number(match[2])).getTime();
}

function compareTeamMembers(a, b, field) {
  if (field === 'lastActive') return lastActiveRank(a.lastActive) - lastActiveRank(b.lastActive);
  if (field === 'joinedOn') return joinedOnTime(a.joinedOn) - joinedOnTime(b.joinedOn);
  return String(a[field] || '').localeCompare(String(b[field] || ''), undefined, { sensitivity: 'base' });
}

export function sortTeamMembers(members, { field = 'name', direction = 'asc' } = ADMIN_TEAM_DEFAULT_SORT) {
  const next = [...members];
  next.sort((a, b) => {
    const result = compareTeamMembers(a, b, field);
    if (result !== 0) return direction === 'desc' ? -result : result;
    return String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' });
  });
  return next;
}

export function parseTeamImportCsv(text) {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { rows: [], error: 'This file is empty.' };
  }

  const parsed = lines.map(splitCsvLine);
  const header = parsed[0].map(normalizeHeader);
  const looksLikeHeader = header.some((cell) =>
    ['email', 'emailaddress', 'firstname', 'lastname', 'name', 'fullname'].includes(cell)
  );

  let emailIdx = header.findIndex((cell) => cell === 'email' || cell === 'emailaddress');
  let firstIdx = header.findIndex((cell) => cell === 'firstname' || cell === 'first');
  let lastIdx = header.findIndex((cell) => cell === 'lastname' || cell === 'last');
  let nameIdx = header.findIndex((cell) => cell === 'name' || cell === 'fullname');

  const dataRows = looksLikeHeader ? parsed.slice(1) : parsed;
  if (!looksLikeHeader) {
    emailIdx = parsed[0].findIndex((cell) => cell.includes('@'));
    if (emailIdx < 0) emailIdx = Math.max(parsed[0].length - 1, 0);
    if (parsed[0].length >= 3) {
      firstIdx = 0;
      lastIdx = 1;
    } else if (parsed[0].length === 2) {
      nameIdx = 0;
    }
  }

  const rows = [];
  const seen = new Set();

  dataRows.forEach((cols) => {
    const email = (cols[emailIdx] || '').trim().toLowerCase();
    if (!email.includes('@') || seen.has(email)) return;
    seen.add(email);

    const firstName = firstIdx >= 0 ? (cols[firstIdx] || '').trim() : '';
    const lastName = lastIdx >= 0 ? (cols[lastIdx] || '').trim() : '';
    const nameFromCol = nameIdx >= 0 ? (cols[nameIdx] || '').trim() : '';
    const name = nameFromCol || [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];

    rows.push({ email, firstName, lastName, name });
  });

  if (!rows.length) {
    return { rows: [], error: 'No valid email addresses found in this file.' };
  }

  return { rows, error: null };
}

export function membersFromImportRows(rows, existingMembers = []) {
  const existingEmails = new Set(existingMembers.map((member) => member.email.toLowerCase()));
  const startIndex = existingMembers.length;

  return rows
    .filter((row) => !existingEmails.has(row.email))
    .map((row, index) => ({
      id: `imported-${row.email.replace(/[^a-z0-9]+/g, '-')}`,
      name: row.name,
      email: row.email,
      lastActive: 'Pending invite',
      joinedOn: formatTeamJoinedOn(),
      status: 'Pending',
      initials: initialsFromName(row.name, row.email),
      profileColor: PROFILE_COLOR_CYCLE[(startIndex + index) % PROFILE_COLOR_CYCLE.length],
    }));
}

export function splitInviteEmails(value) {
  return String(value || '')
    .split(/[,;\s]+/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

export function isValidInviteEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  if (!email.includes('@')) return false;
  const [local, domain] = email.split('@');
  return Boolean(local && domain && domain.includes('.') && email.split('@').length === 2);
}

export function membersFromInviteEmails(emails, existingMembers = []) {
  const seen = new Set();
  const rows = [];

  emails.forEach((value) => {
    splitInviteEmails(value).forEach((email) => {
      if (!isValidInviteEmail(email) || seen.has(email)) return;
      seen.add(email);
      rows.push({
        email,
        name: email.split('@')[0],
        firstName: '',
        lastName: '',
      });
    });
  });

  return membersFromImportRows(rows, existingMembers).map((member) => ({
    ...member,
    id: member.id.replace(/^imported-/, 'invited-'),
  }));
}
