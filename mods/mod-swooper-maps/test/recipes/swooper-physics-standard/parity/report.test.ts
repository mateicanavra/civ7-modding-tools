import { describe, expect, test } from "bun:test";
import {
  buildStandardParityReport,
  type StandardExactParityCapture,
  type StandardLiveParityCapture,
  type StandardLocalParityCapture,
} from "../../../../src/recipes/standard/parity/index.js";
import type { CompleteExactAuthorshipEvidence } from "../../../../src/recipes/standard/parity/types.js";
import { TEST_GAME_SEED, TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../setup.js";

const COMPARISON_DIMENSIONS = TEST_MAP_SIZE.dimensions;
const COMPARISON_PLOT_COUNT = COMPARISON_DIMENSIONS.width * COMPARISON_DIMENSIONS.height;
const EMPTY_DIGEST = { count: 0, hash32: "811c9dc5" } as const;
const EMPTY_INPUT_EVIDENCE = {
  version: 2,
  plannerInput: {
    version: 1,
    dimensions: COMPARISON_DIMENSIONS,
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
      plotCount: COMPARISON_PLOT_COUNT,
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
} as const;

describe("Standard parity report state", () => {
  test("keeps matching product evidence blocked on cross-window game-instance correlation", () => {
    const report = buildStandardParityReport(captures());

    expect(report.state).toBe("blocked-unresolved");
    expect(report.failureLinks).toEqual([]);
    expect(report.unresolvedLinks).toContain("identity.cross-window-game-instance");
    expect(report.identity).toMatchObject({
      turn: { status: "pass" },
      gameInstance: {
        status: "unresolved",
        evidenceLinks: ["identity.cross-window-game-instance"],
      },
    });
  });

  test("retains product contradictions while cross-window identity remains unresolved", () => {
    const base = captures();
    const report = buildStandardParityReport({
      ...base,
      live: {
        ...base.live,
        surface: finalSurface(1),
      },
    });

    expect(report.state).toBe("blocked-unresolved");
    expect(report.failureLinks).toContain("surface.terrain.mismatch");
    expect(report.unresolvedLinks).toContain("identity.cross-window-game-instance");
  });

  test("retains a surface contradiction when another live cell is missing", () => {
    const base = captures();
    const terrain = new Array<number | null>(COMPARISON_PLOT_COUNT).fill(0);
    terrain[0] = null;
    terrain[1] = 1;
    const report = buildStandardParityReport({
      ...base,
      live: {
        ...base.live,
        surface: {
          ...base.live.surface,
          grids: {
            ...base.live.surface.grids,
            terrain: gridFrom(terrain),
          },
        },
      },
    });

    expect(report.state).toBe("blocked-unresolved");
    expect(report.failureLinks).toContain("surface.terrain.mismatch");
    expect(report.unresolvedLinks).toContain("surface.terrain.live-readback");
  });

  test("fails terminal placement parity when exact and replay agree on nonzero water drift", () => {
    const base = captures();
    const report = buildStandardParityReport({
      ...base,
      exact: {
        ...base.exact,
        placementParity: {
          status: "present",
          value: {
            version: 1,
            waterDriftCount: 1,
            acceptedLakeTileCount: 0,
            finalLakeWaterDriftCount: 0,
            finalLakeClassificationDriftCount: 0,
          },
        },
      },
      local: {
        ...base.local,
        placement: {
          ...base.local.placement,
          terminalParity: {
            ...base.local.placement.terminalParity,
            waterDriftCount: 1,
          },
        },
      },
    });

    expect(report.placement.terminalParity.claim.status).toBe("fail");
    expect(report.failureLinks).toContain("placement-parity.drift");
  });

  test("compares river terrain even when a metadata grid has incompatible cardinality", () => {
    const base = captures();
    const terrain = new Array<number | null>(COMPARISON_PLOT_COUNT).fill(0);
    terrain[1] = 1;
    const report = buildStandardParityReport({
      ...base,
      live: {
        ...base.live,
        hydrology: {
          rivers: {
            ...base.live.hydrology.rivers,
            terrainNavigableRiver: gridFrom(terrain),
            navigableRiver: {
              ...COMPARISON_DIMENSIONS,
              values: new Array<number>(COMPARISON_PLOT_COUNT - 1).fill(0),
            },
          },
        },
      },
    });

    expect(report.hydrology.rivers.counts.projectedVsLiveTerrainMismatches).toBe(1);
    expect(report.failureLinks).toContain("river-terrain.mismatch");
    expect(report.failureLinks).toContain("river-metadata.dimensions");
  });

  test("retains known river contradictions alongside missing live readback", () => {
    const base = captures();
    const terrain = new Array<number | null>(COMPARISON_PLOT_COUNT).fill(0);
    terrain[0] = null;
    terrain[1] = 1;
    const report = buildStandardParityReport({
      ...base,
      live: {
        ...base.live,
        hydrology: {
          rivers: {
            ...base.live.hydrology.rivers,
            terrainNavigableRiver: gridFrom(terrain),
          },
        },
      },
    });

    expect(report.hydrology.rivers.terrain.status).toBe("unresolved");
    expect(report.failureLinks).toContain("river-terrain.mismatch");
    expect(report.unresolvedLinks).toContain("river-terrain.live-readback");
  });

  test("retains resource contradictions while another coordinate channel is missing", () => {
    const base = captures();
    const report = buildStandardParityReport({
      ...base,
      exact: {
        ...base.exact,
        resourcePlacement: {
          status: "present",
          value: {
            version: 1,
            placed: { count: 1, hash32: "aaaaaaaa" },
            rejected: {
              status: "missing",
              evidenceLink: "exact-authorship.log.resource-placement.rejected-coordinates",
            },
            mismatch: { status: "implicit-empty" },
            rejectionRows: [],
          },
        },
      },
    });

    expect(report.placement.resourcePlacement.claim.status).toBe("unresolved");
    expect(report.failureLinks).toContain("resource-placement.placed");
    expect(report.unresolvedLinks).toContain(
      "exact-authorship.log.resource-placement.rejected-coordinates"
    );
  });

  test("fails when any causal natural-wonder planner input diverges", () => {
    const base = captures();
    const exactInput = base.exact.naturalWonderPlanInput;
    if (exactInput.status !== "present") throw new Error("Expected exact planner input evidence.");
    const report = buildStandardParityReport({
      ...base,
      exact: {
        ...base.exact,
        naturalWonderPlanInput: {
          status: "present",
          value: {
            ...exactInput.value,
            plannerInput: {
              ...exactInput.value.plannerInput,
              strategy: {
                ...exactInput.value.plannerInput.strategy,
                configCanonicalJson: '{"minimumSpacing":2}',
                configHash32: "12345678",
              },
            },
          },
        },
      },
    });

    expect(report.state).toBe("blocked-unresolved");
    expect(report.failureLinks).toContain("natural-wonder-plan-input.measurement");
    expect(report.failureLinks).toContain("natural-wonder-plan-input.planner.strategy");
  });

  test("blocks closure when the typed observation omits a plot", () => {
    const base = captures();
    const report = buildStandardParityReport({
      ...base,
      live: {
        ...base.live,
        fullGrid: {
          plotCount: COMPARISON_PLOT_COUNT,
          observedPlotCount: COMPARISON_PLOT_COUNT - 1,
          missingPlotIndices: [0],
          identityStable: true,
        },
      },
    });

    expect(report.state).toBe("blocked-unresolved");
    expect(report.unresolvedLinks).toContain("identity.full-grid");
  });

  test("keeps an unavailable minor-river capability unresolved instead of failing product parity", () => {
    const base = captures();
    const report = buildStandardParityReport({
      ...base,
      local: {
        ...base.local,
        hydrology: {
          ...base.local.hydrology,
          rivers: {
            ...base.local.hydrology.rivers,
            minorRiverStamping: {
              status: "unsupported",
              reason: "The runtime does not expose native minor-river metadata.",
            },
          },
        },
      },
    });

    expect(report.state).toBe("blocked-unresolved");
    expect(report.failureLinks).toEqual([]);
    expect(report.unresolvedLinks).toContain("river-metadata.minor-stamping");
  });
});

function captures(): Readonly<{
  exact: StandardExactParityCapture;
  local: StandardLocalParityCapture;
  live: StandardLiveParityCapture;
}> {
  const emptyGrid = grid(0);
  return {
    exact: {
      authorship: exactAuthorship(),
      placementParity: {
        status: "present",
        value: {
          version: 1,
          waterDriftCount: 0,
          acceptedLakeTileCount: 0,
          finalLakeWaterDriftCount: 0,
          finalLakeClassificationDriftCount: 0,
        },
      },
      floodplains: {
        status: "present",
        value: {
          attemptedFloodplainFeatureCount: 0,
          appliedFloodplainFeatureCount: 0,
          rejectedFloodplainFeatureCount: 0,
        },
      },
      naturalWonderPlan: {
        status: "present",
        value: {
          version: 1,
          plannedCount: 0,
          coordinateDigest: EMPTY_DIGEST,
          rows: [],
        },
      },
      naturalWonderPlanInput: {
        status: "present",
        value: EMPTY_INPUT_EVIDENCE,
      },
      resourcePlacement: {
        status: "present",
        value: {
          version: 1,
          placed: EMPTY_DIGEST,
          rejected: { status: "implicit-empty" },
          mismatch: { status: "implicit-empty" },
          rejectionRows: [],
        },
      },
    },
    local: {
      source: "standard-replay",
      identity: {
        mapSeed: TEST_MAP_SEED,
        gameSeed: TEST_GAME_SEED,
        mapSize: TEST_MAP_SIZE.id,
        playerCount: 6,
        canonicalConfigDigest: "config-digest",
        launchEnvelopeDigest: "launch-digest",
      },
      surface: finalSurface(0),
      hydrology: {
        rivers: {
          plannedMinor: emptyGrid,
          plannedMajor: emptyGrid,
          projectedNavigableTerrain: emptyGrid,
          minorRiverStamping: { status: "supported" },
        },
        lakeProjection: {} as StandardLocalParityCapture["hydrology"]["lakeProjection"],
        featureProjection: {
          attemptedByFeature: {},
          appliedByFeature: {},
          rejectedCanHaveFeatureByFeature: {},
        } as StandardLocalParityCapture["hydrology"]["featureProjection"],
      },
      placement: {
        terminalParity: {
          version: 1,
          waterDriftCount: 0,
          acceptedLakeTileCount: 0,
          finalLakeWaterDriftCount: 0,
          finalLakeClassificationDriftCount: 0,
        },
        naturalWonderPlanEvidence: {
          version: 1,
          plannedCount: 0,
          coordinateDigest: EMPTY_DIGEST,
          rows: [],
        },
        naturalWonderPlanInput: {
          status: "present",
          value: EMPTY_INPUT_EVIDENCE,
        },
        resourcePlanIntents: [],
        resourcePlacement: {
          coordinateEvidence: {
            version: 1,
            placed: EMPTY_DIGEST,
            rejected: EMPTY_DIGEST,
            mismatch: EMPTY_DIGEST,
          },
          outcomes: [],
        },
      },
    },
    live: {
      source: "live-civ7",
      identity: {
        wireConnectionEpoch: 1,
        mapSeed: TEST_MAP_SEED,
        turn: 1,
      },
      surface: finalSurface(0),
      fullGrid: {
        plotCount: COMPARISON_PLOT_COUNT,
        observedPlotCount: COMPARISON_PLOT_COUNT,
        missingPlotIndices: [],
        identityStable: true,
      },
      hydrology: {
        rivers: {
          terrainNavigableRiver: emptyGrid,
          riverType: grid(-1),
          river: emptyGrid,
          navigableRiver: emptyGrid,
          minorRiver: emptyGrid,
          nativeObjects: { status: "present", count: 0, sampleCount: 0 },
        },
      },
    },
  };
}

function exactAuthorship(): CompleteExactAuthorshipEvidence {
  return {
    status: "complete",
    requestId: "run-parity",
    createdAt: "2026-07-25T00:00:00.000Z",
    canonicalConfigDigest: "config-digest",
    launchEnvelopeDigest: "launch-digest",
    request: {
      recipeId: "standard",
      seed: TEST_MAP_SEED,
      gameSeed: TEST_GAME_SEED,
      mapSize: TEST_MAP_SIZE.id,
      playerCount: 6,
    },
    materialization: {
      mapScript: "{swooper-maps}/maps/studio-run.js",
      canonicalConfigDigest: "config-digest",
      launchEnvelopeDigest: "launch-digest",
      generationManifestDigest: "manifest-digest",
      runArtifactId: "run-artifact",
      generatedModRoot: "/tmp/generated-mod",
      generatedModFileCount: 1,
      generatedModDigest: "generated-mod-digest",
      mapRowId: "MAP_STUDIO_RUN",
      localModScript: fileIdentity(),
      deployedModScript: fileIdentity(),
      localModScriptContent: { path: "/tmp/studio-run.js", markers: [] },
      deployedModScriptContent: { path: "/tmp/studio-run.js", markers: [] },
    },
    civSetup: {
      mapScript: "{swooper-maps}/maps/studio-run.js",
      mapSize: "MAPSIZE_TINY",
      mapSeed: TEST_MAP_SEED,
      gameSeed: TEST_GAME_SEED,
      playerCount: 6,
      rowCount: 1,
    },
    runtime: {
      seed: TEST_MAP_SEED,
      width: COMPARISON_DIMENSIONS.width,
      height: COMPARISON_DIMENSIONS.height,
      plotCount: COMPARISON_PLOT_COUNT,
      turn: 1,
      // The public exact-authorship packet still carries this legacy field; parity ignores it.
      gameHash: 99,
      sourceSnapshotId: "live-runtime:1",
      snapshotHash: "runtime-hash",
    },
    log: {
      requestId: "run-parity",
      canonicalConfigDigest: "config-digest",
      launchEnvelopeDigest: "launch-digest",
      seed: TEST_MAP_SEED,
      dimensions: COMPARISON_DIMENSIONS,
      evidencePayload: {},
      completionPayload: {},
      matched: [],
    },
    unresolvedLinks: [],
  };
}

function fileIdentity() {
  return {
    path: "/tmp/studio-run.js",
    sha256: "sha256",
    sizeBytes: 1,
    mtimeMs: 1,
    mtimeIso: "2026-07-25T00:00:00.000Z",
  };
}

function finalSurface(value: number) {
  return {
    dimensions: COMPARISON_DIMENSIONS,
    grids: {
      terrain: grid(value),
      biome: grid(0),
      feature: grid(0),
      resource: grid(0),
    },
  };
}

function grid(value: number) {
  return {
    ...COMPARISON_DIMENSIONS,
    values: new Array<number>(COMPARISON_PLOT_COUNT).fill(value),
  };
}

function gridFrom(values: ReadonlyArray<number | null>) {
  return {
    ...COMPARISON_DIMENSIONS,
    values,
  };
}
