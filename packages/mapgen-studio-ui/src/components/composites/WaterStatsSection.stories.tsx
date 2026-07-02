import type { Meta, StoryObj } from "@storybook/react-vite";
import type {
  WaterStatsLayerRef,
  WaterStatsRow,
  WaterStatsSummary,
} from "@swooper/mapgen-studio-ui";
import { WaterStatsSection } from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";

/**
 * WaterStatsSection is the hydrology/lake/floodplain stats surface inside the
 * ExplorePanel dock: a disclosure header ("WATER STATS" · row count) over one
 * compact line per data family — semantic count chips plus jump-to-layer chips
 * (module-owned data colors). Divergence counts (mismatch/rejected) are
 * emphasized in warning when nonzero. The expanded row's chips carry shadcn
 * Tooltips whose TooltipProvider is supplied by the global Storybook decorator.
 * Adapted from `.design-sync/previews/WaterStatsSection.tsx` — the fixture is
 * typed against the package-owned narrow structural types
 * (`WaterStatsSummary`/`WaterStatsLayerRef`); the app's wide viz types conform
 * structurally.
 */
const meta = {
  title: "composites/WaterStatsSection",
  component: WaterStatsSection,
} satisfies Meta<typeof WaterStatsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

// Narrow layer ref — exactly the fields the component renders: layerKey /
// dataTypeKey / label + presentation.categoryLabel / palette.activeColor.
const makeRef = (
  layerKey: string,
  dataTypeKey: string,
  label: string,
  categoryLabel: string,
  activeColor: string
): WaterStatsLayerRef => ({
  dataTypeKey,
  layerKey,
  label,
  presentation: {
    categoryLabel,
    palette: { activeColor },
  },
});

// Narrow row — the component reads rowKey/label/counts/layerRefs.
const makeRow = (
  rowKey: string,
  label: string,
  counts: Record<string, number>,
  layerRefs: WaterStatsLayerRef[]
): WaterStatsRow => ({
  rowKey,
  label,
  counts,
  layerRefs,
});

const summary: WaterStatsSummary = {
  rows: [
    makeRow(
      "projection-plan",
      "Navigable river plan",
      { layers: 3, projected: 184, minor: 142, major: 42 },
      [
        makeRef(
          "map.rivers.projectedRiverMask@9",
          "map.rivers.projectedRiverMask",
          "Projected navigable rivers",
          "Projection plan",
          "#0f766e"
        ),
        makeRef(
          "map.rivers.plannedMajorRiverMask@9",
          "map.rivers.plannedMajorRiverMask",
          "Planned major rivers",
          "Projection plan",
          "#0f766e"
        ),
      ]
    ),
    makeRow(
      "terrain-readback",
      "Engine terrain readback",
      { layers: 2, terrain: 171, mismatch: 13 },
      [
        makeRef(
          "map.rivers.engineRiverMask@14",
          "map.rivers.engineRiverMask",
          "Engine river terrain",
          "Terrain readback",
          "#0891b2"
        ),
        makeRef(
          "map.rivers.riverMismatchMask@14",
          "map.rivers.riverMismatchMask",
          "River terrain mismatch",
          "Mismatch/debug",
          "#dc2626"
        ),
      ]
    ),
    makeRow(
      "lake-plan-readback",
      "Lake plan/readback",
      { layers: 3, "planned lakes": 28, "engine lakes": 26, "rejected lakes": 2 },
      [
        makeRef(
          "map.hydrology.lakes.plannedLakeMask@11",
          "map.hydrology.lakes.plannedLakeMask",
          "Planned lakes",
          "Lake plan/readback",
          "#4f46e5"
        ),
        makeRef(
          "map.hydrology.lakes.rejectedLakeMask@11",
          "map.hydrology.lakes.rejectedLakeMask",
          "Rejected lakes",
          "Mismatch/debug",
          "#dc2626"
        ),
      ]
    ),
    makeRow(
      "floodplain-apply",
      "Floodplain apply",
      { layers: 2, "fp applied": 96, "fp rejected": 7 },
      [
        makeRef(
          "map.ecology.features.floodplainAppliedMask@22",
          "map.ecology.features.floodplainAppliedMask",
          "Applied floodplains",
          "Floodplain apply",
          "#16a34a"
        ),
      ]
    ),
  ],
};

// Preview-only dark dock surface sized to the ExplorePanel column width — not a
// DS export.
function Dock({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-card text-foreground border border-border"
      style={{ width: 320, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

export const Expanded: Story = {
  args: { summary, onLayerSelect: noop, expanded: true, onExpandedChange: noop },
  render: (args) => (
    <Dock>
      <WaterStatsSection {...args} />
    </Dock>
  ),
};

export const Collapsed: Story = {
  args: { summary, onLayerSelect: noop, expanded: false, onExpandedChange: noop },
  render: (args) => (
    <Dock>
      <WaterStatsSection {...args} />
    </Dock>
  ),
};
