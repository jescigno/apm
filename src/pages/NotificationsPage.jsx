import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { LAYOUT_COMPACT_MAX_WIDTH } from '../constants/layout';
import { ROUTE_ACCOUNT_NOTIFICATIONS } from '../constants/routes';
import AccountNotificationsTab from '../components/AccountNotificationsTab';

function NotificationsMobileTitlePortal({ onSettingsClick }) {
  return createPortal(
    <div className="account-page-mobile-header-bar account-page-mobile-header-bar--notifications">
      <h1 className="account-page-title project-mobile-hero__title account-page-title--mobile-portal" id="notifications-mobile-title">
        <span className="project-mobile-hero__title-clip">
          <span className="project-mobile-hero__title-text">Notifications</span>
        </span>
      </h1>
      <button
        type="button"
        className="account-notification__action account-notification__action--settings account-page-mobile-header-bar__settings"
        aria-label="Notification settings"
        onClick={onSettingsClick}
      >
        <img src="/icons/Settings.svg" alt="" />
      </button>
    </div>,
    document.body
  );
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [mobileLayout, setMobileLayout] = useState(false);

  const goToNotificationSettings = () => {
    navigate(ROUTE_ACCOUNT_NOTIFICATIONS);
  };

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${LAYOUT_COMPACT_MAX_WIDTH}px)`);
    const sync = () => setMobileLayout(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <div className="account-page notifications-page">
      {mobileLayout && (
        <NotificationsMobileTitlePortal onSettingsClick={goToNotificationSettings} />
      )}
      <div className="account-page-header project-mobile-hero">
        {!mobileLayout && (
          <h1 className="account-page-title project-mobile-hero__title" id="notifications-title">
            <span className="project-mobile-hero__title-clip">
              <span className="project-mobile-hero__title-text">Notifications</span>
            </span>
          </h1>
        )}
      </div>

      <div className="account-page-body">
        <AccountNotificationsTab
          hideToolbarSettings={mobileLayout}
          onSettingsClick={goToNotificationSettings}
        />
      </div>
    </div>
  );
}
