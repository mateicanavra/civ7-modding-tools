import { Map as MapIcon, Workflow } from "lucide-react";
import React from "react";
import type { StageView } from "../../stores/viewStore";

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
}

export const StageViewTabs: React.FC<StageViewTabsProps> = ({ value, onValueChange, top }) => {
  return (
    <div
      role="group"
      aria-label="Stage view"
      className="absolute left-1/2 z-20 -translate-x-1/2 inline-flex items-center rounded-lg border border-border bg-popover/95 p-1 backdrop-blur-sm"
      style={{ top }}
    >
      {VIEWS.map(({ id, label, description, Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            title={description}
            onClick={() => onValueChange(id)}
            className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-data font-medium transition-colors ${
              active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
