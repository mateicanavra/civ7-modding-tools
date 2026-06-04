import { describe, expect, it } from "bun:test";

import { CIV7_BROWSER_TABLES_V0, createMockAdapter } from "@civ7/adapter";
import {
  COAST_TERRAIN,
  FLAT_TERRAIN,
  HILL_TERRAIN,
  MOUNTAIN_TERRAIN,
} from "@swooper/mapgen-core";

import { stampNaturalWondersFromPlan } from "../../src/recipes/standard/stages/placement/steps/place-natural-wonders/materialize.js";

const { biomeGlobals, featureTypes } = CIV7_BROWSER_TABLES_V0;

function oneWonderPlan(featureType: number, plotIndex: number, width = 4, height = 6) {
  return {
    width,
    height,
    wondersCount: 1,
    targetCount: 1,
    plannedCount: 1,
    placements: [
      {
        plotIndex,
        featureType,
        direction: -1,
        elevation: 120,
        priority: 1,
      },
    ],
  };
}

describe("natural wonder materialization", () => {
  it("projects generated valid-terrain policy before stamping a natural wonder", () => {
    const adapter = createMockAdapter({
      width: 4,
      height: 6,
      defaultBiomeType: biomeGlobals.BIOME_GRASSLAND,
      defaultTerrainType: HILL_TERRAIN,
    });

    const stats = stampNaturalWondersFromPlan({
      adapter,
      width: 4,
      height: 6,
      wonders: oneWonderPlan(featureTypes.FEATURE_REDWOOD_FOREST, 9),
      requestedCount: 1,
    });

    expect(adapter.getTerrainType(1, 2)).toBe(FLAT_TERRAIN);
    expect(adapter.getTerrainType(2, 2)).toBe(FLAT_TERRAIN);
    expect(adapter.getTerrainType(2, 3)).toBe(FLAT_TERRAIN);
    expect(adapter.getFeatureType(1, 2)).toBe(featureTypes.FEATURE_REDWOOD_FOREST);
    expect(adapter.getFeatureType(2, 2)).toBe(featureTypes.FEATURE_REDWOOD_FOREST);
    expect(adapter.getFeatureType(2, 3)).toBe(featureTypes.FEATURE_REDWOOD_FOREST);
    expect(stats).toEqual({
      plannedCount: 1,
      placedCount: 1,
      terrainAdjustedCount: 3,
      skippedOutOfBoundsCount: 0,
      rejectedCount: 0,
    });
  });

  it("uses feature-specific terrain policy instead of a generic land-water default", () => {
    const adapter = createMockAdapter({
      width: 5,
      height: 8,
      defaultBiomeType: biomeGlobals.BIOME_PLAINS,
      defaultTerrainType: FLAT_TERRAIN,
    });
    const mountainStats = stampNaturalWondersFromPlan({
      adapter,
      width: 5,
      height: 8,
      wonders: oneWonderPlan(featureTypes.FEATURE_KILIMANJARO, 17, 5, 8),
      requestedCount: 1,
    });

    expect(adapter.getTerrainType(2, 3)).toBe(MOUNTAIN_TERRAIN);
    expect(adapter.getTerrainType(3, 3)).toBe(MOUNTAIN_TERRAIN);
    expect(adapter.getTerrainType(3, 4)).toBe(MOUNTAIN_TERRAIN);
    expect(adapter.getFeatureType(2, 3)).toBe(featureTypes.FEATURE_KILIMANJARO);
    expect(adapter.getFeatureType(3, 3)).toBe(featureTypes.FEATURE_KILIMANJARO);
    expect(adapter.getFeatureType(3, 4)).toBe(featureTypes.FEATURE_KILIMANJARO);
    expect(mountainStats.terrainAdjustedCount).toBe(3);
  });
});
