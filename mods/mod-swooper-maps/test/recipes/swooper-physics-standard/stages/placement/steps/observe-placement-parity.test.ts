import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { decodeBoundedJsonLogSeries } from "@swooper/mapgen-core/lib/log";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";

import { ObservePlacementParityStep } from "../../../../../../src/recipes/standard/stages/placement/steps/observe-placement-parity/step.js";
import { TEST_MAP_LATITUDE_BOUNDS, TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

function createLandAdapter(): MockAdapter {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const adapter = new MockAdapter({
    width,
    height,
    rng: createLabelRng(TEST_MAP_SEED),
    mapInfo: TEST_MAP_SIZE.mapInfo,
    mapSizeId: TEST_MAP_SIZE.id,
  });
  const flatTerrain = adapter.getTerrainTypeIndex("TERRAIN_FLAT");
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      adapter.setTerrainType(x, y, flatTerrain);
    }
  }
  return adapter;
}

function executeParity(adapter: MockAdapter, projectedLakeMask: Uint8Array) {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const size = width * height;
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
    }),
    adapter,
  });
  const messages: string[] = [];
  const originalLog = console.log;
  console.log = (message?: unknown) => {
    if (typeof message === "string") messages.push(message);
  };
  try {
    const result = withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask: new Uint8Array(size).fill(1),
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.projectedLakes, {
        lakeMask: projectedLakeMask,
      });
      const executionResult = ObservePlacementParityStep.run(
        stepContext,
        {},
        {},
        buildStepTestDependencies(ObservePlacementParityStep, stepContext)
      );
      if (executionResult instanceof Promise) {
        throw new Error("Placement parity observation must remain synchronous.");
      }
      return executionResult;
    });
    return {
      result,
      parityMessages: messages.filter((message) =>
        message.startsWith("[SWOOPER_MOD] PLACEMENT_PARITY_V1 ")
      ),
    };
  } finally {
    console.log = originalLog;
  }
}

describe("placement/observe-placement-parity", () => {
  it("treats accepted lakes as projected water while detecting unexplained terminal water", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const adapter = createLandAdapter();
    const unexpectedWater = width + 1;
    const acceptedLake = width + 2;
    const projectedLakeMask = new Uint8Array(width * height);
    projectedLakeMask[acceptedLake] = 1;
    adapter.stampLakes(width, height, projectedLakeMask);
    adapter.setTerrainType(1, 1, adapter.getTerrainTypeIndex("TERRAIN_OCEAN"));

    const { result, parityMessages } = executeParity(adapter, projectedLakeMask);

    expect(result.placementParity).toEqual({
      version: 1,
      waterDriftCount: 1,
      acceptedLakeTileCount: 1,
      finalLakeWaterDriftCount: 0,
      finalLakeClassificationDriftCount: 0,
    });
    expect(result.waterDrift[unexpectedWater]).toBe(2);
    expect(result.waterDrift[acceptedLake]).toBe(0);
    expect(Array.from(result.waterDrift).filter((value) => value !== 0)).toEqual([2]);
    expect(decodeBoundedJsonLogSeries(parityMessages, "PLACEMENT_PARITY_V1")[0]?.payload).toEqual(
      result.placementParity
    );
  });

  it("reports dried and declassified accepted lakes from the same terminal surface", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const adapter = createLandAdapter();
    const stableLake = width + 1;
    const declassifiedLake = width + 2;
    const driedLake = width + 3;
    const projectedLakeMask = new Uint8Array(width * height);
    projectedLakeMask[stableLake] = 1;
    projectedLakeMask[declassifiedLake] = 1;
    projectedLakeMask[driedLake] = 1;
    const engineLakeMask = new Uint8Array(width * height);
    engineLakeMask[stableLake] = 1;
    adapter.stampLakes(width, height, engineLakeMask);
    adapter.setTerrainType(2, 1, adapter.getTerrainTypeIndex("TERRAIN_COAST"));

    const { result } = executeParity(adapter, projectedLakeMask);

    expect(result.placementParity).toEqual({
      version: 1,
      waterDriftCount: 1,
      acceptedLakeTileCount: 3,
      finalLakeWaterDriftCount: 1,
      finalLakeClassificationDriftCount: 2,
    });
    expect(result.waterDrift[stableLake]).toBe(0);
    expect(result.waterDrift[declassifiedLake]).toBe(0);
    expect(result.waterDrift[driedLake]).toBe(1);
  });
});
