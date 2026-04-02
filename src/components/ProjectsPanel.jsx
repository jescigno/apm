/**
 * Right panel for projects folder tree. Uses only `projects-panel-*` classes in index.css.
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  PROJECTS_PANEL_FOLDER_MORE_ACTIONS,
  PROJECTS_PANEL_FOLDER_TREE,
  PROJECTS_PANEL_INLINE_NAV,
  PROJECTS_PANEL_SOURCES,
} from '../constants/projectsPanelTree';

const FOLDER_MORE_MENU_WIDTH = 220;

function getFolderMoreMenuPosition(anchorEl) {
  const r = anchorEl.getBoundingClientRect();
  const w = FOLDER_MORE_MENU_WIDTH;
  const left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8));
  return { top: r.bottom + 4, left, width: w };
}

/** Deepest folder row index allowed (0 = top-level). Three nested levels under root => depths 1–3. */
const MAX_FOLDER_DEPTH_INDEX = 3;

/** Panel width (px) at which each extra column appears (progressive). */
const EXTRA_COL_DESCRIPTION_AT = 460;
const EXTRA_COL_PURPOSE_AT = 580;
const EXTRA_COL_LAST_UPDATED_AT = 700;

/** At this width (px), replace the source dropdown with inline links. */
const HEADER_INLINE_NAV_AT = 480;
/** At this width (px): larger nav labels, header rule, “Name” column header, folder ⋯ always visible. */
const HEADER_WIDE_LAYOUT_AT = 520;

function getExtraColumnFlags(panelWidth) {
  return {
    description: panelWidth >= EXTRA_COL_DESCRIPTION_AT,
    purpose: panelWidth >= EXTRA_COL_PURPOSE_AT,
    lastUpdated: panelWidth >= EXTRA_COL_LAST_UPDATED_AT,
  };
}

/** Filled icons (no stroke) for source dropdown options */
function ProjectsPanelSourceIcon({ sourceId }) {
  const common = {
    className: 'projects-panel-source-menu-icon',
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    'aria-hidden': true,
  };
  switch (sourceId) {
    case 'myProjects':
      return (
        <svg {...common}>
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
      );
    case 'sent':
      return (
        <img
          className="projects-panel-source-menu-icon-img"
          src="/icons/Share.svg"
          alt=""
          width={18}
          height={18}
          aria-hidden={true}
        />
      );
    case 'inbox':
      return (
        <svg {...common}>
          <path d="M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z" />
        </svg>
      );
    case 'archive':
      return (
        <img
          className="projects-panel-source-menu-icon-img"
          src="/Archive.svg"
          alt=""
          width={18}
          height={18}
          aria-hidden={true}
        />
      );
    case 'deleted':
      return (
        <img
          className="projects-panel-source-menu-icon-img"
          src="/Trash.svg"
          alt=""
          width={18}
          height={18}
          aria-hidden={true}
        />
      );
    default:
      return null;
  }
}

function FolderGlyph() {
  return (
    <span className="projects-panel-folder-glyph" aria-hidden>
      <img src="/icons/Folder.svg" alt="" className="projects-panel-folder-glyph-img" width="18" height="18" />
    </span>
  );
}

function FolderMetaColumn({ text, visible }) {
  if (!visible) return null;
  const s = text != null && String(text).trim() !== '' ? String(text) : '—';
  return (
    <div className="projects-panel-folder-meta" title={s}>
      {s}
    </div>
  );
}

function FolderRow({
  folder,
  depth,
  expandedIds,
  onToggleExpand,
  extraCols,
  showMoreAlways,
  onFolderMoreClick,
  folderMoreOpenId,
}) {
  const hasChildren = Array.isArray(folder.children) && folder.children.length > 0;
  const expanded = expandedIds.has(folder.id);
  const canShowNested = depth < MAX_FOLDER_DEPTH_INDEX;
  const showArrow = hasChildren && canShowNested;
  const { description: showDescription, purpose: showPurpose, lastUpdated: showLastUpdated } = extraCols;

  return (
    <div className="projects-panel-folder-block">
      <div
        className={`projects-panel-folder-row${showDescription || showPurpose || showLastUpdated ? ' projects-panel-folder-row--with-meta' : ''}`}
        style={{
          paddingLeft: `${depth * 14 + (depth > 0 ? 2 : 0) + (depth === 1 ? 2 : 0) + (depth === 1 || depth === 2 ? 4 : 0)}px`,
        }}
      >
        <div className="projects-panel-folder-primary">
          <span className="projects-panel-folder-expand-slot">
            {showArrow ? (
              <button
                type="button"
                className={`projects-panel-folder-chevron${expanded ? ' projects-panel-folder-chevron--open' : ''}`}
                aria-expanded={expanded}
                aria-label={expanded ? `Collapse ${folder.name}` : `Expand ${folder.name}`}
                onClick={() => onToggleExpand(folder.id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : null}
          </span>
          <FolderGlyph />
          <span className="projects-panel-folder-name">{folder.name}</span>
        </div>
        <FolderMetaColumn visible={showDescription} text={folder.description} />
        <FolderMetaColumn visible={showPurpose} text={folder.purpose} />
        <FolderMetaColumn visible={showLastUpdated} text={folder.lastUpdated} />
        <button
          type="button"
          className={`projects-panel-folder-more${showMoreAlways ? ' projects-panel-folder-more--always' : ''}`}
          aria-label={`More options for ${folder.name}`}
          aria-haspopup="menu"
          aria-expanded={folderMoreOpenId === folder.id}
          onClick={(e) => {
            e.stopPropagation();
            onFolderMoreClick?.(folder, e.currentTarget);
          }}
        >
          <img src="/icons/MoreMenu.svg" alt="" />
        </button>
      </div>
      {hasChildren && expanded && canShowNested && (
        <div className="projects-panel-folder-children">
          {folder.children.map((child) => (
            <FolderRow
              key={child.id}
              folder={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              extraCols={extraCols}
              showMoreAlways={showMoreAlways}
              onFolderMoreClick={onFolderMoreClick}
              folderMoreOpenId={folderMoreOpenId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsPanel({ isOpen, onClose, width = 263, onWidthChange, minWidth = 263, maxWidth = 600 }) {
  const resizeRef = useRef(null);
  const widthRef = useRef(width);
  widthRef.current = width;

  const [menuOpen, setMenuOpen] = useState(false);
  const [sourceId, setSourceId] = useState('myProjects');
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const headlineBtnRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const folderMoreAnchorRef = useRef(null);
  const [folderMoreMenu, setFolderMoreMenu] = useState(null);

  const updateMenuPosition = useCallback(() => {
    const el = headlineBtnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuPosition({ left: r.left, top: r.bottom + 4, width: Math.max(r.width, 200) });
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    updateMenuPosition();
    const onScroll = () => updateMenuPosition();
    const onResize = () => updateMenuPosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen, updateMenuPosition, width, isOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onDoc);
    return () => document.removeEventListener('keydown', onDoc);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e) => {
      const t = e.target;
      if (headlineBtnRef.current?.contains(t)) return;
      if (t.closest?.('[data-projects-panel-menu]')) return;
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [menuOpen]);

  const showInlineNav = width >= HEADER_INLINE_NAV_AT;

  useEffect(() => {
    if (showInlineNav) setMenuOpen(false);
  }, [showInlineNav]);

  useEffect(() => {
    if (!showInlineNav) return;
    const allowed = new Set(PROJECTS_PANEL_INLINE_NAV.map((i) => i.id));
    if (!allowed.has(sourceId)) setSourceId('myProjects');
  }, [showInlineNav, sourceId]);

  const closeFolderMoreMenu = useCallback(() => {
    folderMoreAnchorRef.current = null;
    setFolderMoreMenu(null);
  }, []);

  const openFolderMoreMenu = useCallback((folder, anchorEl) => {
    setFolderMoreMenu((prev) => {
      if (prev?.folderId === folder.id) {
        folderMoreAnchorRef.current = null;
        return null;
      }
      folderMoreAnchorRef.current = anchorEl;
      return { folderId: folder.id, folderName: folder.name, ...getFolderMoreMenuPosition(anchorEl) };
    });
  }, []);

  useEffect(() => {
    if (!isOpen) closeFolderMoreMenu();
  }, [isOpen, closeFolderMoreMenu]);

  useEffect(() => {
    if (!folderMoreMenu) return;
    const update = () => {
      const el = folderMoreAnchorRef.current;
      if (!el) return;
      setFolderMoreMenu((prev) => (prev ? { ...prev, ...getFolderMoreMenuPosition(el) } : null));
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [folderMoreMenu?.folderId]);

  useEffect(() => {
    if (!folderMoreMenu) return;
    const onDoc = (e) => {
      if (e.key === 'Escape') closeFolderMoreMenu();
    };
    document.addEventListener('keydown', onDoc);
    return () => document.removeEventListener('keydown', onDoc);
  }, [folderMoreMenu, closeFolderMoreMenu]);

  useEffect(() => {
    if (!folderMoreMenu) return;
    const onPointer = (e) => {
      const t = e.target;
      if (folderMoreAnchorRef.current?.contains(t)) return;
      if (t.closest?.('[data-projects-panel-folder-more-menu]')) return;
      closeFolderMoreMenu();
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [folderMoreMenu, closeFolderMoreMenu]);

  useEffect(() => {
    if (!resizeRef.current || !onWidthChange || !isOpen) return;

    const handle = resizeRef.current;

    const onMouseDown = (e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = widthRef.current;

      const onMouseMove = (e2) => {
        const delta = startX - e2.clientX;
        const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + delta));
        onWidthChange(newWidth);
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);
    return () => handle.removeEventListener('mousedown', onMouseDown);
  }, [isOpen, onWidthChange, minWidth, maxWidth]);

  const toggleExpand = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const extraCols = getExtraColumnFlags(width);
  const showAnyMetaCol = extraCols.description || extraCols.purpose || extraCols.lastUpdated;
  const showWideLayout = width >= HEADER_WIDE_LAYOUT_AT;
  const showColumnHeadersRow = showAnyMetaCol || showWideLayout;

  const currentSource = PROJECTS_PANEL_SOURCES.find((s) => s.id === sourceId) ?? PROJECTS_PANEL_SOURCES[0];

  const menuPortal =
    !showInlineNav &&
    menuOpen &&
    menuPosition &&
    createPortal(
      <div
        className="projects-panel-source-menu"
        data-projects-panel-menu
        style={{
          position: 'fixed',
          left: menuPosition.left,
          top: menuPosition.top,
          width: menuPosition.width,
          zIndex: 2000,
        }}
        role="menu"
        aria-label="Project source"
      >
        {PROJECTS_PANEL_SOURCES.map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="menuitem"
            className={`projects-panel-source-menu-item${opt.id === sourceId ? ' projects-panel-source-menu-item--current' : ''}`}
            onClick={() => {
              setSourceId(opt.id);
              setMenuOpen(false);
            }}
          >
            <ProjectsPanelSourceIcon sourceId={opt.id} />
            <span className="projects-panel-source-menu-label">{opt.label}</span>
          </button>
        ))}
      </div>,
      document.body
    );

  const folderMoreMenuPortal =
    folderMoreMenu &&
    createPortal(
      <div
        className="projects-panel-folder-more-menu"
        data-projects-panel-folder-more-menu
        style={{
          position: 'fixed',
          left: folderMoreMenu.left,
          top: folderMoreMenu.top,
          width: folderMoreMenu.width,
          zIndex: 2000,
        }}
        role="menu"
        aria-label={`Actions for ${folderMoreMenu.folderName}`}
      >
        {PROJECTS_PANEL_FOLDER_MORE_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            role="menuitem"
            className="projects-panel-folder-more-menu-item"
            onClick={() => closeFolderMoreMenu()}
          >
            {action.label}
          </button>
        ))}
      </div>,
      document.body
    );

  return (
    <aside
      className={`projects-panel ${isOpen ? 'open' : ''}${isOpen && width > minWidth ? ' projects-panel--overlay' : ''}${showInlineNav ? ' projects-panel--inline-nav' : ''}${showWideLayout ? ' projects-panel--wide-layout' : ''}`}
      role="dialog"
      aria-label="My Projects"
      style={isOpen ? { width: `${width}px`, minWidth: `${width}px` } : undefined}
    >
      {isOpen && (
        <div
          ref={resizeRef}
          className="projects-panel-resize-handle"
          aria-label="Drag to resize panel"
        />
      )}
      <div className="projects-panel-header projects-panel-header--folders">
        <div className="projects-panel-header-main">
          {showInlineNav ? (
            <nav className="projects-panel-inline-nav" aria-label="Project source">
              {PROJECTS_PANEL_INLINE_NAV.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`projects-panel-inline-nav-item${sourceId === item.id ? ' projects-panel-inline-nav-item--current' : ''}`}
                  aria-current={sourceId === item.id ? 'page' : undefined}
                  onClick={() => setSourceId(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          ) : (
            <button
              ref={headlineBtnRef}
              type="button"
              className="projects-panel-headline-btn"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => {
                setMenuOpen((o) => !o);
                if (!menuOpen) requestAnimationFrame(() => updateMenuPosition());
              }}
            >
              <span className="projects-panel-headline-text">{currentSource.label}</span>
              <span className={`projects-panel-headline-chevron${menuOpen ? ' projects-panel-headline-chevron--open' : ''}`} aria-hidden>
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
          )}
          <div className="projects-panel-toolbar-icons" role="toolbar" aria-label="Panel actions">
            <div className="projects-panel-toolbar-cluster">
              <button type="button" className="projects-panel-toolbar-btn" aria-label="Search">
                <img src="/nav-icons/Search.svg" alt="" />
              </button>
              <button type="button" className="projects-panel-toolbar-btn" aria-label="Add folder">
                <img src="/icons/Folder-New.svg" alt="" />
              </button>
              <button type="button" className="projects-panel-toolbar-btn" aria-label="Sort">
                <img src="/Sort.svg" alt="" />
              </button>
            </div>
            <button type="button" className="projects-panel-toolbar-btn projects-panel-toolbar-btn--close" onClick={onClose} aria-label="Close panel">
              <img src="/icons/Close.svg" alt="" />
            </button>
          </div>
        </div>
      </div>
      {menuPortal}
      {folderMoreMenuPortal}
      <div className="projects-panel-content projects-panel-content--folders">
        {showColumnHeadersRow && (
          <div
            className={`projects-panel-column-headers${showAnyMetaCol ? ' projects-panel-column-headers--with-meta' : ''}`}
            role="row"
            aria-label="Column headings"
          >
            <div className="projects-panel-column-headers-primary projects-panel-column-header projects-panel-column-header--name">
              Name
            </div>
            {extraCols.description && (
              <div className="projects-panel-column-header">Description</div>
            )}
            {extraCols.purpose && (
              <div className="projects-panel-column-header">Purpose</div>
            )}
            {extraCols.lastUpdated && (
              <div className="projects-panel-column-header">Last updated</div>
            )}
            {/* Matches folder-row more button width so Name + meta columns share the same flex space */}
            <div className="projects-panel-column-headers-spacer" aria-hidden="true" />
          </div>
        )}
        <div className="projects-panel-folder-list">
          {PROJECTS_PANEL_FOLDER_TREE.map((folder) => (
            <FolderRow
              key={folder.id}
              folder={folder}
              depth={0}
              expandedIds={expandedIds}
              onToggleExpand={toggleExpand}
              extraCols={extraCols}
              showMoreAlways={showWideLayout}
              onFolderMoreClick={openFolderMoreMenu}
              folderMoreOpenId={folderMoreMenu?.folderId ?? null}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

export default ProjectsPanel;
