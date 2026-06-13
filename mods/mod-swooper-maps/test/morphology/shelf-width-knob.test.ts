import { describe, expect, it } from "bun:test";

import ruggedCoasts from "../../src/recipes/standard/stages/morphology-coasts/steps/ruggedCoasts.js";
import standardRecipe from "../../src/recipes/standard/recipe.js";
import { standardConfig } from "../support/standard-config.js";

describe("morphology-coasts shelfWidth knob", () => {
  it("scales shelfMask distance caps deterministically in rugged-coasts normalize", () => {
    const base = (
      standardRecipe.compileConfig(
        {
          seed: 123,
          dimensions: { width: 80, height: 60 },
          latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
        },
        standardConfig
      ) as any
    )["morphology-coasts"]?.["rugged-coasts"];
    expect(base).toBeTruthy();

    const shelfMask = {
      strategy: "default",
      config: {
        nearshoreDistance: 3,
        shallowQuantile: 0.7,
        activeClosenessThreshold: 0.45,
        capTilesActive: 2,
        capTilesPassive: 4,
        capTilesMax: 8,
      },
    };

    const wide = (ruggedCoasts as any).normalize(
      { ...base, shelfMask },
      { knobs: { shelfWidth: "wide" } }
    );
    expect(wide.shelfMask.config.capTilesActive).toBe(3);
    expect(wide.shelfMask.config.capTilesPassive).toBe(5);

    const narrow = (ruggedCoasts as any).normalize(
      { ...base, shelfMask },
      { knobs: { shelfWidth: "narrow" } }
    );
    expect(narrow.shelfMask.config.capTilesActive).toBe(2);
    expect(narrow.shelfMask.config.capTilesPassive).toBe(3);
  });
});
