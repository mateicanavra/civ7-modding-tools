import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import type {
  RiverLakeFloodplainInspectorSummary,
  RiverLakeInspectorLayerRef,
  RiverLakeInspectorMaskCategory,
  RiverLakeInspectorRow,
} from "@/features/viz/riverLakeInspector";
import { WaterStatsSection } from "@/ui/components/WaterStatsSection";

/**
 * WaterStatsSection is the hydrology/lake/floodplain stats surface inside the
 * ExplorePanel dock: a disclosure header ("WATER STATS" · row count) over one
 * compact line per data family — semantic count chips plus jump-to-layer chips
 * (module-owned data colors). Divergence counts (mismatch/rejected) are
 * emphasized in warning when nonzero. The expanded row's chips carry shadcn
 * Tooltips whose TooltipProvider is supplied by the global Storybook decorator.
 * Adapted from `.design-sync/previews/WaterStatsSection.tsx` — the preview's
 * loose `ref()`/`summary` mock is completed here against the real
 * `RiverLakeFloodplainInspectorSummary` (every required ref/row field present).
 */
const meta = {
  title: "composites/WaterStatsSection",
  component: WaterStatsSection,
} satisfies Meta<typeof WaterStatsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

// Fully-typed layer ref. The component reads only layerKey/dataTypeKey/label and
// presentation.categoryLabel + palette.activeColor; the remaining fields are
// completed with valid Viz values so the fixture satisfies the real type.
const makeRef = (
  layerKey: string,
  dataTypeKey: string,
  label: string,
  category: RiverLakeInspectorMaskCategory,
  categoryLabel: string,
  activeColor: string
): RiverLakeInspectorLayerRef => ({
  dataTypeKey,
  layerKey,
  stepId: "rivers",
  stepIndex: 0,
  spaceId: "tile.hexOddR",
  kind: "grid",
  role: null,
  variantKey: null,
  visibility: "default",
  label,
  renderModeId: "mask",
  nonZeroCount: null,
  sampleCount: null,
  presentation: {
    category,
    categoryLabel,
    palette: {
      paletteId: `${category}-palette`,
      label: categoryLabel,
      activeColor,
      inactiveColor: "#1f2937",
      debugColor: "#dc2626",
    },
  },
});

// Fully-typed row. The component reads rowKey/label/counts/layerRefs; the lane/
// proof/claim/display/evidence fields are completed to satisfy the real type.
const makeRow = (
  rowKey: string,
  label: string,
  counts: Record<string, number>,
  layerRefs: RiverLakeInspectorLayerRef[]
): RiverLakeInspectorRow => ({
  rowKey,
  lane: "hydrology",
  laneLabel: "Hydrology",
  label,
  proofClass: "hydrology-truth",
  claimStatus: "available",
  displayStatus: "hydrology-truth-present",
  counts,
  layerRefs,
  evidence: [],
});

const summary: RiverLakeFloodplainInspectorSummary = {
  version: 1,
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
          "navigable-projection",
          "Projection plan",
          "#0f766e"
        ),
        makeRef(
          "map.rivers.plannedMajorRiverMask@9",
          "map.rivers.plannedMajorRiverMask",
          "Planned major rivers",
          "navigable-projection",
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
          "engine-terrain-readback",
          "Terrain readback",
          "#0891b2"
        ),
        makeRef(
          "map.rivers.riverMismatchMask@14",
          "map.rivers.riverMismatchMask",
          "River terrain mismatch",
          "mismatch-debug",
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
          "lake-plan-readback",
          "Lake plan/readback",
          "#4f46e5"
        ),
        makeRef(
          "map.hydrology.lakes.rejectedLakeMask@11",
          "map.hydrology.lakes.rejectedLakeMask",
          "Rejected lakes",
          "mismatch-debug",
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
          "floodplain-apply",
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
