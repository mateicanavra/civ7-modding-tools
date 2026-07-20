import resources from "@mapgen/domain/resources";
import type { ArtifactValidationContext, Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";
import { getHexRadiusIndicesOddQ } from "@swooper/mapgen-core/lib/grid";

/** Support-adjusted resource plan (`artifact:placement.resourcePlanAdjusted`). One artifact per file by repo convention. */

export const Schema = resources.ops.adjustResourceSupport.output;

type ResourcePlanAdjusted = Static<typeof Schema>;
type AdjustedIntent = ResourcePlanAdjusted["intents"][number];
type Shortfall = ResourcePlanAdjusted["shortfalls"][number];
type ValidationIssue = { message: string };

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
  schema: Schema,
});

function issue(message: string): ValidationIssue {
  return { message };
}

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
  return Number.isInteger(plotIndex) && plotIndex >= 0 && plotIndex < size;
}

function validateDimensions(
  value: ResourcePlanAdjusted,
  context: ArtifactValidationContext | undefined,
  issues: ValidationIssue[]
): number | null {
  const size = value.width * value.height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    issues.push(
      issue(`resourcePlanAdjusted has invalid dimensions ${value.width}x${value.height}.`)
    );
    return null;
  }
  if (
    context?.dimensions &&
    (context.dimensions.width !== value.width || context.dimensions.height !== value.height)
  ) {
    issues.push(
      issue(
        `resourcePlanAdjusted dimensions ${value.width}x${value.height} do not match execution dimensions ${context.dimensions.width}x${context.dimensions.height}.`
      )
    );
  }
  return size;
}

function validateIntentGeometry(
  intents: readonly AdjustedIntent[],
  width: number,
  height: number,
  size: number,
  issues: ValidationIssue[]
): void {
  const seenPlots = new Set<number>();
  for (const intent of intents) {
    if (!plotInBounds(intent.plotIndex, size)) {
      issues.push(issue(`resourcePlanAdjusted intent plot ${intent.plotIndex} is out of bounds.`));
      continue;
    }
    if (intent.x < 0 || intent.x >= width || intent.y < 0 || intent.y >= height) {
      issues.push(
        issue(
          `resourcePlanAdjusted intent coordinate ${intent.x},${intent.y} is outside ${width}x${height}.`
        )
      );
    }
    const expectedX = intent.plotIndex % width;
    const expectedY = Math.floor(intent.plotIndex / width);
    if (intent.x !== expectedX || intent.y !== expectedY) {
      issues.push(
        issue(
          `resourcePlanAdjusted intent plot ${intent.plotIndex} encodes ${expectedX},${expectedY}, received ${intent.x},${intent.y}.`
        )
      );
    }
    if (seenPlots.has(intent.plotIndex)) {
      issues.push(
        issue(`resourcePlanAdjusted plans two final intents on plot ${intent.plotIndex}.`)
      );
    }
    seenPlots.add(intent.plotIndex);
  }
}

function validateAdjustmentEvidence(
  value: ResourcePlanAdjusted,
  size: number,
  issues: ValidationIssue[]
): readonly number[] {
  const expectedRows = new Map<string, number>();
  const actualRows = new Map<string, number>();
  const preAdjustmentPlots: number[] = [];

  for (const intent of value.intents) {
    const support = intent.support;
    if (!support) {
      if (intent.phase === "support") {
        issues.push(
          issue(`support-phase intent on plot ${intent.plotIndex} must carry add provenance.`)
        );
      }
      preAdjustmentPlots.push(intent.plotIndex);
      continue;
    }

    if (support.action === "add") {
      if (intent.phase !== "support") {
        issues.push(
          issue(`added intent on plot ${intent.plotIndex} must use the support planning phase.`)
        );
      }
    } else {
      if (intent.phase === "support") {
        issues.push(
          issue(`moved intent on plot ${intent.plotIndex} cannot use the support phase.`)
        );
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
      issues.push(
        issue(`resourcePlanAdjusted adjustment destination ${row.toPlotIndex} is out of bounds.`)
      );
    }
    if (row.action === "move") {
      moves += 1;
      if (!plotInBounds(row.fromPlotIndex, size)) {
        issues.push(issue(`move adjustment source ${row.fromPlotIndex} is out of bounds.`));
      } else if (row.fromPlotIndex === row.toPlotIndex) {
        issues.push(issue(`move adjustment source and destination must be different plots.`));
      }
    } else {
      adds += 1;
    }
    increment(actualRows, adjustmentKey(row));
  }

  if (moves !== value.moveCount || adds !== value.addCount) {
    issues.push(
      issue(
        `resourcePlanAdjusted adjustment rows contain ${moves} moves/${adds} adds, recorded ${value.moveCount}/${value.addCount}.`
      )
    );
  }
  for (const key of new Set([...expectedRows.keys(), ...actualRows.keys()])) {
    const expected = expectedRows.get(key) ?? 0;
    const actual = actualRows.get(key) ?? 0;
    if (expected !== actual) {
      issues.push(
        issue(
          `resourcePlanAdjusted adjustment/provenance row ${key} occurs ${actual} time(s), expected ${expected}.`
        )
      );
    }
  }

  const seenPreAdjustmentPlots = new Set<number>();
  for (const plotIndex of preAdjustmentPlots) {
    if (!plotInBounds(plotIndex, size)) {
      issues.push(issue(`resourcePlanAdjusted pre-adjustment plot ${plotIndex} is out of bounds.`));
      continue;
    }
    if (seenPreAdjustmentPlots.has(plotIndex)) {
      issues.push(
        issue(`resourcePlanAdjusted reconstructs two pre-adjustment intents on plot ${plotIndex}.`)
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
  issues: ValidationIssue[]
): void {
  const seatIndices = new Set<number>();
  const playerIds = new Set<number>();
  const seatPlots = new Set<number>();
  const finalPlots = value.intents.map((intent) => intent.plotIndex);
  const radius = value.settings.supportRadiusTiles;

  for (const row of value.perStart) {
    if (seatIndices.has(row.seatIndex)) {
      issues.push(issue(`resourcePlanAdjusted repeats seat ${row.seatIndex}.`));
    }
    if (playerIds.has(row.playerId)) {
      issues.push(issue(`resourcePlanAdjusted repeats player ${row.playerId}.`));
    }
    if (seatPlots.has(row.plotIndex)) {
      issues.push(issue(`resourcePlanAdjusted repeats start plot ${row.plotIndex}.`));
    }
    seatIndices.add(row.seatIndex);
    playerIds.add(row.playerId);
    seatPlots.add(row.plotIndex);

    if (!plotInBounds(row.plotIndex, size)) {
      issues.push(issue(`resourcePlanAdjusted start plot ${row.plotIndex} is out of bounds.`));
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
      issues.push(
        issue(
          `resourcePlanAdjusted seat ${row.seatIndex} supportBefore ${row.supportBefore} != reconstructed ${supportBefore}.`
        )
      );
    }
    if (row.supportAfter !== supportAfter) {
      issues.push(
        issue(
          `resourcePlanAdjusted seat ${row.seatIndex} supportAfter ${row.supportAfter} != reconstructed ${supportAfter}.`
        )
      );
    }
  }

  for (const row of value.adjustments) {
    if (!seatIndices.has(row.seatIndex)) {
      issues.push(issue(`resourcePlanAdjusted adjustment names unknown seat ${row.seatIndex}.`));
    }
  }

  const gapBefore = gapOf(value.perStart.map((row) => row.supportBefore));
  const gapAfter = gapOf(value.perStart.map((row) => row.supportAfter));
  if (value.equity.gapBefore !== gapBefore) {
    issues.push(
      issue(
        `resourcePlanAdjusted equity.gapBefore ${String(value.equity.gapBefore)} != derived ${String(gapBefore)}.`
      )
    );
  }
  if (value.equity.gapAfter !== gapAfter) {
    issues.push(
      issue(
        `resourcePlanAdjusted equity.gapAfter ${String(value.equity.gapAfter)} != derived ${String(gapAfter)}.`
      )
    );
  }

  validateShortfalls(value, seatIndices, gapAfter, issues);
}

function validateShortfalls(
  value: ResourcePlanAdjusted,
  seatIndices: ReadonlySet<number>,
  gapAfter: number | null,
  issues: ValidationIssue[]
): void {
  const active = value.settings.enabled && value.settings.strength > 0;
  const floorRowsBySeat = new Map<number, Shortfall[]>();
  const equityRows: Shortfall[] = [];
  const seenRows = new Set<string>();

  for (const row of value.shortfalls) {
    if (!seatIndices.has(row.seatIndex)) {
      issues.push(issue(`resourcePlanAdjusted shortfall names unknown seat ${row.seatIndex}.`));
    }
    const rowKey = `${row.seatIndex}:${row.reason}`;
    if (seenRows.has(rowKey)) {
      issues.push(issue(`resourcePlanAdjusted repeats terminal shortfall ${rowKey}.`));
    }
    seenRows.add(rowKey);

    if (FLOOR_SHORTFALL_REASONS.has(row.reason)) {
      const rows = floorRowsBySeat.get(row.seatIndex) ?? [];
      rows.push(row);
      floorRowsBySeat.set(row.seatIndex, rows);
      if (active && row.reason === "adjustment-disabled") {
        issues.push(issue(`active resource adjustment cannot report adjustment-disabled.`));
      }
      if (!active && row.reason !== "adjustment-disabled") {
        issues.push(
          issue(`inactive resource adjustment must report floor deficits as adjustment-disabled.`)
        );
      }
    } else if (EQUITY_SHORTFALL_REASONS.has(row.reason)) {
      equityRows.push(row);
      if (!active) {
        issues.push(issue(`inactive resource adjustment cannot report an equity shortfall.`));
      }
    }
  }

  for (const seat of value.perStart) {
    const rows = floorRowsBySeat.get(seat.seatIndex) ?? [];
    if (rows.length > 1) {
      issues.push(
        issue(`resourcePlanAdjusted seat ${seat.seatIndex} has multiple terminal floor reasons.`)
      );
    }
    const recorded = rows.reduce((sum, row) => sum + row.missing, 0);
    const expected = Math.max(0, value.settings.supportFloor - seat.supportAfter);
    if (recorded !== expected) {
      issues.push(
        issue(
          `resourcePlanAdjusted seat ${seat.seatIndex} floor shortfall ${recorded} != terminal deficit ${expected}.`
        )
      );
    }
  }

  if (equityRows.length > 1) {
    issues.push(issue("resourcePlanAdjusted must report at most one terminal equity shortfall."));
  }
  const recordedEquity = equityRows.reduce((sum, row) => sum + row.missing, 0);
  const expectedEquity = active ? Math.max(0, (gapAfter ?? 0) - value.settings.equityTolerance) : 0;
  if (recordedEquity !== expectedEquity) {
    issues.push(
      issue(
        `resourcePlanAdjusted equity shortfall ${recordedEquity} != terminal excess ${expectedEquity}.`
      )
    );
  }
  const [equityRow] = equityRows;
  if (equityRow && value.perStart.length > 0) {
    const minimum = Math.min(...value.perStart.map((row) => row.supportAfter));
    const seat = value.perStart.find((candidate) => candidate.seatIndex === equityRow.seatIndex);
    if (seat && seat.supportAfter !== minimum) {
      issues.push(
        issue(`resourcePlanAdjusted equity shortfall must identify a minimum-support seat.`)
      );
    }
  }
}

function validateInactiveEvidence(value: ResourcePlanAdjusted, issues: ValidationIssue[]): void {
  if (value.settings.enabled && value.settings.strength > 0) return;
  if (value.adjustments.length > 0 || value.moveCount !== 0 || value.addCount !== 0) {
    issues.push(issue("inactive resource evidence must not record moves or additions."));
  }
  if (value.intents.some((intent) => intent.support !== undefined)) {
    issues.push(issue("inactive resource evidence must not record adjustment provenance."));
  }
  if (value.perStart.some((row) => row.supportBefore !== row.supportAfter)) {
    issues.push(issue("inactive resource evidence must preserve every recorded support count."));
  }
}

/**
 * Validates the artifact's closed plan/evidence state: dimensions and coordinates, unique
 * pre/post plans, bijective adjustment provenance, recomputed per-start support, equity gaps,
 * and terminal floor/equity shortfall totals. Inactive evidence proves only zero adjustment
 * rows/provenance and unchanged recorded support counts because the source plan is not available
 * here. The validator intentionally does not re-prove input immutability, habitat, policy legality,
 * spacing, causal reason selection, input-seat completeness, or stamped engine outcomes; those
 * belong to their producing operation and downstream materialization owners.
 */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const schemaIssues = [...validateArtifactSchema(Schema, value)];
  if (schemaIssues.length > 0) return Object.freeze(schemaIssues);

  const adjusted = value as ResourcePlanAdjusted;
  const issues: ValidationIssue[] = [];
  const size = validateDimensions(adjusted, context, issues);
  if (adjusted.plannedCount !== adjusted.intents.length) {
    issues.push(
      issue(
        `resourcePlanAdjusted.plannedCount ${adjusted.plannedCount} != intents.length ${adjusted.intents.length}.`
      )
    );
  }
  if (size !== null) {
    validateIntentGeometry(adjusted.intents, adjusted.width, adjusted.height, size, issues);
    const preAdjustmentPlots = validateAdjustmentEvidence(adjusted, size, issues);
    validatePerStartEvidence(adjusted, preAdjustmentPlots, size, issues);
    validateInactiveEvidence(adjusted, issues);
  }
  return Object.freeze(issues);
}
