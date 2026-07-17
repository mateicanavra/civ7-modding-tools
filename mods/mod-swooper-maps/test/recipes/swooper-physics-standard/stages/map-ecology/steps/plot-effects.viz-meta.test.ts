import { describe, expect, it } from "bun:test";

import { PLOT_EFFECT_INTENT_KEYS } from "@mapgen/domain/ecology";
import {
  PLOT_EFFECT_VIZ_CATEGORIES,
  PLOT_EFFECT_VIZ_VALUE_BY_KEY,
  plotEffectVizValue,
} from "../../../../../../src/recipes/standard/stages/map-ecology/steps/plot-effects/viz.js";

describe("plot effects viz meta", () => {
  it("declares explicit stable categories/colors for plotEffect", () => {
    const values = Object.values(PLOT_EFFECT_VIZ_VALUE_BY_KEY);
    expect(values.length).toBeGreaterThan(0);

    // Values must be unique and stable.
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);

    // Every mapped value should have an explicit category with an explicit RGBA color.
    const categoriesByValue = new Map<
      number | string,
      (typeof PLOT_EFFECT_VIZ_CATEGORIES)[number]
    >();
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

  it("assigns every canonical plot-effect intent a nonzero stable value", () => {
    expect(Object.keys(PLOT_EFFECT_VIZ_VALUE_BY_KEY).sort()).toEqual(
      [...PLOT_EFFECT_INTENT_KEYS].sort()
    );
    for (const key of PLOT_EFFECT_INTENT_KEYS) {
      expect(plotEffectVizValue(key)).toBe(PLOT_EFFECT_VIZ_VALUE_BY_KEY[key]);
      expect(plotEffectVizValue(key)).toBeGreaterThan(0);
    }
  });
});
