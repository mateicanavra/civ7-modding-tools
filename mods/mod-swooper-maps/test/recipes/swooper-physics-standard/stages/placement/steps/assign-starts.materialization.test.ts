import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { NATURAL_WONDER_CATALOG } from "@civ7/map-policy";
import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import { artifacts as placementRegionArtifacts } from "@mapgen/domain/placement/modules/regions/artifacts/index.js";
import { artifacts as placementStartArtifacts } from "@mapgen/domain/placement/modules/starts/artifacts/index.js";
import placement from "@mapgen/domain/placement/router";
import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import { admitMapSetup, createMapContext, type MapContext } from "@swooper/mapgen-core";
import {
  readValidatedArtifact,
  type Static,
  type StepRuntimeOps,
} from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";

import { AssignStartsStep } from "../../../../../../src/recipes/standard/stages/placement/steps/assign-starts/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

type AssignStartsConfig = Static<(typeof AssignStartsStep.contract)["schema"]>;
type AssignStartsOps = StepRuntimeOps<NonNullable<(typeof AssignStartsStep.contract)["ops"]>>;
type LandTile = readonly [x: number, y: number];

const ASSIGN_STARTS_OP_CONTRACTS = AssignStartsStep.contract.ops!;
const STARTS_RUNTIME_OP = Object.assign(
  (
    input: Parameters<AssignStartsOps["starts"]>[0],
    config: Parameters<AssignStartsOps["starts"]>[1]
  ): ReturnType<AssignStartsOps["starts"]> => placement.starts.ops.planStarts.run(input, config),
  {
    id: ASSIGN_STARTS_OP_CONTRACTS.starts.id,
    kind: ASSIGN_STARTS_OP_CONTRACTS.starts.kind,
  }
);
const ASSIGN_STARTS_OPS = { starts: STARTS_RUNTIME_OP } satisfies AssignStartsOps;

function assignStartsConfig(
  configure?: (config: (typeof placement.starts.ops.planStarts.defaultConfig)["config"]) => void
): AssignStartsConfig {
  const selection = structuredClone(placement.starts.ops.planStarts.defaultConfig);
  selection.config.minContiguousLandTiles = 12;
  selection.config.minExpansionLandTiles = 6;
  selection.config.minIslandClusterLandTiles = 8;
  selection.config.maxIslandStartCoastDistance = 1;
  selection.config.spacingFloorTiles = 2;
  selection.config.desiredSpacingTiles = 4;
  configure?.(selection.config);
  return {
    starts: normalizeOperationSelectionForTest(placement.starts.ops.planStarts, selection),
  };
}

function createAssignStartsContext(alivePlayerIds: readonly number[]) {
  const adapter = createMockAdapter({
    ...TEST_MAP_SIZE.dimensions,
    mapInfo: TEST_MAP_SIZE.mapInfo,
    mapSizeId: TEST_MAP_SIZE.id,
    aliveMajorCount: alivePlayerIds.length,
  });
  adapter.getAliveMajorIds = () => [...alivePlayerIds];
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: {
        topLatitude: TEST_MAP_SIZE.mapInfo.MaxLatitude!,
        bottomLatitude: TEST_MAP_SIZE.mapInfo.MinLatitude!,
      },
    }),
    adapter,
  });
  return { adapter, context };
}

function publishAssignStartsInputs(context: MapContext, landTiles: readonly LandTile[]): void {
  const { width, height } = context.setup.dimensions;
  const size = width * height;
  const landMask = new Uint8Array(size);
  const landmassIdByTile = new Int32Array(size).fill(-1);
  const slotByTile = new Uint8Array(size);
  const coastalLand = new Uint8Array(size);
  for (const [x, y] of landTiles) {
    const plotIndex = y * width + x;
    landMask[plotIndex] = 1;
    landmassIdByTile[plotIndex] = 0;
    slotByTile[plotIndex] = 1;
    coastalLand[plotIndex] = 1;
  }
  const xs = landTiles.map(([x]) => x);
  const ys = landTiles.map(([, y]) => y);
  const landmasses =
    landTiles.length === 0
      ? []
      : [
          {
            id: 0,
            tileCount: landTiles.length,
            coastlineLength: 0,
            bbox: {
              west: Math.min(...xs),
              east: Math.max(...xs),
              south: Math.min(...ys),
              north: Math.max(...ys),
            },
          },
        ];

  publishTestArtifact(context, resourceSiteArtifacts.resourcePlan, {
    width,
    height,
    seed: TEST_MAP_SEED,
    plannedCount: 0,
    rotationCount: 0,
    rangeFloorCount: 0,
    regionMinimumCount: 0,
    siteSpacingTiles: 0,
    equitySkippedSiteCount: 0,
    intents: [],
    perType: [],
    regionMinimums: [],
    settings: {
      density: 1,
      sparsity: 0,
      rarityFidelity: 1,
      perTypeSpacingFloorScale: 1,
      equityMaxDensityRatio: 1,
      affinityRuleCount: 0,
      affinityRules: [],
    },
  });
  publishTestArtifact(context, placementRegionArtifacts.landmassRegionSlotByTile, {
    slotByTile,
  });
  publishTestArtifact(context, morphologyLandformsArtifacts.topography, {
    elevation: new Int16Array(size).fill(500),
    seaLevel: 0,
    landMask,
    bathymetry: new Int16Array(size),
  });
  publishTestArtifact(context, morphologyLandformsArtifacts.landmasses, {
    landmasses,
    landmassIdByTile,
  });
  publishTestArtifact(context, morphologyLandformsArtifacts.mountains, {
    mountainMask: new Uint8Array(size),
    mountainRegionMask: new Uint8Array(size),
    mountainRegionIdByTile: new Int32Array(size).fill(-1),
    hillMask: new Uint8Array(size),
    foothillMask: new Uint8Array(size),
    roughLandMask: new Uint8Array(size),
    orogenyPotential: new Uint8Array(size),
    fracturePotential: new Uint8Array(size),
    roughnessPotential: new Uint8Array(size),
  });
  publishTestArtifact(context, morphologyLandformsArtifacts.volcanoes, {
    volcanoMask: new Uint8Array(size),
    volcanoes: [],
  });
  publishTestArtifact(context, morphologyShelfArtifacts.shelf, {
    shelfMask: new Uint8Array(size),
    coastalLand,
    coastalWater: new Uint8Array(size),
    distanceToCoast: new Uint16Array(size),
  });
  publishTestArtifact(context, hydrographyArtifacts.hydrography, {
    runoff: new Float32Array(size),
    discharge: new Float32Array(size),
    riverClass: new Uint8Array(size),
    flowDir: new Int32Array(size).fill(-1),
    sinkMask: new Uint8Array(size),
    outletMask: new Uint8Array(size),
    basinId: new Int32Array(size).fill(-1),
    routingElevation: new Float32Array(size),
    depressionDepth: new Float32Array(size),
    terminalType: new Uint8Array(size),
  });
  publishTestArtifact(context, hydrographyArtifacts.lakePlan, {
    width,
    height,
    lakeMask: new Uint8Array(size),
    plannedLakeTileCount: 0,
    sinkLakeCount: 0,
  });
  publishTestArtifact(context, climateArtifacts.climateIndices, {
    surfaceTemperatureC: new Float32Array(size).fill(16),
    effectiveMoisture: new Float32Array(size).fill(0.5),
    pet: new Float32Array(size),
    aridityIndex: new Float32Array(size).fill(0.5),
    freezeIndex: new Float32Array(size),
  });
  publishTestArtifact(context, pedologyArtifacts.pedology, {
    width,
    height,
    soilType: new Uint8Array(size),
    fertility: new Float32Array(size).fill(0.5),
  });
}

function runAssignStartsStep(
  context: MapContext,
  landTiles: readonly LandTile[],
  config: AssignStartsConfig = assignStartsConfig()
): void {
  withMapContextExecutionForTest(context, (stepContext) => {
    publishAssignStartsInputs(stepContext, landTiles);
    AssignStartsStep.run(
      stepContext,
      config,
      ASSIGN_STARTS_OPS,
      buildStepTestDependencies(AssignStartsStep, stepContext)
    );
  });
}

describe("assign starts step", () => {
  it("stamps every planned seat with the operation-owned player and plot identities", () => {
    const landTiles = Array.from(
      { length: 80 },
      (_value, index) => [1 + (index % 10), 1 + Math.floor(index / 10)] as const
    );
    const { adapter, context } = createAssignStartsContext([4, 9]);

    runAssignStartsStep(context, landTiles);
    const assignment = readValidatedArtifact(context, placementStartArtifacts.startAssignment);

    expect(assignment.assigned).toBe(2);
    expect(adapter.calls.setStartPosition.map(({ playerId }) => playerId).sort()).toEqual([4, 9]);
    expect(
      adapter.calls.setStartPosition.map(({ plotIndex }) => plotIndex).sort((a, b) => a - b)
    ).toEqual([...assignment.positions].sort((a, b) => a - b));
  });

  it("excludes natural wonders observed on the current feature layer", () => {
    const landTiles = Array.from(
      { length: 80 },
      (_value, index) => [1 + (index % 10), 1 + Math.floor(index / 10)] as const
    );
    const { context: baselineContext } = createAssignStartsContext([4]);

    runAssignStartsStep(baselineContext, landTiles);
    const baselineAssignment = readValidatedArtifact(
      baselineContext,
      placementStartArtifacts.startAssignment
    );
    const baselinePlotIndex = baselineAssignment.positions[0]!;
    expect(baselinePlotIndex).toBeGreaterThanOrEqual(0);

    const { adapter, context: observedContext } = createAssignStartsContext([4]);
    const { width } = TEST_MAP_SIZE.dimensions;
    const y = Math.floor(baselinePlotIndex / width);
    const x = baselinePlotIndex - y * width;
    const naturalWonderFeatureType = NATURAL_WONDER_CATALOG[0]!.featureType;
    adapter.setFeatureType(x, y, {
      Feature: naturalWonderFeatureType,
      Direction: -1,
      Elevation: 0,
    });

    runAssignStartsStep(observedContext, landTiles);
    const observedAssignment = readValidatedArtifact(
      observedContext,
      placementStartArtifacts.startAssignment
    );

    expect(adapter.readCurrentMapFeatureTypes()[baselinePlotIndex]).toBe(naturalWonderFeatureType);
    expect(observedAssignment.positions[0]).not.toBe(baselinePlotIndex);
    expect(adapter.calls.setStartPosition.map(({ plotIndex }) => plotIndex)).not.toContain(
      baselinePlotIndex
    );
  });

  it("hard-fails only when requested seats have no settleable land candidate", () => {
    const { context } = createAssignStartsContext([4]);

    expect(() => runAssignStartsStep(context, [])).toThrow(/No settleable land candidates/);
  });

  it("publishes unseated players as degraded assignment data", () => {
    const { adapter, context } = createAssignStartsContext([4, 9, 11]);
    const config = assignStartsConfig((selection) => {
      selection.spacingFloorTiles = 1;
      selection.desiredSpacingTiles = 2;
    });

    runAssignStartsStep(
      context,
      [
        [2, 2],
        [5, 4],
      ],
      config
    );
    const assignment = readValidatedArtifact(context, placementStartArtifacts.startAssignment);

    expect(assignment).toMatchObject({
      assigned: 2,
      unseatedCount: 1,
      status: "degraded",
    });
    expect(adapter.calls.setStartPosition).toHaveLength(2);
  });
});
