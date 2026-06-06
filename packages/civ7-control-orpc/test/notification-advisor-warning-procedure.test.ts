import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7NotificationAdvisorWarningUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
} from "../src/index";
import type {
  Civ7ControlOrpcAdvisorWarningViewedResult,
} from "../src/dependencies/direct-control";
import { typeboxInputSchemaFromContractProcedure } from "../src/typebox-standard-schema";

const target = { owner: 0, id: 12345, type: 99 };
const AdvisorWarningInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.notifications.advisorWarning.viewed.request,
);

describe("notifications.advisorWarning.viewed.request control-oRPC procedure", () => {
  test("derives acted player from local-player evidence and omits raw operation fields", async () => {
    const fake = fakeContext({
      result: advisorWarningResult({
        playerId: 0,
        target,
        sent: true,
      }),
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.notifications.advisorWarning.viewed.request({
      target,
    });

    expect(fake.calls.notifications).toHaveLength(1);
    expect(fake.calls.requests).toEqual([{
      input: { playerId: 0, target },
      options: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    }]);
    expect(result).toMatchObject({
      playerId: 0,
      target,
      sent: true,
      status: "sent-unverified",
      validation: {
        beforeValid: true,
        afterValid: true,
      },
      postcondition: {
        classification: "pending-runtime-proof",
        outcome: "unknown",
        confidence: "pending-runtime-proof",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{
        kind: "do-not-repeat",
        source: "notifications.advisorWarning.viewed.request",
      }],
    });
    expectSafeAdvisorWarningOutput(result);
  });

  test("projects validator-blocked advisor warnings as not-sent", async () => {
    const fake = fakeContext({
      result: advisorWarningResult({
        playerId: 0,
        target,
        sent: false,
        valid: false,
      }),
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.advisorWarning.viewed.request,
      { target },
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
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{
        kind: "inspect-notification",
        source: "notifications.advisorWarning.viewed.request",
      }],
    });
    expectSafeAdvisorWarningOutput(result);
  });

  test("rejects caller player, endpoint, session, command, and approval input before facade reads", async () => {
    const invalidInputs = [
      { target, playerId: 2 },
      { target, host: "127.0.0.1" },
      { target, port: 4318 },
      { target, state: { role: "tuner" } },
      { target, session: { state: "Tuner" } },
      { target, command: "sendOperation('player-operation')" },
      { target, rawCommand: "VIEWED_ADVISOR_WARNING" },
      { target, approvalReason: "go" },
      { target: "not-a-component-id" },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext({
        result: advisorWarningResult({ playerId: 0, target, sent: true }),
      });
      await expect(
        call(
          Civ7ControlOrpcRouter.notifications.advisorWarning.viewed.request,
          input as never,
          { context: fake.context },
        ),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls.notifications).toEqual([]);
      expect(fake.calls.requests).toEqual([]);
    }

    expect(Value.Check(AdvisorWarningInputSchema, { target })).toBe(true);
    expect(Value.Check(AdvisorWarningInputSchema, { target, playerId: 0 })).toBe(false);
  });

  test("maps source failures to tagged errors without raw command details", async () => {
    const fake = fakeContext({
      error: new Error(
        "Timed out waiting for Civ7 tuner response to CMD:1:sendOperation('player-operation') VIEWED_ADVISOR_WARNING",
      ),
    });

    await expect(
      call(
        Civ7ControlOrpcRouter.notifications.advisorWarning.viewed.request,
        { target },
        { context: fake.context },
      ),
    ).rejects.toMatchObject({
      code: "NOTIFICATION_ADVISOR_WARNING_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "notifications.advisorWarning.viewed.request",
        source: "direct-control-facade",
      },
    });

    try {
      await call(
        Civ7ControlOrpcRouter.notifications.advisorWarning.viewed.request,
        { target },
        { context: fake.context },
      );
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("sendOperation");
      expect(serialized).not.toContain("VIEWED_ADVISOR_WARNING");
      expect(serialized).not.toContain("rawCommand");
    }
  });

  test("publishes a contract-first advisor warning notification leaf", () => {
    expect(
      Civ7ControlOrpcContract.notifications.advisorWarning.viewed.request["~orpc"],
    ).toMatchObject({
      meta: {
        family: "notifications",
        procedureKey: "notifications.advisorWarning.viewed.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(
      Civ7ControlOrpcContract.notifications.advisorWarning.viewed.request["~orpc"]
        .errorMap,
    ).toHaveProperty("NOTIFICATION_ADVISOR_WARNING_UNAVAILABLE");
    expect(Civ7NotificationAdvisorWarningUnavailableError.code).toBe(
      "NOTIFICATION_ADVISOR_WARNING_UNAVAILABLE",
    );
  });
});

function fakeContext(options: {
  result?: Civ7ControlOrpcAdvisorWarningViewedResult;
  error?: Error;
}): {
  context: Civ7ControlOrpcContext;
  calls: {
    notifications: unknown[];
    requests: Array<{ input: unknown; options: unknown }>;
  };
} {
  const calls = {
    notifications: [] as unknown[],
    requests: [] as Array<{ input: unknown; options: unknown }>,
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
        getCiv7PlayableStatus: async () => ({
          playable: true,
          readiness: "tuner-ready",
        }),
        getCiv7PlayNotificationView: async (options) => {
          calls.notifications.push(options);
          return { localPlayerId: 0 };
        },
        requestCiv7AdvisorWarningViewed: async (input, endpointDefaults) => {
          calls.requests.push({ input, options: endpointDefaults });
          if (options.error) throw options.error;
          return options.result ?? advisorWarningResult({
            playerId: input.playerId,
            target: input.target,
            sent: true,
          });
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function advisorWarningResult(options: Readonly<{
  playerId: number;
  target: typeof target;
  sent: boolean;
  valid?: boolean;
}>): Civ7ControlOrpcAdvisorWarningViewedResult {
  const valid = options.valid ?? true;
  return {
    playerId: options.playerId,
    target: options.target,
    operation: {
      before: validationResult(options, valid),
      after: validationResult(options, valid),
      sent: options.sent,
      verified: false,
    },
    beforeValidation: validationResult(options, valid),
    afterValidation: validationResult(options, valid),
    sent: options.sent,
    verified: false,
    postcondition: {
      classification: options.sent ? "pending-runtime-proof" : "not-sent",
      reason: options.sent
        ? "Advisor warning acknowledgement sent; live closeout remains pending runtime proof."
        : "Advisor warning acknowledgement did not validate.",
    },
  };
}

function validationResult(
  options: Readonly<{
    playerId: number;
    target: typeof target;
  }>,
  valid: boolean,
): Civ7ControlOrpcAdvisorWarningViewedResult["beforeValidation"] {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner", role: "tuner" },
    family: "player-operation",
    operationType: "VIEWED_ADVISOR_WARNING",
    enumValue: "VIEWED_ADVISOR_WARNING",
    target: { playerId: options.playerId },
    args: { Target: options.target },
    valid,
    result: { Success: valid },
  };
}

function expectSafeAdvisorWarningOutput(value: unknown): void {
  const serialized = JSON.stringify(value);
  expect(serialized).not.toContain("127.0.0.1");
  expect(serialized).not.toContain("4318");
  expect(serialized).not.toContain("\"host\"");
  expect(serialized).not.toContain("\"port\"");
  expect(serialized).not.toContain("\"state\"");
  expect(serialized).not.toContain("\"operation\"");
  expect(serialized).not.toContain("\"operationType\"");
  expect(serialized).not.toContain("VIEWED_ADVISOR_WARNING");
  expect(serialized).not.toContain("\"Target\"");
  expect(serialized).not.toContain("\"result\"");
  expect(serialized).not.toContain("\"verified\"");
  expect(serialized).not.toContain("approval");
}
