import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7MapGridInputSchema,
  Civ7MapGridResultSchema,
  Civ7MapSummaryInputSchema,
  Civ7MapSummaryResultSchema,
  Civ7PlotSnapshotInputSchema,
  Civ7PlotSnapshotResultSchema,
  Civ7VisibilitySummaryInputSchema,
  Civ7VisibilitySummaryResultSchema,
  getCiv7GameInfoRows,
  getCiv7MapGrid,
  getCiv7MapSummary,
  getCiv7PlotSnapshot,
  getCiv7VisibilitySummary,
  revealCiv7MapForPlayer,
} from "../src/index";
import { defaultExploreSettleMs, exploreCiv7MapForPlayer } from "../src/play/map/visibility";

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
        { x: 3, y: 4, playerId: 0, fields: ["terrain", "resource", "visibility"] },
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


describe("explore map for player", () => {
  function exploreDependencies(overrides: Partial<Record<string, unknown>> = {}) {
    const calls: string[] = [];
    const summaries = [
      { revealed: 29, visible: 7 },
      { revealed: 6996, visible: 7 },
    ];
    // First purge finds the suppressed discovery displays; later purges are empty.
    const purges = [
      {
        closed: [
          { category: "Cinematic", closed: 7 },
          { category: "UnlockPopup", closed: 1 },
        ],
        closedTotal: 8,
      },
    ];
    const dependencies = {
      boundedInteger: (value: number) => value,
      defaultMapGridMaxPlots: 4096,
      executeTunerCommand: async ({ command }: { command: string }) => {
        if (command.includes("setTrackedVisibilityGrant")) {
          calls.push("grant");
          return tunerResult({ grantId: 1, grantedPlots: 6996, plotCount: 6996 });
        }
        calls.push("release");
        return tunerResult({ released: true });
      },
      hardMapGridMaxPlots: 100_000_000,
      jsLiteral: (value: unknown) => JSON.stringify(value),
      parseVisibilitySummary: () => {
        throw new Error("unused in explore tests");
      },
      probeHelperSource: () => "",
      validateMapBounds: () => undefined,
      validatePlayerId: (playerId: number) => playerId,
      getVisibilitySummary: async () => {
        calls.push("summary");
        const next = summaries.shift() ?? { revealed: 6996, visible: 7 };
        return {
          host: "127.0.0.1",
          port: 4318,
          state: { id: "1", name: "Tuner" },
          playerId: 0,
          numPlotsRevealed: { ok: true, value: next.revealed },
          numPlotsVisible: { ok: true, value: next.visible },
          counts: {},
        };
      },
      probeValue: <T,>(probe: { ok: boolean; value?: T }) => (probe.ok ? probe.value : undefined),
      closeDisplays: async () => {
        calls.push("close");
        const next = purges.shift() ?? { closed: [], closedTotal: 0 };
        return {
          host: "127.0.0.1",
          port: 4318,
          state: { id: "65535", name: "App UI" },
          ...next,
          remainingActive: [],
          remainingSuspended: [],
        };
      },
      parseExploreGrant: (result: { output: string[] }) => JSON.parse(result.output[0] ?? "{}"),
      parseExploreRelease: (result: { output: string[] }) => JSON.parse(result.output[0] ?? "{}"),
      resumeDisplayQueue: async () => {
        calls.push("resume");
        return { host: "127.0.0.1", port: 4318, state: { id: "65535", name: "App UI" }, isSuspended: false };
      },
      sleep: async () => {
        calls.push("settle");
      },
      suspendDisplayQueue: async () => {
        calls.push("suspend");
        return { host: "127.0.0.1", port: 4318, state: { id: "65535", name: "App UI" }, isSuspended: true };
      },
      ...overrides,
    };
    return { calls, dependencies };
  }

  function tunerResult(payload: unknown) {
    return {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "1", name: "Tuner" },
      output: [JSON.stringify(payload)],
    };
  }

  const fastDrain = { settleMs: 0, pollMs: 250, quiescePolls: 2 } as const;

  test("runs the verified state machine and drains until quiesce", async () => {
    const { calls, dependencies } = exploreDependencies();
    const result = await exploreCiv7MapForPlayer(
      { playerId: 0, ...fastDrain },
      {},
      dependencies as never,
    );
    // suspend is verified BEFORE the grant; the drain purges each poll and
    // exits only after quiescePolls consecutive empty purges; resume precedes
    // the grant release so late displays cannot re-queue mid-flight.
    expect(calls).toEqual([
      "summary",
      "suspend",
      "grant",
      "settle", "close",
      "settle", "close",
      "settle", "close",
      "resume",
      "release",
      "summary",
    ]);
    expect(result.classification).toBe("explored");
    expect(result.grantReleased).toBe(true);
    expect(result.quiesced).toBe(true);
    expect(result.drainPolls).toBe(3);
    expect(result.suspendVerified).toBe(true);
    expect(result.resumeVerified).toBe(true);
    expect(result.suppressedDisplays).toEqual([
      { category: "Cinematic", closed: 7 },
      { category: "UnlockPopup", closed: 1 },
    ]);
    expect(result.discoveryPosture).toBe("ui-suppressed-gameplay-discovers");
    expect(result.mutation).toBe("Visibility.setTrackedVisibilityGrant");
  });

  test("settle default scales with map size and is clamped", () => {
    expect(defaultExploreSettleMs(6996)).toBe(69_960);
    expect(defaultExploreSettleMs(100)).toBe(15_000);
    expect(defaultExploreSettleMs(50_000)).toBe(120_000);
  });

  test("hits the hard cap when the queue never quiesces", async () => {
    const { dependencies } = exploreDependencies({
      closeDisplays: async () => ({
        host: "127.0.0.1",
        port: 4318,
        state: { id: "65535", name: "App UI" },
        closed: [{ category: "Cinematic", closed: 1 }],
        closedTotal: 1,
        remainingActive: [],
        remainingSuspended: [],
      }),
    });
    const result = await exploreCiv7MapForPlayer(
      { playerId: 0, settleMs: 0, pollMs: 250, quiescePolls: 2, maxExtraWaitMs: 500 },
      {},
      dependencies as never,
    );
    expect(result.quiesced).toBe(false);
    expect(result.drainPolls).toBe(2);
    expect(result.suppressedDisplays).toEqual([{ category: "Cinematic", closed: 2 }]);
  });

  test("fails loudly when suspension is not verified by readback", async () => {
    const { calls, dependencies } = exploreDependencies({
      suspendDisplayQueue: async () => ({
        host: "127.0.0.1",
        port: 4318,
        state: { id: "65535", name: "App UI" },
        isSuspended: false,
      }),
    });
    await expect(
      exploreCiv7MapForPlayer({ playerId: 0, ...fastDrain }, {}, dependencies as never),
    ).rejects.toThrow(/suspension was not verified/);
    expect(calls).not.toContain("grant");
  });

  test("resumes the display queue even when the grant fails", async () => {
    const { calls, dependencies } = exploreDependencies({
      executeTunerCommand: async () => {
        throw new Error("tuner down");
      },
    });
    await expect(
      exploreCiv7MapForPlayer({ playerId: 0, ...fastDrain }, {}, dependencies as never),
    ).rejects.toThrow("tuner down");
    expect(calls).toContain("resume");
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
      revealedState: { ok: true, value: 1 },
      visible: { ok: true, value: true },
    },
  };
}

function visibilityPayload(revealedCount: number) {
  return {
    playerId: 0,
    numPlotsRevealed: { ok: true, value: revealedCount },
    numPlotsVisible: { ok: true, value: revealedCount },
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
