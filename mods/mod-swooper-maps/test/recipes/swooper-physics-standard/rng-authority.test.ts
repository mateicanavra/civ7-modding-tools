import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";

import { artifacts as morphologyArtifacts } from "../../../src/recipes/standard/stages/morphology/artifacts/index.js";
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

    const topography = context.artifacts.get(morphologyArtifacts.topography.id) as
      | { landMask?: Uint8Array }
      | undefined;
    expect(topography?.landMask).toBeInstanceOf(Uint8Array);
  }, 30_000);
});
