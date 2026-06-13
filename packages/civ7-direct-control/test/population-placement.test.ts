import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";

import {
  canStartCiv7CityCommand,
  canStartCiv7PlayerOperation,
  requestCiv7CityCommand,
  requestCiv7PlayerOperation,
} from "../src/index";

type FakeTunerServer = {
  operationCalls: OperationCall[];
  address(): AddressInfo;
  close(): Promise<void>;
};

type OperationCall = {
  kind: "validate" | "send";
  family: string;
  input: {
    playerId?: number;
    cityId?: { owner: number; id: number; type: number };
    operationType?: string;
    args?: Record<string, number>;
  };
};

describe("population placement requests", () => {
  test("reports population postconditions for ASSIGN_WORKER player operations", async () => {
    const server = await startPopulationPlacementTunerServer();
    try {
      const { port } = server.address();
      const validation = await canStartCiv7PlayerOperation(
        {
          playerId: 0,
          operationType: "ASSIGN_WORKER",
          args: { Location: 2543, Amount: 1 },
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );
      const request = await requestCiv7PlayerOperation(
        {
          playerId: 0,
          operationType: "ASSIGN_WORKER",
          args: { Location: 2543, Amount: 1 },
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(validation).toMatchObject({
        family: "player-operation",
        operationType: "ASSIGN_WORKER",
        valid: true,
      });
      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.populationPostcondition).toMatchObject({
        family: "player-operation",
        operationType: "ASSIGN_WORKER",
        classification: "population-ready-cleared",
        readyCleared: true,
        placementStateChanged: true,
      });
      expect(request.postcondition).toBeUndefined();
      expect(request.productionPostcondition).toBeUndefined();
      expect(server.operationCalls).toEqual([
        {
          kind: "validate",
          family: "player-operation",
          input: {
            playerId: 0,
            operationType: "ASSIGN_WORKER",
            args: { Location: 2543, Amount: 1 },
          },
        },
        {
          kind: "validate",
          family: "player-operation",
          input: {
            playerId: 0,
            operationType: "ASSIGN_WORKER",
            args: { Location: 2543, Amount: 1 },
          },
        },
        {
          kind: "send",
          family: "player-operation",
          input: {
            playerId: 0,
            operationType: "ASSIGN_WORKER",
            args: { Location: 2543, Amount: 1 },
          },
        },
        {
          kind: "validate",
          family: "player-operation",
          input: {
            playerId: 0,
            operationType: "ASSIGN_WORKER",
            args: { Location: 2543, Amount: 1 },
          },
        },
      ]);
    } finally {
      await server.close();
    }
  });

  test("reports population postconditions for EXPAND city commands", async () => {
    const server = await startPopulationPlacementTunerServer();
    try {
      const { port } = server.address();
      const cityId = { owner: 0, id: 196610, type: 1 };
      const validation = await canStartCiv7CityCommand(
        {
          cityId,
          operationType: "EXPAND",
          args: { X: 16, Y: 19 },
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );
      const request = await requestCiv7CityCommand(
        {
          cityId,
          operationType: "EXPAND",
          args: { X: 16, Y: 19 },
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(validation).toMatchObject({
        family: "city-command",
        operationType: "EXPAND",
        valid: true,
      });
      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.populationPostcondition).toMatchObject({
        family: "city-command",
        operationType: "EXPAND",
        classification: "population-ready-cleared",
        readyCleared: true,
        placementStateChanged: true,
      });
      expect(request.postcondition).toBeUndefined();
      expect(request.productionPostcondition).toBeUndefined();
      expect(server.operationCalls).toEqual([
        {
          kind: "validate",
          family: "city-command",
          input: {
            cityId,
            operationType: "EXPAND",
            args: { X: 16, Y: 19 },
          },
        },
        {
          kind: "validate",
          family: "city-command",
          input: {
            cityId,
            operationType: "EXPAND",
            args: { X: 16, Y: 19 },
          },
        },
        {
          kind: "send",
          family: "city-command",
          input: {
            cityId,
            operationType: "EXPAND",
            args: { X: 16, Y: 19 },
          },
        },
        {
          kind: "validate",
          family: "city-command",
          input: {
            cityId,
            operationType: "EXPAND",
            args: { X: 16, Y: 19 },
          },
        },
      ]);
    } finally {
      await server.close();
    }
  });
});

async function startPopulationPlacementTunerServer(): Promise<FakeTunerServer> {
  const operationCalls: OperationCall[] = [];
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
        } else {
          const operationCall = parseOperationCall(frame.message);
          if (operationCall) operationCalls.push(operationCall);
          if (operationCall?.kind === "validate") {
            socket.write(
              encodeResponse(frame.listenerId, [JSON.stringify(operationValidation(operationCall))])
            );
          } else if (operationCall?.kind === "send") {
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify({
                  sent: true,
                  beforePopulationPostcondition: populationPlacementPostconditionSnapshot(
                    operationCall.family,
                    operationCall.input,
                    true
                  ),
                  afterPopulationPostcondition: populationPlacementPostconditionSnapshot(
                    operationCall.family,
                    operationCall.input,
                    false
                  ),
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

function operationValidation(operationCall: OperationCall) {
  const { family, input } = operationCall;
  return {
    family,
    operationType: input.operationType,
    enumValue: input.operationType,
    target: family === "city-command" ? { cityId: input.cityId } : { playerId: input.playerId },
    args: input.args,
    valid: true,
    result: { Success: true },
  };
}

function populationPlacementPostconditionSnapshot(
  family: string,
  input: OperationCall["input"],
  isReadyToPlacePopulation: boolean
) {
  const cityId =
    family === "city-command"
      ? (input.cityId ?? { owner: 0, id: 196610, type: 1 })
      : { owner: 0, id: 196610, type: 1 };
  return {
    cityId,
    city: {
      ok: true,
      value: {
        id: cityId,
        population: isReadyToPlacePopulation ? 4 : 5,
        isTown: true,
        location: { x: 20, y: 20 },
      },
    },
    isReadyToPlacePopulation: { ok: true, value: isReadyToPlacePopulation },
    cityWorkerCap: { ok: true, value: isReadyToPlacePopulation ? 4 : 5 },
    workablePlotIndexes: {
      ok: true,
      value: isReadyToPlacePopulation ? [2543, 2544] : [2543, 2544, 2545],
    },
    blockedPlotIndexes: { ok: true, value: isReadyToPlacePopulation ? [2545] : [] },
    expansionPlotIndexes: {
      ok: true,
      value: family === "city-command" ? (isReadyToPlacePopulation ? [1660] : [1661]) : [],
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
