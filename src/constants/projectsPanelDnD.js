/** Shared hold-to-drag timing for projects panel folders and project track thumbs. */
import { closestCenter, pointerWithin } from '@dnd-kit/core';

export const PROJECTS_DND_HOLD_MS = 220;
export const PROJECTS_DND_HOLD_TOLERANCE_PX = 8;
export const PROJECTS_DROP_ANIMATION_MS = 220;
export const PROJECTS_FOLDER_REORDER_LAND_MS = 480;

export const projectsFolderReorderDropAnimation = {
  duration: PROJECTS_DROP_ANIMATION_MS,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
};

export const TRACK_DRAG_ID_PREFIX = 'track:';
export const FOLDER_DROP_ID_PREFIX = 'folder-drop:';

export function getTrackDragId(trackId) {
  return `${TRACK_DRAG_ID_PREFIX}${trackId}`;
}

export function parseTrackDragId(id) {
  if (typeof id !== 'string' || !id.startsWith(TRACK_DRAG_ID_PREFIX)) return null;
  return id.slice(TRACK_DRAG_ID_PREFIX.length);
}

export function getFolderDropTargetId(over) {
  if (!over || over.data.current?.type !== 'folder') return null;
  return over.data.current.folderId ?? over.id;
}

function getFolderUnderPointer(args) {
  const folderCollisions = pointerWithin(args).filter((collision) => {
    const container = args.droppableContainers.find((entry) => entry.id === collision.id);
    return container?.data.current?.type === 'folder';
  });

  if (!folderCollisions.length) return [];

  const rowDropTargets = folderCollisions.filter((collision) => {
    const container = args.droppableContainers.find((entry) => entry.id === collision.id);
    return Boolean(container?.data.current?.folderId);
  });
  const candidates = rowDropTargets.length ? rowDropTargets : folderCollisions;

  let bestCollision = candidates[0];
  let smallestArea = Infinity;

  for (const collision of candidates) {
    const rect = args.droppableRects.get(collision.id);
    if (!rect) continue;
    const area = rect.width * rect.height;
    if (area < smallestArea) {
      smallestArea = area;
      bestCollision = collision;
    }
  }

  return [bestCollision];
}

/** Folder reorder uses nearest center; track drops require the pointer over a folder row. */
export function projectsPanelCollisionDetection(args) {
  if (args.active.data.current?.type === 'track') {
    return getFolderUnderPointer(args);
  }
  return closestCenter(args);
}
