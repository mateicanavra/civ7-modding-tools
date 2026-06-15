import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7WorldReadUnavailableError,
  createCiv7ControlOrpcServerClient,
} from "../src/index";

describe("world map read control-oRPC procedures", () => {
  test("projects one plot without raw direct-control runtime envelope", async () => {
    const fake = fakeContext();

    const result = await call(
      Civ7ControlOrpcRouter.world.plot,
      {
        location: { x: 3, y: 4 },
        playerId: 0,
        fields: ["terrain", "resource", "visibility"],
      },
      { context: fake.context }
    );

    expect(fake.plotCalls).toEqual([
      {
        input: {
          x: 3,
          y: 4,
          fields: ["terrain", "resource", "visibility"],
          playerId: 0,
          includeHidden: undefined,
        },
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
    expect(result).toEqual({
      sourceStatus: { plot: "read" },
      plot: {
        location: { x: 3, y: 4, index: 339 },
        visibility: {
          revealedState: { ok: true, value: 1 },
          visible: { ok: true, value: true },
        },
        hiddenInfoPolicy: "visibility-filtered",
        facts: {
          terrain: { ok: true, value: 4 },
          resource: { ok: true, value: -1 },
        },
        summary: {
          factCount: 2,
          probeErrorCount: 0,
        },
      },
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain("rawCommand");
    expect(serialized).not.toContain("enemy");
    expect(serialized).not.toContain("hostile");
    expect(serialized).not.toContain("opponent");
    expect(serialized).not.toContain("threat");
    expect(serialized).not.toContain("war");
    expect(serialized).not.toContain("ally");
    expect(serialized).not.toContain("suzerain");
  });

  test("projects bounded grids with omission and probe-error source status", async () => {
    const fake = fakeContext({
      gridResult: {
        ...mapGridResult(),
        omitted: 2,
        map: {
          width: { ok: false, error: "GameplayMap unavailable" },
          height: { ok: true, value: 54 },
        },
        plots: [
          {
            ...plotSnapshotResult(),
            facts: {
              terrain: { ok: false, error: "terrain unavailable" },
            },
          },
        ],
      },
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.world.grid({
      bounds: { x: 0, y: 0, width: 2, height: 2 },
      fields: ["terrain"],
      maxPlots: 2,
    });

    expect(fake.gridCalls).toEqual([
      {
        input: {
          bounds: { x: 0, y: 0, width: 2, height: 2 },
          fields: ["terrain"],
          playerId: undefined,
          includeHidden: undefined,
          maxPlots: 2,
        },
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
    expect(result).toMatchObject({
      sourceStatus: {
        grid: "read-with-omissions",
        map: "read",
      },
      bounds: { x: 0, y: 0, width: 2, height: 2 },
      fields: ["terrain"],
      plotCount: 4,
      omitted: 2,
      map: {
        width: null,
        height: 54,
      },
      plots: [
        {
          summary: {
            factCount: 1,
            probeErrorCount: 1,
          },
        },
      ],
      summary: {
        returnedPlotCount: 1,
        probeErrorCount: 2,
      },
    });
    expect(JSON.stringify(result)).not.toContain('"host"');
  });

  test("rejects raw endpoint and command fields before facade execution", async () => {
    const invalidInputs = [
      { location: { x: 3, y: 4 }, host: "127.0.0.1" },
      { location: { x: 3, y: 4 }, state: { role: "tuner" } },
      { location: { x: 3, y: 4 }, command: "GameplayMap.getTerrainType(3, 4)" },
      { location: { x: 3, y: 4 }, rawCommand: "readPlotSnapshot()" },
      {
        bounds: { x: 0, y: 0, width: 2, height: 2 },
        fields: ["terrain"],
        session: { state: "Tuner" },
      },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext();
      const target =
        "bounds" in input ? Civ7ControlOrpcRouter.world.grid : Civ7ControlOrpcRouter.world.plot;

      await expect(
        call(target as never, input as never, { context: fake.context })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.plotCalls).toEqual([]);
      expect(fake.gridCalls).toEqual([]);
    }
  });

  test("maps facade failures to tagged errors without raw cause details", async () => {
    const context: Civ7ControlOrpcContext = {
      directControl: {
        getCiv7PlotSnapshot: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:1:GameplayMap.getTerrainType(3,4)"
          );
        },
      } as Civ7ControlOrpcContext["directControl"],
    };

    await expect(
      call(
        Civ7ControlOrpcRouter.world.plot,
        {
          location: { x: 3, y: 4 },
        },
        { context }
      )
    ).rejects.toMatchObject({
      code: "WORLD_READ_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "world.plot.read",
        source: "direct-control-facade",
      },
    });

    try {
      await call(
        Civ7ControlOrpcRouter.world.plot,
        {
          location: { x: 3, y: 4 },
        },
        { context }
      );
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("GameplayMap.getTerrainType");
      expect(serialized).not.toContain("rawCommand");
    }
  });

  test("publishes contract-first world plot and grid leaves", () => {
    expect(Civ7ControlOrpcContract.world.plot["~orpc"]).toMatchObject({
      meta: {
        family: "world",
        procedureKey: "world.plot.read",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(Civ7ControlOrpcContract.world.grid["~orpc"]).toMatchObject({
      meta: {
        family: "world",
        procedureKey: "world.grid.read",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(Civ7WorldReadUnavailableError.code).toBe("WORLD_READ_UNAVAILABLE");
  });
});

function fakeContext(
  overrides: Partial<{
    plotResult: ReturnType<typeof plotSnapshotResult>;
    gridResult: ReturnType<typeof mapGridResult>;
  }> = {}
): {
  plotCalls: Array<{
    input: unknown;
    options: Civ7ControlOrpcContext["endpointDefaults"];
  }>;
  gridCalls: Array<{
    input: unknown;
    options: Civ7ControlOrpcContext["endpointDefaults"];
  }>;
  context: Civ7ControlOrpcContext;
} {
  const plotCalls: Array<{
    input: unknown;
    options: Civ7ControlOrpcContext["endpointDefaults"];
  }> = [];
  const gridCalls: Array<{
    input: unknown;
    options: Civ7ControlOrpcContext["endpointDefaults"];
  }> = [];
  return {
    plotCalls,
    gridCalls,
    context: {
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      directControl: {
        getCiv7PlotSnapshot: async (input, options) => {
          plotCalls.push({ input, options });
          return overrides.plotResult ?? plotSnapshotResult();
        },
        getCiv7MapGrid: async (input, options) => {
          gridCalls.push({ input, options });
          return overrides.gridResult ?? mapGridResult();
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function plotSnapshotResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    location: { x: 3, y: 4, index: { ok: true as const, value: 339 } },
    revealedState: { ok: true as const, value: 1 },
    visible: { ok: true as const, value: true },
    hiddenInfoPolicy: "visibility-filtered" as const,
    facts: {
      terrain: { ok: true as const, value: 4 },
      resource: { ok: true as const, value: -1 },
    },
  };
}

function mapGridResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    bounds: { x: 0, y: 0, width: 2, height: 2 },
    fields: ["terrain"] as const,
    plotCount: 4,
    omitted: 0,
    hiddenInfoPolicy: "not-player-scoped" as const,
    map: {
      width: { ok: true as const, value: 84 },
      height: { ok: true as const, value: 54 },
    },
    plots: [plotSnapshotResult()],
  };
}
