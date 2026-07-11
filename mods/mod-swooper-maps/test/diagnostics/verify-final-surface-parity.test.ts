import { describe, expect, test } from "bun:test";

import { STANDARD_RECIPE_CONFIG } from "mod-swooper-maps/recipes/standard-artifacts";
import {
  buildBlockedFinalSurfaceParityOutput,
  extractFinalSurfaceParityEvidence,
  parseFinalSurfaceParityArgs,
  resolveFinalSurfaceParityReplay,
} from "../../scripts/live/verify-final-surface-parity";
import {
  type CompleteExactAuthorshipEvidence,
  hashParityValue,
} from "../../src/dev/diagnostics/live-parity";

const requestId = "studio-run-in-game-test";
const canonicalConfig = {
  id: "swooper-earthlike",
  name: "Swooper Earthlike",
  description: "A diagnostic fixture envelope.",
  recipe: "standard" as const,
  sortIndex: 1,
  latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
  config: STANDARD_RECIPE_CONFIG,
};
const canonicalConfigDigest = hashParityValue(canonicalConfig);
const launchEnvelopeDigest = "launch-envelope-digest";
const fileIdentity = {
  path: "/tmp/swooper-earthlike.js",
  sha256: "sha256",
  sizeBytes: 128,
  mtimeMs: 1,
  mtimeIso: "2026-07-10T00:00:00.000Z",
} as const;
const fileContentEvidence = { path: fileIdentity.path, markers: [] };

function exactAuthorshipEvidence(
  overrides: Partial<CompleteExactAuthorshipEvidence> = {}
): CompleteExactAuthorshipEvidence {
  return {
    status: "complete",
    requestId,
    createdAt: "2026-07-10T00:00:00.000Z",
    unresolvedLinks: [],
    sourceSnapshot: {
      requestId,
      source: {
        kind: "catalog",
        sourcePath: "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
      },
      canonicalConfigDigest,
      launchEnvelopeDigest,
    },
    request: {
      recipeId: "mod-swooper-maps/standard",
      seed: 1234,
      mapSize: "MAPSIZE_TINY",
    },
    materialization: {
      mapScript: "{mod-swooper-studio-run}/maps/studio-run.js",
      canonicalConfigDigest,
      launchEnvelopeDigest,
      generationManifestDigest: "generation-manifest-digest",
      runArtifactId: "run-artifact-1",
      generatedModRoot: "/tmp/generated-mod",
      generatedModFileCount: 4,
      generatedModDigest: "generated-mod-digest",
      mapRowId: "MAP_STUDIO_RUN",
      localModScript: fileIdentity,
      deployedModScript: fileIdentity,
      localModScriptContent: fileContentEvidence,
      deployedModScriptContent: fileContentEvidence,
    },
    civSetup: {
      mapScript: "{mod-swooper-studio-run}/maps/studio-run.js",
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
      gameHash: 1,
      sourceSnapshotId: "live:source-snapshot",
      snapshotHash: "snapshot-hash",
    },
    log: {
      requestId,
      canonicalConfigDigest,
      launchEnvelopeDigest,
      seed: 1234,
      dimensions: { width: 2, height: 1 },
      evidencePayload: {},
      completionPayload: {},
      matched: [],
    },
    ...overrides,
  };
}

describe("final-surface parity verifier", () => {
  test("replays a strictly parsed evidence packet with its supplied canonical config", () => {
    const evidence = extractFinalSurfaceParityEvidence({
      exactAuthorshipEvidence: exactAuthorshipEvidence(),
      canonicalConfig,
    });
    const replay = resolveFinalSurfaceParityReplay(evidence);

    expect(replay.status).toBe("ready");
    if (replay.status === "ready") {
      expect(replay.input).toEqual({
        width: 2,
        height: 1,
        seed: 1234,
        config: canonicalConfig,
        canonicalConfigDigest,
        launchEnvelopeDigest,
      });
    }
  });

  test("reads exact evidence from a prior report envelope", () => {
    const exact = exactAuthorshipEvidence();
    const evidence = extractFinalSurfaceParityEvidence({
      report: { exactAuthorshipEvidence: exact },
      canonicalConfig,
    });

    expect(evidence.exact).toEqual(exact);
  });

  test("rejects unresolved or noncanonical exact evidence", () => {
    expect(() =>
      extractFinalSurfaceParityEvidence({
        exactAuthorshipEvidence: {
          status: "unresolved",
          requestId,
          createdAt: "2026-07-10T00:00:00.000Z",
          request: {},
          materialization: {},
          civSetup: {},
          runtime: {},
          unresolvedLinks: ["runtime.width"],
        },
      })
    ).toThrow("Exact authorship evidence must be canonical and complete");

    expect(() =>
      extractFinalSurfaceParityEvidence({
        exactAuthorshipEvidence: {
          ...exactAuthorshipEvidence(),
          unexpected: true,
        },
      })
    ).toThrow("exact-authorship-evidence.invalid");
  });

  test("blocks replay when the canonical config does not match evidence identity", () => {
    const replay = resolveFinalSurfaceParityReplay({
      exact: exactAuthorshipEvidence(),
      canonicalConfig: { ...canonicalConfig, id: "other-config" },
    });

    expect(replay).toMatchObject({
      status: "blocked",
      blockedBy: ["exact-authorship-evidence.source-snapshot.canonical-config"],
    });
  });

  test("requires an evidence file and emits digest identity in blocked output", () => {
    expect(() => parseFinalSurfaceParityArgs([])).toThrow("--evidence-file is required");
    expect(parseFinalSurfaceParityArgs(["--evidence-file", "run.json"]).evidenceFile).toBe(
      "run.json"
    );

    const output = buildBlockedFinalSurfaceParityOutput({
      exact: exactAuthorshipEvidence(),
      blockedBy: ["exact-authorship-evidence.source-snapshot.canonical-config"],
      dimensions: { width: 2, height: 1, seed: 1234 },
    });
    expect(output).toMatchObject({
      ok: false,
      parityStatus: "blocked",
      exactAuthorshipSummary: {
        requestId,
        status: "complete",
        canonicalConfigDigest,
        launchEnvelopeDigest,
      },
    });
  });
});
