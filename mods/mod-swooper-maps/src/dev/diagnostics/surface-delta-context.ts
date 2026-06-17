import {
  CIV7_BROWSER_TABLES_V0,
  getNaturalWonderFootprintIndices,
  getNaturalWonderFootprintOffsets,
  isResourceAdjacentToLandRuntimeOptional,
  NATURAL_WONDER_CATALOG,
} from "@civ7/map-policy";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";

import type {
  FinalSurfaceKey,
  FinalSurfaceParityProof,
  FinalSurfaceSnapshot,
} from "./live-parity.js";

export type ClassifiableSurfaceKey = Extract<FinalSurfaceKey, "feature" | "resource">;

export type StaticSurfaceLegality = Readonly<{
  kind: ClassifiableSurfaceKey;
  type: number;
  symbol: string;
  terrain: number | null;
  terrainSymbol: string;
  biome: number | null;
  biomeSymbol: string;
  feature: number | null;
  featureSymbol: string;
  validSurface: boolean;
  reasons: ReadonlyArray<string>;
  resourcePolicy?: ResourceStaticPolicyContext;
}>;

export type ResourceStaticPolicyContext = Readonly<{
  matchingRows: ReadonlyArray<ResourcePlacementRowContext>;
  flags: ResourcePlacementFlagsContext | null;
  hasAdjacentLand: boolean;
}>;

export type ResourcePlacementRowContext = Readonly<{
  biome: number;
  biomeSymbol: string;
  terrain: number;
  terrainSymbol: string;
  feature: number | null;
  featureSymbol: string;
}>;

export type ResourcePlacementFlagsContext = Readonly<{
  adjacentToLand: boolean;
  adjacentToLandRuntimeOptional: boolean;
  lakeEligible: boolean;
}>;

export type SurfaceDeltaContext = Readonly<{
  key: ClassifiableSurfaceKey;
  x: number;
  y: number;
  local: Readonly<{
    value: number | null;
    symbol: string;
    context: CellSurfaceContext;
  }>;
  live: Readonly<{
    value: number | null;
    symbol: string;
    context: CellSurfaceContext;
  }>;
  legality: Readonly<{
    localValueOnLocal?: StaticSurfaceLegality;
    localValueOnLive?: StaticSurfaceLegality;
    liveValueOnLocal?: StaticSurfaceLegality;
    liveValueOnLive?: StaticSurfaceLegality;
  }>;
}>;

export type FeatureDeltaPlacementContext = SurfaceDeltaContext &
  Readonly<{
    key: "feature";
    plotIndex: number;
    localFeatureIntent: FeatureIntentContext | null;
    naturalWonderFootprint: NaturalWonderFootprintContext | null;
    naturalWonderDirectionAlternatives: NaturalWonderDirectionAlternativesContext | null;
    pairedSameFeatureDelta: FeatureDeltaPairContext | null;
    evidenceClass:
      | "local-only-ecology-feature"
      | "live-only-ecology-feature"
      | "natural-wonder-offset-local-anchor"
      | "natural-wonder-offset-live-anchor"
      | "unclassified";
  }>;

export type FeatureDeltaPairContext = Readonly<{
  x: number;
  y: number;
  plotIndex: number;
  distance: number;
  localFeature: Readonly<{ value: number | null; symbol: string }>;
  liveFeature: Readonly<{ value: number | null; symbol: string }>;
}>;

export type FeatureIntentContext = Readonly<{
  family: string;
  feature: string;
  weight: number | null;
}>;

export type NaturalWonderFootprintContext = Readonly<{
  anchorPlotIndex: number;
  anchorX: number;
  anchorY: number;
  featureType: number;
  featureSymbol: string;
  direction: number;
  priority: number | null;
  footprintDistanceFromAnchor: number;
}>;

export type NaturalWonderDirectionAlternativesContext = Readonly<{
  anchorPlotIndex: number;
  anchorX: number;
  anchorY: number;
  featureType: number;
  featureSymbol: string;
  declaredDirection: number;
  rowPlotIndex: number;
  pairedPlotIndex: number | null;
  candidates: ReadonlyArray<NaturalWonderDirectionCandidateContext>;
  directionsContainingRow: ReadonlyArray<number>;
  directionsContainingPairedRow: ReadonlyArray<number>;
}>;

export type NaturalWonderDirectionCandidateContext = Readonly<{
  direction: number;
  footprintPlotIndexes: ReadonlyArray<number>;
  containsRow: boolean;
  containsPairedRow: boolean | null;
}>;

export type NaturalWonderFootprintReadbackContext = Readonly<{
  anchorPlotIndex: number;
  anchorX: number;
  anchorY: number;
  featureType: number;
  featureSymbol: string;
  declaredDirection: number;
  declaredFootprintPlotIndexes: ReadonlyArray<number>;
  candidates: ReadonlyArray<NaturalWonderFootprintReadbackCandidate>;
  bestLocalDirections: ReadonlyArray<number>;
  bestLiveDirections: ReadonlyArray<number>;
  declaredLocalMatchCount: number;
  declaredLiveMatchCount: number;
  bestLocalMatchCount: number;
  bestLiveMatchCount: number;
  classification:
    | "local-live-same-direction"
    | "live-direction-differs-from-local"
    | "live-footprint-missing"
    | "local-footprint-missing"
    | "unclassified";
}>;

export type NaturalWonderFootprintReadbackCandidate = Readonly<{
  direction: number;
  footprintPlotIndexes: ReadonlyArray<number>;
  localMatchCount: number;
  liveMatchCount: number;
  localComplete: boolean;
  liveComplete: boolean;
}>;

export type NaturalWonderFootprintCatalogContext = Readonly<{
  featureType: number;
  featureSymbol: string;
  placementClass: string;
  naturalWonderTiles: number;
  declaredDirection: number;
  localProjectionDirection: number;
  localProjectionOffsets: ReadonlyArray<Readonly<{ dx: number; dy: number }>>;
  supportedDirections: ReadonlyArray<NaturalWonderFootprintCatalogDirectionContext>;
  directionClass:
    | "single-tile-direction-irrelevant"
    | "official-fixed-direction"
    | "unspecified-engine-direction-local-fixed-projection"
    | "unsupported";
  observedReadbacks: ReadonlyArray<NaturalWonderFootprintCatalogReadbackContext>;
  readbackDisposition:
    | "no-exact-run-evidence"
    | "observed-live-direction-drift"
    | "observed-ambiguous-or-partial"
    | "observed-local-live-aligned";
}>;

export type NaturalWonderFootprintCatalogDirectionContext = Readonly<{
  direction: number;
  offsets: ReadonlyArray<Readonly<{ dx: number; dy: number }>>;
}>;

export type NaturalWonderFootprintCatalogReadbackContext = Readonly<{
  anchorPlotIndex: number;
  declaredDirection: number;
  bestLocalDirections: ReadonlyArray<number>;
  bestLiveDirections: ReadonlyArray<number>;
  bestLocalMatchCount: number;
  bestLiveMatchCount: number;
  classification: NaturalWonderFootprintReadbackContext["classification"];
}>;

export type NaturalWonderLiveProofBoundaryContext = Readonly<{
  localPlacementStats: NaturalWonderPlacementStatsContext | null;
  liveTelemetryPlacementStats: NaturalWonderPlacementStatsContext | null;
  liveProofPlacementStats: NaturalWonderPlacementStatsContext | null;
  liveCompletionPlacementStats: NaturalWonderPlacementStatsContext | null;
  boundaryClass:
    | "local-and-live-placement-stats-present"
    | "local-placement-stats-only"
    | "live-placement-stats-only"
    | "placement-stats-missing";
  unresolvedLinks: ReadonlyArray<string>;
}>;

export type NaturalWonderPlacementStatsContext = Readonly<{
  plannedCount: number | null;
  targetCount: number | null;
  placedCount: number | null;
  rejectedCount: number | null;
  shortfallCount: number | null;
  rejectionExamples: ReadonlyArray<string>;
  coordinateProof: Readonly<{
    version: number | null;
    placed: Readonly<{ count: number | null; hash32: string | null }>;
    rejected: Readonly<{ count: number | null; hash32: string | null }>;
  }> | null;
}>;

export type ResourceDeltaPlacementContext = Readonly<{
  x: number;
  y: number;
  plotIndex: number;
  localResource: Readonly<{ value: number | null; symbol: string }>;
  liveResource: Readonly<{ value: number | null; symbol: string }>;
  localContext: CellSurfaceContext;
  liveContext: CellSurfaceContext;
  legality: Readonly<{
    localValueOnLocal?: StaticSurfaceLegality;
    localValueOnLive?: StaticSurfaceLegality;
    liveValueOnLocal?: StaticSurfaceLegality;
    liveValueOnLive?: StaticSurfaceLegality;
  }>;
  plannedPreferredResourceType: number | null;
  plannedPreferredResourceSymbol: string;
  localOutcome: ResourcePlacementOutcomeContext | null;
  planIntent: ResourcePlanIntentContext | null;
  resourceNeighborhood: ResourceDeltaNeighborhoodContext;
  evidenceClass:
    | "local-assigned-live-empty"
    | "local-assigned-live-substitution"
    | "live-only-no-local-assignment"
    | "live-only-preferred-but-unassigned"
    | "unclassified";
}>;

export type ResourceDeltaNeighborhoodContext = Readonly<{
  minSpacingTiles: number | null;
  localResourceOnLocal: ResourceNeighborhoodContext | null;
  localResourceOnLive: ResourceNeighborhoodContext | null;
  liveResourceOnLocal: ResourceNeighborhoodContext | null;
  liveResourceOnLive: ResourceNeighborhoodContext | null;
}>;

export type ResourceNeighborhoodContext = Readonly<{
  nearestSameType: ResourceNeighborContext | null;
  nearestAnyResource: ResourceNeighborContext | null;
  sameTypeWithinMinSpacing: boolean | null;
  anyResourceWithinMinSpacing: boolean | null;
}>;

export type ResourceNeighborContext = Readonly<{
  distance: number;
  x: number;
  y: number;
  plotIndex: number;
  resourceType: number;
  resourceSymbol: string;
}>;

export type ResourceDeltaFeasibilityContext = ResourceDeltaPlacementContext &
  Readonly<{
    localFeasibleInCiv: ResourceFeasibilityProbe | null;
    liveFeasibleInCiv: ResourceFeasibilityProbe | null;
    feasibilityClass:
      | "live-feasible-no-local-assignment"
      | "local-feasible-live-empty"
      | "local-overaccepted-live-empty"
      | "substitution-both-feasible"
      | "substitution-both-infeasible"
      | "substitution-mixed-feasibility"
      | "feasibility-missing"
      | "unclassified";
  }>;

export type ResourceFeasibilityProbe = Readonly<{
  ok: boolean;
  value: boolean | null;
  error: string | null;
}>;

export type ResourceFeasibilityReadbackLike = Readonly<{
  cells?: ReadonlyArray<ResourceFeasibilityCellLike>;
}>;

export type ResourceFeasibilityCellLike = Readonly<{
  location?: Readonly<{
    x?: number;
    y?: number;
    index?: ResourceFeasibilityRuntimeProbeLike<number>;
  }>;
  feasibility?: Readonly<Record<string, ResourceFeasibilityRuntimeProbeLike<boolean>>>;
}>;

export type ResourceFeasibilityRuntimeProbeLike<T> = Readonly<{
  ok?: boolean;
  value?: T;
  error?: string;
}>;

export type TerrainDeltaEdgeContext = Readonly<{
  x: number;
  y: number;
  plotIndex: number;
  localTerrain: Readonly<{
    value: number | null;
    symbol: string;
    context: CellSurfaceContext;
  }>;
  liveTerrain: Readonly<{
    value: number | null;
    symbol: string;
    context: CellSurfaceContext;
  }>;
  neighborhood: TerrainDeltaNeighborhoodContext;
  localProjection: TerrainProjectionRowContext | null;
  evidenceClass:
    | "local-ocean-live-coast"
    | "local-coast-live-ocean"
    | "water-terrain-edge-swap"
    | "unclassified";
  sourceAuthorityStatus: "unresolved";
  ownerCandidates: ReadonlyArray<
    | "map-morphology-coast-shelf-projection"
    | "map-hydrology-water-mutation"
    | "civ-engine-terrain-validation"
    | "evidence-insufficient"
  >;
}>;

export type TerrainDeltaNeighborhoodContext = Readonly<{
  neighbors: ReadonlyArray<TerrainDeltaNeighborContext>;
  localCounts: TerrainNeighborhoodCounts;
  liveCounts: TerrainNeighborhoodCounts;
}>;

export type TerrainDeltaNeighborContext = Readonly<{
  direction: number;
  x: number;
  y: number;
  plotIndex: number;
  localTerrain: Readonly<{ value: number | null; symbol: string; waterClass: TerrainWaterClass }>;
  liveTerrain: Readonly<{ value: number | null; symbol: string; waterClass: TerrainWaterClass }>;
}>;

export type TerrainNeighborhoodCounts = Readonly<{
  coast: number;
  ocean: number;
  otherWater: number;
  land: number;
  empty: number;
}>;

export type TerrainWaterClass = "coast" | "ocean" | "other-water" | "land" | "empty";

export type TerrainProjectionRowContext = Readonly<{
  morphology: TerrainMorphologyProjectionRowContext | null;
  mapMorphologyCoastPolicy: TerrainMapMorphologyCoastPolicyRowContext | null;
  mapMorphologyCoastTerrainSnapshot: TerrainProjectionSnapshotRowContext | null;
  mapMorphologyContinentValidationSnapshot: TerrainProjectionSnapshotRowContext | null;
  hydrologyLakePlan: TerrainHydrologyLakePlanRowContext | null;
  mapHydrologyProjection: TerrainMapHydrologyProjectionRowContext | null;
  hydrologyTerrainSnapshot: TerrainProjectionSnapshotRowContext | null;
  mapElevationTerrainSnapshot: TerrainProjectionSnapshotRowContext | null;
  mapRiversTerrainSnapshot: TerrainProjectionSnapshotRowContext | null;
  placementSurfacePreparation: TerrainPlacementPreparationContext | null;
  placementTerrainSnapshot: TerrainProjectionSnapshotRowContext | null;
  placementValidationBoundary: TerrainValidationBoundaryRowContext | null;
}>;

export type TerrainMorphologyProjectionRowContext = Readonly<{
  coastalLand: number | null;
  coastalWater: number | null;
  shelfMask: number | null;
  distanceToCoast: number | null;
}>;

export type TerrainMapMorphologyCoastPolicyRowContext = Readonly<{
  baseWaterClass: number | null;
  sourceCoastMask: number | null;
  waterClass: number | null;
  policyCoastMask: number | null;
  coastBufferTiles: number | null;
  promotedOceanToCoast: number | null;
}>;

export type TerrainHydrologyLakePlanRowContext = Readonly<{
  lakeMask: number | null;
  plannedLakeTileCount: number | null;
  sinkLakeCount: number | null;
}>;

export type TerrainMapHydrologyProjectionRowContext = Readonly<{
  lakeMask: number | null;
  plannedLakeMask: number | null;
  engineWaterMask: number | null;
  engineLakeMask: number | null;
  engineTerrain: number | null;
  engineTerrainSymbol: string;
  engineAreaId: number | null;
  terrainMismatchMask: number | null;
  terrainMismatchTileCount: number | null;
  nonLakeTileCount: number | null;
  morphologyProtectedLakeTileCount: number | null;
}>;

export type TerrainProjectionSnapshotRowContext = Readonly<{
  stage: string | null;
  landMask: number | null;
  terrain: number | null;
  terrainSymbol: string;
}>;

export type TerrainPlacementPreparationContext = Readonly<{
  acceptedLakeTileCount: number | null;
  finalLakeWaterDriftCount: number | null;
  finalLakeClassificationDriftCount: number | null;
}>;

export type TerrainValidationBoundaryRowContext = Readonly<{
  beforeValidate: TerrainValidationBoundaryFactContext | null;
  afterValidate: TerrainValidationBoundaryFactContext | null;
  afterMaintenance: TerrainValidationBoundaryFactContext | null;
}>;

export type TerrainValidationBoundaryFactContext = Readonly<{
  stage: string | null;
  terrain: number | null;
  terrainSymbol: string;
  waterMask: number | null;
  lakeMask: number | null;
  areaId: number | null;
}>;

export type ResourcePlacementOutcomeContext = Readonly<{
  status: string;
  resourceType: number;
  resourceSymbol: string;
  observedResourceType: number | null;
  observedResourceSymbol: string;
  reason: string | null;
}>;

export type ResourcePlanIntentContext = Readonly<{
  resourceType: number;
  resourceSymbol: string;
  resourceTypeName: string | null;
  phase: string;
  family: string | null;
  laneId: string | null;
  inHabitat: boolean | null;
  order: number | null;
}>;

export type CellSurfaceContext = Readonly<{
  terrain: number | null;
  terrainSymbol: string;
  biome: number | null;
  biomeSymbol: string;
  feature: number | null;
  featureSymbol: string;
  resource: number | null;
  resourceSymbol: string;
}>;

type SurfaceLike = Readonly<{
  values: ReadonlyArray<number | null>;
}>;

type SnapshotLike = Readonly<{
  width: number;
  height: number;
  surfaces: Readonly<Record<FinalSurfaceKey, SurfaceLike>>;
}>;

const TERRAIN_SYMBOL_BY_ID = invertNumberMap(CIV7_BROWSER_TABLES_V0.terrainTypeIndices);
const BIOME_SYMBOL_BY_ID = invertNumberMap(CIV7_BROWSER_TABLES_V0.biomeGlobals);
const FEATURE_SYMBOL_BY_ID = invertNumberMap(CIV7_BROWSER_TABLES_V0.featureTypes);
const RESOURCE_SYMBOL_BY_ID = invertNumberMap(CIV7_BROWSER_TABLES_V0.resourceTypes);

const WATER_TERRAINS = new Set([
  CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST,
  CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_OCEAN,
]);

const ODD_Q_NEIGHBORS_EVEN = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
] as const;

const ODD_Q_NEIGHBORS_ODD = [
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [0, -1],
  [1, 0],
] as const;

export function buildSurfaceDeltaContexts(
  proof: Pick<FinalSurfaceParityProof, "local" | "live">,
  options: {
    keys?: ReadonlyArray<ClassifiableSurfaceKey>;
    maxRows?: number;
  } = {}
): ReadonlyArray<SurfaceDeltaContext> {
  const keys = options.keys ?? ["feature", "resource"];
  const maxRows = options.maxRows ?? Number.POSITIVE_INFINITY;
  const rows: SurfaceDeltaContext[] = [];

  for (const key of keys) {
    const localValues = proof.local.surfaces[key].values;
    const liveValues = proof.live.surfaces[key].values;
    const length = Math.min(localValues.length, liveValues.length);
    for (let index = 0; index < length; index += 1) {
      const localValue = normalizeSurfaceValue(localValues[index]);
      const liveValue = normalizeSurfaceValue(liveValues[index]);
      if (localValue === liveValue) continue;
      const y = Math.floor(index / proof.local.width);
      const x = index - y * proof.local.width;
      rows.push(buildSurfaceDeltaContext(proof.local, proof.live, key, x, y));
      if (rows.length >= maxRows) return rows;
    }
  }

  return rows;
}

export function buildFeatureDeltaPlacementContexts(
  proof: Pick<FinalSurfaceParityProof, "local" | "live">,
  options: { maxRows?: number } = {}
): ReadonlyArray<FeatureDeltaPlacementContext> {
  const maxRows = options.maxRows ?? Number.POSITIVE_INFINITY;
  const featureIntents = readFeatureIntentEvidence(proof.local);
  const naturalWonderFootprints = readNaturalWonderFootprintEvidence(proof.local);
  const naturalWonderPlacements = readNaturalWonderPlacementEvidence(proof.local);
  const rows = buildSurfaceDeltaContexts(proof, { keys: ["feature"] }).map((row) => {
    const plotIndex = row.y * proof.local.width + row.x;
    return {
      ...row,
      key: "feature" as const,
      plotIndex,
      localFeatureIntent: featureIntents.byPlot.get(plotIndex) ?? null,
      naturalWonderFootprint: naturalWonderFootprints.byPlot.get(plotIndex) ?? null,
      naturalWonderDirectionAlternatives: null,
      pairedSameFeatureDelta: null,
      evidenceClass: "unclassified" as const,
    };
  });
  const classified = rows.map((row) => {
    const pairedSameFeatureDelta = findPairedFeatureDelta(row, rows, proof.local.width);
    return {
      ...row,
      pairedSameFeatureDelta,
      naturalWonderDirectionAlternatives: buildNaturalWonderDirectionAlternatives(
        row,
        pairedSameFeatureDelta,
        naturalWonderPlacements.placements,
        proof.local.width,
        proof.local.height
      ),
      evidenceClass: classifyFeatureDelta(row, pairedSameFeatureDelta),
    };
  });
  return classified.slice(0, maxRows);
}

export function buildNaturalWonderFootprintReadbackContexts(
  proof: Pick<FinalSurfaceParityProof, "local" | "live">
): ReadonlyArray<NaturalWonderFootprintReadbackContext> {
  return readNaturalWonderPlacementEvidence(proof.local).placements.map((placement) => {
    const policy = CIV7_BROWSER_TABLES_V0.featurePolicies[String(placement.featureType)] ?? {};
    const candidates = [0, 1, 2, 3, 4, 5].flatMap((direction) => {
      const footprintPlotIndexes = getNaturalWonderFootprintIndices({
        x: placement.anchorX,
        y: placement.anchorY,
        width: proof.local.width,
        height: proof.local.height,
        policy,
        direction,
      });
      if (!footprintPlotIndexes) return [];
      const localMatchCount = countFeatureMatches(
        proof.local,
        footprintPlotIndexes,
        placement.featureType
      );
      const liveMatchCount = countFeatureMatches(
        proof.live,
        footprintPlotIndexes,
        placement.featureType
      );
      return [
        {
          direction,
          footprintPlotIndexes,
          localMatchCount,
          liveMatchCount,
          localComplete: localMatchCount === footprintPlotIndexes.length,
          liveComplete: liveMatchCount === footprintPlotIndexes.length,
        },
      ];
    });
    const declaredDirection = normalizeDirectionForReadback(placement.direction);
    const declared =
      candidates.find((candidate) => candidate.direction === declaredDirection) ?? candidates[0];
    const bestLocalMatchCount = maxMatchCount(candidates, "localMatchCount");
    const bestLiveMatchCount = maxMatchCount(candidates, "liveMatchCount");
    const bestLocalDirections = candidates
      .filter((candidate) => candidate.localMatchCount === bestLocalMatchCount)
      .map((candidate) => candidate.direction);
    const bestLiveDirections = candidates
      .filter((candidate) => candidate.liveMatchCount === bestLiveMatchCount)
      .map((candidate) => candidate.direction);
    const classification = classifyNaturalWonderFootprintReadback({
      bestLocalMatchCount,
      bestLiveMatchCount,
      bestLocalDirections,
      bestLiveDirections,
    });
    return {
      anchorPlotIndex: placement.anchorPlotIndex,
      anchorX: placement.anchorX,
      anchorY: placement.anchorY,
      featureType: placement.featureType,
      featureSymbol: symbolFor("feature", placement.featureType),
      declaredDirection: placement.direction,
      declaredFootprintPlotIndexes: declared?.footprintPlotIndexes ?? [],
      candidates,
      bestLocalDirections,
      bestLiveDirections,
      declaredLocalMatchCount: declared?.localMatchCount ?? 0,
      declaredLiveMatchCount: declared?.liveMatchCount ?? 0,
      bestLocalMatchCount,
      bestLiveMatchCount,
      classification,
    };
  });
}

export function buildNaturalWonderFootprintCatalogContexts(
  readbacks: ReadonlyArray<NaturalWonderFootprintReadbackContext> = []
): ReadonlyArray<NaturalWonderFootprintCatalogContext> {
  const readbacksByFeature = new Map<number, NaturalWonderFootprintCatalogReadbackContext[]>();
  for (const readback of readbacks) {
    const bucket = readbacksByFeature.get(readback.featureType) ?? [];
    bucket.push({
      anchorPlotIndex: readback.anchorPlotIndex,
      declaredDirection: readback.declaredDirection,
      bestLocalDirections: readback.bestLocalDirections,
      bestLiveDirections: readback.bestLiveDirections,
      bestLocalMatchCount: readback.bestLocalMatchCount,
      bestLiveMatchCount: readback.bestLiveMatchCount,
      classification: readback.classification,
    });
    readbacksByFeature.set(readback.featureType, bucket);
  }

  return NATURAL_WONDER_CATALOG.map((entry) => {
    const policy = CIV7_BROWSER_TABLES_V0.featurePolicies[String(entry.featureType)] ?? {};
    const naturalWonderTiles = Math.max(1, Math.trunc(numberValue(policy.naturalWonderTiles) ?? 1));
    const localProjectionDirection = normalizeDirectionForReadback(entry.direction);
    const localProjectionOffsets = [
      ...(getNaturalWonderFootprintOffsets(policy, entry.direction) ?? []),
    ];
    const supportedDirections = [0, 1, 2, 3, 4, 5].flatMap((direction) => {
      const offsets = getNaturalWonderFootprintOffsets(policy, direction);
      if (!offsets) return [];
      return [{ direction, offsets: [...offsets] }];
    });
    const directionClass = naturalWonderDirectionClass({
      naturalWonderTiles,
      declaredDirection: entry.direction,
      supportedDirections,
    });
    const observedReadbacks = readbacksByFeature.get(entry.featureType) ?? [];
    return {
      featureType: entry.featureType,
      featureSymbol: symbolFor("feature", entry.featureType),
      placementClass: stringValue(policy.placementClass) ?? "ONE",
      naturalWonderTiles,
      declaredDirection: entry.direction,
      localProjectionDirection,
      localProjectionOffsets,
      supportedDirections,
      directionClass,
      observedReadbacks,
      readbackDisposition: naturalWonderReadbackDisposition(observedReadbacks),
    };
  });
}

export function buildNaturalWonderLiveProofBoundaryContext(
  proof: Pick<FinalSurfaceParityProof, "local" | "exactAuthorshipPacket">
): NaturalWonderLiveProofBoundaryContext {
  const localPlacementStats = readNaturalWonderPlacementStats(
    proof.local.evidence?.naturalWonderPlacement
  );
  const liveTelemetryPlacementStats = readNaturalWonderPlacementStatsFromLogTelemetry(
    proof.exactAuthorshipPacket?.log
  );
  const liveProofPlacementStats = readNaturalWonderPlacementStatsFromLogPayload(
    proof.exactAuthorshipPacket?.log,
    "proofPayload"
  );
  const liveCompletionPlacementStats = readNaturalWonderPlacementStatsFromLogPayload(
    proof.exactAuthorshipPacket?.log,
    "completionPayload"
  );
  const hasLocal = localPlacementStats !== null;
  const hasLive =
    liveTelemetryPlacementStats !== null ||
    liveProofPlacementStats !== null ||
    liveCompletionPlacementStats !== null;
  const unresolvedLinks: string[] = [];
  if (!hasLocal) unresolvedLinks.push("natural-wonder.local-placement-stats");
  if (!hasLive) unresolvedLinks.push("natural-wonder.live-placement-stats");
  return {
    localPlacementStats,
    liveTelemetryPlacementStats,
    liveProofPlacementStats,
    liveCompletionPlacementStats,
    boundaryClass: naturalWonderLiveProofBoundaryClass({ hasLocal, hasLive }),
    unresolvedLinks,
  };
}

export function buildResourceDeltaPlacementContexts(
  proof: Pick<FinalSurfaceParityProof, "local" | "live">,
  options: { maxRows?: number } = {}
): ReadonlyArray<ResourceDeltaPlacementContext> {
  const maxRows = options.maxRows ?? Number.POSITIVE_INFINITY;
  const resourcePlan = readResourcePlanEvidence(proof.local.evidence);
  const outcomes = readResourceOutcomeEvidence(proof.local.evidence);
  const planIntents = readResourcePlanIntentEvidence(proof.local.evidence);
  const rows: ResourceDeltaPlacementContext[] = [];
  const localValues = proof.local.surfaces.resource.values;
  const liveValues = proof.live.surfaces.resource.values;
  const length = Math.min(localValues.length, liveValues.length);

  for (let index = 0; index < length; index += 1) {
    const localResource = normalizeSurfaceValue(localValues[index]);
    const liveResource = normalizeSurfaceValue(liveValues[index]);
    if (localResource === liveResource) continue;
    const y = Math.floor(index / proof.local.width);
    const x = index - y * proof.local.width;
    const plannedPreferredResourceType = resourcePlan.preferredByPlot.get(index) ?? null;
    const localOutcome = outcomes.byPlot.get(index) ?? null;
    const localContext = cellSurfaceContext(proof.local, x, y);
    const liveContext = cellSurfaceContext(proof.live, x, y);
    rows.push({
      x,
      y,
      plotIndex: index,
      localResource: {
        value: localResource,
        symbol: symbolFor("resource", localResource),
      },
      liveResource: {
        value: liveResource,
        symbol: symbolFor("resource", liveResource),
      },
      localContext,
      liveContext,
      legality: {
        ...(localResource === null
          ? {}
          : {
              localValueOnLocal: staticSurfaceLegality(
                proof.local,
                "resource",
                x,
                y,
                localResource
              ),
            }),
        ...(localResource === null
          ? {}
          : {
              localValueOnLive: staticSurfaceLegality(proof.live, "resource", x, y, localResource),
            }),
        ...(liveResource === null
          ? {}
          : {
              liveValueOnLocal: staticSurfaceLegality(proof.local, "resource", x, y, liveResource),
            }),
        ...(liveResource === null
          ? {}
          : { liveValueOnLive: staticSurfaceLegality(proof.live, "resource", x, y, liveResource) }),
      },
      plannedPreferredResourceType,
      plannedPreferredResourceSymbol: symbolFor("resource", plannedPreferredResourceType),
      localOutcome,
      planIntent: planIntents.byPlot.get(index) ?? null,
      resourceNeighborhood: {
        minSpacingTiles: resourcePlan.minSpacingTiles,
        localResourceOnLocal:
          localResource === null
            ? null
            : resourceNeighborhood(proof.local, x, y, localResource, resourcePlan.minSpacingTiles),
        localResourceOnLive:
          localResource === null
            ? null
            : resourceNeighborhood(proof.live, x, y, localResource, resourcePlan.minSpacingTiles),
        liveResourceOnLocal:
          liveResource === null
            ? null
            : resourceNeighborhood(proof.local, x, y, liveResource, resourcePlan.minSpacingTiles),
        liveResourceOnLive:
          liveResource === null
            ? null
            : resourceNeighborhood(proof.live, x, y, liveResource, resourcePlan.minSpacingTiles),
      },
      evidenceClass: classifyResourceDeltaPlacement({
        localResource,
        liveResource,
        plannedPreferredResourceType,
        localOutcome,
      }),
    });
    if (rows.length >= maxRows) return rows;
  }

  return rows;
}

export function buildResourceDeltaFeasibilityContexts(
  proof: Pick<FinalSurfaceParityProof, "local" | "live">,
  feasibility: ResourceFeasibilityReadbackLike,
  options: { maxRows?: number } = {}
): ReadonlyArray<ResourceDeltaFeasibilityContext> {
  const byCell = readResourceFeasibilityByCell(feasibility);
  return buildResourceDeltaPlacementContexts(proof, options).map((row) => {
    const cell = byCell.get(resourceFeasibilityCellKey(row.x, row.y, row.plotIndex));
    const localFeasibleInCiv =
      row.localResource.value === null
        ? null
        : readResourceFeasibilityProbe(cell, row.localResource.value);
    const liveFeasibleInCiv =
      row.liveResource.value === null
        ? null
        : readResourceFeasibilityProbe(cell, row.liveResource.value);
    return {
      ...row,
      localFeasibleInCiv,
      liveFeasibleInCiv,
      feasibilityClass: classifyResourceDeltaFeasibility({
        evidenceClass: row.evidenceClass,
        localFeasibleInCiv,
        liveFeasibleInCiv,
      }),
    };
  });
}

export function buildTerrainDeltaEdgeContexts(
  proof: Pick<FinalSurfaceParityProof, "local" | "live">,
  options: { maxRows?: number } = {}
): ReadonlyArray<TerrainDeltaEdgeContext> {
  const maxRows = options.maxRows ?? Number.POSITIVE_INFINITY;
  const rows: TerrainDeltaEdgeContext[] = [];
  const localValues = proof.local.surfaces.terrain.values;
  const liveValues = proof.live.surfaces.terrain.values;
  const length = Math.min(localValues.length, liveValues.length);

  for (let index = 0; index < length; index += 1) {
    const localTerrain = normalizeSurfaceValue(localValues[index]);
    const liveTerrain = normalizeSurfaceValue(liveValues[index]);
    if (localTerrain === liveTerrain) continue;
    const y = Math.floor(index / proof.local.width);
    const x = index - y * proof.local.width;
    const neighborhood = terrainDeltaNeighborhood(proof.local, proof.live, x, y);
    rows.push({
      x,
      y,
      plotIndex: index,
      localTerrain: {
        value: localTerrain,
        symbol: symbolFor("terrain", localTerrain),
        context: cellSurfaceContext(proof.local, x, y),
      },
      liveTerrain: {
        value: liveTerrain,
        symbol: symbolFor("terrain", liveTerrain),
        context: cellSurfaceContext(proof.live, x, y),
      },
      neighborhood,
      localProjection: terrainProjectionRowContext(proof.local, index),
      evidenceClass: classifyTerrainDeltaEdge(localTerrain, liveTerrain),
      sourceAuthorityStatus: "unresolved",
      ownerCandidates: terrainOwnerCandidates(localTerrain, liveTerrain),
    });
    if (rows.length >= maxRows) return rows;
  }

  return rows;
}

export function buildSurfaceDeltaContext(
  local: FinalSurfaceSnapshot,
  live: FinalSurfaceSnapshot,
  key: ClassifiableSurfaceKey,
  x: number,
  y: number
): SurfaceDeltaContext {
  const localValue = surfaceValue(local, key, x, y);
  const liveValue = surfaceValue(live, key, x, y);
  const localContext = cellSurfaceContext(local, x, y);
  const liveContext = cellSurfaceContext(live, x, y);
  return {
    key,
    x,
    y,
    local: {
      value: localValue,
      symbol: symbolFor(key, localValue),
      context: localContext,
    },
    live: {
      value: liveValue,
      symbol: symbolFor(key, liveValue),
      context: liveContext,
    },
    legality: {
      ...(localValue === null
        ? {}
        : { localValueOnLocal: staticSurfaceLegality(local, key, x, y, localValue) }),
      ...(localValue === null
        ? {}
        : { localValueOnLive: staticSurfaceLegality(live, key, x, y, localValue) }),
      ...(liveValue === null
        ? {}
        : { liveValueOnLocal: staticSurfaceLegality(local, key, x, y, liveValue) }),
      ...(liveValue === null
        ? {}
        : { liveValueOnLive: staticSurfaceLegality(live, key, x, y, liveValue) }),
    },
  };
}

export function staticSurfaceLegality(
  snapshot: FinalSurfaceSnapshot,
  key: ClassifiableSurfaceKey,
  x: number,
  y: number,
  type: number
): StaticSurfaceLegality {
  const context = cellSurfaceContext(snapshot, x, y);
  const reasons: string[] = [];
  if (key === "feature") {
    addFeatureSurfaceReasons(reasons, type, context);
  } else {
    addResourceSurfaceReasons(reasons, snapshot, x, y, type, context);
  }
  return {
    kind: key,
    type,
    symbol: symbolFor(key, type),
    terrain: context.terrain,
    terrainSymbol: context.terrainSymbol,
    biome: context.biome,
    biomeSymbol: context.biomeSymbol,
    feature: context.feature,
    featureSymbol: context.featureSymbol,
    validSurface: reasons.length === 0,
    reasons,
    ...(key === "resource"
      ? { resourcePolicy: resourceStaticPolicyContext(snapshot, x, y, type, context) }
      : {}),
  };
}

export function cellSurfaceContext(
  snapshot: SnapshotLike,
  x: number,
  y: number
): CellSurfaceContext {
  const terrain = surfaceValue(snapshot, "terrain", x, y);
  const biome = surfaceValue(snapshot, "biome", x, y);
  const feature = surfaceValue(snapshot, "feature", x, y);
  const resource = surfaceValue(snapshot, "resource", x, y);
  return {
    terrain,
    terrainSymbol: symbolFor("terrain", terrain),
    biome,
    biomeSymbol: symbolFor("biome", biome),
    feature,
    featureSymbol: symbolFor("feature", feature),
    resource,
    resourceSymbol: symbolFor("resource", resource),
  };
}

function addFeatureSurfaceReasons(
  reasons: string[],
  featureType: number,
  context: CellSurfaceContext
): void {
  const terrainRows = CIV7_BROWSER_TABLES_V0.featureValidTerrainTypeIndices[String(featureType)];
  if (terrainRows?.length && !terrainRows.includes(context.terrain ?? -1)) {
    reasons.push("feature.terrain");
  }
  const biomeRows = CIV7_BROWSER_TABLES_V0.featureValidBiomeTypeIndices[String(featureType)];
  if (biomeRows?.length && !biomeRows.includes(context.biome ?? -1)) {
    reasons.push("feature.biome");
  }
}

function findPairedFeatureDelta(
  row: FeatureDeltaPlacementContext,
  rows: ReadonlyArray<FeatureDeltaPlacementContext>,
  width: number
): FeatureDeltaPairContext | null {
  const featureType = row.local.value ?? row.live.value;
  if (featureType === null || !isNaturalWonderFeature(featureType)) return null;
  let best: FeatureDeltaPairContext | null = null;
  for (const candidate of rows) {
    if (candidate.plotIndex === row.plotIndex) continue;
    const sameFeatureMovedFromLocal =
      row.local.value === featureType &&
      row.live.value === null &&
      candidate.local.value === null &&
      candidate.live.value === featureType;
    const sameFeatureMovedFromLive =
      row.local.value === null &&
      row.live.value === featureType &&
      candidate.local.value === featureType &&
      candidate.live.value === null;
    if (!sameFeatureMovedFromLocal && !sameFeatureMovedFromLive) continue;
    const distance = hexDistanceOddQPeriodicX(row.plotIndex, candidate.plotIndex, width);
    const pair = {
      x: candidate.x,
      y: candidate.y,
      plotIndex: candidate.plotIndex,
      distance,
      localFeature: {
        value: candidate.local.value,
        symbol: candidate.local.symbol,
      },
      liveFeature: {
        value: candidate.live.value,
        symbol: candidate.live.symbol,
      },
    };
    if (
      best === null ||
      pair.distance < best.distance ||
      (pair.distance === best.distance && pair.plotIndex < best.plotIndex)
    ) {
      best = pair;
    }
  }
  return best;
}

function classifyFeatureDelta(
  row: FeatureDeltaPlacementContext,
  pair: FeatureDeltaPairContext | null
): FeatureDeltaPlacementContext["evidenceClass"] {
  const localFeature = row.local.value;
  const liveFeature = row.live.value;
  const featureType = localFeature ?? liveFeature;
  if (featureType === null) return "unclassified";
  if (pair !== null && pair.distance <= 1 && isNaturalWonderFeature(featureType)) {
    return localFeature === featureType
      ? "natural-wonder-offset-local-anchor"
      : "natural-wonder-offset-live-anchor";
  }
  if (localFeature !== null && liveFeature === null && !isNaturalWonderFeature(localFeature)) {
    return "local-only-ecology-feature";
  }
  if (localFeature === null && liveFeature !== null && !isNaturalWonderFeature(liveFeature)) {
    return "live-only-ecology-feature";
  }
  return "unclassified";
}

function isNaturalWonderFeature(featureType: number): boolean {
  const policy = CIV7_BROWSER_TABLES_V0.featurePolicies[String(featureType)];
  return typeof policy?.naturalWonderTiles === "number" && policy.naturalWonderTiles > 0;
}

function readFeatureIntentEvidence(snapshot: FinalSurfaceSnapshot): {
  byPlot: ReadonlyMap<number, FeatureIntentContext>;
} {
  const byPlot = new Map<number, FeatureIntentContext>();
  const evidence = snapshot.evidence;
  const featureIntents = isRecord(evidence) ? evidence.featureIntents : undefined;
  if (!isRecord(featureIntents)) return { byPlot };
  for (const [family, rawIntents] of Object.entries(featureIntents)) {
    if (!Array.isArray(rawIntents)) continue;
    for (const rawIntent of rawIntents) {
      if (!isRecord(rawIntent)) continue;
      const x = finiteInteger(rawIntent.x);
      const y = finiteInteger(rawIntent.y);
      const feature = stringValue(rawIntent.feature);
      if (x === null || y === null || feature === null) continue;
      if (x < 0 || x >= snapshot.width || y < 0 || y >= snapshot.height) continue;
      const plotIndex = y * snapshot.width + x;
      byPlot.set(plotIndex, {
        family,
        feature,
        weight: numberValue(rawIntent.weight),
      });
    }
  }
  return { byPlot };
}

function readNaturalWonderFootprintEvidence(snapshot: FinalSurfaceSnapshot): {
  byPlot: ReadonlyMap<number, NaturalWonderFootprintContext>;
} {
  const byPlot = new Map<number, NaturalWonderFootprintContext>();
  for (const placement of readNaturalWonderPlacementEvidence(snapshot).placements) {
    const footprint = getNaturalWonderFootprintIndices({
      x: placement.anchorX,
      y: placement.anchorY,
      width: snapshot.width,
      height: snapshot.height,
      policy: CIV7_BROWSER_TABLES_V0.featurePolicies[String(placement.featureType)] ?? {},
      direction: placement.direction,
    }) ?? [placement.anchorPlotIndex];
    for (const plotIndex of footprint) {
      byPlot.set(plotIndex, {
        anchorPlotIndex: placement.anchorPlotIndex,
        anchorX: placement.anchorX,
        anchorY: placement.anchorY,
        featureType: placement.featureType,
        featureSymbol: symbolFor("feature", placement.featureType),
        direction: placement.direction,
        priority: placement.priority,
        footprintDistanceFromAnchor: hexDistanceOddQPeriodicX(
          placement.anchorPlotIndex,
          plotIndex,
          snapshot.width
        ),
      });
    }
  }
  return { byPlot };
}

function readNaturalWonderPlacementEvidence(snapshot: FinalSurfaceSnapshot): {
  placements: ReadonlyArray<{
    anchorPlotIndex: number;
    anchorX: number;
    anchorY: number;
    featureType: number;
    direction: number;
    priority: number | null;
  }>;
} {
  const placements = [];
  const evidence = snapshot.evidence;
  const naturalWonderPlan = isRecord(evidence) ? evidence.naturalWonderPlan : undefined;
  const rawPlacements =
    isRecord(naturalWonderPlan) && Array.isArray(naturalWonderPlan.placements)
      ? naturalWonderPlan.placements
      : [];
  for (const rawPlacement of rawPlacements) {
    if (!isRecord(rawPlacement)) continue;
    const anchorPlotIndex = finiteInteger(rawPlacement.plotIndex);
    const featureType = finiteInteger(rawPlacement.featureType);
    const direction = finiteInteger(rawPlacement.direction);
    if (anchorPlotIndex === null || featureType === null || direction === null) continue;
    const anchorY = Math.floor(anchorPlotIndex / snapshot.width);
    const anchorX = anchorPlotIndex - anchorY * snapshot.width;
    placements.push({
      anchorPlotIndex,
      anchorX,
      anchorY,
      featureType,
      direction,
      priority: numberValue(rawPlacement.priority),
    });
  }
  return { placements };
}

function buildNaturalWonderDirectionAlternatives(
  row: Pick<FeatureDeltaPlacementContext, "plotIndex" | "local" | "live">,
  pairedSameFeatureDelta: FeatureDeltaPairContext | null,
  placements: ReadonlyArray<{
    anchorPlotIndex: number;
    anchorX: number;
    anchorY: number;
    featureType: number;
    direction: number;
  }>,
  width: number,
  height: number
): NaturalWonderDirectionAlternativesContext | null {
  const featureType = row.local.value ?? row.live.value;
  if (featureType === null || !isNaturalWonderFeature(featureType)) return null;
  const placement = placements
    .filter((candidate) => candidate.featureType === featureType)
    .sort(
      (left, right) =>
        hexDistanceOddQPeriodicX(left.anchorPlotIndex, row.plotIndex, width) -
        hexDistanceOddQPeriodicX(right.anchorPlotIndex, row.plotIndex, width)
    )[0];
  if (!placement) return null;
  const pairedPlotIndex = pairedSameFeatureDelta?.plotIndex ?? null;
  const policy = CIV7_BROWSER_TABLES_V0.featurePolicies[String(featureType)] ?? {};
  const candidates = [0, 1, 2, 3, 4, 5].flatMap((direction) => {
    const footprintPlotIndexes = getNaturalWonderFootprintIndices({
      x: placement.anchorX,
      y: placement.anchorY,
      width,
      height,
      policy,
      direction,
    });
    if (!footprintPlotIndexes) return [];
    return [
      {
        direction,
        footprintPlotIndexes,
        containsRow: footprintPlotIndexes.includes(row.plotIndex),
        containsPairedRow:
          pairedPlotIndex === null ? null : footprintPlotIndexes.includes(pairedPlotIndex),
      },
    ];
  });
  return {
    anchorPlotIndex: placement.anchorPlotIndex,
    anchorX: placement.anchorX,
    anchorY: placement.anchorY,
    featureType,
    featureSymbol: symbolFor("feature", featureType),
    declaredDirection: placement.direction,
    rowPlotIndex: row.plotIndex,
    pairedPlotIndex,
    candidates,
    directionsContainingRow: candidates
      .filter((candidate) => candidate.containsRow)
      .map((candidate) => candidate.direction),
    directionsContainingPairedRow: candidates
      .filter((candidate) => candidate.containsPairedRow === true)
      .map((candidate) => candidate.direction),
  };
}

function countFeatureMatches(
  snapshot: SnapshotLike,
  plotIndexes: ReadonlyArray<number>,
  featureType: number
): number {
  let count = 0;
  for (const plotIndex of plotIndexes) {
    if (normalizeSurfaceValue(snapshot.surfaces.feature.values[plotIndex]) === featureType) {
      count += 1;
    }
  }
  return count;
}

function maxMatchCount(
  candidates: ReadonlyArray<NaturalWonderFootprintReadbackCandidate>,
  key: "localMatchCount" | "liveMatchCount"
): number {
  return candidates.reduce((max, candidate) => Math.max(max, candidate[key]), 0);
}

function normalizeDirectionForReadback(direction: number): number {
  if (!Number.isFinite(direction) || direction < 0) return 0;
  return Math.trunc(direction) % 6;
}

function classifyNaturalWonderFootprintReadback(args: {
  bestLocalMatchCount: number;
  bestLiveMatchCount: number;
  bestLocalDirections: ReadonlyArray<number>;
  bestLiveDirections: ReadonlyArray<number>;
}): NaturalWonderFootprintReadbackContext["classification"] {
  if (args.bestLocalMatchCount === 0 && args.bestLiveMatchCount === 0) return "unclassified";
  if (args.bestLocalMatchCount === 0) return "local-footprint-missing";
  if (args.bestLiveMatchCount === 0) return "live-footprint-missing";
  const sharedDirection = args.bestLocalDirections.some((direction) =>
    args.bestLiveDirections.includes(direction)
  );
  return sharedDirection ? "local-live-same-direction" : "live-direction-differs-from-local";
}

function naturalWonderDirectionClass(args: {
  naturalWonderTiles: number;
  declaredDirection: number;
  supportedDirections: ReadonlyArray<NaturalWonderFootprintCatalogDirectionContext>;
}): NaturalWonderFootprintCatalogContext["directionClass"] {
  if (args.supportedDirections.length === 0) return "unsupported";
  if (args.naturalWonderTiles <= 1) return "single-tile-direction-irrelevant";
  if (args.declaredDirection >= 0) return "official-fixed-direction";
  return "unspecified-engine-direction-local-fixed-projection";
}

function naturalWonderReadbackDisposition(
  observedReadbacks: ReadonlyArray<NaturalWonderFootprintCatalogReadbackContext>
): NaturalWonderFootprintCatalogContext["readbackDisposition"] {
  if (observedReadbacks.length === 0) return "no-exact-run-evidence";
  if (
    observedReadbacks.some(
      (readback) => readback.classification === "live-direction-differs-from-local"
    )
  ) {
    return "observed-live-direction-drift";
  }
  if (
    observedReadbacks.some(
      (readback) =>
        readback.classification === "live-footprint-missing" ||
        readback.classification === "local-footprint-missing" ||
        readback.bestLiveDirections.length > 1 ||
        readback.bestLocalDirections.length > 1
    )
  ) {
    return "observed-ambiguous-or-partial";
  }
  return "observed-local-live-aligned";
}

function naturalWonderLiveProofBoundaryClass(args: {
  hasLocal: boolean;
  hasLive: boolean;
}): NaturalWonderLiveProofBoundaryContext["boundaryClass"] {
  if (args.hasLocal && args.hasLive) return "local-and-live-placement-stats-present";
  if (args.hasLocal) return "local-placement-stats-only";
  if (args.hasLive) return "live-placement-stats-only";
  return "placement-stats-missing";
}

function readNaturalWonderPlacementStats(
  value: unknown
): NaturalWonderPlacementStatsContext | null {
  if (!isRecord(value)) return null;
  const coordinateProof = readNaturalWonderCoordinateProof(value.coordinateProof);
  const rejectionExamples = Array.isArray(value.rejectionExamples)
    ? value.rejectionExamples
        .filter((entry): entry is string => typeof entry === "string")
        .slice(0, 8)
    : [];
  const stats = {
    plannedCount: numberValue(value.plannedCount),
    targetCount: numberValue(value.targetCount),
    placedCount: numberValue(value.placedCount),
    rejectedCount: numberValue(value.rejectedCount),
    shortfallCount: numberValue(value.shortfallCount),
    rejectionExamples,
    coordinateProof,
  };
  return stats.plannedCount !== null ||
    stats.targetCount !== null ||
    stats.placedCount !== null ||
    stats.rejectedCount !== null ||
    stats.shortfallCount !== null ||
    stats.coordinateProof !== null
    ? stats
    : null;
}

function readNaturalWonderPlacementStatsFromLogPayload(
  log: unknown,
  payloadKey: "proofPayload" | "completionPayload"
): NaturalWonderPlacementStatsContext | null {
  if (!isRecord(log)) return null;
  const payload = log[payloadKey];
  if (!isRecord(payload)) return null;
  return readNaturalWonderPlacementStats(payload.naturalWonderPlacement);
}

function readNaturalWonderPlacementStatsFromLogTelemetry(
  log: unknown
): NaturalWonderPlacementStatsContext | null {
  if (!isRecord(log)) return null;
  const telemetry = log.naturalWonderPlacement;
  if (!isRecord(telemetry)) return null;
  return (
    readNaturalWonderPlacementStats(telemetry.payload) ??
    readNaturalWonderPlacementStats({
      ...(isRecord(telemetry.stats) ? telemetry.stats : {}),
      ...(isRecord(telemetry.coordinateProof)
        ? { coordinateProof: telemetry.coordinateProof }
        : {}),
    })
  );
}

function readNaturalWonderCoordinateProof(
  value: unknown
): NaturalWonderPlacementStatsContext["coordinateProof"] {
  if (!isRecord(value)) return null;
  const nestedPlaced = readCoordinateDigest(value.placed);
  const nestedRejected = readCoordinateDigest(value.rejected);
  const flatPlacedCount = numberValue(value.placedCount);
  const flatPlacedHash32 = hash32Value(value.placedHash32);
  const flatRejectedCount = numberValue(value.rejectedCount);
  const flatRejectedHash32 = hash32Value(value.rejectedHash32);
  const placed = nestedPlaced ?? {
    count: flatPlacedCount,
    hash32: flatPlacedHash32,
  };
  const rejected = nestedRejected ?? {
    count: flatRejectedCount,
    hash32: flatRejectedHash32,
  };
  if (
    placed.count === null &&
    placed.hash32 === null &&
    rejected.count === null &&
    rejected.hash32 === null
  ) {
    return null;
  }
  return {
    version: numberValue(value.version),
    placed,
    rejected,
  };
}

function addResourceSurfaceReasons(
  reasons: string[],
  snapshot: FinalSurfaceSnapshot,
  x: number,
  y: number,
  resourceType: number,
  context: CellSurfaceContext
): void {
  const rows = CIV7_BROWSER_TABLES_V0.resourceValidPlacementRows[String(resourceType)];
  if (!rows?.length) {
    reasons.push("resource.unknown");
    return;
  }
  const surfaceMatches = rows.some(
    (row) =>
      row[0] === context.biome && row[1] === context.terrain && row[2] === (context.feature ?? -1)
  );
  if (!surfaceMatches) reasons.push("resource.surface");
  const flags = CIV7_BROWSER_TABLES_V0.resourcePlacementFlags[String(resourceType)];
  if (
    flags?.adjacentToLand &&
    !isResourceAdjacentToLandRuntimeOptional(resourceType) &&
    !hasAdjacentLand(snapshot, x, y)
  ) {
    reasons.push("resource.adjacent-land");
  }
}

function resourceStaticPolicyContext(
  snapshot: FinalSurfaceSnapshot,
  x: number,
  y: number,
  resourceType: number,
  context: CellSurfaceContext
): ResourceStaticPolicyContext {
  const rows = CIV7_BROWSER_TABLES_V0.resourceValidPlacementRows[String(resourceType)] ?? [];
  const matchingRows = rows
    .filter(
      (row) =>
        row[0] === context.biome && row[1] === context.terrain && row[2] === (context.feature ?? -1)
    )
    .map((row) => ({
      biome: row[0],
      biomeSymbol: symbolFor("biome", row[0]),
      terrain: row[1],
      terrainSymbol: symbolFor("terrain", row[1]),
      feature: row[2] < 0 ? null : row[2],
      featureSymbol: symbolFor("feature", row[2] < 0 ? null : row[2]),
    }));
  const flags = CIV7_BROWSER_TABLES_V0.resourcePlacementFlags[String(resourceType)];
  return {
    matchingRows,
    flags:
      flags === undefined
        ? null
        : {
            adjacentToLand: flags.adjacentToLand,
            adjacentToLandRuntimeOptional: isResourceAdjacentToLandRuntimeOptional(resourceType),
            lakeEligible: flags.lakeEligible,
          },
    hasAdjacentLand: hasAdjacentLand(snapshot, x, y),
  };
}

function resourceNeighborhood(
  snapshot: SnapshotLike,
  x: number,
  y: number,
  resourceType: number,
  minSpacingTiles: number | null
): ResourceNeighborhoodContext {
  const plotIndex = y * snapshot.width + x;
  const nearestSameType = nearestResourceNeighbor(snapshot, plotIndex, resourceType);
  const nearestAnyResource = nearestResourceNeighbor(snapshot, plotIndex, null);
  return {
    nearestSameType,
    nearestAnyResource,
    sameTypeWithinMinSpacing: isWithinMinSpacing(nearestSameType, minSpacingTiles),
    anyResourceWithinMinSpacing: isWithinMinSpacing(nearestAnyResource, minSpacingTiles),
  };
}

function nearestResourceNeighbor(
  snapshot: SnapshotLike,
  originPlotIndex: number,
  resourceType: number | null
): ResourceNeighborContext | null {
  let best: ResourceNeighborContext | null = null;
  for (let plotIndex = 0; plotIndex < snapshot.width * snapshot.height; plotIndex += 1) {
    if (plotIndex === originPlotIndex) continue;
    const value = normalizeSurfaceValue(snapshot.surfaces.resource.values[plotIndex]);
    if (value === null) continue;
    if (resourceType !== null && value !== resourceType) continue;
    const y = Math.floor(plotIndex / snapshot.width);
    const x = plotIndex - y * snapshot.width;
    const distance = hexDistanceOddQPeriodicX(originPlotIndex, plotIndex, snapshot.width);
    const candidate = {
      distance,
      x,
      y,
      plotIndex,
      resourceType: value,
      resourceSymbol: symbolFor("resource", value),
    };
    if (
      best === null ||
      candidate.distance < best.distance ||
      (candidate.distance === best.distance && candidate.plotIndex < best.plotIndex)
    ) {
      best = candidate;
    }
  }
  return best;
}

function isWithinMinSpacing(
  neighbor: ResourceNeighborContext | null,
  minSpacingTiles: number | null
): boolean | null {
  if (minSpacingTiles === null) return null;
  return neighbor !== null && neighbor.distance < minSpacingTiles;
}

function hasAdjacentLand(snapshot: SnapshotLike, x: number, y: number): boolean {
  const offsets = (x & 1) === 1 ? ODD_Q_NEIGHBORS_ODD : ODD_Q_NEIGHBORS_EVEN;
  for (const [dx, dy] of offsets) {
    const ny = y + dy;
    if (ny < 0 || ny >= snapshot.height) continue;
    const nx = snapshot.width > 0 ? wrapX(x + dx, snapshot.width) : x + dx;
    const terrain = surfaceValue(snapshot, "terrain", nx, ny);
    if (terrain !== null && !WATER_TERRAINS.has(terrain)) return true;
  }
  return false;
}

function terrainDeltaNeighborhood(
  local: SnapshotLike,
  live: SnapshotLike,
  x: number,
  y: number
): TerrainDeltaNeighborhoodContext {
  const offsets = (x & 1) === 1 ? ODD_Q_NEIGHBORS_ODD : ODD_Q_NEIGHBORS_EVEN;
  const neighbors = offsets.flatMap(
    ([dx, dy], direction): ReadonlyArray<TerrainDeltaNeighborContext> => {
      const ny = y + dy;
      if (ny < 0 || ny >= local.height) return [];
      const nx = local.width > 0 ? wrapX(x + dx, local.width) : x + dx;
      const plotIndex = ny * local.width + nx;
      const localTerrain = surfaceValue(local, "terrain", nx, ny);
      const liveTerrain = surfaceValue(live, "terrain", nx, ny);
      return [
        {
          direction,
          x: nx,
          y: ny,
          plotIndex,
          localTerrain: {
            value: localTerrain,
            symbol: symbolFor("terrain", localTerrain),
            waterClass: terrainWaterClass(localTerrain),
          },
          liveTerrain: {
            value: liveTerrain,
            symbol: symbolFor("terrain", liveTerrain),
            waterClass: terrainWaterClass(liveTerrain),
          },
        },
      ];
    }
  );
  return {
    neighbors,
    localCounts: countTerrainNeighborClasses(neighbors, "localTerrain"),
    liveCounts: countTerrainNeighborClasses(neighbors, "liveTerrain"),
  };
}

function countTerrainNeighborClasses(
  neighbors: ReadonlyArray<TerrainDeltaNeighborContext>,
  side: "localTerrain" | "liveTerrain"
): TerrainNeighborhoodCounts {
  const counts = { coast: 0, ocean: 0, otherWater: 0, land: 0, empty: 0 };
  for (const neighbor of neighbors) {
    const waterClass = neighbor[side].waterClass;
    if (waterClass === "coast") counts.coast += 1;
    else if (waterClass === "ocean") counts.ocean += 1;
    else if (waterClass === "other-water") counts.otherWater += 1;
    else if (waterClass === "land") counts.land += 1;
    else counts.empty += 1;
  }
  return counts;
}

function classifyTerrainDeltaEdge(
  localTerrain: number | null,
  liveTerrain: number | null
): TerrainDeltaEdgeContext["evidenceClass"] {
  const localClass = terrainWaterClass(localTerrain);
  const liveClass = terrainWaterClass(liveTerrain);
  if (localClass === "ocean" && liveClass === "coast") return "local-ocean-live-coast";
  if (localClass === "coast" && liveClass === "ocean") return "local-coast-live-ocean";
  if (isWaterClass(localClass) && isWaterClass(liveClass)) return "water-terrain-edge-swap";
  return "unclassified";
}

function terrainOwnerCandidates(
  localTerrain: number | null,
  liveTerrain: number | null
): TerrainDeltaEdgeContext["ownerCandidates"] {
  const localClass = terrainWaterClass(localTerrain);
  const liveClass = terrainWaterClass(liveTerrain);
  if (isWaterClass(localClass) && isWaterClass(liveClass)) {
    return [
      "map-morphology-coast-shelf-projection",
      "map-hydrology-water-mutation",
      "civ-engine-terrain-validation",
      "evidence-insufficient",
    ];
  }
  return ["evidence-insufficient"];
}

function isWaterClass(value: TerrainWaterClass): boolean {
  return value === "coast" || value === "ocean" || value === "other-water";
}

function terrainWaterClass(value: number | null): TerrainWaterClass {
  if (value === null) return "empty";
  if (value === CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST) return "coast";
  if (value === CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_OCEAN) return "ocean";
  return WATER_TERRAINS.has(value) ? "other-water" : "land";
}

function terrainProjectionRowContext(
  snapshot: FinalSurfaceSnapshot,
  plotIndex: number
): TerrainProjectionRowContext | null {
  const projection =
    isRecord(snapshot.evidence) && isRecord(snapshot.evidence.terrainProjection)
      ? snapshot.evidence.terrainProjection
      : undefined;
  if (!projection) return null;
  const morphology = isRecord(projection.coastlineMetrics)
    ? projection.coastlineMetrics
    : undefined;
  const mapMorphologyCoastPolicy = isRecord(projection.mapMorphologyCoastPolicy)
    ? projection.mapMorphologyCoastPolicy
    : undefined;
  const mapMorphologyCoastTerrainSnapshot = isRecord(projection.mapMorphologyCoastTerrainSnapshot)
    ? projection.mapMorphologyCoastTerrainSnapshot
    : undefined;
  const mapMorphologyContinentValidationSnapshot = isRecord(
    projection.mapMorphologyContinentValidationSnapshot
  )
    ? projection.mapMorphologyContinentValidationSnapshot
    : undefined;
  const hydrologyLakePlan = isRecord(projection.hydrologyLakePlan)
    ? projection.hydrologyLakePlan
    : undefined;
  const mapHydrologyProjection = isRecord(projection.mapHydrologyProjection)
    ? projection.mapHydrologyProjection
    : undefined;
  const hydrologyTerrainSnapshot = isRecord(projection.hydrologyTerrainSnapshot)
    ? projection.hydrologyTerrainSnapshot
    : undefined;
  const mapElevationTerrainSnapshot = isRecord(projection.mapElevationTerrainSnapshot)
    ? projection.mapElevationTerrainSnapshot
    : undefined;
  const mapRiversTerrainSnapshot = isRecord(projection.mapRiversTerrainSnapshot)
    ? projection.mapRiversTerrainSnapshot
    : undefined;
  const placementSurfacePreparation = isRecord(projection.placementSurfacePreparation)
    ? projection.placementSurfacePreparation
    : undefined;
  const placementTerrainSnapshot = isRecord(projection.placementTerrainSnapshot)
    ? projection.placementTerrainSnapshot
    : undefined;
  const placementValidationBoundary = isRecord(projection.placementValidationBoundary)
    ? projection.placementValidationBoundary
    : undefined;
  return {
    morphology: morphology
      ? {
          coastalLand: indexedInteger(morphology.coastalLand, plotIndex),
          coastalWater: indexedInteger(morphology.coastalWater, plotIndex),
          shelfMask: indexedInteger(morphology.shelfMask, plotIndex),
          distanceToCoast: indexedInteger(morphology.distanceToCoast, plotIndex),
        }
      : null,
    mapMorphologyCoastPolicy: mapMorphologyCoastPolicy
      ? {
          baseWaterClass: indexedInteger(mapMorphologyCoastPolicy.baseWaterClass, plotIndex),
          sourceCoastMask: indexedInteger(mapMorphologyCoastPolicy.sourceCoastMask, plotIndex),
          waterClass: indexedInteger(mapMorphologyCoastPolicy.waterClass, plotIndex),
          policyCoastMask: indexedInteger(mapMorphologyCoastPolicy.policyCoastMask, plotIndex),
          coastBufferTiles: finiteInteger(mapMorphologyCoastPolicy.coastBufferTiles),
          promotedOceanToCoast: finiteInteger(mapMorphologyCoastPolicy.promotedOceanToCoast),
        }
      : null,
    mapMorphologyCoastTerrainSnapshot: projectionSnapshotRowContext(
      mapMorphologyCoastTerrainSnapshot,
      plotIndex
    ),
    mapMorphologyContinentValidationSnapshot: projectionSnapshotRowContext(
      mapMorphologyContinentValidationSnapshot,
      plotIndex
    ),
    hydrologyLakePlan: hydrologyLakePlan
      ? {
          lakeMask: indexedInteger(hydrologyLakePlan.lakeMask, plotIndex),
          plannedLakeTileCount: finiteInteger(hydrologyLakePlan.plannedLakeTileCount),
          sinkLakeCount: finiteInteger(hydrologyLakePlan.sinkLakeCount),
        }
      : null,
    mapHydrologyProjection: mapHydrologyProjection
      ? {
          lakeMask: indexedInteger(mapHydrologyProjection.lakeMask, plotIndex),
          plannedLakeMask: indexedInteger(mapHydrologyProjection.plannedLakeMask, plotIndex),
          engineWaterMask: indexedInteger(mapHydrologyProjection.engineWaterMask, plotIndex),
          engineLakeMask: indexedInteger(mapHydrologyProjection.engineLakeMask, plotIndex),
          engineTerrain: indexedInteger(mapHydrologyProjection.engineTerrain, plotIndex),
          engineTerrainSymbol: symbolFor(
            "terrain",
            indexedInteger(mapHydrologyProjection.engineTerrain, plotIndex)
          ),
          engineAreaId: indexedInteger(mapHydrologyProjection.engineAreaId, plotIndex),
          terrainMismatchMask: indexedInteger(
            mapHydrologyProjection.terrainMismatchMask,
            plotIndex
          ),
          terrainMismatchTileCount: finiteInteger(mapHydrologyProjection.terrainMismatchTileCount),
          nonLakeTileCount: finiteInteger(mapHydrologyProjection.nonLakeTileCount),
          morphologyProtectedLakeTileCount: finiteInteger(
            mapHydrologyProjection.morphologyProtectedLakeTileCount
          ),
        }
      : null,
    hydrologyTerrainSnapshot: projectionSnapshotRowContext(hydrologyTerrainSnapshot, plotIndex),
    mapElevationTerrainSnapshot: projectionSnapshotRowContext(
      mapElevationTerrainSnapshot,
      plotIndex
    ),
    mapRiversTerrainSnapshot: projectionSnapshotRowContext(mapRiversTerrainSnapshot, plotIndex),
    placementSurfacePreparation: placementSurfacePreparation
      ? {
          acceptedLakeTileCount: finiteInteger(placementSurfacePreparation.acceptedLakeTileCount),
          finalLakeWaterDriftCount: finiteInteger(
            placementSurfacePreparation.finalLakeWaterDriftCount
          ),
          finalLakeClassificationDriftCount: finiteInteger(
            placementSurfacePreparation.finalLakeClassificationDriftCount
          ),
        }
      : null,
    placementTerrainSnapshot: projectionSnapshotRowContext(placementTerrainSnapshot, plotIndex),
    placementValidationBoundary: validationBoundaryRowContext(
      placementValidationBoundary,
      plotIndex
    ),
  };
}

function validationBoundaryRowContext(
  snapshot: Record<string, unknown> | undefined,
  plotIndex: number
): TerrainValidationBoundaryRowContext | null {
  if (!snapshot) return null;
  const beforeValidate = isRecord(snapshot.beforeValidate) ? snapshot.beforeValidate : undefined;
  const afterValidate = isRecord(snapshot.afterValidate) ? snapshot.afterValidate : undefined;
  const afterMaintenance = isRecord(snapshot.afterMaintenance)
    ? snapshot.afterMaintenance
    : undefined;
  return {
    beforeValidate: validationBoundaryFactContext(beforeValidate, plotIndex),
    afterValidate: validationBoundaryFactContext(afterValidate, plotIndex),
    afterMaintenance: validationBoundaryFactContext(afterMaintenance, plotIndex),
  };
}

function validationBoundaryFactContext(
  snapshot: Record<string, unknown> | undefined,
  plotIndex: number
): TerrainValidationBoundaryFactContext | null {
  if (!snapshot) return null;
  const terrain = indexedInteger(snapshot.terrain, plotIndex);
  return {
    stage: stringValue(snapshot.stage) ?? null,
    terrain,
    terrainSymbol: symbolFor("terrain", terrain),
    waterMask: indexedInteger(snapshot.waterMask, plotIndex),
    lakeMask: indexedInteger(snapshot.lakeMask, plotIndex),
    areaId: indexedInteger(snapshot.areaId, plotIndex),
  };
}

function projectionSnapshotRowContext(
  snapshot: Record<string, unknown> | undefined,
  plotIndex: number
): TerrainProjectionSnapshotRowContext | null {
  if (!snapshot) return null;
  const terrain = indexedInteger(snapshot.terrain, plotIndex);
  return {
    stage: typeof snapshot.stage === "string" ? snapshot.stage : null,
    landMask: indexedInteger(snapshot.landMask, plotIndex),
    terrain,
    terrainSymbol: symbolFor("terrain", terrain),
  };
}

function indexedInteger(value: unknown, index: number): number | null {
  if (Array.isArray(value)) return finiteInteger(value[index]);
  if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
    return finiteInteger((value as ArrayLike<number>)[index]);
  }
  if (isRecord(value)) return finiteInteger(value[String(index)]);
  return null;
}

function readResourcePlanEvidence(evidence: unknown): {
  preferredByPlot: ReadonlyMap<number, number>;
  minSpacingTiles: number | null;
} {
  const preferredByPlot = new Map<number, number>();
  // S5: prefer the support-ADJUSTED plan when present — its intents are the
  // ones actually stamped; the base resourcePlan stays as fallback evidence.
  const evidenceRecord = isRecord(evidence) ? evidence : undefined;
  const plan = isRecord(evidenceRecord?.resourcePlanAdjusted)
    ? evidenceRecord.resourcePlanAdjusted
    : evidenceRecord?.resourcePlan;
  // S3 plan shape: typed per-plot intents (plan authority); the planned type
  // IS the stamped type, so "preferred" == planned resourceTypeId.
  const intents = isRecord(plan) && Array.isArray(plan.intents) ? plan.intents : [];
  // siteSpacingTiles lives on the BASE plan (the adjusted plan does not
  // re-declare selection settings).
  const basePlan = evidenceRecord?.resourcePlan;
  const minSpacingTiles = isRecord(basePlan) ? finiteInteger(basePlan.siteSpacingTiles) : null;
  for (const intent of intents) {
    if (!isRecord(intent)) continue;
    const plotIndex = finiteInteger(intent.plotIndex);
    const resourceTypeId = finiteInteger(intent.resourceTypeId);
    if (plotIndex === null || resourceTypeId === null || preferredByPlot.has(plotIndex)) {
      continue;
    }
    preferredByPlot.set(plotIndex, resourceTypeId);
  }
  return { preferredByPlot, minSpacingTiles };
}

function readResourceOutcomeEvidence(evidence: unknown): {
  byPlot: ReadonlyMap<number, ResourcePlacementOutcomeContext>;
} {
  const byPlot = new Map<number, ResourcePlacementOutcomeContext>();
  const resourcePlacementOutcomes = isRecord(evidence)
    ? evidence.resourcePlacementOutcomes
    : undefined;
  const outcomes =
    isRecord(resourcePlacementOutcomes) && Array.isArray(resourcePlacementOutcomes.outcomes)
      ? resourcePlacementOutcomes.outcomes
      : [];
  for (const outcome of outcomes) {
    if (!isRecord(outcome)) continue;
    const plotIndex = finiteInteger(outcome.plotIndex);
    const resourceType = finiteInteger(outcome.resourceType);
    if (plotIndex === null || resourceType === null || byPlot.has(plotIndex)) continue;
    const observedResourceType = finiteInteger(outcome.observedResourceType);
    byPlot.set(plotIndex, {
      status: typeof outcome.status === "string" ? outcome.status : "unknown",
      resourceType,
      resourceSymbol: symbolFor("resource", resourceType),
      observedResourceType,
      observedResourceSymbol: symbolFor("resource", observedResourceType),
      reason: typeof outcome.reason === "string" ? outcome.reason : null,
    });
  }
  return { byPlot };
}

function readResourcePlanIntentEvidence(evidence: unknown): {
  byPlot: ReadonlyMap<number, ResourcePlanIntentContext>;
} {
  const byPlot = new Map<number, ResourcePlanIntentContext>();
  const evidenceRecord = isRecord(evidence) ? evidence : undefined;
  const plan = isRecord(evidenceRecord?.resourcePlanAdjusted)
    ? evidenceRecord.resourcePlanAdjusted
    : evidenceRecord?.resourcePlan;
  const intents = isRecord(plan) && Array.isArray(plan.intents) ? plan.intents : [];
  for (const row of intents) {
    if (!isRecord(row)) continue;
    const plotIndex = finiteInteger(row.plotIndex);
    const resourceType = finiteInteger(row.resourceTypeId);
    if (plotIndex === null || resourceType === null || byPlot.has(plotIndex)) {
      continue;
    }
    byPlot.set(plotIndex, {
      resourceType,
      resourceSymbol: symbolFor("resource", resourceType),
      resourceTypeName: typeof row.resourceType === "string" ? row.resourceType : null,
      phase: typeof row.phase === "string" ? row.phase : "unknown",
      family: typeof row.family === "string" ? row.family : null,
      laneId: typeof row.laneId === "string" ? row.laneId : null,
      inHabitat: typeof row.inHabitat === "boolean" ? row.inHabitat : null,
      order: finiteInteger(row.order),
    });
  }
  return { byPlot };
}

function readResourceFeasibilityByCell(
  feasibility: ResourceFeasibilityReadbackLike
): ReadonlyMap<string, ResourceFeasibilityCellLike> {
  const byCell = new Map<string, ResourceFeasibilityCellLike>();
  const cells = Array.isArray(feasibility.cells) ? feasibility.cells : [];
  for (const cell of cells) {
    const location = cell.location;
    const x = finiteInteger(location?.x);
    const y = finiteInteger(location?.y);
    const index = finiteInteger(location?.index?.value);
    if (x === null || y === null || index === null) continue;
    byCell.set(resourceFeasibilityCellKey(x, y, index), cell);
  }
  return byCell;
}

function readResourceFeasibilityProbe(
  cell: ResourceFeasibilityCellLike | undefined,
  resourceType: number
): ResourceFeasibilityProbe {
  const probe = cell?.feasibility?.[String(resourceType)];
  if (probe === undefined) {
    return { ok: false, value: null, error: "missing-probe" };
  }
  const ok = probe.ok === true;
  return {
    ok,
    value: ok && typeof probe.value === "boolean" ? probe.value : null,
    error: typeof probe.error === "string" ? probe.error : ok ? null : "probe-failed",
  };
}

function classifyResourceDeltaPlacement(args: {
  localResource: number | null;
  liveResource: number | null;
  plannedPreferredResourceType: number | null;
  localOutcome: ResourcePlacementOutcomeContext | null;
}): ResourceDeltaPlacementContext["evidenceClass"] {
  const localAssigned =
    args.localResource !== null &&
    args.localOutcome?.status === "placed" &&
    args.localOutcome.resourceType === args.localResource;
  if (localAssigned && args.liveResource === null) return "local-assigned-live-empty";
  if (localAssigned && args.liveResource !== null && args.liveResource !== args.localResource) {
    return "local-assigned-live-substitution";
  }
  if (args.localResource === null && args.liveResource !== null) {
    return args.plannedPreferredResourceType === args.liveResource
      ? "live-only-preferred-but-unassigned"
      : "live-only-no-local-assignment";
  }
  return "unclassified";
}

function classifyResourceDeltaFeasibility(args: {
  evidenceClass: ResourceDeltaPlacementContext["evidenceClass"];
  localFeasibleInCiv: ResourceFeasibilityProbe | null;
  liveFeasibleInCiv: ResourceFeasibilityProbe | null;
}): ResourceDeltaFeasibilityContext["feasibilityClass"] {
  const local = args.localFeasibleInCiv;
  const live = args.liveFeasibleInCiv;
  if ((local !== null && !local.ok) || (live !== null && !live.ok)) return "feasibility-missing";
  if (
    args.evidenceClass === "live-only-no-local-assignment" ||
    args.evidenceClass === "live-only-preferred-but-unassigned"
  ) {
    return live?.value === true ? "live-feasible-no-local-assignment" : "feasibility-missing";
  }
  if (args.evidenceClass === "local-assigned-live-empty") {
    if (local?.value === true) return "local-feasible-live-empty";
    if (local?.value === false) return "local-overaccepted-live-empty";
    return "feasibility-missing";
  }
  if (args.evidenceClass === "local-assigned-live-substitution") {
    if (local?.value === true && live?.value === true) return "substitution-both-feasible";
    if (local?.value === false && live?.value === false) return "substitution-both-infeasible";
    if (local !== null && live !== null) return "substitution-mixed-feasibility";
    return "feasibility-missing";
  }
  return "unclassified";
}

function resourceFeasibilityCellKey(x: number, y: number, plotIndex: number): string {
  return `${plotIndex}:${x},${y}`;
}

function finiteInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function hash32Value(value: unknown): string | null {
  return typeof value === "string" && /^[0-9a-f]{8}$/i.test(value) ? value.toLowerCase() : null;
}

function readCoordinateDigest(
  value: unknown
): Readonly<{ count: number | null; hash32: string | null }> | null {
  if (!isRecord(value)) return null;
  const count = numberValue(value.count);
  const hash32 = hash32Value(value.hash32);
  return count === null && hash32 === null ? null : { count, hash32 };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function surfaceValue(
  snapshot: SnapshotLike,
  key: FinalSurfaceKey,
  x: number,
  y: number
): number | null {
  if (x < 0 || y < 0 || x >= snapshot.width || y >= snapshot.height) return null;
  const value = snapshot.surfaces[key].values[y * snapshot.width + x];
  return normalizeSurfaceValue(value);
}

function normalizeSurfaceValue(value: number | null | undefined): number | null {
  if (value == null || value < 0) return null;
  return value;
}

function symbolFor(key: FinalSurfaceKey, value: number | null): string {
  if (value === null) return "empty";
  const lookup =
    key === "terrain"
      ? TERRAIN_SYMBOL_BY_ID
      : key === "biome"
        ? BIOME_SYMBOL_BY_ID
        : key === "feature"
          ? FEATURE_SYMBOL_BY_ID
          : RESOURCE_SYMBOL_BY_ID;
  return lookup[value] ?? `UNKNOWN_${key.toUpperCase()}_${value}`;
}

function invertNumberMap(
  value: Readonly<Record<string, number>>
): Readonly<Record<number, string>> {
  return Object.fromEntries(Object.entries(value).map(([key, id]) => [id, key]));
}

function wrapX(x: number, width: number): number {
  return ((x % width) + width) % width;
}
