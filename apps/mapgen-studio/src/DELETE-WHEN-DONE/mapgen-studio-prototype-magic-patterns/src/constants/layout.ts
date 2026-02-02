// ============================================================================
// LAYOUT
// ============================================================================
// Layout constants for consistent spacing and sizing.
// ============================================================================

export const LAYOUT = {
  /** Header bar height in pixels */
  HEADER_HEIGHT: 56,
  /** Footer bar height in pixels */
  FOOTER_HEIGHT: 56,
  /** Default panel width in pixels */
  PANEL_WIDTH: 280,
  /** Explore panel width in pixels */
  EXPLORE_PANEL_WIDTH: 240,
  /** Standard spacing unit in pixels */
  SPACING: 16,
  /** Border radius presets */
  BORDER_RADIUS: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12
  }
} as const;

export type LayoutConfig = typeof LAYOUT;