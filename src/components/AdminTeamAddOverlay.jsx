import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ADMIN_TEAM_ADD_DEFAULT_SUBJECT,
  formatTeamJoinedOn,
  isValidInviteEmail,
  splitInviteEmails,
} from '../constants/adminTeam';
import { ICON_ADD } from '../constants/designSystem';
import AdminActivityDatePicker from './AdminActivityDatePicker';

function createEmailRow() {
  return {
    id: `team-invite-${Math.random().toString(36).slice(2, 10)}`,
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

export default function AdminTeamAddOverlay({ open, onClose, onAdd }) {
  const titleId = useId();
  const firstInputRef = useRef(null);
  const [rows, setRows] = useState(() => [createEmailRow()]);
  const [subject, setSubject] = useState(ADMIN_TEAM_ADD_DEFAULT_SUBJECT);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [expirationRowId, setExpirationRowId] = useState(null);

  const resetState = useCallback(() => {
    setRows([createEmailRow()]);
    setSubject(ADMIN_TEAM_ADD_DEFAULT_SUBJECT);
    setMessage('');
    setError('');
    setExpirationRowId(null);
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
      if (expirationRowId) {
        setExpirationRowId(null);
        return;
      }
      onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, expirationRowId]);

  useEffect(() => {
    if (!expirationRowId) return undefined;
    const handlePointerDown = (event) => {
      const target = event.target;
      if (target.closest?.('[data-admin-team-expiration]')) return;
      if (target.closest?.('[data-admin-activity-date-picker]')) return;
      setExpirationRowId(null);
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [expirationRowId]);

  const handleEmailChange = (id, email) => {
    setError('');
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, email } : row)));
  };

  const handleAddRow = () => {
    const nextRow = createEmailRow();
    setRows((prev) => [...prev, nextRow]);
    window.requestAnimationFrame(() => {
      document.getElementById(`admin-team-add-invite-${nextRow.id}`)?.focus();
    });
  };

  const handleRemoveRow = (id) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((row) => row.id !== id)));
    setExpirationRowId((current) => (current === id ? null : current));
  };

  const handleExpirationChange = (id, range) => {
    if (!range?.start) return;
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, expiration: range.start } : row))
    );
    setExpirationRowId(null);
  };

  const handleAdd = () => {
    const emails = collectValidEmails(rows);
    if (!emails.length) {
      setError('Enter at least one valid email address.');
      return;
    }
    onAdd?.(emails);
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
              {rows.map((row, index) => (
                <div key={row.id} className="admin-team-add-overlay__member">
                  <div className="admin-team-add-overlay__email-row">
                    <input
                      ref={index === 0 ? firstInputRef : undefined}
                      id={`admin-team-add-invite-${row.id}`}
                      name={`team-invite-${row.id}`}
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
                      className="admin-team-add-overlay__email-input"
                      placeholder="Enter email addresses"
                      value={row.email}
                      onChange={(event) => handleEmailChange(row.id, event.target.value)}
                      aria-label={index === 0 ? 'Team member invite' : `Team member invite ${index + 1}`}
                    />
                    <div className="admin-team-add-overlay__email-end" data-admin-team-expiration>
                      <button
                        type="button"
                        className="admin-team-add-overlay__expiration"
                        onClick={() =>
                          setExpirationRowId((current) => (current === row.id ? null : row.id))
                        }
                        aria-expanded={expirationRowId === row.id}
                        aria-haspopup="dialog"
                      >
                        <CalendarIcon />
                        {row.expiration ? formatTeamJoinedOn(row.expiration) : 'Set Expiration'}
                      </button>
                      {rows.length > 1 ? (
                        <button
                          type="button"
                          className="admin-team-add-overlay__remove-row"
                          onClick={() => handleRemoveRow(row.id)}
                          aria-label={`Remove email ${index + 1}`}
                        >
                          ×
                        </button>
                      ) : null}
                      {expirationRowId === row.id ? (
                        <div className="admin-team-add-overlay__expiration-popover">
                          <AdminActivityDatePicker
                            value={
                              row.expiration
                                ? { start: row.expiration, end: row.expiration }
                                : { start: null, end: null }
                            }
                            onChange={(range) => handleExpirationChange(row.id, range)}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className="admin-team-add-overlay__add-another" onClick={handleAddRow}>
                <img src={ICON_ADD} alt="" aria-hidden="true" />
                Add another member
              </button>
            </div>

            <label className="admin-team-add-overlay__field">
              <span className="admin-team-add-overlay__label">Email subject</span>
              <input
                type="text"
                name="team-invite-subject"
                autoComplete="off"
                data-1p-ignore="true"
                data-lpignore="true"
                className="admin-team-add-overlay__input"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
            </label>

            <label className="admin-team-add-overlay__field">
              <span className="admin-team-add-overlay__label">Email message</span>
              <textarea
                name="team-invite-message"
                autoComplete="off"
                data-1p-ignore="true"
                data-lpignore="true"
                className="admin-team-add-overlay__textarea"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={6}
              />
            </label>

            {error ? <p className="admin-team-add-overlay__error">{error}</p> : null}
          </form>

          <footer className="admin-team-add-overlay__footer">
            <button type="button" className="admin-team-btn admin-team-btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="admin-team-btn admin-team-btn--primary" onClick={handleAdd}>
              Add
            </button>
          </footer>
        </div>
      </div>
    </div>,
    document.body
  );
}
