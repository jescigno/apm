import { useState, useRef, useEffect, useLayoutEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { ICON_CUSTOMIZE } from '../constants/designSystem';
import {
  DEFAULT_SEARCH_CUSTOMIZE,
  SEARCH_DISPLAY_FIELD_OPTIONS,
  SEARCH_LAYOUT_TYPES,
  SEARCH_LIST_LAYOUT_OPTIONS,
  SEARCH_POSTER_SIZE_OPTIONS,
} from '../constants/searchResultsCustomize';
import {
  registerOverflowMenuOpen,
  unregisterOverflowMenu,
  SEARCH_RESULTS_TOOLBAR_MENU_GROUP,
} from '../hooks/useOverflowDropdownMenu';
import Toggle from './Toggle';

function ListLayoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function GridLayoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function CustomizeFieldToggle({ label, checked, onChange }) {
  return (
    <div className="customize-view-menu-field">
      <span className="customize-view-menu-field-label">{label}</span>
      <Toggle
        label={`${label} ${checked ? 'on' : 'off'}`}
        checked={checked}
        accent
        onChange={onChange}
      />
    </div>
  );
}

function LayoutTypeToggle({ value, onChange }) {
  const isGrid = value === SEARCH_LAYOUT_TYPES.GRID;

  return (
    <div className="customize-view-menu-segment customize-view-menu-segment--layout" role="group" aria-label="View type">
      <button
        type="button"
        className={`customize-view-menu-segment-btn${!isGrid ? ' customize-view-menu-segment-btn--selected' : ''}`}
        aria-pressed={!isGrid}
        aria-label="List view"
        onClick={() => onChange(SEARCH_LAYOUT_TYPES.LIST)}
      >
        <ListLayoutIcon />
      </button>
      <button
        type="button"
        className={`customize-view-menu-segment-btn${isGrid ? ' customize-view-menu-segment-btn--selected' : ''}`}
        aria-pressed={isGrid}
        aria-label="Grid view"
        onClick={() => onChange(SEARCH_LAYOUT_TYPES.GRID)}
      >
        <GridLayoutIcon />
      </button>
    </div>
  );
}

function PosterSizeToggle({ value, onChange }) {
  return (
    <div className="customize-view-menu-segment customize-view-menu-segment--text" role="group" aria-label="Poster size">
      {SEARCH_POSTER_SIZE_OPTIONS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={`customize-view-menu-segment-btn customize-view-menu-segment-btn--text${value === id ? ' customize-view-menu-segment-btn--selected' : ''}`}
          aria-pressed={value === id}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ListLayoutDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState(null);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const selectedLabel =
    SEARCH_LIST_LAYOUT_OPTIONS.find((option) => option.id === value)?.label ?? 'Default';

  const updateDropdownRect = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setDropdownRect({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
      minWidth: Math.max(rect.width, 140),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateDropdownRect();
    window.addEventListener('scroll', updateDropdownRect, true);
    window.addEventListener('resize', updateDropdownRect);
    return () => {
      window.removeEventListener('scroll', updateDropdownRect, true);
      window.removeEventListener('resize', updateDropdownRect);
    };
  }, [open, updateDropdownRect]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event) => {
      const inWrap = wrapRef.current?.contains(event.target);
      const inDropdown = event.target.closest('[data-customize-layout-dropdown]');
      if (!inWrap && !inDropdown) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const toggleOpen = () => {
    if (open) {
      setOpen(false);
      setDropdownRect(null);
      return;
    }
    updateDropdownRect();
    setOpen(true);
  };

  return (
    <div className="customize-view-menu-field customize-view-menu-field--dropdown" ref={wrapRef}>
      <span className="customize-view-menu-field-label">Layout</span>
      <div className="customize-view-menu-dropdown-wrap">
        <button
          ref={triggerRef}
          type="button"
          className={`customize-view-menu-dropdown-trigger${open ? ' customize-view-menu-dropdown-trigger--open' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={toggleOpen}
        >
          <span className="customize-view-menu-dropdown-trigger-label">{selectedLabel}</span>
          <span className="customize-view-menu-dropdown-chevron" aria-hidden>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
        {open && dropdownRect && createPortal(
          <div
            data-customize-layout-dropdown
            className="customize-view-menu-dropdown track-actions-overflow-dropdown track-actions-overflow-dropdown--segment-style"
            role="listbox"
            aria-label="List layout"
            style={{
              position: 'fixed',
              top: dropdownRect.top,
              right: dropdownRect.right,
              minWidth: dropdownRect.minWidth,
              zIndex: 2200,
            }}
          >
            {SEARCH_LIST_LAYOUT_OPTIONS.map(({ id, label }) => {
              const isSelected = value === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`track-actions-overflow-dropdown-item customize-view-menu-dropdown-item${isSelected ? ' track-actions-overflow-dropdown-item--selected customize-view-menu-dropdown-item--selected' : ''}`}
                  onClick={() => {
                    onChange(id);
                    setOpen(false);
                    setDropdownRect(null);
                  }}
                >
                  <span className="customize-view-menu-dropdown-item-label">{label}</span>
                  {isSelected && (
                    <span className="customize-view-menu-dropdown-item-check" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}

export default function SearchCustomizeViewMenu({
  value = DEFAULT_SEARCH_CUSTOMIZE,
  onChange,
}) {
  const instanceId = useId();
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const skipOutsideCloseRef = useRef(false);

  const isGrid = value.layoutType === SEARCH_LAYOUT_TYPES.GRID;

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
      const inMenu = event.target.closest('[data-customize-view-menu-portal]');
      const inLayoutDropdown = event.target.closest('[data-customize-layout-dropdown]');
      if (!inWrap && !inMenu && !inLayoutDropdown) {
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

  const patch = (updates) => onChange?.({ ...value, ...updates });

  const patchDisplayField = (fieldId, enabled) => {
    onChange?.({
      ...value,
      displayFields: { ...value.displayFields, [fieldId]: enabled },
    });
  };

  const menu = open && createPortal(
    <div
      data-customize-view-menu-portal
      className="customize-view-menu customize-view-menu--search customize-view-menu--portal"
      role="dialog"
      aria-label="Customize view"
      style={{
        position: 'fixed',
        top: menuRect?.top ?? 0,
        right: menuRect?.right ?? 0,
        zIndex: 2100,
        visibility: menuRect ? 'visible' : 'hidden',
      }}
    >
      <div className="customize-view-menu-field customize-view-menu-field--primary">
        <span className="customize-view-menu-field-label">View</span>
        <LayoutTypeToggle
          value={value.layoutType}
          onChange={(layoutType) => patch({ layoutType })}
        />
      </div>

      {isGrid ? (
        <>
          <div className="customize-view-menu-field">
            <span className="customize-view-menu-field-label">Poster Size</span>
            <PosterSizeToggle
              value={value.posterSize}
              onChange={(posterSize) => patch({ posterSize })}
            />
          </div>
        </>
      ) : (
        <>
          <ListLayoutDropdown
            value={value.listLayout}
            onChange={(listLayout) => patch({ listLayout })}
          />
          {SEARCH_DISPLAY_FIELD_OPTIONS.map(({ id, label }) => (
            <CustomizeFieldToggle
              key={id}
              label={label}
              checked={Boolean(value.displayFields?.[id])}
              onChange={(enabled) => patchDisplayField(id, enabled)}
            />
          ))}
        </>
      )}
    </div>,
    document.body
  );

  return (
    <div className="customize-view-menu-wrap" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`btn-secondary customize-view-menu-trigger${open ? ' customize-view-menu-trigger--open' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggleOpen}
      >
        <img src={ICON_CUSTOMIZE} alt="" />
        CUSTOMIZE
      </button>
      {menu}
    </div>
  );
}
