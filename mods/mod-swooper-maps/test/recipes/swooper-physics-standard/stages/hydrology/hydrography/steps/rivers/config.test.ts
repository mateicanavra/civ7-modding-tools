import { describe, expect, it } from "bun:test";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";

import hydrologyHydrographyStage from "../../../../../../../../src/recipes/standard/stages/hydrology-hydrography/index.js";
import { RiversStepContract } from "../../../../../../../../src/recipes/standard/stages/hydrology-hydrography/steps/rivers/config.js";
import { RiversStep } from "../../../../../../../../src/recipes/standard/stages/hydrology-hydrography/steps/rivers/step.js";
import { TEST_MAP_SIZE } from "../../../../../../../map-size.js";
import {
  createStandardRecipeTestConfig,
  standardMapConfig,
} from "../../../../../fixtures/standard-recipe.js";

const setup = admitMapSetup({
  mapSeed: 123,
  dimensions: TEST_MAP_SIZE.dimensions,
  latitudeBounds: standardMapConfig.latitudeBounds,
});

function normalizeRiverDensity(riverDensity: "normal" | "dense") {
  if (!RiversStep.normalize) throw new Error("Rivers must normalize physical density.");
  const stageConfig = createStandardRecipeTestConfig()["hydrology-hydrography"];
  stageConfig.riverNetwork.minorPercentile = 0.86;
  stageConfig.riverNetwork.majorPercentile = 0.96;
  stageConfig.knobs.riverDensity = riverDensity;
  const admitted = validateSchemaValueForTest(
    hydrologyHydrographyStage.surfaceSchema,
    stageConfig,
    "/hydrology-hydrography"
  );
  const { knobs, rawSteps } = hydrologyHydrographyStage.toInternal({
    setup,
    stageConfig: admitted,
  });
  const config = validateSchemaValueForTest(
    RiversStepContract.schema,
    rawSteps.rivers,
    "/hydrology-hydrography/rivers"
  );
  return validateSchemaValueForTest(
    RiversStepContract.schema,
    RiversStep.normalize(config, { setup, knobs }),
    "/hydrology-hydrography/rivers"
  );
}

describe("hydrology rivers authoring", () => {
  it("lowers authored classification thresholds for denser physical networks", () => {
    const neutral = normalizeRiverDensity("normal").projectRiverNetwork.config;
    const dense = normalizeRiverDensity("dense").projectRiverNetwork.config;

    expect(neutral.minorPercentile).toBe(0.86);
    expect(neutral.majorPercentile).toBe(0.96);
    expect(dense.minorPercentile).toBeCloseTo(neutral.minorPercentile - 0.07, 6);
    expect(dense.majorPercentile).toBeCloseTo(neutral.majorPercentile - 0.04, 6);
  });
});
