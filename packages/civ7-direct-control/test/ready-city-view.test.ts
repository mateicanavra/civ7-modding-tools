import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { runInNewContext } from "node:vm";
import { Value } from "typebox/value";
import { describe, expect, test, vi } from "vitest";

import {
  Civ7ReadyCityViewInputSchema,
  Civ7ReadyCityViewResultSchema,
  getCiv7ReadyCityView,
} from "../src/index";
import { jsonPayloadFromCommandResult } from "../src/session/command-result";
import { boundedInteger } from "../src/validation";

type FakeTunerServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

describe("getCiv7ReadyCityView", () => {
  test("summarizes named query evidence without probing any generic city enum", async () => {
    const context = cityContext();
    const view = await runCityView(context);

    expect(context.Game.CityOperations.canStartQuery.mock.calls).toEqual([
      [testCityId, 10, 1],
      [testCityId, 10, 2],
    ]);
    expect(context.Game.CityOperations.canStart.mock.calls).toEqual([
      [testCityId, 10, { ProjectType: 5 }, false],
    ]);
    expect(context.Game.CityCommands.canStart.mock.calls).toEqual([
      [testCityId, 20, { Type: 0, ProjectType: -1, City: testCityId.id }, false],
      [testCityId, 20, { Type: 1 }, false],
      [testCityId, 20, { Type: 1, ProjectType: 50, City: testCityId.id }, false],
      [testCityId, 30, {}, false],
    ]);
    expect(view.legalOperations.map((candidate) => candidate.operationType)).toEqual([
      "BUILD",
      "BUILD",
      "CHANGE_GROWTH_MODE",
      "CHANGE_GROWTH_MODE",
      "EXPAND",
    ]);
    expect(
      view.productionCandidates.ok && view.productionCandidates.value.map((item) => item.args)
    ).toEqual([{ UnitType: 6 }, { ProjectType: 5 }]);
    expect(view.notes.some((note) => note.includes("partial summary"))).toBe(true);
    expect(Value.Check(Civ7ReadyCityViewResultSchema, view)).toBe(true);
  });

  test("uses definition type strings for every production getter and keeps BUILD indices", async () => {
    const context = cityContext();
    context.Game.CityOperations.canStartQuery.mockImplementation((_id, type, query) => {
      if (type !== 10) throw new Error("Unknown city operation was queried");
      return [{ index: query === 1 ? 4 : 6, result: { Success: true } }];
    });
    const view = await runCityView(context);
    const city = context.Cities.get();

    expect(city?.BuildQueue.getTurnsLeft.mock.calls).toEqual([
      ["BUILDING_TEST"],
      ["UNIT_TEST"],
      ["PROJECT_TEST"],
    ]);
    expect(city?.Production.getConstructibleProductionCost.mock.calls).toEqual([["BUILDING_TEST"]]);
    expect(city?.Production.getUnitProductionCost.mock.calls).toEqual([["UNIT_TEST"]]);
    expect(city?.Production.getProjectProductionCost.mock.calls).toEqual([["PROJECT_TEST"]]);
    expect(view.productionCandidates.ok && view.productionCandidates.value).toMatchObject([
      { args: { ConstructibleType: 4 }, cost: 80, turns: 3 },
      { args: { UnitType: 6 }, cost: 60, turns: 3 },
      { args: { ProjectType: 5 }, cost: 40, turns: 3 },
    ]);
  });

  test("does not guess a production getter overload when the definition name is missing", async () => {
    const context = cityContext();
    context.GameInfo.Units.lookup = () => ({ UnitType: "" });
    const view = await runCityView(context);
    const city = context.Cities.get();

    expect(city?.BuildQueue.getTurnsLeft.mock.calls).toEqual([["PROJECT_TEST"]]);
    expect(city?.Production.getUnitProductionCost).not.toHaveBeenCalled();
    expect(view.productionCandidates.ok && view.productionCandidates.value[0]).toMatchObject({
      args: { UnitType: 6 },
      cost: null,
      turns: null,
    });
  });

  test("does not promote an offered growth focus when its named validation fails", async () => {
    const context = cityContext();
    context.Game.CityCommands.canStart.mockImplementation((_id, type, args, queryOnly) => {
      if (queryOnly !== false) throw new Error("Wrong native query signature");
      if (type === 20 && args.Type === 0) return { Success: false };
      if (type === 20 && args.Type === 1) return { Success: true, Projects: [5] };
      if (type === 30 && Object.keys(args).length === 0) return { Success: true };
      throw new Error("Unknown city command was queried");
    });
    const view = await runCityView(context);

    expect(view.townFocusOptions.ok && view.townFocusOptions.value[0]).toMatchObject({
      args: { Type: 0, ProjectType: -1, City: testCityId.id },
      valid: false,
      result: { Success: false },
    });
    expect(
      view.legalOperations.filter((candidate) => candidate.operationType === "CHANGE_GROWTH_MODE")
    ).toHaveLength(1);
  });

  test("keeps growth readiness unknown when its named validation throws, without a retry", async () => {
    const context = cityContext();
    context.Game.CityCommands.canStart.mockImplementation((_id, type, args, queryOnly) => {
      if (queryOnly !== false) throw new Error("Wrong native query signature");
      if (type === 20 && args.Type === 0) throw new Error("growth validation unavailable");
      if (type === 30 && Object.keys(args).length === 0) return { Success: true };
      throw new Error("Unexpected city command was queried");
    });
    const view = await runCityView(context);

    expect(context.Game.CityCommands.canStart.mock.calls).toEqual([
      [testCityId, 20, { Type: 0, ProjectType: -1, City: testCityId.id }, false],
      [testCityId, 30, {}, false],
    ]);
    expect(view.cityId).toEqual(testCityId);
    expect(view.townFocusOptions.ok).toBe(false);
    expect(
      view.legalOperations.filter((candidate) => candidate.operationType === "CHANGE_GROWTH_MODE")
    ).toEqual([]);
    expect(view.notes.some((note) => note.includes("coverage is incomplete"))).toBe(true);
  });

  test("never queries city actions for an unresolved actor and retains its identity", async () => {
    const context = cityContext();
    context.Cities.get = () => null;
    const view = await runCityView(context);

    expect(view.cityId).toEqual(testCityId);
    expect(view.city).toEqual({ ok: true, value: null });
    expect(view.legalOperations).toEqual([]);
    expect(context.Game.CityOperations.canStartQuery).not.toHaveBeenCalled();
    expect(context.Game.CityOperations.canStart).not.toHaveBeenCalled();
    expect(context.Game.CityCommands.canStart).not.toHaveBeenCalled();
    expect(view.notes.some((note) => note.includes("availability remains unknown"))).toBe(true);
  });

  test("reports failed named coverage without retrying native signatures or clearing readiness", async () => {
    const context = cityContext();
    context.Game.CityOperations.canStartQuery.mockImplementation(() => {
      throw new Error("query unavailable");
    });
    context.Game.CityCommands.canStart.mockImplementation(() => {
      throw new Error("query unavailable");
    });
    const view = await runCityView(context);

    expect(context.Game.CityOperations.canStartQuery).toHaveBeenCalledTimes(1);
    expect(context.Game.CityCommands.canStart).toHaveBeenCalledTimes(2);
    expect(view.cityId).toEqual(testCityId);
    expect(view.legalOperations).toEqual([]);
    expect(view.productionCandidates.ok).toBe(false);
    expect(view.townFocusOptions.ok).toBe(false);
    expect(view.notes.some((note) => note.includes("coverage is incomplete"))).toBe(true);
  });

  test("reports unavailable named production queries rather than guessing a generic BUILD check", async () => {
    const context = cityContext();
    Reflect.deleteProperty(context.Game.CityOperations, "canStartQuery");
    const view = await runCityView(context);

    expect(view.cityId).toEqual(testCityId);
    expect(context.Game.CityOperations.canStart.mock.calls).toEqual([
      [testCityId, 10, { ProjectType: 5 }, false],
    ]);
    expect(view.notes.some((note) => note.includes("production coverage remains unknown"))).toBe(
      true
    );
  });

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
        }
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
            growth: {
              growthType: -284569333,
              projectType: -548685232,
            },
          },
        },
        legalOperations: [
          expect.objectContaining({
            family: "city-operation",
            operationType: "BUILD",
          }),
        ],
      });
      expect(view.notes.some((note) => note.includes("does not choose production"))).toBe(true);
      expect(view.populationPlacement.ok && view.populationPlacement.value?.notes).toContain(
        "For NEW_POPULATION, compare workablePlots against expansionCandidates; assign-worker and expand-city are different acquire-tile branches."
      );
      expect(server.received.some((message) => message.includes("readReadyCityView"))).toBe(true);
      expect(
        server.received.some((message) => message.includes('source: "Players.Cities.getCityIds"'))
      ).toBe(true);
      expect(
        server.received.some((message) =>
          message.includes("toComponentId(city.id ?? cityId) ?? cityId")
        )
      ).toBe(false);
      expect(
        server.received.some((message) =>
          message.includes("projectType: growth.projectType ?? null")
        )
      ).toBe(true);
      expect(server.received.some((message) => message.includes("sendRequest"))).toBe(false);
      expect(
        Value.Check(Civ7ReadyCityViewInputSchema, {
          cityId: { owner: 0, id: 131073, type: 1 },
          maxOperations: 96,
        })
      ).toBe(true);
      expect(Value.Check(Civ7ReadyCityViewInputSchema, { maxOperations: 257 })).toBe(false);
      expect(Value.Check(Civ7ReadyCityViewInputSchema, { rawCommand: "readReadyCityView()" })).toBe(
        false
      );
      expect(Value.Check(Civ7ReadyCityViewResultSchema, view)).toBe(true);
      expect(
        Value.Check(Civ7ReadyCityViewResultSchema, {
          ...view,
          command: "readReadyCityView()",
        })
      ).toBe(false);
      expect(
        Value.Check(Civ7ReadyCityViewResultSchema, {
          ...view,
          productionCandidates: {
            ...view.productionCandidates,
            value: [
              {
                ...(view.productionCandidates.ok ? view.productionCandidates.value[0] : {}),
                cli: "game play build-production --send",
              },
            ],
          },
        })
      ).toBe(false);
      expect(
        Value.Check(Civ7ReadyCityViewResultSchema, {
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
        })
      ).toBe(false);
    } finally {
      await server.close();
    }
  });
});

const testCityId = { owner: 0, id: 131073, type: 1 };

function cityContext() {
  const assertType = (actual: unknown, expected: string) => {
    if (actual !== expected) throw new Error("Production getter requires a definition type string");
  };
  const city = {
    id: testCityId,
    owner: 0,
    name: "Test Town",
    isTown: true,
    BuildQueue: {
      getTurnsLeft: vi.fn((...args: unknown[]) => {
        if (
          args.length !== 1 ||
          !["BUILDING_TEST", "UNIT_TEST", "PROJECT_TEST"].includes(String(args[0]))
        )
          throw new Error("Turns getter requires exactly one definition type string");
        return 3;
      }),
    },
    Production: {
      getConstructibleProductionCost: vi.fn((type: unknown) => {
        assertType(type, "BUILDING_TEST");
        return 80;
      }),
      getUnitProductionCost: vi.fn((type: unknown) => {
        assertType(type, "UNIT_TEST");
        return 60;
      }),
      getProjectProductionCost: vi.fn((type: unknown) => {
        assertType(type, "PROJECT_TEST");
        return 40;
      }),
    },
  };
  const project = { $index: 5, $hash: 50, ProjectType: "PROJECT_TEST" };
  return {
    GameContext: { localPlayerID: 0 },
    Game: {
      Notifications: { getEndTurnBlockingType: () => 0, findEndTurnBlocking: () => null },
      CityOperations: {
        canStartQuery: vi.fn((_id: unknown, type: number, query: number) => {
          if (type !== 10) throw new Error("Unknown city operation was queried");
          return query === 2 ? [{ index: 6, result: { Success: true } }] : [];
        }),
        canStart: vi.fn(
          (_id: unknown, type: number, args: Record<string, unknown>, queryOnly: boolean) => {
            if (type !== 10 || args.ProjectType !== 5 || queryOnly !== false)
              throw new Error("Unsafe BUILD query");
            return { Success: true };
          }
        ),
      },
      CityCommands: {
        canStart: vi.fn(
          (_id: unknown, type: number, args: Record<string, unknown>, queryOnly: boolean) => {
            if (queryOnly !== false) throw new Error("Wrong native query signature");
            if (
              type === 20 &&
              args.Type === 0 &&
              args.ProjectType === -1 &&
              args.City === testCityId.id
            )
              return { Success: true };
            if (type === 20 && args.Type === 1) {
              if (Object.keys(args).length === 1) return { Success: true, Projects: [5] };
              if (args.ProjectType === 50 && args.City === testCityId.id) return { Success: true };
            }
            if (type === 30 && Object.keys(args).length === 0) return { Success: true };
            throw new Error("Unknown city command was queried");
          }
        ),
      },
    },
    CityOperationTypes: new Proxy(
      { BUILD: 10, UNSAFE_ENUM: 11 },
      {
        ownKeys: () => {
          throw new Error("Generic native enum enumeration is forbidden");
        },
      }
    ),
    CityCommandTypes: new Proxy(
      { CHANGE_GROWTH_MODE: 20, EXPAND: 30, UNSAFE_ENUM: 31 },
      {
        ownKeys: () => {
          throw new Error("Generic native enum enumeration is forbidden");
        },
      }
    ),
    CityQueryType: { Constructible: 1, Unit: 2 },
    GrowthTypes: { EXPAND: 0, PROJECT: 1 },
    ProjectTypes: { NO_PROJECT: -1 },
    GameInfo: {
      Constructibles: { lookup: () => ({ ConstructibleType: "BUILDING_TEST" }) },
      Units: { lookup: () => ({ UnitType: "UNIT_TEST" }) },
      Projects: Object.assign([project], { lookup: () => project }),
    },
    Cities: { get: (): typeof city | null => city },
    Players: { get: () => ({ Cities: { getCityIds: () => [testCityId] } }) },
    UI: { Player: { getHeadSelectedCity: () => testCityId } },
  };
}

async function runCityView(context: ReturnType<typeof cityContext>) {
  return await getCiv7ReadyCityView(
    {},
    {},
    {
      boundedInteger,
      executeAppUiCommand: async ({ command }) => ({
        host: "mock",
        port: 0,
        state: { id: "65535", name: "App UI" },
        output: [String(runInNewContext(command, context, { timeout: 1_000 }))],
      }),
      parseReadyCityView: (result, label) => jsonPayloadFromCommandResult(result, label),
    }
  );
}

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
        growth: {
          growthType: -284569333,
          projectType: -548685232,
          turnsUntilGrowth: 3,
        },
        buildQueue: { currentProductionTypeHash: null, turnsLeft: null },
      },
    },
    legalOperations: [
      {
        family: "city-operation",
        operationType: "BUILD",
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
