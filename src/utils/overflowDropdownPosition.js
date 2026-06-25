const SEGMENT_MENU_ITEM_HEIGHT = 36;
const SEGMENT_MENU_PADDING = 8;
const SEGMENT_MENU_DIVIDER_HEIGHT = 9;
const ICON_ROW_MENU_HEIGHT = 44;

/** Estimated height for compact segment-style overflow menus. */
export function getSegmentOverflowMenuHeight(itemCount, hasDivider = false) {
  return (
    itemCount * SEGMENT_MENU_ITEM_HEIGHT +
    (hasDivider ? SEGMENT_MENU_DIVIDER_HEIGHT : 0) +
    SEGMENT_MENU_PADDING
  );
}

/** Estimated height for track row overflow menus. */
export function getTrackOverflowMenuHeight({ compact, showRemoveFromProject = false } = {}) {
  if (!compact) return ICON_ROW_MENU_HEIGHT;
  return getSegmentOverflowMenuHeight(4 + (showRemoveFromProject ? 1 : 0), showRemoveFromProject);
}

/**
 * Position a fixed overflow menu above or below its trigger, flipping when
 * there isn't enough viewport space above (e.g. first row under the header).
 */
export function getOverflowDropdownStyle(
  triggerRect,
  { menuHeight = 160, gap = 4, viewportPadding = 8 } = {}
) {
  const spaceAbove = triggerRect.top - viewportPadding;
  const spaceBelow = window.innerHeight - triggerRect.bottom - viewportPadding;
  const right = window.innerWidth - triggerRect.right;

  const fitsAbove = spaceAbove >= menuHeight + gap;
  const fitsBelow = spaceBelow >= menuHeight + gap;
  const openAbove = fitsAbove && (!fitsBelow || spaceAbove >= spaceBelow);

  if (openAbove) {
    return {
      position: 'fixed',
      right,
      top: 'auto',
      bottom: window.innerHeight - triggerRect.top + gap,
    };
  }

  return {
    position: 'fixed',
    right,
    top: triggerRect.bottom + gap,
    bottom: 'auto',
  };
}
