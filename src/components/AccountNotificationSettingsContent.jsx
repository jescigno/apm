import { useState } from 'react';
import {
  ALLOW_NOTIFICATION_OPTIONS,
  DEFAULT_ALLOW_NOTIFICATIONS,
  DEFAULT_MUTED_PROJECT_IDS,
  MUTED_PROJECTS,
} from '../constants/accountNotificationSettings';

import Toggle from './Toggle';

export default function AccountNotificationSettingsContent({ className = '' }) {
  const [allowNotifications, setAllowNotifications] = useState(() => ({
    ...DEFAULT_ALLOW_NOTIFICATIONS,
  }));
  const [mutedProjectIds, setMutedProjectIds] = useState(
    () => new Set(DEFAULT_MUTED_PROJECT_IDS)
  );

  const handleAllowChange = (id, enabled) => {
    setAllowNotifications((prev) => ({ ...prev, [id]: enabled }));
  };

  const handleProjectAllowChange = (id, allowed) => {
    setMutedProjectIds((prev) => {
      const next = new Set(prev);
      if (allowed) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={`account-notification-settings-content${className ? ` ${className}` : ''}`}>
      <section className="account-notification-settings-section">
        <h3 className="account-settings-section-label account-notification-settings-section__label">
          Allow Notifications
        </h3>
        <div className="account-notification-settings-panel">
          <ul className="account-notification-settings-list">
            {ALLOW_NOTIFICATION_OPTIONS.map(({ id, label, description }) => (
              <li key={id} className="account-notification-settings-row account-notification-settings-row--allow">
                <div className="account-notification-settings-row__copy">
                  <span className="account-notification-settings-row__label">{label}</span>
                  <span className="account-notification-settings-row__description">{description}</span>
                </div>
                <Toggle
                  label={label}
                  checked={allowNotifications[id]}
                  accent
                  onChange={(enabled) => handleAllowChange(id, enabled)}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="account-notification-settings-section account-notification-settings-section--projects">
        <h3 className="account-settings-section-label account-notification-settings-section__label">
          PROJECT NOTIFICATIONS
        </h3>
        <ul className="account-notification-settings-project-list account-notification-settings-muted-scroll">
          {MUTED_PROJECTS.map(({ id, name }) => {
            const allowed = !mutedProjectIds.has(id);

            return (
              <li key={id} className="account-notification-settings-project-card">
                <div className="account-notification-settings-row account-notification-settings-row--project">
                  <span className="account-notification-settings-row__label">{name}</span>
                  <Toggle
                    label={`Allow notifications for ${name}`}
                    checked={allowed}
                    accent
                    onChange={(enabled) => handleProjectAllowChange(id, enabled)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
