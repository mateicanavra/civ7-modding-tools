import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7MapSummaryUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcMapSummaryResult,
} from "../src/index";

describe("map.summary.read control-oRPC procedure", () => {
  test("calls the map summary read atom through Effect/oRPC without network transport", async () => {
    const fixture = mapSummaryResult();
    const fake = fakeContext(fixture);

    const result = await call(Civ7ControlOrpcRouter.map.summary.read, {
      includeAreaRegionCounts: true,
      maxIds: 24,
    }, {
      context: fake.context,
    });

    expect(result).toEqual(fixture);
    expect(fake.mapSummaryCalls).toEqual([
      {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
        includeAreaRegionCounts: true,
        maxIds: 24,
      },
    ]);
  });

  test("supports the in-process server-side router client", async () => {
    const fixture = mapSummaryResult();
    const fake = fakeContext(fixture);
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.map.summary.read({ maxIds: 8 });

    expect(result).toEqual(fixture);
    expect(fake.mapSummaryCalls).toEqual([
      {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
        maxIds: 8,
      },
    ]);
  });

  test("keeps endpoint/session/state/raw command fields out of procedure input", async () => {
    const invalidInputs = [
      { maxIds: -1 },
      { maxIds: 1.5 },
      { maxIds: 1_000_001 },
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "tuner" } },
      { stateName: "Tuner" },
      { session: { state: "Tuner" } },
      { command: "GameplayMap.getGridWidth()" },
      { rawCommand: "GameplayMap.getGridWidth()" },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(mapSummaryResult());

      await expect(
        call(Civ7ControlOrpcRouter.map.summary.read, input as never, {
          context: fake.context,
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.mapSummaryCalls).toEqual([]);
    }
  });

  test("maps map summary facade failures to a tagged Effect/oRPC error without raw details", async () => {
    const context: Civ7ControlOrpcContext = {
      directControl: {
        getCiv7MapSummary: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:1:GameplayMap.getGridWidth()",
          );
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
      },
    };

    await expect(
      call(Civ7ControlOrpcRouter.map.summary.read, {}, { context }),
    ).rejects.toMatchObject({
      code: "MAP_SUMMARY_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "map.summary.read",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.map.summary.read, {}, { context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("GameplayMap");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first map.summary.read leaf", () => {
    expect(Civ7ControlOrpcContract.map.summary.read["~orpc"]).toMatchObject({
      meta: {
        family: "map",
        procedureKey: "map.summary.read",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(
      Civ7ControlOrpcContract.map.summary.read["~orpc"].errorMap,
    ).toHaveProperty("MAP_SUMMARY_UNAVAILABLE");
    expect(Civ7MapSummaryUnavailableError.code).toBe(
      "MAP_SUMMARY_UNAVAILABLE",
    );
  });
});

function fakeContext(
  result: Civ7ControlOrpcMapSummaryResult,
): {
  context: Civ7ControlOrpcContext;
  mapSummaryCalls: Array<Civ7ControlOrpcContext["endpointDefaults"] & {
    includeAreaRegionCounts?: boolean;
    maxIds?: number;
  }>;
} {
  const mapSummaryCalls: Array<
    Civ7ControlOrpcContext["endpointDefaults"] & {
      includeAreaRegionCounts?: boolean;
      maxIds?: number;
    }
  > = [];

  return {
    context: {
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      directControl: {
        getCiv7MapSummary: async (options) => {
          mapSummaryCalls.push(options);
          return result;
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
      },
    },
    mapSummaryCalls,
  };
}

function mapSummaryResult(): Civ7ControlOrpcMapSummaryResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    map: {
      width: { ok: true, value: 84 },
      height: { ok: true, value: 54 },
      plotCount: { ok: true, value: 4_536 },
      mapSize: { ok: true, value: 0 },
      randomSeed: { ok: true, value: 42 },
    },
    game: {
      turn: { ok: true, value: 12 },
      age: { ok: true, value: 0 },
      maxTurns: { ok: true, value: 500 },
      turnDate: { ok: true, value: "3400 BCE" },
      hash: { ok: true, value: 123_456 },
    },
    areas: {
      areaIds: { ok: true, value: [0, 1] },
      regionIds: { ok: true, value: [3] },
      truncated: false,
    },
  };
}
