import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_TABS } from '../constants/adminPage';
import { LAYOUT_COMPACT_MAX_WIDTH } from '../constants/layout';
import {
  ROUTE_ADMIN,
  ROUTE_ADMIN_NOTIFICATIONS,
  ROUTE_ADMIN_SETTINGS,
  ROUTE_ADMIN_TEAM,
} from '../constants/routes';
import AdminActivityTab from '../components/AdminActivityTab';
import AdminTeamTab from '../components/AdminTeamTab';
import { HeaderMenuButton } from '../components/Header';

function AdminPlaceholderPanel({ title, description }) {
  return (
    <section className="account-card">
      <div className="account-card__header">
        <h2 className="account-card__title">{title}</h2>
      </div>
      <div className="account-card__body">
        <p className="account-contact__detail">{description}</p>
      </div>
    </section>
  );
}

function AdminSettingsTab() {
  return (
    <AdminPlaceholderPanel
      title="Settings"
      description="Configure admin preferences and organization defaults."
    />
  );
}

function AdminNotificationsTab() {
  return (
    <AdminPlaceholderPanel
      title="Notifications"
      description="Control admin notification preferences and delivery."
    />
  );
}

function tabIdFromPath(pathname) {
  if (pathname === ROUTE_ADMIN_TEAM) return 'team';
  if (pathname === ROUTE_ADMIN_SETTINGS) return 'settings';
  if (pathname === ROUTE_ADMIN_NOTIFICATIONS) return 'notifications';
  return 'activity';
}

function routeFromTabId(id) {
  if (id === 'team') return ROUTE_ADMIN_TEAM;
  if (id === 'settings') return ROUTE_ADMIN_SETTINGS;
  if (id === 'notifications') return ROUTE_ADMIN_NOTIFICATIONS;
  return ROUTE_ADMIN;
}

function AdminMobileTitlePortal({ headerMenuRef }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!headerMenuRef?.current) return undefined;
    return headerMenuRef.current.subscribe(setMenuOpen);
  }, [headerMenuRef]);

  return createPortal(
    <div className="account-page-mobile-header-bar">
      <h1 className="account-page-title project-mobile-hero__title account-page-title--mobile-portal" id="admin-mobile-title">
        <span className="project-mobile-hero__title-clip">
          <span className="project-mobile-hero__title-text">Admin</span>
        </span>
      </h1>
      <HeaderMenuButton
        open={menuOpen}
        onClick={() => headerMenuRef?.current?.toggleMenu()}
        className="account-page-mobile-header-bar__menu"
      />
    </div>,
    document.body
  );
}

export default function AdminPage({ headerMenuRef, onOpenMemberActivity }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileLayout, setMobileLayout] = useState(false);
  const [activeTab, setActiveTab] = useState(() => tabIdFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(tabIdFromPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${LAYOUT_COMPACT_MAX_WIDTH}px)`);
    const sync = () => setMobileLayout(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const handleTabChange = (id) => {
    setActiveTab(id);
    navigate(routeFromTabId(id));
  };

  return (
    <div className="account-page admin-page">
      {mobileLayout && <AdminMobileTitlePortal headerMenuRef={headerMenuRef} />}
      <div className="account-page-header project-mobile-hero">
        {!mobileLayout && (
          <h1 className="account-page-title project-mobile-hero__title" id="admin-title">
            <span className="project-mobile-hero__title-clip">
              <span className="project-mobile-hero__title-text">Admin</span>
            </span>
          </h1>
        )}
        <div className="account-page-tabs-row admin-page-tabs-row">
          <div className="account-page-tabs tabs" role="tablist" aria-label="Admin sections">
            {ADMIN_TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`admin-tab-${id}`}
                aria-selected={activeTab === id}
                aria-controls={`admin-panel-${id}`}
                data-tab={id}
                className={`tab ${activeTab === id ? 'active' : ''}`}
                onClick={() => handleTabChange(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="account-page-body">
        {ADMIN_TABS.map(({ id }) => (
          <div
            key={id}
            id={`admin-panel-${id}`}
            role="tabpanel"
            aria-labelledby={`admin-tab-${id}`}
            hidden={activeTab !== id}
            className="account-page-panel"
          >
            {id === 'activity' && <AdminActivityTab />}
            {id === 'team' && <AdminTeamTab onOpenMemberActivity={onOpenMemberActivity} />}
            {id === 'settings' && <AdminSettingsTab />}
            {id === 'notifications' && <AdminNotificationsTab />}
          </div>
        ))}
      </div>
    </div>
  );
}
