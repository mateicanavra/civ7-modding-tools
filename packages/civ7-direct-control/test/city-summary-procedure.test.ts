import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  type Civ7CitySummaryDependencies,
  Civ7CitySummaryProcedureDescriptor,
  Civ7CitySummaryProcedureSchemaArtifacts,
  callCiv7CitySummaryProcedure,
  getCiv7CitySummary,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
} from "../src/index";

describe("Civ7 city-summary procedure descriptor", () => {
  test("records the read-only city-summary atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7CitySummaryProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "city.summary.read",
      family: "city",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/summaries.ts",
      atomFunction: "getCiv7CitySummary",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7CitySummary.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7CitySummaryProcedureDescriptor,
      Civ7CitySummaryProcedureSchemaArtifacts
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7CitySummaryProcedureDescriptor.inputFields)
    );
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7CitySummaryProcedureDescriptor.outputFields)
    );
    expect(
      Value.Check(resolved.inputSchema, {
        playerId: 0,
        cityIds: [{ owner: -1, id: -1, type: 1 }],
        maxItems: 2,
      })
    ).toBe(true);
    expect(Value.Check(resolved.inputSchema, { playerId: 1025 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { maxItems: 1_001 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { state: { role: "tuner" } })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { rawCommand: "Cities.get(id)" })).toBe(false);
    expect(Value.Check(resolved.outputSchema, citySummaryResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...citySummaryResult(),
        command: "Cities.get(id)",
      })
    ).toBe(false);
  });

  test("calls the city-summary atom through the procedure core without sending operations", async () => {
    const boundedIntegerCalls: Array<{ value: number; min: number; max: number; label: string }> =
      [];
    const validatePlayerIdCalls: number[] = [];
    const executeCalls: Array<{
      host?: string;
      port?: number;
      command: string;
    }> = [];
    const dependencies: Civ7CitySummaryDependencies = {
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
      parseCitySummary: () => citySummaryResult(),
      probeHelperSource: () => "const probe = (fn) => ({ ok: true, value: fn() });",
      validatePlayerId: (playerId) => {
        validatePlayerIdCalls.push(playerId);
        return playerId;
      },
    };

    const result = await callCiv7CitySummaryProcedure(
      {
        playerIds: [0],
        playerId: 0,
        cityIds: [{ owner: -1, id: -1, type: 1 }],
        maxItems: 2,
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "city-summary-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(citySummaryResult());
    expect(result.diagnostics).toMatchObject({
      procedureKey: "city.summary.read",
      correlationId: "city-summary-procedure-test",
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
    expect(executeCalls[0]?.command).toContain("Players.Cities");
    expect(executeCalls[0]?.command).toContain("Cities.get");
    expect(executeCalls[0]?.command).toContain('"owner":-1');
    expect(executeCalls[0]?.command).not.toContain("sendRequest");
    expect(executeCalls[0]?.command).not.toContain("sendOperation(");
  });

  test("rejects invalid procedure input before city-summary dependencies run", async () => {
    let executed = false;
    const dependencies: Civ7CitySummaryDependencies = {
      boundedInteger: (value) => value,
      executeTunerCommand: async () => {
        executed = true;
        throw new Error("executeTunerCommand should not run after procedure input rejection");
      },
      jsLiteral: JSON.stringify,
      parseCitySummary: () => citySummaryResult(),
      probeHelperSource: () => "const probe = (fn) => ({ ok: true, value: fn() });",
      validatePlayerId: (playerId) => playerId,
    };

    for (const input of [
      { playerId: 1025 },
      { maxItems: 1_001 },
      { cityIds: [{ owner: 0, id: 1, type: 1, command: "Cities.get" }] },
      { state: { role: "tuner" } },
      { rawCommand: "Cities.get(id)" },
    ]) {
      await expect(
        callCiv7CitySummaryProcedure(input as never, {
          procedure: { correlationId: "city-summary-invalid-input" },
          dependencies,
        })
      ).rejects.toMatchObject({
        code: "procedure-descriptor-invalid",
        details: {
          reason: "input-schema-invalid",
          procedureKey: "city.summary.read",
          role: "input",
        },
      });
    }
    expect(executed).toBe(false);
  });
});

function citySummaryResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    cities: [
      {
        id: { owner: -1, id: -1, type: 1 },
        owner: { ok: true as const, value: 0 },
        name: { ok: true as const, value: "Dur-Sharrukin" },
        location: { ok: true as const, value: { x: 22, y: 31 } },
        population: { ok: true as const, value: 4 },
        growth: { ok: true as const, value: { food: 12 } },
        production: { ok: true as const, value: { turnsLeft: 3 } },
      },
    ],
    omitted: 0,
  };
}
