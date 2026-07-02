import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ICON_CUSTOMIZE } from '../constants/designSystem';

const DEFAULT_VIEW_OPTIONS = [
  { id: 'condensed', label: 'Condensed' },
  { id: 'expanded', label: 'Expanded' },
];

export default function CustomizeViewMenu({ viewMode = 'expanded', onViewModeChange, viewOptions = DEFAULT_VIEW_OPTIONS }) {
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const skipOutsideCloseRef = useRef(false);

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
      setOpen(false);
      setMenuRect(null);
      return;
    }
    skipOutsideCloseRef.current = true;
    updateMenuRect();
    setOpen(true);
  }, [open, updateMenuRect]);

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
      if (!inWrap && !inMenu) {
        setOpen(false);
        setMenuRect(null);
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

  const selectMode = (mode) => {
    onViewModeChange?.(mode);
    setOpen(false);
  };

  const menu = open && createPortal(
    <div
      data-customize-view-menu-portal
      className="customize-view-menu customize-view-menu--portal"
      role="menu"
      aria-label="Customize view"
      style={{
        position: 'fixed',
        top: menuRect?.top ?? 0,
        right: menuRect?.right ?? 0,
        zIndex: 2100,
        visibility: menuRect ? 'visible' : 'hidden',
      }}
    >
      {viewOptions.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="menuitemradio"
          aria-checked={viewMode === id}
          className="customize-view-menu-option"
          onClick={() => selectMode(id)}
        >
          <span
            className={`customize-view-menu-radio${viewMode === id ? ' customize-view-menu-radio--selected' : ''}`}
            aria-hidden="true"
          >
            <span className="customize-view-menu-radio-dot" />
          </span>
          <span className="customize-view-menu-label">{label}</span>
        </button>
      ))}
    </div>,
    document.body
  );

  return (
    <div className="customize-view-menu-wrap" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`btn-secondary customize-view-menu-trigger${open ? ' customize-view-menu-trigger--open' : ''}`}
        aria-haspopup="menu"
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
