import { runInNewContext } from "node:vm";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  Civ7MapSummaryProcedureDescriptor,
  Civ7MapSummaryProcedureSchemaArtifacts,
  callCiv7MapSummaryProcedure,
  getCiv7MapSummary,
  type MapSummaryReadDependencies,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
} from "../src/index";

describe("Civ7 map-summary procedure descriptor", () => {
  test("records the read-only map-summary atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7MapSummaryProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "map.summary.read",
      family: "map",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/map/reads.ts",
      atomFunction: "getCiv7MapSummary",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7MapSummary.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7MapSummaryProcedureDescriptor,
      Civ7MapSummaryProcedureSchemaArtifacts
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7MapSummaryProcedureDescriptor.inputFields)
    );
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7MapSummaryProcedureDescriptor.outputFields)
    );
    expect(
      Value.Check(resolved.inputSchema, {
        includeAreaRegionCounts: true,
        maxIds: 64,
      })
    ).toBe(true);
    expect(Value.Check(resolved.inputSchema, { maxIds: 1.5 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { maxIds: 1_000_001 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { state: { role: "tuner" } })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { rawCommand: "GameplayMap.getGridWidth()" })).toBe(
      false
    );
    expect(Value.Check(resolved.outputSchema, mapSummaryResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...mapSummaryResult(),
        command: "GameplayMap.getGridWidth()",
      })
    ).toBe(false);
  });

  test("calls the map-summary atom through the procedure core without touching the live tuner", async () => {
    const boundedIntegerCalls: Array<{ value: number; min: number; max: number; label: string }> =
      [];
    const executeCalls: Array<{
      host?: string;
      port?: number;
      state?: unknown;
      command: string;
    }> = [];
    const dependencies: MapSummaryReadDependencies = {
      boundedInteger: (value, min, max, label) => {
        boundedIntegerCalls.push({ value, min, max, label });
        return value;
      },
      executeCommand: async (options) => {
        executeCalls.push({
          host: options.host,
          port: options.port,
          state: options.state,
          command: options.command,
        });
        return {
          host: options.host ?? "127.0.0.1",
          port: options.port ?? 4318,
          state: { id: "1", name: "Tuner" },
          output: ["{}"],
        };
      },
      jsLiteral: JSON.stringify,
      parseMapSummary: () => mapSummaryResult(),
      probeHelperSource: () => "const probe = (fn) => ({ ok: true, value: fn() });",
    };

    const result = await callCiv7MapSummaryProcedure(
      {
        includeAreaRegionCounts: true,
        maxIds: 64,
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "map-summary-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(mapSummaryResult());
    expect(result.diagnostics).toMatchObject({
      procedureKey: "map.summary.read",
      correlationId: "map-summary-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "global",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(boundedIntegerCalls).toEqual([{ value: 64, min: 0, max: 1_000_000, label: "maxIds" }]);
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
      state: { role: "tuner" },
    });
    const command = executeCalls[0]?.command;
    expect(command).toEqual(expect.any(String));
    if (command === undefined) throw new Error("map-summary command was not captured");

    const lookupCalls: Array<string | number> = [];
    const observed = JSON.parse(
      runInNewContext(command, {
        Configuration: {},
        Game: {
          age: 0,
          getHash: () => 0,
          getTurnDate: () => "4000 BCE",
          maxTurns: 0,
          turn: 1,
        },
        GameInfo: {
          Maps: {
            lookup: (id: string | number) => {
              lookupCalls.push(id);
              return id === 370405108 ? { MapSizeType: "MAPSIZE_HUGE" } : undefined;
            },
          },
        },
        GameplayMap: {
          getGridHeight: () => 66,
          getGridWidth: () => 106,
          getMapSize: () => 370405108,
          getPlotCount: () => 6996,
          getRandomSeed: () => 33623781,
        },
        MapAreas: { getAreaIds: () => [1, 2] },
        MapRegions: { getRegionIds: () => [7] },
      }) as string
    ) as { map: { mapSizeType: { ok: boolean; value?: string } } };

    expect(observed.map.mapSizeType).toEqual({ ok: true, value: "MAPSIZE_HUGE" });
    expect(lookupCalls).toEqual([370405108]);
  });

  test("rejects invalid procedure input before map-summary dependencies run", async () => {
    let executed = false;
    const dependencies: MapSummaryReadDependencies = {
      boundedInteger: (value) => value,
      executeCommand: async () => {
        executed = true;
        throw new Error("executeCommand should not run after procedure input rejection");
      },
      jsLiteral: JSON.stringify,
      parseMapSummary: () => mapSummaryResult(),
      probeHelperSource: () => "const probe = () => ({ ok: false, error: 'unused' });",
    };

    await expect(
      callCiv7MapSummaryProcedure(
        { maxIds: 1_000_001 },
        {
          procedure: { correlationId: "map-summary-invalid-max" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "map.summary.read",
        role: "input",
      },
    });
    await expect(
      callCiv7MapSummaryProcedure(
        {
          host: "127.0.0.1",
        } as never,
        {
          procedure: { correlationId: "map-summary-context-input" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "map.summary.read",
        role: "input",
      },
    });
    expect(executed).toBe(false);
  });
});

function mapSummaryResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    map: {
      width: { ok: true as const, value: 84 },
      height: { ok: true as const, value: 54 },
      plotCount: { ok: true as const, value: 4536 },
      mapSize: { ok: true as const, value: "MAP_STANDARD" },
      mapSizeType: { ok: true as const, value: "MAPSIZE_STANDARD" },
      randomSeed: { ok: true as const, value: 111 },
    },
    game: {
      turn: { ok: true as const, value: 1 },
      age: { ok: true as const, value: 0 },
      maxTurns: { ok: true as const, value: 0 },
      turnDate: { ok: true as const, value: "4000 BCE" },
      hash: { ok: true as const, value: 0 },
    },
    areas: {
      areaIds: { ok: true as const, value: [1, 2] },
      regionIds: { ok: true as const, value: [7] },
      truncated: false,
    },
  };
}
