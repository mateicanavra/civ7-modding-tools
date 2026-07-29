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
  Civ7ControlOrpcNarrativeChoiceCheckResult,
  Civ7ControlOrpcNarrativeChoiceSendResult,
  Civ7ControlOrpcNarrativeChoiceSnapshot,
  Civ7ControlOrpcRuntimeProbe,
} from "../../../../src/service/model/ports/direct-control";
import { pollNarrativeChoicePostcondition } from "../../../../src/service/modules/narrative/model/policy/choice-polling";
import { civ7NarrativeChoicePostcondition } from "../../../../src/service/modules/narrative/model/policy/choice-postcondition";
import { directControlFacadeFixture } from "../../../support/direct-control-facade";
import { playableStatusResult } from "../../../support/playable-status";

const narrativeInput = {
  targetType: "DISCOVERY_14001B",
  target: { owner: 0, id: 7_001, type: 35 },
} as const;
const endpointDefaults = {
  host: "127.0.0.1",
  port: 4318,
  timeoutMs: 1_000,
} as const;

describe("narrative choice control-oRPC procedures", () => {
  test("checks exact narrative availability without caller-owned player or action policy", async () => {
    const fake = fakeContext({
      checks: [narrativeCheck(nonblockingSnapshot())],
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    await expect(client.narrative.choice.check(narrativeInput)).resolves.toEqual({
      ...narrativeInput,
      available: true,
    });

    expect(fake.calls.checks).toEqual([
      {
        input: narrativeInput,
        options: endpointDefaults,
      },
    ]);
    expect(JSON.stringify(fake.calls)).not.toContain("action");
    expect(JSON.stringify(fake.calls)).not.toContain("playerId");
  });

  test("projects native validator refusal as not-sent without dispatch", async () => {
    const fake = fakeContext({
      checks: [narrativeCheck(activeNarrativeSnapshot(), false)],
    });

    const result = await call(Civ7ControlOrpcRouter.narrative.choice.request, narrativeInput, {
      context: fake.context,
    });

    expect(fake.calls.sends).toEqual([]);
    expect(result).toMatchObject({
      ...narrativeInput,
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "inspect-narrative-choice" }],
    });
    expect(result.nextSteps[0]?.label).toContain("DISCOVERY_14001B");
    expect(result.nextSteps[0]?.label).toContain("0:7001:35");
  });

  test("confirms the exact pre-send narrative blocker clearing", async () => {
    const before = activeNarrativeSnapshot();
    const after = clearedNarrativeSnapshot();
    const fake = fakeContext({
      checks: [narrativeCheck(before), narrativeCheck(after, false)],
      sends: [
        narrativeSend({
          before,
          after: before,
        }),
      ],
    });

    const result = await call(Civ7ControlOrpcRouter.narrative.choice.request, narrativeInput, {
      context: fake.context,
    });

    expect(fake.calls.sends).toEqual([
      {
        input: {
          ...narrativeInput,
          expected: before,
        },
        options: endpointDefaults,
      },
    ]);
    expect(fake.calls.checks).toHaveLength(2);
    expect(result).toEqual({
      ...narrativeInput,
      status: "sent-confirmed",
      postcondition: {
        classification: "narrative-blocker-cleared",
        reason:
          "The exact narrative blocker observed before dispatch no longer occupies the local player's blocking notification slot.",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "narrative.choice.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    });
    expectSemanticNarrativeChoiceOmitsRuntimeDetails(result);
  });

  test("treats a different subsequent narrative blocker as clearance of the exact prior blocker", async () => {
    const before = activeNarrativeSnapshot();
    const nextNarrative = activeNarrativeSnapshot({
      blockingNotification: probe(
        narrativeNotification({
          id: { owner: 0, id: 99, type: 20 },
          typeName: "NOTIFICATION_CHOOSE_AUTO_NARRATIVE_STORY_DIRECTION",
        })
      ),
    });
    const fake = fakeContext({
      checks: [narrativeCheck(before)],
      sends: [narrativeSend({ before, after: nextNarrative })],
    });

    const result = await call(Civ7ControlOrpcRouter.narrative.choice.request, narrativeInput, {
      context: fake.context,
    });

    expect(result.status).toBe("sent-confirmed");
    expect(result.postcondition.classification).toBe("narrative-blocker-cleared");
  });

  test("keeps a sticky exact blocker sent-unverified and target-specific no-repeat guarded", async () => {
    const before = activeNarrativeSnapshot();
    const fake = fakeContext({
      checks: [narrativeCheck(before)],
      sends: [narrativeSend({ before, after: before })],
      repeatedCheck: narrativeCheck(before),
    });

    const result = await call(Civ7ControlOrpcRouter.narrative.choice.request, narrativeInput, {
      context: fake.context,
    });

    expect(result).toMatchObject({
      ...narrativeInput,
      status: "sent-unverified",
      postcondition: {
        classification: "narrative-blocker-still-live",
        outcome: "still-blocked",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "do-not-repeat" }],
    });
    expect(result.nextSteps[0]?.label).toContain("DISCOVERY_14001B");
    expect(result.nextSteps[0]?.label).toContain("0:7001:35");
  });

  test("keeps admitted nonblocking narrative events unverified without inventing blocker proof", async () => {
    const before = nonblockingSnapshot();
    const after = nonblockingSnapshot({
      canEndTurn: probe(true),
    });
    const postcondition = civ7NarrativeChoicePostcondition({
      kind: "observed",
      input: narrativeInput,
      beforeValidation: validation(true),
      afterValidation: validation(false),
      before,
      after,
    });

    expect(postcondition).toMatchObject({
      classification: "narrative-runtime-state-changed",
      outcome: "state-changed",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
  });

  test.each([
    ["dispatched", "dispatch-unknown", "missing-postcondition"],
    ["indeterminate", "dispatch-unknown", "missing-postcondition"],
  ] as const)("classifies a %s send failure as dispatch-unknown without unsafe retry advice", async (dispatchStatus, status, classification) => {
    const fake = fakeContext({
      sendError: dispatchError(dispatchStatus, "narrative send failed"),
    });

    const result = await call(Civ7ControlOrpcRouter.narrative.choice.request, narrativeInput, {
      context: fake.context,
    });

    expect(result).toMatchObject({
      status,
      postcondition: {
        classification,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "do-not-repeat" }],
    });
  });

  test("projects a guarded snapshot mismatch as definitely not sent", async () => {
    const fake = fakeContext({
      sendError: dispatchError(
        "not-dispatched",
        "Narrative choice admission evidence changed before dispatch."
      ),
    });

    const result = await call(Civ7ControlOrpcRouter.narrative.choice.request, narrativeInput, {
      context: fake.context,
    });

    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: { classification: "not-sent" },
      nextSteps: [{ kind: "inspect-narrative-choice" }],
    });
    expect(fake.calls.sends).toHaveLength(1);
  });

  test("projects an explicit invalid fresh-send validation as not sent", async () => {
    const fake = fakeContext({
      sends: [narrativeNotSent()],
    });

    const result = await call(Civ7ControlOrpcRouter.narrative.choice.request, narrativeInput, {
      context: fake.context,
    });

    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: { classification: "not-sent" },
    });
  });

  test("maps check and request precheck failures to their exact tagged procedure keys", async () => {
    const failing = fakeContext({
      checkError: new Error("narrative runtime state unavailable"),
    });

    await expect(
      call(Civ7ControlOrpcRouter.narrative.choice.check, narrativeInput, {
        context: failing.context,
      })
    ).rejects.toMatchObject({
      code: "NARRATIVE_CHOICE_UNAVAILABLE",
      status: 503,
      data: { procedureKey: "narrative.choice.check" },
    });
    await expect(
      call(Civ7ControlOrpcRouter.narrative.choice.request, narrativeInput, {
        context: failing.context,
      })
    ).rejects.toMatchObject({
      code: "NARRATIVE_CHOICE_UNAVAILABLE",
      status: 503,
      data: { procedureKey: "narrative.choice.request" },
    });
  });

  test("bounds an unfinished narrative postcheck by the remaining Effect deadline", async () => {
    const timeoutMs: number[] = [];
    const never = new Promise<Civ7ControlOrpcNarrativeChoiceCheckResult>(() => undefined);
    const effect = pollNarrativeChoicePostcondition({
      input: narrativeInput,
      send: narrativeSend({
        before: activeNarrativeSnapshot(),
        after: activeNarrativeSnapshot(),
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

  test("retains the latest completed narrative evidence when a later read hangs", async () => {
    const before = nonblockingSnapshot();
    const changed = nonblockingSnapshot({ canEndTurn: probe(true) });
    const never = new Promise<Civ7ControlOrpcNarrativeChoiceCheckResult>(() => undefined);
    let checks = 0;
    const effect = pollNarrativeChoicePostcondition({
      input: narrativeInput,
      send: narrativeSend({ before, after: before }),
      check: () => {
        checks += 1;
        return checks === 1 ? Promise.resolve(narrativeCheck(changed, false)) : never;
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

    expect(civ7NarrativeChoicePostcondition(evidence).classification).toBe(
      "narrative-runtime-state-changed"
    );
    expect(checks).toBe(2);
  });

  test("recovers from a transient narrative postcheck failure and confirms later evidence", async () => {
    let checks = 0;
    const effect = pollNarrativeChoicePostcondition({
      input: narrativeInput,
      send: narrativeSend({
        before: activeNarrativeSnapshot(),
        after: activeNarrativeSnapshot(),
      }),
      check: () => {
        checks += 1;
        return checks === 1
          ? Promise.reject(new Error("transient narrative postcheck failure"))
          : Promise.resolve(narrativeCheck(clearedNarrativeSnapshot(), false));
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

    expect(civ7NarrativeChoicePostcondition(evidence).classification).toBe(
      "narrative-blocker-cleared"
    );
    expect(checks).toBe(2);
  });

  test("retains unresolved completed reads as missing postcondition evidence", async () => {
    const unresolved = unresolvedNarrativeSnapshot();
    const effect = pollNarrativeChoicePostcondition({
      input: narrativeInput,
      send: narrativeSend({
        before: activeNarrativeSnapshot(),
        after: unresolved,
      }),
      check: () => Promise.resolve(narrativeCheck(unresolved, false)),
      waitMs: 1_000,
    });
    const program = Effect.gen(function* () {
      const fiber = yield* Effect.fork(effect);
      yield* Effect.yieldNow();
      yield* TestClock.adjust(1_000);
      return yield* Fiber.join(fiber);
    }).pipe(Effect.provide(TestContext.TestContext));

    const evidence = await Effect.runPromise(program);

    expect(civ7NarrativeChoicePostcondition(evidence)).toMatchObject({
      classification: "missing-postcondition",
      outcome: "unknown",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
  });

  test.each([
    ["fractional numeric blocker", 1.5],
    ["blank string blocker", "   "],
    ["string zero blocker", "0"],
    ["null blocker", null],
  ] as const)("classifies malformed post-send %s evidence as unknown rather than confirmed clearance", (_description, blocker) => {
    const postcondition = civ7NarrativeChoicePostcondition({
      kind: "observed",
      input: narrativeInput,
      beforeValidation: validation(true),
      afterValidation: validation(false),
      before: activeNarrativeSnapshot(),
      after: activeNarrativeSnapshot({
        blocker: unsafeNarrativeBlockerProbe(blocker),
        blockingNotification: probe(null),
      }),
    });

    expect(postcondition).toMatchObject({
      classification: "missing-postcondition",
      outcome: "unknown",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
    expect(postcondition.classification).not.toBe("narrative-blocker-cleared");
  });

  test("supports both exact procedures through the in-process server-side client", async () => {
    const before = activeNarrativeSnapshot();
    const fake = fakeContext({
      checks: [narrativeCheck(before), narrativeCheck(before)],
      sends: [narrativeSend({ before, after: clearedNarrativeSnapshot() })],
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    await expect(client.narrative.choice.check(narrativeInput)).resolves.toMatchObject({
      available: true,
    });
    await expect(client.narrative.choice.request(narrativeInput)).resolves.toMatchObject({
      status: "sent-confirmed",
      postcondition: { classification: "narrative-blocker-cleared" },
    });
  });
});

type FakeOptions = Readonly<{
  checks?: Civ7ControlOrpcNarrativeChoiceCheckResult[];
  repeatedCheck?: Civ7ControlOrpcNarrativeChoiceCheckResult;
  sends?: Civ7ControlOrpcNarrativeChoiceSendResult[];
  checkError?: Error;
  checkErrorAfterQueue?: Error;
  sendError?: Error;
}>;

function fakeContext(options: FakeOptions = {}) {
  const checks = [...(options.checks ?? [narrativeCheck(activeNarrativeSnapshot())])];
  const sends = [...(options.sends ?? [])];
  const calls = {
    checks: [] as Array<{ input: unknown; options: unknown }>,
    sends: [] as Array<{ input: unknown; options: unknown }>,
  };

  const context: Civ7ControlOrpcContext = {
    endpointDefaults,
    directControl: directControlFacadeFixture({
      getCiv7PlayableStatus: async () => playableStatusResult({ playable: true }),
      checkCiv7NarrativeChoice: async (input, directOptions) => {
        calls.checks.push({ input, options: directOptions });
        if (options.checkError) throw options.checkError;
        const queued = checks.shift();
        if (queued) return queued;
        if (options.checkErrorAfterQueue) throw options.checkErrorAfterQueue;
        return options.repeatedCheck ?? narrativeCheck(activeNarrativeSnapshot());
      },
      sendCiv7NarrativeChoice: async (input, directOptions) => {
        calls.sends.push({ input, options: directOptions });
        if (options.sendError) throw options.sendError;
        return (
          sends.shift() ??
          narrativeSend({
            before: activeNarrativeSnapshot(),
            after: clearedNarrativeSnapshot(),
          })
        );
      },
    }),
  };
  return { calls, context };
}

function narrativeCheck(
  snapshot: Civ7ControlOrpcNarrativeChoiceSnapshot,
  valid = true
): Civ7ControlOrpcNarrativeChoiceCheckResult {
  return {
    valid,
    result: { Success: valid },
    snapshot,
  };
}

function validation<const Valid extends boolean>(valid: Valid) {
  return {
    valid,
    result: { Success: valid },
  };
}

function narrativeSend(
  options: Readonly<{
    before: Civ7ControlOrpcNarrativeChoiceSnapshot;
    after: Civ7ControlOrpcNarrativeChoiceSnapshot;
  }>
): Extract<Civ7ControlOrpcNarrativeChoiceSendResult, { sent: true }> {
  return {
    sent: true,
    validation: validation(true),
    before: options.before,
    after: options.after,
  };
}

function narrativeNotSent(): Extract<Civ7ControlOrpcNarrativeChoiceSendResult, { sent: false }> {
  const snapshot = activeNarrativeSnapshot();
  return {
    sent: false,
    validation: validation(false),
    before: snapshot,
    after: snapshot,
  };
}

function activeNarrativeSnapshot(
  overrides: Partial<Civ7ControlOrpcNarrativeChoiceSnapshot> = {}
): Civ7ControlOrpcNarrativeChoiceSnapshot {
  return {
    localPlayerId: 0,
    activateAction: -1_326_475_004,
    canEndTurn: probe(false),
    blocker: probe(1783715360),
    blockingNotification: probe(narrativeNotification()),
    ...overrides,
  };
}

function clearedNarrativeSnapshot(): Civ7ControlOrpcNarrativeChoiceSnapshot {
  return activeNarrativeSnapshot({
    canEndTurn: probe(true),
    blocker: probe(0),
    blockingNotification: probe(null),
  });
}

function nonblockingSnapshot(
  overrides: Partial<Civ7ControlOrpcNarrativeChoiceSnapshot> = {}
): Civ7ControlOrpcNarrativeChoiceSnapshot {
  return activeNarrativeSnapshot({
    blocker: probe(0),
    blockingNotification: probe(null),
    ...overrides,
  });
}

function unresolvedNarrativeSnapshot(): Civ7ControlOrpcNarrativeChoiceSnapshot {
  return activeNarrativeSnapshot({
    blocker: failedProbe("end-turn blocker unavailable"),
    blockingNotification: failedProbe("blocking notification unavailable"),
  });
}

function narrativeNotification(
  overrides: Partial<
    NonNullable<
      Extract<Civ7ControlOrpcNarrativeChoiceSnapshot["blockingNotification"], { ok: true }>["value"]
    >
  > = {}
) {
  return {
    id: { owner: 0, id: 44, type: 20 },
    type: 111,
    typeName: "NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION" as const,
    target: null,
    ...overrides,
  };
}

function probe<T>(value: T): Civ7ControlOrpcRuntimeProbe<T> {
  return { ok: true, value };
}

function unsafeNarrativeBlockerProbe(
  value: unknown
): Civ7ControlOrpcNarrativeChoiceSnapshot["blocker"] {
  return { ok: true, value } as Civ7ControlOrpcNarrativeChoiceSnapshot["blocker"];
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

function expectSemanticNarrativeChoiceOmitsRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"playerId"');
  expect(serialized).not.toContain('"action"');
  expect(serialized).not.toContain('"activateAction"');
  expect(serialized).not.toContain('"blocker"');
  expect(serialized).not.toContain('"blockingNotification"');
  expect(serialized).not.toContain('"canEndTurn"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"payload"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain("CHOOSE_NARRATIVE_STORY_DIRECTION");
}
