import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7AppUiSnapshotProcedureDescriptor,
  Civ7AppUiSnapshotProcedureSchemaArtifacts,
  callCiv7AppUiSnapshotProcedure,
  getCiv7AppUiSnapshot,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  type AppUiSnapshotDependencies,
} from "../src/index";

describe("Civ7 App UI snapshot procedure descriptor", () => {
  test("records the App UI snapshot runtime atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7AppUiSnapshotProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "runtime.app.ui.snapshot",
      family: "runtime",
      risk: "runtime-support",
      atomOwner: "packages/civ7-direct-control/src/runtime/app-ui-snapshot.ts",
      atomFunction: "getCiv7AppUiSnapshot",
      normalCliProjection: "omitted",
      debugServiceProjection: "raw-diagnostic-projection",
      aiIngestionProjection: "omitted",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7AppUiSnapshot.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7AppUiSnapshotProcedureDescriptor,
      Civ7AppUiSnapshotProcedureSchemaArtifacts,
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual([]);
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7AppUiSnapshotProcedureDescriptor.outputFields),
    );
    expect(Value.Check(resolved.inputSchema, {})).toBe(true);
    expect(Value.Check(resolved.inputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { port: 4318 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { state: { role: "app-ui" } })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { session: { state: "App UI" } })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { command: "Game.turn" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { rawCommand: "Game.turn" })).toBe(false);
    expect(Value.Check(resolved.outputSchema, appUiSnapshotResult())).toBe(true);
    expect(Value.Check(resolved.outputSchema, {
      ...appUiSnapshotResult(),
      rawCommand: "Game.turn",
    })).toBe(false);
  });

  test("calls the App UI snapshot atom through the procedure core without touching the live tuner", async () => {
    const calls: Array<{ host?: string; port?: number; command: string }> = [];
    const dependencies: AppUiSnapshotDependencies = {
      executeAppUiCommand: async (options) => {
        calls.push({
          host: options.host,
          port: options.port,
          command: options.command,
        });
        return {
          host: options.host ?? "127.0.0.1",
          port: options.port ?? 4318,
          state: { id: "65535", name: "App UI" },
          output: [JSON.stringify(appUiSnapshotResult().snapshot)],
        };
      },
    };

    const result = await callCiv7AppUiSnapshotProcedure({}, {
      directControl: {
        host: "127.0.0.1",
        port: 4318,
      },
      procedure: {
        correlationId: "app-ui-snapshot-procedure-test",
      },
      dependencies,
    });

    expect(result.output).toEqual(appUiSnapshotResult());
    expect(result.diagnostics).toMatchObject({
      procedureKey: "runtime.app.ui.snapshot",
      correlationId: "app-ui-snapshot-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "debug-observer-only",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(calls[0]?.command).toContain("Network.isInSession");
    expect(calls[0]?.command).toContain("GameContext.localPlayerID");
  });

  test("rejects context-owned procedure input before App UI dependencies run", async () => {
    let touchedRuntime = false;
    const dependencies: AppUiSnapshotDependencies = {
      executeAppUiCommand: async () => {
        touchedRuntime = true;
        throw new Error("executeAppUiCommand should not run after procedure input rejection");
      },
    };

    await expect(callCiv7AppUiSnapshotProcedure({ host: "127.0.0.1" } as never, {
      procedure: { correlationId: "app-ui-snapshot-invalid-input" },
      dependencies,
    })).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "runtime.app.ui.snapshot",
        role: "input",
      },
    });
    expect(touchedRuntime).toBe(false);
  });
});

function appUiSnapshotResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    snapshot: {
      network: {
        isInSession: { ok: true, value: true },
        numPlayers: { ok: true, value: 2 },
        hostPlayerId: { ok: true, value: 0 },
        isConnectedToNetwork: { ok: true, value: true },
        isAuthenticated: { ok: true, value: true },
        isLoggedIn: { ok: true, value: true },
      },
      autoplay: {
        isActive: false,
        turns: 0,
        isPaused: false,
        isPausedOrPending: false,
        observeAsPlayer: -1,
        returnAsPlayer: -1,
      },
      game: {
        turn: 2,
        age: 0,
        maxTurns: 500,
        turnDate: { ok: true, value: "3975 BCE" },
        hash: { ok: true, value: 123456 },
      },
      ui: {
        inGame: { ok: true, value: true },
        inShell: { ok: true, value: false },
        inLoading: { ok: true, value: false },
        loadingState: { ok: true, value: 4 },
        loadingStateName: "GameStarted",
        canBeginGame: { ok: true, value: false },
        canNotifyUIReady: "function",
        skipStartButton: { ok: true, value: false },
        automationActive: { ok: true, value: false },
      },
      gameContext: {
        localPlayerID: 0,
        localObserverID: 0,
        hasRequestedPause: { ok: true, value: false },
      },
      players: {
        maxPlayers: 8,
        aliveIds: { ok: true, value: [0, 62] },
        aliveHumanIds: { ok: true, value: [0] },
        numAliveHumans: { ok: true, value: 1 },
      },
      map: {
        width: { ok: true, value: 84 },
        height: { ok: true, value: 54 },
        plotCount: { ok: true, value: 4536 },
        mapSize: { ok: true, value: 0 },
        randomSeed: { ok: true, value: 12345 },
      },
    },
  };
}
