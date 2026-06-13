import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7PlotSnapshotProcedureDescriptor,
  Civ7PlotSnapshotProcedureSchemaArtifacts,
  callCiv7PlotSnapshotProcedure,
  getCiv7PlotSnapshot,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  type Civ7MapLocation,
  type PlotSnapshotReadDependencies,
} from "../src/index";

describe("Civ7 plot-snapshot procedure descriptor", () => {
  test("records the read-only plot-snapshot atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7PlotSnapshotProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "map.plot.snapshot",
      family: "map",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/map/reads.ts",
      atomFunction: "getCiv7PlotSnapshot",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7PlotSnapshot.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7PlotSnapshotProcedureDescriptor,
      Civ7PlotSnapshotProcedureSchemaArtifacts
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7PlotSnapshotProcedureDescriptor.inputFields)
    );
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7PlotSnapshotProcedureDescriptor.outputFields)
    );
    expect(
      Value.Check(resolved.inputSchema, {
        x: 3,
        y: 4,
        playerId: 0,
        fields: ["terrain", "resource", "visibility"],
        includeHidden: false,
      })
    ).toBe(true);
    expect(Value.Check(resolved.inputSchema, { x: 1.5, y: 4 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { x: 3, y: -1 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { x: 3, y: 4, fields: ["enemy"] })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { x: 3, y: 4, host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { x: 3, y: 4, state: { role: "tuner" } })).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, { x: 3, y: 4, rawCommand: "readPlotSnapshot()" })
    ).toBe(false);
    expect(Value.Check(resolved.outputSchema, plotSnapshotResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...plotSnapshotResult(),
        command: "GameplayMap.getTerrainType(3, 4)",
      })
    ).toBe(false);
  });

  test("calls the plot-snapshot atom through the procedure core without touching the live tuner", async () => {
    const validatedLocations: Civ7MapLocation[] = [];
    const executeCalls: Array<{
      host?: string;
      port?: number;
      command: string;
    }> = [];
    const dependencies: PlotSnapshotReadDependencies = {
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
      parsePlotSnapshot: () => plotSnapshotResult(),
      probeHelperSource: () => "const probe = (fn) => ({ ok: true, value: fn() });",
      validateMapLocation: (location) => {
        validatedLocations.push(location);
      },
    };

    const result = await callCiv7PlotSnapshotProcedure(
      {
        x: 3,
        y: 4,
        playerId: 0,
        fields: ["terrain", "resource", "visibility"],
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "plot-snapshot-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(plotSnapshotResult());
    expect(result.diagnostics).toMatchObject({
      procedureKey: "map.plot.snapshot",
      correlationId: "plot-snapshot-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(validatedLocations).toEqual([
      { x: 3, y: 4, playerId: 0, fields: ["terrain", "resource", "visibility"] },
    ]);
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(executeCalls[0]?.command).toContain("readPlotSnapshot");
    expect(executeCalls[0]?.command).toContain('"fields":["terrain","resource","visibility"]');
    expect(executeCalls[0]?.command).not.toContain("sendRequest");
    expect(executeCalls[0]?.command).not.toContain("sendOperation(");
  });

  test("rejects invalid procedure input before plot-snapshot dependencies run", async () => {
    let executed = false;
    const dependencies: PlotSnapshotReadDependencies = {
      executeTunerCommand: async () => {
        executed = true;
        throw new Error("executeTunerCommand should not run after procedure input rejection");
      },
      jsLiteral: JSON.stringify,
      parsePlotSnapshot: () => plotSnapshotResult(),
      probeHelperSource: () => "const probe = () => ({ ok: false, error: 'unused' });",
      validateMapLocation: () => undefined,
    };

    await expect(
      callCiv7PlotSnapshotProcedure(
        { x: 1.5, y: 4 },
        {
          procedure: { correlationId: "plot-snapshot-invalid-location" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "map.plot.snapshot",
        role: "input",
      },
    });
    await expect(
      callCiv7PlotSnapshotProcedure(
        {
          x: 3,
          y: 4,
          rawCommand: "GameplayMap.getTerrainType(3, 4)",
        } as never,
        {
          procedure: { correlationId: "plot-snapshot-context-input" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "map.plot.snapshot",
        role: "input",
      },
    });
    expect(executed).toBe(false);
  });
});

function plotSnapshotResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    location: { x: 3, y: 4, index: { ok: true as const, value: 339 } },
    revealedState: { ok: true as const, value: 1 },
    visible: { ok: true as const, value: true },
    hiddenInfoPolicy: "visibility-filtered",
    facts: {
      terrain: { ok: true as const, value: 4 },
      resource: { ok: true as const, value: -1 },
      visible: { ok: true as const, value: true },
    },
  };
}
