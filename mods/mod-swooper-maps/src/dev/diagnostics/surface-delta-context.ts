import {
  CIV7_BROWSER_TABLES_V0,
  NATURAL_WONDER_CATALOG,
  getNaturalWonderFootprintOffsets,
  getNaturalWonderFootprintIndices,
  isResourceAdjacentToLandRuntimeOptional,
} from "@civ7/map-policy";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";

import type { FinalSurfaceKey, FinalSurfaceParityProof, FinalSurfaceSnapshot } from "./live-parity.js";

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
  assignmentTrace: ResourceAssignmentTraceContext | null;
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

export type ResourcePlacementOutcomeContext = Readonly<{
  status: string;
  resourceType: number;
  resourceSymbol: string;
  observedResourceType: number | null;
  observedResourceSymbol: string;
  reason: string | null;
}>;

export type ResourceAssignmentTraceContext = Readonly<{
  resourceType: number;
  resourceSymbol: string;
  initialResourceType: number;
  initialResourceSymbol: string;
  preferredResourceType: number | null;
  preferredResourceSymbol: string;
  assignmentPhase: string;
  reassignedByRebalance: boolean;
  assignmentOrder: number | null;
  perTypeCountBefore: number | null;
  legalPlotCountForResource: number | null;
  targetMinPerType: number | null;
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
      const localMatchCount = countFeatureMatches(proof.local, footprintPlotIndexes, placement.featureType);
      const liveMatchCount = countFeatureMatches(proof.live, footprintPlotIndexes, placement.featureType);
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
    const declared = candidates.find((candidate) => candidate.direction === declaredDirection) ?? candidates[0];
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
    const localProjectionOffsets = [...(getNaturalWonderFootprintOffsets(policy, entry.direction) ?? [])];
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

export function buildResourceDeltaPlacementContexts(
  proof: Pick<FinalSurfaceParityProof, "local" | "live">,
  options: { maxRows?: number } = {}
): ReadonlyArray<ResourceDeltaPlacementContext> {
  const maxRows = options.maxRows ?? Number.POSITIVE_INFINITY;
  const resourcePlan = readResourcePlanEvidence(proof.local.evidence);
  const outcomes = readResourceOutcomeEvidence(proof.local.evidence);
  const assignmentTrace = readResourceAssignmentTraceEvidence(proof.local.evidence);
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
          : { localValueOnLocal: staticSurfaceLegality(proof.local, "resource", x, y, localResource) }),
        ...(localResource === null
          ? {}
          : { localValueOnLive: staticSurfaceLegality(proof.live, "resource", x, y, localResource) }),
        ...(liveResource === null
          ? {}
          : { liveValueOnLocal: staticSurfaceLegality(proof.local, "resource", x, y, liveResource) }),
        ...(liveResource === null
          ? {}
          : { liveValueOnLive: staticSurfaceLegality(proof.live, "resource", x, y, liveResource) }),
      },
      plannedPreferredResourceType,
      plannedPreferredResourceSymbol: symbolFor("resource", plannedPreferredResourceType),
      localOutcome,
      assignmentTrace: assignmentTrace.byPlot.get(index) ?? null,
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
      ...(localValue === null ? {} : { localValueOnLocal: staticSurfaceLegality(local, key, x, y, localValue) }),
      ...(localValue === null ? {} : { localValueOnLive: staticSurfaceLegality(live, key, x, y, localValue) }),
      ...(liveValue === null ? {} : { liveValueOnLocal: staticSurfaceLegality(local, key, x, y, liveValue) }),
      ...(liveValue === null ? {} : { liveValueOnLive: staticSurfaceLegality(live, key, x, y, liveValue) }),
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

export function cellSurfaceContext(snapshot: SnapshotLike, x: number, y: number): CellSurfaceContext {
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
        footprintDistanceFromAnchor: hexDistanceOddQPeriodicX(placement.anchorPlotIndex, plotIndex, snapshot.width),
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
  const rawPlacements = isRecord(naturalWonderPlan) && Array.isArray(naturalWonderPlan.placements)
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
  if (observedReadbacks.some((readback) => readback.classification === "live-direction-differs-from-local")) {
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
      row[0] === context.biome &&
      row[1] === context.terrain &&
      row[2] === (context.feature ?? -1)
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
        row[0] === context.biome &&
        row[1] === context.terrain &&
        row[2] === (context.feature ?? -1)
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

function readResourcePlanEvidence(evidence: unknown): {
  preferredByPlot: ReadonlyMap<number, number>;
  minSpacingTiles: number | null;
} {
  const preferredByPlot = new Map<number, number>();
  const plan = isRecord(evidence) ? evidence.resourcePlan : undefined;
  const placements = isRecord(plan) && Array.isArray(plan.placements) ? plan.placements : [];
  const minSpacingTiles = isRecord(plan) ? finiteInteger(plan.minSpacingTiles) : null;
  for (const placement of placements) {
    if (!isRecord(placement)) continue;
    const plotIndex = finiteInteger(placement.plotIndex);
    const preferredResourceType = finiteInteger(placement.preferredResourceType);
    if (plotIndex === null || preferredResourceType === null || preferredByPlot.has(plotIndex)) {
      continue;
    }
    preferredByPlot.set(plotIndex, preferredResourceType);
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

function readResourceAssignmentTraceEvidence(evidence: unknown): {
  byPlot: ReadonlyMap<number, ResourceAssignmentTraceContext>;
} {
  const byPlot = new Map<number, ResourceAssignmentTraceContext>();
  const resourcePlacementOutcomes = isRecord(evidence)
    ? evidence.resourcePlacementOutcomes
    : undefined;
  const trace =
    isRecord(resourcePlacementOutcomes) && Array.isArray(resourcePlacementOutcomes.assignmentTrace)
      ? resourcePlacementOutcomes.assignmentTrace
      : [];
  for (const row of trace) {
    if (!isRecord(row)) continue;
    const plotIndex = finiteInteger(row.plotIndex);
    const resourceType = finiteInteger(row.resourceType);
    const initialResourceType = finiteInteger(row.initialResourceType);
    if (
      plotIndex === null ||
      resourceType === null ||
      initialResourceType === null ||
      byPlot.has(plotIndex)
    ) {
      continue;
    }
    const preferredResourceType = finiteInteger(row.preferredResourceType);
    byPlot.set(plotIndex, {
      resourceType,
      resourceSymbol: symbolFor("resource", resourceType),
      initialResourceType,
      initialResourceSymbol: symbolFor("resource", initialResourceType),
      preferredResourceType,
      preferredResourceSymbol: symbolFor("resource", preferredResourceType),
      assignmentPhase: typeof row.assignmentPhase === "string" ? row.assignmentPhase : "unknown",
      reassignedByRebalance: row.reassignedByRebalance === true,
      assignmentOrder: finiteInteger(row.assignmentOrder),
      perTypeCountBefore: finiteInteger(row.perTypeCountBefore),
      legalPlotCountForResource: finiteInteger(row.legalPlotCountForResource),
      targetMinPerType: finiteInteger(row.targetMinPerType),
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

function invertNumberMap(value: Readonly<Record<string, number>>): Readonly<Record<number, string>> {
  return Object.fromEntries(Object.entries(value).map(([key, id]) => [id, key]));
}

function wrapX(x: number, width: number): number {
  return ((x % width) + width) % width;
}
