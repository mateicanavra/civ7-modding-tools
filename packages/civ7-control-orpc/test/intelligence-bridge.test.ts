import { describe, expect, test } from "vitest";

import {
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcPlayableStatusResult,
  type Civ7IntelligenceBridge,
  type Civ7IntelligenceBridgeGlobalTarget,
  createCiv7IntelligenceBridge,
  installCiv7IntelligenceBridge,
} from "../src/index";

describe("Civ7IntelligenceBridge global adapter", () => {
  test("installs a serialized global bridge over the existing controller ingress", async () => {
    const fake = fakeContext(playableStatusResult());
    const target: Civ7IntelligenceBridgeGlobalTarget = {};

    const bridge = installCiv7IntelligenceBridge({
      target,
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    expect(target.Civ7IntelligenceBridge).toBe(bridge);

    const response = await target.Civ7IntelligenceBridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "global-readiness-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "readiness.current",
      correlationId: "global-readiness-1",
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
    expect(fake.contextRequests).toEqual([
      {
        procedureKey: "readiness.current",
        input: {},
        correlationId: "global-readiness-1",
      },
    ]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"session"');
    expect(serialized).not.toContain('"rawCommand"');
    expect(serialized).not.toContain("Game.turn");
    expect(serialized).not.toContain("Tuner");
  });

  test("keeps raw bridge envelope fields rejected after global installation", async () => {
    const fake = fakeContext(playableStatusResult());
    const bridge = createCiv7IntelligenceBridge({
      createContext: () => fake.context,
    });

    const response = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      session: { state: "Tuner" },
      rawCommand: "Game.turn",
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
  });

  test("does not overwrite an existing global bridge unless explicitly replaced", async () => {
    const existing: Civ7IntelligenceBridge = {
      invoke: async () => ({
        ok: false,
        error: {
          code: "EXISTING",
          message: "Existing bridge.",
          reason: "procedure-failed",
        },
      }),
    };
    const target: Civ7IntelligenceBridgeGlobalTarget = {
      Civ7IntelligenceBridge: existing,
    };

    expect(() =>
      installCiv7IntelligenceBridge({
        target,
        createContext: () => fakeContext(playableStatusResult()).context,
      })
    ).toThrow("Civ7IntelligenceBridge is already installed.");
    expect(target.Civ7IntelligenceBridge).toBe(existing);

    const replacement = installCiv7IntelligenceBridge({
      target,
      replaceExisting: true,
      createContext: () => fakeContext(playableStatusResult()).context,
    });

    expect(target.Civ7IntelligenceBridge).toBe(replacement);
    expect(target.Civ7IntelligenceBridge).not.toBe(existing);
  });
});

function fakeContext(result: Civ7ControlOrpcPlayableStatusResult): {
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
          return result;
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
