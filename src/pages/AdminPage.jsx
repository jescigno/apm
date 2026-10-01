import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ADMIN_ACTIVITY_DEFAULT_DATE_FILTER, ADMIN_ACTIVITY_DEFAULT_TEAM_ID } from '../constants/adminActivity';
import { getAdminPhaseCapabilities, parseAdminPhase } from '../constants/adminPhases';
import { ADMIN_TEAM_DEFAULT_ID } from '../constants/adminTeam';
import { ADMIN_TABS, adminPageTitleFromPath, adminTabIdFromPath } from '../constants/adminPage';
import { ROUTE_ADMIN_TEAM } from '../constants/routes';
import AccountPersonalTab from '../components/AccountPersonalTab';
import AdminActivityTab, { AdminActivityFilters } from '../components/AdminActivityTab';
import AdminLayout from '../components/AdminLayout';
import AdminTeamTab, { AdminTeamHeaderActions, AdminTeamTitleDropdown } from '../components/AdminTeamTab';

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

export default function AdminPage({ onOpenMemberActivity, onAdminDashboardNav }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phaseCapabilities = getAdminPhaseCapabilities(parseAdminPhase(searchParams));
  const [activeTab, setActiveTab] = useState(() => adminTabIdFromPath(location.pathname));
  const [activityTeamFilter, setActivityTeamFilter] = useState(ADMIN_ACTIVITY_DEFAULT_TEAM_ID);
  const [teamId, setTeamId] = useState(ADMIN_TEAM_DEFAULT_ID);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [activityDateFilter, setActivityDateFilter] = useState(ADMIN_ACTIVITY_DEFAULT_DATE_FILTER);
  const [activityCustomDateRange, setActivityCustomDateRange] = useState({ start: null, end: null });

  useEffect(() => {
    setActiveTab(adminTabIdFromPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    if (phaseCapabilities.fullNav || location.pathname === ROUTE_ADMIN_TEAM) return;
    navigate({ pathname: ROUTE_ADMIN_TEAM, search: location.search }, { replace: true });
  }, [location.pathname, location.search, navigate, phaseCapabilities.fullNav]);

  const activePageTitle =
    activeTab === 'team' ? (
      <AdminTeamTitleDropdown
        teamId={teamId}
        onTeamChange={setTeamId}
        interactive={phaseCapabilities.teamDropdown}
      />
    ) : (
      adminPageTitleFromPath(location.pathname)
    );

  const headerActions =
    activeTab === 'activity' ? (
      <AdminActivityFilters
        teamFilter={activityTeamFilter}
        onTeamFilterChange={setActivityTeamFilter}
        dateFilter={activityDateFilter}
        customDateRange={activityCustomDateRange}
        onDateFilterChange={setActivityDateFilter}
        onCustomDateRangeChange={setActivityCustomDateRange}
      />
    ) : activeTab === 'team' ? (
      <AdminTeamHeaderActions
        onBulkImport={() => setBulkImportOpen(true)}
        onAddMembers={() => setAddOpen(true)}
        showBulkImport={phaseCapabilities.bulkImport}
      />
    ) : null;

  return (
    <AdminLayout
      pageTitle={activePageTitle}
      headerActions={headerActions}
      onAdminDashboardNav={onAdminDashboardNav}
    >
      {ADMIN_TABS.map(({ id }) => (
        <div
          key={id}
          id={`admin-panel-${id}`}
          role="tabpanel"
          aria-labelledby={`admin-tab-${id}`}
          hidden={activeTab !== id}
          className="admin-page-panel"
        >
          {id === 'activity' && (
            <AdminActivityTab
              teamFilter={activityTeamFilter}
              dateFilter={activityDateFilter}
              customDateRange={activityCustomDateRange}
            />
          )}
          {id === 'team' && (
            <AdminTeamTab
              teamId={teamId}
              bulkImportOpen={bulkImportOpen}
              onBulkImportOpenChange={setBulkImportOpen}
              addOpen={addOpen}
              onAddOpenChange={setAddOpen}
              onOpenMemberActivity={onOpenMemberActivity}
              showBulkImport={phaseCapabilities.bulkImport}
              showInviteMessage={phaseCapabilities.inviteMessage}
              showMemberActivity={phaseCapabilities.memberActivity}
            />
          )}
          {id === 'account' && <AccountPersonalTab />}
          {id === 'settings' && <AdminSettingsTab />}
          {id === 'notifications' && <AdminNotificationsTab />}
        </div>
      ))}
    </AdminLayout>
  );
}
