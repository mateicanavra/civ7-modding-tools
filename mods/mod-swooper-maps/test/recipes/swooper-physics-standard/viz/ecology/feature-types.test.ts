import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { FEATURE_PLACEMENT_KEYS } from "@civ7/map-policy";

import { resolveFeatureKeyLookups } from "../../../../../src/recipes/standard/stages/map/ecology/steps/features-apply/feature-keys.js";
import {
  buildFeatureTypeVizCategories,
  FEATURE_TYPE_NONE_VALUE,
} from "../../../../../src/recipes/standard/stages/map/ecology/steps/features-apply/viz.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

describe("features apply viz meta (engine featureType)", () => {
  it("covers the no-feature sentinel and every official feature engine identity", () => {
    const adapter = createMockAdapter({
      ...TEST_MAP_SIZE.dimensions,
      mapInfo: TEST_MAP_SIZE.mapInfo,
    });
    const featureEngineIdsByKey = resolveFeatureKeyLookups((key) =>
      adapter.getFeatureTypeIndex(key)
    ).byKey;

    const categories = buildFeatureTypeVizCategories(featureEngineIdsByKey);
    const values = categories.map((category) => category.value);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);

    expect(values.includes(FEATURE_TYPE_NONE_VALUE)).toBe(true);

    const expectedIds = new Set<number>([FEATURE_TYPE_NONE_VALUE]);
    for (const key of FEATURE_PLACEMENT_KEYS) {
      expectedIds.add(adapter.getFeatureTypeIndex(key));
    }
    const categoryValues = new Set<number>(values);
    for (const id of expectedIds) {
      expect(categoryValues.has(id)).toBe(true);
    }
  });
});
