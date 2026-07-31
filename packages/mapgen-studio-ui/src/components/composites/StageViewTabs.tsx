import { Map as MapIcon, Workflow } from "lucide-react";
import React from "react";
import { cn } from "../../lib/utils.js";
import { SegmentedControl } from "./SegmentedControl.js";

/**
 * Which view the center stage presents: the generated map, or the authored
 * recipe's dependency pipeline (mapgen-studio-dag-tab). Owned by the component
 * (re-homed from the app's `viewStore`, which imports it back).
 */
export type StageView = "map" | "pipeline";

// ============================================================================
// STAGE VIEW TABS — the stage's own view switcher (mapgen-studio-dag-tab)
// ============================================================================
// Which view the center stage presents is STAGE FURNITURE: it is not a game
// setting (Game bar), not a map parameter (World console), not authoring
// (Recipe dock), and not map inspection (Explore dock). So the switcher
// floats at the stage's top edge, centered, in the same popover-tier pill
// chrome as the consoles, using the segmented-control idiom (Pass-2
// explore-toolbar): an inset group on the control background, the active
// segment lifted one surface tier.
// ============================================================================

const VIEWS: ReadonlyArray<{
  id: StageView;
  label: string;
  description: string;
  Icon: typeof MapIcon;
}> = [
  { id: "map", label: "Map", description: "Generated map view", Icon: MapIcon },
  {
    id: "pipeline",
    label: "Pipeline",
    description: "Recipe dependency graph",
    Icon: Workflow,
  },
];

export interface StageViewTabsProps {
  /** The active stage view. */
  value: StageView;
  /** Callback when the user switches views. */
  onValueChange: (view: StageView) => void;
  /** Top offset (px) so the pill clears the floating header. */
  top: number;
  /**
   * Placement override (positioning-as-chrome): the default absolute
   * top-centered stage placement is app chrome; hosts embedding the switcher
   * elsewhere override it here (merged via `cn`).
   */
  className?: string;
}

/**
 * Switches the central stage between map and recipe-pipeline projections.
 *
 * The selected view remains host-owned; `top` aligns this self-positioned control below the
 * measured header alongside the docks and error banner.
 */
export const StageViewTabs: React.FC<StageViewTabsProps> = ({
  value,
  onValueChange,
  top,
  className,
}) => {
  return (
    <SegmentedControl
      aria-label="Stage view"
      className={cn(
        "absolute left-1/2 z-20 -translate-x-1/2 rounded-lg border-border bg-popover/95 p-1 backdrop-blur-sm",
        className
      )}
      style={{ top }}
      value={value}
      onValueChange={onValueChange}
      items={VIEWS.map(({ id, label, description, Icon }) => ({
        value: id,
        label,
        title: description,
        children: (
          <>
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{label}</span>
          </>
        ),
      }))}
    />
  );
};
