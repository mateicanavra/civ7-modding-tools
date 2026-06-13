import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7SettlementRecommendationsProcedureDescriptor,
  Civ7SettlementRecommendationsProcedureSchemaArtifacts,
  callCiv7SettlementRecommendationsProcedure,
  getCiv7SettlementRecommendations,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  type SettlementRecommendationDependencies,
} from "../src/index";

describe("Civ7 settlement recommendations procedure descriptor", () => {
  test("records the read-only settlement atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(
      Civ7SettlementRecommendationsProcedureDescriptor
    );
    expect(summary).toMatchObject({
      procedureKey: "strategy.settlement.recommendations",
      family: "strategy",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/tactical/settlement.ts",
      atomFunction: "getCiv7SettlementRecommendations",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7SettlementRecommendations.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7SettlementRecommendationsProcedureDescriptor,
      Civ7SettlementRecommendationsProcedureSchemaArtifacts
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7SettlementRecommendationsProcedureDescriptor.inputFields)
    );
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7SettlementRecommendationsProcedureDescriptor.outputFields)
    );
    expect(
      Value.Check(resolved.inputSchema, {
        locations: [{ x: 18, y: 27 }],
        count: 3,
        includeSettlers: false,
        includeCities: false,
      })
    ).toBe(true);
    expect(Value.Check(resolved.inputSchema, { count: 13 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { locations: [{ x: 1.5, y: 0 }] })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, { rawCommand: "readSettlementRecommendations()" })
    ).toBe(false);
    expect(Value.Check(resolved.outputSchema, settlementRecommendationsResult(3))).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...settlementRecommendationsResult(3),
        rawCommand: "readSettlementRecommendations()",
      })
    ).toBe(false);
  });

  test("calls the settlement recommendation atom through the procedure core without touching the live tuner", async () => {
    const boundedIntegerCalls: Array<{ value: number; min: number; max: number; label: string }> =
      [];
    const executeCalls: Array<{ host?: string; port?: number; command: string }> = [];
    const dependencies: SettlementRecommendationDependencies = {
      boundedInteger: (value, min, max, label) => {
        boundedIntegerCalls.push({ value, min, max, label });
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
      parseSettlementRecommendations: () => settlementRecommendationsResult(3),
    };

    const result = await callCiv7SettlementRecommendationsProcedure(
      {
        locations: [{ x: 18, y: 27 }],
        count: 3,
        includeSettlers: false,
        includeCities: false,
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "settlement-recommendations-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(settlementRecommendationsResult(3));
    expect(result.diagnostics).toMatchObject({
      procedureKey: "strategy.settlement.recommendations",
      correlationId: "settlement-recommendations-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(boundedIntegerCalls).toEqual([{ value: 3, min: 1, max: 12, label: "count" }]);
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(executeCalls[0]?.command).toContain("readSettlementRecommendations");
    expect(executeCalls[0]?.command).toContain('"count":3');
    expect(executeCalls[0]?.command).toContain('"locations":[{"x":18,"y":27}]');
    expect(executeCalls[0]?.command).not.toContain("UnitOperations.request");
    expect(executeCalls[0]?.command).not.toContain("CityOperations.request");
  });

  test("rejects invalid procedure input before settlement atom dependencies run", async () => {
    let executed = false;
    const dependencies: SettlementRecommendationDependencies = {
      boundedInteger: (value) => value,
      executeAppUiCommand: async () => {
        executed = true;
        throw new Error("executeAppUiCommand should not run after procedure input rejection");
      },
      parseSettlementRecommendations: () => settlementRecommendationsResult(),
    };

    await expect(
      callCiv7SettlementRecommendationsProcedure(
        { count: 13 },
        {
          procedure: { correlationId: "settlement-recommendations-invalid-count" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "strategy.settlement.recommendations",
        role: "input",
      },
    });
    await expect(
      callCiv7SettlementRecommendationsProcedure(
        {
          host: "127.0.0.1",
        } as never,
        {
          procedure: { correlationId: "settlement-recommendations-context-input" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "strategy.settlement.recommendations",
        role: "input",
      },
    });
    expect(executed).toBe(false);
  });
});

function settlementRecommendationsResult(count = 5) {
  const origin = {
    kind: "requested" as const,
    location: { x: 18, y: 27 },
    plotIndex: { ok: true as const, value: 2718 },
  };
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    playerId: 0,
    count,
    requestedLocations: [origin.location],
    origins: [origin],
    recommendations: [
      {
        origin,
        suggestions: {
          ok: true as const,
          value: [
            {
              location: { x: 19, y: 28 },
              plotIndex: { ok: true as const, value: 2819 },
              factors: [
                {
                  positive: true,
                  title: "LOC_SETTLER_LENS_FRESH_WATER_NAME",
                  description: "LOC_SETTLER_LENS_FRESH_WATER_DESCRIPTION",
                },
              ],
            },
          ],
        },
      },
    ],
    notes: [
      "Read-only settlement recommendation view. It wraps the official settlement lens API, not a city-founding operation.",
      "Recommendations are local-player AI advice for ranking candidate plots; use unit-target/ready-unit validation before moving a Settler.",
    ],
  };
}
