import type { MetricTarget } from "@swooper/mapgen-metrics";

import type { StandardMapProductSample } from "../sample.js";
import { atLeast, atMost, equalTo, requiredShare } from "./support.js";

/** Cross-configuration closure laws required of every completed Standard map product. */
export const STANDARD_INTEGRITY_TARGET = {
  id: "standard/integrity",
  description:
    "Every Standard map closes placement, resource, lake, feature, river, and headless-adapter readback evidence.",
  expectations: [
    atLeast<StandardMapProductSample>(
      "resource-plan-present",
      "The admitted resource plan contains at least one intent.",
      (sample) => sample.metrics.resources.plannedCount,
      1
    ),
    equalTo<StandardMapProductSample>(
      "marine-resource-presence",
      "A completed map with coastal water realizes at least one resource on water.",
      (sample) =>
        sample.metrics.geography.coastWater.count === 0 ||
        sample.metrics.resources.placedOnWater.count > 0,
      true
    ),
    equalTo<StandardMapProductSample>(
      "resource-spacing",
      "Placed resources preserve each type's spacing floor.",
      (sample) => sample.metrics.resources.sameTypeSpacingViolationCount,
      0
    ),
    equalTo<StandardMapProductSample>(
      "resource-outcome-total",
      "Placed, rejected, and mismatch outcomes exactly close the resource plan.",
      (sample) => {
        const metrics = sample.metrics.resources;
        return (
          metrics.placedCount + metrics.rejectedCount + metrics.mismatchCount ===
          metrics.plannedCount
        );
      },
      true
    ),
    equalTo<StandardMapProductSample>(
      "resource-by-type-total",
      "Every per-resource summary and its typed reasons exactly close the resource plan.",
      (sample) => {
        const metrics = sample.metrics.resources;
        return (
          metrics.outcomeCountsByResource.reduce((sum, row) => sum + row.plannedCount, 0) ===
            metrics.plannedCount &&
          metrics.outcomeCountsByResource.every(
            (row) =>
              row.placedCount + row.rejectedCount + row.mismatchCount === row.plannedCount &&
              row.reasons.reduce((sum, reason) => sum + reason.count, 0) ===
                row.rejectedCount + row.mismatchCount
          )
        );
      },
      true
    ),
    equalTo<StandardMapProductSample>(
      "resource-by-reason-total",
      "Typed refusal reasons close rejected and mismatch outcomes.",
      (sample) =>
        sample.metrics.resources.outcomeCountsByReason.reduce((sum, row) => sum + row.count, 0) ===
        sample.metrics.resources.rejectedCount + sample.metrics.resources.mismatchCount,
      true
    ),
    equalTo<StandardMapProductSample>(
      "resource-plan-type-counts",
      "Symbolic plan type totals exactly close the admitted plan population.",
      (sample) =>
        sumRecordValues(sample.metrics.resources.plannedTypeCounts) ===
        sample.metrics.resources.plannedCount,
      true
    ),
    equalTo<StandardMapProductSample>(
      "resource-demand-disposition",
      "Every positive admitted resource demand reaches a terminal planned-or-shortfall disposition.",
      (sample) =>
        sample.metrics.resources.candidates.every(
          (candidate) =>
            candidate.disposition !== "admitted" ||
            candidate.targetIntentCount === 0 ||
            candidate.plannedCount > 0 ||
            candidate.shortfalls.length > 0
        ),
      true
    ),
    equalTo<StandardMapProductSample>(
      "resource-intent-outcome-alignment",
      "Every placement outcome retains the resource identity selected for its exact plan plot.",
      (sample) => {
        const alignment = sample.metrics.resources.intentOutcomeTypeAlignment;
        return (
          alignment.population === sample.metrics.resources.plannedCount &&
          alignment.count === alignment.population
        );
      },
      true
    ),
    equalTo<StandardMapProductSample>(
      "resource-placed-readback-alignment",
      "Every placed outcome matches the resource observed on its exact final plot.",
      (sample) => {
        const alignment = sample.metrics.resources.placedObservationTypeAlignment;
        return (
          alignment.population === sample.metrics.resources.placedCount &&
          alignment.count === alignment.population
        );
      },
      true
    ),
    equalTo<StandardMapProductSample>(
      "resource-headless-policy-legality",
      "Every placed resource remains legal for the completed headless policy surface.",
      (sample) => {
        const legality = sample.metrics.resources.placedHeadlessPolicyLegality;
        return (
          legality.population === sample.metrics.resources.placedCount &&
          legality.count === legality.population
        );
      },
      true
    ),
    equalTo<StandardMapProductSample>(
      "resource-placement-phase-total",
      "Placed resource provenance across rotation, range-floor, region-minimum, and support closes the placed population.",
      (sample) => {
        const phases = sample.metrics.resources.placedInHabitatByPhase;
        return (
          phases.rotation.population +
            phases["range-floor"].population +
            phases["region-minimum"].population +
            phases.support.population ===
          sample.metrics.resources.placedCount
        );
      },
      true
    ),
    equalTo<StandardMapProductSample>(
      "resource-hard-phase-habitat",
      "Rotation, range-floor, and support placements never leave their authored habitat lanes.",
      (sample) => {
        const phases = sample.metrics.resources.placedInHabitatByPhase;
        return [phases.rotation, phases["range-floor"], phases.support].every(
          (phase) => phase.count === phase.population
        );
      },
      true
    ),
    equalTo<StandardMapProductSample>(
      "resource-region-minimum-evidence",
      "Every regional resource minimum carries exact pre-stamp planning and final outcome evidence.",
      (sample) => {
        const rows = sample.metrics.resources.regionMinimums;
        return (
          rows.length > 0 &&
          rows.every(
            (row) =>
              row.plannedShortfall === Math.max(0, row.required - row.fromRotation - row.forced) &&
              row.adjustedPlannedCount === row.placedCount + row.rejectedCount &&
              row.rejectionReasons.reduce((sum, reason) => sum + reason.count, 0) ===
                row.rejectedCount &&
              row.finalShortfall === Math.max(0, row.required - row.placedCount)
          )
        );
      },
      true
    ),
    equalTo<StandardMapProductSample>(
      "resource-final-region-minimums",
      "Final headless placement preserves every planned regional minimum or its already-recorded planning shortfall.",
      (sample) => {
        const preservation = sample.metrics.resources.regionMinimumDispositionPreservation;
        return (
          preservation.population > 0 &&
          preservation.count === preservation.population &&
          sample.metrics.resources.postStampRegionMinimumShortfallUnits === 0
        );
      },
      true
    ),
    equalTo<StandardMapProductSample>(
      "resource-observation-reconciliation",
      "Observed headless resource identities exactly match the placed outcome population by type.",
      (sample) => {
        const metrics = sample.metrics.resources;
        return (
          sumRecordValues(metrics.placedTypeCounts) === metrics.placedCount &&
          sumRecordValues(metrics.observedTypeCounts) === metrics.placedCount &&
          recordsEqual(metrics.placedTypeCounts, metrics.observedTypeCounts)
        );
      },
      true
    ),
    equalTo<StandardMapProductSample>(
      "exact-player-seating",
      "Every requested alive major player is seated exactly once with no synthetic slot identity.",
      (sample) => {
        const placement = sample.metrics.placement;
        return (
          placement.expectedPlayers === placement.aliveMajorCount &&
          placement.assigned === placement.expectedPlayers &&
          placement.unseatedCount === 0 &&
          placement.missingAlivePlayerCount === 0 &&
          placement.unexpectedPlayerCount === 0 &&
          placement.duplicatePlayerCount === 0 &&
          placement.slotIndexPlayerCount === 0
        );
      },
      true
    ),
    equalTo<StandardMapProductSample>(
      "legal-start-surfaces",
      "No seated start occupies water, a lake, mountain, volcano, or natural wonder.",
      (sample) => sample.metrics.placement.illegalStarts.count,
      0
    ),
    equalTo<StandardMapProductSample>(
      "minimum-start-spacing",
      "Every pair of starts remains at least six tiles apart.",
      (sample) => {
        const spacing = sample.metrics.placement.pairwiseStartSpacing;
        return spacing !== null && spacing.minimum >= 6;
      },
      true
    ),
    equalTo<StandardMapProductSample>(
      "surfaced-start-degradation",
      "Every unseated, fallback, or region-relaxed seat is explicitly marked degraded.",
      (sample) => sample.metrics.placement.unacknowledgedDegradationCount,
      0
    ),
    atMost<StandardMapProductSample>(
      "lake-share",
      "Projected lakes remain an occasional inland surface.",
      (sample) => requiredShare(sample.metrics.geography.projectedLakes, "Projected lake share"),
      0.08
    ),
    equalTo<StandardMapProductSample>(
      "lake-water-drift",
      "Projected lake tiles remain water through final placement preparation.",
      (sample) => sample.metrics.geography.lakeWaterDriftCount,
      0
    ),
    equalTo<StandardMapProductSample>(
      "final-lake-water-drift",
      "Final placement preserves projected lake water state.",
      (sample) => sample.metrics.geography.finalLakeWaterDriftCount,
      0
    ),
    equalTo<StandardMapProductSample>(
      "final-lake-classification-drift",
      "Final headless placement preserves the adapter's lake classification.",
      (sample) => sample.metrics.geography.finalLakeClassificationDriftCount,
      0
    ),
    atMost<StandardMapProductSample>(
      "lake-projection-mismatches",
      "Engine lake projection remains inside the admitted edge tolerance.",
      (sample) => sample.metrics.geography.lakeProjectionMismatchCount,
      2
    ),
    atMost<StandardMapProductSample>(
      "single-tile-lake-share",
      "One-tile basins remain a minority of projected lake tiles.",
      (sample) => requiredShare(sample.metrics.geography.singleTileLakeTiles, "Single-tile lakes"),
      0.2
    ),
    atMost<StandardMapProductSample>(
      "lake-component-count",
      "Projected lakes remain a bounded set of coherent basins.",
      (sample) => sample.metrics.geography.projectedLakeComponents.componentCount,
      24
    ),
    equalTo<StandardMapProductSample>(
      "feature-surface-legality",
      "Every measured feature remains legal for its observed headless surface.",
      (sample) => sample.metrics.ecology.invalidFeatureSurfaceCount,
      0
    ),
    equalTo<StandardMapProductSample>(
      "feature-habitat-fidelity",
      "Every measured vegetation feature remains inside its broad product habitat.",
      (sample) =>
        Object.values(sample.metrics.ecology.featureHabitatMismatchCounts).every(
          (count) => count === 0
        ),
      true
    ),
    equalTo<StandardMapProductSample>(
      "modeled-land-biome-classification",
      "Every modeled-land tile carries a classified ecology biome.",
      (sample) => sample.metrics.ecology.unclassifiedModeledLand.count,
      0
    ),
    equalTo<StandardMapProductSample>(
      "start-distribution-classification",
      "Every seated start belongs to one measured landmass and homeland region.",
      (sample) => {
        const distribution = sample.metrics.placement.homelandDistribution;
        return (
          distribution.globalSpread !== null &&
          distribution.regions.every(
            (region) =>
              region.landShare !== null &&
              region.requestedStartShare !== null &&
              region.realizedStartShare !== null
          ) &&
          distribution.landmasses.every(
            (landmass) => landmass.landShare !== null && landmass.startShare !== null
          ) &&
          distribution.unclassifiedRegionStartCount === 0 &&
          distribution.unclassifiedLandmassStartCount === 0
        );
      },
      true
    ),
    atMost<StandardMapProductSample>(
      "cold-reef-coast-share",
      "Cold reefs remain isolated accents on shallow coast water.",
      (sample) => requiredShare(sample.metrics.ecology.coldReefCoastTiles, "Cold-reef coast share"),
      0.15
    ),
    atLeast<StandardMapProductSample>(
      "minor-river-model",
      "The hydrology model contains minor rivers.",
      (sample) => sample.metrics.hydrology.minorRiverTiles.count,
      1
    ),
    atLeast<StandardMapProductSample>(
      "major-river-model",
      "The hydrology model contains major rivers.",
      (sample) => sample.metrics.hydrology.majorRiverTiles.count,
      1
    ),
    atLeast<StandardMapProductSample>(
      "river-outlets",
      "The hydrology model contains river outlets.",
      (sample) => sample.metrics.hydrology.outletTiles.count,
      1
    ),
    equalTo<StandardMapProductSample>(
      "river-terminal-evidence",
      "Hydrology publishes terminal classification evidence.",
      (sample) => sample.metrics.hydrology.terminalOceanTiles !== null,
      true
    ),
    atLeast<StandardMapProductSample>(
      "ocean-river-terminals",
      "At least one modeled river terminal reaches the ocean.",
      (sample) => sample.metrics.hydrology.terminalOceanTiles?.count ?? 0,
      1
    ),
    atLeast<StandardMapProductSample>(
      "navigable-river-selection",
      "The projection selects visible navigable-river terrain.",
      (sample) => sample.metrics.hydrology.navigable.selectedTileCount,
      1
    ),
    atLeast<StandardMapProductSample>(
      "navigable-river-eligibility",
      "The projection observes an eligible navigable-river corpus.",
      (sample) => sample.metrics.hydrology.navigable.eligibleTileCount,
      1
    ),
    atLeast<StandardMapProductSample>(
      "navigable-river-chains",
      "The visible navigable-river selection contains at least one coherent chain.",
      (sample) => sample.metrics.hydrology.navigable.selectedChainCount,
      1
    ),
    atLeast<StandardMapProductSample>(
      "durable-major-river-support",
      "Navigable-river projection is supported by perennial major-river tiles.",
      (sample) => sample.metrics.hydrology.navigable.majorDurableTileCount,
      1
    ),
    equalTo<StandardMapProductSample>(
      "major-river-selection-source",
      "Navigable-river projection reports the same major-river model population.",
      (sample) =>
        sample.metrics.hydrology.navigable.plannedMajorRiverTileCount ===
        sample.metrics.hydrology.majorRiverTiles.count,
      true
    ),
    equalTo<StandardMapProductSample>(
      "navigable-selection-bounds",
      "Selected navigable-river tiles remain inside the eligible corpus.",
      (sample) =>
        sample.metrics.hydrology.navigable.selectedTileCount <=
        sample.metrics.hydrology.navigable.eligibleTileCount,
      true
    ),
    equalTo<StandardMapProductSample>(
      "navigable-river-readback",
      "Observed navigable-river terrain exactly matches the selected projection.",
      (sample) =>
        sample.metrics.hydrology.navigable.terrainNavigableRiverTileCount ===
        sample.metrics.hydrology.navigable.selectedTileCount,
      true
    ),
    equalTo<StandardMapProductSample>(
      "navigable-river-mismatches",
      "No selected or observed navigable-river tile escapes reconciliation.",
      (sample) => {
        const metrics = sample.metrics.hydrology.navigable;
        return (
          metrics.riverMismatchCount === 0 &&
          metrics.selectedRiverRejectedCount === 0 &&
          metrics.extraEngineRiverCount === 0
        );
      },
      true
    ),
  ],
} satisfies MetricTarget<StandardMapProductSample>;

function sumRecordValues(record: Readonly<Record<string, number>>): number {
  return Object.values(record).reduce((sum, value) => sum + value, 0);
}

function recordsEqual(
  left: Readonly<Record<string, number>>,
  right: Readonly<Record<string, number>>
): boolean {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) if ((left[key] ?? 0) !== (right[key] ?? 0)) return false;
  return true;
}
