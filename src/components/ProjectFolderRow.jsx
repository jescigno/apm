import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getFolderUpdatedAtLabel } from '../constants/projectsPanelTree';

const FOLDER_MORE_ACTIONS = [
  { id: 'open', label: 'Open Project' },
  { id: 'edit', label: 'Edit Project Details' },
  { id: 'move', label: 'Move To' },
  { id: 'delete', label: 'Delete' },
];

function ProjectFolderRow({ folder, trackCount = 0, onSelect, mobileLayout = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef(null);
  const [menuRect, setMenuRect] = useState(null);
  const dateLabel = getFolderUpdatedAtLabel(folder);
  const trackCountLabel = `${trackCount} ${trackCount === 1 ? 'Track' : 'Tracks'}`;

  const updateMenuRect = useCallback(() => {
    const el = menuBtnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuRect({ right: r.right, top: r.top });
  }, []);

  useEffect(() => {
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
      if (menuBtnRef.current?.contains(t)) return;
      if (t.closest?.('[data-project-folder-more-menu]')) return;
      setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpen]);

  const handleOpen = () => onSelect?.(folder.id);

  const moreMenu =
    menuOpen &&
    menuRect &&
    createPortal(
      <div
        data-project-folder-more-menu
        className="track-actions-overflow-dropdown track-actions-overflow-dropdown--portal track-actions-overflow-dropdown--segment-style project-folder-row__menu"
        style={{
          position: 'fixed',
          right: window.innerWidth - menuRect.right,
          bottom: window.innerHeight - menuRect.top + 4,
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
              setMenuOpen(false);
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
      className={`project-folder-row${mobileLayout ? ' project-folder-row--mobile' : ''}`}
    >
      <span className="project-folder-row__icon" aria-hidden="true">
        <img src="/icons/Folder.svg" alt="" width="18" height="18" />
      </span>
      <div className="project-folder-row__title-col">
        <button type="button" className="project-folder-row__title-btn" onClick={handleOpen} title={folder.name}>
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
          onClick={() => setMenuOpen((open) => !open)}
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
    </div>
  );
}

export default ProjectFolderRow;
