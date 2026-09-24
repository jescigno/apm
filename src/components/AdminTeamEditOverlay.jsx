import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ADMIN_TEAM_EDIT_STATUSES,
  isValidInviteEmail,
  splitMemberName,
} from '../constants/adminTeam';

function memberToForm(member) {
  const { firstName, lastName } = splitMemberName(member?.name);
  return {
    firstName,
    lastName,
    email: member?.email ?? '',
    status: ADMIN_TEAM_EDIT_STATUSES.includes(member?.status) ? member.status : 'Active',
  };
}

export default function AdminTeamEditOverlay({ member, existingEmails = [], onClose, onSave }) {
  const titleId = useId();
  const firstInputRef = useRef(null);
  const open = Boolean(member);
  const [form, setForm] = useState(() => memberToForm(member));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!member) {
      setError('');
      return;
    }
    setForm(memberToForm(member));
    setError('');
  }, [member]);

  useEffect(() => {
    if (!open) return undefined;
    const frame = window.requestAnimationFrame(() => {
      firstInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, member?.id]);

  const handleEscape = useCallback(
    (event) => {
      if (event.key === 'Escape') onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return undefined;
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, handleEscape]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setError('');
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim().toLowerCase();

    if (!firstName && !lastName) {
      setError('Enter a first or last name.');
      return;
    }
    if (!isValidInviteEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (existingEmails.some((value) => value.toLowerCase() === email)) {
      setError('That email is already on this team.');
      return;
    }

    onSave?.({
      firstName,
      lastName,
      email,
      status: form.status,
    });
    onClose?.();
  };

  if (!open) return null;

  return createPortal(
    <div
      className="admin-team-add-overlay admin-team-edit-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="admin-team-add-overlay__backdrop"
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClose?.();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close edit member"
      />
      <div className="admin-team-add-overlay__panel-wrap">
        <div className="admin-team-add-overlay__panel">
          <header className="admin-team-add-overlay__header">
            <h2 id={titleId} className="admin-team-add-overlay__title">
              Edit Member
            </h2>
          </header>

          <div className="admin-team-add-overlay__body">
            <div className="admin-team-edit-overlay__row">
              <label className="admin-team-add-overlay__field">
                <span className="admin-team-add-overlay__label">First name</span>
                <input
                  ref={firstInputRef}
                  type="text"
                  name="team-member-first-name"
                  className="admin-team-add-overlay__input"
                  value={form.firstName}
                  onChange={handleChange('firstName')}
                  autoComplete="off"
                  data-1p-ignore="true"
                  data-lpignore="true"
                />
              </label>
              <label className="admin-team-add-overlay__field">
                <span className="admin-team-add-overlay__label">Last name</span>
                <input
                  type="text"
                  name="team-member-last-name"
                  className="admin-team-add-overlay__input"
                  value={form.lastName}
                  onChange={handleChange('lastName')}
                  autoComplete="off"
                  data-1p-ignore="true"
                  data-lpignore="true"
                />
              </label>
            </div>

            <label className="admin-team-add-overlay__field">
              <span className="admin-team-add-overlay__label">Email address</span>
              <input
                type="text"
                inputMode="text"
                name="team-member-invite"
                className="admin-team-add-overlay__input"
                value={form.email}
                onChange={handleChange('email')}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
                data-bwignore="true"
              />
            </label>

            <label className="admin-team-add-overlay__field">
              <span className="admin-team-add-overlay__label">Status</span>
              <select
                className="admin-team-add-overlay__input admin-team-edit-overlay__select"
                value={form.status}
                onChange={handleChange('status')}
              >
                {ADMIN_TEAM_EDIT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            {error ? <p className="admin-team-add-overlay__error">{error}</p> : null}
          </div>

          <footer className="admin-team-add-overlay__footer">
            <button type="button" className="admin-team-btn admin-team-btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="admin-team-btn admin-team-btn--primary" onClick={handleSave}>
              Save
            </button>
          </footer>
        </div>
      </div>
    </div>,
    document.body
  );
}
