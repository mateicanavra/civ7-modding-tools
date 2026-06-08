import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import {
  FLAT_TERRAIN,
  HILL_TERRAIN,
  MOUNTAIN_TERRAIN,
} from "@swooper/mapgen-core";

import {
  buildNaturalWonderPlacementRuntimeTelemetry,
  normalizeNaturalWonderStampingStats,
  stampNaturalWondersFromPlan,
} from "../../src/recipes/standard/stages/placement/steps/place-natural-wonders/materialize.js";

const { biomeGlobals, featureTypes } = CIV7_BROWSER_TABLES_V0;

function oneWonderPlan(featureType: number, plotIndex: number, width = 4, height = 6) {
  return {
    width,
    height,
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

describe("natural wonder placement materialization", () => {
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
      coordinateProof: {
        version: 1,
        placed: { count: 1, hash32: "deae8452" },
        rejected: { count: 0, hash32: "811c9dc5" },
      },
      plannedCount: 1,
      targetCount: 1,
      placedCount: 1,
      terrainAdjustedCount: 3,
      skippedOutOfBoundsCount: 0,
      rejectedCount: 0,
      shortfallCount: 0,
      rejectionExamples: [],
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

  it("records planner shortfalls instead of failing browser/game generation", () => {
    const adapter = createMockAdapter({
      width: 4,
      height: 6,
      defaultBiomeType: biomeGlobals.BIOME_GRASSLAND,
      defaultTerrainType: HILL_TERRAIN,
    });
    const plan = {
      ...oneWonderPlan(featureTypes.FEATURE_REDWOOD_FOREST, 9),
      targetCount: 2,
    };

    const stats = stampNaturalWondersFromPlan({
      adapter,
      width: 4,
      height: 6,
      wonders: plan,
      requestedCount: 2,
    });

    expect(stats.targetCount).toBe(2);
    expect(stats.plannedCount).toBe(1);
    expect(stats.placedCount).toBe(1);
    expect(stats.shortfallCount).toBe(1);
    expect(stats.rejectedCount).toBe(0);
    expect(normalizeNaturalWonderStampingStats(stats)).toEqual(stats);
    expect(buildNaturalWonderPlacementRuntimeTelemetry(stats)).toEqual({
      version: 1,
      plannedCount: 1,
      targetCount: 2,
      placedCount: 1,
      terrainAdjustedCount: 3,
      skippedOutOfBoundsCount: 0,
      rejectedCount: 0,
      shortfallCount: 1,
      rejectionExampleCount: 0,
      rejectionExamples: [],
      coordinateProof: {
        version: 1,
        placedCount: 1,
        placedHash32: "deae8452",
      },
    });
    expect(
      `[SWOOPER_MOD] NATURAL_WONDER_PLACEMENT_V1 ${JSON.stringify(
        buildNaturalWonderPlacementRuntimeTelemetry(stats)
      )}`.length
    ).toBeLessThan(900);
  });

  it("records adapter legality rejection as a degraded outcome", () => {
    const adapter = createMockAdapter({
      width: 5,
      height: 8,
      defaultBiomeType: biomeGlobals.BIOME_PLAINS,
      defaultTerrainType: FLAT_TERRAIN,
    });
    adapter.placeNaturalWonder = (x, y, featureType, direction) => ({
      status: "rejected",
      plotIndex: y * adapter.width + x,
      x,
      y,
      featureType,
      direction,
      reason: "can-have-feature-param-false",
    });

    const stats = stampNaturalWondersFromPlan({
      adapter,
      width: 5,
      height: 8,
      wonders: oneWonderPlan(featureTypes.FEATURE_KILIMANJARO, 17, 5, 8),
      requestedCount: 1,
    });

    expect(stats).toMatchObject({
      coordinateProof: {
        version: 1,
        placed: { count: 0, hash32: "811c9dc5" },
        rejected: { count: 1 },
      },
      plannedCount: 1,
      targetCount: 1,
      placedCount: 0,
      skippedOutOfBoundsCount: 0,
      rejectedCount: 1,
      shortfallCount: 0,
    });
    expect(stats.rejectionExamples[0]).toContain("can-have-feature-param-false");
  });

  it("preserves natural-wonder readback mismatch evidence from the adapter", () => {
    const adapter = createMockAdapter({
      width: 5,
      height: 8,
      defaultBiomeType: biomeGlobals.BIOME_PLAINS,
      defaultTerrainType: FLAT_TERRAIN,
    });
    adapter.placeNaturalWonder = (x, y, featureType, direction) => ({
      status: "rejected",
      plotIndex: y * adapter.width + x,
      x,
      y,
      featureType,
      direction,
      reason: "readback-mismatch",
      observedPlotIndex: 23,
      observedFeatureType: adapter.NO_FEATURE,
    });

    const stats = stampNaturalWondersFromPlan({
      adapter,
      width: 5,
      height: 8,
      wonders: oneWonderPlan(featureTypes.FEATURE_KILIMANJARO, 17, 5, 8),
      requestedCount: 1,
    });

    expect(stats).toMatchObject({
      coordinateProof: {
        version: 1,
        placed: { count: 0, hash32: "811c9dc5" },
        rejected: { count: 1, hash32: "5fa1cc6e" },
      },
      plannedCount: 1,
      targetCount: 1,
      placedCount: 0,
      rejectedCount: 1,
      shortfallCount: 0,
    });
    expect(stats.rejectionExamples[0]).toBe(
      "feature=35 plot=17 reason=readback-mismatch observedPlot=23 observedFeature=-1"
    );
    expect(buildNaturalWonderPlacementRuntimeTelemetry(stats)).toMatchObject({
      rejectionExampleCount: 1,
      rejectionExamples: [
        "feature=35 plot=17 reason=readback-mismatch observedPlot=23 observedFeature=-1",
      ],
      coordinateProof: {
        rejectedCount: 1,
        rejectedHash32: "5fa1cc6e",
      },
    });
  });

  it("still fails corrupt plan metadata", () => {
    const adapter = createMockAdapter({
      width: 2,
      height: 2,
      defaultBiomeType: biomeGlobals.BIOME_GRASSLAND,
      defaultTerrainType: FLAT_TERRAIN,
    });

    expect(() =>
      stampNaturalWondersFromPlan({
        adapter,
        width: 2,
        height: 2,
        wonders: {
          width: 2,
          height: 2,
          targetCount: 1,
          plannedCount: 2,
          placements: [
            { plotIndex: 0, featureType: featureTypes.FEATURE_REDWOOD_FOREST, direction: 0 },
          ],
        },
      })
    ).toThrow(/metadata mismatch/);
  });
});
