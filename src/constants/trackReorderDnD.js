const DEFAULT_OVERLAY_WIDTH = 260;
const DEFAULT_OVERLAY_HEIGHT = 44;

let livePointerCoords = null;
let livePointerTrackingBound = false;

function handleLivePointerMove(event) {
  livePointerCoords = { x: event.clientX, y: event.clientY };
}

/** Track the latest pointer position for drag overlays (hold-drag safe). */
export function ensureLivePointerTracking() {
  if (livePointerTrackingBound || typeof window === 'undefined') return;
  livePointerTrackingBound = true;
  window.addEventListener('pointermove', handleLivePointerMove, { passive: true, capture: true });
  window.addEventListener('pointerdown', handleLivePointerMove, { passive: true, capture: true });
}

function getLivePointerCoordinates(fallbackEvent) {
  ensureLivePointerTracking();
  if (livePointerCoords) return livePointerCoords;
  return fallbackEvent ? getPointerCoordinates(fallbackEvent) : null;
}

export const TRACK_REORDER_DROP_ANIMATION_MS = 220;
export const TRACK_REORDER_LAND_MS = 480;
export const TRACK_REORDER_FLIP_MS = 520;

/** Explicit REORDER/DONE mode with simplified rows. */
export const TRACK_REORDER_INTERACTION_MODE = 'reorder-mode';
/** Hold anywhere on the row to drag; keeps the full track list UI. */
export const TRACK_REORDER_INTERACTION_HOLD_DRAG = 'hold-drag';

/** Delay before showing the drag-to-reorder hover hint. */
export const TRACK_REORDER_HINT_DELAY_MS = 2000;

export const trackReorderDropAnimation = {
  duration: TRACK_REORDER_DROP_ANIMATION_MS,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
};

export { PROJECTS_DND_HOLD_MS, PROJECTS_DND_HOLD_TOLERANCE_PX } from './projectsPanelDnD';

export const FOLDER_REORDER_SORTABLE_PREFIX = 'folder-reorder:';

export function toFolderSortableId(folderId) {
  return `${FOLDER_REORDER_SORTABLE_PREFIX}${folderId}`;
}

export function parseFolderSortableId(sortableId) {
  const id = String(sortableId);
  return id.startsWith(FOLDER_REORDER_SORTABLE_PREFIX)
    ? id.slice(FOLDER_REORDER_SORTABLE_PREFIX.length)
    : null;
}

export function isFolderSortableId(sortableId) {
  return String(sortableId).startsWith(FOLDER_REORDER_SORTABLE_PREFIX);
}

/** Find a sortable folder row element in the project track list. */
export function getFolderRowElement(folderId) {
  const id = String(folderId);
  return document.querySelector(`[data-folder-id="${CSS.escape(id)}"]`);
}

/** Find a sortable track row element in the list. */
export function getTrackRowElement(trackId) {
  const id = String(trackId);
  return document.querySelector(`[data-track-id="${CSS.escape(id)}"]`);
}

/** Snapshot row positions before reorder for FLIP animation. */
export function captureTrackRowRects(trackIds) {
  const rects = new Map();
  for (const trackId of trackIds) {
    const id = String(trackId);
    const el = getTrackRowElement(id);
    if (el) rects.set(id, el.getBoundingClientRect());
  }
  return rects;
}

/** Compute Y offsets between snapshot rects and current DOM layout. */
export function computeTrackRowFlipOffsets(beforeRects, trackIds) {
  const offsets = {};
  for (const trackId of trackIds) {
    const id = String(trackId);
    const el = getTrackRowElement(id);
    const first = beforeRects.get(id);
    if (!el || !first) continue;
    const deltaY = first.top - el.getBoundingClientRect().top;
    if (Math.abs(deltaY) > 0.5) offsets[id] = deltaY;
  }
  return offsets;
}

/** Pin the drag thumbnail center on the live pointer position. */
export function snapTrackReorderOverlayToCursor({
  activatorEvent,
  activeNodeRect,
  draggingNodeRect,
  overlayNodeRect,
  transform,
}) {
  if (!activeNodeRect) {
    return transform;
  }

  const coords = getLivePointerCoordinates(activatorEvent);
  if (!coords) {
    return transform;
  }

  const measuredOverlay = draggingNodeRect ?? overlayNodeRect;
  const overlayWidth = measuredOverlay?.width ?? DEFAULT_OVERLAY_WIDTH;
  const overlayHeight = measuredOverlay?.height ?? DEFAULT_OVERLAY_HEIGHT;

  return {
    ...transform,
    x: coords.x - activeNodeRect.left - overlayWidth / 2,
    y: coords.y - activeNodeRect.top - overlayHeight / 2,
  };
}

function getPointerCoordinates(event) {
  if (event instanceof MouseEvent) {
    return { x: event.clientX, y: event.clientY };
  }
  if (event instanceof TouchEvent && event.touches.length > 0) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
  return null;
}
