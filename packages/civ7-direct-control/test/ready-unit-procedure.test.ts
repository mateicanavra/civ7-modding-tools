import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7ReadyUnitViewProcedureDescriptor,
  Civ7ReadyUnitViewProcedureSchemaArtifacts,
  getCiv7ReadyUnitView,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
} from "../src/index";

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
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7ReadyUnitViewProcedureDescriptor.inputFields),
    );
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7ReadyUnitViewProcedureDescriptor.outputFields),
    );
    expect(Civ7ReadyUnitViewProcedureDescriptor.outputFields).not.toContain("operationCandidates");
    expect(Civ7ReadyUnitViewProcedureDescriptor.outputFields).toContain("legalOperations");
    expect(Value.Check(resolved.inputSchema, {
      unitId: { owner: 0, id: 458752, type: 26 },
      radius: 2,
      maxOperations: 96,
    })).toBe(true);
    expect(Value.Check(resolved.inputSchema, { radius: 6 })).toBe(false);
    expect(Value.Check(resolved.outputSchema, readyUnitViewResult())).toBe(true);
    expect(Value.Check(resolved.outputSchema, {
      ...readyUnitViewResult(),
      rawCommand: "readReadyUnitView()",
    })).toBe(false);
  });
});

function readyUnitViewResult() {
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
    notes: ["Read-only ready-unit view. Use operation validation before any send."],
  };
}
