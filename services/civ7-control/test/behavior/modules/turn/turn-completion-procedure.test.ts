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
  Civ7ControlOrpcRuntimeProbe,
  Civ7ControlOrpcTurnCompletionCheckResult,
  Civ7ControlOrpcTurnCompletionSendResult,
  Civ7ControlOrpcTurnCompletionSnapshot,
} from "../../../../src/service/model/ports/direct-control";
import { pollTurnCompletionPostcondition } from "../../../../src/service/modules/turn/model/policy/completion-polling";
import { civ7TurnCompletionPostcondition } from "../../../../src/service/modules/turn/model/policy/completion-postcondition";
import { directControlFacadeFixture } from "../../../support/direct-control-facade";
import { playableStatusResult } from "../../../support/playable-status";

const endpointDefaults = {
  host: "127.0.0.1",
  port: 4318,
  timeoutMs: 1_000,
} as const;

describe("turn completion control-oRPC procedures", () => {
  test.each([
    ["canEndTurn false", snapshot({ canEndTurn: probe(false) })],
    ["hasSentTurnComplete true", snapshot({ hasSentTurnComplete: probe(true) })],
    ["canEndTurn unreadable", snapshot({ canEndTurn: failedProbe("canEnd unavailable") })],
    [
      "hasSentTurnComplete unreadable",
      snapshot({ hasSentTurnComplete: failedProbe("sent state unavailable") }),
    ],
    ["turn unreadable", snapshot({ turn: failedProbe("turn unavailable") })],
    ["turn non-finite", snapshot({ turn: probe(Number.NaN) })],
    ["local player invalid", snapshot({ localPlayerId: -1 })],
  ] as const)("checks exact native availability and rejects %s", async (_description, observed) => {
    const fake = fakeContext({
      checks: [turnCheck(observed)],
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    await expect(client.turn.complete.check({})).resolves.toEqual({
      available: false,
    });
    expect(fake.calls.checks).toEqual([
      {
        input: {},
        options: endpointDefaults,
      },
    ]);
  });

  test("reports available only for a coherent dispatchable native snapshot", async () => {
    const fake = fakeContext({
      checks: [turnCheck(snapshot())],
    });

    await expect(
      call(Civ7ControlOrpcRouter.turn.complete.check, {}, { context: fake.context })
    ).resolves.toEqual({ available: true });
  });

  test.each([
    ["canEndTurn false", snapshot({ canEndTurn: probe(false) })],
    ["turn unreadable", snapshot({ turn: failedProbe("turn unavailable") })],
    ["local player invalid", snapshot({ localPlayerId: -1 })],
  ] as const)("projects %s as not-sent without dispatch", async (_description, observed) => {
    const fake = fakeContext({
      checks: [turnCheck(observed)],
    });

    const result = await call(
      Civ7ControlOrpcRouter.turn.complete.request,
      {},
      { context: fake.context }
    );

    expect(fake.calls.sends).toEqual([]);
    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "inspect-turn-completion" }],
    });
    expectSemanticTurnCompletionOmitsRuntimeDetails(result);
  });

  test("confirms turn advance as refresh-safe", async () => {
    const before = snapshot();
    const after = snapshot({ turn: probe(13) });
    const fake = fakeContext({
      checks: [turnCheck(before)],
      sends: [turnSend({ before, after })],
    });

    const result = await call(
      Civ7ControlOrpcRouter.turn.complete.request,
      {},
      { context: fake.context }
    );

    expect(fake.calls.sends).toEqual([
      {
        input: { expected: before },
        options: endpointDefaults,
      },
    ]);
    expect(result).toEqual({
      status: "sent-confirmed",
      postcondition: {
        classification: "turn-advanced",
        reason: "The observed game turn advanced after the turn-completion send.",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "turn.complete.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    });
    expectSemanticTurnCompletionOmitsRuntimeDetails(result);
  });

  test("treats hasSent true as confirmed acknowledgement with no-repeat", async () => {
    const before = snapshot();
    const after = snapshot({ hasSentTurnComplete: probe(true) });
    const fake = fakeContext({
      checks: [turnCheck(before)],
      sends: [turnSend({ before, after })],
    });

    const result = await call(
      Civ7ControlOrpcRouter.turn.complete.request,
      {},
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-guarded",
      postcondition: {
        classification: "turn-complete-sent",
        outcome: "state-changed",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "do-not-repeat" }],
    });
  });

  test("keeps unchanged observations sent-unverified and no-repeat guarded", async () => {
    const before = snapshot();
    const fake = fakeContext({
      checks: [turnCheck(before)],
      sends: [turnSend({ before, after: before })],
      repeatedCheck: turnCheck(before),
    });

    const result = await call(
      Civ7ControlOrpcRouter.turn.complete.request,
      {},
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-unverified",
      postcondition: {
        classification: "no-state-change",
        outcome: "no-state-change",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "do-not-repeat" }],
    });
  });

  test("keeps missing and incoherent observations unknown and no-repeat guarded", () => {
    const before = snapshot();
    const missing = civ7TurnCompletionPostcondition({
      kind: "observed",
      before,
      after: snapshot({ turn: failedProbe("turn unavailable") }),
    });
    const backwards = civ7TurnCompletionPostcondition({
      kind: "observed",
      before,
      after: snapshot({ turn: probe(11) }),
    });

    for (const postcondition of [missing, backwards]) {
      expect(postcondition).toMatchObject({
        classification: "missing-postcondition",
        outcome: "unknown",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      });
    }
  });

  test.each([
    ["dispatched", "dispatch-unknown"],
    ["indeterminate", "dispatch-unknown"],
    ["not-dispatched", "not-sent"],
  ] as const)("classifies %s send failure without unsafe retry advice", async (dispatchStatus, status) => {
    const fake = fakeContext({
      sendError: dispatchError(dispatchStatus, "turn completion send failed"),
    });

    const result = await call(
      Civ7ControlOrpcRouter.turn.complete.request,
      {},
      { context: fake.context }
    );

    expect(result.status).toBe(status);
    expect(result.postcondition.classification).toBe(
      status === "not-sent" ? "not-sent" : "missing-postcondition"
    );
    expect(result.nextSteps[0]?.kind).toBe(
      status === "not-sent" ? "inspect-turn-completion" : "do-not-repeat"
    );
  });

  test("maps check and request precheck failures to exact tagged procedure keys", async () => {
    const failing = fakeContext({
      checkError: new Error("turn completion state unavailable"),
    });

    await expect(
      call(Civ7ControlOrpcRouter.turn.complete.check, {}, { context: failing.context })
    ).rejects.toMatchObject({
      code: "TURN_COMPLETION_UNAVAILABLE",
      status: 503,
      data: { procedureKey: "turn.complete.check" },
    });
    await expect(
      call(Civ7ControlOrpcRouter.turn.complete.request, {}, { context: failing.context })
    ).rejects.toMatchObject({
      code: "TURN_COMPLETION_UNAVAILABLE",
      status: 503,
      data: { procedureKey: "turn.complete.request" },
    });
  });

  test("bounds an unfinished postcheck by the remaining Effect deadline", async () => {
    const timeoutMs: number[] = [];
    const never = new Promise<Civ7ControlOrpcTurnCompletionCheckResult>(() => undefined);
    const effect = pollTurnCompletionPostcondition({
      send: turnSend({ before: snapshot(), after: snapshot() }),
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

  test("retains latest completed evidence when a later read hangs", async () => {
    const before = snapshot();
    const unreadableAcknowledgement = snapshot({
      hasSentTurnComplete: failedProbe("sent state unavailable"),
    });
    const never = new Promise<Civ7ControlOrpcTurnCompletionCheckResult>(() => undefined);
    let checks = 0;
    const effect = pollTurnCompletionPostcondition({
      send: turnSend({ before, after: before }),
      check: () => {
        checks += 1;
        return checks === 1 ? Promise.resolve(turnCheck(unreadableAcknowledgement)) : never;
      },
      waitMs: 1_000,
    });

    const evidence = await Effect.runPromise(
      Effect.gen(function* () {
        const fiber = yield* Effect.fork(effect);
        yield* Effect.yieldNow();
        yield* TestClock.adjust(1_000);
        return yield* Fiber.join(fiber);
      }).pipe(Effect.provide(TestContext.TestContext))
    );

    expect(civ7TurnCompletionPostcondition(evidence).classification).toBe("missing-postcondition");
    expect(checks).toBe(2);
  });

  test("recovers from a transient postcheck failure and confirms turn advance", async () => {
    let checks = 0;
    const effect = pollTurnCompletionPostcondition({
      send: turnSend({ before: snapshot(), after: snapshot() }),
      check: () => {
        checks += 1;
        return checks === 1
          ? Promise.reject(new Error("transient postcheck failure"))
          : Promise.resolve(turnCheck(snapshot({ turn: probe(13) })));
      },
      waitMs: 1_000,
    });

    const evidence = await Effect.runPromise(
      Effect.gen(function* () {
        const fiber = yield* Effect.fork(effect);
        yield* Effect.yieldNow();
        yield* TestClock.adjust(250);
        return yield* Fiber.join(fiber);
      }).pipe(Effect.provide(TestContext.TestContext))
    );

    expect(civ7TurnCompletionPostcondition(evidence).classification).toBe("turn-advanced");
    expect(checks).toBe(2);
  });

  test("supports both exact procedures through the in-process client", async () => {
    const before = snapshot();
    const fake = fakeContext({
      checks: [turnCheck(before), turnCheck(before)],
      sends: [turnSend({ before, after: snapshot({ turn: probe(13) }) })],
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    await expect(client.turn.complete.check({})).resolves.toEqual({ available: true });
    await expect(client.turn.complete.request({})).resolves.toMatchObject({
      status: "sent-confirmed",
      postcondition: { classification: "turn-advanced" },
    });
  });
});

type FakeOptions = Readonly<{
  checks?: Civ7ControlOrpcTurnCompletionCheckResult[];
  repeatedCheck?: Civ7ControlOrpcTurnCompletionCheckResult;
  sends?: Civ7ControlOrpcTurnCompletionSendResult[];
  checkError?: Error;
  sendError?: Error;
}>;

function fakeContext(options: FakeOptions = {}) {
  const checks = [...(options.checks ?? [turnCheck(snapshot())])];
  const sends = [...(options.sends ?? [])];
  const calls = {
    checks: [] as Array<{ input: unknown; options: unknown }>,
    sends: [] as Array<{ input: unknown; options: unknown }>,
  };
  const context: Civ7ControlOrpcContext = {
    endpointDefaults,
    directControl: directControlFacadeFixture({
      getCiv7PlayableStatus: async () => playableStatusResult({ playable: true }),
      checkCiv7TurnCompletion: async (input, directOptions) => {
        calls.checks.push({ input, options: directOptions });
        if (options.checkError) throw options.checkError;
        return checks.shift() ?? options.repeatedCheck ?? turnCheck(snapshot());
      },
      sendCiv7TurnCompletion: async (input, directOptions) => {
        calls.sends.push({ input, options: directOptions });
        if (options.sendError) throw options.sendError;
        return (
          sends.shift() ??
          turnSend({
            before: snapshot(),
            after: snapshot({ hasSentTurnComplete: probe(true) }),
          })
        );
      },
    }),
  };
  return { calls, context };
}

function turnCheck(
  observed: Civ7ControlOrpcTurnCompletionSnapshot
): Civ7ControlOrpcTurnCompletionCheckResult {
  return { snapshot: observed };
}

function turnSend(
  observed: Readonly<{
    before: Civ7ControlOrpcTurnCompletionSnapshot;
    after: Civ7ControlOrpcTurnCompletionSnapshot;
  }>
): Extract<Civ7ControlOrpcTurnCompletionSendResult, { sent: true }> {
  return {
    sent: true,
    before: observed.before,
    after: observed.after,
  };
}

function snapshot(
  overrides: Partial<Civ7ControlOrpcTurnCompletionSnapshot> = {}
): Civ7ControlOrpcTurnCompletionSnapshot {
  return {
    localPlayerId: 0,
    turn: probe(12),
    hasSentTurnComplete: probe(false),
    canEndTurn: probe(true),
    ...overrides,
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

function expectSemanticTurnCompletionOmitsRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"localPlayerId"');
  expect(serialized).not.toContain('"turn"');
  expect(serialized).not.toContain('"hasSentTurnComplete"');
  expect(serialized).not.toContain('"canEndTurn"');
  expect(serialized).not.toContain('"expected"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"verified"');
}
