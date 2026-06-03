import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";

import { requestCiv7ProductionChoice } from "../src/index";

type FakeTunerServer = {
  received: string[];
  operationCalls: OperationCall[];
  productionChoiceCalls: ProductionChoiceCall[];
  address(): AddressInfo;
  close(): Promise<void>;
};

type OperationCall = {
  kind: "validate" | "send";
  family: string;
  input: {
    cityId?: { owner: number; id: number; type: number };
    operationType?: string;
    args?: Record<string, number>;
  };
};

type ProductionChoiceCall = {
  input: {
    cityId: { owner: number; id: number; type: number };
    args: Record<string, number>;
  };
  options: { send?: boolean };
};

describe("production choice requests", () => {
  test("requests production choices through the official App UI production path", async () => {
    const server = await startProductionChoiceTunerServer();
    try {
      const { port } = server.address();
      const cityId = { owner: 0, id: 65536, type: 1 };
      const request = await requestCiv7ProductionChoice(
        { cityId, args: { ConstructibleType: 713967338, X: 22, Y: 31 } },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test official production choice" }
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.productionPostcondition).toMatchObject({
        classification: "production-choice-cleared",
        blockerStillLive: false,
      });
      expect(request.payload?.ui?.cityActivation).toMatchObject({ ok: true });
      expect(request.payload?.ui?.interfaceClose).toMatchObject({ ok: true });
      expect(server.operationCalls).toEqual([
        {
          kind: "validate",
          family: "city-operation",
          input: {
            cityId,
            operationType: "BUILD",
            args: { ConstructibleType: 713967338, X: 22, Y: 31 },
          },
        },
        {
          kind: "validate",
          family: "city-operation",
          input: {
            cityId,
            operationType: "BUILD",
            args: { ConstructibleType: 713967338, X: 22, Y: 31 },
          },
        },
      ]);
      expect(server.productionChoiceCalls).toEqual([
        {
          input: { cityId, args: { ConstructibleType: 713967338, X: 22, Y: 31 } },
          options: { send: true },
        },
        {
          input: { cityId, args: { ConstructibleType: 713967338, X: 22, Y: 31 } },
          options: { send: false },
        },
      ]);
      expect(
        server.received.some((message) => message.includes("return JSON.stringify(sendOperation"))
      ).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("reports sticky production-choice blockers after BUILD sends", async () => {
    const server = await startProductionChoiceTunerServer({ productionPostconditionMode: "blocker-still-live" });
    try {
      const { port } = server.address();
      const cityId = { owner: 0, id: 65536, type: 1 };
      const request = await requestCiv7ProductionChoice(
        { cityId, args: { ConstructibleType: 713967338, X: 22, Y: 31 } },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test sticky production blocker" }
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(false);
      expect(request.productionPostcondition).toMatchObject({
        classification: "production-state-changed-blocker-still-live",
        productionStateChanged: true,
        blockerStillLive: true,
      });
      expect(request.productionPostcondition?.reason).toContain("production-choice notification still blocks");
      expect(
        request.payload?.afterProductionPostcondition?.blockingProductionNotification
      ).toMatchObject({ ok: true });
    } finally {
      await server.close();
    }
  });
});

async function startProductionChoiceTunerServer(options: {
  productionPostconditionMode?: "cleared" | "blocker-still-live";
} = {}): Promise<FakeTunerServer> {
  const received: string[] = [];
  const operationCalls: OperationCall[] = [];
  const productionChoiceCalls: ProductionChoiceCall[] = [];
  let productionChoiceSent = false;
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
          const productionChoiceCall = parseProductionChoiceCall(frame.message);
          if (operationCall) operationCalls.push(operationCall);
          if (productionChoiceCall) productionChoiceCalls.push(productionChoiceCall);
          if (operationCall?.kind === "validate") {
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify({
                  family: "city-operation",
                  operationType: "BUILD",
                  enumValue: "BUILD",
                  target: { cityId: { owner: 0, id: 65536, type: 1 } },
                  args: { ConstructibleType: 713967338, X: 22, Y: 31 },
                  valid: true,
                  result: { Success: true },
                }),
              ])
            );
          } else if (productionChoiceCall) {
            const send = productionChoiceCall.options.send === true;
            if (send) productionChoiceSent = true;
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify(productionChoicePayload(
                  send,
                  options.productionPostconditionMode ?? "cleared",
                  productionChoiceSent && !send,
                )),
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
    productionChoiceCalls,
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

function parseProductionChoiceCall(message: string): ProductionChoiceCall | undefined {
  const match = message.match(
    /return JSON\.stringify\(readProductionChoice\((\{.*\}), (\{.*\})\)\);/s
  );
  if (!match) return undefined;
  return {
    input: JSON.parse(match[1]),
    options: JSON.parse(match[2]),
  };
}

function productionChoicePayload(
  send: boolean,
  mode: "cleared" | "blocker-still-live",
  settled = false,
) {
  const cityId = { owner: 0, id: 65536, type: 1 };
  const before = productionPostconditionSnapshot("before", mode);
  const after = productionPostconditionSnapshot(settled || send ? "after" : "before", mode);
  return {
    cityId,
    args: { ConstructibleType: 713967338, X: 22, Y: 31 },
    beforeValidation: { ok: true, value: { Success: true } },
    afterValidation: { ok: true, value: { Success: true } },
    sent: send,
    sendResult: send
      ? { ok: true, value: true }
      : { ok: false, skipped: true, reason: "send not requested" },
    beforeProductionPostcondition: before,
    afterProductionPostcondition: after,
    ui: {
      cityActivation: send
        ? { ok: true, value: { selectedCityId: cityId } }
        : { ok: false, skipped: true, reason: "read-only production choice status" },
      interfaceClose: send
        ? { ok: true, value: { selectedCityId: null, interfaceMode: "INTERFACEMODE_DEFAULT" } }
        : { ok: false, skipped: true, reason: "send not requested" },
    },
    notes: ["This mirrors the official production chooser path."],
  };
}

function productionPostconditionSnapshot(
  phase: "before" | "after",
  mode: "cleared" | "blocker-still-live"
) {
  const cityId = { owner: 0, id: 65536, type: 1 };
  const notification = {
    id: { owner: 0, id: 6, type: 20 },
    type: 1090224621,
    typeName: "NOTIFICATION_CHOOSE_CITY_PRODUCTION",
    target: cityId,
    matchesCity: true,
    canUserDismiss: false,
    expired: true,
    dismissed: false,
  };
  return {
    cityId,
    city: {
      ok: true,
      value: {
        id: cityId,
        population: 3,
        isTown: false,
        location: { x: 26, y: 36 },
      },
    },
    buildQueue: {
      ok: true,
      value: {
        currentProductionTypeHash: phase === "before" ? 713967338 : 1558890441,
        previousProductionTypeHash: 0,
        productionProgress: phase === "before" ? 12 : 0,
        turnsLeftForRequestedItem: phase === "before" ? -1 : 4,
        queueLength: 1,
      },
    },
    selectedCityId: { ok: true, value: phase === "before" ? cityId : null },
    blocker: { ok: true, value: mode === "cleared" && phase === "after" ? 0 : 1090224621 },
    canEndTurn: { ok: true, value: mode === "cleared" && phase === "after" },
    blockingProductionNotification: {
      ok: true,
      value: mode === "blocker-still-live" || phase === "before" ? notification : null,
    },
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
