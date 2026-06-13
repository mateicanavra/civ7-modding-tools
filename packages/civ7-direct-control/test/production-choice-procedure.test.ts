import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7ProductionChoiceRequestInputSchema,
  Civ7ProductionChoiceRequestProcedureDescriptor,
  Civ7ProductionChoiceRequestProcedureSchemaArtifacts,
  Civ7ProductionChoiceResultSchema,
  callCiv7ProductionChoiceRequestProcedure,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  type Civ7ProductionChoiceInput,
  type Civ7ProductionChoiceResult,
} from "../src/index";

describe("Civ7 production choice request procedure descriptor", () => {
  test("records production-choice validator, postcondition, and no-repeat metadata and resolves schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(
      Civ7ProductionChoiceRequestProcedureDescriptor
    );
    expect(summary).toMatchObject({
      procedureKey: "city.production.choice.request",
      family: "city",
      risk: "mutation",
      atomOwner: "packages/civ7-direct-control/src/play/operations/production-choice.ts",
      atomFunction: "requestCiv7ProductionChoice",
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
      Civ7ProductionChoiceRequestProcedureDescriptor,
      Civ7ProductionChoiceRequestProcedureSchemaArtifacts
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7ProductionChoiceRequestProcedureDescriptor.inputFields)
    );
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7ProductionChoiceRequestProcedureDescriptor.outputFields)
    );
    expect(Civ7ProductionChoiceRequestProcedureDescriptor.outputFields).not.toContain("command");
    expect(
      Value.Check(resolved.inputSchema, {
        cityId: { owner: 0, id: 65536, type: 1 },
        args: { ConstructibleType: 713967338, X: 22, Y: 31 },
      })
    ).toBe(true);
    expect(
      Value.Check(resolved.inputSchema, {
        cityId: { owner: 0, id: 65536, type: 1 },
        args: { UnitType: 102, ConstructibleType: 713967338 },
      })
    ).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, {
        cityId: { owner: 0, id: 65536, type: 1 },
        args: { UnitType: 102, X: 22, Y: 31 },
      })
    ).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, {
        cityId: { owner: 0, id: 65536, type: 1 },
        args: { ConstructibleType: 713967338, X: 22 },
      })
    ).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, {
        cityId: { owner: 0, id: 65536, type: 1 },
        args: { ConstructibleType: 713967338 },
        rawCommand: "Game.CityOperations.sendRequest(...)",
      })
    ).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, {
        cityId: { owner: 0, id: 65536, type: 1 },
        args: { ConstructibleType: 713967338 },
        state: { role: "app-ui" },
      })
    ).toBe(false);
    expect(Value.Check(resolved.outputSchema, productionChoiceResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...productionChoiceResult(),
        command: {
          host: "127.0.0.1",
          port: 4318,
          state: { id: "65535", name: "App UI" },
          output: ["{}"],
        },
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7ProductionChoiceResultSchema, {
        ...productionChoiceResult(),
        rawCommand: "Game.CityOperations.sendRequest(...)",
      })
    ).toBe(false);
  });

  test("calls the production-choice atom through the procedure core", async () => {
    const calls: Array<{
      input: Civ7ProductionChoiceInput;
      host?: string;
      port?: number;
    }> = [];

    const result = await callCiv7ProductionChoiceRequestProcedure(
      {
        cityId: { owner: 0, id: 65536, type: 1 },
        args: { ConstructibleType: 713967338, X: 22, Y: 31 },
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "production-choice-procedure-test",
        },
        request: async (input, options) => {
          calls.push({
            input,
            host: options.host,
            port: options.port,
          });
          return {
            ...productionChoiceResult(),
            command: {
              host: "127.0.0.1",
              port: 4318,
              state: { id: "65535", name: "App UI" },
              output: ["{}"],
            },
          };
        },
      }
    );

    expect(result.output).toEqual(productionChoiceResult());
    expect(result.output).not.toHaveProperty("command");
    expect(result.diagnostics).toMatchObject({
      procedureKey: "city.production.choice.request",
      correlationId: "production-choice-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "agent-slot-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: true,
    });
    expect(calls).toEqual([
      {
        input: {
          cityId: { owner: 0, id: 65536, type: 1 },
          args: { ConstructibleType: 713967338, X: 22, Y: 31 },
        },
        host: "127.0.0.1",
        port: 4318,
      },
    ]);
  });

  test("rejects invalid procedure input before request dependencies run", async () => {
    let requested = false;

    for (const input of [
      {
        cityId: { owner: 0, id: 65536, type: 1 },
        args: { UnitType: 102, ConstructibleType: 713967338 },
      },
      { cityId: { owner: 0, id: 65536, type: 1 }, args: { ProjectType: 22, X: 22, Y: 31 } },
      { cityId: { owner: 0, id: 65536, type: 1 }, args: { ConstructibleType: 713967338, X: 22 } },
      {
        cityId: { owner: 0, id: 65536, type: 1 },
        args: { ConstructibleType: 713967338 },
        command: "Game.CityOperations.sendRequest(...)",
      },
    ]) {
      await expect(
        callCiv7ProductionChoiceRequestProcedure(input as never, {
          procedure: { correlationId: "production-choice-invalid-input" },
          request: async () => {
            requested = true;
            throw new Error("request should not run after procedure input rejection");
          },
        })
      ).rejects.toMatchObject({
        code: "procedure-descriptor-invalid",
        details: {
          reason: "input-schema-invalid",
          procedureKey: "city.production.choice.request",
          role: "input",
        },
      });
    }
    expect(requested).toBe(false);
  });

  test("requires caller-provided correlation before mutation handler execution", async () => {
    let requested = false;
    await expect(
      callCiv7ProductionChoiceRequestProcedure(
        {
          cityId: { owner: 0, id: 65536, type: 1 },
          args: { ConstructibleType: 713967338 },
        },
        {
          request: async () => {
            requested = true;
            return productionChoiceResult();
          },
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "correlation-id-missing",
        procedureKey: "city.production.choice.request",
      },
    });
    expect(requested).toBe(false);
  });
});

function productionChoiceResult(): Civ7ProductionChoiceResult {
  const before = validationResult();
  const after = validationResult();
  return {
    before,
    after,
    sent: true,
    verified: true,
    productionPostcondition: {
      family: "city-operation",
      operationType: "BUILD",
      classification: "production-choice-cleared",
      before: productionSnapshot("before"),
      after: productionSnapshot("after-cleared"),
      productionStateChanged: false,
      blockerStillLive: false,
      reason:
        "The sent BUILD request no longer has a matching end-turn-blocking production-choice notification for the city.",
    },
    payload: {
      cityId: { owner: 0, id: 65536, type: 1 },
      args: { ConstructibleType: 713967338, X: 22, Y: 31 },
      beforeValidation: before.result,
      afterValidation: after.result,
      sent: true,
      sendResult: { ok: true, value: true },
      beforeProductionPostcondition: productionSnapshot("before"),
      afterProductionPostcondition: productionSnapshot("after-cleared"),
      ui: {
        cityActivation: { ok: true, value: { selectedCityId: { owner: 0, id: 65536, type: 1 } } },
        interfaceClose: { ok: true, value: { selectedCityId: null } },
      },
      notes: ["This mirrors the official production chooser path."],
    },
  };
}

function validationResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    family: "city-operation" as const,
    operationType: "BUILD" as const,
    enumValue: "BUILD",
    target: { cityId: { owner: 0, id: 65536, type: 1 } },
    args: { ConstructibleType: 713967338, X: 22, Y: 31 },
    valid: true,
    result: { Success: true },
  };
}

function productionSnapshot(phase: "before" | "after-cleared") {
  const cityId = { owner: 0, id: 65536, type: 1 };
  return {
    cityId,
    city: {
      ok: true as const,
      value: {
        id: cityId,
        population: 3,
        isTown: false,
        location: { x: 26, y: 36 },
      },
    },
    buildQueue: {
      ok: true as const,
      value: {
        currentProductionTypeHash: phase === "before" ? 713967338 : 1558890441,
        queueLength: 1,
      },
    },
    selectedCityId: { ok: true as const, value: phase === "before" ? cityId : null },
    blocker: { ok: true as const, value: phase === "after-cleared" ? 0 : 1090224621 },
    canEndTurn: { ok: true as const, value: phase === "after-cleared" },
    blockingProductionNotification: {
      ok: true as const,
      value:
        phase === "after-cleared"
          ? null
          : {
              id: { owner: 0, id: 6, type: 20 },
              typeName: "NOTIFICATION_CHOOSE_CITY_PRODUCTION",
              target: cityId,
              matchesCity: true,
            },
    },
  };
}
