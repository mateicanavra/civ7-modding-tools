import type { CountMetric, MetricTarget, NumericMetricSummary } from "@swooper/mapgen-metrics";

import type { StandardReliefCoherenceMetrics } from "../families/relief-coherence.js";
import type { StandardMapMetricCohort, StandardMapProductSample } from "../sample.js";
import { equalTo } from "./support.js";

/** Matched configuration, size, and seed axes; this protocol imposes no terrain goodness bounds. */
export const RELIEF_COHERENCE_COHORT_IDENTITY = {
  configurationIds: ["swooper-earthlike", "mountain-patch"],
  mapSizeIds: ["MAPSIZE_STANDARD", "MAPSIZE_HUGE"],
  seeds: [1, 42, 1018],
} as const;

/** Evidence accounting only: diagnostic magnitudes and signs remain observations, not gates. */
export const RELIEF_COHERENCE_COHORT_TARGET = {
  id: "shipped/relief-coherence-accounting",
  description: "The matched relief cohort is complete and its diagnostic populations are valid.",
  expectations: [
    equalTo<StandardMapMetricCohort>(
      "exact-cohort-coverage",
      "Each configured size and seed pair occurs exactly once.",
      exactCoverage,
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "disjoint-land-group-accounting",
      "Planned and observed groups each exhaust their own land population.",
      (samples) => samples.every(validGroupAccounting),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "valid-diagnostic-populations",
      "Coast, climate, and river diagnostics retain valid populations and nullable statistics.",
      (samples) => samples.every((sample) => validDiagnostics(sample.metrics.relief.coherence)),
      true
    ),
  ],
} satisfies MetricTarget<StandardMapMetricCohort>;

function exactCoverage(samples: StandardMapMetricCohort): boolean {
  const expected = RELIEF_COHERENCE_COHORT_IDENTITY.configurationIds.flatMap((configurationId) =>
    RELIEF_COHERENCE_COHORT_IDENTITY.mapSizeIds.flatMap((mapSizeId) =>
      RELIEF_COHERENCE_COHORT_IDENTITY.seeds.map(
        (seed) => `${configurationId}/${mapSizeId}/${seed}/${seed}`
      )
    )
  );
  const observed = samples.map(
    ({ provenance: p }) => `${p.configurationId}/${p.mapSizeId}/${p.mapSeed}/${p.gameSeed}`
  );
  return (
    samples.length === expected.length &&
    new Set(observed).size === expected.length &&
    expected.every((key) => observed.includes(key)) &&
    samples.every(
      ({ provenance: p }) =>
        p.mapKind === "civ7-preset" &&
        p.recipeId === "standard" &&
        (p.mapSizeId === "MAPSIZE_STANDARD"
          ? p.width === 84 && p.height === 54
          : p.width === 106 && p.height === 66)
    )
  );
}

function validGroupAccounting(sample: StandardMapProductSample): boolean {
  const coherence = sample.metrics.relief.coherence;
  return (
    coherence.plannedLandTiles === sample.metrics.geography.plannedLand.count &&
    coherence.observedLandTiles === sample.metrics.geography.realizedLand.count &&
    validReliefGroups(Object.values(coherence.planned), coherence.plannedLandTiles) &&
    validReliefGroups(Object.values(coherence.observed), coherence.observedLandTiles)
  );
}

type ReliefGroup = StandardReliefCoherenceMetrics["planned"]["mountain"];

function validReliefGroups(groups: readonly ReliefGroup[], population: number): boolean {
  return (
    groups.reduce((sum, group) => sum + group.tiles.count, 0) === population &&
    groups.every(
      (group) =>
        validCount(group.tiles) &&
        group.tiles.population === population &&
        validSummary(group.aboveSeaHeight, group.tiles.count, true) &&
        validSummary(group.localRelief, group.tiles.count) &&
        validSummary(group.localProminenceProxy, group.tiles.count) &&
        (group.localRelief?.count ?? 0) === (group.localProminenceProxy?.count ?? 0) &&
        Object.values(group.representatives).every(
          (tiles) =>
            tiles.length <= Math.min(5, group.tiles.count) &&
            new Set(tiles.map((t) => t.index)).size === tiles.length &&
            tiles.every(
              (t) =>
                Number.isSafeInteger(t.index) && t.index >= 0 && Number.isFinite(t.aboveSeaHeight)
            )
        )
    )
  );
}

function validDiagnostics(metrics: StandardReliefCoherenceMetrics): boolean {
  for (const coast of Object.values(metrics.coastalProxies)) {
    if (
      !validCount(coast.coastalLand) ||
      !validReliefGroups(Object.values(coast.landByAdjacency), coast.coastalLand.count)
    )
      return false;
    for (const edge of [coast.lakeEdges, coast.marineEdges, coast.otherWaterEdges]) {
      if (!validEdgeContrast(edge)) return false;
    }
  }
  for (const edge of Object.values(metrics.edgeContrasts)) {
    if (!validEdgeContrast(edge)) return false;
  }
  const lakes = metrics.plannedLakeOverlap;
  if (
    !validCount(lakes.tiles) ||
    !validCount(lakes.volcanoTiles) ||
    lakes.volcanoTiles.population !== lakes.tiles.count ||
    !Object.values(lakes.byPlannedClass).every(
      (c) => validCount(c) && c.population === lakes.tiles.count
    ) ||
    Object.values(lakes.byPlannedClass).reduce((sum, c) => sum + c.count, 0) !== lakes.tiles.count
  )
    return false;
  const temperature = metrics.withinRowElevationTemperature;
  if (
    !validAssociation(temperature, metrics.plannedLandTiles) ||
    !Number.isSafeInteger(temperature.contributingRows) ||
    temperature.contributingRows < 0
  )
    return false;
  const wind = metrics.windRainfallAssociation;
  const groups = Object.values(wind.groups);
  if (groups.reduce((sum, group) => sum + group.tiles.count, 0) !== metrics.plannedLandTiles)
    return false;
  if (
    !groups.every(
      (group) =>
        validCount(group.tiles) &&
        group.tiles.population === metrics.plannedLandTiles &&
        validSummary(group.alignedGradient, group.tiles.count) &&
        validSummary(group.baselineRainfallRowResidual, group.tiles.count, true) &&
        validSummary(group.refinedRainfallRowResidual, group.tiles.count, true) &&
        group.representatives.length <= Math.min(5, group.tiles.count)
    )
  )
    return false;
  const scoredWind =
    wind.groups.uphill.tiles.count +
    wind.groups.downhill.tiles.count +
    wind.groups.zero.tiles.count;
  if (
    !validAssociation(wind.baseline, scoredWind) ||
    !validAssociation(wind.refined, scoredWind) ||
    wind.baseline.pairCount !== scoredWind ||
    wind.refined.pairCount !== scoredWind
  )
    return false;
  const river = metrics.authoredRiverEdges;
  if (
    ![river.terminalTiles, river.invalidReceiverTiles, river.validReceiverTiles].every(
      (count) => validCount(count) && count.population === river.authoredTiles
    ) ||
    river.terminalTiles.count +
      river.invalidReceiverTiles.count +
      river.validReceiverTiles.count !==
      river.authoredTiles
  )
    return false;
  if (
    !validCount(river.finiteDropEdges) ||
    river.finiteDropEdges.population !== river.validReceiverTiles.count ||
    !validSummary(river.physicalReceiverMinusSource, river.finiteDropEdges.count, true) ||
    !validSummary(river.routingReceiverMinusSource, river.finiteDropEdges.count, true) ||
    !validCount(river.physicalUphill) ||
    river.physicalUphill.population !== river.finiteDropEdges.count
  )
    return false;
  for (const partition of [
    [river.physicalUphill, river.physicalLevel, river.physicalDownhill],
    [river.routingUphill, river.routingLevel, river.routingDownhill],
  ]) {
    if (
      !partition.every((c) => validCount(c) && c.population === river.finiteDropEdges.count) ||
      partition.reduce((sum, c) => sum + c.count, 0) !== river.finiteDropEdges.count
    )
      return false;
  }
  for (const byClass of [
    river.physicalUphillByPlannedClass,
    river.physicalUphillByObservedClass,
    river.physicalUphillByLakeClass,
  ]) {
    const counts = Object.values(byClass);
    if (
      !counts.every(validCount) ||
      counts.reduce((sum, c) => sum + c.population, 0) !== river.finiteDropEdges.count ||
      counts.reduce((sum, c) => sum + c.count, 0) !== river.physicalUphill.count
    )
      return false;
  }
  return (
    Object.values(river.lakeOverlap).every(
      (c) => validCount(c) && c.population === river.finiteDropEdges.count
    ) &&
    Object.values(river.lakeOverlap).reduce((sum, c) => sum + c.count, 0) ===
      river.finiteDropEdges.count
  );
}

function validEdgeContrast(
  edge: StandardReliefCoherenceMetrics["edgeContrasts"]["plannedMountainFoothill"]
): boolean {
  const counts = [edge.sourceAboveReceiver, edge.sourceEqualReceiver, edge.sourceBelowReceiver];
  return (
    validSummary(edge.signedHeightDifference, edge.edgeCount, true) &&
    edge.representatives.length <= Math.min(5, edge.edgeCount) &&
    counts.every((c) => validCount(c) && c.population === edge.edgeCount) &&
    counts.reduce((sum, c) => sum + c.count, 0) === edge.edgeCount
  );
}

function validCount(value: CountMetric): boolean {
  return (
    Number.isSafeInteger(value.count) &&
    Number.isSafeInteger(value.population) &&
    value.count >= 0 &&
    value.count <= value.population
  );
}

function validSummary(
  summary: NumericMetricSummary | null,
  maximumCount: number,
  exact = false
): boolean {
  if (!Number.isSafeInteger(maximumCount) || maximumCount < 0) return false;
  if (summary === null) return !exact || maximumCount === 0;
  return (
    Number.isSafeInteger(summary.count) &&
    summary.count > 0 &&
    summary.count <= maximumCount &&
    (!exact || summary.count === maximumCount) &&
    [summary.minimum, summary.maximum, summary.mean].every(Number.isFinite) &&
    summary.minimum <= summary.maximum &&
    summary.mean >= summary.minimum - 1e-9 &&
    summary.mean <= summary.maximum + 1e-9
  );
}

function validAssociation(
  value: { pairCount: number; slope: number | null; pearson: number | null },
  maximumCount: number
): boolean {
  return (
    Number.isSafeInteger(value.pairCount) &&
    value.pairCount >= 0 &&
    value.pairCount <= maximumCount &&
    (value.slope === null
      ? value.pearson === null
      : value.pairCount >= 2 &&
        Number.isFinite(value.slope) &&
        value.pearson !== null &&
        Number.isFinite(value.pearson) &&
        Math.abs(value.pearson) <= 1)
  );
}
