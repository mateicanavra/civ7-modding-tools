/// <reference types="@civ7/types" />

import {
  CIV7_STANDARD_ROW_LATITUDE_BOUNDS,
  createMockAdapter,
  getCiv7StandardMapSizePresetForDimensions,
} from "@civ7/adapter";
import {
  createExtendedMapContext,
  createLabelRng,
  sha256Hex,
  stableStringify,
} from "@swooper/mapgen-core";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
import type { TraceEvent, TraceSink } from "@swooper/mapgen-core/trace";

import { canonicalRecipeConfig, isPlainObject as isCanonicalMapConfigObject } from "../../maps/configs/canonical.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../recipes/standard/runtime.js";
import { mapArtifacts } from "../../recipes/standard/map-artifacts.js";
import { ecologyArtifacts } from "../../recipes/standard/stages/ecology/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../recipes/standard/stages/hydrology-hydrography/artifacts.js";
import { mapElevationArtifacts } from "../../recipes/standard/stages/map-elevation/artifacts.js";
import { mapHydrologyArtifacts } from "../../recipes/standard/stages/map-hydrology/artifacts.js";
import { mapMorphologyArtifacts } from "../../recipes/standard/stages/map-morphology/artifacts.js";
import { mapRiversArtifacts } from "../../recipes/standard/stages/map-rivers/artifacts.js";
import { morphologyArtifacts } from "../../recipes/standard/stages/morphology/artifacts.js";
import { placementArtifacts } from "../../recipes/standard/stages/placement/artifacts.js";
import { isPlainObject, mergeDeep } from "./shared.js";

export const FINAL_SURFACE_KEYS = ["terrain", "biome", "feature", "resource"] as const;

export type FinalSurfaceKey = (typeof FINAL_SURFACE_KEYS)[number];

export type SurfaceGrid = Readonly<{
  width: number;
  height: number;
  values: ReadonlyArray<number | null>;
}>;

export type FinalSurfaceSnapshot = Readonly<{
  source: "local-mapgen" | "live-civ7";
  width: number;
  height: number;
  seed?: number;
  configHash?: string;
  envelopeHash?: string;
  surfaces: Readonly<Record<FinalSurfaceKey, SurfaceGrid>>;
  evidence?: Readonly<Record<string, unknown>>;
}>;

export type SurfaceMismatchExample = Readonly<{
  x: number;
  y: number;
  local: number | null;
  live: number | null;
  classification: "unclassified" | "missing-live-readback";
}>;

export type SurfaceDiffSummary = Readonly<{
  key: FinalSurfaceKey;
  status: "match" | "mismatch" | "dimension-mismatch";
  compared: number;
  missingLive: number;
  mismatches: number;
  mismatchPct: number;
  examples: ReadonlyArray<SurfaceMismatchExample>;
  pairCounts: ReadonlyArray<Readonly<{ local: number | null; live: number | null; count: number }>>;
}>;

export type ParityResidualClassification = Readonly<{
  key: "rivers" | "floodplains" | "starts" | "wonders";
  status:
    | "covered-by-terrain-grid"
    | "covered-by-feature-grid"
    | "not-applicable"
    | "direct-control-readback-limitation"
    | "unresolved";
  owner:
    | "mapgen-authored-policy"
    | "civ-engine-policy"
    | "direct-control-readback"
    | "evidence-insufficient";
  evidence: string;
}>;

type ResourcePlacementCoordinateProofComparison = Readonly<{
  status: "match" | "mismatch" | "missing-exact-log";
  local: Readonly<{
    placed?: Readonly<{ count?: number; hash32?: string }>;
    rejected?: Readonly<{ count?: number; hash32?: string }>;
    mismatch?: Readonly<{ count?: number; hash32?: string }>;
  }>;
  exact?: Readonly<{
    placed?: Readonly<{ count?: number; hash32?: string }>;
    rejected?: Readonly<{ count?: number; hash32?: string }>;
    mismatch?: Readonly<{ count?: number; hash32?: string }>;
  }>;
  mismatchedLinks: ReadonlyArray<string>;
}>;

type NaturalWonderPlanCoordinateProofComparison = Readonly<{
  status: "match" | "mismatch" | "missing-exact-log" | "missing-local-plan";
  local?: Readonly<{
    planned?: Readonly<{ count?: number; hash32?: string }>;
  }>;
  exact?: Readonly<{
    planned?: Readonly<{ count?: number; hash32?: string }>;
  }>;
  rowComparisons: ReadonlyArray<NaturalWonderPlanRowComparison>;
  mismatchedLinks: ReadonlyArray<string>;
}>;

type NaturalWonderPlanInputContextProofComparison = Readonly<{
  status: "compared" | "missing-exact-log" | "missing-local-input";
  surfaceDigests?: NaturalWonderPlanInputSurfaceDigestComparison;
  rowComparisons: ReadonlyArray<NaturalWonderPlanInputRowComparison>;
}>;

type NaturalWonderPlanInputSurfaceDigestComparison = Readonly<{
  status: "match" | "mismatch" | "missing-exact-log" | "missing-local-input";
  exact?: NaturalWonderPlanInputSurfaceDigests;
  local?: NaturalWonderPlanInputSurfaceDigests;
  mismatchedFields: ReadonlyArray<keyof NaturalWonderPlanInputSurfaceDigests>;
}>;

type NaturalWonderPlanRowComparison = Readonly<{
  featureType: number;
  classification:
    | "exact-local-same-anchor"
    | "exact-local-anchor-diverged"
    | "exact-only"
    | "local-only";
  exact?: NaturalWonderPlanRow;
  local?: NaturalWonderPlanRow;
  distance?: number;
  elevationDelta?: number;
  priorityDeltaPpm?: number;
}>;

type NaturalWonderPlanRow = Readonly<{
  plotIndex: number;
  x: number;
  y: number;
  featureType: number;
  direction: number;
  elevation?: number;
  priorityPpm?: number;
}>;

type NaturalWonderPlanInputRowComparison = Readonly<{
  featureType: number;
  classification:
    | "exact-local-same-anchor-input-match"
    | "exact-local-same-anchor-input-drift"
    | "exact-local-anchor-diverged"
    | "exact-only"
    | "local-only";
  exact?: NaturalWonderPlanInputRow;
  local?: NaturalWonderPlanInputRow;
  distance?: number;
  inputDelta?: NaturalWonderPlanInputDelta;
}>;

type NaturalWonderPlanInputRow = Readonly<{
  plotIndex: number;
  x: number;
  y: number;
  featureType: number;
  terrainType: number;
  biomeType: number;
  occupiedFeatureType: number;
  elevation: number;
  aridityPpm: number;
  riverClass: number;
  lakeMask: number;
  blockedMask: number;
  landMask: number;
}>;

type NaturalWonderPlanInputDelta = Readonly<Partial<{
  terrainType: Readonly<{ exact: number; local: number }>;
  biomeType: Readonly<{ exact: number; local: number }>;
  occupiedFeatureType: Readonly<{ exact: number; local: number }>;
  elevationDelta: number;
  aridityPpmDelta: number;
  riverClassDelta: number;
  lakeMaskDelta: number;
  blockedMaskDelta: number;
  landMaskDelta: number;
}>>;

type NaturalWonderPlanInputSurfaceDigests = Readonly<{
  version: number;
  plotCount: number;
  landMaskHash32: string;
  elevationHash32: string;
  aridityPpmHash32: string;
  riverClassHash32: string;
  lakeMaskHash32: string;
  blockedMaskHash32: string;
  terrainTypeHash32: string;
  biomeTypeHash32: string;
  featureTypeHash32: string;
}>;

const NATURAL_WONDER_PLAN_INPUT_SURFACE_DIGEST_FIELDS: readonly (keyof NaturalWonderPlanInputSurfaceDigests)[] = [
  "version",
  "plotCount",
  "landMaskHash32",
  "elevationHash32",
  "aridityPpmHash32",
  "riverClassHash32",
  "lakeMaskHash32",
  "blockedMaskHash32",
  "terrainTypeHash32",
  "biomeTypeHash32",
  "featureTypeHash32",
];

export type ResourcePlacementRejectionContext = Readonly<{
  exact: Readonly<{
    status: string;
    resourceType: number;
    resource?: string | null;
    plotIndex: number;
    x?: number;
    y?: number;
    reason?: string | null;
    observedResourceType?: number | null;
    observedResource?: string | null;
    assignmentPhase?: string;
    assignmentOrder?: number;
    initialResourceType?: number;
    preferredResourceType?: number | null;
    perTypeCountBefore?: number;
    legalPlotCountForResource?: number;
    targetMinPerType?: number;
  }>;
  local: Readonly<{
    surfaceResourceType?: number | null;
    preferredPlacement?: Readonly<{
      preferredResourceType: number;
      preferredTypeOffset?: number;
      priority?: number;
    }>;
    outcome?: Readonly<{
      status: string;
      resourceType: number;
      observedResourceType?: number | null;
      reason?: string | null;
    }>;
    assignment?: Readonly<{
      resourceType: number;
      initialResourceType: number;
      preferredResourceType?: number | null;
      assignmentPhase: string;
      reassignedByRebalance?: boolean;
      assignmentOrder?: number;
      perTypeCountBefore?: number;
      legalPlotCountForResource?: number;
      targetMinPerType?: number;
    }>;
  }>;
}>;

export type FinalSurfaceParityProof = Readonly<{
  status: "complete" | "unresolved";
  createdAt: string;
  exactAuthorshipPacket?: ExactAuthorshipProofLike;
  exactAuthorshipSummary: Readonly<{
    requestId?: string;
    status?: string;
    configHash?: string;
    envelopeHash?: string;
    seed?: number;
    mapSize?: string;
    dimensions?: Readonly<{ width?: number; height?: number }>;
    runtime?: unknown;
  }>;
  local: FinalSurfaceSnapshot;
  live: FinalSurfaceSnapshot;
  diffs: ReadonlyArray<SurfaceDiffSummary>;
  naturalWonderPlanCoordinateProof?: NaturalWonderPlanCoordinateProofComparison;
  naturalWonderPlanInputContextProof?: NaturalWonderPlanInputContextProofComparison;
  resourcePlacementCoordinateProof?: ResourcePlacementCoordinateProofComparison;
  resourcePlacementRejectionContexts?: ReadonlyArray<ResourcePlacementRejectionContext>;
  residuals: ReadonlyArray<ParityResidualClassification>;
  unresolvedLinks: ReadonlyArray<string>;
}>;

export type RunLocalFinalSurfaceInput = Readonly<{
  width: number;
  height: number;
  seed: number;
  config: unknown;
  configHash?: string;
  envelopeHash?: string;
  override?: unknown;
}>;

export type ExactAuthorshipProofLike = Readonly<{
  status?: string;
  requestId?: string;
  unresolvedLinks?: ReadonlyArray<string>;
  sourceSnapshot?: Readonly<{
    identityHash?: string;
    requestId?: string;
    recipeSettings?: unknown;
    worldSettings?: unknown;
    pipelineConfig?: unknown;
    setupConfig?: unknown;
    materializationMode?: string;
    selectedConfig?: unknown;
    configHash?: string;
    envelopeHash?: string;
  }>;
  request?: Readonly<{
    seed?: number;
    mapSize?: string;
  }>;
  materialization?: Readonly<{
    mode?: string;
    path?: string;
    mapScript?: string;
    configHash?: string;
    envelopeHash?: string;
    sourceConfig?: FileIdentityLike;
    generatedSourceScript?: FileIdentityLike;
    localModScript?: FileIdentityLike;
    deployedModScript?: FileIdentityLike;
  }>;
  runtime?: Readonly<{
    seed?: number;
    width?: number;
    height?: number;
    plotCount?: number;
    turn?: number;
    gameHash?: number;
    sourceSnapshotId?: string;
    snapshotHash?: string;
  }>;
  log?: Readonly<{
    requestId?: string;
    configHash?: string;
    envelopeHash?: string;
    seed?: number;
    dimensions?: Readonly<{ width?: number; height?: number }>;
    resourcePlacement?: Readonly<{
      stats?: Readonly<{
        rejectionRows?: ReadonlyArray<unknown>;
      }>;
      coordinateProof?: Readonly<{
        version?: number;
        placed?: Readonly<{ count?: number; hash32?: string }>;
        rejected?: Readonly<{ count?: number; hash32?: string }>;
        mismatch?: Readonly<{ count?: number; hash32?: string }>;
      }>;
    }>;
    naturalWonderPlacement?: Readonly<{
      stats?: Readonly<{
        version?: number;
        plannedCount?: number;
        targetCount?: number;
        placedCount?: number;
        terrainAdjustedCount?: number;
        skippedOutOfBoundsCount?: number;
        rejectedCount?: number;
        shortfallCount?: number;
        rejectionExampleCount?: number;
        rejectionExamples?: ReadonlyArray<string>;
      }>;
      coordinateProof?: Readonly<{
        version?: number;
        placed?: Readonly<{ count?: number; hash32?: string }>;
        rejected?: Readonly<{ count?: number; hash32?: string }>;
      }>;
      payload?: unknown;
    }>;
    naturalWonderPlan?: Readonly<{
      planRows?: ReadonlyArray<unknown>;
      coordinateProof?: Readonly<{
        version?: number;
        planned?: Readonly<{ count?: number; hash32?: string }>;
      }>;
      payload?: unknown;
    }>;
    naturalWonderPlanInput?: Readonly<{
      stats?: Readonly<{
        version?: number;
        plannedCount?: number;
        rowCount?: number;
      }>;
      surfaceDigests?: unknown;
      inputRows?: ReadonlyArray<unknown>;
      payload?: unknown;
    }>;
  }>;
}>;

type FileIdentityLike = Readonly<{
  path?: string;
  sha256?: string;
  sizeBytes?: number;
  mtimeMs?: number;
  mtimeIso?: string;
}>;

type LocalTraceEvidence = {
  placementParity?: unknown;
  featureIntents?: unknown;
  featureApplyDiagnostics?: unknown;
  naturalWonderPlan?: unknown;
  naturalWonderPlanInput?: unknown;
  naturalWonderPlacement?: unknown;
  resourcePlan?: unknown;
  resourcePlacementOutcomes?: unknown;
  terrainProjection?: unknown;
};

function createMemoryTraceSink(events: TraceEvent[]): TraceSink {
  return {
    emit(event) {
      events.push(event);
    },
  };
}

function createStandardMapInfo(width: number, height: number) {
  const mapSizePreset = getCiv7StandardMapSizePresetForDimensions(width, height);
  const latitudeBounds = mapSizePreset?.latitudeBounds ?? CIV7_STANDARD_ROW_LATITUDE_BOUNDS;
  const mapInfo = {
    ...(mapSizePreset?.mapInfo ?? {}),
    GridWidth: width,
    GridHeight: height,
    MinLatitude: Math.min(latitudeBounds.topLatitude, latitudeBounds.bottomLatitude),
    MaxLatitude: Math.max(latitudeBounds.topLatitude, latitudeBounds.bottomLatitude),
    PlayersLandmass1: mapSizePreset?.mapInfo.PlayersLandmass1 ?? 4,
    PlayersLandmass2: mapSizePreset?.mapInfo.PlayersLandmass2 ?? 4,
    StartSectorRows: mapSizePreset?.mapInfo.StartSectorRows ?? 4,
    StartSectorCols: mapSizePreset?.mapInfo.StartSectorCols ?? 4,
  } as const;
  return { latitudeBounds, mapInfo };
}

function resolveRecipeConfig(config: unknown, override: unknown): unknown {
  if (config === undefined) {
    throw new Error("Final-surface parity local run requires an exact-authored source snapshot config.");
  }
  const loadedConfig = config;
  const baseConfig =
    isCanonicalMapConfigObject(loadedConfig) && isCanonicalMapConfigObject(loadedConfig.config)
      ? canonicalRecipeConfig(loadedConfig)
      : loadedConfig;
  return override && isPlainObject(baseConfig) && isPlainObject(override)
    ? mergeDeep(baseConfig, override)
    : baseConfig;
}

export function runLocalFinalSurfaceSnapshot(input: RunLocalFinalSurfaceInput): FinalSurfaceSnapshot {
  const { width, height, seed } = input;
  const { latitudeBounds, mapInfo } = createStandardMapInfo(width, height);
  const envBase = {
    seed,
    dimensions: { width, height },
    latitudeBounds,
  } as const;
  const config = resolveRecipeConfig(input.config, input.override);
  const plan = standardRecipe.compile(envBase, config);
  const verboseSteps = Object.fromEntries(plan.nodes.map((node: any) => [node.stepId, "verbose"] as const));
  const env = { ...envBase, trace: { enabled: true, steps: verboseSteps } } as const;
  const adapter = createMockAdapter({
    width,
    height,
    mapInfo,
    mapSizeId: mapInfo.MapSizeType ?? 1,
    rng: createLabelRng(seed),
  });
  const context = createExtendedMapContext({ width, height }, adapter, env);
  const traceEvents: TraceEvent[] = [];

  initializeStandardRuntime(context, { mapInfo, logPrefix: "[parity]", storyEnabled: true });
  standardRecipe.run(context, env, config, {
    traceSink: createMemoryTraceSink(traceEvents),
    log: () => {},
  });

  const size = width * height;
  const terrain = new Array<number>(size);
  const biome = new Array<number>(size);
  const feature = new Array<number>(size);
  const resource = new Array<number>(size);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      terrain[index] = adapter.getTerrainType(x, y) | 0;
      biome[index] = adapter.getBiomeType(x, y) | 0;
      feature[index] = adapter.getFeatureType(x, y) | 0;
      resource[index] = adapter.getResourceType(x, y) | 0;
    }
  }

  const evidence: LocalTraceEvidence = {};
  for (const event of traceEvents) {
    if (event.kind !== "step.event" || !isPlainObject(event.data)) continue;
    if (event.data.type === "placement.parity") evidence.placementParity = event.data;
    if (event.data.type === "naturalWonder.planInput") evidence.naturalWonderPlanInput = event.data;
  }
  evidence.featureIntents = {
    vegetation: context.artifacts.get(ecologyArtifacts.featureIntentsVegetation.id),
    wetlands: context.artifacts.get(ecologyArtifacts.featureIntentsWetlands.id),
    reefs: context.artifacts.get(ecologyArtifacts.featureIntentsReefs.id),
    ice: context.artifacts.get(ecologyArtifacts.featureIntentsIce.id),
  };
  const featureApplyDiagnostics = context.artifacts.get(ecologyArtifacts.featureApplyDiagnostics.id);
  if (featureApplyDiagnostics !== undefined) {
    evidence.featureApplyDiagnostics = featureApplyDiagnostics;
  }
  const naturalWonderPlan = context.artifacts.get(placementArtifacts.naturalWonderPlan.id);
  if (naturalWonderPlan !== undefined) evidence.naturalWonderPlan = naturalWonderPlan;
  const naturalWonderPlacement = context.artifacts.get(placementArtifacts.naturalWonderPlacement.id);
  if (naturalWonderPlacement !== undefined) evidence.naturalWonderPlacement = naturalWonderPlacement;
  const resourcePlan = context.artifacts.get(placementArtifacts.resourcePlan.id);
  if (resourcePlan !== undefined) evidence.resourcePlan = resourcePlan;
  const resourcePlacementOutcomes = context.artifacts.get(
    placementArtifacts.resourcePlacementOutcomes.id
  );
  if (resourcePlacementOutcomes !== undefined) {
    evidence.resourcePlacementOutcomes = resourcePlacementOutcomes;
  }
  evidence.terrainProjection = buildTerrainProjectionEvidence(context);

  return {
    source: "local-mapgen",
    width,
    height,
    seed,
    ...(input.configHash === undefined ? {} : { configHash: input.configHash }),
    ...(input.envelopeHash === undefined ? {} : { envelopeHash: input.envelopeHash }),
    surfaces: {
      terrain: { width, height, values: terrain },
      biome: { width, height, values: biome },
      feature: { width, height, values: feature },
      resource: { width, height, values: resource },
    },
    evidence,
  };
}

function buildTerrainProjectionEvidence(context: ReturnType<typeof createExtendedMapContext>): unknown {
  const coastlineMetrics = context.artifacts.get(morphologyArtifacts.coastlineMetrics.id);
  const mapMorphologyCoastPolicy = context.artifacts.get(mapMorphologyArtifacts.coastClassification.id);
  const mapMorphologyCoastTerrainSnapshot = context.artifacts.get(
    mapMorphologyArtifacts.coastEngineTerrainSnapshot.id
  );
  const mapMorphologyContinentValidationSnapshot = context.artifacts.get(
    mapMorphologyArtifacts.continentValidationTerrainSnapshot.id
  );
  const hydrologyLakePlan = context.artifacts.get(hydrologyHydrographyArtifacts.lakePlan.id);
  const mapHydrologyProjection = context.artifacts.get(mapHydrologyArtifacts.engineProjectionLakes.id);
  const hydrologyTerrainSnapshot = context.artifacts.get(
    mapHydrologyArtifacts.hydrologyLakesEngineTerrainSnapshot.id
  );
  const mapElevationTerrainSnapshot = context.artifacts.get(
    mapElevationArtifacts.elevationEngineTerrainSnapshot.id
  );
  const mapRiversTerrainSnapshot = context.artifacts.get(
    mapRiversArtifacts.riversEngineTerrainSnapshot.id
  );
  const placementSurfacePreparation = context.artifacts.get(
    placementArtifacts.placementSurfacePreparation.id
  );
  const placementTerrainSnapshot = context.artifacts.get(
    mapArtifacts.placementEngineTerrainSnapshot.id
  );
  const placementValidationBoundary = context.artifacts.get(
    mapArtifacts.placementSurfaceValidationBoundary.id
  );
  return stripUndefined({
    coastlineMetrics: pickSerializableFields(coastlineMetrics, [
      "coastalLand",
      "coastalWater",
      "shelfMask",
      "distanceToCoast",
    ]),
    mapMorphologyCoastPolicy: pickSerializableFields(mapMorphologyCoastPolicy, [
      "width",
      "height",
      "baseWaterClass",
      "waterClass",
      "policyCoastMask",
      "coastBufferTiles",
      "promotedOceanToCoast",
    ]),
    mapMorphologyCoastTerrainSnapshot: pickSerializableFields(mapMorphologyCoastTerrainSnapshot, [
      "stage",
      "width",
      "height",
      "landMask",
      "terrain",
    ]),
    mapMorphologyContinentValidationSnapshot: pickSerializableFields(
      mapMorphologyContinentValidationSnapshot,
      ["stage", "width", "height", "landMask", "terrain"]
    ),
    hydrologyLakePlan: pickSerializableFields(hydrologyLakePlan, [
      "lakeMask",
      "plannedLakeTileCount",
      "sinkLakeCount",
    ]),
    mapHydrologyProjection: pickSerializableFields(mapHydrologyProjection, [
      "width",
      "height",
      "lakeMask",
      "plannedLakeMask",
      "engineWaterMask",
      "engineLakeMask",
      "engineTerrain",
      "engineAreaId",
      "terrainMismatchMask",
      "sinkMismatchCount",
      "nonLakeTileCount",
      "terrainMismatchTileCount",
      "morphologyProtectedLakeTileCount",
    ]),
    hydrologyTerrainSnapshot: pickSerializableFields(hydrologyTerrainSnapshot, [
      "stage",
      "width",
      "height",
      "landMask",
      "terrain",
    ]),
    mapElevationTerrainSnapshot: pickSerializableFields(mapElevationTerrainSnapshot, [
      "stage",
      "width",
      "height",
      "landMask",
      "terrain",
    ]),
    mapRiversTerrainSnapshot: pickSerializableFields(mapRiversTerrainSnapshot, [
      "stage",
      "width",
      "height",
      "landMask",
      "terrain",
    ]),
    placementSurfacePreparation: pickSerializableFields(placementSurfacePreparation, [
      "acceptedLakeTileCount",
      "finalLakeWaterDriftCount",
      "finalLakeClassificationDriftCount",
    ]),
    placementTerrainSnapshot: pickSerializableFields(placementTerrainSnapshot, [
      "stage",
      "width",
      "height",
      "landMask",
      "terrain",
    ]),
    placementValidationBoundary: pickSerializableFields(placementValidationBoundary, [
      "width",
      "height",
      "beforeValidate",
      "afterValidate",
      "afterMaintenance",
    ]),
  });
}

function pickSerializableFields(
  value: unknown,
  fields: ReadonlyArray<string>
): Readonly<Record<string, unknown>> | undefined {
  if (!isPlainObject(value)) return undefined;
  return stripUndefined(Object.fromEntries(fields.map((field) => [field, serializeEvidenceValue(value[field])])));
}

function serializeEvidenceValue(value: unknown): unknown {
  if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
    return Array.from(value as ArrayLike<number>);
  }
  if (Array.isArray(value)) return value.map((entry) => serializeEvidenceValue(entry));
  if (isPlainObject(value)) {
    return stripUndefined(
      Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, serializeEvidenceValue(entry)]))
    );
  }
  return value;
}

function stripUndefined(value: Record<string, unknown>): Readonly<Record<string, unknown>> | undefined {
  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined);
  return entries.length === 0 ? undefined : Object.fromEntries(entries);
}

export function liveGridToFinalSurfaceSnapshot(args: {
  grid: unknown;
  width: number;
  height: number;
  seed?: number;
  configHash?: string;
  envelopeHash?: string;
  evidence?: Readonly<Record<string, unknown>>;
}): FinalSurfaceSnapshot {
  const { width, height } = args;
  const surfaces = Object.fromEntries(
    FINAL_SURFACE_KEYS.map((key) => [
      key,
      { width, height, values: new Array<number | null>(width * height).fill(null) },
    ])
  ) as Record<FinalSurfaceKey, SurfaceGrid>;
  const plots = isPlainObject(args.grid) && Array.isArray(args.grid.plots) ? args.grid.plots : [];

  for (const plot of plots) {
    if (!isPlainObject(plot) || !isPlainObject(plot.location)) continue;
    const x = numberValue(plot.location.x);
    const y = numberValue(plot.location.y);
    if (x == null || y == null || x < 0 || y < 0 || x >= width || y >= height) continue;
    const index = y * width + x;
    const facts = isPlainObject(plot.facts) ? plot.facts : {};
    for (const key of FINAL_SURFACE_KEYS) {
      const value = probeNumberValue(facts[key]);
      (surfaces[key].values as Array<number | null>)[index] = value;
    }
  }

  return {
    source: "live-civ7",
    width,
    height,
    ...(args.seed === undefined ? {} : { seed: args.seed }),
    ...(args.configHash === undefined ? {} : { configHash: args.configHash }),
    ...(args.envelopeHash === undefined ? {} : { envelopeHash: args.envelopeHash }),
    surfaces,
    ...(args.evidence === undefined ? {} : { evidence: args.evidence }),
  };
}

export function diffFinalSurfaceSnapshots(
  local: FinalSurfaceSnapshot,
  live: FinalSurfaceSnapshot,
  options: { maxExamples?: number; maxPairs?: number } = {}
): ReadonlyArray<SurfaceDiffSummary> {
  const maxExamples = options.maxExamples ?? 16;
  const maxPairs = options.maxPairs ?? 24;
  return FINAL_SURFACE_KEYS.map((key) => {
    const localGrid = local.surfaces[key];
    const liveGrid = live.surfaces[key];
    if (
      localGrid.width !== liveGrid.width ||
      localGrid.height !== liveGrid.height ||
      localGrid.values.length !== liveGrid.values.length
    ) {
      return {
        key,
        status: "dimension-mismatch",
        compared: 0,
        missingLive: 0,
        mismatches: 0,
        mismatchPct: 1,
        examples: [],
        pairCounts: [],
      };
    }

    let missingLive = 0;
    let mismatches = 0;
    const examples: SurfaceMismatchExample[] = [];
    const pairCounts = new Map<string, { local: number | null; live: number | null; count: number }>();

    for (let index = 0; index < localGrid.values.length; index += 1) {
      const localValue = localGrid.values[index] ?? null;
      const liveValue = liveGrid.values[index] ?? null;
      if (liveValue === null) missingLive += 1;
      if (localValue === liveValue) continue;
      mismatches += 1;
      const pairKey = `${localValue ?? "null"}:${liveValue ?? "null"}`;
      const pair = pairCounts.get(pairKey) ?? { local: localValue, live: liveValue, count: 0 };
      pair.count += 1;
      pairCounts.set(pairKey, pair);
      if (examples.length < maxExamples) {
        const y = Math.floor(index / localGrid.width);
        const x = index - y * localGrid.width;
        examples.push({
          x,
          y,
          local: localValue,
          live: liveValue,
          classification: liveValue === null ? "missing-live-readback" : "unclassified",
        });
      }
    }

    const compared = localGrid.values.length;
    const pairs = [...pairCounts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, maxPairs);
    return {
      key,
      status: mismatches === 0 ? "match" : "mismatch",
      compared,
      missingLive,
      mismatches,
      mismatchPct: compared > 0 ? mismatches / compared : 0,
      examples,
      pairCounts: pairs,
    };
  });
}

export function buildFinalSurfaceParityProof(args: {
  exactAuthorship?: ExactAuthorshipProofLike;
  local: FinalSurfaceSnapshot;
  live: FinalSurfaceSnapshot;
  now?: () => Date;
}): FinalSurfaceParityProof {
  const diffs = diffFinalSurfaceSnapshots(args.local, args.live);
  const unresolvedLinks: string[] = [];
  const exact = args.exactAuthorship;
  const naturalWonderPlanCoordinateProof =
    exact === undefined ? undefined : buildNaturalWonderPlanCoordinateProofComparison(exact, args.local);
  const naturalWonderPlanInputContextProof =
    exact === undefined ? undefined : buildNaturalWonderPlanInputContextProofComparison(exact, args.local);
  const resourcePlacementCoordinateProof =
    exact === undefined ? undefined : buildResourcePlacementCoordinateProofComparison(exact, args.local);
  const resourcePlacementRejectionContexts =
    exact === undefined ? [] : buildResourcePlacementRejectionContexts(exact, args.local);

  unresolvedLinks.push(...validateExactAuthorshipProofPacket(exact).unresolvedLinks);
  addSurfaceShapeLinks(unresolvedLinks, args.local, "local", exact?.runtime?.width, exact?.runtime?.height);
  addSurfaceShapeLinks(unresolvedLinks, args.live, "live", exact?.runtime?.width, exact?.runtime?.height);
  addFullGridEvidenceLinks(unresolvedLinks, args.live);
  if (exact) {
    if (exact.request?.seed !== undefined && args.local.seed !== exact.request.seed) {
      unresolvedLinks.push("exact-authorship-proof.request-seed.local-seed");
    }
    if (exact.log?.seed !== undefined && args.local.seed !== exact.log.seed) {
      unresolvedLinks.push("exact-authorship-proof.log-seed.local-seed");
    }
    if (exact.runtime?.seed !== undefined && args.local.seed !== exact.runtime.seed) {
      unresolvedLinks.push("exact-authorship-proof.runtime-seed.local-seed");
    }
    if (exact.runtime?.width !== undefined && args.local.width !== exact.runtime.width) {
      unresolvedLinks.push("exact-authorship-proof.runtime-width.local-width");
    }
    if (exact.runtime?.height !== undefined && args.local.height !== exact.runtime.height) {
      unresolvedLinks.push("exact-authorship-proof.runtime-height.local-height");
    }
    if (exact.log?.dimensions?.width !== undefined && args.local.width !== exact.log.dimensions.width) {
      unresolvedLinks.push("exact-authorship-proof.log-width.local-width");
    }
    if (exact.log?.dimensions?.height !== undefined && args.local.height !== exact.log.dimensions.height) {
      unresolvedLinks.push("exact-authorship-proof.log-height.local-height");
    }
    if (exact.runtime?.seed !== undefined && args.live.seed !== undefined && exact.runtime.seed !== args.live.seed) {
      unresolvedLinks.push("exact-authorship-proof.runtime-seed.live-seed");
    }
    if (exact.runtime?.width !== undefined && exact.runtime.width !== args.live.width) {
      unresolvedLinks.push("exact-authorship-proof.runtime-width.live-width");
    }
    if (exact.runtime?.height !== undefined && exact.runtime.height !== args.live.height) {
      unresolvedLinks.push("exact-authorship-proof.runtime-height.live-height");
    }
    const liveRuntime = isPlainObject(args.live.evidence?.runtime) ? args.live.evidence.runtime : undefined;
    const liveTurn = numberValue(liveRuntime?.turn);
    const liveGameHash = numberValue(liveRuntime?.gameHash);
    const livePlotCount = numberValue(liveRuntime?.plotCount);
    if (exact.runtime?.turn !== undefined && liveTurn !== undefined && exact.runtime.turn !== liveTurn) {
      unresolvedLinks.push("exact-authorship-proof.runtime-turn.live-turn");
    }
    if (exact.runtime?.gameHash !== undefined && liveGameHash !== undefined && exact.runtime.gameHash !== liveGameHash) {
      unresolvedLinks.push("exact-authorship-proof.runtime-game-hash.live-game-hash");
    }
    if (exact.runtime?.plotCount !== undefined && livePlotCount !== undefined && exact.runtime.plotCount !== livePlotCount) {
      unresolvedLinks.push("exact-authorship-proof.runtime-plot-count.live-plot-count");
    }
    if (!exact.runtime?.sourceSnapshotId) unresolvedLinks.push("exact-authorship-proof.runtime.source-snapshot-id");
    if (!exact.runtime?.snapshotHash) unresolvedLinks.push("exact-authorship-proof.runtime.snapshot-hash");
    if (exact.runtime?.turn === undefined) unresolvedLinks.push("exact-authorship-proof.runtime.turn");
    if (exact.runtime?.gameHash === undefined) unresolvedLinks.push("exact-authorship-proof.runtime.game-hash");
    if (exact.sourceSnapshot?.configHash !== undefined && args.local.configHash !== undefined && exact.sourceSnapshot.configHash !== args.local.configHash) {
      unresolvedLinks.push("exact-authorship-proof.config-hash.local-config-hash");
    }
    if (
      exact.sourceSnapshot?.envelopeHash !== undefined &&
      args.local.envelopeHash !== undefined &&
      exact.sourceSnapshot.envelopeHash !== args.local.envelopeHash
    ) {
      unresolvedLinks.push("exact-authorship-proof.envelope-hash.local-envelope-hash");
    }
    if (
      exact.materialization?.configHash !== undefined &&
      args.local.configHash !== undefined &&
      exact.materialization.configHash !== args.local.configHash
    ) {
      unresolvedLinks.push("exact-authorship-proof.materialization-config-hash.local-config-hash");
    }
    if (
      exact.materialization?.envelopeHash !== undefined &&
      args.local.envelopeHash !== undefined &&
      exact.materialization.envelopeHash !== args.local.envelopeHash
    ) {
      unresolvedLinks.push("exact-authorship-proof.materialization-envelope-hash.local-envelope-hash");
    }
    if (naturalWonderPlanCoordinateProof) {
      unresolvedLinks.push(...naturalWonderPlanCoordinateProof.mismatchedLinks);
    }
    if (resourcePlacementCoordinateProof) {
      unresolvedLinks.push(...resourcePlacementCoordinateProof.mismatchedLinks);
    }
  }

  for (const diff of diffs) {
    if (diff.status === "dimension-mismatch") unresolvedLinks.push(`surface.${diff.key}.dimensions`);
    if (diff.missingLive > 0) unresolvedLinks.push(`surface.${diff.key}.live-readback`);
    if (diff.mismatches > 0) unresolvedLinks.push(`surface.${diff.key}.mismatch`);
  }

  const residuals = classifyResidualSurfaces(args.local);
  for (const residual of residuals) {
    if (residual.status === "unresolved") unresolvedLinks.push(`residual.${residual.key}`);
  }

  return {
    status: unresolvedLinks.length === 0 ? "complete" : "unresolved",
    createdAt: (args.now ?? (() => new Date()))().toISOString(),
    ...(exact === undefined ? {} : { exactAuthorshipPacket: exact }),
    exactAuthorshipSummary: {
      ...(exact?.requestId === undefined ? {} : { requestId: exact.requestId }),
      ...(exact?.status === undefined ? {} : { status: exact.status }),
      ...(exact?.sourceSnapshot?.configHash === undefined ? {} : { configHash: exact.sourceSnapshot.configHash }),
      ...(exact?.sourceSnapshot?.envelopeHash === undefined ? {} : { envelopeHash: exact.sourceSnapshot.envelopeHash }),
      ...(exact?.request?.seed === undefined ? {} : { seed: exact.request.seed }),
      ...(exact?.request?.mapSize === undefined ? {} : { mapSize: exact.request.mapSize }),
      dimensions: {
        ...(exact?.runtime?.width === undefined ? {} : { width: exact.runtime.width }),
        ...(exact?.runtime?.height === undefined ? {} : { height: exact.runtime.height }),
      },
      ...(exact?.runtime === undefined ? {} : { runtime: exact.runtime }),
    },
    local: args.local,
    live: args.live,
    diffs,
    ...(naturalWonderPlanCoordinateProof === undefined
      ? {}
      : { naturalWonderPlanCoordinateProof }),
    ...(naturalWonderPlanInputContextProof === undefined
      ? {}
      : { naturalWonderPlanInputContextProof }),
    ...(resourcePlacementCoordinateProof === undefined ? {} : { resourcePlacementCoordinateProof }),
    ...(resourcePlacementRejectionContexts.length === 0
      ? {}
      : { resourcePlacementRejectionContexts }),
    residuals,
    unresolvedLinks: [...new Set(unresolvedLinks)].sort((a, b) => a.localeCompare(b)),
  };
}

export function validateExactAuthorshipProofPacket(value: unknown): {
  proof?: ExactAuthorshipProofLike;
  unresolvedLinks: ReadonlyArray<string>;
} {
  const unresolvedLinks: string[] = [];
  if (!isPlainObject(value)) {
    return { unresolvedLinks: ["exact-authorship-proof.missing"] };
  }

  const exact = value as ExactAuthorshipProofLike;
  if (exact.status !== "complete") unresolvedLinks.push("exact-authorship-proof.complete");
  if (!Array.isArray(exact.unresolvedLinks)) {
    unresolvedLinks.push("exact-authorship-proof.unresolved-links");
  } else if (exact.unresolvedLinks.length > 0) {
    unresolvedLinks.push("exact-authorship-proof.unresolved-links-empty");
  }
  if (!exact.requestId) unresolvedLinks.push("exact-authorship-proof.request-id");
  if (!exact.sourceSnapshot?.identityHash) unresolvedLinks.push("exact-authorship-proof.source-snapshot.identity-hash");
  if (exact.sourceSnapshot?.requestId && exact.requestId && exact.sourceSnapshot.requestId !== exact.requestId) {
    unresolvedLinks.push("exact-authorship-proof.source-snapshot.request-id-mismatch");
  }
  if (exact.sourceSnapshot?.recipeSettings === undefined) unresolvedLinks.push("exact-authorship-proof.source-snapshot.recipe-settings");
  if (exact.sourceSnapshot?.worldSettings === undefined) unresolvedLinks.push("exact-authorship-proof.source-snapshot.world-settings");
  if (exact.sourceSnapshot?.pipelineConfig === undefined) unresolvedLinks.push("exact-authorship-proof.source-snapshot.pipeline-config");
  if (exact.sourceSnapshot?.setupConfig === undefined) unresolvedLinks.push("exact-authorship-proof.source-snapshot.setup-config");
  if (!exact.sourceSnapshot?.materializationMode) unresolvedLinks.push("exact-authorship-proof.source-snapshot.materialization-mode");
  if (exact.sourceSnapshot?.selectedConfig === undefined) unresolvedLinks.push("exact-authorship-proof.source-snapshot.selected-config");
  if (!exact.sourceSnapshot?.configHash) unresolvedLinks.push("exact-authorship-proof.source-snapshot.config-hash");
  if (!exact.sourceSnapshot?.envelopeHash) unresolvedLinks.push("exact-authorship-proof.source-snapshot.envelope-hash");
  if (
    exact.sourceSnapshot?.pipelineConfig !== undefined &&
    exact.sourceSnapshot?.configHash &&
    hashParityValue(exact.sourceSnapshot.pipelineConfig) !== exact.sourceSnapshot.configHash
  ) {
    unresolvedLinks.push("exact-authorship-proof.source-snapshot.config-hash-body-mismatch");
  }
  if (!exact.materialization?.mapScript) unresolvedLinks.push("exact-authorship-proof.materialization.map-script");
  if (!exact.materialization?.configHash) unresolvedLinks.push("exact-authorship-proof.materialization.config-hash");
  if (!exact.materialization?.envelopeHash) unresolvedLinks.push("exact-authorship-proof.materialization.envelope-hash");
  if (!hasFileIdentity(exact.materialization?.sourceConfig)) unresolvedLinks.push("exact-authorship-proof.materialization.source-config");
  if (!hasFileIdentity(exact.materialization?.generatedSourceScript)) {
    unresolvedLinks.push("exact-authorship-proof.materialization.generated-source-script");
  }
  if (!hasFileIdentity(exact.materialization?.localModScript)) unresolvedLinks.push("exact-authorship-proof.materialization.local-mod-script");
  if (!hasFileIdentity(exact.materialization?.deployedModScript)) unresolvedLinks.push("exact-authorship-proof.materialization.deployed-mod-script");
  if (!exact.log?.requestId) unresolvedLinks.push("exact-authorship-proof.log.request-id");
  if (!exact.log?.configHash) unresolvedLinks.push("exact-authorship-proof.log.config-hash");
  if (!exact.log?.envelopeHash) unresolvedLinks.push("exact-authorship-proof.log.envelope-hash");
  if (exact.log?.requestId && exact.requestId && exact.log.requestId !== exact.requestId) {
    unresolvedLinks.push("exact-authorship-proof.log.request-id-mismatch");
  }
  if (exact.log?.configHash && exact.materialization?.configHash && exact.log.configHash !== exact.materialization.configHash) {
    unresolvedLinks.push("exact-authorship-proof.log.config-hash-mismatch");
  }
  if (exact.log?.envelopeHash && exact.materialization?.envelopeHash && exact.log.envelopeHash !== exact.materialization.envelopeHash) {
    unresolvedLinks.push("exact-authorship-proof.log.envelope-hash-mismatch");
  }
  if (!exact.runtime?.sourceSnapshotId) unresolvedLinks.push("exact-authorship-proof.runtime.source-snapshot-id");
  if (!exact.runtime?.snapshotHash) unresolvedLinks.push("exact-authorship-proof.runtime.snapshot-hash");
  if (exact.runtime?.turn === undefined) unresolvedLinks.push("exact-authorship-proof.runtime.turn");
  if (exact.runtime?.gameHash === undefined) unresolvedLinks.push("exact-authorship-proof.runtime.game-hash");

  return {
    proof: exact,
    unresolvedLinks: [...new Set(unresolvedLinks)].sort((a, b) => a.localeCompare(b)),
  };
}

export function configFromExactAuthorshipProof(exact: ExactAuthorshipProofLike | undefined): unknown {
  return exact?.sourceSnapshot?.pipelineConfig;
}

export function hashParityValue(value: unknown): string {
  return sha256Hex(stableStringify(value));
}

export function dimensionsFromExactAuthorshipProof(
  exact: ExactAuthorshipProofLike | undefined
): { width?: number; height?: number; seed?: number } {
  return {
    ...(exact?.runtime?.width === undefined ? {} : { width: exact.runtime.width }),
    ...(exact?.runtime?.height === undefined ? {} : { height: exact.runtime.height }),
    ...(exact?.request?.seed === undefined ? {} : { seed: exact.request.seed }),
  };
}

export function stableParityProofStringify(value: unknown): string {
  return stableStringify(value);
}

function classifyResidualSurfaces(local: FinalSurfaceSnapshot): ReadonlyArray<ParityResidualClassification> {
  const placementParity = isPlainObject(local.evidence?.placementParity) ? local.evidence.placementParity : undefined;
  const wondersPlanned = numberValue(placementParity?.wondersPlanned);
  const wondersPlaced = numberValue(placementParity?.wondersPlaced);
  return [
    {
      key: "rivers",
      status: "covered-by-terrain-grid",
      owner: "mapgen-authored-policy",
      evidence:
        "Navigable rivers are materialized as terrain in this recipe; exact river metadata parity remains outside the hard equality gate.",
    },
    {
      key: "floodplains",
      status: "covered-by-feature-grid",
      owner: "mapgen-authored-policy",
      evidence:
        "Floodplains are materialized as feature ids in this recipe; the feature full-grid gate covers tile-level presence.",
    },
    {
      key: "starts",
      status: "direct-control-readback-limitation",
      owner: "direct-control-readback",
      evidence:
        "Local placement records assigned start counts, but current live readback has no start-position wrapper in this proof path.",
    },
    {
      key: "wonders",
      status: wondersPlanned === 0 && wondersPlaced === 0 ? "not-applicable" : "covered-by-feature-grid",
      owner: "mapgen-authored-policy",
      evidence:
        wondersPlanned === 0 && wondersPlaced === 0
          ? "This local run planned and placed zero natural wonders."
          : "Natural wonders are materialized as feature ids; the feature full-grid gate covers tile-level presence, but footprint semantics should remain visible in placement telemetry.",
    },
  ];
}

function addSurfaceShapeLinks(
  unresolvedLinks: string[],
  snapshot: FinalSurfaceSnapshot,
  label: "local" | "live",
  expectedWidth: number | undefined,
  expectedHeight: number | undefined,
): void {
  const width = expectedWidth ?? snapshot.width;
  const height = expectedHeight ?? snapshot.height;
  const expectedLength = width * height;
  for (const key of FINAL_SURFACE_KEYS) {
    const surface = snapshot.surfaces[key];
    if (surface.width !== width || surface.height !== height) {
      unresolvedLinks.push(`${label}.${key}.dimensions`);
    }
    if (surface.values.length !== expectedLength) {
      unresolvedLinks.push(`${label}.${key}.length`);
    }
  }
}

function addFullGridEvidenceLinks(unresolvedLinks: string[], live: FinalSurfaceSnapshot): void {
  const fullGrid = isPlainObject(live.evidence?.fullGrid) ? live.evidence.fullGrid : undefined;
  if (!fullGrid) {
    unresolvedLinks.push("live.full-grid.evidence");
    return;
  }
  const plotCount = numberValue(fullGrid.plotCount);
  const omitted = numberValue(fullGrid.omitted);
  if (plotCount !== live.width * live.height) unresolvedLinks.push("live.full-grid.plot-count");
  if (omitted === undefined || omitted > 0) unresolvedLinks.push("live.full-grid.omitted");
  const chunks = Array.isArray(fullGrid.chunks) ? fullGrid.chunks : undefined;
  if (!chunks) {
    unresolvedLinks.push("live.full-grid.chunks");
  } else if (chunks.some((chunk) => isPlainObject(chunk) && numberValue(chunk.omitted) !== 0)) {
    unresolvedLinks.push("live.full-grid.chunk-omitted");
  }
  const identityCheck = isPlainObject(fullGrid.identityCheck) ? fullGrid.identityCheck : undefined;
  if (identityCheck?.stable !== true) unresolvedLinks.push("live.full-grid.identity-check");
}

function buildNaturalWonderPlanCoordinateProofComparison(
  exact: ExactAuthorshipProofLike,
  local: FinalSurfaceSnapshot
): NaturalWonderPlanCoordinateProofComparison | undefined {
  const localRows = readLocalNaturalWonderPlanRows(local);
  const exactRows = readExactNaturalWonderPlanRows(exact);
  if (localRows.length === 0 && exactRows.length === 0) return undefined;

  const localProof =
    localRows.length === 0
      ? undefined
      : {
          planned: naturalWonderPlanCoordinateDigest(localRows),
        };
  const exactLoggedDigest = exactNaturalWonderPlanLoggedDigest(exact);
  const exactProof =
    exactRows.length === 0 && !exactLoggedDigest
      ? undefined
      : {
          planned: exactLoggedDigest ?? naturalWonderPlanCoordinateDigest(exactRows),
        };
  const rowComparisons = buildNaturalWonderPlanRowComparisons(exactRows, localRows, local.width);
  if (!exactProof) {
    return {
      status: "missing-exact-log",
      local: localProof,
      rowComparisons,
      mismatchedLinks: (localProof?.planned?.count ?? 0) > 0
        ? ["natural-wonder-plan-coordinate-proof.log"]
        : [],
    };
  }
  if (!localProof) {
    return {
      status: "missing-local-plan",
      exact: exactProof,
      rowComparisons,
      mismatchedLinks: (exactProof.planned?.count ?? 0) > 0
        ? ["natural-wonder-plan-coordinate-proof.local"]
        : [],
    };
  }
  const mismatchedLinks = [
    coordinateDigestMismatchLink(
      localProof.planned,
      exactProof.planned,
      "natural-wonder-plan-coordinate-proof.planned"
    ),
  ].filter((link): link is string => link !== undefined);
  return {
    status: mismatchedLinks.length === 0 ? "match" : "mismatch",
    local: localProof,
    exact: exactProof,
    rowComparisons,
    mismatchedLinks,
  };
}

function readExactNaturalWonderPlanRows(exact: ExactAuthorshipProofLike): NaturalWonderPlanRow[] {
  const rows = exact.log?.naturalWonderPlan?.planRows;
  return Array.isArray(rows)
    ? rows.flatMap((row) => readNaturalWonderPlanRow(row))
    : [];
}

function readLocalNaturalWonderPlanRows(local: FinalSurfaceSnapshot): NaturalWonderPlanRow[] {
  const plan = isPlainObject(local.evidence?.naturalWonderPlan)
    ? local.evidence.naturalWonderPlan
    : undefined;
  const placements = Array.isArray(plan?.placements) ? plan.placements : [];
  return placements.flatMap((placement) => readNaturalWonderPlanRow(placement, local.width));
}

function readNaturalWonderPlanRow(value: unknown, width?: number): NaturalWonderPlanRow[] {
  if (Array.isArray(value)) {
    const status = value[0];
    const plotIndex = numberValue(value[1]);
    const x = numberValue(value[2]);
    const y = numberValue(value[3]);
    const featureType = numberValue(value[4]);
    const direction = numberValue(value[5]);
    if (status !== "p" || plotIndex === undefined || x === undefined || y === undefined || featureType === undefined || direction === undefined) {
      return [];
    }
    return [
      stripUndefinedNaturalWonderPlanRow({
        plotIndex,
        x,
        y,
        featureType,
        direction,
        elevation: numberOrNullValue(value[6]) ?? undefined,
        priorityPpm: numberOrNullValue(value[7]) ?? undefined,
      }),
    ];
  }
  if (!isPlainObject(value)) return [];
  const plotIndex = numberValue(value.plotIndex);
  const featureType = numberValue(value.featureType);
  const direction = numberValue(value.direction);
  if (plotIndex === undefined || featureType === undefined || direction === undefined) return [];
  const rowY = numberValue(value.y) ?? (width === undefined ? undefined : Math.floor(plotIndex / width));
  const rowX = numberValue(value.x) ?? (width === undefined || rowY === undefined ? undefined : plotIndex - rowY * width);
  if (rowX === undefined || rowY === undefined) return [];
  return [
    stripUndefinedNaturalWonderPlanRow({
      plotIndex,
      x: rowX,
      y: rowY,
      featureType,
      direction,
      elevation: numberValue(value.elevation),
      priorityPpm: priorityPpmValue(value.priorityPpm ?? value.priority),
    }),
  ];
}

function stripUndefinedNaturalWonderPlanRow(
  row: NaturalWonderPlanRow
): NaturalWonderPlanRow {
  return {
    plotIndex: row.plotIndex,
    x: row.x,
    y: row.y,
    featureType: row.featureType,
    direction: row.direction,
    ...(row.elevation === undefined ? {} : { elevation: row.elevation }),
    ...(row.priorityPpm === undefined ? {} : { priorityPpm: row.priorityPpm }),
  };
}

function priorityPpmValue(value: unknown): number | undefined {
  const numeric = numberValue(value);
  if (numeric === undefined) return undefined;
  if (numeric > 1) return Math.max(0, Math.min(1_000_000, Math.trunc(numeric)));
  return Math.max(0, Math.min(1_000_000, Math.round(numeric * 1_000_000)));
}

function naturalWonderPlanCoordinateDigest(
  rows: readonly NaturalWonderPlanRow[]
): { count: number; hash32: string } {
  return {
    count: rows.length,
    hash32: hash32Hex(
      rows
        .slice()
        .sort((a, b) => {
          if (a.plotIndex !== b.plotIndex) return a.plotIndex - b.plotIndex;
          if (a.featureType !== b.featureType) return a.featureType - b.featureType;
          return a.direction - b.direction;
        })
        .map((row) => naturalWonderPlanDigestFields(row).join(":"))
        .join("|")
    ),
  };
}

function naturalWonderPlanDigestFields(
  row: NaturalWonderPlanRow
): ReadonlyArray<string | number | null> {
  return [
    "p",
    row.plotIndex,
    row.x,
    row.y,
    row.featureType,
    row.direction,
    row.elevation ?? null,
    row.priorityPpm ?? null,
  ];
}

function exactNaturalWonderPlanLoggedDigest(
  exact: ExactAuthorshipProofLike
): { count?: number; hash32?: string } | undefined {
  const planned = exact.log?.naturalWonderPlan?.coordinateProof?.planned;
  const plannedDigest = coordinateDigest(planned);
  if (plannedDigest) return plannedDigest;
  const payload = isPlainObject(exact.log?.naturalWonderPlan?.payload)
    ? exact.log?.naturalWonderPlan?.payload
    : undefined;
  const coordinateProof = isPlainObject(payload?.coordinateProof) ? payload.coordinateProof : undefined;
  const count = numberValue(coordinateProof?.plannedCount);
  const hash32 = typeof coordinateProof?.plannedHash32 === "string"
    ? coordinateProof.plannedHash32
    : undefined;
  return count === undefined && hash32 === undefined ? undefined : { count, hash32 };
}

function buildNaturalWonderPlanRowComparisons(
  exactRows: readonly NaturalWonderPlanRow[],
  localRows: readonly NaturalWonderPlanRow[],
  width: number
): NaturalWonderPlanRowComparison[] {
  const exactByFeature = new Map(exactRows.map((row) => [row.featureType, row] as const));
  const localByFeature = new Map(localRows.map((row) => [row.featureType, row] as const));
  const featureTypes = [...new Set([...exactByFeature.keys(), ...localByFeature.keys()])]
    .sort((a, b) => a - b);
  return featureTypes.map((featureType) => {
    const exact = exactByFeature.get(featureType);
    const local = localByFeature.get(featureType);
    if (!exact) {
      return {
        featureType,
        classification: "local-only",
        local,
      };
    }
    if (!local) {
      return {
        featureType,
        classification: "exact-only",
        exact,
      };
    }
    return {
      featureType,
      classification: exact.plotIndex === local.plotIndex && exact.direction === local.direction
        ? "exact-local-same-anchor"
        : "exact-local-anchor-diverged",
      exact,
      local,
      distance: hexDistanceOddQPeriodicX(exact.plotIndex, local.plotIndex, width),
      ...(exact.elevation === undefined || local.elevation === undefined
        ? {}
        : { elevationDelta: exact.elevation - local.elevation }),
      ...(exact.priorityPpm === undefined || local.priorityPpm === undefined
        ? {}
        : { priorityDeltaPpm: exact.priorityPpm - local.priorityPpm }),
    };
  });
}

function buildNaturalWonderPlanInputContextProofComparison(
  exact: ExactAuthorshipProofLike,
  local: FinalSurfaceSnapshot
): NaturalWonderPlanInputContextProofComparison | undefined {
  const exactRows = readExactNaturalWonderPlanInputRows(exact);
  const localRows = readLocalNaturalWonderPlanInputRows(local);
  const surfaceDigests = buildNaturalWonderPlanInputSurfaceDigestComparison(exact, local);
  if (exactRows.length === 0 && localRows.length === 0 && surfaceDigests === undefined) return undefined;
  const rowComparisons = buildNaturalWonderPlanInputRowComparisons(exactRows, localRows, local.width);
  if (exactRows.length === 0) {
    return {
      status: "missing-exact-log",
      ...(surfaceDigests === undefined ? {} : { surfaceDigests }),
      rowComparisons,
    };
  }
  if (localRows.length === 0) {
    return {
      status: "missing-local-input",
      ...(surfaceDigests === undefined ? {} : { surfaceDigests }),
      rowComparisons,
    };
  }
  return {
    status: "compared",
    ...(surfaceDigests === undefined ? {} : { surfaceDigests }),
    rowComparisons,
  };
}

function buildNaturalWonderPlanInputSurfaceDigestComparison(
  exact: ExactAuthorshipProofLike,
  local: FinalSurfaceSnapshot
): NaturalWonderPlanInputSurfaceDigestComparison | undefined {
  const exactSurfaceDigests = readExactNaturalWonderPlanInputSurfaceDigests(exact);
  const localSurfaceDigests = readLocalNaturalWonderPlanInputSurfaceDigests(local);
  if (!exactSurfaceDigests && !localSurfaceDigests) return undefined;
  if (!exactSurfaceDigests) {
    return {
      status: "missing-exact-log",
      local: localSurfaceDigests,
      mismatchedFields: [],
    };
  }
  if (!localSurfaceDigests) {
    return {
      status: "missing-local-input",
      exact: exactSurfaceDigests,
      mismatchedFields: [],
    };
  }
  const mismatchedFields = NATURAL_WONDER_PLAN_INPUT_SURFACE_DIGEST_FIELDS.filter(
    (field) => exactSurfaceDigests[field] !== localSurfaceDigests[field]
  );
  return {
    status: mismatchedFields.length === 0 ? "match" : "mismatch",
    exact: exactSurfaceDigests,
    local: localSurfaceDigests,
    mismatchedFields,
  };
}

function readExactNaturalWonderPlanInputSurfaceDigests(
  exact: ExactAuthorshipProofLike
): NaturalWonderPlanInputSurfaceDigests | undefined {
  return readNaturalWonderPlanInputSurfaceDigests(exact.log?.naturalWonderPlanInput?.surfaceDigests);
}

function readLocalNaturalWonderPlanInputSurfaceDigests(
  local: FinalSurfaceSnapshot
): NaturalWonderPlanInputSurfaceDigests | undefined {
  const input = isPlainObject(local.evidence?.naturalWonderPlanInput)
    ? local.evidence.naturalWonderPlanInput
    : undefined;
  return readNaturalWonderPlanInputSurfaceDigests(input?.surfaceDigests);
}

function readNaturalWonderPlanInputSurfaceDigests(
  value: unknown
): NaturalWonderPlanInputSurfaceDigests | undefined {
  if (!isPlainObject(value)) return undefined;
  const version = numberValue(value.version);
  const plotCount = numberValue(value.plotCount);
  const landMaskHash32 = hash32Value(value.landMaskHash32);
  const elevationHash32 = hash32Value(value.elevationHash32);
  const aridityPpmHash32 = hash32Value(value.aridityPpmHash32);
  const riverClassHash32 = hash32Value(value.riverClassHash32);
  const lakeMaskHash32 = hash32Value(value.lakeMaskHash32);
  const blockedMaskHash32 = hash32Value(value.blockedMaskHash32);
  const terrainTypeHash32 = hash32Value(value.terrainTypeHash32);
  const biomeTypeHash32 = hash32Value(value.biomeTypeHash32);
  const featureTypeHash32 = hash32Value(value.featureTypeHash32);
  if (
    version === undefined ||
    plotCount === undefined ||
    landMaskHash32 === undefined ||
    elevationHash32 === undefined ||
    aridityPpmHash32 === undefined ||
    riverClassHash32 === undefined ||
    lakeMaskHash32 === undefined ||
    blockedMaskHash32 === undefined ||
    terrainTypeHash32 === undefined ||
    biomeTypeHash32 === undefined ||
    featureTypeHash32 === undefined
  ) {
    return undefined;
  }
  return {
    version,
    plotCount,
    landMaskHash32,
    elevationHash32,
    aridityPpmHash32,
    riverClassHash32,
    lakeMaskHash32,
    blockedMaskHash32,
    terrainTypeHash32,
    biomeTypeHash32,
    featureTypeHash32,
  };
}

function readExactNaturalWonderPlanInputRows(
  exact: ExactAuthorshipProofLike
): NaturalWonderPlanInputRow[] {
  const rows = exact.log?.naturalWonderPlanInput?.inputRows;
  return Array.isArray(rows)
    ? rows.flatMap((row) => readNaturalWonderPlanInputRow(row))
    : [];
}

function readLocalNaturalWonderPlanInputRows(
  local: FinalSurfaceSnapshot
): NaturalWonderPlanInputRow[] {
  const input = isPlainObject(local.evidence?.naturalWonderPlanInput)
    ? local.evidence.naturalWonderPlanInput
    : undefined;
  const rows = Array.isArray(input?.inputRows) ? input.inputRows : [];
  return rows.flatMap((row) => readNaturalWonderPlanInputRow(row));
}

function readNaturalWonderPlanInputRow(value: unknown): NaturalWonderPlanInputRow[] {
  if (Array.isArray(value)) {
    const status = value[0];
    const plotIndex = numberValue(value[1]);
    const x = numberValue(value[2]);
    const y = numberValue(value[3]);
    const featureType = numberValue(value[4]);
    const terrainType = numberValue(value[5]);
    const biomeType = numberValue(value[6]);
    const occupiedFeatureType = numberValue(value[7]);
    const elevation = numberValue(value[8]);
    const aridityPpm = numberValue(value[9]);
    const riverClass = numberValue(value[10]);
    const lakeMask = numberValue(value[11]);
    const blockedMask = numberValue(value[12]);
    const landMask = numberValue(value[13]);
    if (
      status !== "p" ||
      plotIndex === undefined ||
      x === undefined ||
      y === undefined ||
      featureType === undefined ||
      terrainType === undefined ||
      biomeType === undefined ||
      occupiedFeatureType === undefined ||
      elevation === undefined ||
      aridityPpm === undefined ||
      riverClass === undefined ||
      lakeMask === undefined ||
      blockedMask === undefined ||
      landMask === undefined
    ) {
      return [];
    }
    return [
      {
        plotIndex,
        x,
        y,
        featureType,
        terrainType,
        biomeType,
        occupiedFeatureType,
        elevation,
        aridityPpm,
        riverClass,
        lakeMask,
        blockedMask,
        landMask,
      },
    ];
  }
  if (!isPlainObject(value)) return [];
  const plotIndex = numberValue(value.plotIndex);
  const x = numberValue(value.x);
  const y = numberValue(value.y);
  const featureType = numberValue(value.featureType);
  const terrainType = numberValue(value.terrainType);
  const biomeType = numberValue(value.biomeType);
  const occupiedFeatureType = numberValue(value.occupiedFeatureType);
  const elevation = numberValue(value.elevation);
  const aridityPpm = numberValue(value.aridityPpm);
  const riverClass = numberValue(value.riverClass);
  const lakeMask = numberValue(value.lakeMask);
  const blockedMask = numberValue(value.blockedMask);
  const landMask = numberValue(value.landMask);
  if (
    plotIndex === undefined ||
    x === undefined ||
    y === undefined ||
    featureType === undefined ||
    terrainType === undefined ||
    biomeType === undefined ||
    occupiedFeatureType === undefined ||
    elevation === undefined ||
    aridityPpm === undefined ||
    riverClass === undefined ||
    lakeMask === undefined ||
    blockedMask === undefined ||
    landMask === undefined
  ) {
    return [];
  }
  return [
    {
      plotIndex,
      x,
      y,
      featureType,
      terrainType,
      biomeType,
      occupiedFeatureType,
      elevation,
      aridityPpm,
      riverClass,
      lakeMask,
      blockedMask,
      landMask,
    },
  ];
}

function buildNaturalWonderPlanInputRowComparisons(
  exactRows: readonly NaturalWonderPlanInputRow[],
  localRows: readonly NaturalWonderPlanInputRow[],
  width: number
): NaturalWonderPlanInputRowComparison[] {
  const exactByFeature = new Map(exactRows.map((row) => [row.featureType, row] as const));
  const localByFeature = new Map(localRows.map((row) => [row.featureType, row] as const));
  const featureTypes = [...new Set([...exactByFeature.keys(), ...localByFeature.keys()])]
    .sort((a, b) => a - b);
  return featureTypes.map((featureType) => {
    const exact = exactByFeature.get(featureType);
    const local = localByFeature.get(featureType);
    if (!exact) {
      return {
        featureType,
        classification: "local-only",
        local,
      };
    }
    if (!local) {
      return {
        featureType,
        classification: "exact-only",
        exact,
      };
    }
    const inputDelta = naturalWonderPlanInputDelta(exact, local);
    const sameAnchor = exact.plotIndex === local.plotIndex;
    return {
      featureType,
      classification: sameAnchor
        ? Object.keys(inputDelta).length === 0
          ? "exact-local-same-anchor-input-match"
          : "exact-local-same-anchor-input-drift"
        : "exact-local-anchor-diverged",
      exact,
      local,
      distance: hexDistanceOddQPeriodicX(exact.plotIndex, local.plotIndex, width),
      ...(Object.keys(inputDelta).length === 0 ? {} : { inputDelta }),
    };
  });
}

function naturalWonderPlanInputDelta(
  exact: NaturalWonderPlanInputRow,
  local: NaturalWonderPlanInputRow
): NaturalWonderPlanInputDelta {
  return stripUndefined({
    terrainType: exact.terrainType === local.terrainType
      ? undefined
      : { exact: exact.terrainType, local: local.terrainType },
    biomeType: exact.biomeType === local.biomeType
      ? undefined
      : { exact: exact.biomeType, local: local.biomeType },
    occupiedFeatureType: exact.occupiedFeatureType === local.occupiedFeatureType
      ? undefined
      : { exact: exact.occupiedFeatureType, local: local.occupiedFeatureType },
    elevationDelta: exact.elevation === local.elevation ? undefined : exact.elevation - local.elevation,
    aridityPpmDelta: exact.aridityPpm === local.aridityPpm ? undefined : exact.aridityPpm - local.aridityPpm,
    riverClassDelta: exact.riverClass === local.riverClass ? undefined : exact.riverClass - local.riverClass,
    lakeMaskDelta: exact.lakeMask === local.lakeMask ? undefined : exact.lakeMask - local.lakeMask,
    blockedMaskDelta: exact.blockedMask === local.blockedMask ? undefined : exact.blockedMask - local.blockedMask,
    landMaskDelta: exact.landMask === local.landMask ? undefined : exact.landMask - local.landMask,
  }) ?? {};
}

const FNV1A_32_OFFSET = 0x811c9dc5;
const FNV1A_32_PRIME = 0x01000193;

function hash32Hex(input: string): string {
  let hash = FNV1A_32_OFFSET;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV1A_32_PRIME);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function buildResourcePlacementCoordinateProofComparison(
  exact: ExactAuthorshipProofLike,
  local: FinalSurfaceSnapshot
): ResourcePlacementCoordinateProofComparison | undefined {
  const localCoordinateProof = localResourcePlacementCoordinateProof(local);
  if (!localCoordinateProof) return undefined;
  const logCoordinateProof = exact.log?.resourcePlacement?.coordinateProof;
  if (!logCoordinateProof) {
    return {
      status: "missing-exact-log",
      local: localCoordinateProof,
      mismatchedLinks: ["resource-placement-coordinate-proof.log"],
    };
  }
  const exactCoordinateProof = {
    placed: coordinateDigest(logCoordinateProof.placed),
    rejected: coordinateDigest(logCoordinateProof.rejected),
    mismatch: coordinateDigest(logCoordinateProof.mismatch),
  };
  const mismatchedLinks = [
    coordinateDigestMismatchLink(
      localCoordinateProof.placed,
      exactCoordinateProof.placed,
      "resource-placement-coordinate-proof.placed"
    ),
    coordinateDigestMismatchLink(
      localCoordinateProof.rejected,
      exactCoordinateProof.rejected,
      "resource-placement-coordinate-proof.rejected"
    ),
    coordinateDigestMismatchLink(
      localCoordinateProof.mismatch,
      exactCoordinateProof.mismatch,
      "resource-placement-coordinate-proof.mismatch"
    ),
  ].filter((link): link is string => link !== undefined);
  return {
    status: mismatchedLinks.length === 0 ? "match" : "mismatch",
    local: localCoordinateProof,
    exact: exactCoordinateProof,
    mismatchedLinks,
  };
}

function coordinateDigestMismatchLink(
  local: { count?: number; hash32?: string } | undefined,
  log: { count?: number; hash32?: string } | undefined,
  link: string
): string | undefined {
  if (!local) return undefined;
  if (!log) {
    return (local.count ?? 0) > 0 ? link : undefined;
  }
  return local.count !== log.count || local.hash32 !== log.hash32 ? link : undefined;
}

function localResourcePlacementCoordinateProof(local: FinalSurfaceSnapshot):
  | {
      placed?: { count?: number; hash32?: string };
      rejected?: { count?: number; hash32?: string };
      mismatch?: { count?: number; hash32?: string };
    }
  | undefined {
  const resourcePlacementOutcomes = isPlainObject(local.evidence?.resourcePlacementOutcomes)
    ? local.evidence.resourcePlacementOutcomes
    : undefined;
  const summary = isPlainObject(resourcePlacementOutcomes?.summary)
    ? resourcePlacementOutcomes.summary
    : undefined;
  const coordinateProof = isPlainObject(summary?.coordinateProof) ? summary.coordinateProof : undefined;
  if (!coordinateProof) return undefined;
  return {
    placed: coordinateDigest(coordinateProof.placed),
    rejected: coordinateDigest(coordinateProof.rejected),
    mismatch: coordinateDigest(coordinateProof.mismatch),
  };
}

function coordinateDigest(value: unknown): { count?: number; hash32?: string } | undefined {
  if (!isPlainObject(value)) return undefined;
  return {
    ...(numberValue(value.count) === undefined ? {} : { count: numberValue(value.count) }),
    ...(typeof value.hash32 === "string" ? { hash32: value.hash32 } : {}),
  };
}

function buildResourcePlacementRejectionContexts(
  exact: ExactAuthorshipProofLike,
  local: FinalSurfaceSnapshot
): ResourcePlacementRejectionContext[] {
  const rows = readExactResourcePlacementRejectionRows(exact);
  if (rows.length === 0) return [];
  const localEvidence = readLocalResourcePlacementEvidence(local);
  return rows.map((row) => ({
    exact: row,
    local: {
      ...(indexedSurfaceValue(local.surfaces.resource.values, row.plotIndex) === undefined
        ? {}
        : { surfaceResourceType: indexedSurfaceValue(local.surfaces.resource.values, row.plotIndex) }),
      ...(localEvidence.preferredByPlot.get(row.plotIndex) === undefined
        ? {}
        : { preferredPlacement: localEvidence.preferredByPlot.get(row.plotIndex)! }),
      ...(localEvidence.outcomeByPlot.get(row.plotIndex) === undefined
        ? {}
        : { outcome: localEvidence.outcomeByPlot.get(row.plotIndex)! }),
      ...(localEvidence.assignmentByPlot.get(row.plotIndex) === undefined
        ? {}
        : { assignment: localEvidence.assignmentByPlot.get(row.plotIndex)! }),
    },
  }));
}

function readExactResourcePlacementRejectionRows(
  exact: ExactAuthorshipProofLike
): ResourcePlacementRejectionContext["exact"][] {
  const rows = exact.log?.resourcePlacement?.stats?.rejectionRows;
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    if (!isPlainObject(row)) return [];
    const status = stringValue(row.status);
    const resourceType = numberValue(row.resourceType);
    const plotIndex = numberValue(row.plotIndex);
    if (!status || resourceType === undefined || plotIndex === undefined) return [];
    return [
      {
        status,
        resourceType,
        ...(stringOrNullValue(row.resource) === undefined
          ? {}
          : { resource: stringOrNullValue(row.resource) }),
        plotIndex,
        ...(numberValue(row.x) === undefined ? {} : { x: numberValue(row.x) }),
        ...(numberValue(row.y) === undefined ? {} : { y: numberValue(row.y) }),
        ...(stringOrNullValue(row.reason) === undefined
          ? {}
          : { reason: stringOrNullValue(row.reason) }),
        ...(numberOrNullValue(row.observedResourceType) === undefined
          ? {}
          : { observedResourceType: numberOrNullValue(row.observedResourceType) }),
        ...(stringOrNullValue(row.observedResource) === undefined
          ? {}
          : { observedResource: stringOrNullValue(row.observedResource) }),
        ...(stringValue(row.assignmentPhase) === undefined
          ? {}
          : { assignmentPhase: stringValue(row.assignmentPhase) }),
        ...(numberValue(row.assignmentOrder) === undefined
          ? {}
          : { assignmentOrder: numberValue(row.assignmentOrder) }),
        ...(numberValue(row.initialResourceType) === undefined
          ? {}
          : { initialResourceType: numberValue(row.initialResourceType) }),
        ...(numberOrNullValue(row.preferredResourceType) === undefined
          ? {}
          : { preferredResourceType: numberOrNullValue(row.preferredResourceType) }),
        ...(numberValue(row.perTypeCountBefore) === undefined
          ? {}
          : { perTypeCountBefore: numberValue(row.perTypeCountBefore) }),
        ...(numberValue(row.legalPlotCountForResource) === undefined
          ? {}
          : { legalPlotCountForResource: numberValue(row.legalPlotCountForResource) }),
        ...(numberValue(row.targetMinPerType) === undefined
          ? {}
          : { targetMinPerType: numberValue(row.targetMinPerType) }),
      },
    ];
  });
}

function readLocalResourcePlacementEvidence(local: FinalSurfaceSnapshot): {
  preferredByPlot: ReadonlyMap<
    number,
    { preferredResourceType: number; preferredTypeOffset?: number; priority?: number }
  >;
  outcomeByPlot: ReadonlyMap<
    number,
    {
      status: string;
      resourceType: number;
      observedResourceType?: number | null;
      reason?: string | null;
    }
  >;
  assignmentByPlot: ReadonlyMap<
    number,
    {
      resourceType: number;
      initialResourceType: number;
      preferredResourceType?: number | null;
      assignmentPhase: string;
      reassignedByRebalance?: boolean;
      assignmentOrder?: number;
      perTypeCountBefore?: number;
      legalPlotCountForResource?: number;
      targetMinPerType?: number;
    }
  >;
} {
  const resourcePlan = isPlainObject(local.evidence?.resourcePlan)
    ? local.evidence.resourcePlan
    : undefined;
  const resourcePlacementOutcomes = isPlainObject(local.evidence?.resourcePlacementOutcomes)
    ? local.evidence.resourcePlacementOutcomes
    : undefined;
  const preferredByPlot = new Map<
    number,
    { preferredResourceType: number; preferredTypeOffset?: number; priority?: number }
  >();
  const placements = Array.isArray(resourcePlan?.placements) ? resourcePlan.placements : [];
  for (const placement of placements) {
    if (!isPlainObject(placement)) continue;
    const plotIndex = numberValue(placement.plotIndex);
    const preferredResourceType = numberValue(placement.preferredResourceType);
    if (plotIndex === undefined || preferredResourceType === undefined || preferredByPlot.has(plotIndex)) {
      continue;
    }
    preferredByPlot.set(plotIndex, {
      preferredResourceType,
      ...(numberValue(placement.preferredTypeOffset) === undefined
        ? {}
        : { preferredTypeOffset: numberValue(placement.preferredTypeOffset) }),
      ...(numberValue(placement.priority) === undefined ? {} : { priority: numberValue(placement.priority) }),
    });
  }

  const outcomeByPlot = new Map<
    number,
    {
      status: string;
      resourceType: number;
      observedResourceType?: number | null;
      reason?: string | null;
    }
  >();
  const outcomes = Array.isArray(resourcePlacementOutcomes?.outcomes)
    ? resourcePlacementOutcomes.outcomes
    : [];
  for (const outcome of outcomes) {
    if (!isPlainObject(outcome)) continue;
    const plotIndex = numberValue(outcome.plotIndex);
    const status = stringValue(outcome.status);
    const resourceType = numberValue(outcome.resourceType);
    if (plotIndex === undefined || !status || resourceType === undefined || outcomeByPlot.has(plotIndex)) {
      continue;
    }
    outcomeByPlot.set(plotIndex, {
      status,
      resourceType,
      ...(numberOrNullValue(outcome.observedResourceType) === undefined
        ? {}
        : { observedResourceType: numberOrNullValue(outcome.observedResourceType) }),
      ...(stringOrNullValue(outcome.reason) === undefined
        ? {}
        : { reason: stringOrNullValue(outcome.reason) }),
    });
  }

  const assignmentByPlot = new Map<
    number,
    {
      resourceType: number;
      initialResourceType: number;
      preferredResourceType?: number | null;
      assignmentPhase: string;
      reassignedByRebalance?: boolean;
      assignmentOrder?: number;
      perTypeCountBefore?: number;
      legalPlotCountForResource?: number;
      targetMinPerType?: number;
    }
  >();
  const assignmentTrace = Array.isArray(resourcePlacementOutcomes?.assignmentTrace)
    ? resourcePlacementOutcomes.assignmentTrace
    : [];
  for (const assignment of assignmentTrace) {
    if (!isPlainObject(assignment)) continue;
    const plotIndex = numberValue(assignment.plotIndex);
    const resourceType = numberValue(assignment.resourceType);
    const initialResourceType = numberValue(assignment.initialResourceType);
    const assignmentPhase = stringValue(assignment.assignmentPhase);
    if (
      plotIndex === undefined ||
      resourceType === undefined ||
      initialResourceType === undefined ||
      !assignmentPhase ||
      assignmentByPlot.has(plotIndex)
    ) {
      continue;
    }
    assignmentByPlot.set(plotIndex, {
      resourceType,
      initialResourceType,
      ...(numberOrNullValue(assignment.preferredResourceType) === undefined
        ? {}
        : { preferredResourceType: numberOrNullValue(assignment.preferredResourceType) }),
      assignmentPhase,
      ...(typeof assignment.reassignedByRebalance === "boolean"
        ? { reassignedByRebalance: assignment.reassignedByRebalance }
        : {}),
      ...(numberValue(assignment.assignmentOrder) === undefined
        ? {}
        : { assignmentOrder: numberValue(assignment.assignmentOrder) }),
      ...(numberValue(assignment.perTypeCountBefore) === undefined
        ? {}
        : { perTypeCountBefore: numberValue(assignment.perTypeCountBefore) }),
      ...(numberValue(assignment.legalPlotCountForResource) === undefined
        ? {}
        : { legalPlotCountForResource: numberValue(assignment.legalPlotCountForResource) }),
      ...(numberValue(assignment.targetMinPerType) === undefined
        ? {}
        : { targetMinPerType: numberValue(assignment.targetMinPerType) }),
    });
  }

  return { preferredByPlot, outcomeByPlot, assignmentByPlot };
}

function indexedSurfaceValue(values: ReadonlyArray<number | null>, index: number): number | null | undefined {
  if (!Number.isInteger(index) || index < 0 || index >= values.length) return undefined;
  const value = values[index];
  return value === undefined ? undefined : value;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function hash32Value(value: unknown): string | undefined {
  return typeof value === "string" && /^[0-9a-f]{8}$/.test(value) ? value : undefined;
}

function stringOrNullValue(value: unknown): string | null | undefined {
  if (value === null) return null;
  return typeof value === "string" ? value : undefined;
}

function numberOrNullValue(value: unknown): number | null | undefined {
  if (value === null) return null;
  return numberValue(value);
}

function probeNumberValue(value: unknown): number | null {
  if (!isPlainObject(value)) return numberValue(value);
  if (value.ok !== true) return null;
  return numberValue(value.value);
}

function hasFileIdentity(value: FileIdentityLike | undefined): boolean {
  return Boolean(value?.path && value.sha256 && value.sizeBytes !== undefined && value.mtimeMs !== undefined && value.mtimeIso);
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
