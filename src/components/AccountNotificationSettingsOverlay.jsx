import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import AccountNotificationSettingsContent from './AccountNotificationSettingsContent';

export default function AccountNotificationSettingsOverlay({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

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
                <img src="/icons/close.svg" alt="" />
              </button>
            </div>
          </div>

          <AccountNotificationSettingsContent className="account-notification-settings-overlay__body" />
        </div>
      </div>
    </div>,
    document.body
  );
}
