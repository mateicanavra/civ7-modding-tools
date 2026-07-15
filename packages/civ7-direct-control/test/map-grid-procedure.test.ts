import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  type Civ7MapBounds,
  Civ7MapGridProcedureDescriptor,
  Civ7MapGridProcedureSchemaArtifacts,
  type Civ7MapGridResult,
  type Civ7MapLocation,
  callCiv7MapGridProcedure,
  getCiv7MapGrid,
  type MapGridReadDependencies,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
} from "../src/index";

import { schemaPropertyKeys } from "./support/procedure-schema";

describe("Civ7 map-grid procedure descriptor", () => {
  test("records the read-only map-grid atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7MapGridProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "map.grid.read",
      family: "map",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/map/reads.ts",
      atomFunction: "getCiv7MapGrid",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7MapGrid.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7MapGridProcedureDescriptor,
      Civ7MapGridProcedureSchemaArtifacts
    );
    expect(schemaPropertyKeys(resolved.inputSchema)).toEqual(
      expect.arrayContaining(Civ7MapGridProcedureDescriptor.inputFields)
    );
    expect(schemaPropertyKeys(resolved.outputSchema)).toEqual(
      expect.arrayContaining(Civ7MapGridProcedureDescriptor.outputFields)
    );
    expect(
      Value.Check(resolved.inputSchema, {
        bounds: { x: 0, y: 0, width: 2, height: 1 },
        fields: ["terrain", "visibility"],
        maxPlots: 1,
      })
    ).toBe(true);
    expect(
      Value.Check(resolved.inputSchema, {
        locations: [{ x: 0, y: 0 }],
        fields: ["terrain"],
      })
    ).toBe(true);
    expect(Value.Check(resolved.inputSchema, { fields: ["terrain"] })).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, {
        bounds: { x: 0, y: 0, width: 2, height: 1 },
        locations: [{ x: 0, y: 0 }],
        fields: ["terrain"],
      })
    ).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, {
        bounds: { x: 0, y: 0, width: 10_001, height: 1 },
        fields: ["terrain"],
      })
    ).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, {
        locations: [{ x: 0, y: 1.5 }],
        fields: ["terrain"],
      })
    ).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, {
        bounds: { x: 0, y: 0, width: 2, height: 1 },
        fields: ["enemy"],
      })
    ).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, {
        bounds: { x: 0, y: 0, width: 2, height: 1 },
        fields: ["terrain"],
        maxPlots: 10_001,
      })
    ).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, {
        bounds: { x: 0, y: 0, width: 2, height: 1 },
        fields: ["terrain"],
        host: "127.0.0.1",
      })
    ).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, {
        bounds: { x: 0, y: 0, width: 2, height: 1 },
        fields: ["terrain"],
        state: { role: "tuner" },
      })
    ).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, {
        bounds: { x: 0, y: 0, width: 2, height: 1 },
        fields: ["terrain"],
        rawCommand: "GameplayMap.getGridWidth()",
      })
    ).toBe(false);
    expect(Value.Check(resolved.outputSchema, mapGridResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...mapGridResult(),
        session: { stateName: "Tuner" },
      })
    ).toBe(false);
  });

  test("calls the map-grid atom through the procedure core without touching the live tuner", async () => {
    const boundedIntegerCalls: Array<{ value: number; min: number; max: number; label: string }> =
      [];
    const validatedBounds: Civ7MapBounds[] = [];
    const validatedLocations: Civ7MapLocation[] = [];
    const executeCalls: Array<{
      host?: string;
      port?: number;
      command: string;
    }> = [];
    const dependencies: MapGridReadDependencies = {
      boundedInteger: (value, min, max, label) => {
        boundedIntegerCalls.push({ value, min, max, label });
        return value;
      },
      defaultMapGridMaxPlots: 512,
      executeTunerCommand: async (options) => {
        executeCalls.push({
          host: options.host,
          port: options.port,
          command: options.command,
        });
        return {
          host: options.host ?? "127.0.0.1",
          port: options.port ?? 4318,
          state: { id: "1", name: "Tuner" },
          output: ["{}"],
        };
      },
      hardMapGridMaxPlots: 10_000,
      jsLiteral: JSON.stringify,
      parseMapGrid: () => mapGridResult(),
      probeHelperSource: () => "const probe = (fn) => ({ ok: true, value: fn() });",
      validateMapBounds: (bounds) => {
        validatedBounds.push(bounds);
      },
      validateMapLocation: (location) => {
        validatedLocations.push(location);
      },
    };

    const result = await callCiv7MapGridProcedure(
      {
        bounds: { x: 0, y: 0, width: 2, height: 1 },
        fields: ["terrain"],
        maxPlots: 1,
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "map-grid-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(mapGridResult());
    expect(result.diagnostics).toMatchObject({
      procedureKey: "map.grid.read",
      correlationId: "map-grid-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(boundedIntegerCalls).toEqual([{ value: 1, min: 1, max: 10_000, label: "maxPlots" }]);
    expect(validatedBounds).toEqual([{ x: 0, y: 0, width: 2, height: 1 }]);
    expect(validatedLocations).toEqual([]);
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(executeCalls[0]?.command).toContain("locationsFromBounds");
    expect(executeCalls[0]?.command).toContain("break outer");
    expect(executeCalls[0]?.command).toContain('"maxPlots":1');
    expect(executeCalls[0]?.command).not.toContain("sendRequest");
    expect(executeCalls[0]?.command).not.toContain("sendOperation(");
  });

  test("rejects invalid procedure input before map-grid dependencies run", async () => {
    let executed = false;
    const dependencies: MapGridReadDependencies = {
      boundedInteger: (value) => value,
      defaultMapGridMaxPlots: 512,
      executeTunerCommand: async () => {
        executed = true;
        throw new Error("executeTunerCommand should not run after procedure input rejection");
      },
      hardMapGridMaxPlots: 10_000,
      jsLiteral: JSON.stringify,
      parseMapGrid: () => mapGridResult(),
      probeHelperSource: () => "const probe = () => ({ ok: false, error: 'unused' });",
      validateMapBounds: () => undefined,
      validateMapLocation: () => undefined,
    };

    await expect(
      callCiv7MapGridProcedure(
        {
          bounds: { x: 0, y: 0, width: 2, height: 1 },
          locations: [{ x: 0, y: 0 }],
          fields: ["terrain"],
        },
        {
          procedure: { correlationId: "map-grid-exclusive-input" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "map.grid.read",
        role: "input",
      },
    });
    await expect(
      callCiv7MapGridProcedure(
        {
          fields: ["terrain"],
        } as never,
        {
          procedure: { correlationId: "map-grid-missing-shape" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "map.grid.read",
        role: "input",
      },
    });
    expect(executed).toBe(false);
  });
});

function mapGridResult(): Civ7MapGridResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    bounds: { x: 0, y: 0, width: 2, height: 1 },
    fields: ["terrain"],
    plotCount: 2,
    omitted: 1,
    hiddenInfoPolicy: "not-player-scoped",
    map: {
      width: { ok: true as const, value: 84 },
      height: { ok: true as const, value: 54 },
    },
    plots: [
      {
        location: { x: 0, y: 0, index: { ok: true as const, value: 0 } },
        hiddenInfoPolicy: "not-player-scoped",
        facts: {
          terrain: { ok: true as const, value: 4 },
        },
      },
    ],
  };
}
