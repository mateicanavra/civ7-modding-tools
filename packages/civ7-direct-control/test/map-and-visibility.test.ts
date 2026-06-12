import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  NO_RIVER_TYPE,
  RIVER_TYPE_MINOR,
  RIVER_TYPE_NAVIGABLE,
} from "../../civ7-map-policy/src/index.js";
import {
  Civ7MapGridInputSchema,
  Civ7MapGridResultSchema,
  Civ7MapSummaryInputSchema,
  Civ7MapSummaryResultSchema,
  Civ7NativeRiverObjectsInputSchema,
  Civ7NativeRiverObjectsResultSchema,
  Civ7PlotSnapshotInputSchema,
  Civ7PlotSnapshotResultSchema,
  Civ7VisibilitySummaryInputSchema,
  Civ7VisibilitySummaryResultSchema,
  getCiv7GameInfoRows,
  getCiv7MapGrid,
  getCiv7MapSummary,
  getCiv7NativeRiverObjects,
  getCiv7PlotSnapshot,
  getCiv7VisibilitySummary,
  revealCiv7MapForPlayer,
} from "../src/index";
import {
  applyCiv7ExploreGrant,
  defaultExploreSettleMs,
  releaseCiv7ExploreGrant,
} from "../src/play/map/visibility";

type FakeTunerServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

describe("map and visibility reads", () => {
  test("validates map summary schema boundaries beside the read atom", () => {
    expect(Value.Check(Civ7MapSummaryInputSchema, {
      includeAreaRegionCounts: true,
      maxIds: 512,
    })).toBe(true);
    expect(Value.Check(Civ7MapSummaryInputSchema, { maxIds: 1.5 })).toBe(false);
    expect(Value.Check(Civ7MapSummaryInputSchema, { maxIds: -1 })).toBe(false);
    expect(Value.Check(Civ7MapSummaryInputSchema, { maxIds: 1_000_001 })).toBe(false);
    expect(Value.Check(Civ7MapSummaryInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7MapSummaryInputSchema, { port: 4318 })).toBe(false);
    expect(Value.Check(Civ7MapSummaryInputSchema, { state: { role: "tuner" } })).toBe(false);
    expect(Value.Check(Civ7MapSummaryInputSchema, { rawCommand: "GameplayMap.getGridWidth()" })).toBe(false);
    expect(Value.Check(Civ7MapSummaryResultSchema, mapSummaryResult())).toBe(true);
    expect(Value.Check(Civ7MapSummaryResultSchema, {
      ...mapSummaryResult(),
      rawCommand: "GameplayMap.getGridWidth()",
    })).toBe(false);
  });

  test("validates plot snapshot schema boundaries beside the read atom", () => {
    expect(Value.Check(Civ7PlotSnapshotInputSchema, {
      x: 3,
      y: 4,
      playerId: 0,
      fields: ["terrain", "resource", "visibility"],
      includeHidden: false,
    })).toBe(true);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: 1.5, y: 4 })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: -1, y: 4 })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: 3, y: 1_000_001 })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: 3, y: 4, fields: ["enemy"] })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: 3, y: 4, host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: 3, y: 4, port: 4318 })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: 3, y: 4, state: { role: "tuner" } })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, {
      x: 3,
      y: 4,
      rawCommand: "GameplayMap.getTerrainType(3, 4)",
    })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotResultSchema, plotSnapshotResult())).toBe(true);
    expect(Value.Check(Civ7PlotSnapshotResultSchema, {
      ...plotSnapshotResult(),
      session: { stateName: "Tuner" },
    })).toBe(false);
  });

  test("validates map grid schema boundaries beside the read atom", () => {
    expect(Value.Check(Civ7MapGridInputSchema, {
      bounds: { x: 0, y: 0, width: 2, height: 1 },
      fields: ["terrain"],
      maxPlots: 1,
    })).toBe(true);
    expect(Value.Check(Civ7MapGridInputSchema, {
      locations: [{ x: 0, y: 0 }],
      fields: ["terrain"],
    })).toBe(true);
    expect(Value.Check(Civ7MapGridInputSchema, { fields: ["terrain"] })).toBe(false);
    expect(Value.Check(Civ7MapGridInputSchema, {
      bounds: { x: 0, y: 0, width: 2, height: 1 },
      locations: [{ x: 0, y: 0 }],
      fields: ["terrain"],
    })).toBe(false);
    expect(Value.Check(Civ7MapGridInputSchema, {
      bounds: { x: 0, y: 0, width: 0, height: 1 },
      fields: ["terrain"],
    })).toBe(false);
    expect(Value.Check(Civ7MapGridInputSchema, {
      bounds: { x: 0, y: 0, width: 2, height: 10_001 },
      fields: ["terrain"],
    })).toBe(false);
    expect(Value.Check(Civ7MapGridInputSchema, {
      locations: [{ x: 0, y: 1_000_001 }],
      fields: ["terrain"],
    })).toBe(false);
    expect(Value.Check(Civ7MapGridInputSchema, {
      bounds: { x: 0, y: 0, width: 2, height: 1 },
      fields: ["enemy"],
    })).toBe(false);
    expect(Value.Check(Civ7MapGridInputSchema, {
      bounds: { x: 0, y: 0, width: 2, height: 1 },
      fields: ["terrain"],
      maxPlots: 10_001,
    })).toBe(false);
    expect(Value.Check(Civ7MapGridInputSchema, {
      bounds: { x: 0, y: 0, width: 2, height: 1 },
      fields: ["terrain"],
      host: "127.0.0.1",
    })).toBe(false);
    expect(Value.Check(Civ7MapGridInputSchema, {
      bounds: { x: 0, y: 0, width: 2, height: 1 },
      fields: ["terrain"],
      rawCommand: "GameplayMap.getGridWidth()",
    })).toBe(false);
    expect(Value.Check(Civ7MapGridResultSchema, mapGridResult())).toBe(true);
    expect(Value.Check(Civ7MapGridResultSchema, {
      ...mapGridResult(),
      session: { stateName: "Tuner" },
    })).toBe(false);
  });

  test("validates native river object schema boundaries beside the read atom", () => {
    expect(Value.Check(Civ7NativeRiverObjectsInputSchema, { maxSamples: 16 })).toBe(true);
    expect(Value.Check(Civ7NativeRiverObjectsInputSchema, { maxSamples: 16, maxPlotsPerRiver: 128 })).toBe(true);
    expect(Value.Check(Civ7NativeRiverObjectsInputSchema, {})).toBe(true);
    expect(Value.Check(Civ7NativeRiverObjectsInputSchema, { maxSamples: -1 })).toBe(false);
    expect(Value.Check(Civ7NativeRiverObjectsInputSchema, { maxSamples: 257 })).toBe(false);
    expect(Value.Check(Civ7NativeRiverObjectsInputSchema, { maxSamples: 1.5 })).toBe(false);
    expect(Value.Check(Civ7NativeRiverObjectsInputSchema, { maxPlotsPerRiver: 2049 })).toBe(false);
    expect(Value.Check(Civ7NativeRiverObjectsInputSchema, { command: "MapRivers.numRivers()" })).toBe(false);
    expect(Value.Check(Civ7NativeRiverObjectsResultSchema, nativeRiverObjectsResult())).toBe(true);
    expect(Value.Check(Civ7NativeRiverObjectsResultSchema, {
      ...nativeRiverObjectsResult(),
      rawCommand: "MapRivers.numRivers()",
    })).toBe(false);
  });

  test("validates visibility summary schema boundaries beside the read atom", () => {
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, {
      playerId: 0,
      bounds: { x: 0, y: 0, width: 2, height: 1 },
      includeGrid: true,
      maxPlots: 2,
    })).toBe(true);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, { playerId: 0 })).toBe(true);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, { playerId: 1.5 })).toBe(false);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, { playerId: -1 })).toBe(false);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, { playerId: 1_025 })).toBe(false);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, {
      playerId: 0,
      includeGrid: true,
    })).toBe(false);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, {
      playerId: 0,
      bounds: { x: 0, y: 0, width: 0, height: 1 },
      includeGrid: true,
    })).toBe(false);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, {
      playerId: 0,
      bounds: { x: 0, y: 0, width: 2, height: 1 },
      maxPlots: 10_001,
    })).toBe(false);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, { playerId: 0, host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, { playerId: 0, rawCommand: "Visibility.revealAllPlots(0)" })).toBe(false);
    expect(Value.Check(Civ7VisibilitySummaryResultSchema, visibilitySummaryResult())).toBe(true);
    expect(Value.Check(Civ7VisibilitySummaryResultSchema, {
      ...visibilitySummaryResult(),
      command: "Visibility.revealAllPlots(0)",
    })).toBe(false);
  });

  test("wraps bounded Tuner map and plot reads", async () => {
    const server = await startMapTunerServer();
    try {
      const { port } = server.address();
      const summary = await getCiv7MapSummary({
        host: "127.0.0.1",
        port,
        includeAreaRegionCounts: true,
        timeoutMs: 1_000,
      });
      const plot = await getCiv7PlotSnapshot(
        { x: 3, y: 4, playerId: 0, fields: ["terrain", "resource", "hydrology", "visibility"] },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(summary.map.width).toEqual({ ok: true, value: 84 });
      expect(summary.areas?.areaIds).toEqual({ ok: true, value: [1, 2] });
      expect(plot).toMatchObject({
        state: { id: "1", name: "Tuner" },
        location: { x: 3, y: 4, index: { ok: true, value: 339 } },
        hiddenInfoPolicy: "visibility-filtered",
        facts: {
          terrain: { ok: true, value: 4 },
          resource: { ok: true, value: -1 },
          riverType: { ok: true, value: NO_RIVER_TYPE },
          river: { ok: true, value: false },
          navigableRiver: { ok: true, value: false },
          water: { ok: true, value: false },
          lake: { ok: true, value: false },
        },
      });
    } finally {
      await server.close();
    }
  });

  test("caps bounded map grid iteration before Civ-side traversal", async () => {
    const server = await startMapTunerServer();
    try {
      const { port } = server.address();
      const grid = await getCiv7MapGrid(
        {
          bounds: { x: 0, y: 0, width: 10_000, height: 10_000 },
          fields: ["terrain"],
          maxPlots: 1,
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(grid.plotCount).toBe(100_000_000);
      expect(grid.omitted).toBe(99_999_999);
      expect(server.received.some((message) => message.includes("break outer"))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("wraps bounded native MapRivers object reads", async () => {
    const server = await startMapTunerServer();
    try {
      const { port } = server.address();
      const nativeRivers = await getCiv7NativeRiverObjects(
        { maxSamples: 2 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(nativeRivers).toMatchObject({
        exists: true,
        numRivers: { ok: true, value: 2 },
        samples: [
          {
            index: 0,
            riverType: { ok: true, value: RIVER_TYPE_NAVIGABLE },
            plotCount: { ok: true, value: 4 },
            plotSampleCount: 4,
            plotTruncated: false,
            plots: {
              ok: true,
              value: [
                { raw: 1, index: 1, location: { x: 1, y: 0 } },
                { raw: 3, index: 3, location: { x: 3, y: 0 } },
                { raw: 5, index: 5, location: { x: 5, y: 0 } },
                { raw: 7, index: 7, location: { x: 7, y: 0 } },
              ],
            },
            connectedToOcean: { ok: true, value: true },
          },
          {
            index: 1,
            riverType: { ok: true, value: RIVER_TYPE_MINOR },
            plotCount: { ok: true, value: 2 },
            plotSampleCount: 2,
            plotTruncated: false,
            plots: {
              ok: true,
              value: [
                { raw: 2, index: 2, location: { x: 2, y: 0 } },
                { raw: 4, index: 4, location: { x: 4, y: 0 } },
              ],
            },
            connectedToOcean: { ok: true, value: false },
          },
        ],
        truncated: false,
      });
      expect(server.received.some((message) => message.includes("MapRivers.numRivers"))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("wraps visibility, reveal, and GameInfo reads with contracts", async () => {
    const server = await startMapTunerServer();
    try {
      const { port } = server.address();
      const visibility = await getCiv7VisibilitySummary(
        {
          playerId: 0,
          bounds: { x: 0, y: 0, width: 2, height: 1 },
          includeGrid: true,
        },
        {
          host: "127.0.0.1",
          port,
          timeoutMs: 1_000,
        }
      );
      const reveal = await revealCiv7MapForPlayer(
        { playerId: 0, disposableSession: true },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );
      const resources = await getCiv7GameInfoRows(
        { table: "Resources", limit: 2 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(visibility.numPlotsRevealed).toEqual({ ok: true, value: 10 });
      expect(visibility.grid?.states).toHaveLength(2);
      expect(reveal.classification).toBe("revealed");
      expect(resources.rows).toEqual([{ ResourceType: "RESOURCE_COTTON" }]);
      await expect(
        getCiv7GameInfoRows(
          { table: "Resources;DROP" },
          { host: "127.0.0.1", port, timeoutMs: 1_000 }
        )
      ).rejects.toMatchObject({ code: "command-failed" });
    } finally {
      await server.close();
    }
  });
});


describe("explore grant atoms", () => {
  function grantDependencies(overrides: Partial<Record<string, unknown>> = {}) {
    const commands: string[] = [];
    const dependencies = {
      boundedInteger: (value: number, min: number, max: number, label: string) => {
        if (!Number.isInteger(value) || value < min || value > max) {
          throw new Error(`${label} must be an integer between ${min} and ${max}`);
        }
        return value;
      },
      executeTunerCommand: async ({ command }: { command: string }) => {
        commands.push(command);
        if (command.includes("setTrackedVisibilityGrant")) {
          return tunerResult({ grantId: 1, grantedPlots: 6996, plotCount: 6996 });
        }
        return tunerResult({ released: true });
      },
      parseExploreGrant: (result: { output: string[] }) => JSON.parse(result.output[0] ?? "{}"),
      parseExploreRelease: (result: { output: string[] }) => JSON.parse(result.output[0] ?? "{}"),
      validatePlayerId: (playerId: number) => playerId,
      ...overrides,
    };
    return { commands, dependencies };
  }

  function tunerResult(payload: unknown) {
    return {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "1", name: "Tuner" },
      output: [JSON.stringify(payload)],
    };
  }

  test("applyCiv7ExploreGrant issues one tracked-grant exec and parses the payload", async () => {
    const { commands, dependencies } = grantDependencies();
    const result = await applyCiv7ExploreGrant(
      { playerId: 0 },
      {},
      dependencies as never,
    );
    expect(commands).toHaveLength(1);
    expect(commands[0]).toContain("Visibility.setTrackedVisibilityGrant(playerId, 1, plots)");
    expect(commands[0]).toContain("GameplayMap.getIndexFromXY(x, y)");
    expect(result).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
      state: { id: "1", name: "Tuner" },
      grantId: 1,
      grantedPlots: 6996,
      plotCount: 6996,
    });
  });

  test("releaseCiv7ExploreGrant issues one removeTrackedVisibilityGrant exec", async () => {
    const { commands, dependencies } = grantDependencies();
    const result = await releaseCiv7ExploreGrant(
      { playerId: 0, grantId: 1 },
      {},
      dependencies as never,
    );
    expect(commands).toHaveLength(1);
    expect(commands[0]).toContain("Visibility.removeTrackedVisibilityGrant(0, 1)");
    expect(result).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
      state: { id: "1", name: "Tuner" },
      released: true,
    });
  });

  test("releaseCiv7ExploreGrant rejects non-integer grant ids before any exec", async () => {
    const { commands, dependencies } = grantDependencies();
    await expect(
      releaseCiv7ExploreGrant(
        { playerId: 0, grantId: 1.5 },
        {},
        dependencies as never,
      ),
    ).rejects.toThrow(/grantId/);
    expect(commands).toHaveLength(0);
  });

  test("settle default scales with map size and is clamped", () => {
    expect(defaultExploreSettleMs(6996)).toBe(69_960);
    expect(defaultExploreSettleMs(100)).toBe(15_000);
    expect(defaultExploreSettleMs(50_000)).toBe(120_000);
  });
});

async function startMapTunerServer(): Promise<FakeTunerServer> {
  const received: string[] = [];
  let revealedCount = 10;
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
        } else if (frame.message.includes("MapRegions") && frame.message.includes("randomSeed")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(mapSummaryPayload())]));
        } else if (frame.message.includes("locationsFromBounds")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(mapGridPayload())]));
        } else if (frame.message.includes("MapRivers") && frame.message.includes("numRivers")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(nativeRiverObjectsPayload())]));
        } else if (frame.message.includes("readPlotSnapshot")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(plotSnapshotPayload())]));
        } else if (frame.message === "CMD:1:Visibility.revealAllPlots(0)") {
          revealedCount = 20;
          socket.write(encodeResponse(frame.listenerId, ["true"]));
        } else if (frame.message.includes("getPlotsRevealedCount")) {
          socket.write(
            encodeResponse(frame.listenerId, [JSON.stringify(visibilityPayload(revealedCount))])
          );
        } else if (
          frame.message.includes("GameInfo[input.table]") &&
          !frame.message.includes("Resources;DROP")
        ) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(gameInfoPayload())]));
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

function mapSummaryResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    ...mapSummaryPayload(),
  };
}

function plotSnapshotResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    ...plotSnapshotPayload(),
  };
}

function mapGridResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    ...mapGridPayload(),
  };
}

function nativeRiverObjectsResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    ...nativeRiverObjectsPayload(),
  };
}

function visibilitySummaryResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    ...visibilityPayload(10),
  };
}

function mapSummaryPayload() {
  return {
    map: {
      width: { ok: true, value: 84 },
      height: { ok: true, value: 54 },
      plotCount: { ok: true, value: 4536 },
      mapSize: { ok: true, value: 0 },
      randomSeed: { ok: true, value: 111 },
    },
    game: {
      turn: { ok: true, value: 1 },
      age: { ok: true, value: 0 },
      maxTurns: { ok: true, value: 0 },
      turnDate: { ok: true, value: "4000 BCE" },
      hash: { ok: true, value: 0 },
    },
    areas: {
      areaIds: { ok: true, value: [1, 2] },
      regionIds: { ok: true, value: [7] },
      truncated: false,
    },
  };
}

function mapGridPayload() {
  return {
    bounds: { x: 0, y: 0, width: 10_000, height: 10_000 },
    fields: ["terrain"],
    plotCount: 100_000_000,
    omitted: 99_999_999,
    hiddenInfoPolicy: "not-player-scoped",
    map: { width: { ok: true, value: 84 }, height: { ok: true, value: 54 } },
    plots: [
      {
        location: { x: 0, y: 0, index: { ok: true, value: 0 } },
        hiddenInfoPolicy: "not-player-scoped",
        facts: { terrain: { ok: true, value: 4 } },
      },
    ],
  };
}

function plotSnapshotPayload() {
  return {
    location: { x: 3, y: 4, index: { ok: true, value: 339 } },
    revealedState: { ok: true, value: 1 },
    visible: { ok: true, value: true },
    hiddenInfoPolicy: "visibility-filtered",
    facts: {
      terrain: { ok: true, value: 4 },
      resource: { ok: true, value: -1 },
      riverType: { ok: true, value: NO_RIVER_TYPE },
      river: { ok: true, value: false },
      navigableRiver: { ok: true, value: false },
      water: { ok: true, value: false },
      lake: { ok: true, value: false },
      revealedState: { ok: true, value: 1 },
      visible: { ok: true, value: true },
    },
  };
}

function nativeRiverObjectsPayload() {
  return {
    exists: true,
    numRivers: { ok: true, value: 2 },
    samples: [
      {
        index: 0,
        riverType: { ok: true, value: RIVER_TYPE_NAVIGABLE },
        plotCount: { ok: true, value: 4 },
        plotSampleCount: 4,
        plotTruncated: false,
        plots: {
          ok: true,
          value: [
            { raw: 1, index: 1, location: { x: 1, y: 0 } },
            { raw: 3, index: 3, location: { x: 3, y: 0 } },
            { raw: 5, index: 5, location: { x: 5, y: 0 } },
            { raw: 7, index: 7, location: { x: 7, y: 0 } },
          ],
        },
        connectedToOcean: { ok: true, value: true },
      },
      {
        index: 1,
        riverType: { ok: true, value: RIVER_TYPE_MINOR },
        plotCount: { ok: true, value: 2 },
        plotSampleCount: 2,
        plotTruncated: false,
        plots: {
          ok: true,
          value: [
            { raw: 2, index: 2, location: { x: 2, y: 0 } },
            { raw: 4, index: 4, location: { x: 4, y: 0 } },
          ],
        },
        connectedToOcean: { ok: true, value: false },
      },
    ],
    truncated: false,
  };
}

function visibilityPayload(revealedCount: number) {
  return {
    playerId: 0,
    numPlotsRevealed: { ok: true, value: revealedCount },
    numPlotsVisible: { ok: true, value: revealedCount },
    mapPlotCount: { ok: true, value: revealedCount },
    counts: { "1": 2 },
    grid: {
      bounds: { x: 0, y: 0, width: 2, height: 1 },
      plotCount: 2,
      omitted: 0,
      states: [
        {
          x: 0,
          y: 0,
          state: { ok: true, value: 1 },
          visible: { ok: true, value: true },
        },
        {
          x: 1,
          y: 0,
          state: { ok: true, value: 1 },
          visible: { ok: true, value: true },
        },
      ],
    },
  };
}

function gameInfoPayload() {
  return {
    table: "Resources",
    source: "GameInfo",
    rows: [{ ResourceType: "RESOURCE_COTTON" }],
    limit: 2,
    offset: 0,
    total: { ok: true, value: 1 },
    omittedUnknown: false,
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
