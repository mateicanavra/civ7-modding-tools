import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { DEFAULT_FEATURE_TYPES, DEFAULT_TERRAIN_TYPE_INDICES } from "@civ7/adapter/mock";

import {
  resolveStandardProjectionTerrainTypes,
  resolveStandardVolcanoFeatureType,
} from "../../../../src/recipes/standard/projection-policies/standardProjectionEngineTypes.js";

describe("Standard projection engine types", () => {
  it("resolves a fresh immutable snapshot from the consuming adapter", () => {
    const first = resolveStandardProjectionTerrainTypes(
      createMockAdapter({
        width: 2,
        height: 2,
        terrainTypeIndices: {
          ...DEFAULT_TERRAIN_TYPE_INDICES,
          TERRAIN_MOUNTAIN: 40,
          TERRAIN_HILL: 41,
        },
        featureTypes: { ...DEFAULT_FEATURE_TYPES, FEATURE_VOLCANO: 70 },
      })
    );
    const second = resolveStandardProjectionTerrainTypes(
      createMockAdapter({
        width: 2,
        height: 2,
        terrainTypeIndices: {
          ...DEFAULT_TERRAIN_TYPE_INDICES,
          TERRAIN_MOUNTAIN: 80,
          TERRAIN_HILL: 81,
        },
        featureTypes: { ...DEFAULT_FEATURE_TYPES, FEATURE_VOLCANO: 90 },
      })
    );

    expect(first.mountain).toBe(40);
    expect(first.hill).toBe(41);
    expect(
      resolveStandardVolcanoFeatureType(
        createMockAdapter({
          width: 2,
          height: 2,
          featureTypes: { ...DEFAULT_FEATURE_TYPES, FEATURE_VOLCANO: 70 },
        })
      )
    ).toBe(70);
    expect(second.mountain).toBe(80);
    expect(Object.isFrozen(first)).toBe(true);
  });

  it("keeps terrain and volcano feature admission independent", () => {
    const adapter = createMockAdapter({
      width: 2,
      height: 2,
      featureTypes: { ...DEFAULT_FEATURE_TYPES, FEATURE_VOLCANO: -1 },
    });

    expect(resolveStandardProjectionTerrainTypes(adapter).mountain).toBeGreaterThanOrEqual(0);
    expect(() => resolveStandardVolcanoFeatureType(adapter)).toThrow(
      "Missing feature index for FEATURE_VOLCANO"
    );
  });

  it("refuses fractional engine indices", () => {
    const adapter = createMockAdapter({
      width: 2,
      height: 2,
      terrainTypeIndices: { ...DEFAULT_TERRAIN_TYPE_INDICES, TERRAIN_HILL: 4.5 },
      featureTypes: { ...DEFAULT_FEATURE_TYPES, FEATURE_VOLCANO: 7.5 },
    });

    expect(() => resolveStandardProjectionTerrainTypes(adapter)).toThrow(
      "Missing terrain index for TERRAIN_HILL"
    );
    expect(() => resolveStandardVolcanoFeatureType(adapter)).toThrow(
      "Missing feature index for FEATURE_VOLCANO"
    );
  });
});
