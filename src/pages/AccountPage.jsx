import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { LAYOUT_COMPACT_MAX_WIDTH } from '../constants/layout';
import {
  ACCOUNT_CONTACT_INFO,
  ACCOUNT_SUPPORT_CONTACTS,
  ACCOUNT_TABS,
} from '../constants/accountPage';
import { ROUTE_ACCOUNT, ROUTE_ACCOUNT_NOTIFICATIONS } from '../constants/routes';
import { HeaderMenuButton } from '../components/Header';
import AccountNotificationSettingsContent from '../components/AccountNotificationSettingsContent';
import AccountSettingsTab from '../components/AccountSettingsTab';

function AccountEditButton({ label }) {
  return (
    <button type="button" className="account-card__edit" aria-label={label}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path
          d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0 0-3L16.5 4.5a2.1 2.1 0 0 0-3 0L3 15v5z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M13.5 6.5l4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function AccountInfoCard({ title, editLabel, children }) {
  return (
    <section className="account-card">
      <div className="account-card__header">
        <h2 className="account-card__title">{title}</h2>
        <AccountEditButton label={editLabel} />
      </div>
      <div className="account-card__body">{children}</div>
    </section>
  );
}

function AccountContactInfoCard() {
  const { name, email, phone } = ACCOUNT_CONTACT_INFO;

  return (
    <AccountInfoCard title="Contact Info" editLabel="Edit contact info">
      <p className="account-contact__name">{name}</p>
      <p className="account-contact__detail">{email}</p>
      <p className="account-contact__detail">{phone}</p>
    </AccountInfoCard>
  );
}

function AccountPasswordCard() {
  return (
    <AccountInfoCard title="Password" editLabel="Edit password">
      <p className="account-password" aria-label="Password hidden">
        ••••••••••
      </p>
    </AccountInfoCard>
  );
}

function AccountSupportCard() {
  return (
    <section className="account-card account-card--support">
      <div className="account-card__header">
        <h2 className="account-card__title">Support</h2>
      </div>
      <div className="account-support-grid">
        {ACCOUNT_SUPPORT_CONTACTS.map((contact) => (
          <div key={contact.id} className="account-support-contact">
            <h3 className="account-support-contact__heading">{contact.sectionTitle}</h3>
            <div className="account-support-contact__profile">
              <img
                src={contact.avatarSrc}
                alt=""
                className="account-support-contact__avatar"
                width={48}
                height={48}
              />
              <div className="account-support-contact__details">
                <p className="account-support-contact__name">{contact.name}</p>
                {contact.titleLines.map((line) => (
                  <p key={line} className="account-support-contact__meta">
                    {line}
                  </p>
                ))}
                <p className="account-support-contact__meta">{contact.phone}</p>
                <a href={`mailto:${contact.email}`} className="account-support-contact__email">
                  {contact.email}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AccountPersonalTab() {
  return (
    <div className="account-personal-grid">
      <div className="account-personal-grid__left">
        <AccountContactInfoCard />
        <AccountPasswordCard />
      </div>
      <div className="account-personal-grid__right">
        <AccountSupportCard />
      </div>
    </div>
  );
}

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
