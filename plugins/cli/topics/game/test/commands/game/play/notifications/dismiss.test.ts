import { describe, expect, test, vi } from "vitest";

import GamePlayNotificationsDismiss from "../../../../../src/commands/game/play/notifications/dismiss";
import {
  type FakeTunerServer,
  startFakeTunerServer,
} from "../../../../support/tuner-socket-server";

type DismissNotificationMode = "confirmed" | "blocked" | "stale";

const notificationId = { owner: 0, id: 113, type: 20 };
const checkCommandMarker = "return JSON.stringify(checkNotificationDismissal(";
const sendCommandMarker = "return JSON.stringify(sendNotificationDismissalEnvelope(";

describe("game play notifications dismiss command", () => {
  test("checks dismissal availability through the control service without dispatching", async () => {
    const { payload, server } = await runDismissNotification("confirmed", []);
    try {
      expect(payload.result).toEqual({
        notificationId,
        available: true,
      });
      expect(
        server.received.filter((message) => message.includes(checkCommandMarker))
      ).toHaveLength(1);
      expect(server.received.some((message) => message.includes(sendCommandMarker))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("reports unavailable native dismissal evidence through the service check", async () => {
    const { payload, server } = await runDismissNotification("blocked", []);
    try {
      expect(payload.result).toEqual({
        notificationId,
        available: false,
      });
      expect(server.received.some((message) => message.includes(sendCommandMarker))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("requests dismissal through the service only when send is explicit", async () => {
    const { payload, server } = await runDismissNotification("confirmed", ["--send"]);
    try {
      expect(payload.result).toMatchObject({
        notificationId,
        status: "sent-confirmed",
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
      expect(server.received.some((message) => message.includes(checkCommandMarker))).toBe(true);
      expect(server.received.filter((message) => message.includes(sendCommandMarker))).toHaveLength(
        1
      );
      expect(
        server.received.some((message) =>
          message.includes("notifications.dismiss.call(notifications, before.notificationId)")
        )
      ).toBe(true);
      expect(server.received.some((message) => message.includes("NotificationModel"))).toBe(false);
      expectSemanticDismissalResult(payload.result);
    } finally {
      await server.close();
    }
  });

  test("keeps still-active evidence unverified and no-repeat guarded", async () => {
    const { payload, server } = await runDismissNotification("stale", ["--send"]);
    try {
      expect(payload.result).toMatchObject({
        notificationId,
        status: "sent-unverified",
        postcondition: {
          classification: "notification-still-active",
          outcome: "still-active",
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
      expect(server.received.filter((message) => message.includes(sendCommandMarker))).toHaveLength(
        1
      );
      expectSemanticDismissalResult(payload.result);
    } finally {
      await server.close();
    }
  });

  test("keeps a blocked request not-sent without invoking the native send atom", async () => {
    const { payload, server } = await runDismissNotification("blocked", ["--send"]);
    try {
      expect(payload.result).toMatchObject({
        notificationId,
        status: "not-sent",
        postcondition: {
          classification: "not-sent",
          outcome: "not-sent",
          confidence: "unverified",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [
          {
            kind: "inspect-notification",
            source: "notifications.dismiss.request",
          },
        ],
      });
      expect(server.received.some((message) => message.includes(sendCommandMarker))).toBe(false);
      expectSemanticDismissalResult(payload.result);
    } finally {
      await server.close();
    }
  });
});

async function runDismissNotification(mode: DismissNotificationMode, extraArgs: readonly string[]) {
  const server = await startDismissNotificationTunerServer(mode);
  const writes: string[] = [];
  const log = vi
    .spyOn(GamePlayNotificationsDismiss.prototype, "log")
    .mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
  try {
    const { port } = server.address();
    await GamePlayNotificationsDismiss.run([
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--target",
      JSON.stringify(notificationId),
      ...extraArgs,
      "--json",
    ]);
  } finally {
    log.mockRestore();
  }

  return {
    payload: JSON.parse(writes.join("")) as {
      ok: true;
      result: Record<string, unknown>;
    },
    server,
  };
}

function expectSemanticDismissalResult(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"sent"');
  expect(serialized).not.toContain('"validation"');
  expect(serialized).not.toContain('"before"');
  expect(serialized).not.toContain('"after"');
  expect(serialized).not.toContain('"snapshot"');
  expect(serialized).not.toContain('"expected"');
  expect(serialized).not.toContain("NotificationModel");
  expect(serialized).not.toContain("Game.Notifications.dismiss");
}

async function startDismissNotificationTunerServer(
  mode: DismissNotificationMode
): Promise<FakeTunerServer> {
  let sent = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes("Network.isInSession")) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes("evalOk") && message.includes("GameplayMap.getGridWidth")) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
      if (message.includes(sendCommandMarker)) {
        sent = true;
        const before = notificationSnapshot(mode);
        return [
          JSON.stringify({
            ok: true,
            value: {
              sent: true,
              before,
              after: mode === "confirmed" ? dismissedNotificationSnapshot() : before,
            },
          }),
        ];
      }
      if (message.includes(checkCommandMarker)) {
        return [
          JSON.stringify({
            snapshot:
              sent && mode === "confirmed"
                ? dismissedNotificationSnapshot()
                : notificationSnapshot(mode),
          }),
        ];
      }
      return undefined;
    },
  });
}

function notificationSnapshot(mode: DismissNotificationMode) {
  return {
    notificationId,
    localPlayerId: 0,
    exists: true,
    typeName: "NOTIFICATION_WONDER_COMPLETED",
    activeQueue: { ok: true, value: true },
    canUserDismiss: { ok: true, value: mode !== "blocked" },
    dismissed: { ok: true, value: false },
  };
}

function dismissedNotificationSnapshot() {
  return {
    notificationId,
    localPlayerId: 0,
    exists: false,
    typeName: null,
    activeQueue: { ok: true, value: false },
    canUserDismiss: { ok: true, value: false },
    dismissed: { ok: false, error: "Notification is unavailable." },
  };
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
      plotCount: { ok: true, value: 4_536 },
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
