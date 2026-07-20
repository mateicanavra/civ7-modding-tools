import { requireResourceRuntimeId } from "@civ7/map-policy";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
import { type CountMetric, measureMetricCount } from "@swooper/mapgen-metrics";

import type { StandardMapCapture, StandardResourceExclusionReason } from "../capture.js";

const PAIR_CORRELATION_ANNULUS_WIDTH_TILES = 2;
const LATITUDE_BAND_DEGREES = 15;
const DISTRIBUTION_SECTOR_ROWS = 4;
const DISTRIBUTION_SECTOR_COLUMNS = 4;

type StandardResourceCandidateMeasurementBase = Readonly<{
  resourceType: string;
  plannerStatus: StandardMapCapture["resources"]["candidates"][number]["plannerStatus"];
  targetIntentCount: number;
  plannerEligibleTileCount: number;
}>;
type StandardResourceCandidateAdmission =
  StandardMapCapture["resources"]["candidates"][number]["admission"];
type StandardResourceOutcomeReason = NonNullable<
  StandardMapCapture["resources"]["outcomes"][number]["reason"]
>;
type StandardScenarioIneligibleReason = Extract<
  StandardResourceCandidateAdmission,
  { kind: "scenario-ineligible" }
>["reason"];

/** One planner candidate in exactly one terminal demand-admission state. */
export type StandardResourceCandidateMeasurement = StandardResourceCandidateMeasurementBase &
  (
    | Readonly<{
        disposition: "admitted";
        exclusionReason: null;
        plannedCount: number;
        placedCount: number;
        shortfalls: StandardMapCapture["resources"]["perType"][number]["shortfalls"];
      }>
    | Readonly<{
        disposition: "scenario-ineligible";
        exclusionReason: StandardScenarioIneligibleReason;
        plannedCount: 0;
        placedCount: number;
      }>
    | Readonly<{
        disposition: "excluded";
        exclusionReason: StandardResourceExclusionReason;
        plannedCount: 0;
        /** Null only when the candidate's symbolic identity has no proven runtime id. */
        placedCount: number | null;
      }>
  );

/** One resource type's realized population against its authored count range and target. */
export type StandardResourceRangeMeasurement = Readonly<{
  resourceType: string;
  placedCount: number;
  minimumCount: number;
  authoredTargetCount: number;
  maximumCount: number;
  withinRange: boolean;
}>;

/** Completed land-resource density in one configured latitude band. */
export type StandardResourceLatitudeBand = Readonly<{
  minimumLatitude: number;
  maximumLatitude: number;
  landTileCount: number;
  landShare: number;
  placedCount: number;
  resourceShare: number;
  overrepresentation: number | null;
}>;

/** Realized resource density on one cataloged modeled landmass. */
export type StandardLandmassResourceDensity = Readonly<{
  landmassId: number;
  tileCount: number;
  landShare: number;
  placedCount: number;
  densityPerHundredTiles: number;
}>;

/**
 * One required resource population reconciled from planning through final headless placement.
 * Planned shortfalls and typed adapter rejections stay separate so a realized deficit cannot be
 * hidden behind pre-stamp arithmetic.
 */
export type StandardResourceRegionMinimumMeasurement = Readonly<{
  resourceType: StandardMapCapture["resources"]["regionMinimums"][number]["resourceType"];
  regionSlot: number;
  required: number;
  fromRotation: number;
  forced: number;
  plannedShortfall: number;
  adjustedPlannedCount: number;
  placedCount: number;
  rejectedCount: number;
  rejectionReasons: readonly Readonly<{ reason: StandardResourceOutcomeReason; count: number }>[];
  finalShortfall: number;
}>;

/** Resource-plan authority, placement reconciliation, habitat, spacing, and distribution facts. */
export type StandardResourceMetrics = Readonly<{
  plannedCount: number;
  placedCount: number;
  rejectedCount: number;
  mismatchCount: number;
  candidateCount: number;
  demandTypeCount: number;
  scenarioIneligibleCandidateCount: number;
  excludedCandidateCount: number;
  candidates: readonly StandardResourceCandidateMeasurement[];
  placedInHabitat: CountMetric;
  placedOnWater: CountMetric;
  intentOutcomeTypeAlignment: CountMetric;
  placedObservationTypeAlignment: CountMetric;
  placedHeadlessPolicyLegality: CountMetric;
  placedInHabitatByPhase: Readonly<{
    rotation: CountMetric;
    "range-floor": CountMetric;
    "region-minimum": CountMetric;
    support: CountMetric;
  }>;
  sameTypeSpacingViolationCount: number;
  geologicalPairCorrelationAboveSpacing: Readonly<{
    spacingFloorTiles: number;
    placedCount: number;
    ratioToCompleteSpatialRandomness: number | null;
  }>;
  admittedTypeRanges: readonly StandardResourceRangeMeasurement[];
  admittedWithinAuthoredRange: CountMetric;
  regionMinimums: readonly StandardResourceRegionMinimumMeasurement[];
  regionMinimumDispositionPreservation: CountMetric;
  postStampRegionMinimumShortfallUnits: number;
  landmassDensityRows: readonly StandardLandmassResourceDensity[];
  landResourceDistribution: Readonly<{
    latitudeBandDegrees: number;
    latitudeBands: readonly StandardResourceLatitudeBand[];
    maximumLatitudeBandOverrepresentation: number | null;
    sectorRows: number;
    sectorColumns: number;
    sectorCounts: readonly number[];
    sectorEntropy: number;
    maximumSectorEntropy: number;
    normalizedSectorEntropy: number | null;
  }>;
  uniquePlannedTypes: number;
  outcomeCountsByResource: StandardMapCapture["resources"]["summary"]["byResource"];
  outcomeCountsByReason: StandardMapCapture["resources"]["summary"]["byReason"];
  plannedTypeCounts: Readonly<Record<string, number>>;
  placedTypeCounts: Readonly<Record<string, number>>;
  observedTypeCounts: Readonly<Record<string, number>>;
}>;

/** Measures the admitted resource plan against stamped outcomes and observed headless resources. */
export function measureStandardResources(capture: StandardMapCapture): StandardResourceMetrics {
  const plannedTypeCounts: Record<string, number> = {};
  const placedTypeCounts: Record<string, number> = {};
  const observedTypeCounts: Record<string, number> = {};
  const { intentByPlot, outcomeByPlot } = joinResourcePlacementEvidence(capture);
  const placedPlotsByType = new Map<number, number[]>();
  let placedPlotCount = 0;
  let placedInHabitatCount = 0;
  let placedOnWaterCount = 0;
  let intentOutcomeTypeAlignmentCount = 0;
  let placedObservationTypeAlignmentCount = 0;
  let placedHeadlessPolicyLegalityCount = 0;
  const placedInHabitatByPhase = {
    rotation: { count: 0, population: 0 },
    "range-floor": { count: 0, population: 0 },
    "region-minimum": { count: 0, population: 0 },
    support: { count: 0, population: 0 },
  };
  const eligibilityByType = requireCompleteHabitatEvidence(capture);

  for (const intent of capture.resources.intents) {
    const typeId = requireResourceRuntimeId(intent.resourceType).resourceTypeId;
    increment(plannedTypeCounts, typeId);
  }

  for (const outcome of capture.resources.outcomes) {
    const intent = intentByPlot.get(outcome.plotIndex)!;
    intentOutcomeTypeAlignmentCount += 1;
    if (outcome.status !== "placed") continue;
    placedPlotCount += 1;
    increment(placedTypeCounts, outcome.resourceType);
    const plots = placedPlotsByType.get(outcome.resourceType) ?? [];
    plots.push(outcome.plotIndex);
    placedPlotsByType.set(outcome.resourceType, plots);
    const phase = placedInHabitatByPhase[intent.phase];
    phase.population += 1;
    if (eligibilityByType.get(intent.resourceType)![outcome.plotIndex] === 1) {
      placedInHabitatCount += 1;
      phase.count += 1;
    }
    if (capture.observation.isWater[outcome.plotIndex] === 1) placedOnWaterCount += 1;
    if (capture.observation.resource[outcome.plotIndex] === outcome.resourceType) {
      placedObservationTypeAlignmentCount += 1;
    }
    if (outcome.headlessPolicyLegal) placedHeadlessPolicyLegalityCount += 1;
  }

  for (const resource of capture.observation.resource) {
    if (resource !== capture.observation.noResource) increment(observedTypeCounts, resource);
  }

  const spacingFloorByType = new Map<number, number>();
  for (const row of capture.resources.perType) {
    const typeId = requireResourceRuntimeId(row.resourceType).resourceTypeId;
    spacingFloorByType.set(typeId, row.spacingFloorTiles);
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

  const admittedTypeRanges = Object.freeze(
    capture.resources.perType.map((row): StandardResourceRangeMeasurement => {
      const typeId = requireResourceRuntimeId(row.resourceType).resourceTypeId;
      const placedCount = placedPlotsByType.get(typeId)?.length ?? 0;
      return Object.freeze({
        resourceType: row.resourceType,
        placedCount,
        minimumCount: row.minCount,
        authoredTargetCount: row.authoredTargetCount,
        maximumCount: row.maxCount,
        withinRange: placedCount >= row.minCount && placedCount <= row.maxCount,
      });
    })
  );
  const perTypeByResource = new Map<string, StandardMapCapture["resources"]["perType"][number]>();
  for (const row of capture.resources.perType) perTypeByResource.set(row.resourceType, row);
  const candidates = Object.freeze(
    capture.resources.candidates.map((candidate): StandardResourceCandidateMeasurement => {
      const plan = perTypeByResource.get(candidate.resourceType);
      const common = {
        resourceType: candidate.resourceType,
        plannerStatus: candidate.plannerStatus,
        targetIntentCount: candidate.targetIntentCount,
        plannerEligibleTileCount: candidate.plannerEligibleTileCount,
      };
      if (candidate.admission.kind === "admitted") {
        if (!plan) {
          throw new Error(`Admitted resource candidate ${candidate.resourceType} has no plan row.`);
        }
        const typeId = requireResourceRuntimeId(plan.resourceType).resourceTypeId;
        return Object.freeze({
          ...common,
          disposition: "admitted",
          exclusionReason: null,
          plannedCount: plan.plannedCount,
          placedCount: placedPlotsByType.get(typeId)?.length ?? 0,
          shortfalls: Object.freeze(
            plan.shortfalls.map((shortfall) => Object.freeze({ ...shortfall }))
          ),
        });
      }
      if (plan) {
        throw new Error(`Excluded resource candidate ${candidate.resourceType} has a plan row.`);
      }
      if (candidate.admission.kind === "scenario-ineligible") {
        if (candidate.runtimeResourceTypeId === null) {
          throw new Error(
            `Scenario-ineligible candidate ${candidate.resourceType} has no runtime identity.`
          );
        }
        return Object.freeze({
          ...common,
          disposition: "scenario-ineligible",
          exclusionReason: candidate.admission.reason,
          plannedCount: 0,
          placedCount: observedTypeCounts[String(candidate.runtimeResourceTypeId)] ?? 0,
        });
      }
      return Object.freeze({
        ...common,
        disposition: "excluded",
        exclusionReason: candidate.admission.reason,
        plannedCount: 0,
        placedCount:
          candidate.runtimeResourceTypeId === null
            ? null
            : (observedTypeCounts[String(candidate.runtimeResourceTypeId)] ?? 0),
      });
    })
  );

  const geologicalPlots: number[] = [];
  for (const outcome of capture.resources.outcomes) {
    if (outcome.status !== "placed") continue;
    const intent = intentByPlot.get(outcome.plotIndex);
    if (intent?.family === "geological" && intent.laneKind === "land") {
      geologicalPlots.push(outcome.plotIndex);
    }
  }
  const geologicalSpacingFloor = Math.max(
    3,
    ...capture.resources.perType
      .filter((row) => row.family === "geological")
      .map((row) => row.spacingFloorTiles)
  );
  const landPlots: number[] = [];
  for (let plotIndex = 0; plotIndex < capture.model.landMask.length; plotIndex += 1) {
    if (capture.model.landMask[plotIndex] === 1) landPlots.push(plotIndex);
  }

  const totalLandTiles = capture.model.landmasses.reduce(
    (sum, landmass) => sum + landmass.tileCount,
    0
  );
  const placedByLandmass = new Map<number, number>();
  for (const outcome of capture.resources.outcomes) {
    if (outcome.status !== "placed") continue;
    const landmassId = capture.model.landmassIdByTile[outcome.plotIndex] ?? -1;
    if (landmassId >= 0) {
      placedByLandmass.set(landmassId, (placedByLandmass.get(landmassId) ?? 0) + 1);
    }
  }
  const landmassDensityRows = Object.freeze(
    capture.model.landmasses.map((landmass): StandardLandmassResourceDensity => {
      const placedCount = placedByLandmass.get(landmass.id) ?? 0;
      return Object.freeze({
        landmassId: landmass.id,
        tileCount: landmass.tileCount,
        landShare: totalLandTiles > 0 ? landmass.tileCount / totalLandTiles : 0,
        placedCount,
        densityPerHundredTiles:
          landmass.tileCount > 0 ? (placedCount / landmass.tileCount) * 100 : 0,
      });
    })
  );

  const landResourcePlots = capture.resources.outcomes
    .filter(
      (outcome) =>
        outcome.status === "placed" && intentByPlot.get(outcome.plotIndex)?.laneKind === "land"
    )
    .map((outcome) => outcome.plotIndex);
  const minimumLatitude = Math.min(
    capture.provenance.topLatitude,
    capture.provenance.bottomLatitude
  );
  const maximumLatitude = Math.max(
    capture.provenance.topLatitude,
    capture.provenance.bottomLatitude
  );
  const latitudeBandCount = Math.max(
    1,
    Math.ceil((maximumLatitude - minimumLatitude) / LATITUDE_BAND_DEGREES)
  );
  const landTilesByLatitudeBand = new Array<number>(latitudeBandCount).fill(0);
  const resourcesByLatitudeBand = new Array<number>(latitudeBandCount).fill(0);
  const latitudeBandIndex = (plotIndex: number): number => {
    const y = Math.floor(plotIndex / capture.provenance.width);
    const latitude = rowLatitude(
      y,
      capture.provenance.height,
      capture.provenance.topLatitude,
      capture.provenance.bottomLatitude
    );
    return Math.min(
      latitudeBandCount - 1,
      Math.max(0, Math.floor((latitude - minimumLatitude) / LATITUDE_BAND_DEGREES))
    );
  };
  for (const plotIndex of landPlots) landTilesByLatitudeBand[latitudeBandIndex(plotIndex)]! += 1;
  for (const plotIndex of landResourcePlots) {
    resourcesByLatitudeBand[latitudeBandIndex(plotIndex)]! += 1;
  }
  const latitudeBands = Object.freeze(
    landTilesByLatitudeBand.map((landTileCount, index): StandardResourceLatitudeBand => {
      const landShare = landPlots.length > 0 ? landTileCount / landPlots.length : 0;
      const placedCount = resourcesByLatitudeBand[index] ?? 0;
      const resourceShare =
        landResourcePlots.length > 0 ? placedCount / landResourcePlots.length : 0;
      return Object.freeze({
        minimumLatitude: minimumLatitude + index * LATITUDE_BAND_DEGREES,
        maximumLatitude: Math.min(
          maximumLatitude,
          minimumLatitude + (index + 1) * LATITUDE_BAND_DEGREES
        ),
        landTileCount,
        landShare,
        placedCount,
        resourceShare,
        overrepresentation: landShare > 0 ? resourceShare / landShare : null,
      });
    })
  );
  const latitudeOverrepresentation = latitudeBands
    .map((band) => band.overrepresentation)
    .filter((value): value is number => value !== null);

  const sectorCount = DISTRIBUTION_SECTOR_ROWS * DISTRIBUTION_SECTOR_COLUMNS;
  const sectorCounts = new Array<number>(sectorCount).fill(0);
  const sectorHasLand = new Array<boolean>(sectorCount).fill(false);
  const sectorIndex = (plotIndex: number): number => {
    const y = Math.floor(plotIndex / capture.provenance.width);
    const x = plotIndex - y * capture.provenance.width;
    const column = Math.min(
      DISTRIBUTION_SECTOR_COLUMNS - 1,
      Math.floor((x * DISTRIBUTION_SECTOR_COLUMNS) / capture.provenance.width)
    );
    const row = Math.min(
      DISTRIBUTION_SECTOR_ROWS - 1,
      Math.floor((y * DISTRIBUTION_SECTOR_ROWS) / capture.provenance.height)
    );
    return row * DISTRIBUTION_SECTOR_COLUMNS + column;
  };
  for (const plotIndex of landPlots) sectorHasLand[sectorIndex(plotIndex)] = true;
  for (const plotIndex of landResourcePlots) sectorCounts[sectorIndex(plotIndex)]! += 1;
  const sectorEntropy = shannonEntropy(
    sectorCounts.filter((_, index) => sectorHasLand[index] === true)
  );

  const regionMinimums = Object.freeze(
    capture.resources.regionMinimums.map((row): StandardResourceRegionMinimumMeasurement => {
      let adjustedPlannedCount = 0;
      let placedCount = 0;
      let rejectedCount = 0;
      const rejectionReasons = new Map<StandardResourceOutcomeReason, number>();
      for (const intent of capture.resources.intents) {
        if (intent.resourceType !== row.resourceType || intent.regionSlot !== row.regionSlot) {
          continue;
        }
        adjustedPlannedCount += 1;
        const outcome = outcomeByPlot.get(intent.plotIndex)!;
        if (outcome.status === "placed") {
          placedCount += 1;
        } else if (outcome.status === "rejected") {
          rejectedCount += 1;
          const reason = outcome.reason;
          if (!reason) {
            throw new Error(
              `Rejected resource outcome ${outcome.plotIndex}:${outcome.resourceType} has no typed reason.`
            );
          }
          rejectionReasons.set(reason, (rejectionReasons.get(reason) ?? 0) + 1);
        } else {
          throw new Error(
            `Resource outcome ${outcome.plotIndex}:${outcome.resourceType} has forbidden mismatch status.`
          );
        }
      }
      return Object.freeze({
        resourceType: row.resourceType,
        regionSlot: row.regionSlot,
        required: row.required,
        fromRotation: row.fromRotation,
        forced: row.forced,
        plannedShortfall: row.shortfall,
        adjustedPlannedCount,
        placedCount,
        rejectedCount,
        rejectionReasons: Object.freeze(
          [...rejectionReasons]
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([reason, count]) => Object.freeze({ reason, count }))
        ),
        finalShortfall: Math.max(0, row.required - placedCount),
      });
    })
  );

  const summary = capture.resources.summary;
  return Object.freeze({
    plannedCount: summary.plannedCount,
    placedCount: summary.placedCount,
    rejectedCount: summary.rejectedCount,
    mismatchCount: summary.mismatchCount,
    candidateCount: candidates.length,
    demandTypeCount: candidates.filter((candidate) => candidate.disposition === "admitted").length,
    scenarioIneligibleCandidateCount: candidates.filter(
      (candidate) => candidate.disposition === "scenario-ineligible"
    ).length,
    excludedCandidateCount: candidates.filter((candidate) => candidate.disposition === "excluded")
      .length,
    candidates,
    placedInHabitat: measureMetricCount(placedInHabitatCount, placedPlotCount),
    placedOnWater: measureMetricCount(placedOnWaterCount, placedPlotCount),
    intentOutcomeTypeAlignment: measureMetricCount(
      intentOutcomeTypeAlignmentCount,
      capture.resources.outcomes.length
    ),
    placedObservationTypeAlignment: measureMetricCount(
      placedObservationTypeAlignmentCount,
      placedPlotCount
    ),
    placedHeadlessPolicyLegality: measureMetricCount(
      placedHeadlessPolicyLegalityCount,
      placedPlotCount
    ),
    placedInHabitatByPhase: Object.freeze({
      rotation: measureMetricCount(
        placedInHabitatByPhase.rotation.count,
        placedInHabitatByPhase.rotation.population
      ),
      "range-floor": measureMetricCount(
        placedInHabitatByPhase["range-floor"].count,
        placedInHabitatByPhase["range-floor"].population
      ),
      "region-minimum": measureMetricCount(
        placedInHabitatByPhase["region-minimum"].count,
        placedInHabitatByPhase["region-minimum"].population
      ),
      support: measureMetricCount(
        placedInHabitatByPhase.support.count,
        placedInHabitatByPhase.support.population
      ),
    }),
    sameTypeSpacingViolationCount,
    geologicalPairCorrelationAboveSpacing: Object.freeze({
      spacingFloorTiles: geologicalSpacingFloor,
      placedCount: geologicalPlots.length,
      ratioToCompleteSpatialRandomness: pairCorrelationAboveSpacing(
        geologicalPlots,
        landPlots,
        capture.provenance.width,
        geologicalSpacingFloor
      ),
    }),
    admittedTypeRanges,
    admittedWithinAuthoredRange: measureMetricCount(
      admittedTypeRanges.filter((row) => row.withinRange).length,
      admittedTypeRanges.length
    ),
    regionMinimums,
    regionMinimumDispositionPreservation: measureMetricCount(
      regionMinimums.filter((row) => row.finalShortfall <= row.plannedShortfall).length,
      regionMinimums.length
    ),
    postStampRegionMinimumShortfallUnits: regionMinimums.reduce(
      (sum, row) => sum + Math.max(0, row.finalShortfall - row.plannedShortfall),
      0
    ),
    landmassDensityRows,
    landResourceDistribution: Object.freeze({
      latitudeBandDegrees: LATITUDE_BAND_DEGREES,
      latitudeBands,
      maximumLatitudeBandOverrepresentation:
        latitudeOverrepresentation.length > 0 ? Math.max(...latitudeOverrepresentation) : null,
      sectorRows: DISTRIBUTION_SECTOR_ROWS,
      sectorColumns: DISTRIBUTION_SECTOR_COLUMNS,
      sectorCounts: Object.freeze(sectorCounts),
      sectorEntropy: sectorEntropy.entropy,
      maximumSectorEntropy: sectorEntropy.maximum,
      normalizedSectorEntropy:
        sectorEntropy.maximum > 0 ? sectorEntropy.entropy / sectorEntropy.maximum : null,
    }),
    uniquePlannedTypes: summary.byResource.filter((row) => row.plannedCount > 0).length,
    outcomeCountsByResource: summary.byResource,
    outcomeCountsByReason: summary.byReason,
    plannedTypeCounts: Object.freeze(plannedTypeCounts),
    placedTypeCounts: Object.freeze(placedTypeCounts),
    observedTypeCounts: Object.freeze(observedTypeCounts),
  });
}

function joinResourcePlacementEvidence(capture: StandardMapCapture): Readonly<{
  intentByPlot: ReadonlyMap<number, StandardMapCapture["resources"]["intents"][number]>;
  outcomeByPlot: ReadonlyMap<number, StandardMapCapture["resources"]["outcomes"][number]>;
}> {
  const intentByPlot = new Map<number, StandardMapCapture["resources"]["intents"][number]>();
  for (const intent of capture.resources.intents) {
    if (intentByPlot.has(intent.plotIndex)) {
      throw new Error(`Resource plan contains duplicate intents for plot ${intent.plotIndex}.`);
    }
    intentByPlot.set(intent.plotIndex, intent);
  }

  const outcomeByPlot = new Map<number, StandardMapCapture["resources"]["outcomes"][number]>();
  for (const outcome of capture.resources.outcomes) {
    if (outcomeByPlot.has(outcome.plotIndex)) {
      throw new Error(
        `Resource placement contains duplicate outcomes for plot ${outcome.plotIndex}.`
      );
    }
    const intent = intentByPlot.get(outcome.plotIndex);
    if (!intent) {
      throw new Error(
        `Resource placement contains an extra outcome for plot ${outcome.plotIndex}.`
      );
    }
    const plannedTypeId = requireResourceRuntimeId(intent.resourceType).resourceTypeId;
    if (outcome.resourceType !== plannedTypeId) {
      throw new Error(
        `Resource outcome type ${outcome.resourceType} does not match planned ${intent.resourceType} (${plannedTypeId}) on plot ${outcome.plotIndex}.`
      );
    }
    outcomeByPlot.set(outcome.plotIndex, outcome);
  }

  for (const intent of capture.resources.intents) {
    if (!outcomeByPlot.has(intent.plotIndex)) {
      throw new Error(
        `Resource placement is missing an outcome for planned plot ${intent.plotIndex}.`
      );
    }
  }
  return { intentByPlot, outcomeByPlot };
}

function requireCompleteHabitatEvidence(
  capture: StandardMapCapture
): ReadonlyMap<string, Uint8Array> {
  const plannedTypes = new Set<string>();
  for (const row of capture.resources.perType) {
    if (plannedTypes.has(row.resourceType)) {
      throw new Error(
        `Resource plan contains duplicate per-type evidence for ${row.resourceType}.`
      );
    }
    plannedTypes.add(row.resourceType);
  }

  const eligibilityByType = new Map<string, Uint8Array>();
  for (const row of capture.resources.eligibility) {
    if (eligibilityByType.has(row.resourceType)) {
      throw new Error(`Resource habitat evidence contains duplicate rows for ${row.resourceType}.`);
    }
    if (!plannedTypes.has(row.resourceType)) {
      throw new Error(`Resource habitat evidence contains extra row ${row.resourceType}.`);
    }
    eligibilityByType.set(row.resourceType, row.habitatMask);
  }
  for (const resourceType of plannedTypes) {
    if (!eligibilityByType.has(resourceType)) {
      throw new Error(`Resource habitat evidence is missing planned type ${resourceType}.`);
    }
  }
  return eligibilityByType;
}

function increment(counts: Record<string, number>, key: string | number): void {
  const normalized = String(key);
  counts[normalized] = (counts[normalized] ?? 0) + 1;
}

function pairCorrelationAboveSpacing(
  plots: readonly number[],
  landPlots: readonly number[],
  width: number,
  spacingFloorTiles: number
): number | null {
  if (plots.length < 4 || landPlots.length === 0) return null;
  const maximumRadius = spacingFloorTiles + PAIR_CORRELATION_ANNULUS_WIDTH_TILES;
  let observedPairs = 0;
  for (let left = 0; left < plots.length; left += 1) {
    for (let right = left + 1; right < plots.length; right += 1) {
      const distance = hexDistanceOddQPeriodicX(plots[left]!, plots[right]!, width);
      if (distance > spacingFloorTiles && distance <= maximumRadius) observedPairs += 1;
    }
  }

  let annulusPairs = 0;
  let sampledPairs = 0;
  for (const plot of plots) {
    for (const landPlot of landPlots) {
      if (landPlot === plot) continue;
      sampledPairs += 1;
      const distance = hexDistanceOddQPeriodicX(plot, landPlot, width);
      if (distance > spacingFloorTiles && distance <= maximumRadius) annulusPairs += 1;
    }
  }
  if (sampledPairs === 0) return null;
  const expectedPairs = ((plots.length * (plots.length - 1)) / 2) * (annulusPairs / sampledPairs);
  return expectedPairs > 0 ? observedPairs / expectedPairs : null;
}

function rowLatitude(
  y: number,
  height: number,
  topLatitude: number,
  bottomLatitude: number
): number {
  if (height <= 1) return (topLatitude + bottomLatitude) / 2;
  return topLatitude + ((bottomLatitude - topLatitude) * y) / (height - 1);
}

function shannonEntropy(counts: readonly number[]): Readonly<{ entropy: number; maximum: number }> {
  const total = counts.reduce((sum, count) => sum + count, 0);
  const maximum = counts.length > 1 ? Math.log(counts.length) : 0;
  if (total <= 0 || maximum === 0) return Object.freeze({ entropy: 0, maximum });
  let entropy = 0;
  for (const count of counts) {
    if (count <= 0) continue;
    const share = count / total;
    entropy -= share * Math.log(share);
  }
  return Object.freeze({ entropy, maximum });
}
