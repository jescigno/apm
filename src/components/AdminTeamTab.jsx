import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ADMIN_TEAM_BULK_ACTIONS,
  ADMIN_TEAM_DEFAULT_ID,
  ADMIN_TEAM_MEMBERS_BY_ID,
  ADMIN_TEAM_DEFAULT_SORT,
  ADMIN_TEAM_MORE_ACTIONS,
  ADMIN_TEAM_SORT_COLUMNS,
  ADMIN_TEAMS,
  applyTeamMemberEdits,
  sortTeamMembers,
  archiveTeamMembers,
  membersFromImportRows,
  membersFromInviteEmails,
} from '../constants/adminTeam';
import { ICON_ADD, ICON_ARCHIVE, ICON_MORE_MENU, ICON_SEARCH } from '../constants/designSystem';
import { PROFILE_COLOR_CSS_VARS } from '../constants/profileColors';
import AdminTeamAddOverlay from './AdminTeamAddOverlay';
import AdminTeamBulkImportOverlay from './AdminTeamBulkImportOverlay';
import AdminTeamEditOverlay from './AdminTeamEditOverlay';

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

export function AdminTeamTitleDropdown({ teamId, onTeamChange }) {
  const triggerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);
  const selectedTeam = ADMIN_TEAMS.find((team) => team.id === teamId) ?? ADMIN_TEAMS[0];

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

export function AdminTeamHeaderActions({ onBulkImport, onAddMembers }) {
  return (
    <div className="admin-team-header__actions">
      <button type="button" className="admin-team-btn admin-team-btn--outline" onClick={onBulkImport}>
        <img src={ICON_UPLOAD} alt="" aria-hidden="true" />
        Bulk Import
      </button>
      <button type="button" className="admin-team-btn admin-team-btn--primary" onClick={onAddMembers}>
        <img src={ICON_ADD} alt="" aria-hidden="true" />
        Add Members
      </button>
    </div>
  );
}

function SortChevron({ active, direction }) {
  return (
    <svg
      className={`admin-team-table__sort-icon${active ? ' admin-team-table__sort-icon--active' : ''}${active && direction === 'desc' ? ' admin-team-table__sort-icon--desc' : ''}`}
      width="8"
      height="5"
      viewBox="0 0 8 5"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
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

  return <img src={ICON_ARCHIVE} alt="" aria-hidden="true" />;
}

function AdminTeamRow({ member, selected, onSelectChange, onOpenMemberActivity, onArchive, onEdit }) {
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
        {ADMIN_TEAM_MORE_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            role="menuitem"
            className="admin-team-more-menu__item"
            onClick={() => {
              if (action.id === 'edit') {
                onEdit?.(member);
              }
              if (action.id === 'activity') {
                onOpenMemberActivity?.(member);
              }
              if (action.id === 'archive') {
                onArchive?.(member.id);
              }
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

  return (
    <div className={`admin-team-table__row${selected ? ' admin-team-table__row--selected' : ''}`}>
      <input
        type="checkbox"
        className="track-checkbox admin-team-table__checkbox"
        checked={selected}
        onChange={(event) => onSelectChange(member.id, event.target.checked)}
        aria-label={`Select ${member.name}`}
      />
      <div className="admin-team-table__member">
        <span
          className="admin-team-table__avatar"
          style={{ backgroundColor: `var(${PROFILE_COLOR_CSS_VARS[member.profileColor]})` }}
          aria-hidden="true"
        >
          {member.initials}
        </span>
        <p className="admin-team-table__cell admin-team-table__cell--member">{member.name}</p>
      </div>
      <p className="admin-team-table__cell admin-team-table__cell--muted">{member.email}</p>
      <p className="admin-team-table__cell admin-team-table__cell--muted">{member.lastActive}</p>
      <p className="admin-team-table__cell admin-team-table__cell--muted">{member.joinedOn}</p>
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
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [membersByTeamId, setMembersByTeamId] = useState(ADMIN_TEAM_MEMBERS_BY_ID);
  const [editingMember, setEditingMember] = useState(null);
  const [sort, setSort] = useState(ADMIN_TEAM_DEFAULT_SORT);
  const selectAllRef = useRef(null);

  const members = membersByTeamId[teamId] ?? [];

  useEffect(() => {
    setSelectedIds(new Set());
    setSearchQuery('');
    setEditingMember(null);
  }, [teamId]);

  const setMembers = (updater) => {
    setMembersByTeamId((prev) => {
      const current = prev[teamId] ?? [];
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [teamId]: next };
    });
  };

  const visibleMembers = useMemo(
    () => members.filter((member) => member.status !== 'Archived'),
    [members]
  );

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
  const allSelected =
    filteredMembers.length > 0 && filteredMembers.every((member) => selectedIds.has(member.id));
  const someSelected = hasSelection && !allSelected;

  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    el.indeterminate = someSelected;
  }, [someSelected]);

  const handleSelectAllToggle = () => {
    setSelectedIds((prev) => {
      const everySelected =
        filteredMembers.length > 0 && filteredMembers.every((member) => prev.has(member.id));
      if (everySelected) {
        const next = new Set(prev);
        filteredMembers.forEach((member) => next.delete(member.id));
        return next;
      }
      const next = new Set(prev);
      filteredMembers.forEach((member) => next.add(member.id));
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
    setMembers((prev) =>
      prev.map((member) =>
        member.id === editingMember.id ? applyTeamMemberEdits(member, updates) : member
      )
    );
  };

  const handleArchiveSelected = () => {
    const ids = new Set(
      filteredMembers.filter((member) => selectedIds.has(member.id)).map((member) => member.id)
    );
    handleArchiveIds(ids);
  };

  return (
    <div className="admin-team">
      <div className="admin-team-toolbar">
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
        </label>
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
              aria-label={allSelected ? 'Deselect all team members' : 'Select all team members'}
            />
            {ADMIN_TEAM_SORT_COLUMNS.map((column) => {
              const active = sort.field === column.id;
              return (
                <button
                  key={column.id}
                  type="button"
                  className={`admin-team-table__header-label admin-team-table__header-label--sortable${active ? ' admin-team-table__header-label--sorted' : ''}`}
                  tabIndex={hasSelection ? -1 : 0}
                  aria-hidden={hasSelection}
                  aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  onClick={() => handleSortChange(column.id)}
                >
                  {column.label}
                  <SortChevron active={active} direction={sort.direction} />
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
          {filteredMembers.map((member) => (
            <AdminTeamRow
              key={member.id}
              member={member}
              selected={selectedIds.has(member.id)}
              onSelectChange={handleSelectChange}
              onOpenMemberActivity={onOpenMemberActivity}
              onArchive={handleArchiveIds}
              onEdit={setEditingMember}
            />
          ))}
        </div>
      </div>

      <AdminTeamBulkImportOverlay
        open={bulkImportOpen}
        onClose={() => onBulkImportOpenChange?.(false)}
        onImport={handleBulkImport}
      />
      <AdminTeamAddOverlay
        open={addOpen}
        onClose={() => onAddOpenChange?.(false)}
        onAdd={handleAddMembers}
      />
      <AdminTeamEditOverlay
        member={editingMember}
        existingEmails={members
          .filter((member) => member.id !== editingMember?.id)
          .map((member) => member.email)}
        onClose={() => setEditingMember(null)}
        onSave={handleEditMember}
      />
    </div>
  );
}
