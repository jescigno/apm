/**
 * Project details collab actions — individual icons from the design system.
 */
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MemberRoleDropdown } from './ProjectTeamMembersScreen';
import { PROJECT_COLLAB_ACTIONS } from '../constants/designSystem';
import { PROJECT_TEAM_MEMBERS, PROJECT_TEAM_ROLE_LABELS } from '../constants/projectTeamMembers';
import { PROFILE_COLOR_CSS_VARS } from '../constants/profileColors';
import { resolveThemedAsset, useThemeName } from '../utils/theme';

function createInitialRoles() {
  return Object.fromEntries(
    PROJECT_TEAM_MEMBERS.filter((member) => member.role !== 'admin').map((member) => [member.id, member.role])
  );
}

function TeamMembersDropdown({ projectName }) {
  const confirmId = useId();
  const [members, setMembers] = useState(PROJECT_TEAM_MEMBERS);
  const [roles, setRoles] = useState(createInitialRoles);
  const [resentIds, setResentIds] = useState(() => new Set());
  const [memberToRemove, setMemberToRemove] = useState(null);

  return (
    <>
      <div className="project-collabs-members" role="region" aria-label="Team members">
        <ul className="project-collabs-members-list">
          {members.map((member) => {
            const role = member.role === 'admin' ? 'admin' : roles[member.id];
            return (
              <li key={member.id} className="project-collabs-members-item">
                <span className="project-collabs-members-avatar-wrap">
                  <span
                    className={`project-collabs-members-avatar${member.pending ? ' project-collabs-members-avatar--pending' : ''}`}
                    style={
                      member.profileColor
                        ? { backgroundColor: `var(${PROFILE_COLOR_CSS_VARS[member.profileColor]})` }
                        : undefined
                    }
                    aria-hidden="true"
                  >
                    {member.initials}
                  </span>
                  {member.online ? <span className="project-collabs-members-status" /> : null}
                </span>
                <span className="project-collabs-members-copy">
                  <span className="project-collabs-members-name">{member.name}</span>
                  {member.invitedLabel ? (
                    <span className="project-collabs-members-meta">
                      {resentIds.has(member.id) ? 'Invite resent' : member.invitedLabel}
                    </span>
                  ) : null}
                </span>
                {role === 'admin' ? (
                  <span className="project-collabs-members-role">{PROJECT_TEAM_ROLE_LABELS.admin}</span>
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
      {memberToRemove
        ? createPortal(
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
            </div>,
            document.body
          )
        : null}
    </>
  );
}

function ProjectCollabBar({
  onSoundsLikeClick,
  soundsLikePanelOpen,
  onCommentsClick,
  commentsPanelOpen,
  commentsActive = false,
  onClockClick,
  clockPanelOpen,
  onCollabsClick,
  collabsPanelOpen = false,
  collabsActive = false,
  onInviteClick,
  projectName = 'Project',
  hiddenActionIds = [],
}) {
  const theme = useThemeName();
  const membersRef = useRef(null);
  const [membersOpen, setMembersOpen] = useState(false);

  useEffect(() => {
    if (!membersOpen) return undefined;
    const onPointerDown = (event) => {
      if (membersRef.current?.contains(event.target)) return;
      if (event.target.closest?.('.project-team-members__role-menu, .project-team-members-confirm')) return;
      setMembersOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setMembersOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [membersOpen]);

  const panelOpenById = {
    'sounds-like': soundsLikePanelOpen,
    history: clockPanelOpen,
    comments: commentsPanelOpen,
    collabs: collabsPanelOpen,
  };

  const iconActiveById = {
    comments: commentsActive,
    collabs: collabsActive,
  };

  const onClickById = {
    'sounds-like': onSoundsLikeClick,
    history: onClockClick,
    comments: onCommentsClick,
    collabs: onCollabsClick,
  };

  return (
    <div className="project-collabs">
      <div className="project-collabs-actions">
        {PROJECT_COLLAB_ACTIONS.filter(({ id }) => !hiddenActionIds.includes(id)).map(({ id, label, src, activeSrc, wide }) => {
          const isMembers = id === 'collabs';
          const isPanelOpen = Boolean(panelOpenById[id]) || (isMembers && membersOpen);
          const showActiveIcon = Boolean(iconActiveById[id]) && Boolean(activeSrc);
          const iconSrc = showActiveIcon
            ? resolveThemedAsset(activeSrc, theme)
            : resolveThemedAsset(src, theme);

          const button = (
            <button
              key={isMembers ? undefined : id}
              type="button"
              className={`project-collab-btn${wide ? ' project-collab-btn--pill' : ' project-collab-btn--stroke'}${isPanelOpen ? ' project-collab-btn--active' : ''}${isMembers && membersOpen ? ' project-collab-btn--members-open' : ''}`}
              aria-label={label}
              aria-pressed={isPanelOpen || undefined}
              aria-expanded={isMembers ? membersOpen : undefined}
              aria-haspopup={isMembers ? 'true' : undefined}
              onClick={() => {
                if (isMembers) {
                  setMembersOpen((open) => !open);
                  return;
                }
                onClickById[id]?.();
              }}
            >
              <img src={iconSrc} alt="" />
              <span className="project-collab-btn-label">{label}</span>
            </button>
          );

          if (!isMembers) return button;

          return (
            <div key={id} className="project-collabs-members-anchor" ref={membersRef}>
              {button}
              {membersOpen ? <TeamMembersDropdown projectName={projectName} /> : null}
            </div>
          );
        })}
        <button type="button" className="btn-invite project-collabs-invite" onClick={() => onInviteClick?.()}>
          INVITE
        </button>
      </div>
    </div>
  );
}

export default ProjectCollabBar;
