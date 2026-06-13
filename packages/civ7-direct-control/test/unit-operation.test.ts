import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";

import { canStartCiv7UnitOperation, requestCiv7UnitOperation } from "../src/index";

type FakeTunerServer = {
  received: string[];
  operationCalls: OperationCall[];
  address(): AddressInfo;
  close(): Promise<void>;
};

type OperationCall = {
  kind: "validate" | "send";
  family: string;
  input: {
    unitId?: { owner: number; id: number; type: number };
    operationType?: string;
  };
};

describe("unit operation requests", () => {
  test("validates and sends unit operations without replay", async () => {
    const server = await startUnitOperationTunerServer();
    try {
      const { port } = server.address();
      const unitId = { owner: 0, id: 65536, type: 26 };
      const validation = await canStartCiv7UnitOperation(
        { unitId, operationType: "SKIP_TURN" },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );
      const request = await requestCiv7UnitOperation(
        { unitId, operationType: "SKIP_TURN" },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(validation).toMatchObject({
        family: "unit-operation",
        operationType: "SKIP_TURN",
        valid: true,
      });
      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.postcondition).toMatchObject({
        family: "unit-operation",
        operationType: "SKIP_TURN",
        classification: "queue-advanced",
      });
      expect(server.operationCalls).toEqual([
        {
          kind: "validate",
          family: "unit-operation",
          input: { unitId, operationType: "SKIP_TURN" },
        },
        {
          kind: "validate",
          family: "unit-operation",
          input: { unitId, operationType: "SKIP_TURN" },
        },
        {
          kind: "send",
          family: "unit-operation",
          input: { unitId, operationType: "SKIP_TURN" },
        },
        {
          kind: "validate",
          family: "unit-operation",
          input: { unitId, operationType: "SKIP_TURN" },
        },
      ]);
    } finally {
      await server.close();
    }
  });
});

async function startUnitOperationTunerServer(): Promise<FakeTunerServer> {
  const received: string[] = [];
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
          const operationCall = parseOperationCall(frame.message);
          if (operationCall) operationCalls.push(operationCall);
          if (operationCall?.kind === "send") {
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify({
                  sent: true,
                  before: {
                    family: "unit-operation",
                    operationType: "SKIP_TURN",
                    valid: true,
                    result: { Success: true },
                  },
                  result: { accepted: true },
                  beforePostcondition: unitOperationPostconditionSnapshot({
                    owner: 0,
                    id: 65536,
                    type: 26,
                  }),
                  afterPostcondition: unitOperationPostconditionSnapshot({
                    owner: 0,
                    id: 131072,
                    type: 26,
                  }),
                }),
              ])
            );
          } else if (operationCall?.kind === "validate") {
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify({
                  family: "unit-operation",
                  operationType: "SKIP_TURN",
                  enumValue: "SKIP_TURN",
                  target: { unitId: { owner: 0, id: 65536, type: 26 } },
                  args: undefined,
                  valid: true,
                  result: { Success: true },
                }),
              ])
            );
          } else {
            socket.write(encodeResponse(frame.listenerId, ["2"]));
          }
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    received,
    operationCalls,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function parseOperationCall(message: string): OperationCall | undefined {
  const match = message.match(
    /return JSON\.stringify\((validateOperation|sendOperation)\(("(?:\\.|[^"\\])*"), (\{.*\})\)\);/s
  );
  if (!match) return undefined;
  return {
    kind: match[1] === "sendOperation" ? "send" : "validate",
    family: JSON.parse(match[2]),
    input: JSON.parse(match[3]),
  };
}

function unitOperationPostconditionSnapshot(firstReadyUnitId: {
  owner: number;
  id: number;
  type: number;
}) {
  return {
    unit: {
      ok: true,
      value: {
        id: { owner: 0, id: 65536, type: 26 },
        location: { x: 22, y: 33 },
        movement: 2,
        activity: "UNIT_ACTIVITY_AWAKE",
        damage: 0,
        attacks: 1,
      },
    },
    selectedUnitId: { ok: true, value: { owner: 0, id: 65536, type: 26 } },
    firstReadyUnitId: { ok: true, value: firstReadyUnitId },
    blocker: { ok: true, value: 0 },
  };
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
