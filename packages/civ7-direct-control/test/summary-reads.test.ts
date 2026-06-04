import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7CitySummaryInputSchema,
  Civ7CitySummaryResultSchema,
  Civ7UnitSummaryInputSchema,
  Civ7UnitSummaryResultSchema,
  getCiv7CitySummary,
  getCiv7PlayerSummary,
  getCiv7UnitSummary,
} from "../src/index";

type FakeTunerServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

describe("player, unit, and city summary reads", () => {
  test("exports unit-summary schemas with bounded player and unit input", () => {
    expect(Value.Check(Civ7UnitSummaryInputSchema, {
      playerIds: [0],
      unitIds: [{ owner: -1, id: -1, type: 26 }],
      playerId: 0,
      maxItems: 128,
      includeHidden: false,
    })).toBe(true);
    expect(Value.Check(Civ7UnitSummaryInputSchema, { playerId: 1025 })).toBe(false);
    expect(Value.Check(Civ7UnitSummaryInputSchema, { maxItems: 1_001 })).toBe(false);
    expect(Value.Check(Civ7UnitSummaryInputSchema, {
      unitIds: [{ owner: -1, id: -1, type: 26, command: "Units.get" }],
    })).toBe(false);
    expect(Value.Check(Civ7UnitSummaryInputSchema, { state: { role: "tuner" } })).toBe(false);
    expect(Value.Check(Civ7UnitSummaryInputSchema, { rawCommand: "Units.get(id)" })).toBe(false);

    const summary = unitSummaryResult();
    expect(Value.Check(Civ7UnitSummaryResultSchema, summary)).toBe(true);
    expect(Value.Check(Civ7UnitSummaryResultSchema, {
      ...summary,
      command: "Units.get(id)",
    })).toBe(false);
    expect(Value.Check(Civ7UnitSummaryResultSchema, {
      ...summary,
      units: [{
        ...summary.units[0],
        location: { ok: true, value: { x: 1.5, y: 11 } },
      }],
    })).toBe(false);
  });

  test("exports city-summary schemas with bounded player and city input", () => {
    expect(Value.Check(Civ7CitySummaryInputSchema, {
      playerIds: [0],
      cityIds: [{ owner: -1, id: -1, type: 1 }],
      playerId: 0,
      maxItems: 128,
      includeHidden: false,
    })).toBe(true);
    expect(Value.Check(Civ7CitySummaryInputSchema, { playerId: 1025 })).toBe(false);
    expect(Value.Check(Civ7CitySummaryInputSchema, { maxItems: 1_001 })).toBe(false);
    expect(Value.Check(Civ7CitySummaryInputSchema, {
      cityIds: [{ owner: -1, id: -1, type: 1, command: "Cities.get" }],
    })).toBe(false);
    expect(Value.Check(Civ7CitySummaryInputSchema, { state: { role: "tuner" } })).toBe(false);
    expect(Value.Check(Civ7CitySummaryInputSchema, { rawCommand: "Cities.get(id)" })).toBe(false);

    const summary = citySummaryResult();
    expect(Value.Check(Civ7CitySummaryResultSchema, summary)).toBe(true);
    expect(Value.Check(Civ7CitySummaryResultSchema, {
      ...summary,
      command: "Cities.get(id)",
    })).toBe(false);
    expect(Value.Check(Civ7CitySummaryResultSchema, {
      ...summary,
      cities: [{
        ...summary.cities[0],
        location: { ok: true, value: { x: 22.5, y: 31 } },
      }],
    })).toBe(false);
  });

  test("wraps summary reads without sending operations", async () => {
    const server = await startSummaryTunerServer();
    try {
      const { port } = server.address();
      const options = { host: "127.0.0.1", port, timeoutMs: 1_000 };

      const players = await getCiv7PlayerSummary({ playerIds: [0], maxItems: 2 }, options);
      const units = await getCiv7UnitSummary(
        { playerId: 0, unitIds: [{ owner: -1, id: -1, type: 26 }], maxItems: 2 },
        options,
      );
      const cities = await getCiv7CitySummary(
        { cityIds: [{ owner: -1, id: -1, type: 1 }], maxItems: 2 },
        options,
      );

      expect(players).toMatchObject({
        state: { id: "1", name: "Tuner" },
        players: [
          {
            id: 0,
            leaderName: { ok: true, value: "Amina" },
            civilizationName: { ok: true, value: "LOC_CIVILIZATION_AKSUM_NAME" },
            unitIds: { ok: true, value: [{ owner: 0, id: 65536, type: 26 }] },
          },
        ],
        omitted: 0,
      });
      expect(units).toMatchObject({
        state: { id: "1", name: "Tuner" },
        units: [
          {
            id: { owner: -1, id: -1, type: 26 },
            owner: { ok: true, value: 0 },
            name: { ok: true, value: "Scout" },
          },
        ],
        omitted: 0,
      });
      expect(cities).toMatchObject({
        state: { id: "1", name: "Tuner" },
        cities: [
          {
            id: { owner: 0, id: 131073, type: 1 },
            owner: { ok: true, value: 0 },
            name: { ok: true, value: "Dur-Sharrukin" },
          },
        ],
        omitted: 0,
      });

      const summaryCommands = server.received.filter((message) => message.startsWith("CMD:1:"));
      expect(summaryCommands).toHaveLength(3);
      expect(summaryCommands[0]).toContain("Players.getAliveIds()");
      expect(summaryCommands[0]).toContain("readValue(value");
      expect(summaryCommands[1]).toContain("Players.Units");
      expect(summaryCommands[1]).toContain("Units.get");
      expect(summaryCommands[1]).toContain('"owner":-1');
      expect(summaryCommands[2]).toContain("Players.Cities");
      expect(summaryCommands[2]).toContain("Cities.get");
      expect(summaryCommands[2]).toContain('"owner":-1');
      expect(summaryCommands.some((message) => message.includes("sendRequest"))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("keeps existing summary validation and bounds", async () => {
    await expect(getCiv7PlayerSummary({ playerIds: [-1] })).rejects.toMatchObject({
      code: "command-failed",
    });
    await expect(getCiv7PlayerSummary({ maxItems: 513 })).rejects.toMatchObject({
      code: "command-failed",
    });
    await expect(getCiv7UnitSummary({ playerId: 1025 })).rejects.toMatchObject({
      code: "command-failed",
    });
    await expect(getCiv7UnitSummary({ maxItems: 1_001 })).rejects.toMatchObject({
      code: "command-failed",
    });
    await expect(getCiv7CitySummary({ playerIds: [1025] })).rejects.toMatchObject({
      code: "command-failed",
    });
    await expect(getCiv7CitySummary({ maxItems: 1_001 })).rejects.toMatchObject({
      code: "command-failed",
    });
  });
});

async function startSummaryTunerServer(): Promise<FakeTunerServer> {
  const received: string[] = [];
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
        } else if (frame.message.includes("Players.get(id)")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(playerSummaryPayload())]));
        } else if (frame.message.includes("const unit = probe(() => Units.get(id))")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(unitSummaryPayload())]));
        } else if (frame.message.includes("const city = probe(() => Cities.get(id))")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(citySummaryPayload())]));
        } else {
          socket.write(encodeResponse(frame.listenerId, ["null"]));
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

function playerSummaryPayload() {
  return {
    players: [
      {
        id: 0,
        leaderName: { ok: true, value: "Amina" },
        civilizationName: { ok: true, value: "LOC_CIVILIZATION_AKSUM_NAME" },
        isHuman: { ok: true, value: true },
        isAlive: { ok: true, value: true },
        isTurnActive: { ok: true, value: true },
        unitIds: { ok: true, value: [{ owner: 0, id: 65536, type: 26 }] },
        cityIds: { ok: true, value: [{ owner: 0, id: 131073, type: 1 }] },
      },
    ],
    omitted: 0,
  };
}

function unitSummaryPayload() {
  return {
    units: [
      {
        id: { owner: -1, id: -1, type: 26 },
        owner: { ok: true, value: 0 },
        name: { ok: true, value: "Scout" },
        type: { ok: true, value: "UNIT_SCOUT" },
        location: { ok: true, value: { x: 10, y: 11 } },
        health: { ok: true, value: 100 },
        damage: { ok: true, value: 0 },
        movement: { ok: true, value: 2 },
        activity: { ok: true, value: "ACTIVE" },
      },
    ],
    omitted: 0,
  };
}

function unitSummaryResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    ...unitSummaryPayload(),
  };
}

function citySummaryPayload() {
  return {
    cities: [
      {
        id: { owner: 0, id: 131073, type: 1 },
        owner: { ok: true, value: 0 },
        name: { ok: true, value: "Dur-Sharrukin" },
        location: { ok: true, value: { x: 22, y: 31 } },
        population: { ok: true, value: 4 },
        growth: { ok: true, value: { food: 12 } },
        production: { ok: true, value: { turnsLeft: 3 } },
      },
    ],
    omitted: 0,
  };
}

function citySummaryResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    ...citySummaryPayload(),
  };
}

function parseRequest(buffer: Buffer):
  | {
      listenerId: number;
      message: string;
      bytesRead: number;
    }
  | null {
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
