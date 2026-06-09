import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7FirstMeetResponseUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcPlayableStatusResult,
} from "../src/index";
import type {
  Civ7ControlOrpcFirstMeetResponseResult,
  Civ7ControlOrpcPlayNotificationViewResult,
} from "../src/dependencies/direct-control";

const firstMeetInput = {
  metPlayerId: 2,
  responseType: 673_478_009,
} as const;

describe("diplomacy.firstMeet.response.request control-oRPC procedure", () => {
  test("projects confirmed first-meet responses without raw operation output", async () => {
    const fake = fakeContext(firstMeetResponseResult("first-meet-cleared"));

    const result = await call(
      Civ7ControlOrpcRouter.diplomacy.firstMeet.response.request,
      firstMeetInput,
      { context: fake.context },
    );

    expect(fake.calls.readiness).toHaveLength(1);
    expect(fake.calls.views).toHaveLength(1);
    expect(fake.calls.request).toEqual([{
      input: {
        playerId: 0,
        metPlayerId: 2,
        responseType: 673_478_009,
      },
      options: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    }]);
    expect(result).toEqual({
      playerId: 0,
      metPlayerId: 2,
      responseType: 673_478_009,
      sent: true,
      status: "sent-confirmed",
      validation: {
        beforeValid: true,
        afterValid: true,
      },
      postcondition: {
        classification: "first-meet-cleared",
        reason: "first-meet-cleared reason",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [{
        kind: "refresh-attention",
        source: "diplomacy.firstMeet.response.request",
        label: "Refresh current attention before choosing the next player action.",
      }],
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
    expect(serialized).not.toContain("\"operation\"");
    expect(serialized).not.toContain("\"verified\"");
    expect(serialized).not.toContain("Game.PlayerOperations");
  });

  test("keeps sticky first-meet blockers no-repeat guarded", async () => {
    const fake = fakeContext(firstMeetResponseResult("first-meet-sticky-blocker", {
      afterValid: true,
      verified: true,
    }));

    const result = await call(
      Civ7ControlOrpcRouter.diplomacy.firstMeet.response.request,
      firstMeetInput,
      { context: fake.context },
    );

    expect(result.status).toBe("sent-unverified");
    expect(result.postcondition).toMatchObject({
      classification: "first-meet-sticky-blocker",
      outcome: "still-blocked",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
    expect(result.nextSteps).toEqual([{
      kind: "do-not-repeat",
      source: "diplomacy.firstMeet.response.request",
      label: "Do not repeat this first-meet response until fresh attention and first-meet evidence is read.",
    }]);
  });

  test("projects validator-blocked first-meet responses as not-sent", async () => {
    const fake = fakeContext(firstMeetResponseResult("not-sent", {
      sent: false,
      beforeValid: false,
      afterValid: false,
      verified: false,
    }));

    const result = await call(
      Civ7ControlOrpcRouter.diplomacy.firstMeet.response.request,
      firstMeetInput,
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
      kind: "inspect-first-meet-response",
      source: "diplomacy.firstMeet.response.request",
      label: "Inspect current attention and first-meet diplomacy state before attempting another first-meet response.",
    }]);
  });

  test("rejects caller playerId before facade execution", async () => {
    const fake = fakeContext(firstMeetResponseResult("first-meet-cleared"));

    await expect(
      call(
        Civ7ControlOrpcRouter.diplomacy.firstMeet.response.request,
        { ...firstMeetInput, playerId: 2 } as never,
        { context: fake.context },
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(fake.calls.readiness).toEqual([]);
    expect(fake.calls.views).toEqual([]);
    expect(fake.calls.request).toEqual([]);
  });

  test("keeps endpoint/session/state/raw command fields out of procedure input", async () => {
    const invalidInputs = [
      { ...firstMeetInput, host: "127.0.0.1" },
      { ...firstMeetInput, port: 4318 },
      { ...firstMeetInput, state: { role: "tuner" } },
      { ...firstMeetInput, session: { state: "Tuner" } },
      { ...firstMeetInput, command: "Game.turn" },
      { ...firstMeetInput, rawCommand: "Game.turn" },
      { ...firstMeetInput, operationType: "RESPOND_DIPLOMATIC_FIRST_MEET" },
      { ...firstMeetInput, args: { Player1: 0, Player2: 2, Type: 673_478_009 } },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(firstMeetResponseResult("first-meet-cleared"));

      await expect(
        call(
          Civ7ControlOrpcRouter.diplomacy.firstMeet.response.request,
          input as never,
          { context: fake.context },
        ),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls.readiness).toEqual([]);
      expect(fake.calls.views).toEqual([]);
      expect(fake.calls.request).toEqual([]);
    }
  });

  test("maps source failures to a tagged Effect/oRPC error without raw details", async () => {
    const context = fakeContext(firstMeetResponseResult("first-meet-cleared")).context;
    const failingContext: Civ7ControlOrpcContext = {
      ...context,
      directControl: {
        ...context.directControl,
        requestCiv7FirstMeetResponse: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:1:Game.PlayerOperations.sendRequest(...)",
          );
        },
      },
    };

    await expect(
      call(
        Civ7ControlOrpcRouter.diplomacy.firstMeet.response.request,
        firstMeetInput,
        { context: failingContext },
      ),
    ).rejects.toMatchObject({
      code: "FIRST_MEET_RESPONSE_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "diplomacy.firstMeet.response.request",
        source: "direct-control-facade",
      },
    });

    try {
      await call(
        Civ7ControlOrpcRouter.diplomacy.firstMeet.response.request,
        firstMeetInput,
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
    const fake = fakeContext(firstMeetResponseResult("turn-unblocked"));
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.diplomacy.firstMeet.response.request(firstMeetInput);

    expect(result.status).toBe("sent-confirmed");
    expect(result.postcondition.outcome).toBe("cleared");
  });

  test("publishes a diplomacy first-meet domain service leaf", () => {
    expect(
      Civ7ControlOrpcContract.diplomacy.firstMeet.response.request["~orpc"],
    ).toMatchObject({
      meta: {
        family: "diplomacy",
        procedureKey: "diplomacy.firstMeet.response.request",
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
      Civ7ControlOrpcContract.diplomacy.firstMeet.response.request["~orpc"].errorMap,
    ).toHaveProperty("FIRST_MEET_RESPONSE_UNAVAILABLE");
    expect(Civ7FirstMeetResponseUnavailableError.code).toBe(
      "FIRST_MEET_RESPONSE_UNAVAILABLE",
    );
  });
});

function fakeContext(
  result: Civ7ControlOrpcFirstMeetResponseResult,
  options: Partial<{ playable: boolean }> = {},
): {
  calls: {
    readiness: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    views: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    request: Array<Readonly<{
      input: unknown;
      options: Civ7ControlOrpcContext["endpointDefaults"];
    }>>;
  };
  context: Civ7ControlOrpcContext;
} {
  const calls = {
    readiness: [] as Array<Civ7ControlOrpcContext["endpointDefaults"]>,
    views: [] as Array<Civ7ControlOrpcContext["endpointDefaults"]>,
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
        getCiv7PlayNotificationView: async (endpointDefaults) => {
          calls.views.push(endpointDefaults);
          return {
            localPlayerId: 0,
          } as Civ7ControlOrpcPlayNotificationViewResult;
        },
        requestCiv7FirstMeetResponse: async (input, endpointDefaults) => {
          calls.request.push({ input, options: endpointDefaults });
          return result;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function firstMeetResponseResult(
  classification: Civ7ControlOrpcFirstMeetResponseResult["postcondition"]["classification"],
  options: Partial<{
    sent: boolean;
    beforeValid: boolean;
    afterValid: boolean;
    verified: boolean;
  }> = {},
): Civ7ControlOrpcFirstMeetResponseResult {
  const sent = options.sent ?? classification !== "not-sent";
  return {
    playerId: 0,
    metPlayerId: firstMeetInput.metPlayerId,
    responseType: firstMeetInput.responseType,
    before: {} as Civ7ControlOrpcFirstMeetResponseResult["before"],
    operation: {
      command: sent
        ? ({
            host: "127.0.0.1",
            port: 4318,
            state: { id: "1", name: "Tuner" },
            output: "Game.PlayerOperations.sendRequest should remain hidden",
          } as unknown as Civ7ControlOrpcFirstMeetResponseResult["operation"]["command"])
        : undefined,
      sent,
      verified: options.verified ?? (
        classification === "turn-unblocked" || classification === "first-meet-cleared"
      ),
    } as Civ7ControlOrpcFirstMeetResponseResult["operation"],
    after: {} as Civ7ControlOrpcFirstMeetResponseResult["after"],
    beforeValidation: {
      valid: options.beforeValid ?? classification !== "not-sent",
      result: {},
    } as Civ7ControlOrpcFirstMeetResponseResult["beforeValidation"],
    afterValidation: {
      valid: options.afterValid ?? classification !== "not-sent",
      result: {},
    } as Civ7ControlOrpcFirstMeetResponseResult["afterValidation"],
    sent,
    verified: options.verified ?? (
      classification === "turn-unblocked" || classification === "first-meet-cleared"
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
    tuner: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "1", name: "Tuner", role: "tuner" },
      health: {
        evalOk: 2,
        ready: playable,
        globals: {},
      },
    },
    errors: [],
  };
}
