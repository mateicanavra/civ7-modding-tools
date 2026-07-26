import { describe, expect, it } from "bun:test";

import { createMockAdapter as createBaseMockAdapter, type MockAdapterConfig } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { artifacts as placementWonderArtifacts } from "@mapgen/domain/placement/modules/wonders/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { type ArtifactValueOf, readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";

import { PlaceNaturalWondersStep } from "../../../../../../src/recipes/standard/stages/placement/steps/place-natural-wonders/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

const { biomeGlobals, featureTypes } = CIV7_BROWSER_TABLES_V0;
const SYNTHETIC_REDWOOD_FOOTPRINT = { width: 4, height: 6 } as const;
const SYNTHETIC_MOUNTAIN_FOOTPRINT = { width: 5, height: 8 } as const;

type NaturalWonderPlan = ArtifactValueOf<typeof placementWonderArtifacts.naturalWonderPlan>;
type TerrainBackedMockAdapterConfig = Omit<MockAdapterConfig, "defaultTerrainType"> &
  Readonly<{ defaultTerrainName: "TERRAIN_FLAT" | "TERRAIN_HILL" }>;

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
  dimensions: Readonly<{ width: number; height: number }>,
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

function executeNaturalWonderStep(
  adapter: ReturnType<typeof createTerrainBackedAdapter>,
  plan: NaturalWonderPlan
) {
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: { width: plan.width, height: plan.height },
      latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
    }),
    adapter,
  });

  withMapContextExecutionForTest(context, (stepContext) => {
    publishTestArtifact(stepContext, placementWonderArtifacts.naturalWonderPlan, plan);
    PlaceNaturalWondersStep.run(
      stepContext,
      {},
      {},
      buildStepTestDependencies(PlaceNaturalWondersStep, stepContext)
    );
  });

  return readValidatedArtifact(context, placementWonderArtifacts.naturalWonderPlacement);
}

describe("natural wonder placement materialization", () => {
  it("projects feature terrain policy over the exact even-row footprint before stamping", () => {
    const adapter = createTerrainBackedAdapter({
      ...SYNTHETIC_REDWOOD_FOOTPRINT,
      defaultBiomeType: biomeGlobals.BIOME_GRASSLAND,
      defaultTerrainName: "TERRAIN_HILL",
    });
    const flatTerrain = adapter.getTerrainTypeIndex("TERRAIN_FLAT");

    const evidence = executeNaturalWonderStep(
      adapter,
      oneWonderPlan(featureTypes.FEATURE_REDWOOD_FOREST, 9, SYNTHETIC_REDWOOD_FOOTPRINT)
    );

    // The local geometry is the oracle: anchor (1,2) uses the even-row
    // THREETRIANGLE footprint (1,2), (2,2), and (1,3).
    expect(adapter.getTerrainType(1, 2)).toBe(flatTerrain);
    expect(adapter.getTerrainType(2, 2)).toBe(flatTerrain);
    expect(adapter.getTerrainType(1, 3)).toBe(flatTerrain);
    expect(evidence).toMatchObject({
      plannedCount: 1,
      placedCount: 1,
      terrainAdjustedCount: 3,
      rejectedCount: 0,
      coordinateEvidence: {
        placed: { count: 1 },
        rejected: { count: 0 },
      },
      observedNaturalWonderPlotIndices: [9, 10, 13],
    });
  });

  it("publishes final engine occupancy, including cells added beyond the inferred footprint", () => {
    const adapter = createTerrainBackedAdapter({
      ...SYNTHETIC_REDWOOD_FOOTPRINT,
      defaultBiomeType: biomeGlobals.BIOME_GRASSLAND,
      defaultTerrainName: "TERRAIN_HILL",
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

    const evidence = executeNaturalWonderStep(
      adapter,
      oneWonderPlan(featureTypes.FEATURE_REDWOOD_FOREST, 9, SYNTHETIC_REDWOOD_FOOTPRINT)
    );

    expect(evidence.observedNaturalWonderPlotIndices).toEqual([9, 10, 13, 20]);
  });

  it("retries the planner's fallback anchor after an engine refusal", () => {
    const adapter = createTerrainBackedAdapter({
      ...SYNTHETIC_MOUNTAIN_FOOTPRINT,
      defaultBiomeType: biomeGlobals.BIOME_PLAINS,
      defaultTerrainName: "TERRAIN_FLAT",
    });
    const placeNaturalWonder = adapter.placeNaturalWonder.bind(adapter);
    adapter.placeNaturalWonder = (x, y, featureType, direction, elevation) =>
      x === 2 && y === 3
        ? {
            status: "rejected",
            plotIndex: y * adapter.width + x,
            x,
            y,
            featureType,
            direction,
            reason: "can-have-feature-param-false",
          }
        : placeNaturalWonder(x, y, featureType, direction, elevation);
    const plan = oneWonderPlan(featureTypes.FEATURE_KILIMANJARO, 17, SYNTHETIC_MOUNTAIN_FOOTPRINT);
    plan.placements[0]!.fallbackPlotIndices = [19];

    const evidence = executeNaturalWonderStep(adapter, plan);

    expect(evidence).toMatchObject({
      plannedCount: 1,
      placedCount: 1,
      rejectedCount: 0,
      coordinateRows: [{ status: "placed", plotIndex: 19 }],
    });
    expect(adapter.getFeatureType(4, 3)).toBe(featureTypes.FEATURE_KILIMANJARO);
  });

  it("records engine legality refusal as a degraded product outcome", () => {
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

    const evidence = executeNaturalWonderStep(
      adapter,
      oneWonderPlan(featureTypes.FEATURE_KILIMANJARO, anchor, TEST_MAP_SIZE.dimensions)
    );

    expect(evidence).toMatchObject({
      plannedCount: 1,
      placedCount: 0,
      rejectedCount: 1,
      shortfallCount: 0,
      coordinateRows: [
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

    const evidence = executeNaturalWonderStep(
      adapter,
      oneWonderPlan(featureTypes.FEATURE_KILIMANJARO, 17, SYNTHETIC_MOUNTAIN_FOOTPRINT)
    );

    expect(evidence).toMatchObject({
      plannedCount: 1,
      placedCount: 0,
      rejectedCount: 1,
      observedNaturalWonderPlotIndices: [17, 18],
      coordinateRows: [
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
    expect(evidence.rejectionExamples[0]).toContain("readback=partial-expected-footprint");
  });

  it("records the primary rejection once after every fallback anchor fails", () => {
    const adapter = createTerrainBackedAdapter({
      ...SYNTHETIC_MOUNTAIN_FOOTPRINT,
      defaultBiomeType: biomeGlobals.BIOME_PLAINS,
      defaultTerrainName: "TERRAIN_FLAT",
    });
    const attemptedPlotIndices: number[] = [];
    adapter.placeNaturalWonder = (x, y, featureType, direction) => {
      const plotIndex = y * adapter.width + x;
      attemptedPlotIndices.push(plotIndex);
      return {
        status: "rejected",
        plotIndex,
        x,
        y,
        featureType,
        direction,
        reason: "can-have-feature-param-false",
      };
    };
    const plan = oneWonderPlan(featureTypes.FEATURE_KILIMANJARO, 17, SYNTHETIC_MOUNTAIN_FOOTPRINT);
    plan.placements[0]!.fallbackPlotIndices = [19, 21];

    const evidence = executeNaturalWonderStep(adapter, plan);

    expect(attemptedPlotIndices).toEqual([17, 19, 21]);
    expect(evidence).toMatchObject({
      plannedCount: 1,
      placedCount: 0,
      rejectedCount: 1,
      rejectionExamples: [expect.stringContaining("plot=17")],
      coordinateRows: [
        {
          status: "rejected",
          plotIndex: 17,
          reason: "can-have-feature-param-false",
        },
      ],
    });
  });

  it("records a target shortfall without aborting a preset-sized run", () => {
    const adapter = createTerrainBackedAdapter({
      ...TEST_MAP_SIZE.dimensions,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
      defaultBiomeType: biomeGlobals.BIOME_GRASSLAND,
      defaultTerrainName: "TERRAIN_HILL",
    });
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const anchor = Math.floor(height / 2) * width + Math.floor(width / 2);

    const evidence = executeNaturalWonderStep(
      adapter,
      oneWonderPlan(featureTypes.FEATURE_REDWOOD_FOREST, anchor, TEST_MAP_SIZE.dimensions, {
        wondersCount: 2,
        targetCount: 2,
      })
    );

    expect(evidence).toMatchObject({
      targetCount: 2,
      plannedCount: 1,
      placedCount: 1,
      rejectedCount: 0,
      shortfallCount: 1,
    });
  });
});
