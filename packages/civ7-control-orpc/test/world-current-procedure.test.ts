import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import type { Civ7ControlOrpcPlayableStatusResult } from "../src/dependencies/direct-control";
import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7WorldCurrentUnavailableError,
  createCiv7ControlOrpcServerClient,
} from "../src/index";
import { directControlFacadeFixture } from "./support/direct-control-facade";
import { playableStatusResult as basePlayableStatusResult } from "./support/playable-status";

describe("world.current control-oRPC procedure", () => {
  test("projects bounded current-world facts from playable status snapshot evidence", async () => {
    const fake = fakeContext(playableStatusResult());

    const result = await call(
      Civ7ControlOrpcRouter.world.current,
      {},
      {
        context: fake.context,
      }
    );

    expect(fake.calls).toEqual([
      {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    ]);
    expect(result).toEqual({
      playable: true,
      readiness: "tuner-ready",
      sourceStatus: {
        playableStatus: "read",
        game: "read",
        map: "read",
        players: "read",
      },
      turn: {
        current: 77,
        date: "Age 1, Turn 77",
        age: 1,
        maxTurns: 500,
        hash: 123_456,
      },
      localPlayer: {
        playerId: 0,
        observerId: 1,
      },
      map: {
        width: 84,
        height: 52,
        plotCount: 4_368,
        mapSize: 3,
        randomSeed: 987_654,
      },
      players: {
        maxPlayers: 8,
        alivePlayerIds: [0, 1, 2],
        aliveHumanIds: [0],
        aliveHumanCount: 1,
      },
      summary: {
        hasMapDimensions: true,
        alivePlayerCount: 3,
        nextStepCount: 1,
      },
      nextSteps: [
        {
          kind: "read-attention",
          source: "world.current",
          label: "Read current attention before choosing support actions.",
        },
      ],
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain("App UI");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("relationship");
    expect(serialized).not.toContain("enemy");
    expect(serialized).not.toContain("threat");
  });

  test("supports the in-process server-side router client for shell state", async () => {
    const fake = fakeContext(
      playableStatusResult({
        playable: false,
        readiness: "shell",
      })
    );
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.world.current({});

    expect(result).toMatchObject({
      playable: false,
      readiness: "shell",
      sourceStatus: {
        playableStatus: "read",
        game: "skipped-not-playable",
        map: "skipped-not-playable",
        players: "skipped-not-playable",
      },
      map: {
        width: null,
        height: null,
      },
      nextSteps: [
        {
          kind: "enter-game",
          source: "world.current",
        },
      ],
    });
    expect(result.players.alivePlayerIds).toEqual([]);
  });

  test("rejects endpoint/session/state/raw command fields from procedure input", async () => {
    const invalidInputs = [
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "tuner" } },
      { session: { state: "Tuner" } },
      { command: "Game.turn" },
      { rawCommand: "Game.turn" },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(playableStatusResult());

      await expect(
        call(Civ7ControlOrpcRouter.world.current, input as never, {
          context: fake.context,
        })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls).toEqual([]);
    }
  });

  test("maps facade failures to a tagged Effect/oRPC error without raw details", async () => {
    const context: Civ7ControlOrpcContext = {
      directControl: directControlFacadeFixture({
        getCiv7PlayableStatus: async () => {
          throw new Error("Timed out waiting for Civ7 tuner response to CMD:1:Game.turn");
        },
      }),
    };

    await expect(call(Civ7ControlOrpcRouter.world.current, {}, { context })).rejects.toMatchObject({
      code: "WORLD_CURRENT_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "world.current",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.world.current, {}, { context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Game.turn");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first world.current service leaf", () => {
    expect(Civ7ControlOrpcContract.world.current["~orpc"]).toMatchObject({
      meta: {
        family: "world",
        procedureKey: "world.current",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(Civ7ControlOrpcContract.world.current["~orpc"].errorMap).toHaveProperty(
      "WORLD_CURRENT_UNAVAILABLE"
    );
    expect(Civ7WorldCurrentUnavailableError.code).toBe("WORLD_CURRENT_UNAVAILABLE");
  });
});

function fakeContext(result: Civ7ControlOrpcPlayableStatusResult): {
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
        getCiv7PlayableStatus: async (options) => {
          calls.push(options);
          return result;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function playableStatusResult(
  overrides: Partial<{
    playable: boolean;
    readiness: Civ7ControlOrpcPlayableStatusResult["readiness"];
  }> = {}
): Civ7ControlOrpcPlayableStatusResult {
  const result = basePlayableStatusResult({
    playable: overrides.playable,
    readiness: overrides.readiness,
  });
  return {
    ...result,
    appUi: {
      ...result.appUi,
      snapshot: {
        ...result.appUi.snapshot,
        game: {
          turn: 77,
          age: 1,
          maxTurns: 500,
          turnDate: probe("Age 1, Turn 77"),
          hash: probe(123_456),
        },
        gameContext: {
          ...result.appUi.snapshot.gameContext,
          localPlayerID: 0,
          localObserverID: 1,
        },
        map: {
          width: probe(84),
          height: probe(52),
          plotCount: probe(4_368),
          mapSize: probe(3),
          randomSeed: probe(987_654),
        },
        players: {
          maxPlayers: 8,
          aliveIds: probe([0, 1, 2]),
          aliveHumanIds: probe([0]),
          numAliveHumans: probe(1),
        },
      },
    },
  };
}

function probe<T>(value: T) {
  return { ok: true as const, value };
}
