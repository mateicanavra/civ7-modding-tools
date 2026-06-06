import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
} from "../src/index";
import type { Civ7ControlOrpcTraditionsViewResult } from "../src/dependencies/direct-control";

describe("progression traditions control-oRPC procedure", () => {
  test("projects traditions into semantic action descriptors without CLI strings", async () => {
    const fake = fakeContext(traditionsViewResult());

    const result = await call(
      Civ7ControlOrpcRouter.progression.traditions.current,
      {},
      { context: fake.context },
    );

    expect(fake.calls.traditions).toEqual([{
      input: {},
      options: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    }]);
    expect(result).toMatchObject({
      playerId: 0,
      sourceStatus: {
        traditions: "read",
      },
      hiddenInfoPolicy: "player-culture-runtime",
      summary: {
        activeCount: 1,
        availableCount: 1,
        recentUnlockCount: 1,
        openSlotCount: 0,
        enabledAvailableCount: 1,
        disabledAvailableCount: 0,
        nextStepCount: 1,
      },
      government: {
        type: "GOVERNMENT_CHIEFDOM",
        name: "Chiefdom",
      },
    });
    expect(result.available[0]).toMatchObject({
      id: 90243567,
      name: "Oratory",
      actions: [{
        kind: "activate",
        action: -1326475004,
        validationSuccess: true,
        parameters: {
          traditionType: 90243567,
          action: -1326475004,
        },
      }],
    });
    expect(result.nextSteps).toEqual([{
      kind: "inspect-tradition-change",
      source: "progression.traditions.current",
      label: "Inspect available tradition action descriptors before requesting a tradition change.",
    }]);

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("recommendedCli");
    expect(serialized).not.toContain("game play ");
    expect(serialized).not.toContain("CMD:");
    expect(serialized).not.toContain("approval");
  });

  test("uses optional caller player id only as runtime read selection", async () => {
    const fake = fakeContext(traditionsViewResult({ playerId: 2 }));

    const result = await call(
      Civ7ControlOrpcRouter.progression.traditions.current,
      { playerId: 2 },
      { context: fake.context },
    );

    expect(fake.calls.traditions[0]?.input).toEqual({ playerId: 2 });
    expect(result.playerId).toBe(2);
  });

  test("rejects endpoint, session, raw command, and unknown input fields before facade execution", async () => {
    const fake = fakeContext(traditionsViewResult());
    const client = createCiv7ControlOrpcServerClient(fake.context);

    for (const input of [
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "tuner" } },
      { session: "abc" },
      { command: "Game.turn" },
      { rawCommand: "Game.turn" },
      { approvalReason: "go" },
    ]) {
      await expect(
        client.progression.traditions.current(input as never),
      ).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    }

    expect(fake.calls.traditions).toEqual([]);
  });

  test("maps direct-control failures to tagged unavailable errors without raw cause text", async () => {
    const fake = fakeContext(
      new Error("Timed out waiting for Civ7 tuner response to CMD:65535:Game.turn"),
    );

    try {
      await call(
        Civ7ControlOrpcRouter.progression.traditions.current,
        {},
        { context: fake.context },
      );
      throw new Error("expected progression traditions call to fail");
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).toContain("PROGRESSION_TRADITIONS_UNAVAILABLE");
      expect(serialized).not.toContain("CMD:");
      expect(serialized).not.toContain("Game.turn");
    }
  });

  test("keeps the traditions leaf under the progression contract and router", () => {
    expect(Civ7ControlOrpcContract.progression.traditions.current).toBeDefined();
    expect(Civ7ControlOrpcRouter.progression.traditions.current).toBeDefined();
  });
});

function fakeContext(
  traditions: Civ7ControlOrpcTraditionsViewResult | Error,
): {
  calls: {
    traditions: Array<Readonly<{
      input: unknown;
      options: Civ7ControlOrpcContext["endpointDefaults"];
    }>>;
  };
  context: Civ7ControlOrpcContext;
} {
  const calls = {
    traditions: [] as Array<Readonly<{
      input: unknown;
      options: Civ7ControlOrpcContext["endpointDefaults"];
    }>>,
  };

  return {
    calls,
    context: {
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      directControl: {
        getCiv7TraditionsView: async (input, options) => {
          calls.traditions.push({
            input,
            options,
          });
          if (traditions instanceof Error) throw traditions;
          return traditions;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function traditionsViewResult(
  overrides: Partial<Pick<Civ7ControlOrpcTraditionsViewResult, "playerId">> = {},
): Civ7ControlOrpcTraditionsViewResult {
  const activate = -1326475004;
  const deactivate = 1318334332;
  const available = tradition({
    id: 90243567,
    type: "TRADITION_ORATORY",
    name: "Oratory",
    active: false,
    recentUnlock: true,
    action: {
      kind: "activate",
      action: activate,
    },
  });
  const active = tradition({
    id: -331546976,
    type: "TRADITION_HONOR",
    name: "Honor",
    active: true,
    recentUnlock: false,
    action: {
      kind: "deactivate",
      action: deactivate,
    },
  });

  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    playerId: overrides.playerId ?? 0,
    turn: probe(92),
    turnDate: probe("1780 BCE"),
    governmentType: probe(101),
    government: {
      type: "GOVERNMENT_CHIEFDOM",
      name: "Chiefdom",
    },
    slots: {
      total: probe(1),
      normal: probe(1),
      crisis: probe(0),
      active: 1,
      unlocked: 2,
      available: 1,
      open: 0,
    },
    actions: {
      activate,
      deactivate,
    },
    active: [active],
    available: [available],
    recentUnlocks: [available],
    traditions: [active, available],
    recommendedCli: [
      `game play change-tradition --player-id 0 --tradition-type 90243567 --action ${activate}`,
    ],
    hiddenInfoPolicy: "player-culture-runtime",
    notes: [
      "Read-only traditions view; it does not send CHANGE_TRADITION or CONSIDER_ASSIGN_TRADITIONS.",
    ],
  };
}

function tradition(input: Readonly<{
  id: number;
  type: string;
  name: string;
  active: boolean;
  recentUnlock: boolean;
  action: Readonly<{
    kind: "activate" | "deactivate";
    action: number;
  }>;
}>): Civ7ControlOrpcTraditionsViewResult["traditions"][number] {
  return {
    id: input.id,
    type: input.type,
    name: input.name,
    description: "Culture-facing policy.",
    ageType: null,
    cultureSlotType: null,
    traitType: null,
    isCrisis: false,
    active: input.active,
    unlocked: true,
    recentUnlock: input.recentUnlock,
    actionHints: [{
      kind: input.action.kind,
      action: input.action.action,
      operationType: "CHANGE_TRADITION",
      args: {
        TraditionType: input.id,
        Action: input.action.action,
      },
      validation: probe({ Success: true }),
      cli: `game play change-tradition --player-id 0 --tradition-type ${input.id} --action ${input.action.action}`,
    }],
  };
}

function probe<T>(value: T): Readonly<{ ok: true; value: T }> {
  return { ok: true, value };
}
