import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcContract,
  type Civ7ControlOrpcNotificationDismissalResult,
  Civ7ControlOrpcRouter,
  Civ7NotificationDismissalUnavailableError,
  createCiv7ControlOrpcServerClient,
} from "../src/index";
import { standardSchemaAccepts } from "./support/standard-schema";

const notificationId = { owner: 0, id: 113, type: 20 };
const Civ7NotificationDismissInputSchema =
  Civ7ControlOrpcContract.notifications.dismiss.request["~orpc"].inputSchema;

describe("notifications.dismiss.request control-oRPC procedure", () => {
  test("owns the caller-facing notification dismiss contract without raw fields", () => {
    expect(
      standardSchemaAccepts(Civ7NotificationDismissInputSchema, {
        notificationId,
      })
    ).toBe(true);
    expect(
      standardSchemaAccepts(Civ7NotificationDismissInputSchema, {
        notificationId,
        rawCommand: "Game.turn",
      })
    ).toBe(false);
  });

  test("calls notification dismissal through native Effect/oRPC ", async () => {
    const fake = fakeContext(notificationDismissalResult("notification-disappeared"));

    const result = await call(
      Civ7ControlOrpcRouter.notifications.dismiss.request,
      { notificationId },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      notificationId,
      sent: true,
      status: "sent-confirmed",
      validation: {
        beforeExists: true,
        canDismiss: true,
        afterExists: false,
      },
      postcondition: {
        classification: "notification-disappeared",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "notifications.dismiss.request",
        },
      ],
    });
    expect(JSON.stringify(result)).not.toContain("127.0.0.1");
    expect(JSON.stringify(result)).not.toContain("65535");
    expect(JSON.stringify(result)).not.toContain('"host"');
    expect(JSON.stringify(result)).not.toContain('"port"');
    expect(JSON.stringify(result)).not.toContain('"state"');
    expect(JSON.stringify(result)).not.toContain('"result"');
    expect(JSON.stringify(result)).not.toContain('"verified"');
    expect(JSON.stringify(result)).not.toContain("NotificationModel.manager.dismiss");
    expect(JSON.stringify(result)).not.toContain("Game.Notifications.dismiss");
    expect(fake.calls).toEqual([
      {
        input: { notificationId },
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
  });

  test("supports the in-process server-side router client", async () => {
    const fake = fakeContext(notificationDismissalResult("notification-disappeared"));
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.notifications.dismiss.request({
      notificationId,
    });

    expect(result.status).toBe("sent-confirmed");
    expect(fake.calls).toHaveLength(1);
  });

  test("keeps stale notification postconditions no-repeat guarded", async () => {
    const fake = fakeContext(
      notificationDismissalResult("engine-front-still-live", {
        after: notificationSummary({
          dismissed: true,
          isEngineQueueFront: { ok: true, value: true },
          notificationTrainContains: { ok: true, value: false },
          isNotificationTrainFront: { ok: true, value: false },
        }),
        verified: true,
      })
    );

    const result = await call(
      Civ7ControlOrpcRouter.notifications.dismiss.request,
      { notificationId },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      sent: true,
      status: "sent-unverified",
      postcondition: {
        classification: "engine-front-still-live",
        outcome: "stale",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "notifications.dismiss.request",
        },
      ],
    });
  });

  test("projects validator-blocked notification dismissals as not-sent", async () => {
    const fake = fakeContext(
      notificationDismissalResult("not-sent", {
        after: null,
        canDismiss: false,
        sent: false,
        verified: false,
      })
    );

    const result = await call(
      Civ7ControlOrpcRouter.notifications.dismiss.request,
      { notificationId },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      sent: false,
      status: "not-sent",
      validation: {
        beforeExists: true,
        canDismiss: false,
        afterExists: null,
      },
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "inspect-notification",
          source: "notifications.dismiss.request",
        },
      ],
    });
  });

  test("keeps endpoint, session, state, and raw command fields out of procedure input", async () => {
    const invalidInputs = [
      { notificationId, disposableSession: true },
      { notificationId, host: "127.0.0.1" },
      { notificationId, port: 4318 },
      { notificationId, state: { role: "app-ui" } },
      { notificationId, stateName: "App UI" },
      { notificationId, session: { state: "App UI" } },
      { notificationId, command: "Game.Notifications.dismiss(...)" },
      { notificationId, rawCommand: "Game.Notifications.dismiss(...)" },
      { notificationId: { owner: 0, type: 20 } },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(notificationDismissalResult("notification-disappeared"));

      await expect(
        call(Civ7ControlOrpcRouter.notifications.dismiss.request, input as never, {
          context: fake.context,
        })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls).toEqual([]);
    }
  });

  test("maps notification dismissal facade failures to a tagged error without raw details", async () => {
    const fake = fakeContext(
      new Error(
        "Timed out waiting for Civ7 tuner response to CMD:65535:Game.Notifications.dismiss(...)"
      )
    );

    await expect(
      call(
        Civ7ControlOrpcRouter.notifications.dismiss.request,
        {
          notificationId,
        },
        { context: fake.context }
      )
    ).rejects.toMatchObject({
      code: "NOTIFICATION_DISMISSAL_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "notifications.dismiss.request",
        source: "direct-control-facade",
      },
    });

    try {
      await call(
        Civ7ControlOrpcRouter.notifications.dismiss.request,
        {
          notificationId,
        },
        { context: fake.context }
      );
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Game.Notifications");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first notifications.dismiss.request leaf", () => {
    expect(Civ7ControlOrpcContract.notifications.dismiss.request["~orpc"]).toMatchObject({
      meta: {
        family: "notifications",
        procedureKey: "notifications.dismiss.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(Civ7ControlOrpcContract.notifications.dismiss.request["~orpc"].errorMap).toHaveProperty(
      "NOTIFICATION_DISMISSAL_UNAVAILABLE"
    );
    expect(Civ7NotificationDismissalUnavailableError.code).toBe(
      "NOTIFICATION_DISMISSAL_UNAVAILABLE"
    );
  });
});

function fakeContext(
  resultOrError: Civ7ControlOrpcNotificationDismissalResult | Error,
  options: {} = {}
): {
  context: Civ7ControlOrpcContext;
  calls: Array<{
    input: unknown;
    options: unknown;
  }>;
} {
  const calls: Array<{
    input: unknown;
    options: unknown;
  }> = [];

  return {
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
        requestCiv7NotificationDismissal: async (input, endpointDefaults) => {
          calls.push({ input, options: endpointDefaults });
          if (resultOrError instanceof Error) throw resultOrError;
          return resultOrError;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
    calls,
  };
}

function notificationDismissalResult(
  classification: Civ7ControlOrpcNotificationDismissalResult["postcondition"]["classification"],
  options: {
    after?: Civ7ControlOrpcNotificationDismissalResult["after"];
    canDismiss?: boolean;
    sent?: boolean;
    verified?: boolean;
  } = {}
): Civ7ControlOrpcNotificationDismissalResult {
  const before = notificationSummary();
  const after = "after" in options ? options.after : notificationSummary({ exists: false });
  const sent = options.sent ?? classification !== "not-sent";

  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    notificationId,
    before,
    after,
    canDismiss: options.canDismiss ?? sent,
    sent,
    result: {
      notificationTrainManager: {
        ok: true,
        attempted: true,
        available: true,
        path: "NotificationModel.manager.dismiss",
      },
    },
    closeoutPath: "NotificationModel.manager.dismiss",
    verificationAttempts: after == null ? [before] : [before, after],
    verified:
      options.verified ??
      (classification === "notification-disappeared" ||
        classification === "notification-dismissed" ||
        classification === "engine-queue-cleared" ||
        classification === "notification-train-cleared" ||
        classification === "engine-front-moved" ||
        classification === "notification-train-front-moved"),
    postcondition: {
      classification,
      reason: `test ${classification}`,
    },
    notes: ["fixture"],
  };
}

function notificationSummary(
  overrides: Partial<Civ7ControlOrpcNotificationDismissalResult["before"]> = {}
): Civ7ControlOrpcNotificationDismissalResult["before"] {
  return {
    id: notificationId,
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
    engineQueueFirstId: { ok: true, value: notificationId },
    isEngineQueueFront: { ok: true, value: true },
    notificationTrainCount: { ok: true, value: 1 },
    notificationTrainContains: { ok: true, value: true },
    notificationTrainFirstId: { ok: true, value: notificationId },
    isNotificationTrainFront: { ok: true, value: true },
    ...overrides,
  };
}
