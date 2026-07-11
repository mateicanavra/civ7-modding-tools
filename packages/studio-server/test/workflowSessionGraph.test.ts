import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Civ7CommandResult, Civ7DirectControlSession } from "@civ7/direct-control";
import { Effect, Layer } from "effect";
import { describe, expect, test, vi } from "vitest";

import {
  Civ7WorkflowControl,
  Civ7WorkflowControlLive,
  type RunInGameDeployment,
  type RunInGamePreparedRequest,
} from "../src/ports";
import {
  Civ7TunerSession,
  type Civ7TunerSessionApi,
  makeCiv7TunerSessionLayer,
} from "../src/services/Civ7TunerSession";

describe("Studio workflow session graph", () => {
  test("workflow control depends on the runtime-owned Civ7TunerSession layer", () => {
    const root = dirname(dirname(fileURLToPath(import.meta.url)));
    const workflowControl = readFileSync(join(root, "src/ports/Civ7WorkflowControl.ts"), "utf8");
    const operationRuntime = readFileSync(
      join(root, "src/operationRuntime/StudioOperationRuntime.ts"),
      "utf8"
    );
    const runtime = readFileSync(join(root, "src/runtime.ts"), "utf8");

    expect(workflowControl).toContain("yield* Civ7TunerSession");
    expect(workflowControl).not.toContain("Civ7TunerSessionLive");
    expect(workflowControl).not.toContain("makeCiv7TunerSessionLayer");
    expect(workflowControl).not.toMatch(/\bnew\s+Civ7DirectControlSession\s*\(/);
    expect(workflowControl).not.toMatch(/Civ7WorkflowControlLive[\s\S]*Layer\.provide/);

    expect(operationRuntime).toContain("Civ7WorkflowControlLive");
    expect(operationRuntime).toContain("Civ7TunerSession");
    expect(runtime).toContain("const civ7TunerSessionLayer = Civ7TunerSessionLive");
    expect(runtime).not.toContain(".pipe(Layer.provide(civ7TunerSessionLayer))");
  });

  test("workflow control consumes an externally supplied tuner session service", async () => {
    let useCalls = 0;
    const fakeSession: Civ7TunerSessionApi = {
      session: {} as Civ7TunerSessionApi["session"],
      use: () =>
        Effect.sync(() => {
          useCalls += 1;
          return { ok: true };
        }),
      health: Effect.succeed({
        consecutiveResponseTimeouts: 0,
        gateOpenUntil: null,
        wedgeSuspected: false,
      }),
    };
    const layer = Civ7WorkflowControlLive.pipe(
      Layer.provide(Layer.succeed(Civ7TunerSession, fakeSession))
    );
    const prepared: RunInGamePreparedRequest = {
      request: {
        recipeId: "mod-swooper-maps/standard",
      },
    };
    const deployment: RunInGameDeployment = {};

    await Effect.runPromise(
      Effect.gen(function* () {
        const workflowControl = yield* Civ7WorkflowControl;
        yield* workflowControl.checkPlayable({
          requestId: "run-1",
          prepared,
          deployment,
        });
      }).pipe(Effect.provide(layer))
    );

    expect(useCalls).toBe(1);
  });

  test("tuner session preserves direct-control rejection causes across the Effect boundary", async () => {
    const directControlError = new Error("Unable to reach Civ7 tuner socket on 127.0.0.1:4318");

    const failure = await Effect.runPromise(
      Effect.gen(function* () {
        const tuner = yield* Civ7TunerSession;
        return yield* Effect.flip(tuner.use(() => Promise.reject(directControlError)));
      }).pipe(Effect.provide(makeCiv7TunerSessionLayer()))
    );

    expect(failure).toBe(directControlError);
  });

  test("prepareSetup classifies a missing generated mod before row setup", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    const operations: string[] = [];
    const layer = workflowLayerWithCommandResponder((command) => {
      const setupRowsInput = parseSetupRowsInput(command);
      if (setupRowsInput) {
        operations.push(setupRowsInput.file ? "setup-map-rows-filtered" : "setup-map-rows-all");
        return setupRowsInput.file
          ? setupCommandResult({
              rows: [],
              limit: setupRowsInput.limit,
              matchedFile: setupRowsInput.file,
            })
          : setupCommandResult({
              rows: [{ source: "setup-domain", file: "{base-standard}/maps/continents.js" }],
              limit: setupRowsInput.limit,
            });
      }
      if (command.includes("refreshEnabledMods")) {
        operations.push("target-mod-reconcile");
        return targetModReconciliationCommandResult({ targetActive: false });
      }
      if (command.includes("return JSON.stringify({ snapshot: readSetupSnapshot() })")) {
        operations.push("setup-snapshot");
        return setupSnapshotCommandResult({ phase: "shell" });
      }
      if (command === "UI.reloadUI()") {
        operations.push("reload-ui");
        return setupCommandResult(null);
      }
      if (command === 'engine.call("exitToMainMenu")') {
        operations.push("exit-to-main-menu");
        return setupCommandResult(null);
      }
      if (command === "Network.restartGame()") {
        operations.push("restart-game");
        return setupCommandResult(null);
      }
      return setupCommandResult(null);
    });

    try {
      const resultPromise = Effect.runPromise(
        Effect.gen(function* () {
          const workflowControl = yield* Civ7WorkflowControl;
          return yield* Effect.either(
            workflowControl.prepareSetup({
              requestId: "run-workflow-disabled-mod",
              prepared: preparedRunRequest(),
              deployment: deployedRun(),
            })
          );
        }).pipe(Effect.provide(layer))
      );

      await vi.advanceTimersByTimeAsync(91_000);
      const result = await resultPromise;

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toMatchObject({
          tag: "VerificationFailed",
          diagnostics: {
            code: "generated-map-mod-not-enabled",
            setupFailureReason: "generated-map-mod-not-enabled",
          },
          recoveryActions: expect.not.arrayContaining(["exit-to-shell-and-continue"]),
        });
        expect(String(result.left.diagnostics.targetModReconciliation)).toContain(
          '"targetActive":false'
        );
      }
      expect(operations).toEqual(
        expect.arrayContaining(["setup-snapshot", "target-mod-reconcile"])
      );
      expect(operations).not.toContain("active-target-mods");
      expect(operations).not.toContain("setup-map-rows-filtered");
      expect(operations).not.toContain("restart-game");
    } finally {
      vi.useRealTimers();
    }
  });

  test("prepareSetup uses the soft setup refresh for durable generated rows", async () => {
    const operations: string[] = [];
    let filteredReads = 0;
    const layer = workflowLayerWithCommandResponder((command) => {
      const setupRowsInput = parseSetupRowsInput(command);
      if (setupRowsInput) {
        operations.push(setupRowsInput.file ? "setup-map-rows-filtered" : "setup-map-rows-all");
        if (!setupRowsInput.file) {
          return setupCommandResult({ rows: [], limit: setupRowsInput.limit });
        }
        filteredReads += 1;
        return setupCommandResult({
          rows: filteredReads === 1 ? [] : [{ source: "setup-domain", file: setupRowsInput.file }],
          limit: setupRowsInput.limit,
          matchedFile: setupRowsInput.file,
        });
      }
      if (command.includes("return JSON.stringify({ snapshot: readSetupSnapshot() })")) {
        operations.push("setup-snapshot");
        return setupSnapshotCommandResult({
          phase: "shell",
          mapVisible: filteredReads > 1,
        });
      }
      if (command.includes("refreshEnabledMods")) {
        operations.push("target-mod-reconcile");
        return targetModReconciliationCommandResult();
      }
      if (command.includes("editMap.setScript(input.mapScript)")) {
        operations.push("prepare-setup");
        return setupPreparationCommandResult();
      }
      if (command === "UI.reloadUI()") {
        operations.push("reload-ui");
        return setupCommandResult(null);
      }
      if (command === 'engine.call("exitToMainMenu")') {
        operations.push("exit-to-main-menu");
        return setupCommandResult(null);
      }
      if (command === "Network.restartGame()") {
        operations.push("restart-game");
        return setupCommandResult(null);
      }
      return setupCommandResult(null);
    });

    const setup = await Effect.runPromise(
      Effect.gen(function* () {
        const workflowControl = yield* Civ7WorkflowControl;
        return yield* workflowControl.prepareSetup({
          requestId: "run-workflow-durable-soft-refresh",
          prepared: preparedRunRequest(),
          deployment: deployedRun(),
        });
      }).pipe(Effect.provide(layer))
    );

    expect(setup.softRefreshPerformed).toBe(true);
    expect(setup.rowEvidence?.rows).toEqual([
      { source: "setup-domain", file: "{mod-swooper-studio-run}/maps/studio-run.js" },
    ]);
    expect(filteredReads).toBeGreaterThan(1);
    expect(operations).toEqual(
      expect.arrayContaining(["setup-snapshot", "target-mod-reconcile", "reload-ui"])
    );
    expect(operations).not.toContain("active-target-mods");
    expect(operations).not.toContain("restart-game");
  });

  test("prepareSetup exits a running game before the soft setup refresh", async () => {
    const operations: string[] = [];
    let filteredReads = 0;
    let snapshotReads = 0;
    const layer = workflowLayerWithCommandResponder((command) => {
      const setupRowsInput = parseSetupRowsInput(command);
      if (setupRowsInput) {
        operations.push(setupRowsInput.file ? "setup-map-rows-filtered" : "setup-map-rows-all");
        filteredReads += setupRowsInput.file ? 1 : 0;
        return setupCommandResult({
          rows:
            setupRowsInput.file && filteredReads > 1
              ? [{ source: "setup-domain", file: setupRowsInput.file }]
              : [],
          limit: setupRowsInput.limit,
          ...(setupRowsInput.file ? { matchedFile: setupRowsInput.file } : {}),
        });
      }
      if (command.includes("return JSON.stringify({ snapshot: readSetupSnapshot() })")) {
        operations.push("setup-snapshot");
        snapshotReads += 1;
        return setupSnapshotCommandResult({
          phase: snapshotReads === 1 ? "running-game" : "shell",
          mapVisible: filteredReads > 1,
        });
      }
      if (command.includes("refreshEnabledMods")) {
        operations.push("target-mod-reconcile");
        return targetModReconciliationCommandResult();
      }
      if (command.includes("editMap.setScript(input.mapScript)")) {
        operations.push("prepare-setup");
        return setupPreparationCommandResult();
      }
      if (command === 'engine.call("exitToMainMenu")') {
        operations.push("exit-to-main-menu");
        return setupCommandResult(null);
      }
      if (command === "UI.reloadUI()") {
        operations.push("reload-ui");
        return setupCommandResult(null);
      }
      if (command === "Network.restartGame()") {
        operations.push("restart-game");
        return setupCommandResult(null);
      }
      return setupCommandResult(null);
    });

    const setup = await Effect.runPromise(
      Effect.gen(function* () {
        const workflowControl = yield* Civ7WorkflowControl;
        return yield* workflowControl.prepareSetup({
          requestId: "run-workflow-running-game-soft-refresh",
          prepared: preparedRunRequest(),
          deployment: deployedRun(),
        });
      }).pipe(Effect.provide(layer))
    );

    expect(setup.softRefreshPerformed).toBe(true);
    expect(setup.rowEvidence?.rows).toEqual([
      { source: "setup-domain", file: "{mod-swooper-studio-run}/maps/studio-run.js" },
    ]);
    expect(operations).toEqual(
      expect.arrayContaining([
        "exit-to-main-menu",
        "target-mod-reconcile",
        "reload-ui",
        "setup-map-rows-filtered",
      ])
    );
    expect(operations.indexOf("exit-to-main-menu")).toBeLessThan(operations.indexOf("reload-ui"));
    expect(operations).not.toContain("active-target-mods");
    expect(operations).not.toContain("restart-game");
  });
});

function workflowLayerWithCommandResponder(
  respond: (command: string) => Civ7CommandResult
): Layer.Layer<Civ7WorkflowControl, never, never> {
  const session = {
    stats: { consecutiveResponseTimeouts: 0 },
    executeCommand: async (options: { readonly command: string }) => respond(options.command),
    close: async () => {},
    queryStates: async () => [{ id: "65535", name: "App UI" }],
  } as unknown as Civ7DirectControlSession;
  const fakeSession: Civ7TunerSessionApi = {
    session,
    use: (run) => Effect.tryPromise({ try: () => run({ session }), catch: (err) => err }),
    health: Effect.succeed({
      consecutiveResponseTimeouts: 0,
      gateOpenUntil: null,
      wedgeSuspected: false,
    }),
  };
  return Civ7WorkflowControlLive.pipe(Layer.provide(Layer.succeed(Civ7TunerSession, fakeSession)));
}

function setupCommandResult(payload: unknown): Civ7CommandResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    output: [JSON.stringify(payload)],
  };
}

function targetModReconciliationCommandResult(
  input: { readonly targetActive?: boolean } = {}
): Civ7CommandResult {
  const targetActive = input.targetActive ?? true;
  return setupCommandResult({
    targetModId: "mod-swooper-studio-run",
    targetInstalled: true,
    targetWasEnabled: true,
    enabledModCount: targetActive ? 1 : 0,
    enabledModsMetaSource: "Configuration.editGame",
    enabledModsMetaUpdated: !targetActive,
    enabledModsMetaModCount: 1,
    enabledModsMetaContainsTarget: true,
    targetActive,
  });
}

function setupSnapshotCommandResult(input: {
  readonly phase: "shell" | "running-game";
  readonly mapVisible?: boolean;
  readonly prepared?: boolean;
}): Civ7CommandResult {
  return setupCommandResult({ snapshot: setupSnapshot(input) });
}

function setupPreparationCommandResult(): Civ7CommandResult {
  return setupCommandResult({
    before: setupSnapshot({ phase: "shell", mapVisible: true }),
    after: setupSnapshot({ phase: "shell", mapVisible: true, prepared: true }),
    applied: {
      Map: "{mod-swooper-studio-run}/maps/studio-run.js",
      MapSize: "MAPSIZE_HUGE",
      MapRandomSeed: 123,
      GameRandomSeed: 123,
    },
  });
}

function setupSnapshot(input: {
  readonly phase: "shell" | "running-game";
  readonly mapVisible?: boolean;
  readonly prepared?: boolean;
}) {
  return {
    phase: input.phase,
    ui: {
      inGame: input.phase === "running-game",
      inShell: input.phase === "shell",
      inLoading: false,
      loadingState: 0,
      loadingStateName: "NotStarted",
      canBeginGame: false,
    },
    setup: {
      revision: { ok: true, value: 1 },
      parameters: input.prepared
        ? [
            { id: "Map", exists: true, value: "{mod-swooper-studio-run}/maps/studio-run.js" },
            { id: "MapSize", exists: true, value: "MAPSIZE_HUGE" },
            { id: "MapRandomSeed", exists: true, value: 123 },
            { id: "GameRandomSeed", exists: true, value: 123 },
          ]
        : [],
      playerParameters: [],
      localPlayerId: { ok: true, value: 0 },
    },
    mapRows: input.mapVisible
      ? [{ source: "setup-domain", file: "{mod-swooper-studio-run}/maps/studio-run.js" }]
      : [],
    config: {
      mapScript: input.prepared
        ? { ok: true, value: "{mod-swooper-studio-run}/maps/studio-run.js" }
        : { ok: false, error: "unavailable" },
      mapSize: input.prepared
        ? { ok: true, value: "MAPSIZE_HUGE" }
        : { ok: false, error: "unavailable" },
      mapSeed: input.prepared ? { ok: true, value: 123 } : { ok: false, error: "unavailable" },
      gameSeed: input.prepared ? { ok: true, value: 123 } : { ok: false, error: "unavailable" },
      playerCount: { ok: false, error: "unavailable" },
    },
  };
}

function parseSetupRowsInput(command: string): { file?: string; limit: number } | undefined {
  if (!command.includes("const rows = readSetupMapRows(input.file)")) return undefined;
  const match = /const input = (\{.*?\});\n\s+const rows/s.exec(command);
  return match ? (JSON.parse(match[1]) as { file?: string; limit: number }) : undefined;
}

function preparedRunRequest(): RunInGamePreparedRequest {
  const source = {
    kind: "catalog" as const,
    sourcePath: "mods/mod-swooper-maps/src/maps/configs/test-of-time.config.json",
    canonicalConfig: {
      id: "test-of-time",
      name: "Test of Time",
      description: "Workflow fixture.",
      recipe: "standard",
      sortIndex: 1,
      latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
      config: {},
    },
  };
  const launchEnvelope = {
    recipeSettings: { recipe: "mod-swooper-maps/standard", seed: 123 },
    worldSettings: { mapSize: "MAPSIZE_HUGE" },
    setupConfig: { gameOptions: {}, playerOptions: [{ playerId: 0, options: {} }] },
    source,
  };
  const launchSourceDigest = {
    canonicalConfigDigest: "canonical-config-digest",
  };
  return {
    request: {
      recipeId: "mod-swooper-maps/standard",
      mapSize: "MAPSIZE_HUGE",
      seed: 123,
      setupConfig: launchEnvelope.setupConfig,
      sourceSnapshot: {
        requestId: "run-workflow-disabled-mod",
        source: { kind: "catalog", sourcePath: source.sourcePath },
        canonicalConfigDigest: launchSourceDigest.canonicalConfigDigest,
        launchEnvelopeDigest: "envelope-digest",
      },
      launchEnvelope,
      launchSourceDigest,
      launchEnvelopeDigest: "envelope-digest",
    },
    launchEnvelope,
    launchSourceDigest,
    launchEnvelopeDigest: "envelope-digest",
  } as RunInGamePreparedRequest;
}

function deployedRun(): RunInGameDeployment {
  return {
    runDeployment: {
      requestId: "run-workflow-disabled-mod",
      deployedModId: "mod-swooper-studio-run",
      generatedModRoot: "/tmp/mod-swooper-studio-run",
      generatedModDigest: "sha256:generated",
      targetRoot: "/tmp/Civ7/Mods/mod-swooper-studio-run",
      startedAt: "2026-07-08T00:00:00.000Z",
      completedAt: "2026-07-08T00:00:00.000Z",
      filesCopied: 1,
    },
    deployedSnapshot: {
      requestId: "run-workflow-disabled-mod",
      deployedModId: "mod-swooper-studio-run",
      targetRoot: "/tmp/Civ7/Mods/mod-swooper-studio-run",
      observedAt: "2026-07-08T00:00:00.000Z",
      fileCount: 1,
      digest: "sha256:snapshot",
      files: [],
    },
    materialization: {
      mapScript: "{mod-swooper-studio-run}/maps/studio-run.js",
      canonicalConfigDigest: "config-hash",
      launchEnvelopeDigest: "envelope-hash",
      generationManifestDigest: "manifest-digest",
      runArtifactId: "run-artifact",
      generatedModRoot: "/tmp/mod-swooper-studio-run",
      generatedModFileCount: 1,
      generatedModDigest: "sha256:generated",
      mapRowId: "run-test",
    },
  } as RunInGameDeployment;
}
