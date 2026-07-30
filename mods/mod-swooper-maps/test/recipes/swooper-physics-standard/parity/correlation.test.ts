import { describe, expect, spyOn, test } from "bun:test";
import {
  buildStudioRunGenerationManifest,
  buildStudioRunGenerationManifestPayload,
  type StudioRunGenerationManifest,
} from "@civ7/studio-run-workspace";
import {
  admitStandardMapConfig,
  canonicalRecipeConfig,
} from "../../../../src/maps/configs/canonical.js";
import swooperEarthlikeRaw from "../../../../src/maps/configs/swooper-earthlike.config.json";
import {
  admitStandardExactParityCapture,
  resolveStandardParityReplayInput,
  runResolvedStandardParityReplay,
} from "../../../../src/recipes/standard/parity/index.js";
import {
  issueStandardParityReplayAuthority,
  runStandardParityReplayAuthority,
} from "../../../../src/recipes/standard/parity/replay.js";
import standardRecipe from "../../../../src/recipes/standard/recipe.js";
import { TEST_GAME_SEED, TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../setup.js";
import { createStandardRecipeTestInitialSetup } from "../fixtures/standard-recipe.js";

const ALIVE_MAJOR_PLAYER_IDS = [3, 0, 2, 1] as const;
const PLAYER_COUNT = ALIVE_MAJOR_PLAYER_IDS.length;
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
  test("resolves a partial player override against the exact ordered Standard setup identity", () => {
    const log = spyOn(console, "log").mockImplementation(() => {});
    try {
      const manifest = manifestFixture();
      const recipePlan = recipePlanFixture();
      expect(manifest.payload.launchEnvelope.setupConfig.playerOptions).toEqual([
        { playerId: 0, options: {} },
      ]);
      const resolution = resolveStandardParityReplayInput({
        exactAuthorship: exactFixture(manifest),
        manifest,
      });

      expect(resolution.status).toBe("ready");
      if (resolution.status !== "ready") return;
      expect(Object.isFrozen(resolution.replayAuthority)).toBe(true);
      expect(resolution.exact.recipePlan).toEqual({
        evidence: { status: "present", value: recipePlan },
        completion: { status: "present", value: recipePlan },
      });

      const local = runResolvedStandardParityReplay(resolution);
      expect(local.identity).toMatchObject({
        planFingerprint: recipePlan.planFingerprint,
        mapSeed: TEST_MAP_SEED,
        gameSeed: TEST_GAME_SEED,
        mapSize: TEST_MAP_SIZE.id,
        aliveMajorPlayerIds: ALIVE_MAJOR_PLAYER_IDS,
      });
    } finally {
      log.mockRestore();
    }
  }, 15_000);

  test("blocks replay when either exact recipe-plan lifecycle payload is missing", () => {
    const manifest = manifestFixture();
    expect(
      resolveStandardParityReplayInput({
        exactAuthorship: exactFixture(manifest, {
          log: { evidencePayload: {} },
        }),
        manifest,
      })
    ).toEqual({
      status: "blocked",
      unresolvedLinks: ["exact-authorship.log.evidence-payload.recipe-plan"],
    });
    expect(
      resolveStandardParityReplayInput({
        exactAuthorship: exactFixture(manifest, {
          log: { completionPayload: {} },
        }),
        manifest,
      })
    ).toEqual({
      status: "blocked",
      unresolvedLinks: ["exact-authorship.log.completion-payload.recipe-plan"],
    });
  });

  test("fails correlation when exact recipe-plan lifecycle payloads disagree", () => {
    const manifest = manifestFixture();
    const recipePlan = recipePlanFixture();
    const completionPlan = withInitialSetup(recipePlan, {
      ...recipePlan.initialSetup.value,
      gameSeed: TEST_GAME_SEED + 1,
    });

    expect(
      resolveStandardParityReplayInput({
        exactAuthorship: exactFixture(manifest, {
          log: {
            evidencePayload: { recipePlan },
            completionPayload: { recipePlan: completionPlan },
          },
        }),
        manifest,
      })
    ).toEqual({
      status: "failed",
      failureLinks: ["correlation.recipe-plan-payloads"],
      unresolvedLinks: [],
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
      failureLinks: ["correlation.initial-setup-map-size", "correlation.request-id"],
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
      failureLinks: ["correlation.recipe-id", "correlation.recipe-plan-recipe-id"],
      unresolvedLinks: [],
    });
  });

  test("rejects exact recipe-plan game-seed contradictions", () => {
    const manifest = manifestFixture();
    const recipePlan = recipePlanFixture();
    const contradictoryPlan = inspectRecipePlanForInitialSetup({
      ...recipePlan.initialSetup.value,
      gameSeed: TEST_GAME_SEED + 1,
    });
    const exact = exactFixture(manifest, {
      log: {
        evidencePayload: { recipePlan: contradictoryPlan },
        completionPayload: { recipePlan: contradictoryPlan },
      },
    });

    expect(
      resolveStandardParityReplayInput({
        exactAuthorship: exact,
        manifest,
      })
    ).toEqual({
      status: "failed",
      failureLinks: ["correlation.initial-setup-game-seed"],
      unresolvedLinks: [],
    });
  });

  test.each([
    ["map", "mapSeed", TEST_MAP_SEED + 1, "correlation.civ-setup-map-seed"],
    ["game", "gameSeed", TEST_GAME_SEED + 1, "correlation.civ-setup-game-seed"],
  ] as const)("rejects an applied Civ7 %s seed that contradicts the launch envelope", (_axis, field, contradictorySeed, failureLink) => {
    const manifest = manifestFixture();
    const exact = exactFixture(manifest);

    expect(
      resolveStandardParityReplayInput({
        exactAuthorship: {
          ...exact,
          civSetup: {
            ...exact.civSetup,
            [field]: contradictorySeed,
          },
        },
        manifest,
      })
    ).toEqual({
      status: "failed",
      failureLinks: [failureLink],
      unresolvedLinks: [],
    });
  });

  test("fails resolution when the exact plan fingerprint does not match authentic compilation", () => {
    const manifest = manifestFixture();
    const recipePlan = recipePlanFixture();
    const forgedPlan = { ...recipePlan, planFingerprint: "f".repeat(64) };
    const resolution = resolveStandardParityReplayInput({
      exactAuthorship: exactFixture(manifest, {
        log: {
          evidencePayload: { recipePlan: forgedPlan },
          completionPayload: { recipePlan: forgedPlan },
        },
      }),
      manifest,
    });

    expect(resolution).toEqual({
      status: "failed",
      failureLinks: ["correlation.recipe-plan-fingerprint"],
      unresolvedLinks: [],
    });
  });

  test("never issues replay authority for refinement-invalid exact setup", () => {
    const manifest = manifestFixture();
    const recipePlan = recipePlanFixture();
    const selection = recipePlan.initialSetup.value.map.selection;
    const invalidPlan = withInitialSetup(recipePlan, {
      ...recipePlan.initialSetup.value,
      map: {
        ...recipePlan.initialSetup.value.map,
        selection: {
          ...selection,
          startSlotCapacity: {
            ...selection.startSlotCapacity,
            total: selection.startSlotCapacity.total + 1,
          },
        },
      },
    });

    expect(
      resolveStandardParityReplayInput({
        exactAuthorship: exactFixture(manifest, {
          log: {
            evidencePayload: { recipePlan: invalidPlan },
            completionPayload: { recipePlan: invalidPlan },
          },
        }),
        manifest,
      })
    ).toEqual({
      status: "failed",
      failureLinks: ["correlation.initial-setup-admission"],
      unresolvedLinks: [],
    });
  });

  test("blocks when an authored map option has unavailable exact evidence", () => {
    const manifest = manifestFixture({ mapOptions: { MapSeaLevel: "SEA_LEVEL_NORMAL" } });

    expect(
      resolveStandardParityReplayInput({
        exactAuthorship: exactFixture(manifest),
        manifest,
      })
    ).toEqual({
      status: "blocked",
      unresolvedLinks: ["correlation.map-option.MapSeaLevel"],
    });
  });

  test("blocks when an authored map option is missing exact evidence", () => {
    const manifest = manifestFixture({ mapOptions: { MapSeaLevel: "SEA_LEVEL_NORMAL" } });
    const recipePlan = recipePlanFixture();
    const missingPlan = withInitialSetup(recipePlan, {
      ...recipePlan.initialSetup.value,
      options: {
        ...recipePlan.initialSetup.value.options,
        map: recipePlan.initialSetup.value.options.map.filter(({ key }) => key !== "MapSeaLevel"),
      },
    });

    expect(
      resolveStandardParityReplayInput({
        exactAuthorship: exactFixture(manifest, {
          log: {
            evidencePayload: { recipePlan: missingPlan },
            completionPayload: { recipePlan: missingPlan },
          },
        }),
        manifest,
      })
    ).toEqual({
      status: "blocked",
      unresolvedLinks: ["correlation.map-option.MapSeaLevel"],
    });
  });

  test("fails when available exact map-option evidence contradicts authorship", () => {
    const manifest = manifestFixture({ mapOptions: { MapSeaLevel: "SEA_LEVEL_NORMAL" } });
    const recipePlan = recipePlanFixture();
    const mismatchedPlan = inspectRecipePlanForInitialSetup({
      ...recipePlan.initialSetup.value,
      options: {
        ...recipePlan.initialSetup.value.options,
        map: recipePlan.initialSetup.value.options.map.map((evidence) =>
          evidence.key === "MapSeaLevel"
            ? { status: "available", key: "MapSeaLevel", value: "SEA_LEVEL_LOW" }
            : evidence
        ),
      },
    });

    expect(
      resolveStandardParityReplayInput({
        exactAuthorship: exactFixture(manifest, {
          log: {
            evidencePayload: { recipePlan: mismatchedPlan },
            completionPayload: { recipePlan: mismatchedPlan },
          },
        }),
        manifest,
      })
    ).toEqual({
      status: "failed",
      failureLinks: ["correlation.map-option.MapSeaLevel"],
      unresolvedLinks: [],
    });
  });

  test("blocks when an authored player option has unavailable exact evidence", () => {
    const manifest = manifestFixture({
      playerOptions: [{ playerId: 0, options: { PlayerTeam: 2 } }],
    });

    expect(
      resolveStandardParityReplayInput({
        exactAuthorship: exactFixture(manifest),
        manifest,
      })
    ).toEqual({
      status: "blocked",
      unresolvedLinks: ["correlation.player-option.0.PlayerTeam"],
    });
  });

  test("fails when available exact player-option evidence contradicts authorship", () => {
    const manifest = manifestFixture({
      playerOptions: [{ playerId: 0, options: { PlayerTeam: 2 } }],
    });
    const recipePlan = recipePlanFixture();
    const mismatchedPlan = inspectRecipePlanForInitialSetup({
      ...recipePlan.initialSetup.value,
      options: {
        ...recipePlan.initialSetup.value.options,
        player: recipePlan.initialSetup.value.options.player.map((player) =>
          player.playerId === 0
            ? {
                ...player,
                options: player.options.map((evidence) =>
                  evidence.key === "PlayerTeam"
                    ? { status: "available", key: "PlayerTeam", value: 3 }
                    : evidence
                ),
              }
            : player
        ),
      },
    });

    expect(
      resolveStandardParityReplayInput({
        exactAuthorship: exactFixture(manifest, {
          log: {
            evidencePayload: { recipePlan: mismatchedPlan },
            completionPayload: { recipePlan: mismatchedPlan },
          },
        }),
        manifest,
      })
    ).toEqual({
      status: "failed",
      failureLinks: ["correlation.player-option.0.PlayerTeam"],
      unresolvedLinks: [],
    });
  });

  test("rejects a player override outside the exact captured roster", () => {
    const manifest = manifestFixture({ playerOptionIds: [7] });

    expect(
      resolveStandardParityReplayInput({
        exactAuthorship: exactFixture(manifest),
        manifest,
      })
    ).toEqual({
      status: "failed",
      failureLinks: ["correlation.player-option-player-ids"],
      unresolvedLinks: [],
    });
  });

  test("rejects a captured roster whose cardinality contradicts the requested population", () => {
    const manifest = manifestFixture({ playerCount: PLAYER_COUNT + 1 });

    expect(
      resolveStandardParityReplayInput({
        exactAuthorship: exactFixture(manifest),
        manifest,
      })
    ).toEqual({
      status: "failed",
      failureLinks: ["correlation.alive-major-player-count"],
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

  test("refuses to retain a structural copy of an authentic Standard plan", () => {
    const authenticPlan = compileStandardPlan();
    const copiedPlan = { ...authenticPlan };

    expect(() =>
      issueStandardParityReplayAuthority({
        plan: copiedPlan,
        canonicalConfigDigest: "canonical-config",
        launchEnvelopeDigest: "launch-envelope",
      })
    ).toThrow(
      "Pipeline execution requires an authentic execution plan returned by compileExecutionPlan."
    );
  });

  test("snapshots replay metadata when issuing authority", () => {
    const log = spyOn(console, "log").mockImplementation(() => {});
    try {
      const request = {
        plan: compileStandardPlan(),
        canonicalConfigDigest: "canonical-before-issuance",
        launchEnvelopeDigest: "envelope-before-issuance",
      };
      const authority = issueStandardParityReplayAuthority(request);

      request.canonicalConfigDigest = "canonical-after-issuance";
      request.launchEnvelopeDigest = "envelope-after-issuance";

      expect(runStandardParityReplayAuthority(authority).identity).toMatchObject({
        canonicalConfigDigest: "canonical-before-issuance",
        launchEnvelopeDigest: "envelope-before-issuance",
      });
    } finally {
      log.mockRestore();
    }
  }, 15_000);

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
  options: Readonly<{
    gameSeed?: number;
    mapSize?: string;
    playerCount?: number;
    playerOptionIds?: readonly number[];
    playerOptions?: readonly Readonly<{
      playerId: number;
      options: Readonly<{ PlayerTeam?: number }>;
    }>[];
    mapOptions?: Readonly<{ MapSeaLevel?: string }>;
  }> = {}
): StudioRunGenerationManifest {
  return buildStudioRunGenerationManifest(
    buildStudioRunGenerationManifestPayload({
      requestId: "run-parity",
      launchEnvelope: {
        seed: TEST_MAP_SEED,
        gameSeed: options.gameSeed ?? TEST_GAME_SEED,
        worldSettings: {
          mapSize: options.mapSize ?? TEST_MAP_SIZE.id,
          playerCount: options.playerCount ?? PLAYER_COUNT,
        },
        setupConfig: {
          gameOptions: {},
          mapOptions: options.mapOptions ?? {},
          playerOptions:
            options.playerOptions ??
            (options.playerOptionIds ?? [0]).map((playerId) => ({
              playerId,
              options: {},
            })),
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
  const requestedPlayerCount = manifest.payload.launchEnvelope.worldSettings.playerCount;
  const recipePlan = recipePlanFixture(manifest.payload.launchEnvelope.gameSeed);
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
      ...(requestedPlayerCount === undefined ? {} : { playerCount: requestedPlayerCount }),
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
      ...(requestedPlayerCount === undefined ? {} : { playerCount: requestedPlayerCount }),
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
      evidencePayload: {
        recipePlan,
      },
      completionPayload: {
        recipePlan,
      },
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

function recipePlanFixture(gameSeed = TEST_GAME_SEED) {
  return standardRecipe.inspectPlan(compileStandardPlan(gameSeed));
}

function compileStandardPlan(gameSeed = TEST_GAME_SEED) {
  const initialSetup = createStandardRecipeTestInitialSetup({
    preset: TEST_MAP_SIZE,
    mapSeed: TEST_MAP_SEED,
    gameSeed,
    aliveMajorPlayerIds: ALIVE_MAJOR_PLAYER_IDS,
    mapConfig: CONFIG,
  });
  return standardRecipe.compile(initialSetup, canonicalRecipeConfig(CONFIG));
}

function withInitialSetup(recipePlan: ReturnType<typeof recipePlanFixture>, value: unknown) {
  return {
    ...recipePlan,
    initialSetup: {
      ...recipePlan.initialSetup,
      value,
    },
  };
}

function inspectRecipePlanForInitialSetup(value: unknown) {
  return standardRecipe.inspectPlan(
    standardRecipe.compile(
      value as Parameters<typeof standardRecipe.compile>[0],
      canonicalRecipeConfig(CONFIG)
    )
  );
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
