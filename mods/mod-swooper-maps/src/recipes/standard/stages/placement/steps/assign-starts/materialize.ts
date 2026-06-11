import type { ExtendedMapContext } from "@swooper/mapgen-core";
import { defineVizMeta } from "@swooper/mapgen-core";
import type { DeepReadonly, Static } from "@swooper/mapgen-core/authoring";

import placement from "@mapgen/domain/placement";
import { warnLog } from "../../log.js";

import {
  PLACEMENT_VIZ_GROUP,
  UNIT_SCORE_VALUE_SPEC,
  buildPlacementPointBuffers,
} from "../../viz.js";

type PlanStartsOutput = Static<(typeof placement.ops.planStarts)["output"]>;
type StartAssignmentArtifact = Static<
  (typeof import("../../artifacts.js").placementArtifacts)["startAssignment"]["schema"]
>;
type StartSeatRecord = PlanStartsOutput["seats"][number];

const GROUP_GAMEPLAY = PLACEMENT_VIZ_GROUP;
const START_POSITION_COLORS: Array<[number, number, number, number]> = [
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
  { value: 1, label: "Regional", color: [34, 197, 94, 235] as [number, number, number, number] },
  { value: 2, label: "Open Pool", color: [245, 158, 11, 235] as [number, number, number, number] },
  {
    value: 3,
    label: "Quality Relaxed",
    color: [249, 115, 22, 235] as [number, number, number, number],
  },
  {
    value: 4,
    label: "Spacing Relaxed",
    color: [239, 68, 68, 235] as [number, number, number, number],
  },
];
const START_SEAT_RUNG_VALUES: Record<string, number> = {
  regional: 1,
  "open-pool": 2,
  "quality-relaxed": 3,
  "spacing-relaxed": 4,
};
const START_TIER_CATEGORIES = [
  { value: 0, label: "None", color: [148, 163, 184, 0] as [number, number, number, number] },
  { value: 1, label: "Rejected", color: [100, 116, 139, 120] as [number, number, number, number] },
  { value: 2, label: "Marginal", color: [245, 158, 11, 210] as [number, number, number, number] },
  { value: 3, label: "Island Cluster", color: [14, 165, 233, 220] as [number, number, number, number] },
  { value: 4, label: "Primary", color: [34, 197, 94, 225] as [number, number, number, number] },
];

function colorForStartPosition(index: number): [number, number, number, number] {
  return START_POSITION_COLORS[index % START_POSITION_COLORS.length] ?? [148, 163, 184, 220];
}

/**
 * Loud degradation surfacing (E1.7): every non-regional seat and every
 * below-floor spacing is reported via warnLog (engine-safe; visible on live runs)
 * and a warn-tagged trace event (visible in verbose/studio traces). The
 * decisions themselves were already made — and recorded — by the plan-starts
 * op; this only makes them audible.
 */
function warnStartDegradations(
  context: ExtendedMapContext,
  seats: DeepReadonly<PlanStartsOutput["seats"]>
): void {
  const byRung = new Map<string, number[]>();
  for (const seat of seats) {
    if (seat.rung === "regional" && seat.plotIndex >= 0) continue;
    const key = seat.plotIndex < 0 ? "unseated" : seat.rung;
    const list = byRung.get(key) ?? [];
    list.push(seat.seatIndex);
    byRung.set(key, list);
  }
  for (const [path, seatIndices] of byRung) {
    warnLog(
      `[Placement] Start assignment degraded to ${path} for ${seatIndices.length} seat(s) ` +
        `(seat indices: ${seatIndices.join(", ")}); regional viability guarantees were relaxed for those seats.`
    );
    context.trace?.event(() => ({
      type: "placement.starts.fallback",
      level: "warn",
      path,
      seats: seatIndices.length,
      seatIndices,
    }));
  }
  for (const seat of seats) {
    if (seat.plotIndex < 0) continue;
    if (!seat.imputedFlags.includes("spacing-below-floor")) continue;
    warnLog(
      `[Placement] Seat ${seat.seatIndex} seated below the hard spacing floor ` +
        `(achievedSpacing=${seat.achievedSpacing}); the alternative was an unseated player.`
    );
    context.trace?.event(() => ({
      type: "placement.starts.spacingBelowFloor",
      level: "warn",
      seatIndex: seat.seatIndex,
      achievedSpacing: seat.achievedSpacing,
    }));
  }
  const reassigned = seats.filter((seat) => seat.imputedFlags.includes("region-reassigned"));
  if (reassigned.length) {
    const seatIndices = reassigned.map((seat) => seat.seatIndex);
    warnLog(
      `[Placement] ${reassigned.length} seat(s) region-reassigned (seat indices: ` +
        `${seatIndices.join(", ")}); their configured landmass region has zero start candidates on this map.`
    );
    context.trace?.event(() => ({
      type: "placement.starts.regionReassigned",
      level: "warn",
      seats: reassigned.length,
      seatIndices,
    }));
  }
}

/**
 * Thin start materializer (placement-realignment S4): the plan-starts op owns
 * all selection authority and emits per-player typed seat intents; this shell
 * stamps them via adapter.setStartPosition, surfaces degradations loudly, and
 * builds the published startAssignment artifact. The old assign-or-throw is
 * gone: an unfillable map arrives here as degraded data. The ONLY hard-fail
 * left is a map with literally zero settleable land candidates.
 */
export function materializeStartAssignment(args: {
  context: ExtendedMapContext;
  plan: DeepReadonly<PlanStartsOutput>;
}): StartAssignmentArtifact {
  const { context, plan } = args;
  const { adapter } = context;
  const { width, height } = context.dimensions;
  if ((plan.width | 0) !== (width | 0) || (plan.height | 0) !== (height | 0)) {
    throw new Error(
      `[Placement] Start plan dimensions ${plan.width}x${plan.height} do not match map ${width}x${height}.`
    );
  }

  const seats = plan.seats;
  if (seats.length > 0 && plan.settleableTileCount === 0) {
    throw new Error(
      `[Placement] No settleable land candidates exist for ${seats.length} requested start seat(s) ` +
        `(candidates=${plan.candidateCount}, settleable=0).`
    );
  }

  let assigned = 0;
  const rungCounts = { regional: 0, openPool: 0, qualityRelaxed: 0, spacingRelaxed: 0 };
  const tierAssignments = { primary: 0, islandCluster: 0, marginal: 0, none: 0 };
  for (const seat of seats) {
    if (seat.plotIndex < 0) continue;
    adapter.setStartPosition(seat.plotIndex, seat.playerId);
    assigned++;
    if (seat.rung === "regional") rungCounts.regional++;
    else if (seat.rung === "open-pool") rungCounts.openPool++;
    else if (seat.rung === "quality-relaxed") rungCounts.qualityRelaxed++;
    else rungCounts.spacingRelaxed++;
    tierAssignments[seat.tier] += 1;
  }
  warnStartDegradations(context, seats);

  return {
    width,
    height,
    positions: seats.map((seat) => seat.plotIndex),
    seats: seats.map(cloneSeat),
    fairnessReport: {
      tolerance: plan.fairnessReport.tolerance,
      parity: [...plan.fairnessReport.parity],
      worstPairGap: plan.fairnessReport.worstPairGap,
      balanced: plan.fairnessReport.balanced,
      swaps: plan.fairnessReport.swaps.map((swap) => ({ ...swap })),
      relaxations: plan.fairnessReport.relaxations.map((entry) => ({ ...entry })),
    },
    status: plan.status,
    assigned,
    unseatedCount: seats.length - assigned,
    rungCounts,
    primaryAssigned: tierAssignments.primary,
    islandClusterAssigned: tierAssignments.islandCluster,
    marginalAssigned: tierAssignments.marginal,
    noneAssigned: tierAssignments.none,
    candidateCount: plan.candidateCount,
    rejectionCounts: plan.rejectionCounts.map((entry) => ({
      reason: entry.reason,
      count: entry.count,
    })),
    tierCounts: { ...plan.tierCounts },
    inputCoverage: plan.inputCoverage.map((row) => ({ ...row })),
  };
}

function cloneSeat(seat: DeepReadonly<StartSeatRecord>): StartSeatRecord {
  return {
    seatIndex: seat.seatIndex,
    playerId: seat.playerId,
    playerIdSource: seat.playerIdSource,
    regionSlot: seat.regionSlot,
    plotIndex: seat.plotIndex,
    rung: seat.rung,
    status: seat.status,
    tier: seat.tier,
    score: seat.score,
    components: { ...seat.components },
    achievedSpacing: seat.achievedSpacing,
    imputedFlags: [...seat.imputedFlags],
  };
}

/**
 * Emits the start-scoring decision surface from the PLAN output (S7, E4.2).
 *
 * Called before seat materialization so the score/tier/component layers exist
 * even when selection degrades or stamping fails — the old code emitted only
 * after a successful assignment, which hid scoring viz exactly when it was
 * most needed (audit-register studio-viz P2).
 */
export function emitStartViabilityViz(
  context: ExtendedMapContext,
  starts: DeepReadonly<PlanStartsOutput>
): void {
  const { width, height } = context.dimensions;
  const size = Math.max(0, width * height);
  if (starts.scoreByTile.length === size) {
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "placement.starts.viabilityScore",
      spaceId: "tile.hexOddQ",
      dims: { width, height },
      format: "f32",
      values: starts.scoreByTile as Float32Array,
      valueSpec: UNIT_SCORE_VALUE_SPEC,
      meta: defineVizMeta("placement.starts.viabilityScore", {
        label: "Start Viability",
        group: GROUP_GAMEPLAY,
        description:
          "Viability-first start score from land envelope, island cluster support, freshwater, climate comfort, resources, and roughness.",
        palette: "continuous",
      }),
    });
  }
  if (starts.tierByTile.length === size) {
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "placement.starts.viabilityTier",
      spaceId: "tile.hexOddQ",
      dims: { width, height },
      format: "u8",
      values: starts.tierByTile as Uint8Array,
      meta: defineVizMeta("placement.starts.viabilityTier", {
        label: "Start Viability Tiers",
        group: GROUP_GAMEPLAY,
        description:
          "Candidate classification for starts: primary land envelope, island cluster, marginal fallback, or rejected.",
        palette: "categorical",
        categories: START_TIER_CATEGORIES,
      }),
    });
  }
  emitStartComponentViz(context, starts);
  emitStartSeatRungViz(context, starts.seats);
}

/**
 * Per-component score grids (freshwater/fertility/expansion/climate/resource/
 * roughness), rebuilt from the retained per-candidate component vectors so
 * studio can decompose WHY a tile scored as it did (E4.3; target card A1).
 * Non-candidate tiles are zero, matching the composite scoreByTile convention.
 */
function emitStartComponentViz(
  context: ExtendedMapContext,
  starts: DeepReadonly<PlanStartsOutput>
): void {
  if (!context.viz) return;
  const { width, height } = context.dimensions;
  const size = Math.max(0, width * height);
  const grids = new Map<string, Float32Array>();
  for (const key of START_COMPONENT_KEYS) grids.set(key, new Float32Array(size));
  for (const candidate of starts.candidates) {
    const plotIndex = candidate.plotIndex | 0;
    if (plotIndex < 0 || plotIndex >= size) continue;
    for (const key of START_COMPONENT_KEYS) {
      grids.get(key)![plotIndex] = candidate.components[key];
    }
  }
  for (const key of START_COMPONENT_KEYS) {
    const dataTypeKey = `placement.starts.component.${key}`;
    context.viz.dumpGrid(context.trace, {
      dataTypeKey,
      spaceId: "tile.hexOddQ",
      dims: { width, height },
      format: "f32",
      values: grids.get(key)!,
      valueSpec: UNIT_SCORE_VALUE_SPEC,
      meta: defineVizMeta(dataTypeKey, {
        label: `Start Component: ${key[0]!.toUpperCase()}${key.slice(1)}`,
        group: GROUP_GAMEPLAY,
        description:
          key === "roughness"
            ? "Roughness penalty magnitude per start candidate (0 = flat, 1 = max rugged); zero on non-candidate tiles."
            : `Per-candidate ${key} component of the start viability score (0..1); zero on non-candidate tiles.`,
        palette: "continuous",
      }),
    });
  }
}

/**
 * Seat points labeled by the fallback-ladder rung that seated each player
 * (fairness-relevant: every non-regional rung is a recorded degradation).
 * Unseated seats (plotIndex -1) cannot be points; they are surfaced via
 * warnStartDegradations and the fairness report in the artifact.
 */
function emitStartSeatRungViz(
  context: ExtendedMapContext,
  seats: DeepReadonly<PlanStartsOutput["seats"]>
): void {
  if (!context.viz || !seats.length) return;
  const { width } = context.dimensions;
  const rows = seats.map((seat) => ({
    plotIndex: seat.plotIndex,
    value: START_SEAT_RUNG_VALUES[seat.rung] ?? 4,
  }));
  const { positions, values, count } = buildPlacementPointBuffers(rows, width);
  if (!count) return;
  context.viz.dumpPoints(context.trace, {
    dataTypeKey: "placement.starts.seatRung",
    spaceId: "tile.hexOddQ",
    positions,
    values,
    valueFormat: "u16",
    meta: defineVizMeta("placement.starts.seatRung", {
      label: "Start Seat Rungs",
      group: GROUP_GAMEPLAY,
      description:
        "Selection-ladder rung per seated start (regional > open-pool > quality-relaxed > spacing-relaxed). Non-regional rungs are recorded degradations; unseated seats appear in the fairness report, not here.",
      palette: "categorical",
      categories: START_SEAT_RUNG_CATEGORIES,
    }),
  });
}

export function emitStartPositionsViz(
  context: ExtendedMapContext,
  startPositions: readonly number[]
): void {
  if (!startPositions.length) return;
  const { width, height } = context.dimensions;
  const valid = startPositions
    .map((plotIndex, playerIndex) => ({ plotIndex, playerIndex }))
    .filter((entry) => Number.isFinite(entry.plotIndex) && entry.plotIndex >= 0);
  if (!valid.length) return;

  const size = Math.max(0, (width | 0) * (height | 0));
  const grid = new Uint16Array(size);
  for (let i = 0; i < valid.length; i++) {
    const plotIndex = valid[i]!.plotIndex;
    if (plotIndex < 0 || plotIndex >= grid.length) continue;
    grid[plotIndex] = (valid[i]!.playerIndex ?? 0) + 1;
  }

  const positions = new Float32Array(valid.length * 2);
  const values = new Uint16Array(valid.length);
  for (let i = 0; i < valid.length; i++) {
    const { plotIndex, playerIndex } = valid[i]!;
    const y = (plotIndex / width) | 0;
    const x = plotIndex - y * width;
    positions[i * 2] = x;
    positions[i * 2 + 1] = y;
    values[i] = playerIndex + 1;
  }

  const categories = Array.from({ length: startPositions.length }, (_, index) => ({
    value: index + 1,
    label: `Player ${index + 1}`,
    color: colorForStartPosition(index),
  }));
  const gridCategories = [
    { value: 0, label: "None", color: [148, 163, 184, 0] as [number, number, number, number] },
    ...categories,
  ];

  context.viz?.dumpGrid(context.trace, {
    dataTypeKey: "placement.starts.startPosition",
    spaceId: "tile.hexOddQ",
    dims: { width, height },
    format: "u16",
    values: grid,
    meta: defineVizMeta("placement.starts.startPosition", {
      label: "Start Positions",
      group: GROUP_GAMEPLAY,
      role: "membership",
      categories: gridCategories,
      palette: "categorical",
    }),
  });

  context.viz?.dumpPoints(context.trace, {
    dataTypeKey: "placement.starts.startPosition",
    spaceId: "tile.hexOddQ",
    positions,
    values,
    valueFormat: "u16",
    meta: defineVizMeta("placement.starts.startPosition", {
      label: "Start Positions",
      group: GROUP_GAMEPLAY,
      categories,
      palette: "categorical",
    }),
  });
}
