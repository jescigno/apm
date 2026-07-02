import { useCallback, useEffect, useRef, useState } from 'react';
import { ACCOUNT_NOTIFICATIONS } from '../constants/accountNotifications';
import { getProfileColorVar } from '../constants/profileColors';
import AccountNotificationSettingsOverlay from './AccountNotificationSettingsOverlay';

function NotificationBellIcon({ muted }) {
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

function NotificationMessage({ parts }) {
  return (
    <p className="account-notification__message">
      {parts.map(([text, bold], index) =>
        bold ? (
          <strong key={index}>{text}</strong>
        ) : (
          <span key={index}>{text}</span>
        )
      )}
    </p>
  );
}

function AccountNotificationRow({
  notification,
  selected,
  onSelectChange,
  onMuteToggle,
  mobileLayout = false,
  selectionMode = false,
}) {
  const { initials, parts, timestamp, bellMuted } = notification;
  const showCheckbox = !mobileLayout || selectionMode;
  const useRowTapSelect = mobileLayout && !selectionMode;

  const handleRowSelect = () => {
    onSelectChange(notification.id, !selected);
  };

  const handleRowKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleRowSelect();
  };

  const rowProps = useRowTapSelect
    ? {
        onClick: handleRowSelect,
        onKeyDown: handleRowKeyDown,
        role: 'button',
        tabIndex: 0,
        'aria-pressed': selected,
        'aria-label': `Select notification from ${parts[0]?.[0]?.split(' ')[0] || 'user'}`,
      }
    : {};

  return (
    <li
      className={`account-notification${notification.unread ? ' account-notification--unread' : ''}${selected ? ' account-notification--selected' : ''}${useRowTapSelect ? ' account-notification--mobile-select' : ''}${selectionMode ? ' account-notification--selection-mode' : ''}`}
      {...rowProps}
    >
      {showCheckbox && (
        <input
          type="checkbox"
          className="track-checkbox account-notification__checkbox"
          checked={selected}
          onChange={(event) => onSelectChange(notification.id, event.target.checked)}
          onClick={(event) => {
            if (mobileLayout) event.stopPropagation();
          }}
          aria-label={`Select notification from ${parts[0]?.[0]?.split(' ')[0] || 'user'}`}
        />
      )}
      <span
        className="account-notification__avatar"
        style={{ backgroundColor: getProfileColorVar(initials) }}
        aria-hidden="true"
      >
        {initials}
      </span>
      <NotificationMessage parts={parts} />
      <time className="account-notification__time" dateTime={timestamp}>
        {timestamp}
      </time>
      {!mobileLayout && (
        <div className="account-notification__actions">
          <button
            type="button"
            className="account-notification__action"
            aria-label={bellMuted ? 'Unmute notification' : 'Mute notification'}
            onClick={() => onMuteToggle(notification.id)}
          >
            <NotificationBellIcon muted={bellMuted} />
          </button>
          <button type="button" className="account-notification__action" aria-label="Delete notification">
            <img src="/Trash.svg" alt="" />
          </button>
        </div>
      )}
    </li>
  );
}

export default function AccountNotificationsTab({
  settingsOpen: controlledSettingsOpen,
  onSettingsOpenChange,
  hideToolbarSettings = false,
  mobileActionsRef,
  onMobileSelectionModeChange,
}) {
  const [notifications, setNotifications] = useState(() => [...ACCOUNT_NOTIFICATIONS]);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [internalSettingsOpen, setInternalSettingsOpen] = useState(false);
  const selectAllRef = useRef(null);

  const settingsOpen = controlledSettingsOpen ?? internalSettingsOpen;
  const setSettingsOpen = onSettingsOpenChange ?? setInternalSettingsOpen;

  const allSelected =
    notifications.length > 0 && notifications.every((item) => selectedIds.has(item.id));
  const someSelected = selectedIds.size > 0 && !allSelected;
  const hasSelection = selectedIds.size > 0;
  const selectionLabel =
    selectedIds.size === 1 ? '1 SELECTED' : `${selectedIds.size} SELECTED`;

  useEffect(() => {
    if (hideToolbarSettings && !selectionMode) return;
    const el = selectAllRef.current;
    if (!el) return;
    el.indeterminate = someSelected;
  }, [hideToolbarSettings, selectionMode, someSelected]);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => {
      if (prev) {
        setSelectedIds(new Set());
        return false;
      }
      return true;
    });
  }, []);

  useEffect(() => {
    onMobileSelectionModeChange?.(selectionMode);
  }, [onMobileSelectionModeChange, selectionMode]);

  const handleSelectAllToggle = useCallback(() => {
    setSelectedIds((prev) => {
      const everySelected =
        notifications.length > 0 && notifications.every((item) => prev.has(item.id));
      return everySelected ? new Set() : new Set(notifications.map((item) => item.id));
    });
  }, [notifications]);

  useEffect(() => {
    if (!mobileActionsRef) return undefined;
    mobileActionsRef.current = { toggleSelectionMode };
    return () => {
      mobileActionsRef.current = null;
    };
  }, [mobileActionsRef, toggleSelectionMode]);

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleSelectChange = (id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleMarkAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) =>
        selectedIds.has(item.id) ? { ...item, unread: false } : item
      )
    );
    setSelectedIds(new Set());
  };

  const handleMarkAsUnread = () => {
    setNotifications((prev) =>
      prev.map((item) =>
        selectedIds.has(item.id) ? { ...item, unread: true } : item
      )
    );
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    setNotifications((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
  };

  const handleMuteSelected = () => {
    setNotifications((prev) =>
      prev.map((item) =>
        selectedIds.has(item.id) ? { ...item, bellMuted: true } : item
      )
    );
    setSelectedIds(new Set());
  };

  const handleUnmuteSelected = () => {
    setNotifications((prev) =>
      prev.map((item) =>
        selectedIds.has(item.id) ? { ...item, bellMuted: false } : item
      )
    );
    setSelectedIds(new Set());
  };

  const handleMuteToggle = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, bellMuted: !item.bellMuted } : item
      )
    );
  };

  return (
    <div
      className={`account-notifications${hideToolbarSettings ? ' account-notifications--mobile-header-actions' : ''}${selectionMode ? ' account-notifications--selection-mode' : ''}`}
    >
      <div
        className={`account-notifications-toolbar${hideToolbarSettings && !selectionMode && !hasSelection ? ' account-notifications-toolbar--mobile-collapsed' : ''}`}
      >
        <div className="account-notifications-select-all">
          {(!hideToolbarSettings || selectionMode) && (
            <input
              ref={selectAllRef}
              type="checkbox"
              className="track-checkbox account-notifications-toolbar__checkbox"
              checked={allSelected}
              onChange={handleSelectAllToggle}
              aria-label="Select all notifications"
            />
          )}
          <div className="account-notifications-select-all-label">
            <div
              className={`tracks-selection-meta${hasSelection ? '' : ' account-notifications-toolbar-slot--hidden'}`}
              aria-hidden={!hasSelection}
            >
              <span className="tracks-selection-count">{selectionLabel}</span>
              <span className="tracks-selection-divider" aria-hidden="true" />
              <button
                type="button"
                className="tracks-selection-deselect"
                onClick={handleDeselectAll}
                tabIndex={hasSelection ? 0 : -1}
              >
                DESELECT
              </button>
            </div>
            <button
              type="button"
              className={`tracks-selection-deselect account-notifications-select-all__btn${hasSelection ? ' account-notifications-toolbar-slot--hidden' : ''}`}
              onClick={handleSelectAllToggle}
              aria-hidden={hasSelection || !selectionMode}
              tabIndex={hasSelection || !selectionMode ? -1 : 0}
            >
              SELECT ALL
            </button>
          </div>
        </div>
        <div className="account-notifications-toolbar-end">
          <div
            className={`account-notifications-batch-actions tracks-selection-actions${hasSelection ? '' : ' account-notifications-toolbar-slot--hidden'}`}
            aria-hidden={!hasSelection}
          >
            <button
              type="button"
              className="tracks-selection-action"
              onClick={handleMarkAsRead}
              tabIndex={hasSelection ? 0 : -1}
              aria-label="Mark as Read"
            >
              <img src="/icons/mark-as-read.svg" alt="" />
              <span className="tracks-selection-action-label">Mark as Read</span>
            </button>
            <button
              type="button"
              className="tracks-selection-action"
              onClick={handleMarkAsUnread}
              tabIndex={hasSelection ? 0 : -1}
              aria-label="Mark as Unread"
            >
              <img src="/icons/mark-as-unread.svg" alt="" />
              <span className="tracks-selection-action-label">Mark as Unread</span>
            </button>
            <button
              type="button"
              className="tracks-selection-action"
              onClick={handleMuteSelected}
              tabIndex={hasSelection ? 0 : -1}
              aria-label="Mute"
            >
              <NotificationBellIcon muted={false} />
              <span className="tracks-selection-action-label">Mute</span>
            </button>
            <button
              type="button"
              className="tracks-selection-action"
              onClick={handleUnmuteSelected}
              tabIndex={hasSelection ? 0 : -1}
              aria-label="Unmute"
            >
              <NotificationBellIcon muted />
              <span className="tracks-selection-action-label">Unmute</span>
            </button>
            <button
              type="button"
              className="tracks-selection-action"
              onClick={handleDeleteSelected}
              tabIndex={hasSelection ? 0 : -1}
              aria-label="Delete"
            >
              <img src="/Trash.svg" alt="" />
              <span className="tracks-selection-action-label">Delete</span>
            </button>
          </div>
          <div
            className={`account-notifications-toolbar-meta${hasSelection || hideToolbarSettings ? ' account-notifications-toolbar-slot--hidden' : ''}`}
            aria-hidden={hasSelection || hideToolbarSettings}
          >
            <span className="account-notifications-toolbar-label">Notifications</span>
            <button
              type="button"
              className="account-notification__action account-notification__action--settings"
              aria-label="Notification settings"
              tabIndex={hasSelection || hideToolbarSettings ? -1 : 0}
              onClick={() => setSettingsOpen(true)}
            >
              <img src="/icons/Settings.svg" alt="" />
            </button>
          </div>
        </div>
      </div>
      <ul className="account-notifications-list">
        {notifications.map((notification) => (
          <AccountNotificationRow
            key={notification.id}
            notification={notification}
            selected={selectedIds.has(notification.id)}
            onSelectChange={handleSelectChange}
            onMuteToggle={handleMuteToggle}
            mobileLayout={hideToolbarSettings}
            selectionMode={selectionMode}
          />
        ))}
      </ul>
      <AccountNotificationSettingsOverlay
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
