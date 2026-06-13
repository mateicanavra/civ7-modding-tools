import { describe, expect, test, vi } from "vitest";
import GamePlayDismissNotificationQueue from "../../../../../src/commands/game/play/dismiss-notification-queue";
import { type FakeTunerServer, startFakeTunerServer } from "../../../fixtures/tuner-socket-server";

type DismissQueueMode = "mixed-queue" | "unit-lost-report";

describe("game play dismiss-notification-queue command", () => {
  test("bulk dismisses only eligible informational queue items with send enabled", async () => {
    const dryRun = await runDismissNotificationQueue("mixed-queue");
    try {
      expect(dryRun.payload.view.sent).toBe(false);
      expect(dryRun.payload.view.eligibleCount).toBe(1);
      expect(dryRun.payload.view.selectedCount).toBe(1);
      expect(dryRun.payload.view.excluded).toHaveLength(2);
      expect(dryRun.payload.view.results).toHaveLength(0);
      expect(
        dryRun.server.received.some((message) => message.includes("readNotificationDismissal"))
      ).toBe(false);
    } finally {
      await dryRun.server.close();
    }

    const sent = await runDismissNotificationQueue("mixed-queue", ["--send"]);
    try {
      expect(sent.payload.view.sent).toBe(true);
      expect(sent.payload.view.eligibleCount).toBe(1);
      expect(sent.payload.view.selectedCount).toBe(1);
      expect(sent.payload.view.results).toHaveLength(1);
      expect(sent.payload.view.results[0].sent).toBe(true);
      expect(sent.payload.view.results[0].status).toBe("sent-confirmed");
      expect(sent.payload.view.postcondition.confirmed).toBe(true);
      expect(
        sent.server.received.filter((message) => message.includes("readNotificationDismissal"))
          .length
      ).toBeGreaterThan(1);
      expect(sent.server.received.some((message) => message.includes("sendOperation("))).toBe(
        false
      );
    } finally {
      await sent.server.close();
    }
  });

  test("excludes front unit-lost reports from bulk dismissal", async () => {
    const { payload, server } = await runDismissNotificationQueue("unit-lost-report");
    try {
      expect(payload.view.eligibleCount).toBe(0);
      expect(payload.view.selectedCount).toBe(0);
      expect(payload.view.results).toHaveLength(0);
      expect(payload.view.excluded).toHaveLength(1);
      expect(payload.view.excluded[0]).toMatchObject({
        typeName: "NOTIFICATION_UNIT_LOST",
        reason:
          "front unit-loss reports require exact reviewed dismissal proof, not bulk dismissal",
      });
      expect(server.received.some((message) => message.includes("readNotificationDismissal"))).toBe(
        false
      );
    } finally {
      await server.close();
    }
  });
});

async function runDismissNotificationQueue(
  mode: DismissQueueMode,
  extraArgs: readonly string[] = []
) {
  const server = await startDismissNotificationQueueTunerServer(mode);
  const writes: string[] = [];
  const log = vi
    .spyOn(GamePlayDismissNotificationQueue.prototype, "log")
    .mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
  try {
    const { port } = server.address();
    await GamePlayDismissNotificationQueue.run([
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      ...extraArgs,
      "--json",
    ]);
  } finally {
    log.mockRestore();
  }

  return {
    payload: JSON.parse(writes.join("")) as {
      ok: true;
      view: {
        sent: boolean;
        eligibleCount: number;
        selectedCount: number;
        excluded: Array<{ typeName: string | null; reason: string }>;
        status: string;
        postcondition: { confirmed: boolean };
        results: Array<{ sent: boolean; status: string }>;
      };
    },
    server,
  };
}

async function startDismissNotificationQueueTunerServer(
  mode: DismissQueueMode
): Promise<FakeTunerServer> {
  let notificationDismissalSent = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes("readPlayNotifications")) {
        return [JSON.stringify(dismissNotificationQueueView(mode))];
      }
      if (message.includes("isInGame") && message.includes("GameContext.localPlayerID")) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes("evalOk") && message.includes("GameplayMap.getGridWidth")) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
      if (message.includes("readNotificationDismissal")) {
        const send = message.includes('"send":true');
        if (send) notificationDismissalSent = true;
        return [JSON.stringify(notificationDismissal(send, notificationDismissalSent && !send))];
      }
      return undefined;
    },
  });
}

function dismissNotificationQueueView(mode: DismissQueueMode) {
  const decisionQueue = decisionQueueFor(mode);
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 123 },
    turnDate: { ok: true, value: "1160 BCE" },
    blocker: { ok: true, value: decisionQueue.some((item) => item.isEndTurnBlocking) ? 1 : 0 },
    blockingNotificationId: {
      ok: true,
      value: decisionQueue.find((item) => item.isEndTurnBlocking)?.notificationId ?? null,
    },
    canEndTurn: { ok: true, value: false },
    limits: { maxNotifications: 50, truncated: false },
    hud: {
      nextDecision: decisionQueue.find((item) => item.isEndTurnBlocking) ?? null,
      decisionQueue,
    },
  };
}

function appUiSnapshot() {
  const ok = <T>(value: T) => ({ ok: true, value });
  return {
    network: {
      isInSession: ok(true),
      numPlayers: ok(2),
      hostPlayerId: ok(0),
      isConnectedToNetwork: ok(true),
      isAuthenticated: ok(true),
      isLoggedIn: ok(true),
    },
    autoplay: {
      isActive: false,
      turns: 0,
      isPaused: false,
      isPausedOrPending: false,
      observeAsPlayer: -1,
      returnAsPlayer: -1,
    },
    game: {
      turn: 123,
      age: 0,
      maxTurns: 500,
      turnDate: ok("1160 BCE"),
      hash: ok(1),
    },
    ui: {
      inGame: ok(true),
      inShell: ok(false),
      inLoading: ok(false),
      loadingState: ok(0),
      loadingStateName: null,
      canBeginGame: ok(false),
      canNotifyUIReady: "function",
      skipStartButton: ok(false),
      automationActive: ok(false),
    },
    gameContext: {
      localPlayerID: 0,
      localObserverID: -1,
      hasRequestedPause: ok(false),
    },
    players: {
      maxPlayers: 8,
      aliveIds: ok([0, 1]),
      aliveHumanIds: ok([0]),
      numAliveHumans: ok(1),
    },
    map: {
      width: ok(80),
      height: ok(52),
      plotCount: ok(4160),
      mapSize: ok(1),
      randomSeed: ok(1234),
    },
  };
}

function tunerHealthSnapshot() {
  const ok = <T>(value: T) => ({ ok: true, value });
  return {
    evalOk: 2,
    ready: true,
    globals: {
      Game: "object",
      Autoplay: "object",
      GameplayMap: "object",
      Players: "object",
      Network: "object",
    },
    turn: ok(123),
    turnDate: ok("1160 BCE"),
    width: ok(80),
    height: ok(52),
    aliveIds: ok([0, 1]),
    aliveHumanIds: ok([0]),
    autoplayActive: ok(false),
  };
}

function decisionQueueFor(mode: DismissQueueMode) {
  if (mode === "unit-lost-report") {
    return [
      informationalDecision({
        notificationId: { owner: 0, id: 34, type: 20 },
        typeName: "NOTIFICATION_UNIT_LOST",
        summary:
          "While defending, your Scout was destroyed by a Warrior from Samarkand (44 damage)!",
        message: "Unit Lost",
        location: { x: 5, y: 18 },
        isEndTurnBlocking: true,
      }),
    ];
  }

  return [
    operationDecision({
      notificationId: { owner: 0, id: 577, type: 20 },
      typeName: "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
      summary: "Lafayette has started a Diplomatic Action with you.",
      category: "diplomacy-response",
      operationType: "RESPOND_DIPLOMATIC_ACTION",
      cli: "game play respond-diplomacy",
      requiredInputs: [{ name: "ID", source: "live diplomatic action", required: true }],
      isEndTurnBlocking: true,
    }),
    informationalDecision({
      notificationId: { owner: 0, id: 579, type: 20 },
      typeName: "NOTIFICATION_VOLCANO_ERUPTS_SEV2",
      summary: "Laacher See has erupted.",
      message: "Megacolossal Volcanic Eruption!",
      location: { x: 58, y: 36 },
      isEndTurnBlocking: false,
    }),
    {
      notificationId: { owner: 0, id: 583, type: 20 },
      isEndTurnBlocking: false,
      typeName: "NOTIFICATION_COMMAND_UNITS",
      summary: "Move a Unit or have it perform an operation.",
      message: "Command Units",
      target: { owner: -1, id: -1, type: 0 },
      location: { x: -9999, y: -9999 },
      category: "unit-command",
      operationFamily: "unit-operation",
      operationType: "SKIP_TURN",
      requiredInputs: [
        { name: "Unit", source: "selectedUnitId or firstReadyUnitId", required: true },
      ],
      cli: "game play operation --family unit",
    },
  ];
}

function operationDecision(input: {
  notificationId: { owner: number; id: number; type: number };
  typeName: string;
  summary: string;
  category: string;
  operationType: string;
  cli: string;
  requiredInputs?: Array<{ name: string; source: string; required: boolean }>;
  isEndTurnBlocking: boolean;
}) {
  return {
    notificationId: input.notificationId,
    isEndTurnBlocking: input.isEndTurnBlocking,
    typeName: input.typeName,
    summary: input.summary,
    message: input.summary,
    target: { owner: -1, id: -1, type: 0 },
    location: null,
    category: input.category,
    operationFamily: "player-operation",
    operationType: input.operationType,
    requiredInputs: input.requiredInputs ?? [],
    cli: input.cli,
  };
}

function informationalDecision(input: {
  notificationId: { owner: number; id: number; type: number };
  typeName: string;
  summary: string;
  message?: string;
  location?: unknown;
  isEndTurnBlocking: boolean;
}) {
  return {
    notificationId: input.notificationId,
    isEndTurnBlocking: input.isEndTurnBlocking,
    typeName: input.typeName,
    summary: input.summary,
    message: input.message ?? input.summary,
    target: { owner: -1, id: -1, type: 0 },
    location: input.location ?? null,
    category: "informational-notification",
    operationFamily: "app-ui-action",
    operationType: "Game.Notifications.dismiss",
    requiredInputs: [{ name: "Notification", source: "notification ComponentID", required: true }],
    cli: "game play dismiss-notification",
  };
}

function notificationDismissal(send: boolean, settled = false) {
  const notificationId = { owner: 0, id: 579, type: 20 };
  const before = {
    id: notificationId,
    exists: true,
    type: 2,
    typeName: "NOTIFICATION_VOLCANO_ERUPTS_SEV2",
    summary: "Laacher See has erupted.",
    message: "Megacolossal Volcanic Eruption!",
    target: { owner: -1, id: -1, type: 0 },
    location: { x: 58, y: 36 },
    canUserDismiss: true,
    expired: false,
    dismissed: false,
    blocksTurnAdvancement: { ok: true, value: false },
    endTurnBlockingType: { ok: true, value: 0 },
    isEndTurnBlocking: { ok: true, value: false },
    engineQueueCount: { ok: true, value: 1 },
    engineQueueContains: { ok: true, value: true },
    engineQueueFirstId: { ok: true, value: notificationId },
    isEngineQueueFront: { ok: true, value: true },
    notificationTrainCount: { ok: true, value: 1 },
    notificationTrainContains: { ok: true, value: true },
    notificationTrainFirstId: { ok: true, value: notificationId },
    isNotificationTrainFront: { ok: true, value: true },
  };
  const dismissed = {
    ...before,
    exists: false,
    dismissed: true,
    engineQueueCount: { ok: true, value: 0 },
    engineQueueContains: { ok: true, value: false },
    engineQueueFirstId: { ok: true, value: null },
    isEngineQueueFront: { ok: true, value: false },
    notificationTrainCount: { ok: true, value: 0 },
    notificationTrainContains: { ok: true, value: false },
    notificationTrainFirstId: { ok: true, value: null },
    isNotificationTrainFront: { ok: true, value: false },
  };
  const current = settled ? dismissed : before;
  return {
    notificationId,
    before: current,
    after: send ? before : null,
    canDismiss: true,
    sent: send,
    closeoutPath: send ? "NotificationModel.manager.dismiss+Game.Notifications.dismiss" : null,
    result: send
      ? {
          notificationTrainManager: {
            ok: true,
            attempted: true,
            available: true,
            path: "NotificationModel.manager.dismiss",
          },
          panelCloseControl: {
            ok: true,
            attempted: true,
            available: true,
            path: "Game.Notifications.dismiss",
            value: false,
          },
        }
      : null,
    verificationAttempts: send ? [before] : [],
    verified: false,
    notes: [
      "This is an App UI notification action, not a gameplay operation family.",
      "Verification is identity-based: disappeared, dismissed, removed from the engine queue or notification train, or moved off a front position it occupied before send.",
    ],
  };
}
