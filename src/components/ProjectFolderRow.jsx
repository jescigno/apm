import { useState, useRef, useEffect, useLayoutEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { getFolderUpdatedAtLabel } from '../constants/projectsPanelTree';
import { ICON_FOLDER_FILLED } from '../constants/designSystem';
import { closeOverflowMenusInGroup, registerOverflowMenuOpen, unregisterOverflowMenu } from '../hooks/useOverflowDropdownMenu';

const FOLDER_MENU_GROUP = 'project-folder-row-menu';

const FOLDER_MORE_ACTIONS = [
  { id: 'open', label: 'Open Project' },
  { id: 'edit', label: 'Edit Project Details' },
  { id: 'move', label: 'Move To' },
  { id: 'delete', label: 'Delete' },
];

function FolderHoverHint({ text, tooltipRect }) {
  if (!text || !tooltipRect) return null;

  return createPortal(
    <span
      className="app-hover-tooltip app-hover-tooltip-portal"
      role="tooltip"
      style={{
        left: tooltipRect.left,
        bottom: window.innerHeight - tooltipRect.top + 6,
      }}
    >
      {text}
    </span>,
    document.body
  );
}

function useFolderExpandHint(iconRef, enabled) {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipRect, setTooltipRect] = useState(null);

  const updateTooltipRect = useCallback(() => {
    if (!enabled) return;
    const el = iconRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTooltipRect({ left: rect.left + rect.width / 2, top: rect.top });
  }, [enabled, iconRef]);

  useEffect(() => {
    if (!isHovered || !enabled) return;
    updateTooltipRect();
    const onUpdate = () => updateTooltipRect();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [isHovered, enabled, updateTooltipRect]);

  const bindHover = enabled
    ? {
        onMouseEnter: () => {
          setIsHovered(true);
          updateTooltipRect();
        },
        onMouseLeave: () => setIsHovered(false),
      }
    : {};

  return { isHovered, tooltipRect, bindHover };
}

function ProjectFolderRow({
  folder,
  trackCount = 0,
  onSelect,
  mobileLayout = false,
  onIconClick,
  collapsedSummary = false,
  folderCount = 0,
  isSelected = false,
  onSelectChange,
  showCheckbox = true,
}) {
  const instanceId = useId();
  const iconRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef(null);
  const [menuRect, setMenuRect] = useState(null);
  const dateLabel = folder ? getFolderUpdatedAtLabel(folder) : '';
  const trackCountLabel = `${trackCount} ${trackCount === 1 ? 'Track' : 'Tracks'}`;
  const expandHint = collapsedSummary ? 'Expand' : onIconClick ? 'Collapse' : null;
  const { isHovered, tooltipRect, bindHover } = useFolderExpandHint(iconRef, Boolean(expandHint));
  const [isRowHovered, setIsRowHovered] = useState(false);
  const showSelectCheckbox =
    showCheckbox && !collapsedSummary && !mobileLayout && (isRowHovered || isSelected);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setMenuRect(null);
    unregisterOverflowMenu(FOLDER_MENU_GROUP, instanceId);
  }, [instanceId]);

  const updateMenuRect = useCallback(() => {
    const el = menuBtnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuRect({ right: r.right, top: r.top });
  }, []);

  const toggleMenu = useCallback((event) => {
    event.stopPropagation();
    if (menuOpen) {
      closeMenu();
      return;
    }
    closeOverflowMenusInGroup('track-overflow-menu');
    registerOverflowMenuOpen(FOLDER_MENU_GROUP, instanceId, closeMenu);
    updateMenuRect();
    setMenuOpen(true);
  }, [menuOpen, closeMenu, updateMenuRect, instanceId]);

  useLayoutEffect(() => {
    if (!menuOpen) return;
    updateMenuRect();
    const onUpdate = () => updateMenuRect();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [menuOpen, updateMenuRect]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e) => {
      const t = e.target;
      const clickedMenuBtn = t.closest?.('.track-actions-menu-btn');
      if (clickedMenuBtn && clickedMenuBtn !== menuBtnRef.current) {
        closeMenu();
        return;
      }
      if (menuBtnRef.current?.contains(t)) return;
      if (t.closest?.('[data-project-folder-more-menu]')) return;
      closeMenu();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [menuOpen, closeMenu]);

  useEffect(() => () => unregisterOverflowMenu(FOLDER_MENU_GROUP, instanceId), [instanceId]);

  const handleOpen = () => onSelect?.(folder.id);

  const renderSelectCheckbox = () => (
    <span className="track-num-checkbox-slot">
      {showSelectCheckbox ? (
        <input
          type="checkbox"
          className="track-checkbox"
          checked={isSelected}
          onChange={(event) => onSelectChange?.(folder.id, event.target.checked)}
          aria-label={`Select ${folder.name}`}
          onClick={(event) => event.stopPropagation()}
        />
      ) : null}
    </span>
  );

  const renderFolderIcon = (interactiveProps = {}) => {
    if (onIconClick) {
      return (
        <button
          ref={iconRef}
          type="button"
          className="project-folder-row__icon project-folder-row__icon--interactive"
          {...interactiveProps}
        >
          <img src={ICON_FOLDER_FILLED} alt="" width="18" height="18" />
        </button>
      );
    }

    return (
      <span ref={iconRef} className="project-folder-row__icon" aria-hidden="true">
        <img src={ICON_FOLDER_FILLED} alt="" width="18" height="18" />
      </span>
    );
  };

  const renderLeadColumn = (iconProps = {}) => (
    <span className="track-num">
      {renderSelectCheckbox()}
      <span className="track-num-play-slot">{renderFolderIcon(iconProps)}</span>
    </span>
  );

  if (collapsedSummary) {
    const label = `${folderCount} ${folderCount === 1 ? 'Folder' : 'Folders'}`;
    return (
      <div
        className={`project-folder-row project-folder-row--collapsed-summary${mobileLayout ? ' project-folder-row--mobile' : ''}`}
        onMouseEnter={() => setIsRowHovered(true)}
        onMouseLeave={() => setIsRowHovered(false)}
      >
        {renderLeadColumn({
          onClick: (event) => {
            event.stopPropagation();
            onIconClick?.();
          },
          'aria-label': `${label}. Click to expand.`,
          ...bindHover,
        })}
        <div className="project-folder-row__title-col">
          <button
            type="button"
            className="project-folder-row__title-btn"
            onClick={() => onIconClick?.()}
          >
            <span className="project-folder-row__name">{label}</span>
          </button>
        </div>
        <span className="project-folder-row__date project-folder-row__date--placeholder" aria-hidden="true" />
        <div className="project-folder-row__more project-folder-row__more--placeholder" aria-hidden="true" />
        {isHovered && <FolderHoverHint text={expandHint} tooltipRect={tooltipRect} />}
      </div>
    );
  }

  const moreMenu =
    menuOpen &&
    createPortal(
      <div
        data-project-folder-more-menu
        className="track-actions-overflow-dropdown track-actions-overflow-dropdown--portal track-actions-overflow-dropdown--segment-style project-folder-row__menu"
        style={{
          position: 'fixed',
          right: menuRect ? window.innerWidth - menuRect.right : 0,
          bottom: menuRect ? window.innerHeight - menuRect.top + 4 : 0,
          visibility: menuRect ? 'visible' : 'hidden',
        }}
        role="menu"
        aria-label={`Actions for ${folder.name}`}
      >
        {FOLDER_MORE_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            role="menuitem"
            className="track-actions-overflow-dropdown-item"
            onClick={() => {
              if (action.id === 'open') handleOpen();
              closeMenu();
            }}
          >
            {action.label}
          </button>
        ))}
      </div>,
      document.body
    );

  return (
    <div
      className={`project-folder-row${isSelected ? ' project-folder-row--selected' : ''}${mobileLayout ? ' project-folder-row--mobile' : ''}`}
      onMouseEnter={() => setIsRowHovered(true)}
      onMouseLeave={() => setIsRowHovered(false)}
    >
      {renderLeadColumn(
        onIconClick
          ? {
              onClick: (event) => {
                event.stopPropagation();
                onIconClick();
              },
              'aria-label': `${folder.name} folder. Click to collapse folders.`,
              ...bindHover,
            }
          : {}
      )}
      <div className="project-folder-row__title-col">
        <button type="button" className="project-folder-row__title-btn" onClick={handleOpen}>
          <span className="project-folder-row__name">{folder.name}</span>
          <span className="project-folder-row__track-count">{trackCountLabel}</span>
        </button>
      </div>
      <span className="project-folder-row__date">{dateLabel}</span>
      <div className="project-folder-row__more">
        <button
          ref={menuBtnRef}
          type="button"
          className="icon-btn track-actions-menu-btn project-folder-row__more-btn"
          onClick={toggleMenu}
          aria-label={`More options for ${folder.name}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
      </div>
      {moreMenu}
      {isHovered && <FolderHoverHint text={expandHint} tooltipRect={tooltipRect} />}
    </div>
  );
}

export default ProjectFolderRow;
