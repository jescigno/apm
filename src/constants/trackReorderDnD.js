const DEFAULT_OVERLAY_WIDTH = 260;
const DEFAULT_OVERLAY_HEIGHT = 44;

export const TRACK_REORDER_DROP_ANIMATION_MS = 220;
export const TRACK_REORDER_LAND_MS = 480;

export const trackReorderDropAnimation = {
  duration: TRACK_REORDER_DROP_ANIMATION_MS,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
};

/** Keep the compact reorder drag thumbnail centered on the pointer. */
export function snapTrackReorderOverlayToCursor({
  activatorEvent,
  activeNodeRect,
  overlayNodeRect,
  transform,
}) {
  if (!activatorEvent || !activeNodeRect) {
    return transform;
  }

  const coords = getPointerCoordinates(activatorEvent);
  if (!coords) {
    return transform;
  }

  const overlayWidth = overlayNodeRect?.width || DEFAULT_OVERLAY_WIDTH;
  const overlayHeight = overlayNodeRect?.height || DEFAULT_OVERLAY_HEIGHT;

  const offsetX = coords.x - activeNodeRect.left - overlayWidth / 2;
  const offsetY = coords.y - activeNodeRect.top - overlayHeight / 2;

  return {
    ...transform,
    x: transform.x + offsetX,
    y: transform.y + offsetY,
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
