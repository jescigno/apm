import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ADMIN_TEAM_ADD_DEFAULT_SUBJECT,
  isValidInviteEmail,
  splitInviteEmails,
} from '../constants/adminTeam';
import { ICON_ADD } from '../constants/designSystem';

const PROJECT_INVITE_ROLES = [
  { id: 'admin', label: 'Admin' },
  { id: 'contributor', label: 'Contributor' },
  { id: 'read-only', label: 'Read-only' },
];

function createEmailRow(email = '') {
  return {
    id: `project-invite-${Math.random().toString(36).slice(2, 10)}`,
    email,
    role: 'contributor',
  };
}

function createInitialRows() {
  return [createEmailRow('drew@apmmusic.com'), createEmailRow('')];
}

function collectValidEmails(rows) {
  const seen = new Set();
  const emails = [];
  rows.forEach((row) => {
    splitInviteEmails(row.email).forEach((email) => {
      if (!isValidInviteEmail(email) || seen.has(email)) return;
      seen.add(email);
      emails.push(email);
    });
  });
  return emails;
}

function RoleChevron() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
      <path
        d="M2.25 4.25L6 8l3.75-3.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InviteRoleDropdown({ value, onChange, ariaLabel }) {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const selected = PROJECT_INVITE_ROLES.find((role) => role.id === value) ?? PROJECT_INVITE_ROLES[0];

  const placeMenu = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
      zIndex: 2400,
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    placeMenu();
    const onPointerDown = (event) => {
      if (triggerRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('resize', placeMenu);
    window.addEventListener('scroll', placeMenu, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('resize', placeMenu);
      window.removeEventListener('scroll', placeMenu, true);
    };
  }, [open, placeMenu]);

  return (
    <div className="project-invite-screen__role">
      <button
        ref={triggerRef}
        type="button"
        className="project-invite-screen__role-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected.label}</span>
        <RoleChevron />
      </button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              className="project-invite-screen__role-menu"
              role="menu"
              aria-label={ariaLabel}
              style={menuStyle}
            >
              {PROJECT_INVITE_ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={role.id === value}
                  className="project-invite-screen__role-option"
                  onClick={() => {
                    onChange(role.id);
                    setOpen(false);
                  }}
                >
                  {role.label}
                </button>
              ))}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export default function ProjectInviteScreen({ open, onClose }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const [rows, setRows] = useState(createInitialRows);
  const [subject, setSubject] = useState(ADMIN_TEAM_ADD_DEFAULT_SUBJECT);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const resetState = useCallback(() => {
    setRows(createInitialRows());
    setSubject(ADMIN_TEAM_ADD_DEFAULT_SUBJECT);
    setMessage('');
    setError('');
  }, []);

  useEffect(() => {
    if (!open) resetState();
  }, [open, resetState]);

  useEffect(() => {
    if (!open) return undefined;
    const frame = window.requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleEmailChange = (id, email) => {
    setError('');
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, email } : row)));
  };

  const handleRoleChange = (id, role) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, role } : row)));
  };

  const handleAddRow = () => {
    const nextRow = createEmailRow();
    setRows((prev) => [...prev, nextRow]);
    window.requestAnimationFrame(() => {
      document.getElementById(`project-invite-email-${nextRow.id}`)?.focus();
    });
  };

  const handleInvite = () => {
    const emails = collectValidEmails(rows);
    if (!emails.length) {
      setError('Enter at least one valid email address.');
      return;
    }
    onClose?.();
  };

  if (!open) return null;

  return createPortal(
    <div
      ref={dialogRef}
      className="project-invite-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <button type="button" className="project-invite-screen__backdrop" aria-label="Close invite" onClick={onClose} />
      <div className="project-invite-screen__panel">
      <header className="project-invite-screen__header">
        <button type="button" className="project-invite-screen__back" onClick={onClose} aria-label="Back">
          <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
            <path
              d="M18 11.5L13 16l5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 id={titleId} className="project-invite-screen__title">
          Invite Team Members
        </h1>
      </header>

      <form
        className="project-invite-screen__body"
        autoComplete="off"
        onSubmit={(event) => {
          event.preventDefault();
          handleInvite();
        }}
      >
        <div className="project-invite-screen__members">
          {rows.map((row, index) => (
            <div key={row.id} className="project-invite-screen__email-row">
              <input
                id={`project-invite-email-${row.id}`}
                name={`project-invite-${row.id}`}
                type="text"
                inputMode="email"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
                className="project-invite-screen__email-input"
                placeholder="Enter email addresses"
                value={row.email}
                onChange={(event) => handleEmailChange(row.id, event.target.value)}
                aria-label={index === 0 ? 'Email address' : `Email address ${index + 1}`}
              />
              <InviteRoleDropdown
                value={row.role}
                onChange={(role) => handleRoleChange(row.id, role)}
                ariaLabel={index === 0 ? 'Role' : `Role ${index + 1}`}
              />
            </div>
          ))}

          <button type="button" className="project-invite-screen__add" onClick={handleAddRow}>
            <img src={ICON_ADD} alt="" aria-hidden="true" />
            Add another member
          </button>
        </div>

        <label className="project-invite-screen__field">
          <span className="project-invite-screen__label">Email subject</span>
          <input
            type="text"
            name="project-invite-subject"
            autoComplete="off"
            className="project-invite-screen__input"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
        </label>

        <label className="project-invite-screen__field">
          <span className="project-invite-screen__label">Email message</span>
          <textarea
            name="project-invite-message"
            className="project-invite-screen__textarea"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={6}
          />
        </label>

        {error ? <p className="project-invite-screen__error">{error}</p> : null}

        <div className="project-invite-screen__actions">
          <button type="button" className="btn-cta btn-cta--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-cta btn-cta--primary">
            Invite
          </button>
        </div>
      </form>
      </div>
    </div>,
    document.body
  );
}
