import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ADMIN_ACTIVITY_DATE_FILTERS,
  ADMIN_ACTIVITY_DEFAULT_DATE_FILTER,
  ADMIN_ACTIVITY_DEFAULT_USER_STATUS_FILTERS,
  ADMIN_ACTIVITY_DOWNLOADS,
  ADMIN_ACTIVITY_STATS,
  ADMIN_ACTIVITY_USER_STATUS_FILTERS,
  ADMIN_ACTIVITY_USERS,
} from '../constants/adminActivity';
import { ICON_MORE_MENU, ICON_TRACK_DETAILS } from '../constants/designSystem';
import { getProfileColorVar } from '../constants/profileColors';

function AdminActivityUserFilterDropdown() {
  const triggerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState(
    () => new Set(ADMIN_ACTIVITY_DEFAULT_USER_STATUS_FILTERS)
  );

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const updateMenuRect = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuRect({ right: rect.right, bottom: rect.bottom });
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
      if (target.closest?.('[data-admin-activity-user-filter-menu]')) return;
      closeMenu();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [menuOpen, closeMenu]);

  const toggleStatus = (statusId) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(statusId)) next.delete(statusId);
      else next.add(statusId);
      return next;
    });
  };

  const filterMenu =
    menuOpen &&
    createPortal(
      <div
        className="admin-activity-filter-menu"
        data-admin-activity-user-filter-menu
        style={{
          position: 'fixed',
          right: menuRect ? window.innerWidth - menuRect.right : 0,
          top: menuRect ? menuRect.bottom + 4 : 0,
          visibility: menuRect ? 'visible' : 'hidden',
          zIndex: 2000,
        }}
        role="listbox"
        aria-label="User status filters"
        aria-multiselectable="true"
      >
        {ADMIN_ACTIVITY_USER_STATUS_FILTERS.map((option) => {
          const checked = selectedStatuses.has(option.id);
          return (
            <label key={option.id} className="admin-activity-filter-menu__option">
              <input
                type="checkbox"
                className="track-checkbox admin-activity-filter-menu__checkbox"
                checked={checked}
                onChange={() => toggleStatus(option.id)}
              />
              <span className="admin-activity-filter-menu__label">{option.label}</span>
            </label>
          );
        })}
      </div>,
      document.body
    );

  return (
    <div className="admin-activity-filter admin-activity-filter--dropdown">
      <button
        ref={triggerRef}
        type="button"
        className="admin-activity-filter__trigger"
        aria-haspopup="listbox"
        aria-expanded={menuOpen}
        onClick={toggleMenu}
      >
        Active Users
      </button>
      {filterMenu}
    </div>
  );
}

function AdminActivityDateFilterDropdown() {
  const triggerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState(ADMIN_ACTIVITY_DEFAULT_DATE_FILTER);

  const selectedLabel =
    ADMIN_ACTIVITY_DATE_FILTERS.find((option) => option.id === selectedDateFilter)?.label ?? 'Last 30 days';

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const updateMenuRect = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuRect({ right: rect.right, bottom: rect.bottom });
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
      if (target.closest?.('[data-admin-activity-date-filter-menu]')) return;
      closeMenu();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [menuOpen, closeMenu]);

  const selectDateFilter = (filterId) => {
    setSelectedDateFilter(filterId);
    closeMenu();
  };

  const filterMenu =
    menuOpen &&
    createPortal(
      <div
        className="admin-activity-filter-menu"
        data-admin-activity-date-filter-menu
        style={{
          position: 'fixed',
          right: menuRect ? window.innerWidth - menuRect.right : 0,
          top: menuRect ? menuRect.bottom + 4 : 0,
          visibility: menuRect ? 'visible' : 'hidden',
          zIndex: 2000,
        }}
        role="listbox"
        aria-label="Date filters"
      >
        {ADMIN_ACTIVITY_DATE_FILTERS.map((option) => {
          const checked = selectedDateFilter === option.id;
          return (
            <label
              key={option.id}
              className="admin-activity-filter-menu__option admin-activity-filter-menu__option--radio account-settings-radio"
            >
              <input
                type="radio"
                className="account-settings-radio__input"
                name="admin-activity-date-filter"
                value={option.id}
                checked={checked}
                onChange={() => selectDateFilter(option.id)}
              />
              <span
                className={`account-settings-radio-indicator${checked ? ' account-settings-radio-indicator--selected' : ''}`}
                aria-hidden="true"
              >
                <span className="account-settings-radio-indicator-dot" />
              </span>
              <span className="admin-activity-filter-menu__label">{option.label}</span>
            </label>
          );
        })}
      </div>,
      document.body
    );

  return (
    <div className="admin-activity-filter admin-activity-filter--dropdown">
      <button
        ref={triggerRef}
        type="button"
        className="admin-activity-filter__trigger"
        aria-haspopup="listbox"
        aria-expanded={menuOpen}
        onClick={toggleMenu}
      >
        {selectedLabel}
      </button>
      {filterMenu}
    </div>
  );
}

function AdminActivityFilters() {
  return (
    <div className="admin-activity-filters">
      <AdminActivityUserFilterDropdown />
      <AdminActivityDateFilterDropdown />
    </div>
  );
}

function AdminActivityStatCard({ value, label }) {
  return (
    <article className="admin-activity-stat">
      <p className="admin-activity-stat__value">{value}</p>
      <p className="admin-activity-stat__label">{label}</p>
    </article>
  );
}

function AdminActivityUserRow({ user }) {
  return (
    <li className="admin-activity-user-row">
      <span
        className="admin-activity-user-row__avatar"
        style={{ backgroundColor: getProfileColorVar(user.initials, 'cyan') }}
        aria-hidden="true"
      >
        {user.initials}
      </span>
      <div className="admin-activity-user-row__info">
        <p className="admin-activity-user-row__name">{user.name}</p>
        <p className="admin-activity-user-row__email">{user.email}</p>
      </div>
      <p className="admin-activity-user-row__meta">{user.lastLogin}</p>
    </li>
  );
}

function AdminActivityDownloadRow({ download }) {
  return (
    <li className="admin-activity-download-row">
      <div
        className="admin-activity-download-row__thumb"
        style={{ backgroundImage: `url('${download.thumbSrc}')` }}
        aria-hidden="true"
      />
      <div className="admin-activity-download-row__info">
        <p className="admin-activity-download-row__title">{download.title}</p>
        <p className="admin-activity-download-row__code">{download.code}</p>
      </div>
      <div className="admin-activity-download-row__actions">
        <button type="button" className="admin-activity-download-row__action" aria-label="Track details">
          <img src={ICON_TRACK_DETAILS} alt="" />
        </button>
        <button type="button" className="admin-activity-download-row__action" aria-label="Share">
          <img src="/icons/Share.svg" alt="" />
        </button>
        <button type="button" className="admin-activity-download-row__action" aria-label="Track info">
          <img src="/icons/TrackInfo.svg" alt="" />
        </button>
        <button type="button" className="admin-activity-download-row__action" aria-label="More options">
          <img src={ICON_MORE_MENU} alt="" />
        </button>
      </div>
    </li>
  );
}

export default function AdminActivityTab() {
  return (
    <div className="admin-activity">
      <div className="admin-activity-toolbar">
        <AdminActivityFilters />
      </div>

      <div className="admin-activity__stats">
        {ADMIN_ACTIVITY_STATS.map((stat) => (
          <AdminActivityStatCard key={stat.id} value={stat.value} label={stat.label} />
        ))}
      </div>

      <div className="admin-activity__content">
        <section className="admin-activity-users account-card">
          <div className="account-card__header admin-activity-users__header">
            <h2 className="account-card__title">Most Active Users</h2>
            <button type="button" className="admin-activity-users__view-all">
              View all users
            </button>
          </div>
          <ul className="admin-activity-users__list">
            {ADMIN_ACTIVITY_USERS.map((user) => (
              <AdminActivityUserRow key={user.id} user={user} />
            ))}
          </ul>
        </section>

        <aside className="admin-activity-downloads account-card">
          <div className="account-card__header admin-activity-downloads__header">
            <h2 className="account-card__title">Recent Downloads</h2>
          </div>
          <ul className="admin-activity-downloads__list">
            {ADMIN_ACTIVITY_DOWNLOADS.map((download) => (
              <AdminActivityDownloadRow key={download.id} download={download} />
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
