import { describe, expect, it } from "bun:test";
import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";

import hydrologyClimateRefineStage from "../../../../../../../../../src/recipes/standard/stages/hydrology-climate-refine/index.js";
import { ClimateRefineStepContract } from "../../../../../../../../../src/recipes/standard/stages/hydrology-climate-refine/steps/climate-refine/config.js";
import { ClimateRefineStep } from "../../../../../../../../../src/recipes/standard/stages/hydrology-climate-refine/steps/climate-refine/step.js";
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
  if (!ClimateRefineStep.normalize) throw new Error("Climate refine must normalize dryness.");
  const stageConfig = createStandardRecipeTestConfig()["hydrology-climate-refine"];
  stageConfig.precipitationRefinement.riverCorridor.lowlandAdjacencyBonus = 20;
  stageConfig.knobs.dryness = dryness;
  stageConfig.knobs.temperature = "temperate";
  stageConfig.knobs.cryosphere = "on";
  const admitted = validateSchemaValueForTest(
    hydrologyClimateRefineStage.surfaceSchema,
    stageConfig,
    "/hydrology-climate-refine"
  );
  const { knobs, rawSteps } = hydrologyClimateRefineStage.toInternal({
    setup,
    stageConfig: admitted,
  });
  const config = validateSchemaValueForTest(
    ClimateRefineStepContract.schema,
    rawSteps["climate-refine"],
    "/hydrology-climate-refine/climate-refine"
  );
  return validateSchemaValueForTest(
    ClimateRefineStepContract.schema,
    ClimateRefineStep.normalize(config, { setup, knobs }),
    "/hydrology-climate-refine/climate-refine"
  );
}

describe("hydrology climate-refine authoring", () => {
  it("scales authored river-corridor moisture upward for the wet posture", () => {
    const neutral = normalizeDryness("mix");
    const wet = normalizeDryness("wet");
    if (neutral.computePrecipitation.strategy !== "refine") {
      throw new Error("Climate refine must retain refined precipitation.");
    }
    if (wet.computePrecipitation.strategy !== "refine") {
      throw new Error("Climate refine must retain refined precipitation.");
    }

    expect(neutral.computePrecipitation.config.riverCorridor.lowlandAdjacencyBonus).toBe(20);
    expect(wet.computePrecipitation.config.riverCorridor.lowlandAdjacencyBonus).toBe(23);
  });
});
