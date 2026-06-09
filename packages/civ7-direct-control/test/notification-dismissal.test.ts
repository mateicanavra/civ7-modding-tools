import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";

import {
  getCiv7NotificationDismissal,
  requestCiv7NotificationDismissal,
} from "../src/index";

type FakeTunerServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

type NotificationDismissalMode =
  | "verified"
  | "engine-front-train-absent"
  | "engine-front-dismissed"
  | "engine-front-none-blocker"
  | "expired-engine-front-none-blocker";

describe("notification dismissal", () => {
  test("rejects malformed notification ids before building App UI commands", async () => {
    await expect(getCiv7NotificationDismissal(
      { notificationId: { owner: 0, type: 20 } } as never,
      { host: "127.0.0.1", port: 1 },
    )).rejects.toMatchObject({
      code: "command-failed",
    });
    await expect(requestCiv7NotificationDismissal(
      { notificationId: { owner: 0, type: 20 } } as never,
      { host: "127.0.0.1", port: 1 },
      { approved: true, reason: "test malformed notification id" },
    )).rejects.toMatchObject({
      code: "command-failed",
    });
  });

  test("plans and sends guarded notification dismissal", async () => {
    const server = await startNotificationDismissalTunerServer();
    try {
      const { port } = server.address();
      const notificationId = { owner: 0, id: 113, type: 20 };
      const plan = await getCiv7NotificationDismissal(
        { notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );
      const request = await requestCiv7NotificationDismissal(
        { notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test reviewed notification dismissal" },
      );

      expect(plan).toMatchObject({
        notificationId,
        canDismiss: true,
        sent: false,
        postcondition: {
          classification: "not-sent",
        },
        before: {
          typeName: "NOTIFICATION_WONDER_COMPLETED",
          canUserDismiss: true,
          isEndTurnBlocking: { ok: true, value: true },
        },
      });
      expect(request).toMatchObject({
        notificationId,
        sent: true,
        verified: true,
        postcondition: {
          classification: "notification-disappeared",
        },
        after: {
          isEndTurnBlocking: { ok: true, value: false },
        },
      });
      expect(request.verificationAttempts?.length).toBeGreaterThan(1);
      const dismissalReads = server.received.filter((message) => message.includes("readNotificationDismissal"));
      expect(dismissalReads.length).toBeGreaterThan(2);
      expect(dismissalReads.filter((message) => message.includes('"send":true'))).toHaveLength(1);
      expect(dismissalReads.filter((message) => message.includes('"send":false')).length).toBeGreaterThan(1);
    } finally {
      await server.close();
    }
  });

  test("does not verify dismissal from train absence while engine queue still fronts the target", async () => {
    const server = await startNotificationDismissalTunerServer({ mode: "engine-front-train-absent" });
    try {
      const { port } = server.address();
      const notificationId = { owner: 0, id: 113, type: 20 };
      const request = await requestCiv7NotificationDismissal(
        { notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test stale engine-front notification dismissal" },
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(false);
      expect(request.postcondition).toMatchObject({
        classification: "engine-front-still-live",
      });
      expect(request.after).toMatchObject({
        engineQueueContains: { ok: true, value: true },
        isEngineQueueFront: { ok: true, value: true },
        notificationTrainContains: { ok: true, value: false },
        isNotificationTrainFront: { ok: true, value: false },
      });
      expect(request.verificationAttempts?.length).toBeGreaterThan(1);
    } finally {
      await server.close();
    }
  });

  test("does not verify dismissal from dismissed flag while engine queue still fronts the target", async () => {
    const server = await startNotificationDismissalTunerServer({ mode: "engine-front-dismissed" });
    try {
      const { port } = server.address();
      const notificationId = { owner: 0, id: 113, type: 20 };
      const request = await requestCiv7NotificationDismissal(
        { notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test dismissed flag with stale engine-front notification" },
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(false);
      expect(request.postcondition).toMatchObject({
        classification: "engine-front-still-live",
      });
      expect(request.after).toMatchObject({
        dismissed: true,
        engineQueueContains: { ok: true, value: true },
        isEngineQueueFront: { ok: true, value: true },
      });
      expect(request.verificationAttempts?.length).toBeGreaterThan(1);
    } finally {
      await server.close();
    }
  });

  test("uses panel dismiss when blocker enum is none despite stale engine-front identity", async () => {
    const server = await startNotificationDismissalTunerServer({ mode: "engine-front-none-blocker" });
    try {
      const { port } = server.address();
      const notificationId = { owner: 0, id: 113, type: 20 };
      const request = await requestCiv7NotificationDismissal(
        { notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test panel close control for none blocker enum" },
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.postcondition).toMatchObject({
        classification: "notification-disappeared",
      });
      const requestResult = request.result as { panelCloseControl?: unknown } | null;
      expect(requestResult?.panelCloseControl).toMatchObject({
        ok: true,
        attempted: true,
        available: true,
        path: "Game.Notifications.dismiss",
      });
      expect(request.before).toMatchObject({
        endTurnBlockingType: { ok: true, value: 0 },
        isEngineQueueFront: { ok: true, value: true },
      });
      expect(request.after).toMatchObject({
        exists: false,
        engineQueueContains: { ok: true, value: false },
        isEngineQueueFront: { ok: true, value: false },
      });
    } finally {
      await server.close();
    }
  });

  test("uses panel dismiss for expired non-user-dismissible stale front notifications when blocker enum is none", async () => {
    const server = await startNotificationDismissalTunerServer({ mode: "expired-engine-front-none-blocker" });
    try {
      const { port } = server.address();
      const notificationId = { owner: 0, id: 113, type: 20 };
      const plan = await getCiv7NotificationDismissal(
        { notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );
      const request = await requestCiv7NotificationDismissal(
        { notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test expired stale front panel close control" },
      );

      expect(plan).toMatchObject({
        canDismiss: true,
        before: {
          canUserDismiss: false,
          expired: true,
          endTurnBlockingType: { ok: true, value: 0 },
          isEngineQueueFront: { ok: true, value: true },
        },
      });
      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.postcondition).toMatchObject({
        classification: "notification-disappeared",
      });
      const requestResult = request.result as { panelCloseControl?: unknown } | null;
      expect(requestResult?.panelCloseControl).toMatchObject({
        ok: true,
        attempted: true,
        available: true,
        path: "Game.Notifications.dismiss",
      });
      expect(request.after).toMatchObject({
        exists: false,
        engineQueueContains: { ok: true, value: false },
        isEngineQueueFront: { ok: true, value: false },
      });
    } finally {
      await server.close();
    }
  });
});

async function startNotificationDismissalTunerServer(
  options: { mode?: NotificationDismissalMode } = {},
): Promise<FakeTunerServer> {
  const received: string[] = [];
  let notificationDismissalSent = false;
  const server = createServer((socket) => {
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const frame = parseRequest(buffer);
        if (!frame) return;
        buffer = buffer.subarray(frame.bytesRead);
        received.push(frame.message);
        if (frame.message === "LSQ:") {
          socket.write(encodeResponse(frame.listenerId, ["65535", "App UI", "1", "Tuner"]));
        } else if (frame.message.includes("readNotificationDismissal")) {
          const send = frame.message.includes('"send":true');
          if (send) notificationDismissalSent = true;
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify(notificationDismissal(
                send,
                notificationDismissalSent && !send,
                options.mode ?? "verified",
              )),
            ]),
          );
        } else {
          socket.write(encodeResponse(frame.listenerId, ["2"]));
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    received,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function notificationDismissal(
  send: boolean,
  settled = false,
  mode: NotificationDismissalMode = "verified",
) {
  const notificationId = { owner: 0, id: 113, type: 20 };
  const trainAbsent = mode === "engine-front-train-absent";
  const noneBlocker = mode === "engine-front-none-blocker" || mode === "expired-engine-front-none-blocker";
  const expiredNonDismissible = mode === "expired-engine-front-none-blocker";
  const present = {
    id: notificationId,
    exists: true,
    type: 2091697919,
    typeName: "NOTIFICATION_WONDER_COMPLETED",
    summary: "An unmet player has finished constructing the World Wonder Great Stele.",
    message: "Wonder Completed",
    target: { owner: -1, id: -1, type: 0 },
    location: { x: -9999, y: -9999 },
    canUserDismiss: !expiredNonDismissible,
    expired: expiredNonDismissible,
    dismissed: false,
    blocksTurnAdvancement: { ok: true, value: true },
    endTurnBlockingType: { ok: true, value: noneBlocker ? 0 : 2091697919 },
    isEndTurnBlocking: { ok: true, value: true },
    engineQueueCount: { ok: true, value: 1 },
    engineQueueContains: { ok: true, value: true },
    engineQueueFirstId: { ok: true, value: notificationId },
    isEngineQueueFront: { ok: true, value: true },
    notificationTrainCount: { ok: true, value: trainAbsent ? 0 : 1 },
    notificationTrainContains: { ok: true, value: !trainAbsent },
    notificationTrainFirstId: { ok: true, value: trainAbsent ? null : notificationId },
    isNotificationTrainFront: { ok: true, value: !trainAbsent },
  };
  const cleared = {
    ...present,
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
    ...present,
    dismissed: true,
  };
  const current = mode === "engine-front-train-absent"
    ? present
    : mode === "engine-front-dismissed"
      ? engineFrontDismissed
      : settled
        ? cleared
        : present;
  return {
    notificationId,
    before: current,
    after: send ? present : null,
    canDismiss: true,
    sent: send,
    result: send
      ? {
          notificationTrainManager: {
            ok: true,
            attempted: true,
            available: true,
            path: "NotificationModel.manager.dismiss",
          },
          panelCloseControl: noneBlocker
            ? {
                ok: true,
                attempted: true,
                available: true,
                path: "Game.Notifications.dismiss",
                value: true,
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
    verificationAttempts: send ? [present] : [],
    verified: false,
    notes: ["This is an App UI notification action, not a gameplay operation family."],
  };
}

function parseRequest(buffer: Buffer):
  | {
      listenerId: number;
      message: string;
      bytesRead: number;
    }
  | null {
  if (buffer.length < 8) return null;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return null;
  return {
    listenerId: buffer.readUInt32LE(4),
    message: buffer.subarray(8, bytesRead).toString("utf8").replace(/\0$/, ""),
    bytesRead,
  };
}

function encodeResponse(listenerId: number, parts: string[]): Buffer {
  const messageBytes = Buffer.from(`${parts.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}
