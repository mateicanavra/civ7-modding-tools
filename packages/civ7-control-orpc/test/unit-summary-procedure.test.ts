import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7UnitSummaryUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcUnitSummaryResult,
} from "../src/index";

describe("unit.summary.read control-oRPC procedure", () => {
  test("calls the unit summary read atom through Effect/oRPC without network transport", async () => {
    const fixture = unitSummaryResult();
    const fake = fakeContext(fixture);
    const unitId = { owner: -1, id: -1, type: 26 };

    const result = await call(Civ7ControlOrpcRouter.unit.summary.read, {
      playerId: 0,
      unitIds: [unitId],
      maxItems: 24,
      includeHidden: false,
    }, {
      context: fake.context,
    });

    expect(result).toEqual(fixture);
    expect(fake.unitSummaryCalls).toEqual([
      {
        input: {
          playerId: 0,
          unitIds: [unitId],
          maxItems: 24,
          includeHidden: false,
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
    const fixture = unitSummaryResult();
    const fake = fakeContext(fixture);
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.unit.summary.read({ maxItems: 8 });

    expect(result).toEqual(fixture);
    expect(fake.unitSummaryCalls).toEqual([
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
      { playerId: 1025 },
      { maxItems: 0 },
      { maxItems: 1_001 },
      {
        unitIds: [
          { owner: -1, id: -1, type: 26, command: "Units.get(id)" },
        ],
      },
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "tuner" } },
      { stateName: "Tuner" },
      { session: { state: "Tuner" } },
      { command: "Units.get(id)" },
      { rawCommand: "Units.get(id)" },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(unitSummaryResult());

      await expect(
        call(Civ7ControlOrpcRouter.unit.summary.read, input as never, {
          context: fake.context,
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.unitSummaryCalls).toEqual([]);
    }
  });

  test("maps unit summary facade failures to a tagged Effect/oRPC error without raw details", async () => {
    const context: Civ7ControlOrpcContext = {
      directControl: {
        getCiv7MapSummary: async () => {
          throw new Error("not used");
        },
        getCiv7PlayerSummary: async () => {
          throw new Error("not used");
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
        getCiv7UnitSummary: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:1:Units.get(id)",
          );
        },
      },
    };

    await expect(
      call(Civ7ControlOrpcRouter.unit.summary.read, {}, { context }),
    ).rejects.toMatchObject({
      code: "UNIT_SUMMARY_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "unit.summary.read",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.unit.summary.read, {}, { context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Units.get");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first unit.summary.read leaf", () => {
    expect(Civ7ControlOrpcContract.unit.summary.read["~orpc"]).toMatchObject({
      meta: {
        family: "unit",
        procedureKey: "unit.summary.read",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(
      Civ7ControlOrpcContract.unit.summary.read["~orpc"].errorMap,
    ).toHaveProperty("UNIT_SUMMARY_UNAVAILABLE");
    expect(Civ7UnitSummaryUnavailableError.code).toBe(
      "UNIT_SUMMARY_UNAVAILABLE",
    );
  });
});

function fakeContext(
  result: Civ7ControlOrpcUnitSummaryResult,
): {
  context: Civ7ControlOrpcContext;
  unitSummaryCalls: Array<{
    input: unknown;
    options: Civ7ControlOrpcContext["endpointDefaults"];
  }>;
} {
  const unitSummaryCalls: Array<{
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
        getCiv7PlayerSummary: async () => {
          throw new Error("not used");
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
        getCiv7UnitSummary: async (input, options) => {
          unitSummaryCalls.push({ input, options });
          return result;
        },
      },
    },
    unitSummaryCalls,
  };
}

function unitSummaryResult(): Civ7ControlOrpcUnitSummaryResult {
  const unitId = { owner: -1, id: -1, type: 26 };

  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    units: [
      {
        id: unitId,
        owner: { ok: true, value: 0 },
        name: { ok: true, value: "Scout" },
        type: { ok: true, value: "UNIT_SCOUT" },
        location: { ok: true, value: { x: 10, y: 11 } },
        health: { ok: true, value: 100 },
        damage: { ok: true, value: 0 },
        movement: { ok: true, value: 2 },
        activity: { ok: true, value: "ACTIVE" },
      },
    ],
    omitted: 0,
  };
}
