import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { RunDiagnosticsLookupResult, RunInGameOperationStatus } from "@civ7/studio-contract";
import {
  readStudioRunGenerationManifest,
  type StudioRunGenerationManifest,
  type StudioRunGenerationManifestReference,
  writeStudioRunGenerationManifest,
} from "@civ7/studio-run-workspace";
import type { PublishJsonEvidenceOptions } from "@swooper/mapgen-diagnostics";
import { standardMapConfigs } from "@swooper/swooper-physics/catalog";
import standardRecipe from "@swooper/swooper-physics/standard";
import {
  admitStandardMapConfig,
  canonicalRecipeConfig,
} from "@swooper/swooper-physics/standard/map-config";
import type { StandardLiveObservation } from "@swooper/swooper-physics/standard/parity";
import {
  executeFinalSurfaceParityCommand,
  extractFinalSurfaceParityEvidenceFromDiagnostics,
  finalSurfaceParityExitCode,
  loadFinalSurfaceParityEvidence,
  parseFinalSurfaceParityArgs,
  type StudioRunInGameClientFactory,
} from "../../scripts/live/verify-final-surface-parity.js";
import {
  createStandardRecipeTestInitialSetup,
  TEST_GAME_SEED,
  TEST_MAP_SEED,
  TEST_MAP_SIZE,
} from "../setup.js";

const REQUEST_ID = "run-final-surface-parity";
const DIAGNOSTICS_ID = "diagnostics-final-surface-parity";
const ALIVE_MAJOR_PLAYER_IDS = [0, 1, 2, 3] as const;
const PLAYER_COUNT = ALIVE_MAJOR_PLAYER_IDS.length;
const CREATED_AT = "2026-07-25T00:00:00.000Z";
const FILE_IDENTITY = {
  path: "/tmp/studio-run.js",
  sha256: "sha256",
  sizeBytes: 128,
  mtimeMs: 1,
  mtimeIso: CREATED_AT,
} as const;
const CONFIG = admitStandardMapConfig(
  standardMapConfigs.find((config) => config.id === "swooper-earthlike")
);
const RECIPE_PLAN = standardRecipe.inspectPlan(
  standardRecipe.compile(
    createStandardRecipeTestInitialSetup({
      preset: TEST_MAP_SIZE,
      mapSeed: TEST_MAP_SEED,
      gameSeed: TEST_GAME_SEED,
      aliveMajorPlayerIds: ALIVE_MAJOR_PLAYER_IDS,
      mapConfig: CONFIG,
    }),
    canonicalRecipeConfig(CONFIG)
  )
);

let workspaceRoot: string;
let manifestReference: StudioRunGenerationManifestReference;
let manifest: StudioRunGenerationManifest;

beforeAll(async () => {
  workspaceRoot = await mkdtemp(join(tmpdir(), "standard-final-surface-parity-"));
  manifestReference = await writeStudioRunGenerationManifest({
    workspaceRoot,
    manifestInput: {
      requestId: REQUEST_ID,
      launchEnvelope: {
        seed: TEST_MAP_SEED,
        gameSeed: TEST_GAME_SEED,
        worldSettings: {
          mapSize: TEST_MAP_SIZE.id,
          playerCount: PLAYER_COUNT,
        },
        setupConfig: {
          gameOptions: {},
          mapOptions: {},
          playerOptions: [{ playerId: 0, options: {} }],
        },
        canonicalConfig: CONFIG,
      },
    },
  });
  manifest = await readStudioRunGenerationManifest(manifestReference.path);
});

afterAll(async () => {
  await rm(workspaceRoot, { recursive: true, force: true });
});

describe("Standard final-surface parity command", () => {
  test("requires exactly one private evidence selector", () => {
    expect(() => parseFinalSurfaceParityArgs([])).toThrow(
      "Exactly one of --request-id, --diagnostics-id, or --evidence-file is required"
    );
    expect(() =>
      parseFinalSurfaceParityArgs(["--request-id", REQUEST_ID, "--diagnostics-id", DIAGNOSTICS_ID])
    ).toThrow("Exactly one of --request-id, --diagnostics-id, or --evidence-file is required");
  });

  test("uses public completion only to reach the private diagnostics record", async () => {
    const calls = { status: [] as string[], diagnostics: [] as string[] };
    const factory = diagnosticsClient(diagnosticsLookup(), calls);

    const evidence = await loadFinalSurfaceParityEvidence(
      parseFinalSurfaceParityArgs(["--request-id", REQUEST_ID]),
      factory
    );

    expect(evidence.exactAuthorshipEvidence).toEqual(exactAuthorshipFixture());
    expect(evidence.manifest).toEqual(manifest);
    expect(calls).toEqual({
      status: [REQUEST_ID],
      diagnostics: [DIAGNOSTICS_ID],
    });
  });

  test("reads retained private diagnostics without repeating the public status lookup", async () => {
    const calls = { status: [] as string[], diagnostics: [] as string[] };
    const factory = diagnosticsClient(diagnosticsLookup(), calls);

    const evidence = await loadFinalSurfaceParityEvidence(
      parseFinalSurfaceParityArgs(["--diagnostics-id", DIAGNOSTICS_ID]),
      factory
    );

    expect(evidence.manifest).toEqual(manifest);
    expect(calls).toEqual({
      status: [],
      diagnostics: [DIAGNOSTICS_ID],
    });
  });

  test("fails closed on incoherent private diagnostics and manifest references", async () => {
    const cases = [
      {
        name: "diagnostics identity",
        payload: diagnosticsRecord(),
        expected: { expectedDiagnosticsId: "another-diagnostics-id" },
        message: "diagnostics id mismatch",
      },
      {
        name: "operation kind",
        payload: diagnosticsRecordWith({ operation: { kind: "another-operation" } }),
        message: "private operation kind mismatch",
      },
      {
        name: "operation revision",
        payload: diagnosticsRecordWith({ record: { operationRevision: 5 } }),
        message: "operation revision mismatch",
      },
      {
        name: "missing manifest",
        payload: diagnosticsRecordWith({ operation: { generationManifest: undefined } }),
        message: "missing generation manifest reference",
      },
      {
        name: "manifest digest",
        payload: diagnosticsRecordWith({
          operation: {
            generationManifest: {
              ...manifestReference,
              generationManifestDigest: "another-manifest-digest",
            },
          },
        }),
        message: "generation manifest digest mismatch",
      },
      {
        name: "manifest artifact",
        payload: diagnosticsRecordWith({
          operation: {
            generationManifest: {
              ...manifestReference,
              runArtifactId: "run-another-artifact",
            },
          },
        }),
        message: "generation manifest artifact mismatch",
      },
      {
        name: "manifest request",
        payload: diagnosticsRecordWith({
          record: { requestId: "run-another-request" },
          operation: { requestId: "run-another-request" },
        }),
        message: "generation manifest request mismatch",
      },
      {
        name: "manifest correlation",
        payload: diagnosticsRecordWith({
          operation: {
            generationManifest: {
              ...manifestReference,
              correlation: {
                ...manifestReference.correlation,
                canonicalConfigDigest: "another-config-digest",
              },
            },
          },
        }),
        message: "generation manifest correlation mismatch",
      },
    ] as const;

    for (const testCase of cases) {
      await expect(
        extractFinalSurfaceParityEvidenceFromDiagnostics(
          testCase.payload,
          "expected" in testCase ? testCase.expected : undefined
        ),
        testCase.name
      ).rejects.toThrow(testCase.message);
    }
  });

  test("reports unavailable retained diagnostics as acquisition failure", async () => {
    const calls = { status: [] as string[], diagnostics: [] as string[] };
    const factory = diagnosticsClient(
      {
        ok: false,
        diagnosticsId: DIAGNOSTICS_ID,
        reason: "unavailable",
      },
      calls
    );

    await expect(
      loadFinalSurfaceParityEvidence(
        parseFinalSurfaceParityArgs(["--diagnostics-id", DIAGNOSTICS_ID]),
        factory
      )
    ).rejects.toThrow(`Studio Run in Game diagnostics ${DIAGNOSTICS_ID} unavailable`);
    expect(calls).toEqual({ status: [], diagnostics: [DIAGNOSTICS_ID] });
  });

  test("keeps incomplete exact authorship as an honest blocker without reading Civ7", async () => {
    const diagnosticsPath = await writeDiagnosticsFixture("blocked", {});
    const harness = commandHarness();

    const exitCode = await executeFinalSurfaceParityCommand(
      ["--evidence-file", diagnosticsPath],
      harness.dependencies
    );

    expect(exitCode).toBe(2);
    expect(harness.observations).toHaveLength(0);
    expect(harness.published).toHaveLength(0);
    expect(JSON.parse(harness.stdout[0] ?? "{}")).toMatchObject({
      ok: false,
      status: "correlation-blocked",
      unresolvedLinks: ["exact-authorship.invalid"],
    });
  });

  test("preserves manifest contradictions and skips the live observation", async () => {
    const diagnosticsPath = await writeDiagnosticsFixture(
      "failed",
      exactAuthorshipFixture({ requestId: "run-another-map" })
    );
    const harness = commandHarness();

    const exitCode = await executeFinalSurfaceParityCommand(
      ["--evidence-file", diagnosticsPath],
      harness.dependencies
    );

    expect(exitCode).toBe(2);
    expect(harness.observations).toHaveLength(0);
    expect(JSON.parse(harness.stdout[0] ?? "{}")).toMatchObject({
      ok: false,
      status: "correlation-failed",
      failureLinks: ["correlation.request-id"],
      unresolvedLinks: [],
    });
  });

  test("replays once, observes Civ7 once, and atomically publishes the same honest report", async () => {
    const diagnosticsPath = await writeDiagnosticsFixture("ready", exactAuthorshipFixture());
    const harness = commandHarness();
    const outputPath = join(workspaceRoot, "parity-report.json");

    const exitCode = await executeFinalSurfaceParityCommand(
      [
        "--evidence-file",
        diagnosticsPath,
        "--host",
        "127.0.0.1",
        "--port",
        "4318",
        "--timeout-ms",
        "1000",
        "--max-plots-per-read",
        "64",
        "--output",
        outputPath,
      ],
      harness.dependencies
    );

    expect(exitCode).toBe(2);
    expect(harness.observations).toEqual([
      {
        input: {
          fullGrid: {
            fields: ["terrain", "biome", "feature", "resource", "hydrology"],
            includeHidden: true,
            maxPlotsPerRead: 64,
          },
          nativeRiverObjects: { maxSamples: 16 },
        },
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1000,
        },
      },
    ]);
    expect(harness.published).toHaveLength(1);
    expect(harness.published[0]?.path).toBe(outputPath);

    const printed = JSON.parse(harness.stdout[0] ?? "{}");
    expect(harness.published[0]?.evidence).toEqual(printed);
    expect(printed).toMatchObject({
      schemaVersion: 1,
      kind: "standard-final-surface-parity",
      ok: false,
      status: "blocked-unresolved",
      correlation: {
        requestId: REQUEST_ID,
        runArtifactId: manifest.payload.runArtifactId,
      },
      observation: {
        stable: true,
        wire: {
          connectionEpoch: 17,
          endpoint: { host: "127.0.0.1", port: 4318 },
          tunerState: { id: "tuner", name: "Tuner" },
        },
        map: {
          width: TEST_MAP_SIZE.dimensions.width,
          height: TEST_MAP_SIZE.dimensions.height,
          plotCount: TEST_MAP_SIZE.dimensions.width * TEST_MAP_SIZE.dimensions.height,
          randomSeed: TEST_MAP_SEED,
        },
        game: { turn: 1 },
      },
      report: {
        state: "blocked-unresolved",
        identity: {
          gameInstance: {
            status: "unresolved",
            evidenceLinks: ["identity.cross-window-game-instance"],
          },
        },
      },
    });
    expect(printed.report.unresolvedLinks).toContain("identity.cross-window-game-instance");
    expect(harness.stdout[0]).not.toContain("reportHash");
    expect(harness.stdout[0]).not.toContain("gameHash");
  }, 20_000);

  test("returns one for missing acquisition evidence and never publishes", async () => {
    const harness = commandHarness();

    const exitCode = await executeFinalSurfaceParityCommand(
      ["--evidence-file", join(workspaceRoot, "missing-diagnostics.json")],
      harness.dependencies
    );

    expect(exitCode).toBe(1);
    expect(harness.stdout).toEqual([]);
    expect(harness.observations).toEqual([]);
    expect(harness.published).toEqual([]);
    expect(JSON.parse(harness.stderr[0] ?? "{}")).toMatchObject({
      ok: false,
      status: "error",
    });
  });

  test("returns zero only for a complete pass", () => {
    expect(finalSurfaceParityExitCode("complete-pass")).toBe(0);
    expect(finalSurfaceParityExitCode("complete-failed")).toBe(2);
    expect(finalSurfaceParityExitCode("blocked-unresolved")).toBe(2);
    expect(finalSurfaceParityExitCode("correlation-failed")).toBe(2);
    expect(finalSurfaceParityExitCode("correlation-blocked")).toBe(2);
  });
});

async function writeDiagnosticsFixture(label: string, exactAuthorshipEvidence: unknown) {
  const path = join(workspaceRoot, `${label}-diagnostics.json`);
  await writeFile(
    path,
    JSON.stringify(diagnosticsRecord({ exactAuthorshipEvidence }), null, 2),
    "utf8"
  );
  return path;
}

function exactAuthorshipFixture(
  overrides: Readonly<Record<string, unknown>> = {}
): Readonly<Record<string, unknown>> {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  return {
    status: "complete",
    requestId: REQUEST_ID,
    createdAt: CREATED_AT,
    canonicalConfigDigest: manifest.payload.canonicalConfigDigest,
    launchEnvelopeDigest: manifest.payload.launchEnvelopeDigest,
    unresolvedLinks: [],
    request: {
      recipeId: "standard",
      seed: TEST_MAP_SEED,
      gameSeed: TEST_GAME_SEED,
      mapSize: TEST_MAP_SIZE.id,
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
      mapSize: TEST_MAP_SIZE.id,
      mapSeed: TEST_MAP_SEED,
      gameSeed: TEST_GAME_SEED,
      playerCount: PLAYER_COUNT,
      rowCount: 1,
    },
    runtime: {
      seed: TEST_MAP_SEED,
      width,
      height,
      plotCount: width * height,
      turn: 1,
      gameHash: 99,
      sourceSnapshotId: "live-runtime:1",
      snapshotHash: "runtime-hash",
    },
    log: {
      requestId: REQUEST_ID,
      canonicalConfigDigest: manifest.payload.canonicalConfigDigest,
      launchEnvelopeDigest: manifest.payload.launchEnvelopeDigest,
      seed: TEST_MAP_SEED,
      mapSize: TEST_MAP_SIZE.id,
      dimensions: { width, height },
      evidencePayload: {
        recipePlan: RECIPE_PLAN,
      },
      completionPayload: {
        recipePlan: RECIPE_PLAN,
      },
      matched: [],
    },
    ...overrides,
  };
}

function diagnosticsRecord(
  args: Readonly<{
    exactAuthorshipEvidence?: unknown;
  }> = {}
) {
  return {
    diagnosticsId: DIAGNOSTICS_ID,
    requestId: REQUEST_ID,
    operationRevision: 4,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    sections: {
      operation: {
        kind: "run-in-game",
        requestId: REQUEST_ID,
        status: "complete",
        operationRevision: 4,
        generationManifest: manifestReference,
        exactAuthorshipEvidence:
          args.exactAuthorshipEvidence === undefined
            ? exactAuthorshipFixture()
            : args.exactAuthorshipEvidence,
      },
    },
  };
}

function diagnosticsRecordWith(
  overrides: Readonly<{
    record?: Readonly<Record<string, unknown>>;
    operation?: Readonly<Record<string, unknown>>;
  }>
) {
  const base = diagnosticsRecord();
  return {
    ...base,
    ...overrides.record,
    sections: {
      ...base.sections,
      operation: {
        ...base.sections.operation,
        ...overrides.operation,
      },
    },
  };
}

function diagnosticsLookup(): RunDiagnosticsLookupResult {
  return {
    ok: true,
    diagnostics: diagnosticsRecord(),
  };
}

function diagnosticsClient(
  diagnostics: RunDiagnosticsLookupResult,
  calls: Readonly<{ status: string[]; diagnostics: string[] }>
): StudioRunInGameClientFactory {
  const status: RunInGameOperationStatus = {
    requestId: REQUEST_ID,
    diagnosticsId: DIAGNOSTICS_ID,
    recoveryActions: [],
    status: "completed",
    phase: "completed",
  };
  return () => ({
    runInGame: {
      status: async ({ requestId }) => {
        calls.status.push(requestId);
        return status;
      },
      diagnostics: async ({ diagnosticsId }) => {
        calls.diagnostics.push(diagnosticsId);
        return diagnostics;
      },
    },
  });
}

function commandHarness() {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const observations: Array<Readonly<{ input: unknown; options: unknown }>> = [];
  const published: PublishJsonEvidenceOptions[] = [];
  return {
    stdout,
    stderr,
    observations,
    published,
    dependencies: {
      stdout: (message: string) => stdout.push(message),
      stderr: (message: string) => stderr.push(message),
      observeMapSurface: async (input: unknown, options: unknown) => {
        observations.push({ input, options });
        return liveObservationFixture();
      },
      publish: (options: PublishJsonEvidenceOptions) => {
        published.push(options);
        return {
          path: options.path,
          byteLength: JSON.stringify(options.evidence, null, 2).length,
        };
      },
    },
  };
}

function liveObservationFixture(): StandardLiveObservation {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const plotCount = width * height;
  const plotsByIndex = new Array<StandardLiveObservation["surface"]["plotsByIndex"][number]>(
    plotCount
  ).fill(null);
  return {
    identity: {
      stable: true,
      checked: [
        "wire.connectionEpoch",
        "wire.endpoint.host",
        "wire.endpoint.port",
        "wire.tunerState.id",
        "wire.tunerState.name",
        "map.width",
        "map.height",
        "map.plotCount",
        "map.randomSeed",
        "game.turn",
      ],
      wire: {
        connectionEpoch: 17,
        endpoint: { host: "127.0.0.1", port: 4318 },
        tunerState: { id: "tuner", name: "Tuner" },
      },
      map: {
        width,
        height,
        plotCount,
        randomSeed: TEST_MAP_SEED,
      },
      game: { turn: 1 },
    },
    surface: {
      width,
      height,
      plotCount,
      observedPlotCount: 0,
      plotsByIndex,
      missingPlotIndices: Array.from({ length: plotCount }, (_, index) => index),
    },
    nativeRiverObjects: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "tuner", name: "Tuner" },
      exists: false,
      numRivers: { ok: false, error: "No native river objects in command fixture." },
      samples: [],
      truncated: false,
    },
  };
}
