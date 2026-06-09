import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7NotificationViewUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcPlayNotificationViewResult,
} from "../src/index";

describe("notifications.view control-oRPC procedure", () => {
  test("calls the notification read atom through Effect/oRPC without network transport", async () => {
    const fixture = notificationViewResult();
    const fake = fakeContext(fixture);

    const result = await call(Civ7ControlOrpcRouter.notifications.view, {
      maxNotifications: 12,
    }, {
      context: fake.context,
    });

    expect(result).toEqual(fixture);
    expect(fake.notificationViewCalls).toEqual([
      {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
        maxNotifications: 12,
      },
    ]);
  });

  test("supports the in-process server-side router client", async () => {
    const fixture = notificationViewResult({ maxNotifications: 7 });
    const fake = fakeContext(fixture);
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.notifications.view({ maxNotifications: 7 });

    expect(result).toEqual(fixture);
    expect(fake.notificationViewCalls).toEqual([
      {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
        maxNotifications: 7,
      },
    ]);
  });

  test("keeps endpoint/session/state/raw command fields out of procedure input", async () => {
    const invalidInputs = [
      { maxNotifications: 0 },
      { maxNotifications: 101 },
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "app-ui" } },
      { stateName: "App UI" },
      { session: { state: "App UI" } },
      { command: "readPlayNotifications()" },
      { rawCommand: "readPlayNotifications()" },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(notificationViewResult());

      await expect(
        call(Civ7ControlOrpcRouter.notifications.view, input as never, {
          context: fake.context,
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.notificationViewCalls).toEqual([]);
    }
  });

  test("maps notification facade failures to a tagged Effect/oRPC error without raw details", async () => {
    const context: Civ7ControlOrpcContext = {
      directControl: {
        getCiv7MapSummary: async () => {
          throw new Error("not used");
        },
        getCiv7PlayableStatus: async () => {
          throw new Error("not used");
        },
        getCiv7PlayNotificationView: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:65535:readPlayNotifications()",
          );
        },
      },
    };

    await expect(
      call(Civ7ControlOrpcRouter.notifications.view, {}, { context }),
    ).rejects.toMatchObject({
      code: "NOTIFICATION_VIEW_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "notifications.view",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.notifications.view, {}, { context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("readPlayNotifications");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first notifications.view leaf", () => {
    expect(Civ7ControlOrpcContract.notifications.view["~orpc"]).toMatchObject({
      meta: {
        family: "notifications",
        procedureKey: "notifications.view",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(
      Civ7ControlOrpcContract.notifications.view["~orpc"].errorMap,
    ).toHaveProperty("NOTIFICATION_VIEW_UNAVAILABLE");
    expect(Civ7NotificationViewUnavailableError.code).toBe(
      "NOTIFICATION_VIEW_UNAVAILABLE",
    );
  });
});

function fakeContext(
  result: Civ7ControlOrpcPlayNotificationViewResult,
): {
  context: Civ7ControlOrpcContext;
  notificationViewCalls: Array<Civ7ControlOrpcContext["endpointDefaults"] & {
    maxNotifications?: number;
  }>;
} {
  const notificationViewCalls: Array<
    Civ7ControlOrpcContext["endpointDefaults"] & { maxNotifications?: number }
  > = [];

  return {
    context: {
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      directControl: {
        getCiv7MapSummary: async () => {
          throw new Error("not used");
        },
        getCiv7PlayableStatus: async () => {
          throw new Error("not used");
        },
        getCiv7PlayNotificationView: async (options) => {
          notificationViewCalls.push(options);
          return result;
        },
      },
    },
    notificationViewCalls,
  };
}

function notificationViewResult(
  overrides: { maxNotifications?: number } = {},
): Civ7ControlOrpcPlayNotificationViewResult {
  const decision = {
    category: "production-choice",
    operationFamily: "city-operation" as const,
    operationType: "BUILDING",
    argsShape: "city-id, production-kind",
    cli: "game play choose-production --city 42",
    requiredInputs: [
      {
        name: "City",
        source: "notification",
        required: true,
      },
    ],
    commonActions: [
      {
        label: "Choose production",
        cli: "game play choose-production --city 42",
        operationFamily: "city-operation" as const,
        operationType: "BUILDING",
        argsShape: "city-id, production-kind",
        when: "after selecting an available production item",
      },
    ],
    confidence: "official-ui" as const,
    notes: ["Notification is end-turn blocking."],
  };
  const queueItem = {
    notificationId: { owner: 0, id: 42, type: 20 },
    isEndTurnBlocking: true,
    typeName: "NOTIFICATION_CHOOSE_PRODUCTION",
    summary: "Production needed",
    message: "Choose production in the capital.",
    target: { cityId: { owner: 0, id: 7, type: 2 } },
    location: { x: 12, y: 18 },
    player: 0,
    category: decision.category,
    operationFamily: decision.operationFamily,
    operationType: decision.operationType,
    argsShape: decision.argsShape,
    cli: decision.cli,
    requiredInputs: decision.requiredInputs,
    commonActions: decision.commonActions,
    notes: decision.notes,
  };

  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    turn: { ok: true, value: 12 },
    turnDate: { ok: true, value: "3400 BCE" },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: -2026570723 },
    blockingNotificationId: {
      ok: true,
      value: { owner: 0, id: 42, type: 20 },
    },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: { owner: 0, id: 7, type: 2 } },
    firstReadyUnitId: { ok: true, value: null },
    notifications: [
      {
        id: { owner: 0, id: 42, type: 20 },
        type: -2026570723,
        typeName: "NOTIFICATION_CHOOSE_PRODUCTION",
        groupType: null,
        player: 0,
        summary: "Production needed",
        message: "Choose production in the capital.",
        target: { cityId: { owner: 0, id: 7, type: 2 } },
        location: { x: 12, y: 18 },
        canUserDismiss: false,
        expired: false,
        dismissed: false,
        isEndTurnBlocking: true,
        decision,
      },
    ],
    decisions: [decision],
    hud: {
      nextDecision: queueItem,
      decisionQueue: [queueItem],
    },
    limits: {
      maxNotifications: overrides.maxNotifications ?? 25,
      truncated: false,
    },
  };
}
