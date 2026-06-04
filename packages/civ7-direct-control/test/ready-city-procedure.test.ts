import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7ReadyCityViewProcedureDescriptor,
  Civ7ReadyCityViewProcedureSchemaArtifacts,
  getCiv7ReadyCityView,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
} from "../src/index";

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
      Civ7ReadyCityViewProcedureSchemaArtifacts,
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7ReadyCityViewProcedureDescriptor.inputFields),
    );
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7ReadyCityViewProcedureDescriptor.outputFields),
    );
    expect(Civ7ReadyCityViewProcedureDescriptor.outputFields).toEqual(
      expect.arrayContaining([
        "legalOperations",
        "productionCandidates",
        "townFocusOptions",
        "populationPlacement",
      ]),
    );
    expect(Value.Check(resolved.inputSchema, {
      cityId: { owner: 0, id: 131073, type: 1 },
      maxOperations: 96,
    })).toBe(true);
    expect(Value.Check(resolved.inputSchema, { maxOperations: 257 })).toBe(false);
    expect(Value.Check(resolved.outputSchema, readyCityViewResult())).toBe(true);
    expect(Value.Check(resolved.outputSchema, {
      ...readyCityViewResult(),
      rawCommand: "readReadyCityView()",
    })).toBe(false);
  });
});

function readyCityViewResult() {
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
          cli: "game play build-production --city-id '<city-id>' --constructible-type 713967338",
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
          cli: "game play set-town-focus --city-id '<city-id>' --growth-type -284569333",
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
        cliHints: [
          "game play assign-worker --player-id <id> --location <plot-index>",
          "game play expand-city --city-id '<city-id>' --x <x> --y <y>",
        ],
      },
    },
    notes: ["Read-only ready-city view. This view intentionally does not choose production."],
  };
}
