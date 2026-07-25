import { describe, expect, it } from "bun:test";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";
import { Value } from "typebox/value";

import hydrologyHydrographyStage from "../../../../../../../../src/recipes/standard/stages/hydrology/hydrography/index.js";
import { LakesStepContract } from "../../../../../../../../src/recipes/standard/stages/hydrology/hydrography/steps/lakes/config.js";
import { LakesStep } from "../../../../../../../../src/recipes/standard/stages/hydrology/hydrography/steps/lakes/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../../setup.js";
import {
  createStandardRecipeTestConfig,
  standardMapConfig,
} from "../../../../../fixtures/standard-recipe.js";

const setup = admitMapSetup({
  mapSeed: TEST_MAP_SEED,
  dimensions: TEST_MAP_SIZE.dimensions,
  latitudeBounds: standardMapConfig.latitudeBounds,
});

function normalizeLakeiness(lakeiness: "few" | "normal" | "many") {
  if (!LakesStep.normalize) throw new Error("Lakes must normalize lake intent.");
  const stageConfig = createStandardRecipeTestConfig()["hydrology-hydrography"];
  stageConfig.lakes.planLakes.config.maxUpstreamSteps = 2;
  stageConfig.lakes.planLakes.config.sinkDischargePercentileMin = 0.83;
  stageConfig.lakes.planLakes.config.maxLakeLandFraction = 0.02;
  stageConfig.knobs.lakeiness = lakeiness;
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
    LakesStepContract.schema,
    Value.Default(LakesStepContract.schema, Value.Clone(rawSteps.lakes)),
    "/hydrology-hydrography/lakes"
  );
  return validateSchemaValueForTest(
    LakesStepContract.schema,
    LakesStep.normalize(config, { setup, knobs }),
    "/hydrology-hydrography/lakes"
  );
}

describe("hydrology lakes authoring", () => {
  it("shifts sink-basin density while retaining directly authored expansion depth", () => {
    const few = normalizeLakeiness("few").planLakes.config;
    const normal = normalizeLakeiness("normal").planLakes.config;
    const many = normalizeLakeiness("many").planLakes.config;

    expect(normal.maxUpstreamSteps).toBe(2);
    expect(normal.sinkDischargePercentileMin).toBe(0.83);
    expect(normal.maxLakeLandFraction).toBe(0.02);
    expect(few.sinkDischargePercentileMin).toBeCloseTo(0.86, 6);
    expect(few.maxLakeLandFraction).toBeCloseTo(0.01, 6);
    expect(many.sinkDischargePercentileMin).toBeCloseTo(0.79, 6);
    expect(many.maxLakeLandFraction).toBeCloseTo(0.04, 6);
  });
});
