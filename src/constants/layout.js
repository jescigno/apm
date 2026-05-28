/**
 * Viewport width (px) for the compact / mobile breakpoint only — matches CSS `@media (max-width: 768px)`.
 * Use this for `matchMedia` / layout flags; keep mobile-specific UI changes scoped to this breakpoint.
 */
export const LAYOUT_COMPACT_MAX_WIDTH = 768;

/**
 * Main content container width (px) at which track rows show all five action icons.
 * Below this (≈ viewport 1164 with 64px sidebar), actions collapse to the … menu.
 * Must match `@container app-content (min-width: …)` in index.css for `.track-actions-expanded`.
 */
export const TRACK_ACTIONS_EXPAND_MIN_CONTAINER = 1101;

/**
 * Wide header layout (inline nav, no hamburger). Must match CSS `@media (min-width: 1920px)` for the header.
 */
export const LAYOUT_WIDE_MIN_WIDTH = 1920;
