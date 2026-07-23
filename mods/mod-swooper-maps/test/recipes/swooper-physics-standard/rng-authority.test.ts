import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { artifactModules as morphologyArtifactModules } from "@mapgen/domain/morphology";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import { runStandardRecipeTestMap } from "./fixtures/standard-recipe.js";

describe("standard recipe RNG authority", () => {
  it("runs without consuming adapter RNG for authored generation", () => {
    const seed = 1337;
    const { context } = runStandardRecipeTestMap({
      seed,
      createAdapter: ({ preset }) =>
        createMockAdapter({
          ...preset.dimensions,
          mapInfo: { ...preset.mapInfo },
          mapSizeId: preset.id,
          rng: () => {
            throw new Error("Standard recipe must not consume adapter RNG.");
          },
        }),
    });

    const topography = readValidatedArtifact(context, morphologyArtifactModules.topography);
    expect(topography.landMask).toBeInstanceOf(Uint8Array);
  }, 30_000);
});
