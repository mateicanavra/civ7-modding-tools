import { TooltipProvider, WaterStatsSection } from "mapgen-studio";

// WaterStatsSection is the hydrology/lake/floodplain stats surface inside the
// ExplorePanel dock: a disclosure header ("WATER STATS" · row count) over one
// compact line per data family — semantic count chips plus jump-to-layer chips
// (module-owned data colors). Divergence counts (mismatch/rejected) are emphasized
// in warning when nonzero. The summary below is a realistic runtime mock of the
// fields the component reads in render (counts filtered against layers/default/debug).
const noop = () => {};

// Module data-color palettes (match riverLakeInspector mask presentations).
const ref = (layerKey, dataTypeKey, label, categoryLabel, activeColor) => ({
  layerKey,
  dataTypeKey,
  label,
  presentation: { categoryLabel, palette: { activeColor } },
});

const summary = {
  version: 1,
  rows: [
    {
      rowKey: "projection-plan",
      label: "Navigable river plan",
      counts: { layers: 3, projected: 184, minor: 142, major: 42 },
      layerRefs: [
        ref(
          "map.rivers.projectedRiverMask@9",
          "map.rivers.projectedRiverMask",
          "Projected navigable rivers",
          "Projection plan",
          "#0f766e"
        ),
        ref(
          "map.rivers.plannedMajorRiverMask@9",
          "map.rivers.plannedMajorRiverMask",
          "Planned major rivers",
          "Projection plan",
          "#0f766e"
        ),
      ],
    },
    {
      rowKey: "terrain-readback",
      label: "Engine terrain readback",
      counts: { layers: 2, terrain: 171, mismatch: 13 },
      layerRefs: [
        ref(
          "map.rivers.engineRiverMask@14",
          "map.rivers.engineRiverMask",
          "Engine river terrain",
          "Terrain readback",
          "#0891b2"
        ),
        ref(
          "map.rivers.riverMismatchMask@14",
          "map.rivers.riverMismatchMask",
          "River terrain mismatch",
          "Mismatch/debug",
          "#dc2626"
        ),
      ],
    },
    {
      rowKey: "lake-plan-readback",
      label: "Lake plan/readback",
      counts: { layers: 3, "planned lakes": 28, "engine lakes": 26, "rejected lakes": 2 },
      layerRefs: [
        ref(
          "map.hydrology.lakes.plannedLakeMask@11",
          "map.hydrology.lakes.plannedLakeMask",
          "Planned lakes",
          "Lake plan/readback",
          "#4f46e5"
        ),
        ref(
          "map.hydrology.lakes.rejectedLakeMask@11",
          "map.hydrology.lakes.rejectedLakeMask",
          "Rejected lakes",
          "Mismatch/debug",
          "#dc2626"
        ),
      ],
    },
    {
      rowKey: "floodplain-apply",
      label: "Floodplain apply",
      counts: { layers: 2, "fp applied": 96, "fp rejected": 7 },
      layerRefs: [
        ref(
          "map.ecology.features.floodplainAppliedMask@22",
          "map.ecology.features.floodplainAppliedMask",
          "Applied floodplains",
          "Floodplain apply",
          "#16a34a"
        ),
      ],
    },
  ],
};

// Dark dock surface, sized to the ExplorePanel column width. The expanded row's
// jump-to-layer chips carry shadcn Tooltips, which need a TooltipProvider
// ancestor (the real shell mounts one at the app root) — without it Radix throws
// and the expanded body renders nothing, so the Dock supplies the provider.
function Dock({ children }) {
  return (
    <TooltipProvider>
      <div
        className="bg-card text-foreground border border-border"
        style={{ width: 320, borderRadius: 8, overflow: "hidden" }}
      >
        {children}
      </div>
    </TooltipProvider>
  );
}

export const Expanded = () => (
  <Dock>
    <WaterStatsSection
      summary={summary}
      onLayerSelect={noop}
      expanded={true}
      onExpandedChange={noop}
    />
  </Dock>
);

export const Collapsed = () => (
  <Dock>
    <WaterStatsSection
      summary={summary}
      onLayerSelect={noop}
      expanded={false}
      onExpandedChange={noop}
    />
  </Dock>
);
