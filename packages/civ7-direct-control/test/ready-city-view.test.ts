import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7ReadyCityViewInputSchema,
  Civ7ReadyCityViewResultSchema,
  getCiv7ReadyCityView,
} from "../src/index";

type FakeTunerServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

describe("getCiv7ReadyCityView", () => {
  test("reads ready-city view for city blockers without sending operations", async () => {
    const server = await startReadyCityTunerServer();
    try {
      const { port } = server.address();
      const view = await getCiv7ReadyCityView(
        {},
        {
          host: "127.0.0.1",
          port,
          timeoutMs: 1_000,
        },
      );

      expect(view).toMatchObject({
        state: { id: "65535", name: "App UI" },
        localPlayerId: 0,
        requestedCityId: null,
        selectedCityId: { ok: true, value: { owner: 0, id: 131073, type: 1 } },
        cityId: { owner: 0, id: 131073, type: 1 },
        city: {
          ok: true,
          value: {
            id: { owner: 0, id: 131073, type: 1 },
            identity: {
              source: "Players.Cities.getCityIds",
              ok: true,
            },
            name: "Dur-Sharrukin",
            isTown: true,
            population: 4,
          },
        },
        legalOperations: [
          expect.objectContaining({
            family: "city-operation",
            operationType: "CONSIDER_TOWN_PROJECT",
          }),
        ],
      });
      expect(view.notes.some((note) => note.includes("does not choose production"))).toBe(true);
      expect(view.populationPlacement.ok && view.populationPlacement.value?.notes).toContain(
        "For NEW_POPULATION, compare workablePlots against expansionCandidates; assign-worker and expand-city are different acquire-tile branches.",
      );
      expect(server.received.some((message) => message.includes("readReadyCityView"))).toBe(true);
      expect(server.received.some((message) => message.includes('source: "Players.Cities.getCityIds"'))).toBe(true);
      expect(server.received.some((message) => message.includes("toComponentId(city.id ?? cityId) ?? cityId"))).toBe(false);
      expect(server.received.some((message) => message.includes("sendRequest"))).toBe(false);
      expect(Value.Check(Civ7ReadyCityViewInputSchema, {
        cityId: { owner: 0, id: 131073, type: 1 },
        maxOperations: 96,
      })).toBe(true);
      expect(Value.Check(Civ7ReadyCityViewInputSchema, { maxOperations: 257 })).toBe(false);
      expect(Value.Check(Civ7ReadyCityViewInputSchema, { rawCommand: "readReadyCityView()" })).toBe(false);
      expect(Value.Check(Civ7ReadyCityViewResultSchema, view)).toBe(true);
      expect(Value.Check(Civ7ReadyCityViewResultSchema, {
        ...view,
        command: "readReadyCityView()",
      })).toBe(false);
      expect(Value.Check(Civ7ReadyCityViewResultSchema, {
        ...view,
        productionCandidates: {
          ...view.productionCandidates,
          value: [{
            ...(view.productionCandidates.ok ? view.productionCandidates.value[0] : {}),
            cli: "game play build-production --send",
          }],
        },
      })).toBe(false);
      expect(Value.Check(Civ7ReadyCityViewResultSchema, {
        ...view,
        populationPlacement: {
          ...view.populationPlacement,
          value: view.populationPlacement.ok
            ? {
                ...view.populationPlacement.value,
                cliHints: ["game play expand-city --send"],
              }
            : null,
        },
      })).toBe(false);
    } finally {
      await server.close();
    }
  });
});

async function startReadyCityTunerServer(): Promise<FakeTunerServer> {
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
        } else if (frame.message.includes("readReadyCityView")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(readyCityView())]));
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

function readyCityView() {
  const cityId = { owner: 0, id: 131073, type: 1 };
  return {
    localPlayerId: 0,
    requestedCityId: null,
    selectedCityId: { ok: true, value: cityId },
    blockingCityId: { ok: true, value: cityId },
    cityId,
    city: {
      ok: true,
      value: {
        id: cityId,
        owner: 0,
        identity: {
          source: "Players.Cities.getCityIds",
          ok: true,
          observedCityId: cityId,
          reason: null,
        },
        name: "Dur-Sharrukin",
        location: { x: 22, y: 31 },
        population: 4,
        isTown: true,
        growth: { growthType: -284569333, turnsUntilGrowth: 3 },
        buildQueue: { currentProductionTypeHash: null, turnsLeft: null },
      },
    },
    legalOperations: [
      {
        family: "city-operation",
        operationType: "CONSIDER_TOWN_PROJECT",
        enumValue: 1,
        valid: true,
        result: { Success: true },
      },
    ],
    productionCandidates: {
      ok: true,
      value: [
        {
          kind: "constructible",
          type: 713967338,
          typeName: "BUILDING_WALLS",
          name: "LOC_BUILDING_WALLS_NAME",
          args: { ConstructibleType: 713967338 },
          valid: true,
          result: { Success: true, Plots: [1457] },
          placementPlots: [{ index: 1457, x: 22, y: 31 }],
        },
      ],
    },
    townFocusOptions: {
      ok: true,
      value: [
        {
          name: "LOC_PROJECT_FISHING_TOWN_NAME",
          description: "LOC_PROJECT_FISHING_TOWN_DESCRIPTION",
          args: { Type: -284569333, ProjectType: -548685232, City: 131073 },
          valid: true,
          result: { Success: true },
        },
      ],
    },
    populationPlacement: {
      ok: true,
      value: {
        isReadyToPlacePopulation: { ok: true, value: true },
        cityWorkerCap: { ok: true, value: 4 },
        yieldTypeOrder: ["Food", "Production", "Gold"],
        allPlacementInfo: { ok: true, value: [{ PlotIndex: 1457, IsBlocked: false }] },
        workablePlotIndexes: { ok: true, value: [1457] },
        blockedPlotIndexes: { ok: true, value: [] },
        workablePlots: { ok: true, value: [{ index: 1457, x: 22, y: 31 }] },
        expansionCandidates: { ok: true, value: [{ index: 1458, x: 23, y: 31 }] },
        expansionResult: { ok: true, value: { Success: true, Plots: [1458] } },
        notes: [
          "For NEW_POPULATION, compare workablePlots against expansionCandidates; assign-worker and expand-city are different acquire-tile branches.",
        ],
      },
    },
    notes: ["Read-only ready-city view. This view intentionally does not choose production."],
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
