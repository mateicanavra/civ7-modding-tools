import { call } from "@orpc/server";
import { Effect, Fiber, TestClock, TestContext } from "effect";
import { describe, expect, test } from "vitest";

import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcRouter,
  createCiv7ControlOrpcServerClient,
} from "../../../../src/index";
import type {
  Civ7ControlOrpcCelebrationChoiceCheckResult,
  Civ7ControlOrpcCelebrationChoiceSendResult,
  Civ7ControlOrpcCelebrationChoiceSnapshot,
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcGovernmentChoiceCheckResult,
  Civ7ControlOrpcGovernmentChoiceSendResult,
  Civ7ControlOrpcGovernmentChoiceSnapshot,
  Civ7ControlOrpcRuntimeProbe,
} from "../../../../src/service/model/ports/direct-control";
import {
  pollCelebrationChoicePostcondition,
  pollGovernmentChoicePostcondition,
} from "../../../../src/service/modules/government/model/policy/choice-polling";
import {
  civ7CelebrationChoicePostcondition,
  civ7GovernmentChoicePostcondition,
} from "../../../../src/service/modules/government/model/policy/choice-postcondition";
import { directControlFacadeFixture } from "../../../support/direct-control-facade";
import { playableStatusResult } from "../../../support/playable-status";

const governmentType = 1;
const goldenAgeSourceChoice = 7;
const goldenAgeType = -340_825_966;
const endpointDefaults = {
  host: "127.0.0.1",
  port: 4318,
  timeoutMs: 1_000,
} as const;

describe("government choice control-oRPC procedures", () => {
  test("checks exact government and celebration choices without caller-owned player or action policy", async () => {
    const fake = fakeContext();
    const client = createCiv7ControlOrpcServerClient(fake.context);

    await expect(client.government.choice.check({ governmentType })).resolves.toEqual({
      governmentType,
      available: true,
    });
    await expect(client.government.celebration.choice.check({ goldenAgeType })).resolves.toEqual({
      goldenAgeType,
      available: true,
    });

    expect(fake.calls.governmentChecks[0]?.input).toEqual({ governmentType });
    expect(fake.calls.celebrationChecks[0]?.input).toEqual({ goldenAgeType });
    expect(JSON.stringify(fake.calls)).not.toContain("action");
    expect(JSON.stringify(fake.calls)).not.toContain("playerId");
  });

  test.each([
    [
      "failed blocker probe",
      governmentCheck(
        governmentSnapshot({
          blocker: failedProbe("blocking type unavailable"),
        })
      ),
    ],
    [
      "wrong chooser notification",
      governmentCheck(
        governmentSnapshot({
          blockingNotification: probe(blockingNotification("NOTIFICATION_CHOOSE_GOLDEN_AGE")),
        })
      ),
    ],
  ])("does not dispatch government choice from %s evidence", async (_label, blockedCheck) => {
    const fake = fakeContext({ governmentChecks: [blockedCheck] });

    const result = await call(
      Civ7ControlOrpcRouter.government.choice.request,
      { governmentType },
      { context: fake.context }
    );

    expect(fake.calls.governmentSends).toEqual([]);
    expect(result).toMatchObject({
      governmentType,
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "inspect-government-choice" }],
    });
  });

  test("keeps chooser options observational when native admission succeeds", async () => {
    const precheck = governmentSnapshot({ availableGovernments: [] });
    const fake = fakeContext({
      governmentChecks: [governmentCheck(precheck), governmentCheck(governmentSelectedSnapshot())],
      governmentSends: [
        governmentSend({
          before: precheck,
          after: governmentSelectedSnapshot(),
        }),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.government.choice.request,
      { governmentType },
      { context: fake.context }
    );

    expect(fake.calls.governmentSends).toHaveLength(1);
    expect(result.status).toBe("sent-confirmed");
  });

  test("does not dispatch a validator-blocked celebration choice", async () => {
    const fake = fakeContext({
      celebrationChecks: [celebrationCheck(celebrationSnapshot(), false)],
    });

    const result = await call(
      Civ7ControlOrpcRouter.government.celebration.choice.request,
      { goldenAgeType },
      { context: fake.context }
    );

    expect(fake.calls.celebrationSends).toEqual([]);
    expect(result).toMatchObject({
      goldenAgeType,
      status: "not-sent",
      postcondition: { classification: "not-sent" },
    });
  });

  test("confirms only the requested government transition and matching blocker clearance", async () => {
    const wrongTarget = governmentSnapshot({
      currentGovernmentType: 2,
      blocker: probe(0),
      blockingNotification: probe(null),
    });
    const selected = governmentSelectedSnapshot();
    const fake = fakeContext({
      governmentChecks: [
        governmentCheck(governmentSnapshot()),
        governmentCheck(wrongTarget),
        governmentCheck(selected),
      ],
      governmentSends: [
        governmentSend({
          before: governmentSnapshot(),
          after: wrongTarget,
        }),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.government.choice.request,
      { governmentType },
      { context: fake.context }
    );

    expect(fake.calls.governmentSends).toEqual([
      {
        input: { governmentType, expected: governmentSnapshot() },
        options: endpointDefaults,
      },
    ]);
    expect(fake.calls.governmentChecks).toHaveLength(3);
    expect(result).toEqual({
      governmentType,
      status: "sent-confirmed",
      postcondition: {
        classification: "government-selected",
        reason:
          "The local player's current government transitioned to the requested government and the matching government-choice blocker cleared.",
        outcome: "selected",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "government.choice.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    });
    expectSemanticChoiceOmitsRuntimeDetails(result);
  });

  test("confirms the exact requested golden age rather than unrelated celebration state", async () => {
    const selected = celebrationSelectedSnapshot();
    const fake = fakeContext({
      celebrationChecks: [celebrationCheck(celebrationSnapshot())],
      celebrationSends: [
        celebrationSend({
          before: celebrationSnapshot(),
          after: selected,
        }),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.government.celebration.choice.request,
      { goldenAgeType },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      goldenAgeType,
      status: "sent-confirmed",
      postcondition: {
        classification: "celebration-selected",
        outcome: "selected",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [{ kind: "refresh-attention" }],
    });
  });

  test("treats a successful direct send port result as dispatched", async () => {
    const fake = fakeContext({
      governmentSends: [
        governmentSend({
          before: governmentSnapshot(),
          after: governmentSelectedSnapshot(),
        }),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.government.choice.request,
      { governmentType },
      { context: fake.context }
    );

    expect(fake.calls.governmentSends).toHaveLength(1);
    expect(result.status).toBe("sent-confirmed");
  });

  test("keeps a stale already-selected government observation unverified and no-repeat guarded", async () => {
    const stale = governmentSelectedSnapshot();
    const fake = fakeContext({
      governmentSends: [
        governmentSend({
          before: {
            ...stale,
            blocker: governmentSnapshot().blocker,
            blockingNotification: governmentSnapshot().blockingNotification,
          },
          after: stale,
        }),
      ],
      repeatedGovernmentCheck: governmentCheck(stale),
    });

    const result = await call(
      Civ7ControlOrpcRouter.government.choice.request,
      { governmentType },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-unverified",
      postcondition: {
        classification: "no-target-state-change",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "do-not-repeat" }],
    });
    expect(fake.calls.governmentChecks.length).toBeGreaterThan(1);
  });

  test("does not confirm a selected government while its matching chooser blocker remains live", async () => {
    const selectedBlocked = governmentSnapshot({ currentGovernmentType: governmentType });
    const fake = fakeContext({
      governmentSends: [
        governmentSend({
          before: governmentSnapshot(),
          after: selectedBlocked,
        }),
      ],
      governmentChecks: [
        governmentCheck(governmentSnapshot()),
        governmentCheck(governmentSelectedSnapshot()),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.government.choice.request,
      { governmentType },
      { context: fake.context }
    );

    expect(result.status).toBe("sent-confirmed");
    expect(fake.calls.governmentChecks).toHaveLength(2);
  });

  test("projects an explicit invalid send result as not sent", async () => {
    const fake = fakeContext({
      governmentSends: [governmentNotSent()],
    });

    const result = await call(
      Civ7ControlOrpcRouter.government.choice.request,
      { governmentType },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: { classification: "not-sent" },
    });
  });

  test.each([
    ["not-dispatched", "not-sent", "not-sent"],
    ["dispatched", "dispatch-unknown", "missing-postcondition"],
    ["indeterminate", "dispatch-unknown", "missing-postcondition"],
  ] as const)("classifies a %s send failure without unsafe retry advice", async (dispatchStatus, status, classification) => {
    const fake = fakeContext({
      governmentSendError: dispatchError(dispatchStatus, "government send failed"),
    });

    const result = await call(
      Civ7ControlOrpcRouter.government.choice.request,
      { governmentType },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status,
      postcondition: {
        classification,
        noRepeatAfterUnverified: true,
      },
    });
    if (status === "dispatch-unknown") {
      expect(result.nextSteps).toEqual([expect.objectContaining({ kind: "do-not-repeat" })]);
    }
  });

  test("maps check and request precheck failures to their exact tagged procedure keys", async () => {
    const failing = fakeContext({
      governmentCheckError: new Error("runtime state unavailable"),
    });

    await expect(
      call(
        Civ7ControlOrpcRouter.government.choice.check,
        { governmentType },
        { context: failing.context }
      )
    ).rejects.toMatchObject({
      code: "GOVERNMENT_CHOICE_UNAVAILABLE",
      status: 503,
      data: { procedureKey: "government.choice.check" },
    });
    await expect(
      call(
        Civ7ControlOrpcRouter.government.choice.request,
        { governmentType },
        { context: failing.context }
      )
    ).rejects.toMatchObject({
      code: "GOVERNMENT_CHOICE_UNAVAILABLE",
      status: 503,
      data: { procedureKey: "government.choice.request" },
    });
  });

  test("bounds postcheck failures and returns missing postcondition evidence", async () => {
    const fake = fakeContext({
      governmentSends: [
        governmentSend({
          before: governmentSnapshot(),
          after: governmentSnapshot(),
        }),
      ],
      governmentChecks: [governmentCheck(governmentSnapshot())],
      governmentCheckErrorAfterQueue: new Error("postcheck runtime unavailable"),
    });

    const result = await call(
      Civ7ControlOrpcRouter.government.choice.request,
      { governmentType },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-unverified",
      postcondition: {
        classification: "missing-postcondition",
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "do-not-repeat" }],
    });
  });

  test("bounds an unfinished government postcheck by the remaining deadline", async () => {
    const timeoutMs: number[] = [];
    const never = new Promise<Civ7ControlOrpcGovernmentChoiceCheckResult>(() => undefined);
    const effect = pollGovernmentChoicePostcondition({
      input: { governmentType },
      send: governmentSend({
        before: governmentSnapshot(),
        after: governmentSnapshot(),
      }),
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

  test("retains the latest government evidence when a later postcheck hangs", async () => {
    const selectedBlocked = governmentSnapshot({ currentGovernmentType: governmentType });
    const never = new Promise<Civ7ControlOrpcGovernmentChoiceCheckResult>(() => undefined);
    let checks = 0;
    const effect = pollGovernmentChoicePostcondition({
      input: { governmentType },
      send: governmentSend({
        before: governmentSnapshot(),
        after: governmentSnapshot(),
      }),
      check: () => {
        checks += 1;
        return checks === 1 ? Promise.resolve(governmentCheck(selectedBlocked)) : never;
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

    expect(civ7GovernmentChoicePostcondition(evidence).classification).toBe(
      "government-selected-blocker-still-live"
    );
    expect(checks).toBe(2);
  });

  test("recovers from a transient government postcheck error and confirms later evidence", async () => {
    let checks = 0;
    const effect = pollGovernmentChoicePostcondition({
      input: { governmentType },
      send: governmentSend({
        before: governmentSnapshot(),
        after: governmentSnapshot(),
      }),
      check: () => {
        checks += 1;
        return checks === 1
          ? Promise.reject(new Error("transient government postcheck failure"))
          : Promise.resolve(governmentCheck(governmentSelectedSnapshot()));
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

    expect(civ7GovernmentChoicePostcondition(evidence).classification).toBe("government-selected");
    expect(checks).toBe(2);
  });

  test("bounds and recovers celebration postchecks with normalized golden-age identity", async () => {
    const never = new Promise<Civ7ControlOrpcCelebrationChoiceCheckResult>(() => undefined);
    const unavailableEffect = pollCelebrationChoicePostcondition({
      input: { goldenAgeType },
      send: celebrationSend({
        before: celebrationSnapshot(),
        after: celebrationSnapshot(),
      }),
      check: () => never,
      waitMs: 1_000,
    });
    const unavailableProgram = Effect.gen(function* () {
      const fiber = yield* Effect.fork(unavailableEffect);
      yield* Effect.yieldNow();
      yield* TestClock.adjust(1_000);
      return yield* Fiber.join(fiber);
    }).pipe(Effect.provide(TestContext.TestContext));

    expect(await Effect.runPromise(unavailableProgram)).toEqual({
      kind: "postcheck-unavailable",
    });

    let checks = 0;
    const recoveringEffect = pollCelebrationChoicePostcondition({
      input: { goldenAgeType },
      send: celebrationSend({
        before: celebrationSnapshot(),
        after: celebrationSnapshot(),
      }),
      check: () => {
        checks += 1;
        return checks === 1
          ? Promise.reject(new Error("transient celebration postcheck failure"))
          : Promise.resolve(celebrationCheck(celebrationSelectedSnapshot()));
      },
      waitMs: 1_000,
    });
    const recoveringProgram = Effect.gen(function* () {
      const fiber = yield* Effect.fork(recoveringEffect);
      yield* Effect.yieldNow();
      yield* TestClock.adjust(250);
      return yield* Fiber.join(fiber);
    }).pipe(Effect.provide(TestContext.TestContext));
    const evidence = await Effect.runPromise(recoveringProgram);

    expect(civ7CelebrationChoicePostcondition(evidence).classification).toBe(
      "celebration-selected"
    );
    expect(checks).toBe(2);
  });
});

type FakeOptions = Readonly<{
  governmentChecks?: Civ7ControlOrpcGovernmentChoiceCheckResult[];
  celebrationChecks?: Civ7ControlOrpcCelebrationChoiceCheckResult[];
  repeatedGovernmentCheck?: Civ7ControlOrpcGovernmentChoiceCheckResult;
  governmentSends?: Civ7ControlOrpcGovernmentChoiceSendResult[];
  celebrationSends?: Civ7ControlOrpcCelebrationChoiceSendResult[];
  governmentCheckError?: Error;
  governmentCheckErrorAfterQueue?: Error;
  governmentSendError?: Error;
}>;

function fakeContext(options: FakeOptions = {}) {
  const governmentChecks = [
    ...(options.governmentChecks ?? [governmentCheck(governmentSnapshot())]),
  ];
  const celebrationChecks = [
    ...(options.celebrationChecks ?? [celebrationCheck(celebrationSnapshot())]),
  ];
  const governmentSends = [...(options.governmentSends ?? [])];
  const celebrationSends = [...(options.celebrationSends ?? [])];
  const calls = {
    governmentChecks: [] as Array<{ input: unknown; options: unknown }>,
    celebrationChecks: [] as Array<{ input: unknown; options: unknown }>,
    governmentSends: [] as Array<{ input: unknown; options: unknown }>,
    celebrationSends: [] as Array<{ input: unknown; options: unknown }>,
  };

  const context: Civ7ControlOrpcContext = {
    endpointDefaults,
    directControl: directControlFacadeFixture({
      getCiv7PlayableStatus: async () => playableStatusResult({ playable: true }),
      checkCiv7GovernmentChoice: async (input, directOptions) => {
        calls.governmentChecks.push({ input, options: directOptions });
        if (options.governmentCheckError) throw options.governmentCheckError;
        const queued = governmentChecks.shift();
        if (queued) return queued;
        if (options.governmentCheckErrorAfterQueue) {
          throw options.governmentCheckErrorAfterQueue;
        }
        return options.repeatedGovernmentCheck ?? governmentCheck(governmentSnapshot());
      },
      sendCiv7GovernmentChoice: async (input, directOptions) => {
        calls.governmentSends.push({ input, options: directOptions });
        if (options.governmentSendError) throw options.governmentSendError;
        return (
          governmentSends.shift() ??
          governmentSend({
            before: governmentSnapshot(),
            after: governmentSelectedSnapshot(),
          })
        );
      },
      checkCiv7CelebrationChoice: async (input, directOptions) => {
        calls.celebrationChecks.push({ input, options: directOptions });
        return celebrationChecks.shift() ?? celebrationCheck(celebrationSnapshot());
      },
      sendCiv7CelebrationChoice: async (input, directOptions) => {
        calls.celebrationSends.push({ input, options: directOptions });
        return (
          celebrationSends.shift() ??
          celebrationSend({
            before: celebrationSnapshot(),
            after: celebrationSelectedSnapshot(),
          })
        );
      },
    }),
  };
  return { calls, context };
}

function governmentCheck(
  snapshot: Civ7ControlOrpcGovernmentChoiceSnapshot,
  valid = true
): Civ7ControlOrpcGovernmentChoiceCheckResult {
  return { valid, result: { Success: valid }, snapshot };
}

function celebrationCheck(
  snapshot: Civ7ControlOrpcCelebrationChoiceSnapshot,
  valid = true
): Civ7ControlOrpcCelebrationChoiceCheckResult {
  return { valid, result: { Success: valid }, snapshot };
}

function governmentSend(
  options: Readonly<{
    before: Civ7ControlOrpcGovernmentChoiceSnapshot;
    after: Civ7ControlOrpcGovernmentChoiceSnapshot;
  }>
): Extract<Civ7ControlOrpcGovernmentChoiceSendResult, { sent: true }> {
  return {
    sent: true,
    validation: { valid: true, result: { Success: true } },
    before: options.before,
    after: options.after,
  };
}

function governmentNotSent(): Extract<Civ7ControlOrpcGovernmentChoiceSendResult, { sent: false }> {
  const snapshot = governmentSnapshot();
  return {
    sent: false,
    validation: { valid: false, result: { Success: false } },
    before: snapshot,
    after: snapshot,
  };
}

function celebrationSend(
  options: Readonly<{
    before: Civ7ControlOrpcCelebrationChoiceSnapshot;
    after: Civ7ControlOrpcCelebrationChoiceSnapshot;
  }>
): Extract<Civ7ControlOrpcCelebrationChoiceSendResult, { sent: true }> {
  return {
    sent: true,
    validation: { valid: true, result: { Success: true } },
    before: options.before,
    after: options.after,
  };
}

function governmentSnapshot(
  overrides: Partial<Civ7ControlOrpcGovernmentChoiceSnapshot> = {}
): Civ7ControlOrpcGovernmentChoiceSnapshot {
  return {
    localPlayerId: 0,
    currentGovernmentType: -1,
    availableGovernments: [{ governmentType, governmentTypeName: "GOVERNMENT_DESPOTISM" }],
    activateAction: -1_326_475_004,
    blocker: probe(1783715360),
    blockingNotification: probe(blockingNotification("NOTIFICATION_CHOOSE_GOVERNMENT")),
    ...overrides,
  };
}

function governmentSelectedSnapshot(): Civ7ControlOrpcGovernmentChoiceSnapshot {
  return governmentSnapshot({
    currentGovernmentType: governmentType,
    blocker: probe(0),
    blockingNotification: probe(null),
  });
}

function celebrationSnapshot(
  overrides: Partial<Civ7ControlOrpcCelebrationChoiceSnapshot> = {}
): Civ7ControlOrpcCelebrationChoiceSnapshot {
  return {
    localPlayerId: 0,
    currentGovernmentType: governmentType,
    availableGoldenAges: [
      {
        sourceChoice: goldenAgeSourceChoice,
        goldenAgeType,
        goldenAgeTypeName: "GOLDEN_AGE_CLASSICAL_REPUBLIC_1",
      },
    ],
    isInGoldenAge: false,
    currentGoldenAgeType: null,
    goldenAgeTurnsLeft: null,
    blocker: probe(1783715360),
    blockingNotification: probe(blockingNotification("NOTIFICATION_CHOOSE_GOLDEN_AGE")),
    ...overrides,
  };
}

function celebrationSelectedSnapshot(): Civ7ControlOrpcCelebrationChoiceSnapshot {
  return celebrationSnapshot({
    isInGoldenAge: true,
    currentGoldenAgeType: goldenAgeType,
    goldenAgeTurnsLeft: 10,
    blocker: probe(0),
    blockingNotification: probe(null),
  });
}

function blockingNotification(
  typeName: "NOTIFICATION_CHOOSE_GOVERNMENT" | "NOTIFICATION_CHOOSE_GOLDEN_AGE"
) {
  return {
    id: { owner: 0, id: 40, type: 20 },
    type: 111,
    typeName,
    target: null,
  };
}

function probe<T>(value: T): Civ7ControlOrpcRuntimeProbe<T> {
  return { ok: true, value };
}

function failedProbe(error: string): Civ7ControlOrpcRuntimeProbe<never> {
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

function expectSemanticChoiceOmitsRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"blocker"');
  expect(serialized).not.toContain('"blockingNotification"');
  expect(serialized).not.toContain('"activateAction"');
  expect(serialized).not.toContain("CHANGE_GOVERNMENT");
  expect(serialized).not.toContain("CHOOSE_GOLDEN_AGE");
}
