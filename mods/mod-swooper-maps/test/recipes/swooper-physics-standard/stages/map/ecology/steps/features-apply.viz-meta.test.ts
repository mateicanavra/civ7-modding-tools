import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { FEATURE_PLACEMENT_KEYS } from "@civ7/map-policy";

import { resolveFeatureKeyLookups } from "../../../../../../../src/recipes/standard/stages/map-ecology/steps/features-apply/feature-keys.js";
import {
  buildFeatureTypeVizCategories,
  FEATURE_TYPE_NONE_VALUE,
} from "../../../../../../../src/recipes/standard/stages/map-ecology/steps/features-apply/viz.js";
import { TEST_MAP_SIZE } from "../../../../../../map-size.js";

describe("features apply viz meta (engine featureType)", () => {
  it("declares explicit stable categories/colors for engine featureType", () => {
    const adapter = createMockAdapter({
      ...TEST_MAP_SIZE.dimensions,
      mapInfo: TEST_MAP_SIZE.mapInfo,
    });
    const featureEngineIdsByKey = resolveFeatureKeyLookups(adapter).byKey;

    const categoriesA = buildFeatureTypeVizCategories(featureEngineIdsByKey);
    const categoriesB = buildFeatureTypeVizCategories(featureEngineIdsByKey);

    // Deterministic ordering/labels for a fixed adapter mapping.
    expect(JSON.stringify(categoriesA)).toBe(JSON.stringify(categoriesB));

    const values = categoriesA.map((c) => c.value);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);

    // Must include the sentinel "no feature" category.
    expect(values.includes(FEATURE_TYPE_NONE_VALUE)).toBe(true);

    // Ensure all possible emitted ids are covered (sentinel + known placement keys).
    const expectedIds = new Set<number>([FEATURE_TYPE_NONE_VALUE]);
    for (const key of FEATURE_PLACEMENT_KEYS) {
      expectedIds.add(adapter.getFeatureTypeIndex(key));
    }
    const categoryValues = new Set<number>(values);
    for (const id of expectedIds) {
      expect(categoryValues.has(id)).toBe(true);
    }

    // Explicit RGBA colors for each category.
    for (const category of categoriesA) {
      expect(category.color.length).toBe(4);
      for (const component of category.color) {
        expect(Number.isFinite(component)).toBe(true);
      }
    }
  });
});
