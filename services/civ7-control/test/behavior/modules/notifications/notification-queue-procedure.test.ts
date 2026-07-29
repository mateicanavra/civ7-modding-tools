import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcRouter,
  createCiv7ControlOrpcServerClient,
} from "../../../../src/index";
import type {
  Civ7ControlOrpcNotificationDismissalCheckResult,
  Civ7ControlOrpcNotificationDismissalSendResult,
  Civ7ControlOrpcNotificationDismissalSnapshot,
  Civ7ControlOrpcPlayNotificationViewResult,
  Civ7ControlOrpcRuntimeProbe,
} from "../../../../src/service/model/ports/direct-control";
import { directControlFacadeFixture } from "../../../support/direct-control-facade";
import { playableStatusResult } from "../../../support/playable-status";

const informationalId = { owner: 0, id: 113, type: 20 };
const secondInformationalId = { owner: 0, id: 114, type: 20 };
const thirdInformationalId = { owner: 0, id: 115, type: 20 };
const unitLostId = { owner: 0, id: 116, type: 20 };
const productionId = { owner: 0, id: 117, type: 20 };
const advisorId = { owner: 0, id: 118, type: 20 };
const endpointDefaults = {
  host: "127.0.0.1",
  port: 4318,
  timeoutMs: 1_000,
} as const;
type NotificationId = Civ7ControlOrpcNotificationDismissalSnapshot["notificationId"];

describe("notifications.queue control-oRPC procedures", () => {
  test("schedules semantic next steps and excludes advisor warnings from batch dismissal", async () => {
    const fake = fakeContext({
      notificationView: notificationView([
        informationalQueueItem(informationalId),
        queueItem({
          notificationId: unitLostId,
          category: "unit-command",
          typeName: "NOTIFICATION_UNIT_LOST",
          summary: "Unit Lost",
          isEndTurnBlocking: true,
        }),
        queueItem({
          notificationId: productionId,
          category: "production-choice",
          typeName: "NOTIFICATION_PRODUCTION_NEEDED",
          summary: "Production Needed",
          operationFamily: "city-command",
          operationType: "BUILD",
          requiredInputs: [{ name: "cityId", source: "notification", required: true }],
        }),
        informationalQueueItem(advisorId, {
          typeName: "NOTIFICATION_ADVISOR_WARNING_SCIENCE",
          summary: "Science advisor warning",
        }),
      ]),
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.queue.current,
      { maxNotifications: 12 },
      { context: fake.context }
    );

    expect(fake.calls.notifications).toEqual([
      {
        ...endpointDefaults,
        maxNotifications: 12,
      },
    ]);
    expect(result.schedule).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          notificationId: informationalId,
          disposition: "reviewed-dismissal-candidate",
          safeToBatch: true,
        }),
        expect.objectContaining({
          notificationId: advisorId,
          disposition: "inspect-handler",
          safeToBatch: false,
          nextStep: expect.objectContaining({ kind: "inspect-notification" }),
        }),
        expect.objectContaining({
          notificationId: unitLostId,
          disposition: "inspect-ready-unit",
          safeToBatch: false,
        }),
        expect.objectContaining({
          notificationId: productionId,
          disposition: "operate-with-live-inputs",
          safeToBatch: false,
        }),
      ])
    );
    const advisorStep = result.schedule.find((item) => item.notificationId?.id === advisorId.id);
    expect(advisorStep).toMatchObject({
      reason:
        "Advisor warning; use its dedicated viewed acknowledgement instead of generic dismissal or operation dispatch.",
      nextStep: {
        kind: "inspect-notification",
        label: "Check the exact advisor warning, then use its dedicated acknowledgement.",
      },
    });
    expect(advisorStep).not.toHaveProperty("operationFamily");
    expect(advisorStep).not.toHaveProperty("operationType");
    expectSafeQueueOutput(result);
  });

  test("does not use legacy cli hints as operation classification evidence", async () => {
    const legacyQueueItem: Civ7ControlOrpcPlayNotificationViewResult["hud"]["decisionQueue"][number] &
      Readonly<{ cli: string }> = {
      ...queueItem({
        notificationId: { owner: 0, id: 119, type: 20 },
        category: "blocking-notification",
        typeName: "NOTIFICATION_UNKNOWN_BLOCKER",
        summary: "Unknown blocker",
        operationFamily: undefined,
        operationType: undefined,
      }),
      cli: "game play choose-tech --options --json",
    };
    const fake = fakeContext({
      notificationView: notificationView([legacyQueueItem]),
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.queue.current,
      {},
      { context: fake.context }
    );

    expect(result.schedule).toEqual([
      expect.objectContaining({
        disposition: "inspect-handler",
        nextStep: expect.objectContaining({ kind: "inspect-notification" }),
      }),
    ]);
    expectSafeQueueOutput(result);
  });

  test("uses the private service dismissal behavior and confirms every selected item", async () => {
    const fake = fakeContext();
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.notifications.queue.dismiss.request({
      send: true,
      maxDismissals: 5,
    });

    expect(fake.calls.checks).toEqual([
      {
        input: { notificationId: informationalId },
        options: endpointDefaults,
      },
    ]);
    expect(fake.calls.sends).toEqual([
      {
        input: { expected: dismissalSnapshot(informationalId) },
        options: endpointDefaults,
      },
    ]);
    expect(result).toMatchObject({
      status: "sent-confirmed",
      eligibleCount: 1,
      plannedCount: 1,
      processedCount: 1,
      remainingCount: 0,
      stopReason: null,
      noRepeatAfterUnverified: false,
      results: [
        {
          notificationId: informationalId,
          status: "sent-confirmed",
          postcondition: { classification: "notification-disappeared" },
        },
      ],
      nextSteps: [{ kind: "refresh-attention" }],
    });
    expect(result).not.toHaveProperty("sent");
    expectSafeQueueOutput(result);
  });

  test("rechecks each item, preserves results, and stops after the first unverified send", async () => {
    const decisionQueue = [
      informationalQueueItem(informationalId),
      informationalQueueItem(secondInformationalId),
      informationalQueueItem(thirdInformationalId),
    ];
    const fake = fakeContext({
      notificationView: notificationView(decisionQueue),
      send: async (input) => {
        const before = input.expected;
        return dismissalSend(
          before,
          before.notificationId.id === informationalId.id
            ? dismissalSnapshot(informationalId, { exists: false })
            : dismissalSnapshot(before.notificationId)
        );
      },
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.queue.dismiss.request,
      { send: true, maxDismissals: 3 },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-unverified",
      eligibleCount: 3,
      plannedCount: 3,
      processedCount: 2,
      remainingCount: 1,
      stopReason: "uncertain-result",
      results: [
        {
          notificationId: informationalId,
          status: "sent-confirmed",
        },
        {
          notificationId: secondInformationalId,
          status: "sent-unverified",
          postcondition: { classification: "notification-still-active" },
        },
      ],
      noRepeatAfterUnverified: true,
      nextSteps: expect.arrayContaining([expect.objectContaining({ kind: "do-not-repeat" })]),
    });
    expect(fake.calls.sends.map((call) => call.input)).toEqual([
      { expected: dismissalSnapshot(informationalId) },
      { expected: dismissalSnapshot(secondInformationalId) },
    ]);
    expect(
      fake.calls.checks.some(
        (call) =>
          isDismissInput(call.input) && call.input.notificationId.id === thirdInformationalId.id
      )
    ).toBe(false);
    expect(result).not.toHaveProperty("sent");
  });

  test("preserves completed mutations when a later fresh check becomes unavailable", async () => {
    const decisionQueue = [
      informationalQueueItem(informationalId),
      informationalQueueItem(secondInformationalId),
    ];
    const fake = fakeContext({
      notificationView: notificationView(decisionQueue),
      check: async (input) => {
        if (input.notificationId.id === secondInformationalId.id) {
          throw new Error("native notification evidence unavailable");
        }
        return dismissalCheck(dismissalSnapshot(input.notificationId));
      },
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.queue.dismiss.request,
      { send: true, maxDismissals: 2 },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-unverified",
      plannedCount: 2,
      processedCount: 1,
      remainingCount: 1,
      stopReason: "source-unavailable",
      results: [
        {
          notificationId: informationalId,
          status: "sent-confirmed",
        },
      ],
      noRepeatAfterUnverified: true,
    });
    expect(fake.calls.sends).toHaveLength(1);
  });

  test("reports a fully known partial result without inventing uncertainty", async () => {
    const decisionQueue = [
      informationalQueueItem(informationalId),
      informationalQueueItem(secondInformationalId),
    ];
    const fake = fakeContext({
      notificationView: notificationView(decisionQueue),
      check: async (input) =>
        dismissalCheck(
          dismissalSnapshot(input.notificationId, {
            canUserDismiss: probe(input.notificationId.id !== secondInformationalId.id),
          })
        ),
    });

    const result = await call(
      Civ7ControlOrpcRouter.notifications.queue.dismiss.request,
      { send: true, maxDismissals: 2 },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "partially-confirmed",
      plannedCount: 2,
      processedCount: 2,
      remainingCount: 0,
      stopReason: null,
      postcondition: {
        classification: "selection-partially-confirmed",
        outcome: "partially-cleared",
        confidence: "confirmed",
        confirmed: true,
      },
      results: [
        { notificationId: informationalId, status: "sent-confirmed" },
        { notificationId: secondInformationalId, status: "not-sent" },
      ],
      noRepeatAfterUnverified: false,
    });
    expect(fake.calls.sends).toHaveLength(1);
  });

  test("dry run and an empty selected set both report actual not-sent dispatch", async () => {
    const dryRun = fakeContext();
    const dryResult = await call(
      Civ7ControlOrpcRouter.notifications.queue.dismiss.request,
      { maxDismissals: 1 },
      { context: dryRun.context }
    );

    expect(dryRun.calls.checks).toEqual([]);
    expect(dryRun.calls.sends).toEqual([]);
    expect(dryResult).toMatchObject({
      status: "not-sent",
      eligibleCount: 1,
      plannedCount: 1,
      processedCount: 0,
      remainingCount: 1,
      stopReason: null,
      results: [],
    });
    expect(dryResult).not.toHaveProperty("sent");

    const empty = fakeContext({ notificationView: notificationView([]) });
    const emptyResult = await call(
      Civ7ControlOrpcRouter.notifications.queue.dismiss.request,
      { send: true },
      { context: empty.context }
    );

    expect(empty.calls.checks).toEqual([]);
    expect(empty.calls.sends).toEqual([]);
    expect(emptyResult).toMatchObject({
      status: "not-sent",
      eligibleCount: 0,
      plannedCount: 0,
      processedCount: 0,
      remainingCount: 0,
      stopReason: null,
      results: [],
    });
  });

  test("maps queue source failures to tagged errors without raw command details", async () => {
    const fake = fakeContext({
      notificationViewError: new Error(
        "Timed out waiting for Civ7 tuner response to CMD:65535:Game.Notifications.dismiss(...)"
      ),
    });

    await expect(
      call(Civ7ControlOrpcRouter.notifications.queue.current, {}, { context: fake.context })
    ).rejects.toMatchObject({
      code: "NOTIFICATION_QUEUE_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "notifications.queue.current",
        source: "direct-control-facade",
      },
    });
  });
});

type FakeOptions = Readonly<{
  notificationViewError?: Error;
  notificationView?: Civ7ControlOrpcPlayNotificationViewResult;
  check?: (
    input: Readonly<{ notificationId: NotificationId }>
  ) => Promise<Civ7ControlOrpcNotificationDismissalCheckResult>;
  send?: (
    input: Readonly<{ expected: Civ7ControlOrpcNotificationDismissalSnapshot }>
  ) => Promise<Civ7ControlOrpcNotificationDismissalSendResult>;
}>;

function fakeContext(options: FakeOptions = {}) {
  const calls = {
    notifications: [] as unknown[],
    checks: [] as Array<{ input: unknown; options: unknown }>,
    sends: [] as Array<{ input: unknown; options: unknown }>,
  };
  const context: Civ7ControlOrpcContext = {
    endpointDefaults,
    directControl: directControlFacadeFixture({
      getCiv7PlayableStatus: async () => playableStatusResult({ playable: true }),
      getCiv7PlayNotificationView: async (input) => {
        calls.notifications.push(input);
        if (options.notificationViewError) throw options.notificationViewError;
        return options.notificationView ?? notificationView([informationalQueueItem()]);
      },
      checkCiv7NotificationDismissal: async (input, directOptions) => {
        calls.checks.push({ input, options: directOptions });
        return options.check
          ? options.check(input)
          : dismissalCheck(dismissalSnapshot(input.notificationId));
      },
      sendCiv7NotificationDismissal: async (input, directOptions) => {
        calls.sends.push({ input, options: directOptions });
        return options.send
          ? options.send(input)
          : dismissalSend(
              input.expected,
              dismissalSnapshot(input.expected.notificationId, { exists: false })
            );
      },
    }),
  };
  return { calls, context };
}

function notificationView(
  decisionQueue: Civ7ControlOrpcPlayNotificationViewResult["hud"]["decisionQueue"]
): Civ7ControlOrpcPlayNotificationViewResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    turn: { ok: true, value: 7 },
    turnDate: { ok: true, value: "3800 BCE" },
    hasSentTurnComplete: { ok: true, value: false },
    blocker: { ok: true, value: null },
    blockingNotificationId: { ok: true, value: null },
    canEndTurn: { ok: true, value: true },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    notifications: [],
    decisions: [],
    limits: { maxNotifications: 50, truncated: false },
    hud: {
      nextDecision: null,
      decisionQueue,
    },
  };
}

function informationalQueueItem(
  id: NotificationId = informationalId,
  overrides: Partial<Civ7ControlOrpcPlayNotificationViewResult["hud"]["decisionQueue"][number]> = {}
): Civ7ControlOrpcPlayNotificationViewResult["hud"]["decisionQueue"][number] {
  return queueItem({
    notificationId: id,
    category: "informational-notification",
    typeName: "NOTIFICATION_WONDER_COMPLETED",
    summary: "Wonder Completed",
    ...overrides,
  });
}

function queueItem(
  overrides: Partial<Civ7ControlOrpcPlayNotificationViewResult["hud"]["decisionQueue"][number]> = {}
): Civ7ControlOrpcPlayNotificationViewResult["hud"]["decisionQueue"][number] {
  return {
    notificationId: informationalId,
    isEndTurnBlocking: false,
    category: "informational-notification",
    typeName: "NOTIFICATION_WONDER_COMPLETED",
    summary: "Wonder Completed",
    message: "Wonder Completed",
    location: null,
    target: null,
    player: null,
    operationFamily: "app-ui-action",
    operationType: "Game.Notifications.dismiss",
    requiredInputs: [],
    commonActions: [],
    notes: [],
    ...overrides,
  };
}

function dismissalSnapshot(
  id: NotificationId = informationalId,
  overrides: Partial<Civ7ControlOrpcNotificationDismissalSnapshot> = {}
): Civ7ControlOrpcNotificationDismissalSnapshot {
  return {
    notificationId: id,
    localPlayerId: 0,
    exists: true,
    typeName: "NOTIFICATION_WONDER_COMPLETED",
    activeQueue: probe(true),
    canUserDismiss: probe(true),
    dismissed: probe(false),
    ...overrides,
  };
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

function probe<T>(value: T): Civ7ControlOrpcRuntimeProbe<T> {
  return { ok: true, value };
}

function isDismissInput(value: unknown): value is { notificationId: NotificationId } {
  if (value === null || typeof value !== "object" || !("notificationId" in value)) return false;
  const notificationIdValue = value.notificationId;
  return (
    notificationIdValue !== null &&
    typeof notificationIdValue === "object" &&
    "id" in notificationIdValue &&
    typeof notificationIdValue.id === "number"
  );
}

function expectSafeQueueOutput(output: unknown): void {
  const serialized = JSON.stringify(output);
  expect(serialized).not.toContain("127.0.0.1");
  expect(serialized).not.toContain("65535");
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain("rawCommand");
  expect(serialized).not.toContain("Game.Notifications.dismiss(");
  expect(serialized).not.toContain("game play");
  expect(serialized).not.toContain("approval");
}
