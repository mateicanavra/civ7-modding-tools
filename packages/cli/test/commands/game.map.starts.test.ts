import { describe, expect, test, vi } from "vitest";
import GameMapStarts from "../../src/commands/game/map/starts";
import { type FakeTunerServer, startFakeTunerServer } from "./fixtures/tuner-socket-server";

describe("game map starts", () => {
  test("prints a player table from one founder-unit-derived tuner read", async () => {
    const server = await startStartPositionsTunerServer(startPositionsPayload(1));
    try {
      const { writes } = await runCommand(server, []);
      expect(writes[0]).toBe("method: founder-unit-derived (turn 1)");
      expect(writes[1]).toBe("player  human  plot      units");
      expect(writes[2]).toContain("0");
      expect(writes[2]).toContain("yes");
      expect(writes[2]).toContain("17,20");
      expect(writes[3]).toContain("1");
      expect(writes[3]).toContain("no");
      expect(writes[3]).toContain("41,9");
      expect(writes.some((line) => line.startsWith("caveat:"))).toBe(false);

      const commands = server.received.filter((message) => message.startsWith("CMD:"));
      expect(commands).toHaveLength(1);
      expect(commands[0]).toContain("CMD:1:");
      expect(commands[0]).toContain("Players.getAliveMajorIds()");
      expect(commands[0]).toContain("Game.turn");
      expect(commands[0]).not.toContain("sendRequest");
    } finally {
      await server.close();
    }
  });

  test("prints a validity caveat when the turn is past 1", async () => {
    const server = await startStartPositionsTunerServer(startPositionsPayload(37));
    try {
      const { writes } = await runCommand(server, []);
      expect(writes[0]).toBe("method: founder-unit-derived (turn 37)");
      const caveat = writes.find((line) => line.startsWith("caveat:"));
      expect(caveat).toBeDefined();
      expect(caveat).toContain("before units move");
      expect(caveat).toContain("turn is 37");
    } finally {
      await server.close();
    }
  });

  test("emits machine-readable output with --json", async () => {
    const server = await startStartPositionsTunerServer(startPositionsPayload(1));
    try {
      const { writes } = await runCommand(server, ["--json"]);
      const payload = JSON.parse(writes.join("")) as {
        ok: boolean;
        result: {
          method: string;
          turn: { ok: boolean; value?: number };
          players: {
            ok: boolean;
            value?: Array<{ id: number; firstUnitPlot: { x: number; y: number } | null }>;
          };
          notes: string[];
        };
      };
      expect(payload.ok).toBe(true);
      expect(payload.result.method).toBe("founder-unit-derived");
      expect(payload.result.turn).toEqual({ ok: true, value: 1 });
      expect(payload.result.players.value).toHaveLength(2);
      expect(payload.result.players.value?.[0]?.firstUnitPlot).toEqual({ x: 17, y: 20 });
      expect(payload.result.notes.join("\n")).toContain("founder-unit-derived");
    } finally {
      await server.close();
    }
  });
});

function startPositionsPayload(turn: number) {
  return {
    method: "founder-unit-derived",
    turn: { ok: true, value: turn },
    players: {
      ok: true,
      value: [
        {
          id: 0,
          isHuman: true,
          civilizationType: "CIVILIZATION_AKSUM",
          leaderType: "LEADER_AMINA",
          unitCount: 2,
          firstUnitPlot: { x: 17, y: 20 },
        },
        {
          id: 1,
          isHuman: false,
          civilizationType: "CIVILIZATION_ROME",
          leaderType: "LEADER_AUGUSTUS",
          unitCount: 3,
          firstUnitPlot: { x: 41, y: 9 },
        },
      ],
    },
  };
}

async function startStartPositionsTunerServer(payload: unknown): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes("readStartPositions")) {
        return [JSON.stringify(payload)];
      }
      return undefined;
    },
  });
}

async function runCommand(server: FakeTunerServer, args: string[]): Promise<{ writes: string[] }> {
  const writes: string[] = [];
  const log = vi.spyOn(GameMapStarts.prototype, "log").mockImplementation(function (
    this: unknown,
    message?: string
  ) {
    if (message !== undefined) writes.push(message);
    return undefined as never;
  });
  try {
    const { port } = server.address();
    await GameMapStarts.run(["--host", "127.0.0.1", "--port", String(port), ...args]);
    return { writes };
  } finally {
    log.mockRestore();
  }
}
