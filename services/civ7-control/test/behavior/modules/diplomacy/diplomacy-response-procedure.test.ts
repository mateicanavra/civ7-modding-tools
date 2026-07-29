import { call } from "@orpc/server";
import { Effect, Fiber, TestClock, TestContext } from "effect";
import { describe, expect, test } from "vitest";

import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcRouter,
  createCiv7ControlOrpcServerClient,
} from "../../../../src/index";
import type {
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcDiplomacyResponseCheckResult,
  Civ7ControlOrpcDiplomacyResponseSendResult,
  Civ7ControlOrpcDiplomacyResponseSnapshot,
  Civ7ControlOrpcRuntimeProbe,
} from "../../../../src/service/model/ports/direct-control";
import { diplomacyResponseAdmission } from "../../../../src/service/modules/diplomacy/model/policy/diplomacy-response-admission";
import { pollDiplomacyResponsePostcondition } from "../../../../src/service/modules/diplomacy/model/policy/diplomacy-response-polling";
import {
  civ7DiplomacyResponsePostcondition,
  diplomacyResponseResult,
} from "../../../../src/service/modules/diplomacy/model/policy/diplomacy-response-result";
import { directControlFacadeFixture } from "../../../support/direct-control-facade";
import { playableStatusResult } from "../../../support/playable-status";

const diplomacyInput = {
  actionId: 8_821,
  responseType: 926_305_338,
} as const;
const denounceMilitaryPresenceActionType = 4545;
const rejectionResponseType = -1_713_616_684;
const eventActionType = 4242;
const noneBlockerType = -1;
const blockerType = 63;
const notificationId = { owner: 0, id: 44, type: 20 };
const endpointDefaults = {
  host: "127.0.0.1",
  port: 4318,
  timeoutMs: 1_000,
} as const;

describe("ordinary diplomacy response control-oRPC procedures", () => {
  test("checks exact offered-response availability through the service owner", async () => {
    const fake = fakeContext({ checks: [diplomacyCheck(activeSnapshot())] });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    await expect(client.diplomacy.response.check(diplomacyInput)).resolves.toEqual({
      ...diplomacyInput,
      available: true,
      classification: "ordinary-response",
    });
    expect(fake.calls.checks).toEqual([
      {
        input: diplomacyInput,
        options: endpointDefaults,
      },
    ]);
    expect(fake.calls.readiness).toEqual([]);
  });

  test.each([
    ["native validation rejection", diplomacyCheck(activeSnapshot(), false)],
    [
      "response not offered",
      diplomacyCheck(
        activeSnapshot({
          responseData: probe({
            actionId: diplomacyInput.actionId,
            offeredResponseTypes: [17],
          }),
        })
      ),
    ],
    [
      "response data for another action",
      diplomacyCheck(
        activeSnapshot({
          responseData: probe({
            actionId: diplomacyInput.actionId + 1,
            offeredResponseTypes: [diplomacyInput.responseType],
          }),
        })
      ),
    ],
    [
      "unreadable event action",
      diplomacyCheck(activeSnapshot({ eventActionType: failedProbe("event unavailable") })),
    ],
    [
      "foreign blocker owner",
      diplomacyCheck(
        activeSnapshot({
          blockingNotification: probe(
            diplomacyNotification({ id: { ...notificationId, owner: 1 } })
          ),
        })
      ),
    ],
    [
      "different notification family",
      diplomacyCheck(
        activeSnapshot({
          blockingNotification: probe(
            diplomacyNotification({ typeName: "NOTIFICATION_DIPLOMATIC_ACTION" })
          ),
        })
      ),
    ],
    [
      "different action",
      diplomacyCheck(
        activeSnapshot({
          blockingNotification: probe(
            diplomacyNotification({ actionId: diplomacyInput.actionId + 1 })
          ),
        })
      ),
    ],
    ["unreadable blocker", diplomacyCheck(activeSnapshot({ blocker: failedProbe("missing") }))],
  ] as const)("rejects %s from exact ordinary-response admission", (_description, check) => {
    expect(diplomacyResponseAdmission(diplomacyInput, check)).toEqual({
      kind: "not-admitted",
    });
  });

  test("keeps ordinary check and request refusal aligned without dispatching", async () => {
    const unavailable = diplomacyCheck(
      activeSnapshot({
        responseData: probe({
          actionId: diplomacyInput.actionId,
          offeredResponseTypes: [17],
        }),
      })
    );
    const fake = fakeContext({ checks: [unavailable, unavailable] });

    await expect(
      call(Civ7ControlOrpcRouter.diplomacy.response.check, diplomacyInput, {
        context: fake.context,
      })
    ).resolves.toEqual({
      ...diplomacyInput,
      available: false,
      classification: "not-admitted",
    });
    await expect(
      call(Civ7ControlOrpcRouter.diplomacy.response.request, diplomacyInput, {
        context: fake.context,
      })
    ).resolves.toMatchObject({
      ...diplomacyInput,
      status: "not-sent",
      postcondition: { classification: "not-sent" },
      nextSteps: [{ kind: "inspect-diplomacy-response" }],
    });
    expect(fake.calls.sends).toEqual([]);
  });

  test("refuses the special military-presence rejection through the dedicated war workflow", async () => {
    const input = {
      actionId: diplomacyInput.actionId,
      responseType: rejectionResponseType,
    };
    const special = activeSnapshot({
      responseType: rejectionResponseType,
      responseData: probe({
        actionId: input.actionId,
        offeredResponseTypes: [rejectionResponseType],
      }),
      eventActionType: probe(denounceMilitaryPresenceActionType),
    });
    const fake = fakeContext({ checks: [diplomacyCheck(special)] });

    await expect(
      call(Civ7ControlOrpcRouter.diplomacy.response.check, input, {
        context: fake.context,
      })
    ).resolves.toEqual({
      ...input,
      available: false,
      classification: "dedicated-war-workflow-required",
    });

    fake.checks.push(diplomacyCheck(special));
    const result = await call(Civ7ControlOrpcRouter.diplomacy.response.request, input, {
      context: fake.context,
    });
    expect(fake.calls.sends).toEqual([]);
    expect(result).toEqual({
      ...input,
      status: "not-sent",
      postcondition: {
        classification: "war-confirmation-required",
        reason:
          "Rejecting a military-presence denunciation requires Civ7's dedicated war-confirmation workflow.",
        outcome: "requires-war-confirmation",
        confidence: "confirmed",
        confirmed: false,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "use-war-confirmation",
          source: "diplomacy.response.request",
          label:
            "Use Civ7's dedicated war-confirmation workflow for this military-presence rejection.",
        },
      ],
    });
  });

  test("guards the send with the exact snapshot and confirms exact blocker clearance", async () => {
    const before = activeSnapshot();
    const after = clearedSnapshot();
    const fake = fakeContext({
      checks: [diplomacyCheck(before)],
      sends: [diplomacySend(before, after)],
    });

    const result = await call(Civ7ControlOrpcRouter.diplomacy.response.request, diplomacyInput, {
      context: fake.context,
    });

    expect(fake.calls.readiness).toHaveLength(1);
    expect(fake.calls.sends).toEqual([
      {
        input: {
          ...diplomacyInput,
          expected: before,
        },
        options: endpointDefaults,
      },
    ]);
    expect(result).toEqual({
      ...diplomacyInput,
      status: "sent-confirmed",
      postcondition: {
        classification: "diplomacy-response-cleared",
        reason:
          "The exact diplomacy-response blocker observed before dispatch no longer occupies the local player's blocking notification slot.",
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
    expectSemanticDiplomacyOutput(result);
  });

  test("confirms replacement by a different subsequent blocker", () => {
    const before = activeSnapshot();
    const after = activeSnapshot({
      blocker: probe(99),
      blockingNotification: probe(
        diplomacyNotification({
          id: { owner: 0, id: 55, type: 20 },
          type: 99,
          typeName: "NOTIFICATION_CHOOSE_TECH",
          actionId: null,
        })
      ),
    });

    expect(civ7DiplomacyResponsePostcondition(observedEvidence(before, after))).toMatchObject({
      classification: "diplomacy-response-cleared",
      confidence: "confirmed",
    });
  });

  test("keeps a reissued same-action blocker active when its ComponentID changes", () => {
    const before = activeSnapshot();
    const after = activeSnapshot({
      blockingNotification: probe(
        diplomacyNotification({
          id: { owner: 0, id: notificationId.id + 1, type: notificationId.type },
        })
      ),
    });

    expect(civ7DiplomacyResponsePostcondition(observedEvidence(before, after))).toMatchObject({
      classification: "diplomacy-response-still-active",
      confidence: "unverified",
      noRepeatAfterUnverified: true,
    });
  });

  test("keeps the exact sticky blocker sent-unverified and no-repeat guarded", () => {
    const before = activeSnapshot();
    const evidence = observedEvidence(before, before);

    expect(civ7DiplomacyResponsePostcondition(evidence)).toMatchObject({
      classification: "diplomacy-response-still-active",
      outcome: "still-blocked",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
    expect(diplomacyResponseResult(diplomacyInput, "sent", evidence)).toMatchObject({
      status: "sent-unverified",
      nextSteps: [{ kind: "do-not-repeat" }],
    });
    expect(diplomacyResponseResult(diplomacyInput, "unknown", evidence)).toMatchObject({
      status: "dispatch-unknown",
      nextSteps: [{ kind: "do-not-repeat" }],
    });
  });

  test("keeps failed blocker evidence unverified after dispatch", () => {
    const before = activeSnapshot();
    const after = activeSnapshot({
      blocker: failedProbe("post-send blocker unavailable"),
      blockingNotification: failedProbe("post-send notification unavailable"),
    });
    const evidence = {
      ...observedEvidence(before, after),
      afterValidation: validation(true),
    };

    expect(civ7DiplomacyResponsePostcondition(evidence)).toMatchObject({
      classification: "missing-postcondition",
      confidence: "unverified",
      noRepeatAfterUnverified: true,
    });
    expect(diplomacyResponseResult(diplomacyInput, "sent", evidence)).toMatchObject({
      status: "sent-unverified",
      nextSteps: [{ kind: "do-not-repeat" }],
    });
  });

  test("projects guarded native rejection as definitely not sent", async () => {
    const before = activeSnapshot();
    const fake = fakeContext({
      checks: [diplomacyCheck(before)],
      sends: [diplomacyRejectedSend(before)],
    });

    const result = await call(Civ7ControlOrpcRouter.diplomacy.response.request, diplomacyInput, {
      context: fake.context,
    });

    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        reason:
          "The guarded diplomacy response did not pass fresh native validation, so it was not sent.",
      },
      nextSteps: [{ kind: "inspect-diplomacy-response" }],
    });
  });

  test.each([
    ["not-dispatched", "not-sent", "not-sent"],
    ["dispatched", "sent-confirmed", "diplomacy-response-cleared"],
    ["indeterminate", "dispatch-unknown", "diplomacy-response-cleared"],
  ] as const)("preserves %s dispatch evidence through service classification", async (dispatchStatus, status, classification) => {
    const fake = fakeContext({
      checks:
        dispatchStatus === "not-dispatched"
          ? [diplomacyCheck(activeSnapshot())]
          : [diplomacyCheck(activeSnapshot()), diplomacyCheck(clearedSnapshot(), false)],
      sendError: dispatchError(dispatchStatus, "diplomacy send failed"),
    });

    const result = await call(Civ7ControlOrpcRouter.diplomacy.response.request, diplomacyInput, {
      context: fake.context,
    });

    expect(result).toMatchObject({
      status,
      postcondition: { classification },
    });
  });

  test("maps check and request source failures to their exact tagged procedure keys", async () => {
    const fake = fakeContext({
      checkError: new Error(
        "Timed out after CMD:1:Game.PlayerOperations.canStart(...RESPOND_DIPLOMATIC_ACTION)"
      ),
    });

    await expect(
      call(Civ7ControlOrpcRouter.diplomacy.response.check, diplomacyInput, {
        context: fake.context,
      })
    ).rejects.toMatchObject({
      code: "DIPLOMACY_RESPONSE_UNAVAILABLE",
      status: 503,
      data: { procedureKey: "diplomacy.response.check" },
    });
    await expect(
      call(Civ7ControlOrpcRouter.diplomacy.response.request, diplomacyInput, {
        context: fake.context,
      })
    ).rejects.toMatchObject({
      code: "DIPLOMACY_RESPONSE_UNAVAILABLE",
      status: 503,
      data: { procedureKey: "diplomacy.response.request" },
    });

    let caught: unknown;
    try {
      await call(Civ7ControlOrpcRouter.diplomacy.response.request, diplomacyInput, {
        context: fake.context,
      });
    } catch (cause) {
      caught = cause;
    }
    const serialized = JSON.stringify(caught);
    expect(serialized).not.toContain("CMD:1");
    expect(serialized).not.toContain("Game.PlayerOperations");
    expect(serialized).not.toContain("RESPOND_DIPLOMATIC_ACTION");
    expect(serialized).not.toContain("rawCommand");
  });

  test("bounds a never-resolving diplomacy postcheck by the remaining Effect deadline", async () => {
    const timeoutMs: number[] = [];
    const never = new Promise<Civ7ControlOrpcDiplomacyResponseCheckResult>(() => undefined);
    const before = activeSnapshot();
    const effect = pollDiplomacyResponsePostcondition({
      input: diplomacyInput,
      initial: observedEvidence(before, before),
      check: (remainingMs) => {
        timeoutMs.push(remainingMs);
        return never;
      },
      waitMs: 1_000,
    });
    const program = Effect.gen(function* () {
      const fiber = yield* Effect.fork(effect);
      yield* Effect.yieldNow();
      yield* TestClock.adjust(1_000);
      return yield* Fiber.join(fiber);
    }).pipe(Effect.provide(TestContext.TestContext));

    const evidence = await Effect.runPromise(program);

    expect(evidence).toEqual({ kind: "postcheck-unavailable" });
    expect(timeoutMs).toEqual([1_000]);
  });

  test("recovers from a transient postcheck failure and confirms later clearance", async () => {
    const before = activeSnapshot();
    let checks = 0;
    const effect = pollDiplomacyResponsePostcondition({
      input: diplomacyInput,
      initial: observedEvidence(before, before),
      check: () => {
        checks += 1;
        return checks === 1
          ? Promise.reject(new Error("transient diplomacy postcheck failure"))
          : Promise.resolve(diplomacyCheck(clearedSnapshot(), false));
      },
      waitMs: 1_000,
    });
    const program = Effect.gen(function* () {
      const fiber = yield* Effect.fork(effect);
      yield* Effect.yieldNow();
      yield* TestClock.adjust(250);
      return yield* Fiber.join(fiber);
    }).pipe(Effect.provide(TestContext.TestContext));

    const evidence = await Effect.runPromise(program);

    expect(civ7DiplomacyResponsePostcondition(evidence).classification).toBe(
      "diplomacy-response-cleared"
    );
    expect(checks).toBe(2);
  });
});

type DiplomacyNotification = Exclude<
  Extract<Civ7ControlOrpcDiplomacyResponseSnapshot["blockingNotification"], { ok: true }>["value"],
  null
>;

type FakeOptions = Readonly<{
  checks?: Civ7ControlOrpcDiplomacyResponseCheckResult[];
  sends?: Civ7ControlOrpcDiplomacyResponseSendResult[];
  checkError?: Error;
  repeatedCheck?: () => Promise<Civ7ControlOrpcDiplomacyResponseCheckResult>;
  sendError?: Error;
}>;

function fakeContext(options: FakeOptions = {}) {
  const checks = [...(options.checks ?? [diplomacyCheck(activeSnapshot())])];
  const sends = [...(options.sends ?? [])];
  const calls = {
    readiness: [] as unknown[],
    checks: [] as Array<{ input: unknown; options: unknown }>,
    sends: [] as Array<{ input: unknown; options: unknown }>,
  };
  const context: Civ7ControlOrpcContext = {
    endpointDefaults,
    directControl: directControlFacadeFixture({
      getCiv7PlayableStatus: async (directOptions) => {
        calls.readiness.push(directOptions);
        return playableStatusResult({ playable: true });
      },
      checkCiv7DiplomacyResponse: async (input, directOptions) => {
        calls.checks.push({ input, options: directOptions });
        if (options.checkError) throw options.checkError;
        return (
          checks.shift() ??
          (options.repeatedCheck ? await options.repeatedCheck() : diplomacyCheck(activeSnapshot()))
        );
      },
      sendCiv7DiplomacyResponse: async (input, directOptions) => {
        calls.sends.push({ input, options: directOptions });
        if (options.sendError) throw options.sendError;
        return sends.shift() ?? diplomacySend(activeSnapshot(), clearedSnapshot());
      },
    }),
  };
  return { calls, context, checks };
}

function diplomacyCheck(
  snapshot: Civ7ControlOrpcDiplomacyResponseSnapshot,
  valid = true
): Civ7ControlOrpcDiplomacyResponseCheckResult {
  return {
    valid,
    result: { Success: valid },
    snapshot,
  };
}

function diplomacySend(
  before: Civ7ControlOrpcDiplomacyResponseSnapshot,
  after: Civ7ControlOrpcDiplomacyResponseSnapshot
): Extract<Civ7ControlOrpcDiplomacyResponseSendResult, { sent: true }> {
  return {
    sent: true,
    validation: validation(true),
    before,
    after,
  };
}

function diplomacyRejectedSend(
  before: Civ7ControlOrpcDiplomacyResponseSnapshot
): Extract<Civ7ControlOrpcDiplomacyResponseSendResult, { sent: false }> {
  return {
    sent: false,
    validation: validation(false),
    before,
    after: before,
  };
}

function observedEvidence(
  before: Civ7ControlOrpcDiplomacyResponseSnapshot,
  after: Civ7ControlOrpcDiplomacyResponseSnapshot
) {
  return {
    kind: "observed" as const,
    input: diplomacyInput,
    beforeValidation: validation(true),
    afterValidation: validation(false),
    before,
    after,
  };
}

function activeSnapshot(
  overrides: Partial<Civ7ControlOrpcDiplomacyResponseSnapshot> = {}
): Civ7ControlOrpcDiplomacyResponseSnapshot {
  return {
    localPlayerId: 0,
    ...diplomacyInput,
    denounceMilitaryPresenceActionType,
    rejectionResponseType,
    noneBlockerType,
    responseData: probe({
      actionId: diplomacyInput.actionId,
      offeredResponseTypes: [diplomacyInput.responseType],
    }),
    eventActionType: probe(eventActionType),
    canEndTurn: probe(false),
    blocker: probe(blockerType),
    blockingNotification: probe(diplomacyNotification()),
    ...overrides,
  };
}

function clearedSnapshot(): Civ7ControlOrpcDiplomacyResponseSnapshot {
  return activeSnapshot({
    canEndTurn: probe(true),
    blocker: probe(noneBlockerType),
    blockingNotification: probe(null),
  });
}

function diplomacyNotification(
  overrides: Partial<DiplomacyNotification> = {}
): DiplomacyNotification {
  return {
    id: notificationId,
    type: blockerType,
    typeName: "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
    actionId: diplomacyInput.actionId,
    ...overrides,
  };
}

function validation<const Valid extends boolean>(valid: Valid) {
  return {
    valid,
    result: { Success: valid },
  } as const;
}

function probe<T>(value: T): Civ7ControlOrpcRuntimeProbe<T> {
  return { ok: true, value };
}

function failedProbe<T>(error: string): Civ7ControlOrpcRuntimeProbe<T> {
  return { ok: false, error };
}

function dispatchError(
  dispatchStatus: Civ7ControlOrpcCommandDispatchStatus,
  message: string
): Error & { dispatchStatus: Civ7ControlOrpcCommandDispatchStatus } {
  const error = Object.assign(new Error(message), {
    code: "command-failed" as const,
    dispatchStatus,
  });
  error.name = "Civ7DirectControlError";
  return error;
}

function expectSemanticDiplomacyOutput(result: unknown): void {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"playerId"');
  expect(serialized).not.toContain('"localPlayerId"');
  expect(serialized).not.toContain('"notificationId"');
  expect(serialized).not.toContain('"canEndTurn"');
  expect(serialized).not.toContain('"blocker"');
  expect(serialized).not.toContain('"blockingNotification"');
  expect(serialized).not.toContain('"expected"');
  expect(serialized).not.toContain('"sent":');
  expect(serialized).not.toContain('"validation"');
  expect(serialized).not.toContain('"result"');
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain("Game.PlayerOperations");
}
