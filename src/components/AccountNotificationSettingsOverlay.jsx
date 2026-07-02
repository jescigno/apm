import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ALLOW_NOTIFICATION_OPTIONS,
  DEFAULT_ALLOW_NOTIFICATIONS,
  MUTED_PROJECTS,
} from '../constants/accountNotificationSettings';

function ProjectBellIcon({ muted }) {
  if (muted) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path
          d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 4l16 16" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path
        d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NotificationSettingsToggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`account-notification-settings-toggle${checked ? ' account-notification-settings-toggle--on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="account-notification-settings-toggle__slider" aria-hidden="true" />
    </button>
  );
}

export default function AccountNotificationSettingsOverlay({ open, onClose }) {
  const [allowNotifications, setAllowNotifications] = useState(() => ({
    ...DEFAULT_ALLOW_NOTIFICATIONS,
  }));
  const [mutedProjectIds, setMutedProjectIds] = useState(
    () => new Set(MUTED_PROJECTS.map(({ id }) => id))
  );

  useEffect(() => {
    if (!open) return undefined;

    setAllowNotifications({ ...DEFAULT_ALLOW_NOTIFICATIONS });
    setMutedProjectIds(new Set(MUTED_PROJECTS.map(({ id }) => id)));

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleAllowChange = (id, enabled) => {
    setAllowNotifications((prev) => ({ ...prev, [id]: enabled }));
  };

  const handleProjectMuteToggle = (id) => {
    setMutedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return createPortal(
    <div className="account-notification-settings-overlay" role="dialog" aria-modal="true" aria-labelledby="account-notification-settings-title">
      <div
        className="account-notification-settings-overlay__backdrop"
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close notification settings"
      />
      <div className="account-notification-settings-overlay__panel-wrap">
        <div className="account-notification-settings-overlay__panel">
          <div className="account-notification-settings-overlay__header">
            <h2 id="account-notification-settings-title" className="account-notification-settings-overlay__title">
              Notifications Settings
            </h2>
            <div className="account-notification-settings-overlay__header-actions">
              <button
                type="button"
                className="account-notification-settings-overlay__close"
                onClick={onClose}
                aria-label="Close notification settings"
              >
                <img src="/icons/Close.svg" alt="" />
              </button>
            </div>
          </div>

          <div className="account-notification-settings-overlay__body">
            <section className="account-notification-settings-section">
              <h3 className="account-settings-section-label account-notification-settings-section__label">
                Allow Notifications
              </h3>
              <div className="account-notification-settings-panel">
                <ul className="account-notification-settings-list">
                  {ALLOW_NOTIFICATION_OPTIONS.map(({ id, label }) => (
                    <li key={id} className="account-notification-settings-row">
                      <span className="account-notification-settings-row__label">{label}</span>
                      <NotificationSettingsToggle
                        label={label}
                        checked={allowNotifications[id]}
                        onChange={(enabled) => handleAllowChange(id, enabled)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="account-notification-settings-section account-notification-settings-section--muted">
              <h3 className="account-settings-section-label account-notification-settings-section__label">
                Muted Projects
              </h3>
              <div className="account-notification-settings-panel account-notification-settings-muted-scroll">
                <ul className="account-notification-settings-list">
                  {MUTED_PROJECTS.map(({ id, name }) => {
                    const muted = mutedProjectIds.has(id);

                    return (
                      <li key={id} className="account-notification-settings-row">
                        <span className="account-notification-settings-row__label">{name}</span>
                        <button
                          type="button"
                          className="account-notification-settings-row__bell-btn"
                          aria-label={muted ? `Unmute ${name}` : `Mute ${name}`}
                          onClick={() => handleProjectMuteToggle(id)}
                        >
                          <ProjectBellIcon muted={muted} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
