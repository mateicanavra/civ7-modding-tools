import { describe, expect, test } from "bun:test";

import {
  buildFinalSurfaceParityProof,
  hashParityValue,
  validateExactAuthorshipProofPacket,
  type ExactAuthorshipProofLike,
  type FinalSurfaceSnapshot,
} from "../../src/dev/diagnostics/live-parity";

const pipelineConfig = { landmasses: { kind: "test" } } as const;
const configHash = hashParityValue(pipelineConfig);
const fileIdentity = {
  path: "/tmp/swooper-earthlike.js",
  sha256: "sha256",
  sizeBytes: 128,
  mtimeMs: 1,
  mtimeIso: "2026-06-06T00:00:00.000Z",
} as const;

function exactProof(overrides: Partial<ExactAuthorshipProofLike> = {}): ExactAuthorshipProofLike {
  return {
    status: "complete",
    requestId: "run-1",
    unresolvedLinks: [],
    sourceSnapshot: {
      identityHash: "source-1",
      requestId: "run-1",
      recipeSettings: {},
      worldSettings: {},
      pipelineConfig,
      setupConfig: {},
      materializationMode: "local-mod",
      selectedConfig: { id: "swooper-earthlike" },
      configHash,
      envelopeHash: "envelope-1",
    },
    request: {
      seed: 1234,
      mapSize: "MAPSIZE_TINY",
    },
    materialization: {
      mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
      configHash,
      envelopeHash: "envelope-1",
      sourceConfig: fileIdentity,
      generatedSourceScript: fileIdentity,
      localModScript: fileIdentity,
      deployedModScript: fileIdentity,
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
      configHash,
      envelopeHash: "envelope-1",
      seed: 1234,
      dimensions: { width: 2, height: 1 },
      resourcePlacement: {
        coordinateProof: {
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
  resourceCoordinateProof?: boolean;
  resourceRejectionContext?: boolean;
}): FinalSurfaceSnapshot {
  const width = 2;
  const height = 1;
  const localEvidence = {
    ...(args.resourceCoordinateProof
      ? {
          resourcePlacementOutcomes: {
            summary: {
              coordinateProof: {
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
            placements: [
              { plotIndex: 1, preferredResourceType: 13, preferredTypeOffset: 2, priority: 0.9 },
            ],
          },
          resourcePlacementOutcomes: {
            summary: {
              coordinateProof: {
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
            assignmentTrace: [
              {
                plotIndex: 1,
                resourceType: 46,
                initialResourceType: 46,
                preferredResourceType: 13,
                assignmentPhase: "scarce-floor",
                reassignedByRebalance: false,
                assignmentOrder: 168,
                perTypeCountBefore: 0,
                legalPlotCountForResource: 660,
                targetMinPerType: 7,
              },
            ],
          },
        }
      : {}),
  };
  return {
    source: args.source,
    width,
    height,
    seed: 1234,
    configHash,
    envelopeHash: "envelope-1",
    surfaces: {
      terrain: { width, height, values: args.localTerrain ?? [1, 2] },
      biome: { width, height, values: [3, 4] },
      feature: { width, height, values: args.feature ?? [5, 6] },
      resource: { width, height, values: [7, 8] },
    },
    evidence: args.source === "live-civ7"
      ? {
          runtime: { turn: 1, gameHash: args.gameHash ?? 99, width, height, seed: 1234, plotCount: 2 },
          fullGrid: {
            plotCount: 2,
            omitted: args.omitted ?? 0,
            chunks: [{ bounds: { x: 0, y: 0, width, height }, plotCount: 2, omitted: args.omitted ?? 0 }],
            identityCheck: {
              stable: true,
              checked: ["map.width", "map.height", "map.plotCount", "map.randomSeed", "game.turn", "game.hash"],
            },
          },
        }
      : localEvidence,
  };
}

describe("final-surface parity proof", () => {
  test("marks a fully bound matching grid complete", () => {
    const proof = buildFinalSurfaceParityProof({
      exactAuthorship: exactProof(),
      local: snapshot({ source: "local-mapgen", resourceCoordinateProof: true }),
      live: snapshot({ source: "live-civ7" }),
      now: () => new Date("2026-06-06T00:00:00.000Z"),
    });

    expect(proof.status).toBe("complete");
    expect(proof.resourcePlacementCoordinateProof).toMatchObject({
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
    expect(proof.unresolvedLinks).toEqual([]);
    expect(proof.diffs.every((diff) => diff.status === "match")).toBe(true);
  });

  test("keeps parity unresolved when local resource coordinate proof lacks matching exact log evidence", () => {
    const proof = buildFinalSurfaceParityProof({
      exactAuthorship: exactProof({
        log: {
          requestId: "run-1",
          configHash,
          envelopeHash: "envelope-1",
          seed: 1234,
          dimensions: { width: 2, height: 1 },
        },
      }),
      local: snapshot({ source: "local-mapgen", resourceCoordinateProof: true }),
      live: snapshot({ source: "live-civ7" }),
    });

    expect(proof.status).toBe("unresolved");
    expect(proof.resourcePlacementCoordinateProof).toMatchObject({
      status: "missing-exact-log",
      mismatchedLinks: ["resource-placement-coordinate-proof.log"],
    });
    expect(proof.unresolvedLinks).toContain("resource-placement-coordinate-proof.log");
  });

  test("keeps parity unresolved when resource coordinate proof hash differs", () => {
    const proof = buildFinalSurfaceParityProof({
      exactAuthorship: exactProof({
        log: {
          requestId: "run-1",
          configHash,
          envelopeHash: "envelope-1",
          seed: 1234,
          dimensions: { width: 2, height: 1 },
          resourcePlacement: {
            coordinateProof: {
              version: 1,
              placed: { count: 2, hash32: "bbbbbbbb" },
            },
          },
        },
      }),
      local: snapshot({ source: "local-mapgen", resourceCoordinateProof: true }),
      live: snapshot({ source: "live-civ7" }),
    });

    expect(proof.status).toBe("unresolved");
    expect(proof.resourcePlacementCoordinateProof).toMatchObject({
      status: "mismatch",
      mismatchedLinks: ["resource-placement-coordinate-proof.placed"],
      local: { placed: { count: 2, hash32: "aaaaaaaa" } },
      exact: { placed: { count: 2, hash32: "bbbbbbbb" } },
    });
    expect(proof.unresolvedLinks).toContain("resource-placement-coordinate-proof.placed");
  });

  test("joins exact resource rejection rows to local placement evidence", () => {
    const proof = buildFinalSurfaceParityProof({
      exactAuthorship: exactProof({
        log: {
          requestId: "run-1",
          configHash,
          envelopeHash: "envelope-1",
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
            coordinateProof: {
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

    expect(proof.status).toBe("unresolved");
    expect(proof.resourcePlacementRejectionContexts).toEqual([
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
          preferredPlacement: { preferredResourceType: 13, preferredTypeOffset: 2, priority: 0.9 },
          outcome: { status: "placed", resourceType: 46, observedResourceType: 46 },
          assignment: {
            resourceType: 46,
            initialResourceType: 46,
            preferredResourceType: 13,
            assignmentPhase: "scarce-floor",
            reassignedByRebalance: false,
            assignmentOrder: 168,
            perTypeCountBefore: 0,
            legalPlotCountForResource: 660,
            targetMinPerType: 7,
          },
        },
      },
    ]);
    expect(proof.unresolvedLinks).toContain("resource-placement-coordinate-proof.placed");
    expect(proof.unresolvedLinks).toContain("resource-placement-coordinate-proof.rejected");
  });

  test("rejects hash-only exact-authorship source snapshots", () => {
    const exact = exactProof({
      sourceSnapshot: {
        identityHash: "source-1",
        requestId: "run-1",
        configHash: "config-1",
        envelopeHash: "envelope-1",
      },
    });

    const validation = validateExactAuthorshipProofPacket(exact);
    const proof = buildFinalSurfaceParityProof({
      exactAuthorship: exact,
      local: snapshot({ source: "local-mapgen" }),
      live: snapshot({ source: "live-civ7" }),
    });

    expect(validation.unresolvedLinks).toContain("exact-authorship-proof.source-snapshot.pipeline-config");
    expect(proof.status).toBe("unresolved");
    expect(proof.unresolvedLinks).toContain("exact-authorship-proof.source-snapshot.pipeline-config");
  });

  test("rejects exact-authorship packets when visible config body does not match config hash", () => {
    const validation = validateExactAuthorshipProofPacket(exactProof({
      sourceSnapshot: {
        ...exactProof().sourceSnapshot,
        configHash: "wrong-config-hash",
      },
    }));

    expect(validation.unresolvedLinks).toContain("exact-authorship-proof.source-snapshot.config-hash-body-mismatch");
  });

  test("keeps parity unresolved when live runtime hash drifts from exact-authorship evidence", () => {
    const proof = buildFinalSurfaceParityProof({
      exactAuthorship: exactProof(),
      local: snapshot({ source: "local-mapgen" }),
      live: snapshot({ source: "live-civ7", gameHash: 100 }),
    });

    expect(proof.status).toBe("unresolved");
    expect(proof.unresolvedLinks).toContain("exact-authorship-proof.runtime-game-hash.live-game-hash");
  });

  test("keeps parity unresolved when live full-grid evidence omitted plots", () => {
    const proof = buildFinalSurfaceParityProof({
      exactAuthorship: exactProof(),
      local: snapshot({ source: "local-mapgen" }),
      live: snapshot({ source: "live-civ7", omitted: 1 }),
    });

    expect(proof.status).toBe("unresolved");
    expect(proof.unresolvedLinks).toContain("live.full-grid.omitted");
    expect(proof.unresolvedLinks).toContain("live.full-grid.chunk-omitted");
  });

  test("keeps parity unresolved when local surface length is not the exact runtime grid", () => {
    const proof = buildFinalSurfaceParityProof({
      exactAuthorship: exactProof(),
      local: snapshot({ source: "local-mapgen", localTerrain: [1] }),
      live: snapshot({ source: "live-civ7" }),
    });

    expect(proof.status).toBe("unresolved");
    expect(proof.unresolvedLinks).toContain("local.terrain.length");
  });

  test("keeps parity unresolved and samples mismatched final surface cells", () => {
    const proof = buildFinalSurfaceParityProof({
      exactAuthorship: exactProof(),
      local: snapshot({ source: "local-mapgen" }),
      live: snapshot({ source: "live-civ7", feature: [5, 9] }),
    });
    const feature = proof.diffs.find((diff) => diff.key === "feature");

    expect(proof.status).toBe("unresolved");
    expect(proof.unresolvedLinks).toContain("surface.feature.mismatch");
    expect(feature?.mismatches).toBe(1);
    expect(feature?.examples[0]).toMatchObject({ x: 1, y: 0, local: 6, live: 9 });
  });
});
