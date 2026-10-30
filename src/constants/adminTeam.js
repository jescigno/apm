const ACTIVE_MEMBER_NAMES = [
  ['Maya', 'Chen'],
  ['Andre', 'Williams'],
  ['Sofia', 'Alvarez'],
  ['Ravi', 'Mehta'],
  ['Claire', 'Dunn'],
  ['Noah', 'Martinez'],
  ['Priya', 'Patel'],
  ['Liam', 'Foster'],
  ['Hannah', 'Brooks'],
  ['Emily', 'Chen'],
  ['Daniel', 'Kim'],
  ['Ava', 'Wright'],
  ['Taylor', 'Ross'],
  ['Jordan', 'Lee'],
  ['Sarah', 'Reed'],
  ['Matthew', 'Robinson'],
  ['Keisha', 'Ward'],
  ['Chris', 'Park'],
  ['Mia', 'Santos'],
  ['Owen', 'Brady'],
  ['Nina', 'Cole'],
  ['Lucia', 'Ramirez'],
  ['Isaac', 'Brown'],
  ['Lena', 'Hoffman'],
  ['Gabe', 'Myers'],
  ['Olivia', 'Nguyen'],
  ['Marcus', 'Johnson'],
  ['Ethan', 'Moore'],
  ['Sophia', 'Turner'],
  ['Lucas', 'Gray'],
];

const PENDING_MEMBER_NAMES = [
  ['Nora', 'Bennett'],
  ['Caleb', 'Ortiz'],
  ['Lily', 'Washington'],
  ['Zoe', 'Mitchell'],
  ['Andrew', 'Hayes'],
];

const INACTIVE_MEMBER_NAMES = [
  ['Leo', 'Martinez'],
  ['Ben', 'Carter'],
  ['Chloe', 'Adams'],
  ['Diego', 'Alvarez'],
  ['Elena', 'Vasquez'],
  ['Felix', 'Nguyen'],
  ['Grace', 'Hall'],
  ['Henry', 'Walsh'],
  ['Iris', 'Cohen'],
  ['Jack', 'Moreno'],
];

const DEACTIVATED_MEMBER_NAMES = [
  ['Hana', 'Brooks'],
  ['Kate', 'Sullivan'],
  ['Ryan', 'Cooper'],
  ['Naomi', 'Price'],
  ['Quinn', 'Harper'],
  ['Rosa', 'Delgado'],
  ['Samir', 'Khan'],
  ['Tessa', 'Nguyen'],
];

const ACTIVE_LAST_SEEN = ['12 minutes ago', '42 minutes ago', '1 hour ago', '3 hours ago', 'Yesterday', '2 days ago', '5 days ago'];
const INACTIVE_LAST_SEEN = ['2 weeks ago', '3 weeks ago', '4 weeks ago', '6 weeks ago', '8 weeks ago'];
const DEACTIVATED_LAST_SEEN = ['2 months ago', '3 months ago', '4 months ago', '5 months ago'];
const JOINED_DATES = ['Sept 6, 2026', 'Aug 11, 2026', 'Jul 2, 2026', 'May 19, 2026', 'Mar 4, 2026', 'Jan 9, 2026', 'Nov 18, 2025', 'Sept 14, 2025'];

function teamMember([first, last], status, index) {
  const name = `${first} ${last}`;
  const slug = `${first}-${last}`.toLowerCase();
  const lastActive =
    status === 'Pending'
      ? 'Pending invite'
      : status === 'Inactive'
        ? INACTIVE_LAST_SEEN[index % INACTIVE_LAST_SEEN.length]
        : status === 'Deactivated'
          ? DEACTIVATED_LAST_SEEN[index % DEACTIVATED_LAST_SEEN.length]
          : ACTIVE_LAST_SEEN[index % ACTIVE_LAST_SEEN.length];
  return {
    id: `uc-${slug}`,
    name,
    email: `${first}.${last}@uc.edu`.toLowerCase(),
    lastActive,
    joinedOn: JOINED_DATES[index % JOINED_DATES.length],
    status,
    initials: `${first[0]}${last[0]}`.toUpperCase(),
  };
}

const UNIVERSITY_OF_CALIFORNIA_ROWS = [
  ...ACTIVE_MEMBER_NAMES.map((name, index) => teamMember(name, 'Active', index)),
  ...PENDING_MEMBER_NAMES.map((name, index) => teamMember(name, 'Pending', index)),
  ...INACTIVE_MEMBER_NAMES.map((name, index) => teamMember(name, 'Inactive', index)),
  ...DEACTIVATED_MEMBER_NAMES.map((name, index) => teamMember(name, 'Deactivated', index)),
];

/** Cycle design-system profile colors so demo rows are visually distinct. */
const PROFILE_COLOR_CYCLE = ['amber', 'spring', 'cyan', 'magenta', 'rust', 'indigo'];

export const ADMIN_TEAM_MORE_ACTIONS = [
  { id: 'edit', label: 'Edit' },
  { id: 'activity', label: 'Activity' },
  { id: 'archive', label: 'Deactivate' },
];

export const ADMIN_TEAM_RESEND_ACTION = { id: 'resend', label: 'Resend Invite' };

export const ADMIN_TEAM_INVITE_ACTION = { id: 'invite', label: 'Invite' };

export const ADMIN_TEAM_SEND_INVITE_ACTION = { id: 'invite', label: 'Send Invite' };

export const ADMIN_TEAM_BULK_ACTIONS = [{ id: 'archive', label: 'Deactivate' }];

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
    idSet.has(member.id) ? { ...member, status: 'Deactivated' } : member
  );
}

function decorateTeamMembers(rows) {
  return rows.map((member, index) => ({
    ...member,
    profileColor: PROFILE_COLOR_CYCLE[index % PROFILE_COLOR_CYCLE.length],
  }));
}

export const ADMIN_TEAMS = [
  { id: 'university-of-california', label: 'University of California' },
];

export const ADMIN_TEAM_DEFAULT_ID = 'university-of-california';

export const ADMIN_TEAM_MEMBERS_BY_ID = {
  'university-of-california': decorateTeamMembers(UNIVERSITY_OF_CALIFORNIA_ROWS),
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

export const ADMIN_TEAM_EDIT_STATUSES = ['Active', 'Pending', 'Inactive', 'Deactivated'];

/** Active members stay Active or become Deactivated. Other members cannot be set to Active. */
export function getAdminTeamEditStatuses(currentStatus) {
  if (currentStatus === 'Active') {
    return ADMIN_TEAM_EDIT_STATUSES.filter((status) => status !== 'Pending');
  }
  return ADMIN_TEAM_EDIT_STATUSES.filter((status) => status !== 'Active');
}

export function applyTeamMemberEdits(member, { firstName, lastName, email, status, expiration }) {
  const name = [firstName, lastName].map((part) => String(part || '').trim()).filter(Boolean).join(' ');
  const nextEmail = String(email || '').trim().toLowerCase();
  const allowedStatuses = getAdminTeamEditStatuses(member.status);
  const nextStatus = allowedStatuses.includes(status) ? status : member.status;
  return {
    ...member,
    name: name || member.name,
    email: nextEmail || member.email,
    initials: initialsFromName(name || member.name, nextEmail || member.email),
    status: nextStatus,
    lastActive: nextStatus === 'Pending' ? 'Pending invite' : member.lastActive,
    expiration: expiration instanceof Date ? expiration : null,
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

export function membersFromInviteEmails(invites, existingMembers = []) {
  const seen = new Set();
  const rows = [];

  invites.forEach((value) => {
    if (value && typeof value === 'object') {
      const email = String(value.email || '').trim().toLowerCase();
      if (!isValidInviteEmail(email) || seen.has(email)) return;
      seen.add(email);
      const firstName = String(value.firstName || '').trim();
      const lastName = String(value.lastName || '').trim();
      const name = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];
      rows.push({ email, firstName, lastName, name });
      return;
    }

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
