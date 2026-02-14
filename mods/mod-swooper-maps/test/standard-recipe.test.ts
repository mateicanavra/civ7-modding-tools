import { describe, expect, it } from "bun:test";

import standardRecipe from "../src/recipes/standard/recipe.js";
import { STANDARD_TAG_DEFINITIONS } from "../src/recipes/standard/tags.js";

const baseSettings = {
  seed: 42,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
};

const baseConfig = {
  foundation: {
    version: 1,
    profiles: {
      resolutionProfile: "balanced",
      lithosphereProfile: "maximal-basaltic-lid-v1",
      mantleProfile: "maximal-potential-v1",
    },
    knobs: { plateCount: 28, plateActivity: 0.5 },
  },
};

describe("standard recipe composition", () => {
  it("keeps tag definitions unique", () => {
    const ids = STANDARD_TAG_DEFINITIONS.map((tag) => tag.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses the expected stage ordering", () => {
    const expectedStages = [
      "foundation",
      "morphology-coasts",
      "morphology-routing",
      "morphology-erosion",
      "morphology-features",
      "hydrology-climate-baseline",
      "hydrology-hydrography",
      "hydrology-climate-refine",
      "ecology-pedology",
      "ecology-biomes",
      "ecology-features-score",
      "ecology-ice",
      "ecology-reefs",
      "ecology-wetlands",
      "ecology-vegetation",
      "map-morphology",
      "map-hydrology",
      "map-ecology",
      "placement",
    ];
    const observedStages: string[] = [];

    for (const step of standardRecipe.recipe.steps) {
      const parts = step.id.split(".");
      const stageId = parts[2] ?? "";
      if (observedStages.at(-1) !== stageId) {
        observedStages.push(stageId);
      }
    }

    expect(observedStages).toEqual(expectedStages);
  });

  it("compiles without missing tag errors", () => {
    expect(() => standardRecipe.compile(baseSettings, baseConfig)).not.toThrow();
  });
});
