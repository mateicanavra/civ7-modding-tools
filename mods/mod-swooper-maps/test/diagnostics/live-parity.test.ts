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
}): FinalSurfaceSnapshot {
  const width = 2;
  const height = 1;
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
      : {},
  };
}

describe("final-surface parity proof", () => {
  test("marks a fully bound matching grid complete", () => {
    const proof = buildFinalSurfaceParityProof({
      exactAuthorship: exactProof(),
      local: snapshot({ source: "local-mapgen" }),
      live: snapshot({ source: "live-civ7" }),
      now: () => new Date("2026-06-06T00:00:00.000Z"),
    });

    expect(proof.status).toBe("complete");
    expect(proof.unresolvedLinks).toEqual([]);
    expect(proof.diffs.every((diff) => diff.status === "match")).toBe(true);
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
