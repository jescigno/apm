import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ICON_DELETE } from '../constants/designSystem';
import { ACCOUNT_NOTIFICATIONS } from '../constants/accountNotifications';
import { getProfileColorVar } from '../constants/profileColors';
import AccountNotificationSettingsOverlay from './AccountNotificationSettingsOverlay';

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
  mobileLayout = false,
  selectionMode = false,
}) {
  const { initials, parts, timestamp } = notification;
  const showCheckbox = !mobileLayout || selectionMode;

  return (
    <li
      className={`account-notification${notification.unread ? ' account-notification--unread' : ''}${selected ? ' account-notification--selected' : ''}${selectionMode ? ' account-notification--selection-mode' : ''}`}
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
    </li>
  );
}

export default function AccountNotificationsTab({
  settingsOpen: controlledSettingsOpen,
  onSettingsOpenChange,
  hideToolbarSettings = false,
  onSettingsClick,
}) {
  const [notifications, setNotifications] = useState(() => [...ACCOUNT_NOTIFICATIONS]);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [internalSettingsOpen, setInternalSettingsOpen] = useState(false);
  const [mobileActionsMenuOpen, setMobileActionsMenuOpen] = useState(false);
  const selectAllRef = useRef(null);
  const mobileActionsMenuBtnRef = useRef(null);
  const [mobileActionsMenuRect, setMobileActionsMenuRect] = useState(null);

  const settingsOpen = controlledSettingsOpen ?? internalSettingsOpen;
  const setSettingsOpen = onSettingsOpenChange ?? setInternalSettingsOpen;

  const allSelected =
    notifications.length > 0 && notifications.every((item) => selectedIds.has(item.id));
  const someSelected = selectedIds.size > 0 && !allSelected;
  const hasSelection = selectedIds.size > 0;
  const selectionLabel =
    selectedIds.size === 1 ? '1 SELECTED' : `${selectedIds.size} SELECTED`;

  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    el.indeterminate = someSelected;
  }, [someSelected]);

  const handleSelectAllToggle = useCallback(() => {
    setSelectedIds((prev) => {
      const everySelected =
        notifications.length > 0 && notifications.every((item) => prev.has(item.id));
      return everySelected ? new Set() : new Set(notifications.map((item) => item.id));
    });
  }, [notifications]);

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

  const closeMobileActionsMenu = useCallback(() => {
    setMobileActionsMenuOpen(false);
  }, []);

  const updateMobileActionsMenuRect = useCallback(() => {
    const el = mobileActionsMenuBtnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMobileActionsMenuRect({ right: rect.right, top: rect.top });
  }, []);

  const toggleMobileActionsMenu = useCallback(
    (event) => {
      event.stopPropagation();
      if (mobileActionsMenuOpen) {
        closeMobileActionsMenu();
        return;
      }
      updateMobileActionsMenuRect();
      setMobileActionsMenuOpen(true);
    },
    [mobileActionsMenuOpen, closeMobileActionsMenu, updateMobileActionsMenuRect]
  );

  useLayoutEffect(() => {
    if (!mobileActionsMenuOpen) return;
    updateMobileActionsMenuRect();
    const onUpdate = () => updateMobileActionsMenuRect();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [mobileActionsMenuOpen, updateMobileActionsMenuRect]);

  useEffect(() => {
    if (!mobileActionsMenuOpen) return;
    const onPointerDown = (event) => {
      const target = event.target;
      if (mobileActionsMenuBtnRef.current?.contains(target)) return;
      if (target.closest?.('[data-notifications-mobile-actions-menu]')) return;
      closeMobileActionsMenu();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [mobileActionsMenuOpen, closeMobileActionsMenu]);

  useEffect(() => {
    if (!hasSelection) closeMobileActionsMenu();
  }, [hasSelection, closeMobileActionsMenu]);

  const runMobileBatchAction = (action) => {
    action();
    closeMobileActionsMenu();
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

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
      return;
    }
    setSettingsOpen(true);
  };

  const batchActions = (
    <div
      className={`account-notifications-batch-actions tracks-selection-actions${hasSelection ? '' : ' account-notifications-toolbar-slot--hidden'}`}
      aria-hidden={!hasSelection}
    >
      <button
        type="button"
        className="tracks-selection-action"
        onClick={handleMarkAsRead}
        tabIndex={hasSelection ? 0 : -1}
        aria-label="Mark Read"
      >
        <img src="/icons/mark-as-read.svg" alt="" />
        <span className="tracks-selection-action-label">Mark Read</span>
      </button>
      <button
        type="button"
        className="tracks-selection-action"
        onClick={handleMarkAsUnread}
        tabIndex={hasSelection ? 0 : -1}
        aria-label="Mark Unread"
      >
        <img src="/icons/mark-as-unread.svg" alt="" />
        <span className="tracks-selection-action-label">Mark Unread</span>
      </button>
      <button
        type="button"
        className="tracks-selection-action"
        onClick={handleDeleteSelected}
        tabIndex={hasSelection ? 0 : -1}
        aria-label="Delete"
      >
        <img src={ICON_DELETE} alt="" />
        <span className="tracks-selection-action-label">Delete</span>
      </button>
    </div>
  );

  const selectAllControls = (
    <div className="account-notifications-select-all">
      <input
        ref={selectAllRef}
        type="checkbox"
        className="track-checkbox account-notifications-toolbar__checkbox"
        checked={allSelected}
        onChange={handleSelectAllToggle}
        aria-label="Select all notifications"
      />
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
          aria-hidden={hasSelection}
          tabIndex={hasSelection ? -1 : 0}
        >
          SELECT ALL
        </button>
      </div>
    </div>
  );

  const mobileActionsMenu =
    hideToolbarSettings &&
    hasSelection &&
    mobileActionsMenuOpen &&
    createPortal(
      <div
        data-notifications-mobile-actions-menu
        className="track-actions-overflow-dropdown track-actions-overflow-dropdown--portal track-actions-overflow-dropdown--segment-style notifications-page-mobile-selection-bar__menu"
        style={{
          position: 'fixed',
          right: mobileActionsMenuRect ? window.innerWidth - mobileActionsMenuRect.right : 0,
          top: mobileActionsMenuRect ? mobileActionsMenuRect.top + 4 : 0,
          visibility: mobileActionsMenuRect ? 'visible' : 'hidden',
        }}
        role="menu"
        aria-label="Notification actions"
      >
        <button
          type="button"
          role="menuitem"
          className="track-actions-overflow-dropdown-item"
          onClick={() => runMobileBatchAction(handleMarkAsRead)}
        >
          <img src="/icons/mark-as-read.svg" alt="" />
          Mark as Read
        </button>
        <button
          type="button"
          role="menuitem"
          className="track-actions-overflow-dropdown-item"
          onClick={() => runMobileBatchAction(handleMarkAsUnread)}
        >
          <img src="/icons/mark-as-unread.svg" alt="" />
          Mark as Unread
        </button>
        <button
          type="button"
          role="menuitem"
          className="track-actions-overflow-dropdown-item"
          onClick={() => runMobileBatchAction(handleDeleteSelected)}
        >
          <img src={ICON_DELETE} alt="" />
          Delete
        </button>
      </div>,
      document.body
    );

  return (
    <div
      className={`account-notifications${hideToolbarSettings ? ' account-notifications--mobile-header-actions account-notifications--selection-mode' : ''}`}
    >
      {hideToolbarSettings && (
        <div className="notifications-page-mobile-selection-bar">
          <div className="notifications-page-mobile-selection-bar__start">
            <div
              className={`notifications-page-mobile-selection-bar__select-all${hasSelection ? ' notifications-page-mobile-selection-bar__select-all--compact' : ''}`}
            >
              <input
                ref={selectAllRef}
                type="checkbox"
                className="track-checkbox account-notifications-toolbar__checkbox"
                checked={allSelected}
                onChange={handleSelectAllToggle}
                aria-label="Select all notifications"
              />
              {!hasSelection && (
                <button
                  type="button"
                  className="tracks-selection-deselect account-notifications-select-all__btn"
                  onClick={handleSelectAllToggle}
                >
                  SELECT ALL
                </button>
              )}
            </div>
            {hasSelection && (
              <>
                <div className="tracks-selection-meta notifications-page-mobile-selection-bar__meta">
                  <span className="tracks-selection-count">{selectionLabel}</span>
                  <span className="tracks-selection-divider" aria-hidden="true" />
                  <button
                    type="button"
                    className="tracks-selection-deselect"
                    onClick={handleDeselectAll}
                  >
                    DESELECT
                  </button>
                </div>
                <button
                  ref={mobileActionsMenuBtnRef}
                  type="button"
                  className="notifications-page-mobile-selection-bar__mark-as-btn"
                  onClick={toggleMobileActionsMenu}
                  aria-label="Mark as"
                  aria-haspopup="menu"
                  aria-expanded={mobileActionsMenuOpen}
                >
                  Mark as
                  <svg
                    className={`notifications-page-mobile-selection-bar__mark-as-chevron${mobileActionsMenuOpen ? ' notifications-page-mobile-selection-bar__mark-as-chevron--open' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </>
            )}
          </div>
          {mobileActionsMenu}
        </div>
      )}
      <div
        className={`account-notifications-toolbar${hideToolbarSettings ? ' account-notifications-toolbar--mobile-collapsed' : ''}`}
      >
        {!hideToolbarSettings && selectAllControls}
        <div className="account-notifications-toolbar-end">
          {!hideToolbarSettings && batchActions}
          <div
            className={`account-notifications-toolbar-meta${hasSelection || hideToolbarSettings ? ' account-notifications-toolbar-slot--hidden' : ''}`}
            aria-hidden={hasSelection || hideToolbarSettings}
          >
            <span className="account-notifications-toolbar-label">Settings</span>
            <button
              type="button"
              className="account-notification__action account-notification__action--settings"
              aria-label="Notification settings"
              tabIndex={hasSelection || hideToolbarSettings ? -1 : 0}
              onClick={handleSettingsClick}
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
            mobileLayout={hideToolbarSettings}
            selectionMode={hideToolbarSettings}
          />
        ))}
      </ul>
      {!onSettingsClick && (
        <AccountNotificationSettingsOverlay
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
