import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { runInNewContext } from "node:vm";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import * as directControl from "../src/index";
import {
  type Civ7NotificationDismissalSnapshot,
  checkCiv7NotificationDismissal,
  sendCiv7NotificationDismissal,
} from "../src/index";
import { liveCiv7DirectControl } from "../src/live-control";

const notificationId = { owner: 0, id: 113, type: 20 };

type NotificationDismissalServerOptions = Readonly<{
  notificationId?: Readonly<{ owner: number; id: number; type?: number }>;
  localPlayerId?: unknown;
  exists?: boolean;
  activeQueue?: boolean;
  canUserDismiss?: unknown;
  dismissed?: unknown;
  typeName?: unknown;
  postLocalPlayerId?: unknown;
  postExists?: boolean;
  postActiveQueue?: boolean;
  postCanUserDismiss?: unknown;
  postDismissed?: unknown;
  missingGetIdsForPlayer?: boolean;
  missingCanUserDismiss?: boolean;
  missingDismissed?: boolean;
  missingDismiss?: boolean;
  dismissError?: Error;
  dismissResult?: unknown;
}>;

type FakeNotificationDismissalServer = Readonly<{
  commandExecutions: string[];
  findArgs: unknown[];
  getTypeArgs: unknown[];
  getTypeNameArgs: unknown[];
  getIdsForPlayerArgs: unknown[];
  canUserDismissArgs: unknown[];
  dismissArgs: unknown[];
  receiverMatches: boolean[];
  dismissInvocations(): number;
  address(): AddressInfo;
  close(): Promise<void>;
}>;

describe("exact native notification-dismissal atoms", () => {
  test("publishes only bounded check/send atoms and raw schemas", () => {
    expect(directControl).toMatchObject({
      checkCiv7NotificationDismissal: expect.any(Function),
      sendCiv7NotificationDismissal: expect.any(Function),
      Civ7NotificationDismissInputSchema: expect.any(Object),
      Civ7NotificationDismissalSnapshotSchema: expect.any(Object),
      Civ7NotificationDismissalCheckResultSchema: expect.any(Object),
      Civ7NotificationDismissalSendInputSchema: expect.any(Object),
      Civ7NotificationDismissalSendResultSchema: expect.any(Object),
    });
    expect(liveCiv7DirectControl).toMatchObject({
      checkCiv7NotificationDismissal,
      sendCiv7NotificationDismissal,
    });
    for (const retiredExport of [
      "getCiv7NotificationDismissal",
      "requestCiv7NotificationDismissal",
      "Civ7NotificationDismissRequestInputSchema",
      "Civ7NotificationDismissalResultSchema",
      "Civ7NotificationDismissalSummarySchema",
      "notificationDismissalProofOutcome",
      "notificationDismissalProofPostcondition",
    ]) {
      expect(retiredExport in directControl).toBe(false);
    }

    const snapshot = expectedSnapshot();
    expect(Value.Check(directControl.Civ7NotificationDismissInputSchema, { notificationId })).toBe(
      true
    );
    expect(
      Value.Check(directControl.Civ7NotificationDismissInputSchema, {
        notificationId,
        send: true,
      })
    ).toBe(false);
    expect(Value.Check(directControl.Civ7NotificationDismissalSnapshotSchema, snapshot)).toBe(true);
    expect(
      Value.Check(directControl.Civ7NotificationDismissalSendInputSchema, {
        expected: snapshot,
      })
    ).toBe(true);
    expect(
      Value.Check(directControl.Civ7NotificationDismissalSendInputSchema, {
        expected: snapshot,
        force: true,
      })
    ).toBe(false);
  });

  test("checks one native snapshot through the official notification APIs", async () => {
    const server = await startNotificationDismissalServer();
    try {
      const result = await checkCiv7NotificationDismissal({ notificationId }, tunerOptions(server));

      expect(result).toEqual({ snapshot: expectedSnapshot() });
      expect(server.findArgs).toEqual([notificationId]);
      expect(server.getTypeArgs).toEqual([notificationId]);
      expect(server.getTypeNameArgs).toEqual([2091697919]);
      expect(server.getIdsForPlayerArgs).toEqual([0]);
      expect(server.canUserDismissArgs).toEqual([notificationId]);
      expect(server.commandExecutions).toHaveLength(1);
      expect(server.commandExecutions[0]).toContain(
        "notifications.canUserDismissNotification.call"
      );
      expect(server.commandExecutions[0]).not.toMatch(
        /NotificationModel|expired|notificationTrain|verified|notes|setTimeout|Date\.now/
      );
    } finally {
      await server.close();
    }
  });

  test.each([
    {
      label: "active queue",
      options: { missingGetIdsForPlayer: true },
      field: "activeQueue" as const,
      error: "getIdsForPlayer is unavailable",
    },
    {
      label: "native dismissal permission",
      options: { missingCanUserDismiss: true },
      field: "canUserDismiss" as const,
      error: "canUserDismissNotification is unavailable",
    },
    {
      label: "dismissed state",
      options: { missingDismissed: true },
      field: "dismissed" as const,
      error: "Notification.Dismissed is unavailable",
    },
  ])("keeps unreadable $label evidence unavailable", async ({ options, field, error }) => {
    const server = await startNotificationDismissalServer(options);
    try {
      const result = await checkCiv7NotificationDismissal({ notificationId }, tunerOptions(server));

      expect(result.snapshot[field]).toEqual({
        ok: false,
        error: expect.stringContaining(error),
      });
      expect(result.snapshot[field]).not.toEqual({ ok: true, value: false });
    } finally {
      await server.close();
    }
  });

  test("preserves native false admission evidence", async () => {
    const server = await startNotificationDismissalServer({
      activeQueue: false,
      canUserDismiss: false,
    });
    try {
      const result = await checkCiv7NotificationDismissal({ notificationId }, tunerOptions(server));

      expect(result.snapshot.activeQueue).toEqual({ ok: true, value: false });
      expect(result.snapshot.canUserDismiss).toEqual({ ok: true, value: false });
    } finally {
      await server.close();
    }
  });

  test("dismisses exactly once and returns immediate raw before/after evidence", async () => {
    const server = await startNotificationDismissalServer();
    try {
      const result = await sendCiv7NotificationDismissal(
        { expected: expectedSnapshot() },
        tunerOptions(server)
      );

      expect(result).toEqual({
        sent: true,
        before: expectedSnapshot(),
        after: expectedSnapshot({
          activeQueue: { ok: true, value: false },
          canUserDismiss: { ok: true, value: false },
          dismissed: { ok: true, value: true },
        }),
      });
      expect(server.dismissInvocations()).toBe(1);
      expect(server.dismissArgs).toEqual([notificationId]);
      expect(server.canUserDismissArgs).toEqual([notificationId, notificationId]);
      expect(server.receiverMatches.every(Boolean)).toBe(true);
      expect(server.commandExecutions).toHaveLength(1);
      expect(server.commandExecutions[0]).toContain(
        "notifications.dismiss.call(notifications, before.notificationId)"
      );
    } finally {
      await server.close();
    }
  });

  test("does not make dismissed readability an admission prerequisite", async () => {
    const server = await startNotificationDismissalServer({ missingDismissed: true });
    try {
      const { snapshot } = await checkCiv7NotificationDismissal(
        { notificationId },
        tunerOptions(server)
      );
      const result = await sendCiv7NotificationDismissal(
        { expected: snapshot },
        tunerOptions(server)
      );

      expect(snapshot.dismissed.ok).toBe(false);
      expect(result.sent).toBe(true);
      expect(server.dismissInvocations()).toBe(1);
    } finally {
      await server.close();
    }
  });

  test.each([
    {
      label: "notification identity drift",
      expected: expectedSnapshot({
        notificationId: { owner: 0, id: 114, type: 20 },
      }),
    },
    {
      label: "local player drift",
      expected: expectedSnapshot({ localPlayerId: 1 }),
    },
    {
      label: "existence drift",
      expected: expectedSnapshot({ exists: false }),
    },
    {
      label: "type-name drift",
      expected: expectedSnapshot({ typeName: "NOTIFICATION_OTHER" }),
    },
    {
      label: "active-queue drift",
      expected: expectedSnapshot({ activeQueue: { ok: true, value: false } }),
    },
    {
      label: "can-dismiss drift",
      expected: expectedSnapshot({ canUserDismiss: { ok: true, value: false } }),
    },
    {
      label: "unreadable expected active queue",
      expected: expectedSnapshot({ activeQueue: { ok: false, error: "unavailable" } }),
    },
  ])("refuses $label before native invocation", async ({ expected }) => {
    const server = await startNotificationDismissalServer();
    try {
      await expect(
        sendCiv7NotificationDismissal({ expected }, tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
      expect(server.dismissInvocations()).toBe(0);
    } finally {
      await server.close();
    }
  });

  test.each([
    {
      label: "non-local owner",
      options: {
        notificationId: { owner: 1, id: 113, type: 20 },
        localPlayerId: 0,
      },
    },
    {
      label: "inactive notification",
      options: { activeQueue: false },
    },
    {
      label: "native canUserDismiss false",
      options: { canUserDismiss: false },
    },
  ])("fails closed for $label after matching check evidence", async ({ options }) => {
    const server = await startNotificationDismissalServer(options);
    try {
      const requestedId = options.notificationId ?? notificationId;
      const { snapshot } = await checkCiv7NotificationDismissal(
        { notificationId: requestedId },
        tunerOptions(server)
      );

      await expect(
        sendCiv7NotificationDismissal({ expected: snapshot }, tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
        message: expect.stringContaining("Native notification dismissal admission"),
      });
      expect(server.dismissInvocations()).toBe(0);
    } finally {
      await server.close();
    }
  });

  test("classifies a missing native dismiss method before dispatch", async () => {
    const server = await startNotificationDismissalServer({ missingDismiss: true });
    try {
      await expect(
        sendCiv7NotificationDismissal({ expected: expectedSnapshot() }, tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
      expect(server.dismissInvocations()).toBe(0);
    } finally {
      await server.close();
    }
  });

  test("classifies native dismissal exceptions as dispatched", async () => {
    const server = await startNotificationDismissalServer({
      dismissError: new Error("native dismiss failed"),
    });
    try {
      await expect(
        sendCiv7NotificationDismissal({ expected: expectedSnapshot() }, tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "dispatched",
        message: "native dismiss failed",
      });
      expect(server.dismissInvocations()).toBe(1);
    } finally {
      await server.close();
    }
  });

  test("classifies after-read failures as dispatched", async () => {
    const server = await startNotificationDismissalServer({ postLocalPlayerId: null });
    try {
      await expect(
        sendCiv7NotificationDismissal({ expected: expectedSnapshot() }, tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "dispatched",
        message: expect.stringContaining("GameContext.localPlayerID is unavailable"),
      });
      expect(server.dismissInvocations()).toBe(1);
    } finally {
      await server.close();
    }
  });

  test("classifies invalid host inputs before opening a Tuner session", async () => {
    await expect(
      checkCiv7NotificationDismissal(
        { notificationId: { owner: 0, type: 20 } } as never,
        unreachableTunerOptions
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "not-dispatched",
    });
    await expect(
      sendCiv7NotificationDismissal(
        { expected: { ...expectedSnapshot(), notes: [] } } as never,
        unreachableTunerOptions
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "not-dispatched",
    });
  });
});

async function startNotificationDismissalServer(
  options: NotificationDismissalServerOptions = {}
): Promise<FakeNotificationDismissalServer> {
  const id = options.notificationId ?? notificationId;
  const commandExecutions: string[] = [];
  const findArgs: unknown[] = [];
  const getTypeArgs: unknown[] = [];
  const getTypeNameArgs: unknown[] = [];
  const getIdsForPlayerArgs: unknown[] = [];
  const canUserDismissArgs: unknown[] = [];
  const dismissArgs: unknown[] = [];
  const receiverMatches: boolean[] = [];
  let dismissInvocations = 0;
  const runtime = {
    localPlayerId: hasOwn(options, "localPlayerId") ? options.localPlayerId : 0,
    exists: options.exists ?? true,
    activeQueue: options.activeQueue ?? true,
    canUserDismiss: hasOwn(options, "canUserDismiss") ? options.canUserDismiss : true,
    dismissed: hasOwn(options, "dismissed") ? options.dismissed : false,
  };
  const notifications: Record<string, unknown> = {
    find(this: unknown, candidate: unknown) {
      receiverMatches.push(this === notifications);
      findArgs.push(candidate);
      return runtime.exists && idsMatch(candidate, id)
        ? {
            Type: 2091697919,
            ...(options.missingDismissed ? {} : { Dismissed: runtime.dismissed }),
          }
        : null;
    },
    getType(this: unknown, candidate: unknown) {
      receiverMatches.push(this === notifications);
      getTypeArgs.push(candidate);
      return 2091697919;
    },
    getTypeName(this: unknown, type: unknown) {
      receiverMatches.push(this === notifications);
      getTypeNameArgs.push(type);
      return hasOwn(options, "typeName") ? options.typeName : "NOTIFICATION_WONDER_COMPLETED";
    },
  };
  if (!options.missingGetIdsForPlayer) {
    notifications.getIdsForPlayer = function (this: unknown, playerId: unknown) {
      receiverMatches.push(this === notifications);
      getIdsForPlayerArgs.push(playerId);
      return runtime.activeQueue ? [{ ...id }] : [];
    };
  }
  if (!options.missingCanUserDismiss) {
    notifications.canUserDismissNotification = function (this: unknown, candidate: unknown) {
      receiverMatches.push(this === notifications);
      canUserDismissArgs.push(candidate);
      return runtime.canUserDismiss;
    };
  }
  if (!options.missingDismiss) {
    notifications.dismiss = function (this: unknown, candidate: unknown) {
      dismissInvocations += 1;
      receiverMatches.push(this === notifications);
      dismissArgs.push(candidate);
      if (options.dismissError) throw options.dismissError;
      runtime.localPlayerId = hasOwn(options, "postLocalPlayerId")
        ? options.postLocalPlayerId
        : runtime.localPlayerId;
      runtime.exists = options.postExists ?? true;
      runtime.activeQueue = options.postActiveQueue ?? false;
      runtime.canUserDismiss = hasOwn(options, "postCanUserDismiss")
        ? options.postCanUserDismiss
        : false;
      runtime.dismissed = hasOwn(options, "postDismissed") ? options.postDismissed : true;
      return options.dismissResult;
    };
  }
  const globals = {
    Game: { Notifications: notifications },
    GameContext: {
      get localPlayerID() {
        return runtime.localPlayerId;
      },
    },
  };
  const server = createServer((socket) => {
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const frame = parseRequest(buffer);
        if (!frame) return;
        buffer = buffer.subarray(frame.bytesRead);
        if (frame.message === "LSQ:") {
          socket.write(encodeResponse(frame.listenerId, ["65535", "App UI", "1", "Tuner"]));
          continue;
        }
        const commandMatch = frame.message.match(/^CMD:([^:]+):(.*)$/s);
        if (!commandMatch) continue;
        const command = commandMatch[2] ?? "";
        commandExecutions.push(command);
        try {
          const output = runInNewContext(command, globals);
          socket.write(encodeResponse(frame.listenerId, [String(output)]));
        } catch (error) {
          socket.write(encodeResponse(frame.listenerId, [String(error)]));
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

  return {
    commandExecutions,
    findArgs,
    getTypeArgs,
    getTypeNameArgs,
    getIdsForPlayerArgs,
    canUserDismissArgs,
    dismissArgs,
    receiverMatches,
    dismissInvocations: () => dismissInvocations,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function expectedSnapshot(
  overrides: Partial<Civ7NotificationDismissalSnapshot> = {}
): Civ7NotificationDismissalSnapshot {
  return {
    notificationId,
    localPlayerId: 0,
    exists: true,
    typeName: "NOTIFICATION_WONDER_COMPLETED",
    activeQueue: { ok: true, value: true },
    canUserDismiss: { ok: true, value: true },
    dismissed: { ok: true, value: false },
    ...overrides,
  };
}

function tunerOptions(server: FakeNotificationDismissalServer) {
  const { port } = server.address();
  return { host: "127.0.0.1", port, timeoutMs: 1_000 };
}

const unreachableTunerOptions = {
  host: "127.0.0.1",
  port: 1,
  timeoutMs: 10,
};

function idsMatch(
  left: unknown,
  right: Readonly<{ owner: number; id: number; type?: number }>
): boolean {
  if (!left || typeof left !== "object") return false;
  const candidate = left as { owner?: unknown; id?: unknown; type?: unknown };
  return (
    candidate.owner === right.owner &&
    candidate.id === right.id &&
    (candidate.type ?? null) === (right.type ?? null)
  );
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function parseRequest(buffer: Buffer): {
  listenerId: number;
  message: string;
  bytesRead: number;
} | null {
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
