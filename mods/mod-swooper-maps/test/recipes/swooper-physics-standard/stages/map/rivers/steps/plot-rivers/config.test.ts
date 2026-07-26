import { describe, expect, it } from "bun:test";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";

import mapRiversStage from "../../../../../../../../src/recipes/standard/stages/map/rivers/index.js";
import { PlotRiversStepContract } from "../../../../../../../../src/recipes/standard/stages/map/rivers/steps/plot-rivers/config.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../../setup.js";
import { standardMapConfig } from "../../../../../fixtures/standard-recipe.js";

const setup = admitMapSetup({
  mapSeed: TEST_MAP_SEED,
  dimensions: TEST_MAP_SIZE.dimensions,
  latitudeBounds: standardMapConfig.latitudeBounds,
});

function normalizeNavigableDensity(navigableRiverDensity: "normal" | "dense") {
  const stageConfig = validateSchemaValueForTest(
    mapRiversStage.surfaceSchema,
    { knobs: { navigableRiverDensity } },
    "/map-rivers"
  );
  const { rawSteps } = mapRiversStage.toInternal({ setup, stageConfig });
  return validateSchemaValueForTest(
    PlotRiversStepContract.schema,
    rawSteps["plot-rivers"],
    "/map-rivers/plot-rivers"
  );
}

describe("map-rivers plot-rivers authoring", () => {
  it("selects more Civ-visible river coverage for the dense posture", () => {
    const normal = normalizeNavigableDensity("normal");
    const dense = normalizeNavigableDensity("dense");

    expect(dense.endpointDischargePercentileMin).toBeLessThan(
      normal.endpointDischargePercentileMin
    );
    expect(dense.targetMajorTileFraction).toBeGreaterThan(normal.targetMajorTileFraction);
  });
});
