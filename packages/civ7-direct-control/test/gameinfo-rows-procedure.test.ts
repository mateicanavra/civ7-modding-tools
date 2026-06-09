import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7GameInfoRowsProcedureDescriptor,
  Civ7GameInfoRowsProcedureSchemaArtifacts,
  callCiv7GameInfoRowsProcedure,
  getCiv7GameInfoRows,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  type GameInfoReadDependencies,
} from "../src/index";

describe("Civ7 GameInfo rows procedure descriptor", () => {
  test("records the debug/runtime GameInfo rows atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7GameInfoRowsProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "runtime.gameinfo.rows",
      family: "runtime",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/map/gameinfo.ts",
      atomFunction: "getCiv7GameInfoRows",
      playerScope: "debug-observer-only",
      normalCliProjection: "omitted",
      debugServiceProjection: "raw-diagnostic-projection",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7GameInfoRows.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7GameInfoRowsProcedureDescriptor,
      Civ7GameInfoRowsProcedureSchemaArtifacts,
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7GameInfoRowsProcedureDescriptor.inputFields),
    );
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7GameInfoRowsProcedureDescriptor.outputFields),
    );
    expect(Value.Check(resolved.inputSchema, {
      table: "Resources",
      limit: 2,
      offset: 0,
      lookup: ["RESOURCE_COTTON"],
      filter: { key: "ResourceType", equals: "RESOURCE_COTTON" },
      includeSchema: true,
      includePrimaryKeys: true,
    })).toBe(true);
    expect(Value.Check(resolved.inputSchema, { table: "Resources;DROP" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { table: "Resources", limit: 0 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { table: "Resources", limit: 1_001 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { table: "Resources", offset: -1 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, {
      table: "Resources",
      filter: { key: "Resource-Type", equals: "RESOURCE_COTTON" },
    })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { table: "Resources", host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { table: "Resources", state: { role: "tuner" } })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { table: "Resources", rawCommand: "GameInfo.Resources" })).toBe(false);
    expect(Value.Check(resolved.outputSchema, gameInfoRowsResult())).toBe(true);
    expect(Value.Check(resolved.outputSchema, {
      ...gameInfoRowsResult(),
      command: "GameInfo.Resources",
    })).toBe(false);
  });

  test("calls the GameInfo rows atom through the procedure core without touching the live tuner", async () => {
    const boundedIntegerCalls: Array<{ value: number; min: number; max: number; label: string }> = [];
    const identifiers: Array<{ value: string; label: string }> = [];
    const executeCalls: Array<{
      host?: string;
      port?: number;
      command: string;
    }> = [];
    const dependencies: GameInfoReadDependencies = {
      boundedInteger: (value, min, max, label) => {
        boundedIntegerCalls.push({ value, min, max, label });
        return value;
      },
      defaultGameInfoLimit: 100,
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
      hardGameInfoLimit: 1_000,
      jsLiteral: JSON.stringify,
      parseGameInfoRows: () => gameInfoRowsResult(),
      probeHelperSource: () => "const probe = (fn) => ({ ok: true, value: fn() });",
      validateIdentifier: (value, label) => {
        identifiers.push({ value, label });
        return value;
      },
    };

    const result = await callCiv7GameInfoRowsProcedure({
      table: "Resources",
      limit: 2,
      offset: 0,
      filter: { key: "ResourceType", equals: "RESOURCE_COTTON" },
      includeSchema: true,
      includePrimaryKeys: true,
    }, {
      directControl: {
        host: "127.0.0.1",
        port: 4318,
      },
      procedure: {
        correlationId: "gameinfo-rows-procedure-test",
      },
      dependencies,
    });

    expect(result.output).toEqual(gameInfoRowsResult());
    expect(result.diagnostics).toMatchObject({
      procedureKey: "runtime.gameinfo.rows",
      correlationId: "gameinfo-rows-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "debug-observer-only",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(identifiers).toEqual([
      { value: "Resources", label: "GameInfo table" },
      { value: "ResourceType", label: "GameInfo filter key" },
    ]);
    expect(boundedIntegerCalls).toEqual([
      { value: 2, min: 1, max: 1_000, label: "limit" },
      { value: 0, min: 0, max: 1_000_000, label: "offset" },
    ]);
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(executeCalls[0]?.command).toContain("GameInfo[input.table]");
    expect(executeCalls[0]?.command).toContain("Database.getTableData");
    expect(executeCalls[0]?.command).toContain("Database.getPrimaryKeys");
    expect(executeCalls[0]?.command).not.toContain("sendRequest");
    expect(executeCalls[0]?.command).not.toContain("sendOperation(");
  });

  test("rejects invalid procedure input before GameInfo dependencies run", async () => {
    let executed = false;
    const dependencies: GameInfoReadDependencies = {
      boundedInteger: (value) => value,
      defaultGameInfoLimit: 100,
      executeTunerCommand: async () => {
        executed = true;
        throw new Error("executeTunerCommand should not run after procedure input rejection");
      },
      hardGameInfoLimit: 1_000,
      jsLiteral: JSON.stringify,
      parseGameInfoRows: () => gameInfoRowsResult(),
      probeHelperSource: () => "const probe = () => ({ ok: false, error: 'unused' });",
      validateIdentifier: (value) => value,
    };

    await expect(callCiv7GameInfoRowsProcedure({ table: "Resources;DROP" }, {
      procedure: { correlationId: "gameinfo-rows-invalid-table" },
      dependencies,
    })).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "runtime.gameinfo.rows",
        role: "input",
      },
    });
    await expect(callCiv7GameInfoRowsProcedure({
      table: "Resources",
      rawCommand: "GameInfo.Resources",
    } as never, {
      procedure: { correlationId: "gameinfo-rows-raw-input" },
      dependencies,
    })).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "runtime.gameinfo.rows",
        role: "input",
      },
    });
    expect(executed).toBe(false);
  });
});

function gameInfoRowsResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    table: "Resources",
    source: "GameInfo",
    rows: [{ ResourceType: "RESOURCE_COTTON", Name: "LOC_RESOURCE_COTTON_NAME" }],
    limit: 2,
    offset: 0,
    total: { ok: true as const, value: 1 },
    omittedUnknown: false,
    schema: { ok: true as const, value: { columns: ["ResourceType"] } },
    primaryKeys: { ok: true as const, value: ["ResourceType"] },
  };
}
