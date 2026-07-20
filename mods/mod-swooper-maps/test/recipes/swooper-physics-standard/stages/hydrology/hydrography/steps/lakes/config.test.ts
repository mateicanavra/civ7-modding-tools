import { describe, expect, it } from "bun:test";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";
import { Value } from "typebox/value";

import hydrologyHydrographyStage from "../../../../../../../../src/recipes/standard/stages/hydrology-hydrography/index.js";
import { LakesStepContract } from "../../../../../../../../src/recipes/standard/stages/hydrology-hydrography/steps/lakes/config.js";
import { LakesStep } from "../../../../../../../../src/recipes/standard/stages/hydrology-hydrography/steps/lakes/step.js";
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

function normalizeLakeiness(lakeiness: "normal" | "many") {
  if (!LakesStep.normalize) throw new Error("Lakes must normalize lake intent.");
  const stageConfig = createStandardRecipeTestConfig()["hydrology-hydrography"];
  stageConfig.lakes.maxUpstreamSteps = 2;
  stageConfig.lakes.sinkDischargePercentileMin = 0.83;
  stageConfig.lakes.maxLakeLandFraction = 0.02;
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
  it("selects broader sink basins while retaining clustered one-hop lake intent", () => {
    const normal = normalizeLakeiness("normal").planLakes.config;
    const many = normalizeLakeiness("many").planLakes.config;

    expect(normal.maxUpstreamSteps).toBe(1);
    expect(many.maxUpstreamSteps).toBe(1);
    expect(many.sinkDischargePercentileMin).toBeLessThan(normal.sinkDischargePercentileMin);
    expect(many.maxLakeLandFraction).toBeGreaterThan(normal.maxLakeLandFraction);
  });
});
