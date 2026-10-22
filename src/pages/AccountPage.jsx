import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { LAYOUT_COMPACT_MAX_WIDTH } from '../constants/layout';
import { ACCOUNT_TABS } from '../constants/accountPage';
import { ADMIN_TEAM_DEFAULT_ID } from '../constants/adminTeam';
import { ROUTE_ACCOUNT, ROUTE_ACCOUNT_ADMIN, ROUTE_ACCOUNT_NOTIFICATIONS } from '../constants/routes';
import AccountPersonalTab from '../components/AccountPersonalTab';
import AdminTeamTab from '../components/AdminTeamTab';
import { HeaderMenuButton } from '../components/Header';
import AccountNotificationSettingsContent from '../components/AccountNotificationSettingsContent';
import AccountSettingsTab from '../components/AccountSettingsTab';

function accountTabFromPath(pathname) {
  if (pathname === ROUTE_ACCOUNT_NOTIFICATIONS) return 'notifications';
  if (pathname === ROUTE_ACCOUNT_ADMIN) return 'admin';
  return null;
}

function AccountMobileTitlePortal({ headerMenuRef, showMenu = true }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!showMenu || !headerMenuRef?.current) return undefined;
    return headerMenuRef.current.subscribe(setMenuOpen);
  }, [headerMenuRef, showMenu]);

  return createPortal(
    <div className="account-page-mobile-header-bar">
      <h1 className="account-page-title project-mobile-hero__title account-page-title--mobile-portal" id="account-mobile-title">
        <span className="project-mobile-hero__title-clip">
          <span className="project-mobile-hero__title-text">My Account</span>
        </span>
      </h1>
      {showMenu ? (
        <HeaderMenuButton
          open={menuOpen}
          onClick={() => headerMenuRef?.current?.toggleMenu()}
          className="account-page-mobile-header-bar__menu"
        />
      ) : null}
    </div>,
    document.body
  );
}

export default function AccountPage({ headerMenuRef }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileLayout, setMobileLayout] = useState(false);
  const [activeTab, setActiveTab] = useState(() => accountTabFromPath(location.pathname) ?? 'personal');
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const tabFromPath = accountTabFromPath(location.pathname);
    if (tabFromPath) setActiveTab(tabFromPath);
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
    if (id === 'notifications') {
      navigate(ROUTE_ACCOUNT_NOTIFICATIONS);
      return;
    }
    if (id === 'admin') {
      navigate(ROUTE_ACCOUNT_ADMIN);
      return;
    }
    if (location.pathname !== ROUTE_ACCOUNT) {
      navigate(ROUTE_ACCOUNT);
    }
  };

  return (
    <div className="account-page">
      {mobileLayout && (
        <AccountMobileTitlePortal
          headerMenuRef={headerMenuRef}
          showMenu={activeTab !== 'admin'}
        />
      )}
      <div className="account-page-header project-mobile-hero">
        {!mobileLayout && (
          <h1 className="account-page-title project-mobile-hero__title" id="account-mobile-title">
            <span className="project-mobile-hero__title-clip">
              <span className="project-mobile-hero__title-text">My Account</span>
            </span>
          </h1>
        )}
        <div className="account-page-tabs-row">
          <div className="account-page-tabs tabs" role="tablist" aria-label="My Account sections">
            {ACCOUNT_TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`account-tab-${id}`}
                aria-selected={activeTab === id}
                aria-controls={`account-panel-${id}`}
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
        {ACCOUNT_TABS.map(({ id }) => (
          <div
            key={id}
            id={`account-panel-${id}`}
            role="tabpanel"
            aria-labelledby={`account-tab-${id}`}
            hidden={activeTab !== id}
            className="account-page-panel"
          >
            {id === 'personal' && <AccountPersonalTab />}
            {id === 'settings' && <AccountSettingsTab />}
            {id === 'notifications' && (
              <AccountNotificationSettingsContent className="account-notification-settings-tab" />
            )}
            {id === 'admin' && (
              <>
                <AdminTeamTab
                  teamId={ADMIN_TEAM_DEFAULT_ID}
                  addOpen={addOpen}
                  onAddOpenChange={setAddOpen}
                  showBulkImport={false}
                  showMemberActivity={false}
                  showAddInToolbar
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
