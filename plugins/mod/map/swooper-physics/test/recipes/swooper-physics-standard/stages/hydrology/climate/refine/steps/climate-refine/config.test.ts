import { describe, expect, it } from "bun:test";

import standardRecipe from "../../../../../../../../../src/recipes/standard/recipe.js";
import {
  createStandardRecipeTestConfig,
  createStandardRecipeTestInitialSetup,
} from "../../../../../../fixtures/standard-recipe.js";

const setup = createStandardRecipeTestInitialSetup();

function normalizeCryosphere(cryosphere: "off" | "on") {
  const recipeConfig = createStandardRecipeTestConfig();
  const stageConfig = recipeConfig["hydrology-climate-refine"];
  stageConfig.knobs.cryosphere = cryosphere;
  return standardRecipe.compileConfig(setup, recipeConfig)["hydrology-climate-refine"][
    "climate-refine"
  ];
}

describe("hydrology climate-refine authoring", () => {
  it("retains only cryosphere normalization without rewriting atmospheric forcing", () => {
    const on = normalizeCryosphere("on");
    const off = normalizeCryosphere("off");
    const authored = createStandardRecipeTestConfig()["hydrology-climate-refine"];

    expect(authored.knobs).toEqual({ cryosphere: "on" });
    expect(on).toEqual(authored["climate-refine"]);
    expect(off.applyAlbedoFeedback.config.iterations).toBe(0);
    expect(off.computeCryosphereState.config.precipitationInfluence).toBe(0);
    expect(off.computeLandWaterBudget).toEqual(on.computeLandWaterBudget);
    expect(off.computePotentialDemand).toEqual(on.computePotentialDemand);
    expect(off.computeClimateDiagnostics).toEqual(on.computeClimateDiagnostics);
    expect(on).not.toHaveProperty("refinePrecipitation");
  });

  it("refuses retired precipitation refinement and dryness at recipe compilation", () => {
    const config = createStandardRecipeTestConfig();
    const stage = config["hydrology-climate-refine"];
    for (const retiredStage of [
      { ...stage, knobs: { ...stage.knobs, dryness: "mix" } },
      {
        ...stage,
        "climate-refine": {
          ...stage["climate-refine"],
          refinePrecipitation: { strategy: "riparian-basin-wetness", config: {} },
        },
      },
    ]) {
      expect(() => standardRecipe.compileConfig(setup, {
        ...config, "hydrology-climate-refine": retiredStage,
      })).toThrow();
    }
  });
});
