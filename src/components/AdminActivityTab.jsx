import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ADMIN_ACTIVITY_DATE_FILTERS,
  ADMIN_ACTIVITY_DEFAULT_DATE_FILTER,
  ADMIN_ACTIVITY_DEFAULT_TEAM_ID,
  ADMIN_ACTIVITY_TEAMS,
  ADMIN_ACTIVITY_DEFAULT_USER_LIST_FILTER,
  ADMIN_ACTIVITY_DEFAULT_USER_LIST_SORT,
  ADMIN_ACTIVITY_AUDITIONS,
  ADMIN_ACTIVITY_DOWNLOADS,
  ADMIN_ACTIVITY_PROJECTS,
  ADMIN_ACTIVITY_SEARCHES,
  filterAdminActivityByTeam,
  filterAdminActivityFeedByDate,
  ADMIN_ACTIVITY_USER_LIST_FILTERS,
  ADMIN_ACTIVITY_USER_LIST_SORTS,
  ADMIN_ACTIVITY_USER_SORT_DIRECTION_LABELS,
  ADMIN_ACTIVITY_USERS,
  adminActivityDownloadToPlayerTrack,
  filterAdminActivityDownloadsByDate,
  filterAdminActivityUsersByDate,
  getAdminActivityStatsForRange,
  getAdminActivityTrendPeriodLabel,
  getAdminActivitySortActiveLabel,
} from '../constants/adminActivity';
import { getTrackMetadataForAdminDownload } from '../constants/trackMetadata';
import { SEARCH_SORT_DIRECTIONS } from '../constants/searchResultsSort';
import TrackMetadataOverlay from './TrackMetadataOverlay';
import {
  ICON_FOLDER_FILLED,
  ICON_PAUSE_IN_CIRCLE,
  ICON_PLAY_IN_CIRCLE_ON,
  ICON_SORT_ARROW_DOWN,
  ICON_SORT_ARROW_UP,
  ICON_UI_FILTER,
} from '../constants/designSystem';
import { usePlayer } from '../context/PlayerContext';
import { openSearchResultsInNewTab } from '../utils/searchUrl';
import { resolveThemedAsset, useThemeName } from '../utils/theme';
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
  filterModifierClass = '',
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
      className={`admin-activity-filter admin-activity-filter--dropdown${filterModifierClass ? ` ${filterModifierClass}` : ''}${iconOnly ? ' admin-activity-filter--icon-only' : ''}`}
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

function AdminActivityDateFilterDropdown({
  dateFilter,
  customDateRange,
  onDateFilterChange,
  onCustomDateRangeChange,
}) {
  const triggerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);

  const selectedLabel = useMemo(() => {
    if (dateFilter === 'custom' && customDateRange.start) {
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

    return ADMIN_ACTIVITY_DATE_FILTERS.find((option) => option.id === dateFilter)?.label ?? 'Last 30 days';
  }, [dateFilter, customDateRange]);

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
    onDateFilterChange(filterId);
    if (filterId !== 'custom') {
      closeMenu();
    }
  };

  const selectCustomDateRange = (range) => {
    onCustomDateRangeChange(range);
    onDateFilterChange('custom');
  };

  const filterMenu =
    menuOpen &&
    createPortal(
      <div
        className={`admin-activity-date-filter-panel${dateFilter === 'custom' ? ' admin-activity-date-filter-panel--with-picker' : ''}`}
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
            const checked = dateFilter === option.id;
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
        {dateFilter === 'custom' ? (
          <AdminActivityDatePicker
            value={customDateRange}
            onChange={selectCustomDateRange}
          />
        ) : null}
      </div>,
      document.body
    );

  return (
    <div className="admin-activity-filter admin-activity-filter--dropdown admin-activity-filter--date">
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

function AdminActivityTeamFilterDropdown({ teamFilter, onTeamFilterChange }) {
  const triggerLabel = useMemo(() => {
    const team = ADMIN_ACTIVITY_TEAMS.find(({ id }) => id === teamFilter);
    return team?.label ?? 'Team';
  }, [teamFilter]);

  return (
    <AdminActivitySelectDropdown
      options={ADMIN_ACTIVITY_TEAMS}
      value={teamFilter}
      onChange={onTeamFilterChange}
      triggerLabel={triggerLabel}
      menuAriaLabel="Team filters"
      menuDataAttr="admin-activity-team-filter"
      filterModifierClass="admin-activity-filter--team"
    />
  );
}

function AdminActivityFilters({
  teamFilter,
  onTeamFilterChange,
  dateFilter,
  customDateRange,
  onDateFilterChange,
  onCustomDateRangeChange,
}) {
  return (
    <div className="admin-activity-filters">
      <AdminActivityTeamFilterDropdown
        teamFilter={teamFilter}
        onTeamFilterChange={onTeamFilterChange}
      />
      <AdminActivityDateFilterDropdown
        dateFilter={dateFilter}
        customDateRange={customDateRange}
        onDateFilterChange={onDateFilterChange}
        onCustomDateRangeChange={onCustomDateRangeChange}
      />
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

function AdminActivityStatCard({
  statId,
  value,
  label,
  trend,
  trendDirection,
  trendPeriod,
  selected,
  onToggle,
}) {
  const trendLabel = `${trend > 0 ? '+' : ''}${trend}%`;

  return (
    <button
      type="button"
      className={`admin-activity-stat__card${selected ? ' admin-activity-stat__card--selected' : ''}`}
      aria-pressed={selected}
      aria-label={`${label}, ${value}`}
      onClick={() => onToggle(statId)}
    >
      <p className="admin-activity-stat__label">{label}</p>
      <div className="admin-activity-stat__footer">
        <p className="admin-activity-stat__value">{value}</p>
        <div className={`admin-activity-stat__trend admin-activity-stat__trend--${trendDirection}`}>
          <div className="admin-activity-stat__trend-row">
            <AdminActivityTrendIcon direction={trendDirection} />
            <span className="admin-activity-stat__trend-value">{trendLabel}</span>
          </div>
          <span className="admin-activity-stat__trend-period">{trendPeriod}</span>
        </div>
      </div>
    </button>
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
      <p className="admin-activity-user-row__meta">{user.recentActivity}</p>
    </li>
  );
}

function AdminActivityFeedRow({ item, layout = 'sidebar', variant = 'default' }) {
  const theme = useThemeName();
  const isMain = layout === 'main';
  const isProjectMain = isMain && variant === 'project';
  const metaText = isMain ? (item.activity ?? item.meta) : item.meta;

  return (
    <li
      className={`admin-activity-feed-row${isMain ? ' admin-activity-feed-row--main' : ''}${isProjectMain ? ' admin-activity-feed-row--main-project' : ''}`}
    >
      {isProjectMain ? (
        <span className="projects-panel-folder-glyph admin-activity-project-row__folder" aria-hidden>
          <img
            src={resolveThemedAsset(ICON_FOLDER_FILLED, theme)}
            alt=""
            className="projects-panel-folder-glyph-img"
            width="18"
            height="18"
          />
        </span>
      ) : null}
      <p className="admin-activity-feed-row__title">{item.title}</p>
      <p
        className={
          isMain
            ? 'admin-activity-feed-row__meta admin-activity-feed-row__activity'
            : 'admin-activity-feed-row__meta'
        }
      >
        {metaText}
      </p>
    </li>
  );
}

function AdminActivitySearchRow({ item, layout = 'sidebar' }) {
  const terms = item.terms ?? [item.title];
  const isMain = layout === 'main';
  const metaText = item.meta;

  return (
    <li
      className={`admin-activity-search-row${isMain ? ' admin-activity-search-row--main' : ''}`}
    >
      <div className="admin-activity-search-row__pills">
        {terms.map((term, index) => (
          <button
            key={`${item.id}-${index}`}
            type="button"
            className="admin-activity-search-row__pill"
            onClick={() => openSearchResultsInNewTab(terms)}
          >
            {term}
          </button>
        ))}
      </div>
      <p
        className={
          isMain
            ? 'admin-activity-search-row__meta admin-activity-search-row__activity'
            : 'admin-activity-search-row__meta'
        }
      >
        {metaText}
      </p>
    </li>
  );
}

function AdminActivityFeedSection({ title, items, variant = 'default', onTrackInfoClick }) {
  const listClassName =
    variant === 'download' ? 'admin-activity-downloads__list' : 'admin-activity-feed-section__list';

  return (
    <section className="admin-activity-feed-section">
      <h2 className="admin-activity-section-title">{title}</h2>
      <div className="admin-activity-feed-section__card account-card">
        <ul className={listClassName}>
          {items.map((item) => {
            if (variant === 'search') {
              return <AdminActivitySearchRow key={item.id} item={item} />;
            }
            if (variant === 'download') {
              return (
                <AdminActivityDownloadRow
                  key={item.id}
                  download={item}
                  onTrackInfoClick={onTrackInfoClick}
                />
              );
            }
            return <AdminActivityFeedRow key={item.id} item={item} />;
          })}
        </ul>
      </div>
    </section>
  );
}

function AdminActivityDownloadRow({
  download,
  onTrackInfoClick,
  layout = 'sidebar',
  onPlayClick,
  isCurrentTrack = false,
  isPlaying = false,
}) {
  const theme = useThemeName();
  const isMain = layout === 'main';
  const showPause = isMain && isCurrentTrack && isPlaying;

  return (
    <li className={`admin-activity-download-row${isMain ? ' admin-activity-download-row--main' : ''}`}>
      {isMain ? (
        <button
          type="button"
          className="admin-activity-download-row__play track-play-btn track-play-btn--play-in-circle"
          aria-label={showPause ? `Pause ${download.title}` : `Play ${download.title}`}
          onClick={() => onPlayClick?.(download)}
        >
          <img
            src={resolveThemedAsset(showPause ? ICON_PAUSE_IN_CIRCLE : ICON_PLAY_IN_CIRCLE_ON, theme)}
            alt=""
          />
        </button>
      ) : null}
      <div
        className="admin-activity-download-row__thumb"
        style={{ backgroundImage: `url('${download.thumbSrc}')` }}
        aria-hidden="true"
      />
      <div className="admin-activity-download-row__info">
        <p className="admin-activity-download-row__title">{download.title}</p>
        <div className="admin-activity-download-row__id-row track-id-row">
          <span className="admin-activity-download-row__code">{download.code}</span>
          <button
            type="button"
            className="track-id-icon-btn"
            aria-label="Track info"
            onClick={() => onTrackInfoClick?.(download)}
          >
            <img src="/icons/TrackInfo.svg" alt="" />
          </button>
        </div>
      </div>
      {isMain && download.meta ? (
        <p className="admin-activity-download-row__meta admin-activity-download-row__activity">{download.meta}</p>
      ) : null}
    </li>
  );
}

export default function AdminActivityTab({
  teamFilter = ADMIN_ACTIVITY_DEFAULT_TEAM_ID,
  dateFilter = ADMIN_ACTIVITY_DEFAULT_DATE_FILTER,
  customDateRange = { start: null, end: null },
}) {
  const [userListFilter, setUserListFilter] = useState(ADMIN_ACTIVITY_DEFAULT_USER_LIST_FILTER);
  const [userListSort, setUserListSort] = useState(ADMIN_ACTIVITY_DEFAULT_USER_LIST_SORT);
  const [selectedKpiId, setSelectedKpiId] = useState(null);
  const [trackMetadataDownload, setTrackMetadataDownload] = useState(null);

  const openTrackMetadata = useCallback((download) => {
    setTrackMetadataDownload(download);
  }, []);

  const closeTrackMetadata = useCallback(() => {
    setTrackMetadataDownload(null);
  }, []);

  const { playTrack, togglePlayPause, currentTrack, isPlaying } = usePlayer();

  const handlePlayActivityDownload = useCallback(
    (download, queueItems) => {
      const track = adminActivityDownloadToPlayerTrack(download);
      const queue = queueItems.map(adminActivityDownloadToPlayerTrack);
      if (currentTrack?.id === track.id) {
        togglePlayPause();
        return;
      }
      playTrack(track, queue);
    },
    [currentTrack?.id, playTrack, togglePlayPause]
  );

  const toggleKpiSelection = useCallback((statId) => {
    setSelectedKpiId((current) => (current === statId ? null : statId));
  }, []);

  useEffect(() => {
    setSelectedKpiId(null);
  }, [teamFilter]);

  const teamUsers = useMemo(
    () => filterAdminActivityByTeam(ADMIN_ACTIVITY_USERS, teamFilter),
    [teamFilter]
  );

  const teamDownloads = useMemo(
    () => filterAdminActivityByTeam(ADMIN_ACTIVITY_DOWNLOADS, teamFilter),
    [teamFilter]
  );

  const teamSearches = useMemo(
    () => filterAdminActivityByTeam(ADMIN_ACTIVITY_SEARCHES, teamFilter),
    [teamFilter]
  );

  const teamAuditions = useMemo(
    () => filterAdminActivityByTeam(ADMIN_ACTIVITY_AUDITIONS, teamFilter),
    [teamFilter]
  );

  const teamProjects = useMemo(
    () => filterAdminActivityByTeam(ADMIN_ACTIVITY_PROJECTS, teamFilter),
    [teamFilter]
  );

  const dateFilteredUsers = useMemo(
    () => filterAdminActivityUsersByDate(teamUsers, dateFilter, customDateRange),
    [teamUsers, dateFilter, customDateRange]
  );

  const dateFilteredDownloads = useMemo(
    () => filterAdminActivityDownloadsByDate(teamDownloads, dateFilter, customDateRange),
    [teamDownloads, dateFilter, customDateRange]
  );

  const visibleStats = useMemo(
    () =>
      getAdminActivityStatsForRange(dateFilter, customDateRange, {
        downloads: teamDownloads,
        searches: teamSearches,
        auditions: teamAuditions,
        projects: teamProjects,
      }),
    [dateFilter, customDateRange, teamDownloads, teamSearches, teamAuditions, teamProjects]
  );

  const trendPeriod = useMemo(
    () => getAdminActivityTrendPeriodLabel(dateFilter),
    [dateFilter]
  );

  const visibleUsers = useMemo(() => {
    let users = dateFilteredUsers;

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
      sorted.sort((a, b) => multiplier * a.recentActivity.localeCompare(b.recentActivity));
    } else if (field === 'most-active' && direction === SEARCH_SORT_DIRECTIONS.ASC) {
      sorted.reverse();
    }

    return sorted;
  }, [dateFilteredUsers, userListFilter, userListSort]);

  const visibleDownloads = useMemo(
    () =>
      [...dateFilteredDownloads]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .slice(0, 10),
    [dateFilteredDownloads]
  );

  const sortFeedByRecent = (items) =>
    [...items].sort((a, b) => b.activityAt.getTime() - a.activityAt.getTime());

  const visibleSearches = useMemo(
    () =>
      sortFeedByRecent(filterAdminActivityFeedByDate(teamSearches, dateFilter, customDateRange)).slice(
        0,
        10
      ),
    [teamSearches, dateFilter, customDateRange]
  );

  const visibleAuditions = useMemo(
    () =>
      sortFeedByRecent(filterAdminActivityFeedByDate(teamAuditions, dateFilter, customDateRange)).slice(
        0,
        10
      ),
    [teamAuditions, dateFilter, customDateRange]
  );

  const visibleProjects = useMemo(
    () =>
      sortFeedByRecent(filterAdminActivityFeedByDate(teamProjects, dateFilter, customDateRange)).slice(
        0,
        10
      ),
    [teamProjects, dateFilter, customDateRange]
  );

  const selectedKpiStat = useMemo(
    () => visibleStats.find((stat) => stat.id === selectedKpiId) ?? null,
    [visibleStats, selectedKpiId]
  );

  const mainSectionTitle = selectedKpiStat?.label ?? 'Recent Activity';

  return (
    <div className="admin-activity">
      <div className="admin-activity__stats">
        {visibleStats.map((stat) => (
          <AdminActivityStatCard
            key={stat.id}
            statId={stat.id}
            value={stat.value}
            label={stat.label}
            trend={stat.trend}
            trendDirection={stat.trendDirection}
            trendPeriod={trendPeriod}
            selected={selectedKpiId === stat.id}
            onToggle={toggleKpiSelection}
          />
        ))}
      </div>

      <div className="admin-activity__content">
        <section className="admin-activity-users">
          {selectedKpiId ? (
            <div className="admin-activity-section-header">
              <h2 className="admin-activity-section-title">{mainSectionTitle}</h2>
            </div>
          ) : (
            <AdminActivityListSectionHeader
              title={mainSectionTitle}
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
          )}
          <div className="admin-activity-users__card account-card">
            {selectedKpiId === 'downloads' ? (
              <ul className="admin-activity-downloads__list">
                {visibleDownloads.map((download) => (
                  <AdminActivityDownloadRow
                    key={download.id}
                    download={download}
                    layout="main"
                    onTrackInfoClick={openTrackMetadata}
                    onPlayClick={(item) => handlePlayActivityDownload(item, visibleDownloads)}
                    isCurrentTrack={currentTrack?.id === download.id}
                    isPlaying={isPlaying}
                  />
                ))}
              </ul>
            ) : selectedKpiId === 'searches' ? (
              <ul className="admin-activity-feed-section__list">
                {visibleSearches.map((item) => (
                  <AdminActivitySearchRow key={item.id} item={item} layout="main" />
                ))}
              </ul>
            ) : selectedKpiId === 'auditions' ? (
              <ul className="admin-activity-downloads__list">
                {visibleAuditions.map((item) => (
                  <AdminActivityDownloadRow
                    key={item.id}
                    download={item}
                    layout="main"
                    onTrackInfoClick={openTrackMetadata}
                    onPlayClick={(row) => handlePlayActivityDownload(row, visibleAuditions)}
                    isCurrentTrack={currentTrack?.id === item.id}
                    isPlaying={isPlaying}
                  />
                ))}
              </ul>
            ) : selectedKpiId === 'projects' ? (
              <ul className="admin-activity-feed-section__list">
                {visibleProjects.map((item) => (
                  <AdminActivityFeedRow key={item.id} item={item} layout="main" variant="project" />
                ))}
              </ul>
            ) : (
              <ul className="admin-activity-users__list">
                {visibleUsers.map((user) => (
                  <AdminActivityUserRow key={user.id} user={user} />
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside className="admin-activity-sidebar">
          <AdminActivityFeedSection title="Recent Searches" items={visibleSearches} variant="search" />
          <section className="admin-activity-downloads">
            <h2 className="admin-activity-section-title">Recent Downloads</h2>
            <div className="admin-activity-downloads__card account-card">
              <ul className="admin-activity-downloads__list">
                {visibleDownloads.map((download) => (
                  <AdminActivityDownloadRow
                    key={download.id}
                    download={download}
                    onTrackInfoClick={openTrackMetadata}
                  />
                ))}
              </ul>
            </div>
          </section>
          <AdminActivityFeedSection
            title="Recent Auditions"
            items={visibleAuditions}
            variant="download"
            onTrackInfoClick={openTrackMetadata}
          />
          <AdminActivityFeedSection title="Recent Projects" items={visibleProjects} variant="project" />
        </aside>
      </div>
      {trackMetadataDownload ? (
        <TrackMetadataOverlay
          track={getTrackMetadataForAdminDownload(trackMetadataDownload)}
          onClose={closeTrackMetadata}
        />
      ) : null}
    </div>
  );
}
