import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ADMIN_TEAM_BULK_ACTIONS,
  ADMIN_TEAM_DEFAULT_ID,
  ADMIN_TEAM_MEMBERS_BY_ID,
  ADMIN_TEAM_DEFAULT_SORT,
  ADMIN_TEAM_INVITE_ACTION,
  ADMIN_TEAM_MORE_ACTIONS,
  ADMIN_TEAM_RESEND_ACTION,
  ADMIN_TEAM_SORT_COLUMNS,
  ADMIN_TEAMS,
  applyTeamMemberEdits,
  sortTeamMembers,
  archiveTeamMembers,
  membersFromImportRows,
  membersFromInviteEmails,
} from '../constants/adminTeam';
import { ICON_ADD, ICON_ARCHIVE, ICON_CLOSE, ICON_MORE_MENU, ICON_SEARCH, ICON_UI_FILTER } from '../constants/designSystem';
import { LAYOUT_COMPACT_MAX_WIDTH } from '../constants/layout';
import { PROFILE_COLOR_CSS_VARS } from '../constants/profileColors';
import AdminTeamAddOverlay from './AdminTeamAddOverlay';
import AdminTeamBulkImportOverlay from './AdminTeamBulkImportOverlay';
import AdminTeamEditOverlay from './AdminTeamEditOverlay';

const ADMIN_TEAM_PAGE_SIZE = 10;

function PaginationChevron({ direction }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M10 3.5L5.5 8L10 12.5' : 'M6 3.5L10.5 8L6 12.5'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TitleChevron({ open }) {
  return (
    <svg
      className={`admin-team-title-dropdown__chevron${open ? ' admin-team-title-dropdown__chevron--open' : ''}`}
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1.5 2L6 6.5L10.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AdminTeamTitleDropdown({ teamId, onTeamChange, interactive = true }) {
  const selectedTeam = ADMIN_TEAMS.find((team) => team.id === teamId) ?? ADMIN_TEAMS[0];
  if (!interactive) {
    return <h1 className="admin-page-title">{selectedTeam.label}</h1>;
  }
  return (
    <AdminTeamTitleMenu selectedTeam={selectedTeam} onTeamChange={onTeamChange} />
  );
}

function AdminTeamTitleMenu({ selectedTeam, onTeamChange }) {
  const triggerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const updateMenuRect = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuRect({ left: rect.left, bottom: rect.bottom });
  }, []);

  const toggleMenu = useCallback(() => {
    if (menuOpen) {
      closeMenu();
      return;
    }
    updateMenuRect();
    setMenuOpen(true);
  }, [menuOpen, closeMenu, updateMenuRect]);

  useLayoutEffect(() => {
    if (!menuOpen) return;
    updateMenuRect();
    const onUpdate = () => updateMenuRect();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [menuOpen, updateMenuRect]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event) => {
      const target = event.target;
      if (triggerRef.current?.contains(target)) return;
      if (target.closest?.('[data-admin-team-title-menu]')) return;
      closeMenu();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [menuOpen, closeMenu]);

  const menu =
    menuOpen &&
    createPortal(
      <div
        className="admin-activity-filter-menu admin-team-title-dropdown__menu"
        data-admin-team-title-menu
        style={{
          position: 'fixed',
          left: menuRect?.left ?? 0,
          top: menuRect ? menuRect.bottom + 6 : 0,
          visibility: menuRect ? 'visible' : 'hidden',
          zIndex: 2000,
        }}
        role="listbox"
        aria-label="Select team"
      >
        {ADMIN_TEAMS.map((team) => {
          const checked = team.id === selectedTeam.id;
          return (
            <label
              key={team.id}
              className="admin-activity-filter-menu__option admin-activity-filter-menu__option--radio account-settings-radio"
            >
              <input
                type="radio"
                className="account-settings-radio__input"
                name="admin-team-title"
                value={team.id}
                checked={checked}
                onChange={() => {
                  onTeamChange?.(team.id);
                  closeMenu();
                }}
              />
              <span
                className={`account-settings-radio-indicator${checked ? ' account-settings-radio-indicator--selected' : ''}`}
                aria-hidden="true"
              >
                <span className="account-settings-radio-indicator-dot" />
              </span>
              <span className="admin-activity-filter-menu__label">{team.label}</span>
            </label>
          );
        })}
      </div>,
      document.body
    );

  return (
    <h1 className="admin-page-title admin-team-title-dropdown">
      <button
        ref={triggerRef}
        type="button"
        className="admin-team-title-dropdown__trigger"
        aria-haspopup="listbox"
        aria-expanded={menuOpen}
        aria-label="Select team"
        onClick={toggleMenu}
      >
        <span>{selectedTeam.label}</span>
        <TitleChevron open={menuOpen} />
      </button>
      {menu}
    </h1>
  );
}

const ICON_UPLOAD = '/icons/Upload.svg';

const TEAM_STATUS_FILTERS = [
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'archived', label: 'Archived' },
];

function memberMatchesStatusFilter(member, statusFilters) {
  if (member.status === 'Active') return statusFilters.has('active');
  if (member.status === 'Pending') return statusFilters.has('pending');
  if (member.status === 'Deactivated' || member.status === 'Archived') return statusFilters.has('archived');
  return false;
}

function AdminTeamStatusFilter({ selected, onToggle }) {
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);

  const updateMenuRect = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuRect({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
  }, []);

  const toggleOpen = useCallback(() => {
    setOpen((current) => {
      if (current) return false;
      updateMenuRect();
      return true;
    });
  }, [updateMenuRect]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    updateMenuRect();
    const onUpdate = () => updateMenuRect();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [open, updateMenuRect]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      const target = event.target;
      if (triggerRef.current?.contains(target)) return;
      if (target.closest?.('[data-admin-team-filter-menu]')) return;
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const menu = open
    ? createPortal(
        <div
          className="admin-activity-filter-menu admin-team-filter-menu"
          data-admin-team-filter-menu
          role="group"
          aria-label="Status filters"
          style={{
            position: 'fixed',
            top: menuRect?.top ?? 0,
            right: menuRect?.right ?? 0,
            visibility: menuRect ? 'visible' : 'hidden',
            zIndex: 2000,
          }}
        >
          {TEAM_STATUS_FILTERS.map((option) => (
            <label key={option.id} className="admin-activity-filter-menu__option">
              <input
                type="checkbox"
                className="track-checkbox admin-activity-filter-menu__checkbox"
                checked={selected.has(option.id)}
                onChange={() => onToggle(option.id)}
              />
              <span className="admin-activity-filter-menu__label">{option.label}</span>
            </label>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="admin-team-filter"
        aria-label="Filter"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={toggleOpen}
      >
        <img src={ICON_UI_FILTER} alt="" />
      </button>
      {menu}
    </>
  );
}

export function AdminTeamHeaderActions({ onBulkImport, onAddMembers, showBulkImport = true }) {
  return (
    <div className="admin-team-header__actions">
      {showBulkImport ? (
        <button type="button" className="admin-team-btn admin-team-btn--outline" onClick={onBulkImport}>
          <img src={ICON_UPLOAD} alt="" aria-hidden="true" />
          Bulk Import
        </button>
      ) : null}
      <button type="button" className="admin-team-btn admin-team-btn--primary" onClick={onAddMembers}>
        <img src={ICON_ADD} alt="" aria-hidden="true" />
        Add Members
      </button>
    </div>
  );
}

function SortArrow({ active, direction }) {
  return (
    <svg
      className={`admin-team-table__sort-icon${active ? ' admin-team-table__sort-icon--active' : ''}${active && direction === 'desc' ? ' admin-team-table__sort-icon--desc' : ''}`}
      width="8"
      height="10"
      viewBox="0 0 8 10"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 1.25V6.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M1.5 5.5L4 8.75L6.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AdminTeamMoreMenuIcon({ actionId }) {
  if (actionId === 'edit') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path
          d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0 0-3L16.5 4.5a2.1 2.1 0 0 0-3 0L3 15v5z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M13.5 6.5l4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (actionId === 'activity') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M4 18l5-6 4 3 7-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 6h3v3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (actionId === 'resend' || actionId === 'invite') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
        <path d="M4 7l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (actionId === 'view') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M2.5 12S6.5 6.5 12 6.5 21.5 12 21.5 12 17.5 17.5 12 17.5 2.5 12 2.5 12z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="2.75" />
      </svg>
    );
  }

  return <img src={ICON_ARCHIVE} alt="" aria-hidden="true" />;
}

function isArchivedMember(member) {
  return member.status === 'Deactivated' || member.status === 'Archived';
}

function memberMoreActions(member, showActivity, includeView) {
  const actions = [];
  if (isArchivedMember(member)) {
    actions.push(ADMIN_TEAM_MORE_ACTIONS.find((action) => action.id === 'edit'), ADMIN_TEAM_INVITE_ACTION);
  } else {
    ADMIN_TEAM_MORE_ACTIONS.forEach((action) => {
      if (action.id === 'activity' && !showActivity) return;
      if (action.id === 'archive' && member.status === 'Pending') {
        actions.push(ADMIN_TEAM_RESEND_ACTION);
      }
      actions.push(action);
    });
  }
  if (includeView) {
    actions.unshift({ id: 'view', label: 'View Member' });
  }
  return actions;
}

function runMemberMoreAction(action, member, handlers) {
  if (action.id === 'view') handlers.onView?.(member);
  if (action.id === 'edit') handlers.onEdit?.(member);
  if (action.id === 'activity') handlers.onOpenMemberActivity?.(member);
  if (action.id === 'archive') handlers.onArchive?.(member.id);
  if (action.id === 'resend' || action.id === 'invite') handlers.onResendInvite?.(member);
}

function AdminTeamMemberOverlay({
  member,
  showActivity = false,
  onClose,
  onEdit,
  onArchive,
  onOpenMemberActivity,
  onResendInvite,
}) {
  useEffect(() => {
    if (!member) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [member, onClose]);

  if (!member) return null;

  const isPending = member.status === 'Pending';
  const actions = memberMoreActions(member, showActivity, false);
  const fields = [
    { label: 'Email address', value: member.email },
    { label: 'Last active', value: isPending ? '' : member.lastActive },
    { label: 'Joined on', value: isPending ? '' : member.joinedOn },
    { label: 'Status', value: member.status },
  ];

  return createPortal(
    <div
      className="admin-team-add-overlay admin-team-member-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-team-member-overlay-title"
    >
      <div
        className="admin-team-add-overlay__backdrop"
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClose?.();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close member details"
      />
      <div className="admin-team-add-overlay__panel-wrap">
        <div className="admin-team-add-overlay__panel">
          <header className="admin-team-member-overlay__header">
            <div className="admin-team-member-overlay__identity">
              <span
                className={`admin-team-table__avatar admin-team-member-overlay__avatar${isPending ? ' admin-team-table__avatar--pending' : ''}`}
                style={
                  isPending
                    ? undefined
                    : { backgroundColor: `var(${PROFILE_COLOR_CSS_VARS[member.profileColor]})` }
                }
                aria-hidden="true"
              >
                {member.initials}
              </span>
              <h2 id="admin-team-member-overlay-title" className="admin-team-member-overlay__name">
                {member.name}
              </h2>
            </div>
            <button type="button" className="admin-team-member-overlay__close" aria-label="Close" onClick={onClose}>
              <img src={ICON_CLOSE} alt="" />
            </button>
          </header>
          <dl className="admin-team-member-overlay__fields">
            {fields.map((field) => (
              <div key={field.label} className="admin-team-member-overlay__field">
                <dt className="admin-team-member-overlay__label">{field.label}</dt>
                <dd className="admin-team-member-overlay__value">{field.value || '—'}</dd>
              </div>
            ))}
          </dl>
          {actions.length > 0 ? (
            <div className="admin-team-member-overlay__actions">
              {actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className="admin-team-member-overlay__action"
                  onClick={() => {
                    runMemberMoreAction(action, member, {
                      onEdit,
                      onArchive,
                      onOpenMemberActivity,
                      onResendInvite,
                    });
                    onClose?.();
                  }}
                >
                  <AdminTeamMoreMenuIcon actionId={action.id} />
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

function AdminTeamRow({
  member,
  selected,
  onSelectChange,
  onOpenMemberActivity,
  onArchive,
  onEdit,
  onView,
  onResendInvite,
  showActivity = true,
  includeView = false,
}) {
  const menuBtnRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const updateMenuRect = useCallback(() => {
    const el = menuBtnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuRect({ right: rect.right, bottom: rect.bottom });
  }, []);

  const toggleMenu = useCallback(
    (event) => {
      event.stopPropagation();
      if (menuOpen) {
        closeMenu();
        return;
      }
      updateMenuRect();
      setMenuOpen(true);
    },
    [menuOpen, closeMenu, updateMenuRect]
  );

  useLayoutEffect(() => {
    if (!menuOpen) return;
    updateMenuRect();
    const onUpdate = () => updateMenuRect();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [menuOpen, updateMenuRect]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event) => {
      const target = event.target;
      if (menuBtnRef.current?.contains(target)) return;
      if (target.closest?.('[data-admin-team-more-menu]')) return;
      closeMenu();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [menuOpen, closeMenu]);

  const moreMenu =
    menuOpen &&
    createPortal(
      <div
        className="admin-team-more-menu"
        data-admin-team-more-menu
        style={{
          position: 'fixed',
          right: menuRect ? window.innerWidth - menuRect.right : 0,
          top: menuRect ? menuRect.bottom + 4 : 0,
          visibility: menuRect ? 'visible' : 'hidden',
          zIndex: 2000,
        }}
        role="menu"
        aria-label={`Actions for ${member.name}`}
      >
        {memberMoreActions(member, showActivity, includeView).map((action) => (
          <button
            key={action.id}
            type="button"
            role="menuitem"
            className="admin-team-more-menu__item"
            onClick={() => {
              runMemberMoreAction(action, member, {
                onView,
                onEdit,
                onOpenMemberActivity,
                onArchive,
                onResendInvite,
              });
              closeMenu();
            }}
          >
            <AdminTeamMoreMenuIcon actionId={action.id} />
            {action.label}
          </button>
        ))}
      </div>,
      document.body
    );

  const isPending = member.status === 'Pending';

  return (
    <div className={`admin-team-table__row${selected ? ' admin-team-table__row--selected' : ''}${isPending ? ' admin-team-table__row--pending' : ''}`}>
      <input
        type="checkbox"
        className="track-checkbox admin-team-table__checkbox"
        checked={selected}
        onChange={(event) => onSelectChange(member.id, event.target.checked)}
        aria-label={`Select ${member.name}`}
      />
      <div className="admin-team-table__member">
        <span
          className={`admin-team-table__avatar${isPending ? ' admin-team-table__avatar--pending' : ''}`}
          style={
            isPending
              ? undefined
              : { backgroundColor: `var(${PROFILE_COLOR_CSS_VARS[member.profileColor]})` }
          }
          aria-hidden="true"
        >
          {member.initials}
        </span>
        <div className="admin-team-table__member-text">
          <p className="admin-team-table__cell admin-team-table__cell--member">{member.name}</p>
          <p className="admin-team-table__email--stacked">{member.email}</p>
        </div>
      </div>
      <p className="admin-team-table__cell admin-team-table__cell--muted admin-team-table__cell--email">{member.email}</p>
      <p className="admin-team-table__cell admin-team-table__cell--muted admin-team-table__cell--last-active">{isPending ? '' : member.lastActive}</p>
      <p className="admin-team-table__cell admin-team-table__cell--muted admin-team-table__cell--joined">{isPending ? '' : member.joinedOn}</p>
      <p className="admin-team-table__cell admin-team-table__cell--status">{member.status}</p>
      <button
        ref={menuBtnRef}
        type="button"
        className="admin-team-table__more-btn"
        aria-label={`More actions for ${member.name}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={toggleMenu}
      >
        <img src={ICON_MORE_MENU} alt="" aria-hidden="true" />
      </button>
      {moreMenu}
    </div>
  );
}

export default function AdminTeamTab({
  teamId = ADMIN_TEAM_DEFAULT_ID,
  bulkImportOpen = false,
  onBulkImportOpenChange,
  addOpen = false,
  onAddOpenChange,
  onOpenMemberActivity,
  showBulkImport = true,
  showMemberActivity = true,
  showAddInToolbar = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [membersByTeamId, setMembersByTeamId] = useState(ADMIN_TEAM_MEMBERS_BY_ID);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);
  const [sort, setSort] = useState(ADMIN_TEAM_DEFAULT_SORT);
  const [inviteNotice, setInviteNotice] = useState(null);
  const [statusFilters, setStatusFilters] = useState(() => new Set(['active', 'pending']));
  const [page, setPage] = useState(1);
  const [mobileLayout, setMobileLayout] = useState(false);
  const selectAllRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${LAYOUT_COMPACT_MAX_WIDTH}px)`);
    const sync = () => setMobileLayout(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const members = membersByTeamId[teamId] ?? [];

  useEffect(() => {
    setSelectedIds(new Set());
    setSearchQuery('');
    setEditingMember(null);
    setPage(1);
  }, [teamId]);

  const setMembers = (updater) => {
    setMembersByTeamId((prev) => {
      const current = prev[teamId] ?? [];
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [teamId]: next };
    });
  };

  const visibleMembers = useMemo(
    () => members.filter((member) => memberMatchesStatusFilter(member, statusFilters)),
    [members, statusFilters]
  );

  const toggleStatusFilter = (id) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const next = !query
      ? visibleMembers
      : visibleMembers.filter(
          (member) =>
            member.name.toLowerCase().includes(query) || member.email.toLowerCase().includes(query)
        );
    return sortTeamMembers(next, sort);
  }, [visibleMembers, searchQuery, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / ADMIN_TEAM_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageMembers = mobileLayout
    ? filteredMembers
    : filteredMembers.slice(
        (currentPage - 1) * ADMIN_TEAM_PAGE_SIZE,
        currentPage * ADMIN_TEAM_PAGE_SIZE
      );
  const pageRangeStart = filteredMembers.length === 0 ? 0 : (currentPage - 1) * ADMIN_TEAM_PAGE_SIZE + 1;
  const pageRangeEnd = pageRangeStart + Math.min(pageMembers.length, ADMIN_TEAM_PAGE_SIZE) - 1;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilters, sort]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const handleSortChange = (field) => {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' }
    );
  };

  const handleBulkImport = (rows) => {
    setMembers((prev) => [...prev, ...membersFromImportRows(rows, prev)]);
  };

  const handleAddMembers = (emails) => {
    setMembers((prev) => [...prev, ...membersFromInviteEmails(emails, prev)]);
  };

  const selectedCount = filteredMembers.reduce(
    (count, member) => (selectedIds.has(member.id) ? count + 1 : count),
    0
  );
  const hasSelection = selectedCount > 0;
  const selectionLabel = selectedCount === 1 ? '1 SELECTED' : `${selectedCount} SELECTED`;
  const pageSelectedCount = pageMembers.reduce(
    (count, member) => (selectedIds.has(member.id) ? count + 1 : count),
    0
  );
  const allSelected = pageMembers.length > 0 && pageSelectedCount === pageMembers.length;
  const someSelected = pageSelectedCount > 0 && !allSelected;

  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    el.indeterminate = someSelected;
  }, [someSelected]);

  const handleSelectAllToggle = () => {
    setSelectedIds((prev) => {
      const everySelected =
        pageMembers.length > 0 && pageMembers.every((member) => prev.has(member.id));
      if (everySelected) {
        const next = new Set(prev);
        pageMembers.forEach((member) => next.delete(member.id));
        return next;
      }
      const next = new Set(prev);
      pageMembers.forEach((member) => next.add(member.id));
      return next;
    });
  };

  const handleSelectChange = (id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleArchiveIds = (ids) => {
    const idSet = ids instanceof Set ? ids : new Set([ids]);
    setMembers((prev) => archiveTeamMembers(prev, idSet));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      idSet.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleEditMember = (updates) => {
    if (!editingMember) return;
    const nextMember = applyTeamMemberEdits(editingMember, updates);
    setMembers((prev) =>
      prev.map((member) => (member.id === editingMember.id ? nextMember : member))
    );
    if (updates.resendInvite) showInviteNotice(nextMember);
  };

  const dismissInviteNotice = useCallback(() => {
    setInviteNotice((current) => (current && !current.exiting ? { ...current, exiting: true } : current));
  }, []);

  const showInviteNotice = useCallback((member) => {
    setInviteNotice({ id: Date.now(), name: member.name, exiting: false });
  }, []);

  useEffect(() => {
    if (!inviteNotice || inviteNotice.exiting) return undefined;
    const timer = window.setTimeout(dismissInviteNotice, 4000);
    return () => window.clearTimeout(timer);
  }, [inviteNotice, dismissInviteNotice]);

  useEffect(() => {
    if (!inviteNotice?.exiting) return undefined;
    const timer = window.setTimeout(() => setInviteNotice(null), 280);
    return () => window.clearTimeout(timer);
  }, [inviteNotice]);

  const handleArchiveSelected = () => {
    const ids = new Set(
      filteredMembers.filter((member) => selectedIds.has(member.id)).map((member) => member.id)
    );
    handleArchiveIds(ids);
  };

  return (
    <div className="admin-team">
      <div className="admin-team-toolbar">
        <div className="admin-team-toolbar__search">
          <label className="admin-team-search">
            <img src={ICON_SEARCH} alt="" aria-hidden="true" className="admin-team-search__icon" />
            <input
              type="search"
              className="admin-team-search__input"
              placeholder="Search Team Members"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search team members"
            />
            {searchQuery.length > 0 ? (
              <button
                type="button"
                className="admin-team-search__clear"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
              >
                <img src={ICON_CLOSE} alt="" />
              </button>
            ) : null}
          </label>
          <AdminTeamStatusFilter selected={statusFilters} onToggle={toggleStatusFilter} />
        </div>
        {showAddInToolbar ? (
          <div className="admin-team-toolbar__actions">
            <button
              type="button"
              className="admin-team-btn admin-team-btn--primary"
              onClick={() => onAddOpenChange?.(true)}
            >
              <img src={ICON_ADD} alt="" aria-hidden="true" />
              Add Members
            </button>
          </div>
        ) : null}
      </div>

      <div className="admin-team-table" role="table" aria-label="Team members">
        <div className="admin-team-table__header-wrap">
          <div className="admin-team-table__header" role="row">
            <input
              ref={selectAllRef}
              type="checkbox"
              className="track-checkbox admin-team-table__checkbox"
              checked={allSelected}
              onChange={handleSelectAllToggle}
              aria-label={
                mobileLayout
                  ? allSelected
                    ? 'Deselect all team members'
                    : 'Select all team members'
                  : allSelected
                    ? 'Deselect team members on this page'
                    : 'Select team members on this page'
              }
            />
            {ADMIN_TEAM_SORT_COLUMNS.map((column) => {
              const active = sort.field === column.id;
              return (
                <button
                  key={column.id}
                  type="button"
                  className={`admin-team-table__header-label admin-team-table__header-label--sortable admin-team-table__header-label--${column.id}${active ? ' admin-team-table__header-label--sorted' : ''}`}
                  tabIndex={hasSelection ? -1 : 0}
                  aria-hidden={hasSelection}
                  aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  onClick={() => handleSortChange(column.id)}
                >
                  {column.label}
                  <SortArrow active={active} direction={sort.direction} />
                </button>
              );
            })}
            <span className="admin-team-table__header-spacer" aria-hidden="true" />
          </div>
          {hasSelection ? (
            <div className="tracks-selection-bar tracks-selection-bar--with-select-all admin-team-selection-bar">
              <div className="tracks-selection-meta">
                <span className="tracks-selection-count">{selectionLabel}</span>
                <span className="tracks-selection-divider" aria-hidden="true" />
                <button type="button" className="tracks-selection-deselect" onClick={handleDeselectAll}>
                  DESELECT
                </button>
              </div>
              <div className="tracks-selection-actions">
                {ADMIN_TEAM_BULK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className="tracks-selection-action"
                    onClick={action.id === 'archive' ? handleArchiveSelected : undefined}
                    aria-label={action.label}
                  >
                    {action.id === 'archive' ? <img src={ICON_ARCHIVE} alt="" /> : null}
                    <span className="tracks-selection-action-label">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="admin-team-table__body" role="rowgroup">
          {pageMembers.map((member) => (
            <AdminTeamRow
              key={member.id}
              member={member}
              selected={selectedIds.has(member.id)}
              onSelectChange={handleSelectChange}
              onOpenMemberActivity={onOpenMemberActivity}
              onArchive={handleArchiveIds}
              onEdit={setEditingMember}
              onView={setViewingMember}
              onResendInvite={showInviteNotice}
              showActivity={showMemberActivity}
              includeView={mobileLayout}
            />
          ))}
        </div>
      </div>

      {!mobileLayout && filteredMembers.length > 0 ? (
        <nav className="admin-team-pagination" aria-label="Team member pages">
          <p className="admin-team-pagination__summary">
            Showing {pageRangeStart}-{pageRangeEnd} of {filteredMembers.length}
          </p>
          <div className="admin-team-pagination__controls">
            <button
              type="button"
              className="admin-team-pagination__btn"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <PaginationChevron direction="left" />
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`admin-team-pagination__page${pageNumber === currentPage ? ' admin-team-pagination__page--current' : ''}`}
                aria-label={`Page ${pageNumber}`}
                aria-current={pageNumber === currentPage ? 'page' : undefined}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              className="admin-team-pagination__btn"
              aria-label="Next page"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              <PaginationChevron direction="right" />
            </button>
          </div>
        </nav>
      ) : null}

      {showBulkImport ? (
        <AdminTeamBulkImportOverlay
          open={bulkImportOpen}
          onClose={() => onBulkImportOpenChange?.(false)}
          onImport={handleBulkImport}
        />
      ) : null}
      <AdminTeamAddOverlay
        open={addOpen}
        onClose={() => onAddOpenChange?.(false)}
        onAdd={handleAddMembers}
      />
      <AdminTeamMemberOverlay
        member={viewingMember}
        showActivity={showMemberActivity}
        onClose={() => setViewingMember(null)}
        onEdit={setEditingMember}
        onArchive={handleArchiveIds}
        onOpenMemberActivity={onOpenMemberActivity}
        onResendInvite={showInviteNotice}
      />
      <AdminTeamEditOverlay
        member={editingMember}
        existingEmails={members
          .filter((member) => member.id !== editingMember?.id)
          .map((member) => member.email)}
        onClose={() => setEditingMember(null)}
        onSave={handleEditMember}
      />
      {inviteNotice
        ? createPortal(
            <div
              key={inviteNotice.id}
              className={`admin-team-toast${inviteNotice.exiting ? ' admin-team-toast--out' : ' admin-team-toast--in'}`}
              role="status"
            >
              <p className="admin-team-toast__message">Invite sent to {inviteNotice.name}</p>
              <button
                type="button"
                className="admin-team-toast__close"
                aria-label="Dismiss notification"
                onClick={dismissInviteNotice}
              >
                <img src={ICON_CLOSE} alt="" />
              </button>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
