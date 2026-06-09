import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7ReadyCityViewUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcReadyCityViewResult,
} from "../src/index";

describe("city.ready.view control-oRPC procedure", () => {
  test("calls the ready-city read atom through Effect/oRPC without network transport", async () => {
    const fixture = readyCityViewResult();
    const fake = fakeContext(fixture);
    const cityId = { owner: 0, id: 131_073, type: 1 };

    const result = await call(Civ7ControlOrpcRouter.city.ready.view, {
      cityId,
      maxOperations: 96,
    }, {
      context: fake.context,
    });

    expect(result).toEqual(fixture);
    expect(fake.readyCityCalls).toEqual([
      {
        input: {
          cityId,
          maxOperations: 96,
        },
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
  });

  test("supports the in-process server-side router client", async () => {
    const fixture = readyCityViewResult();
    const fake = fakeContext(fixture);
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.city.ready.view({ maxOperations: 8 });

    expect(result).toEqual(fixture);
    expect(fake.readyCityCalls).toEqual([
      {
        input: { maxOperations: 8 },
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
  });

  test("keeps endpoint/session/state/raw command fields out of procedure input", async () => {
    const invalidInputs = [
      { maxOperations: 0 },
      { maxOperations: 257 },
      { cityId: { owner: 0, id: 131_073, type: "city" } },
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "app-ui" } },
      { stateName: "App UI" },
      { session: { state: "App UI" } },
      { command: "readReadyCityView()" },
      { rawCommand: "readReadyCityView()" },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(readyCityViewResult());

      await expect(
        call(Civ7ControlOrpcRouter.city.ready.view, input as never, {
          context: fake.context,
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.readyCityCalls).toEqual([]);
    }
  });

  test("maps ready-city facade failures to a tagged Effect/oRPC error without raw details", async () => {
    const context: Civ7ControlOrpcContext = {
      directControl: {
        getCiv7CitySummary: async () => {
          throw new Error("not used");
        },
        getCiv7MapSummary: async () => {
          throw new Error("not used");
        },
        getCiv7PlayerSummary: async () => {
          throw new Error("not used");
        },
        getCiv7PlayableStatus: async () => {
          throw new Error("not used");
        },
        getCiv7PlayNotificationView: async () => {
          throw new Error("not used");
        },
        getCiv7ReadyCityView: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:65535:readReadyCityView()",
          );
        },
        getCiv7ReadyUnitView: async () => {
          throw new Error("not used");
        },
        getCiv7UnitSummary: async () => {
          throw new Error("not used");
        },
      },
    };

    await expect(
      call(Civ7ControlOrpcRouter.city.ready.view, {}, { context }),
    ).rejects.toMatchObject({
      code: "READY_CITY_VIEW_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "city.ready.view",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.city.ready.view, {}, { context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("readReadyCityView");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first city.ready.view leaf", () => {
    expect(Civ7ControlOrpcContract.city.ready.view["~orpc"]).toMatchObject({
      meta: {
        family: "city",
        procedureKey: "city.ready.view",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(
      Civ7ControlOrpcContract.city.ready.view["~orpc"].errorMap,
    ).toHaveProperty("READY_CITY_VIEW_UNAVAILABLE");
    expect(Civ7ReadyCityViewUnavailableError.code).toBe(
      "READY_CITY_VIEW_UNAVAILABLE",
    );
  });
});

function fakeContext(
  result: Civ7ControlOrpcReadyCityViewResult,
): {
  context: Civ7ControlOrpcContext;
  readyCityCalls: Array<{
    input: unknown;
    options: Civ7ControlOrpcContext["endpointDefaults"];
  }>;
} {
  const readyCityCalls: Array<{
    input: unknown;
    options: Civ7ControlOrpcContext["endpointDefaults"];
  }> = [];

  return {
    context: {
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      directControl: {
        getCiv7CitySummary: async () => {
          throw new Error("not used");
        },
        getCiv7MapSummary: async () => {
          throw new Error("not used");
        },
        getCiv7PlayerSummary: async () => {
          throw new Error("not used");
        },
        getCiv7PlayableStatus: async () => {
          throw new Error("not used");
        },
        getCiv7PlayNotificationView: async () => {
          throw new Error("not used");
        },
        getCiv7ReadyCityView: async (input, options) => {
          readyCityCalls.push({ input, options });
          return result;
        },
        getCiv7ReadyUnitView: async () => {
          throw new Error("not used");
        },
        getCiv7UnitSummary: async () => {
          throw new Error("not used");
        },
      },
    },
    readyCityCalls,
  };
}

function readyCityViewResult(): Civ7ControlOrpcReadyCityViewResult {
  const cityId = { owner: 0, id: 131_073, type: 1 };

  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
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
        name: "Dur-Sharrukin",
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
          type: 713_967_338,
          typeName: "BUILDING_WALLS",
          name: "LOC_BUILDING_WALLS_NAME",
          args: { ConstructibleType: 713_967_338 },
          valid: true,
          result: { Success: true },
          cli: "game play build-production --city-id '<city-id>' --constructible-type 713967338",
        },
      ],
    },
    townFocusOptions: {
      ok: true,
      value: [
        {
          name: "LOC_PROJECT_FISHING_TOWN_NAME",
          description: "LOC_PROJECT_FISHING_TOWN_DESCRIPTION",
          args: { Type: -284_569_333 },
          valid: true,
          result: { Success: true },
          cli: "game play set-town-focus --city-id '<city-id>' --growth-type -284569333",
        },
      ],
    },
    populationPlacement: {
      ok: true,
      value: {
        isReadyToPlacePopulation: { ok: true, value: true },
        cityWorkerCap: { ok: true, value: 4 },
        yieldTypeOrder: ["Food", "Production", "Gold"],
        allPlacementInfo: {
          ok: true,
          value: [{ PlotIndex: 1457, IsBlocked: false }],
        },
        workablePlotIndexes: { ok: true, value: [1457] },
        blockedPlotIndexes: { ok: true, value: [] },
        workablePlots: { ok: true, value: [{ index: 1457, x: 22, y: 31 }] },
        expansionCandidates: {
          ok: true,
          value: [{ index: 1458, x: 23, y: 31 }],
        },
        expansionResult: { ok: true, value: { Success: true, Plots: [1458] } },
        cliHints: [
          "game play assign-worker --player-id <id> --location <plot-index>",
          "game play expand-city --city-id '<city-id>' --x <x> --y <y>",
        ],
      },
    },
    notes: [
      "Read-only ready-city view. This view intentionally does not choose production.",
    ],
  };
}
