/**
 * Project details collab actions — individual icons from the design system.
 */
import { PROJECT_COLLAB_ACTIONS } from '../constants/designSystem';

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
}) {
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
        {PROJECT_COLLAB_ACTIONS.map(({ id, label, src, activeSrc, wide }) => {
          const isPanelOpen = Boolean(panelOpenById[id]);
          const showActiveIcon = Boolean(iconActiveById[id]) && Boolean(activeSrc);
          const iconSrc = showActiveIcon ? activeSrc : src;

          return (
            <button
              key={id}
              type="button"
              className={`project-collab-btn${wide ? ' project-collab-btn--pill' : ' project-collab-btn--stroke'}${isPanelOpen ? ' project-collab-btn--active' : ''}`}
              aria-label={label}
              aria-pressed={isPanelOpen || undefined}
              onClick={() => onClickById[id]?.()}
            >
              <img src={iconSrc} alt="" />
              <span className="project-collab-btn-label">{label}</span>
            </button>
          );
        })}
        <button type="button" className="btn-invite project-collabs-invite" onClick={() => onInviteClick?.()}>
          Invite
        </button>
      </div>
    </div>
  );
}

export default ProjectCollabBar;
