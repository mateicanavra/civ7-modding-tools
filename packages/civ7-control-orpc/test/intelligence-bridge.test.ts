import { describe, expect, test } from "vitest";
import {
  type Civ7ControllerContext,
  type Civ7IntelligenceBridgeGlobalTarget,
  installCiv7IntelligenceBridge,
} from "../src/bridge/intelligence-bridge";
import type { Civ7ControlOrpcPlayableStatusResult } from "../src/dependencies/direct-control";
import { type Civ7IntelligenceBridge, createCiv7IntelligenceBridge } from "../src/index";
import { directControlFacadeFixture } from "./support/direct-control-facade";
import { playableStatusResult } from "./support/playable-status";

describe("Civ7IntelligenceBridge global adapter", () => {
  test("installs the native nested router client with fresh correlated context per call", async () => {
    const fake = fakeContext(playableStatusResult());
    const target: Civ7IntelligenceBridgeGlobalTarget = {};

    const bridge = installCiv7IntelligenceBridge({
      target,
      createContext: () => {
        fake.contextRequests += 1;
        return fake.context;
      },
    });

    expect(target.Civ7IntelligenceBridge).toBe(bridge);

    const first = await bridge.readiness.current(
      {},
      { context: { correlationId: "global-readiness-1" } }
    );
    const second = await bridge.readiness.current({});

    expect(first).toMatchObject({
      playable: true,
      readiness: "tuner-ready",
      capability: {
        canObserve: true,
        canMutate: true,
      },
    });
    expect(second).toMatchObject({ playable: true });
    expect(fake.calls).toEqual([{ timeoutMs: 1_000 }, { timeoutMs: 1_000 }]);
    expect(fake.contextRequests).toBe(2);

    const serialized = JSON.stringify(first);
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"session"');
    expect(serialized).not.toContain('"rawCommand"');
    expect(serialized).not.toContain("Game.turn");
    expect(serialized).not.toContain("Tuner");
  });

  test("lets the contract boundary reject raw fields", async () => {
    const fake = fakeContext(playableStatusResult());
    const bridge = createCiv7IntelligenceBridge({
      createContext: () => fake.context,
    });

    await expect(
      bridge.readiness.current({ session: { state: "Tuner" }, rawCommand: "Game.turn" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(fake.calls).toEqual([]);
  });

  test.each([
    [
      "synchronous",
      () => {
        throw new Error("secret synchronous context detail");
      },
    ],
    [
      "rejected",
      async () => {
        throw new Error("secret rejected context detail");
      },
    ],
  ])("sanitizes %s controller context acquisition failures", async (_label, createContext) => {
    const bridge = createCiv7IntelligenceBridge({ createContext: createContext as never });

    await expect(bridge.readiness.current({})).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Civ7 controller context is unavailable.",
    });
    await expect(bridge.readiness.current({})).rejects.not.toThrow(/secret/);
  });

  test("fails closed when the controller does not admit a selected capability", async () => {
    const bridge = createCiv7IntelligenceBridge({
      createContext: () => fakeContext(playableStatusResult()).context,
    });

    await expect(bridge.world.current({})).rejects.toMatchObject({
      code: "CONTROLLER_CAPABILITY_UNAVAILABLE",
      data: {
        procedureKey: "world.current",
        risk: "read-only",
        source: "controller-context",
        reason: "procedure-not-supported",
      },
    });
  });

  test("requires controller proof for an admitted mutation", async () => {
    const fake = fakeContext(playableStatusResult());
    const bridge = createCiv7IntelligenceBridge({
      createContext: () => ({
        ...fake.context,
        controller: {
          supportedReadProcedures: [],
          supportedMutationProcedures: ["notifications.dismiss.request"],
        },
      }),
    });

    await expect(
      bridge.notifications.dismiss.request({
        notificationId: { owner: 0, id: 113, type: 20 },
      })
    ).rejects.toMatchObject({
      code: "CONTROLLER_CAPABILITY_UNAVAILABLE",
      data: {
        procedureKey: "notifications.dismiss.request",
        risk: "mutation",
        source: "controller-context",
        reason: "proof-required",
      },
    });
    expect(fake.calls).toEqual([]);
  });

  test("does not overwrite an existing global bridge unless explicitly replaced", () => {
    const existing = createCiv7IntelligenceBridge({
      createContext: () => fakeContext(playableStatusResult()).context,
    });
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

    const replacement: Civ7IntelligenceBridge = installCiv7IntelligenceBridge({
      target,
      replaceExisting: true,
      createContext: () => fakeContext(playableStatusResult()).context,
    });

    expect(target.Civ7IntelligenceBridge).toBe(replacement);
    expect(target.Civ7IntelligenceBridge).not.toBe(existing);
  });
});

function fakeContext(status: Civ7ControlOrpcPlayableStatusResult): {
  context: Civ7ControllerContext;
  calls: Array<unknown>;
  contextRequests: number;
} {
  const calls: Array<unknown> = [];
  return {
    calls,
    contextRequests: 0,
    context: {
      directControl: directControlFacadeFixture({
        getCiv7PlayableStatus: async (options) => {
          calls.push(options);
          return status;
        },
      }),
      endpointDefaults: { timeoutMs: 1_000 },
      controller: {
        supportedReadProcedures: [],
        supportedMutationProcedures: [],
      },
    },
  };
}
