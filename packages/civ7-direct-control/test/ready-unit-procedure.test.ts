import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  Civ7DirectControlError,
  Civ7ReadyUnitViewProcedureDescriptor,
  Civ7ReadyUnitViewProcedureSchemaArtifacts,
  type Civ7ReadyUnitViewResult,
  callCiv7ReadyUnitViewProcedure,
  getCiv7ReadyUnitView,
  type ReadyUnitViewDependencies,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
} from "../src/index";

import { schemaPropertyKeys } from "./support/procedure-schema";

describe("Civ7 ready-unit procedure descriptor", () => {
  test("records the ready-unit read atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7ReadyUnitViewProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "unit.ready.view",
      family: "unit",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/ready/unit.ts",
      atomFunction: "getCiv7ReadyUnitView",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7ReadyUnitView.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7ReadyUnitViewProcedureDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts
    );
    expect(schemaPropertyKeys(resolved.inputSchema)).toEqual(
      expect.arrayContaining(Civ7ReadyUnitViewProcedureDescriptor.inputFields)
    );
    expect(schemaPropertyKeys(resolved.outputSchema)).toEqual(
      expect.arrayContaining(Civ7ReadyUnitViewProcedureDescriptor.outputFields)
    );
    expect(Civ7ReadyUnitViewProcedureDescriptor.outputFields).not.toContain("operationCandidates");
    expect(Civ7ReadyUnitViewProcedureDescriptor.outputFields).toContain("legalOperations");
    expect(
      Value.Check(resolved.inputSchema, {
        unitId: { owner: 0, id: 458752, type: 26 },
        radius: 2,
        maxOperations: 96,
      })
    ).toBe(true);
    expect(Value.Check(resolved.inputSchema, { radius: 6 })).toBe(false);
    expect(Value.Check(resolved.outputSchema, readyUnitViewResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...readyUnitViewResult(),
        rawCommand: "readReadyUnitView()",
      })
    ).toBe(false);
  });

  test("calls the ready-unit atom through the procedure core without touching the live tuner", async () => {
    const executeCalls: Array<{ host?: string; port?: number; command: string }> = [];
    const boundedCalls: Array<{ value: number; min: number; max: number; label: string }> = [];
    const dependencies: ReadyUnitViewDependencies = {
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
      parseReadyUnitView: () => readyUnitViewResult(),
    };

    const result = await callCiv7ReadyUnitViewProcedure(
      {
        radius: 2,
        maxOperations: 96,
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "ready-unit-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(readyUnitViewResult());
    expect(result.diagnostics).toMatchObject({
      procedureKey: "unit.ready.view",
      correlationId: "ready-unit-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(boundedCalls).toEqual([
      { value: 2, min: 0, max: 5, label: "radius" },
      { value: 96, min: 1, max: 256, label: "maxOperations" },
    ]);
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(executeCalls[0]?.command).toContain("readReadyUnitView");
    expect(executeCalls[0]?.command).toContain('"radius":2');
    expect(executeCalls[0]?.command).toContain('"maxOperations":96');
  });

  test("rejects invalid procedure input before ready-unit atom dependencies run", async () => {
    let executed = false;
    const dependencies: ReadyUnitViewDependencies = {
      boundedInteger: () => {
        throw new Error("boundedInteger should not run after procedure input rejection");
      },
      executeAppUiCommand: async () => {
        executed = true;
        throw new Error("executeAppUiCommand should not run after procedure input rejection");
      },
      parseReadyUnitView: () => readyUnitViewResult(),
    };

    await expect(
      callCiv7ReadyUnitViewProcedure(
        { radius: 6 },
        {
          procedure: { correlationId: "ready-unit-invalid-input" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "unit.ready.view",
        role: "input",
      },
    });
    expect(executed).toBe(false);
  });
});

function readyUnitViewResult(): Civ7ReadyUnitViewResult {
  const unitId = { owner: 0, id: 458752, type: 26 };
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    requestedUnitId: null,
    selectedUnitId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: unitId },
    unitId,
    unit: { ok: true, value: { id: unitId } },
    legalOperations: [
      {
        family: "unit-operation",
        operationType: "SKIP_TURN",
        enumValue: 1,
        valid: true,
        result: { Success: true },
      },
    ],
    promotionReadiness: { ok: true, value: null },
    nearby: {
      ok: true,
      value: [
        {
          x: 22,
          y: 31,
          units: [{ id: unitId, owner: 0, typeName: "UNIT_ARMY_COMMANDER" }],
        },
      ],
    },
    notes: ["Read-only ready-unit view. Use operation validation before mutation."],
  };
}
