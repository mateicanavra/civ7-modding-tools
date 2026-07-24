import { describe, expect, it } from "bun:test";
import { admitMapSetup } from "@swooper/mapgen-core";

import standardRecipe from "../../../../../../../../../src/recipes/standard/recipe.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../../../setup.js";
import {
  createStandardRecipeTestConfig,
  standardMapConfig,
} from "../../../../../../fixtures/standard-recipe.js";

const setup = admitMapSetup({
  mapSeed: TEST_MAP_SEED,
  dimensions: TEST_MAP_SIZE.dimensions,
  latitudeBounds: standardMapConfig.latitudeBounds,
});

function normalizeDryness(dryness: "wet" | "mix") {
  const recipeConfig = createStandardRecipeTestConfig();
  const stageConfig = recipeConfig["hydrology-climate-refine"];
  stageConfig.precipitationRefinement.riverCorridor.lowlandAdjacencyBonus = 20;
  stageConfig.knobs.dryness = dryness;
  stageConfig.knobs.temperature = "temperate";
  stageConfig.knobs.cryosphere = "on";
  return standardRecipe.compileConfig(setup, recipeConfig)["hydrology-climate-refine"][
    "climate-refine"
  ];
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
