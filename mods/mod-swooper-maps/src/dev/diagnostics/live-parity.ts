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
  resourcePlacementCoordinateProof?: ResourcePlacementCoordinateProofComparison;
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
  const resourcePlacementCoordinateProof =
    exact === undefined ? undefined : buildResourcePlacementCoordinateProofComparison(exact, args.local);

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
    ...(resourcePlacementCoordinateProof === undefined ? {} : { resourcePlacementCoordinateProof }),
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
