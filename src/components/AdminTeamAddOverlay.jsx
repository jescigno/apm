import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  formatTeamJoinedOn,
  initialsFromName,
  isValidInviteEmail,
} from '../constants/adminTeam';
import { ICON_ADD, ICON_CLOSE } from '../constants/designSystem';
import AdminActivityDatePicker from './AdminActivityDatePicker';

function createMemberRow() {
  return {
    id: `team-invite-${Math.random().toString(36).slice(2, 10)}`,
    firstName: '',
    lastName: '',
    email: '',
    expiration: null,
  };
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="1.5" />
      <path d="M8 3.5v4M16 3.5v4M3.5 10h17" strokeLinecap="round" />
    </svg>
  );
}

function readMember(row) {
  const firstName = row.firstName.trim();
  const lastName = row.lastName.trim();
  const email = row.email.trim().toLowerCase();
  if (!firstName && !lastName && !email) return { empty: true };
  if (!firstName || !lastName || !isValidInviteEmail(email)) {
    return { error: 'Enter a first name, last name, and email address for each member.' };
  }
  return {
    member: {
      id: row.id,
      firstName,
      lastName,
      email,
      expiration: row.expiration,
    },
  };
}

export default function AdminTeamAddOverlay({ open, onClose, onAdd }) {
  const titleId = useId();
  const firstInputRef = useRef(null);
  const [draft, setDraft] = useState(createMemberRow);
  const [added, setAdded] = useState([]);
  const [error, setError] = useState('');
  const [expirationOpen, setExpirationOpen] = useState(false);

  const resetState = useCallback(() => {
    setDraft(createMemberRow());
    setAdded([]);
    setError('');
    setExpirationOpen(false);
  }, []);

  useEffect(() => {
    if (!open) resetState();
  }, [open, resetState]);

  useEffect(() => {
    if (!open) return undefined;
    const frame = window.requestAnimationFrame(() => {
      firstInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (expirationOpen) {
        setExpirationOpen(false);
        return;
      }
      onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, expirationOpen]);

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

  const handleFieldChange = (field, value) => {
    setError('');
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const commitDraft = () => {
    const result = readMember(draft);
    if (result.empty || result.error) {
      setError(result.error || 'Enter a first name, last name, and email address for each member.');
      return false;
    }
    if (added.some((member) => member.email === result.member.email)) {
      setError('Each member needs a unique email address.');
      return false;
    }
    setAdded((prev) => [...prev, result.member]);
    setDraft(createMemberRow());
    setExpirationOpen(false);
    setError('');
    window.requestAnimationFrame(() => {
      firstInputRef.current?.focus();
    });
    return true;
  };

  const handleRemoveAdded = (id) => {
    setAdded((prev) => prev.filter((member) => member.id !== id));
    setError('');
  };

  const handleExpirationChange = (range) => {
    if (!range?.start) return;
    setDraft((prev) => ({ ...prev, expiration: range.start }));
    setExpirationOpen(false);
  };

  const handleClearExpiration = () => {
    setDraft((prev) => ({ ...prev, expiration: null }));
    setExpirationOpen(false);
  };

  const handleAdd = () => {
    const result = readMember(draft);
    if (result.error) {
      setError(result.error);
      return;
    }
    const pending = result.member ? [...added, result.member] : added;
    if (!pending.length) {
      setError('Enter a first name, last name, and email address for each member.');
      return;
    }
    const emails = pending.map((member) => member.email);
    if (new Set(emails).size !== emails.length) {
      setError('Each member needs a unique email address.');
      return;
    }
    onAdd?.(pending.map(({ firstName, lastName, email }) => ({ firstName, lastName, email })));
    onClose?.();
  };

  if (!open) return null;

  return createPortal(
    <div
      className="admin-team-add-overlay"
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
        aria-label="Close add members"
      />
      <div className="admin-team-add-overlay__panel-wrap">
        <div className="admin-team-add-overlay__panel">
          <header className="admin-team-add-overlay__header">
            <h2 id={titleId} className="admin-team-add-overlay__title">
              Add to Team
            </h2>
          </header>

          <form
            className="admin-team-add-overlay__body"
            autoComplete="off"
            onSubmit={(event) => {
              event.preventDefault();
              handleAdd();
            }}
          >
            <div className="admin-team-add-overlay__members">
              <div className="admin-team-add-overlay__member">
                <div className="admin-team-add-overlay__name-row">
                  <label className="admin-team-add-overlay__field">
                    <span className="admin-team-add-overlay__label">First name</span>
                    <input
                      ref={firstInputRef}
                      id={`admin-team-add-first-${draft.id}`}
                      name={`team-first-${draft.id}`}
                      type="text"
                      autoComplete="off"
                      data-1p-ignore="true"
                      data-lpignore="true"
                      className="admin-team-add-overlay__input"
                      value={draft.firstName}
                      onChange={(event) => handleFieldChange('firstName', event.target.value)}
                      aria-label="First name"
                    />
                  </label>
                  <label className="admin-team-add-overlay__field">
                    <span className="admin-team-add-overlay__label">Last name</span>
                    <input
                      id={`admin-team-add-last-${draft.id}`}
                      name={`team-last-${draft.id}`}
                      type="text"
                      autoComplete="off"
                      data-1p-ignore="true"
                      data-lpignore="true"
                      className="admin-team-add-overlay__input"
                      value={draft.lastName}
                      onChange={(event) => handleFieldChange('lastName', event.target.value)}
                      aria-label="Last name"
                    />
                  </label>
                </div>
                <div className="admin-team-add-overlay__contact-row">
                  <label className="admin-team-add-overlay__field">
                    <span className="admin-team-add-overlay__label">Email address</span>
                    <input
                      id={`admin-team-add-invite-${draft.id}`}
                      name={`team-invite-${draft.id}`}
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      data-1p-ignore="true"
                      data-lpignore="true"
                      data-form-type="other"
                      data-bwignore="true"
                      className="admin-team-add-overlay__input"
                      value={draft.email}
                      onChange={(event) => handleFieldChange('email', event.target.value)}
                      aria-label="Email address"
                    />
                  </label>
                  <div className="admin-team-add-overlay__field admin-team-add-overlay__expiration-field" data-admin-team-expiration>
                    <span className="admin-team-add-overlay__label">Expiration (Optional)</span>
                    <div
                      className={`admin-team-add-overlay__input admin-team-add-overlay__expiration${draft.expiration ? ' admin-team-add-overlay__expiration--set' : ''}`}
                    >
                      <button
                        type="button"
                        className="admin-team-add-overlay__expiration-open"
                        onClick={() => setExpirationOpen((current) => !current)}
                        aria-expanded={expirationOpen}
                        aria-haspopup="dialog"
                        aria-label="Select Date"
                      >
                        <CalendarIcon />
                        {draft.expiration ? (
                          <span className="admin-team-add-overlay__expiration-text">
                            {formatTeamJoinedOn(draft.expiration)}
                          </span>
                        ) : null}
                      </button>
                      {draft.expiration ? (
                        <button
                          type="button"
                          className="admin-team-add-overlay__expiration-clear"
                          onClick={handleClearExpiration}
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
                            draft.expiration
                              ? { start: draft.expiration, end: draft.expiration }
                              : { start: null, end: null }
                          }
                          onChange={handleExpirationChange}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <button type="button" className="admin-team-add-overlay__add-another" onClick={commitDraft}>
                <img src={ICON_ADD} alt="" aria-hidden="true" />
                Add another member
              </button>

              {added.length ? (
                <ul className="admin-team-add-overlay__added">
                  {added.map((member) => {
                    const name = `${member.firstName} ${member.lastName}`;
                    return (
                      <li key={member.id} className="admin-team-add-overlay__added-item">
                        <span className="admin-team-add-overlay__added-avatar" aria-hidden="true">
                          {initialsFromName(name, member.email)}
                        </span>
                        <span className="admin-team-add-overlay__added-name">{name}</span>
                        <span className="admin-team-add-overlay__added-email">{member.email}</span>
                        {member.expiration ? (
                          <span className="admin-team-add-overlay__added-expiration">
                            {`Expires ${formatTeamJoinedOn(member.expiration)}`}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          className="admin-team-add-overlay__added-remove"
                          onClick={() => handleRemoveAdded(member.id)}
                          aria-label={`Remove ${name}`}
                        >
                          <img src={ICON_CLOSE} alt="" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>

            {error ? <p className="admin-team-add-overlay__error">{error}</p> : null}
          </form>

          <footer className="admin-team-add-overlay__footer">
            <button type="button" className="admin-team-btn admin-team-btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="admin-team-btn admin-team-btn--primary" onClick={handleAdd}>
              Invite
            </button>
          </footer>
        </div>
      </div>
    </div>,
    document.body
  );
}
