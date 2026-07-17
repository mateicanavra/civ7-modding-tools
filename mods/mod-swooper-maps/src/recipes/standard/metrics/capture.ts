import { createMockAdapter } from "@civ7/adapter";
import {
  FEATURE_PLACEMENT_KEYS,
  type FeatureKey,
  getEngineFeatureLegality,
} from "@civ7/map-policy";
import { createExtendedMapContext, type ExtendedMapContext } from "@swooper/mapgen-core";
import {
  assertFloat32Array,
  assertUint8Array,
  expectedGridSize,
} from "@swooper/mapgen-core/authoring";
import {
  type ArtifactReadValueOf,
  readValidatedArtifact,
} from "@swooper/mapgen-core/authoring/contracts";

import { canonicalRecipeConfig } from "../../../maps/configs/canonical.js";
import standardRecipe from "../recipe.js";
import { initializeStandardRuntime } from "../runtime.js";
import { artifactModules as ecologyArtifactModules } from "../stages/ecology/artifacts/index.js";
import { artifactModules as hydrologyHydrographyArtifactModules } from "../stages/hydrology-hydrography/artifacts/index.js";
import { artifactModules as mapHydrologyArtifactModules } from "../stages/map-hydrology/artifacts/index.js";
import { artifactModules as mapRiversArtifactModules } from "../stages/map-rivers/artifacts/index.js";
import { artifactModules as morphologyArtifactModules } from "../stages/morphology/artifacts/index.js";
import { artifactModules as placementArtifactModules } from "../stages/placement/artifacts/index.js";
import { defineStandardMapMetricScenario, type StandardMapMetricScenario } from "./scenario.js";

type Volcanoes = ArtifactReadValueOf<typeof morphologyArtifactModules.volcanoes.artifact>;
type RiverNetworkMetrics = ArtifactReadValueOf<
  typeof hydrologyHydrographyArtifactModules.riverNetworkMetrics.artifact
>;
type ProjectedNavigableRivers = ArtifactReadValueOf<
  typeof mapRiversArtifactModules.projectedNavigableRivers.artifact
>;
type EngineProjectionRivers = ArtifactReadValueOf<
  typeof mapRiversArtifactModules.engineProjectionRivers.artifact
>;
type ResourcePlan = ArtifactReadValueOf<typeof placementArtifactModules.resourcePlan.artifact>;
type ResourcePlanAdjusted = ArtifactReadValueOf<
  typeof placementArtifactModules.resourcePlanAdjusted.artifact
>;
type ResourcePlacementOutcomes = ArtifactReadValueOf<
  typeof placementArtifactModules.resourcePlacementOutcomes.artifact
>;
type StartAssignment = ArtifactReadValueOf<
  typeof placementArtifactModules.startAssignment.artifact
>;

/** One feature key and the Civ7 surface law used to validate its realized placement. */
export type StandardFeatureRuntime = Readonly<{
  key: FeatureKey;
  typeId: number;
  legalTerrainIds: readonly number[];
  legalBiomeIds: readonly number[];
  expectsWater: boolean;
}>;

/**
 * Capture-owned evidence copied from one completed Standard recipe execution.
 * It excludes the mutable context, adapter, config, and raw artifact objects; callers must still
 * treat copied typed-array fields as read-only because JavaScript cannot freeze their elements.
 */
export type StandardMapCapture = Readonly<{
  provenance: Readonly<{
    scenarioId: string;
    configurationId: string;
    mapKind: StandardMapMetricScenario["kind"];
    mapSizeId: string | number;
    seed: number;
    width: number;
    height: number;
    playerCount: number;
  }>;
  model: Readonly<{
    landMask: Uint8Array;
    mountainMask: Uint8Array;
    mountainRegionMask: Uint8Array;
    hillMask: Uint8Array;
    foothillMask: Uint8Array;
    roughLandMask: Uint8Array;
    volcanoMask: Uint8Array;
    volcanoes: Volcanoes["volcanoes"];
    plannedLakeMask: Uint8Array;
    riverClass: Uint8Array;
    outletMask: Uint8Array;
    terminalType: Uint8Array | null;
    riverNetworkSummary: RiverNetworkMetrics["benchmarkSummary"];
    biomeIndex: Uint8Array;
    vegetationDensity: Float32Array;
    effectiveMoisture: Float32Array;
    surfaceTemperature: Float32Array;
    aridityIndex: Float32Array;
  }>;
  projection: Readonly<{
    lakeMask: Uint8Array;
    lakeSinkMismatchCount: number;
    finalLakeWaterDriftCount: number;
    finalLakeClassificationDriftCount: number;
    navigableRivers: Pick<
      ProjectedNavigableRivers,
      | "selectedTileCount"
      | "targetTileCount"
      | "eligibleTileCount"
      | "selectedChainCount"
      | "longestSelectedChainLength"
      | "meanSelectedChainLength"
      | "selectedEligibleMajorTileFraction"
      | "majorDurableTileCount"
      | "projectionSignalStatus"
      | "plannedMajorRiverTileCount"
    >;
    riverReadback: Pick<
      EngineProjectionRivers,
      | "terrainNavigableRiverTileCount"
      | "riverMismatchCount"
      | "selectedRiverRejectedCount"
      | "extraEngineRiverCount"
    >;
    featureAttempts: Readonly<Record<string, number>>;
    featureRejections: Readonly<Record<string, number>>;
  }>;
  resources: Readonly<{
    intents: readonly Pick<
      ResourcePlanAdjusted["intents"][number],
      "plotIndex" | "resourceType" | "inHabitat"
    >[];
    perType: readonly Pick<
      ResourcePlan["perType"][number],
      "resourceType" | "plannedCount" | "minCount" | "maxCount" | "spacingFloorTiles" | "shortfalls"
    >[];
    summary: ResourcePlacementOutcomes["summary"];
    outcomes: readonly Pick<
      ResourcePlacementOutcomes["outcomes"][number],
      "status" | "plotIndex" | "resourceType"
    >[];
  }>;
  placement: Pick<
    StartAssignment,
    | "status"
    | "assigned"
    | "unseatedCount"
    | "rungCounts"
    | "primaryAssigned"
    | "islandClusterAssigned"
    | "marginalAssigned"
    | "noneAssigned"
    | "candidateCount"
  >;
  observation: Readonly<{
    isWater: Uint8Array;
    terrain: Int32Array;
    biome: Int32Array;
    feature: Int32Array;
    resource: Int32Array;
    noResource: number;
    mountainTerrain: number;
    hillTerrain: number;
    flatTerrain: number;
    coastTerrain: number;
    oceanTerrain: number;
    volcanoFeature: number;
    features: readonly StandardFeatureRuntime[];
  }>;
}>;

/**
 * Runs one admitted Standard scenario exactly once, validates every consumed artifact, and closes
 * the mutable recipe boundary by copying only metric-owned evidence. Product benchmarks use real
 * Civ7 presets; explicit custom dimensions remain available only for focused measurement fixtures.
 */
export function captureStandardMapScenario(
  scenario: StandardMapMetricScenario
): StandardMapCapture {
  const admittedScenario = defineStandardMapMetricScenario(scenario);
  const selection = resolveMapSelection(admittedScenario);
  const { width, height } = selection.dimensions;
  const env = {
    seed: admittedScenario.seed,
    dimensions: selection.dimensions,
    latitudeBounds: admittedScenario.config.latitudeBounds,
  };

  const adapter = createMockAdapter({
    width,
    height,
    mapInfo: selection.mapInfo,
    mapSizeId: selection.mapSizeId,
    aliveMajorCount: selection.playerCount,
    rngSeed: admittedScenario.seed,
  });

  const context = createExtendedMapContext({ width, height }, adapter, env);
  initializeStandardRuntime(context, {
    mapInfo: selection.mapInfo,
    logPrefix: "[map-product-metrics]",
  });
  standardRecipe.run(context, env, canonicalRecipeConfig(admittedScenario.config), {
    log: () => {},
  });

  return copyCompletedRun(admittedScenario, context, adapter);
}

function copyCompletedRun(
  scenario: StandardMapMetricScenario,
  context: ExtendedMapContext,
  adapter: ReturnType<typeof createMockAdapter>
): StandardMapCapture {
  const selection = resolveMapSelection(scenario);
  const { width, height } = selection.dimensions;
  const gridSize = expectedGridSize(width, height);
  const topographyValue = readValidatedArtifact(context, morphologyArtifactModules.topography);
  const mountainsValue = readValidatedArtifact(context, morphologyArtifactModules.mountains);
  const volcanoesValue = readValidatedArtifact(context, morphologyArtifactModules.volcanoes);
  const lakePlanValue = readValidatedArtifact(
    context,
    hydrologyHydrographyArtifactModules.lakePlan
  );
  const hydrographyValue = readValidatedArtifact(
    context,
    hydrologyHydrographyArtifactModules.hydrography
  );
  const riverNetworkValue = readValidatedArtifact(
    context,
    hydrologyHydrographyArtifactModules.riverNetworkMetrics
  );
  const lakeProjectionValue = readValidatedArtifact(
    context,
    mapHydrologyArtifactModules.engineProjectionLakes
  );
  const navigableRiverValue = readValidatedArtifact(
    context,
    mapRiversArtifactModules.projectedNavigableRivers
  );
  const riverReadbackValue = readValidatedArtifact(
    context,
    mapRiversArtifactModules.engineProjectionRivers
  );
  const biomeValue = readValidatedArtifact(context, ecologyArtifactModules.biomeClassification);
  const featureDiagnosticsValue = readValidatedArtifact(
    context,
    ecologyArtifactModules.featureApplyDiagnostics
  );
  const placementSurfaceValue = readValidatedArtifact(
    context,
    placementArtifactModules.placementSurfacePreparation
  );
  const resourcePlanValue = readValidatedArtifact(context, placementArtifactModules.resourcePlan);
  const adjustedResourcePlanValue = readValidatedArtifact(
    context,
    placementArtifactModules.resourcePlanAdjusted
  );
  const resourceOutcomesValue = readValidatedArtifact(
    context,
    placementArtifactModules.resourcePlacementOutcomes
  );
  const startValue = readValidatedArtifact(context, placementArtifactModules.startAssignment);
  const landMask = copyUint8Grid(
    "morphology.topography.landMask",
    topographyValue.landMask,
    gridSize
  );
  const biomeIndex = copyUint8Grid(
    "ecology.biomeClassification.biomeIndex",
    biomeValue.biomeIndex,
    gridSize
  );
  assertModeledLandBiomeCoverage(landMask, biomeIndex);

  const realized = copyRealizedMap(adapter, width, height);
  const features = FEATURE_PLACEMENT_KEYS.map((key): StandardFeatureRuntime => {
    const legality = getEngineFeatureLegality(key);
    if (!legality) {
      throw new Error(`Standard metric capture requires official Civ7 legality for ${key}.`);
    }
    return Object.freeze({
      key,
      typeId: requireRuntimeTypeId(key, adapter.getFeatureTypeIndex(key)),
      legalTerrainIds: Object.freeze(
        legality.terrains.map((terrain) =>
          requireRuntimeTypeId(terrain, adapter.getTerrainTypeIndex(terrain))
        )
      ),
      legalBiomeIds: Object.freeze(
        legality.biomes.map((biome) => requireRuntimeTypeId(biome, adapter.getBiomeGlobal(biome)))
      ),
      expectsWater: legality.terrains.some(isWaterTerrain),
    });
  });

  return Object.freeze({
    provenance: Object.freeze({
      scenarioId: scenario.id,
      configurationId: scenario.config.id,
      mapKind: scenario.kind,
      mapSizeId: selection.mapSizeId,
      seed: scenario.seed,
      width,
      height,
      playerCount: selection.playerCount,
    }),
    model: Object.freeze({
      landMask,
      mountainMask: copyUint8Grid(
        "morphology.mountains.mountainMask",
        mountainsValue.mountainMask,
        gridSize
      ),
      mountainRegionMask: copyUint8Grid(
        "morphology.mountains.mountainRegionMask",
        mountainsValue.mountainRegionMask,
        gridSize
      ),
      hillMask: copyUint8Grid("morphology.mountains.hillMask", mountainsValue.hillMask, gridSize),
      foothillMask: copyUint8Grid(
        "morphology.mountains.foothillMask",
        mountainsValue.foothillMask,
        gridSize
      ),
      roughLandMask: copyUint8Grid(
        "morphology.mountains.roughLandMask",
        mountainsValue.roughLandMask,
        gridSize
      ),
      volcanoMask: copyUint8Grid(
        "morphology.volcanoes.volcanoMask",
        volcanoesValue.volcanoMask,
        gridSize
      ),
      volcanoes: Object.freeze(
        volcanoesValue.volcanoes.map((entry) => Object.freeze({ ...entry }))
      ),
      plannedLakeMask: copyUint8Grid(
        "hydrology.lakePlan.lakeMask",
        lakePlanValue.lakeMask,
        gridSize
      ),
      riverClass: copyUint8Grid(
        "hydrology.hydrography.riverClass",
        hydrographyValue.riverClass,
        gridSize
      ),
      outletMask: copyUint8Grid(
        "hydrology.hydrography.outletMask",
        hydrographyValue.outletMask,
        gridSize
      ),
      terminalType:
        hydrographyValue.terminalType === undefined
          ? null
          : copyUint8Grid(
              "hydrology.hydrography.terminalType",
              hydrographyValue.terminalType,
              gridSize
            ),
      riverNetworkSummary: Object.freeze({ ...riverNetworkValue.benchmarkSummary }),
      biomeIndex,
      vegetationDensity: copyFloat32Grid(
        "ecology.biomeClassification.vegetationDensity",
        biomeValue.vegetationDensity,
        gridSize
      ),
      effectiveMoisture: copyFloat32Grid(
        "ecology.biomeClassification.effectiveMoisture",
        biomeValue.effectiveMoisture,
        gridSize
      ),
      surfaceTemperature: copyFloat32Grid(
        "ecology.biomeClassification.surfaceTemperature",
        biomeValue.surfaceTemperature,
        gridSize
      ),
      aridityIndex: copyFloat32Grid(
        "ecology.biomeClassification.aridityIndex",
        biomeValue.aridityIndex,
        gridSize
      ),
    }),
    projection: Object.freeze({
      lakeMask: copyUint8Grid(
        "map.hydrology.engineProjectionLakes.lakeMask",
        lakeProjectionValue.lakeMask,
        gridSize
      ),
      lakeSinkMismatchCount: lakeProjectionValue.sinkMismatchCount,
      finalLakeWaterDriftCount: placementSurfaceValue.finalLakeWaterDriftCount,
      finalLakeClassificationDriftCount: placementSurfaceValue.finalLakeClassificationDriftCount,
      navigableRivers: Object.freeze({
        selectedTileCount: navigableRiverValue.selectedTileCount,
        targetTileCount: navigableRiverValue.targetTileCount,
        eligibleTileCount: navigableRiverValue.eligibleTileCount,
        selectedChainCount: navigableRiverValue.selectedChainCount,
        longestSelectedChainLength: navigableRiverValue.longestSelectedChainLength,
        meanSelectedChainLength: navigableRiverValue.meanSelectedChainLength,
        selectedEligibleMajorTileFraction: navigableRiverValue.selectedEligibleMajorTileFraction,
        majorDurableTileCount: navigableRiverValue.majorDurableTileCount,
        projectionSignalStatus: navigableRiverValue.projectionSignalStatus,
        plannedMajorRiverTileCount: navigableRiverValue.plannedMajorRiverTileCount,
      }),
      riverReadback: Object.freeze({
        terrainNavigableRiverTileCount: riverReadbackValue.terrainNavigableRiverTileCount,
        riverMismatchCount: riverReadbackValue.riverMismatchCount,
        selectedRiverRejectedCount: riverReadbackValue.selectedRiverRejectedCount,
        extraEngineRiverCount: riverReadbackValue.extraEngineRiverCount,
      }),
      featureAttempts: Object.freeze({ ...featureDiagnosticsValue.attemptedByFeature }),
      featureRejections: Object.freeze({
        ...featureDiagnosticsValue.rejectedCanHaveFeatureByFeature,
      }),
    }),
    resources: Object.freeze({
      intents: Object.freeze(
        adjustedResourcePlanValue.intents.map((intent) =>
          Object.freeze({
            plotIndex: intent.plotIndex,
            resourceType: intent.resourceType,
            inHabitat: intent.inHabitat,
          })
        )
      ),
      perType: Object.freeze(
        resourcePlanValue.perType.map((row) =>
          Object.freeze({
            resourceType: row.resourceType,
            plannedCount: row.plannedCount,
            minCount: row.minCount,
            maxCount: row.maxCount,
            spacingFloorTiles: row.spacingFloorTiles,
            shortfalls: Object.freeze(row.shortfalls.map((item) => Object.freeze({ ...item }))),
          })
        )
      ),
      summary: Object.freeze({
        ...resourceOutcomesValue.summary,
        coordinateEvidence: Object.freeze({
          ...resourceOutcomesValue.summary.coordinateEvidence,
          placed: Object.freeze({ ...resourceOutcomesValue.summary.coordinateEvidence.placed }),
          rejected: Object.freeze({
            ...resourceOutcomesValue.summary.coordinateEvidence.rejected,
          }),
          mismatch: Object.freeze({
            ...resourceOutcomesValue.summary.coordinateEvidence.mismatch,
          }),
        }),
        byResource: Object.freeze(
          resourceOutcomesValue.summary.byResource.map((row) =>
            Object.freeze({
              ...row,
              reasons: Object.freeze(row.reasons.map((reason) => Object.freeze({ ...reason }))),
            })
          )
        ),
        byReason: Object.freeze(
          resourceOutcomesValue.summary.byReason.map((row) => Object.freeze({ ...row }))
        ),
      }),
      outcomes: Object.freeze(
        resourceOutcomesValue.outcomes.map((outcome) =>
          Object.freeze({
            status: outcome.status,
            plotIndex: outcome.plotIndex,
            resourceType: outcome.resourceType,
          })
        )
      ),
    }),
    placement: Object.freeze({
      status: startValue.status,
      assigned: startValue.assigned,
      unseatedCount: startValue.unseatedCount,
      rungCounts: Object.freeze({ ...startValue.rungCounts }),
      primaryAssigned: startValue.primaryAssigned,
      islandClusterAssigned: startValue.islandClusterAssigned,
      marginalAssigned: startValue.marginalAssigned,
      noneAssigned: startValue.noneAssigned,
      candidateCount: startValue.candidateCount,
    }),
    observation: Object.freeze({
      ...realized,
      noResource: requireInt32("adapter.NO_RESOURCE", adapter.NO_RESOURCE),
      mountainTerrain: requireRuntimeTypeId(
        "TERRAIN_MOUNTAIN",
        adapter.getTerrainTypeIndex("TERRAIN_MOUNTAIN")
      ),
      hillTerrain: requireRuntimeTypeId(
        "TERRAIN_HILL",
        adapter.getTerrainTypeIndex("TERRAIN_HILL")
      ),
      flatTerrain: requireRuntimeTypeId(
        "TERRAIN_FLAT",
        adapter.getTerrainTypeIndex("TERRAIN_FLAT")
      ),
      coastTerrain: requireRuntimeTypeId(
        "TERRAIN_COAST",
        adapter.getTerrainTypeIndex("TERRAIN_COAST")
      ),
      oceanTerrain: requireRuntimeTypeId(
        "TERRAIN_OCEAN",
        adapter.getTerrainTypeIndex("TERRAIN_OCEAN")
      ),
      volcanoFeature: requireRuntimeTypeId(
        "FEATURE_VOLCANO",
        adapter.getFeatureTypeIndex("FEATURE_VOLCANO")
      ),
      features: Object.freeze(features),
    }),
  });
}

/**
 * Refuses an unclassified biome sentinel on modeled land while preserving it off land.
 * Artifact-local validation admits the wire sentinel; this cross-artifact boundary owns the
 * stronger product invariant that every modeled-land tile has an ecology classification.
 */
export function assertModeledLandBiomeCoverage(landMask: Uint8Array, biomeIndex: Uint8Array): void {
  if (landMask.length !== biomeIndex.length) {
    throw new Error("Standard metric capture requires land and biome grids of equal length.");
  }
  for (let index = 0; index < landMask.length; index += 1) {
    if (landMask[index] === 1 && biomeIndex[index] === 255) {
      throw new Error(
        `Standard metric capture found an unclassified biome on modeled-land tile ${index}.`
      );
    }
  }
}

function copyRealizedMap(
  adapter: ReturnType<typeof createMockAdapter>,
  width: number,
  height: number
): Pick<
  StandardMapCapture["observation"],
  "isWater" | "terrain" | "biome" | "feature" | "resource"
> {
  const size = width * height;
  const isWater = new Uint8Array(size);
  const terrain = new Int32Array(size);
  const biome = new Int32Array(size);
  const feature = new Int32Array(size);
  const resource = new Int32Array(size);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      isWater[index] = adapter.isWater(x, y) ? 1 : 0;
      terrain[index] = requireInt32(`terrain at (${x}, ${y})`, adapter.getTerrainType(x, y));
      biome[index] = requireInt32(`biome at (${x}, ${y})`, adapter.getBiomeType(x, y));
      feature[index] = requireInt32(`feature at (${x}, ${y})`, adapter.getFeatureType(x, y));
      resource[index] = requireInt32(`resource at (${x}, ${y})`, adapter.getResourceType(x, y));
    }
  }
  return { isWater, terrain, biome, feature, resource };
}

function copyUint8Grid(name: string, value: unknown, size: number): Uint8Array {
  return assertUint8Array(name, value, size).slice();
}

function copyFloat32Grid(name: string, value: unknown, size: number): Float32Array {
  return assertFloat32Array(name, value, size).slice();
}

function requireInt32(name: string, value: number): number {
  if (!Number.isInteger(value) || value < -2_147_483_648 || value > 2_147_483_647) {
    throw new Error(`Standard metric capture requires ${name} to be a signed 32-bit integer.`);
  }
  return value;
}

function requireRuntimeTypeId(name: string, value: number): number {
  const id = requireInt32(name, value);
  if (id < 0) throw new Error(`Standard metric capture could not resolve runtime type ${name}.`);
  return id;
}

function isWaterTerrain(terrain: string): boolean {
  return terrain === "TERRAIN_COAST" || terrain === "TERRAIN_OCEAN";
}

function resolveMapSelection(scenario: StandardMapMetricScenario) {
  return scenario.kind === "civ7-preset"
    ? {
        dimensions: scenario.preset.dimensions,
        mapInfo: scenario.preset.mapInfo,
        mapSizeId: scenario.preset.id,
        playerCount: scenario.preset.defaultPlayers,
      }
    : {
        dimensions: scenario.dimensions,
        mapInfo: scenario.mapInfo,
        mapSizeId: scenario.mapSizeId,
        playerCount: scenario.playerCount,
      };
}
