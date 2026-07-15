import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  Civ7DirectControlError,
  Civ7UnitMovePreviewProcedureDescriptor,
  Civ7UnitMovePreviewProcedureSchemaArtifacts,
  type Civ7UnitMovePreviewResult,
  callCiv7UnitMovePreviewProcedure,
  getCiv7UnitMovePreview,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  type UnitMovePreviewDependencies,
} from "../src/index";

import { schemaPropertyKeys } from "./support/procedure-schema";

describe("Civ7 unit-move-preview procedure descriptor", () => {
  test("records the unit move-preview read atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7UnitMovePreviewProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "unit.move.preview",
      family: "unit",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/ready/move-preview.ts",
      atomFunction: "getCiv7UnitMovePreview",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7UnitMovePreview.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7UnitMovePreviewProcedureDescriptor,
      Civ7UnitMovePreviewProcedureSchemaArtifacts
    );
    expect(schemaPropertyKeys(resolved.inputSchema)).toEqual(
      expect.arrayContaining(Civ7UnitMovePreviewProcedureDescriptor.inputFields)
    );
    expect(schemaPropertyKeys(resolved.outputSchema)).toEqual(
      expect.arrayContaining(Civ7UnitMovePreviewProcedureDescriptor.outputFields)
    );
    expect(Civ7UnitMovePreviewProcedureDescriptor.outputFields).toEqual(
      expect.arrayContaining([
        "reachableMovement",
        "queuedDestination",
        "requestedDestination",
        "requestedPath",
        "relationshipPolicy",
      ])
    );
    expect(
      Value.Check(resolved.inputSchema, {
        unitId: { owner: 0, id: 65536, type: 26 },
        destination: { x: 25, y: 35 },
        maxPlots: 12,
        maxPathPlots: 8,
      })
    ).toBe(true);
    expect(Value.Check(resolved.inputSchema, { destination: { x: 1.5, y: 0 } })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { destination: { x: -1, y: 0 } })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { destination: { x: 0, y: 1_000_001 } })).toBe(false);
    expect(Value.Check(resolved.outputSchema, unitMovePreviewResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...unitMovePreviewResult(),
        rawCommand: "readUnitMovePreview()",
      })
    ).toBe(false);
  });

  test("calls the unit move-preview atom through the procedure core without touching the live tuner", async () => {
    const executeCalls: Array<{ host?: string; port?: number; command: string }> = [];
    const boundedCalls: Array<{ value: number; min: number; max: number; label: string }> = [];
    const validatedLocations: Array<{ x: number; y: number }> = [];
    const dependencies: UnitMovePreviewDependencies = {
      validateMapLocation: (location) => {
        validatedLocations.push(location);
      },
      boundedInteger: (value, min, max, label) => {
        boundedCalls.push({ value, min, max, label });
        if (!Number.isInteger(value) || value < min || value > max) {
          throw new Civ7DirectControlError("command-failed", `${label} out of bounds`);
        }
        return value;
      },
      executeAppUiCommand: async (options) => {
        executeCalls.push({
          host: options.host,
          port: options.port,
          command: options.command,
        });
        return {
          host: options.host ?? "127.0.0.1",
          port: options.port ?? 4318,
          state: { id: "65535", name: "App UI" },
          output: ["{}"],
        };
      },
      parseUnitMovePreview: () => unitMovePreviewResult(),
    };

    const unitId = { owner: 0, id: 65536, type: 26 };
    const destination = { x: 25, y: 35 };
    const result = await callCiv7UnitMovePreviewProcedure(
      {
        unitId,
        destination,
        maxPlots: 12,
        maxPathPlots: 8,
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "unit-move-preview-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(unitMovePreviewResult());
    expect(result.output.relationshipPolicy).toMatchObject({
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
    });
    expect(result.diagnostics).toMatchObject({
      procedureKey: "unit.move.preview",
      correlationId: "unit-move-preview-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(validatedLocations).toEqual([destination]);
    expect(boundedCalls).toEqual([
      { value: 12, min: 1, max: 512, label: "maxPlots" },
      { value: 8, min: 1, max: 256, label: "maxPathPlots" },
    ]);
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(executeCalls[0]?.command).toContain("readUnitMovePreview");
    expect(executeCalls[0]?.command).toContain('"destination":{"x":25,"y":35}');
    expect(executeCalls[0]?.command).toContain('"maxPlots":12');
    expect(executeCalls[0]?.command).toContain('"maxPathPlots":8');
  });

  test("rejects invalid procedure input before unit move-preview atom dependencies run", async () => {
    let executed = false;
    const dependencies: UnitMovePreviewDependencies = {
      validateMapLocation: () => {
        throw new Error("validateMapLocation should not run after procedure input rejection");
      },
      boundedInteger: () => {
        throw new Error("boundedInteger should not run after procedure input rejection");
      },
      executeAppUiCommand: async () => {
        executed = true;
        throw new Error("executeAppUiCommand should not run after procedure input rejection");
      },
      parseUnitMovePreview: () => unitMovePreviewResult(),
    };

    await expect(
      callCiv7UnitMovePreviewProcedure(
        {
          destination: { x: 1.5, y: 0 },
        },
        {
          procedure: { correlationId: "unit-move-preview-invalid-input" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "unit.move.preview",
        role: "input",
      },
    });
    expect(executed).toBe(false);
  });
});

function unitMovePreviewResult(): Civ7UnitMovePreviewResult {
  const unitId = { owner: 0, id: 65536, type: 26 };
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    requestedUnitId: unitId,
    selectedUnitId: { ok: true, value: unitId },
    firstReadyUnitId: { ok: true, value: unitId },
    unitId,
    unit: {
      ok: true,
      value: {
        id: unitId,
        owner: 0,
        typeName: "UNIT_GALLEY",
        location: { x: 24, y: 35 },
      },
    },
    reachableMovement: { ok: true, value: [{ index: 2965, x: 25, y: 35 }] },
    reachableZonesOfControl: { ok: true, value: [] },
    reachableTargets: { ok: true, value: [[{ index: 2966, x: 26, y: 35 }]] },
    queuedDestination: { ok: true, value: { x: 25, y: 35 } },
    queuedPath: { ok: true, value: { plotCount: 2 } },
    requestedDestination: { x: 25, y: 35 },
    requestedPath: { ok: true, value: { plotCount: 2 } },
    relationshipPolicy: {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance:
        "This movement preview does not classify other-owner relationships. Use neutral labels unless an official relationship, team, diplomacy, independent-power, or war-state API supplies that proof.",
    },
    notes: [
      "Read-only official movement preview. It does not send MOVE_TO, reserve a path, or prove tactical safety.",
    ],
  };
}
