import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { RunDiagnosticsLookupResult, RunInGameOperationStatus } from "@civ7/studio-contract";
import {
  canonicalSortedJson,
  readStudioRunGenerationManifest,
  type StudioRunGenerationManifest,
  type StudioRunGenerationManifestReference,
  writeStudioRunGenerationManifest,
} from "@civ7/studio-run-workspace";
import { STANDARD_RECIPE_CONFIG } from "mod-swooper-maps/recipes/standard-artifacts";

import {
  extractFinalSurfaceParityEvidenceFromDiagnostics,
  loadFinalSurfaceParityEvidence,
  parseFinalSurfaceParityArgs,
  resolveFinalSurfaceParityReplay,
} from "../../scripts/live/verify-final-surface-parity";

const requestId = "studio-run-in-game-test";
const diagnosticsId = "run-diagnostics-test";
const canonicalConfig = {
  id: "swooper-earthlike",
  name: "Swooper Earthlike",
  description: "A current launch-resolution snapshot fixture.",
  recipe: "standard" as const,
  sortIndex: 1,
  latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
  config: STANDARD_RECIPE_CONFIG,
};
const source = {
  kind: "catalog" as const,
  sourcePath: "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
  canonicalConfig,
};
const launchEnvelope = {
  recipeSettings: { recipe: "mod-swooper-maps/standard", seed: 1234 },
  worldSettings: { mapSize: "MAPSIZE_TINY" },
  setupConfig: { gameOptions: {}, playerOptions: [{ playerId: 0, options: {} }] },
  source,
};
const canonicalConfigDigest = digest(canonicalConfig);
const launchEnvelopeDigest = digest(launchEnvelope);
const fileIdentity = {
  path: "/tmp/studio-run.js",
  sha256: "local",
  sizeBytes: 1,
  mtimeMs: 1,
  mtimeIso: "2026-07-10T00:00:00.000Z",
};
const fileContentEvidence = { path: fileIdentity.path, markers: [] };

let workspaceRoot: string;
let manifestReference: StudioRunGenerationManifestReference;
let manifest: StudioRunGenerationManifest;

beforeAll(async () => {
  workspaceRoot = await mkdtemp(join(tmpdir(), "final-surface-parity-"));
  manifestReference = await writeStudioRunGenerationManifest({
    workspaceRoot,
    manifestInput: {
      requestId,
      launchEnvelope,
    },
  });
  manifest = await readStudioRunGenerationManifest(manifestReference.path);
});

afterAll(async () => {
  await rm(workspaceRoot, { recursive: true, force: true });
});

function exactAuthorshipEvidence(overrides: Record<string, unknown> = {}) {
  return {
    status: "complete",
    requestId,
    createdAt: "2026-07-10T00:00:00.000Z",
    unresolvedLinks: [],
    sourceSnapshot: {
      requestId,
      source: { kind: "catalog", sourcePath: source.sourcePath },
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
      launchEnvelopeDigest: launchEnvelopeDigest,
      generationManifestDigest: manifestReference.generationManifestDigest,
      runArtifactId: manifestReference.runArtifactId,
      generatedModRoot: "/tmp/generated-mod",
      generatedModFileCount: 4,
      generatedModDigest: "generated-digest",
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
      launchEnvelopeDigest: launchEnvelopeDigest,
      seed: 1234,
      dimensions: { width: 2, height: 1 },
      evidencePayload: {},
      completionPayload: {},
      matched: [],
    },
    ...overrides,
  };
}

type CompletedPublicStatus = Extract<RunInGameOperationStatus, Readonly<{ status: "completed" }>>;
type DiagnosticsLookupOverrides = Readonly<{
  returnedDiagnosticsId?: string;
  diagnosticsRequestId?: string;
  operationRequestId?: string;
  evidenceRequestId?: string;
  operationStatus?: string;
  evidenceStatus?: string;
  persistedRevision?: number;
  operationRevision?: number;
}>;

function completedStatus(overrides: Partial<CompletedPublicStatus> = {}): CompletedPublicStatus {
  return {
    requestId,
    diagnosticsId,
    recoveryActions: [],
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:01.000Z",
    status: "completed",
    phase: "completed",
    terminalAt: "2026-07-10T00:00:01.000Z",
    ...overrides,
  };
}

function diagnosticsRecord(overrides: DiagnosticsLookupOverrides = {}) {
  return {
    diagnosticsId: overrides.returnedDiagnosticsId ?? diagnosticsId,
    requestId: overrides.diagnosticsRequestId ?? requestId,
    operationRevision: overrides.persistedRevision ?? 4,
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:01.000Z",
    sections: {
      operation: {
        requestId: overrides.operationRequestId ?? requestId,
        status: overrides.operationStatus ?? "complete",
        operationRevision: overrides.operationRevision ?? 4,
        generationManifest: manifestReference,
        exactAuthorshipEvidence: {
          ...exactAuthorshipEvidence(),
          requestId: overrides.evidenceRequestId ?? requestId,
          status: overrides.evidenceStatus ?? "complete",
        },
      },
    },
  };
}

function diagnosticsLookup(overrides: DiagnosticsLookupOverrides = {}): RunDiagnosticsLookupResult {
  return { ok: true as const, diagnostics: diagnosticsRecord(overrides) };
}

function diagnosticsClient(
  result: RunDiagnosticsLookupResult,
  calls: { status: string[]; diagnostics: string[] },
  status = completedStatus()
) {
  return () => ({
    runInGame: {
      status: async ({ requestId: requestedRequestId }: { requestId: string }) => {
        calls.status.push(requestedRequestId);
        return status;
      },
      diagnostics: async ({ diagnosticsId: requestedDiagnosticsId }: { diagnosticsId: string }) => {
        calls.diagnostics.push(requestedDiagnosticsId);
        return result;
      },
    },
  });
}

function calls() {
  return { status: [] as string[], diagnostics: [] as string[] };
}

describe("final-surface parity verifier", () => {
  test("replays the production diagnostics record through its manifest reference", async () => {
    const evidence = await extractFinalSurfaceParityEvidenceFromDiagnostics(diagnosticsRecord());
    const replay = resolveFinalSurfaceParityReplay(evidence);

    expect(evidence.manifest.generationManifestDigest).toBe(
      manifestReference.generationManifestDigest
    );
    expect(evidence.exact).not.toHaveProperty("launchEnvelope");
    expect(replay.status).toBe("ready");
    if (replay.status === "ready") {
      expect(replay.input.config).toEqual(canonicalConfig);
      expect(replay.input.canonicalConfigDigest).toBe(canonicalConfigDigest);
      expect(replay.input.mapEnvelopeBounds).toEqual(canonicalConfig.latitudeBounds);
    }
  });

  test("blocks parity when private exact authorship does not match its referenced manifest", () => {
    const replay = resolveFinalSurfaceParityReplay({
      manifest,
      exact: exactAuthorshipEvidence({
        materialization: {
          ...exactAuthorshipEvidence().materialization,
          canonicalConfigDigest: "other-canonical-config-digest",
        },
      }),
    });

    expect(replay.status).toBe("blocked");
    if (replay.status === "blocked") {
      expect(replay.blockedBy).toContain(
        "generation-manifest.materialization.canonical-config-digest"
      );
    }
  });

  test("blocks catalog replay when the manifest path disagrees with its config id", () => {
    const mismatchedManifest = {
      ...manifest,
      payload: {
        ...manifest.payload,
        launchEnvelope: {
          ...manifest.payload.launchEnvelope,
          source: {
            ...manifest.payload.launchEnvelope.source,
            sourcePath: "mods/mod-swooper-maps/src/maps/configs/shattered-ring.config.json",
          },
        },
      },
    } as StudioRunGenerationManifest;

    const replay = resolveFinalSurfaceParityReplay({
      manifest: mismatchedManifest,
      exact: exactAuthorshipEvidence(),
    });

    expect(replay.status).toBe("blocked");
    if (replay.status === "blocked") {
      expect(replay.blockedBy).toContain(
        "generation-manifest.launch-envelope.canonical-config-admission"
      );
    }
  });

  test("requires exactly one evidence source selector", () => {
    expect(() => parseFinalSurfaceParityArgs([])).toThrow(
      "Exactly one of --request-id, --diagnostics-id, or --evidence-file is required"
    );
    expect(() =>
      parseFinalSurfaceParityArgs(["--request-id", requestId, "--diagnostics-id", diagnosticsId])
    ).toThrow("Exactly one of --request-id, --diagnostics-id, or --evidence-file is required");
  });

  test("uses fresh public completion only to bridge into private diagnostics", async () => {
    const onlineCalls = calls();
    const evidence = await loadFinalSurfaceParityEvidence(
      parseFinalSurfaceParityArgs(["--request-id", requestId]),
      diagnosticsClient(diagnosticsLookup(), onlineCalls)
    );

    expect(evidence.manifest.generationManifestDigest).toBe(
      manifestReference.generationManifestDigest
    );
    expect(onlineCalls).toEqual({ status: [requestId], diagnostics: [diagnosticsId] });
  });

  test("reads direct private diagnostics without a public status lookup", async () => {
    const onlineCalls = calls();
    const evidence = await loadFinalSurfaceParityEvidence(
      parseFinalSurfaceParityArgs(["--diagnostics-id", diagnosticsId]),
      diagnosticsClient(diagnosticsLookup(), onlineCalls)
    );

    expect(evidence.exact.requestId).toBe(requestId);
    expect(onlineCalls).toEqual({ status: [], diagnostics: [diagnosticsId] });
  });

  test("rejects missing or mismatched private manifest records", async () => {
    await expect(
      extractFinalSurfaceParityEvidenceFromDiagnostics({
        ...diagnosticsRecord(),
        sections: {
          operation: {
            ...diagnosticsRecord().sections.operation,
            generationManifest: {
              ...manifestReference,
              generationManifestDigest: "wrong-manifest",
            },
          },
        },
      })
    ).rejects.toThrow("generation manifest digest mismatch");

    await expect(
      extractFinalSurfaceParityEvidenceFromDiagnostics({
        ...diagnosticsRecord(),
        sections: {
          operation: {
            ...diagnosticsRecord().sections.operation,
            generationManifest: undefined,
          },
        },
      })
    ).rejects.toThrow("missing generation manifest reference");
  });

  test("rejects invalid and stale manifests instead of selecting another config authority", async () => {
    const invalidManifestPath = join(workspaceRoot, "invalid-generation-manifest.json");
    await writeFile(invalidManifestPath, '{"payload":{},"generationManifestDigest":"invalid"}\n');
    await expect(
      extractFinalSurfaceParityEvidenceFromDiagnostics({
        ...diagnosticsRecord(),
        sections: {
          operation: {
            ...diagnosticsRecord().sections.operation,
            generationManifest: { ...manifestReference, path: invalidManifestPath },
          },
        },
      })
    ).rejects.toThrow("generation manifest is unavailable");

    const staleReference = await writeStudioRunGenerationManifest({
      workspaceRoot,
      manifestInput: {
        requestId: "studio-run-in-game-stale",
        launchEnvelope,
      },
    });
    await expect(
      extractFinalSurfaceParityEvidenceFromDiagnostics({
        ...diagnosticsRecord(),
        sections: {
          operation: {
            ...diagnosticsRecord().sections.operation,
            generationManifest: staleReference,
          },
        },
      })
    ).rejects.toThrow(`generation manifest request mismatch for ${requestId}`);
  });

  test("rejects a direct lookup that returns a different diagnostics record", async () => {
    await expect(
      loadFinalSurfaceParityEvidence(
        parseFinalSurfaceParityArgs(["--diagnostics-id", diagnosticsId]),
        diagnosticsClient(
          diagnosticsLookup({ returnedDiagnosticsId: "run-diagnostics-other" }),
          calls()
        )
      )
    ).rejects.toThrow(
      `Studio Run in Game diagnostics id mismatch: expected ${diagnosticsId}, received run-diagnostics-other`
    );
  });

  test("does not cross the public boundary before diagnostics have persisted", async () => {
    const onlineCalls = calls();
    await expect(
      loadFinalSurfaceParityEvidence(
        parseFinalSurfaceParityArgs(["--request-id", requestId]),
        diagnosticsClient(
          diagnosticsLookup(),
          onlineCalls,
          completedStatus({ diagnosticsId: undefined })
        )
      )
    ).rejects.toThrow(`Studio Run in Game status missing diagnostics id for ${requestId}`);
    expect(onlineCalls).toEqual({ status: [requestId], diagnostics: [] });
  });
});

function digest(value: unknown): string {
  return createHash("sha256").update(canonicalSortedJson(value), "utf8").digest("hex");
}
