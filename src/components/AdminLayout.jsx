import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ADMIN_TABS } from '../constants/adminPage';
import { LAYOUT_COMPACT_MAX_WIDTH } from '../constants/layout';
import { ROUTE_ADMIN, ROUTE_PROJECT_DETAILS } from '../constants/routes';
import AdminSidebarUserMenu from './AdminSidebarUserMenu';
import { useThemeName } from '../utils/theme';

export default function AdminLayout({ children, pageTitle, headerActions }) {
  const theme = useThemeName();
  const isDark = theme === 'dark';
  const [mobileLayout, setMobileLayout] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${LAYOUT_COMPACT_MAX_WIDTH}px)`);
    const sync = () => setMobileLayout(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar" aria-label="Admin navigation">
        <div className="admin-layout__sidebar-top">
          <NavLink to={ROUTE_PROJECT_DETAILS} className="admin-layout__brand" aria-label="Back to APM">
            <img
              src={isDark ? '/APMLogo.svg' : '/APMLogo-lightmode.svg'}
              alt="APM"
              className="admin-layout__logo"
            />
          </NavLink>
        </div>
        <nav className="admin-layout__nav">
          <span className="admin-layout__nav-label">Admin</span>
          {ADMIN_TABS.map(({ id, label, to }) => (
            <NavLink
              key={id}
              to={to}
              end={to === ROUTE_ADMIN}
              className={({ isActive }) =>
                `admin-layout__nav-item${isActive ? ' admin-layout__nav-item--active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-layout__sidebar-footer">
          <AdminSidebarUserMenu />
        </div>
      </aside>

      <div className="admin-layout__main">
        {mobileLayout ? (
          <>
            <header className="admin-layout__mobile-header">
              <NavLink to={ROUTE_PROJECT_DETAILS} className="admin-layout__brand admin-layout__brand--mobile" aria-label="Back to APM">
                <img
                  src={isDark ? '/APMLogo.svg' : '/APMLogo-lightmode.svg'}
                  alt="APM"
                  className="admin-layout__logo"
                />
              </NavLink>
              <AdminSidebarUserMenu variant="mobile-header" />
            </header>
            <div className="admin-layout__mobile-nav-bar">
              <nav className="admin-layout__mobile-nav tabs" aria-label="Admin sections">
                {ADMIN_TABS.map(({ id, label, to }) => (
                  <NavLink
                    key={id}
                    to={to}
                    end={to === ROUTE_ADMIN}
                    className={({ isActive }) => `tab admin-layout__mobile-tab${isActive ? ' active' : ''}`}
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
              {headerActions ? (
                <div className="admin-layout__mobile-nav-actions">{headerActions}</div>
              ) : null}
            </div>
          </>
        ) : null}
        <div className="admin-layout__content">
          <header className="admin-page-header">
            <h1 className="admin-page-title">{pageTitle}</h1>
            {!mobileLayout && headerActions ? (
              <div className="admin-page-header__actions">{headerActions}</div>
            ) : null}
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
