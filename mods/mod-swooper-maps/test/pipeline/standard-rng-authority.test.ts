import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";
import { standardConfig } from "../support/standard-config.js";

describe("standard recipe RNG authority", () => {
  it("runs without consuming adapter RNG for authored generation", () => {
    const width = 32;
    const height = 20;
    const seed = 1337;
    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -60,
      MaxLatitude: 60,
      PlayersLandmass1: 4,
      PlayersLandmass2: 4,
      StartSectorRows: 4,
      StartSectorCols: 4,
    };
    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: {
        topLatitude: mapInfo.MaxLatitude,
        bottomLatitude: mapInfo.MinLatitude,
      },
    };
    const adapter = createMockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: () => {
        throw new Error("Standard recipe must not consume adapter RNG.");
      },
    });
    const context = createExtendedMapContext({ width, height }, adapter, env);

    initializeStandardRuntime(context, {
      mapInfo,
      logPrefix: "[rng-authority]",
      storyEnabled: true,
    });
    standardRecipe.run(context, env, standardConfig, { log: () => {} });

    const topography = context.artifacts.get(morphologyArtifacts.topography.id) as
      | { landMask?: Uint8Array }
      | undefined;
    expect(topography?.landMask).toBeInstanceOf(Uint8Array);
  }, 30_000);
});
