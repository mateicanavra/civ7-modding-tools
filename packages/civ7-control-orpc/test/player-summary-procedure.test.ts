import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7PlayerSummaryUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcPlayerSummaryResult,
} from "../src/index";

describe("player.summary.read control-oRPC procedure", () => {
  test("calls the player summary read atom through Effect/oRPC without network transport", async () => {
    const fixture = playerSummaryResult();
    const fake = fakeContext(fixture);

    const result = await call(Civ7ControlOrpcRouter.player.summary.read, {
      playerIds: [0],
      includeUnits: true,
      includeCities: true,
      maxItems: 64,
    }, {
      context: fake.context,
    });

    expect(result).toEqual(fixture);
    expect(fake.playerSummaryCalls).toEqual([
      {
        input: {
          playerIds: [0],
          includeUnits: true,
          includeCities: true,
          maxItems: 64,
        },
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
  });

  test("supports the in-process server-side router client", async () => {
    const fixture = playerSummaryResult();
    const fake = fakeContext(fixture);
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.player.summary.read({ maxItems: 8 });

    expect(result).toEqual(fixture);
    expect(fake.playerSummaryCalls).toEqual([
      {
        input: { maxItems: 8 },
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
  });

  test("keeps endpoint/session/state/raw command fields out of procedure input", async () => {
    const invalidInputs = [
      { playerIds: [1025] },
      { maxItems: 0 },
      { maxItems: 513 },
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "tuner" } },
      { stateName: "Tuner" },
      { session: { state: "Tuner" } },
      { command: "Players.getAliveIds()" },
      { rawCommand: "Players.getAliveIds()" },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(playerSummaryResult());

      await expect(
        call(Civ7ControlOrpcRouter.player.summary.read, input as never, {
          context: fake.context,
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.playerSummaryCalls).toEqual([]);
    }
  });

  test("maps player summary facade failures to a tagged Effect/oRPC error without raw details", async () => {
    const context: Civ7ControlOrpcContext = {
      directControl: {
        getCiv7MapSummary: async () => {
          throw new Error("not used");
        },
        getCiv7PlayerSummary: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:1:Players.getAliveIds()",
          );
        },
        getCiv7PlayableStatus: async () => {
          throw new Error("not used");
        },
        getCiv7PlayNotificationView: async () => {
          throw new Error("not used");
        },
        getCiv7ReadyUnitView: async () => {
          throw new Error("not used");
        },
      },
    };

    await expect(
      call(Civ7ControlOrpcRouter.player.summary.read, {}, { context }),
    ).rejects.toMatchObject({
      code: "PLAYER_SUMMARY_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "player.summary.read",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.player.summary.read, {}, { context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Players.getAliveIds");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first player.summary.read leaf", () => {
    expect(Civ7ControlOrpcContract.player.summary.read["~orpc"]).toMatchObject({
      meta: {
        family: "player",
        procedureKey: "player.summary.read",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(
      Civ7ControlOrpcContract.player.summary.read["~orpc"].errorMap,
    ).toHaveProperty("PLAYER_SUMMARY_UNAVAILABLE");
    expect(Civ7PlayerSummaryUnavailableError.code).toBe(
      "PLAYER_SUMMARY_UNAVAILABLE",
    );
  });
});

function fakeContext(
  result: Civ7ControlOrpcPlayerSummaryResult,
): {
  context: Civ7ControlOrpcContext;
  playerSummaryCalls: Array<{
    input: unknown;
    options: Civ7ControlOrpcContext["endpointDefaults"];
  }>;
} {
  const playerSummaryCalls: Array<{
    input: unknown;
    options: Civ7ControlOrpcContext["endpointDefaults"];
  }> = [];

  return {
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
        getCiv7PlayerSummary: async (input, options) => {
          playerSummaryCalls.push({ input, options });
          return result;
        },
        getCiv7PlayableStatus: async () => {
          throw new Error("not used");
        },
        getCiv7PlayNotificationView: async () => {
          throw new Error("not used");
        },
        getCiv7ReadyUnitView: async () => {
          throw new Error("not used");
        },
      },
    },
    playerSummaryCalls,
  };
}

function playerSummaryResult(): Civ7ControlOrpcPlayerSummaryResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    players: [
      {
        id: 0,
        leaderName: { ok: true, value: "Amina" },
        civilizationName: {
          ok: true,
          value: "LOC_CIVILIZATION_AKSUM_NAME",
        },
        isHuman: { ok: true, value: true },
        isAlive: { ok: true, value: true },
        isTurnActive: { ok: true, value: true },
        unitIds: {
          ok: true,
          value: [{ owner: 0, id: 65_536, type: 26 }],
        },
        cityIds: {
          ok: true,
          value: [{ owner: 0, id: 131_073, type: 1 }],
        },
      },
    ],
    omitted: 0,
  };
}
