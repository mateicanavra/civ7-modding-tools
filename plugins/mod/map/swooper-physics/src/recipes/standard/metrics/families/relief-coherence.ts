import {
  forEachHexNeighborOddQWithDirection,
  getHexNeighborDirectionVectorsOddQ,
} from "@swooper/mapgen-core/lib/grid";
import {
  type CountMetric,
  type NumericMetricSummary,
  measureMetricCount,
  summarizeNumericMetrics,
} from "@swooper/mapgen-metrics";

import type { StandardMapCapture } from "../capture.js";

/** Only closed capture evidence needed for neutral relief/climate/routing associations. */
export type StandardReliefCoherenceInput = Readonly<{
  provenance: Pick<StandardMapCapture["provenance"], "width" | "height">;
  model: Pick<
    StandardMapCapture["model"],
    | "exposedLandMask"
    | "externalWaterMask"
    | "seaLevel"
    | "elevation"
    | "mountainMask"
    | "foothillMask"
    | "roughLandMask"
    | "volcanoMask"
    | "plannedLakeMask"
    | "riverClass"
    | "flowDir"
    | "surfaceTemperature"
    | "baselineRainfall"
    | "refinedRainfall"
    | "windU"
    | "windV"
  > & { physicalHydrology: Pick<StandardMapCapture["model"]["physicalHydrology"], "waterSurface"> };
  observation: Pick<
    StandardMapCapture["observation"],
    | "isWater"
    | "isLake"
    | "terrain"
    | "mountainTerrain"
    | "hillTerrain"
    | "flatTerrain"
    | "coastTerrain"
    | "oceanTerrain"
  >;
}>;

type PlannedClass = "mountain" | "foothill" | "roughLandHill" | "otherLand";
type ObservedClass = "mountain" | "hill" | "flat" | "other";
type LakeClass = "neither" | "plannedOnly" | "observedOnly" | "both";
type ReliefTile = Readonly<{
  index: number;
  aboveSeaHeight: number;
  localRelief: number | null;
  localProminenceProxy: number | null;
}>;
type ReliefGroup = Readonly<{
  tiles: CountMetric;
  aboveSeaHeight: NumericMetricSummary | null;
  /** Maximum absolute elevation difference to a unique radius-one land neighbor. */
  localRelief: NumericMetricSummary | null;
  /** Elevation minus mean unique radius-one land-neighbor elevation, NOT true prominence. */
  localProminenceProxy: NumericMetricSummary | null;
  representatives: Readonly<{
    highestAboveSeaHeight: readonly ReliefTile[];
    largestLocalRelief: readonly ReliefTile[];
    strongestLocalProminenceProxy: readonly ReliefTile[];
    /** Upper height quartile and lower local-relief quartile of this group; not a defect label. */
    relativeHighAltitudeLowReliefCandidates: readonly ReliefTile[];
  }>;
}>;
type ContrastEdge = Readonly<{ source: number; receiver: number; heightDifference: number }>;
type EdgeContrast = Readonly<{
  edgeCount: number;
  /** Mountain minus comparison land, or coastal land minus water, in model elevation units. */
  signedHeightDifference: NumericMetricSummary | null;
  sourceAboveReceiver: CountMetric;
  sourceEqualReceiver: CountMetric;
  sourceBelowReceiver: CountMetric;
  representatives: readonly ContrastEdge[];
}>;
type CoastMetrics = Readonly<{
  coastalLand: CountMetric;
  /** Disjoint adjacency classes; lake and marine edges themselves are also disjoint. */
  landByAdjacency: Readonly<Record<CoastAdjacency, ReliefGroup>>;
  lakeEdges: EdgeContrast;
  marineEdges: EdgeContrast;
  otherWaterEdges: EdgeContrast;
}>;
type CoastAdjacency =
  | "lakeOnly"
  | "marineOnly"
  | "both"
  | "otherWaterOnly"
  | "lakeAndOtherWater"
  | "marineAndOtherWater"
  | "allWaterTypes";
type Association = Readonly<{
  pairCount: number;
  slope: number | null;
  pearson: number | null;
}>;
type WindClass = "uphill" | "downhill" | "zero" | "calm" | "unscored";
type WindTile = Readonly<{
  index: number;
  alignedGradient: number | null;
  baselineResidual: number;
  refinedResidual: number;
}>;
type WindGroup = Readonly<{
  tiles: CountMetric;
  alignedGradient: NumericMetricSummary | null;
  baselineRainfallRowResidual: NumericMetricSummary | null;
  refinedRainfallRowResidual: NumericMetricSummary | null;
  representatives: readonly WindTile[];
}>;
type RiverEdge = Readonly<{
  source: number;
  receiver: number;
  physicalReceiverMinusSource: number;
  routingReceiverMinusSource: number;
}>;
type RiverMetrics = Readonly<{
  routingSurfaceKind: "certified-water-surface";
  authoredTiles: number;
  terminalTiles: CountMetric;
  invalidReceiverTiles: CountMetric;
  validReceiverTiles: CountMetric;
  finiteDropEdges: CountMetric;
  /** Positive means physically uphill. Routing can descend while physical elevation rises. */
  physicalReceiverMinusSource: NumericMetricSummary | null;
  routingReceiverMinusSource: NumericMetricSummary | null;
  physicalUphill: CountMetric;
  physicalLevel: CountMetric;
  physicalDownhill: CountMetric;
  routingUphill: CountMetric;
  routingLevel: CountMetric;
  routingDownhill: CountMetric;
  /** Each numerator is uphill edges; each population is finite valid edges in that source class. */
  physicalUphillByPlannedClass: Readonly<Record<PlannedClass | "nonLand", CountMetric>>;
  physicalUphillByObservedClass: Readonly<Record<ObservedClass | "nonLand", CountMetric>>;
  physicalUphillByLakeClass: Readonly<Record<LakeClass, CountMetric>>;
  lakeOverlap: Readonly<Record<LakeClass, CountMetric>>;
  representatives: Readonly<{
    physicalUphill: readonly RiverEdge[];
    largestPhysicalRoutingDifference: readonly RiverEdge[];
    invalidReceiverSources: readonly number[];
    terminalSources: readonly number[];
  }>;
}>;

/** Physical model-unit proxies, not native cliff/terrain proof or causal climate attribution. */
export type StandardReliefCoherenceMetrics = Readonly<{
  plannedLandTiles: number;
  observedLandTiles: number;
  planned: Readonly<Record<PlannedClass, ReliefGroup>>;
  observed: Readonly<Record<ObservedClass, ReliefGroup>>;
  edgeContrasts: Readonly<{
    plannedMountainFoothill: EdgeContrast;
    plannedMountainOtherLand: EdgeContrast;
    observedMountainHill: EdgeContrast;
    observedMountainOtherLand: EdgeContrast;
  }>;
  coastalProxies: Readonly<{ planned: CoastMetrics; observed: CoastMetrics }>;
  plannedLakeOverlap: Readonly<{
    tiles: CountMetric;
    byPlannedClass: Readonly<Record<PlannedClass | "nonLand", CountMetric>>;
    volcanoTiles: CountMetric;
    representatives: readonly Readonly<{
      index: number;
      plannedClass: PlannedClass | "nonLand";
      observedClass: ObservedClass | "nonLand";
      volcano: boolean;
      aboveSeaHeight: number;
    }>[];
  }>;
  /** Residualize BOTH variables within modeled-land rows; slope is degrees C/model unit. */
  withinRowElevationTemperature: Association & Readonly<{ contributingRows: number }>;
  windRainfallAssociation: Readonly<{
    groups: Readonly<Record<WindClass, WindGroup>>;
    baseline: Association;
    refined: Association;
  }>;
  authoredRiverEdges: RiverMetrics;
}>;

/** Measures cross-field coherence without goodness thresholds or changing any recipe behavior. */
export function measureStandardReliefCoherence(
  input: StandardReliefCoherenceInput
): StandardReliefCoherenceMetrics {
  if (!Number.isFinite(input.model.seaLevel))
    throw new Error("Relief coherence requires finite seaLevel.");
  const size = input.provenance.width * input.provenance.height;
  const plannedLand = Array.from({ length: size }, (_, i) => input.model.exposedLandMask[i] === 1);
  const observedLand = Array.from({ length: size }, (_, i) => input.observation.isWater[i] !== 1);
  const neighbors = Array.from({ length: size }, (_, index) => uniqueNeighbors(input, index));
  const plannedTiles = reliefTiles(input, plannedLand, neighbors);
  const observedTiles = reliefTiles(input, observedLand, neighbors);
  const plannedClass = (i: number): PlannedClass | "nonLand" =>
    !plannedLand[i]
      ? "nonLand"
      : input.model.mountainMask[i] === 1
        ? "mountain"
        : input.model.foothillMask[i] === 1
          ? "foothill"
          : input.model.roughLandMask[i] === 1
            ? "roughLandHill"
            : "otherLand";
  const observedClass = (i: number): ObservedClass | "nonLand" =>
    !observedLand[i]
      ? "nonLand"
      : input.observation.terrain[i] === input.observation.mountainTerrain
        ? "mountain"
        : input.observation.terrain[i] === input.observation.hillTerrain
          ? "hill"
          : input.observation.terrain[i] === input.observation.flatTerrain
            ? "flat"
            : "other";
  const contrast = (classes: (i: number) => string, destination: readonly string[]) => {
    const edges: ContrastEdge[] = [];
    for (let source = 0; source < size; source += 1) {
      if (classes(source) !== "mountain") continue;
      for (const receiver of neighbors[source]!) {
        if (destination.includes(classes(receiver)))
          edges.push({
            source,
            receiver,
            heightDifference: input.model.elevation[source]! - input.model.elevation[receiver]!,
          });
      }
    }
    return summarizeEdges(edges);
  };

  return Object.freeze({
    plannedLandTiles: plannedTiles.length,
    observedLandTiles: observedTiles.length,
    planned: Object.freeze({
      mountain: summarizeRelief(
        plannedTiles.filter((t) => plannedClass(t.index) === "mountain"),
        plannedTiles.length
      ),
      foothill: summarizeRelief(
        plannedTiles.filter((t) => plannedClass(t.index) === "foothill"),
        plannedTiles.length
      ),
      roughLandHill: summarizeRelief(
        plannedTiles.filter((t) => plannedClass(t.index) === "roughLandHill"),
        plannedTiles.length
      ),
      otherLand: summarizeRelief(
        plannedTiles.filter((t) => plannedClass(t.index) === "otherLand"),
        plannedTiles.length
      ),
    }),
    observed: Object.freeze({
      mountain: summarizeRelief(
        observedTiles.filter((t) => observedClass(t.index) === "mountain"),
        observedTiles.length
      ),
      hill: summarizeRelief(
        observedTiles.filter((t) => observedClass(t.index) === "hill"),
        observedTiles.length
      ),
      flat: summarizeRelief(
        observedTiles.filter((t) => observedClass(t.index) === "flat"),
        observedTiles.length
      ),
      other: summarizeRelief(
        observedTiles.filter((t) => observedClass(t.index) === "other"),
        observedTiles.length
      ),
    }),
    edgeContrasts: Object.freeze({
      plannedMountainFoothill: contrast(plannedClass, ["foothill"]),
      plannedMountainOtherLand: contrast(plannedClass, ["otherLand"]),
      observedMountainHill: contrast(observedClass, ["hill"]),
      observedMountainOtherLand: contrast(observedClass, ["flat", "other"]),
    }),
    coastalProxies: Object.freeze({
      planned: measureCoasts(input, plannedLand, input.model.plannedLakeMask, neighbors, false),
      observed: measureCoasts(input, observedLand, input.observation.isLake, neighbors, true),
    }),
    plannedLakeOverlap: measurePlannedLakeOverlap(input, plannedClass, observedClass),
    withinRowElevationTemperature: measureTemperature(input, plannedLand),
    windRainfallAssociation: measureWindRainfall(input, plannedLand),
    authoredRiverEdges: measureRiverEdges(input, neighbors, plannedClass, observedClass),
  });
}

function uniqueNeighbors(input: StandardReliefCoherenceInput, index: number): number[] {
  const { width, height } = input.provenance;
  const out = new Set<number>();
  forEachHexNeighborOddQWithDirection(
    index % width,
    Math.floor(index / width),
    width,
    height,
    (x, y) => {
      const neighbor = y * width + x;
      if (neighbor !== index) out.add(neighbor);
    }
  );
  return [...out];
}

function reliefTiles(
  input: StandardReliefCoherenceInput,
  land: readonly boolean[],
  neighbors: readonly number[][]
): ReliefTile[] {
  const tiles: ReliefTile[] = [];
  for (let index = 0; index < land.length; index += 1) {
    if (!land[index]) continue;
    const elevation = input.model.elevation[index]!;
    const differences = neighbors[index]!.filter((i) => land[i]).map(
      (i) => elevation - input.model.elevation[i]!
    );
    tiles.push({
      index,
      aboveSeaHeight: elevation - input.model.seaLevel,
      localRelief: differences.length ? Math.max(...differences.map(Math.abs)) : null,
      localProminenceProxy: differences.length
        ? differences.reduce((a, b) => a + b, 0) / differences.length
        : null,
    });
  }
  return tiles;
}

function summarizeRelief(tiles: readonly ReliefTile[], population: number): ReliefGroup {
  const heights = tiles.map((t) => t.aboveSeaHeight);
  const relief = tiles.flatMap((t) => (t.localRelief === null ? [] : [t.localRelief]));
  const upperHeight = quantile(heights, 0.75);
  const lowerRelief = quantile(relief, 0.25);
  const plateau = tiles.filter(
    (t) =>
      upperHeight !== null &&
      lowerRelief !== null &&
      t.aboveSeaHeight >= upperHeight &&
      t.localRelief !== null &&
      t.localRelief <= lowerRelief
  );
  return Object.freeze({
    tiles: measureMetricCount(tiles.length, population),
    aboveSeaHeight: summarize(heights),
    localRelief: summarize(relief),
    localProminenceProxy: summarize(
      tiles.flatMap((t) => (t.localProminenceProxy === null ? [] : [t.localProminenceProxy]))
    ),
    representatives: Object.freeze({
      highestAboveSeaHeight: rankTiles(tiles, (t) => t.aboveSeaHeight),
      largestLocalRelief: rankTiles(
        tiles.filter((t) => t.localRelief !== null),
        (t) => t.localRelief!
      ),
      strongestLocalProminenceProxy: rankTiles(
        tiles.filter((t) => t.localProminenceProxy !== null),
        (t) => Math.abs(t.localProminenceProxy!)
      ),
      relativeHighAltitudeLowReliefCandidates: rankTiles(plateau, (t) => t.aboveSeaHeight),
    }),
  });
}

function summarizeEdges(edges: readonly ContrastEdge[]): EdgeContrast {
  return Object.freeze({
    edgeCount: edges.length,
    signedHeightDifference: summarize(edges.map((e) => e.heightDifference)),
    sourceAboveReceiver: measureMetricCount(
      edges.filter((e) => e.heightDifference > 0).length,
      edges.length
    ),
    sourceEqualReceiver: measureMetricCount(
      edges.filter((e) => e.heightDifference === 0).length,
      edges.length
    ),
    sourceBelowReceiver: measureMetricCount(
      edges.filter((e) => e.heightDifference < 0).length,
      edges.length
    ),
    representatives: Object.freeze(
      [...edges]
        .sort(
          (a, b) =>
            Math.abs(b.heightDifference) - Math.abs(a.heightDifference) ||
            a.source - b.source ||
            a.receiver - b.receiver
        )
        .slice(0, 5)
        .map((e) => Object.freeze(e))
    ),
  });
}

function measureCoasts(
  input: StandardReliefCoherenceInput,
  land: readonly boolean[],
  lakes: Uint8Array,
  neighbors: readonly number[][],
  observed: boolean
): CoastMetrics {
  const groups: Record<CoastAdjacency, ReliefTile[]> = {
    lakeOnly: [],
    marineOnly: [],
    both: [],
    otherWaterOnly: [],
    lakeAndOtherWater: [],
    marineAndOtherWater: [],
    allWaterTypes: [],
  };
  const lakeEdges: ContrastEdge[] = [],
    marineEdges: ContrastEdge[] = [],
    otherWaterEdges: ContrastEdge[] = [];
  const tiles = reliefTiles(
    input,
    land.map((value, index) => value && lakes[index] !== 1),
    neighbors
  );
  for (const tile of tiles) {
    let lake = false,
      marine = false,
      otherWater = false;
    for (const receiver of neighbors[tile.index]!) {
      if (land[receiver] && lakes[receiver] !== 1) continue;
      const edge = {
        source: tile.index,
        receiver,
        heightDifference: input.model.elevation[tile.index]! - input.model.elevation[receiver]!,
      };
      if (lakes[receiver] === 1) {
        lake = true;
        lakeEdges.push(edge);
      } else if (
        !observed ||
        input.observation.terrain[receiver] === input.observation.coastTerrain ||
        input.observation.terrain[receiver] === input.observation.oceanTerrain
      ) {
        marine = true;
        marineEdges.push(edge);
      } else {
        otherWater = true;
        otherWaterEdges.push(edge);
      }
    }
    if (lake || marine || otherWater) {
      const kind: CoastAdjacency = otherWater
        ? lake && marine
          ? "allWaterTypes"
          : lake
            ? "lakeAndOtherWater"
            : marine
              ? "marineAndOtherWater"
              : "otherWaterOnly"
        : lake && marine
          ? "both"
          : lake
            ? "lakeOnly"
            : "marineOnly";
      groups[kind].push(tile);
    }
  }
  const coastCount = Object.values(groups).reduce((sum, group) => sum + group.length, 0);
  return Object.freeze({
    coastalLand: measureMetricCount(coastCount, tiles.length),
    landByAdjacency: Object.freeze({
      lakeOnly: summarizeRelief(groups.lakeOnly, coastCount),
      marineOnly: summarizeRelief(groups.marineOnly, coastCount),
      both: summarizeRelief(groups.both, coastCount),
      otherWaterOnly: summarizeRelief(groups.otherWaterOnly, coastCount),
      lakeAndOtherWater: summarizeRelief(groups.lakeAndOtherWater, coastCount),
      marineAndOtherWater: summarizeRelief(groups.marineAndOtherWater, coastCount),
      allWaterTypes: summarizeRelief(groups.allWaterTypes, coastCount),
    }),
    lakeEdges: summarizeEdges(lakeEdges),
    marineEdges: summarizeEdges(marineEdges),
    otherWaterEdges: summarizeEdges(otherWaterEdges),
  });
}

function measurePlannedLakeOverlap(
  input: StandardReliefCoherenceInput,
  plannedClass: (i: number) => PlannedClass | "nonLand",
  observedClass: (i: number) => ObservedClass | "nonLand"
): StandardReliefCoherenceMetrics["plannedLakeOverlap"] {
  const indices = Array.from({ length: input.model.plannedLakeMask.length }, (_, i) => i).filter(
    (i) => input.model.plannedLakeMask[i] === 1
  );
  const count = (key: PlannedClass | "nonLand") =>
    measureMetricCount(indices.filter((i) => plannedClass(i) === key).length, indices.length);
  return Object.freeze({
    tiles: measureMetricCount(indices.length, input.provenance.width * input.provenance.height),
    byPlannedClass: Object.freeze({
      mountain: count("mountain"),
      foothill: count("foothill"),
      roughLandHill: count("roughLandHill"),
      otherLand: count("otherLand"),
      nonLand: count("nonLand"),
    }),
    volcanoTiles: measureMetricCount(
      indices.filter((i) => input.model.volcanoMask[i] === 1).length,
      indices.length
    ),
    representatives: rankTiles(
      indices.map((index) => ({
        index,
        plannedClass: plannedClass(index),
        observedClass: observedClass(index),
        volcano: input.model.volcanoMask[index] === 1,
        aboveSeaHeight: input.model.elevation[index]! - input.model.seaLevel,
      })),
      (t) => t.aboveSeaHeight
    ),
  });
}

function measureTemperature(input: StandardReliefCoherenceInput, land: readonly boolean[]) {
  const { width, height } = input.provenance;
  const pairs: [number, number][] = [];
  let contributingRows = 0;
  for (let y = 0; y < height; y += 1) {
    const row: [number, number][] = [];
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      if (land[i] && Number.isFinite(input.model.surfaceTemperature[i]))
        row.push([input.model.elevation[i]!, input.model.surfaceTemperature[i]!]);
    }
    if (row.length < 2) continue;
    contributingRows += 1;
    const elevationMean = row.reduce((sum, p) => sum + p[0], 0) / row.length;
    const temperatureMean = row.reduce((sum, p) => sum + p[1], 0) / row.length;
    pairs.push(...row.map(([e, t]): [number, number] => [e - elevationMean, t - temperatureMean]));
  }
  return Object.freeze({ ...association(pairs), contributingRows });
}

function measureWindRainfall(
  input: StandardReliefCoherenceInput,
  land: readonly boolean[]
): StandardReliefCoherenceMetrics["windRainfallAssociation"] {
  const { width, height } = input.provenance;
  const groups: Record<WindClass, WindTile[]> = {
    uphill: [],
    downhill: [],
    zero: [],
    calm: [],
    unscored: [],
  };
  const baselinePairs: [number, number][] = [],
    refinedPairs: [number, number][] = [];
  let population = 0;
  for (let y = 0; y < height; y += 1) {
    const indices = Array.from({ length: width }, (_, x) => y * width + x).filter((i) => land[i]);
    if (!indices.length) continue;
    const baselineMean =
      indices.reduce((sum, i) => sum + input.model.baselineRainfall[i]!, 0) / indices.length;
    const refinedMean =
      indices.reduce((sum, i) => sum + input.model.refinedRainfall[i]!, 0) / indices.length;
    for (const index of indices) {
      population += 1;
      const u = input.model.windU[index]!,
        v = input.model.windV[index]!;
      const speed = Math.hypot(u, v);
      const directions = getHexNeighborDirectionVectorsOddQ((y & 1) === 1);
      let gx = 0,
        gy = 0,
        count = 0;
      // Same geometric estimator as precipitation: all physical neighbors, normalized hex vectors.
      // Direction aliases on narrow grids remain directional samples, unlike unique relief edges.
      forEachHexNeighborOddQWithDirection(index % width, y, width, height, (x, ny, direction) => {
        const receiver = ny * width + x;
        if (receiver === index) return;
        const d = directions[direction]!;
        const delta = input.model.elevation[receiver]! - input.model.elevation[index]!;
        const denominator = Math.max(1e-6, d.x * d.x + d.y * d.y);
        gx += (delta * d.x) / denominator;
        gy += (delta * d.y) / denominator;
        count += 1;
      });
      const alignedGradient = speed > 0 && count > 0 ? (gx * u + gy * v) / (count * speed) : null;
      const kind: WindClass =
        speed === 0
          ? "calm"
          : alignedGradient === null
            ? "unscored"
            : alignedGradient > 1e-9
              ? "uphill"
              : alignedGradient < -1e-9
                ? "downhill"
                : "zero";
      const baselineResidual = input.model.baselineRainfall[index]! - baselineMean;
      const refinedResidual = input.model.refinedRainfall[index]! - refinedMean;
      groups[kind].push({ index, alignedGradient, baselineResidual, refinedResidual });
      if (alignedGradient !== null) {
        baselinePairs.push([alignedGradient, baselineResidual]);
        refinedPairs.push([alignedGradient, refinedResidual]);
      }
    }
  }
  const summarizeWind = (tiles: readonly WindTile[]): WindGroup =>
    Object.freeze({
      tiles: measureMetricCount(tiles.length, population),
      alignedGradient: summarize(
        tiles.flatMap((t) => (t.alignedGradient === null ? [] : [t.alignedGradient]))
      ),
      baselineRainfallRowResidual: summarize(tiles.map((t) => t.baselineResidual)),
      refinedRainfallRowResidual: summarize(tiles.map((t) => t.refinedResidual)),
      representatives: rankTiles(tiles, (t) =>
        Math.max(Math.abs(t.baselineResidual), Math.abs(t.refinedResidual))
      ),
    });
  return Object.freeze({
    groups: Object.freeze({
      uphill: summarizeWind(groups.uphill),
      downhill: summarizeWind(groups.downhill),
      zero: summarizeWind(groups.zero),
      calm: summarizeWind(groups.calm),
      unscored: summarizeWind(groups.unscored),
    }),
    baseline: association(baselinePairs),
    refined: association(refinedPairs),
  });
}

function measureRiverEdges(
  input: StandardReliefCoherenceInput,
  neighbors: readonly number[][],
  plannedClass: (i: number) => PlannedClass | "nonLand",
  observedClass: (i: number) => ObservedClass | "nonLand"
): RiverMetrics {
  const physicalHydrology = input.model.physicalHydrology;
  const routingSurface = physicalHydrology.waterSurface;
  const edges: RiverEdge[] = [],
    terminals: number[] = [],
    invalid: number[] = [];
  const lakeClass = (i: number): LakeClass =>
    input.model.plannedLakeMask[i] === 1
      ? input.observation.isLake[i] === 1
        ? "both"
        : "plannedOnly"
      : input.observation.isLake[i] === 1
        ? "observedOnly"
        : "neither";
  let authoredTiles = 0,
    validCount = 0;
  for (let source = 0; source < neighbors.length; source += 1) {
    if (!(input.model.riverClass[source]! > 0)) continue;
    authoredTiles += 1;
    const receiver = input.model.flowDir[source]!;
    if (receiver === -1) {
      terminals.push(source);
      continue;
    }
    if (
      !Number.isInteger(receiver) ||
      receiver < 0 ||
      receiver >= neighbors.length ||
      !neighbors[source]!.includes(receiver)
    ) {
      invalid.push(source);
      continue;
    }
    validCount += 1;
    const physicalReceiverMinusSource =
      input.model.elevation[receiver]! - input.model.elevation[source]!;
    const routingReceiverMinusSource =
      (input.model.externalWaterMask[receiver] === 1 ? input.model.seaLevel : routingSurface[receiver]!) -
      routingSurface[source]!;
    if (
      Number.isFinite(physicalReceiverMinusSource) &&
      Number.isFinite(routingReceiverMinusSource)
    ) {
      edges.push({ source, receiver, physicalReceiverMinusSource, routingReceiverMinusSource });
    }
  }
  const uphill = edges.filter((e) => e.physicalReceiverMinusSource > 0);
  const countClass = (classify: (i: number) => string, key: string) =>
    measureMetricCount(
      uphill.filter((e) => classify(e.source) === key).length,
      edges.filter((e) => classify(e.source) === key).length
    );
  const overlap = (key: LakeClass) =>
    measureMetricCount(edges.filter((e) => lakeClass(e.source) === key).length, edges.length);
  const ranked = (values: readonly RiverEdge[], score: (edge: RiverEdge) => number) =>
    Object.freeze(
      [...values]
        .sort((a, b) => score(b) - score(a) || a.source - b.source || a.receiver - b.receiver)
        .slice(0, 5)
        .map((e) => Object.freeze(e))
    );
  return Object.freeze({
    routingSurfaceKind: "certified-water-surface",
    authoredTiles,
    terminalTiles: measureMetricCount(terminals.length, authoredTiles),
    invalidReceiverTiles: measureMetricCount(invalid.length, authoredTiles),
    validReceiverTiles: measureMetricCount(validCount, authoredTiles),
    finiteDropEdges: measureMetricCount(edges.length, validCount),
    physicalReceiverMinusSource: summarize(edges.map((e) => e.physicalReceiverMinusSource)),
    routingReceiverMinusSource: summarize(edges.map((e) => e.routingReceiverMinusSource)),
    physicalUphill: measureMetricCount(uphill.length, edges.length),
    physicalLevel: measureMetricCount(
      edges.filter((e) => e.physicalReceiverMinusSource === 0).length,
      edges.length
    ),
    physicalDownhill: measureMetricCount(
      edges.filter((e) => e.physicalReceiverMinusSource < 0).length,
      edges.length
    ),
    routingUphill: measureMetricCount(
      edges.filter((e) => e.routingReceiverMinusSource > 0).length,
      edges.length
    ),
    routingLevel: measureMetricCount(
      edges.filter((e) => e.routingReceiverMinusSource === 0).length,
      edges.length
    ),
    routingDownhill: measureMetricCount(
      edges.filter((e) => e.routingReceiverMinusSource < 0).length,
      edges.length
    ),
    physicalUphillByPlannedClass: Object.freeze({
      mountain: countClass(plannedClass, "mountain"),
      foothill: countClass(plannedClass, "foothill"),
      roughLandHill: countClass(plannedClass, "roughLandHill"),
      otherLand: countClass(plannedClass, "otherLand"),
      nonLand: countClass(plannedClass, "nonLand"),
    }),
    physicalUphillByObservedClass: Object.freeze({
      mountain: countClass(observedClass, "mountain"),
      hill: countClass(observedClass, "hill"),
      flat: countClass(observedClass, "flat"),
      other: countClass(observedClass, "other"),
      nonLand: countClass(observedClass, "nonLand"),
    }),
    physicalUphillByLakeClass: Object.freeze({
      neither: countClass(lakeClass, "neither"),
      plannedOnly: countClass(lakeClass, "plannedOnly"),
      observedOnly: countClass(lakeClass, "observedOnly"),
      both: countClass(lakeClass, "both"),
    }),
    lakeOverlap: Object.freeze({
      neither: overlap("neither"),
      plannedOnly: overlap("plannedOnly"),
      observedOnly: overlap("observedOnly"),
      both: overlap("both"),
    }),
    representatives: Object.freeze({
      physicalUphill: ranked(uphill, (e) => e.physicalReceiverMinusSource),
      largestPhysicalRoutingDifference: ranked(edges, (e) =>
        Math.abs(e.physicalReceiverMinusSource - e.routingReceiverMinusSource)
      ),
      invalidReceiverSources: Object.freeze(invalid.slice(0, 5)),
      terminalSources: Object.freeze(terminals.slice(0, 5)),
    }),
  });
}

function association(pairs: readonly (readonly [number, number])[]): Association {
  const finite = pairs.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  const pairCount = finite.length;
  if (pairCount < 2) return Object.freeze({ pairCount, slope: null, pearson: null });
  const meanX = finite.reduce((sum, p) => sum + p[0], 0) / pairCount;
  const meanY = finite.reduce((sum, p) => sum + p[1], 0) / pairCount;
  let xx = 0,
    yy = 0,
    xy = 0;
  for (const [x, y] of finite) {
    const dx = x - meanX,
      dy = y - meanY;
    xx += dx * dx;
    yy += dy * dy;
    xy += dx * dy;
  }
  return Object.freeze({
    pairCount,
    slope: xx > 1e-12 && yy > 1e-12 ? xy / xx : null,
    pearson: xx > 1e-12 && yy > 1e-12 ? Math.max(-1, Math.min(1, xy / Math.sqrt(xx * yy))) : null,
  });
}

function summarize(values: readonly number[]): NumericMetricSummary | null {
  const [first, ...rest] = values;
  return first === undefined ? null : summarizeNumericMetrics([first, ...rest]);
}

function rankTiles<T extends { index: number }>(
  tiles: readonly T[],
  score: (tile: T) => number
): readonly Readonly<T>[] {
  return Object.freeze(
    [...tiles]
      .sort((a, b) => score(b) - score(a) || a.index - b.index)
      .slice(0, 5)
      .map((t) => Object.freeze(t))
  );
}

function quantile(values: readonly number[], fraction: number): number | null {
  if (!values.length) return null;
  const ordered = [...values].sort((a, b) => a - b);
  return ordered[Math.floor((ordered.length - 1) * fraction)]!;
}
