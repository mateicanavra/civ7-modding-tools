import { describe, expect, it } from "bun:test";
import standardRecipe from "../../src/recipes/standard/recipe.js";
import computeShelf from "../../src/recipes/standard/stages/morphology-shelf/steps/computeShelf.js";
import { standardConfig } from "../support/standard-config.js";

describe("morphology-shelf shelfWidth knob", () => {
  it("scales the cap-free break-depth lever (breakDepthScale) deterministically in compute-shelf normalize", () => {
    const base = (
      standardRecipe.compileConfig(
        {
          seed: 123,
          dimensions: { width: 80, height: 60 },
          latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
        },
        standardConfig
      ) as any
    )["morphology-shelf"]?.["compute-shelf"];
    expect(base).toBeTruthy();

    const shelfMask = {
      strategy: "default",
      config: {
        shallowQuantile: 0.6,
        breakDepthSampleRadius: 8,
        activeClosenessThreshold: 0.35,
        activeBreakDepthFactor: 0.6,
        passiveBreakDepthFactor: 1.25,
        absoluteMaxShelfDepth: -30,
        breakDepthScale: 1,
      },
    };

    // Wider shelf => deeper break => larger break-depth scale. Narrower => shallower => smaller.
    const wide = (computeShelf as any).normalize(
      { ...base, shelfMask },
      { knobs: { shelfWidth: "wide" } }
    );
    expect(wide.shelfMask.config.breakDepthScale).toBeCloseTo(1.25);

    const narrow = (computeShelf as any).normalize(
      { ...base, shelfMask },
      { knobs: { shelfWidth: "narrow" } }
    );
    expect(narrow.shelfMask.config.breakDepthScale).toBeCloseTo(0.75);

    expect(wide.shelfMask.config.breakDepthScale).toBeGreaterThan(
      narrow.shelfMask.config.breakDepthScale
    );
    // The cap-free shelf has no tile-distance caps to scale.
    expect(wide.shelfMask.config.capTilesActive).toBeUndefined();
    expect(wide.shelfMask.config.capTilesMax).toBeUndefined();
  });
});
