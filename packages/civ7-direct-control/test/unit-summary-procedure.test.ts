import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  type Civ7UnitSummaryDependencies,
  Civ7UnitSummaryProcedureDescriptor,
  Civ7UnitSummaryProcedureSchemaArtifacts,
  callCiv7UnitSummaryProcedure,
  getCiv7UnitSummary,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
} from "../src/index";

import { schemaPropertyKeys } from "./support/procedure-schema";

describe("Civ7 unit-summary procedure descriptor", () => {
  test("records the read-only unit-summary atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7UnitSummaryProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "unit.summary.read",
      family: "unit",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/summaries.ts",
      atomFunction: "getCiv7UnitSummary",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7UnitSummary.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7UnitSummaryProcedureDescriptor,
      Civ7UnitSummaryProcedureSchemaArtifacts
    );
    expect(schemaPropertyKeys(resolved.inputSchema)).toEqual(
      expect.arrayContaining(Civ7UnitSummaryProcedureDescriptor.inputFields)
    );
    expect(schemaPropertyKeys(resolved.outputSchema)).toEqual(
      expect.arrayContaining(Civ7UnitSummaryProcedureDescriptor.outputFields)
    );
    expect(
      Value.Check(resolved.inputSchema, {
        playerId: 0,
        unitIds: [{ owner: -1, id: -1, type: 26 }],
        maxItems: 2,
      })
    ).toBe(true);
    expect(Value.Check(resolved.inputSchema, { playerId: 1025 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { maxItems: 1_001 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { state: { role: "tuner" } })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { rawCommand: "Units.get(id)" })).toBe(false);
    expect(Value.Check(resolved.outputSchema, unitSummaryResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...unitSummaryResult(),
        command: "Units.get(id)",
      })
    ).toBe(false);
  });

  test("calls the unit-summary atom through the procedure core without sending operations", async () => {
    const boundedIntegerCalls: Array<{ value: number; min: number; max: number; label: string }> =
      [];
    const validatePlayerIdCalls: number[] = [];
    const executeCalls: Array<{
      host?: string;
      port?: number;
      command: string;
    }> = [];
    const dependencies: Civ7UnitSummaryDependencies = {
      boundedInteger: (value, min, max, label) => {
        boundedIntegerCalls.push({ value, min, max, label });
        return value;
      },
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
      jsLiteral: JSON.stringify,
      parseUnitSummary: () => unitSummaryResult(),
      probeHelperSource: () => "const probe = (fn) => ({ ok: true, value: fn() });",
      validatePlayerId: (playerId) => {
        validatePlayerIdCalls.push(playerId);
        return playerId;
      },
    };

    const result = await callCiv7UnitSummaryProcedure(
      {
        playerIds: [0],
        playerId: 0,
        unitIds: [{ owner: -1, id: -1, type: 26 }],
        maxItems: 2,
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "unit-summary-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(unitSummaryResult());
    expect(result.diagnostics).toMatchObject({
      procedureKey: "unit.summary.read",
      correlationId: "unit-summary-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(boundedIntegerCalls).toEqual([{ value: 2, min: 1, max: 1_000, label: "maxItems" }]);
    expect(validatePlayerIdCalls).toEqual([0, 0]);
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(executeCalls[0]?.command).toContain("Players.Units");
    expect(executeCalls[0]?.command).toContain("Units.get");
    expect(executeCalls[0]?.command).toContain('"owner":-1');
    expect(executeCalls[0]?.command).not.toContain("sendRequest");
    expect(executeCalls[0]?.command).not.toContain("sendOperation(");
  });

  test("rejects invalid procedure input before unit-summary dependencies run", async () => {
    let executed = false;
    const dependencies: Civ7UnitSummaryDependencies = {
      boundedInteger: (value) => value,
      executeTunerCommand: async () => {
        executed = true;
        throw new Error("executeTunerCommand should not run after procedure input rejection");
      },
      jsLiteral: JSON.stringify,
      parseUnitSummary: () => unitSummaryResult(),
      probeHelperSource: () => "const probe = (fn) => ({ ok: true, value: fn() });",
      validatePlayerId: (playerId) => playerId,
    };

    for (const input of [
      { playerId: 1025 },
      { maxItems: 1_001 },
      { unitIds: [{ owner: 0, id: 1, type: 26, command: "Units.get" }] },
      { state: { role: "tuner" } },
      { rawCommand: "Units.get(id)" },
    ]) {
      await expect(
        callCiv7UnitSummaryProcedure(input as never, {
          procedure: { correlationId: "unit-summary-invalid-input" },
          dependencies,
        })
      ).rejects.toMatchObject({
        code: "procedure-descriptor-invalid",
        details: {
          reason: "input-schema-invalid",
          procedureKey: "unit.summary.read",
          role: "input",
        },
      });
    }
    expect(executed).toBe(false);
  });
});

function unitSummaryResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    units: [
      {
        id: { owner: -1, id: -1, type: 26 },
        owner: { ok: true as const, value: 0 },
        name: { ok: true as const, value: "Scout" },
        type: { ok: true as const, value: "UNIT_SCOUT" },
        location: { ok: true as const, value: { x: 10, y: 11 } },
        health: { ok: true as const, value: 100 },
        damage: { ok: true as const, value: 0 },
        movement: { ok: true as const, value: 2 },
        activity: { ok: true as const, value: "ACTIVE" },
      },
    ],
    omitted: 0,
  };
}
