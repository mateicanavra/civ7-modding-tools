import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  type Civ7UnitTargetActionInput,
  Civ7UnitTargetActionRequestInputSchema,
  Civ7UnitTargetActionRequestProcedureDescriptor,
  Civ7UnitTargetActionRequestProcedureSchemaArtifacts,
  type Civ7UnitTargetActionResult,
  Civ7UnitTargetActionResultSchema,
  callCiv7UnitTargetActionRequestProcedure,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
} from "../src/index";

import { schemaPropertyKeys } from "./support/procedure-schema";

describe("Civ7 unit-target action request procedure descriptor", () => {
  test("records unit-target validator, postcondition, and no-repeat metadata and resolves schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(
      Civ7UnitTargetActionRequestProcedureDescriptor
    );
    expect(summary).toMatchObject({
      procedureKey: "unit.target.action.request",
      family: "unit",
      risk: "mutation",
      atomOwner: "packages/civ7-direct-control/src/play/operations/unit-target-action.ts",
      atomFunction: "requestCiv7UnitTargetAction",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "proof-diagnostic-projection",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "effect-orpc-middleware-hook",
      mutationGates: {
        validatorFirst: true,
        postconditionRequired: true,
        noRepeatAfterUnverified: true,
      },
    });

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7UnitTargetActionRequestProcedureDescriptor,
      Civ7UnitTargetActionRequestProcedureSchemaArtifacts
    );
    expect(schemaPropertyKeys(resolved.inputSchema)).toEqual(
      expect.arrayContaining(Civ7UnitTargetActionRequestProcedureDescriptor.inputFields)
    );
    expect(schemaPropertyKeys(resolved.outputSchema)).toEqual(
      expect.arrayContaining(Civ7UnitTargetActionRequestProcedureDescriptor.outputFields)
    );
    expect(
      Value.Check(resolved.inputSchema, {
        unitId: { owner: 0, id: 65536, type: 26 },
        x: 23,
        y: 33,
      })
    ).toBe(true);
    expect(
      Value.Check(resolved.inputSchema, { unitId: { owner: 0, id: 65536 }, x: 1.5, y: 0 })
    ).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, { unitId: { owner: 0, id: 65536 }, x: 0, y: 1_000_001 })
    ).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, {
        unitId: { owner: 0, id: 65536 },
        x: 0,
        y: 0,
        rawCommand: "Game.UnitOperations.sendRequest(...)",
      })
    ).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, {
        unitId: { owner: 0, id: 65536 },
        x: 0,
        y: 0,
        state: { role: "tuner" },
      })
    ).toBe(false);
    expect(Value.Check(resolved.outputSchema, unitTargetActionResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...unitTargetActionResult(),
        rawCommand: "Game.UnitOperations.sendRequest(...)",
      })
    ).toBe(false);
  });

  test("calls the unit-target atom through the procedure core", async () => {
    const calls: Array<{
      input: Civ7UnitTargetActionInput;
      host?: string;
      port?: number;
    }> = [];

    const result = await callCiv7UnitTargetActionRequestProcedure(
      {
        unitId: { owner: 0, id: 65536, type: 26 },
        x: 23,
        y: 33,
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "unit-target-action-procedure-test",
        },
        request: async (input, options) => {
          calls.push({
            input,
            host: options?.host,
            port: options?.port,
          });
          return unitTargetActionResult();
        },
      }
    );

    expect(result.output).toEqual(unitTargetActionResult());
    expect(result.diagnostics).toMatchObject({
      procedureKey: "unit.target.action.request",
      correlationId: "unit-target-action-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "agent-slot-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: true,
    });
    expect(calls).toEqual([
      {
        input: { unitId: { owner: 0, id: 65536, type: 26 }, x: 23, y: 33 },
        host: "127.0.0.1",
        port: 4318,
      },
    ]);
  });

  test("rejects invalid procedure input before request dependencies run", async () => {
    let requested = false;

    for (const input of [
      { unitId: { owner: 0, id: 65536 }, x: 1.5, y: 0 },
      { unitId: { owner: 0, id: 65536 }, x: 0, y: -1 },
      {
        unitId: { owner: 0, id: 65536 },
        x: 0,
        y: 0,
        command: "Game.UnitOperations.sendRequest(...)",
      },
    ]) {
      await expect(
        callCiv7UnitTargetActionRequestProcedure(input as never, {
          procedure: { correlationId: "unit-target-action-invalid-input" },
          request: async () => {
            requested = true;
            throw new Error("request should not run after procedure input rejection");
          },
        })
      ).rejects.toMatchObject({
        code: "procedure-descriptor-invalid",
        details: {
          reason: "input-schema-invalid",
          procedureKey: "unit.target.action.request",
          role: "input",
        },
      });
    }
    expect(requested).toBe(false);
  });

  test("requires caller-provided correlation before mutation handler execution", async () => {
    let requested = false;
    await expect(
      callCiv7UnitTargetActionRequestProcedure(
        {
          unitId: { owner: 0, id: 65536, type: 26 },
          x: 23,
          y: 33,
        },
        {
          request: async () => {
            requested = true;
            return unitTargetActionResult();
          },
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "correlation-id-missing",
        procedureKey: "unit.target.action.request",
      },
    });
    expect(requested).toBe(false);
  });
});

function unitTargetActionResult(): Civ7UnitTargetActionResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    unitId: { owner: 0, id: 65536, type: 26 },
    target: {
      x: 23,
      y: 33,
      index: { ok: true, value: 1457 },
    },
    beforeUnit: { ok: true, value: { location: { x: 22, y: 33 }, attacksRemaining: 1 } },
    beforeTargetUnits: { ok: true, value: [{ owner: 62, id: 123, type: 26 }] },
    candidates: [
      {
        family: "unit-operation",
        operationType: "UNITOPERATION_RANGE_ATTACK",
        args: { X: 23, Y: 33, Modifiers: 3 },
        valid: true,
        result: { Success: true, Plots: [1457] },
        targetInReturnedPlots: true,
      },
    ],
    selected: {
      family: "unit-operation",
      operationType: "UNITOPERATION_RANGE_ATTACK",
      args: { X: 23, Y: 33, Modifiers: 3 },
      valid: true,
      result: { Success: true, Plots: [1457] },
      targetInReturnedPlots: true,
    },
    sent: true,
    sendResult: { Success: true },
    afterUnit: { ok: true, value: { location: { x: 22, y: 33 }, attacksRemaining: 0 } },
    afterTargetUnits: { ok: true, value: [{ owner: 62, id: 123, type: 26 }] },
    verified: true,
    verification: {
      status: "verified",
      classification: "unit-state-changed",
      unitChanged: true,
      targetUnitsChanged: false,
      destinationReached: false,
      requestedLocation: { x: 23, y: 33 },
      landedLocation: { x: 22, y: 33 },
      source: "immediate",
      attempts: 0,
      observedAfterMs: 0,
      reason: "unit state changed after send",
    },
    notes: ["Selection follows the official right-click WorldInput target order."],
  };
}
