import { describe, expect, it } from "bun:test";

import standardRecipe from "../src/recipes/standard/recipe.js";
import { STANDARD_TAG_DEFINITIONS } from "../src/recipes/standard/tags.js";

const baseSettings = {
  seed: 42,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
};

const baseConfig = {
  "foundation-mantle": { knobs: { plateCount: 28 } },
  "foundation-lithosphere": { knobs: { plateCount: 28 } },
  "foundation-tectonics": { knobs: { plateActivity: 0.5 } },
};

describe("standard recipe composition", () => {
  it("keeps tag definitions unique", () => {
    const ids = STANDARD_TAG_DEFINITIONS.map((tag) => tag.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("compiles without missing tag errors", () => {
    expect(() => standardRecipe.compile(baseSettings, baseConfig)).not.toThrow();
  });
});
