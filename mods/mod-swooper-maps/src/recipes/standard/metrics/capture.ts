import { createMockAdapter } from "@civ7/adapter";
import {
  FEATURE_PLACEMENT_KEYS,
  type FeatureKey,
  getEngineFeatureLegality,
  resolveResourceRuntimeIds,
} from "@civ7/map-policy";
import { admitMapSetup, createMapContext, type MapContext } from "@swooper/mapgen-core";
import {
  assertFloat32Array,
  assertInt32Array,
  assertUint8Array,
  assertUint16Array,
} from "@swooper/mapgen-core/authoring";
import {
  type ArtifactReadValueOf,
  readValidatedArtifact,
} from "@swooper/mapgen-core/authoring/contracts";

import { canonicalRecipeConfig } from "../../../maps/configs/canonical.js";
import { artifactModules as standardArtifactModules } from "../artifacts/index.js";
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
type Landmasses = ArtifactReadValueOf<typeof morphologyArtifactModules.landmasses.artifact>;
type Pedology = ArtifactReadValueOf<typeof ecologyArtifactModules.pedology.artifact>;
type RiverNetworkMetrics = ArtifactReadValueOf<
  typeof hydrologyHydrographyArtifactModules.riverNetworkMetrics.artifact
>;
type ProjectedNavigableRivers = ArtifactReadValueOf<
  typeof mapRiversArtifactModules.projectedNavigableRivers.artifact
>;
type EngineProjectionRivers = ArtifactReadValueOf<
  typeof mapRiversArtifactModules.engineProjectionRivers.artifact
>;
type ResourceDemandPlan = ArtifactReadValueOf<
  typeof placementArtifactModules.resourceDemandPlan.artifact
>;
type ResourceEligibility = ArtifactReadValueOf<
  typeof placementArtifactModules.resourceEligibility.artifact
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

type ResourceDemandExclusionReason = ResourceDemandPlan["excluded"][number]["reason"];
type StandardScenarioIneligibleReason = Extract<
  ResourceDemandExclusionReason,
  { kind: "no-admitted-legal-tiles" }
>;

/** Artifact-owned planner or age-policy exclusion distinct from scenario-specific map capacity. */
export type StandardResourceExclusionReason = Exclude<
  ResourceDemandExclusionReason,
  StandardScenarioIneligibleReason
>;

/** One family-planner candidate paired with its terminal demand-admission evidence. */
type StandardResourceCandidate = Readonly<{
  resourceType: string;
  runtimeResourceTypeId: number | null;
  groupId: ResourceDemandPlan["groups"]["groups"][number]["groupId"];
  plannerStatus: ResourceDemandPlan["groups"]["groups"][number]["plans"][number]["status"];
  targetIntentCount: number;
  plannerEligibleTileCount: number;
  admission:
    | Readonly<{
        kind: "admitted";
        habitatTileCount: number;
        legalTileCount: number;
        eligibleTileCount: number;
      }>
    | Readonly<{ kind: "scenario-ineligible"; reason: StandardScenarioIneligibleReason }>
    | Readonly<{ kind: "excluded"; reason: StandardResourceExclusionReason }>;
}>;

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
    topLatitude: number;
    bottomLatitude: number;
  }>;
  model: Readonly<{
    landMask: Uint8Array;
    regionSlotByTile: Uint8Array;
    landmassIdByTile: Int32Array;
    landmasses: readonly Pick<Landmasses["landmasses"][number], "id" | "tileCount">[];
    mountainMask: Uint8Array;
    mountainRegionMask: Uint8Array;
    hillMask: Uint8Array;
    foothillMask: Uint8Array;
    roughLandMask: Uint8Array;
    shelfMask: Uint8Array;
    coastalWater: Uint8Array;
    distanceToCoast: Uint16Array;
    volcanoMask: Uint8Array;
    volcanoes: Volcanoes["volcanoes"];
    plannedLakeMask: Uint8Array;
    riverClass: Uint8Array;
    outletMask: Uint8Array;
    terminalType: Uint8Array | null;
    riverNetworkSummary: RiverNetworkMetrics["benchmarkSummary"];
    biomeIndex: Uint8Array;
    vegetationDensity: Float32Array;
    fertility: Pedology["fertility"];
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
    candidates: readonly StandardResourceCandidate[];
    eligibility: readonly Readonly<
      Pick<ResourceEligibility["rows"][number], "resourceType" | "habitatMask">
    >[];
    intents: readonly Pick<
      ResourcePlanAdjusted["intents"][number],
      "plotIndex" | "resourceType" | "family" | "laneKind" | "phase" | "regionSlot"
    >[];
    perType: readonly Pick<
      ResourcePlan["perType"][number],
      | "resourceType"
      | "family"
      | "authoredTargetCount"
      | "plannedCount"
      | "minCount"
      | "maxCount"
      | "spacingFloorTiles"
      | "shortfalls"
    >[];
    regionMinimums: readonly ResourcePlan["regionMinimums"][number][];
    summary: ResourcePlacementOutcomes["summary"];
    outcomes: readonly Readonly<
      Pick<
        ResourcePlacementOutcomes["outcomes"][number],
        "status" | "plotIndex" | "x" | "y" | "resourceType" | "observedResourceType" | "reason"
      > & {
        headlessPolicyLegal: boolean;
      }
    >[];
    support: Readonly<{
      settings: ResourcePlanAdjusted["settings"];
      shortfalls: readonly ResourcePlanAdjusted["shortfalls"][number][];
    }>;
  }>;
  placement: Readonly<
    Pick<StartAssignment, "assigned" | "unseatedCount"> & {
      aliveMajorIds: readonly number[];
      seats: readonly Readonly<
        Pick<
          StartAssignment["seats"][number],
          | "seatIndex"
          | "playerId"
          | "playerIdSource"
          | "regionSlot"
          | "realizedRegionSlot"
          | "plotIndex"
          | "rung"
          | "status"
        > & {
          imputedFlags: readonly string[];
        }
      >[];
      fairnessReport: Readonly<{
        worstPairGap: StartAssignment["fairnessReport"]["worstPairGap"];
        relaxations: readonly StartAssignment["fairnessReport"]["relaxations"][number][];
      }>;
      naturalWonderPlotIndices: readonly number[];
    }
  >;
  observation: Readonly<{
    isWater: Uint8Array;
    isLake: Uint8Array;
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
  const setup = admitMapSetup({
    mapSeed: admittedScenario.seed,
    dimensions: selection.dimensions,
    latitudeBounds: admittedScenario.config.latitudeBounds,
  });

  const adapter = createMockAdapter({
    width,
    height,
    mapInfo: selection.mapInfo,
    mapSizeId: selection.mapSizeId,
    aliveMajorCount: selection.playerCount,
    rngSeed: admittedScenario.seed,
  });

  const context = createMapContext({ setup, adapter });
  initializeStandardRuntime(context, {
    mapInfo: selection.mapInfo,
    logPrefix: "[map-product-metrics]",
  });
  standardRecipe.run(context, canonicalRecipeConfig(admittedScenario.config), {
    log: () => {},
  });

  return copyCompletedRun(admittedScenario, context, adapter);
}

function copyCompletedRun(
  scenario: StandardMapMetricScenario,
  context: MapContext,
  adapter: ReturnType<typeof createMockAdapter>
): StandardMapCapture {
  const selection = resolveMapSelection(scenario);
  const { width, height } = selection.dimensions;
  const gridSize = width * height;
  const topographyValue = readValidatedArtifact(context, morphologyArtifactModules.topography);
  const landmassesValue = readValidatedArtifact(context, morphologyArtifactModules.landmasses);
  const mountainsValue = readValidatedArtifact(context, morphologyArtifactModules.mountains);
  const shelfValue = readValidatedArtifact(context, morphologyArtifactModules.shelf);
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
  const pedologyValue = readValidatedArtifact(context, ecologyArtifactModules.pedology);
  const featureDiagnosticsValue = readValidatedArtifact(
    context,
    ecologyArtifactModules.featureApplyDiagnostics
  );
  const placementSurfaceValue = readValidatedArtifact(
    context,
    placementArtifactModules.placementSurfacePreparation
  );
  const regionSlotsValue = readValidatedArtifact(
    context,
    standardArtifactModules.landmassRegionSlotByTile
  );
  const resourceDemandPlanValue = readValidatedArtifact(
    context,
    placementArtifactModules.resourceDemandPlan
  );
  const resourceEligibilityValue = readValidatedArtifact(
    context,
    placementArtifactModules.resourceEligibility
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
  const naturalWonderPlacementValue = readValidatedArtifact(
    context,
    placementArtifactModules.naturalWonderPlacement
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
      topLatitude: scenario.config.latitudeBounds.topLatitude,
      bottomLatitude: scenario.config.latitudeBounds.bottomLatitude,
    }),
    model: Object.freeze({
      landMask,
      regionSlotByTile: copyUint8Grid(
        "map.landmassRegionSlotByTile.slotByTile",
        regionSlotsValue.slotByTile,
        gridSize
      ),
      landmassIdByTile: copyInt32Grid(
        "morphology.landmasses.landmassIdByTile",
        landmassesValue.landmassIdByTile,
        gridSize
      ),
      landmasses: Object.freeze(
        landmassesValue.landmasses.map(({ id, tileCount }) => Object.freeze({ id, tileCount }))
      ),
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
      shelfMask: copyUint8Grid("morphology.shelf.shelfMask", shelfValue.shelfMask, gridSize),
      coastalWater: copyUint8Grid(
        "morphology.shelf.coastalWater",
        shelfValue.coastalWater,
        gridSize
      ),
      distanceToCoast: copyUint16Grid(
        "morphology.shelf.distanceToCoast",
        shelfValue.distanceToCoast,
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
      fertility: copyFloat32Grid("ecology.soils.fertility", pedologyValue.fertility, gridSize),
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
      candidates: copyResourceCandidates(resourceDemandPlanValue),
      eligibility: Object.freeze(
        resourceEligibilityValue.rows.map((row) =>
          Object.freeze({
            resourceType: row.resourceType,
            habitatMask: copyUint8Grid(
              `placement.resourceEligibility.${row.resourceType}.habitatMask`,
              row.habitatMask,
              gridSize
            ),
          })
        )
      ),
      intents: Object.freeze(
        adjustedResourcePlanValue.intents.map((intent) =>
          Object.freeze({
            plotIndex: intent.plotIndex,
            resourceType: intent.resourceType,
            family: intent.family,
            laneKind: intent.laneKind,
            phase: intent.phase,
            regionSlot: intent.regionSlot,
          })
        )
      ),
      perType: Object.freeze(
        resourcePlanValue.perType.map((row) =>
          Object.freeze({
            resourceType: row.resourceType,
            family: row.family,
            authoredTargetCount: row.authoredTargetCount,
            plannedCount: row.plannedCount,
            minCount: row.minCount,
            maxCount: row.maxCount,
            spacingFloorTiles: row.spacingFloorTiles,
            shortfalls: Object.freeze(row.shortfalls.map((item) => Object.freeze({ ...item }))),
          })
        )
      ),
      regionMinimums: Object.freeze(
        resourcePlanValue.regionMinimums.map((row) => Object.freeze({ ...row }))
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
            x: outcome.x,
            y: outcome.y,
            resourceType: outcome.resourceType,
            observedResourceType: outcome.observedResourceType,
            reason: outcome.reason,
            headlessPolicyLegal:
              outcome.x >= 0 &&
              outcome.y >= 0 &&
              outcome.x < width &&
              outcome.y < height &&
              adapter.canHaveResource(outcome.x, outcome.y, outcome.resourceType),
          })
        )
      ),
      support: Object.freeze({
        settings: Object.freeze({ ...adjustedResourcePlanValue.settings }),
        shortfalls: Object.freeze(
          adjustedResourcePlanValue.shortfalls.map((row) => Object.freeze({ ...row }))
        ),
      }),
    }),
    placement: Object.freeze({
      aliveMajorIds: copyAliveMajorIds(adapter),
      seats: Object.freeze(
        startValue.seats.map((seat) =>
          Object.freeze({
            seatIndex: seat.seatIndex,
            playerId: seat.playerId,
            playerIdSource: seat.playerIdSource,
            regionSlot: seat.regionSlot,
            realizedRegionSlot: seat.realizedRegionSlot,
            plotIndex: seat.plotIndex,
            rung: seat.rung,
            status: seat.status,
            imputedFlags: Object.freeze([...seat.imputedFlags]),
          })
        )
      ),
      fairnessReport: Object.freeze({
        worstPairGap: startValue.fairnessReport.worstPairGap,
        relaxations: Object.freeze(
          startValue.fairnessReport.relaxations.map((row) => Object.freeze({ ...row }))
        ),
      }),
      naturalWonderPlotIndices: Object.freeze([
        ...naturalWonderPlacementValue.observedNaturalWonderPlotIndices,
      ]),
      assigned: startValue.assigned,
      unseatedCount: startValue.unseatedCount,
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

function copyRealizedMap(
  adapter: ReturnType<typeof createMockAdapter>,
  width: number,
  height: number
): Pick<
  StandardMapCapture["observation"],
  "isWater" | "isLake" | "terrain" | "biome" | "feature" | "resource"
> {
  const size = width * height;
  const isWater = new Uint8Array(size);
  const isLake = new Uint8Array(size);
  const terrain = new Int32Array(size);
  const biome = new Int32Array(size);
  const feature = new Int32Array(size);
  const resource = new Int32Array(size);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      isWater[index] = adapter.isWater(x, y) ? 1 : 0;
      isLake[index] = adapter.isLake(x, y) ? 1 : 0;
      terrain[index] = requireInt32(`terrain at (${x}, ${y})`, adapter.getTerrainType(x, y));
      biome[index] = requireInt32(`biome at (${x}, ${y})`, adapter.getBiomeType(x, y));
      feature[index] = requireInt32(`feature at (${x}, ${y})`, adapter.getFeatureType(x, y));
      resource[index] = requireInt32(`resource at (${x}, ${y})`, adapter.getResourceType(x, y));
    }
  }
  return { isWater, isLake, terrain, biome, feature, resource };
}

function copyUint8Grid(name: string, value: unknown, size: number): Uint8Array {
  return assertUint8Array(name, value, size).slice();
}

function copyUint16Grid(name: string, value: unknown, size: number): Uint16Array {
  return assertUint16Array(name, value, size).slice();
}

function copyInt32Grid(name: string, value: unknown, size: number): Int32Array {
  return assertInt32Array(name, value, size).slice();
}

function copyFloat32Grid(name: string, value: unknown, size: number): Float32Array {
  return assertFloat32Array(name, value, size).slice();
}

function copyAliveMajorIds(adapter: ReturnType<typeof createMockAdapter>): readonly number[] {
  const ids = adapter
    .getAliveMajorIds()
    .map((id) => requireRuntimeTypeId("alive major player", id));
  if (new Set(ids).size !== ids.length) {
    throw new Error("Standard metric capture requires unique alive major player ids.");
  }
  return Object.freeze(ids);
}

function copyResourceCandidates(value: ResourceDemandPlan): readonly StandardResourceCandidate[] {
  const runtimeIds = new Map<string, number>(
    [...resolveResourceRuntimeIds().byType].map(([resourceType, resolved]) => [
      resourceType,
      resolved.resourceTypeId,
    ])
  );
  const demands = uniqueByResourceType(value.demands, "resource demand");
  const exclusions = uniqueByResourceType(value.excluded, "resource exclusion");
  const seen = new Set<string>();
  const candidates: StandardResourceCandidate[] = [];

  for (const group of value.groups.groups) {
    for (const plan of group.plans) {
      if (seen.has(plan.resourceType)) {
        throw new Error(`Standard metric capture found duplicate candidate ${plan.resourceType}.`);
      }
      seen.add(plan.resourceType);
      const demand = demands.get(plan.resourceType);
      const exclusion = exclusions.get(plan.resourceType);
      candidates.push(
        Object.freeze({
          resourceType: plan.resourceType,
          runtimeResourceTypeId: runtimeIds.get(plan.resourceType) ?? null,
          groupId: group.groupId,
          plannerStatus: plan.status,
          targetIntentCount: plan.targetIntentCount,
          plannerEligibleTileCount: plan.eligibleTileCount,
          admission: copyResourceAdmission(plan.resourceType, demand, exclusion),
        })
      );
    }
  }

  if (seen.size !== demands.size + exclusions.size) {
    throw new Error("Standard metric resource candidates do not close demand and exclusion rows.");
  }
  return Object.freeze(candidates);
}

function copyResourceAdmission(
  resourceType: string,
  demand: ResourceDemandPlan["demands"][number] | undefined,
  exclusion: ResourceDemandPlan["excluded"][number] | undefined
): StandardResourceCandidate["admission"] {
  if (demand && exclusion) {
    throw new Error(`Standard metric candidate ${resourceType} is both admitted and excluded.`);
  }
  if (demand) {
    return Object.freeze({
      kind: "admitted",
      habitatTileCount: demand.habitatTileCount,
      legalTileCount: demand.legalTileCount,
      eligibleTileCount: demand.eligibleTileCount,
    });
  }
  if (exclusion?.reason.kind === "no-admitted-legal-tiles") {
    return Object.freeze({
      kind: "scenario-ineligible",
      reason: copyResourceExclusionReason(exclusion.reason),
    });
  }
  if (exclusion) {
    return Object.freeze({
      kind: "excluded",
      reason: copyResourceExclusionReason(exclusion.reason),
    });
  }
  throw new Error(`Standard metric candidate ${resourceType} has no terminal admission row.`);
}

function copyResourceExclusionReason(
  reason: StandardScenarioIneligibleReason
): StandardScenarioIneligibleReason;
function copyResourceExclusionReason(
  reason: StandardResourceExclusionReason
): StandardResourceExclusionReason;
function copyResourceExclusionReason(
  reason: ResourceDemandExclusionReason
): ResourceDemandExclusionReason {
  switch (reason.kind) {
    case "outside-official-resource-corpus":
    case "no-admitted-legal-tiles":
      return Object.freeze({ kind: reason.kind });
    case "planner-status":
      return Object.freeze({ kind: reason.kind, status: reason.status });
    case "age-policy":
      return Object.freeze({ kind: reason.kind, status: reason.status, age: reason.age });
    default:
      return assertNever(reason);
  }
}

function uniqueByResourceType<T extends Readonly<{ resourceType: string }>>(
  rows: readonly T[],
  label: string
): ReadonlyMap<string, T> {
  const byType = new Map<string, T>();
  for (const row of rows) {
    if (byType.has(row.resourceType)) {
      throw new Error(`Standard metric capture found duplicate ${label} ${row.resourceType}.`);
    }
    byType.set(row.resourceType, row);
  }
  return byType;
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

function assertNever(value: never): never {
  throw new Error(`Unknown Standard metric state ${String(value)}.`);
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
