import { useState, useRef, useEffect, useLayoutEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { ICON_SORT } from '../constants/designSystem';
import {
  DEFAULT_SEARCH_SORT,
  SEARCH_SORT_DIRECTIONS,
  SEARCH_SORT_OPTIONS,
  getSearchSortDirectionLabel,
} from '../constants/searchResultsSort';
import {
  registerOverflowMenuOpen,
  unregisterOverflowMenu,
  SEARCH_RESULTS_TOOLBAR_MENU_GROUP,
} from '../hooks/useOverflowDropdownMenu';

function ArrowDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14" />
      <path d="M19 12l-7 7-7-7" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  );
}

export default function SearchSortMenu({
  value = DEFAULT_SEARCH_SORT,
  onChange,
  className = '',
}) {
  const instanceId = useId();
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const skipOutsideCloseRef = useRef(false);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setMenuRect(null);
    unregisterOverflowMenu(SEARCH_RESULTS_TOOLBAR_MENU_GROUP, instanceId);
  }, [instanceId]);

  const updateMenuRect = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setMenuRect({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
  }, []);

  const toggleOpen = useCallback(() => {
    if (open) {
      closeMenu();
      return;
    }
    registerOverflowMenuOpen(SEARCH_RESULTS_TOOLBAR_MENU_GROUP, instanceId, closeMenu);
    skipOutsideCloseRef.current = true;
    updateMenuRect();
    setOpen(true);
  }, [open, updateMenuRect, closeMenu, instanceId]);

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuRect();
    window.addEventListener('scroll', updateMenuRect, true);
    window.addEventListener('resize', updateMenuRect);
    return () => {
      window.removeEventListener('scroll', updateMenuRect, true);
      window.removeEventListener('resize', updateMenuRect);
    };
  }, [open, updateMenuRect]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event) => {
      if (skipOutsideCloseRef.current) {
        skipOutsideCloseRef.current = false;
        return;
      }
      const inWrap = wrapRef.current?.contains(event.target);
      const inMenu = event.target.closest('[data-search-sort-menu-portal]');
      if (!inWrap && !inMenu) {
        closeMenu();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [open, closeMenu]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, closeMenu]);

  useEffect(() => () => unregisterOverflowMenu(SEARCH_RESULTS_TOOLBAR_MENU_GROUP, instanceId), [instanceId]);

  const selectSort = (field, direction) => {
    onChange?.({
      field,
      direction: direction ?? (
        value.field === field ? value.direction : SEARCH_SORT_DIRECTIONS.ASC
      ),
    });
  };

  const toggleDirection = (field) => {
    const nextDirection = value.direction === SEARCH_SORT_DIRECTIONS.ASC
      ? SEARCH_SORT_DIRECTIONS.DESC
      : SEARCH_SORT_DIRECTIONS.ASC;
    selectSort(field, nextDirection);
  };

  const menu = open && createPortal(
    <div
      data-search-sort-menu-portal
      className="search-sort-menu search-sort-menu--portal"
      role="listbox"
      aria-label="Sort options"
      style={{
        position: 'fixed',
        top: menuRect?.top ?? 0,
        right: menuRect?.right ?? 0,
        zIndex: 2100,
        visibility: menuRect ? 'visible' : 'hidden',
      }}
    >
      {SEARCH_SORT_OPTIONS.map(({ id, label, directional }) => {
        const checked = value.field === id;
        const isAscending = value.direction === SEARCH_SORT_DIRECTIONS.ASC;
        const directionLabel = getSearchSortDirectionLabel(id, value.direction);

        return (
          <label
            key={id}
            className="search-sort-menu__option account-settings-radio"
          >
            <input
              type="radio"
              className="account-settings-radio__input"
              name="search-results-sort"
              value={id}
              checked={checked}
              onChange={() => selectSort(id)}
            />
            <span
              className={`account-settings-radio-indicator${checked ? ' account-settings-radio-indicator--selected' : ''}`}
              aria-hidden="true"
            >
              <span className="account-settings-radio-indicator-dot" />
            </span>
            <span className="search-sort-menu__label">{label}</span>
            <span className="search-sort-menu__direction-slot">
              {directional && checked ? (
                <button
                  type="button"
                  className="search-sort-menu__direction-toggle"
                  aria-label={`Sort by ${label} ${isAscending ? 'ascending' : 'descending'}. Click to reverse.`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleDirection(id);
                  }}
                >
                  <span className="search-sort-menu__direction-toggle-label">{directionLabel}</span>
                  {isAscending ? <ArrowDownIcon /> : <ArrowUpIcon />}
                </button>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>,
    document.body
  );

  return (
    <div className={`search-sort-menu-wrap${className ? ` ${className}` : ''}`} ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`btn-secondary search-sort-menu-trigger${open ? ' search-sort-menu-trigger--open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggleOpen}
      >
        <img src={ICON_SORT} alt="" />
        SORT
      </button>
      {menu}
    </div>
  );
}
