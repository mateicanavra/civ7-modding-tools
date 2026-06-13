// ============================================================================
// LAYOUT
// ============================================================================
// The single geometry authority for the studio chrome (Pass-2 amendment in
// .interface-design/system.md). Panels consume these via inline style so a
// geometry change is a one-line edit here — no arbitrary-value width classes.
// ============================================================================

export const LAYOUT = {
  /**
   * Initial estimate of the measured header height (single-row bar). The
   * ResizeObserver in `AppHeader` is the authority — this only seeds
   * `StudioShell`'s state for the first paint and is NOT a reserved band.
   */
  HEADER_HEIGHT: 48,
  /** Footer bar height in pixels */
  FOOTER_HEIGHT: 56,
  /** Recipe (left) dock panel width in pixels */
  PANEL_WIDTH: 340,
  /** Explore (right) dock panel width in pixels */
  EXPLORE_PANEL_WIDTH: 260,
  /** Standard spacing unit in pixels */
  SPACING: 16,
  /** Border radius presets */
  BORDER_RADIUS: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
  },
} as const;

export type LayoutConfig = typeof LAYOUT;
