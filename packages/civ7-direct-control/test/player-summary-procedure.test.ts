import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  type Civ7PlayerSummaryDependencies,
  Civ7PlayerSummaryProcedureDescriptor,
  Civ7PlayerSummaryProcedureSchemaArtifacts,
  callCiv7PlayerSummaryProcedure,
  getCiv7PlayerSummary,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
} from "../src/index";

import { schemaPropertyKeys } from "./support/procedure-schema";

describe("Civ7 player-summary procedure descriptor", () => {
  test("records the read-only player-summary atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7PlayerSummaryProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "player.summary.read",
      family: "player",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/summaries.ts",
      atomFunction: "getCiv7PlayerSummary",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7PlayerSummary.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7PlayerSummaryProcedureDescriptor,
      Civ7PlayerSummaryProcedureSchemaArtifacts
    );
    expect(schemaPropertyKeys(resolved.inputSchema)).toEqual(
      expect.arrayContaining(Civ7PlayerSummaryProcedureDescriptor.inputFields)
    );
    expect(schemaPropertyKeys(resolved.outputSchema)).toEqual(
      expect.arrayContaining(Civ7PlayerSummaryProcedureDescriptor.outputFields)
    );
    expect(
      Value.Check(resolved.inputSchema, {
        playerIds: [0],
        includeUnits: true,
        includeCities: true,
        maxItems: 2,
      })
    ).toBe(true);
    expect(Value.Check(resolved.inputSchema, { playerIds: [1025] })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { maxItems: 513 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { state: { role: "tuner" } })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { rawCommand: "Players.getAliveIds()" })).toBe(false);
    expect(Value.Check(resolved.outputSchema, playerSummaryResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...playerSummaryResult(),
        command: "Players.getAliveIds()",
      })
    ).toBe(false);
  });

  test("calls the player-summary atom through the procedure core without sending operations", async () => {
    const boundedIntegerCalls: Array<{ value: number; min: number; max: number; label: string }> =
      [];
    const validatePlayerIdCalls: number[] = [];
    const executeCalls: Array<{
      host?: string;
      port?: number;
      command: string;
    }> = [];
    const dependencies: Civ7PlayerSummaryDependencies = {
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
      parsePlayerSummary: () => playerSummaryResult(),
      probeHelperSource: () => "const probe = (fn) => ({ ok: true, value: fn() });",
      validatePlayerId: (playerId) => {
        validatePlayerIdCalls.push(playerId);
        return playerId;
      },
    };

    const result = await callCiv7PlayerSummaryProcedure(
      {
        playerIds: [0],
        includeUnits: true,
        includeCities: true,
        maxItems: 2,
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "player-summary-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(playerSummaryResult());
    expect(result.diagnostics).toMatchObject({
      procedureKey: "player.summary.read",
      correlationId: "player-summary-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(boundedIntegerCalls).toEqual([{ value: 2, min: 1, max: 512, label: "maxItems" }]);
    expect(validatePlayerIdCalls).toEqual([0]);
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(executeCalls[0]?.command).toContain("Players.getAliveIds");
    expect(executeCalls[0]?.command).toContain("Players.get(id)");
    expect(executeCalls[0]?.command).toContain('"playerIds":[0]');
    expect(executeCalls[0]?.command).not.toContain("sendRequest");
    expect(executeCalls[0]?.command).not.toContain("sendOperation(");
  });

  test("rejects invalid procedure input before player-summary dependencies run", async () => {
    let executed = false;
    const dependencies: Civ7PlayerSummaryDependencies = {
      boundedInteger: (value) => value,
      executeTunerCommand: async () => {
        executed = true;
        throw new Error("executeTunerCommand should not run after procedure input rejection");
      },
      jsLiteral: JSON.stringify,
      parsePlayerSummary: () => playerSummaryResult(),
      probeHelperSource: () => "const probe = (fn) => ({ ok: true, value: fn() });",
      validatePlayerId: (playerId) => playerId,
    };

    for (const input of [
      { playerIds: [1025] },
      { maxItems: 513 },
      { playerIds: [0], command: "Players.getAliveIds()" },
      { state: { role: "tuner" } },
      { rawCommand: "Players.getAliveIds()" },
    ]) {
      await expect(
        callCiv7PlayerSummaryProcedure(input as never, {
          procedure: { correlationId: "player-summary-invalid-input" },
          dependencies,
        })
      ).rejects.toMatchObject({
        code: "procedure-descriptor-invalid",
        details: {
          reason: "input-schema-invalid",
          procedureKey: "player.summary.read",
          role: "input",
        },
      });
    }
    expect(executed).toBe(false);
  });
});

function playerSummaryResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    players: [
      {
        id: 0,
        leaderName: { ok: true as const, value: "Amina" },
        civilizationName: { ok: true as const, value: "LOC_CIVILIZATION_AKSUM_NAME" },
        isHuman: { ok: true as const, value: true },
        isAlive: { ok: true as const, value: true },
        isTurnActive: { ok: true as const, value: true },
        unitIds: { ok: true as const, value: [{ owner: 0, id: 65536, type: 26 }] },
        cityIds: { ok: true as const, value: [{ owner: 0, id: 131073, type: 1 }] },
      },
    ],
    omitted: 0,
  };
}
