import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  Civ7DirectControlError,
  Civ7ReadyCityViewProcedureDescriptor,
  Civ7ReadyCityViewProcedureSchemaArtifacts,
  type Civ7ReadyCityViewResult,
  callCiv7ReadyCityViewProcedure,
  getCiv7ReadyCityView,
  type ReadyCityViewDependencies,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
} from "../src/index";

import { schemaPropertyKeys } from "./support/procedure-schema";

describe("Civ7 ready-city procedure descriptor", () => {
  test("records the ready-city read atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7ReadyCityViewProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "city.ready.view",
      family: "city",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/ready/city.ts",
      atomFunction: "getCiv7ReadyCityView",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7ReadyCityView.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7ReadyCityViewProcedureDescriptor,
      Civ7ReadyCityViewProcedureSchemaArtifacts
    );
    expect(schemaPropertyKeys(resolved.inputSchema)).toEqual(
      expect.arrayContaining(Civ7ReadyCityViewProcedureDescriptor.inputFields)
    );
    expect(schemaPropertyKeys(resolved.outputSchema)).toEqual(
      expect.arrayContaining(Civ7ReadyCityViewProcedureDescriptor.outputFields)
    );
    expect(Civ7ReadyCityViewProcedureDescriptor.outputFields).toEqual(
      expect.arrayContaining([
        "legalOperations",
        "productionCandidates",
        "townFocusOptions",
        "populationPlacement",
      ])
    );
    expect(
      Value.Check(resolved.inputSchema, {
        cityId: { owner: 0, id: 131073, type: 1 },
        maxOperations: 96,
      })
    ).toBe(true);
    expect(Value.Check(resolved.inputSchema, { maxOperations: 257 })).toBe(false);
    expect(Value.Check(resolved.outputSchema, readyCityViewResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...readyCityViewResult(),
        rawCommand: "readReadyCityView()",
      })
    ).toBe(false);
  });

  test("calls the ready-city atom through the procedure core without touching the live tuner", async () => {
    const executeCalls: Array<{ host?: string; port?: number; command: string }> = [];
    const boundedCalls: Array<{ value: number; min: number; max: number; label: string }> = [];
    const dependencies: ReadyCityViewDependencies = {
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
      parseReadyCityView: () => readyCityViewResult(),
    };

    const cityId = { owner: 0, id: 131073, type: 1 };
    const result = await callCiv7ReadyCityViewProcedure(
      {
        cityId,
        maxOperations: 96,
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "ready-city-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(readyCityViewResult());
    expect(result.diagnostics).toMatchObject({
      procedureKey: "city.ready.view",
      correlationId: "ready-city-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(boundedCalls).toEqual([{ value: 96, min: 1, max: 256, label: "maxOperations" }]);
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(executeCalls[0]?.command).toContain("readReadyCityView");
    expect(executeCalls[0]?.command).toContain('"maxOperations":96');
    expect(executeCalls[0]?.command).toContain('"cityId":{"owner":0,"id":131073,"type":1}');
  });

  test("rejects invalid procedure input before ready-city atom dependencies run", async () => {
    let executed = false;
    const dependencies: ReadyCityViewDependencies = {
      boundedInteger: () => {
        throw new Error("boundedInteger should not run after procedure input rejection");
      },
      executeAppUiCommand: async () => {
        executed = true;
        throw new Error("executeAppUiCommand should not run after procedure input rejection");
      },
      parseReadyCityView: () => readyCityViewResult(),
    };

    await expect(
      callCiv7ReadyCityViewProcedure(
        { maxOperations: 257 },
        {
          procedure: { correlationId: "ready-city-invalid-input" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "city.ready.view",
        role: "input",
      },
    });
    expect(executed).toBe(false);
  });
});

function readyCityViewResult(): Civ7ReadyCityViewResult {
  const cityId = { owner: 0, id: 131073, type: 1 };
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    requestedCityId: null,
    selectedCityId: { ok: true, value: cityId },
    blockingCityId: { ok: true, value: cityId },
    cityId,
    city: {
      ok: true,
      value: {
        id: cityId,
        owner: 0,
        name: "Dur-Sharrukin",
      },
    },
    legalOperations: [
      {
        family: "city-operation",
        operationType: "CONSIDER_TOWN_PROJECT",
        enumValue: 1,
        valid: true,
        result: { Success: true },
      },
    ],
    productionCandidates: {
      ok: true,
      value: [
        {
          kind: "constructible",
          type: 713967338,
          typeName: "BUILDING_WALLS",
          name: "LOC_BUILDING_WALLS_NAME",
          args: { ConstructibleType: 713967338 },
          valid: true,
          result: { Success: true },
        },
      ],
    },
    townFocusOptions: {
      ok: true,
      value: [
        {
          name: "LOC_PROJECT_FISHING_TOWN_NAME",
          description: "LOC_PROJECT_FISHING_TOWN_DESCRIPTION",
          args: { Type: -284569333 },
          valid: true,
          result: { Success: true },
        },
      ],
    },
    populationPlacement: {
      ok: true,
      value: {
        isReadyToPlacePopulation: { ok: true, value: true },
        cityWorkerCap: { ok: true, value: 4 },
        yieldTypeOrder: ["Food", "Production", "Gold"],
        allPlacementInfo: { ok: true, value: [{ PlotIndex: 1457, IsBlocked: false }] },
        workablePlotIndexes: { ok: true, value: [1457] },
        blockedPlotIndexes: { ok: true, value: [] },
        workablePlots: { ok: true, value: [{ index: 1457, x: 22, y: 31 }] },
        expansionCandidates: { ok: true, value: [{ index: 1458, x: 23, y: 31 }] },
        expansionResult: { ok: true, value: { Success: true, Plots: [1458] } },
        notes: [
          "For NEW_POPULATION, compare workablePlots against expansionCandidates; assign-worker and expand-city are different acquire-tile branches.",
        ],
      },
    },
    notes: ["Read-only ready-city view. This view intentionally does not choose production."],
  };
}
