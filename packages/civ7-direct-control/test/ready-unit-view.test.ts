import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7ReadyUnitViewInputSchema,
  Civ7ReadyUnitViewResultSchema,
  getCiv7ReadyUnitView,
} from "../src/index";

type FakeTunerServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

describe("getCiv7ReadyUnitView", () => {
  test("reads the first ready unit view without sending operations", async () => {
    const server = await startReadyUnitTunerServer();
    try {
      const { port } = server.address();
      const view = await getCiv7ReadyUnitView(
        {},
        {
          host: "127.0.0.1",
          port,
          timeoutMs: 1_000,
        },
      );

      expect(view).toMatchObject({
        state: { id: "65535", name: "App UI" },
        unitId: { owner: 0, id: 458752, type: 26 },
        legalOperations: [
          {
            family: "unit-operation",
            operationType: "SKIP_TURN",
            valid: true,
          },
        ],
      });
      expect(server.received.some((message) => message.includes("readReadyUnitView"))).toBe(true);
      expect(server.received.some((message) => message.includes("sendRequest"))).toBe(false);
      expect(Value.Check(Civ7ReadyUnitViewInputSchema, {
        unitId: { owner: 0, id: 458752, type: 26 },
        radius: 2,
        maxOperations: 96,
      })).toBe(true);
      expect(Value.Check(Civ7ReadyUnitViewInputSchema, { radius: 6 })).toBe(false);
      expect(Value.Check(Civ7ReadyUnitViewInputSchema, { rawCommand: "readReadyUnitView()" })).toBe(false);
      expect(Value.Check(Civ7ReadyUnitViewResultSchema, view)).toBe(true);
      expect(Value.Check(Civ7ReadyUnitViewResultSchema, {
        ...view,
        command: "readReadyUnitView()",
      })).toBe(false);
    } finally {
      await server.close();
    }
  });
});

async function startReadyUnitTunerServer(): Promise<FakeTunerServer> {
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
        } else if (frame.message.includes("readReadyUnitView")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(readyUnitView())]));
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

function readyUnitView() {
  const unitId = { owner: 0, id: 458752, type: 26 };
  return {
    localPlayerId: 0,
    requestedUnitId: null,
    selectedUnitId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: unitId },
    unitId,
    unit: {
      ok: true,
      value: {
        id: unitId,
        owner: 0,
        type: 111,
        typeName: "UNIT_ARMY_COMMANDER",
        location: { x: 22, y: 31 },
        movementMovesRemaining: 2,
        attacksRemaining: 0,
        damage: 0,
        hitPoints: 100,
      },
    },
    legalOperations: [
      {
        family: "unit-operation",
        operationType: "SKIP_TURN",
        enumValue: 1,
        valid: true,
        result: { Success: true },
      },
    ],
    promotionReadiness: {
      ok: true,
      value: null,
    },
    nearby: {
      ok: true,
      value: [
        {
          x: 22,
          y: 31,
          units: [{ id: unitId, owner: 0, typeName: "UNIT_ARMY_COMMANDER" }],
        },
      ],
    },
    notes: ["Read-only ready-unit view. Use operation validation before any send."],
  };
}
