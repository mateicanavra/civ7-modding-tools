import { describe, expect, it } from "bun:test";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";

import climateRefineStage from "../../../../../../../../../src/recipes/standard/stages/hydrology/climate/refine/index.js";
import standardRecipe from "../../../../../../../../../src/recipes/standard/recipe.js";
import {
  createStandardRecipeTestConfig,
  createStandardRecipeTestInitialSetup,
} from "../../../../../../fixtures/standard-recipe.js";

describe("hydrology climate-refine authoring", () => {
  it("refuses retired moisture boosts and the now-inert refinement dryness knob", () => {
    const authored = createStandardRecipeTestConfig()["hydrology-climate-refine"];
    expect(Object.keys(authored.knobs)).toEqual(["cryosphere"]);
    expect(() => validateSchemaValueForTest(climateRefineStage.surfaceSchema, {
      ...authored,
      knobs: { ...authored.knobs, dryness: "wet" },
    }, "/retired-refine-dryness")).toThrow();
    expect(() => validateSchemaValueForTest(climateRefineStage.surfaceSchema, {
      ...authored,
      "climate-refine": {
        ...authored["climate-refine"],
        refinePrecipitation: { strategy: "riparian-basin-wetness", config: {} },
      },
    }, "/retired-refine-precipitation")).toThrow();
  });

  it("preserves authored bounded cryosphere settings and disables feedback only when off", () => {
    const authored = createStandardRecipeTestConfig();
    const setup = createStandardRecipeTestInitialSetup();
    authored["hydrology-climate-refine"].knobs.cryosphere = "on";
    const enabled = standardRecipe.compileConfig(setup, authored)["hydrology-climate-refine"]["climate-refine"];
    expect(enabled.applyAlbedoFeedback).toEqual(authored["hydrology-climate-refine"]["climate-refine"].applyAlbedoFeedback);
    expect(enabled.computeCryosphereState).toEqual(authored["hydrology-climate-refine"]["climate-refine"].computeCryosphereState);
    authored["hydrology-climate-refine"].knobs.cryosphere = "off";
    const disabled = standardRecipe.compileConfig(setup, authored)["hydrology-climate-refine"]["climate-refine"];
    expect(disabled.applyAlbedoFeedback.config.iterations).toBe(0);
    expect(disabled.computeCryosphereState.config.precipitationInfluence).toBe(0);
    expect(disabled.computePotentialDemand).toEqual(enabled.computePotentialDemand);
    expect(disabled.computeLandWaterBudget).toEqual(enabled.computeLandWaterBudget);
  });
});
