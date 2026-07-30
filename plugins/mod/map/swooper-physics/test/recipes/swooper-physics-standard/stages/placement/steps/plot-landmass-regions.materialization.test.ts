import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as placementRegionArtifacts } from "../../../../../../src/domain/placement/modules/regions/artifacts/index.js";
import placement from "../../../../../../src/domain/placement/router.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readArtifact, type StepRuntimeOps } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";

import { PlotLandmassRegionsStep } from "../../../../../../src/recipes/standard/stages/placement/steps/plot-landmass-regions/step.js";
import { TEST_MAP_LATITUDE_BOUNDS, TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

type PlotLandmassRegionsOps = StepRuntimeOps<
  NonNullable<(typeof PlotLandmassRegionsStep.contract)["ops"]>
>;

describe("landmass-region materialization", () => {
  it("writes every region slot to its exact Civ7 identity and publishes the same slot field", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const adapter = createMockAdapter({
      ...TEST_MAP_SIZE.dimensions,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
    });
    const context = createMapContext({
      setup: admitMapSetup({
        mapSeed: TEST_MAP_SEED,
        dimensions: TEST_MAP_SIZE.dimensions,
        latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
      }),
      adapter,
    });
    const slotByTile = new Uint8Array(size);
    slotByTile[1] = 1;
    slotByTile[width + 2] = 2;
    const writes = new Int32Array(size).fill(-1);
    const writeCounts = new Uint8Array(size);
    const setLandmassRegionId = adapter.setLandmassRegionId.bind(adapter);
    adapter.setLandmassRegionId = (x, y, regionId) => {
      const index = y * width + x;
      writes[index] = regionId;
      writeCounts[index]++;
      setLandmassRegionId(x, y, regionId);
    };
    const regions: PlotLandmassRegionsOps["regions"] = () => ({ slotByTile });
    const ops: PlotLandmassRegionsOps = { regions };

    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask: new Uint8Array(size),
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.landmasses, {
        landmasses: [],
        landmassIdByTile: new Int32Array(size).fill(-1),
      });
      PlotLandmassRegionsStep.run(
        stepContext,
        {
          regions: normalizeOperationSelectionForTest(
            placement.regions.ops.projectLandmassRegions,
            placement.regions.ops.projectLandmassRegions.defaultConfig
          ),
        },
        ops,
        buildStepTestDependencies(PlotLandmassRegionsStep, stepContext)
      );
    });

    const noneId = adapter.getLandmassId("NONE");
    const westId = adapter.getLandmassId("WEST");
    const eastId = adapter.getLandmassId("EAST");
    const expected = new Int32Array(size);
    for (let index = 0; index < size; index++) {
      expected[index] =
        slotByTile[index] === 1 ? westId : slotByTile[index] === 2 ? eastId : noneId;
    }
    expect(writeCounts.every((count) => count === 1)).toBe(true);
    expect(writes).toEqual(expected);
    expect(
      readArtifact(context, placementRegionArtifacts.landmassRegionSlotByTile).slotByTile
    ).toEqual(slotByTile);
  });
});
