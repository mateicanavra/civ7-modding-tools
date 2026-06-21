import { describe, expect, it } from "bun:test";
import standardRecipe from "../../src/recipes/standard/recipe.js";
import ruggedCoasts from "../../src/recipes/standard/stages/morphology-coasts/steps/ruggedCoasts.js";
import { standardConfig } from "../support/standard-config.js";

describe("morphology-coasts shelfWidth knob", () => {
  it("scales the cap-free break-depth lever (breakDepthScale) deterministically in rugged-coasts normalize", () => {
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
    const wide = (ruggedCoasts as any).normalize(
      { ...base, shelfMask },
      { knobs: { shelfWidth: "wide" } }
    );
    expect(wide.shelfMask.config.breakDepthScale).toBeCloseTo(1.25);

    const narrow = (ruggedCoasts as any).normalize(
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
