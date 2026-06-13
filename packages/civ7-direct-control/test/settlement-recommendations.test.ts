import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7SettlementRecommendationInputSchema,
  Civ7SettlementRecommendationResultSchema,
  getCiv7SettlementRecommendations,
} from "../src/index";

type SettlementInput = {
  playerId?: number;
  locations?: ReadonlyArray<{ x: number; y: number }>;
  count?: number;
  includeSettlers?: boolean;
  includeCities?: boolean;
};

type ComponentId = { owner: number; id: number; type: number };

type FakeTunerServer = {
  received: string[];
  settlementCommands: string[];
  settlementInputs: SettlementInput[];
  address(): AddressInfo;
  close(): Promise<void>;
};

describe("getCiv7SettlementRecommendations", () => {
  test("exports TypeBox schemas for the bounded read-only settlement recommendation atom", () => {
    const requestedInput = {
      locations: [{ x: 18, y: 27 }],
      count: 3,
      includeSettlers: false,
      includeCities: false,
    };
    expect(Value.Check(Civ7SettlementRecommendationInputSchema, requestedInput)).toBe(true);
    expect(Value.Check(Civ7SettlementRecommendationInputSchema, { count: 0 })).toBe(false);
    expect(Value.Check(Civ7SettlementRecommendationInputSchema, { count: 13 })).toBe(false);
    expect(Value.Check(Civ7SettlementRecommendationInputSchema, { playerId: -1 })).toBe(false);
    expect(
      Value.Check(Civ7SettlementRecommendationInputSchema, { locations: [{ x: 1.5, y: 0 }] })
    ).toBe(false);
    expect(Value.Check(Civ7SettlementRecommendationInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(
      Value.Check(Civ7SettlementRecommendationInputSchema, {
        rawCommand: "readSettlementRecommendations()",
      })
    ).toBe(false);

    const result = settlementRecommendationsResult(requestedInput);
    expect(Value.Check(Civ7SettlementRecommendationResultSchema, result)).toBe(true);
    expect(
      Value.Check(Civ7SettlementRecommendationResultSchema, {
        ...result,
        rawCommand: "readSettlementRecommendations()",
      })
    ).toBe(false);
  });

  test("routes a requested-location read through App UI settlement recommendations without send operations", async () => {
    const server = await startSettlementRecommendationsTunerServer();
    try {
      const { port } = server.address();
      const recommendations = await getCiv7SettlementRecommendations(
        {
          locations: [{ x: 18, y: 27 }],
          count: 3,
          includeSettlers: false,
          includeCities: false,
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(recommendations).toMatchObject({
        state: { id: "65535", name: "App UI" },
        localPlayerId: 0,
        playerId: 0,
        count: 3,
        requestedLocations: [{ x: 18, y: 27 }],
        origins: [
          {
            kind: "requested",
            location: { x: 18, y: 27 },
            plotIndex: { ok: true, value: 2718 },
          },
        ],
        recommendations: [
          {
            origin: {
              kind: "requested",
              location: { x: 18, y: 27 },
            },
            suggestions: {
              ok: true,
            },
          },
        ],
      });
      expect(recommendations.recommendations[0]?.suggestions).toMatchObject({
        ok: true,
        value: [
          {
            location: { x: 19, y: 28 },
            plotIndex: { ok: true, value: 2819 },
            factors: [
              {
                positive: true,
                title: "LOC_SETTLER_LENS_FRESH_WATER_NAME",
                description: "LOC_SETTLER_LENS_FRESH_WATER_DESCRIPTION",
              },
              {
                positive: false,
                title: "LOC_SETTLER_LENS_TOO_CLOSE_NAME",
                description: "LOC_SETTLER_LENS_TOO_CLOSE_DESCRIPTION",
              },
            ],
          },
          expect.any(Object),
        ],
      });
      expect(recommendations.notes).toContain(
        "Read-only settlement recommendation view. It wraps the official settlement lens API, not a city-founding operation."
      );

      expect(server.received[0]).toBe("LSQ:");
      expect(server.settlementInputs).toEqual([
        {
          locations: [{ x: 18, y: 27 }],
          count: 3,
          includeSettlers: false,
          includeCities: false,
        },
      ]);
      expect(server.settlementCommands).toHaveLength(1);
      const command = server.settlementCommands[0] ?? "";
      expect(command).toContain("CMD:65535:");
      expect(command).toContain("readSettlementRecommendations");
      expect(command).toContain(
        "player?.AI?.getBestSettleLocationsForSettler?.(count, origin.location)"
      );
      expect(command).toContain("GameplayMap.getIndexFromLocation(location)");
      expect(command).not.toContain("UnitOperations.request");
      expect(command).not.toContain("UnitCommands.request");
      expect(command).not.toContain("CityOperations.request");
    } finally {
      await server.close();
    }
  });

  test("forwards default-origin controls and preserves conservative read notes", async () => {
    const server = await startSettlementRecommendationsTunerServer();
    try {
      const { port } = server.address();
      const recommendations = await getCiv7SettlementRecommendations(
        { playerId: 1, count: 12, includeCities: false },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      const settlerId: ComponentId = { owner: 1, id: 9001, type: 7 };
      expect(recommendations).toMatchObject({
        localPlayerId: 0,
        playerId: 1,
        count: 12,
        requestedLocations: [],
        origins: [
          {
            kind: "settler",
            location: { x: 9, y: 14 },
            plotIndex: { ok: true, value: 1409 },
            unitId: settlerId,
            name: "UNIT_SETTLER",
          },
        ],
      });
      expect(recommendations.origins.some((origin) => origin.kind === "city")).toBe(false);
      expect(recommendations.recommendations[0]?.suggestions).toMatchObject({
        ok: true,
        value: [
          {
            location: { x: 10, y: 15 },
            plotIndex: { ok: true, value: 1510 },
          },
          {
            location: { x: 11, y: 16 },
            plotIndex: { ok: true, value: 1611 },
          },
        ],
      });
      expect(recommendations.notes).toEqual([
        "Read-only settlement recommendation view. It wraps the official settlement lens API, not a city-founding operation.",
        "Recommendations are local-player AI advice for ranking candidate plots; use unit-target/ready-unit validation before moving a Settler.",
        "Official settlement lens seeds recommendations from Settler and city origins; pass --x/--y to focus one live Settler or formation.",
      ]);

      expect(server.settlementInputs).toEqual([{ playerId: 1, count: 12, includeCities: false }]);
      const command = server.settlementCommands[0] ?? "";
      expect(command).toContain("GameInfo.Units.lookup(unit.type)?.FoundCity");
      expect(command).toContain("player?.Cities?.getCities?.() ?? []");
      expect(command).toContain('"count":12');
      expect(command).not.toContain("FOUND_CITY");
    } finally {
      await server.close();
    }
  });
});

async function startSettlementRecommendationsTunerServer(): Promise<FakeTunerServer> {
  const received: string[] = [];
  const settlementCommands: string[] = [];
  const settlementInputs: SettlementInput[] = [];
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
        } else if (
          frame.message.startsWith("CMD:65535:") &&
          frame.message.includes("readSettlementRecommendations")
        ) {
          settlementCommands.push(frame.message);
          const input = settlementInputFromCommand(frame.message);
          settlementInputs.push(input);
          socket.write(
            encodeResponse(frame.listenerId, [JSON.stringify(settlementRecommendations(input))])
          );
        } else {
          socket.write(encodeResponse(frame.listenerId, ["2"]));
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    received,
    settlementCommands,
    settlementInputs,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function settlementRecommendations(input: SettlementInput) {
  const playerId = Number.isInteger(input.playerId) ? input.playerId : 0;
  const count = Number.isInteger(input.count) ? input.count : 5;
  const requestedLocations = input.locations ?? [];
  const origins =
    requestedLocations.length > 0
      ? requestedLocations.map((location) => requestedOrigin(location))
      : [
          ...(input.includeSettlers === false ? [] : [settlerOrigin(playerId)]),
          ...(input.includeCities === false ? [] : [cityOrigin(playerId)]),
        ];
  return {
    localPlayerId: 0,
    playerId,
    count,
    requestedLocations,
    origins,
    recommendations: origins.map((origin) => ({
      origin,
      suggestions: {
        ok: true,
        value: suggestionsFor(origin.location),
      },
    })),
    notes: [
      "Read-only settlement recommendation view. It wraps the official settlement lens API, not a city-founding operation.",
      "Recommendations are local-player AI advice for ranking candidate plots; use unit-target/ready-unit validation before moving a Settler.",
      "Official settlement lens seeds recommendations from Settler and city origins; pass --x/--y to focus one live Settler or formation.",
    ],
  };
}

function settlementRecommendationsResult(input: SettlementInput) {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    ...settlementRecommendations(input),
  };
}

function requestedOrigin(location: { x: number; y: number }) {
  return {
    kind: "requested",
    location,
    plotIndex: plotIndexFor(location),
  };
}

function settlerOrigin(playerId: number) {
  const location = { x: 9, y: 14 };
  return {
    kind: "settler",
    location,
    plotIndex: plotIndexFor(location),
    unitId: { owner: playerId, id: 9001, type: 7 },
    name: "UNIT_SETTLER",
  };
}

function cityOrigin(playerId: number) {
  const location = { x: 12, y: 18 };
  return {
    kind: "city",
    location,
    plotIndex: plotIndexFor(location),
    cityId: { owner: playerId, id: 131073, type: 1 },
    name: "Dur-Sharrukin",
  };
}

function suggestionsFor(origin: { x: number; y: number }) {
  return [
    {
      location: { x: origin.x + 1, y: origin.y + 1 },
      plotIndex: plotIndexFor({ x: origin.x + 1, y: origin.y + 1 }),
      factors: [
        {
          positive: true,
          title: "LOC_SETTLER_LENS_FRESH_WATER_NAME",
          description: "LOC_SETTLER_LENS_FRESH_WATER_DESCRIPTION",
        },
        {
          positive: false,
          title: "LOC_SETTLER_LENS_TOO_CLOSE_NAME",
          description: "LOC_SETTLER_LENS_TOO_CLOSE_DESCRIPTION",
        },
      ],
    },
    {
      location: { x: origin.x + 2, y: origin.y + 2 },
      plotIndex: plotIndexFor({ x: origin.x + 2, y: origin.y + 2 }),
      factors: [],
    },
  ];
}

function plotIndexFor(location: { x: number; y: number }) {
  return { ok: true, value: location.y * 100 + location.x };
}

function settlementInputFromCommand(message: string): SettlementInput {
  const match = message.match(/readSettlementRecommendations\((\{.*\})\)\);/s);
  if (!match) throw new Error(`Missing settlement recommendation input in command: ${message}`);
  return JSON.parse(match[1] ?? "{}") as SettlementInput;
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
