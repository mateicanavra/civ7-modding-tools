import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";

import { ObservePlacementParityStep } from "../../../../../../src/recipes/standard/stages/placement/steps/observe-placement-parity/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

describe("placement/observe-placement-parity", () => {
  it("accepts projected lakes while reporting unexplained engine water", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const adapter = createMockAdapter({
      width,
      height,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
      rng: createLabelRng(TEST_MAP_SEED),
    });
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
    const { TERRAIN_FLAT: flatTerrain, TERRAIN_OCEAN: oceanTerrain } =
      CIV7_BROWSER_TABLES_V0.terrainTypeIndices;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) adapter.setTerrainType(x, y, flatTerrain);
    }
    const driftPlotIndex = width + 1;
    const acceptedLakePlotIndex = width + 2;
    adapter.setTerrainType(1, 1, oceanTerrain);
    adapter.setTerrainType(2, 1, oceanTerrain);

    let result: Awaited<ReturnType<(typeof ObservePlacementParityStep)["run"]>> | undefined;
    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask: new Uint8Array(size).fill(1),
        bathymetry: new Int16Array(size),
      });
      const acceptedLakeMask = new Uint8Array(size);
      acceptedLakeMask[acceptedLakePlotIndex] = 1;
      publishTestArtifact(stepContext, hydrographyArtifacts.projectedLakes, {
        lakeMask: acceptedLakeMask,
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
      result = executionResult;
    });
    if (!result) throw new Error("Placement parity observation did not complete.");

    expect(result.waterDrift[driftPlotIndex]).toBe(2);
    expect(result.waterDrift[acceptedLakePlotIndex]).toBe(0);
    expect(Array.from(result.waterDrift).filter((value) => value !== 0)).toEqual([2]);
    expect(result.engineObservation.landMask[driftPlotIndex]).toBe(0);
  });
});
