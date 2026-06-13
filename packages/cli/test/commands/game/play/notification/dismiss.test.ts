import { describe, expect, test, vi } from "vitest";
import GamePlayDismissNotification from "../../../../../src/commands/game/play/dismiss-notification";
import { type FakeTunerServer, startFakeTunerServer } from "../../../fixtures/tuner-socket-server";

type DismissNotificationMode =
  | "verified"
  | "stale-nonblocking"
  | "engine-front-train-absent"
  | "engine-front-dismissed";

describe("game play dismiss-notification command", () => {
  test("dismisses reviewed notifications only with send enabled", async () => {
    const { payload, server } = await runDismissNotification("verified", [
      "--target",
      '{"owner":0,"id":113,"type":20}',
      "--send",
    ]);
    try {
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe("sent-confirmed");
      expect(payload.result.validation).toMatchObject({
        beforeExists: true,
        canDismiss: true,
        afterExists: false,
      });
      expect(payload.result.postcondition).toMatchObject({
        classification: "notification-disappeared",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      });
      expect(payload.result.nextSteps).toEqual([
        {
          kind: "refresh-attention",
          source: "notifications.dismiss.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ]);
      expectSemanticDismissalOmitsRawRuntimeDetails(payload.result);
      expect(server.received.some((message) => message.includes("readNotificationDismissal"))).toBe(
        true
      );
      expect(server.received.some((message) => message.includes('"send":true'))).toBe(true);
      expect(server.received.some((message) => message.includes("NotificationModel.manager"))).toBe(
        true
      );
    } finally {
      await server.close();
    }
  });

  test("does not verify dismissal from stale nonblocking front evidence", async () => {
    const { payload, server } = await runDismissNotification("stale-nonblocking", [
      "--target",
      '{"owner":0,"id":113,"type":20}',
      "--send",
    ]);
    try {
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe("sent-unverified");
      expect(payload.result.validation).toMatchObject({
        beforeExists: true,
        canDismiss: true,
        afterExists: true,
      });
      expect(payload.result.postcondition).toMatchObject({
        classification: "engine-front-still-live",
        outcome: "stale",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      });
      expect(payload.result.nextSteps[0]).toMatchObject({
        kind: "do-not-repeat",
        source: "notifications.dismiss.request",
      });
      expectSemanticDismissalOmitsRawRuntimeDetails(payload.result);
    } finally {
      await server.close();
    }
  });

  test("does not verify dismissal from train absence while engine queue still fronts the target", async () => {
    const { payload, server } = await runDismissNotification("engine-front-train-absent", [
      "--target",
      '{"owner":0,"id":113,"type":20}',
      "--send",
    ]);
    try {
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe("sent-unverified");
      expect(payload.result.validation).toMatchObject({
        beforeExists: true,
        canDismiss: true,
        afterExists: true,
      });
      expect(payload.result.postcondition).toMatchObject({
        classification: "engine-front-still-live",
        outcome: "stale",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      });
      expect(payload.result.nextSteps[0]).toMatchObject({
        kind: "do-not-repeat",
        source: "notifications.dismiss.request",
      });
      expectSemanticDismissalOmitsRawRuntimeDetails(payload.result);
    } finally {
      await server.close();
    }
  });

  test("does not verify dismissal from dismissed flag while engine queue still fronts the target", async () => {
    const { payload, server } = await runDismissNotification("engine-front-dismissed", [
      "--target",
      '{"owner":0,"id":113,"type":20}',
      "--send",
    ]);
    try {
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe("sent-unverified");
      expect(payload.result.validation).toMatchObject({
        beforeExists: true,
        canDismiss: true,
        afterExists: true,
      });
      expect(payload.result.postcondition).toMatchObject({
        classification: "engine-front-still-live",
        outcome: "stale",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      });
      expect(payload.result.nextSteps[0]).toMatchObject({
        kind: "do-not-repeat",
        source: "notifications.dismiss.request",
      });
      expectSemanticDismissalOmitsRawRuntimeDetails(payload.result);
    } finally {
      await server.close();
    }
  });
});

async function runDismissNotification(mode: DismissNotificationMode, extraArgs: readonly string[]) {
  const server = await startDismissNotificationTunerServer(mode);
  const writes: string[] = [];
  const log = vi
    .spyOn(GamePlayDismissNotification.prototype, "log")
    .mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
  try {
    const { port } = server.address();
    await GamePlayDismissNotification.run([
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
      result: {
        notificationId: { owner: number; id: number; type: number };
        sent: boolean;
        status: string;
        validation: {
          beforeExists: boolean;
          canDismiss: boolean;
          afterExists: boolean | null;
        };
        postcondition: {
          classification: string;
          outcome: string;
          confidence: string;
          confirmed: boolean;
          noRepeatAfterUnverified: boolean;
        };
        nextSteps: Array<{ kind: string; source: string; label: string }>;
      };
    },
    server,
  };
}

function expectSemanticDismissalOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain('"closeoutPath"');
  expect(serialized).not.toContain('"verificationAttempts"');
  expect(serialized).not.toContain('"result"');
  expect(serialized).not.toContain("NotificationModel.manager.dismiss");
  expect(serialized).not.toContain("Game.Notifications.dismiss");
}

async function startDismissNotificationTunerServer(
  mode: DismissNotificationMode
): Promise<FakeTunerServer> {
  let notificationDismissalSent = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes("Network.isInSession")) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes("evalOk") && message.includes("GameplayMap.getGridWidth")) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
      if (message.includes("readNotificationDismissal")) {
        const send = message.includes('"send":true');
        if (send) notificationDismissalSent = true;
        return [
          JSON.stringify(notificationDismissal(send, mode, notificationDismissalSent && !send)),
        ];
      }
      return undefined;
    },
  });
}

function appUiSnapshot() {
  return {
    network: {
      isInSession: { ok: true, value: true },
      numPlayers: { ok: true, value: 1 },
      hostPlayerId: { ok: true, value: 0 },
      isConnectedToNetwork: { ok: true, value: true },
      isAuthenticated: { ok: true, value: false },
      isLoggedIn: { ok: true, value: true },
    },
    autoplay: {
      isActive: false,
      turns: -1,
      isPaused: false,
      isPausedOrPending: false,
      observeAsPlayer: -1,
      returnAsPlayer: -1,
    },
    game: {
      turn: 1,
      age: 0,
      maxTurns: 0,
      turnDate: { ok: true, value: "4000 BCE" },
      hash: { ok: true, value: 0 },
    },
    ui: {
      inGame: { ok: true, value: true },
      inShell: { ok: true, value: false },
      inLoading: { ok: true, value: false },
      loadingState: { ok: true, value: 6 },
      loadingStateName: "WaitingForUIReady",
      canBeginGame: { ok: true, value: true },
      canNotifyUIReady: "function",
      skipStartButton: { ok: true, value: false },
      automationActive: { ok: true, value: false },
    },
    gameContext: {
      localPlayerID: 0,
      localObserverID: 0,
      hasRequestedPause: { ok: true, value: false },
    },
    players: {
      maxPlayers: 64,
      aliveIds: { ok: true, value: [0] },
      aliveHumanIds: { ok: true, value: [0] },
      numAliveHumans: { ok: true, value: 1 },
    },
    map: {
      width: { ok: true, value: 84 },
      height: { ok: true, value: 54 },
      plotCount: { ok: true, value: 4536 },
      mapSize: { ok: true, value: 0 },
      randomSeed: { ok: true, value: 1 },
    },
  };
}

function tunerHealthSnapshot() {
  return {
    evalOk: 2,
    ready: true,
    globals: {
      Game: "object",
      Autoplay: "object",
      GameplayMap: "object",
      Players: "object",
      Network: "undefined",
    },
    turn: { ok: true, value: 1 },
    turnDate: { ok: true, value: "4000 BCE" },
    width: { ok: true, value: 84 },
    height: { ok: true, value: 54 },
    aliveIds: { ok: true, value: [0] },
    aliveHumanIds: { ok: true, value: [0] },
    autoplayActive: { ok: true, value: false },
  };
}

function notificationDismissal(
  send: boolean,
  mode: DismissNotificationMode = "verified",
  settled = false
) {
  const notificationId = { owner: 0, id: 113, type: 20 };
  const isStaleNonblocking = mode === "stale-nonblocking";
  const isEngineFrontTrainAbsent = mode === "engine-front-train-absent";
  const before = {
    id: notificationId,
    exists: true,
    type: isStaleNonblocking ? -2117069996 : 2091697919,
    typeName: isStaleNonblocking
      ? "NOTIFICATION_CULTURE_TREE_REVEALED"
      : "NOTIFICATION_WONDER_COMPLETED",
    summary: isStaleNonblocking
      ? "A new culture tree has been revealed."
      : "An unmet player has finished constructing the World Wonder Great Stele.",
    message: isStaleNonblocking ? "Culture Tree Revealed" : "Wonder Completed",
    target: { owner: -1, id: -1, type: 0 },
    location: { x: -9999, y: -9999 },
    canUserDismiss: true,
    expired: false,
    dismissed: false,
    blocksTurnAdvancement: { ok: true, value: !isStaleNonblocking },
    endTurnBlockingType: { ok: true, value: isStaleNonblocking ? 0 : 2091697919 },
    isEndTurnBlocking: { ok: true, value: !isStaleNonblocking },
    engineQueueCount: { ok: true, value: 1 },
    engineQueueContains: { ok: true, value: true },
    engineQueueFirstId: { ok: true, value: notificationId },
    isEngineQueueFront: { ok: true, value: true },
    notificationTrainCount: { ok: true, value: isEngineFrontTrainAbsent ? 0 : 1 },
    notificationTrainContains: { ok: true, value: !isEngineFrontTrainAbsent },
    notificationTrainFirstId: { ok: true, value: isEngineFrontTrainAbsent ? null : notificationId },
    isNotificationTrainFront: { ok: true, value: !isEngineFrontTrainAbsent },
  };
  const dismissed = isStaleNonblocking
    ? before
    : isEngineFrontTrainAbsent
      ? before
      : {
          ...before,
          exists: false,
          dismissed: true,
          blocksTurnAdvancement: { ok: true, value: false },
          endTurnBlockingType: { ok: true, value: 0 },
          isEndTurnBlocking: { ok: true, value: false },
          engineQueueCount: { ok: true, value: 0 },
          engineQueueContains: { ok: true, value: false },
          engineQueueFirstId: { ok: true, value: null },
          isEngineQueueFront: { ok: true, value: false },
          notificationTrainCount: { ok: true, value: 0 },
          notificationTrainContains: { ok: true, value: false },
          notificationTrainFirstId: { ok: true, value: null },
          isNotificationTrainFront: { ok: true, value: false },
        };
  const engineFrontDismissed = {
    ...before,
    dismissed: true,
  };
  const current =
    settled && !send
      ? mode === "engine-front-dismissed"
        ? engineFrontDismissed
        : dismissed
      : before;
  return {
    notificationId,
    before: current,
    after: send ? before : null,
    canDismiss: true,
    sent: send,
    closeoutPath: send
      ? isStaleNonblocking
        ? "NotificationModel.manager.dismiss+Game.Notifications.dismiss"
        : "NotificationModel.manager.dismiss"
      : null,
    result: send
      ? {
          notificationTrainManager: {
            ok: true,
            attempted: true,
            available: true,
            path: "NotificationModel.manager.dismiss",
          },
          panelCloseControl: isStaleNonblocking
            ? {
                ok: true,
                attempted: true,
                available: true,
                path: "Game.Notifications.dismiss",
                value: false,
              }
            : {
                ok: false,
                attempted: false,
                available: false,
                path: "Game.Notifications.dismiss",
                reason: "official panel close control does not dismiss the active end-turn blocker",
              },
        }
      : null,
    verificationAttempts: send ? [before] : [],
    verified: false,
    notes: [
      "This is an App UI notification action, not a gameplay operation family.",
      "Send mode records both official actor routes: notification-train manager dismissal and the visible panel close-control dismissal when that route is available for this item.",
      "Verification is identity-based: disappeared, dismissed, removed from the engine queue or notification train, or moved off a front position it occupied before send. Non-blocking status alone is not proof.",
      "The embedded App UI action records immediate route evidence. The direct-control wrapper performs final verification across separate App UI reads so frame-driven queues can advance.",
    ],
  };
}
