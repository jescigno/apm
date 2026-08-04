import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ADMIN_TEAM_MEMBERS, ADMIN_TEAM_MORE_ACTIONS } from '../constants/adminTeam';
import { ICON_ADD, ICON_ARCHIVE, ICON_MORE_MENU, ICON_SEARCH } from '../constants/designSystem';
import { PROFILE_COLOR_CSS_VARS } from '../constants/profileColors';

const ICON_UPLOAD = '/icons/Upload.svg';

function SortChevron() {
  return (
    <svg
      className="admin-team-table__sort-icon"
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

function AdminTeamRow({ member, selected, onSelectChange, onOpenMemberActivity }) {
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
              if (action.id === 'activity') {
                onOpenMemberActivity?.(member);
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
    <div className="admin-team-table__row">
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

export default function AdminTeamTab({ onOpenMemberActivity }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const selectAllRef = useRef(null);

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return ADMIN_TEAM_MEMBERS;
    return ADMIN_TEAM_MEMBERS.filter(
      (member) =>
        member.name.toLowerCase().includes(query) || member.email.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const allSelected =
    filteredMembers.length > 0 && filteredMembers.every((member) => selectedIds.has(member.id));
  const someSelected = filteredMembers.some((member) => selectedIds.has(member.id)) && !allSelected;

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
        <div className="admin-team-toolbar__actions">
          <button type="button" className="admin-team-btn admin-team-btn--outline">
            <img src={ICON_UPLOAD} alt="" aria-hidden="true" />
            Bulk Import
          </button>
          <button type="button" className="admin-team-btn admin-team-btn--primary">
            <img src={ICON_ADD} alt="" aria-hidden="true" />
            Add Members
          </button>
        </div>
      </div>

      <div className="admin-team-table" role="table" aria-label="Team members">
        <div className="admin-team-table__header" role="row">
          <input
            ref={selectAllRef}
            type="checkbox"
            className="track-checkbox admin-team-table__checkbox"
            checked={allSelected}
            onChange={handleSelectAllToggle}
            aria-label="Select all team members"
          />
          <button type="button" className="admin-team-table__header-label admin-team-table__header-label--sortable">
            Team member
            <SortChevron />
          </button>
          <span className="admin-team-table__header-label">Email address</span>
          <span className="admin-team-table__header-label">Last active</span>
          <span className="admin-team-table__header-label">Joined on</span>
          <span className="admin-team-table__header-label">Status</span>
          <span className="admin-team-table__header-spacer" aria-hidden="true" />
        </div>

        <div className="admin-team-table__body" role="rowgroup">
          {filteredMembers.map((member) => (
            <AdminTeamRow
              key={member.id}
              member={member}
              selected={selectedIds.has(member.id)}
              onSelectChange={handleSelectChange}
              onOpenMemberActivity={onOpenMemberActivity}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
