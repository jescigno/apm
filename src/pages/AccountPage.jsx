import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { LAYOUT_COMPACT_MAX_WIDTH } from '../constants/layout';
import { ACCOUNT_TABS } from '../constants/accountPage';
import { ROUTE_ACCOUNT, ROUTE_ACCOUNT_NOTIFICATIONS } from '../constants/routes';
import AccountPersonalTab from '../components/AccountPersonalTab';
import { HeaderMenuButton } from '../components/Header';
import AccountNotificationSettingsContent from '../components/AccountNotificationSettingsContent';
import AccountSettingsTab from '../components/AccountSettingsTab';

function AccountMobileTitlePortal({ headerMenuRef }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!headerMenuRef?.current) return undefined;
    return headerMenuRef.current.subscribe(setMenuOpen);
  }, [headerMenuRef]);

  return createPortal(
    <div className="account-page-mobile-header-bar">
      <h1 className="account-page-title project-mobile-hero__title account-page-title--mobile-portal" id="account-mobile-title">
        <span className="project-mobile-hero__title-clip">
          <span className="project-mobile-hero__title-text">My Account</span>
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

export default function AccountPage({ headerMenuRef }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileLayout, setMobileLayout] = useState(false);
  const [activeTab, setActiveTab] = useState(() =>
    location.pathname === ROUTE_ACCOUNT_NOTIFICATIONS ? 'notifications' : 'personal'
  );

  useEffect(() => {
    if (location.pathname === ROUTE_ACCOUNT_NOTIFICATIONS) {
      setActiveTab('notifications');
    }
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
    if (location.pathname === ROUTE_ACCOUNT_NOTIFICATIONS) {
      navigate(ROUTE_ACCOUNT);
    }
  };

  return (
    <div className="account-page">
      {mobileLayout && <AccountMobileTitlePortal headerMenuRef={headerMenuRef} />}
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
          </div>
        ))}
      </div>
    </div>
  );
}
