import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
import type { VizProjection } from "@swooper/mapgen-viz";
import {
  buildPlacementPointBuffers,
  definePlacementVizCategoryMeta,
  PLACEMENT_TILE_SPACE_ID,
  transparentNoneCategory,
} from "../../viz.js";

const SUPPORT_ADJUSTMENT_CATEGORIES = [
  { value: 1, label: "Move Origin", color: [148, 163, 184, 200] },
  { value: 2, label: "Move Destination (Floor)", color: [34, 197, 94, 235] },
  { value: 3, label: "Move Destination (Equity)", color: [14, 165, 233, 235] },
  { value: 4, label: "Added (Floor)", color: [245, 158, 11, 235] },
  { value: 5, label: "Added (Equity)", color: [168, 85, 247, 235] },
] as const;

type SupportAdjustmentRow = Readonly<{
  action: "move" | "add";
  reason: "support-floor" | "support-equity";
  fromPlotIndex?: number;
  toPlotIndex: number;
}>;

/**
 * Projects the completed resource-support decision and its admitted start-radius context.
 * The function derives only portable geometry and borrows the completed adjustment evidence.
 */
export function projectResourceSupportViz(input: {
  adjustments: ReadonlyArray<SupportAdjustmentRow>;
  seats: ReadonlyArray<{ readonly seatIndex: number; readonly plotIndex: number }>;
  supportRadiusTiles: number;
  dimensions: Readonly<{ width: number; height: number }>;
}): readonly VizProjection[] {
  const { width, height } = input.dimensions;
  const rows: Array<{ plotIndex: number; value: number }> = [];
  for (const adjustment of input.adjustments) {
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

  const size = width * height;
  const radius = Math.max(0, input.supportRadiusTiles | 0);
  const zone = new Uint8Array(size);
  const seated = input.seats.filter((seat) => seat.plotIndex >= 0 && seat.plotIndex < size);
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

  return [
    {
      kind: "points",
      dataTypeKey: "placement.resources.supportAdjustment",
      spaceId: PLACEMENT_TILE_SPACE_ID,
      positions,
      values: { format: "u16", values },
      meta: definePlacementVizCategoryMeta(
        "placement.resources.supportAdjustment",
        SUPPORT_ADJUSTMENT_CATEGORIES,
        {
          label: "Resource Support Adjustments",
          description:
            "Support-pass plan changes: moved-site origins and destinations plus additions, split by why they served a start (support floor vs cross-player equity). Untouched plan sites stay on the plan-resources step's intent layer.",
        }
      ),
    },
    {
      kind: "grid",
      dataTypeKey: "placement.starts.supportRadius",
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: input.dimensions,
      field: { format: "u8", values: zone },
      meta: definePlacementVizCategoryMeta(
        "placement.starts.supportRadius",
        [
          transparentNoneCategory("Outside"),
          { value: 1, label: "Within Support Radius", color: [56, 189, 248, 120] },
        ],
        {
          label: "Start Support Radius",
          description:
            "Tiles within the support radius of a seated start — the zone the support pass counts planned resource sites in (E3.1 floor, E3.2 equity).",
        }
      ),
    },
  ];
}
