import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { stripSchemaMetadataRoot } from "@swooper/mapgen-core/authoring";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts.js";
import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";

describe("biomes latitude-cutoff regression (M3-013)", () => {
  it("does not hard-cut rainforest into latitude stripes (and still produces cold biomes)", { timeout: 20_000 }, () => {
    const width = 106;
    const height = 66;
    const seed = 1337;

    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -80,
      MaxLatitude: 80,
      PlayersLandmass1: 4,
      PlayersLandmass2: 4,
      StartSectorRows: 4,
      StartSectorCols: 4,
    };

    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: mapInfo.MaxLatitude, bottomLatitude: mapInfo.MinLatitude },
    } as const;

    const adapter = createMockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });

    const ctx = createExtendedMapContext({ width, height }, adapter, env);
    initializeStandardRuntime(ctx, { mapInfo, logPrefix: "[test]", storyEnabled: true });

    const config = stripSchemaMetadataRoot(swooperEarthlikeConfigRaw);
    standardRecipe.run(ctx, env, config, { log: () => {} });

    const classification = ctx.artifacts.get(ecologyArtifacts.biomeClassification.id) as
      | { biomeIndex?: Uint8Array }
      | undefined;
    const biomeIndex = classification?.biomeIndex;
    if (!(biomeIndex instanceof Uint8Array)) throw new Error("Missing biomeIndex.");

    const rainforestIndex = 6; // tropicalRainforest
    const rowRainforestFrac: Array<number | null> = [];

    for (let y = 0; y < height; y++) {
      let land = 0;
      let rainforest = 0;
      for (let x = 0; x < width; x++) {
        if (adapter.isWater(x, y)) continue;
        land += 1;
        const idx = y * width + x;
        const b = biomeIndex[idx] ?? 255;
        if (b === rainforestIndex) rainforest += 1;
      }
      // Ignore extremely sparse rows; they can legitimately swing if only a tiny island is present.
      rowRainforestFrac.push(land >= 20 ? rainforest / land : null);
    }

    let maxDelta = 0;
    for (let y = 1; y < height; y++) {
      const a = rowRainforestFrac[y - 1];
      const b = rowRainforestFrac[y];
      if (a == null || b == null) continue;
      maxDelta = Math.max(maxDelta, Math.abs(b - a));
    }

    // Symptom: a hard cutoff where rainforest flips abruptly between adjacent latitudes.
    // Expectation: transitions across latitude should be gradual or patchy, not row-perfect.
    expect(maxDelta).toBeLessThanOrEqual(0.6);

    // Regression: we should still be able to generate cold biomes under high-latitude spans.
    const coldSet = new Set([1, 2]); // tundra, boreal
    let coldCount = 0;
    for (let i = 0; i < biomeIndex.length; i++) {
      if (coldSet.has(biomeIndex[i] ?? 255)) coldCount += 1;
    }
    expect(coldCount).toBeGreaterThan(0);
  });
});
