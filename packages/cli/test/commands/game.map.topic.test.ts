import { describe, expect, test, vi } from "vitest";
import type { Command } from "@oclif/core";
import GameMap from "../../src/commands/game/map";
import GameMapGrid from "../../src/commands/game/map/grid";
import GameMapPlot from "../../src/commands/game/map/plot";
import GameMapSummary from "../../src/commands/game/map/summary";
import GameMapVisibility from "../../src/commands/game/map/visibility";
import { type FakeTunerServer, startFakeTunerServer } from "./fixtures/tuner-socket-server";

// Focused tests for the `game map` noun topic (D2/D5 in
// docs/projects/cli-command-taxonomy/workstream-record.md): the topic index
// keeps the original flag multiplex, the subcommands delegate to the same
// world.* service calls; the legacy `game visibility` id is fully migrated away (D5).

describe("game map noun topic", () => {
  test("topic index keeps the original flag-multiplexed id and behavior", async () => {
    expect(GameMap.id).toBe("game map");
    const server = await startWorldTunerServer();
    try {
      const indexWrites = await runCommand(GameMap, server, [
        "--plot",
        "3,4",
        "--player-id",
        "0",
        "--json",
      ]);
      const subWrites = await runCommand(GameMapPlot, server, [
        "3,4",
        "--player-id",
        "0",
        "--json",
      ]);
      // The index path and the focused subcommand produce identical output
      // because both delegate to the same readCiv7World helper.
      expect(indexWrites.join("")).toBe(subWrites.join(""));
    } finally {
      await server.close();
    }
  });

  test("game map summary routes through the current world service call", async () => {
    const server = await startWorldTunerServer();
    try {
      const writes = await runCommand(GameMapSummary, server, ["--json"]);
      expect(server.received.some((message) => message.includes("Network.isInSession"))).toBe(true);
      const payload = JSON.parse(writes.join("")) as { ok: boolean; result: { readiness: string } };
      expect(payload.ok).toBe(true);
      expect(payload.result.readiness).toBe("tuner-ready");
    } finally {
      await server.close();
    }
  });

  test("game map plot reads one plot with focused args", async () => {
    const server = await startWorldTunerServer();
    try {
      const writes = await runCommand(GameMapPlot, server, ["3,4", "--player-id", "0", "--json"]);
      expect(server.received.some((message) => message.includes("readPlotSnapshot"))).toBe(true);
      const payload = JSON.parse(writes.join("")) as {
        ok: boolean;
        result: { plot: { location: { x: number; y: number; index: number } } };
      };
      expect(payload.ok).toBe(true);
      expect(payload.result.plot.location).toMatchObject({ x: 3, y: 4 });
    } finally {
      await server.close();
    }
  });

  test("game map grid reads a bounded grid with focused args", async () => {
    const server = await startWorldTunerServer();
    try {
      const writes = await runCommand(GameMapGrid, server, [
        "0,0,2,1",
        "--fields",
        "terrain",
        "--max-plots",
        "1",
        "--json",
      ]);
      expect(server.received.some((message) => message.includes("locationsFromBounds"))).toBe(true);
      const payload = JSON.parse(writes.join("")) as {
        ok: boolean;
        result: {
          bounds: { x: number; y: number; width: number; height: number };
          plots: unknown[];
        };
      };
      expect(payload.ok).toBe(true);
      expect(payload.result.bounds).toEqual({ x: 0, y: 0, width: 2, height: 1 });
      expect(payload.result.plots).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test("game map visibility carries no legacy alias (D5 full migration)", () => {
    expect(GameMapVisibility.id).toBe("game map visibility");
    expect(GameMapVisibility.aliases ?? []).toEqual([]);
  });

  test("game map visibility gates --explore behind --disposable", async () => {
    const server = await startWorldTunerServer();
    try {
      await expect(
        runCommand(GameMapVisibility, server, ["--player-id", "0", "--explore"])
      ).rejects.toThrow(/--explore requires --disposable/);
    } finally {
      await server.close();
    }
  });

  test("game map visibility still gates --reveal behind --disposable", async () => {
    const server = await startWorldTunerServer();
    try {
      await expect(
        runCommand(GameMapVisibility, server, ["--player-id", "0", "--reveal"])
      ).rejects.toThrow(/--reveal requires --disposable/);
    } finally {
      await server.close();
    }
  });
});

async function startWorldTunerServer(): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes("Network.isInSession")) {
        return [
          JSON.stringify({
            network: {
              isInSession: { ok: true, value: true },
              numPlayers: { ok: true, value: 1 },
              hostPlayerId: { ok: true, value: 0 },
              isConnectedToNetwork: { ok: true, value: true },
              isAuthenticated: { ok: true, value: false },
              isLoggedIn: { ok: true, value: true },
            },
            autoplay: {
              isActive: false,
              turns: -1,
              isPaused: false,
              isPausedOrPending: false,
              observeAsPlayer: -1,
              returnAsPlayer: -1,
            },
            game: {
              turn: 1,
              age: 0,
              maxTurns: 0,
              turnDate: { ok: true, value: "4000 BCE" },
              hash: { ok: true, value: 0 },
            },
            ui: {
              inGame: { ok: true, value: true },
              inShell: { ok: true, value: false },
              inLoading: { ok: true, value: false },
              loadingState: { ok: true, value: 6 },
              loadingStateName: "WaitingForUIReady",
              canBeginGame: { ok: true, value: true },
              canNotifyUIReady: "function",
              skipStartButton: { ok: true, value: false },
              automationActive: { ok: true, value: false },
            },
            gameContext: {
              localPlayerID: 0,
              localObserverID: 0,
              hasRequestedPause: { ok: true, value: false },
            },
            players: {
              maxPlayers: 64,
              aliveIds: { ok: true, value: [0] },
              aliveHumanIds: { ok: true, value: [0] },
              numAliveHumans: { ok: true, value: 1 },
            },
            map: {
              width: { ok: true, value: 84 },
              height: { ok: true, value: 54 },
              plotCount: { ok: true, value: 4536 },
              mapSize: { ok: true, value: 0 },
              randomSeed: { ok: true, value: 1 },
            },
          }),
        ];
      }
      if (message.includes("evalOk: 1 + 1")) {
        return [
          JSON.stringify({
            evalOk: 2,
            ready: true,
            globals: {
              Game: "object",
              Autoplay: "object",
              GameplayMap: "object",
              Players: "object",
              Network: "undefined",
            },
            turn: { ok: true, value: 1 },
            turnDate: { ok: true, value: "4000 BCE" },
            width: { ok: true, value: 84 },
            height: { ok: true, value: 54 },
            aliveIds: { ok: true, value: [0] },
            aliveHumanIds: { ok: true, value: [0] },
            autoplayActive: { ok: true, value: false },
          }),
        ];
      }
      if (message.includes("locationsFromBounds")) {
        return [
          JSON.stringify({
            bounds: { x: 0, y: 0, width: 2, height: 1 },
            fields: ["terrain"],
            plotCount: 2,
            omitted: 1,
            hiddenInfoPolicy: "not-player-scoped",
            map: {
              width: { ok: true, value: 84 },
              height: { ok: true, value: 54 },
            },
            plots: [
              {
                location: { x: 0, y: 0, index: { ok: true, value: 0 } },
                hiddenInfoPolicy: "not-player-scoped",
                facts: {
                  terrain: { ok: true, value: 4 },
                },
              },
            ],
          }),
        ];
      }
      if (message.includes("readPlotSnapshot")) {
        return [
          JSON.stringify({
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
          }),
        ];
      }
      return undefined;
    },
  });
}

async function runCommand(
  commandClass: typeof Command & { run(argv: string[]): Promise<unknown> },
  server: FakeTunerServer,
  args: string[]
): Promise<string[]> {
  const writes: string[] = [];
  const log = vi.spyOn(commandClass.prototype, "log").mockImplementation(function (
    this: unknown,
    message?: string
  ) {
    if (message !== undefined) writes.push(message);
    return undefined as never;
  });
  try {
    const { port } = server.address();
    await commandClass.run(["--host", "127.0.0.1", "--port", String(port), ...args]);
    return writes;
  } finally {
    log.mockRestore();
  }
}
