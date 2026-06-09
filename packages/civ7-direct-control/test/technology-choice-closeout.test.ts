import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { createContext, Script } from "node:vm";
import { describe, expect, test } from "vitest";

import { requestCiv7TechnologyChoiceCloseout } from "../src/index";

type FakeTunerServer = {
  received: string[];
  notificationCalls: NotificationCall[];
  operationCalls: OperationCall[];
  address(): AddressInfo;
  close(): Promise<void>;
};

type ComponentId = { owner: number; id: number; type?: number };

type NotificationCall = {
  kind: "activate";
  notificationId: ComponentId;
};

type OperationCall = {
  kind: "validate" | "send";
  playerId: number;
  operationType: string;
  args: Record<string, number>;
  test?: boolean;
};

describe("technology choice closeout requests", () => {
  test("requests App UI technology chooser closeout with semantic notification and operation sends", async () => {
    const server = await startTechnologyCloseoutTunerServer();
    try {
      const { port } = server.address();
      const notificationId = { owner: 0, id: 52, type: 20 };
      const node = -1255676052;
      const request = await requestCiv7TechnologyChoiceCloseout(
        { playerId: 0, node, notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(request.sent).toBe(true);
      expect(request).not.toHaveProperty("verified");
      expect(request.payload).toMatchObject({
        localPlayerId: 0,
        playerId: 0,
        node,
        notificationId,
        activationResult: { ok: true, value: true },
        canChoose: { ok: true, value: { Success: true } },
        chooseResult: { ok: true, value: true },
        canClearTarget: { ok: true, value: { Success: true } },
        clearTargetResult: { ok: true, value: true },
        sent: true,
      });
      expect(server.notificationCalls).toEqual([{ kind: "activate", notificationId }]);
      expect(server.operationCalls).toEqual([
        {
          kind: "validate",
          playerId: 0,
          operationType: "SET_TECH_TREE_NODE",
          args: { ProgressionTreeNodeType: node },
          test: false,
        },
        {
          kind: "send",
          playerId: 0,
          operationType: "SET_TECH_TREE_NODE",
          args: { ProgressionTreeNodeType: node },
        },
        {
          kind: "validate",
          playerId: 0,
          operationType: "SET_TECH_TREE_TARGET_NODE",
          args: { ProgressionTreeNodeType: -1 },
          test: false,
        },
        {
          kind: "send",
          playerId: 0,
          operationType: "SET_TECH_TREE_TARGET_NODE",
          args: { ProgressionTreeNodeType: -1 },
        },
      ]);
    } finally {
      await server.close();
    }
  });
});

async function startTechnologyCloseoutTunerServer(): Promise<FakeTunerServer> {
  const received: string[] = [];
  const notificationCalls: NotificationCall[] = [];
  const operationCalls: OperationCall[] = [];
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
        } else {
          socket.write(
            encodeResponse(frame.listenerId, [
              executeAppUiCommand(frame.message, notificationCalls, operationCalls),
            ])
          );
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    received,
    notificationCalls,
    operationCalls,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function executeAppUiCommand(
  message: string,
  notificationCalls: NotificationCall[],
  operationCalls: OperationCall[]
): string {
  const prefix = "CMD:65535:";
  if (!message.startsWith(prefix)) return "2";
  const script = message.slice(prefix.length);
  const context = createContext({
    GameContext: { localPlayerID: 0 },
    ProgressionTreeNodeTypes: { NO_NODE: -1 },
    PlayerOperationTypes: {
      SET_TECH_TREE_NODE: "SET_TECH_TREE_NODE",
      SET_TECH_TREE_TARGET_NODE: "SET_TECH_TREE_TARGET_NODE",
    },
    Players: {
      get: (playerId: number) => ({
        Techs: {
          getResearching: () => (playerId === 0 ? -99 : null),
          getTargetNode: () => (playerId === 0 ? 17 : null),
        },
      }),
    },
    Game: {
      Notifications: {
        activate: (notificationId: ComponentId) => {
          notificationCalls.push({ kind: "activate", notificationId });
          return true;
        },
        getIdsForPlayer: () => [],
      },
      PlayerOperations: {
        canStart: (
          playerId: number,
          operationType: string,
          args: Record<string, number>,
          test?: boolean
        ) => {
          operationCalls.push({ kind: "validate", playerId, operationType, args, test });
          return { Success: true };
        },
        sendRequest: (playerId: number, operationType: string, args: Record<string, number>) => {
          operationCalls.push({ kind: "send", playerId, operationType, args });
          return true;
        },
      },
    },
  });
  return String(new Script(script).runInContext(context, { timeout: 1_000 }));
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
