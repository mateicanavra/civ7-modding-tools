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
  const precipitation = stageConfig["climate-refine"].refinePrecipitation;
  if (precipitation.strategy !== "riparian-basin-wetness") {
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
    if (neutral.refinePrecipitation.strategy !== "riparian-basin-wetness") {
      throw new Error("Climate refine must retain refined precipitation.");
    }
    if (wet.refinePrecipitation.strategy !== "riparian-basin-wetness") {
      throw new Error("Climate refine must retain refined precipitation.");
    }

    expect(neutral.refinePrecipitation.config.riverCorridor.lowlandAdjacencyBonus).toBe(20);
    expect(wet.refinePrecipitation.config.riverCorridor.lowlandAdjacencyBonus).toBe(23);
  });
});
