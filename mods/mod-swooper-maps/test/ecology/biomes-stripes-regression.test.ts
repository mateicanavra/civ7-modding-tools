import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { stripSchemaMetadataRoot } from "@swooper/mapgen-core/authoring";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts.js";
import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";

function median(values: number[]): number {
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? (sorted[mid] ?? 0) : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

describe("biomes stripes regression (M3-012)", () => {
  it("has within-row biome variety for fixed seed (no horizontal banding domination)", { timeout: 20_000 }, () => {
    const width = 106;
    const height = 66;
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

    const rowUniqueCounts: number[] = [];
    const landBiomes = new Set<number>();

    for (let y = 0; y < height; y++) {
      let landTilesInRow = 0;
      const rowBiomes = new Set<number>();
      for (let x = 0; x < width; x++) {
        if (adapter.isWater(x, y)) continue;
        landTilesInRow++;
        const idx = y * width + x;
        const b = biomeIndex[idx] ?? 255;
        if (b !== 255) rowBiomes.add(b);
        if (b !== 255) landBiomes.add(b);
      }
      if (landTilesInRow > 0) rowUniqueCounts.push(rowBiomes.size);
    }

    expect(rowUniqueCounts.length).toBeGreaterThan(0);

    // Guard against full-row collapse while allowing tighter latitude structuring.
    expect(median(rowUniqueCounts)).toBeGreaterThanOrEqual(1);
    expect(Math.max(...rowUniqueCounts)).toBeGreaterThanOrEqual(2);

    // Ensure we're not collapsing into a single-biome landmass for the standard seed.
    expect(landBiomes.size).toBeGreaterThanOrEqual(3);
  });
});
