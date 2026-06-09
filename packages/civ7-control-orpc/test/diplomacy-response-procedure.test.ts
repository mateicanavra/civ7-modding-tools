import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7DiplomacyResponseUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcPlayableStatusResult,
} from "../src/index";
import type { Civ7ControlOrpcDiplomacyResponseResult } from "../src/dependencies/direct-control";

const diplomacyInput = {
  playerId: 0,
  actionId: 8_821,
  responseType: -1_713_616_684,
  notificationId: { owner: 0, id: 44, type: 20 },
} as const;

describe("diplomacy.response.request control-oRPC procedure", () => {
  test("projects confirmed diplomacy responses without raw command output", async () => {
    const fake = fakeContext(diplomacyResponseResult("diplomacy-blocker-cleared"));

    const result = await call(
      Civ7ControlOrpcRouter.diplomacy.response.request,
      diplomacyInput,
      { context: fake.context },
    );

    expect(fake.calls.readiness).toHaveLength(1);
    expect(fake.calls.request).toEqual([{
      input: diplomacyInput,
      options: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    }]);
    expect(result).toEqual({
      playerId: 0,
      actionId: 8_821,
      responseType: -1_713_616_684,
      notificationId: { owner: 0, id: 44, type: 20 },
      sent: true,
      status: "sent-confirmed",
      validation: {
        beforeValid: true,
        afterValid: false,
      },
      postcondition: {
        classification: "diplomacy-blocker-cleared",
        reason: "diplomacy-blocker-cleared reason",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [{
        kind: "refresh-attention",
        source: "diplomacy.response.request",
        label: "Refresh current attention before choosing the next player action.",
      }],
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
    expect(serialized).not.toContain("\"verified\"");
    expect(serialized).not.toContain("Game.PlayerOperations.sendRequest");
  });

  test("projects source-owned acted player evidence instead of caller validation player", async () => {
    const input = {
      ...diplomacyInput,
      playerId: 2,
    };
    const fake = fakeContext(diplomacyResponseResult("diplomacy-blocker-cleared", {
      playerId: 0,
    }));

    const result = await call(
      Civ7ControlOrpcRouter.diplomacy.response.request,
      input,
      { context: fake.context },
    );

    expect(fake.calls.request[0]?.input).toEqual(input);
    expect(result.playerId).toBe(0);
  });

  test("keeps sent no-state-change diplomacy responses no-repeat guarded", async () => {
    const fake = fakeContext(diplomacyResponseResult("no-state-change", {
      afterValid: true,
      verified: true,
    }));

    const result = await call(
      Civ7ControlOrpcRouter.diplomacy.response.request,
      diplomacyInput,
      { context: fake.context },
    );

    expect(result.status).toBe("sent-unverified");
    expect(result.postcondition).toMatchObject({
      classification: "no-state-change",
      outcome: "no-state-change",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
    expect(result.nextSteps).toEqual([{
      kind: "do-not-repeat",
      source: "diplomacy.response.request",
      label: "Do not repeat this diplomacy response request until fresh attention and diplomacy evidence is read.",
    }]);
  });

  test("projects validator-blocked diplomacy responses as not-sent", async () => {
    const fake = fakeContext(diplomacyResponseResult("not-sent", {
      sent: false,
      beforeValid: false,
      afterValid: false,
      verified: false,
    }));

    const result = await call(
      Civ7ControlOrpcRouter.diplomacy.response.request,
      diplomacyInput,
      { context: fake.context },
    );

    expect(result).toMatchObject({
      sent: false,
      status: "not-sent",
      validation: {
        beforeValid: false,
        afterValid: false,
      },
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
        confidence: "unverified",
        noRepeatAfterUnverified: true,
      },
    });
    expect(result.nextSteps).toEqual([{
      kind: "inspect-diplomacy-response",
      source: "diplomacy.response.request",
      label: "Inspect current attention and diplomacy response state before attempting another diplomacy request.",
    }]);
  });

  test("keeps endpoint/session/state/raw command fields and UI toggles out of procedure input", async () => {
    const invalidInputs = [
      { ...diplomacyInput, host: "127.0.0.1" },
      { ...diplomacyInput, port: 4318 },
      { ...diplomacyInput, state: { role: "tuner" } },
      { ...diplomacyInput, session: { state: "Tuner" } },
      { ...diplomacyInput, command: "Game.turn" },
      { ...diplomacyInput, rawCommand: "Game.turn" },
      { ...diplomacyInput, activateNotification: false },
      { ...diplomacyInput, uiCloseout: false },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(diplomacyResponseResult("diplomacy-blocker-cleared"));

      await expect(
        call(
          Civ7ControlOrpcRouter.diplomacy.response.request,
          input as never,
          { context: fake.context },
        ),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls.readiness).toEqual([]);
      expect(fake.calls.request).toEqual([]);
    }
  });

  test("maps source failures to a tagged Effect/oRPC error without raw details", async () => {
    const context = fakeContext(diplomacyResponseResult("diplomacy-blocker-cleared")).context;
    const failingContext: Civ7ControlOrpcContext = {
      ...context,
      directControl: {
        ...context.directControl,
        requestCiv7DiplomacyResponse: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:1:Game.PlayerOperations.sendRequest(...)",
          );
        },
      },
    };

    await expect(
      call(
        Civ7ControlOrpcRouter.diplomacy.response.request,
        diplomacyInput,
        { context: failingContext },
      ),
    ).rejects.toMatchObject({
      code: "DIPLOMACY_RESPONSE_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "diplomacy.response.request",
        source: "direct-control-facade",
      },
    });

    try {
      await call(
        Civ7ControlOrpcRouter.diplomacy.response.request,
        diplomacyInput,
        { context: failingContext },
      );
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Game.PlayerOperations");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("supports the in-process server-side router client", async () => {
    const fake = fakeContext(diplomacyResponseResult("blocking-notification-changed"));
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.diplomacy.response.request(diplomacyInput);

    expect(result.status).toBe("sent-confirmed");
    expect(result.postcondition.outcome).toBe("state-changed");
  });

  test("publishes a contract-first diplomacy domain service leaf", () => {
    expect(
      Civ7ControlOrpcContract.diplomacy.response.request["~orpc"],
    ).toMatchObject({
      meta: {
        family: "diplomacy",
        procedureKey: "diplomacy.response.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(
      (Civ7ControlOrpcContract as unknown as Record<string, unknown>).decisions,
    ).toBeUndefined();
    expect(
      (Civ7ControlOrpcRouter as unknown as Record<string, unknown>).decisions,
    ).toBeUndefined();
    expect(
      Civ7ControlOrpcContract.diplomacy.response.request["~orpc"].errorMap,
    ).toHaveProperty("DIPLOMACY_RESPONSE_UNAVAILABLE");
    expect(Civ7DiplomacyResponseUnavailableError.code).toBe(
      "DIPLOMACY_RESPONSE_UNAVAILABLE",
    );
  });
});

function fakeContext(
  result: Civ7ControlOrpcDiplomacyResponseResult,
  options: Partial<{ playable: boolean }> = {},
): {
  calls: {
    readiness: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    request: Array<Readonly<{
      input: unknown;
      options: Civ7ControlOrpcContext["endpointDefaults"];
    }>>;
  };
  context: Civ7ControlOrpcContext;
} {
  const calls = {
    readiness: [] as Array<Civ7ControlOrpcContext["endpointDefaults"]>,
    request: [] as Array<Readonly<{
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
        getCiv7PlayableStatus: async (endpointDefaults) => {
          calls.readiness.push(endpointDefaults);
          return playableStatusResult(options.playable ?? true);
        },
        requestCiv7DiplomacyResponse: async (input, endpointDefaults) => {
          calls.request.push({ input, options: endpointDefaults });
          return result;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function diplomacyResponseResult(
  classification: Civ7ControlOrpcDiplomacyResponseResult["postcondition"]["classification"],
  options: Partial<{
    playerId: number;
    sent: boolean;
    beforeValid: boolean;
    afterValid: boolean;
    verified: boolean;
  }> = {},
): Civ7ControlOrpcDiplomacyResponseResult {
  const sent = options.sent ?? classification !== "not-sent";
  return {
    playerId: options.playerId ?? diplomacyInput.playerId,
    before: {} as Civ7ControlOrpcDiplomacyResponseResult["before"],
    beforeValidation: {
      valid: options.beforeValid ?? classification !== "not-sent",
      result: {},
    } as Civ7ControlOrpcDiplomacyResponseResult["beforeValidation"],
    command: sent
      ? ({
          host: "127.0.0.1",
          port: 4318,
          state: { id: "65535", name: "App UI" },
          output: "Game.PlayerOperations.sendRequest should remain hidden",
        } as unknown as Civ7ControlOrpcDiplomacyResponseResult["command"])
      : undefined,
    payload: sent
      ? ({
          sent: true,
          rawCommand: "Game.PlayerOperations.sendRequest",
        } as unknown as Civ7ControlOrpcDiplomacyResponseResult["payload"])
      : undefined,
    after: {} as Civ7ControlOrpcDiplomacyResponseResult["after"],
    afterValidation: {
      valid: options.afterValid ?? false,
      result: {},
    } as Civ7ControlOrpcDiplomacyResponseResult["afterValidation"],
    sent,
    verified: options.verified ?? (
      classification !== "not-sent" && classification !== "no-state-change"
    ),
    postcondition: {
      classification,
      reason: `${classification} reason`,
    },
  };
}

function playableStatusResult(playable: boolean): Civ7ControlOrpcPlayableStatusResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    playable,
    readiness: playable ? "tuner-ready" : "shell",
    appUi: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      snapshot: {
        ui: {
          inGame: { ok: true, value: playable },
          inShell: { ok: true, value: !playable },
          inLoading: { ok: true, value: false },
          canBeginGame: { ok: true, value: false },
        },
        errors: [],
      },
    },
    tuner: {
      host: "127.0.0.1",
      port: 4318,
      ready: playable,
      states: [],
      errors: [],
    },
    errors: [],
  };
}
