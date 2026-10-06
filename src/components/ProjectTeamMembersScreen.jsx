import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PROJECT_TEAM_MEMBERS } from '../constants/projectTeamMembers';
import { PROFILE_COLOR_CSS_VARS } from '../constants/profileColors';

const MEMBER_ROLES = [
  { id: 'contributor', label: 'Contributor' },
  { id: 'viewer', label: 'Viewer' },
];

const TEAM_MEMBERS = PROJECT_TEAM_MEMBERS;

function createInitialRoles() {
  return Object.fromEntries(TEAM_MEMBERS.filter((member) => member.role !== 'admin').map((member) => [member.id, member.role]));
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

export function MemberRoleDropdown({ member, value, onChange, onRemove, onResend }) {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const selected = MEMBER_ROLES.find((role) => role.id === value) ?? MEMBER_ROLES[0];
  const ariaLabel = `Role for ${member.name}`;

  const placeMenu = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
      zIndex: 2350,
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

  const closeAnd = (action) => {
    setOpen(false);
    action();
  };

  return (
    <div className="project-team-members__role">
      <button
        ref={triggerRef}
        type="button"
        className="project-team-members__role-trigger"
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
              className="project-team-members__role-menu"
              role="menu"
              aria-label={ariaLabel}
              style={menuStyle}
            >
              {MEMBER_ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={role.id === value}
                  className="project-team-members__role-option"
                  onClick={() => closeAnd(() => onChange(role.id))}
                >
                  {role.label}
                </button>
              ))}
              {member.pending ? (
                <button
                  type="button"
                  role="menuitem"
                  className="project-team-members__role-option"
                  onClick={() => closeAnd(onResend)}
                >
                  Resend Invite
                </button>
              ) : null}
              <div className="project-team-members__role-divider" role="separator" />
              <button
                type="button"
                role="menuitem"
                className="project-team-members__role-option"
                onClick={() => closeAnd(onRemove)}
              >
                Remove
              </button>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export default function ProjectTeamMembersScreen({ open, projectName = 'Project', onClose, onInvite }) {
  const titleId = useId();
  const confirmId = useId();
  const dialogRef = useRef(null);
  const [members, setMembers] = useState(TEAM_MEMBERS);
  const [roles, setRoles] = useState(createInitialRoles);
  const [resentIds, setResentIds] = useState(() => new Set());
  const [memberToRemove, setMemberToRemove] = useState(null);

  const resetState = useCallback(() => {
    setMembers(TEAM_MEMBERS);
    setRoles(createInitialRoles());
    setResentIds(new Set());
    setMemberToRemove(null);
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
      if (event.key !== 'Escape') return;
      if (memberToRemove) {
        setMemberToRemove(null);
        return;
      }
      if (document.querySelector('.project-invite-screen')) return;
      onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [memberToRemove, open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={dialogRef}
      className="project-team-members"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <header className="project-team-members__header">
        <button type="button" className="project-team-members__back" onClick={onClose} aria-label="Back">
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
        <h1 id={titleId} className="project-team-members__title">
          Team Members
        </h1>
      </header>

      <div className="project-team-members__body">
        <button type="button" className="project-team-members__invite" onClick={onInvite}>
          <span>Invite Team Members</span>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M9 6.5L14.5 12 9 17.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <ul className="project-team-members__list">
          {members.map((member) => {
            const role = member.role === 'admin' ? 'admin' : roles[member.id];
            return (
              <li key={member.id} className="project-team-members__row">
                <span className="project-team-members__avatar-wrap">
                  <span
                    className={`project-team-members__avatar${member.pending ? ' project-team-members__avatar--pending' : ''}`}
                    style={
                      member.profileColor
                        ? { backgroundColor: `var(${PROFILE_COLOR_CSS_VARS[member.profileColor]})` }
                        : undefined
                    }
                    aria-hidden="true"
                  >
                    {member.initials}
                  </span>
                  {member.online ? <span className="project-team-members__status" /> : null}
                </span>
                <span className="project-team-members__identity">
                  <span className="project-team-members__name">{member.name}</span>
                  {member.invitedLabel ? (
                    <span className="project-team-members__meta">
                      {resentIds.has(member.id) ? 'Invite resent' : member.invitedLabel}
                    </span>
                  ) : null}
                </span>
                {role === 'admin' ? (
                  <span className="project-team-members__role-label">Admin</span>
                ) : (
                  <MemberRoleDropdown
                    member={member}
                    value={role}
                    onChange={(nextRole) => setRoles((prev) => ({ ...prev, [member.id]: nextRole }))}
                    onRemove={() => setMemberToRemove(member)}
                    onResend={() => setResentIds((prev) => new Set(prev).add(member.id))}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {memberToRemove ? (
        <div className="project-team-members-confirm" role="alertdialog" aria-modal="true" aria-labelledby={confirmId}>
          <button
            type="button"
            className="project-team-members-confirm__backdrop"
            aria-label="Cancel"
            onClick={() => setMemberToRemove(null)}
          />
          <div className="project-team-members-confirm__panel">
            <p id={confirmId} className="project-team-members-confirm__message">
              Are you sure you want to remove {memberToRemove.name} from {projectName}?
            </p>
            <div className="project-team-members-confirm__actions">
              <button type="button" className="btn-cta btn-cta--secondary" onClick={() => setMemberToRemove(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-cta btn-cta--primary"
                onClick={() => {
                  setMembers((prev) => prev.filter((item) => item.id !== memberToRemove.id));
                  setMemberToRemove(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>,
    document.body
  );
}
