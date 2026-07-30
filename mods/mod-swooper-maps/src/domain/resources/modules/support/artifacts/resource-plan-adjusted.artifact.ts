import { defineArtifact, type Static, Type } from "@swooper/mapgen-core/authoring/contracts";
import { getHexRadiusIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import {
  type AdjustedResourceIntent,
  AdjustedResourceIntentSchema,
  type ResourceSupportAdjustment,
  ResourceSupportAdjustmentSchema,
} from "../model/atoms/resource-support-adjustment.schema.js";
import {
  ResourceSupportEquitySchema,
  ResourceSupportPerStartSchema,
  ResourceSupportSettingsSchema,
  type ResourceSupportShortfall,
  ResourceSupportShortfallSchema,
} from "../model/atoms/resource-support-evidence.schema.js";

type ResourcePlanAdjusted = {
  readonly width: number;
  readonly height: number;
  readonly seed: number;
  readonly plannedCount: number;
  readonly moveCount: number;
  readonly addCount: number;
  readonly intents: readonly Readonly<AdjustedResourceIntent>[];
  readonly adjustments: readonly Readonly<ResourceSupportAdjustment>[];
  readonly shortfalls: readonly Readonly<ResourceSupportShortfall>[];
  readonly perStart: readonly Readonly<Static<typeof ResourceSupportPerStartSchema>>[];
  readonly equity: Readonly<Static<typeof ResourceSupportEquitySchema>>;
  readonly settings: Readonly<Static<typeof ResourceSupportSettingsSchema>>;
};
type Shortfall = ResourceSupportShortfall;

const FLOOR_SHORTFALL_REASONS = new Set<Shortfall["reason"]>([
  "no-admitted-adjustment",
  "floor-budget-exhausted",
  "adjustment-disabled",
]);

const EQUITY_SHORTFALL_REASONS = new Set<Shortfall["reason"]>([
  "equity-unresolvable",
  "equity-budget-exhausted",
]);

/** Registers the post-start support-adjusted resource intent set with closed adjustment evidence. */
export const artifact = defineArtifact({
  name: "resourcePlanAdjusted",
  id: "artifact:placement.resourcePlanAdjusted",
  schema: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      seed: Type.Integer(),
      plannedCount: Type.Integer({ minimum: 0 }),
      moveCount: Type.Integer({ minimum: 0 }),
      addCount: Type.Integer({ minimum: 0 }),
      intents: Type.Array(AdjustedResourceIntentSchema, {
        description:
          "Complete adjusted intent set: unchanged intents, admitted moves, and support additions.",
      }),
      adjustments: Type.Array(ResourceSupportAdjustmentSchema, {
        description: "Applied support moves and additions with typed causal provenance.",
      }),
      shortfalls: Type.Array(ResourceSupportShortfallSchema),
      perStart: Type.Array(ResourceSupportPerStartSchema, {
        description: "Per-seat resource support before and after bounded adjustment.",
      }),
      equity: ResourceSupportEquitySchema,
      settings: ResourceSupportSettingsSchema,
    },
    {
      additionalProperties: false,
      description:
        "Terminal symbolic resource plan after bounded player-start support and equity adjustment.",
    }
  ),
  refine: (adjusted, { dimensions, issues }) => {
    const size = validateDimensions(adjusted, dimensions, issues.add);
    if (adjusted.plannedCount !== adjusted.intents.length) {
      issues.add(
        `resourcePlanAdjusted.plannedCount ${adjusted.plannedCount} != intents.length ${adjusted.intents.length}.`
      );
    }
    if (size !== null) {
      validateIntentGeometry(adjusted.intents, adjusted.width, adjusted.height, size, issues.add);
      const preAdjustmentPlots = validateAdjustmentEvidence(adjusted, size, issues.add);
      validatePerStartEvidence(adjusted, preAdjustmentPlots, size, issues.add);
      validateInactiveEvidence(adjusted, issues.add);
    }
  },
});

function increment(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function adjustmentKey(row: {
  action: "move" | "add";
  reason: "support-floor" | "support-equity";
  resourceType: string;
  fromPlotIndex?: number;
  toPlotIndex: number;
  seatIndex: number;
}): string {
  return JSON.stringify([
    row.action,
    row.reason,
    row.resourceType,
    row.fromPlotIndex ?? null,
    row.toPlotIndex,
    row.seatIndex,
  ]);
}

function plotInBounds(plotIndex: number, size: number): boolean {
  return plotIndex < size;
}

function validateDimensions(
  value: ResourcePlanAdjusted,
  dimensions: Readonly<{ width: number; height: number }>,
  addIssue: (message: string) => void
): number | null {
  const size = value.width * value.height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    addIssue(`resourcePlanAdjusted has invalid dimensions ${value.width}x${value.height}.`);
    return null;
  }
  if (dimensions.width !== value.width || dimensions.height !== value.height) {
    addIssue(
      `resourcePlanAdjusted dimensions ${value.width}x${value.height} do not match execution dimensions ${dimensions.width}x${dimensions.height}.`
    );
  }
  return size;
}

function validateIntentGeometry(
  intents: readonly Readonly<AdjustedResourceIntent>[],
  width: number,
  height: number,
  size: number,
  addIssue: (message: string) => void
): void {
  const seenPlots = new Set<number>();
  for (const intent of intents) {
    if (!plotInBounds(intent.plotIndex, size)) {
      addIssue(`resourcePlanAdjusted intent plot ${intent.plotIndex} is out of bounds.`);
      continue;
    }
    if (intent.x >= width || intent.y >= height) {
      addIssue(
        `resourcePlanAdjusted intent coordinate ${intent.x},${intent.y} is outside ${width}x${height}.`
      );
    }
    const expectedX = intent.plotIndex % width;
    const expectedY = Math.floor(intent.plotIndex / width);
    if (intent.x !== expectedX || intent.y !== expectedY) {
      addIssue(
        `resourcePlanAdjusted intent plot ${intent.plotIndex} encodes ${expectedX},${expectedY}, received ${intent.x},${intent.y}.`
      );
    }
    if (seenPlots.has(intent.plotIndex)) {
      addIssue(`resourcePlanAdjusted plans two final intents on plot ${intent.plotIndex}.`);
    }
    seenPlots.add(intent.plotIndex);
  }
}

function validateAdjustmentEvidence(
  value: ResourcePlanAdjusted,
  size: number,
  addIssue: (message: string) => void
): readonly number[] {
  const expectedRows = new Map<string, number>();
  const actualRows = new Map<string, number>();
  const preAdjustmentPlots: number[] = [];

  for (const intent of value.intents) {
    const support = intent.support;
    if (!support) {
      if (intent.phase === "support") {
        addIssue(`support-phase intent on plot ${intent.plotIndex} must carry add provenance.`);
      }
      preAdjustmentPlots.push(intent.plotIndex);
      continue;
    }

    if (support.action === "add") {
      if (intent.phase !== "support") {
        addIssue(`added intent on plot ${intent.plotIndex} must use the support planning phase.`);
      }
    } else {
      if (intent.phase === "support") {
        addIssue(`moved intent on plot ${intent.plotIndex} cannot use the support phase.`);
      }
      preAdjustmentPlots.push(support.fromPlotIndex);
    }
    increment(
      expectedRows,
      adjustmentKey({
        ...support,
        resourceType: intent.resourceType,
        toPlotIndex: intent.plotIndex,
      })
    );
  }

  let moves = 0;
  let adds = 0;
  for (const row of value.adjustments) {
    if (!plotInBounds(row.toPlotIndex, size)) {
      addIssue(`resourcePlanAdjusted adjustment destination ${row.toPlotIndex} is out of bounds.`);
    }
    if (row.action === "move") {
      moves += 1;
      if (!plotInBounds(row.fromPlotIndex, size)) {
        addIssue(`move adjustment source ${row.fromPlotIndex} is out of bounds.`);
      } else if (row.fromPlotIndex === row.toPlotIndex) {
        addIssue("move adjustment source and destination must be different plots.");
      }
    } else {
      adds += 1;
    }
    increment(actualRows, adjustmentKey(row));
  }

  if (moves !== value.moveCount || adds !== value.addCount) {
    addIssue(
      `resourcePlanAdjusted adjustment rows contain ${moves} moves/${adds} adds, recorded ${value.moveCount}/${value.addCount}.`
    );
  }
  for (const key of new Set([...expectedRows.keys(), ...actualRows.keys()])) {
    const expected = expectedRows.get(key) ?? 0;
    const actual = actualRows.get(key) ?? 0;
    if (expected !== actual) {
      addIssue(
        `resourcePlanAdjusted adjustment/provenance row ${key} occurs ${actual} time(s), expected ${expected}.`
      );
    }
  }

  const seenPreAdjustmentPlots = new Set<number>();
  for (const plotIndex of preAdjustmentPlots) {
    if (!plotInBounds(plotIndex, size)) {
      addIssue(`resourcePlanAdjusted pre-adjustment plot ${plotIndex} is out of bounds.`);
      continue;
    }
    if (seenPreAdjustmentPlots.has(plotIndex)) {
      addIssue(
        `resourcePlanAdjusted reconstructs two pre-adjustment intents on plot ${plotIndex}.`
      );
    }
    seenPreAdjustmentPlots.add(plotIndex);
  }
  return preAdjustmentPlots;
}

function supportCount(
  plots: readonly number[],
  seatPlot: number,
  width: number,
  height: number,
  radius: number
): number {
  const zone = new Set(getHexRadiusIndicesOddQ(seatPlot, width, height, radius));
  let count = 0;
  for (const plotIndex of plots) {
    if (zone.has(plotIndex)) count += 1;
  }
  return count;
}

function gapOf(values: readonly number[]): number | null {
  return values.length < 2 ? null : Math.max(...values) - Math.min(...values);
}

function validatePerStartEvidence(
  value: ResourcePlanAdjusted,
  preAdjustmentPlots: readonly number[],
  size: number,
  addIssue: (message: string) => void
): void {
  const seatIndices = new Set<number>();
  const playerIds = new Set<number>();
  const seatPlots = new Set<number>();
  const finalPlots = value.intents.map((intent) => intent.plotIndex);
  const radius = value.settings.supportRadiusTiles;

  for (const row of value.perStart) {
    if (seatIndices.has(row.seatIndex)) {
      addIssue(`resourcePlanAdjusted repeats seat ${row.seatIndex}.`);
    }
    if (playerIds.has(row.playerId)) {
      addIssue(`resourcePlanAdjusted repeats player ${row.playerId}.`);
    }
    if (seatPlots.has(row.plotIndex)) {
      addIssue(`resourcePlanAdjusted repeats start plot ${row.plotIndex}.`);
    }
    seatIndices.add(row.seatIndex);
    playerIds.add(row.playerId);
    seatPlots.add(row.plotIndex);

    if (!plotInBounds(row.plotIndex, size)) {
      addIssue(`resourcePlanAdjusted start plot ${row.plotIndex} is out of bounds.`);
      continue;
    }
    const supportBefore = supportCount(
      preAdjustmentPlots,
      row.plotIndex,
      value.width,
      value.height,
      radius
    );
    const supportAfter = supportCount(finalPlots, row.plotIndex, value.width, value.height, radius);
    if (row.supportBefore !== supportBefore) {
      addIssue(
        `resourcePlanAdjusted seat ${row.seatIndex} supportBefore ${row.supportBefore} != reconstructed ${supportBefore}.`
      );
    }
    if (row.supportAfter !== supportAfter) {
      addIssue(
        `resourcePlanAdjusted seat ${row.seatIndex} supportAfter ${row.supportAfter} != reconstructed ${supportAfter}.`
      );
    }
  }

  for (const row of value.adjustments) {
    if (!seatIndices.has(row.seatIndex)) {
      addIssue(`resourcePlanAdjusted adjustment names unknown seat ${row.seatIndex}.`);
    }
  }

  const gapBefore = gapOf(value.perStart.map((row) => row.supportBefore));
  const gapAfter = gapOf(value.perStart.map((row) => row.supportAfter));
  if (value.equity.gapBefore !== gapBefore) {
    addIssue(
      `resourcePlanAdjusted equity.gapBefore ${String(value.equity.gapBefore)} != derived ${String(gapBefore)}.`
    );
  }
  if (value.equity.gapAfter !== gapAfter) {
    addIssue(
      `resourcePlanAdjusted equity.gapAfter ${String(value.equity.gapAfter)} != derived ${String(gapAfter)}.`
    );
  }

  validateShortfalls(value, seatIndices, gapAfter, addIssue);
}

function validateShortfalls(
  value: ResourcePlanAdjusted,
  seatIndices: ReadonlySet<number>,
  gapAfter: number | null,
  addIssue: (message: string) => void
): void {
  const active = value.settings.enabled && value.settings.strength > 0;
  const floorRowsBySeat = new Map<number, Shortfall[]>();
  const equityRows: Shortfall[] = [];
  const seenRows = new Set<string>();

  for (const row of value.shortfalls) {
    if (!seatIndices.has(row.seatIndex)) {
      addIssue(`resourcePlanAdjusted shortfall names unknown seat ${row.seatIndex}.`);
    }
    const rowKey = `${row.seatIndex}:${row.reason}`;
    if (seenRows.has(rowKey)) {
      addIssue(`resourcePlanAdjusted repeats terminal shortfall ${rowKey}.`);
    }
    seenRows.add(rowKey);

    if (FLOOR_SHORTFALL_REASONS.has(row.reason)) {
      const rows = floorRowsBySeat.get(row.seatIndex) ?? [];
      rows.push(row);
      floorRowsBySeat.set(row.seatIndex, rows);
      if (active && row.reason === "adjustment-disabled") {
        addIssue("active resource adjustment cannot report adjustment-disabled.");
      }
      if (!active && row.reason !== "adjustment-disabled") {
        addIssue("inactive resource adjustment must report floor deficits as adjustment-disabled.");
      }
    } else if (EQUITY_SHORTFALL_REASONS.has(row.reason)) {
      equityRows.push(row);
      if (!active) {
        addIssue("inactive resource adjustment cannot report an equity shortfall.");
      }
    }
  }

  for (const seat of value.perStart) {
    const rows = floorRowsBySeat.get(seat.seatIndex) ?? [];
    if (rows.length > 1) {
      addIssue(`resourcePlanAdjusted seat ${seat.seatIndex} has multiple terminal floor reasons.`);
    }
    const recorded = rows.reduce((sum, row) => sum + row.missing, 0);
    const expected = Math.max(0, value.settings.supportFloor - seat.supportAfter);
    if (recorded !== expected) {
      addIssue(
        `resourcePlanAdjusted seat ${seat.seatIndex} floor shortfall ${recorded} != terminal deficit ${expected}.`
      );
    }
  }

  if (equityRows.length > 1) {
    addIssue("resourcePlanAdjusted must report at most one terminal equity shortfall.");
  }
  const recordedEquity = equityRows.reduce((sum, row) => sum + row.missing, 0);
  const expectedEquity = active ? Math.max(0, (gapAfter ?? 0) - value.settings.equityTolerance) : 0;
  if (recordedEquity !== expectedEquity) {
    addIssue(
      `resourcePlanAdjusted equity shortfall ${recordedEquity} != terminal excess ${expectedEquity}.`
    );
  }
  const [equityRow] = equityRows;
  if (equityRow && value.perStart.length > 0) {
    const minimum = Math.min(...value.perStart.map((row) => row.supportAfter));
    const seat = value.perStart.find((candidate) => candidate.seatIndex === equityRow.seatIndex);
    if (seat && seat.supportAfter !== minimum) {
      addIssue("resourcePlanAdjusted equity shortfall must identify a minimum-support seat.");
    }
  }
}

function validateInactiveEvidence(
  value: ResourcePlanAdjusted,
  addIssue: (message: string) => void
): void {
  if (value.settings.enabled && value.settings.strength > 0) return;
  if (value.adjustments.length > 0 || value.moveCount !== 0 || value.addCount !== 0) {
    addIssue("inactive resource evidence must not record moves or additions.");
  }
  if (value.intents.some((intent) => intent.support !== undefined)) {
    addIssue("inactive resource evidence must not record adjustment provenance.");
  }
  if (value.perStart.some((row) => row.supportBefore !== row.supportAfter)) {
    addIssue("inactive resource evidence must preserve every recorded support count.");
  }
}
