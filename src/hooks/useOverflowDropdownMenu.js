import { useState, useRef, useEffect, useLayoutEffect, useCallback, useId } from 'react';

/** @type {Map<string, Map<string, () => void>>} */
const openMenusByGroup = new Map();

function closeOtherMenusInGroup(group, exceptInstanceId) {
  const groupMenus = openMenusByGroup.get(group);
  if (!groupMenus) return;
  groupMenus.forEach((closeFn, id) => {
    if (exceptInstanceId != null && id === exceptInstanceId) return;
    closeFn();
  });
}

function registerOpenMenu(group, instanceId, closeFn) {
  closeOtherMenusInGroup(group, instanceId);
  const groupMenus = openMenusByGroup.get(group) ?? new Map();
  groupMenus.set(instanceId, closeFn);
  openMenusByGroup.set(group, groupMenus);
}

function unregisterMenu(group, instanceId) {
  const groupMenus = openMenusByGroup.get(group);
  if (!groupMenus) return;
  groupMenus.delete(instanceId);
  if (groupMenus.size === 0) openMenusByGroup.delete(group);
}

/**
 * Anchored overflow menu: positions on open (sync + layout), portals reliably,
 * ignores the opening pointer event for outside-close, and closes siblings in the same group.
 */
export function useOverflowDropdownMenu({ getStyle, deps = [], group = 'track-overflow-menu' } = {}) {
  const instanceId = useId();
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState(null);
  const triggerRef = useRef(null);
  const containerRef = useRef(null);
  const skipOutsideCloseRef = useRef(false);

  const close = useCallback(() => {
    setOpen(false);
    setStyle(null);
    unregisterMenu(group, instanceId);
  }, [group, instanceId]);

  const refreshStyle = useCallback(() => {
    const next = getStyle(triggerRef.current);
    if (next) setStyle(next);
  }, [getStyle]);

  const toggle = useCallback((event) => {
    event?.stopPropagation?.();
    if (open) {
      close();
      return;
    }
    closeOtherMenusInGroup('project-folder-row-menu', null);
    registerOpenMenu(group, instanceId, close);
    skipOutsideCloseRef.current = true;
    setOpen(true);
    refreshStyle();
  }, [open, close, group, instanceId, refreshStyle]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    refreshStyle();
    window.addEventListener('scroll', refreshStyle, true);
    window.addEventListener('resize', refreshStyle);
    return () => {
      window.removeEventListener('scroll', refreshStyle, true);
      window.removeEventListener('resize', refreshStyle);
    };
  }, [open, refreshStyle, ...deps]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event) => {
      if (skipOutsideCloseRef.current) {
        skipOutsideCloseRef.current = false;
        return;
      }
      const clickedMenuBtn = event.target.closest?.('.track-actions-menu-btn');
      if (clickedMenuBtn && clickedMenuBtn !== triggerRef.current) {
        close();
        return;
      }
      if (triggerRef.current?.contains(event.target)) return;
      if (containerRef.current?.contains(event.target)) return;
      if (event.target.closest?.('[data-track-dropdown-portal]')) return;
      close();
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [open, close]);

  useEffect(() => () => unregisterMenu(group, instanceId), [group, instanceId]);

  return { open, style, triggerRef, containerRef, toggle, close };
}

/** Close every open menu in a group (e.g. before opening one managed outside the hook). */
export function closeOverflowMenusInGroup(group) {
  closeOtherMenusInGroup(group, null);
}

/** Register a menu opened outside the hook so siblings in the same group close. */
export function registerOverflowMenuOpen(group, instanceId, closeFn) {
  registerOpenMenu(group, instanceId, closeFn);
}

export function unregisterOverflowMenu(group, instanceId) {
  unregisterMenu(group, instanceId);
}
