/**
 * Right panel for a team member's activity. Uses only `team-member-activity-panel-*` classes in index.css.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ADMIN_ACTIVITY_DATE_FILTERS, ADMIN_ACTIVITY_DEFAULT_DATE_FILTER } from '../constants/adminActivity';
import { ADMIN_TEAM_MEMBERS } from '../constants/adminTeam';
import { ICON_CLOSE, ICON_MORE_MENU, ICON_TRACK_DETAILS } from '../constants/designSystem';
import {
  TEAM_MEMBER_ACTIVITY_DOWNLOAD_COUNT,
  TEAM_MEMBER_ACTIVITY_DOWNLOADS,
  TEAM_MEMBER_ACTIVITY_STATS,
} from '../constants/teamMemberActivity';

function TeamMemberActivityPanelFilters({ memberId, onMemberChange, dateFilter, onDateFilterChange }) {
  const memberTriggerRef = useRef(null);
  const dateTriggerRef = useRef(null);
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [memberMenuRect, setMemberMenuRect] = useState(null);
  const [dateMenuRect, setDateMenuRect] = useState(null);

  const selectedMember =
    ADMIN_TEAM_MEMBERS.find((member) => member.id === memberId) ?? ADMIN_TEAM_MEMBERS[0];
  const selectedDateLabel =
    ADMIN_ACTIVITY_DATE_FILTERS.find((option) => option.id === dateFilter)?.label ?? 'Last 30 days';

  const closeMemberMenu = useCallback(() => setMemberMenuOpen(false), []);
  const closeDateMenu = useCallback(() => setDateMenuOpen(false), []);

  const updateMemberMenuRect = useCallback(() => {
    const el = memberTriggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMemberMenuRect({ left: rect.left, right: rect.right, bottom: rect.bottom });
  }, []);

  const updateDateMenuRect = useCallback(() => {
    const el = dateTriggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDateMenuRect({ left: rect.left, right: rect.right, bottom: rect.bottom });
  }, []);

  useLayoutEffect(() => {
    if (!memberMenuOpen) return;
    updateMemberMenuRect();
    const onUpdate = () => updateMemberMenuRect();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [memberMenuOpen, updateMemberMenuRect]);

  useLayoutEffect(() => {
    if (!dateMenuOpen) return;
    updateDateMenuRect();
    const onUpdate = () => updateDateMenuRect();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [dateMenuOpen, updateDateMenuRect]);

  useEffect(() => {
    if (!memberMenuOpen && !dateMenuOpen) return;
    const onPointerDown = (event) => {
      const target = event.target;
      if (memberTriggerRef.current?.contains(target)) return;
      if (dateTriggerRef.current?.contains(target)) return;
      if (target.closest?.('[data-team-member-activity-member-menu]')) return;
      if (target.closest?.('[data-team-member-activity-date-menu]')) return;
      closeMemberMenu();
      closeDateMenu();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [memberMenuOpen, dateMenuOpen, closeMemberMenu, closeDateMenu]);

  const memberMenu =
    memberMenuOpen &&
    createPortal(
      <div
        className="team-member-activity-panel-filter-menu"
        data-team-member-activity-member-menu
        style={{
          position: 'fixed',
          left: memberMenuRect?.left ?? 0,
          top: memberMenuRect ? memberMenuRect.bottom + 4 : 0,
          visibility: memberMenuRect ? 'visible' : 'hidden',
          zIndex: 2100,
        }}
        role="listbox"
        aria-label="Team member"
      >
        {ADMIN_TEAM_MEMBERS.map((member) => {
          const checked = member.id === memberId;
          return (
            <button
              key={member.id}
              type="button"
              role="option"
              aria-selected={checked}
              className={`team-member-activity-panel-filter-menu__item${checked ? ' team-member-activity-panel-filter-menu__item--current' : ''}`}
              onClick={() => {
                onMemberChange(member.id);
                closeMemberMenu();
              }}
            >
              {member.name}
            </button>
          );
        })}
      </div>,
      document.body
    );

  const dateMenu =
    dateMenuOpen &&
    createPortal(
      <div
        className="team-member-activity-panel-filter-menu"
        data-team-member-activity-date-menu
        style={{
          position: 'fixed',
          right: dateMenuRect ? window.innerWidth - dateMenuRect.right : 0,
          top: dateMenuRect ? dateMenuRect.bottom + 4 : 0,
          visibility: dateMenuRect ? 'visible' : 'hidden',
          zIndex: 2100,
        }}
        role="listbox"
        aria-label="Date filter"
      >
        {ADMIN_ACTIVITY_DATE_FILTERS.map((option) => {
          const checked = dateFilter === option.id;
          return (
            <label
              key={option.id}
              className="team-member-activity-panel-filter-menu__option account-settings-radio"
            >
              <input
                type="radio"
                className="account-settings-radio__input"
                name="team-member-activity-date-filter"
                value={option.id}
                checked={checked}
                onChange={() => {
                  onDateFilterChange(option.id);
                  closeDateMenu();
                }}
              />
              <span
                className={`account-settings-radio-indicator${checked ? ' account-settings-radio-indicator--selected' : ''}`}
                aria-hidden="true"
              >
                <span className="account-settings-radio-indicator-dot" />
              </span>
              <span className="team-member-activity-panel-filter-menu__label">{option.label}</span>
            </label>
          );
        })}
      </div>,
      document.body
    );

  return (
    <div className="team-member-activity-panel__filters">
      <div className="team-member-activity-panel-filter team-member-activity-panel-filter--dropdown">
        <button
          ref={memberTriggerRef}
          type="button"
          className="team-member-activity-panel-filter__trigger"
          aria-haspopup="listbox"
          aria-expanded={memberMenuOpen}
          onClick={() => {
            closeDateMenu();
            if (memberMenuOpen) closeMemberMenu();
            else {
              updateMemberMenuRect();
              setMemberMenuOpen(true);
            }
          }}
        >
          {selectedMember.name}
        </button>
        {memberMenu}
      </div>
      <div className="team-member-activity-panel-filter team-member-activity-panel-filter--dropdown">
        <button
          ref={dateTriggerRef}
          type="button"
          className="team-member-activity-panel-filter__trigger"
          aria-haspopup="listbox"
          aria-expanded={dateMenuOpen}
          onClick={() => {
            closeMemberMenu();
            if (dateMenuOpen) closeDateMenu();
            else {
              updateDateMenuRect();
              setDateMenuOpen(true);
            }
          }}
        >
          {selectedDateLabel}
        </button>
        {dateMenu}
      </div>
    </div>
  );
}

function TeamMemberActivityDownloadRow({ download }) {
  return (
    <li className="team-member-activity-panel-download-row">
      <div
        className="team-member-activity-panel-download-row__thumb"
        style={{ backgroundImage: `url('${download.thumbSrc}')` }}
        aria-hidden="true"
      />
      <div className="team-member-activity-panel-download-row__info">
        <p className="team-member-activity-panel-download-row__title">{download.title}</p>
        <div className="team-member-activity-panel-download-row__meta">
          <p className="team-member-activity-panel-download-row__code">{download.code}</p>
          <div className="team-member-activity-panel-download-row__icons" aria-hidden="true">
            <img src="/icons/TrackInfo.svg" alt="" />
            <img src="/icons/Share.svg" alt="" />
            <img src={ICON_TRACK_DETAILS} alt="" />
          </div>
        </div>
      </div>
      <button type="button" className="team-member-activity-panel-download-row__more" aria-label="More options">
        <img src={ICON_MORE_MENU} alt="" />
      </button>
    </li>
  );
}

export default function TeamMemberActivityPanel({
  isOpen,
  onClose,
  member,
  width = 360,
  onWidthChange,
  minWidth = 360,
  maxWidth = 600,
}) {
  const resizeRef = useRef(null);
  const widthRef = useRef(width);
  const [memberId, setMemberId] = useState(member?.id ?? ADMIN_TEAM_MEMBERS[0]?.id);
  const [dateFilter, setDateFilter] = useState(ADMIN_ACTIVITY_DEFAULT_DATE_FILTER);

  widthRef.current = width;

  useEffect(() => {
    if (member?.id) setMemberId(member.id);
  }, [member?.id]);

  useEffect(() => {
    if (!resizeRef.current || !onWidthChange || !isOpen) return;

    const handle = resizeRef.current;

    const onMouseDown = (event) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = widthRef.current;

      const onMouseMove = (moveEvent) => {
        const delta = startX - moveEvent.clientX;
        const next = Math.min(maxWidth, Math.max(minWidth, startWidth + delta));
        onWidthChange(next);
      };

      const onMouseUp = () => {
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);
    return () => handle.removeEventListener('mousedown', onMouseDown);
  }, [isOpen, onWidthChange, minWidth, maxWidth]);

  return (
    <aside
      className={`team-member-activity-panel ${isOpen ? 'open' : ''}${isOpen && width > minWidth ? ' team-member-activity-panel--overlay' : ''}`}
      role="dialog"
      aria-label="Team member activity"
      style={isOpen ? { width: `${width}px`, minWidth: `${width}px` } : undefined}
    >
      {isOpen && (
        <div
          ref={resizeRef}
          className="team-member-activity-panel-resize-handle"
          aria-label="Drag to resize panel"
        />
      )}
      <div className="team-member-activity-panel-header">
        <h2 className="team-member-activity-panel-title">Activity</h2>
        <button type="button" className="team-member-activity-panel-icon-btn" onClick={onClose} aria-label="Close">
          <img src={ICON_CLOSE} alt="" />
        </button>
      </div>

      {isOpen && (
        <>
          <TeamMemberActivityPanelFilters
            memberId={memberId}
            onMemberChange={setMemberId}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
          />

          <div className="team-member-activity-panel-content">
            <div className="team-member-activity-panel__stats">
              {TEAM_MEMBER_ACTIVITY_STATS.map((stat) => (
                <article key={stat.id} className="team-member-activity-panel-stat">
                  <p className="team-member-activity-panel-stat__value">
                    {stat.value} {stat.label}
                  </p>
                </article>
              ))}
            </div>

            <section className="team-member-activity-panel-downloads">
              <h3 className="team-member-activity-panel-downloads__title">
                {TEAM_MEMBER_ACTIVITY_DOWNLOAD_COUNT} Downloads
              </h3>
              <ul className="team-member-activity-panel-downloads__list">
                {TEAM_MEMBER_ACTIVITY_DOWNLOADS.map((download) => (
                  <TeamMemberActivityDownloadRow key={download.id} download={download} />
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </aside>
  );
}
