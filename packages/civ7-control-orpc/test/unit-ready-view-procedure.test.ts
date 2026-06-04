import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7ReadyUnitViewUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcReadyUnitViewResult,
} from "../src/index";

describe("unit.ready.view control-oRPC procedure", () => {
  test("calls the ready-unit read atom through Effect/oRPC without network transport", async () => {
    const fixture = readyUnitViewResult();
    const fake = fakeContext(fixture);
    const unitId = { owner: 0, id: 458752, type: 26 };

    const result = await call(Civ7ControlOrpcRouter.unit.ready.view, {
      unitId,
      radius: 2,
      maxOperations: 96,
    }, {
      context: fake.context,
    });

    expect(result).toEqual(fixture);
    expect(fake.readyUnitCalls).toEqual([
      {
        input: {
          unitId,
          radius: 2,
          maxOperations: 96,
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
    const fixture = readyUnitViewResult();
    const fake = fakeContext(fixture);
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.unit.ready.view({ radius: 3 });

    expect(result).toEqual(fixture);
    expect(fake.readyUnitCalls).toEqual([
      {
        input: { radius: 3 },
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
      { radius: 6 },
      { maxOperations: 0 },
      { maxOperations: 257 },
      { unitId: { owner: 0, id: 458752, type: "unit" } },
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "app-ui" } },
      { stateName: "App UI" },
      { session: { state: "App UI" } },
      { command: "readReadyUnitView()" },
      { rawCommand: "readReadyUnitView()" },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(readyUnitViewResult());

      await expect(
        call(Civ7ControlOrpcRouter.unit.ready.view, input as never, {
          context: fake.context,
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.readyUnitCalls).toEqual([]);
    }
  });

  test("maps ready-unit facade failures to a tagged Effect/oRPC error without raw details", async () => {
    const context: Civ7ControlOrpcContext = {
      directControl: {
        getCiv7MapSummary: async () => {
          throw new Error("not used");
        },
        getCiv7PlayableStatus: async () => {
          throw new Error("not used");
        },
        getCiv7PlayNotificationView: async () => {
          throw new Error("not used");
        },
        getCiv7ReadyUnitView: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:65535:readReadyUnitView()",
          );
        },
      },
    };

    await expect(
      call(Civ7ControlOrpcRouter.unit.ready.view, {}, { context }),
    ).rejects.toMatchObject({
      code: "READY_UNIT_VIEW_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "unit.ready.view",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.unit.ready.view, {}, { context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("readReadyUnitView");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first unit.ready.view leaf", () => {
    expect(Civ7ControlOrpcContract.unit.ready.view["~orpc"]).toMatchObject({
      meta: {
        family: "unit",
        procedureKey: "unit.ready.view",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(
      Civ7ControlOrpcContract.unit.ready.view["~orpc"].errorMap,
    ).toHaveProperty("READY_UNIT_VIEW_UNAVAILABLE");
    expect(Civ7ReadyUnitViewUnavailableError.code).toBe(
      "READY_UNIT_VIEW_UNAVAILABLE",
    );
  });
});

function fakeContext(
  result: Civ7ControlOrpcReadyUnitViewResult,
): {
  context: Civ7ControlOrpcContext;
  readyUnitCalls: Array<{
    input: unknown;
    options: Civ7ControlOrpcContext["endpointDefaults"];
  }>;
} {
  const readyUnitCalls: Array<{
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
        getCiv7PlayableStatus: async () => {
          throw new Error("not used");
        },
        getCiv7PlayNotificationView: async () => {
          throw new Error("not used");
        },
        getCiv7ReadyUnitView: async (input, options) => {
          readyUnitCalls.push({ input, options });
          return result;
        },
      },
    },
    readyUnitCalls,
  };
}

function readyUnitViewResult(): Civ7ControlOrpcReadyUnitViewResult {
  const unitId = { owner: 0, id: 458752, type: 26 };

  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    requestedUnitId: null,
    selectedUnitId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: unitId },
    unitId,
    unit: {
      ok: true,
      value: {
        id: unitId,
        owner: 0,
        type: 111,
        typeName: "UNIT_ARMY_COMMANDER",
        location: { x: 22, y: 31 },
        movementMovesRemaining: 2,
        attacksRemaining: 0,
        damage: 0,
        hitPoints: 100,
      },
    },
    legalOperations: [
      {
        family: "unit-operation",
        operationType: "SKIP_TURN",
        enumValue: 1,
        valid: true,
        result: { Success: true },
      },
    ],
    promotionReadiness: {
      ok: true,
      value: null,
    },
    nearby: {
      ok: true,
      value: [
        {
          x: 22,
          y: 31,
          units: [
            {
              id: unitId,
              owner: 0,
              typeName: "UNIT_ARMY_COMMANDER",
            },
          ],
        },
      ],
    },
    notes: ["Read-only ready-unit view. Use operation validation before any send."],
  };
}
