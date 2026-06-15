import { defineVizMeta, deriveStepSeed, type ExtendedMapContext } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
import { placementArtifacts } from "../../artifacts.js";
import { warnLog } from "../../log.js";
import {
  buildPlacementPointBuffers,
  PLACEMENT_TILE_SPACE_ID,
  PLACEMENT_VIZ_GROUP,
  transparentNoneCategory,
} from "../../viz.js";
import AdjustResourcesStepContract from "./contract.js";
import { validateResourcePlanAdjustedArtifact } from "./validate.js";

const SUPPORT_ADJUSTMENT_CATEGORIES = [
  {
    value: 1,
    label: "Move Origin",
    color: [148, 163, 184, 200] as [number, number, number, number],
  },
  {
    value: 2,
    label: "Move Destination (Floor)",
    color: [34, 197, 94, 235] as [number, number, number, number],
  },
  {
    value: 3,
    label: "Move Destination (Equity)",
    color: [14, 165, 233, 235] as [number, number, number, number],
  },
  {
    value: 4,
    label: "Added (Floor)",
    color: [245, 158, 11, 235] as [number, number, number, number],
  },
  {
    value: 5,
    label: "Added (Equity)",
    color: [168, 85, 247, 235] as [number, number, number, number],
  },
];

export default createStep(AdjustResourcesStepContract, {
  artifacts: implementArtifacts([placementArtifacts.resourcePlanAdjusted], {
    resourcePlanAdjusted: {
      validate: (value) => validateResourcePlanAdjustedArtifact(value),
    },
  }),
  run: (context, config, ops, deps) => {
    const plan = deps.artifacts.resourcePlan.read(context);
    const eligibility = deps.artifacts.resourceEligibility.read(context);
    const startAssignment = deps.artifacts.startAssignment.read(context);
    const regionSlots = deps.artifacts.landmassRegionSlotByTile.read(context);
    const landmasses = deps.artifacts.landmasses.read(context);

    const adjusted = ops.support(
      {
        seed: deriveStepSeed(context.env.seed, "resources:adjustResourceSupport"),
        plan,
        eligibility: eligibility.rows,
        starts: startAssignment.seats.map((seat) => ({
          seatIndex: seat.seatIndex,
          playerId: seat.playerId,
          plotIndex: seat.plotIndex,
        })),
        landmassIdByTile: landmasses.landmassIdByTile as Int32Array,
        landmassTileCounts: landmasses.landmasses.map((landmass) => landmass.tileCount),
        regionSlotByTile: regionSlots.slotByTile as Uint8Array,
      } as unknown as Parameters<typeof ops.support>[0],
      config.support
    );

    if (adjusted.shortfalls.length > 0) {
      // Typed shortfalls (S5): adjustments that would violate an S3 plan
      // invariant are recorded loudly, never forced.
      const summary = adjusted.shortfalls
        .map((row) => `seat ${row.seatIndex}: ${row.reason} x${row.missing}`)
        .join("; ");
      warnLog(
        `[Placement] Resource support pass recorded ${adjusted.shortfalls.length} typed shortfall(s): ${summary}.`
      );
      context.trace?.event(() => ({
        type: "placement.resources.supportShortfall",
        level: "warn",
        shortfalls: adjusted.shortfalls,
      }));
    }

    deps.artifacts.resourcePlanAdjusted.publish(context, adjusted);

    context.trace?.event(() => ({
      type: "placement.resources.supportAdjust",
      plannedCount: adjusted.plannedCount,
      moveCount: adjusted.moveCount,
      addCount: adjusted.addCount,
      gapBefore: adjusted.equity.gapBefore,
      gapAfter: adjusted.equity.gapAfter,
      shortfallCount: adjusted.shortfalls.length,
    }));

    // S7 (E4.2/E4.3): the support pass's decision substance — every applied
    // adjustment (move origin -> destination, additions, with the reason it
    // served) plus the per-start support radius context it adjusted toward.
    emitSupportAdjustmentViz(context, adjusted.adjustments);
    emitSupportRadiusViz(context, {
      seats: startAssignment.seats,
      supportRadiusTiles: adjusted.settings.supportRadiusTiles,
    });
  },
});

type SupportAdjustmentRow = Readonly<{
  action: "move" | "add";
  reason: "support-floor" | "support-equity";
  fromPlotIndex?: number;
  toPlotIndex: number;
}>;

function emitSupportAdjustmentViz(
  context: ExtendedMapContext,
  adjustments: ReadonlyArray<SupportAdjustmentRow>
): void {
  if (!context.viz) return;
  const { width } = context.dimensions;
  const rows: Array<{ plotIndex: number; value: number }> = [];
  for (const adjustment of adjustments) {
    if (adjustment.action === "move" && typeof adjustment.fromPlotIndex === "number") {
      rows.push({ plotIndex: adjustment.fromPlotIndex, value: 1 });
    }
    const destinationValue =
      adjustment.action === "move"
        ? adjustment.reason === "support-floor"
          ? 2
          : 3
        : adjustment.reason === "support-floor"
          ? 4
          : 5;
    rows.push({ plotIndex: adjustment.toPlotIndex, value: destinationValue });
  }
  const { positions, values } = buildPlacementPointBuffers(rows, width);
  context.viz.dumpPoints(context.trace, {
    dataTypeKey: "placement.resources.supportAdjustment",
    spaceId: PLACEMENT_TILE_SPACE_ID,
    positions,
    values,
    valueFormat: "u16",
    meta: defineVizMeta("placement.resources.supportAdjustment", {
      label: "Resource Support Adjustments",
      group: PLACEMENT_VIZ_GROUP,
      description:
        "Support-pass plan changes: moved-site origins and destinations plus additions, split by why they served a start (support floor vs cross-player equity). Untouched plan sites stay on the plan-resources step's intent layer.",
      palette: "categorical",
      categories: SUPPORT_ADJUSTMENT_CATEGORIES,
    }),
  });
}

/**
 * Per-start support radius context: tiles within the configured support
 * radius of each seated start, so the adjustment points above can be read
 * against the zone they were required to land in.
 */
function emitSupportRadiusViz(
  context: ExtendedMapContext,
  args: {
    seats: ReadonlyArray<{ readonly seatIndex: number; readonly plotIndex: number }>;
    supportRadiusTiles: number;
  }
): void {
  if (!context.viz) return;
  const { width, height } = context.dimensions;
  const size = Math.max(0, width * height);
  const radius = Math.max(0, args.supportRadiusTiles | 0);
  const zone = new Uint8Array(size);
  const seated = args.seats.filter((seat) => seat.plotIndex >= 0 && seat.plotIndex < size);
  for (const seat of seated) {
    const cy = (seat.plotIndex / width) | 0;
    const yMin = Math.max(0, cy - radius);
    const yMax = Math.min(height - 1, cy + radius);
    for (let y = yMin; y <= yMax; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const index = rowOffset + x;
        if (zone[index]) continue;
        if (hexDistanceOddQPeriodicX(seat.plotIndex, index, width) <= radius) zone[index] = 1;
      }
    }
  }
  context.viz.dumpGrid(context.trace, {
    dataTypeKey: "placement.starts.supportRadius",
    spaceId: PLACEMENT_TILE_SPACE_ID,
    dims: { width, height },
    format: "u8",
    values: zone,
    meta: defineVizMeta("placement.starts.supportRadius", {
      label: "Start Support Radius",
      group: PLACEMENT_VIZ_GROUP,
      description:
        "Tiles within the support radius of a seated start — the zone the support pass counts planned resource sites in (E3.1 floor, E3.2 equity).",
      palette: "categorical",
      categories: [
        transparentNoneCategory("Outside"),
        { value: 1, label: "Within Support Radius", color: [56, 189, 248, 120] },
      ],
    }),
  });
}
