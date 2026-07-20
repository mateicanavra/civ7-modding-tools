import {
  getHexNeighborIndicesOddQ,
  getHexRadiusIndicesOddQ,
  hexDistanceOddQPeriodicX,
} from "@swooper/mapgen-core/lib/grid";
import {
  type CountMetric,
  measureMetricCount,
  type NumericMetricSummary,
  summarizeNumericMetrics,
} from "@swooper/mapgen-metrics";
import type { NonEmptyTuple } from "type-fest";

import type { StandardMapCapture } from "../capture.js";

const FERTILITY_RADIUS_TILES = 2;
const CLIMATE_TAIL_SHARE = 0.1;

/** Completed player allocation and seating evidence for one authored homeland slot. */
export type StandardHomelandRegionMeasurement = Readonly<{
  regionSlot: 1 | 2;
  landTileCount: number;
  requestedStartCount: number;
  realizedStartCount: number;
  landShare: number | null;
  requestedStartShare: number | null;
  realizedStartShare: number | null;
  realizedShareGap: number | null;
}>;

/** Completed seating share relative to modeled land area on one landmass. */
export type StandardStartLandmassMeasurement = Readonly<{
  landmassId: number;
  landTileCount: number;
  seatedStartCount: number;
  landShare: number | null;
  startShare: number | null;
  startShareExcess: number | null;
}>;

/** Nearest-neighbor dispersion relative to even spacing over the modeled land area. */
export type StandardStartSpreadMeasurement = Readonly<{
  startCount: number;
  landTileCount: number;
  meanNearestNeighborSpacing: number;
  minimumNearestNeighborSpacing: number;
  idealEvenSpacing: number;
  index: number;
}>;

/**
 * Neutral measurements of completed Standard player seating and its physical surroundings.
 * Counts retain their populations, nullable summaries mean the map had too few seats for that
 * relationship, and no product threshold is embedded in the measurement.
 */
export type StandardPlacementMetrics = Readonly<{
  expectedPlayers: number;
  aliveMajorCount: number;
  assigned: number;
  unseatedCount: number;
  missingAlivePlayerCount: number;
  unexpectedPlayerCount: number;
  duplicatePlayerCount: number;
  slotIndexPlayerCount: number;
  illegalStarts: CountMetric;
  startsOnWater: CountMetric;
  startsOnLakes: CountMetric;
  startsOnMountains: CountMetric;
  startsOnVolcanoes: CountMetric;
  startsOnNaturalWonders: CountMetric;
  freshwaterAccess: CountMetric;
  landFertility: NumericMetricSummary;
  startFertility: NumericMetricSummary | null;
  startFertilityAdvantage: number | null;
  pairwiseStartSpacing: NumericMetricSummary | null;
  worstPairScoreGap: number | null;
  fallbackAssignments: CountMetric;
  regionRelaxations: CountMetric;
  unacknowledgedDegradationCount: number;
  homelandDistribution: Readonly<{
    regions: readonly StandardHomelandRegionMeasurement[];
    maximumRegionShareGap: number | null;
    unclassifiedRegionStartCount: number;
    landmasses: readonly StandardStartLandmassMeasurement[];
    maximumStartShareLandmass: StandardStartLandmassMeasurement | null;
    unclassifiedLandmassStartCount: number;
    globalSpread: StandardStartSpreadMeasurement | null;
    regionalSpread: readonly Readonly<{
      regionSlot: 1 | 2;
      spread: StandardStartSpreadMeasurement | null;
    }>[];
  }>;
  climateExtremeStarts: CountMetric;
  support: Readonly<{
    radiusTiles: number;
    configuredFloor: number;
    configuredEquityTolerance: number;
    realizedCounts: NumericMetricSummary | null;
    realizedGap: number | null;
    startsBelowConfiguredFloor: CountMetric;
    recordedSupportShortfallUnits: number;
  }>;
}>;

/**
 * Measures the copied start artifact against copied physical fields and final resource outcomes.
 * Artifact admission already proves row alignment; this projection adds only reusable map-product
 * facts such as exact seat identity, legality, fertility, spacing, climate, and realized support.
 */
export function measureStandardPlacement(capture: StandardMapCapture): StandardPlacementMetrics {
  const { width, height } = capture.provenance;
  const seats = capture.placement.seats.filter((seat) => seat.plotIndex >= 0);
  const startPlots = seats.map((seat) => seat.plotIndex);
  const wonderPlots = new Set(capture.placement.naturalWonderPlotIndices);
  const alivePlayers = new Set(capture.placement.aliveMajorIds);
  const seatedPlayerIds = seats.map((seat) => seat.playerId);
  const uniqueSeatedPlayers = new Set(seatedPlayerIds);

  let illegalCount = 0;
  let waterCount = 0;
  let lakeCount = 0;
  let mountainCount = 0;
  let volcanoCount = 0;
  let wonderCount = 0;
  let freshwaterCount = 0;
  for (const plotIndex of startPlots) {
    const y = Math.floor(plotIndex / width);
    const x = plotIndex - y * width;
    const onWater = capture.observation.isWater[plotIndex] === 1;
    const onLake = capture.observation.isLake[plotIndex] === 1;
    const onMountain =
      capture.observation.terrain[plotIndex] === capture.observation.mountainTerrain;
    const onVolcano = capture.observation.feature[plotIndex] === capture.observation.volcanoFeature;
    const onWonder = wonderPlots.has(plotIndex);
    if (onWater) waterCount += 1;
    if (onLake) lakeCount += 1;
    if (onMountain) mountainCount += 1;
    if (onVolcano) volcanoCount += 1;
    if (onWonder) wonderCount += 1;
    if (onWater || onLake || onMountain || onVolcano || onWonder) illegalCount += 1;

    const freshwaterNeighborhood = [plotIndex, ...getHexNeighborIndicesOddQ(x, y, width, height)];
    if (
      freshwaterNeighborhood.some(
        (neighbor) =>
          (capture.model.riverClass[neighbor] ?? 0) > 0 ||
          capture.observation.isLake[neighbor] === 1
      )
    ) {
      freshwaterCount += 1;
    }
  }

  const landFertilityValues: number[] = [];
  for (let index = 0; index < capture.model.landMask.length; index += 1) {
    if (capture.model.landMask[index] === 1)
      landFertilityValues.push(capture.model.fertility[index]!);
  }
  const startFertilityValues = startPlots.map((plotIndex) => {
    const neighborhood = getHexRadiusIndicesOddQ(
      plotIndex,
      width,
      height,
      FERTILITY_RADIUS_TILES
    ).filter((index) => capture.model.landMask[index] === 1);
    return mean(
      requireNonEmpty(
        neighborhood.map((index) => capture.model.fertility[index]!),
        "start fertility"
      )
    );
  });
  const landFertility = summarizeNumericMetrics(
    requireNonEmpty(landFertilityValues, "land fertility")
  );
  const startFertility = summarizeOptional(startFertilityValues);
  const startFertilityAdvantage =
    startFertility !== null && landFertility.mean > 0
      ? startFertility.mean / landFertility.mean
      : null;

  const pairwiseDistances: number[] = [];
  for (let left = 0; left < startPlots.length; left += 1) {
    for (let right = left + 1; right < startPlots.length; right += 1) {
      pairwiseDistances.push(
        hexDistanceOddQPeriodicX(startPlots[left]!, startPlots[right]!, width)
      );
    }
  }

  const landAridity: number[] = [];
  const landTemperature: number[] = [];
  for (let index = 0; index < capture.model.landMask.length; index += 1) {
    if (capture.model.landMask[index] !== 1) continue;
    landAridity.push(capture.model.aridityIndex[index]!);
    landTemperature.push(capture.model.surfaceTemperature[index]!);
  }
  landAridity.sort((left, right) => left - right);
  landTemperature.sort((left, right) => left - right);
  const aridityUpper = quantile(
    requireNonEmpty(landAridity, "land aridity"),
    1 - CLIMATE_TAIL_SHARE
  );
  const temperatureLower = quantile(
    requireNonEmpty(landTemperature, "land temperature"),
    CLIMATE_TAIL_SHARE
  );
  const temperatureUpper = quantile(
    requireNonEmpty(landTemperature, "land temperature"),
    1 - CLIMATE_TAIL_SHARE
  );
  const climateExtremeCount = startPlots.filter((plotIndex) => {
    const aridity = capture.model.aridityIndex[plotIndex]!;
    const temperature = capture.model.surfaceTemperature[plotIndex]!;
    return (
      aridity >= aridityUpper || temperature <= temperatureLower || temperature >= temperatureUpper
    );
  }).length;

  const fallbackCount = seats.filter((seat) => seat.rung !== "regional").length;
  const regionRelaxedSeats = new Set(
    capture.placement.fairnessReport.relaxations
      .filter((relaxation) => relaxation.kind === "region")
      .map((relaxation) => relaxation.seatIndex)
  );
  const seatedRegionClassifications = classifySeatedRegions(capture, seats);
  const unacknowledgedDegradationCount = capture.placement.seats.filter(
    (seat) =>
      (seat.plotIndex < 0 || seat.rung !== "regional" || regionRelaxedSeats.has(seat.seatIndex)) &&
      seat.status !== "degraded"
  ).length;

  const placedResources = new Set(
    capture.resources.outcomes
      .filter((outcome) => outcome.status === "placed")
      .map((outcome) => outcome.plotIndex)
  );
  const supportCounts = startPlots.map((plotIndex) => {
    let count = 0;
    for (const nearby of getHexRadiusIndicesOddQ(
      plotIndex,
      width,
      height,
      capture.resources.support.settings.supportRadiusTiles
    )) {
      if (placedResources.has(nearby)) count += 1;
    }
    return count;
  });
  const supportSummary = summarizeOptional(supportCounts);
  const supportGap = supportSummary ? supportSummary.maximum - supportSummary.minimum : null;
  const configuredSupportFloor = capture.resources.support.settings.supportFloor;
  const homelandDistribution = measureHomelandDistribution(capture, seatedRegionClassifications);

  return Object.freeze({
    expectedPlayers: capture.provenance.playerCount,
    aliveMajorCount: capture.placement.aliveMajorIds.length,
    assigned: capture.placement.assigned,
    unseatedCount: capture.placement.unseatedCount,
    missingAlivePlayerCount: capture.placement.aliveMajorIds.filter(
      (playerId) => !uniqueSeatedPlayers.has(playerId)
    ).length,
    unexpectedPlayerCount: [...uniqueSeatedPlayers].filter(
      (playerId) => !alivePlayers.has(playerId)
    ).length,
    duplicatePlayerCount: seatedPlayerIds.length - uniqueSeatedPlayers.size,
    slotIndexPlayerCount: seats.filter((seat) => seat.playerIdSource === "slot-index").length,
    illegalStarts: measureMetricCount(illegalCount, seats.length),
    startsOnWater: measureMetricCount(waterCount, seats.length),
    startsOnLakes: measureMetricCount(lakeCount, seats.length),
    startsOnMountains: measureMetricCount(mountainCount, seats.length),
    startsOnVolcanoes: measureMetricCount(volcanoCount, seats.length),
    startsOnNaturalWonders: measureMetricCount(wonderCount, seats.length),
    freshwaterAccess: measureMetricCount(freshwaterCount, seats.length),
    landFertility,
    startFertility,
    startFertilityAdvantage,
    pairwiseStartSpacing: summarizeOptional(pairwiseDistances),
    worstPairScoreGap: capture.placement.fairnessReport.worstPairGap,
    fallbackAssignments: measureMetricCount(fallbackCount, seats.length),
    regionRelaxations: measureMetricCount(
      seats.filter((seat) => regionRelaxedSeats.has(seat.seatIndex)).length,
      seats.length
    ),
    unacknowledgedDegradationCount,
    homelandDistribution,
    climateExtremeStarts: measureMetricCount(climateExtremeCount, seats.length),
    support: Object.freeze({
      radiusTiles: capture.resources.support.settings.supportRadiusTiles,
      configuredFloor: configuredSupportFloor,
      configuredEquityTolerance: capture.resources.support.settings.equityTolerance,
      realizedCounts: supportSummary,
      realizedGap: supportGap,
      startsBelowConfiguredFloor: measureMetricCount(
        supportCounts.filter((count) => count < configuredSupportFloor).length,
        supportCounts.length
      ),
      recordedSupportShortfallUnits: capture.resources.support.shortfalls.reduce(
        (sum, shortfall) => sum + shortfall.missing,
        0
      ),
    }),
  });
}

type SeatedRegionClassification = Readonly<{
  seat: StandardMapCapture["placement"]["seats"][number];
  requestedRegionSlot: 1 | 2;
  realizedRegionSlot: 1 | 2;
}>;

function classifySeatedRegions(
  capture: StandardMapCapture,
  seats: readonly StandardMapCapture["placement"]["seats"][number][]
): readonly SeatedRegionClassification[] {
  return Object.freeze(
    seats.map((seat): SeatedRegionClassification => {
      const requestedRegionSlot = requireHomelandSlot(
        seat.regionSlot,
        `requested region for seat ${seat.seatIndex}`
      );
      const realizedRegionSlot = requireHomelandSlot(
        seat.realizedRegionSlot,
        `realized region for seat ${seat.seatIndex}`
      );
      const physicalRegionSlot = requireHomelandSlot(
        capture.model.regionSlotByTile[seat.plotIndex],
        `physical region at seat ${seat.seatIndex} plot ${seat.plotIndex}`
      );
      if (realizedRegionSlot !== physicalRegionSlot) {
        throw new Error(
          `Seat ${seat.seatIndex} declares realized region ${realizedRegionSlot}, but plot ${seat.plotIndex} is physically in region ${physicalRegionSlot}.`
        );
      }
      return Object.freeze({ seat, requestedRegionSlot, realizedRegionSlot });
    })
  );
}

function measureHomelandDistribution(
  capture: StandardMapCapture,
  classifications: readonly SeatedRegionClassification[]
): StandardPlacementMetrics["homelandDistribution"] {
  const regionSlots = [1, 2] as const;
  const startPlots = classifications.map(({ seat }) => seat.plotIndex);
  const totalLandTiles = capture.model.landmasses.reduce(
    (sum, landmass) => sum + landmass.tileCount,
    0
  );
  const regions = Object.freeze(
    regionSlots.map((regionSlot): StandardHomelandRegionMeasurement => {
      let landTileCount = 0;
      for (let index = 0; index < capture.model.landMask.length; index += 1) {
        if (
          capture.model.landMask[index] === 1 &&
          capture.model.regionSlotByTile[index] === regionSlot
        ) {
          landTileCount += 1;
        }
      }
      const requestedStartCount = classifications.filter(
        (classification) => classification.requestedRegionSlot === regionSlot
      ).length;
      const realizedStartCount = classifications.filter(
        (classification) => classification.realizedRegionSlot === regionSlot
      ).length;
      const landShare = totalLandTiles > 0 ? landTileCount / totalLandTiles : null;
      const requestedStartShare =
        startPlots.length > 0 ? requestedStartCount / startPlots.length : null;
      const realizedStartShare =
        startPlots.length > 0 ? realizedStartCount / startPlots.length : null;
      return Object.freeze({
        regionSlot,
        landTileCount,
        requestedStartCount,
        realizedStartCount,
        landShare,
        requestedStartShare,
        realizedStartShare,
        realizedShareGap:
          realizedStartShare !== null && landShare !== null
            ? Math.abs(realizedStartShare - landShare)
            : null,
      });
    })
  );

  const startsByLandmass = new Map<number, number>();
  const catalogLandmassIds = new Set(capture.model.landmasses.map(({ id }) => id));
  for (const plotIndex of startPlots) {
    const landmassId = capture.model.landmassIdByTile[plotIndex] ?? -1;
    if (catalogLandmassIds.has(landmassId)) {
      startsByLandmass.set(landmassId, (startsByLandmass.get(landmassId) ?? 0) + 1);
    }
  }
  const classifiedStartCount = [...startsByLandmass.values()].reduce(
    (sum, count) => sum + count,
    0
  );
  const landmasses = Object.freeze(
    capture.model.landmasses.map(({ id, tileCount }): StandardStartLandmassMeasurement => {
      const seatedStartCount = startsByLandmass.get(id) ?? 0;
      const landShare = totalLandTiles > 0 ? tileCount / totalLandTiles : null;
      const startShare = startPlots.length > 0 ? seatedStartCount / startPlots.length : null;
      return Object.freeze({
        landmassId: id,
        landTileCount: tileCount,
        seatedStartCount,
        landShare,
        startShare,
        startShareExcess: startShare !== null && landShare !== null ? startShare - landShare : null,
      });
    })
  );
  let maximumStartShareLandmass: StandardStartLandmassMeasurement | null = null;
  for (const row of landmasses) {
    if (row.startShare === null) continue;
    if (
      maximumStartShareLandmass === null ||
      maximumStartShareLandmass.startShare === null ||
      row.startShare > maximumStartShareLandmass.startShare
    ) {
      maximumStartShareLandmass = row;
    }
  }

  const globalSpread = measureStartSpread(startPlots, totalLandTiles, capture.provenance.width);
  const regionShareGaps = regions
    .map((region) => region.realizedShareGap)
    .filter((gap): gap is number => gap !== null);

  return Object.freeze({
    regions,
    maximumRegionShareGap: regionShareGaps.length > 0 ? Math.max(...regionShareGaps) : null,
    unclassifiedRegionStartCount:
      startPlots.length - regions.reduce((sum, region) => sum + region.realizedStartCount, 0),
    landmasses,
    maximumStartShareLandmass,
    unclassifiedLandmassStartCount: startPlots.length - classifiedStartCount,
    globalSpread,
    regionalSpread: Object.freeze(
      regionSlots.map((regionSlot) => {
        const regionStarts = startPlots.filter(
          (plotIndex) => capture.model.regionSlotByTile[plotIndex] === regionSlot
        );
        const regionMeasurement = regions.find((row) => row.regionSlot === regionSlot);
        if (!regionMeasurement) {
          throw new Error(`Standard placement metrics are missing region slot ${regionSlot}.`);
        }
        return Object.freeze({
          regionSlot,
          spread: measureStartSpread(
            regionStarts,
            regionMeasurement.landTileCount,
            capture.provenance.width
          ),
        });
      })
    ),
  });
}

function requireHomelandSlot(value: number | undefined, label: string): 1 | 2 {
  if (value !== 1 && value !== 2) {
    throw new Error(`Standard placement metrics require ${label} to be homeland region 1 or 2.`);
  }
  return value;
}

function measureStartSpread(
  plots: readonly number[],
  landTileCount: number,
  width: number
): StandardStartSpreadMeasurement | null {
  if (plots.length < 2 || landTileCount === 0) return null;
  const nearestNeighborDistances = plots.map((plot, index) => {
    let nearest = Number.POSITIVE_INFINITY;
    for (let otherIndex = 0; otherIndex < plots.length; otherIndex += 1) {
      if (index === otherIndex) continue;
      nearest = Math.min(nearest, hexDistanceOddQPeriodicX(plot, plots[otherIndex]!, width));
    }
    return nearest;
  });
  const summary = summarizeNumericMetrics(
    requireNonEmpty(nearestNeighborDistances, "start dispersion")
  );
  const idealEvenSpacing = Math.sqrt(landTileCount / plots.length);
  return Object.freeze({
    startCount: plots.length,
    landTileCount,
    meanNearestNeighborSpacing: summary.mean,
    minimumNearestNeighborSpacing: summary.minimum,
    idealEvenSpacing,
    index: summary.mean / idealEvenSpacing,
  });
}

function requireNonEmpty(values: readonly number[], label: string): NonEmptyTuple<number> {
  const [first, ...rest] = values;
  if (first === undefined) throw new Error(`Standard placement metrics require ${label} evidence.`);
  return [first, ...rest];
}

function summarizeOptional(values: readonly number[]): NumericMetricSummary | null {
  return values.length === 0 ? null : summarizeNumericMetrics(requireNonEmpty(values, "numeric"));
}

function mean(values: NonEmptyTuple<number>): number {
  return summarizeNumericMetrics(values).mean;
}

function quantile(sorted: NonEmptyTuple<number>, proportion: number): number {
  const position = (sorted.length - 1) * proportion;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const lower = sorted[lowerIndex]!;
  const upper = sorted[upperIndex]!;
  return lower + (upper - lower) * (position - lowerIndex);
}
