import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ADMIN_CURRENT_USER } from '../constants/adminPage';
import { ROUTE_PROJECT_DETAILS } from '../constants/routes';
import ThemeModeToggle from './ThemeModeToggle';

export default function AdminSidebarUserMenu({ variant = 'sidebar' }) {
  const navigate = useNavigate();
  const triggerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);
  const isMobileHeader = variant === 'mobile-header';

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const updateMenuRect = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuRect({
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
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
      if (target.closest?.('[data-admin-sidebar-user-menu]')) return;
      closeMenu();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, closeMenu]);

  const handleLogout = () => {
    closeMenu();
    navigate(ROUTE_PROJECT_DETAILS);
  };

  const menuStyle = isMobileHeader
    ? {
        position: 'fixed',
        right: menuRect ? window.innerWidth - menuRect.right : 0,
        top: menuRect ? menuRect.bottom + 8 : 0,
        minWidth: 200,
        visibility: menuRect ? 'visible' : 'hidden',
        zIndex: 2000,
      }
    : {
        position: 'fixed',
        left: menuRect?.left ?? 0,
        bottom: menuRect ? window.innerHeight - menuRect.top + 8 : 0,
        minWidth: menuRect?.width ?? undefined,
        visibility: menuRect ? 'visible' : 'hidden',
        zIndex: 2000,
      };

  const menu =
    menuOpen &&
    createPortal(
      <div
        className="admin-layout__user-menu"
        data-admin-sidebar-user-menu
        style={menuStyle}
        role="menu"
        aria-label="Account menu"
      >
        <div className="admin-layout__user-menu-mode">
          <span className="admin-layout__user-menu-mode-label">Mode</span>
          <ThemeModeToggle />
        </div>
        <div className="admin-layout__user-menu-divider" aria-hidden="true" />
        <button
          type="button"
          className="admin-layout__user-menu-item"
          role="menuitem"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>,
      document.body
    );

  return (
    <div
      className={`admin-layout__user-menu-wrap${isMobileHeader ? ' admin-layout__user-menu-wrap--mobile-header' : ''}`}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`admin-layout__user-trigger${isMobileHeader ? ' admin-layout__user-trigger--mobile-header' : ''}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`Account menu for ${ADMIN_CURRENT_USER.name}`}
        onClick={toggleMenu}
      >
        <span className="admin-layout__user-avatar" aria-hidden="true">
          {ADMIN_CURRENT_USER.initials}
        </span>
        <span className="admin-layout__user-name">{ADMIN_CURRENT_USER.name}</span>
      </button>
      {menu}
    </div>
  );
}
