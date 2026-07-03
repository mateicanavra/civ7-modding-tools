import type { ReactNode } from "react";
import { LAYOUT } from "../../lib/layout.js";
import { cn } from "../../lib/utils.js";
import { LeftDock } from "../layout/LeftDock.js";
import { RightDock } from "../layout/RightDock.js";

// ============================================================================
// STUDIO SHELL LAYOUT — the canonical shell assembly (templates group)
// ============================================================================
// The whole studio chrome as one slot-based template: a relative root over a
// full-bleed canvas layer, the two docks wired to shared top/bottom offsets,
// and self-positioning chrome (header / footer / stage tabs / banner) painted
// in the app's order. It mirrors the composition of the app host
// (apps/mapgen-studio/src/app/StudioShell.tsx) — same layering, same geometry
// formula — so a design built on this template maps 1:1 onto the app.
//
// This is the graduation target of the operating model's "reference:
// canonical assembly" explorations (see README.md → Operating model): an
// assembly that earns reuse becomes a real component here, with a story and
// verified renders, instead of living as loose HTML in the design project.
//
// Deliberately NOT here (app-side runtime, not chrome geometry): the skip
// link + sr-only live region, preset dialogs, the hidden import input, the
// measured header height (the app's ResizeObserver refines `panelTop`; the
// defaults below use the LAYOUT seed values), and the map/pipeline stage swap
// (pass the active stage as `canvas` and swap `rightPanel` out in pipeline
// view, as the app does).
// ============================================================================

/** The resolved dock offsets, handed to function-form chrome slots. */
export interface StudioShellGeometry {
  /** px from the viewport top to the docks' top edge. */
  panelTop: number;
  /** px from the viewport bottom to the docks' bottom edge. */
  panelBottom: number;
}

/**
 * A chrome slot: a plain node, or a function of the resolved geometry for
 * chrome that needs the offsets (`StageViewTabs`/`ErrorBanner` take `top`) —
 * the function form keeps one geometry authority when overriding the
 * defaults.
 */
type ChromeSlot = ReactNode | ((geometry: StudioShellGeometry) => ReactNode);

export interface StudioShellLayoutProps {
  /** The stage layer (map canvas, pipeline view, or a placeholder); filled to the root via `absolute inset-0`. */
  canvas?: ReactNode;
  /** Left-dock content (the Recipe panel in the app); wrapped in `LeftDock` at the shared offsets. */
  leftPanel?: ReactNode;
  /** Right-dock content (the Explore panel in the app, map view only); wrapped in `RightDock` at the shared offsets. */
  rightPanel?: ReactNode;
  /** Top-center stage furniture (`StageViewTabs`); self-positions — use the function form for its `top`. */
  stageTabs?: ChromeSlot;
  /** Top chrome (`AppHeader`); self-positions `absolute top-4`. */
  header?: ChromeSlot;
  /** Bottom chrome (`AppFooter`); self-positions `absolute bottom-4`. */
  footer?: ChromeSlot;
  /** Interruptive overlay (`ErrorBanner`); painted last — use the function form for its `top`. */
  banner?: ChromeSlot;
  /**
   * Dock top offset (px). Defaults to the LAYOUT formula the app uses,
   * seeded with the estimated header height (the app substitutes the
   * measured one): `SPACING + HEADER_HEIGHT + SPACING`.
   */
  panelTop?: number;
  /** Dock bottom offset (px). Defaults to the app's `FOOTER_HEIGHT + 2 * SPACING`. */
  panelBottom?: number;
  /** Merged onto the root (e.g. `min-h-screen` when the host owns page height). */
  className?: string;
}

const DEFAULT_PANEL_TOP = LAYOUT.SPACING + LAYOUT.HEADER_HEIGHT + LAYOUT.SPACING;
const DEFAULT_PANEL_BOTTOM = LAYOUT.FOOTER_HEIGHT + 2 * LAYOUT.SPACING;

function renderSlot(slot: ChromeSlot, geometry: StudioShellGeometry): ReactNode {
  return typeof slot === "function" ? slot(geometry) : slot;
}

/**
 * `StudioShellLayout` — the studio's application shell as a template. Hosts
 * supply the parts; the template owns the geometry: root box, canvas fill,
 * dock offsets, and paint order (canvas → docks → tabs → header → footer →
 * banner). Requires the ambient `TooltipProvider` like every composed panel.
 */
export function StudioShellLayout({
  canvas,
  leftPanel,
  rightPanel,
  stageTabs,
  header,
  footer,
  banner,
  panelTop = DEFAULT_PANEL_TOP,
  panelBottom = DEFAULT_PANEL_BOTTOM,
  className,
}: StudioShellLayoutProps) {
  const geometry: StudioShellGeometry = { panelTop, panelBottom };
  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-background", className)}>
      <div className="absolute inset-0">{canvas}</div>
      {leftPanel ? (
        <LeftDock top={panelTop} bottom={panelBottom}>
          {leftPanel}
        </LeftDock>
      ) : null}
      {rightPanel ? (
        <RightDock top={panelTop} bottom={panelBottom}>
          {rightPanel}
        </RightDock>
      ) : null}
      {renderSlot(stageTabs, geometry)}
      {renderSlot(header, geometry)}
      {renderSlot(footer, geometry)}
      {renderSlot(banner, geometry)}
    </div>
  );
}
