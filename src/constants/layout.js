/**
 * Standard viewport breakpoints (mobile-first min-widths).
 * Ranges are inclusive at the lower bound: xsmall 0–390, small 390–768, medium 768–1024, etc.
 * Design system + new layout work should align to these tiers; legacy CSS may still use max-width rules.
 */

export const BREAKPOINT_XSMALL_MIN = 0;
export const BREAKPOINT_XSMALL_MAX = 390;

export const BREAKPOINT_SMALL_MIN = 390;
export const BREAKPOINT_SMALL_MAX = 768;

export const BREAKPOINT_MEDIUM_MIN = 768;
export const BREAKPOINT_MEDIUM_MAX = 1024;

export const BREAKPOINT_LARGE_MIN = 1024;
export const BREAKPOINT_LARGE_MAX = 1440;

export const BREAKPOINT_XLARGE_MIN = 1440;
export const BREAKPOINT_XLARGE_MAX = 1920;

export const BREAKPOINT_XXLARGE_MIN = 1920;
export const BREAKPOINT_XXLARGE_MAX = 2560;

/** Ultra-wide displays — 2560px and above. */
export const BREAKPOINT_XXXLARGE_MIN = 2560;

/** Canonical viewport tiers for documentation and matchMedia. */
export const VIEWPORT_BREAKPOINTS = [
  {
    id: 'xsmall',
    name: 'xsmall',
    minWidth: BREAKPOINT_XSMALL_MIN,
    maxWidth: BREAKPOINT_XSMALL_MAX,
    token: 'BREAKPOINT_XSMALL_MIN',
  },
  {
    id: 'small',
    name: 'small',
    minWidth: BREAKPOINT_SMALL_MIN,
    maxWidth: BREAKPOINT_SMALL_MAX,
    token: 'BREAKPOINT_SMALL_MIN',
  },
  {
    id: 'medium',
    name: 'medium',
    minWidth: BREAKPOINT_MEDIUM_MIN,
    maxWidth: BREAKPOINT_MEDIUM_MAX,
    token: 'BREAKPOINT_MEDIUM_MIN',
  },
  {
    id: 'large',
    name: 'large',
    minWidth: BREAKPOINT_LARGE_MIN,
    maxWidth: BREAKPOINT_LARGE_MAX,
    token: 'BREAKPOINT_LARGE_MIN',
  },
  {
    id: 'x-large',
    name: 'x-large',
    minWidth: BREAKPOINT_XLARGE_MIN,
    maxWidth: BREAKPOINT_XLARGE_MAX,
    token: 'BREAKPOINT_XLARGE_MIN',
  },
  {
    id: 'xxlarge',
    name: 'xxlarge',
    minWidth: BREAKPOINT_XXLARGE_MIN,
    maxWidth: BREAKPOINT_XXLARGE_MAX,
    token: 'BREAKPOINT_XXLARGE_MIN',
  },
  {
    id: '2560+',
    name: '2560+',
    minWidth: BREAKPOINT_XXXLARGE_MIN,
    maxWidth: null,
    token: 'BREAKPOINT_XXXLARGE_MIN',
  },
];

/**
 * Viewport width (px) for the compact / mobile breakpoint — matches CSS `@media (max-width: 768px)`.
 * Equivalent to {@link BREAKPOINT_MEDIUM_MIN} (medium tier starts at 768px).
 */
export const LAYOUT_COMPACT_MAX_WIDTH = BREAKPOINT_MEDIUM_MIN;

/**
 * Main content container width (px) at which track rows show all five action icons.
 * Below this (≈ viewport 1164 with 64px sidebar), actions collapse to the … menu.
 * Must match `@container app-content (min-width: …)` in index.css for `.track-actions-expanded`.
 */
export const TRACK_ACTIONS_EXPAND_MIN_CONTAINER = 1101;

/**
 * Wide header layout (inline nav, no hamburger). Must match CSS `@media (min-width: 1920px)` for the header.
 * Equivalent to {@link BREAKPOINT_XXLARGE_MIN}.
 */
export const LAYOUT_WIDE_MIN_WIDTH = BREAKPOINT_XXLARGE_MIN;
