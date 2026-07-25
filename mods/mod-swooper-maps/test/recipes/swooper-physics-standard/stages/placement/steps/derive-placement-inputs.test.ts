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

import { DerivePlacementInputsStep } from "../../../../../../src/recipes/standard/stages/placement/steps/derive-placement-inputs/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

const { featureTypes, terrainTypeIndices, biomeGlobals } = CIV7_BROWSER_TABLES_V0;

type DerivePlacementInputsOps = StepRuntimeOps<
  NonNullable<(typeof DerivePlacementInputsStep.contract)["ops"]>
>;
type NaturalWonderPlannerInput = Parameters<DerivePlacementInputsOps["naturalWonders"]>[0];
const DERIVE_PLACEMENT_INPUTS_OP_CONTRACTS = DerivePlacementInputsStep.contract.ops!;

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
  captureNaturalWonderInput: (input: NaturalWonderPlannerInput) => void
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
        targetCount: 0,
        plannedCount: 0,
        placements: [],
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
  it("passes explicit projected natural-wonder direction and current engine identity", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const mapInfo = { ...TEST_MAP_SIZE.mapInfo };
    const { adapter, context } = createContext({
      width,
      height,
      mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
      defaultTerrainType: 700,
      defaultBiomeType: 900,
      naturalWonderCatalog: [{ featureType: featureTypes.FEATURE_KILIMANJARO, direction: -1 }],
    });
    adapter.setFeatureType(0, 0, { Feature: 40_000, Direction: -1, Elevation: 0 });
    let captured: NaturalWonderPlannerInput | undefined;
    const ops = createCapturingOps((input) => {
      captured = input;
    });

    withMapContextExecutionForTest(context, (stepContext) => {
      publishPlacementInputs(stepContext);
      DerivePlacementInputsStep.run(
        stepContext,
        placementConfig(),
        ops,
        buildStepTestDependencies(DerivePlacementInputsStep, stepContext)
      );
    });

    expect(captured?.featureCatalog).toHaveLength(1);
    expect(captured?.featureCatalog?.[0]).toMatchObject({
      direction: 0,
      footprintOffsetsByParity: {
        even: [
          { dx: 0, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: 1, dy: 0 },
        ],
        odd: [
          { dx: 0, dy: 0 },
          { dx: 1, dy: 1 },
          { dx: 1, dy: 0 },
        ],
      },
    });
    expect(captured?.terrainType?.[0]).toBe(700);
    expect(captured?.biomeType?.[0]).toBe(900);
    expect(captured?.featureType).toBeInstanceOf(Int32Array);
    expect(captured?.featureType?.[0]).toBe(40_000);
  });

  it("keeps recovered four-tile wonders in the catalog with anchor-only footprints", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const mapInfo = { ...TEST_MAP_SIZE.mapInfo };
    const { context } = createContext({
      width,
      height,
      mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
      defaultTerrainType: terrainTypeIndices.TERRAIN_MOUNTAIN,
      defaultBiomeType: biomeGlobals.BIOME_PLAINS,
      naturalWonderCatalog: [{ featureType: featureTypes.FEATURE_BARRIER_REEF, direction: -1 }],
    });
    let captured: NaturalWonderPlannerInput | undefined;
    const ops = createCapturingOps((input) => {
      captured = input;
    });

    withMapContextExecutionForTest(context, (stepContext) => {
      publishPlacementInputs(stepContext);
      DerivePlacementInputsStep.run(
        stepContext,
        placementConfig(),
        ops,
        buildStepTestDependencies(DerivePlacementInputsStep, stepContext)
      );
    });

    expect(captured?.featureCatalog).toHaveLength(1);
    expect(captured?.featureCatalog?.[0]).toMatchObject({
      featureType: featureTypes.FEATURE_BARRIER_REEF,
      direction: -1,
      footprintOffsetsByParity: {
        even: [{ dx: 0, dy: 0 }],
        odd: [{ dx: 0, dy: 0 }],
      },
    });
  });
});
