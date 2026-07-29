import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { runInNewContext } from "node:vm";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  Civ7CityExpansionInputSchema,
  Civ7WorkerAssignmentInputSchema,
  canStartCiv7CityCommand,
  canStartCiv7PlayerOperation,
  checkCiv7CityExpansion,
  checkCiv7WorkerAssignment,
  requestCiv7CityCommand,
  requestCiv7PlayerOperation,
  sendCiv7CityExpansion,
  sendCiv7WorkerAssignment,
} from "../src/index";

type PlacementCall = Readonly<{
  kind: "worker-can-start" | "worker-send" | "expand-can-start" | "expand-send";
  target: unknown;
  operationType: unknown;
  args: unknown;
  queue?: unknown;
}>;

type PlacementServerOptions = Readonly<{
  expandCanStartResult?: unknown;
  expansionOwnershipBefore?: unknown;
  expandSendError?: Error;
  expandSendResult?: unknown;
  includeUnreadableNonReadyCity?: boolean;
  workerCanStartResult?: unknown;
  workerSendError?: Error;
}>;

type FakePlacementServer = Readonly<{
  calls: PlacementCall[];
  commandExecutions: string[];
  address(): AddressInfo;
  close(): Promise<void>;
}>;

const cityId = { owner: 0, id: 196_610, type: 1 };
const unreadableCityId = { owner: 0, id: 196_611, type: 1 };
const location = 2_543;
const destination = { x: 16, y: 19 };
const expansionPlotIndex = 1_660;
const constructibleType = 713_967_338;

describe("exact population-placement wire atoms", () => {
  test("admits semantic placement inputs without caller-owned player or operation fields", () => {
    expect(Value.Check(Civ7WorkerAssignmentInputSchema, { location })).toBe(true);
    expect(
      Value.Check(Civ7WorkerAssignmentInputSchema, {
        location,
        playerId: 0,
      })
    ).toBe(false);
    expect(Value.Check(Civ7CityExpansionInputSchema, { cityId, destination })).toBe(true);
    expect(
      Value.Check(Civ7CityExpansionInputSchema, {
        cityId,
        destination,
        operationType: "EXPAND",
      })
    ).toBe(false);
  });

  test.each([
    "ASSIGN_WORKER",
    "PLAYEROPERATION_ASSIGN_WORKER",
  ])("refuses %s through generic player-operation paths before routing", async (operationType) => {
    for (const run of [canStartCiv7PlayerOperation, requestCiv7PlayerOperation]) {
      await expect(
        run(
          {
            playerId: 0,
            operationType,
            args: { Location: location, Amount: 1 },
          },
          { host: "127.0.0.1", port: 1, timeoutMs: 10 }
        )
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        message:
          "player-operation ASSIGN_WORKER must use the exact worker assignment check/send atoms",
        dispatchStatus: "not-dispatched",
      });
    }
  });

  test.each([
    "EXPAND",
    "CITYCOMMAND_EXPAND",
  ])("refuses %s through generic city-command paths before routing", async (operationType) => {
    for (const run of [canStartCiv7CityCommand, requestCiv7CityCommand]) {
      await expect(
        run(
          {
            cityId,
            operationType,
            args: { X: destination.x, Y: destination.y },
          },
          { host: "127.0.0.1", port: 1, timeoutMs: 10 }
        )
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        message: "city-command EXPAND must use the exact city expansion check/send atoms",
        dispatchStatus: "not-dispatched",
      });
    }
  });

  test("distinguishes unavailable expansion ownership from explicit native null", async () => {
    for (const expansionOwnershipBefore of [undefined, {}, { owner: 0 }, "malformed"]) {
      const server = await startPlacementServer({ expansionOwnershipBefore });
      try {
        const result = await checkCiv7CityExpansion({ cityId, destination }, tunerOptions(server));
        expect(result.valid).toBe(false);
        expect(result.snapshot.ownership).toEqual({ status: "unavailable" });
      } finally {
        await server.close();
      }
    }
  });

  test.each([
    undefined,
    { owner: 0, id: 999_001, type: 1 },
  ])("refuses EXPAND send without fresh unowned evidence: %j", async (expansionOwnershipBefore) => {
    const server = await startPlacementServer({ expansionOwnershipBefore });
    try {
      const result = await sendCiv7CityExpansion({ cityId, destination }, tunerOptions(server));

      expect(result.sent).toBe(false);
      expect(server.calls.filter((call) => call.kind === "expand-send")).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test("checks ASSIGN_WORKER for the ambient local player and exact ready candidate", async () => {
    const server = await startPlacementServer();
    try {
      const result = await checkCiv7WorkerAssignment({ location }, tunerOptions(server));

      expect(result).toEqual({
        valid: true,
        result: { Success: true },
        snapshot: workerSnapshot({ ready: true, numWorkers: 0 }),
      });
      expect(server.calls).toEqual([
        {
          kind: "worker-can-start",
          target: 0,
          operationType: "ASSIGN_WORKER",
          args: { Location: location, Amount: 1 },
          queue: false,
        },
      ]);
      expect(server.commandExecutions).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test("freshly validates and sends ASSIGN_WORKER once with target-specific snapshots", async () => {
    const server = await startPlacementServer();
    try {
      const result = await sendCiv7WorkerAssignment({ location }, tunerOptions(server));

      expect(result).toEqual({
        sent: true,
        validation: { valid: true, result: { Success: true } },
        before: workerSnapshot({ ready: true, numWorkers: 0 }),
        after: workerSnapshot({ ready: false, numWorkers: 1 }),
      });
      expect(server.calls).toEqual([
        {
          kind: "worker-can-start",
          target: 0,
          operationType: "ASSIGN_WORKER",
          args: { Location: location, Amount: 1 },
          queue: false,
        },
        {
          kind: "worker-send",
          target: 0,
          operationType: "ASSIGN_WORKER",
          args: { Location: location, Amount: 1 },
        },
      ]);
    } finally {
      await server.close();
    }
  });

  test("ignores an unrelated non-ready city without worker placement APIs", async () => {
    const server = await startPlacementServer({ includeUnreadableNonReadyCity: true });
    try {
      const result = await checkCiv7WorkerAssignment({ location }, tunerOptions(server));
      expect(result).toEqual({
        valid: true,
        result: { Success: true },
        snapshot: workerSnapshot({ ready: true, numWorkers: 0 }),
      });
    } finally {
      await server.close();
    }
  });

  test.each([
    { Success: false },
    { success: true },
    true,
  ])("requires exact Success true from ASSIGN_WORKER canStart: %j", async (workerCanStartResult) => {
    const server = await startPlacementServer({ workerCanStartResult });
    try {
      const result = await sendCiv7WorkerAssignment({ location }, tunerOptions(server));
      expect(result.sent).toBe(false);
      expect(server.calls.filter((call) => call.kind === "worker-send")).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test("checks EXPAND membership by aligned Plots and ConstructibleTypes", async () => {
    const server = await startPlacementServer({
      expandCanStartResult: {
        Success: false,
        Plots: [1_659, expansionPlotIndex],
        ConstructibleTypes: [42, constructibleType],
      },
    });
    try {
      const result = await checkCiv7CityExpansion({ cityId, destination }, tunerOptions(server));

      expect(result).toEqual({
        valid: true,
        result: {
          Success: false,
          Plots: [1_659, expansionPlotIndex],
          ConstructibleTypes: [42, constructibleType],
        },
        snapshot: expansionSnapshot({
          ready: true,
          candidate: { plotIndex: expansionPlotIndex, constructibleType },
          ownership: { status: "unowned" },
        }),
      });
      expect(server.calls).toEqual([
        {
          kind: "expand-can-start",
          target: cityId,
          operationType: "EXPAND",
          args: {},
          queue: false,
        },
      ]);
    } finally {
      await server.close();
    }
  });

  test.each([
    false,
    undefined,
  ])("treats an invoked EXPAND send returning %j as dispatched", async (expandSendResult) => {
    const server = await startPlacementServer({ expandSendResult });
    try {
      const result = await sendCiv7CityExpansion({ cityId, destination }, tunerOptions(server));

      expect(result).toEqual({
        sent: true,
        validation: {
          valid: true,
          result: {
            Success: true,
            Plots: [expansionPlotIndex],
            ConstructibleTypes: [constructibleType],
          },
        },
        before: expansionSnapshot({
          ready: true,
          candidate: { plotIndex: expansionPlotIndex, constructibleType },
          ownership: { status: "unowned" },
        }),
        after: expansionSnapshot({
          ready: false,
          candidate: null,
          ownership: { status: "owned", cityId },
        }),
      });
      expect(server.calls.filter((call) => call.kind === "expand-send")).toEqual([
        {
          kind: "expand-send",
          target: cityId,
          operationType: "EXPAND",
          args: { X: destination.x, Y: destination.y },
        },
      ]);
    } finally {
      await server.close();
    }
  });

  test("rejects a target without aligned constructible evidence without sending", async () => {
    const server = await startPlacementServer({
      expandCanStartResult: {
        Plots: [expansionPlotIndex],
        ConstructibleTypes: [],
      },
    });
    try {
      const result = await sendCiv7CityExpansion({ cityId, destination }, tunerOptions(server));
      expect(result.sent).toBe(false);
      expect(result.before.candidate).toBeNull();
      expect(server.calls.filter((call) => call.kind === "expand-send")).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test("preserves not-dispatched versus dispatched send failures", async () => {
    const beforeServer = await startPlacementServer({
      workerCanStartResult: undefined,
    });
    try {
      await expect(
        sendCiv7WorkerAssignment({ location }, tunerOptions(beforeServer))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
    } finally {
      await beforeServer.close();
    }

    const afterServer = await startPlacementServer({
      expandSendError: new Error("EXPAND send failed"),
    });
    try {
      await expect(
        sendCiv7CityExpansion({ cityId, destination }, tunerOptions(afterServer))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "dispatched",
      });
    } finally {
      await afterServer.close();
    }
  });
});

async function startPlacementServer(
  options: PlacementServerOptions = {}
): Promise<FakePlacementServer> {
  const calls: PlacementCall[] = [];
  const commandExecutions: string[] = [];
  const runtime = {
    ready: true,
    numWorkers: 0,
    expanded: false,
  };
  const city = {
    id: cityId,
    Growth: {
      get isReadyToPlacePopulation() {
        return runtime.ready;
      },
    },
    Workers: {
      GetAllPlacementInfo: () => [
        {
          PlotIndex: location,
          IsBlocked: false,
          NumWorkers: runtime.numWorkers,
          MaxWorkers: 2,
        },
      ],
    },
  };
  const globals = {
    Cities: {
      get: (requestedCityId: unknown) => {
        if (componentIdEqual(requestedCityId, cityId)) return city;
        if (componentIdEqual(requestedCityId, unreadableCityId)) {
          return { Growth: { isReadyToPlacePopulation: false } };
        }
        return null;
      },
    },
    CityCommandTypes: { EXPAND: "EXPAND" },
    GameContext: { localPlayerID: 0 },
    GameplayMap: {
      getIndexFromLocation: (requested: unknown) =>
        JSON.stringify(requested) === JSON.stringify(destination) ? expansionPlotIndex : -1,
      getOwningCityFromXY: () =>
        runtime.expanded
          ? cityId
          : Object.prototype.hasOwnProperty.call(options, "expansionOwnershipBefore")
            ? options.expansionOwnershipBefore
            : null,
    },
    PlayerOperationTypes: { ASSIGN_WORKER: "ASSIGN_WORKER" },
    Players: {
      get: (playerId: unknown) =>
        playerId === 0
          ? {
              Cities: {
                getCityIds: () =>
                  options.includeUnreadableNonReadyCity ? [cityId, unreadableCityId] : [cityId],
              },
            }
          : null,
    },
    Game: {
      PlayerOperations: {
        canStart: (playerId: unknown, operationType: unknown, args: unknown, queue: unknown) => {
          calls.push({
            kind: "worker-can-start",
            target: jsonClone(playerId),
            operationType,
            args: jsonClone(args),
            queue,
          });
          return Object.prototype.hasOwnProperty.call(options, "workerCanStartResult")
            ? options.workerCanStartResult
            : { Success: true };
        },
        sendRequest: (playerId: unknown, operationType: unknown, args: unknown) => {
          calls.push({
            kind: "worker-send",
            target: jsonClone(playerId),
            operationType,
            args: jsonClone(args),
          });
          if (options.workerSendError) throw options.workerSendError;
          runtime.ready = false;
          runtime.numWorkers += 1;
        },
      },
      CityCommands: {
        canStart: (
          requestedCityId: unknown,
          operationType: unknown,
          args: unknown,
          queue: unknown
        ) => {
          calls.push({
            kind: "expand-can-start",
            target: jsonClone(requestedCityId),
            operationType,
            args: jsonClone(args),
            queue,
          });
          if (runtime.expanded) {
            return { Success: false, Plots: [], ConstructibleTypes: [] };
          }
          return Object.prototype.hasOwnProperty.call(options, "expandCanStartResult")
            ? options.expandCanStartResult
            : {
                Success: true,
                Plots: [expansionPlotIndex],
                ConstructibleTypes: [constructibleType],
              };
        },
        sendRequest: (requestedCityId: unknown, operationType: unknown, args: unknown) => {
          calls.push({
            kind: "expand-send",
            target: jsonClone(requestedCityId),
            operationType,
            args: jsonClone(args),
          });
          if (options.expandSendError) throw options.expandSendError;
          runtime.expanded = true;
          runtime.ready = false;
          return options.expandSendResult;
        },
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
    calls,
    commandExecutions,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function workerSnapshot(input: { ready: boolean; numWorkers: number }) {
  return {
    localPlayerId: 0,
    location,
    readyCityIds: input.ready ? [cityId] : [],
    candidateCityId: cityId,
    isReadyToPlacePopulation: input.ready,
    placementInfo: {
      PlotIndex: location,
      IsBlocked: false,
      NumWorkers: input.numWorkers,
      MaxWorkers: 2,
    },
    numWorkers: input.numWorkers,
  };
}

function expansionSnapshot(input: {
  ready: boolean;
  candidate: { plotIndex: number; constructibleType: number } | null;
  ownership:
    | { status: "unowned" }
    | { status: "owned"; cityId: typeof cityId }
    | { status: "unavailable" };
}) {
  return {
    localPlayerId: 0,
    cityId,
    destination,
    plotIndex: expansionPlotIndex,
    isReadyToPlacePopulation: input.ready,
    candidate: input.candidate,
    ownership: input.ownership,
  };
}

function tunerOptions(server: FakePlacementServer) {
  const { port } = server.address();
  return { host: "127.0.0.1", port, timeoutMs: 1_000 };
}

function componentIdEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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

function encodeResponse(listenerId: number, parts: readonly string[]): Buffer {
  const messageBytes = Buffer.from(`${parts.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}
