import { describe, it, expect } from "bun:test";

import {
  PLOT_EFFECT_VIZ_CATEGORIES,
  PLOT_EFFECT_VIZ_VALUE_BY_KEY,
} from "../../src/recipes/standard/stages/map-ecology/steps/plot-effects/viz.js";

describe("plot effects viz meta", () => {
  it("declares explicit stable categories/colors for plotEffect", () => {
    const values = Object.values(PLOT_EFFECT_VIZ_VALUE_BY_KEY);
    expect(values.length).toBeGreaterThan(0);

    // Values must be unique and stable.
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);

    // Every mapped value should have an explicit category with an explicit RGBA color.
    const categoriesByValue = new Map<number | string, (typeof PLOT_EFFECT_VIZ_CATEGORIES)[number]>();
    for (const category of PLOT_EFFECT_VIZ_CATEGORIES) {
      categoriesByValue.set(category.value, category);
      expect(category.color.length).toBe(4);
      for (const component of category.color) {
        expect(Number.isFinite(component)).toBe(true);
      }
    }

    for (const value of values) {
      const category = categoriesByValue.get(value);
      expect(category).toBeTruthy();
    }
  });
});

