import placement from "@mapgen/domain/placement";
import type { DeepReadonly, Static } from "@swooper/mapgen-core/authoring";
import type { VizProjection, VizRgbaColor } from "@swooper/mapgen-viz";
import {
  buildPlacementPointBuffers,
  definePlacementVizCategoryMeta,
  definePlacementVizMeta,
  PLACEMENT_TILE_SPACE_ID,
  transparentNoneCategory,
  UNIT_SCORE_VALUE_SPEC,
} from "../../viz.js";

type PlanStartsOutput = Static<(typeof placement.ops.planStarts)["output"]>;
type StartAssignmentArtifact = Static<
  typeof import("../../artifacts/index.js").artifacts["startAssignment"]["schema"]
>;

const START_POSITION_COLORS: readonly VizRgbaColor[] = [
  [59, 130, 246, 230],
  [239, 68, 68, 230],
  [34, 197, 94, 230],
  [245, 158, 11, 230],
  [168, 85, 247, 230],
  [14, 116, 144, 230],
  [249, 115, 22, 230],
  [99, 102, 241, 230],
];
const START_COMPONENT_KEYS = [
  "freshwater",
  "fertility",
  "expansion",
  "climate",
  "resource",
  "roughness",
] as const;
const START_SEAT_RUNG_CATEGORIES = [
  { value: 1, label: "Regional", color: [34, 197, 94, 235] },
  { value: 2, label: "Open Pool", color: [245, 158, 11, 235] },
  { value: 3, label: "Quality Relaxed", color: [249, 115, 22, 235] },
  { value: 4, label: "Spacing Relaxed", color: [239, 68, 68, 235] },
] as const;
const START_SEAT_RUNG_VALUES: Readonly<Record<string, number>> = {
  regional: 1,
  "open-pool": 2,
  "quality-relaxed": 3,
  "spacing-relaxed": 4,
};
const START_TIER_CATEGORIES = [
  { value: 0, label: "None", color: [148, 163, 184, 0] },
  { value: 1, label: "Rejected", color: [100, 116, 139, 120] },
  { value: 2, label: "Marginal", color: [245, 158, 11, 210] },
  { value: 3, label: "Island Cluster", color: [14, 165, 233, 220] },
  { value: 4, label: "Primary", color: [34, 197, 94, 225] },
] as const;

function colorForStartPosition(index: number): VizRgbaColor {
  return START_POSITION_COLORS[index % START_POSITION_COLORS.length] ?? [148, 163, 184, 220];
}

/**
 * Projects completed start-plan and stamped-assignment evidence as one coherent facet.
 * Component grids are visualization-only derivations; plan and assignment arrays remain borrowed.
 */
export function projectStartAssignmentViz(input: {
  plan: Readonly<PlanStartsOutput>;
  assignment: DeepReadonly<StartAssignmentArtifact>;
  dimensions: Readonly<{ width: number; height: number }>;
}): readonly VizProjection[] {
  const { width, height } = input.dimensions;
  const size = width * height;
  const projections: VizProjection[] = [];

  if (input.plan.scoreByTile.length === size) {
    projections.push({
      kind: "grid",
      dataTypeKey: "placement.starts.viabilityScore",
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: input.dimensions,
      field: {
        format: "f32",
        values: input.plan.scoreByTile,
        valueSpec: UNIT_SCORE_VALUE_SPEC,
      },
      meta: definePlacementVizMeta("placement.starts.viabilityScore", "field.intensity", {
        label: "Start Viability",
        description:
          "Viability-first start score from land envelope, island cluster support, freshwater, climate comfort, resources, and roughness.",
      }),
    });
  }
  if (input.plan.tierByTile.length === size) {
    projections.push({
      kind: "grid",
      dataTypeKey: "placement.starts.viabilityTier",
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: input.dimensions,
      field: { format: "u8", values: input.plan.tierByTile },
      meta: definePlacementVizCategoryMeta(
        "placement.starts.viabilityTier",
        START_TIER_CATEGORIES,
        {
          label: "Start Viability Tiers",
          description:
            "Candidate classification for starts: primary land envelope, island cluster, marginal fallback, or rejected.",
        }
      ),
    });
  }

  const componentGrids = new Map<string, Float32Array>();
  for (const key of START_COMPONENT_KEYS) componentGrids.set(key, new Float32Array(size));
  for (const candidate of input.plan.candidates) {
    const plotIndex = candidate.plotIndex | 0;
    if (plotIndex < 0 || plotIndex >= size) continue;
    for (const key of START_COMPONENT_KEYS) {
      componentGrids.get(key)![plotIndex] = candidate.components[key];
    }
  }
  for (const key of START_COMPONENT_KEYS) {
    const dataTypeKey = `placement.starts.component.${key}`;
    projections.push({
      kind: "grid",
      dataTypeKey,
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: input.dimensions,
      field: {
        format: "f32",
        values: componentGrids.get(key)!,
        valueSpec: UNIT_SCORE_VALUE_SPEC,
      },
      meta: definePlacementVizMeta(dataTypeKey, "field.intensity", {
        label: `Start Component: ${key[0]!.toUpperCase()}${key.slice(1)}`,
        description:
          key === "roughness"
            ? "Roughness penalty magnitude per start candidate (0 = flat, 1 = max rugged); zero on non-candidate tiles."
            : `Per-candidate ${key} component of the start viability score (0..1); zero on non-candidate tiles.`,
      }),
    });
  }

  if (input.plan.seats.length > 0) {
    const rows = input.plan.seats.map((seat) => ({
      plotIndex: seat.plotIndex,
      value: START_SEAT_RUNG_VALUES[seat.rung] ?? 4,
    }));
    const { positions, values, count } = buildPlacementPointBuffers(rows, width);
    if (count > 0) {
      projections.push({
        kind: "points",
        dataTypeKey: "placement.starts.seatRung",
        spaceId: PLACEMENT_TILE_SPACE_ID,
        positions,
        values: { format: "u16", values },
        meta: definePlacementVizCategoryMeta(
          "placement.starts.seatRung",
          START_SEAT_RUNG_CATEGORIES,
          {
            label: "Start Seat Rungs",
            description:
              "Selection-ladder rung per seated start (regional > open-pool > quality-relaxed > spacing-relaxed). Non-regional rungs are recorded degradations; unseated seats appear in the fairness report, not here.",
          }
        ),
      });
    }
  }

  const validStarts = input.assignment.positions
    .map((plotIndex, playerIndex) => ({ plotIndex, playerIndex }))
    .filter((entry) => Number.isFinite(entry.plotIndex) && entry.plotIndex >= 0);
  if (validStarts.length === 0) return projections;

  const grid = new Uint16Array(size);
  const positions = new Float32Array(validStarts.length * 2);
  const values = new Uint16Array(validStarts.length);
  for (let i = 0; i < validStarts.length; i++) {
    const { plotIndex, playerIndex } = validStarts[i]!;
    if (plotIndex < grid.length) grid[plotIndex] = playerIndex + 1;
    const y = (plotIndex / width) | 0;
    positions[i * 2] = plotIndex - y * width;
    positions[i * 2 + 1] = y;
    values[i] = playerIndex + 1;
  }
  const categories = input.assignment.positions.map((_, index) => ({
    value: index + 1,
    label: `Player ${index + 1}`,
    color: colorForStartPosition(index),
  }));
  const [firstCategory, ...otherCategories] = categories;
  if (!firstCategory) return projections;
  const pointCategories = [firstCategory, ...otherCategories] as const;

  projections.push(
    {
      kind: "grid",
      dataTypeKey: "placement.starts.startPosition",
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: input.dimensions,
      field: { format: "u16", values: grid },
      meta: definePlacementVizCategoryMeta(
        "placement.starts.startPosition",
        [transparentNoneCategory(), ...pointCategories],
        {
          label: "Start Positions",
          role: "membership",
        }
      ),
    },
    {
      kind: "points",
      dataTypeKey: "placement.starts.startPosition",
      spaceId: PLACEMENT_TILE_SPACE_ID,
      positions,
      values: { format: "u16", values },
      meta: definePlacementVizCategoryMeta("placement.starts.startPosition", pointCategories, {
        label: "Start Positions",
      }),
    }
  );

  return projections;
}
