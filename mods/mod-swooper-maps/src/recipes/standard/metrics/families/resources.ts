import { requireResourceRuntimeId } from "@civ7/map-policy";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
import { type CountMetric, measureMetricCount } from "@swooper/mapgen-metrics";

import type { StandardMapCapture } from "../capture.js";

/** Resource-plan authority, placement reconciliation, habitat, and spacing measurements. */
export type StandardResourceMetrics = Readonly<{
  plannedCount: number;
  placedCount: number;
  rejectedCount: number;
  mismatchCount: number;
  demandTypeCount: number;
  aboveMaximumTypeCount: number;
  belowMinimumWithoutShortfallCount: number;
  placedInHabitat: CountMetric;
  sameTypeSpacingViolationCount: number;
  uniquePlannedTypes: number;
  outcomeCountsByResource: StandardMapCapture["resources"]["summary"]["byResource"];
  outcomeCountsByReason: StandardMapCapture["resources"]["summary"]["byReason"];
  plannedTypeCounts: Readonly<Record<string, number>>;
  placedTypeCounts: Readonly<Record<string, number>>;
  observedTypeCounts: Readonly<Record<string, number>>;
}>;

/** Measures the admitted resource plan against stamped outcomes and observed Civ7 resources. */
export function measureStandardResources(capture: StandardMapCapture): StandardResourceMetrics {
  const plannedTypeCounts: Record<string, number> = {};
  const placedTypeCounts: Record<string, number> = {};
  const observedTypeCounts: Record<string, number> = {};
  const habitatByPlot = new Map<number, boolean>();
  const placedPlotsByType = new Map<number, number[]>();
  let placedPlotCount = 0;
  let placedInHabitatCount = 0;

  for (const intent of capture.resources.intents) {
    const typeId = requireResourceRuntimeId(intent.resourceType).resourceTypeId;
    increment(plannedTypeCounts, typeId);
    habitatByPlot.set(intent.plotIndex, intent.inHabitat);
  }

  for (const outcome of capture.resources.outcomes) {
    if (outcome.status !== "placed") continue;
    placedPlotCount += 1;
    increment(placedTypeCounts, outcome.resourceType);
    const plots = placedPlotsByType.get(outcome.resourceType) ?? [];
    plots.push(outcome.plotIndex);
    placedPlotsByType.set(outcome.resourceType, plots);
    if (habitatByPlot.get(outcome.plotIndex) === true) placedInHabitatCount += 1;
  }

  for (const resource of capture.observation.resource) {
    if (resource !== capture.observation.noResource) increment(observedTypeCounts, resource);
  }

  const spacingFloorByType = new Map<number, number>();
  let aboveMaximumTypeCount = 0;
  let belowMinimumWithoutShortfallCount = 0;
  for (const row of capture.resources.perType) {
    const typeId = requireResourceRuntimeId(row.resourceType).resourceTypeId;
    spacingFloorByType.set(typeId, row.spacingFloorTiles);
    if (row.plannedCount > row.maxCount) aboveMaximumTypeCount += 1;
    if (
      row.plannedCount < row.minCount &&
      row.shortfalls.reduce((sum, shortfall) => sum + shortfall.count, 0) === 0
    ) {
      belowMinimumWithoutShortfallCount += 1;
    }
  }

  let sameTypeSpacingViolationCount = 0;
  for (const [typeId, plots] of placedPlotsByType) {
    const floor = spacingFloorByType.get(typeId) ?? 0;
    for (let left = 0; left < plots.length; left += 1) {
      for (let right = left + 1; right < plots.length; right += 1) {
        if (
          floor > 0 &&
          hexDistanceOddQPeriodicX(plots[left]!, plots[right]!, capture.provenance.width) < floor
        ) {
          sameTypeSpacingViolationCount += 1;
        }
      }
    }
  }

  const summary = capture.resources.summary;
  return Object.freeze({
    plannedCount: summary.plannedCount,
    placedCount: summary.placedCount,
    rejectedCount: summary.rejectedCount,
    mismatchCount: summary.mismatchCount,
    demandTypeCount: capture.resources.perType.length,
    aboveMaximumTypeCount,
    belowMinimumWithoutShortfallCount,
    placedInHabitat: measureMetricCount(placedInHabitatCount, placedPlotCount),
    sameTypeSpacingViolationCount,
    uniquePlannedTypes: summary.byResource.filter((row) => row.plannedCount > 0).length,
    outcomeCountsByResource: summary.byResource,
    outcomeCountsByReason: summary.byReason,
    plannedTypeCounts: Object.freeze(plannedTypeCounts),
    placedTypeCounts: Object.freeze(placedTypeCounts),
    observedTypeCounts: Object.freeze(observedTypeCounts),
  });
}

function increment(counts: Record<string, number>, key: string | number): void {
  const normalized = String(key);
  counts[normalized] = (counts[normalized] ?? 0) + 1;
}
