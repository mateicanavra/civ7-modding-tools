import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import { resolveEngineBiomeIds } from "../../src/recipes/standard/stages/map-ecology/steps/plot-biomes/helpers/engine-bindings.js";
import { buildEngineBiomeIdVizCategories } from "../../src/recipes/standard/stages/map-ecology/steps/plot-biomes/viz.js";

describe("plot biomes viz meta (engine biomeId)", () => {
  it("declares explicit stable categories/colors for engine biomeId", () => {
    const width = 1;
    const height = 1;
    const seed = 1337;

    const adapter = createMockAdapter({
      width,
      height,
      mapInfo: {
        GridWidth: width,
        GridHeight: height,
        MinLatitude: -60,
        MaxLatitude: 60,
        PlayersLandmass1: 1,
        PlayersLandmass2: 1,
        StartSectorRows: 1,
        StartSectorCols: 1,
      },
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });

    const resolved = resolveEngineBiomeIds(adapter, {});
    const categoriesA = buildEngineBiomeIdVizCategories(resolved);
    const categoriesB = buildEngineBiomeIdVizCategories(resolved);

    // Deterministic ordering/labels for a fixed mapping.
    expect(JSON.stringify(categoriesA)).toBe(JSON.stringify(categoriesB));

    const values = categoriesA.map((c) => c.value);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);

    // Ensure all possible emitted ids are covered (bindings + marine).
    const expectedIds = new Set<number>([resolved.marine, ...Object.values(resolved.land)]);
    const categoryValues = new Set<number>(values);
    for (const id of expectedIds) {
      expect(categoryValues.has(id)).toBe(true);
    }

    // Basic schema sanity (explicit RGBA colors).
    for (const category of categoriesA) {
      expect(category.color.length).toBe(4);
      for (const component of category.color) {
        expect(Number.isFinite(component)).toBe(true);
      }
    }

    // Default bindings intentionally collapse multiple symbols into single engine ids.
    expect(categoriesA.some((c) => c.label.includes("snow|tundra|boreal"))).toBe(true);
    expect(categoriesA.some((c) => c.label.includes("temperateHumid|tropicalSeasonal"))).toBe(true);
    expect(categoriesA.some((c) => c.label.includes("marine"))).toBe(true);
  });
});

