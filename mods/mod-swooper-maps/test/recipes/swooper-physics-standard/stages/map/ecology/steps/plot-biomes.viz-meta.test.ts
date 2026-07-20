import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { Value } from "typebox/value";
import { resolveEngineBiomeIds } from "../../../../../../../src/recipes/standard/stages/map-ecology/steps/plot-biomes/engine-biome-bindings.js";
import { buildEngineBiomeIdVizCategories } from "../../../../../../../src/recipes/standard/stages/map-ecology/viz.js";
import { BiomeEngineBindingsSchema } from "../../../../../../../src/recipes/standard/stages/map-projection-public-config.js";
import { TEST_MAP_SIZE } from "../../../../../../map-size.js";

describe("plot biomes viz meta (engine biomeId)", () => {
  it("declares explicit stable categories/colors for engine biomeId", () => {
    const adapter = createMockAdapter({
      ...TEST_MAP_SIZE.dimensions,
      mapInfo: TEST_MAP_SIZE.mapInfo,
    });

    const resolved = resolveEngineBiomeIds(adapter, Value.Create(BiomeEngineBindingsSchema));
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
    expect(categoriesA.some((c) => c.label === "temperateHumid")).toBe(true);
    expect(categoriesA.some((c) => c.label.includes("temperateDry|tropicalSeasonal"))).toBe(true);
    expect(categoriesA.some((c) => c.label.includes("marine"))).toBe(true);
  });
});
