import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7PlayableStatusProcedureDescriptor,
  Civ7PlayableStatusProcedureSchemaArtifacts,
  callCiv7PlayableStatusProcedure,
  getCiv7PlayableStatus,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  type PlayableStatusDependencies,
} from "../src/index";

describe("Civ7 playable-status procedure descriptor", () => {
  test("records the runtime read atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7PlayableStatusProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "runtime.playable.status",
      family: "runtime",
      risk: "runtime-support",
      atomOwner: "packages/civ7-direct-control/src/runtime/playable-status.ts",
      atomFunction: "getCiv7PlayableStatus",
      normalCliProjection: "summarized-state-machine-status",
      debugServiceProjection: "raw-diagnostic-projection",
      aiIngestionProjection: "omitted",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7PlayableStatus.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7PlayableStatusProcedureDescriptor,
      Civ7PlayableStatusProcedureSchemaArtifacts,
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual([]);
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7PlayableStatusProcedureDescriptor.outputFields),
    );
    expect(Value.Check(resolved.inputSchema, {})).toBe(true);
    expect(Value.Check(resolved.inputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { port: 4318 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { state: { role: "tuner" } })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { stateName: "Tuner" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { session: { state: "Tuner" } })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { command: "Game.turn" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { rawCommand: "Game.turn" })).toBe(false);
    expect(Value.Check(resolved.outputSchema, playableStatusResult())).toBe(true);
    expect(Value.Check(resolved.outputSchema, unavailablePlayableStatusResult())).toBe(true);
    expect(Value.Check(resolved.outputSchema, {
      ...playableStatusResult(),
      command: "Game.turn",
    })).toBe(false);
  });

  test("calls the playable-status atom through the procedure core without touching the live tuner", async () => {
    const calls: Array<{ kind: "app-ui" | "tuner"; host?: string; port?: number }> = [];
    const dependencies: PlayableStatusDependencies = {
      getAppUiSnapshot: async (options) => {
        calls.push({ kind: "app-ui", host: options?.host, port: options?.port });
        return playableStatusResult().appUi;
      },
      checkTunerHealth: async (options) => {
        calls.push({ kind: "tuner", host: options?.host, port: options?.port });
        return playableStatusResult().tuner;
      },
      errorMessage: (err) => err instanceof Error ? err.message : String(err),
    };

    const result = await callCiv7PlayableStatusProcedure({}, {
      directControl: {
        host: "127.0.0.1",
        port: 4318,
      },
      procedure: {
        correlationId: "playable-status-procedure-test",
      },
      dependencies,
    });

    expect(result.output).toEqual(playableStatusResult());
    expect(result.diagnostics).toMatchObject({
      procedureKey: "runtime.playable.status",
      correlationId: "playable-status-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "debug-observer-only",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(calls).toEqual([
      { kind: "app-ui", host: "127.0.0.1", port: 4318 },
      { kind: "tuner", host: "127.0.0.1", port: 4318 },
    ]);
  });

  test("keeps tuner-health failures as validated procedure output", async () => {
    const dependencies: PlayableStatusDependencies = {
      getAppUiSnapshot: async () => unavailablePlayableStatusResult().appUi,
      checkTunerHealth: async () => {
        throw new Error("Tuner socket unavailable");
      },
      errorMessage: (err) => err instanceof Error ? err.message : String(err),
    };

    const result = await callCiv7PlayableStatusProcedure({}, {
      procedure: { correlationId: "playable-status-unavailable" },
      dependencies,
    });

    expect(result.output).toEqual(unavailablePlayableStatusResult());
    expect(result.output.tuner).toBeUndefined();
    expect(result.output.errors).toEqual(["Tuner socket unavailable"]);
    expect(result.diagnostics).toMatchObject({
      procedureKey: "runtime.playable.status",
      correlationId: "playable-status-unavailable",
    });
  });

  test("rejects context-owned procedure input before playable-status dependencies run", async () => {
    let touchedRuntime = false;
    const dependencies: PlayableStatusDependencies = {
      getAppUiSnapshot: async () => {
        touchedRuntime = true;
        throw new Error("getAppUiSnapshot should not run after procedure input rejection");
      },
      checkTunerHealth: async () => {
        touchedRuntime = true;
        throw new Error("checkTunerHealth should not run after procedure input rejection");
      },
      errorMessage: (err) => String(err),
    };

    await expect(callCiv7PlayableStatusProcedure({ host: "127.0.0.1" } as never, {
      procedure: { correlationId: "playable-status-invalid-input" },
      dependencies,
    })).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "runtime.playable.status",
        role: "input",
      },
    });
    expect(touchedRuntime).toBe(false);
  });
});

function playableStatusResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    playable: true,
    readiness: "tuner-ready",
    appUi: {
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
          turn: 1,
          age: 0,
          maxTurns: 500,
          turnDate: { ok: true, value: "4000 BCE" },
          hash: { ok: true, value: 123 },
        },
        ui: {
          inGame: { ok: true, value: true },
          inShell: { ok: true, value: false },
          inLoading: { ok: true, value: false },
          loadingState: { ok: true, value: 8 },
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
          aliveIds: { ok: true, value: [0, 1] },
          aliveHumanIds: { ok: true, value: [0] },
          numAliveHumans: { ok: true, value: 1 },
        },
        map: {
          width: { ok: true, value: 84 },
          height: { ok: true, value: 54 },
          plotCount: { ok: true, value: 4536 },
          mapSize: { ok: true, value: 0 },
          randomSeed: { ok: true, value: 42 },
        },
      },
    },
    tuner: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "1", name: "Tuner" },
      ready: true,
      snapshot: {
        evalOk: 2,
        ready: true,
        globals: {
          Game: "object",
          Autoplay: "object",
          GameplayMap: "object",
          Players: "object",
          Network: "undefined",
        },
        turn: { ok: true, value: 1 },
        turnDate: { ok: true, value: "4000 BCE" },
        width: { ok: true, value: 84 },
        height: { ok: true, value: 54 },
        aliveIds: { ok: true, value: [0, 1] },
        aliveHumanIds: { ok: true, value: [0] },
        autoplayActive: { ok: true, value: false },
      },
    },
    errors: [],
  };
}

function unavailablePlayableStatusResult() {
  const failed = (error: string) => ({ ok: false as const, error });
  const { tuner: _tuner, ...base } = playableStatusResult();
  return {
    ...base,
    playable: false,
    readiness: "unavailable",
    appUi: {
      ...base.appUi,
      snapshot: {
        ...base.appUi.snapshot,
        network: {
          isInSession: failed("Network unavailable"),
          numPlayers: failed("Network unavailable"),
          hostPlayerId: failed("Network unavailable"),
          isConnectedToNetwork: failed("Network unavailable"),
          isAuthenticated: failed("Network unavailable"),
          isLoggedIn: failed("Network unavailable"),
        },
        ui: {
          ...base.appUi.snapshot.ui,
          inGame: failed("UI unavailable"),
          inShell: failed("UI unavailable"),
          inLoading: failed("UI unavailable"),
          loadingState: failed("UI unavailable"),
          loadingStateName: null,
          canBeginGame: failed("UI unavailable"),
        },
      },
    },
    errors: ["Tuner socket unavailable"],
  };
}
