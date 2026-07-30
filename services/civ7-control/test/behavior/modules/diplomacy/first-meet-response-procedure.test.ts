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
  Civ7ControlOrpcFirstMeetResponseCheckResult,
  Civ7ControlOrpcFirstMeetResponseSendResult,
  Civ7ControlOrpcFirstMeetResponseSnapshot,
  Civ7ControlOrpcFirstMeetResponseValidationResult,
  Civ7ControlOrpcRuntimeProbe,
} from "../../../../src/service/model/ports/direct-control";
import { firstMeetResponseAvailable } from "../../../../src/service/modules/diplomacy/model/policy/first-meet-admission";
import { pollFirstMeetResponsePostcondition } from "../../../../src/service/modules/diplomacy/model/policy/first-meet-polling";
import {
  civ7FirstMeetResponsePostcondition,
  firstMeetResponseResult,
} from "../../../../src/service/modules/diplomacy/model/policy/first-meet-result";
import { directControlFacadeFixture } from "../../../support/direct-control-facade";
import { playableStatusResult } from "../../../support/playable-status";

const firstMeetInput = {
  metPlayerId: 2,
  response: "friendly",
} as const;
const responseType = 673_478_009;
const noneBlockerType = -1;
const notificationId = { owner: 0, id: 7_101, type: 77 };
const endpointDefaults = {
  host: "127.0.0.1",
  port: 4318,
  timeoutMs: 1_000,
} as const;

describe("first-meet response control-oRPC procedures", () => {
  test("checks exact availability while the direct atom supplies player and response type", async () => {
    const before = activeFirstMeetSnapshot();
    const fake = fakeContext({ checks: [firstMeetCheck(before)] });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    await expect(client.diplomacy.firstMeet.response.check(firstMeetInput)).resolves.toEqual({
      ...firstMeetInput,
      available: true,
    });
    expect(fake.calls.checks).toEqual([
      {
        input: firstMeetInput,
        options: endpointDefaults,
      },
    ]);
    expect(fake.calls.readiness).toEqual([]);
    expect(JSON.stringify(fake.calls.checks)).not.toContain("playerId");
    expect(JSON.stringify(fake.calls.checks)).not.toContain("responseType");
  });

  test.each([
    ["native validation rejection", firstMeetCheck(activeFirstMeetSnapshot(), false)],
    [
      "foreign blocker owner",
      firstMeetCheck(
        activeFirstMeetSnapshot({
          blockingNotification: probe(
            firstMeetNotification({ id: { ...notificationId, owner: 1 } })
          ),
        })
      ),
    ],
    [
      "different notification family",
      firstMeetCheck(
        activeFirstMeetSnapshot({
          blockingNotification: probe(
            firstMeetNotification({ typeName: "NOTIFICATION_CHOOSE_GOVERNMENT" })
          ),
        })
      ),
    ],
    [
      "different met player",
      firstMeetCheck(
        activeFirstMeetSnapshot({
          blockingNotification: probe(firstMeetNotification({ metPlayerId: 3 })),
        })
      ),
    ],
    [
      "incoherent blocker type",
      firstMeetCheck(
        activeFirstMeetSnapshot({
          blockingNotification: probe(firstMeetNotification({ type: 88 })),
        })
      ),
    ],
    [
      "unreadable notification type",
      firstMeetCheck(
        activeFirstMeetSnapshot({
          blockingNotification: failedProbe("notification type unavailable"),
        })
      ),
    ],
    ["clear blocker", firstMeetCheck(clearedFirstMeetSnapshot())],
    [
      "unreadable blocker",
      firstMeetCheck(activeFirstMeetSnapshot({ blocker: failedProbe("blocker unavailable") })),
    ],
    [
      "malformed empty blocker",
      firstMeetCheck(
        activeFirstMeetSnapshot({
          blocker: probe(""),
          blockingNotification: probe(null),
        })
      ),
    ],
  ] as const)("rejects %s from exact first-meet admission", (_description, check) => {
    expect(firstMeetResponseAvailable(firstMeetInput, check)).toBe(false);
  });

  test("projects rejected exact admission as not-sent without dispatch", async () => {
    const fake = fakeContext({
      checks: [
        firstMeetCheck(
          activeFirstMeetSnapshot({
            blockingNotification: probe(firstMeetNotification({ metPlayerId: 3 })),
          })
        ),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.diplomacy.firstMeet.response.request,
      firstMeetInput,
      { context: fake.context }
    );

    expect(fake.calls.sends).toEqual([]);
    expect(result).toMatchObject({
      ...firstMeetInput,
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "inspect-first-meet-response" }],
    });
  });

  test("guards the send with the exact snapshot and polls until that blocker clears", async () => {
    const before = activeFirstMeetSnapshot();
    const after = clearedFirstMeetSnapshot();
    const fake = fakeContext({
      checks: [firstMeetCheck(before), firstMeetCheck(after, false)],
      sends: [firstMeetSend(before, before)],
    });

    const result = await call(
      Civ7ControlOrpcRouter.diplomacy.firstMeet.response.request,
      firstMeetInput,
      { context: fake.context }
    );

    expect(fake.calls.readiness).toHaveLength(1);
    expect(fake.calls.sends).toEqual([
      {
        input: {
          ...firstMeetInput,
          expected: before,
        },
        options: endpointDefaults,
      },
    ]);
    expect(fake.calls.checks).toHaveLength(2);
    expect(result).toEqual({
      ...firstMeetInput,
      status: "sent-confirmed",
      postcondition: {
        classification: "first-meet-cleared",
        reason:
          "The exact first-meet blocker observed before dispatch no longer occupies the local player's blocking notification slot.",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "diplomacy.firstMeet.response.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    });
    expectSemanticFirstMeetOutput(result);
  });

  test("confirms a different subsequent blocker as clearance of the exact pre-send blocker", async () => {
    const before = activeFirstMeetSnapshot();
    const nextBlocker = activeFirstMeetSnapshot({
      blockingNotification: probe(
        firstMeetNotification({
          id: { owner: 0, id: 8_202, type: 88 },
          metPlayerId: 3,
        })
      ),
    });
    const fake = fakeContext({
      checks: [firstMeetCheck(before)],
      sends: [firstMeetSend(before, nextBlocker)],
    });

    const result = await call(
      Civ7ControlOrpcRouter.diplomacy.firstMeet.response.request,
      firstMeetInput,
      { context: fake.context }
    );

    expect(result.status).toBe("sent-confirmed");
    expect(result.postcondition.classification).toBe("first-meet-cleared");
  });

  test("keeps the exact sticky blocker sent-unverified and no-repeat guarded", () => {
    const before = activeFirstMeetSnapshot();
    const evidence = {
      kind: "observed",
      input: firstMeetInput,
      beforeValidation: validation(true),
      afterValidation: validation(false),
      before,
      after: before,
    } as const;

    expect(civ7FirstMeetResponsePostcondition(evidence)).toEqual({
      classification: "first-meet-still-active",
      reason:
        "The exact first-meet blocker observed before dispatch remains in the local player's blocking notification slot.",
      outcome: "still-blocked",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
    expect(firstMeetResponseResult(firstMeetInput, "sent", evidence)).toMatchObject({
      status: "sent-unverified",
      nextSteps: [{ kind: "do-not-repeat" }],
    });
  });

  test("refuses a not-sent postcondition after dispatch becomes uncertain", () => {
    expect(() =>
      firstMeetResponseResult(firstMeetInput, "unknown", {
        kind: "not-admitted",
      })
    ).toThrow("A dispatched first-meet response cannot report not-sent.");
  });

  test("keeps other runtime changes unverified without inventing exact clearance", () => {
    const before = activeFirstMeetSnapshot();
    const after = activeFirstMeetSnapshot({
      canEndTurn: probe(true),
      blockingNotification: probe(firstMeetNotification({ typeName: null })),
    });

    expect(
      civ7FirstMeetResponsePostcondition({
        kind: "observed",
        input: firstMeetInput,
        beforeValidation: validation(true),
        afterValidation: validation(false),
        before,
        after,
      })
    ).toMatchObject({
      classification: "first-meet-runtime-state-changed",
      outcome: "state-changed",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
  });

  test("keeps unreadable exact-clearance evidence missing and no-repeat guarded", () => {
    const before = activeFirstMeetSnapshot();

    expect(
      civ7FirstMeetResponsePostcondition({
        kind: "observed",
        input: firstMeetInput,
        beforeValidation: validation(true),
        afterValidation: validation(true),
        before,
        after: activeFirstMeetSnapshot({
          blockingNotification: failedProbe("notification unavailable"),
        }),
      })
    ).toMatchObject({
      classification: "missing-postcondition",
      outcome: "unknown",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
  });

  test("projects guarded fresh validation rejection as definitely not sent", async () => {
    const before = activeFirstMeetSnapshot();
    const fake = fakeContext({
      checks: [firstMeetCheck(before)],
      sends: [firstMeetRejectedSend(before)],
    });

    const result = await call(
      Civ7ControlOrpcRouter.diplomacy.firstMeet.response.request,
      firstMeetInput,
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        reason:
          "The guarded first-meet response did not pass fresh native validation, so it was not sent.",
      },
      nextSteps: [{ kind: "inspect-first-meet-response" }],
    });
  });

  test("classifies a pre-dispatch send failure without unsafe retry advice", async () => {
    const fake = fakeContext({
      sendError: dispatchError("not-dispatched", "first-meet send failed"),
    });

    const result = await call(
      Civ7ControlOrpcRouter.diplomacy.firstMeet.response.request,
      firstMeetInput,
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "inspect-first-meet-response" }],
    });
    expect(fake.calls.sends).toHaveLength(1);
  });

  test.each([
    ["dispatched", "sent-confirmed"],
    ["indeterminate", "dispatch-unknown"],
  ] as const)("polls exact blocker evidence after a %s send failure", async (dispatchStatus, status) => {
    const fake = fakeContext({
      checks: [
        firstMeetCheck(activeFirstMeetSnapshot()),
        firstMeetCheck(clearedFirstMeetSnapshot(), false),
      ],
      sendError: dispatchError(dispatchStatus, "first-meet send failed"),
    });

    const result = await call(
      Civ7ControlOrpcRouter.diplomacy.firstMeet.response.request,
      firstMeetInput,
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status,
      postcondition: {
        classification: "first-meet-cleared",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [{ kind: "refresh-attention" }],
    });
    expect(fake.calls.sends).toHaveLength(1);
    expect(fake.calls.checks).toHaveLength(2);
  });

  test("maps check and request precheck failures to their exact tagged procedure keys", async () => {
    const failing = fakeContext({
      checkError: new Error("first-meet runtime evidence unavailable"),
    });

    await expect(
      call(Civ7ControlOrpcRouter.diplomacy.firstMeet.response.check, firstMeetInput, {
        context: failing.context,
      })
    ).rejects.toMatchObject({
      code: "FIRST_MEET_RESPONSE_UNAVAILABLE",
      status: 503,
      data: { procedureKey: "diplomacy.firstMeet.response.check" },
    });
    await expect(
      call(Civ7ControlOrpcRouter.diplomacy.firstMeet.response.request, firstMeetInput, {
        context: failing.context,
      })
    ).rejects.toMatchObject({
      code: "FIRST_MEET_RESPONSE_UNAVAILABLE",
      status: 503,
      data: { procedureKey: "diplomacy.firstMeet.response.request" },
    });

    let caught: unknown;
    try {
      await call(Civ7ControlOrpcRouter.diplomacy.firstMeet.response.request, firstMeetInput, {
        context: failing.context,
      });
    } catch (cause) {
      caught = cause;
    }
    const serialized = JSON.stringify(caught);
    expect(serialized).not.toContain("first-meet runtime evidence unavailable");
    expect(serialized).not.toContain("Game.PlayerOperations");
    expect(serialized).not.toContain("rawCommand");
  });

  test("bounds an unfinished first-meet postcheck by the remaining Effect deadline", async () => {
    const timeoutMs: number[] = [];
    const never = new Promise<Civ7ControlOrpcFirstMeetResponseCheckResult>(() => undefined);
    const before = activeFirstMeetSnapshot();
    const effect = pollFirstMeetResponsePostcondition({
      input: firstMeetInput,
      initial: firstMeetInitialEvidence(firstMeetSend(before, before)),
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

  test("recovers from a transient postcheck failure and confirms later exact clearance", async () => {
    const before = activeFirstMeetSnapshot();
    let checks = 0;
    const effect = pollFirstMeetResponsePostcondition({
      input: firstMeetInput,
      initial: firstMeetInitialEvidence(firstMeetSend(before, before)),
      check: () => {
        checks += 1;
        return checks === 1
          ? Promise.reject(new Error("transient first-meet postcheck failure"))
          : Promise.resolve(firstMeetCheck(clearedFirstMeetSnapshot(), false));
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

    expect(civ7FirstMeetResponsePostcondition(evidence).classification).toBe("first-meet-cleared");
    expect(checks).toBe(2);
  });
});

type FirstMeetNotification = Exclude<
  Extract<Civ7ControlOrpcFirstMeetResponseSnapshot["blockingNotification"], { ok: true }>["value"],
  null
>;

type FakeOptions = Readonly<{
  checks?: Civ7ControlOrpcFirstMeetResponseCheckResult[];
  repeatedCheck?: () => Promise<Civ7ControlOrpcFirstMeetResponseCheckResult>;
  sends?: Civ7ControlOrpcFirstMeetResponseSendResult[];
  checkError?: Error;
  sendError?: Error;
}>;

function fakeContext(options: FakeOptions = {}) {
  const checks = [...(options.checks ?? [firstMeetCheck(activeFirstMeetSnapshot())])];
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
      checkCiv7FirstMeetResponse: async (input, directOptions) => {
        calls.checks.push({ input, options: directOptions });
        if (options.checkError) throw options.checkError;
        return (
          checks.shift() ??
          (options.repeatedCheck
            ? await options.repeatedCheck()
            : firstMeetCheck(activeFirstMeetSnapshot()))
        );
      },
      sendCiv7FirstMeetResponse: async (input, directOptions) => {
        calls.sends.push({ input, options: directOptions });
        if (options.sendError) throw options.sendError;
        return (
          sends.shift() ?? firstMeetSend(activeFirstMeetSnapshot(), clearedFirstMeetSnapshot())
        );
      },
    }),
  };
  return { calls, context };
}

function firstMeetCheck(
  observed: Civ7ControlOrpcFirstMeetResponseSnapshot,
  valid = true
): Civ7ControlOrpcFirstMeetResponseCheckResult {
  return {
    valid,
    result: { Success: valid },
    snapshot: observed,
  };
}

function firstMeetSend(
  before: Civ7ControlOrpcFirstMeetResponseSnapshot,
  after: Civ7ControlOrpcFirstMeetResponseSnapshot
): Extract<Civ7ControlOrpcFirstMeetResponseSendResult, { sent: true }> {
  return {
    sent: true,
    validation: {
      valid: true,
      result: { Success: true },
    },
    before,
    after,
  };
}

function firstMeetInitialEvidence(
  send: Extract<Civ7ControlOrpcFirstMeetResponseSendResult, { sent: true }>
) {
  return {
    kind: "observed" as const,
    input: firstMeetInput,
    beforeValidation: send.validation,
    afterValidation: send.validation,
    before: send.before,
    after: send.after,
  };
}

function firstMeetRejectedSend(
  before: Civ7ControlOrpcFirstMeetResponseSnapshot
): Extract<Civ7ControlOrpcFirstMeetResponseSendResult, { sent: false }> {
  return {
    sent: false,
    validation: {
      valid: false,
      result: { Success: false },
    },
    before,
    after: before,
  };
}

function activeFirstMeetSnapshot(
  overrides: Partial<Civ7ControlOrpcFirstMeetResponseSnapshot> = {}
): Civ7ControlOrpcFirstMeetResponseSnapshot {
  return {
    localPlayerId: 0,
    ...firstMeetInput,
    responseType,
    noneBlockerType,
    canEndTurn: probe(false),
    blocker: probe(77),
    blockingNotification: probe(firstMeetNotification()),
    ...overrides,
  };
}

function clearedFirstMeetSnapshot(): Civ7ControlOrpcFirstMeetResponseSnapshot {
  return activeFirstMeetSnapshot({
    canEndTurn: probe(true),
    blocker: probe(noneBlockerType),
    blockingNotification: probe(null),
  });
}

function firstMeetNotification(
  overrides: Partial<FirstMeetNotification> = {}
): FirstMeetNotification {
  return {
    id: notificationId,
    type: 77,
    typeName: "NOTIFICATION_PLAYER_MET",
    metPlayerId: firstMeetInput.metPlayerId,
    ...overrides,
  };
}

function validation(valid: boolean): Civ7ControlOrpcFirstMeetResponseValidationResult {
  return {
    valid,
    result: { Success: valid },
  };
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

function expectSemanticFirstMeetOutput(result: unknown): void {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"playerId"');
  expect(serialized).not.toContain('"localPlayerId"');
  expect(serialized).not.toContain('"responseType"');
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
