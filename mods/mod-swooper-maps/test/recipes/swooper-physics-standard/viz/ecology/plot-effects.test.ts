import { describe, expect, it } from "bun:test";

import { PLOT_EFFECT_INTENT_KEYS } from "@mapgen/domain/ecology/modules/plot-effects/model/atoms/index.js";
import {
  PLOT_EFFECT_VIZ_CATEGORIES,
  PLOT_EFFECT_VIZ_VALUE_BY_KEY,
  plotEffectVizValue,
} from "../../../../../src/recipes/standard/stages/map/ecology/steps/plot-effects/viz.js";

describe("plot effects viz meta", () => {
  it("assigns one category to every mapped plot-effect value", () => {
    const values = Object.values(PLOT_EFFECT_VIZ_VALUE_BY_KEY);
    expect(values.length).toBeGreaterThan(0);

    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);

    const categoriesByValue = new Map<
      number | string,
      (typeof PLOT_EFFECT_VIZ_CATEGORIES)[number]
    >();
    for (const category of PLOT_EFFECT_VIZ_CATEGORIES) {
      categoriesByValue.set(category.value, category);
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
