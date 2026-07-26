import { describe, expect, it } from "bun:test";

import {
  CIV7_STANDARD_MAP_SIZE_PRESETS,
  type Civ7StandardMapSizePreset,
  createMockAdapter,
} from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as placementWonderArtifacts } from "@mapgen/domain/placement/modules/wonders/artifacts/index.js";
import placement from "@mapgen/domain/placement/router";
import { admitMapSetup, createMapContext, type MapContext } from "@swooper/mapgen-core";
import { readValidatedArtifact, type StepRuntimeOps } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";

import { STANDARD_NATURAL_WONDER_PLAN_INPUT_METRIC_KEY } from "../../../../../../src/recipes/standard/metrics/families/placement/natural-wonder-plan-input.js";
import { PlanNaturalWondersStep } from "../../../../../../src/recipes/standard/stages/placement/steps/plan-natural-wonders/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

const { biomeGlobals, featureTypes, terrainTypeIndices } = CIV7_BROWSER_TABLES_V0;
const PLANNER_SURFACE_SENTINELS = {
  landMask: 1,
  elevation: 501,
  aridityIndex: Math.fround(0.11),
  riverClass: 2,
  lakeMask: 0,
  vegetationDensity: Math.fround(0.22),
  effectiveMoisture: Math.fround(0.33),
  surfaceTemperature: 14,
  fertility: Math.fround(0.44),
  discharge: 55,
  slopeClass: 3,
} as const;

type PlanNaturalWondersOps = StepRuntimeOps<
  NonNullable<(typeof PlanNaturalWondersStep.contract)["ops"]>
>;
type NaturalWonderPlannerInput = Parameters<PlanNaturalWondersOps["naturalWonders"]>[0];
type NaturalWonderPlannerOutput = ReturnType<PlanNaturalWondersOps["naturalWonders"]>;
const PLAN_NATURAL_WONDERS_OP_CONTRACTS = PlanNaturalWondersStep.contract.ops!;

function placementConfig() {
  return {
    naturalWonders: normalizeOperationSelectionForTest(
      placement.wonders.ops.planNaturalWonders,
      placement.wonders.ops.planNaturalWonders.defaultConfig
    ),
  };
}

function publishPlacementInputs(context: MapContext): void {
  const { width, height } = context.setup.dimensions;
  const size = width * height;
  publishTestArtifact(context, morphologyLandformsArtifacts.topography, {
    elevation: new Int16Array(size).fill(PLANNER_SURFACE_SENTINELS.elevation),
    seaLevel: 0,
    landMask: new Uint8Array(size).fill(PLANNER_SURFACE_SENTINELS.landMask),
    bathymetry: new Int16Array(size),
  });
  publishTestArtifact(context, hydrographyArtifacts.hydrography, {
    runoff: new Float32Array(size),
    discharge: new Float32Array(size).fill(PLANNER_SURFACE_SENTINELS.discharge),
    riverClass: new Uint8Array(size).fill(PLANNER_SURFACE_SENTINELS.riverClass),
    flowDir: new Int32Array(size).fill(-1),
    sinkMask: new Uint8Array(size),
    outletMask: new Uint8Array(size),
    basinId: new Int32Array(size).fill(-1),
    routingElevation: new Float32Array(size),
    depressionDepth: new Float32Array(size),
    terminalType: new Uint8Array(size),
  });
  publishTestArtifact(context, hydrographyArtifacts.riverNetwork, {
    upstreamArea: new Int32Array(size),
    streamOrderProxy: new Uint8Array(size),
    mouthType: new Uint8Array(size),
    slopeClass: new Uint8Array(size).fill(PLANNER_SURFACE_SENTINELS.slopeClass),
    flowPermanenceProxy: new Uint8Array(size),
  });
  publishTestArtifact(context, hydrographyArtifacts.lakePlan, {
    width,
    height,
    lakeMask: new Uint8Array(size).fill(PLANNER_SURFACE_SENTINELS.lakeMask),
    plannedLakeTileCount: 0,
    sinkLakeCount: 0,
  });
  publishTestArtifact(context, climateArtifacts.climateIndices, {
    surfaceTemperatureC: new Float32Array(size).fill(PLANNER_SURFACE_SENTINELS.surfaceTemperature),
    effectiveMoisture: new Float32Array(size).fill(PLANNER_SURFACE_SENTINELS.effectiveMoisture),
    pet: new Float32Array(size),
    aridityIndex: new Float32Array(size).fill(PLANNER_SURFACE_SENTINELS.aridityIndex),
    freezeIndex: new Float32Array(size),
  });
  publishTestArtifact(context, biomeArtifacts.biomeClassification, {
    width,
    height,
    biomeIndex: new Uint8Array(size),
    vegetationDensity: new Float32Array(size).fill(PLANNER_SURFACE_SENTINELS.vegetationDensity),
    treeLine01: new Float32Array(size),
  });
  publishTestArtifact(context, pedologyArtifacts.pedology, {
    width,
    height,
    soilType: new Uint8Array(size),
    fertility: new Float32Array(size).fill(PLANNER_SURFACE_SENTINELS.fertility),
  });
}

function createContext(
  preset: Civ7StandardMapSizePreset,
  overrides: Parameters<typeof createMockAdapter>[0] = {}
) {
  const adapter = createMockAdapter({
    width: preset.dimensions.width,
    height: preset.dimensions.height,
    mapSizeId: preset.id,
    mapInfo: { ...preset.mapInfo },
    ...overrides,
  });
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: preset.dimensions,
      latitudeBounds: {
        topLatitude: preset.mapInfo.MaxLatitude,
        bottomLatitude: preset.mapInfo.MinLatitude,
      },
    }),
    adapter,
  });
  return { adapter, context };
}

function createCapturingOps(
  captureNaturalWonderInput: (input: NaturalWonderPlannerInput) => void,
  placements: NaturalWonderPlannerOutput["placements"] = []
): PlanNaturalWondersOps {
  const naturalWonders = Object.assign(
    (
      input: NaturalWonderPlannerInput,
      _config: Parameters<PlanNaturalWondersOps["naturalWonders"]>[1]
    ): ReturnType<PlanNaturalWondersOps["naturalWonders"]> => {
      captureNaturalWonderInput(input);
      return {
        width: input.width,
        height: input.height,
        wondersCount: input.wondersCount,
        targetCount: placements.length,
        plannedCount: placements.length,
        placements,
      };
    },
    {
      id: PLAN_NATURAL_WONDERS_OP_CONTRACTS.naturalWonders.id,
      kind: PLAN_NATURAL_WONDERS_OP_CONTRACTS.naturalWonders.kind,
    }
  );
  return { naturalWonders };
}

describe("plan natural wonders step", () => {
  it.each([
    ...CIV7_STANDARD_MAP_SIZE_PRESETS,
  ])("maps $label map-size metadata to the focused planner request", (preset) => {
    const expectedWondersCount = preset.mapInfo.NumNaturalWonders;
    const { adapter, context } = createContext(preset);
    const requestedMapSizeIds: Array<Parameters<typeof adapter.lookupMapInfo>[0]> = [];
    adapter.lookupMapInfo = (mapSizeId) => {
      requestedMapSizeIds.push(mapSizeId);
      return mapSizeId === preset.id ? preset.mapInfo : null;
    };
    const placements = Array.from({ length: expectedWondersCount }, (_, plotIndex) => ({
      plotIndex,
      featureType: featureTypes.FEATURE_KILIMANJARO,
      direction: 0,
      elevation: 500,
      priority: 0.75,
    }));
    let plannerInput: NaturalWonderPlannerInput | undefined;
    const ops = createCapturingOps((input) => {
      plannerInput = input;
    }, placements);
    const stepConfig = placementConfig();
    let result: Awaited<ReturnType<typeof PlanNaturalWondersStep.run>> | undefined;

    withMapContextExecutionForTest(context, (stepContext) => {
      publishPlacementInputs(stepContext);
      const candidate = PlanNaturalWondersStep.run(
        stepContext,
        stepConfig,
        ops,
        buildStepTestDependencies(PlanNaturalWondersStep, stepContext)
      );
      if (candidate instanceof Promise) {
        throw new Error("The plan-natural-wonders step must remain synchronous.");
      }
      result = candidate;
    });
    if (!result) throw new Error("The plan-natural-wonders step did not return evidence.");
    if (!plannerInput) throw new Error("The natural-wonder planner did not receive its input.");

    expect(requestedMapSizeIds).toEqual([preset.id]);
    expect(plannerInput).toMatchObject({
      width: preset.dimensions.width,
      height: preset.dimensions.height,
      wondersCount: expectedWondersCount,
    });
    expect(result.placements).toHaveLength(expectedWondersCount);
    expect(result.naturalWonderPlanInput).toMatchObject({
      plannerInput: {
        dimensions: preset.dimensions,
        wondersCount: expectedWondersCount,
      },
      plannedCount: expectedWondersCount,
    });
    expect(
      readValidatedArtifact(context, placementWonderArtifacts.naturalWonderPlan)
    ).toMatchObject({
      width: preset.dimensions.width,
      height: preset.dimensions.height,
      wondersCount: expectedWondersCount,
      targetCount: expectedWondersCount,
      plannedCount: expectedWondersCount,
    });
    const metrics = PlanNaturalWondersStep.metrics?.({
      result,
      config: stepConfig,
      dimensions: preset.dimensions,
    });
    expect(metrics?.[STANDARD_NATURAL_WONDER_PLAN_INPUT_METRIC_KEY]).toBe(
      result.naturalWonderPlanInput
    );
  });

  it("routes each admitted product and current engine surface into the planner request", () => {
    const { adapter, context } = createContext(TEST_MAP_SIZE, {
      defaultTerrainType: terrainTypeIndices.TERRAIN_MOUNTAIN,
      defaultBiomeType: biomeGlobals.BIOME_DESERT,
    });
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const probeX = Math.floor(width / 2);
    const probeY = Math.floor(height / 2);
    const probePlotIndex = probeY * width + probeX;
    adapter.setFeatureType(probeX, probeY, {
      Feature: featureTypes.FEATURE_FOREST,
      Direction: 0,
      Elevation: PLANNER_SURFACE_SENTINELS.elevation,
    });
    let plannerInput: NaturalWonderPlannerInput | undefined;
    const ops = createCapturingOps(
      (input) => {
        plannerInput = input;
      },
      [
        {
          plotIndex: probePlotIndex,
          featureType: featureTypes.FEATURE_KILIMANJARO,
          direction: 0,
          elevation: PLANNER_SURFACE_SENTINELS.elevation,
          priority: 0.75,
        },
      ]
    );

    withMapContextExecutionForTest(context, (stepContext) => {
      publishPlacementInputs(stepContext);
      PlanNaturalWondersStep.run(
        stepContext,
        placementConfig(),
        ops,
        buildStepTestDependencies(PlanNaturalWondersStep, stepContext)
      );
    });
    if (!plannerInput) throw new Error("The natural-wonder planner did not receive its input.");

    expect({
      landMask: plannerInput.landMask[probePlotIndex],
      elevation: plannerInput.elevation[probePlotIndex],
      aridityIndex: plannerInput.aridityIndex[probePlotIndex],
      riverClass: plannerInput.riverClass[probePlotIndex],
      lakeMask: plannerInput.lakeMask[probePlotIndex],
      vegetationDensity: plannerInput.vegetationDensity?.[probePlotIndex],
      effectiveMoisture: plannerInput.effectiveMoisture?.[probePlotIndex],
      surfaceTemperature: plannerInput.surfaceTemperature?.[probePlotIndex],
      fertility: plannerInput.fertility?.[probePlotIndex],
      discharge: plannerInput.discharge?.[probePlotIndex],
      slopeClass: plannerInput.slopeClass?.[probePlotIndex],
      terrainType: plannerInput.terrainType[probePlotIndex],
      biomeType: plannerInput.biomeType[probePlotIndex],
      featureType: plannerInput.featureType[probePlotIndex],
    }).toEqual({
      ...PLANNER_SURFACE_SENTINELS,
      terrainType: terrainTypeIndices.TERRAIN_MOUNTAIN,
      biomeType: biomeGlobals.BIOME_DESERT,
      featureType: featureTypes.FEATURE_FOREST,
    });
  });

  it("fails closed when Civ7 map metadata is unavailable", () => {
    const { context } = createContext(TEST_MAP_SIZE, { mapInfo: null });
    let plannerInvoked = false;
    const ops = createCapturingOps(() => {
      plannerInvoked = true;
    });

    expect(() =>
      withMapContextExecutionForTest(context, (stepContext) => {
        publishPlacementInputs(stepContext);
        PlanNaturalWondersStep.run(
          stepContext,
          placementConfig(),
          ops,
          buildStepTestDependencies(PlanNaturalWondersStep, stepContext)
        );
      })
    ).toThrow("[Placement] Civ7 map metadata is unavailable for the active map size.");
    expect(plannerInvoked).toBe(false);
  });
});
