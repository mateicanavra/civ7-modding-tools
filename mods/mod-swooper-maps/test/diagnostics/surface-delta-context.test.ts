import { describe, expect, test } from "bun:test";

import type { FinalSurfaceSnapshot } from "../../scripts/live/live-parity";
import {
  buildFeatureDeltaPlacementContexts,
  buildNaturalWonderFootprintCatalogContexts,
  buildNaturalWonderFootprintReadbackContexts,
  buildNaturalWonderLiveEvidenceBoundaryContext,
  buildResourceDeltaFeasibilityContexts,
  buildResourceDeltaPlacementContexts,
  buildSurfaceDeltaContext,
  buildSurfaceDeltaContexts,
  buildTerrainDeltaEdgeContexts,
  staticSurfaceLegality,
} from "../../scripts/live/surface-delta-context";

function snapshot(
  overrides: Partial<FinalSurfaceSnapshot["surfaces"]> = {},
  evidence?: Readonly<Record<string, unknown>>
): FinalSurfaceSnapshot {
  const width = 3;
  const height = 2;
  return {
    source: "local-mapgen",
    width,
    height,
    surfaces: {
      terrain: { width, height, values: [3, 3, 2, 2, 2, 3] },
      biome: { width, height, values: [5, 5, 1, 1, 2, 5] },
      feature: { width, height, values: [-1, -1, -1, 6, -1, -1] },
      resource: { width, height, values: [-1, 3, -1, -1, -1, -1] },
      ...overrides,
    },
    ...(evidence === undefined ? {} : { evidence }),
  };
}

describe("surface delta context diagnostics", () => {
  test("extracts feature/resource mismatch rows with symbols", () => {
    const local = snapshot({
      feature: { width: 3, height: 2, values: [11, -1, -1, 6, -1, -1] },
      resource: { width: 3, height: 2, values: [-1, 3, -1, -1, -1, -1] },
    });
    const live = snapshot({
      feature: { width: 3, height: 2, values: [-1, -1, -1, 6, -1, -1] },
      resource: { width: 3, height: 2, values: [-1, -1, -1, -1, -1, -1] },
    });

    const rows = buildSurfaceDeltaContexts({ local, live }, { keys: ["feature", "resource"] });

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      key: "feature",
      x: 0,
      y: 0,
      local: { value: 11, symbol: "FEATURE_COLD_REEF" },
      live: { value: null, symbol: "empty" },
    });
    expect(rows[1]).toMatchObject({
      key: "resource",
      x: 1,
      y: 0,
      local: { value: 3, symbol: "RESOURCE_FISH" },
      live: { value: null, symbol: "empty" },
    });
  });

  test("classifies coast/ocean terrain edge swaps with neighborhood context", () => {
    const local = snapshot(
      {
        terrain: { width: 3, height: 2, values: [3, 4, 3, 2, 3, 4] },
      },
      {
        terrainProjection: {
          coastlineMetrics: {
            coastalLand: [0, 0, 0, 1, 0, 0],
            coastalWater: [1, 1, 1, 0, 1, 1],
            distanceToCoast: [0, 1, 0, 0, 0, 1],
          },
          shelf: {
            shelfMask: [1, 0, 1, 0, 1, 0],
            coastalLand: [0, 0, 0, 1, 0, 0],
            coastalWater: [1, 1, 1, 0, 1, 1],
            distanceToCoast: [0, 1, 0, 0, 0, 1],
          },
          mapMorphologyCoastPolicy: {
            baseWaterClass: [1, 2, 1, 0, 1, 2],
            sourceCoastMask: [1, 0, 1, 0, 1, 0],
            waterClass: [1, 2, 1, 0, 1, 2],
            coastRingMask: [1, 0, 1, 0, 1, 0],
            promotedOceanToCoast: 0,
          },
          mapMorphologyCoastTerrainSnapshot: {
            stage: "map-morphology/plot-coasts",
            landMask: [0, 0, 0, 1, 0, 0],
            terrain: [3, 4, 3, 2, 3, 4],
          },
          mapMorphologyContinentValidationSnapshot: {
            stage: "map-morphology/plot-continents",
            landMask: [0, 0, 0, 1, 0, 0],
            terrain: [3, 3, 3, 2, 3, 4],
          },
          hydrologyLakePlan: {
            lakeMask: [0, 0, 0, 0, 0, 0],
            plannedLakeTileCount: 0,
            sinkLakeCount: 0,
          },
          mapHydrologyProjection: {
            lakeMask: [0, 0, 0, 0, 0, 0],
            plannedLakeMask: [0, 0, 0, 0, 0, 0],
            engineWaterMask: [1, 1, 1, 0, 1, 1],
            engineLakeMask: [0, 0, 0, 0, 0, 0],
            engineTerrain: [3, 4, 3, 2, 3, 4],
            engineAreaId: [1, 1, 1, 2, 1, 1],
            terrainMismatchMask: [0, 0, 0, 0, 0, 0],
            terrainMismatchTileCount: 0,
            nonLakeTileCount: 0,
            morphologyProtectedLakeTileCount: 0,
          },
          hydrologyTerrainSnapshot: {
            stage: "map-hydrology/lakes",
            landMask: [0, 0, 0, 1, 0, 0],
            terrain: [3, 4, 3, 2, 3, 4],
          },
          mapElevationTerrainSnapshot: {
            stage: "map-elevation/build-elevation",
            landMask: [0, 0, 0, 1, 0, 0],
            terrain: [3, 4, 3, 2, 3, 4],
          },
          mapRiversTerrainSnapshot: {
            stage: "map-rivers/plot-rivers",
            landMask: [0, 0, 0, 1, 0, 0],
            terrain: [3, 4, 3, 2, 3, 4],
          },
          placementSurfacePreparation: {
            acceptedLakeTileCount: 0,
            finalLakeWaterDriftCount: 0,
            finalLakeClassificationDriftCount: 0,
          },
          placementTerrainSnapshot: {
            stage: "placement/placement",
            landMask: [0, 0, 0, 1, 0, 0],
            terrain: [3, 4, 3, 2, 3, 4],
          },
          placementValidationBoundary: {
            beforeValidate: {
              stage: "placement/prepare-surface/before-validate",
              terrain: [3, 4, 3, 2, 3, 4],
              waterMask: [1, 1, 1, 0, 1, 1],
              lakeMask: [0, 1, 0, 0, 0, 0],
              areaId: [1, 1, 1, 2, 1, 1],
            },
            afterValidate: {
              stage: "placement/prepare-surface/after-validate",
              terrain: [3, 3, 3, 2, 3, 4],
              waterMask: [1, 1, 1, 0, 1, 1],
              lakeMask: [0, 0, 0, 0, 0, 0],
              areaId: [1, 1, 1, 2, 1, 1],
            },
            afterMaintenance: {
              stage: "placement/prepare-surface/after-maintenance",
              terrain: [3, 3, 3, 2, 3, 4],
              waterMask: [1, 1, 1, 0, 1, 1],
              lakeMask: [0, 0, 0, 0, 0, 0],
              areaId: [10, 10, 10, 20, 10, 10],
            },
          },
        },
      }
    );
    const live = snapshot({
      terrain: { width: 3, height: 2, values: [3, 3, 3, 2, 3, 4] },
    });

    const rows = buildTerrainDeltaEdgeContexts({ local, live });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      x: 1,
      y: 0,
      plotIndex: 1,
      localTerrain: { symbol: "TERRAIN_OCEAN" },
      liveTerrain: { symbol: "TERRAIN_COAST" },
      evidenceClass: "local-ocean-live-coast",
      sourceAuthorityStatus: "unresolved",
      ownerCandidates: expect.arrayContaining([
        "map-morphology-coast-shelf-projection",
        "civ-engine-terrain-validation",
        "evidence-insufficient",
      ]),
      neighborhood: {
        // Odd-R neighborhood of the probe tile (1,0) (even row -> WEST diagonals):
        // (0,0) coast, (2,0) coast, (1,1) coast, (0,1) land. The OCEAN tile (2,1)
        // is an odd-Q (column-offset) neighbor only and is correctly absent here,
        // so ocean drops from 1 (old odd-Q) to 0.
        localCounts: {
          coast: 3,
          ocean: 0,
          land: 1,
        },
        liveCounts: {
          coast: 3,
          ocean: 0,
          land: 1,
        },
      },
      localProjection: {
        morphology: {
          coastalWater: 1,
          distanceToCoast: 1,
        },
        shelf: {
          shelfMask: 0,
          coastalWater: 1,
          distanceToCoast: 1,
        },
        mapMorphologyCoastPolicy: {
          baseWaterClass: 2,
          sourceCoastMask: 0,
          waterClass: 2,
          coastRingMask: 0,
          promotedOceanToCoast: 0,
        },
        mapMorphologyCoastTerrainSnapshot: {
          stage: "map-morphology/plot-coasts",
          landMask: 0,
          terrainSymbol: "TERRAIN_OCEAN",
        },
        mapMorphologyContinentValidationSnapshot: {
          stage: "map-morphology/plot-continents",
          landMask: 0,
          terrainSymbol: "TERRAIN_COAST",
        },
        hydrologyLakePlan: {
          lakeMask: 0,
          plannedLakeTileCount: 0,
        },
        mapHydrologyProjection: {
          engineWaterMask: 1,
          engineLakeMask: 0,
          engineTerrainSymbol: "TERRAIN_OCEAN",
          engineAreaId: 1,
        },
        hydrologyTerrainSnapshot: {
          stage: "map-hydrology/lakes",
          landMask: 0,
          terrainSymbol: "TERRAIN_OCEAN",
        },
        mapElevationTerrainSnapshot: {
          stage: "map-elevation/build-elevation",
          landMask: 0,
          terrainSymbol: "TERRAIN_OCEAN",
        },
        mapRiversTerrainSnapshot: {
          stage: "map-rivers/plot-rivers",
          landMask: 0,
          terrainSymbol: "TERRAIN_OCEAN",
        },
        placementTerrainSnapshot: {
          stage: "placement/placement",
          terrainSymbol: "TERRAIN_OCEAN",
        },
        placementValidationBoundary: {
          beforeValidate: {
            stage: "placement/prepare-surface/before-validate",
            terrainSymbol: "TERRAIN_OCEAN",
            lakeMask: 1,
            areaId: 1,
          },
          afterValidate: {
            stage: "placement/prepare-surface/after-validate",
            terrainSymbol: "TERRAIN_COAST",
            lakeMask: 0,
            areaId: 1,
          },
          afterMaintenance: {
            stage: "placement/prepare-surface/after-maintenance",
            terrainSymbol: "TERRAIN_COAST",
            lakeMask: 0,
            areaId: 10,
          },
        },
      },
    });
    expect(rows[0].neighborhood.neighbors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          x: 0,
          y: 0,
          localTerrain: expect.objectContaining({ symbol: "TERRAIN_COAST", waterClass: "coast" }),
        }),
        expect.objectContaining({
          x: 0,
          y: 1,
          localTerrain: expect.objectContaining({ symbol: "TERRAIN_FLAT", waterClass: "land" }),
        }),
      ])
    );
  });

  test("classifies feature deltas into reef absences and nearby natural-wonder offsets", () => {
    const local = snapshot(
      {
        feature: { width: 3, height: 2, values: [11, 35, -1, -1, -1, 36] },
      },
      {
        featureIntents: {
          reefs: [{ x: 0, y: 0, feature: "FEATURE_COLD_REEF", weight: 0.8 }],
        },
        naturalWonderPlan: {
          width: 3,
          height: 2,
          wondersCount: 2,
          targetCount: 2,
          plannedCount: 2,
          placements: [
            { plotIndex: 1, featureType: 35, direction: 0, elevation: 1000, priority: 0.9 },
            { plotIndex: 5, featureType: 36, direction: 0, elevation: 900, priority: 0.8 },
          ],
        },
      }
    );
    const live = snapshot({
      feature: { width: 3, height: 2, values: [-1, -1, 35, -1, 36, -1] },
    });

    const rows = buildFeatureDeltaPlacementContexts({ local, live });

    expect(rows).toHaveLength(5);
    expect(rows[0]).toMatchObject({
      x: 0,
      y: 0,
      local: { symbol: "FEATURE_COLD_REEF" },
      live: { symbol: "empty" },
      pairedSameFeatureDelta: null,
      localFeatureIntent: {
        family: "reefs",
        feature: "FEATURE_COLD_REEF",
        weight: 0.8,
      },
      evidenceClass: "local-only-ecology-feature",
    });
    expect(rows[1]).toMatchObject({
      x: 1,
      y: 0,
      local: { symbol: "FEATURE_KILIMANJARO" },
      live: { symbol: "empty" },
      naturalWonderFootprint: {
        anchorPlotIndex: 1,
        featureSymbol: "FEATURE_KILIMANJARO",
        priority: 0.9,
      },
      naturalWonderDirectionAlternatives: {
        anchorPlotIndex: 1,
        declaredDirection: 0,
        directionsContainingRow: expect.arrayContaining([0]),
        directionsContainingPairedRow: expect.arrayContaining([0]),
      },
      pairedSameFeatureDelta: {
        x: 2,
        y: 0,
        distance: 1,
        liveFeature: { symbol: "FEATURE_KILIMANJARO" },
      },
      evidenceClass: "natural-wonder-offset-local-anchor",
    });
    expect(rows[2]).toMatchObject({
      x: 2,
      y: 0,
      local: { symbol: "empty" },
      live: { symbol: "FEATURE_KILIMANJARO" },
      naturalWonderDirectionAlternatives: {
        anchorPlotIndex: 1,
        declaredDirection: 0,
        directionsContainingRow: expect.arrayContaining([0]),
        directionsContainingPairedRow: expect.arrayContaining([0]),
      },
      pairedSameFeatureDelta: {
        x: 1,
        y: 0,
        distance: 1,
        localFeature: { symbol: "FEATURE_KILIMANJARO" },
      },
      evidenceClass: "natural-wonder-offset-live-anchor",
    });
    expect(rows.map((row) => row.evidenceClass)).toEqual([
      "local-only-ecology-feature",
      "natural-wonder-offset-local-anchor",
      "natural-wonder-offset-live-anchor",
      "natural-wonder-offset-live-anchor",
      "natural-wonder-offset-local-anchor",
    ]);
  });

  test("summarizes natural-wonder footprint readback direction matches", () => {
    const local = snapshot(
      {
        feature: { width: 3, height: 2, values: [-1, 35, 35, -1, -1, -1] },
      },
      {
        naturalWonderPlan: {
          width: 3,
          height: 2,
          wondersCount: 1,
          targetCount: 1,
          plannedCount: 1,
          placements: [
            { plotIndex: 1, featureType: 35, direction: 0, elevation: 1000, priority: 0.9 },
          ],
        },
      }
    );
    const live = snapshot({
      feature: { width: 3, height: 2, values: [-1, 35, 35, -1, -1, -1] },
    });

    const rows = buildNaturalWonderFootprintReadbackContexts({ local, live });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      featureSymbol: "FEATURE_KILIMANJARO",
      declaredDirection: 0,
      bestLocalDirections: expect.arrayContaining([0]),
      bestLiveDirections: expect.arrayContaining([0]),
      classification: "local-live-same-direction",
    });
  });

  test("classifies natural-wonder footprint direction divergence", () => {
    const local = snapshot(
      {
        feature: { width: 3, height: 2, values: [-1, 35, 35, -1, -1, -1] },
      },
      {
        naturalWonderPlan: {
          width: 3,
          height: 2,
          wondersCount: 1,
          targetCount: 1,
          plannedCount: 1,
          placements: [
            { plotIndex: 1, featureType: 35, direction: 0, elevation: 1000, priority: 0.9 },
          ],
        },
      }
    );
    // Anchor (1,0) is an even row; the parity-correct THREETRIANGLE footprints are
    // dir0={1,4,2}, dir4={1,0,3}, dir5={1,3,4}. Local feature {1,2} → best dir 0;
    // live feature {1,3} → best dirs {4,5}; so live diverges from local.
    const live = snapshot({
      feature: { width: 3, height: 2, values: [-1, 35, -1, 35, -1, -1] },
    });

    const rows = buildNaturalWonderFootprintReadbackContexts({ local, live });

    expect(rows[0]).toMatchObject({
      bestLocalDirections: expect.arrayContaining([0]),
      bestLiveDirections: expect.arrayContaining([5]),
      classification: "live-direction-differs-from-local",
    });
  });

  test("exposes unsupported repair authority for unspecified multi-tile wonder directions", () => {
    const rows = buildNaturalWonderFootprintCatalogContexts();
    const kilimanjaro = rows.find((row) => row.featureSymbol === "FEATURE_KILIMANJARO");
    const fuji = rows.find((row) => row.featureSymbol === "FEATURE_MOUNT_FUJI");
    const uluru = rows.find((row) => row.featureSymbol === "FEATURE_ULURU");

    expect(kilimanjaro).toMatchObject({
      declaredDirection: -1,
      localProjectionDirection: 0,
      naturalWonderTiles: 3,
      directionClass: "unspecified-engine-direction-local-fixed-projection",
      readbackDisposition: "no-exact-run-evidence",
    });
    expect(kilimanjaro?.supportedDirections.map((row) => row.direction)).toEqual([
      0, 1, 2, 3, 4, 5,
    ]);
    expect(kilimanjaro?.localProjectionOffsets).toEqual([
      { dx: 0, dy: 0 },
      { dx: 1, dy: 1 },
      { dx: 1, dy: 0 },
    ]);
    expect(fuji).toMatchObject({
      declaredDirection: 2,
      localProjectionDirection: 2,
      directionClass: "official-fixed-direction",
    });
    expect(uluru).toMatchObject({
      naturalWonderTiles: 1,
      directionClass: "single-tile-direction-irrelevant",
    });
  });

  test("joins exact-run readback evidence to natural-wonder catalog direction classes", () => {
    // Anchor (1,0) even; TWOADJACENT footprints dir0={1,4}, dir5={1,3}. Local {1,4}
    // → best dir 0; live {1,3} → best dir 5; live diverges from local.
    const local = snapshot(
      {
        feature: { width: 3, height: 2, values: [-1, 36, -1, -1, 36, -1] },
      },
      {
        naturalWonderPlan: {
          width: 3,
          height: 2,
          wondersCount: 1,
          targetCount: 1,
          plannedCount: 1,
          placements: [
            { plotIndex: 1, featureType: 36, direction: -1, elevation: 1000, priority: 0.9 },
          ],
        },
      }
    );
    const live = snapshot({
      feature: { width: 3, height: 2, values: [-1, 36, -1, 36, -1, -1] },
    });
    const readbacks = buildNaturalWonderFootprintReadbackContexts({ local, live });

    const catalog = buildNaturalWonderFootprintCatalogContexts(readbacks);
    const zhangjiajie = catalog.find((row) => row.featureSymbol === "FEATURE_ZHANGJIAJIE");

    expect(zhangjiajie).toMatchObject({
      declaredDirection: -1,
      directionClass: "unspecified-engine-direction-local-fixed-projection",
      readbackDisposition: "observed-live-direction-drift",
      observedReadbacks: [
        {
          declaredDirection: -1,
          bestLocalDirections: [0],
          bestLiveDirections: [5],
          classification: "live-direction-differs-from-local",
        },
      ],
    });
  });

  test("keeps natural-wonder placement report unresolved when stats are local-only", () => {
    const local = snapshot(
      {},
      {
        naturalWonderPlacement: {
          plannedCount: 7,
          targetCount: 7,
          placedCount: 7,
          rejectedCount: 0,
          shortfallCount: 0,
        },
      }
    );

    const context = buildNaturalWonderLiveEvidenceBoundaryContext({
      local,
      exactAuthorshipEvidence: undefined,
    });

    expect(context).toMatchObject({
      localPlacementStats: {
        plannedCount: 7,
        targetCount: 7,
        placedCount: 7,
        rejectedCount: 0,
        shortfallCount: 0,
      },
      liveTelemetryPlacementStats: null,
      liveEvidencePlacementStats: null,
      liveCompletionPlacementStats: null,
      boundaryClass: "local-placement-stats-only",
      unresolvedLinks: ["natural-wonder.live-placement-stats"],
    });
  });

  test("accepts natural-wonder placement stats only when live report payload carries them", () => {
    const local = snapshot(
      {},
      {
        naturalWonderPlacement: {
          plannedCount: 7,
          placedCount: 7,
        },
      }
    );

    const context = buildNaturalWonderLiveEvidenceBoundaryContext({
      local,
      exactAuthorshipEvidence: exactAuthorshipEvidence({
        log: {
          completionPayload: {
            naturalWonderPlacement: {
              plannedCount: 7,
              targetCount: 7,
              placedCount: 7,
              rejectedCount: 0,
              shortfallCount: 0,
            },
          },
        },
      }),
    });

    expect(context).toMatchObject({
      liveTelemetryPlacementStats: null,
      liveEvidencePlacementStats: null,
      liveCompletionPlacementStats: {
        plannedCount: 7,
        targetCount: 7,
        placedCount: 7,
        rejectedCount: 0,
        shortfallCount: 0,
      },
      boundaryClass: "local-and-live-placement-stats-present",
      unresolvedLinks: [],
    });
  });

  test("accepts natural-wonder placement stats from exact log telemetry", () => {
    const local = snapshot(
      {},
      {
        naturalWonderPlacement: {
          plannedCount: 7,
          placedCount: 7,
        },
      }
    );

    const context = buildNaturalWonderLiveEvidenceBoundaryContext({
      local,
      exactAuthorshipEvidence: exactAuthorshipEvidence({
        log: {
          naturalWonderPlacement: {
            marker: "NATURAL_WONDER_PLACEMENT_V1",
            stats: {
              version: 1,
              plannedCount: 7,
              targetCount: 7,
              placedCount: 7,
              terrainAdjustedCount: 0,
              skippedOutOfBoundsCount: 0,
              rejectedCount: 0,
              shortfallCount: 0,
              rejectionExampleCount: 0,
            },
            coordinateEvidence: {
              version: 1,
              placed: { count: 7, hash32: "3c3530cb" },
            },
          },
        },
      }),
    });

    expect(context).toMatchObject({
      liveTelemetryPlacementStats: {
        plannedCount: 7,
        targetCount: 7,
        placedCount: 7,
        rejectedCount: 0,
        shortfallCount: 0,
        coordinateEvidence: {
          version: 1,
          placed: { count: 7, hash32: "3c3530cb" },
          rejected: { count: null, hash32: null },
        },
      },
      liveEvidencePlacementStats: null,
      liveCompletionPlacementStats: null,
      boundaryClass: "local-and-live-placement-stats-present",
      unresolvedLinks: [],
    });
  });

  test("checks static feature and resource surface legality against snapshot context", () => {
    const surface = snapshot();

    expect(staticSurfaceLegality(surface, "feature", 0, 0, 11)).toMatchObject({
      symbol: "FEATURE_COLD_REEF",
      validSurface: true,
    });
    expect(staticSurfaceLegality(surface, "feature", 2, 0, 11)).toMatchObject({
      symbol: "FEATURE_COLD_REEF",
      validSurface: false,
      reasons: ["feature.terrain", "feature.biome"],
    });
    expect(staticSurfaceLegality(surface, "resource", 1, 0, 3)).toMatchObject({
      symbol: "RESOURCE_FISH",
      validSurface: true,
      resourcePolicy: {
        matchingRows: [
          {
            biomeSymbol: "BIOME_MARINE",
            terrainSymbol: "TERRAIN_COAST",
            featureSymbol: "empty",
          },
        ],
        flags: {
          adjacentToLand: true,
          adjacentToLandRuntimeOptional: true,
          lakeEligible: true,
        },
        hasAdjacentLand: true,
      },
    });
    const openCoast = snapshot({
      terrain: { width: 3, height: 2, values: [3, 3, 3, 3, 3, 3] },
      biome: { width: 3, height: 2, values: [5, 5, 5, 5, 5, 5] },
      feature: { width: 3, height: 2, values: [-1, -1, -1, -1, -1, -1] },
    });
    expect(staticSurfaceLegality(openCoast, "resource", 1, 0, 3)).toMatchObject({
      symbol: "RESOURCE_FISH",
      validSurface: true,
    });
    const invalidWhales = staticSurfaceLegality(surface, "resource", 2, 0, 32);
    expect(invalidWhales).toMatchObject({
      symbol: "RESOURCE_WHALES",
      validSurface: false,
    });
    expect(invalidWhales.reasons).toContain("resource.surface");
  });

  test("cross-checks local and live values against both surfaces", () => {
    const local = snapshot({
      resource: { width: 3, height: 2, values: [-1, 3, -1, -1, -1, -1] },
    });
    const live = snapshot({
      terrain: { width: 3, height: 2, values: [3, 2, 2, 2, 2, 3] },
      biome: { width: 3, height: 2, values: [5, 1, 1, 1, 2, 5] },
      resource: { width: 3, height: 2, values: [-1, -1, -1, -1, -1, -1] },
    });

    const row = buildSurfaceDeltaContext(local, live, "resource", 1, 0);

    expect(row.legality.localValueOnLocal).toMatchObject({
      symbol: "RESOURCE_FISH",
      validSurface: true,
    });
    expect(row.legality.localValueOnLive).toMatchObject({
      symbol: "RESOURCE_FISH",
      validSurface: false,
      reasons: ["resource.surface"],
    });
  });

  test("joins resource deltas to local placement plan and assignment outcomes", () => {
    const local = snapshot(
      {
        resource: { width: 3, height: 2, values: [3, -1, 2, -1, -1, -1] },
      },
      {
        resourcePlan: {
          siteSpacingTiles: 2,
          intents: [
            {
              plotIndex: 0,
              x: 0,
              y: 0,
              resourceType: "RESOURCE_FISH",
              resourceTypeId: 3,
              family: "aquatic",
              laneId: "coastal-fishery",
              laneKind: "water",
              phase: "rotation",
              order: 0,
              regionSlot: 1,
              landmassId: -1,
              inHabitat: true,
            },
            {
              plotIndex: 1,
              x: 1,
              y: 0,
              resourceType: "RESOURCE_FISH",
              resourceTypeId: 3,
              family: "aquatic",
              laneId: "coastal-fishery",
              laneKind: "water",
              phase: "rotation",
              order: 1,
              regionSlot: 1,
              landmassId: -1,
              inHabitat: true,
            },
            {
              plotIndex: 2,
              x: 2,
              y: 0,
              resourceType: "RESOURCE_DYES",
              resourceTypeId: 2,
              family: "cultivated",
              laneId: "coastal-dyes",
              laneKind: "water",
              phase: "range-floor",
              order: 2,
              regionSlot: 1,
              landmassId: -1,
              inHabitat: false,
            },
          ],
        },
        resourcePlacementOutcomes: {
          outcomes: [
            {
              status: "placed",
              plotIndex: 0,
              x: 0,
              y: 0,
              resourceType: 3,
              observedResourceType: 3,
            },
            {
              status: "placed",
              plotIndex: 2,
              x: 2,
              y: 0,
              resourceType: 2,
              observedResourceType: 2,
            },
          ],
        },
      }
    );
    const live = snapshot({
      resource: { width: 3, height: 2, values: [-1, 3, 12, -1, -1, -1] },
    });

    const rows = buildResourceDeltaPlacementContexts({ local, live });

    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({
      plotIndex: 0,
      localResource: { symbol: "RESOURCE_FISH" },
      liveResource: { symbol: "empty" },
      localContext: {
        terrainSymbol: "TERRAIN_COAST",
        biomeSymbol: "BIOME_MARINE",
        resourceSymbol: "RESOURCE_FISH",
      },
      liveContext: {
        terrainSymbol: "TERRAIN_COAST",
        biomeSymbol: "BIOME_MARINE",
        resourceSymbol: "empty",
      },
      plannedPreferredResourceSymbol: "RESOURCE_FISH",
      localOutcome: { status: "placed", resourceSymbol: "RESOURCE_FISH" },
      planIntent: {
        resourceSymbol: "RESOURCE_FISH",
        resourceTypeName: "RESOURCE_FISH",
        phase: "rotation",
        family: "aquatic",
        laneId: "coastal-fishery",
        inHabitat: true,
        order: 0,
      },
      resourceNeighborhood: {
        minSpacingTiles: 2,
        localResourceOnLocal: {
          nearestSameType: null,
          nearestAnyResource: {
            plotIndex: 2,
            resourceSymbol: "RESOURCE_DYES",
          },
          anyResourceWithinMinSpacing: true,
        },
        localResourceOnLive: {
          nearestSameType: {
            plotIndex: 1,
            resourceSymbol: "RESOURCE_FISH",
          },
          sameTypeWithinMinSpacing: true,
        },
      },
      legality: {
        localValueOnLocal: {
          symbol: "RESOURCE_FISH",
          validSurface: true,
          reasons: [],
        },
      },
      evidenceClass: "local-assigned-live-empty",
    });
    expect(rows[1]).toMatchObject({
      plotIndex: 1,
      localResource: { symbol: "empty" },
      liveResource: { symbol: "RESOURCE_FISH" },
      plannedPreferredResourceSymbol: "RESOURCE_FISH",
      localOutcome: null,
      planIntent: {
        resourceSymbol: "RESOURCE_FISH",
        phase: "rotation",
        order: 1,
      },
      evidenceClass: "live-only-preferred-but-unassigned",
    });
    expect(rows[2]).toMatchObject({
      plotIndex: 2,
      localResource: { symbol: "RESOURCE_DYES" },
      liveResource: { symbol: "RESOURCE_PEARLS" },
      localOutcome: { status: "placed", resourceSymbol: "RESOURCE_DYES" },
      planIntent: {
        phase: "range-floor",
        inHabitat: false,
      },
      evidenceClass: "local-assigned-live-substitution",
    });
  });

  test("classifies resource deltas with Civ feasibility readback", () => {
    const local = snapshot(
      {
        resource: {
          width: 3,
          height: 2,
          values: [3, -1, 2, 6, 53, 14],
        },
      },
      {
        resourcePlan: {
          intents: [
            { plotIndex: 0, resourceTypeId: 3 },
            { plotIndex: 1, resourceTypeId: 3 },
            { plotIndex: 2, resourceTypeId: 2 },
            { plotIndex: 3, resourceTypeId: 6 },
            { plotIndex: 4, resourceTypeId: 53 },
            { plotIndex: 5, resourceTypeId: 14 },
          ],
        },
        resourcePlacementOutcomes: {
          outcomes: [
            {
              status: "placed",
              plotIndex: 0,
              x: 0,
              y: 0,
              resourceType: 3,
              observedResourceType: 3,
            },
            {
              status: "placed",
              plotIndex: 2,
              x: 2,
              y: 0,
              resourceType: 2,
              observedResourceType: 2,
            },
            {
              status: "placed",
              plotIndex: 3,
              x: 0,
              y: 1,
              resourceType: 6,
              observedResourceType: 6,
            },
            {
              status: "placed",
              plotIndex: 4,
              x: 1,
              y: 1,
              resourceType: 53,
              observedResourceType: 53,
            },
            {
              status: "placed",
              plotIndex: 5,
              x: 2,
              y: 1,
              resourceType: 14,
              observedResourceType: 14,
            },
          ],
        },
      }
    );
    const live = snapshot({
      resource: {
        width: 3,
        height: 2,
        values: [-1, 3, 12, -1, -1, 6],
      },
    });

    const rows = buildResourceDeltaFeasibilityContexts(
      { local, live },
      {
        cells: [
          feasibilityCell(0, 0, 0, { 3: true }),
          feasibilityCell(1, 0, 1, { 3: true }),
          feasibilityCell(2, 0, 2, { 2: true, 12: true }),
          feasibilityCell(0, 1, 3, { 6: false }),
          feasibilityCell(1, 1, 4, { 53: true }),
          feasibilityCell(2, 1, 5, { 14: false, 6: false }),
        ],
      }
    );

    expect(rows.map((row) => row.feasibilityClass)).toEqual([
      "local-feasible-live-empty",
      "live-feasible-no-local-assignment",
      "substitution-both-feasible",
      "local-overaccepted-live-empty",
      "local-feasible-live-empty",
      "substitution-both-infeasible",
    ]);
    expect(rows[3]).toMatchObject({
      evidenceClass: "local-assigned-live-empty",
      localResource: { symbol: "RESOURCE_GYPSUM" },
      liveResource: { symbol: "empty" },
      localFeasibleInCiv: { ok: true, value: false },
    });
    expect(rows[5]).toMatchObject({
      evidenceClass: "local-assigned-live-substitution",
      localResource: { symbol: "RESOURCE_SILVER" },
      liveResource: { symbol: "RESOURCE_GYPSUM" },
      feasibilityClass: "substitution-both-infeasible",
    });
  });
});

function feasibilityCell(
  x: number,
  y: number,
  index: number,
  values: Readonly<Record<number, boolean>>
) {
  return {
    location: { x, y, index: { ok: true, value: index } },
    feasibility: Object.fromEntries(
      Object.entries(values).map(([resourceType, value]) => [resourceType, { ok: true, value }])
    ),
  };
}

function exactAuthorshipEvidence(
  value: unknown
): NonNullable<
  Parameters<typeof buildNaturalWonderLiveEvidenceBoundaryContext>[0]["exactAuthorshipEvidence"]
> {
  return value as NonNullable<
    Parameters<typeof buildNaturalWonderLiveEvidenceBoundaryContext>[0]["exactAuthorshipEvidence"]
  >;
}
