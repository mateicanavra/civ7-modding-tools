import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7CitySummaryUnavailableError,
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcCitySummaryResult,
  type Civ7ControlOrpcContext,
} from "../src/index";

describe("city.summary.read control-oRPC procedure", () => {
  test("calls the city summary read atom through Effect/oRPC without network transport", async () => {
    const fixture = citySummaryResult();
    const fake = fakeContext(fixture);
    const cityId = { owner: -1, id: -1, type: 1 };

    const result = await call(Civ7ControlOrpcRouter.city.summary.read, {
      playerId: 0,
      cityIds: [cityId],
      maxItems: 24,
      includeHidden: false,
    }, {
      context: fake.context,
    });

    expect(result).toEqual(fixture);
    expect(fake.citySummaryCalls).toEqual([
      {
        input: {
          playerId: 0,
          cityIds: [cityId],
          maxItems: 24,
          includeHidden: false,
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
    const fixture = citySummaryResult();
    const fake = fakeContext(fixture);
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.city.summary.read({ maxItems: 8 });

    expect(result).toEqual(fixture);
    expect(fake.citySummaryCalls).toEqual([
      {
        input: { maxItems: 8 },
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
      { playerId: 1025 },
      { maxItems: 0 },
      { maxItems: 1_001 },
      {
        cityIds: [
          { owner: -1, id: -1, type: 1, command: "Cities.get(id)" },
        ],
      },
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "tuner" } },
      { stateName: "Tuner" },
      { session: { state: "Tuner" } },
      { command: "Cities.get(id)" },
      { rawCommand: "Cities.get(id)" },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(citySummaryResult());

      await expect(
        call(Civ7ControlOrpcRouter.city.summary.read, input as never, {
          context: fake.context,
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.citySummaryCalls).toEqual([]);
    }
  });

  test("maps city summary facade failures to a tagged Effect/oRPC error without raw details", async () => {
    const context: Civ7ControlOrpcContext = {
      directControl: {
        getCiv7CitySummary: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:1:Cities.get(id)",
          );
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
        getCiv7ReadyUnitView: async () => {
          throw new Error("not used");
        },
        getCiv7UnitSummary: async () => {
          throw new Error("not used");
        },
      },
    };

    await expect(
      call(Civ7ControlOrpcRouter.city.summary.read, {}, { context }),
    ).rejects.toMatchObject({
      code: "CITY_SUMMARY_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "city.summary.read",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.city.summary.read, {}, { context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Cities.get");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first city.summary.read leaf", () => {
    expect(Civ7ControlOrpcContract.city.summary.read["~orpc"]).toMatchObject({
      meta: {
        family: "city",
        procedureKey: "city.summary.read",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(
      Civ7ControlOrpcContract.city.summary.read["~orpc"].errorMap,
    ).toHaveProperty("CITY_SUMMARY_UNAVAILABLE");
    expect(Civ7CitySummaryUnavailableError.code).toBe(
      "CITY_SUMMARY_UNAVAILABLE",
    );
  });
});

function fakeContext(
  result: Civ7ControlOrpcCitySummaryResult,
): {
  context: Civ7ControlOrpcContext;
  citySummaryCalls: Array<{
    input: unknown;
    options: Civ7ControlOrpcContext["endpointDefaults"];
  }>;
} {
  const citySummaryCalls: Array<{
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
        getCiv7CitySummary: async (input, options) => {
          citySummaryCalls.push({ input, options });
          return result;
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
        getCiv7ReadyUnitView: async () => {
          throw new Error("not used");
        },
        getCiv7UnitSummary: async () => {
          throw new Error("not used");
        },
      },
    },
    citySummaryCalls,
  };
}

function citySummaryResult(): Civ7ControlOrpcCitySummaryResult {
  const cityId = { owner: 0, id: 131_073, type: 1 };

  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    cities: [
      {
        id: cityId,
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
