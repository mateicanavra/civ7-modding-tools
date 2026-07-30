import { describe, expect, it, spyOn } from "bun:test";

import { createMockAdapter as createBaseMockAdapter, type MockAdapterConfig } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { artifacts as placementWonderArtifacts } from "../../../../../../src/domain/placement/modules/wonders/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { type ArtifactValueOf } from "@swooper/mapgen-core/authoring";
import { decodeBoundedJsonLogSeries } from "@swooper/mapgen-core/lib/log";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import type { StandardNaturalWonderPlacementMeasurements } from "../../../../../../src/recipes/standard/metrics/families/placement/natural-wonder-placement.js";
import { PlaceNaturalWondersStep } from "../../../../../../src/recipes/standard/stages/placement/steps/place-natural-wonders/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

const { biomeGlobals, featureTypes } = CIV7_BROWSER_TABLES_V0;
const SYNTHETIC_REDWOOD_FOOTPRINT = { width: 4, height: 6 } as const;
const SYNTHETIC_MOUNTAIN_FOOTPRINT = { width: 5, height: 8 } as const;

type NaturalWonderPlan = ArtifactValueOf<typeof placementWonderArtifacts.naturalWonderPlan>;
type TerrainBackedMockAdapterConfig = Omit<MockAdapterConfig, "defaultTerrainType"> &
  Readonly<{ defaultTerrainName: "TERRAIN_FLAT" | "TERRAIN_HILL" | "TERRAIN_MOUNTAIN" }>;
type Dimensions = Readonly<{ width: number; height: number }>;

function createTerrainBackedAdapter(config: TerrainBackedMockAdapterConfig) {
  const { defaultTerrainName, ...adapterConfig } = config;
  const adapter = createBaseMockAdapter(adapterConfig);
  const terrainType = adapter.getTerrainTypeIndex(defaultTerrainName);
  for (let y = 0; y < adapter.height; y++) {
    for (let x = 0; x < adapter.width; x++) {
      adapter.setTerrainType(x, y, terrainType);
    }
  }
  return adapter;
}

function oneWonderPlan(
  featureType: number,
  plotIndex: number,
  dimensions: Dimensions,
  overrides: Partial<NaturalWonderPlan> = {}
): NaturalWonderPlan {
  return {
    ...dimensions,
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
    ...overrides,
  };
}

function interiorPlotIndex(dimensions: Dimensions, offsetX = 0, offsetY = 0): number {
  const x = Math.floor(dimensions.width / 2) + offsetX;
  const y = Math.floor(dimensions.height / 2) + offsetY;
  if (x <= 0 || x >= dimensions.width - 1 || y <= 0 || y >= dimensions.height - 1) {
    throw new Error(`Test anchor (${x},${y}) must remain inside the map boundary.`);
  }
  return y * dimensions.width + x;
}

function executeNaturalWonderStep(
  adapter: ReturnType<typeof createTerrainBackedAdapter>,
  plan: NaturalWonderPlan
): StandardNaturalWonderPlacementMeasurements {
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: { width: plan.width, height: plan.height },
      latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
    }),
    adapter,
  });

  return withMapContextExecutionForTest(context, (stepContext) => {
    publishTestArtifact(stepContext, placementWonderArtifacts.naturalWonderPlan, plan);
    return PlaceNaturalWondersStep.run(
      stepContext,
      {},
      {},
      buildStepTestDependencies(PlaceNaturalWondersStep, stepContext)
    ) as StandardNaturalWonderPlacementMeasurements;
  });
}

describe("natural wonder placement materialization", () => {
  it("leaves engine occupancy current, including cells added beyond the inferred footprint", () => {
    const adapter = createTerrainBackedAdapter({
      ...SYNTHETIC_REDWOOD_FOOTPRINT,
      defaultBiomeType: biomeGlobals.BIOME_GRASSLAND,
      defaultTerrainName: "TERRAIN_FLAT",
    });
    const placeNaturalWonder = adapter.placeNaturalWonder.bind(adapter);
    adapter.placeNaturalWonder = (x, y, featureType, direction, elevation) => {
      const outcome = placeNaturalWonder(x, y, featureType, direction, elevation);
      if (outcome.status === "placed") {
        adapter.setFeatureType(0, 5, {
          Feature: featureType,
          Direction: direction,
          Elevation: elevation ?? 0,
        });
      }
      return outcome;
    };

    const measurements = executeNaturalWonderStep(
      adapter,
      oneWonderPlan(featureTypes.FEATURE_REDWOOD_FOREST, 9, SYNTHETIC_REDWOOD_FOOTPRINT)
    );
    const observedPlotIndices = Array.from(adapter.readCurrentMapFeatureTypes())
      .map((featureType, plotIndex) => ({ featureType, plotIndex }))
      .filter(({ featureType }) => featureType === featureTypes.FEATURE_REDWOOD_FOREST)
      .map(({ plotIndex }) => plotIndex);

    expect(measurements.summary.placedCount).toBe(1);
    expect(observedPlotIndices).toEqual([9, 10, 13, 20]);
  });

  it("retries the planner's fallback anchor after an engine refusal", () => {
    const dimensions = TEST_MAP_SIZE.dimensions;
    const primaryPlotIndex = interiorPlotIndex(dimensions, -3);
    const fallbackPlotIndex = interiorPlotIndex(dimensions, 3);
    const adapter = createTerrainBackedAdapter({
      ...dimensions,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
      defaultBiomeType: biomeGlobals.BIOME_PLAINS,
      defaultTerrainName: "TERRAIN_MOUNTAIN",
    });
    const placeNaturalWonder = adapter.placeNaturalWonder.bind(adapter);
    adapter.placeNaturalWonder = (x, y, featureType, direction, elevation) => {
      const plotIndex = y * adapter.width + x;
      return plotIndex === primaryPlotIndex
        ? {
            status: "rejected",
            plotIndex,
            x,
            y,
            featureType,
            direction,
            reason: "can-have-feature-param-false",
          }
        : placeNaturalWonder(x, y, featureType, direction, elevation);
    };
    const plan = oneWonderPlan(featureTypes.FEATURE_KILIMANJARO, primaryPlotIndex, dimensions);
    plan.placements[0]!.fallbacks = [{ plotIndex: fallbackPlotIndex, elevation: 240 }];

    const measurements = executeNaturalWonderStep(adapter, plan);
    const fallbackY = Math.trunc(fallbackPlotIndex / dimensions.width);
    const fallbackX = fallbackPlotIndex - fallbackY * dimensions.width;

    expect(measurements).toMatchObject({
      summary: {
        plannedCount: 1,
        placedCount: 1,
        rejectedCount: 0,
      },
      outcomes: [{ status: "placed", plotIndex: fallbackPlotIndex }],
    });
    expect(adapter.calls.stampNaturalWonder).toEqual([
      {
        x: fallbackX,
        y: fallbackY,
        featureType: featureTypes.FEATURE_KILIMANJARO,
        direction: -1,
        elevation: 240,
      },
    ]);
    expect(adapter.getFeatureType(fallbackX, fallbackY)).toBe(featureTypes.FEATURE_KILIMANJARO);
  });

  it("records engine legality refusal as a degraded terminal outcome", () => {
    const adapter = createTerrainBackedAdapter({
      ...TEST_MAP_SIZE.dimensions,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
      defaultBiomeType: biomeGlobals.BIOME_PLAINS,
      defaultTerrainName: "TERRAIN_FLAT",
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
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const anchor = Math.floor(height / 2) * width + Math.floor(width / 2);

    const measurements = executeNaturalWonderStep(
      adapter,
      oneWonderPlan(featureTypes.FEATURE_KILIMANJARO, anchor, TEST_MAP_SIZE.dimensions)
    );

    expect(measurements).toMatchObject({
      summary: {
        plannedCount: 1,
        placedCount: 0,
        rejectedCount: 1,
        shortfallCount: 0,
      },
      outcomes: [
        {
          status: "rejected",
          plotIndex: anchor,
          reason: "can-have-feature-param-false",
        },
      ],
    });
  });

  it("preserves partial readback-mismatch evidence and rejected engine residue", () => {
    const adapter = createTerrainBackedAdapter({
      ...SYNTHETIC_MOUNTAIN_FOOTPRINT,
      defaultBiomeType: biomeGlobals.BIOME_PLAINS,
      defaultTerrainName: "TERRAIN_FLAT",
    });
    adapter.placeNaturalWonder = (x, y, featureType, direction, elevation) => {
      if (elevation === undefined) {
        throw new Error("Readback-mismatch fixture requires the planned wonder elevation.");
      }
      for (const plotIndex of [17, 18]) {
        const fy = Math.trunc(plotIndex / adapter.width);
        const fx = plotIndex - fy * adapter.width;
        adapter.setFeatureType(fx, fy, {
          Feature: featureType,
          Direction: direction,
          Elevation: elevation ?? 0,
        });
      }
      return {
        status: "rejected",
        plotIndex: y * adapter.width + x,
        x,
        y,
        featureType,
        direction,
        elevation,
        reason: "readback-mismatch",
        observedPlotIndex: 23,
        observedFeatureType: adapter.NO_FEATURE,
        expectedFootprintReadback: [
          { plotIndex: 17, observedFeatureType: featureType },
          { plotIndex: 23, observedFeatureType: adapter.NO_FEATURE },
          { plotIndex: 18, observedFeatureType: featureType },
        ],
        expectedFootprintReadbackStatus: "partial-expected-footprint",
      };
    };

    const measurements = executeNaturalWonderStep(
      adapter,
      oneWonderPlan(featureTypes.FEATURE_KILIMANJARO, 17, SYNTHETIC_MOUNTAIN_FOOTPRINT)
    );

    expect(measurements).toMatchObject({
      summary: {
        plannedCount: 1,
        placedCount: 0,
        rejectedCount: 1,
      },
      outcomes: [
        {
          status: "rejected",
          plotIndex: 17,
          reason: "readback-mismatch",
          observedPlotIndex: 23,
          observedFeatureType: adapter.NO_FEATURE,
          expectedFootprintReadbackStatus: "partial-expected-footprint",
        },
      ],
    });
    const observedPlotIndices = Array.from(adapter.readCurrentMapFeatureTypes())
      .map((featureType, plotIndex) => ({ featureType, plotIndex }))
      .filter(({ featureType }) => featureType === featureTypes.FEATURE_KILIMANJARO)
      .map(({ plotIndex }) => plotIndex);
    expect(observedPlotIndices).toEqual([17, 18]);
    expect(measurements.summary.rejectionExamples[0]).toContain(
      "readback=partial-expected-footprint"
    );
  });

  it("retains the terminal rejection after every fallback candidate fails", () => {
    const dimensions = TEST_MAP_SIZE.dimensions;
    const primaryPlotIndex = interiorPlotIndex(dimensions, -4);
    const firstFallbackPlotIndex = interiorPlotIndex(dimensions);
    const terminalFallbackPlotIndex = interiorPlotIndex(dimensions, 4);
    const adapter = createTerrainBackedAdapter({
      ...dimensions,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
      defaultBiomeType: biomeGlobals.BIOME_PLAINS,
      defaultTerrainName: "TERRAIN_FLAT",
    });
    const attemptedPlotIndices: number[] = [];
    adapter.placeNaturalWonder = (x, y, featureType, direction, elevation) => {
      const plotIndex = y * adapter.width + x;
      attemptedPlotIndices.push(plotIndex);
      const rejected = {
        status: "rejected",
        plotIndex,
        x,
        y,
        featureType,
        direction,
        elevation,
      } as const;
      return plotIndex === terminalFallbackPlotIndex
        ? { ...rejected, reason: "set-feature-false" }
        : { ...rejected, reason: "can-have-feature-param-false" };
    };
    const plan = oneWonderPlan(featureTypes.FEATURE_KILIMANJARO, primaryPlotIndex, dimensions);
    plan.placements[0]!.fallbacks = [
      { plotIndex: firstFallbackPlotIndex, elevation: 180 },
      { plotIndex: terminalFallbackPlotIndex, elevation: 240 },
    ];
    const log = spyOn(console, "log").mockImplementation(() => {});

    try {
      const measurements = executeNaturalWonderStep(adapter, plan);

      expect(attemptedPlotIndices).toEqual([
        primaryPlotIndex,
        firstFallbackPlotIndex,
        terminalFallbackPlotIndex,
      ]);
      expect(measurements).toMatchObject({
        summary: {
          plannedCount: 1,
          placedCount: 0,
          rejectedCount: 1,
          rejectionExamples: [expect.stringContaining(`plot=${terminalFallbackPlotIndex}`)],
        },
        outcomes: [
          {
            status: "rejected",
            plotIndex: terminalFallbackPlotIndex,
            elevation: 240,
            reason: "set-feature-false",
          },
        ],
      });
      expect(String(log.mock.calls[0]?.[0])).toContain(
        `feature=${featureTypes.FEATURE_KILIMANJARO} plot=${primaryPlotIndex}`
      );
      const placementPayload = decodeBoundedJsonLogSeries(
        log.mock.calls.map((call) => String(call[0])),
        "NATURAL_WONDER_PLACEMENT_V1"
      ).at(-1)?.payload as { rejectedRows?: readonly (readonly unknown[])[] } | undefined;
      expect(placementPayload?.rejectedRows?.[0]?.[1]).toBe(primaryPlotIndex);
      expect(
        placementPayload?.rejectedRows?.some((row) => row[1] === terminalFallbackPlotIndex)
      ).toBe(false);
    } finally {
      log.mockRestore();
    }
  });

  it("records a target shortfall without aborting a preset-sized run", () => {
    const adapter = createTerrainBackedAdapter({
      ...TEST_MAP_SIZE.dimensions,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
      defaultBiomeType: biomeGlobals.BIOME_GRASSLAND,
      defaultTerrainName: "TERRAIN_FLAT",
    });
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const anchor = Math.floor(height / 2) * width + Math.floor(width / 2);

    const measurements = executeNaturalWonderStep(
      adapter,
      oneWonderPlan(featureTypes.FEATURE_REDWOOD_FOREST, anchor, TEST_MAP_SIZE.dimensions, {
        wondersCount: 2,
        targetCount: 2,
      })
    );

    expect(measurements).toMatchObject({
      summary: {
        requestedCount: 2,
        plannedCount: 1,
        placedCount: 1,
        rejectedCount: 0,
        shortfallCount: 1,
      },
    });
  });
});
