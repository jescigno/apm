import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ADMIN_TABS, adminPageTitleFromPath, adminTabIdFromPath } from '../constants/adminPage';
import AccountPersonalTab from '../components/AccountPersonalTab';
import AdminActivityTab, { AdminActivityFilters } from '../components/AdminActivityTab';
import AdminLayout from '../components/AdminLayout';
import AdminTeamTab from '../components/AdminTeamTab';

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

export default function AdminPage({ onOpenMemberActivity }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => adminTabIdFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(adminTabIdFromPath(location.pathname));
  }, [location.pathname]);

  const activePageTitle = adminPageTitleFromPath(location.pathname);

  const headerActions = activeTab === 'activity' ? <AdminActivityFilters /> : null;

  return (
    <AdminLayout pageTitle={activePageTitle} headerActions={headerActions}>
      {ADMIN_TABS.map(({ id }) => (
        <div
          key={id}
          id={`admin-panel-${id}`}
          role="tabpanel"
          aria-labelledby={`admin-tab-${id}`}
          hidden={activeTab !== id}
          className="admin-page-panel"
        >
          {id === 'activity' && <AdminActivityTab onOpenMemberActivity={onOpenMemberActivity} />}
          {id === 'team' && <AdminTeamTab onOpenMemberActivity={onOpenMemberActivity} />}
          {id === 'account' && <AccountPersonalTab />}
          {id === 'settings' && <AdminSettingsTab />}
          {id === 'notifications' && <AdminNotificationsTab />}
        </div>
      ))}
    </AdminLayout>
  );
}
