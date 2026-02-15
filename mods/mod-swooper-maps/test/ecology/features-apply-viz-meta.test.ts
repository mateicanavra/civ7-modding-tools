import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import { FEATURE_PLACEMENT_KEYS } from "@mapgen/domain/ecology";

import {
  FEATURE_TYPE_NONE_VALUE,
  buildFeatureTypeVizCategories,
} from "../../src/recipes/standard/stages/map-ecology/steps/features-apply/viz.js";

describe("features apply viz meta (engine featureType)", () => {
  it("declares explicit stable categories/colors for engine featureType", () => {
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

    const categoriesA = buildFeatureTypeVizCategories(adapter);
    const categoriesB = buildFeatureTypeVizCategories(adapter);

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

