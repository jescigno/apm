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
import {
  CustomizeFieldToggle,
  LayoutTypeToggle,
  ListLayoutDropdown,
  PosterSizeToggle,
} from './customizeViewControls';

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
      {isGrid ? (
        <div className="customize-view-menu-field">
          <span className="customize-view-menu-field-label">Poster Size</span>
          <PosterSizeToggle
            value={value.posterSize}
            onChange={(posterSize) => patch({ posterSize })}
            options={SEARCH_POSTER_SIZE_OPTIONS}
          />
        </div>
      ) : (
        <>
          <ListLayoutDropdown
            value={value.listLayout}
            onChange={(listLayout) => patch({ listLayout })}
            options={SEARCH_LIST_LAYOUT_OPTIONS}
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
    <>
      <LayoutTypeToggle
        value={value.layoutType}
        onChange={(layoutType) => patch({ layoutType })}
      />
      <div className="customize-view-menu-wrap" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`btn-secondary customize-view-menu-trigger${open ? ' customize-view-menu-trigger--open' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggleOpen}
        aria-label="Customize view"
      >
        <img src={ICON_CUSTOMIZE} alt="" />
        <span className="tracks-toolbar-btn-label">CUSTOMIZE</span>
      </button>
      {menu}
      </div>
    </>
  );
}
