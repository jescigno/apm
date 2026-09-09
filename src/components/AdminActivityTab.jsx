import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ADMIN_ACTIVITY_DATE_FILTERS,
  ADMIN_ACTIVITY_DEFAULT_DATE_FILTER,
  ADMIN_ACTIVITY_DEFAULT_USER_STATUS_FILTERS,
  getAdminActivityMemberStatusFilterLabel,
  ADMIN_ACTIVITY_DEFAULT_USER_LIST_FILTER,
  ADMIN_ACTIVITY_DEFAULT_USER_LIST_SORT,
  ADMIN_ACTIVITY_DEFAULT_DOWNLOAD_LIST_FILTER,
  ADMIN_ACTIVITY_DEFAULT_DOWNLOAD_LIST_SORT,
  ADMIN_ACTIVITY_DOWNLOADS,
  ADMIN_ACTIVITY_DOWNLOAD_LIST_FILTERS,
  ADMIN_ACTIVITY_DOWNLOAD_LIST_SORTS,
  ADMIN_ACTIVITY_DOWNLOAD_SORT_DIRECTION_LABELS,
  ADMIN_ACTIVITY_STATS,
  ADMIN_ACTIVITY_USER_LIST_FILTERS,
  ADMIN_ACTIVITY_USER_LIST_SORTS,
  ADMIN_ACTIVITY_USER_MORE_ACTIONS,
  ADMIN_ACTIVITY_USER_SORT_DIRECTION_LABELS,
  ADMIN_ACTIVITY_USER_STATUS_FILTERS,
  ADMIN_ACTIVITY_USERS,
  getAdminActivitySortActiveLabel,
} from '../constants/adminActivity';
import { SEARCH_SORT_DIRECTIONS } from '../constants/searchResultsSort';
import {
  ICON_ARCHIVE,
  ICON_MORE_MENU,
  ICON_SORT_ARROW_DOWN,
  ICON_SORT_ARROW_UP,
  ICON_TRACK_DETAILS,
  ICON_UI_FILTER,
} from '../constants/designSystem';
import { getProfileColorVar } from '../constants/profileColors';
import AdminActivityDatePicker from './AdminActivityDatePicker';
import SearchSortMenu from './SearchSortMenu';

function AdminActivitySortIcon({ direction = 'down' }) {
  const iconSrc = direction === 'up' ? ICON_SORT_ARROW_UP : ICON_SORT_ARROW_DOWN;

  return (
    <img
      src={iconSrc}
      alt=""
      className="admin-activity-sort-icon"
      aria-hidden="true"
    />
  );
}

function AdminActivitySelectDropdown({
  options,
  value,
  onChange,
  triggerLabel,
  menuAriaLabel,
  menuDataAttr,
  iconSrc,
  triggerIcon,
  iconOnly = false,
}) {
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
    setMenuRect({
      right: rect.right,
      bottom: rect.bottom,
      center: rect.left + rect.width / 2,
    });
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
      if (target.closest?.(`[data-admin-activity-dropdown-menu="${menuDataAttr}"]`)) return;
      closeMenu();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [menuOpen, closeMenu, menuDataAttr]);

  const filterMenu =
    menuOpen &&
    createPortal(
      <div
        className="admin-activity-filter-menu"
        data-admin-activity-dropdown-menu={menuDataAttr}
        style={{
          position: 'fixed',
          ...(iconOnly
            ? {
                left: menuRect?.center ?? 0,
                transform: 'translateX(-50%)',
              }
            : {
                right: menuRect ? window.innerWidth - menuRect.right : 0,
              }),
          top: menuRect ? menuRect.bottom + 4 : 0,
          visibility: menuRect ? 'visible' : 'hidden',
          zIndex: 2000,
        }}
        role="listbox"
        aria-label={menuAriaLabel}
      >
        {options.map((option) => {
          const checked = value === option.id;
          return (
            <label
              key={option.id}
              className="admin-activity-filter-menu__option admin-activity-filter-menu__option--radio account-settings-radio"
            >
              <input
                type="radio"
                className="account-settings-radio__input"
                name={menuDataAttr}
                value={option.id}
                checked={checked}
                onChange={() => {
                  onChange(option.id);
                  closeMenu();
                }}
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

  const hasIcon = Boolean(iconSrc || triggerIcon);

  return (
    <div
      className={`admin-activity-filter admin-activity-filter--dropdown${iconOnly ? ' admin-activity-filter--icon-only' : ''}`}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`admin-activity-filter__trigger${hasIcon ? ' admin-activity-filter__trigger--with-icon' : ''}${iconOnly ? ' admin-activity-filter__trigger--icon-only' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={menuOpen}
        aria-label={iconOnly ? menuAriaLabel : undefined}
        onClick={toggleMenu}
      >
        {triggerIcon ?? (iconSrc ? <img src={iconSrc} alt="" className="admin-activity-filter__trigger-icon" aria-hidden="true" /> : null)}
        {!iconOnly ? triggerLabel : null}
      </button>
      {filterMenu}
    </div>
  );
}

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

  const triggerLabel = useMemo(
    () => getAdminActivityMemberStatusFilterLabel(selectedStatuses),
    [selectedStatuses]
  );

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
        aria-label="Member status filters"
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
        {triggerLabel}
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
  const [customDateRange, setCustomDateRange] = useState({ start: null, end: null });

  const selectedLabel = useMemo(() => {
    if (selectedDateFilter === 'custom' && customDateRange.start) {
      const formatDate = (date) => date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      if (customDateRange.end) {
        return `${formatDate(customDateRange.start)} – ${formatDate(customDateRange.end)}`;
      }

      return formatDate(customDateRange.start);
    }

    return ADMIN_ACTIVITY_DATE_FILTERS.find((option) => option.id === selectedDateFilter)?.label ?? 'Last 30 days';
  }, [selectedDateFilter, customDateRange]);

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
      if (target.closest?.('[data-admin-activity-date-picker]')) return;
      closeMenu();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [menuOpen, closeMenu]);

  const selectDateFilter = (filterId) => {
    setSelectedDateFilter(filterId);
    if (filterId !== 'custom') {
      closeMenu();
    }
  };

  const selectCustomDateRange = (range) => {
    setCustomDateRange(range);
    setSelectedDateFilter('custom');
  };

  const filterMenu =
    menuOpen &&
    createPortal(
      <div
        className={`admin-activity-date-filter-panel${selectedDateFilter === 'custom' ? ' admin-activity-date-filter-panel--with-picker' : ''}`}
        data-admin-activity-date-filter-menu
        style={{
          position: 'fixed',
          right: menuRect ? window.innerWidth - menuRect.right : 0,
          top: menuRect ? menuRect.bottom + 4 : 0,
          visibility: menuRect ? 'visible' : 'hidden',
          zIndex: 2000,
        }}
      >
        <div className="admin-activity-filter-menu" role="listbox" aria-label="Date filters">
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
        </div>
        {selectedDateFilter === 'custom' ? (
          <AdminActivityDatePicker
            value={customDateRange}
            onChange={selectCustomDateRange}
          />
        ) : null}
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

export { AdminActivityFilters };

function AdminActivityListSectionHeader({
  title,
  filter,
  sort,
  onFilterChange,
  onSortChange,
  filterOptions,
  sortOptions,
  sortDirectionLabels,
  filterMenuDataAttr,
  sortMenuDataAttr,
  filterMenuAriaLabel,
  sortMenuAriaLabel,
}) {
  const activeSortDirection = sort.direction === SEARCH_SORT_DIRECTIONS.ASC ? 'up' : 'down';

  return (
    <div className="admin-activity-section-header">
      <h2 className="admin-activity-section-title">{title}</h2>
      <AdminActivitySelectDropdown
        options={filterOptions}
        value={filter}
        onChange={onFilterChange}
        iconSrc={ICON_UI_FILTER}
        iconOnly
        menuAriaLabel={filterMenuAriaLabel}
        menuDataAttr={filterMenuDataAttr}
      />
      <SearchSortMenu
        value={sort}
        onChange={onSortChange}
        options={sortOptions}
        directionLabels={sortDirectionLabels}
        getActiveLabel={(value) => getAdminActivitySortActiveLabel(value, sortOptions)}
        triggerVariant="icon"
        triggerIcon={<AdminActivitySortIcon direction={activeSortDirection} />}
        menuAriaLabel={sortMenuAriaLabel}
        portalDataAttr={sortMenuDataAttr}
        menuGroup={null}
        radioName={sortMenuDataAttr}
        className="admin-activity-sort-menu-wrap"
      />
    </div>
  );
}

function AdminActivityTrendIcon({ direction }) {
  const isUp = direction === 'up';

  return (
    <svg
      className={`admin-activity-stat__trend-icon admin-activity-stat__trend-icon--${direction}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      {isUp ? (
        <path
          d="M1 11L5 7L8.5 10.5L15 4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M1 5L5 9L8.5 5.5L15 12"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function AdminActivityStatCard({ value, label, trend, trendDirection }) {
  const trendLabel = `${trend > 0 ? '+' : ''}${trend}%`;

  return (
    <article className="admin-activity-stat__card">
      <p className="admin-activity-stat__label">{label}</p>
      <div className="admin-activity-stat__footer">
        <p className="admin-activity-stat__value">{value}</p>
        <div className={`admin-activity-stat__trend admin-activity-stat__trend--${trendDirection}`}>
          <div className="admin-activity-stat__trend-row">
            <AdminActivityTrendIcon direction={trendDirection} />
            <span className="admin-activity-stat__trend-value">{trendLabel}</span>
          </div>
          <span className="admin-activity-stat__trend-period">this month</span>
        </div>
      </div>
    </article>
  );
}

function AdminActivityUserMoreMenuIcon({ actionId }) {
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

function AdminActivityUserRow({ user, onOpenMemberActivity }) {
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
      if (target.closest?.('[data-admin-activity-user-more-menu]')) return;
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
        data-admin-activity-user-more-menu
        style={{
          position: 'fixed',
          right: menuRect ? window.innerWidth - menuRect.right : 0,
          top: menuRect ? menuRect.bottom + 4 : 0,
          visibility: menuRect ? 'visible' : 'hidden',
          zIndex: 2000,
        }}
        role="menu"
        aria-label={`Actions for ${user.name}`}
      >
        {ADMIN_ACTIVITY_USER_MORE_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            role="menuitem"
            className="admin-team-more-menu__item"
            onClick={() => {
              if (action.id === 'activity') {
                onOpenMemberActivity?.({
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  initials: user.initials,
                });
              }
              closeMenu();
            }}
          >
            <AdminActivityUserMoreMenuIcon actionId={action.id} />
            {action.label}
          </button>
        ))}
      </div>,
      document.body
    );

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
      <button
        ref={menuBtnRef}
        type="button"
        className="admin-activity-user-row__more-btn"
        aria-label={`More actions for ${user.name}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={toggleMenu}
      >
        <img src={ICON_MORE_MENU} alt="" aria-hidden="true" />
      </button>
      {moreMenu}
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
        <button
          type="button"
          className="admin-activity-download-row__action admin-activity-download-row__action--more"
          aria-label="More options"
        >
          <img src={ICON_MORE_MENU} alt="" />
        </button>
      </div>
    </li>
  );
}

export default function AdminActivityTab({ onOpenMemberActivity }) {
  const [userListFilter, setUserListFilter] = useState(ADMIN_ACTIVITY_DEFAULT_USER_LIST_FILTER);
  const [userListSort, setUserListSort] = useState(ADMIN_ACTIVITY_DEFAULT_USER_LIST_SORT);
  const [downloadListFilter, setDownloadListFilter] = useState(ADMIN_ACTIVITY_DEFAULT_DOWNLOAD_LIST_FILTER);
  const [downloadListSort, setDownloadListSort] = useState(ADMIN_ACTIVITY_DEFAULT_DOWNLOAD_LIST_SORT);

  const visibleUsers = useMemo(() => {
    let users = ADMIN_ACTIVITY_USERS;

    if (userListFilter !== 'all') {
      users = users.filter((user) => user.status === userListFilter);
    }

    const sorted = [...users];
    const { field, direction } = userListSort;

    if (field === 'name') {
      const multiplier = direction === SEARCH_SORT_DIRECTIONS.ASC ? 1 : -1;
      sorted.sort((a, b) => multiplier * a.name.localeCompare(b.name));
    } else if (field === 'last-login') {
      const multiplier = direction === SEARCH_SORT_DIRECTIONS.ASC ? 1 : -1;
      sorted.sort((a, b) => multiplier * a.lastLogin.localeCompare(b.lastLogin));
    } else if (field === 'most-active' && direction === SEARCH_SORT_DIRECTIONS.ASC) {
      sorted.reverse();
    }

    return sorted;
  }, [userListFilter, userListSort]);

  const visibleDownloads = useMemo(() => {
    let downloads = ADMIN_ACTIVITY_DOWNLOADS;

    if (downloadListFilter !== 'all') {
      downloads = downloads.filter((download) => download.type === downloadListFilter.slice(0, -1));
    }

    const sorted = [...downloads];
    const { field, direction } = downloadListSort;

    if (field === 'title') {
      const multiplier = direction === SEARCH_SORT_DIRECTIONS.ASC ? 1 : -1;
      sorted.sort((a, b) => multiplier * a.title.localeCompare(b.title));
    } else if (field === 'code') {
      const multiplier = direction === SEARCH_SORT_DIRECTIONS.ASC ? 1 : -1;
      sorted.sort((a, b) => multiplier * a.code.localeCompare(b.code));
    } else if (field === 'most-recent') {
      sorted.sort((a, b) => {
        const cmp = a.sortOrder - b.sortOrder;
        return direction === SEARCH_SORT_DIRECTIONS.DESC ? cmp : -cmp;
      });
    }

    return sorted;
  }, [downloadListFilter, downloadListSort]);

  return (
    <div className="admin-activity">
      <div className="admin-activity__stats">
        {ADMIN_ACTIVITY_STATS.map((stat) => (
          <AdminActivityStatCard
            key={stat.id}
            value={stat.value}
            label={stat.label}
            trend={stat.trend}
            trendDirection={stat.trendDirection}
          />
        ))}
      </div>

      <div className="admin-activity__content">
        <section className="admin-activity-users">
          <AdminActivityListSectionHeader
            title="Members"
            filter={userListFilter}
            sort={userListSort}
            onFilterChange={setUserListFilter}
            onSortChange={setUserListSort}
            filterOptions={ADMIN_ACTIVITY_USER_LIST_FILTERS}
            sortOptions={ADMIN_ACTIVITY_USER_LIST_SORTS}
            sortDirectionLabels={ADMIN_ACTIVITY_USER_SORT_DIRECTION_LABELS}
            filterMenuDataAttr="users-filter"
            sortMenuDataAttr="users-sort"
            filterMenuAriaLabel="Filter members"
            sortMenuAriaLabel="Sort members"
          />
          <div className="admin-activity-users__card account-card">
            <ul className="admin-activity-users__list">
              {visibleUsers.map((user) => (
                <AdminActivityUserRow key={user.id} user={user} onOpenMemberActivity={onOpenMemberActivity} />
              ))}
            </ul>
          </div>
        </section>

        <aside className="admin-activity-downloads">
          <AdminActivityListSectionHeader
            title="Recent Downloads"
            filter={downloadListFilter}
            sort={downloadListSort}
            onFilterChange={setDownloadListFilter}
            onSortChange={setDownloadListSort}
            filterOptions={ADMIN_ACTIVITY_DOWNLOAD_LIST_FILTERS}
            sortOptions={ADMIN_ACTIVITY_DOWNLOAD_LIST_SORTS}
            sortDirectionLabels={ADMIN_ACTIVITY_DOWNLOAD_SORT_DIRECTION_LABELS}
            filterMenuDataAttr="downloads-filter"
            sortMenuDataAttr="downloads-sort"
            filterMenuAriaLabel="Filter downloads"
            sortMenuAriaLabel="Sort downloads"
          />
          <div className="admin-activity-downloads__card account-card">
            <ul className="admin-activity-downloads__list">
              {visibleDownloads.map((download) => (
                <AdminActivityDownloadRow key={download.id} download={download} />
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
