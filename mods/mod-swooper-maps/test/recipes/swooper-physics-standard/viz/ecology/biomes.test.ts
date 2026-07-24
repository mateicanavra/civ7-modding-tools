import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { resolveEngineBiomeIds } from "../../../../../src/recipes/standard/stages/map/ecology/steps/plot-biomes/biome-projection-policy.js";
import { buildEngineBiomeIdVizCategories } from "../../../../../src/recipes/standard/stages/map/ecology/viz.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

describe("plot biomes viz meta (engine biomeId)", () => {
  it("covers every projected biome id and preserves semantic symbol groupings", () => {
    const adapter = createMockAdapter({
      ...TEST_MAP_SIZE.dimensions,
      mapInfo: TEST_MAP_SIZE.mapInfo,
    });

    const resolved = resolveEngineBiomeIds(adapter);
    const categories = buildEngineBiomeIdVizCategories(resolved);
    const values = categories.map((category) => category.value);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);

    const expectedIds = new Set<number>([resolved.marine, ...Object.values(resolved.land)]);
    const categoryValues = new Set<number>(values);
    for (const id of expectedIds) {
      expect(categoryValues.has(id)).toBe(true);
    }

    expect(categories.some((category) => category.label.includes("snow|tundra|boreal"))).toBe(true);
    expect(categories.some((category) => category.label === "temperateHumid")).toBe(true);
    expect(
      categories.some((category) => category.label.includes("temperateDry|tropicalSeasonal"))
    ).toBe(true);
    expect(categories.some((category) => category.label.includes("marine"))).toBe(true);
  });
});
