import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7ControllerBridgeResponseSchema,
  createCiv7ControllerBridgeIngress,
  invokeCiv7ControllerBridgeRequest,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcPlayableStatusResult,
} from "../src/index";

describe("Civ7 controller bridge ingress", () => {
  test("invokes allowlisted readiness.current through the in-process router", async () => {
    const fake = fakeContext(playableStatusResult());
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "controller-readiness-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "readiness.current",
      correlationId: "controller-readiness-1",
      output: {
        playable: true,
        readiness: "tuner-ready",
        capability: {
          canObserve: true,
          canMutate: true,
        },
      },
    });
    expect(fake.calls).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "readiness.current",
      input: {},
      correlationId: "controller-readiness-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("Game.turn");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("rejects raw command, session, endpoint, and state envelope fields", async () => {
    const invalidRequests = [
      { procedureKey: "readiness.current", input: {}, host: "127.0.0.1" },
      { procedureKey: "readiness.current", input: {}, port: 4318 },
      { procedureKey: "readiness.current", input: {}, state: { role: "tuner" } },
      { procedureKey: "readiness.current", input: {}, session: { state: "Tuner" } },
      { procedureKey: "readiness.current", input: {}, command: "Game.turn" },
      { procedureKey: "readiness.current", input: {}, rawCommand: "Game.turn" },
      { procedureKey: "readiness.current", input: { rawCommand: "Game.turn" } },
      { procedureKey: "readiness.current", input: {}, approval: { approved: true } },
    ];

    for (const request of invalidRequests) {
      const fake = fakeContext(playableStatusResult());
      const response = await invokeCiv7ControllerBridgeRequest(request, {
        createContext: () => fake.context,
      });

      expect(response).toEqual({
        ok: false,
        error: {
          code: "BRIDGE_BAD_REQUEST",
          message: "Civ7 controller bridge request envelope is invalid.",
          reason: "invalid-envelope",
        },
      });
      expect(fake.calls).toEqual([]);
    }
  });

  test("rejects procedures outside the bridge allowlist without dispatch", async () => {
    const fake = fakeContext(playableStatusResult());

    const response = await invokeCiv7ControllerBridgeRequest({
      procedureKey: "unit.target.action.request",
      input: {
        unitId: { owner: 0, id: 1, type: 1 },
        target: { x: 10, y: 12 },
      },
    }, {
      createContext: () => fake.context,
    });

    expect(response).toEqual({
      ok: false,
      error: {
        code: "BRIDGE_PROCEDURE_NOT_ALLOWED",
        message: "Civ7 controller bridge procedure is not allowlisted.",
        reason: "procedure-not-allowed",
      },
    });
    expect(fake.calls).toEqual([]);
  });

  test("keeps raw direct-control failure details out of bridge failures", async () => {
    const fake = fakeContext(new Error(
      "Timed out waiting for Civ7 tuner response to CMD:65535:Game.turn",
    ));

    const response = await invokeCiv7ControllerBridgeRequest({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "controller-error-1",
    }, {
      createContext: () => fake.context,
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toEqual({
      ok: false,
      correlationId: "controller-error-1",
      error: {
        code: "READINESS_CURRENT_UNAVAILABLE",
        message: "Current readiness view failed.",
        reason: "procedure-failed",
      },
    });
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Game.turn");
    expect(serialized).not.toContain("rawCommand");
    expect(serialized).not.toContain("command-failed");
  });
});

function fakeContext(
  resultOrError: Civ7ControlOrpcPlayableStatusResult | Error,
): {
  calls: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
  contextRequests: unknown[];
  context: Civ7ControlOrpcContext;
} {
  const calls: Array<Civ7ControlOrpcContext["endpointDefaults"]> = [];
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.push(options);
          if (resultOrError instanceof Error) throw resultOrError;
          return resultOrError;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function playableStatusResult(): Civ7ControlOrpcPlayableStatusResult {
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
        ui: {
          inGame: { ok: true, value: true },
          inShell: { ok: true, value: false },
          inLoading: { ok: true, value: false },
          canBeginGame: { ok: true, value: false },
        },
        currentState: "App UI",
      },
    },
    tuner: {
      ready: true,
      health: {
        ok: true,
        host: "127.0.0.1",
        port: 4318,
        latencyMs: 1,
      },
    },
    errors: ["raw Tuner detail"],
  };
}
