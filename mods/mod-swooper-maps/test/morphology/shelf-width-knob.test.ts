import { describe, expect, it } from "bun:test";
import standardRecipe from "../../src/recipes/standard/recipe.js";
import ruggedCoasts from "../../src/recipes/standard/stages/morphology-coasts/steps/ruggedCoasts.js";
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

  it("does not let a too-low capTilesMax silently collapse the passive>active distinction (footgun guard)", () => {
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

    // capTilesMax below the configured margin caps used to clamp both active and
    // passive down to capTilesMax (the latest_juicy capTilesMax:1 footgun).
    const shelfMask = {
      strategy: "default",
      config: {
        nearshoreDistance: 8,
        shallowQuantile: 0.6,
        activeClosenessThreshold: 0.35,
        capTilesActive: 3,
        capTilesPassive: 6,
        capTilesMax: 1,
      },
    };

    const wide = (ruggedCoasts as any).normalize(
      { ...base, shelfMask },
      { knobs: { shelfWidth: "wide" } }
    );
    // Ceiling floors to max(capTilesMax, active, passive) = 6, so the scaled caps
    // survive: active = min(6, round(3*1.25)) = 4, passive = min(6, round(6*1.25)) = 6.
    expect(wide.shelfMask.config.capTilesActive).toBe(4);
    expect(wide.shelfMask.config.capTilesPassive).toBe(6);
    expect(wide.shelfMask.config.capTilesPassive).toBeGreaterThan(
      wide.shelfMask.config.capTilesActive
    );
  });
});
