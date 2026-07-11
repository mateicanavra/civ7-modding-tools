import { describe, expect, test } from "bun:test";

import {
  CIV7_BROWSER_TABLES_V0,
  NO_RIVER_TYPE,
  RIVER_TYPE_MINOR,
  RIVER_TYPE_NAVIGABLE,
} from "@civ7/map-policy";
import { STANDARD_RECIPE_CONFIG } from "mod-swooper-maps/recipes/standard-artifacts";
import {
  buildFinalSurfaceParityReport,
  type CompleteExactAuthorshipEvidence,
  createFinalSurfaceParityMapInfo,
  type FinalSurfaceSnapshot,
  hashParityValue,
  parseCompleteExactAuthorshipEvidencePacket,
} from "../../src/dev/diagnostics/live-parity";

const pipelineConfig = STANDARD_RECIPE_CONFIG;
const canonicalConfig = {
  id: "swooper-earthlike",
  name: "Swooper Earthlike",
  description: "A diagnostic fixture envelope.",
  recipe: "standard" as const,
  sortIndex: 1,
  latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
  config: pipelineConfig,
};
const canonicalConfigDigest = hashParityValue(canonicalConfig);
const launchEnvelope = {
  recipeSettings: { recipe: "mod-swooper-maps/standard", seed: 1234 },
  worldSettings: { mapSize: "MAPSIZE_TINY" },
  setupConfig: { gameOptions: {}, playerOptions: [] },
  source: {
    kind: "catalog" as const,
    sourcePath: "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
    canonicalConfig,
  },
};
const launchEnvelopeDigest = hashParityValue(launchEnvelope);
const nativeRiverMetadataReadbackReason =
  "Native Civ river-type metadata readback is available after TerrainBuilder.modelRivers; exact Hydrology minor-river parity must compare planned minor intent to engineMinorRiverMask.";
const fileIdentity = {
  path: "/tmp/swooper-earthlike.js",
  sha256: "sha256",
  sizeBytes: 128,
  mtimeMs: 1,
  mtimeIso: "2026-06-06T00:00:00.000Z",
} as const;

const requestGeneratedMaterialization = {
  mapScript: "{swooper-maps}/maps/studio-run.js",
  canonicalConfigDigest,
  launchEnvelopeDigest,
  generationManifestDigest: "generation-manifest-1",
  runArtifactId: "run-artifact-1",
  generatedModRoot: "/tmp/swooper-studio-run/run-artifact-1",
  generatedModFileCount: 4,
  generatedModDigest: "generated-mod-digest-1",
  mapRowId: "MAP_STUDIO_RUN",
  localModScript: fileIdentity,
  deployedModScript: fileIdentity,
  localModScriptContent: { path: fileIdentity.path, markers: [] },
  deployedModScriptContent: { path: fileIdentity.path, markers: [] },
} as const;

test("local final-surface replay uses Civ runtime latitude orientation", () => {
  const { latitudeBounds, mapInfo } = createFinalSurfaceParityMapInfo(84, 54);

  expect(mapInfo.MinLatitude).toBe(-90);
  expect(mapInfo.MaxLatitude).toBe(90);
  expect(latitudeBounds).toEqual({ topLatitude: 90, bottomLatitude: -90 });
});

test("local final-surface replay uses supplied frozen envelope bounds without changing live map info", () => {
  const frozenEnvelope = {
    id: "opaque-studio-envelope",
    latitudeBounds: { topLatitude: 63, bottomLatitude: -27 },
  } as const;
  const defaultReplay = createFinalSurfaceParityMapInfo(84, 54);
  const frozenReplay = createFinalSurfaceParityMapInfo(84, 54, frozenEnvelope.latitudeBounds);

  expect(frozenReplay.latitudeBounds).toEqual(frozenEnvelope.latitudeBounds);
  expect(frozenReplay.latitudeBounds).not.toEqual(defaultReplay.latitudeBounds);
  expect(frozenReplay.mapInfo).toEqual(defaultReplay.mapInfo);
});

function exactEvidence(
  overrides: Partial<CompleteExactAuthorshipEvidence> = {}
): CompleteExactAuthorshipEvidence {
  return {
    status: "complete",
    requestId: "run-1",
    createdAt: "2026-06-06T00:00:00.000Z",
    unresolvedLinks: [],
    sourceSnapshot: {
      requestId: "run-1",
      source: {
        kind: "catalog",
        sourcePath: "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
      },
      canonicalConfigDigest: hashParityValue(canonicalConfig),
      launchEnvelopeDigest: launchEnvelopeDigest,
    },
    request: {
      recipeId: "mod-swooper-maps/standard",
      seed: 1234,
      mapSize: "MAPSIZE_TINY",
    },
    materialization: requestGeneratedMaterialization,
    civSetup: {
      mapScript: requestGeneratedMaterialization.mapScript,
      mapSize: "MAPSIZE_TINY",
      mapSeed: 1234,
      gameSeed: 1234,
      rowCount: 1,
    },
    runtime: {
      seed: 1234,
      width: 2,
      height: 1,
      plotCount: 2,
      turn: 1,
      gameHash: 99,
      sourceSnapshotId: "live-runtime:1",
      snapshotHash: "runtime-hash-1",
    },
    log: {
      requestId: "run-1",
      canonicalConfigDigest,
      launchEnvelopeDigest,
      seed: 1234,
      dimensions: { width: 2, height: 1 },
      evidencePayload: {},
      completionPayload: {},
      matched: [],
      resourcePlacement: {
        coordinateEvidence: {
          version: 1,
          placed: { count: 2, hash32: "aaaaaaaa" },
          rejected: { count: 0, hash32: "811c9dc5" },
          mismatch: { count: 0, hash32: "811c9dc5" },
        },
      },
    },
    ...overrides,
  };
}

function snapshot(args: {
  source: "local-mapgen" | "live-civ7";
  feature?: ReadonlyArray<number | null>;
  gameHash?: number;
  omitted?: number;
  localTerrain?: ReadonlyArray<number | null>;
  riverMetadata?: FinalSurfaceSnapshot["riverMetadata"];
  nativeRiverObjects?: FinalSurfaceSnapshot["nativeRiverObjects"];
  lakeReadback?: {
    acceptedLakeTileCount: number;
    finalLakeWaterDriftCount: number;
    finalLakeClassificationDriftCount: number;
  };
  featureApplyDiagnostics?: {
    attemptedByFeature?: Record<string, number>;
    appliedByFeature?: Record<string, number>;
    rejectedCanHaveFeatureByFeature?: Record<string, number>;
  };
  resourceCoordinateEvidence?: boolean;
  resourceRejectionContext?: boolean;
  naturalWonderPlan?: "matching" | "diverged";
  naturalWonderPlanInput?: "matching" | "diverged";
  naturalWonderPlanInputSurfaceDigests?: "matching" | "diverged";
}): FinalSurfaceSnapshot {
  const width = 2;
  const height = 1;
  const localEvidence = {
    ...(args.naturalWonderPlan
      ? {
          naturalWonderPlan: {
            width,
            height,
            wondersCount: 1,
            targetCount: 1,
            plannedCount: 1,
            placements: [
              {
                plotIndex: args.naturalWonderPlan === "diverged" ? 0 : 1,
                featureType: 30,
                direction: 0,
                elevation: args.naturalWonderPlan === "diverged" ? 3 : 4,
                priority: args.naturalWonderPlan === "diverged" ? 0.25 : 0.5,
              },
            ],
          },
        }
      : {}),
    ...(args.naturalWonderPlanInput
      ? {
          naturalWonderPlanInput: {
            type: "naturalWonder.planInput",
            version: 1,
            plannedCount: 1,
            ...(args.naturalWonderPlanInputSurfaceDigests
              ? {
                  surfaceDigests: {
                    version: 1,
                    plotCount: 2,
                    landMaskHash32: "aaaaaaaa",
                    elevationHash32:
                      args.naturalWonderPlanInputSurfaceDigests === "diverged"
                        ? "bbbbbbbb"
                        : "22222222",
                    aridityPpmHash32:
                      args.naturalWonderPlanInputSurfaceDigests === "diverged"
                        ? "cccccccc"
                        : "33333333",
                    riverClassHash32: "44444444",
                    lakeMaskHash32: "55555555",
                    blockedMaskHash32: "66666666",
                    terrainTypeHash32: "77777777",
                    biomeTypeHash32: "88888888",
                    featureTypeHash32: "99999999",
                  },
                }
              : {}),
            inputRows: [
              args.naturalWonderPlanInput === "diverged"
                ? ["p", 0, 0, 0, 30, 2, 3, -1, 3, 250000, 1, 0, 0, 1]
                : ["p", 1, 1, 0, 30, 2, 3, -1, 4, 500000, 1, 0, 0, 1],
            ],
          },
        }
      : {}),
    ...(args.resourceCoordinateEvidence
      ? {
          resourcePlacementOutcomes: {
            summary: {
              coordinateEvidence: {
                version: 1,
                placed: { count: 2, hash32: "aaaaaaaa" },
                rejected: { count: 0, hash32: "811c9dc5" },
                mismatch: { count: 0, hash32: "811c9dc5" },
              },
            },
          },
        }
      : {}),
    ...(args.resourceRejectionContext
      ? {
          resourcePlan: {
            siteSpacingTiles: 3,
            intents: [
              {
                plotIndex: 1,
                resourceType: "RESOURCE_GOLD",
                resourceTypeId: 13,
                family: "geological",
                laneId: "orogenic-hydrothermal",
                phase: "rotation",
                order: 0,
                inHabitat: true,
              },
            ],
          },
          resourcePlacementOutcomes: {
            summary: {
              coordinateEvidence: {
                version: 1,
                placed: { count: 2, hash32: "aaaaaaaa" },
                rejected: { count: 0, hash32: "811c9dc5" },
                mismatch: { count: 0, hash32: "811c9dc5" },
              },
            },
            outcomes: [
              {
                plotIndex: 1,
                status: "placed",
                resourceType: 46,
                observedResourceType: 46,
              },
            ],
          },
        }
      : {}),
    ...(args.lakeReadback
      ? {
          terrainProjection: {
            placementSurfacePreparation: args.lakeReadback,
          },
        }
      : {}),
    ...(args.featureApplyDiagnostics
      ? {
          featureApplyDiagnostics: args.featureApplyDiagnostics,
        }
      : {}),
  };
  return {
    source: args.source,
    width,
    height,
    seed: 1234,
    canonicalConfigDigest,
    launchEnvelopeDigest,
    surfaces: {
      terrain: { width, height, values: args.localTerrain ?? [1, 2] },
      biome: { width, height, values: [3, 4] },
      feature: { width, height, values: args.feature ?? [5, 6] },
      resource: { width, height, values: [7, 8] },
    },
    ...(args.riverMetadata === undefined ? {} : { riverMetadata: args.riverMetadata }),
    ...(args.nativeRiverObjects === undefined
      ? {}
      : { nativeRiverObjects: args.nativeRiverObjects }),
    evidence:
      args.source === "live-civ7"
        ? {
            runtime: {
              turn: 1,
              gameHash: args.gameHash ?? 99,
              width,
              height,
              seed: 1234,
              plotCount: 2,
            },
            fullGrid: {
              plotCount: 2,
              omitted: args.omitted ?? 0,
              chunks: [
                { bounds: { x: 0, y: 0, width, height }, plotCount: 2, omitted: args.omitted ?? 0 },
              ],
              identityCheck: {
                stable: true,
                checked: [
                  "map.width",
                  "map.height",
                  "map.plotCount",
                  "map.randomSeed",
                  "game.turn",
                  "game.hash",
                ],
              },
            },
          }
        : localEvidence,
  };
}

function riverMetadata(args: {
  projected?: ReadonlyArray<number | null>;
  terrain?: ReadonlyArray<number | null>;
  riverType?: ReadonlyArray<number | null>;
  river?: ReadonlyArray<number | null>;
  navigable?: ReadonlyArray<number | null>;
  minor?: ReadonlyArray<number | null>;
  minorRiverStampingSupported?: boolean;
  minorRiverUnsupportedReason?: string;
}): FinalSurfaceSnapshot["riverMetadata"] {
  const width = 2;
  const height = 1;
  const grid = (values: ReadonlyArray<number | null> | undefined) =>
    values === undefined ? undefined : { width, height, values };
  return {
    width,
    height,
    ...(grid(args.projected) === undefined
      ? {}
      : { projectedNavigableTerrain: grid(args.projected) }),
    ...(grid(args.terrain) === undefined ? {} : { terrainNavigableRiver: grid(args.terrain) }),
    ...(grid(args.riverType) === undefined ? {} : { riverType: grid(args.riverType) }),
    ...(grid(args.river) === undefined ? {} : { river: grid(args.river) }),
    ...(grid(args.navigable) === undefined ? {} : { navigableRiver: grid(args.navigable) }),
    ...(grid(args.minor) === undefined ? {} : { minorRiver: grid(args.minor) }),
    ...(args.minorRiverStampingSupported === undefined
      ? {}
      : { minorRiverStampingSupported: args.minorRiverStampingSupported }),
    ...(args.minorRiverUnsupportedReason === undefined
      ? {}
      : { minorRiverUnsupportedReason: args.minorRiverUnsupportedReason }),
  };
}

function nativeRiverObjects(numRivers: number): FinalSurfaceSnapshot["nativeRiverObjects"] {
  return {
    exists: true,
    numRivers,
    sampleCount: numRivers > 0 ? 1 : 0,
    ...(numRivers > 0
      ? {
          samples: [
            {
              index: 0,
              riverType: RIVER_TYPE_NAVIGABLE,
              plotCount: 3,
              connectedToOcean: true,
            },
          ],
        }
      : {}),
  };
}

describe("final-surface parity evidence", () => {
  test("reports river metadata parity with planned minor and major masks separated", () => {
    const localRiverMetadata: FinalSurfaceSnapshot["riverMetadata"] = {
      width: 2,
      height: 1,
      plannedMinorRiver: { width: 2, height: 1, values: [1, 0] },
      plannedMajorRiver: { width: 2, height: 1, values: [0, 1] },
      projectedNavigableTerrain: { width: 2, height: 1, values: [0, 1] },
      minorRiverStampingSupported: true,
      minorRiverUnsupportedReason: nativeRiverMetadataReadbackReason,
    };
    const liveRiverMetadata: FinalSurfaceSnapshot["riverMetadata"] = {
      width: 2,
      height: 1,
      terrainNavigableRiver: { width: 2, height: 1, values: [0, 1] },
      riverType: {
        width: 2,
        height: 1,
        values: [RIVER_TYPE_MINOR, RIVER_TYPE_NAVIGABLE],
      },
      river: { width: 2, height: 1, values: [1, 1] },
      navigableRiver: { width: 2, height: 1, values: [0, 1] },
      minorRiver: { width: 2, height: 1, values: [1, 0] },
    };

    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence(),
      local: snapshot({
        source: "local-mapgen",
        resourceCoordinateEvidence: true,
        riverMetadata: localRiverMetadata,
      }),
      live: snapshot({
        source: "live-civ7",
        riverMetadata: liveRiverMetadata,
        nativeRiverObjects: nativeRiverObjects(1),
      }),
      now: () => new Date("2026-06-06T00:00:00.000Z"),
    });

    expect(evidence.status).toBe("complete");
    expect(evidence.riverMetadataParity).toMatchObject({
      status: "match",
      plannedMinorRiverTileCount: 1,
      plannedMajorRiverTileCount: 1,
      projectedNavigableTerrainTileCount: 1,
      liveTerrainNavigableRiverTileCount: 1,
      liveRiverTileCount: 2,
      liveNavigableRiverTileCount: 1,
      liveMinorRiverTileCount: 1,
      liveMinorOnPlannedMinorCount: 1,
      liveMinorOffPlannedMinorCount: 0,
      plannedMinorWithoutLiveMinorCount: 0,
      plannedMinorVsLiveMinorMismatchCount: 0,
      minorRiverStampingSupported: true,
      minorRiverUnsupportedReason: nativeRiverMetadataReadbackReason,
    });
    expect(evidence.unresolvedLinks).toEqual([]);
    expect(evidence.verificationClaims.claims["exact-authorship"].status).toBe("pass");
    expect(evidence.verificationClaims.claims["terrain-readback"].status).toBe("pass");
    expect(evidence.verificationClaims.claims["metadata-readback"].status).toBe("pass");
    expect(evidence.verificationClaims.claims["civ-rendered"]).toMatchObject({
      status: "unresolved",
    });
    expect(evidence.verificationClaims.claims["product-acceptance"]).toMatchObject({
      status: "unresolved",
    });
  });

  test("fails metadata parity when native minor rivers do not match planned minor truth", () => {
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence(),
      local: snapshot({
        source: "local-mapgen",
        resourceCoordinateEvidence: true,
        riverMetadata: {
          width: 2,
          height: 1,
          plannedMinorRiver: { width: 2, height: 1, values: [1, 0] },
          plannedMajorRiver: { width: 2, height: 1, values: [0, 0] },
          projectedNavigableTerrain: { width: 2, height: 1, values: [0, 0] },
          minorRiverStampingSupported: true,
          minorRiverUnsupportedReason: nativeRiverMetadataReadbackReason,
        },
      }),
      live: snapshot({
        source: "live-civ7",
        riverMetadata: {
          width: 2,
          height: 1,
          terrainNavigableRiver: { width: 2, height: 1, values: [0, 0] },
          riverType: {
            width: 2,
            height: 1,
            values: [NO_RIVER_TYPE, RIVER_TYPE_MINOR],
          },
          river: { width: 2, height: 1, values: [0, 1] },
          navigableRiver: { width: 2, height: 1, values: [0, 0] },
          minorRiver: { width: 2, height: 1, values: [0, 1] },
        },
        nativeRiverObjects: nativeRiverObjects(1),
      }),
      now: () => new Date("2026-06-06T00:00:00.000Z"),
    });

    expect(evidence.status).toBe("complete");
    expect(evidence.riverMetadataParity).toMatchObject({
      status: "terrain-match-metadata-divergent",
      plannedMinorRiverTileCount: 1,
      liveMinorRiverTileCount: 1,
      liveMinorOnPlannedMinorCount: 0,
      liveMinorOffPlannedMinorCount: 1,
      plannedMinorWithoutLiveMinorCount: 1,
      plannedMinorVsLiveMinorMismatchCount: 2,
      projectedVsLiveTerrainMismatchCount: 0,
      projectedVsLiveMetadataMismatchCount: 0,
      liveTerrainVsMetadataMismatchCount: 0,
    });
    expect(evidence.riverMetadataParity?.examples).toEqual([
      expect.objectContaining({
        x: 0,
        y: 0,
        plannedMinorRiver: 1,
        liveMinorRiver: 0,
      }),
      expect.objectContaining({
        x: 1,
        y: 0,
        plannedMinorRiver: 0,
        liveMinorRiver: 1,
      }),
    ]);
    expect(evidence.verificationClaims.claims["terrain-readback"]).toMatchObject({
      status: "pass",
    });
    expect(evidence.verificationClaims.claims["metadata-readback"]).toMatchObject({
      status: "fail",
      evidenceLinks: ["river-metadata.terrain-match-metadata-divergent"],
    });
  });

  test("marks a fully bound matching grid complete", () => {
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence(),
      local: snapshot({ source: "local-mapgen", resourceCoordinateEvidence: true }),
      live: snapshot({ source: "live-civ7" }),
      now: () => new Date("2026-06-06T00:00:00.000Z"),
    });

    expect(evidence.status).toBe("complete");
    expect(evidence.resourcePlacementCoordinateEvidence).toMatchObject({
      status: "match",
      mismatchedLinks: [],
      local: {
        placed: { count: 2, hash32: "aaaaaaaa" },
        rejected: { count: 0, hash32: "811c9dc5" },
      },
      exact: {
        placed: { count: 2, hash32: "aaaaaaaa" },
        rejected: { count: 0, hash32: "811c9dc5" },
      },
    });
    expect(evidence.unresolvedLinks).toEqual([]);
    expect(evidence.diffs.every((diff) => diff.status === "match")).toBe(true);
  });

  test("reports local final lake readback even when exact authorship lacks lake counters", () => {
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence(),
      local: snapshot({
        source: "local-mapgen",
        resourceCoordinateEvidence: true,
        lakeReadback: {
          acceptedLakeTileCount: 63,
          finalLakeWaterDriftCount: 0,
          finalLakeClassificationDriftCount: 0,
        },
      }),
      live: snapshot({ source: "live-civ7" }),
    });

    expect(evidence.status).toBe("complete");
    expect(evidence.lakeReadbackParity).toEqual({
      status: "missing-exact-log",
      local: {
        acceptedLakeTileCount: 63,
        finalLakeWaterDriftCount: 0,
        finalLakeClassificationDriftCount: 0,
      },
      mismatchedFields: [],
    });
    expect(evidence.verificationClaims.claims["lake-final"]).toMatchObject({
      status: "unresolved",
      evidenceLinks: ["lake-readback.exact-log"],
    });
    expect(evidence.unresolvedLinks).toEqual([]);
  });

  test("passes lake-final when exact and local final lake counters match with zero drift", () => {
    const baseExact = exactEvidence();
    const lakeReadback = {
      acceptedLakeTileCount: 63,
      finalLakeWaterDriftCount: 0,
      finalLakeClassificationDriftCount: 0,
    };
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence({
        log: {
          ...baseExact.log,
          placementSurfacePreparation: lakeReadback,
        },
      }),
      local: snapshot({
        source: "local-mapgen",
        resourceCoordinateEvidence: true,
        lakeReadback,
      }),
      live: snapshot({ source: "live-civ7" }),
    });

    expect(evidence.status).toBe("complete");
    expect(evidence.lakeReadbackParity).toEqual({
      status: "match",
      local: lakeReadback,
      exact: lakeReadback,
      mismatchedFields: [],
    });
    expect(evidence.verificationClaims.claims["lake-final"]).toMatchObject({
      status: "pass",
      evidenceLinks: ["lakeReadbackParity"],
    });
    expect(evidence.unresolvedLinks).toEqual([]);
  });

  test("blocks parity when exact and local lake readback counters diverge", () => {
    const baseExact = exactEvidence();
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence({
        log: {
          ...baseExact.log,
          placementSurfacePreparation: {
            acceptedLakeTileCount: 63,
            finalLakeWaterDriftCount: 1,
            finalLakeClassificationDriftCount: 0,
          },
        },
      }),
      local: snapshot({
        source: "local-mapgen",
        resourceCoordinateEvidence: true,
        lakeReadback: {
          acceptedLakeTileCount: 63,
          finalLakeWaterDriftCount: 0,
          finalLakeClassificationDriftCount: 0,
        },
      }),
      live: snapshot({ source: "live-civ7" }),
    });

    expect(evidence.status).toBe("unresolved");
    expect(evidence.lakeReadbackParity).toEqual({
      status: "mismatch",
      local: {
        acceptedLakeTileCount: 63,
        finalLakeWaterDriftCount: 0,
        finalLakeClassificationDriftCount: 0,
      },
      exact: {
        acceptedLakeTileCount: 63,
        finalLakeWaterDriftCount: 1,
        finalLakeClassificationDriftCount: 0,
      },
      mismatchedFields: ["finalLakeWaterDriftCount"],
    });
    expect(evidence.verificationClaims.claims["lake-final"]).toMatchObject({
      status: "fail",
      evidenceLinks: ["lake-readback.finalLakeWaterDriftCount"],
    });
    expect(evidence.unresolvedLinks).toContain("lake-readback.mismatch");
  });

  test("passes active floodplain evidence when exact/local counters agree and live features match", () => {
    const baseExact = exactEvidence();
    const floodplainFeature = CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_PLAINS_FLOODPLAIN_MINOR;
    const forestFeature = CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_FOREST;
    const featureApply = {
      attemptedByFeature: { FEATURE_PLAINS_FLOODPLAIN_MINOR: 2, FEATURE_FOREST: 1 },
      appliedByFeature: { FEATURE_PLAINS_FLOODPLAIN_MINOR: 2, FEATURE_FOREST: 1 },
      rejectedCanHaveFeatureByFeature: {},
    };
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence({
        log: {
          ...baseExact.log,
          featureApply: {
            stats: {
              attempted: 3,
              applied: 3,
              rejected: 0,
              rejectedCanHaveFeature: 0,
              ...featureApply,
            },
          },
        },
      }),
      local: snapshot({
        source: "local-mapgen",
        resourceCoordinateEvidence: true,
        feature: [floodplainFeature, forestFeature],
        featureApplyDiagnostics: featureApply,
      }),
      live: snapshot({ source: "live-civ7", feature: [floodplainFeature, forestFeature] }),
    });

    expect(evidence.status).toBe("complete");
    expect(evidence.floodplainActiveParity).toEqual({
      status: "active-live-match",
      local: {
        attemptedFloodplainFeatureCount: 2,
        appliedFloodplainFeatureCount: 2,
        rejectedFloodplainFeatureCount: 0,
      },
      exact: {
        attemptedFloodplainFeatureCount: 2,
        appliedFloodplainFeatureCount: 2,
        rejectedFloodplainFeatureCount: 0,
      },
      featureSurfaceStatus: "match",
      mismatchedFields: [],
    });
    expect(evidence.verificationClaims.claims["floodplain-active"]).toMatchObject({
      status: "pass",
      evidenceLinks: ["floodplainActiveParity"],
    });
    expect(evidence.unresolvedLinks).not.toContain("floodplain-active.mismatch");
  });

  test("keeps zero floodplain rows as inactive controls rather than product passes", () => {
    const baseExact = exactEvidence();
    const featureApply = {
      attemptedByFeature: { FEATURE_FOREST: 1 },
      appliedByFeature: { FEATURE_FOREST: 1 },
      rejectedCanHaveFeatureByFeature: {},
    };
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence({
        log: {
          ...baseExact.log,
          featureApply: {
            stats: {
              attempted: 1,
              applied: 1,
              rejected: 0,
              rejectedCanHaveFeature: 0,
              ...featureApply,
            },
          },
        },
      }),
      local: snapshot({
        source: "local-mapgen",
        resourceCoordinateEvidence: true,
        featureApplyDiagnostics: featureApply,
      }),
      live: snapshot({ source: "live-civ7" }),
    });

    expect(evidence.floodplainActiveParity).toMatchObject({
      status: "inactive-control",
      local: {
        attemptedFloodplainFeatureCount: 0,
        appliedFloodplainFeatureCount: 0,
        rejectedFloodplainFeatureCount: 0,
      },
      exact: {
        attemptedFloodplainFeatureCount: 0,
        appliedFloodplainFeatureCount: 0,
        rejectedFloodplainFeatureCount: 0,
      },
    });
    expect(evidence.verificationClaims.claims["floodplain-active"]).toMatchObject({
      status: "out-of-scope",
      evidenceLinks: ["floodplain-active.inactive-control"],
    });
  });

  test("fails active floodplain evidence when live feature readback diverges", () => {
    const baseExact = exactEvidence();
    const floodplainFeature =
      CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE;
    const forestFeature = CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_FOREST;
    const featureApply = {
      attemptedByFeature: { FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE: 1 },
      appliedByFeature: { FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE: 1 },
      rejectedCanHaveFeatureByFeature: {},
    };
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence({
        log: {
          ...baseExact.log,
          featureApply: {
            stats: {
              attempted: 1,
              applied: 1,
              rejected: 0,
              rejectedCanHaveFeature: 0,
              ...featureApply,
            },
          },
        },
      }),
      local: snapshot({
        source: "local-mapgen",
        resourceCoordinateEvidence: true,
        feature: [floodplainFeature, forestFeature],
        featureApplyDiagnostics: featureApply,
      }),
      live: snapshot({ source: "live-civ7", feature: [0, forestFeature] }),
    });

    expect(evidence.status).toBe("unresolved");
    expect(evidence.floodplainActiveParity).toMatchObject({
      status: "live-feature-mismatch",
      featureSurfaceStatus: "mismatch",
    });
    expect(evidence.verificationClaims.claims["floodplain-active"]).toMatchObject({
      status: "fail",
      evidenceLinks: ["floodplain-active.live-feature-mismatch"],
    });
    expect(evidence.unresolvedLinks).toContain("floodplain-active.live-feature-mismatch");
  });

  test("keeps parity unresolved when local resource coordinate evidence lacks matching exact log evidence", () => {
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence({
        log: {
          requestId: "run-1",
          canonicalConfigDigest,
          launchEnvelopeDigest,
          seed: 1234,
          dimensions: { width: 2, height: 1 },
        },
      }),
      local: snapshot({ source: "local-mapgen", resourceCoordinateEvidence: true }),
      live: snapshot({ source: "live-civ7" }),
    });

    expect(evidence.status).toBe("unresolved");
    expect(evidence.resourcePlacementCoordinateEvidence).toMatchObject({
      status: "missing-exact-log",
      mismatchedLinks: ["resource-placement-coordinate-evidence.log"],
    });
    expect(evidence.unresolvedLinks).toContain("resource-placement-coordinate-evidence.log");
  });

  test("reports river terrain and metadata parity as a separate evidence class", () => {
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence(),
      local: snapshot({
        source: "local-mapgen",
        resourceCoordinateEvidence: true,
        riverMetadata: riverMetadata({
          projected: [1, 0],
          minorRiverStampingSupported: true,
          minorRiverUnsupportedReason: nativeRiverMetadataReadbackReason,
        }),
      }),
      live: snapshot({
        source: "live-civ7",
        riverMetadata: riverMetadata({
          terrain: [1, 0],
          riverType: [NO_RIVER_TYPE, NO_RIVER_TYPE],
          river: [0, 0],
          navigable: [0, 0],
          minor: [0, 0],
        }),
        nativeRiverObjects: nativeRiverObjects(1),
      }),
    });

    expect(evidence.status).toBe("complete");
    expect(evidence.riverMetadataParity).toMatchObject({
      status: "terrain-match-metadata-divergent",
      compared: 2,
      projectedNavigableTerrainTileCount: 1,
      liveTerrainNavigableRiverTileCount: 1,
      liveRiverTileCount: 0,
      liveNavigableRiverTileCount: 0,
      liveMinorRiverTileCount: 0,
      projectedVsLiveTerrainMismatchCount: 0,
      projectedVsLiveMetadataMismatchCount: 1,
      liveTerrainVsMetadataMismatchCount: 1,
      minorRiverStampingSupported: true,
      minorRiverUnsupportedReason: nativeRiverMetadataReadbackReason,
    });
    expect(evidence.verificationClaims.claims["terrain-readback"]).toMatchObject({
      status: "pass",
    });
    expect(evidence.verificationClaims.claims["metadata-readback"]).toMatchObject({
      status: "fail",
      evidenceLinks: ["river-metadata.terrain-match-metadata-divergent"],
    });
    expect(evidence.verificationClaims.claims["civ-rendered"]).toMatchObject({
      status: "unresolved",
    });
    expect(evidence.verificationClaims.claims["product-acceptance"]).toMatchObject({
      status: "unresolved",
    });
    expect(evidence.unresolvedLinks).not.toContain("river-metadata.mismatch");
    expect(evidence.residuals.find((residual) => residual.key === "rivers")).toMatchObject({
      status: "covered-by-terrain-grid",
    });
  });

  test("blocks river metadata closure when native MapRivers objects are absent", () => {
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence(),
      local: snapshot({
        source: "local-mapgen",
        resourceCoordinateEvidence: true,
        riverMetadata: riverMetadata({
          projected: [1, 0],
          minorRiverStampingSupported: true,
          minorRiverUnsupportedReason: nativeRiverMetadataReadbackReason,
        }),
      }),
      live: snapshot({
        source: "live-civ7",
        riverMetadata: riverMetadata({
          terrain: [1, 0],
          riverType: [RIVER_TYPE_NAVIGABLE, NO_RIVER_TYPE],
          river: [1, 0],
          navigable: [1, 0],
          minor: [0, 0],
        }),
        nativeRiverObjects: nativeRiverObjects(0),
      }),
    });

    expect(evidence.status).toBe("unresolved");
    expect(evidence.riverMetadataParity).toMatchObject({
      status: "match",
      nativeRiverObjectReadbackStatus: "zero-rivers",
      nativeRiverObjectCount: 0,
      nativeRiverObjectSampleCount: 0,
    });
    expect(evidence.verificationClaims.claims["metadata-readback"]).toMatchObject({
      status: "fail",
      evidenceLinks: ["river-metadata.native-river-objects"],
    });
    expect(evidence.unresolvedLinks).toContain("river-metadata.native-river-objects");
  });

  test("blocks river metadata parity when local and live grids have different dimensions", () => {
    const liveRiverMetadata: FinalSurfaceSnapshot["riverMetadata"] = {
      width: 3,
      height: 1,
      terrainNavigableRiver: { width: 3, height: 1, values: [1, 0, 1] },
      riverType: {
        width: 3,
        height: 1,
        values: [NO_RIVER_TYPE, NO_RIVER_TYPE, NO_RIVER_TYPE],
      },
      river: { width: 3, height: 1, values: [0, 0, 0] },
      navigableRiver: { width: 3, height: 1, values: [0, 0, 0] },
      minorRiver: { width: 3, height: 1, values: [0, 0, 0] },
    };

    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence(),
      local: snapshot({
        source: "local-mapgen",
        resourceCoordinateEvidence: true,
        riverMetadata: riverMetadata({
          projected: [1, 0],
          minorRiverStampingSupported: false,
        }),
      }),
      live: snapshot({ source: "live-civ7", riverMetadata: liveRiverMetadata }),
    });

    expect(evidence.status).toBe("unresolved");
    expect(evidence.riverMetadataParity).toMatchObject({
      status: "dimension-mismatch",
      compared: 0,
      projectedNavigableTerrainTileCount: 1,
      liveTerrainNavigableRiverTileCount: 2,
      projectedVsLiveTerrainMismatchCount: 0,
      minorRiverStampingSupported: false,
    });
    expect(evidence.verificationClaims.claims["terrain-readback"].status).toBe("fail");
    expect(evidence.verificationClaims.claims["metadata-readback"].status).toBe("fail");
    expect(evidence.unresolvedLinks).toContain("river-metadata.dimensions");
    expect(evidence.unresolvedLinks).toContain("river-metadata.minor-unsupported-reason");
    expect(evidence.unresolvedLinks).not.toContain("river-metadata.mismatch");
  });

  test("keeps parity unresolved when resource coordinate evidence hash differs", () => {
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence({
        log: {
          requestId: "run-1",
          canonicalConfigDigest,
          launchEnvelopeDigest,
          seed: 1234,
          dimensions: { width: 2, height: 1 },
          resourcePlacement: {
            coordinateEvidence: {
              version: 1,
              placed: { count: 2, hash32: "bbbbbbbb" },
            },
          },
        },
      }),
      local: snapshot({ source: "local-mapgen", resourceCoordinateEvidence: true }),
      live: snapshot({ source: "live-civ7" }),
    });

    expect(evidence.status).toBe("unresolved");
    expect(evidence.resourcePlacementCoordinateEvidence).toMatchObject({
      status: "mismatch",
      mismatchedLinks: ["resource-placement-coordinate-evidence.placed"],
      local: { placed: { count: 2, hash32: "aaaaaaaa" } },
      exact: { placed: { count: 2, hash32: "bbbbbbbb" } },
    });
    expect(evidence.unresolvedLinks).toContain("resource-placement-coordinate-evidence.placed");
  });

  test("compares matching exact and local natural-wonder plan rows", () => {
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence({
        log: {
          requestId: "run-1",
          canonicalConfigDigest,
          launchEnvelopeDigest,
          seed: 1234,
          dimensions: { width: 2, height: 1 },
          naturalWonderPlan: {
            planRows: [
              {
                plotIndex: 1,
                x: 1,
                y: 0,
                featureType: 30,
                direction: 0,
                elevation: 4,
                priorityPpm: 500000,
              },
            ],
          },
        },
      }),
      local: snapshot({ source: "local-mapgen", naturalWonderPlan: "matching" }),
      live: snapshot({ source: "live-civ7" }),
    });

    expect(evidence.naturalWonderPlanCoordinateEvidence).toMatchObject({
      status: "match",
      rowComparisons: [
        {
          featureType: 30,
          classification: "exact-local-same-anchor",
          distance: 0,
          elevationDelta: 0,
          priorityDeltaPpm: 0,
        },
      ],
      mismatchedLinks: [],
    });
    expect(evidence.unresolvedLinks).not.toContain(
      "natural-wonder-plan-coordinate-evidence.planned"
    );
  });

  test("keeps parity unresolved when exact and local natural-wonder plan rows diverge", () => {
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence({
        log: {
          requestId: "run-1",
          canonicalConfigDigest,
          launchEnvelopeDigest,
          seed: 1234,
          dimensions: { width: 2, height: 1 },
          naturalWonderPlan: {
            planRows: [
              {
                plotIndex: 1,
                x: 1,
                y: 0,
                featureType: 30,
                direction: 0,
                elevation: 4,
                priorityPpm: 500000,
              },
            ],
          },
        },
      }),
      local: snapshot({ source: "local-mapgen", naturalWonderPlan: "diverged" }),
      live: snapshot({ source: "live-civ7" }),
    });

    expect(evidence.status).toBe("unresolved");
    expect(evidence.naturalWonderPlanCoordinateEvidence).toMatchObject({
      status: "mismatch",
      rowComparisons: [
        {
          featureType: 30,
          classification: "exact-local-anchor-diverged",
          exact: { plotIndex: 1, x: 1, y: 0, elevation: 4, priorityPpm: 500000 },
          local: { plotIndex: 0, x: 0, y: 0, elevation: 3, priorityPpm: 250000 },
          elevationDelta: 1,
          priorityDeltaPpm: 250000,
        },
      ],
      mismatchedLinks: ["natural-wonder-plan-coordinate-evidence.planned"],
    });
    expect(evidence.unresolvedLinks).toContain("natural-wonder-plan-coordinate-evidence.planned");
  });

  test("compares exact and local natural-wonder plan input context", () => {
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence({
        log: {
          requestId: "run-1",
          canonicalConfigDigest,
          launchEnvelopeDigest,
          seed: 1234,
          dimensions: { width: 2, height: 1 },
          naturalWonderPlanInput: {
            surfaceDigests: {
              version: 1,
              plotCount: 2,
              landMaskHash32: "aaaaaaaa",
              elevationHash32: "22222222",
              aridityPpmHash32: "33333333",
              riverClassHash32: "44444444",
              lakeMaskHash32: "55555555",
              blockedMaskHash32: "66666666",
              terrainTypeHash32: "77777777",
              biomeTypeHash32: "88888888",
              featureTypeHash32: "99999999",
            },
            inputRows: [
              {
                plotIndex: 1,
                x: 1,
                y: 0,
                featureType: 30,
                terrainType: 2,
                biomeType: 3,
                occupiedFeatureType: -1,
                elevation: 4,
                aridityPpm: 500000,
                riverClass: 1,
                lakeMask: 0,
                blockedMask: 0,
                landMask: 1,
              },
            ],
          },
        },
      }),
      local: snapshot({
        source: "local-mapgen",
        naturalWonderPlanInput: "diverged",
        naturalWonderPlanInputSurfaceDigests: "diverged",
      }),
      live: snapshot({ source: "live-civ7" }),
    });

    expect(evidence.naturalWonderPlanInputContextEvidence).toMatchObject({
      status: "compared",
      surfaceDigests: {
        status: "mismatch",
        mismatchedFields: ["elevationHash32", "aridityPpmHash32"],
        exact: {
          elevationHash32: "22222222",
          aridityPpmHash32: "33333333",
        },
        local: {
          elevationHash32: "bbbbbbbb",
          aridityPpmHash32: "cccccccc",
        },
      },
      rowComparisons: [
        {
          featureType: 30,
          classification: "exact-local-anchor-diverged",
          exact: { plotIndex: 1, x: 1, y: 0, elevation: 4, aridityPpm: 500000 },
          local: { plotIndex: 0, x: 0, y: 0, elevation: 3, aridityPpm: 250000 },
          distance: 1,
          inputDelta: {
            elevationDelta: 1,
            aridityPpmDelta: 250000,
          },
        },
      ],
    });
    expect(evidence.unresolvedLinks).not.toContain("natural-wonder-plan-input-context-evidence");
  });

  test("joins exact resource rejection rows to local placement evidence", () => {
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence({
        log: {
          requestId: "run-1",
          canonicalConfigDigest,
          launchEnvelopeDigest,
          seed: 1234,
          dimensions: { width: 2, height: 1 },
          resourcePlacement: {
            stats: {
              rejectionRows: [
                {
                  status: "rejected",
                  resourceType: 16,
                  resource: "RESOURCE_WINE",
                  plotIndex: 1,
                  x: 1,
                  y: 0,
                  reason: "cannot-have-resource",
                  observedResourceType: -1,
                  assignmentPhase: "scarce-floor",
                  assignmentOrder: 85,
                  initialResourceType: 16,
                  preferredResourceType: 4,
                  perTypeCountBefore: 1,
                  legalPlotCountForResource: 313,
                  targetMinPerType: 7,
                },
              ],
            },
            coordinateEvidence: {
              version: 1,
              placed: { count: 1, hash32: "bbbbbbbb" },
              rejected: { count: 1, hash32: "cccccccc" },
            },
          },
        },
      }),
      local: snapshot({ source: "local-mapgen", resourceRejectionContext: true }),
      live: snapshot({ source: "live-civ7" }),
    });

    expect(evidence.status).toBe("unresolved");
    expect(evidence.resourcePlacementRejectionContexts).toEqual([
      {
        exact: {
          status: "rejected",
          resourceType: 16,
          resource: "RESOURCE_WINE",
          plotIndex: 1,
          x: 1,
          y: 0,
          reason: "cannot-have-resource",
          observedResourceType: -1,
          assignmentPhase: "scarce-floor",
          assignmentOrder: 85,
          initialResourceType: 16,
          preferredResourceType: 4,
          perTypeCountBefore: 1,
          legalPlotCountForResource: 313,
          targetMinPerType: 7,
        },
        local: {
          surfaceResourceType: 8,
          preferredPlacement: { preferredResourceType: 4 },
          outcome: { status: "placed", resourceType: 46, observedResourceType: 46 },
          planIntent: {
            resourceType: 4,
            resourceTypeName: "RESOURCE_GOLD",
            phase: "rotation",
            family: "geological",
            laneId: "orogenic-hydrothermal",
            inHabitat: true,
          },
        },
      },
    ]);
    expect(evidence.unresolvedLinks).toContain("resource-placement-coordinate-evidence.placed");
    expect(evidence.unresolvedLinks).toContain("resource-placement-coordinate-evidence.rejected");
  });

  test("rejects a source snapshot without provenance and derived envelope digests", () => {
    const exact = exactEvidence({
      sourceSnapshot: {
        requestId: "run-1",
      },
    });

    const validation = parseCompleteExactAuthorshipEvidencePacket(exact);
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exact,
      local: snapshot({ source: "local-mapgen" }),
      live: snapshot({ source: "live-civ7" }),
    });

    expect(validation.unresolvedLinks).toEqual(["exact-authorship-evidence.invalid"]);
    expect(evidence.status).toBe("unresolved");
    expect(evidence.verificationClaims.claims["exact-authorship"]).toMatchObject({
      status: "unresolved",
    });
    expect(evidence.unresolvedLinks).toContain("exact-authorship-evidence.invalid");
  });

  test("validates production-shape exact authorship without a duplicated launch envelope", () => {
    const validation = parseCompleteExactAuthorshipEvidencePacket(exactEvidence());

    expect(validation.unresolvedLinks).toEqual([]);
  });

  test.each([
    [
      "generation manifest digest",
      "generationManifestDigest",
      "exact-authorship-evidence.materialization.generation-manifest-digest",
    ],
    [
      "run artifact id",
      "runArtifactId",
      "exact-authorship-evidence.materialization.run-artifact-id",
    ],
    [
      "generated root",
      "generatedModRoot",
      "exact-authorship-evidence.materialization.generated-mod-root",
    ],
    [
      "generated file count",
      "generatedModFileCount",
      "exact-authorship-evidence.materialization.generated-mod-file-count",
    ],
    [
      "generated tree digest",
      "generatedModDigest",
      "exact-authorship-evidence.materialization.generated-mod-digest",
    ],
    ["map row id", "mapRowId", "exact-authorship-evidence.materialization.map-row-id"],
    [
      "local executable",
      "localModScript",
      "exact-authorship-evidence.materialization.local-mod-script",
    ],
    [
      "deployed executable",
      "deployedModScript",
      "exact-authorship-evidence.materialization.deployed-mod-script",
    ],
  ] as const)("blocks request-generated packets missing the %s", (_label, field, _link) => {
    const validation = parseCompleteExactAuthorshipEvidencePacket(
      exactEvidence({
        materialization: {
          ...requestGeneratedMaterialization,
          [field]: undefined,
        },
      })
    );

    expect(validation.unresolvedLinks).toEqual(["exact-authorship-evidence.invalid"]);
    expect(validation.unresolvedLinks).not.toContain(
      "exact-authorship-evidence.materialization.source-config"
    );
    expect(validation.unresolvedLinks).not.toContain(
      "exact-authorship-evidence.materialization.generated-source-script"
    );
  });

  test("requires manifest correlation evidence for every parity packet", () => {
    const validation = parseCompleteExactAuthorshipEvidencePacket(
      exactEvidence({
        materialization: {
          mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
          canonicalConfigDigest,
          launchEnvelopeDigest,
          localModScript: fileIdentity,
          deployedModScript: fileIdentity,
        },
      })
    );

    expect(validation.unresolvedLinks).toEqual(["exact-authorship-evidence.invalid"]);
  });

  test("keeps parity unresolved when live runtime hash drifts from exact-authorship evidence", () => {
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence(),
      local: snapshot({ source: "local-mapgen" }),
      live: snapshot({ source: "live-civ7", gameHash: 100 }),
    });

    expect(evidence.status).toBe("unresolved");
    expect(evidence.unresolvedLinks).toContain(
      "exact-authorship-evidence.runtime-game-hash.live-game-hash"
    );
  });

  test("keeps parity unresolved when live full-grid evidence omitted plots", () => {
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence(),
      local: snapshot({ source: "local-mapgen" }),
      live: snapshot({ source: "live-civ7", omitted: 1 }),
    });

    expect(evidence.status).toBe("unresolved");
    expect(evidence.unresolvedLinks).toContain("live.full-grid.omitted");
    expect(evidence.unresolvedLinks).toContain("live.full-grid.chunk-omitted");
  });

  test("keeps parity unresolved when local surface length is not the exact runtime grid", () => {
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence(),
      local: snapshot({ source: "local-mapgen", localTerrain: [1] }),
      live: snapshot({ source: "live-civ7" }),
    });

    expect(evidence.status).toBe("unresolved");
    expect(evidence.unresolvedLinks).toContain("local.terrain.length");
  });

  test("keeps parity unresolved and samples mismatched final surface cells", () => {
    const evidence = buildFinalSurfaceParityReport({
      exactAuthorship: exactEvidence(),
      local: snapshot({ source: "local-mapgen" }),
      live: snapshot({ source: "live-civ7", feature: [5, 9] }),
    });
    const feature = evidence.diffs.find((diff) => diff.key === "feature");

    expect(evidence.status).toBe("unresolved");
    expect(evidence.unresolvedLinks).toContain("surface.feature.mismatch");
    expect(feature?.mismatches).toBe(1);
    expect(feature?.examples[0]).toMatchObject({ x: 1, y: 0, local: 6, live: 9 });
  });
});
