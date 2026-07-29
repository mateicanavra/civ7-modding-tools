import { call } from "@orpc/server";
import { Effect, Fiber, TestClock, TestContext } from "effect";
import { describe, expect, test } from "vitest";

import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcRouter,
  createCiv7ControlOrpcServerClient,
} from "../../../../src/index";
import type {
  Civ7ControlOrpcAdvisorWarningViewedCheckResult,
  Civ7ControlOrpcAdvisorWarningViewedSendResult,
  Civ7ControlOrpcAdvisorWarningViewedSnapshot,
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcRuntimeProbe,
} from "../../../../src/service/model/ports/direct-control";
import { acknowledgeCiv7AdvisorWarningViewed } from "../../../../src/service/modules/notifications/model/policy/advisor-warning-execution";
import {
  advisorWarningViewedAvailable,
  civ7AdvisorWarningViewedPostcondition,
} from "../../../../src/service/modules/notifications/model/policy/advisor-warning-result";
import { advisorWarningNotificationTypeNames } from "../../../../src/service/modules/notifications/model/policy/advisor-warning-type";
import { directControlFacadeFixture } from "../../../support/direct-control-facade";
import { playableStatusResult } from "../../../support/playable-status";

const target = { owner: 0, id: 12345, type: 99 };
const endpointDefaults = {
  host: "127.0.0.1",
  port: 4318,
  timeoutMs: 1_000,
} as const;

describe("advisor-warning viewed control-oRPC procedures", () => {
  test.each(
    advisorWarningNotificationTypeNames
  )("admits the exact local active %s identity", async (typeName) => {
    const before = snapshot({ typeName });
    const fake = fakeContext({ checks: [advisorCheck(before)] });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    await expect(client.notifications.advisorWarning.viewed.check({ target })).resolves.toEqual({
      target,
      available: true,
    });
    expect(fake.calls.checks).toEqual([
      {
        input: { target },
        options: endpointDefaults,
      },
    ]);
  });

  test.each([
    ["native validation rejection", advisorCheck(snapshot(), false)],
    ["missing warning", advisorCheck(snapshot({ exists: false }))],
    ["foreign owner", advisorCheck(snapshot({ target: { ...target, owner: 1 } }))],
    ["invalid local player", advisorCheck(snapshot({ localPlayerId: -1 }))],
    ["unknown type", advisorCheck(snapshot({ typeName: "NOTIFICATION_WONDER_COMPLETED" }))],
    ["missing type", advisorCheck(snapshot({ typeName: null }))],
    ["inactive queue", advisorCheck(snapshot({ activeQueue: probe(false) }))],
    [
      "unreadable active queue",
      advisorCheck(snapshot({ activeQueue: failedProbe("queue unavailable") })),
    ],
  ] as const)("rejects %s from dedicated acknowledgement admission", (_description, check) => {
    expect(advisorWarningViewedAvailable(target, check)).toBe(false);
  });

  test("projects rejected fresh evidence as not-sent without dispatch", async () => {
    const before = snapshot({ typeName: "NOTIFICATION_WONDER_COMPLETED" });
    const fake = fakeContext({ checks: [advisorCheck(before)] });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.advisorWarning.viewed.request,
      { target },
      { context: fake.context }
    );

    expect(fake.calls.sends).toEqual([]);
    expect(result).toMatchObject({
      target,
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "inspect-notification" }],
    });
    expectSemanticAdvisorWarningOutput(result);
  });

  test("projects guarded native validation change as not-sent", async () => {
    const before = snapshot();
    const fake = fakeContext({
      checks: [advisorCheck(before)],
      sends: [advisorRejectedSend(before)],
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.advisorWarning.viewed.request,
      { target },
      { context: fake.context }
    );

    expect(fake.calls.sends).toHaveLength(1);
    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        reason:
          "The guarded advisor-warning acknowledgement did not pass native validation, so it was not sent.",
      },
      nextSteps: [{ kind: "inspect-notification" }],
    });
  });

  test("guards the send with exact expected evidence and confirms registry disappearance", async () => {
    const before = snapshot();
    const after = snapshot({
      exists: false,
      typeName: null,
      activeQueue: probe(false),
    });
    const fake = fakeContext({
      checks: [advisorCheck(before)],
      sends: [advisorSend(before, after)],
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.advisorWarning.viewed.request,
      { target },
      { context: fake.context }
    );

    expect(fake.calls.sends).toEqual([
      {
        input: { target, expected: before },
        options: endpointDefaults,
      },
    ]);
    expect(result).toEqual({
      target,
      status: "sent-confirmed",
      postcondition: {
        classification: "advisor-warning-disappeared",
        reason: "The exact advisor warning no longer exists in the engine notification registry.",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "notifications.advisorWarning.viewed.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    });
    expectSemanticAdvisorWarningOutput(result);
  });

  test("confirms exact active-queue removal", async () => {
    const before = snapshot();
    const after = snapshot({ activeQueue: probe(false) });
    const fake = fakeContext({
      checks: [advisorCheck(before)],
      sends: [advisorSend(before, after)],
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.advisorWarning.viewed.request,
      { target },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-confirmed",
      postcondition: {
        classification: "active-queue-removed",
        outcome: "cleared",
        confirmed: true,
      },
    });
  });

  test("polls a successful send until the exact active queue clears", async () => {
    const before = snapshot();
    const immediateAfter = snapshot();
    const cleared = snapshot({ activeQueue: probe(false) });
    const fake = fakeContext({
      checks: [advisorCheck(before), advisorCheck(cleared)],
      sends: [advisorSend(before, immediateAfter)],
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.advisorWarning.viewed.request,
      { target },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-confirmed",
      postcondition: {
        classification: "active-queue-removed",
        outcome: "cleared",
        confirmed: true,
      },
    });
    expect(fake.calls.checks).toHaveLength(2);
  });

  test("keeps a sticky active warning unverified and no-repeat guarded", () => {
    expect(
      civ7AdvisorWarningViewedPostcondition({
        kind: "observed",
        before: snapshot(),
        after: snapshot({ activeQueue: probe(true) }),
      })
    ).toEqual({
      classification: "advisor-warning-still-active",
      reason: "The exact advisor warning remains in the active engine notification queue.",
      outcome: "still-active",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
  });

  test("does not confirm contradictory registry and active-queue evidence", () => {
    expect(
      civ7AdvisorWarningViewedPostcondition({
        kind: "observed",
        before: snapshot(),
        after: snapshot({
          exists: false,
          typeName: null,
          activeQueue: probe(true),
        }),
      })
    ).toEqual({
      classification: "missing-postcondition",
      reason:
        "The advisor-warning observations did not provide one coherent target and local-player identity.",
      outcome: "unknown",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
  });

  test("does not infer clearance from an unreadable active queue", () => {
    expect(
      civ7AdvisorWarningViewedPostcondition({
        kind: "observed",
        before: snapshot(),
        after: snapshot({ activeQueue: failedProbe("queue unavailable") }),
      })
    ).toEqual({
      classification: "missing-postcondition",
      reason:
        "The advisor warning still exists, but active-queue evidence did not prove target-specific clearance.",
      outcome: "unknown",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
  });

  test("confirms clearance after the native send was invoked but its response failed", async () => {
    const before = snapshot();
    const after = snapshot({ activeQueue: probe(false) });
    const fake = fakeContext({
      checks: [advisorCheck(before), advisorCheck(after)],
      sendError: dispatchError("dispatched", "acknowledgement response unavailable"),
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.advisorWarning.viewed.request,
      { target },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-confirmed",
      postcondition: { classification: "active-queue-removed" },
    });
    expect(fake.calls.checks).toHaveLength(2);
  });

  test("keeps indeterminate dispatch unknown even when the target later clears", async () => {
    const before = snapshot();
    const after = snapshot({ activeQueue: probe(false) });
    const fake = fakeContext({
      checks: [advisorCheck(before), advisorCheck(after)],
      sendError: dispatchError("indeterminate", "transport outcome unavailable"),
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.advisorWarning.viewed.request,
      { target },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "dispatch-unknown",
      postcondition: {
        classification: "active-queue-removed",
        outcome: "cleared",
        confirmed: true,
      },
      nextSteps: [{ kind: "do-not-repeat" }],
    });
  });

  test("keeps unresolved indeterminate dispatch explicitly unknown", async () => {
    const before = snapshot();
    const never = new Promise<Civ7ControlOrpcAdvisorWarningViewedCheckResult>(() => undefined);
    const fake = fakeContext({
      checks: [advisorCheck(before)],
      repeatedCheck: () => never,
      sendError: dispatchError("indeterminate", "transport outcome unavailable"),
    });
    const program = Effect.gen(function* () {
      const fiber = yield* Effect.fork(
        acknowledgeCiv7AdvisorWarningViewed({ target }, fake.context)
      );
      yield* Effect.yieldNow();
      yield* TestClock.adjust(1_000);
      return yield* Fiber.join(fiber);
    }).pipe(Effect.provide(TestContext.TestContext));

    const result = await Effect.runPromise(program);

    expect(result).toMatchObject({
      status: "dispatch-unknown",
      postcondition: {
        classification: "missing-postcondition",
        outcome: "unknown",
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "do-not-repeat" }],
    });
  });

  test("projects guarded not-dispatched failure as definitely not sent", async () => {
    const fake = fakeContext({
      sendError: dispatchError("not-dispatched", "fresh evidence changed before dispatch"),
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.advisorWarning.viewed.request,
      { target },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        reason:
          "The guarded send failed before the native advisor-warning acknowledgement was invoked.",
      },
      nextSteps: [{ kind: "inspect-notification" }],
    });
  });

  test("maps check and request precheck failures to exact tagged procedure keys", async () => {
    const failing = fakeContext({
      checkError: new Error("advisor-warning evidence unavailable"),
    });

    await expect(
      call(
        Civ7ControlOrpcRouter.notifications.advisorWarning.viewed.check,
        { target },
        { context: failing.context }
      )
    ).rejects.toMatchObject({
      code: "NOTIFICATION_ADVISOR_WARNING_UNAVAILABLE",
      status: 503,
      data: { procedureKey: "notifications.advisorWarning.viewed.check" },
    });
    await expect(
      call(
        Civ7ControlOrpcRouter.notifications.advisorWarning.viewed.request,
        { target },
        { context: failing.context }
      )
    ).rejects.toMatchObject({
      code: "NOTIFICATION_ADVISOR_WARNING_UNAVAILABLE",
      status: 503,
      data: { procedureKey: "notifications.advisorWarning.viewed.request" },
    });
  });
});

type FakeOptions = Readonly<{
  checks?: Civ7ControlOrpcAdvisorWarningViewedCheckResult[];
  repeatedCheck?: () => Promise<Civ7ControlOrpcAdvisorWarningViewedCheckResult>;
  sends?: Civ7ControlOrpcAdvisorWarningViewedSendResult[];
  checkError?: Error;
  sendError?: Error;
}>;

function fakeContext(options: FakeOptions = {}) {
  const checks = [...(options.checks ?? [advisorCheck(snapshot())])];
  const sends = [...(options.sends ?? [])];
  const calls = {
    checks: [] as Array<{ input: unknown; options: unknown }>,
    sends: [] as Array<{ input: unknown; options: unknown }>,
  };
  const context: Civ7ControlOrpcContext = {
    endpointDefaults,
    directControl: directControlFacadeFixture({
      getCiv7PlayableStatus: async () => playableStatusResult({ playable: true }),
      checkCiv7AdvisorWarningViewed: async (input, directOptions) => {
        calls.checks.push({ input, options: directOptions });
        if (options.checkError) throw options.checkError;
        return (
          checks.shift() ??
          (options.repeatedCheck ? await options.repeatedCheck() : advisorCheck(snapshot()))
        );
      },
      sendCiv7AdvisorWarningViewed: async (input, directOptions) => {
        calls.sends.push({ input, options: directOptions });
        if (options.sendError) throw options.sendError;
        return sends.shift() ?? advisorSend(snapshot(), snapshot({ exists: false }));
      },
    }),
  };
  return { calls, context };
}

function advisorCheck(
  observed: Civ7ControlOrpcAdvisorWarningViewedSnapshot,
  valid = true
): Civ7ControlOrpcAdvisorWarningViewedCheckResult {
  return {
    valid,
    result: { Success: valid },
    snapshot: observed,
  };
}

function advisorSend(
  before: Civ7ControlOrpcAdvisorWarningViewedSnapshot,
  after: Civ7ControlOrpcAdvisorWarningViewedSnapshot
): Civ7ControlOrpcAdvisorWarningViewedSendResult {
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

function advisorRejectedSend(
  before: Civ7ControlOrpcAdvisorWarningViewedSnapshot
): Civ7ControlOrpcAdvisorWarningViewedSendResult {
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

function snapshot(
  overrides: Partial<Civ7ControlOrpcAdvisorWarningViewedSnapshot> = {}
): Civ7ControlOrpcAdvisorWarningViewedSnapshot {
  return {
    target,
    localPlayerId: 0,
    exists: true,
    typeName: "NOTIFICATION_ADVISOR_WARNING_SCIENCE",
    activeQueue: probe(true),
    ...overrides,
  };
}

function probe<T>(value: T): Civ7ControlOrpcRuntimeProbe<T> {
  return { ok: true, value };
}

function failedProbe(error: string): Civ7ControlOrpcRuntimeProbe<boolean> {
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

function expectSemanticAdvisorWarningOutput(result: unknown): void {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"playerId"');
  expect(serialized).not.toContain('"localPlayerId"');
  expect(serialized).not.toContain('"exists"');
  expect(serialized).not.toContain('"typeName"');
  expect(serialized).not.toContain('"activeQueue"');
  expect(serialized).not.toContain('"expected"');
  expect(serialized).not.toContain('"sent"');
  expect(serialized).not.toContain('"validation"');
  expect(serialized).not.toContain('"result"');
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain("VIEWED_ADVISOR_WARNING");
}
