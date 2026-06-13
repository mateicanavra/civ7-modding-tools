import { once } from "node:events";
import { type AddressInfo, createServer, type Socket } from "node:net";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  Civ7StartPositionsResultSchema,
  encodeCiv7TunerRequest,
  parseCiv7TunerFrame,
  readCiv7StartPositions,
} from "../src/index";

type FakeTunerServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

describe("start-position readback", () => {
  test("reads founder-unit-derived start positions in one tuner exec without sending operations", async () => {
    const server = await startStartPositionsTunerServer(startPositionsPayload(1));
    try {
      const { port } = server.address();
      const result = await readCiv7StartPositions({ host: "127.0.0.1", port, timeoutMs: 1_000 });

      expect(result.method).toBe("founder-unit-derived");
      expect(result.turn).toEqual({ ok: true, value: 1 });
      expect(result.players).toEqual({
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
            unitCount: 2,
            firstUnitPlot: { x: 41, y: 9 },
          },
        ],
      });
      expect(result.state).toEqual({ id: "1", name: "Tuner" });
      expect(result.notes.join("\n")).toContain("founder-unit-derived");
      expect(result.notes.join("\n")).toContain("before units move");
      expect(Value.Check(Civ7StartPositionsResultSchema, result)).toBe(true);

      const commands = server.received.filter((message) => message.startsWith("CMD:"));
      expect(commands).toHaveLength(1);
      expect(commands[0]).toContain("CMD:1:");
      expect(commands[0]).toContain("Players.getAliveMajorIds()");
      expect(commands[0]).toContain("Game.turn");
      expect(commands[0]).toContain("firstUnitPlot");
      expect(commands[0]).not.toContain("sendRequest");
    } finally {
      await server.close();
    }
  });

  test("reports the current turn so callers can judge founder-unit-plot validity", async () => {
    const server = await startStartPositionsTunerServer(startPositionsPayload(37));
    try {
      const { port } = server.address();
      const result = await readCiv7StartPositions({ host: "127.0.0.1", port, timeoutMs: 1_000 });
      expect(result.turn).toEqual({ ok: true, value: 37 });
      expect(Value.Check(Civ7StartPositionsResultSchema, result)).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("rejects extra fields in the result schema", () => {
    const result = {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "1", name: "Tuner" },
      ...startPositionsPayload(1),
      notes: ["..."],
    };
    expect(Value.Check(Civ7StartPositionsResultSchema, result)).toBe(true);
    expect(
      Value.Check(Civ7StartPositionsResultSchema, {
        ...result,
        startPlots: [],
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7StartPositionsResultSchema, {
        ...result,
        method: "engine-start-plot",
      })
    ).toBe(false);
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
          unitCount: 2,
          firstUnitPlot: { x: 41, y: 9 },
        },
      ],
    },
  };
}

async function startStartPositionsTunerServer(payload: unknown): Promise<FakeTunerServer> {
  const received: string[] = [];
  const sockets = new Set<Socket>();
  const server = createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const parsed = parseCiv7TunerFrame(buffer);
        if (!parsed) return;
        buffer = buffer.subarray(parsed.bytesRead);
        const message = parsed.frame.parts.join("\0");
        received.push(message);
        const respond = (parts: string[]) => {
          socket.write(encodeCiv7TunerRequest(parsed.frame.listenerId, parts.join("\0")));
        };
        if (message === "LSQ:") {
          respond(["65535", "App UI", "1", "Tuner"]);
        } else if (message.includes("readStartPositions")) {
          respond([JSON.stringify(payload)]);
        } else {
          respond(["null"]);
        }
      }
    });
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return {
    received,
    address: () => server.address() as AddressInfo,
    close: async () => {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}
