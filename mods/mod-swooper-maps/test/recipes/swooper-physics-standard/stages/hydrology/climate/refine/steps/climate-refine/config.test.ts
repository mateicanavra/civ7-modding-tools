import { describe, expect, it } from "bun:test";

import standardRecipe from "../../../../../../../../../src/recipes/standard/recipe.js";
import {
  createStandardRecipeTestConfig,
  createStandardRecipeTestInitialSetup,
} from "../../../../../../fixtures/standard-recipe.js";

const setup = createStandardRecipeTestInitialSetup();

function normalizeDryness(dryness: "wet" | "mix") {
  const recipeConfig = createStandardRecipeTestConfig();
  const stageConfig = recipeConfig["hydrology-climate-refine"];
  const precipitation = stageConfig["climate-refine"].computePrecipitation;
  if (precipitation.strategy !== "refine") {
    throw new Error("Climate refine must author refined precipitation.");
  }
  precipitation.config.riverCorridor.lowlandAdjacencyBonus = 20;
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
