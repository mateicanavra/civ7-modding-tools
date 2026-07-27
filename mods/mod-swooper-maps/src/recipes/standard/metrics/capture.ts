import { createMockAdapter } from "@civ7/adapter";
import {
  FEATURE_PLACEMENT_KEYS,
  type FeatureKey,
  getEngineFeatureLegality,
  resolveResourceRuntimeIds,
} from "@civ7/map-policy";
import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import { artifacts as placementRegionArtifacts } from "@mapgen/domain/placement/modules/regions/artifacts/index.js";
import { artifacts as placementStartArtifacts } from "@mapgen/domain/placement/modules/starts/artifacts/index.js";
import { artifacts as placementWonderArtifacts } from "@mapgen/domain/placement/modules/wonders/artifacts/index.js";
import { artifacts as resourceDemandArtifacts } from "@mapgen/domain/resources/modules/demand/artifacts/index.js";
import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import { artifacts as resourceSupportArtifacts } from "@mapgen/domain/resources/modules/support/artifacts/index.js";
import { admitMapSetup, createMapContext, type MapContext } from "@swooper/mapgen-core";
import {
  type ArtifactReadValueOf,
  assertFloat32Array,
  assertInt32Array,
  assertUint8Array,
  assertUint16Array,
  readValidatedArtifact,
} from "@swooper/mapgen-core/authoring";
import { Value } from "typebox/value";
import { canonicalRecipeConfig } from "../../../maps/configs/canonical.js";
import standardRecipe from "../recipe.js";
import {
  type StandardDiscoveryPlacementMeasurements,
  StandardDiscoveryPlacementMeasurementsSchema,
} from "./families/discovery-placement.js";
import {
  type StandardFeatureProjectionMeasurements,
  StandardFeatureProjectionMeasurementsSchema,
} from "./families/ecology-projection.js";
import {
  type StandardLakeProjectionMeasurements,
  StandardLakeProjectionMeasurementsSchema,
} from "./families/hydrology/lake-projection.js";
import {
  type StandardRiverNetworkMeasurements,
  StandardRiverNetworkMeasurementsSchema,
} from "./families/hydrology/river-network.js";
import {
  STANDARD_RESOURCE_PLACEMENT_METRIC_KEY,
  type StandardResourcePlacementMeasurements,
  StandardResourcePlacementMeasurementsSchema,
} from "./families/placement/resource-placement.js";
import {
  type StandardPlacementParityMeasurements,
  StandardPlacementParityMeasurementsSchema,
} from "./families/placement-parity.js";
import { defineStandardMapMetricScenario, type StandardMapMetricScenario } from "./scenario.js";

type Volcanoes = ArtifactReadValueOf<typeof morphologyLandformsArtifacts.volcanoes>;
type Landmasses = ArtifactReadValueOf<typeof morphologyLandformsArtifacts.landmasses>;
type Pedology = ArtifactReadValueOf<typeof pedologyArtifacts.pedology>;
type ProjectedNavigableRivers = ArtifactReadValueOf<
  typeof hydrographyArtifacts.projectedNavigableRivers
>;
type ResourceDemandPlan = ArtifactReadValueOf<typeof resourceDemandArtifacts.resourceDemandPlan>;
type ResourcePlan = ArtifactReadValueOf<typeof resourceSiteArtifacts.resourcePlan>;
type ResourcePlanAdjusted = ArtifactReadValueOf<
  typeof resourceSupportArtifacts.resourcePlanAdjusted
>;
type StartAssignment = ArtifactReadValueOf<typeof placementStartArtifacts.startAssignment>;

type AdmittedResourceDemandCandidate = ResourceDemandPlan["candidates"]["admitted"][number];
type ResourceDemandExclusions = ResourceDemandPlan["candidates"]["excluded"];
type ExcludedResourceDemandCandidate =
  | ResourceDemandExclusions["expectationBlocked"][number]
  | ResourceDemandExclusions["ageDeferred"][number]
  | ResourceDemandExclusions["noLegalSites"][number];
type ResourceDemandCandidate = AdmittedResourceDemandCandidate | ExcludedResourceDemandCandidate;
type ResourceDemandExclusionReason = ExcludedResourceDemandCandidate["reason"];
type StandardScenarioIneligibleReason = Extract<
  ResourceDemandExclusionReason,
  { kind: "no-legal-sites" }
>;

/** Artifact-owned expectation or age-policy exclusion distinct from scenario-specific map capacity. */
export type StandardResourceExclusionReason = Exclude<
  ResourceDemandExclusionReason,
  StandardScenarioIneligibleReason
>;

/** One canonical resource expectation paired with its terminal demand-admission evidence. */
type StandardResourceCandidateBase = Readonly<{
  resourceType: string;
  runtimeResourceTypeId: number | null;
  groupId: ResourceDemandCandidate["source"]["groupId"];
  expectationStatus: ResourceDemandCandidate["source"]["expectationStatus"];
}>;

type StandardResourceSiteEvidence = Readonly<{
  targetIntentCount: number;
  habitatTileCount: number;
}>;

type StandardResourceCandidateAdmission =
  | (StandardResourceSiteEvidence &
      Readonly<{
        kind: "admitted";
        legalTileCount: number;
        eligibleTileCount: number;
        habitatMask: Uint8Array;
      }>)
  | (StandardResourceSiteEvidence &
      Readonly<{
        kind: "scenario-ineligible";
        reason: StandardScenarioIneligibleReason;
      }>)
  | Readonly<{ kind: "excluded"; reason: StandardResourceExclusionReason }>;

type StandardResourceCandidate = StandardResourceCandidateBase &
  Readonly<{ admission: StandardResourceCandidateAdmission }>;

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
    terminalType: Uint8Array;
    riverNetworkSummary: StandardRiverNetworkMeasurements;
    biomeIndex: Uint8Array;
    vegetationDensity: Float32Array;
    fertility: Pedology["fertility"];
    effectiveMoisture: Float32Array;
    surfaceTemperature: Float32Array;
    aridityIndex: Float32Array;
  }>;
  projection: Readonly<{
    discoveryGeneration: StandardDiscoveryPlacementMeasurements;
    lakes: StandardLakeProjectionMeasurements;
    placementParity: StandardPlacementParityMeasurements;
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
    riverReadback: Readonly<{
      terrainNavigableRiverTileCount: number;
      riverMismatchCount: number;
      selectedRiverRejectedCount: number;
      extraEngineRiverCount: number;
    }>;
    featureAttempts: Readonly<Record<string, number>>;
    featureRejections: Readonly<Record<string, number>>;
  }>;
  resources: Readonly<{
    candidates: readonly StandardResourceCandidate[];
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
    summary: StandardResourcePlacementMeasurements["summary"];
    outcomes: readonly Readonly<
      StandardResourcePlacementMeasurements["outcomes"][number] & {
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
  let riverNetworkSummary: StandardRiverNetworkMeasurements | undefined;
  let discoveryGeneration: StandardDiscoveryPlacementMeasurements | undefined;
  let featureProjection: StandardFeatureProjectionMeasurements | undefined;
  let lakeProjection: StandardLakeProjectionMeasurements | undefined;
  let placementParity: StandardPlacementParityMeasurements | undefined;
  let resourcePlacement: StandardResourcePlacementMeasurements | undefined;
  let metricFailure: unknown;
  standardRecipe.run(context, canonicalRecipeConfig(admittedScenario.config), {
    log: () => {},
    facets: {
      metrics: (projection) => {
        const discoveryCandidate = projection["placement.discoveryGeneration"];
        if (discoveryCandidate !== undefined) {
          discoveryGeneration = Value.Parse(
            StandardDiscoveryPlacementMeasurementsSchema,
            discoveryCandidate
          );
        }
        const candidate = projection["hydrology.riverNetwork"];
        if (candidate !== undefined) {
          riverNetworkSummary = Value.Parse(StandardRiverNetworkMeasurementsSchema, candidate);
        }
        const featureCandidate = projection["ecology.featureProjection"];
        if (featureCandidate !== undefined) {
          featureProjection = Value.Parse(
            StandardFeatureProjectionMeasurementsSchema,
            featureCandidate
          );
        }
        const lakeCandidate = projection["map.hydrology.lakeProjection"];
        if (lakeCandidate !== undefined) {
          lakeProjection = Value.Parse(StandardLakeProjectionMeasurementsSchema, lakeCandidate);
        }
        const placementCandidate = projection["placement.parity"];
        if (placementCandidate !== undefined) {
          placementParity = Value.Parse(
            StandardPlacementParityMeasurementsSchema,
            placementCandidate
          );
        }
        const resourcePlacementCandidate = projection[STANDARD_RESOURCE_PLACEMENT_METRIC_KEY];
        if (resourcePlacementCandidate !== undefined) {
          resourcePlacement = Value.Parse(
            StandardResourcePlacementMeasurementsSchema,
            resourcePlacementCandidate
          );
        }
      },
      onError: ({ facet, error }) => {
        if (facet === "metrics") metricFailure = error;
      },
    },
  });
  if (metricFailure !== undefined) throw metricFailure;
  if (!riverNetworkSummary) {
    throw new Error("Standard metric capture requires Hydrology river-network benchmark evidence.");
  }
  if (!discoveryGeneration) {
    throw new Error("Standard metric capture requires Placement discovery-generation evidence.");
  }
  if (!featureProjection) {
    throw new Error("Standard metric capture requires Ecology feature-projection evidence.");
  }
  if (!lakeProjection) {
    throw new Error("Standard metric capture requires Hydrology lake-projection evidence.");
  }
  if (!placementParity) {
    throw new Error("Standard metric capture requires terminal Placement parity evidence.");
  }
  if (!resourcePlacement) {
    throw new Error("Standard metric capture requires terminal resource-placement evidence.");
  }

  return copyCompletedRun(
    admittedScenario,
    context,
    adapter,
    riverNetworkSummary,
    discoveryGeneration,
    featureProjection,
    lakeProjection,
    placementParity,
    resourcePlacement
  );
}

function copyCompletedRun(
  scenario: StandardMapMetricScenario,
  context: MapContext,
  adapter: ReturnType<typeof createMockAdapter>,
  riverNetworkSummary: StandardRiverNetworkMeasurements,
  discoveryGeneration: StandardDiscoveryPlacementMeasurements,
  featureProjection: StandardFeatureProjectionMeasurements,
  lakeProjection: StandardLakeProjectionMeasurements,
  placementParity: StandardPlacementParityMeasurements,
  resourcePlacement: StandardResourcePlacementMeasurements
): StandardMapCapture {
  const selection = resolveMapSelection(scenario);
  const { width, height } = selection.dimensions;
  const gridSize = width * height;
  const topographyValue = readValidatedArtifact(context, morphologyLandformsArtifacts.topography);
  const landmassesValue = readValidatedArtifact(context, morphologyLandformsArtifacts.landmasses);
  const mountainsValue = readValidatedArtifact(context, morphologyLandformsArtifacts.mountains);
  const shelfValue = readValidatedArtifact(context, morphologyShelfArtifacts.shelf);
  const volcanoesValue = readValidatedArtifact(context, morphologyLandformsArtifacts.volcanoes);
  const lakePlanValue = readValidatedArtifact(context, hydrographyArtifacts.lakePlan);
  const hydrographyValue = readValidatedArtifact(context, hydrographyArtifacts.hydrography);
  const climateIndicesValue = readValidatedArtifact(context, climateArtifacts.climateIndices);
  const navigableRiverValue = readValidatedArtifact(
    context,
    hydrographyArtifacts.projectedNavigableRivers
  );
  const riverReadbackValue = adapter.readRiverProjection(
    width,
    height,
    navigableRiverValue.riverMask
  );
  const biomeValue = readValidatedArtifact(context, biomeArtifacts.biomeClassification);
  const pedologyValue = readValidatedArtifact(context, pedologyArtifacts.pedology);
  const regionSlotsValue = readValidatedArtifact(
    context,
    placementRegionArtifacts.landmassRegionSlotByTile
  );
  const resourceDemandPlanValue = readValidatedArtifact(
    context,
    resourceDemandArtifacts.resourceDemandPlan
  );
  const resourcePlanValue = readValidatedArtifact(context, resourceSiteArtifacts.resourcePlan);
  const adjustedResourcePlanValue = readValidatedArtifact(
    context,
    resourceSupportArtifacts.resourcePlanAdjusted
  );
  const naturalWonderPlacementValue = readValidatedArtifact(
    context,
    placementWonderArtifacts.naturalWonderPlacement
  );
  const startValue = readValidatedArtifact(context, placementStartArtifacts.startAssignment);
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
      terminalType: copyUint8Grid(
        "hydrology.hydrography.terminalType",
        hydrographyValue.terminalType,
        gridSize
      ),
      riverNetworkSummary: Object.freeze({ ...riverNetworkSummary }),
      biomeIndex,
      vegetationDensity: copyFloat32Grid(
        "ecology.biomeClassification.vegetationDensity",
        biomeValue.vegetationDensity,
        gridSize
      ),
      fertility: copyFloat32Grid("ecology.soils.fertility", pedologyValue.fertility, gridSize),
      effectiveMoisture: copyFloat32Grid(
        "hydrology.climateIndices.effectiveMoisture",
        climateIndicesValue.effectiveMoisture,
        gridSize
      ),
      surfaceTemperature: copyFloat32Grid(
        "hydrology.climateIndices.surfaceTemperatureC",
        climateIndicesValue.surfaceTemperatureC,
        gridSize
      ),
      aridityIndex: copyFloat32Grid(
        "hydrology.climateIndices.aridityIndex",
        climateIndicesValue.aridityIndex,
        gridSize
      ),
    }),
    projection: Object.freeze({
      discoveryGeneration: Object.freeze({ ...discoveryGeneration }),
      lakes: Object.freeze({
        ...lakeProjection,
        components: Object.freeze({ ...lakeProjection.components }),
      }),
      placementParity: Object.freeze({ ...placementParity }),
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
        riverMismatchCount: riverReadbackValue.navigableRiverMismatchTileCount,
        selectedRiverRejectedCount: riverReadbackValue.rejectedNavigableRiverTileCount,
        extraEngineRiverCount: riverReadbackValue.extraNavigableRiverTileCount,
      }),
      featureAttempts: Object.freeze({ ...featureProjection.attemptedByFeature }),
      featureRejections: Object.freeze({
        ...featureProjection.rejectedCanHaveFeatureByFeature,
      }),
    }),
    resources: Object.freeze({
      candidates: copyResourceCandidates(resourceDemandPlanValue, gridSize),
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
        ...resourcePlacement.summary,
        coordinateEvidence: Object.freeze({
          ...resourcePlacement.summary.coordinateEvidence,
          placed: Object.freeze({ ...resourcePlacement.summary.coordinateEvidence.placed }),
          rejected: Object.freeze({
            ...resourcePlacement.summary.coordinateEvidence.rejected,
          }),
        }),
        byResource: Object.freeze(
          resourcePlacement.summary.byResource.map((row) =>
            Object.freeze({
              ...row,
              reasons: Object.freeze(row.reasons.map((reason) => Object.freeze({ ...reason }))),
            })
          )
        ),
        byReason: Object.freeze(
          resourcePlacement.summary.byReason.map((row) => Object.freeze({ ...row }))
        ),
        shortfalls: Object.freeze(
          resourcePlacement.summary.shortfalls.map((row) => Object.freeze({ ...row }))
        ),
        byPhase: Object.freeze({ ...resourcePlacement.summary.byPhase }),
      }),
      outcomes: Object.freeze(
        resourcePlacement.outcomes.map((outcome) =>
          Object.freeze({
            ...outcome,
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

function copyResourceCandidates(
  value: ResourceDemandPlan,
  gridSize: number
): readonly StandardResourceCandidate[] {
  const runtimeIds = new Map<string, number>(
    [...resolveResourceRuntimeIds().byType].map(([resourceType, resolved]) => [
      resourceType,
      resolved.resourceTypeId,
    ])
  );
  const excluded = value.candidates.excluded;
  return Object.freeze([
    ...value.candidates.admitted.map(
      (candidate): StandardResourceCandidate =>
        Object.freeze({
          ...copyResourceCandidateIdentity(candidate, runtimeIds),
          admission: Object.freeze({
            kind: "admitted",
            targetIntentCount: candidate.source.targetIntentCount,
            habitatTileCount: candidate.source.habitatTileCount,
            legalTileCount: candidate.demand.legalTileCount,
            eligibleTileCount: candidate.demand.eligibleTileCount,
            habitatMask: copyUint8Grid(
              `placement.resourceDemandPlan.${candidate.source.resourceType}.habitatMask`,
              candidate.source.habitatMask,
              gridSize
            ),
          }),
        })
    ),
    ...excluded.noLegalSites.map(
      (candidate): StandardResourceCandidate =>
        Object.freeze({
          ...copyResourceCandidateIdentity(candidate, runtimeIds),
          admission: Object.freeze({
            kind: "scenario-ineligible",
            targetIntentCount: candidate.source.targetIntentCount,
            habitatTileCount: candidate.source.habitatTileCount,
            reason: copyResourceExclusionReason(candidate.reason),
          }),
        })
    ),
    ...excluded.expectationBlocked.map(
      (candidate): StandardResourceCandidate =>
        Object.freeze({
          ...copyResourceCandidateIdentity(candidate, runtimeIds),
          admission: Object.freeze({
            kind: "excluded",
            reason: copyResourceExclusionReason(candidate.reason),
          }),
        })
    ),
    ...excluded.ageDeferred.map(
      (candidate): StandardResourceCandidate =>
        Object.freeze({
          ...copyResourceCandidateIdentity(candidate, runtimeIds),
          admission: Object.freeze({
            kind: "excluded",
            reason: copyResourceExclusionReason(candidate.reason),
          }),
        })
    ),
  ]);
}

function copyResourceCandidateIdentity(
  candidate: ResourceDemandCandidate,
  runtimeIds: ReadonlyMap<string, number>
): StandardResourceCandidateBase {
  return Object.freeze({
    resourceType: candidate.source.resourceType,
    runtimeResourceTypeId: runtimeIds.get(candidate.source.resourceType) ?? null,
    groupId: candidate.source.groupId,
    expectationStatus: candidate.source.expectationStatus,
  });
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
    case "expectation-blocked":
      return Object.freeze({ kind: reason.kind });
    case "age-policy":
      return Object.freeze({ kind: reason.kind, status: reason.status, age: reason.age });
    case "no-legal-sites":
      return Object.freeze({
        kind: reason.kind,
        legalMask: reason.legalMask.slice(),
      });
    default:
      return assertNever(reason);
  }
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
