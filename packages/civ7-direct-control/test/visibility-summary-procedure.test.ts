import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  Civ7VisibilitySummaryProcedureDescriptor,
  Civ7VisibilitySummaryProcedureSchemaArtifacts,
  callCiv7VisibilitySummaryProcedure,
  getCiv7VisibilitySummary,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  type VisibilityReadDependencies,
} from "../src/index";

import { schemaPropertyKeys } from "./support/procedure-schema";

describe("Civ7 visibility summary procedure descriptor", () => {
  test("records the visibility summary atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7VisibilitySummaryProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "map.visibility.read",
      family: "map",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/map/visibility.ts",
      atomFunction: "getCiv7VisibilitySummary",
      playerScope: "local-player-scoped",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7VisibilitySummary.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7VisibilitySummaryProcedureDescriptor,
      Civ7VisibilitySummaryProcedureSchemaArtifacts
    );
    expect(schemaPropertyKeys(resolved.inputSchema)).toEqual(
      expect.arrayContaining(Civ7VisibilitySummaryProcedureDescriptor.inputFields)
    );
    expect(schemaPropertyKeys(resolved.outputSchema)).toEqual(
      expect.arrayContaining(Civ7VisibilitySummaryProcedureDescriptor.outputFields)
    );
    expect(
      Value.Check(resolved.inputSchema, {
        playerId: 0,
        bounds: { x: 0, y: 0, width: 2, height: 1 },
        includeGrid: true,
        maxPlots: 2,
      })
    ).toBe(true);
    expect(Value.Check(resolved.inputSchema, { playerId: 0 })).toBe(true);
    expect(Value.Check(resolved.inputSchema, { playerId: 1.5 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { playerId: 0, includeGrid: true })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { playerId: 0, host: "127.0.0.1" })).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, {
        playerId: 0,
        rawCommand: "Visibility.revealAllPlots(0)",
      })
    ).toBe(false);
    expect(Value.Check(resolved.outputSchema, visibilitySummaryResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...visibilitySummaryResult(),
        command: "Visibility.revealAllPlots(0)",
      })
    ).toBe(false);
  });

  test("calls the visibility summary atom through the procedure core without reveal mutation", async () => {
    const boundedIntegerCalls: Array<{ value: number; min: number; max: number; label: string }> =
      [];
    const boundsCalls: Array<{ x: number; y: number; width: number; height: number }> = [];
    const playerIds: number[] = [];
    const executeCalls: Array<{
      host?: string;
      port?: number;
      command: string;
    }> = [];
    const dependencies: VisibilityReadDependencies = {
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
      parseVisibilitySummary: () => visibilitySummaryResult(),
      probeHelperSource: () => "const probe = (fn) => ({ ok: true, value: fn() });",
      validateMapBounds: (bounds) => {
        boundsCalls.push(bounds);
      },
      validatePlayerId: (playerId) => {
        playerIds.push(playerId);
        return playerId;
      },
    };

    const result = await callCiv7VisibilitySummaryProcedure(
      {
        playerId: 0,
        bounds: { x: 0, y: 0, width: 2, height: 1 },
        includeGrid: true,
        maxPlots: 2,
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "visibility-summary-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(visibilitySummaryResult());
    expect(result.diagnostics).toMatchObject({
      procedureKey: "map.visibility.read",
      correlationId: "visibility-summary-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(playerIds).toEqual([0]);
    expect(boundedIntegerCalls).toEqual([{ value: 2, min: 1, max: 10_000, label: "maxPlots" }]);
    expect(boundsCalls).toEqual([{ x: 0, y: 0, width: 2, height: 1 }]);
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(executeCalls[0]?.command).toContain("GameplayMap.getRevealedState");
    expect(executeCalls[0]?.command).toContain("Visibility.isVisible");
    expect(executeCalls[0]?.command).toContain("getPlotsRevealedCount");
    expect(executeCalls[0]?.command).not.toContain("Visibility.revealAllPlots");
    expect(executeCalls[0]?.command).not.toContain("sendRequest");
    expect(executeCalls[0]?.command).not.toContain("sendOperation(");
  });

  test("rejects invalid procedure input before visibility dependencies run", async () => {
    let executed = false;
    const dependencies: VisibilityReadDependencies = {
      boundedInteger: (value) => value,
      defaultMapGridMaxPlots: 512,
      executeTunerCommand: async () => {
        executed = true;
        throw new Error("executeTunerCommand should not run after procedure input rejection");
      },
      hardMapGridMaxPlots: 10_000,
      jsLiteral: JSON.stringify,
      parseVisibilitySummary: () => visibilitySummaryResult(),
      probeHelperSource: () => "const probe = () => ({ ok: false, error: 'unused' });",
      validateMapBounds: () => undefined,
      validatePlayerId: (playerId) => playerId,
    };

    await expect(
      callCiv7VisibilitySummaryProcedure(
        {
          playerId: 0,
          includeGrid: true,
        },
        {
          procedure: { correlationId: "visibility-summary-missing-bounds" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "map.visibility.read",
        role: "input",
      },
    });
    await expect(
      callCiv7VisibilitySummaryProcedure(
        {
          playerId: 0,
          rawCommand: "Visibility.revealAllPlots(0)",
        } as never,
        {
          procedure: { correlationId: "visibility-summary-raw-input" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "map.visibility.read",
        role: "input",
      },
    });
    expect(executed).toBe(false);
  });
});

function visibilitySummaryResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    playerId: 0,
    numPlotsRevealed: { ok: true as const, value: 10 },
    numPlotsVisible: { ok: true as const, value: 2 },
    mapPlotCount: { ok: true as const, value: 2 },
    counts: { "1": 2 },
    grid: {
      bounds: { x: 0, y: 0, width: 2, height: 1 },
      plotCount: 2,
      omitted: 0,
      states: [
        {
          x: 0,
          y: 0,
          state: { ok: true as const, value: 1 },
          visible: { ok: true as const, value: true },
        },
        {
          x: 1,
          y: 0,
          state: { ok: true as const, value: 1 },
          visible: { ok: true as const, value: true },
        },
      ],
    },
  };
}
