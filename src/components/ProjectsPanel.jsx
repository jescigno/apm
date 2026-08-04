/**
 * Right panel for projects folder tree. Uses only `projects-panel-*` classes in index.css.
 */
import { useRef, useEffect, useLayoutEffect, useState, useCallback, Fragment, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  PROJECTS_PANEL_FOLDER_MORE_ACTIONS,
  PROJECTS_PANEL_FOLDER_TREE,
  PROJECTS_PANEL_INLINE_NAV,
  PROJECTS_PANEL_SOURCES,
  findFolderById,
  getFolderAncestorIds,
  getFolderPath,
  getFolderUpdatedAtLabel,
  getSiblingFolders,
  reorderSiblingFolders,
} from '../constants/projectsPanelTree';
import {
  ICON_ARCHIVE,
  ICON_DELETE,
  ICON_FOLDER_FILLED,
  ICON_FOLDER_NEW,
  ICON_SEARCH,
  ICON_SORT,
} from '../constants/designSystem';
import { resolveThemedAsset, useThemeName } from '../utils/theme';

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
const EXTRA_COL_LAST_UPDATED_AT = 700;

/** At this width (px), replace the source dropdown with inline links. */
const HEADER_INLINE_NAV_AT = 480;
/** At this width (px): larger nav labels, header rule, “Name” column header, folder ⋯ always visible. */
const HEADER_WIDE_LAYOUT_AT = 520;
/** At this width (px): toolbar actions show icon + text (Search / New Project / Sort). */
const TOOLBAR_LABELED_AT = 720;

/** Hold duration (ms) before a folder drag begins. */
const FOLDER_DRAG_HOLD_MS = 220;

/** Pointer movement allowed while holding before the drag is cancelled. */
const FOLDER_DRAG_HOLD_TOLERANCE_PX = 8;

/** Min horizontal gap (px) between source links when using Tracks-matched 22px style (align with CSS). */
const INLINE_NAV_TRACKS_TYPO_GAP = 16;
/** Subpixel / rounding slack when comparing measured nav width to available space. */
const INLINE_NAV_TRACKS_TYPO_FIT_BUFFER = 4;

/** Approx. min width (px) of the full inline source nav at 22px / 500; used to gate Tracks-style labels. */
function getInlineNavMinWidth22Px() {
  if (typeof document === 'undefined') return 0;
  const el = document.createElement('canvas');
  const ctx = el.getContext('2d');
  if (!ctx) return 0;
  ctx.font = '500 22px "Poppins", system-ui, sans-serif';
  let textW = 0;
  for (const { label } of PROJECTS_PANEL_INLINE_NAV) {
    textW += ctx.measureText(label).width;
  }
  const gapW = Math.max(0, PROJECTS_PANEL_INLINE_NAV.length - 1) * INLINE_NAV_TRACKS_TYPO_GAP;
  return Math.ceil(textW + gapW) + 8;
}

function getExtraColumnFlags(panelWidth) {
  return {
    description: panelWidth >= EXTRA_COL_DESCRIPTION_AT,
    lastUpdated: panelWidth >= EXTRA_COL_LAST_UPDATED_AT,
  };
}

function SourceMenuIconImg({ src }) {
  return (
    <img
      className="projects-panel-source-menu-icon-img"
      src={src}
      alt=""
      width={18}
      height={18}
      aria-hidden={true}
    />
  );
}

/** Source dropdown option icons */
function ProjectsPanelSourceIcon({ sourceId }) {
  const svgCommon = {
    className: 'projects-panel-source-menu-icon',
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (sourceId) {
    case 'myProjects':
      return (
        <svg {...svgCommon}>
          <path d="M3 7.5V6a2 2 0 0 1 2-2h3.2L10 6h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6.5z" />
        </svg>
      );
    case 'sent':
      return <SourceMenuIconImg src="/icons/Upload.svg" />;
    case 'inbox':
      return (
        <svg {...svgCommon}>
          <path d="M22 12H16l-2 3H10l-2-3H2" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      );
    case 'archive':
      return <SourceMenuIconImg src={ICON_ARCHIVE} />;
    case 'deleted':
      return <SourceMenuIconImg src={ICON_DELETE} />;
    default:
      return null;
  }
}

function FolderGlyph() {
  const theme = useThemeName();
  return (
    <span className="projects-panel-folder-glyph" aria-hidden>
      <img
        src={resolveThemedAsset(ICON_FOLDER_FILLED, theme)}
        alt=""
        className="projects-panel-folder-glyph-img"
        width="18"
        height="18"
      />
    </span>
  );
}

function FolderMetaColumn({ text, visible, variant }) {
  if (!visible) return null;
  const s = text != null && String(text).trim() !== '' ? String(text) : '—';
  return (
    <div className={`projects-panel-folder-meta projects-panel-folder-meta--${variant}`} title={s}>
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
  selectedFolderId,
  onFolderSelect,
  sortableListeners = null,
  suppressFolderClickRef = null,
  isDragging = false,
  isDragOverlay = false,
  renderChildFolders = null,
  /** false only for 2nd+ top-level roots; nested rows omit this (default true) */
  isFirstInRootList = true,
  /** false except for the last top-level root; nested rows omit (default true) */
  isLastInRootList = true,
}) {
  const hasChildren = Array.isArray(folder.children) && folder.children.length > 0;
  const expanded = expandedIds.has(folder.id);
  const canShowNested = depth < MAX_FOLDER_DEPTH_INDEX;
  const showArrow = hasChildren && canShowNested;
  const isSelected = selectedFolderId === folder.id;
  const { description: showDescription, lastUpdated: showLastUpdated } = extraCols;

  const primaryIndentPx =
    depth * 14 + (depth > 0 ? 2 : 0) + (depth === 1 ? 2 : 0) + (depth === 1 || depth === 2 ? 4 : 0);

  const rootGroupDivider =
    depth === 0 && !isFirstInRootList ? ' projects-panel-folder-block--root-group-start' : '';
  const rootGroupEnd =
    depth === 0 && isLastInRootList ? ' projects-panel-folder-block--root-group-end' : '';
  const rootGroupFirst =
    depth === 0 && isFirstInRootList ? ' projects-panel-folder-block--root-group-first' : '';

  return (
    <div className={`projects-panel-folder-block${rootGroupFirst}${rootGroupDivider}${rootGroupEnd}${isDragging ? ' projects-panel-folder-block--dragging' : ''}${isDragOverlay ? ' projects-panel-folder-block--overlay' : ''}`}>
      <div
        className={`projects-panel-folder-row${showDescription || showLastUpdated ? ' projects-panel-folder-row--with-meta' : ''}${showDescription ? ' projects-panel-folder-row--col-description' : ''}${showLastUpdated ? ' projects-panel-folder-row--col-last-updated' : ''}${isSelected ? ' projects-panel-folder-row--selected' : ''}${sortableListeners ? ' projects-panel-folder-row--draggable' : ''}`}
        style={
          showDescription || showLastUpdated
            ? { '--folder-indent': `${primaryIndentPx}px` }
            : undefined
        }
        aria-current={isSelected ? 'page' : undefined}
        {...(sortableListeners?.attributes ?? {})}
        {...(sortableListeners?.listeners ?? {})}
      >
        <div
          className="projects-panel-folder-primary projects-panel-folder-primary--selectable"
          style={
            showDescription || showLastUpdated
              ? undefined
              : { paddingLeft: `${primaryIndentPx}px` }
          }
          role="button"
          tabIndex={0}
          onClick={() => {
            if (suppressFolderClickRef?.current) {
              suppressFolderClickRef.current = false;
              return;
            }
            onFolderSelect?.(folder.id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onFolderSelect?.(folder.id);
            }
          }}
        >
          <span className="projects-panel-folder-expand-slot">
            {showArrow ? (
              <button
                type="button"
                className={`projects-panel-folder-chevron${expanded ? ' projects-panel-folder-chevron--open' : ''}`}
                aria-expanded={expanded}
                aria-label={expanded ? `Collapse ${folder.name}` : `Expand ${folder.name}`}
                onClick={() => onToggleExpand(folder.id)}
                onPointerDown={(event) => event.stopPropagation()}
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
        <FolderMetaColumn visible={showDescription} variant="description" text={folder.description} />
        <FolderMetaColumn visible={showLastUpdated} variant="lastUpdated" text={getFolderUpdatedAtLabel(folder)} />
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
          onPointerDown={(event) => event.stopPropagation()}
        >
          <img src="/icons/moreMenu.svg" alt="" />
        </button>
      </div>
      {!isDragOverlay && hasChildren && expanded && canShowNested && (
        <div className="projects-panel-folder-children">
          {renderChildFolders
            ? renderChildFolders(folder.children)
            : folder.children.map((child) => (
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
                  selectedFolderId={selectedFolderId}
                  onFolderSelect={onFolderSelect}
                />
              ))}
        </div>
      )}
    </div>
  );
}

function SortableFolderBlock({
  folder,
  parentId,
  depth,
  index,
  siblingCount,
  folderRowProps,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: folder.id,
    data: { parentId, type: 'folder' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`projects-panel-folder-sortable${isDragging ? ' projects-panel-folder-sortable--placeholder' : ''}`}
    >
      <FolderRow
        folder={folder}
        depth={depth}
        sortableListeners={{ attributes, listeners }}
        isDragging={isDragging}
        isFirstInRootList={parentId === 'root' && index === 0}
        isLastInRootList={parentId === 'root' && index === siblingCount - 1}
        renderChildFolders={(children) => (
          <SortableFolderList
            folders={children}
            parentId={folder.id}
            depth={depth + 1}
            folderRowProps={folderRowProps}
          />
        )}
        {...folderRowProps}
      />
    </div>
  );
}

function SortableFolderList({ folders, parentId, depth, folderRowProps }) {
  const itemIds = useMemo(() => folders.map((folder) => folder.id), [folders]);

  return (
    <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
      {folders.map((folder, index) => (
        <SortableFolderBlock
          key={folder.id}
          folder={folder}
          parentId={parentId}
          depth={depth}
          index={index}
          siblingCount={folders.length}
          folderRowProps={folderRowProps}
        />
      ))}
    </SortableContext>
  );
}

function ProjectsPanel({
  isOpen,
  onClose,
  width = 263,
  onWidthChange,
  minWidth = 263,
  maxWidth = 600,
  selectedFolderId = null,
  onFolderSelect,
  folderTree = PROJECTS_PANEL_FOLDER_TREE,
  onFolderTreeChange,
}) {
  const resizeRef = useRef(null);
  const headerMainRef = useRef(null);
  const widthRef = useRef(width);
  widthRef.current = width;

  const [menuOpen, setMenuOpen] = useState(false);
  const [sourceId, setSourceId] = useState('myProjects');
  const [expandedIds, setExpandedIds] = useState(() => {
    if (!selectedFolderId) return new Set();
    return new Set(getFolderAncestorIds(folderTree, selectedFolderId));
  });
  const [activeDragId, setActiveDragId] = useState(null);
  const suppressFolderClickRef = useRef(false);
  const headlineBtnRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const folderMoreAnchorRef = useRef(null);
  const [folderMoreMenu, setFolderMoreMenu] = useState(null);
  const [folderNotificationsDisabled, setFolderNotificationsDisabled] = useState(() => new Set());
  const [inlineNavTracksTypoFits, setInlineNavTracksTypoFits] = useState(false);

  const updateMenuPosition = useCallback(() => {
    const el = headlineBtnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuPosition({ left: r.left, top: r.bottom + 4, width: Math.max(r.width, 200) });
  }, []);

  useEffect(() => {
    if (!selectedFolderId) return;
    const ancestors = getFolderAncestorIds(folderTree, selectedFolderId);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      ancestors.forEach((id) => next.add(id));
      return next;
    });
  }, [selectedFolderId, folderTree]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: FOLDER_DRAG_HOLD_MS,
        tolerance: FOLDER_DRAG_HOLD_TOLERANCE_PX,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: FOLDER_DRAG_HOLD_MS,
        tolerance: FOLDER_DRAG_HOLD_TOLERANCE_PX,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event) => {
    suppressFolderClickRef.current = true;
    setActiveDragId(event.active.id);
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null);
    suppressFolderClickRef.current = false;
  }, []);

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      const didReorder = Boolean(over && active.id !== over.id);

      if (didReorder && onFolderTreeChange) {
        const activeParent = active.data.current?.parentId;
        const overParent = over.data.current?.parentId;
        if (activeParent === overParent) {
          const siblings = getSiblingFolders(folderTree, activeParent);
          const oldIndex = siblings.findIndex((folder) => folder.id === active.id);
          const newIndex = siblings.findIndex((folder) => folder.id === over.id);
          if (oldIndex >= 0 && newIndex >= 0) {
            onFolderTreeChange(
              reorderSiblingFolders(
                folderTree,
                activeParent === 'root' ? null : activeParent,
                oldIndex,
                newIndex
              )
            );
          }
        }
      }

      setActiveDragId(null);
      if (!didReorder) {
        suppressFolderClickRef.current = false;
      }
    },
    [folderTree, onFolderTreeChange]
  );

  const activeDragFolder = useMemo(
    () => (activeDragId ? findFolderById(folderTree, activeDragId) : null),
    [activeDragId, folderTree]
  );

  const activeDragDepth = useMemo(() => {
    if (!activeDragId) return 0;
    return Math.max(0, getFolderPath(folderTree, activeDragId).length - 1);
  }, [activeDragId, folderTree]);

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

  const toggleFolderNotifications = useCallback((folderId, allowed) => {
    setFolderNotificationsDisabled((prev) => {
      const next = new Set(prev);
      if (allowed) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
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
  const showAnyMetaCol = extraCols.description || extraCols.lastUpdated;
  const showAllFolderMeta = extraCols.description && extraCols.lastUpdated;
  const showWideLayout = width >= HEADER_WIDE_LAYOUT_AT;
  const showToolbarLabels = width >= TOOLBAR_LABELED_AT;
  const showColumnHeadersRow = showAnyMetaCol || showWideLayout;

  const folderRowProps = useMemo(
    () => ({
      expandedIds,
      onToggleExpand: toggleExpand,
      extraCols,
      showMoreAlways: showWideLayout,
      onFolderMoreClick: openFolderMoreMenu,
      folderMoreOpenId: folderMoreMenu?.folderId ?? null,
      selectedFolderId,
      onFolderSelect,
      suppressFolderClickRef,
    }),
    [
      expandedIds,
      toggleExpand,
      extraCols,
      showWideLayout,
      openFolderMoreMenu,
      folderMoreMenu?.folderId,
      selectedFolderId,
      onFolderSelect,
      suppressFolderClickRef,
    ]
  );

  useLayoutEffect(() => {
    if (!isOpen || !showInlineNav || !showAllFolderMeta) {
      setInlineNavTracksTypoFits(false);
      return;
    }
    const minNavW = getInlineNavMinWidth22Px();
    if (minNavW <= 0) {
      setInlineNavTracksTypoFits(false);
      return;
    }
    const run = () => {
      const main = headerMainRef.current;
      if (!main) {
        setInlineNavTracksTypoFits(false);
        return;
      }
      const toolbar = main.querySelector('.projects-panel-toolbar-icons');
      const mainW = main.getBoundingClientRect().width;
      const toolbarW = toolbar?.getBoundingClientRect().width ?? 0;
      const available = mainW - toolbarW - 8;
      setInlineNavTracksTypoFits(available >= minNavW + INLINE_NAV_TRACKS_TYPO_FIT_BUFFER);
    };
    run();
    const ro = new ResizeObserver(run);
    const main = headerMainRef.current;
    if (main) {
      ro.observe(main);
      const toolbar = main.querySelector('.projects-panel-toolbar-icons');
      if (toolbar) ro.observe(toolbar);
    }
    return () => ro.disconnect();
  }, [isOpen, showInlineNav, showAllFolderMeta, showToolbarLabels, width]);

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
          <Fragment key={action.id}>
            {action.id === 'archive' && (
              <div className="projects-panel-folder-more-menu-divider" aria-hidden="true" />
            )}
            {action.toggle ? (
              <div
                className="projects-panel-folder-more-menu-row projects-panel-folder-more-menu-row--toggle"
                role="none"
              >
                <span className="projects-panel-folder-more-menu-row__label">{action.label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!folderNotificationsDisabled.has(folderMoreMenu.folderId)}
                  aria-label={`${action.label} for ${folderMoreMenu.folderName}`}
                  className={`account-notification-settings-toggle${!folderNotificationsDisabled.has(folderMoreMenu.folderId) ? ' account-notification-settings-toggle--on' : ''}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    const allowed = folderNotificationsDisabled.has(folderMoreMenu.folderId);
                    toggleFolderNotifications(folderMoreMenu.folderId, allowed);
                  }}
                >
                  <span className="account-notification-settings-toggle__slider" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                role="menuitem"
                className="projects-panel-folder-more-menu-item"
                onClick={() => {
                  if (action.id === 'view') {
                    onFolderSelect?.(folderMoreMenu.folderId);
                  }
                  closeFolderMoreMenu();
                }}
              >
                {action.label}
              </button>
            )}
          </Fragment>
        ))}
      </div>,
      document.body
    );

  return (
    <aside
      className={`projects-panel ${isOpen ? 'open' : ''}${isOpen && width > minWidth ? ' projects-panel--overlay' : ''}${showInlineNav ? ' projects-panel--inline-nav' : ''}${showWideLayout ? ' projects-panel--wide-layout' : ''}${inlineNavTracksTypoFits ? ' projects-panel--inline-nav-tracks-typo' : ''}${showToolbarLabels ? ' projects-panel--toolbar-labeled' : ''}`}
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
        <div className="projects-panel-header-main" ref={headerMainRef}>
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
              <button type="button" className="projects-panel-toolbar-btn" aria-label="Search My Projects">
                <img src={ICON_SEARCH} alt="" aria-hidden />
                <span className="projects-panel-toolbar-btn-label">Search My Projects</span>
              </button>
              <button type="button" className="projects-panel-toolbar-btn" aria-label="New Project">
                <img src={ICON_FOLDER_NEW} alt="" aria-hidden />
                <span className="projects-panel-toolbar-btn-label">New Project</span>
              </button>
              <button type="button" className="projects-panel-toolbar-btn" aria-label="SORT: DATE MODIFIED">
                <img src={ICON_SORT} alt="" aria-hidden />
                <span className="projects-panel-toolbar-btn-label">SORT: DATE MODIFIED</span>
              </button>
            </div>
            <button type="button" className="projects-panel-toolbar-btn projects-panel-toolbar-btn--close" onClick={onClose} aria-label="Close panel">
              <img src="/icons/close.svg" alt="" />
            </button>
          </div>
        </div>
      </div>
      {menuPortal}
      {folderMoreMenuPortal}
      <div className="projects-panel-content projects-panel-content--folders">
        {showColumnHeadersRow && (
          <div
            className={`projects-panel-column-headers${showAnyMetaCol ? ' projects-panel-column-headers--with-meta' : ''}${extraCols.description ? ' projects-panel-column-headers--col-description' : ''}${extraCols.lastUpdated ? ' projects-panel-column-headers--col-last-updated' : ''}`}
            role="row"
            aria-label="Column headings"
          >
            <div className="projects-panel-column-headers-primary projects-panel-column-header projects-panel-column-header--name">
              Name
            </div>
            {extraCols.description && (
              <div className="projects-panel-column-header projects-panel-column-header--description">Description</div>
            )}
            {extraCols.lastUpdated && (
              <div className="projects-panel-column-header projects-panel-column-header--last-updated">Last updated</div>
            )}
            {/* Matches folder-row more button width so Name + meta columns share the same flex space */}
            <div className="projects-panel-column-headers-spacer" aria-hidden="true" />
          </div>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="projects-panel-folder-list">
            <SortableFolderList
              folders={folderTree}
              parentId="root"
              depth={0}
              folderRowProps={folderRowProps}
            />
          </div>
          <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}>
            {activeDragFolder ? (
              <div className="projects-panel-folder-sortable projects-panel-folder-sortable--overlay">
                <FolderRow
                  folder={activeDragFolder}
                  depth={activeDragDepth}
                  isDragOverlay
                  {...folderRowProps}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </aside>
  );
}

export default ProjectsPanel;
