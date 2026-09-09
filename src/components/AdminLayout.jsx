import { NavLink } from 'react-router-dom';
import { ADMIN_TABS } from '../constants/adminPage';
import { ROUTE_ADMIN, ROUTE_PROJECT_DETAILS } from '../constants/routes';
import AdminSidebarUserMenu from './AdminSidebarUserMenu';
import ThemeModeToggle from './ThemeModeToggle';
import { useThemeName } from '../utils/theme';

export default function AdminLayout({ children, pageTitle, headerActions }) {
  const theme = useThemeName();
  const isDark = theme === 'dark';

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
        <header className="admin-layout__mobile-header">
          <NavLink to={ROUTE_PROJECT_DETAILS} className="admin-layout__brand admin-layout__brand--mobile" aria-label="Back to APM">
            <img
              src={isDark ? '/APMLogo.svg' : '/APMLogo-lightmode.svg'}
              alt="APM"
              className="admin-layout__logo"
            />
          </NavLink>
          <h1 className="admin-layout__mobile-title">{pageTitle}</h1>
          <ThemeModeToggle className="admin-layout__mobile-theme-toggle" />
        </header>
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
        <div className="admin-layout__content">
          <header className="admin-page-header">
            <h1 className="admin-page-title">{pageTitle}</h1>
            {headerActions ? (
              <div className="admin-page-header__actions">{headerActions}</div>
            ) : null}
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
