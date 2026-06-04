import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7PlayNotificationViewInputSchema,
  Civ7PlayNotificationViewResultSchema,
  getCiv7PlayNotificationView,
} from "../src/index";

type FakeTunerServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

describe("getCiv7PlayNotificationView", () => {
  test("keeps procedure input bounded and context-owned", () => {
    expect(Value.Check(Civ7PlayNotificationViewInputSchema, {})).toBe(true);
    expect(Value.Check(Civ7PlayNotificationViewInputSchema, { maxNotifications: 25 })).toBe(true);
    expect(Value.Check(Civ7PlayNotificationViewInputSchema, { maxNotifications: 0 })).toBe(false);
    expect(Value.Check(Civ7PlayNotificationViewInputSchema, { maxNotifications: 101 })).toBe(false);
    expect(Value.Check(Civ7PlayNotificationViewInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7PlayNotificationViewInputSchema, { port: 4318 })).toBe(false);
    expect(Value.Check(Civ7PlayNotificationViewInputSchema, { state: { name: "App UI" } })).toBe(false);
    expect(Value.Check(Civ7PlayNotificationViewInputSchema, { rawCommand: "readPlayNotifications()" })).toBe(false);
  });

  test("materializes play notifications with decision hints", async () => {
    const server = await startPlayNotificationTunerServer();
    try {
      const { port } = server.address();
      const view = await getCiv7PlayNotificationView({
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
      });

      expect(view).toMatchObject({
        state: { id: "65535", name: "App UI" },
        localPlayerId: 0,
        blocker: { ok: true, value: -2026570723 },
        blockingNotificationId: { ok: true, value: { owner: 0, id: 42, type: 20 } },
        notifications: [
          {
            typeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
            isEndTurnBlocking: true,
            decision: {
              category: "town-focus",
              operationFamily: "city-command",
              operationType: "CHANGE_GROWTH_MODE",
              requiredInputs: expect.arrayContaining([
                expect.objectContaining({ name: "City" }),
              ]),
              commonActions: expect.arrayContaining([
                expect.objectContaining({ cli: expect.stringContaining("game play set-town-focus") }),
              ]),
            },
          },
        ],
        hud: {
          nextDecision: {
            category: "town-focus",
            isEndTurnBlocking: true,
          },
        },
      });
      expect(Value.Check(Civ7PlayNotificationViewResultSchema, view)).toBe(true);
      expect(Value.Check(Civ7PlayNotificationViewResultSchema, {
        ...view,
        rawCommand: "readPlayNotifications()",
      })).toBe(false);
      expect(view.decisions.some((decision) => decision.category === "town-focus")).toBe(true);
      expect(server.received.some((message) => message.includes("readPlayNotifications"))).toBe(true);
      const notificationRead = server.received.find((message) => message.includes("readPlayNotifications")) ?? "";
      expect(notificationRead).toContain("CHOOSE_AUTO_NARRATIVE_STORY_DIRECTION");
      expect(notificationRead).toContain("getFirstPendingDiscoveryLastMetID");
    } finally {
      await server.close();
    }
  });
});

async function startPlayNotificationTunerServer(): Promise<FakeTunerServer> {
  const received: string[] = [];
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
        } else if (frame.message.includes("readPlayNotifications")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(playNotificationView())]));
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

function playNotificationView() {
  const notification = {
    id: { owner: 0, id: 42, type: 20 },
    type: -123,
    typeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
    groupType: null,
    player: 0,
    summary: "Choose Town Project",
    message: "Choose a town focus project",
    target: { owner: 0, id: 131073, type: 1 },
    location: null,
    canUserDismiss: false,
    expired: false,
    dismissed: false,
    isEndTurnBlocking: true,
    decision: {
      category: "town-focus",
      operationFamily: "city-command",
      operationType: "CHANGE_GROWTH_MODE",
      requiredInputs: [
        { name: "City", source: "notification target or selected city", required: true },
        { name: "Type", source: "live town focus option", required: true },
        { name: "ProjectType", source: "live town focus option", required: true },
      ],
      commonActions: [
        {
          label: "Set town focus",
          cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>",
          when: "after choosing a live town focus option",
        },
      ],
      confidence: "live-proof" as const,
      notes: [
        "Town focus is not city-operation BUILD; use --closeout when one caller action should apply the focus and clear the review surface.",
      ],
    },
  };

  return {
    localPlayerId: 0,
    turn: { ok: true, value: 80 },
    turnDate: { ok: true, value: "2025 BCE" },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: -2026570723 },
    blockingNotificationId: { ok: true, value: { owner: 0, id: 42, type: 20 } },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: { owner: 0, id: 131073, type: 1 } },
    firstReadyUnitId: { ok: true, value: null },
    notifications: [notification],
    decisions: [
      {
        ...notification.decision,
      },
    ],
    hud: {
      nextDecision: {
        notificationId: { owner: 0, id: 42, type: 20 },
        isEndTurnBlocking: true,
        typeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
        summary: "Choose Town Project",
        message: "Choose a town focus project",
        target: { owner: 0, id: 131073, type: 1 },
        location: null,
        player: 0,
        category: "town-focus",
        operationFamily: "city-command",
        operationType: "CHANGE_GROWTH_MODE",
        requiredInputs: notification.decision.requiredInputs,
        commonActions: notification.decision.commonActions,
        notes: notification.decision.notes,
      },
      decisionQueue: [],
    },
    limits: {
      maxNotifications: 25,
      truncated: false,
    },
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
