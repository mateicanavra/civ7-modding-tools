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
  return {
    authored: stageConfig["climate-refine"],
    compiled: standardRecipe.compileConfig(setup, recipeConfig)["hydrology-climate-refine"][
      "climate-refine"
    ],
  };
}

describe("hydrology climate-refine authoring", () => {
  it("preserves the authored physical controls when cryosphere remains enabled", () => {
    const { authored, compiled } = normalizeCryosphere("on");
    expect(compiled).toEqual(authored);
    expect(compiled).not.toHaveProperty("refinePrecipitation");
  });

  it("neutralizes only cryosphere feedback when disabled", () => {
    const { authored, compiled } = normalizeCryosphere("off");
    expect(compiled.applyAlbedoFeedback.config.iterations).toBe(0);
    expect(compiled.computeCryosphereState.config).toEqual({
      ...authored.computeCryosphereState.config,
      landSnowStartC: -60,
      landSnowFullC: -80,
      seaIceStartC: -60,
      seaIceFullC: -80,
      freezeIndexStartC: -60,
      freezeIndexFullC: -80,
      precipitationInfluence: 0,
      snowAlbedoBoost: 0,
      seaIceAlbedoBoost: 0,
    });
    expect(compiled.computePotentialDemand).toEqual(authored.computePotentialDemand);
    expect(compiled.computeLandWaterBudget).toEqual(authored.computeLandWaterBudget);
    expect(compiled.computeClimateDiagnostics).toEqual(authored.computeClimateDiagnostics);
    expect(compiled).not.toHaveProperty("refinePrecipitation");
  });
});
