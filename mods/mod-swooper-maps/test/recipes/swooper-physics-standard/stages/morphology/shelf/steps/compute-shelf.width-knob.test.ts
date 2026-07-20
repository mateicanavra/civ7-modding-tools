import { describe, expect, it } from "bun:test";
import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import standardRecipe from "../../../../../../../src/recipes/standard/recipe.js";
import { ComputeShelfStep } from "../../../../../../../src/recipes/standard/stages/morphology-shelf/steps/compute-shelf/step.js";
import { standardMapConfig } from "../../../../fixtures/standard-recipe.js";

describe("morphology-shelf shelfWidth knob", () => {
  it("scales the cap-free break-gradient lever (breakGradientScale) deterministically in compute-shelf normalize", () => {
    const preset = getCiv7StandardMapSizePreset("MAPSIZE_TINY");
    const base = (
      standardRecipe.compileConfig(
        {
          mapSeed: 123,
          dimensions: preset.dimensions,
          latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
        },
        standardMapConfig.config
      ) as any
    )["morphology-shelf"]?.["compute-shelf"];
    expect(base).toBeTruthy();

    const shelfMask = {
      strategy: "default",
      config: {
        breakGradient: 8,
        breakGradientScale: 1,
        activeClosenessThreshold: 0.35,
      },
    };

    // Wider shelf => more permissive gradient => larger break-gradient scale (the gentle apron
    // reaches further before the read break). Narrower => stricter => smaller.
    const wide = (ComputeShelfStep as any).normalize(
      { ...base, shelfMask },
      { knobs: { shelfWidth: "wide" } }
    );
    expect(wide.shelfMask.config.breakGradientScale).toBeCloseTo(1.25);

    const narrow = (ComputeShelfStep as any).normalize(
      { ...base, shelfMask },
      { knobs: { shelfWidth: "narrow" } }
    );
    expect(narrow.shelfMask.config.breakGradientScale).toBeCloseTo(0.75);

    expect(wide.shelfMask.config.breakGradientScale).toBeGreaterThan(
      narrow.shelfMask.config.breakGradientScale
    );
    // The cap-free shelf has no tile-distance caps to scale.
    expect(wide.shelfMask.config.capTilesActive).toBeUndefined();
    expect(wide.shelfMask.config.capTilesMax).toBeUndefined();
  });
});
