import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7ReadinessCurrentUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcPlayableStatusResult,
} from "../src/index";

describe("readiness.current control-oRPC procedure", () => {
  test("projects playable status into a semantic readiness result", async () => {
    const fixture = playableStatusResult({
      playable: true,
      readiness: "tuner-ready",
      tunerReady: true,
      appUi: {
        inGame: true,
        inShell: false,
        inLoading: false,
        canBeginGame: false,
      },
      errors: ["internal runtime detail should stay summarized"],
    });
    const fake = fakeContext(fixture);

    const result = await call(Civ7ControlOrpcRouter.readiness.current, {}, {
      context: fake.context,
    });

    expect(result).toEqual({
      playable: true,
      readiness: "tuner-ready",
      capability: {
        canObserve: true,
        canMutate: true,
        reason: "Runtime control is ready for in-game reads and approved actions.",
      },
      sources: {
        gameUi: {
          inGame: true,
          inShell: false,
          inLoading: false,
          canBeginGame: false,
        },
        runtimeControl: {
          ready: true,
        },
      },
      controller: {
        supportedProcedures: [],
      },
      errorCount: 1,
      nextSteps: [{
        kind: "read-attention",
        source: "readiness.current",
        label: "Read current attention before choosing support actions.",
      }],
    });
    expect(fake.calls).toEqual([
      {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    ]);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("App UI");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("internal runtime detail");
  });

  test("supports the in-process server-side router client for non-ready status", async () => {
    const fake = fakeContext(playableStatusResult({
      playable: false,
      readiness: "shell",
      tunerReady: null,
      appUi: {
        inGame: false,
        inShell: true,
        inLoading: false,
        canBeginGame: false,
      },
    }));
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.readiness.current({});

    expect(result).toMatchObject({
      playable: false,
      readiness: "shell",
      capability: {
        canObserve: false,
        canMutate: false,
        reason: "Civ7 is outside an active game.",
      },
      nextSteps: [{
        kind: "enter-game",
        source: "readiness.current",
      }],
    });
    expect(fake.calls).toHaveLength(1);
  });

  test("reports narrow controller-supported procedure capabilities without broad readiness overclaim", async () => {
    const fake = fakeContext(playableStatusResult({
      playable: false,
      readiness: "app-ui-game",
      tunerReady: null,
    }), {
      controller: {
        supportedMutationProcedures: ["notifications.dismiss.request"],
      },
    });

    const result = await call(Civ7ControlOrpcRouter.readiness.current, {}, {
      context: fake.context,
    });

    expect(result).toMatchObject({
      playable: false,
      readiness: "app-ui-game",
      capability: {
        canObserve: false,
        canMutate: false,
        reason: "The game is open, but runtime control is not ready.",
      },
      controller: {
        supportedProcedures: [{
          procedureKey: "notifications.dismiss.request",
          risk: "mutation",
        }],
      },
      nextSteps: [{
        kind: "restore-tuner",
        source: "readiness.current",
      }],
    });
    expect(result.nextSteps.map((step) => step.kind)).not.toContain(
      "read-attention",
    );
    expect(JSON.stringify(result)).not.toContain("\"host\"");
    expect(JSON.stringify(result)).not.toContain("\"port\"");
    expect(JSON.stringify(result)).not.toContain("\"state\"");
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
        call(Civ7ControlOrpcRouter.readiness.current, input as never, {
          context: fake.context,
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls).toEqual([]);
    }
  });

  test("maps direct-control facade failures to a tagged Effect/oRPC error without raw details", async () => {
    const context: Civ7ControlOrpcContext = {
      directControl: {
        getCiv7PlayableStatus: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:1:Game.turn",
          );
        },
      } as Civ7ControlOrpcContext["directControl"],
    };

    await expect(
      call(Civ7ControlOrpcRouter.readiness.current, {}, { context }),
    ).rejects.toMatchObject({
      code: "READINESS_CURRENT_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "readiness.current",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.readiness.current, {}, { context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Game.turn");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first readiness.current service leaf", () => {
    expect(Civ7ControlOrpcContract.readiness.current["~orpc"]).toMatchObject({
      meta: {
        family: "readiness",
        procedureKey: "readiness.current",
        proofBoundary: "local-package-test",
        risk: "runtime-support",
      },
    });
    expect(
      Civ7ControlOrpcContract.readiness.current["~orpc"].errorMap,
    ).toHaveProperty("READINESS_CURRENT_UNAVAILABLE");
    expect(Civ7ReadinessCurrentUnavailableError.code).toBe(
      "READINESS_CURRENT_UNAVAILABLE",
    );
  });
});

function fakeContext(
  result: Civ7ControlOrpcPlayableStatusResult,
  overrides: Partial<Pick<Civ7ControlOrpcContext, "controller">> = {},
): {
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
      ...overrides,
    },
  };
}

function playableStatusResult(
  overrides: Partial<{
    playable: boolean;
    readiness: Civ7ControlOrpcPlayableStatusResult["readiness"];
    tunerReady: boolean | null;
    appUi: {
      inGame: boolean | null;
      inShell: boolean | null;
      inLoading: boolean | null;
      canBeginGame: boolean | null;
    };
    errors: string[];
  }> = {},
): Civ7ControlOrpcPlayableStatusResult {
  const appUi = overrides.appUi ?? {
    inGame: true,
    inShell: false,
    inLoading: false,
    canBeginGame: false,
  };

  return {
    host: "127.0.0.1",
    port: 4318,
    playable: overrides.playable ?? true,
    readiness: overrides.readiness ?? "tuner-ready",
    appUi: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      snapshot: {
        ui: {
          inGame: probe(appUi.inGame),
          inShell: probe(appUi.inShell),
          inLoading: probe(appUi.inLoading),
          canBeginGame: probe(appUi.canBeginGame),
        },
      },
    },
    tuner: overrides.tunerReady == null
      ? undefined
      : {
        host: "127.0.0.1",
        port: 4318,
        state: { id: "1", name: "Tuner" },
        ready: overrides.tunerReady,
        snapshot: {
          evalOk: overrides.tunerReady ? 2 : 0,
          ready: overrides.tunerReady,
        },
      },
    errors: overrides.errors ?? [],
  } as Civ7ControlOrpcPlayableStatusResult;
}

function probe<T>(value: T | null) {
  return value == null ? { ok: false as const } : { ok: true as const, value };
}
