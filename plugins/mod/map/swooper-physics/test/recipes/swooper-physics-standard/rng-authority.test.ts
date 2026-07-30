import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { artifacts as morphologyLandformsArtifacts } from "../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import { runStandardRecipeTestMap } from "./fixtures/standard-recipe.js";

describe("standard recipe RNG authority", () => {
  it("runs without consuming adapter RNG for authored generation", () => {
    const { context } = runStandardRecipeTestMap({
      createAdapter: ({ preset, plotEffectTypes }) =>
        createMockAdapter({
          ...preset.dimensions,
          mapInfo: { ...preset.mapInfo },
          mapSizeId: preset.id,
          plotEffectTypes,
          rng: () => {
            throw new Error("Standard recipe must not consume adapter RNG.");
          },
        }),
    });

    const topography = readArtifact(context, morphologyLandformsArtifacts.topography);
    expect(topography.landMask).toBeInstanceOf(Uint8Array);
  }, 30_000);
});
