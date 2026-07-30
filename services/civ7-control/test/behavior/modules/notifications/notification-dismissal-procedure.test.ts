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
  Civ7ControlOrpcNotificationDismissalCheckResult,
  Civ7ControlOrpcNotificationDismissalSendResult,
  Civ7ControlOrpcNotificationDismissalSnapshot,
  Civ7ControlOrpcRuntimeProbe,
} from "../../../../src/service/model/ports/direct-control";
import { dismissCiv7Notification } from "../../../../src/service/modules/notifications/model/policy/dismissal-execution";
import { pollNotificationDismissalPostcondition } from "../../../../src/service/modules/notifications/model/policy/dismissal-polling";
import {
  civ7NotificationDismissalPostcondition,
  notificationDismissalAvailable,
} from "../../../../src/service/modules/notifications/model/policy/dismissal-result";
import { directControlFacadeFixture } from "../../../support/direct-control-facade";
import { playableStatusResult } from "../../../support/playable-status";

const notificationId = { owner: 0, id: 113, type: 20 };
const endpointDefaults = {
  host: "127.0.0.1",
  port: 4318,
  timeoutMs: 1_000,
} as const;

describe("notification dismissal control-oRPC procedures", () => {
  test("exposes the smallest exact native availability result", async () => {
    const before = snapshot();
    const fake = fakeContext({ checks: [dismissalCheck(before)] });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    await expect(client.notifications.dismiss.check({ notificationId })).resolves.toEqual({
      notificationId,
      available: true,
    });
    expect(fake.calls.checks).toEqual([
      {
        input: { notificationId },
        options: endpointDefaults,
      },
    ]);
  });

  test.each([
    ["missing notification", snapshot({ exists: false })],
    ["foreign owner", snapshot({ notificationId: { ...notificationId, owner: 1 } })],
    ["invalid local player", snapshot({ localPlayerId: -1 })],
    ["unknown type", snapshot({ typeName: null })],
    ["inactive queue", snapshot({ activeQueue: probe(false) })],
    ["unreadable active queue", snapshot({ activeQueue: failedProbe("queue unavailable") })],
    ["not user dismissible", snapshot({ canUserDismiss: probe(false) })],
    [
      "unreadable user dismissal",
      snapshot({ canUserDismiss: failedProbe("validator unavailable") }),
    ],
    ["science advisor warning", snapshot({ typeName: "NOTIFICATION_ADVISOR_WARNING_SCIENCE" })],
    ["culture advisor warning", snapshot({ typeName: "NOTIFICATION_ADVISOR_WARNING_CULTURE" })],
    ["economic advisor warning", snapshot({ typeName: "NOTIFICATION_ADVISOR_WARNING_ECONOMIC" })],
    ["military advisor warning", snapshot({ typeName: "NOTIFICATION_ADVISOR_WARNING_MILITARY" })],
  ] as const)("rejects %s from generic native dismissal admission", (_description, observed) => {
    expect(notificationDismissalAvailable(dismissalCheck(observed))).toBe(false);
  });

  test("projects unavailable fresh evidence as not-sent without dispatch", async () => {
    const before = snapshot({ canUserDismiss: probe(false) });
    const fake = fakeContext({ checks: [dismissalCheck(before)] });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.dismiss.request,
      { notificationId },
      { context: fake.context }
    );

    expect(fake.calls.sends).toEqual([]);
    expect(result).toMatchObject({
      notificationId,
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
    expectSemanticDismissalOmitsRuntimeDetails(result);
  });

  test("guards the send with the exact expected snapshot and confirms disappearance", async () => {
    const before = snapshot();
    const after = snapshot({ exists: false });
    const fake = fakeContext({
      checks: [dismissalCheck(before)],
      sends: [dismissalSend(before, after)],
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.dismiss.request,
      { notificationId },
      { context: fake.context }
    );

    expect(fake.calls.sends).toEqual([
      {
        input: { expected: before },
        options: endpointDefaults,
      },
    ]);
    expect(fake.calls.checks).toHaveLength(1);
    expect(result).toEqual({
      notificationId,
      status: "sent-confirmed",
      postcondition: {
        classification: "notification-disappeared",
        reason: "The exact notification no longer exists in the engine notification registry.",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "notifications.dismiss.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    });
    expectSemanticDismissalOmitsRuntimeDetails(result);
  });

  test.each([
    ["active queue removal", snapshot({ activeQueue: probe(false) }), "active-queue-removed"],
    [
      "dismissed state without affirmative active evidence",
      snapshot({
        activeQueue: failedProbe("active queue unavailable"),
        dismissed: probe(true),
      }),
      "notification-dismissed",
    ],
  ] as const)("confirms %s", async (_description, after, classification) => {
    const before = snapshot();
    const fake = fakeContext({
      checks: [dismissalCheck(before)],
      sends: [dismissalSend(before, after)],
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.dismiss.request,
      { notificationId },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-confirmed",
      postcondition: {
        classification,
        outcome: "cleared",
        confirmed: true,
      },
    });
  });

  test("does not confirm dismissed=true while the notification is still active", () => {
    const postcondition = civ7NotificationDismissalPostcondition({
      kind: "observed",
      before: snapshot(),
      after: snapshot({ activeQueue: probe(true), dismissed: probe(true) }),
    });

    expect(postcondition).toEqual({
      classification: "notification-still-active",
      reason: "The exact notification remains in the active engine notification queue.",
      outcome: "still-active",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
  });

  test("polls after a dispatched send failure and confirms later clearance", async () => {
    const before = snapshot();
    const after = snapshot({ activeQueue: probe(false) });
    const fake = fakeContext({
      checks: [dismissalCheck(before), dismissalCheck(after)],
      sendError: dispatchError("dispatched", "dismiss response unavailable"),
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.dismiss.request,
      { notificationId },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-confirmed",
      postcondition: { classification: "active-queue-removed" },
    });
    expect(fake.calls.checks).toHaveLength(2);
  });

  test("projects a guarded snapshot mismatch as definitely not sent", async () => {
    const fake = fakeContext({
      sendError: dispatchError(
        "not-dispatched",
        "Notification dismissal evidence changed before dispatch."
      ),
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.dismiss.request,
      { notificationId },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        reason:
          "The guarded send failed before the native notification dismissal call was invoked.",
      },
      nextSteps: [{ kind: "inspect-notification" }],
    });
    expect(fake.calls.checks).toHaveLength(1);
  });

  test("keeps unresolved indeterminate dispatch no-repeat guarded", async () => {
    const before = snapshot();
    const never = new Promise<Civ7ControlOrpcNotificationDismissalCheckResult>(() => undefined);
    const fake = fakeContext({
      checks: [dismissalCheck(before)],
      repeatedCheck: () => never,
      sendError: dispatchError("indeterminate", "dismiss transport outcome unavailable"),
    });
    const program = Effect.gen(function* () {
      const fiber = yield* Effect.fork(dismissCiv7Notification({ notificationId }, fake.context));
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

  test("bounds an unfinished postcheck by the remaining Effect deadline", async () => {
    const timeoutMs: number[] = [];
    const never = new Promise<Civ7ControlOrpcNotificationDismissalCheckResult>(() => undefined);
    const effect = pollNotificationDismissalPostcondition({
      before: snapshot(),
      initialAfter: snapshot(),
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

    expect(civ7NotificationDismissalPostcondition(evidence).classification).toBe(
      "notification-still-active"
    );
    expect(timeoutMs).toEqual([1_000]);
  });

  test("maps check and request precheck failures to exact tagged procedure keys", async () => {
    const failing = fakeContext({
      checkError: new Error("notification dismissal state unavailable"),
    });

    await expect(
      call(
        Civ7ControlOrpcRouter.notifications.dismiss.check,
        { notificationId },
        { context: failing.context }
      )
    ).rejects.toMatchObject({
      code: "NOTIFICATION_DISMISSAL_UNAVAILABLE",
      status: 503,
      data: { procedureKey: "notifications.dismiss.check" },
    });
    await expect(
      call(
        Civ7ControlOrpcRouter.notifications.dismiss.request,
        { notificationId },
        { context: failing.context }
      )
    ).rejects.toMatchObject({
      code: "NOTIFICATION_DISMISSAL_UNAVAILABLE",
      status: 503,
      data: { procedureKey: "notifications.dismiss.request" },
    });
  });
});

type FakeOptions = Readonly<{
  checks?: Civ7ControlOrpcNotificationDismissalCheckResult[];
  repeatedCheck?: () => Promise<Civ7ControlOrpcNotificationDismissalCheckResult>;
  sends?: Civ7ControlOrpcNotificationDismissalSendResult[];
  checkError?: Error;
  sendError?: Error;
}>;

function fakeContext(options: FakeOptions = {}) {
  const checks = [...(options.checks ?? [dismissalCheck(snapshot())])];
  const sends = [...(options.sends ?? [])];
  const calls = {
    checks: [] as Array<{ input: unknown; options: unknown }>,
    sends: [] as Array<{ input: unknown; options: unknown }>,
  };
  const context: Civ7ControlOrpcContext = {
    endpointDefaults,
    directControl: directControlFacadeFixture({
      getCiv7PlayableStatus: async () => playableStatusResult({ playable: true }),
      checkCiv7NotificationDismissal: async (input, directOptions) => {
        calls.checks.push({ input, options: directOptions });
        if (options.checkError) throw options.checkError;
        return (
          checks.shift() ??
          (options.repeatedCheck ? await options.repeatedCheck() : dismissalCheck(snapshot()))
        );
      },
      sendCiv7NotificationDismissal: async (input, directOptions) => {
        calls.sends.push({ input, options: directOptions });
        if (options.sendError) throw options.sendError;
        return sends.shift() ?? dismissalSend(snapshot(), snapshot({ exists: false }));
      },
    }),
  };
  return { calls, context };
}

function dismissalCheck(
  observed: Civ7ControlOrpcNotificationDismissalSnapshot
): Civ7ControlOrpcNotificationDismissalCheckResult {
  return { snapshot: observed };
}

function dismissalSend(
  before: Civ7ControlOrpcNotificationDismissalSnapshot,
  after: Civ7ControlOrpcNotificationDismissalSnapshot
): Civ7ControlOrpcNotificationDismissalSendResult {
  return { sent: true, before, after };
}

function snapshot(
  overrides: Partial<Civ7ControlOrpcNotificationDismissalSnapshot> = {}
): Civ7ControlOrpcNotificationDismissalSnapshot {
  return {
    notificationId,
    localPlayerId: 0,
    exists: true,
    typeName: "NOTIFICATION_WONDER_COMPLETED",
    activeQueue: probe(true),
    canUserDismiss: probe(true),
    dismissed: probe(false),
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

function expectSemanticDismissalOmitsRuntimeDetails(result: unknown): void {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"localPlayerId"');
  expect(serialized).not.toContain('"exists"');
  expect(serialized).not.toContain('"activeQueue"');
  expect(serialized).not.toContain('"canUserDismiss"');
  expect(serialized).not.toContain('"dismissed"');
  expect(serialized).not.toContain('"expected"');
  expect(serialized).not.toContain('"sent"');
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain("Game.Notifications.dismiss");
}
