import { describe, expect, it } from "bun:test";
import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";

import hydrologyClimateBaselineStage from "../../../../../../../../../src/recipes/standard/stages/hydrology-climate-baseline/index.js";
import { ClimateBaselineStepContract } from "../../../../../../../../../src/recipes/standard/stages/hydrology-climate-baseline/steps/climate-baseline/config.js";
import { ClimateBaselineStep } from "../../../../../../../../../src/recipes/standard/stages/hydrology-climate-baseline/steps/climate-baseline/step.js";
import {
  createStandardRecipeTestConfig,
  standardMapConfig,
} from "../../../../../../fixtures/standard-recipe.js";

const tinyPreset = getCiv7StandardMapSizePreset("MAPSIZE_TINY");
const setup = admitMapSetup({
  mapSeed: 123,
  dimensions: tinyPreset.dimensions,
  latitudeBounds: standardMapConfig.latitudeBounds,
});

function normalizeDryness(dryness: "wet" | "mix") {
  if (!ClimateBaselineStep.normalize) throw new Error("Climate baseline must normalize dryness.");
  const stageConfig = createStandardRecipeTestConfig()["hydrology-climate-baseline"];
  stageConfig.precipitation.rainfallScale = 100;
  stageConfig.knobs.dryness = dryness;
  stageConfig.knobs.temperature = "temperate";
  stageConfig.knobs.seasonality = "normal";
  stageConfig.knobs.oceanCoupling = "earthlike";
  const admitted = validateSchemaValueForTest(
    hydrologyClimateBaselineStage.surfaceSchema,
    stageConfig,
    "/hydrology-climate-baseline"
  );
  const { knobs, rawSteps } = hydrologyClimateBaselineStage.toInternal({
    setup,
    stageConfig: admitted,
  });
  const config = validateSchemaValueForTest(
    ClimateBaselineStepContract.schema,
    rawSteps["climate-baseline"],
    "/hydrology-climate-baseline/climate-baseline"
  );
  return validateSchemaValueForTest(
    ClimateBaselineStepContract.schema,
    ClimateBaselineStep.normalize(config, { setup, knobs }),
    "/hydrology-climate-baseline/climate-baseline"
  );
}

describe("hydrology climate-baseline authoring", () => {
  it("scales authored rainfall upward for the wet posture", () => {
    const neutral = normalizeDryness("mix");
    const wet = normalizeDryness("wet");
    if (neutral.computePrecipitation.strategy !== "vector") {
      throw new Error("Climate baseline must retain vector precipitation.");
    }
    if (wet.computePrecipitation.strategy !== "vector") {
      throw new Error("Climate baseline must retain vector precipitation.");
    }

    expect(neutral.computePrecipitation.config.rainfallScale).toBe(100);
    expect(wet.computePrecipitation.config.rainfallScale).toBeCloseTo(115, 6);
  });
});
