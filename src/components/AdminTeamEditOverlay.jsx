import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ADMIN_TEAM_EDIT_STATUSES,
  formatTeamJoinedOn,
  getAdminTeamEditStatuses,
  isValidInviteEmail,
  splitMemberName,
} from '../constants/adminTeam';
import { ICON_CLOSE } from '../constants/designSystem';
import AdminActivityDatePicker from './AdminActivityDatePicker';

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="1.5" />
      <path d="M8 3.5v4M16 3.5v4M3.5 10h17" strokeLinecap="round" />
    </svg>
  );
}

function memberToForm(member) {
  const { firstName, lastName } = splitMemberName(member?.name);
  return {
    firstName,
    lastName,
    email: member?.email ?? '',
    status: ADMIN_TEAM_EDIT_STATUSES.includes(member?.status) ? member.status : 'Active',
    expiration: member?.expiration instanceof Date ? member.expiration : null,
  };
}

export default function AdminTeamEditOverlay({ member, existingEmails = [], onClose, onSave }) {
  const titleId = useId();
  const firstInputRef = useRef(null);
  const open = Boolean(member);
  const [form, setForm] = useState(() => memberToForm(member));
  const [error, setError] = useState('');
  const [expirationOpen, setExpirationOpen] = useState(false);

  useEffect(() => {
    if (!member) {
      setError('');
      return;
    }
    setForm(memberToForm(member));
    setError('');
    setExpirationOpen(false);
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
      if (event.key !== 'Escape') return;
      if (expirationOpen) {
        setExpirationOpen(false);
        return;
      }
      onClose?.();
    },
    [expirationOpen, onClose]
  );

  useEffect(() => {
    if (!expirationOpen) return undefined;
    const handlePointerDown = (event) => {
      const target = event.target;
      if (target.closest?.('[data-admin-team-expiration]')) return;
      if (target.closest?.('[data-admin-activity-date-picker]')) return;
      setExpirationOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [expirationOpen]);

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
      expiration: form.expiration,
      resendInvite: member?.status === 'Pending' && email !== (member.email || '').trim().toLowerCase(),
    });
    onClose?.();
  };

  const emailChanged =
    member?.status === 'Pending' &&
    form.email.trim().toLowerCase() !== (member.email || '').trim().toLowerCase();

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

            <div className="admin-team-edit-overlay__row">
              <label className="admin-team-add-overlay__field">
                <span className="admin-team-add-overlay__label">Status</span>
                <select
                  className="admin-team-add-overlay__input admin-team-edit-overlay__select"
                  value={form.status}
                  onChange={handleChange('status')}
                >
                  {getAdminTeamEditStatuses(member?.status).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <div className="admin-team-add-overlay__field admin-team-add-overlay__expiration-field" data-admin-team-expiration>
                <span className="admin-team-add-overlay__label">Expiration (Optional)</span>
                <div
                  className={`admin-team-add-overlay__input admin-team-add-overlay__expiration${form.expiration ? ' admin-team-add-overlay__expiration--set' : ''}`}
                >
                  <button
                    type="button"
                    className="admin-team-add-overlay__expiration-open"
                    onClick={() => setExpirationOpen((current) => !current)}
                    aria-expanded={expirationOpen}
                    aria-haspopup="dialog"
                    aria-label="Select expiration date"
                  >
                    <CalendarIcon />
                    {form.expiration ? (
                      <span className="admin-team-add-overlay__expiration-text">
                        {formatTeamJoinedOn(form.expiration)}
                      </span>
                    ) : null}
                  </button>
                  {form.expiration ? (
                    <button
                      type="button"
                      className="admin-team-add-overlay__expiration-clear"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, expiration: null }));
                        setExpirationOpen(false);
                      }}
                      aria-label="Clear expiration date"
                    >
                      <img src={ICON_CLOSE} alt="" />
                    </button>
                  ) : null}
                </div>
                {expirationOpen ? (
                  <div className="admin-team-add-overlay__expiration-popover">
                    <AdminActivityDatePicker
                      value={
                        form.expiration
                          ? { start: form.expiration, end: form.expiration }
                          : { start: null, end: null }
                      }
                      onChange={(range) => {
                        if (!range?.start) return;
                        setForm((prev) => ({ ...prev, expiration: range.start }));
                        setExpirationOpen(false);
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            {error ? <p className="admin-team-add-overlay__error">{error}</p> : null}
          </div>

          <footer className="admin-team-add-overlay__footer">
            <button type="button" className="admin-team-btn admin-team-btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="admin-team-btn admin-team-btn--primary" onClick={handleSave}>
              {emailChanged ? 'Resend Invite' : 'Save'}
            </button>
          </footer>
        </div>
      </div>
    </div>,
    document.body
  );
}
