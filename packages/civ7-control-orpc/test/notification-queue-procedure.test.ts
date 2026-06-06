import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7NotificationQueueUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcNotificationDismissalResult,
} from "../src/index";
import { typeboxInputSchemaFromContractProcedure } from "../src/typebox-standard-schema";
import type {
  Civ7ControlOrpcPlayNotificationViewResult,
} from "../src/dependencies/direct-control";

const informationalId = { owner: 0, id: 113, type: 20 };
const unitLostId = { owner: 0, id: 114, type: 20 };
const productionId = { owner: 0, id: 115, type: 20 };

const QueueCurrentInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.notifications.queue.current,
);
const QueueDismissInputSchema = typeboxInputSchemaFromContractProcedure(
  Civ7ControlOrpcContract.notifications.queue.dismiss.request,
);

describe("notifications.queue control-oRPC procedures", () => {
  test("schedules notification queue with semantic next steps and no CLI command strings", async () => {
    const fake = fakeContext();
    const result = await call(
      Civ7ControlOrpcRouter.notifications.queue.current,
      { maxNotifications: 12 },
      { context: fake.context },
    );

    expect(fake.calls.notifications).toEqual([{
      host: "127.0.0.1",
      port: 4318,
      timeoutMs: 1_000,
      maxNotifications: 12,
    }]);
    expect(result).toMatchObject({
      localPlayerId: 0,
      queueLength: 3,
      schedule: [
        {
          disposition: "inspect-ready-unit",
          notificationId: unitLostId,
          safeToBatch: false,
        },
        {
          disposition: "operate-with-live-inputs",
          notificationId: productionId,
          safeToBatch: false,
        },
        {
          disposition: "reviewed-dismissal-candidate",
          notificationId: informationalId,
          safeToBatch: true,
        },
      ],
    });
    expect(result.nextSteps.map((step) => step.kind)).toEqual([
      "inspect-ready-unit",
      "inspect-ready-city",
      "dismiss-notification",
    ]);
    expectSafeQueueOutput(result);
  });

  test("bulk dismisses only safe informational queue candidates and keeps aggregate no-repeat guarded", async () => {
    const fake = fakeContext({
      dismissalResult: notificationDismissalResult("engine-front-still-live", {
        notificationId: informationalId,
        verified: true,
      }),
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.notifications.queue.dismiss.request({
      send: true,
      maxDismissals: 5,
    });

    expect(fake.calls.dismissals).toEqual([{
      input: { notificationId: informationalId },
      options: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    }]);
    expect(result).toMatchObject({
      sent: true,
      status: "sent-guarded",
      eligibleCount: 1,
      selectedCount: 1,
      noRepeatAfterUnverified: true,
      candidates: [{
        notificationId: informationalId,
        disposition: "reviewed-dismissal-candidate",
      }],
      excluded: expect.arrayContaining([
        expect.objectContaining({
          notificationId: unitLostId,
          reason: expect.stringContaining("not bulk dismissal"),
        }),
        expect.objectContaining({
          notificationId: productionId,
          reason: expect.stringContaining("gameplay operation"),
        }),
      ]),
      results: [{
        notificationId: informationalId,
        status: "sent-unverified",
        postcondition: {
          classification: "engine-front-still-live",
          noRepeatAfterUnverified: true,
        },
      }],
      nextSteps: expect.arrayContaining([expect.objectContaining({
        kind: "do-not-repeat",
        source: "notifications.queue.dismiss.request",
      })]),
    });
    expectSafeQueueOutput(result);
  });

  test("dry run does not call dismissal runtime ports", async () => {
    const fake = fakeContext();

    const result = await call(
      Civ7ControlOrpcRouter.notifications.queue.dismiss.request,
      { maxDismissals: 1 },
      { context: fake.context },
    );

    expect(fake.calls.dismissals).toEqual([]);
    expect(result).toMatchObject({
      sent: false,
      status: "not-sent",
      eligibleCount: 1,
      selectedCount: 1,
      noRepeatAfterUnverified: true,
    });
  });

  test("rejects raw endpoint/session/command input before facade reads", async () => {
    const invalidInputs = [
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "tuner" } },
      { session: { state: "App UI" } },
      { command: "Game.Notifications.dismiss" },
      { rawCommand: "Game.Notifications.dismiss" },
      { maxNotifications: 0 },
      { maxDismissals: 0 },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext();
      await expect(
        call(
          Civ7ControlOrpcRouter.notifications.queue.dismiss.request,
          input as never,
          { context: fake.context },
        ),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls.notifications).toEqual([]);
      expect(fake.calls.dismissals).toEqual([]);
    }

    expect(Value.Check(QueueCurrentInputSchema, { maxNotifications: 50 })).toBe(true);
    expect(Value.Check(QueueCurrentInputSchema, { rawCommand: "Game.turn" })).toBe(false);
    expect(Value.Check(QueueDismissInputSchema, { send: true, maxDismissals: 2 })).toBe(true);
    expect(Value.Check(QueueDismissInputSchema, { approvalReason: "go" })).toBe(false);
  });

  test("maps queue source failures to tagged errors without raw command details", async () => {
    const fake = fakeContext({
      notificationViewError: new Error(
        "Timed out waiting for Civ7 tuner response to CMD:65535:Game.Notifications.dismiss(...)",
      ),
    });

    await expect(
      call(Civ7ControlOrpcRouter.notifications.queue.current, {}, {
        context: fake.context,
      }),
    ).rejects.toMatchObject({
      code: "NOTIFICATION_QUEUE_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "notifications.queue.current",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.notifications.queue.current, {}, {
        context: fake.context,
      });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Game.Notifications");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes contract-first notification queue leaves", () => {
    expect(
      Civ7ControlOrpcContract.notifications.queue.current["~orpc"],
    ).toMatchObject({
      meta: {
        family: "notifications",
        procedureKey: "notifications.queue.current",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(
      Civ7ControlOrpcContract.notifications.queue.dismiss.request["~orpc"],
    ).toMatchObject({
      meta: {
        family: "notifications",
        procedureKey: "notifications.queue.dismiss.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(
      Civ7ControlOrpcContract.notifications.queue.current["~orpc"].errorMap,
    ).toHaveProperty("NOTIFICATION_QUEUE_UNAVAILABLE");
    expect(Civ7NotificationQueueUnavailableError.code).toBe(
      "NOTIFICATION_QUEUE_UNAVAILABLE",
    );
  });
});

function fakeContext(options: {
  notificationViewError?: Error;
  dismissalResult?: Civ7ControlOrpcNotificationDismissalResult;
} = {}): {
  context: Civ7ControlOrpcContext;
  calls: {
    notifications: unknown[];
    dismissals: Array<{ input: unknown; options: unknown }>;
  };
} {
  const calls = {
    notifications: [] as unknown[],
    dismissals: [] as Array<{ input: unknown; options: unknown }>,
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
        getCiv7PlayNotificationView: async (input) => {
          calls.notifications.push(input);
          if (options.notificationViewError) throw options.notificationViewError;
          return notificationView();
        },
        requestCiv7NotificationDismissal: async (input, endpointDefaults) => {
          calls.dismissals.push({ input, options: endpointDefaults });
          return options.dismissalResult ??
            notificationDismissalResult("notification-disappeared", {
              notificationId: informationalId,
            });
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function notificationView(): Civ7ControlOrpcPlayNotificationViewResult {
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 7 },
    turnDate: { ok: true, value: "3800 BCE" },
    blocker: { ok: true, value: 2_091_697_919 },
    blockingNotificationId: { ok: true, value: unitLostId },
    canEndTurn: { ok: true, value: false },
    limits: { requested: 50, returned: 3, truncated: false },
    hud: {
      nextDecision: null,
      decisionQueue: [
        queueItem({
          notificationId: informationalId,
          category: "informational-notification",
          typeName: "NOTIFICATION_WONDER_COMPLETED",
          summary: "Wonder Completed",
          operationFamily: "app-ui-action",
          operationType: "Game.Notifications.dismiss",
        }),
        queueItem({
          notificationId: unitLostId,
          category: "unit-command",
          typeName: "NOTIFICATION_UNIT_LOST",
          summary: "Unit Lost",
          isEndTurnBlocking: true,
          operationFamily: "app-ui-action",
          operationType: "Game.Notifications.dismiss",
        }),
        queueItem({
          notificationId: productionId,
          category: "production-choice",
          typeName: "NOTIFICATION_PRODUCTION_NEEDED",
          summary: "Production Needed",
          operationFamily: "city-command",
          operationType: "BUILD",
          requiredInputs: [{ name: "cityId", required: true }],
        }),
      ],
    },
    notes: [],
  } as Civ7ControlOrpcPlayNotificationViewResult;
}

function queueItem(overrides: Partial<Civ7ControlOrpcPlayNotificationViewResult["hud"]["decisionQueue"][number]> = {}): Civ7ControlOrpcPlayNotificationViewResult["hud"]["decisionQueue"][number] {
  return {
    notificationId: informationalId,
    isEndTurnBlocking: false,
    category: "informational-notification",
    typeName: "NOTIFICATION_WONDER_COMPLETED",
    summary: "Wonder Completed",
    message: "Wonder Completed",
    location: null,
    target: null,
    operationFamily: "app-ui-action",
    operationType: "Game.Notifications.dismiss",
    requiredInputs: [],
    cli: null,
    ...overrides,
  } as Civ7ControlOrpcPlayNotificationViewResult["hud"]["decisionQueue"][number];
}

function notificationDismissalResult(
  classification: Civ7ControlOrpcNotificationDismissalResult["postcondition"]["classification"],
  options: {
    notificationId?: typeof informationalId;
    verified?: boolean;
  } = {},
): Civ7ControlOrpcNotificationDismissalResult {
  const id = options.notificationId ?? informationalId;
  const before = notificationSummary(id);
  const after = classification === "engine-front-still-live"
    ? notificationSummary(id, {
      dismissed: true,
      notificationTrainContains: { ok: true, value: false },
      isNotificationTrainFront: { ok: true, value: false },
      isEngineQueueFront: { ok: true, value: true },
    })
    : notificationSummary(id, { exists: false });

  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    notificationId: id,
    before,
    after,
    canDismiss: true,
    sent: true,
    result: {
      notificationTrainManager: {
        ok: true,
        attempted: true,
        available: true,
        path: "NotificationModel.manager.dismiss",
      },
    },
    closeoutPath: "NotificationModel.manager.dismiss",
    verificationAttempts: [before, after],
    verified: options.verified ?? classification === "notification-disappeared",
    postcondition: {
      classification,
      reason: `test ${classification}`,
    },
    notes: ["fixture"],
  };
}

function notificationSummary(
  id: typeof informationalId,
  overrides: Partial<Civ7ControlOrpcNotificationDismissalResult["before"]> = {},
): Civ7ControlOrpcNotificationDismissalResult["before"] {
  return {
    id,
    exists: true,
    type: 2_091_697_919,
    typeName: "NOTIFICATION_WONDER_COMPLETED",
    summary: "Wonder Completed",
    message: "Wonder Completed",
    target: { owner: -1, id: -1, type: 0 },
    location: { x: -9999, y: -9999 },
    canUserDismiss: true,
    expired: false,
    dismissed: false,
    blocksTurnAdvancement: { ok: true, value: true },
    endTurnBlockingType: { ok: true, value: 2_091_697_919 },
    isEndTurnBlocking: { ok: true, value: true },
    engineQueueCount: { ok: true, value: 1 },
    engineQueueContains: { ok: true, value: true },
    engineQueueFirstId: { ok: true, value: id },
    isEngineQueueFront: { ok: true, value: true },
    notificationTrainCount: { ok: true, value: 1 },
    notificationTrainContains: { ok: true, value: true },
    notificationTrainFirstId: { ok: true, value: id },
    isNotificationTrainFront: { ok: true, value: true },
    ...overrides,
  };
}

function expectSafeQueueOutput(output: unknown): void {
  const serialized = JSON.stringify(output);
  expect(serialized).not.toContain("127.0.0.1");
  expect(serialized).not.toContain("65535");
  expect(serialized).not.toContain("\"host\"");
  expect(serialized).not.toContain("\"port\"");
  expect(serialized).not.toContain("\"state\"");
  expect(serialized).not.toContain("\"session\"");
  expect(serialized).not.toContain("rawCommand");
  expect(serialized).not.toContain("Game.Notifications.dismiss(");
  expect(serialized).not.toContain("game play");
  expect(serialized).not.toContain("approval");
  expect(serialized).not.toContain("approvalReason");
}
