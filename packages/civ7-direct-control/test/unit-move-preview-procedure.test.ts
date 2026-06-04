import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7UnitMovePreviewProcedureDescriptor,
  Civ7UnitMovePreviewProcedureSchemaArtifacts,
  getCiv7UnitMovePreview,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
} from "../src/index";

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
      Civ7UnitMovePreviewProcedureSchemaArtifacts,
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7UnitMovePreviewProcedureDescriptor.inputFields),
    );
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7UnitMovePreviewProcedureDescriptor.outputFields),
    );
    expect(Civ7UnitMovePreviewProcedureDescriptor.outputFields).toEqual(
      expect.arrayContaining([
        "reachableMovement",
        "queuedDestination",
        "requestedDestination",
        "requestedPath",
        "relationshipPolicy",
      ]),
    );
    expect(Value.Check(resolved.inputSchema, {
      unitId: { owner: 0, id: 65536, type: 26 },
      destination: { x: 25, y: 35 },
      maxPlots: 12,
      maxPathPlots: 8,
    })).toBe(true);
    expect(Value.Check(resolved.inputSchema, { destination: { x: 1.5, y: 0 } })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { destination: { x: -1, y: 0 } })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { destination: { x: 0, y: 1_000_001 } })).toBe(false);
    expect(Value.Check(resolved.outputSchema, unitMovePreviewResult())).toBe(true);
    expect(Value.Check(resolved.outputSchema, {
      ...unitMovePreviewResult(),
      rawCommand: "readUnitMovePreview()",
    })).toBe(false);
  });
});

function unitMovePreviewResult() {
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
    notes: ["Read-only official movement preview. It does not send MOVE_TO, reserve a path, or prove tactical safety."],
  };
}
