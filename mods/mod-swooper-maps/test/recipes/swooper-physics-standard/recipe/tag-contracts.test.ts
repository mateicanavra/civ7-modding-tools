import { describe, expect, it } from "bun:test";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../src/recipes/standard/tags.js";

describe("standard recipe tag contracts", () => {
  it("uses the runtime naming convention for map effect tags", () => {
    const effectPattern = /^effect:map\.[a-z][a-zA-Z0-9]*(Plotted|Built|Projected|ParityCaptured)$/;
    const effects = Object.values(MAP_PROJECTION_EFFECT_TAGS.map);

    expect(effects.length).toBeGreaterThan(0);
    for (const effect of effects) {
      expect(effect).toMatch(effectPattern);
    }
  });
});
