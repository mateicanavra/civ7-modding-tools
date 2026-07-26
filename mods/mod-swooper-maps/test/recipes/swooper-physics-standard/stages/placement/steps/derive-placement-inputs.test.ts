import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import placement from "@mapgen/domain/placement/router";
import { admitMapSetup, createMapContext, type MapContext } from "@swooper/mapgen-core";
import type { StepRuntimeOps } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";

import {
  measureStandardNaturalWonderPlanInput,
  STANDARD_NATURAL_WONDER_PLAN_INPUT_METRIC_KEY,
  type StandardNaturalWonderPlanInputMeasurementInput,
} from "../../../../../../src/recipes/standard/metrics/families/placement/natural-wonder-plan-input.js";
import { DerivePlacementInputsStep } from "../../../../../../src/recipes/standard/stages/placement/steps/derive-placement-inputs/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

const { featureTypes, terrainTypeIndices, biomeGlobals } = CIV7_BROWSER_TABLES_V0;

type DerivePlacementInputsOps = StepRuntimeOps<
  NonNullable<(typeof DerivePlacementInputsStep.contract)["ops"]>
>;
type NaturalWonderPlannerInput = Parameters<DerivePlacementInputsOps["naturalWonders"]>[0];
type NaturalWonderPlannerOutput = ReturnType<DerivePlacementInputsOps["naturalWonders"]>;
type StandardNaturalWonderPlannerInput =
  StandardNaturalWonderPlanInputMeasurementInput["plannerInput"];
const DERIVE_PLACEMENT_INPUTS_OP_CONTRACTS = DerivePlacementInputsStep.contract.ops!;

function assertStandardNaturalWonderPlannerInput(
  input: NaturalWonderPlannerInput
): asserts input is NaturalWonderPlannerInput & StandardNaturalWonderPlannerInput {
  if (
    !input.vegetationDensity ||
    !input.effectiveMoisture ||
    !input.surfaceTemperature ||
    !input.fertility ||
    !input.discharge ||
    !input.slopeClass
  ) {
    throw new Error("The Standard step omitted a required planner suitability surface.");
  }
}

function placementConfig() {
  return {
    naturalWonders: normalizeOperationSelectionForTest(
      placement.wonders.ops.planNaturalWonders,
      placement.wonders.ops.planNaturalWonders.defaultConfig
    ),
    wonders: normalizeOperationSelectionForTest(
      placement.wonders.ops.planWonders,
      placement.wonders.ops.planWonders.defaultConfig
    ),
  };
}

function publishPlacementInputs(context: MapContext): void {
  const { width, height } = context.setup.dimensions;
  const size = width * height;
  publishTestArtifact(context, morphologyLandformsArtifacts.topography, {
    elevation: new Int16Array(size).fill(500),
    seaLevel: 0,
    landMask: new Uint8Array(size).fill(1),
    bathymetry: new Int16Array(size),
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
  publishTestArtifact(context, hydrographyArtifacts.riverNetwork, {
    upstreamArea: new Int32Array(size),
    streamOrderProxy: new Uint8Array(size),
    mouthType: new Uint8Array(size),
    slopeClass: new Uint8Array(size),
    flowPermanenceProxy: new Uint8Array(size),
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
  publishTestArtifact(context, biomeArtifacts.biomeClassification, {
    width,
    height,
    biomeIndex: new Uint8Array(size),
    vegetationDensity: new Float32Array(size).fill(0.5),
    treeLine01: new Float32Array(size),
  });
  publishTestArtifact(context, pedologyArtifacts.pedology, {
    width,
    height,
    soilType: new Uint8Array(size),
    fertility: new Float32Array(size).fill(0.5),
  });
}

function createContext(options: Parameters<typeof createMockAdapter>[0]) {
  const adapter = createMockAdapter(options);
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

function createCapturingOps(
  captureNaturalWonderInput: (input: NaturalWonderPlannerInput) => void,
  placements: NaturalWonderPlannerOutput["placements"] = []
): DerivePlacementInputsOps {
  const wonders = Object.assign(
    (
      _input: Parameters<DerivePlacementInputsOps["wonders"]>[0],
      _config: Parameters<DerivePlacementInputsOps["wonders"]>[1]
    ): ReturnType<DerivePlacementInputsOps["wonders"]> => ({ wondersCount: 1 }),
    {
      id: DERIVE_PLACEMENT_INPUTS_OP_CONTRACTS.wonders.id,
      kind: DERIVE_PLACEMENT_INPUTS_OP_CONTRACTS.wonders.kind,
    }
  );
  const naturalWonders = Object.assign(
    (
      input: NaturalWonderPlannerInput,
      _config: Parameters<DerivePlacementInputsOps["naturalWonders"]>[1]
    ): ReturnType<DerivePlacementInputsOps["naturalWonders"]> => {
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
      id: DERIVE_PLACEMENT_INPUTS_OP_CONTRACTS.naturalWonders.id,
      kind: DERIVE_PLACEMENT_INPUTS_OP_CONTRACTS.naturalWonders.kind,
    }
  );
  return { wonders, naturalWonders };
}

describe("derive placement inputs step", () => {
  it("projects the same typed planning-input measurement produced by the step", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const { context } = createContext({
      width,
      height,
      mapInfo: { ...TEST_MAP_SIZE.mapInfo },
      mapSizeId: TEST_MAP_SIZE.id,
      defaultTerrainType: terrainTypeIndices.TERRAIN_MOUNTAIN,
      defaultBiomeType: biomeGlobals.BIOME_PLAINS,
    });
    const placement = {
      plotIndex: 5,
      featureType: featureTypes.FEATURE_KILIMANJARO,
      direction: 0,
      elevation: 500,
      priority: 0.75,
    } as const;
    let plannerInput: NaturalWonderPlannerInput | undefined;
    const ops = createCapturingOps(
      (input) => {
        plannerInput = input;
      },
      [placement]
    );
    const stepConfig = placementConfig();
    let result: Awaited<ReturnType<typeof DerivePlacementInputsStep.run>> | undefined;

    withMapContextExecutionForTest(context, (stepContext) => {
      publishPlacementInputs(stepContext);
      const candidate = DerivePlacementInputsStep.run(
        stepContext,
        stepConfig,
        ops,
        buildStepTestDependencies(DerivePlacementInputsStep, stepContext)
      );
      if (candidate instanceof Promise) {
        throw new Error("The derive-placement-inputs step must remain synchronous.");
      }
      result = candidate;
    });
    if (!result) throw new Error("The derive-placement-inputs step did not return evidence.");
    if (!plannerInput) throw new Error("The natural-wonder planner did not receive its input.");
    assertStandardNaturalWonderPlannerInput(plannerInput);

    const metrics = DerivePlacementInputsStep.metrics?.({
      result,
      config: stepConfig,
      dimensions: TEST_MAP_SIZE.dimensions,
    });
    expect(metrics?.[STANDARD_NATURAL_WONDER_PLAN_INPUT_METRIC_KEY]).toBe(
      result.naturalWonderPlanInput
    );
    expect(result.naturalWonderPlanInput).toEqual(
      measureStandardNaturalWonderPlanInput({
        plannerInput,
        strategySelection: stepConfig.naturalWonders,
        plan: {
          plannedCount: 1,
          placements: [placement],
        },
      })
    );
    expect(result.naturalWonderPlanInput.rows).toEqual([
      {
        plotIndex: 5,
        x: 5,
        y: 0,
        featureType: featureTypes.FEATURE_KILIMANJARO,
        terrainType: terrainTypeIndices.TERRAIN_MOUNTAIN,
        biomeType: biomeGlobals.BIOME_PLAINS,
        occupiedFeatureType: -1,
        elevation: 500,
        aridityPpm: 500_000,
        riverClass: 0,
        lakeMask: 0,
        blockedMask: 1,
        landMask: 1,
      },
    ]);
  });
});
