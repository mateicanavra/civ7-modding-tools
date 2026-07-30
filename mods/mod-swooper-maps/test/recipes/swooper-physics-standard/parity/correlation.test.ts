import { describe, expect, spyOn, test } from "bun:test";
import {
  buildStudioRunGenerationManifest,
  buildStudioRunGenerationManifestPayload,
  type StudioRunGenerationManifest,
} from "@civ7/studio-run-workspace";
import { admitStandardMapConfig } from "../../../../src/maps/configs/canonical.js";
import swooperEarthlikeRaw from "../../../../src/maps/configs/swooper-earthlike.config.json";
import {
  admitStandardExactParityCapture,
  resolveStandardParityReplayInput,
  runResolvedStandardParityReplay,
} from "../../../../src/recipes/standard/parity/index.js";
import { TEST_GAME_SEED, TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../setup.js";

const PLAYER_COUNT = 6;
const CREATED_AT = "2026-07-25T00:00:00.000Z";
const FILE_IDENTITY = {
  path: "/tmp/studio-run.js",
  sha256: "sha256",
  sizeBytes: 128,
  mtimeMs: 1,
  mtimeIso: CREATED_AT,
} as const;
const CONFIG = admitStandardMapConfig(swooperEarthlikeRaw);

describe("Standard parity correlation", () => {
  test("resolves one replay from matching manifest and exact authorship", () => {
    const manifest = manifestFixture();
    const exact = exactFixture(manifest);

    const resolution = resolveStandardParityReplayInput({
      exactAuthorship: exact,
      manifest,
    });

    expect(resolution.status).toBe("ready");
    if (resolution.status !== "ready") return;
    expect(Object.isFrozen(resolution.replayAuthority)).toBe(true);
    expect(resolution.exact.naturalWonderPlan).toMatchObject({
      status: "present",
      value: {
        version: 1,
        plannedCount: 0,
        coordinateDigest: { count: 0, hash32: "811c9dc5" },
      },
    });
    expect(resolution.exact.floodplains).toMatchObject({
      status: "present",
      value: {
        attemptedFloodplainFeatureCount: 3,
        appliedFloodplainFeatureCount: 2,
        rejectedFloodplainFeatureCount: 1,
      },
    });
    expect(resolution.exact.placementParity).toEqual({
      status: "present",
      value: {
        version: 1,
        waterDriftCount: 0,
        acceptedLakeTileCount: 2,
        finalLakeWaterDriftCount: 0,
        finalLakeClassificationDriftCount: 0,
      },
    });
    expect(resolution.exact.naturalWonderPlanInput).toMatchObject({
      status: "present",
      value: { version: 2 },
    });
  });

  test("preserves identity contradictions when another correlation link is missing", () => {
    const manifest = manifestFixture();
    const request = exactFixture(manifest).request;
    const { playerCount: _playerCount, ...requestWithoutPlayerCount } = request;
    const exact = exactFixture(manifest, {
      request: {
        ...requestWithoutPlayerCount,
        gameSeed: TEST_GAME_SEED + 1,
      },
    });

    const resolution = resolveStandardParityReplayInput({
      exactAuthorship: exact,
      manifest,
    });

    expect(resolution).toEqual({
      status: "failed",
      failureLinks: ["correlation.game-seed"],
      unresolvedLinks: ["correlation.player-count"],
    });
  });

  test("preserves identity contradictions when the Civ7 preset is unresolved", () => {
    const manifest = manifestFixture({ mapSize: "MAPSIZE_UNKNOWN" });
    const exact = exactFixture(manifest, {
      requestId: "different-request",
      request: {
        ...exactFixture(manifest).request,
        mapSize: "MAPSIZE_UNKNOWN",
      },
    });

    const resolution = resolveStandardParityReplayInput({
      exactAuthorship: exact,
      manifest,
    });

    expect(resolution).toEqual({
      status: "failed",
      failureLinks: ["correlation.request-id"],
      unresolvedLinks: ["correlation.civ7-map-size-preset"],
    });
  });

  test("rejects exact authorship for another recipe before issuing replay authority", () => {
    const manifest = manifestFixture();
    const exact = exactFixture(manifest, {
      request: {
        ...exactFixture(manifest).request,
        recipeId: "not-standard",
      },
    });

    const resolution = resolveStandardParityReplayInput({
      exactAuthorship: exact,
      manifest,
    });

    expect(resolution).toEqual({
      status: "failed",
      failureLinks: ["correlation.recipe-id"],
      unresolvedLinks: [],
    });
  });

  test("refuses a replay authority not issued by correlation", () => {
    const manifest = manifestFixture();
    const resolution = resolveStandardParityReplayInput({
      exactAuthorship: exactFixture(manifest),
      manifest,
    });
    if (resolution.status !== "ready") throw new Error("Expected ready replay correlation.");

    expect(() =>
      runResolvedStandardParityReplay({
        ...resolution,
        replayAuthority: {},
      } as never)
    ).toThrow("requires an authority issued by correlation");
  });

  test("does not synthesize missing floodplain or resource coordinate evidence", () => {
    const manifest = manifestFixture();
    const base = exactFixture(manifest);
    const admission = admitStandardExactParityCapture({
      ...base,
      log: {
        ...base.log,
        featureApply: {
          ...base.log.featureApply,
          stats: {
            attempted: 3,
            applied: 2,
            rejected: 1,
            rejectedCanHaveFeature: 1,
          },
        },
        resourcePlacement: {
          stats: {
            version: 1,
            plannedCount: 1,
            placedCount: 0,
            rejectedCount: 1,
            mismatchCount: 0,
            rejectionRows: [],
          },
          coordinateEvidence: {
            version: 1,
            placed: { count: 0, hash32: "811c9dc5" },
          },
        },
      },
    });

    expect(admission.status).toBe("admitted");
    if (admission.status !== "admitted") return;
    expect(admission.capture.floodplains).toEqual({
      status: "missing",
      evidenceLink: "exact-authorship.log.feature-apply",
    });
    expect(admission.capture.resourcePlacement).toMatchObject({
      status: "present",
      value: {
        rejected: {
          status: "missing",
          evidenceLink: "exact-authorship.log.resource-placement.rejected-coordinates",
        },
        mismatch: { status: "implicit-empty" },
      },
    });
  });

  test("keeps game-seed correlation outside deterministic map generation", () => {
    const log = spyOn(console, "log").mockImplementation(() => {});
    try {
      const firstManifest = manifestFixture({ gameSeed: TEST_GAME_SEED });
      const secondManifest = manifestFixture({ gameSeed: TEST_GAME_SEED + 1 });
      const firstResolution = resolveStandardParityReplayInput({
        exactAuthorship: exactFixture(firstManifest),
        manifest: firstManifest,
      });
      const secondResolution = resolveStandardParityReplayInput({
        exactAuthorship: exactFixture(secondManifest),
        manifest: secondManifest,
      });
      if (firstResolution.status !== "ready" || secondResolution.status !== "ready") {
        throw new Error("Expected both correlated Standard replays to be ready.");
      }

      const first = runResolvedStandardParityReplay(firstResolution);
      const second = runResolvedStandardParityReplay(secondResolution);

      expect(first.identity.gameSeed).toBe(TEST_GAME_SEED);
      expect(second.identity.gameSeed).toBe(TEST_GAME_SEED + 1);
      expect(first.surface).toEqual(second.surface);
      expect(first.hydrology).toEqual(second.hydrology);
      expect(first.placement.naturalWonderPlanEvidence).toEqual(
        second.placement.naturalWonderPlanEvidence
      );
      expect(first.placement.naturalWonderPlanInput).toEqual(
        second.placement.naturalWonderPlanInput
      );
      expect(first.placement.naturalWonderPlanInput).toMatchObject({
        status: "present",
        value: {
          version: 2,
          plannerInput: {
            dimensions: TEST_MAP_SIZE.dimensions,
            surfaceDigests: {
              plotCount: TEST_MAP_SIZE.dimensions.width * TEST_MAP_SIZE.dimensions.height,
            },
          },
        },
      });
    } finally {
      log.mockRestore();
    }
  }, 15_000);

  test("keeps incomplete exact authorship blocked at admission", () => {
    const admission = admitStandardExactParityCapture({
      status: "unresolved",
      requestId: "run-parity",
      createdAt: CREATED_AT,
      request: {},
      materialization: {},
      civSetup: {},
      runtime: {},
      unresolvedLinks: ["runtime.map-surface"],
    });

    expect(admission).toEqual({
      status: "blocked",
      unresolvedLinks: ["exact-authorship.complete", "runtime.map-surface"],
    });
  });
});

function manifestFixture(
  options: Readonly<{ gameSeed?: number; mapSize?: string }> = {}
): StudioRunGenerationManifest {
  return buildStudioRunGenerationManifest(
    buildStudioRunGenerationManifestPayload({
      requestId: "run-parity",
      launchEnvelope: {
        seed: TEST_MAP_SEED,
        gameSeed: options.gameSeed ?? TEST_GAME_SEED,
        worldSettings: {
          mapSize: options.mapSize ?? TEST_MAP_SIZE.id,
          playerCount: PLAYER_COUNT,
        },
        setupConfig: {
          gameOptions: {},
          mapOptions: {},
          playerOptions: [],
        },
        canonicalConfig: CONFIG,
      },
    })
  );
}

function exactFixture(
  manifest: StudioRunGenerationManifest,
  overrides: Readonly<Record<string, unknown>> = {}
) {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const base = {
    status: "complete",
    requestId: manifest.payload.requestId,
    createdAt: CREATED_AT,
    canonicalConfigDigest: manifest.payload.canonicalConfigDigest,
    launchEnvelopeDigest: manifest.payload.launchEnvelopeDigest,
    unresolvedLinks: [],
    request: {
      recipeId: "standard",
      seed: TEST_MAP_SEED,
      gameSeed: manifest.payload.launchEnvelope.gameSeed,
      mapSize: manifest.payload.launchEnvelope.worldSettings.mapSize,
      playerCount: PLAYER_COUNT,
    },
    materialization: {
      mapScript: "{swooper-maps}/maps/studio-run.js",
      canonicalConfigDigest: manifest.payload.canonicalConfigDigest,
      launchEnvelopeDigest: manifest.payload.launchEnvelopeDigest,
      generationManifestDigest: manifest.generationManifestDigest,
      runArtifactId: manifest.payload.runArtifactId,
      generatedModRoot: "/tmp/generated-mod",
      generatedModFileCount: 4,
      generatedModDigest: "generated-mod-digest",
      mapRowId: "MAP_STUDIO_RUN",
      localModScript: FILE_IDENTITY,
      deployedModScript: FILE_IDENTITY,
      localModScriptContent: { path: FILE_IDENTITY.path, markers: [] },
      deployedModScriptContent: { path: FILE_IDENTITY.path, markers: [] },
    },
    civSetup: {
      mapScript: "{swooper-maps}/maps/studio-run.js",
      mapSize: manifest.payload.launchEnvelope.worldSettings.mapSize,
      mapSeed: TEST_MAP_SEED,
      gameSeed: manifest.payload.launchEnvelope.gameSeed,
      playerCount: PLAYER_COUNT,
      rowCount: 1,
    },
    runtime: {
      seed: TEST_MAP_SEED,
      width,
      height,
      plotCount: width * height,
      turn: 1,
      // The public exact-authorship packet still carries this legacy field; parity ignores it.
      gameHash: 99,
      sourceSnapshotId: "live-runtime:1",
      snapshotHash: "runtime-hash",
    },
    log: {
      requestId: manifest.payload.requestId,
      canonicalConfigDigest: manifest.payload.canonicalConfigDigest,
      launchEnvelopeDigest: manifest.payload.launchEnvelopeDigest,
      seed: TEST_MAP_SEED,
      mapSize: manifest.payload.launchEnvelope.worldSettings.mapSize,
      dimensions: { width, height },
      evidencePayload: {},
      completionPayload: {},
      matched: [],
      placementParity: {
        marker: "PLACEMENT_PARITY_V1",
        payload: {
          version: 1,
          waterDriftCount: 0,
          acceptedLakeTileCount: 2,
          finalLakeWaterDriftCount: 0,
          finalLakeClassificationDriftCount: 0,
        },
        version: 1,
        waterDriftCount: 0,
        acceptedLakeTileCount: 2,
        finalLakeWaterDriftCount: 0,
        finalLakeClassificationDriftCount: 0,
      },
      featureApply: {
        stats: {
          attempted: 3,
          applied: 2,
          rejected: 1,
          rejectedCanHaveFeature: 1,
          attemptedByFeature: {
            FEATURE_TROPICAL_FLOODPLAIN_MINOR: 3,
          },
          appliedByFeature: {
            FEATURE_TROPICAL_FLOODPLAIN_MINOR: 2,
          },
          rejectedCanHaveFeatureByFeature: {
            FEATURE_TROPICAL_FLOODPLAIN_MINOR: 1,
          },
        },
      },
      naturalWonderPlan: {
        stats: { version: 1, plannedCount: 0 },
        coordinateEvidence: {
          version: 1,
          planned: { count: 0, hash32: "811c9dc5" },
        },
      },
      naturalWonderPlanInput: {
        marker: "NATURAL_WONDER_PLAN_INPUT_V2",
        payload: {
          version: 2,
          plannerInput: {
            version: 1,
            dimensions: { width, height },
            wondersCount: 0,
            engineConstants: {
              coastTerrainType: 0,
              mountainTerrainType: 1,
              iceFeatureType: 2,
              noFeatureType: -1,
            },
            featureCatalog: {
              count: 0,
              featureTypes: [],
              canonicalHash32: "aaaaaaaa",
            },
            strategy: {
              id: "ranked-plan",
              configCanonicalJson: "{}",
              configHash32: "bbbbbbbb",
            },
            surfaceDigests: {
              version: 1,
              plotCount: width * height,
              landMaskHash32: "11111111",
              elevationHash32: "22222222",
              aridityIndexHash32: "33333333",
              riverClassHash32: "44444444",
              lakeMaskHash32: "55555555",
              vegetationDensityHash32: "66666666",
              effectiveMoistureHash32: "77777777",
              surfaceTemperatureHash32: "88888888",
              fertilityHash32: "99999999",
              dischargeHash32: "aaaaaaaa",
              slopeClassHash32: "bbbbbbbb",
              terrainTypeHash32: "cccccccc",
              biomeTypeHash32: "dddddddd",
              featureTypeHash32: "eeeeeeee",
              naturalWonderBlockedMaskHash32: "ffffffff",
            },
          },
          plannedCount: 0,
          rows: [],
        },
      },
      resourcePlacement: {
        stats: {
          version: 1,
          plannedCount: 0,
          placedCount: 0,
          rejectedCount: 0,
          mismatchCount: 0,
          rejectionRows: [],
        },
        coordinateEvidence: {
          version: 1,
          placed: { count: 0, hash32: "811c9dc5" },
        },
      },
    },
  };
  return {
    ...base,
    ...overrides,
    ...(isRecord(overrides.log) ? { log: { ...base.log, ...overrides.log } } : {}),
  };
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
