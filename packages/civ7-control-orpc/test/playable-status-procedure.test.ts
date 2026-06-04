import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7DirectControlUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
} from "../src/index";

describe("runtime.playable.status control-oRPC procedure", () => {
  test("calls the direct-control atom through Effect/oRPC without network transport", async () => {
    const fixture = playableStatusResult();
    const fake = fakeContext(fixture);

    const result = await call(Civ7ControlOrpcRouter.runtime.playable.status, {}, {
      context: fake.context,
    });

    expect(result).toEqual(fixture);
    expect(fake.calls).toEqual([
      {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    ]);
  });

  test("supports an in-process server-side router client", async () => {
    const fixture = playableStatusResult();
    const fake = fakeContext(fixture);
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.runtime.playable.status({});

    expect(result).toEqual(fixture);
    expect(fake.calls).toHaveLength(1);
  });

  test("keeps endpoint/session/state/raw command fields out of procedure input", async () => {
    const invalidInputs = [
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "tuner" } },
      { stateName: "Tuner" },
      { session: { state: "Tuner" } },
      { command: "Game.turn" },
      { rawCommand: "Game.turn" },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(playableStatusResult());

      await expect(
        call(Civ7ControlOrpcRouter.runtime.playable.status, input as never, {
          context: fake.context,
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls).toEqual([]);
    }
  });

  test("maps direct-control facade failures to a tagged Effect/oRPC error without raw details", async () => {
    const context: Civ7ControlOrpcContext = {
      directControl: {
        getCiv7MapSummary: async () => {
          throw new Error("not used");
        },
        getCiv7PlayableStatus: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:1:Game.turn",
          );
        },
      },
    };

    await expect(
      call(Civ7ControlOrpcRouter.runtime.playable.status, {}, { context }),
    ).rejects.toMatchObject({
      code: "DIRECT_CONTROL_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "runtime.playable.status",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.runtime.playable.status, {}, { context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Game.turn");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first runtime.playable.status leaf", () => {
    expect(
      Civ7ControlOrpcContract.runtime.playable.status["~orpc"],
    ).toMatchObject({
      meta: {
        family: "runtime",
        procedureKey: "runtime.playable.status",
        proofBoundary: "local-package-test",
        risk: "runtime-support",
      },
    });
    expect(
      Civ7ControlOrpcContract.runtime.playable.status["~orpc"].errorMap,
    ).toHaveProperty("DIRECT_CONTROL_UNAVAILABLE");
    expect(Civ7DirectControlUnavailableError.code).toBe(
      "DIRECT_CONTROL_UNAVAILABLE",
    );
  });
});

function fakeContext(result: ReturnType<typeof playableStatusResult>): {
  calls: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
  context: Civ7ControlOrpcContext;
} {
  const calls: Array<Civ7ControlOrpcContext["endpointDefaults"]> = [];

  return {
    calls,
    context: {
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      directControl: {
        getCiv7MapSummary: async () => {
          throw new Error("not used");
        },
        getCiv7PlayableStatus: async (options) => {
          calls.push(options);
          return result;
        },
      },
    },
  };
}

function playableStatusResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    playable: true,
    readiness: "tuner-ready" as const,
    appUi: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      snapshot: {
        network: {
          isInSession: { ok: true as const, value: true },
          numPlayers: { ok: true as const, value: 2 },
          hostPlayerId: { ok: true as const, value: 0 },
          isConnectedToNetwork: { ok: true as const, value: true },
          isAuthenticated: { ok: true as const, value: true },
          isLoggedIn: { ok: true as const, value: true },
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
          turnDate: { ok: true as const, value: "4000 BCE" },
          hash: { ok: true as const, value: 123 },
        },
        ui: {
          inGame: { ok: true as const, value: true },
          inShell: { ok: true as const, value: false },
          inLoading: { ok: true as const, value: false },
          loadingState: { ok: true as const, value: 8 },
          loadingStateName: "GameStarted",
          canBeginGame: { ok: true as const, value: false },
          canNotifyUIReady: "function",
          skipStartButton: { ok: true as const, value: false },
          automationActive: { ok: true as const, value: false },
        },
        gameContext: {
          localPlayerID: 0,
          localObserverID: 0,
          hasRequestedPause: { ok: true as const, value: false },
        },
        players: {
          maxPlayers: 8,
          aliveIds: { ok: true as const, value: [0, 1] },
          aliveHumanIds: { ok: true as const, value: [0] },
          numAliveHumans: { ok: true as const, value: 1 },
        },
        map: {
          width: { ok: true as const, value: 84 },
          height: { ok: true as const, value: 54 },
          plotCount: { ok: true as const, value: 4536 },
          mapSize: { ok: true as const, value: 0 },
          randomSeed: { ok: true as const, value: 42 },
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
        turn: { ok: true as const, value: 1 },
        turnDate: { ok: true as const, value: "4000 BCE" },
        width: { ok: true as const, value: 84 },
        height: { ok: true as const, value: 54 },
        aliveIds: { ok: true as const, value: [0, 1] },
        aliveHumanIds: { ok: true as const, value: [0] },
        autoplayActive: { ok: true as const, value: false },
      },
    },
    errors: [],
  };
}
