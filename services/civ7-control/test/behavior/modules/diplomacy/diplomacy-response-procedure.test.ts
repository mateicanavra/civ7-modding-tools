import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";
import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcRouter,
  createCiv7ControlOrpcServerClient,
} from "../../../../src/index";
import type {
  Civ7ControlOrpcDiplomacyResponseResult,
  Civ7ControlOrpcPlayNotificationViewResult,
} from "../../../../src/service/model/ports/direct-control";
import { playableStatusResult } from "../../../support/playable-status";

const diplomacyInput = {
  actionId: 8_821,
  responseType: -1_713_616_684,
  notificationId: { owner: 0, id: 44, type: 20 },
} as const;

describe("diplomacy.response.request control-oRPC procedure", () => {
  test("projects confirmed diplomacy responses without raw command output", async () => {
    const fake = fakeContext(diplomacyResponseResult("diplomacy-blocker-cleared"));

    const result = await call(Civ7ControlOrpcRouter.diplomacy.response.request, diplomacyInput, {
      context: fake.context,
    });

    expect(fake.calls.readiness).toHaveLength(1);
    expect(fake.calls.views).toHaveLength(1);
    expect(fake.calls.request).toEqual([
      {
        input: {
          playerId: 0,
          ...diplomacyInput,
        },
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
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
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "diplomacy.response.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain('"command"');
    expect(serialized).not.toContain('"payload"');
    expect(serialized).not.toContain('"verified"');
    expect(serialized).not.toContain("Game.PlayerOperations.sendRequest");
  });

  test("derives send player from live notification evidence", async () => {
    const fake = fakeContext(
      diplomacyResponseResult("diplomacy-blocker-cleared", {
        playerId: 0,
      }),
      { localPlayerId: 2 }
    );

    const result = await call(Civ7ControlOrpcRouter.diplomacy.response.request, diplomacyInput, {
      context: fake.context,
    });

    expect(fake.calls.request[0]?.input).toEqual({
      playerId: 2,
      ...diplomacyInput,
    });
    expect(result.playerId).toBe(0);
  });

  test("keeps sent no-state-change diplomacy responses no-repeat guarded", async () => {
    const fake = fakeContext(
      diplomacyResponseResult("no-state-change", {
        afterValid: true,
        verified: true,
      })
    );

    const result = await call(Civ7ControlOrpcRouter.diplomacy.response.request, diplomacyInput, {
      context: fake.context,
    });

    expect(result.status).toBe("sent-unverified");
    expect(result.postcondition).toMatchObject({
      classification: "no-state-change",
      outcome: "no-state-change",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
    expect(result.nextSteps).toEqual([
      {
        kind: "do-not-repeat",
        source: "diplomacy.response.request",
        label:
          "Do not repeat this diplomacy response request until fresh attention and diplomacy evidence is read.",
      },
    ]);
  });

  test("projects validator-blocked diplomacy responses as not-sent", async () => {
    const fake = fakeContext(
      diplomacyResponseResult("not-sent", {
        sent: false,
        beforeValid: false,
        afterValid: false,
        verified: false,
      })
    );

    const result = await call(Civ7ControlOrpcRouter.diplomacy.response.request, diplomacyInput, {
      context: fake.context,
    });

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
    expect(result.nextSteps).toEqual([
      {
        kind: "inspect-diplomacy-response",
        source: "diplomacy.response.request",
        label:
          "Inspect current attention and diplomacy response state before attempting another diplomacy request.",
      },
    ]);
  });

  test("maps source failures to a tagged Effect/oRPC error without raw details", async () => {
    const context = fakeContext(diplomacyResponseResult("diplomacy-blocker-cleared")).context;
    const failingContext: Civ7ControlOrpcContext = {
      ...context,
      directControl: {
        ...context.directControl,
        requestCiv7DiplomacyResponse: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:1:Game.PlayerOperations.sendRequest(...)"
          );
        },
      },
    };

    await expect(
      call(Civ7ControlOrpcRouter.diplomacy.response.request, diplomacyInput, {
        context: failingContext,
      })
    ).rejects.toMatchObject({
      code: "DIPLOMACY_RESPONSE_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "diplomacy.response.request",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.diplomacy.response.request, diplomacyInput, {
        context: failingContext,
      });
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
});

function fakeContext(
  result: Civ7ControlOrpcDiplomacyResponseResult,
  options: Partial<{ playable: boolean; localPlayerId: number }> = {}
): {
  calls: {
    readiness: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    views: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    request: Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >;
  };
  context: Civ7ControlOrpcContext;
} {
  const calls = {
    readiness: [] as Array<Civ7ControlOrpcContext["endpointDefaults"]>,
    views: [] as Array<Civ7ControlOrpcContext["endpointDefaults"]>,
    request: [] as Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >,
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
          return playableStatusResult({ playable: options.playable ?? true });
        },
        getCiv7PlayNotificationView: async (endpointDefaults) => {
          calls.views.push(endpointDefaults);
          return {
            localPlayerId: options.localPlayerId ?? 0,
          } as Civ7ControlOrpcPlayNotificationViewResult;
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
  }> = {}
): Civ7ControlOrpcDiplomacyResponseResult {
  const sent = options.sent ?? classification !== "not-sent";
  return {
    playerId: options.playerId ?? 0,
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
    verified:
      options.verified ?? (classification !== "not-sent" && classification !== "no-state-change"),
    postcondition: {
      classification,
      reason: `${classification} reason`,
    },
  };
}
