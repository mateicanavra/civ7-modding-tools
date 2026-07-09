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
      correlationDigest: "fingerprint-1",
      request: {
        recipeId: "mod-swooper-maps/standard",
        fingerprint: "fingerprint-1",
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

  test("prepareSetup classifies a missing setup row from live workflow readbacks", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    const operations: string[] = [];
    const layer = workflowLayerWithCommandResponder((command) => {
      const setupRowsInput = parseSetupRowsInput(command);
      if (setupRowsInput) {
        operations.push(setupRowsInput.file ? "setup-map-rows-filtered" : "setup-map-rows-all");
        return setupRowsInput.file
          ? setupCommandResult({ rows: [], limit: setupRowsInput.limit, matchedFile: setupRowsInput.file })
          : setupCommandResult({
              rows: [{ source: "setup-domain", file: "{base-standard}/maps/continents.js" }],
              limit: setupRowsInput.limit,
            });
      }
      if (command.includes("Modding.getActiveMods")) {
        operations.push("active-target-mods");
        return setupCommandResult({
          available: true,
          identityAvailable: true,
          mods: [{ id: "base-standard", source: "Configuration.getGame", enabled: true }],
          limit: 100,
          truncated: false,
          readbacks: [
            {
              source: "Configuration.getGame",
              available: true,
              identityReadable: true,
              count: 1,
              identityCount: 1,
              truncated: false,
            },
          ],
        });
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
          tag: "ProofFailed",
          diagnostics: {
            code: "generated-map-mod-not-enabled",
            setupFailureReason: "generated-map-mod-not-enabled",
          },
        });
        expect(String(result.left.diagnostics.activeTargetModSet)).toContain(
          '"identityAvailable":true'
        );
        expect(String(result.left.diagnostics.activeTargetModSet)).toContain('"truncated":false');
      }
      expect(operations).toEqual(
        expect.arrayContaining([
          "setup-map-rows-filtered",
          "setup-map-rows-all",
          "active-target-mods",
        ])
      );
    } finally {
      vi.useRealTimers();
    }
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
    use: (run) => Effect.tryPromise(() => run({ session })),
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

function parseSetupRowsInput(command: string): { file?: string; limit: number } | undefined {
  if (!command.includes("const rows = readSetupMapRows(input.file)")) return undefined;
  const match = /const input = (\{.*?\});\n\s+const rows/s.exec(command);
  return match ? (JSON.parse(match[1]) as { file?: string; limit: number }) : undefined;
}

function preparedRunRequest(): RunInGamePreparedRequest {
  return {
    correlationDigest: "fingerprint-1",
    request: {
      recipeId: "mod-swooper-maps/standard",
      fingerprint: "fingerprint-1",
      mapSize: "MAPSIZE_HUGE",
      seed: 123,
      selectedConfigId: "test-of-time",
      setupConfig: {},
      materializationMode: "durable",
      resolvedLaunchSource: { type: "config", id: "test-of-time" },
      launchEnvelope: {},
      launchSourceDigest: "source-digest",
      launchEnvelopeDigest: "envelope-digest",
    },
    resolvedLaunchSource: { type: "config", id: "test-of-time" },
    launchEnvelope: {},
    launchSourceDigest: "source-digest",
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
      mapScript: "{mod-swooper-studio-run}/maps/run-test.js",
      configHash: "config-hash",
      envelopeHash: "envelope-hash",
      generationManifestDigest: "manifest-digest",
      runArtifactId: "run-artifact",
      generatedModRoot: "/tmp/mod-swooper-studio-run",
      generatedModFileCount: 1,
      generatedModDigest: "sha256:generated",
      mapRowId: "run-test",
    },
  } as RunInGameDeployment;
}
