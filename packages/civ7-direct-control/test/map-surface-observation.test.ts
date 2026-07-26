import { createServer, type Socket } from "node:net";
import { describe, expect, test } from "vitest";

import {
  Civ7DirectControlSession,
  getCiv7FullMapGrid,
  getCiv7MapSurfaceObservation,
} from "../src/index.js";

type PlotFixture =
  | "missing"
  | "complete"
  | "coordinate-index-mismatch"
  | "duplicate-index"
  | "out-of-range-index";

type ObservationServerOptions = Readonly<{
  finalGameHash?: number;
  finalRandomSeed?: number;
  gridMapWidth?: number;
  nativeStateId?: string;
  plots?: PlotFixture;
}>;

type ObservationServer = Readonly<{
  port: number;
  received: ReadonlyArray<string>;
  connections: () => number;
  close: () => Promise<void>;
}>;

type GridBounds = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

describe("Civ7 map-surface observation", () => {
  test("standalone full-grid reads ordered chunks over one physical connection epoch", async () => {
    const server = await startObservationServer({ plots: "complete" });
    try {
      const grid = await getCiv7FullMapGrid(
        {
          fields: ["terrain"],
          maxPlotsPerRead: 2,
        },
        {
          host: "127.0.0.1",
          port: server.port,
          timeoutMs: 1_000,
        }
      );

      expect(grid.plots).toHaveLength(4);
      expect(grid.chunks).toEqual([
        {
          bounds: { x: 0, y: 0, width: 2, height: 1 },
          plotCount: 2,
          omitted: 0,
        },
        {
          bounds: { x: 0, y: 1, width: 2, height: 1 },
          plotCount: 2,
          omitted: 0,
        },
      ]);
      expect(grid.identityCheck).toMatchObject({
        stable: true,
        connectionEpoch: 1,
        checked: expect.arrayContaining(["wire.connectionEpoch"]),
      });
      expect(server.connections()).toBe(1);
      const commands = commandMessages(server.received);
      expect(commands).toHaveLength(4);
      expect(
        commands.filter((command) => command.includes("locationsFromBounds")).map(gridBounds)
      ).toEqual([
        { x: 0, y: 0, width: 2, height: 1 },
        { x: 0, y: 1, width: 2, height: 1 },
      ]);
    } finally {
      await server.close();
    }
  });

  test("refuses a same-endpoint same-state reconnect on the second grid chunk", async () => {
    const server = await startObservationServer({ plots: "complete" });
    const session = new Civ7DirectControlSession({
      host: "127.0.0.1",
      port: server.port,
      timeoutMs: 1_000,
    });
    let gridReads = 0;
    retireSessionAfterCommand(session, (command) => {
      if (!command.includes("locationsFromBounds")) return false;
      gridReads += 1;
      return gridReads === 1;
    });

    try {
      await expect(
        getCiv7FullMapGrid(
          {
            fields: ["terrain"],
            maxPlotsPerRead: 2,
          },
          { session }
        )
      ).rejects.toThrow(
        "Civ7 full-grid physical connection epoch changed during map-grid chunk: 1 -> 2"
      );

      expect(server.connections()).toBe(2);
      expect(session.connectionEpoch).toBe(2);
      expect(
        commandMessages(server.received)
          .filter((command) => command.includes("locationsFromBounds"))
          .map(gridBounds)
      ).toEqual([
        { x: 0, y: 0, width: 2, height: 1 },
        { x: 0, y: 1, width: 2, height: 1 },
      ]);
    } finally {
      await session.close();
      await server.close();
    }
  });

  test("owns one session and preserves missing plots in the row-major shape", async () => {
    const server = await startObservationServer({ plots: "missing" });
    try {
      const observation = await getCiv7MapSurfaceObservation(
        {
          fullGrid: {
            fields: ["terrain"],
            includeHidden: true,
            maxPlotsPerRead: 4,
          },
          nativeRiverObjects: { maxSamples: 0 },
        },
        {
          host: "127.0.0.1",
          port: server.port,
          timeoutMs: 1_000,
        }
      );

      expect(server.connections()).toBe(1);
      expect(commandMessages(server.received)).toHaveLength(5);
      expect(commandMessages(server.received)[0]).toContain("randomSeed");
      expect(commandMessages(server.received)[1]).toContain("locationsFromBounds");
      expect(commandMessages(server.received)[2]).toContain("randomSeed");
      expect(commandMessages(server.received)[3]).toContain("MapRivers.numRivers");
      expect(commandMessages(server.received)[4]).toContain("randomSeed");

      expect(observation.identity).toEqual({
        stable: true,
        checked: [
          "wire.connectionEpoch",
          "wire.endpoint.host",
          "wire.endpoint.port",
          "wire.tunerState.id",
          "wire.tunerState.name",
          "map.width",
          "map.height",
          "map.plotCount",
          "map.randomSeed",
          "game.turn",
        ],
        wire: {
          connectionEpoch: 1,
          endpoint: {
            host: "127.0.0.1",
            port: server.port,
          },
          tunerState: { id: "1", name: "Tuner" },
        },
        map: {
          width: 2,
          height: 2,
          plotCount: 4,
          randomSeed: 111,
        },
        game: {
          turn: 1,
        },
      });
      expect(observation.surface).toMatchObject({
        width: 2,
        height: 2,
        plotCount: 4,
        observedPlotCount: 2,
        missingPlotIndices: [1, 2],
      });
      expect(observation.surface.plotsByIndex.map((plot) => plot?.location.index ?? null)).toEqual([
        { ok: true, value: 0 },
        null,
        null,
        { ok: true, value: 3 },
      ]);
      expect(observation.nativeRiverObjects).toMatchObject({
        exists: true,
        numRivers: { ok: true, value: 0 },
      });
    } finally {
      await server.close();
    }
  });

  test("refuses a same-endpoint same-state reconnect across the aggregate window", async () => {
    const server = await startObservationServer({ plots: "complete" });
    const session = new Civ7DirectControlSession({
      host: "127.0.0.1",
      port: server.port,
      timeoutMs: 1_000,
    });
    let summaryReads = 0;
    retireSessionAfterCommand(session, (command) => {
      if (!command.includes("randomSeed") || !command.includes("const map =")) return false;
      summaryReads += 1;
      return summaryReads === 2;
    });

    try {
      await expect(
        getCiv7MapSurfaceObservation(
          {
            fullGrid: {
              fields: ["terrain"],
              maxPlotsPerRead: 2,
            },
          },
          { session }
        )
      ).rejects.toThrow(
        "Civ7 map-surface observation physical connection epoch changed during native-river read: 1 -> 2"
      );

      expect(server.connections()).toBe(2);
      expect(session.connectionEpoch).toBe(2);
    } finally {
      await session.close();
      await server.close();
    }
  });

  test("reuses and does not close a caller-owned session", async () => {
    const server = await startObservationServer({ plots: "complete" });
    const session = new Civ7DirectControlSession({
      host: "127.0.0.1",
      port: server.port,
      timeoutMs: 1_000,
    });
    try {
      await getCiv7MapSurfaceObservation(
        {
          fullGrid: {
            fields: ["terrain"],
            maxPlotsPerRead: 4,
          },
        },
        { session }
      );

      expect(server.connections()).toBe(1);
      expect(session.endpoint).toEqual({ host: "127.0.0.1", port: server.port });
    } finally {
      await session.close();
      await server.close();
    }
  });

  test("refuses a duplicate plot index instead of silently overwriting it", async () => {
    const server = await startObservationServer({ plots: "duplicate-index" });
    try {
      await expect(
        getCiv7MapSurfaceObservation(
          {
            fullGrid: {
              fields: ["terrain"],
              maxPlotsPerRead: 4,
            },
          },
          { host: "127.0.0.1", port: server.port, timeoutMs: 1_000 }
        )
      ).rejects.toThrow("duplicate plot index 0");
    } finally {
      await server.close();
    }
  });

  test("refuses an out-of-range plot index instead of admitting it into the shape", async () => {
    const server = await startObservationServer({ plots: "out-of-range-index" });
    try {
      await expect(
        getCiv7MapSurfaceObservation(
          {
            fullGrid: {
              fields: ["terrain"],
              maxPlotsPerRead: 4,
            },
          },
          { host: "127.0.0.1", port: server.port, timeoutMs: 1_000 }
        )
      ).rejects.toThrow("plot index 4 is outside the verified range 0..3");
    } finally {
      await server.close();
    }
  });

  test("refuses a plot whose index disagrees with its row-major location", async () => {
    const server = await startObservationServer({ plots: "coordinate-index-mismatch" });
    try {
      await expect(
        getCiv7MapSurfaceObservation(
          {
            fullGrid: {
              fields: ["terrain"],
              maxPlotsPerRead: 4,
            },
          },
          { host: "127.0.0.1", port: server.port, timeoutMs: 1_000 }
        )
      ).rejects.toThrow("plot index 0 does not match row-major location index 1");
    } finally {
      await server.close();
    }
  });

  test("refuses map-dimension drift exposed by an intermediate grid chunk", async () => {
    const server = await startObservationServer({
      gridMapWidth: 3,
      plots: "complete",
    });
    try {
      await expect(
        getCiv7FullMapGrid(
          {
            fields: ["terrain"],
            maxPlotsPerRead: 4,
          },
          { host: "127.0.0.1", port: server.port, timeoutMs: 1_000 }
        )
      ).rejects.toThrow("Civ7 full-grid identity changed during read: map.width 2 -> 3");
    } finally {
      await server.close();
    }
  });

  test("refuses map identity drift after the native-river read", async () => {
    const server = await startObservationServer({
      finalRandomSeed: 222,
      plots: "complete",
    });
    try {
      await expect(
        getCiv7MapSurfaceObservation(
          {
            fullGrid: {
              fields: ["terrain"],
              maxPlotsPerRead: 4,
            },
          },
          { host: "127.0.0.1", port: server.port, timeoutMs: 1_000 }
        )
      ).rejects.toThrow("Civ7 map-surface observation identity changed: map.randomSeed 111 -> 222");

      const commands = commandMessages(server.received);
      expect(commands.findIndex((command) => command.includes("MapRivers.numRivers"))).toBe(3);
      expect(commands[4]).toContain("randomSeed");
      expect(server.connections()).toBe(1);
    } finally {
      await server.close();
    }
  });

  test("retains the raw no-argument game hash without treating it as identity", async () => {
    const server = await startObservationServer({
      finalGameHash: 8,
      plots: "complete",
    });
    try {
      const observation = await getCiv7MapSurfaceObservation(
        {
          fullGrid: {
            fields: ["terrain"],
            maxPlotsPerRead: 4,
          },
        },
        { host: "127.0.0.1", port: server.port, timeoutMs: 1_000 }
      );

      expect(observation.identity.game).toEqual({ turn: 1 });
      expect(observation.finalSummary.game.hash).toEqual({ ok: true, value: 8 });
    } finally {
      await server.close();
    }
  });

  test("refuses native-river Tuner-state identity drift", async () => {
    const server = await startObservationServer({
      nativeStateId: "2",
      plots: "complete",
    });
    try {
      await expect(
        getCiv7MapSurfaceObservation(
          {
            fullGrid: {
              fields: ["terrain"],
              maxPlotsPerRead: 4,
            },
          },
          { host: "127.0.0.1", port: server.port, timeoutMs: 1_000 }
        )
      ).rejects.toThrow("Civ7 map-surface observation identity changed: wire.tunerState.id 1 -> 2");
    } finally {
      await server.close();
    }
  });
});

function commandMessages(received: ReadonlyArray<string>): ReadonlyArray<string> {
  return received.filter((message) => message.startsWith("CMD:"));
}

function retireSessionAfterCommand(
  session: Civ7DirectControlSession,
  shouldRetire: (command: string) => boolean
): void {
  const executeCommand = session.executeCommand.bind(session);
  session.executeCommand = async (options) => {
    const result = await executeCommand(options);
    if (shouldRetire(options.command)) await session.resetConnection();
    return result;
  };
}

async function startObservationServer(
  options: ObservationServerOptions = {}
): Promise<ObservationServer> {
  const received: string[] = [];
  const sockets = new Set<Socket>();
  let connections = 0;
  let stateReads = 0;
  let summaryReads = 0;

  const server = createServer((socket) => {
    connections += 1;
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.on("error", () => {});
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const frame = parseRequest(buffer);
        if (!frame) return;
        buffer = buffer.subarray(frame.bytesRead);
        received.push(frame.message);

        if (frame.message === "LSQ:") {
          stateReads += 1;
          const stateId = options.nativeStateId && stateReads === 4 ? options.nativeStateId : "1";
          socket.write(encodeResponse(frame.listenerId, [stateId, "Tuner"]));
          continue;
        }
        if (frame.message.includes("locationsFromBounds")) {
          const bounds = gridBounds(frame.message);
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify(
                mapGridPayload(options.plots ?? "complete", bounds, options.gridMapWidth ?? 2)
              ),
            ])
          );
          continue;
        }
        if (frame.message.includes("MapRivers") && frame.message.includes("numRivers")) {
          socket.write(
            encodeResponse(frame.listenerId, [JSON.stringify(nativeRiverObjectsPayload())])
          );
          continue;
        }
        if (frame.message.includes("randomSeed") && frame.message.includes("const map =")) {
          summaryReads += 1;
          const randomSeed = summaryReads === 3 ? (options.finalRandomSeed ?? 111) : 111;
          const gameHash = summaryReads === 3 ? (options.finalGameHash ?? 7) : 7;
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify(mapSummaryPayload(randomSeed, gameHash)),
            ])
          );
          continue;
        }
        socket.write(encodeResponse(frame.listenerId, ["null"]));
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => reject(error);
    server.once("error", onError);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", onError);
      resolve();
    });
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Observation test server did not bind a TCP port");
  }

  return {
    port: address.port,
    received,
    connections: () => connections,
    close: async () => {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    },
  };
}

function mapSummaryPayload(randomSeed: number, gameHash: number) {
  return {
    map: {
      width: { ok: true, value: 2 },
      height: { ok: true, value: 2 },
      plotCount: { ok: true, value: 4 },
      mapSize: { ok: true, value: 0 },
      mapSizeType: { ok: true, value: "MAPSIZE_DUEL" },
      randomSeed: { ok: true, value: randomSeed },
    },
    game: {
      turn: { ok: true, value: 1 },
      age: { ok: true, value: 0 },
      maxTurns: { ok: true, value: 0 },
      turnDate: { ok: true, value: "4000 BCE" },
      hash: { ok: true, value: gameHash },
    },
  };
}

function mapGridPayload(plots: PlotFixture, bounds: GridBounds, mapWidth: number) {
  return {
    bounds,
    fields: ["terrain"],
    plotCount: bounds.width * bounds.height,
    omitted: 0,
    hiddenInfoPolicy: "not-player-scoped",
    map: {
      width: { ok: true, value: mapWidth },
      height: { ok: true, value: 2 },
    },
    plots: plotPayloads(plots).filter(
      (plot) =>
        plot.location.x >= bounds.x &&
        plot.location.x < bounds.x + bounds.width &&
        plot.location.y >= bounds.y &&
        plot.location.y < bounds.y + bounds.height
    ),
  };
}

function gridBounds(command: string): GridBounds {
  const match = command.match(/^\s*const input = ([^\n]+);$/m);
  if (!match?.[1]) throw new Error("Map-grid command did not contain serialized input");
  const input = JSON.parse(match[1]) as { bounds?: GridBounds };
  if (!input.bounds) throw new Error("Map-grid command did not contain bounds");
  return input.bounds;
}

function plotPayloads(plots: PlotFixture) {
  const plot = (x: number, y: number, index: number) => ({
    location: { x, y, index: { ok: true, value: index } },
    hiddenInfoPolicy: "not-player-scoped",
    facts: { terrain: { ok: true, value: index + 10 } },
  });
  switch (plots) {
    case "missing":
      return [plot(0, 0, 0), plot(1, 1, 3)];
    case "duplicate-index":
      return [plot(0, 0, 0), plot(0, 0, 0)];
    case "coordinate-index-mismatch":
      return [plot(1, 0, 0)];
    case "out-of-range-index":
      return [plot(0, 0, 4)];
    case "complete":
      return [plot(0, 0, 0), plot(1, 0, 1), plot(0, 1, 2), plot(1, 1, 3)];
  }
}

function nativeRiverObjectsPayload() {
  return {
    exists: true,
    numRivers: { ok: true, value: 0 },
    samples: [],
    truncated: false,
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

function encodeResponse(listenerId: number, parts: ReadonlyArray<string>): Buffer {
  const messageBytes = Buffer.from(`${parts.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}
