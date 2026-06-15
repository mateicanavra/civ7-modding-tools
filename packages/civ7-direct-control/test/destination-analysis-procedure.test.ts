import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  Civ7DestinationAnalysisProcedureDescriptor,
  Civ7DestinationAnalysisProcedureSchemaArtifacts,
  callCiv7DestinationAnalysisProcedure,
  type DestinationAnalysisDependencies,
  getCiv7DestinationAnalysis,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
} from "../src/index";

describe("Civ7 destination-analysis procedure descriptor", () => {
  test("records the neutral read-only destination analysis atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(
      Civ7DestinationAnalysisProcedureDescriptor
    );
    expect(summary).toMatchObject({
      procedureKey: "strategy.destination.analysis",
      family: "strategy",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/tactical/destination.ts",
      atomFunction: "getCiv7DestinationAnalysis",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7DestinationAnalysis.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7DestinationAnalysisProcedureDescriptor,
      Civ7DestinationAnalysisProcedureSchemaArtifacts
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7DestinationAnalysisProcedureDescriptor.inputFields)
    );
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7DestinationAnalysisProcedureDescriptor.outputFields)
    );
    expect(
      Value.Check(resolved.inputSchema, {
        playerId: 0,
        origin: { x: 20, y: 14 },
        destination: { x: 13, y: 17 },
        corridorRadius: 2,
        destinationRadius: 4,
        maxPlayers: 12,
        maxUnits: 16,
        maxCities: 8,
      })
    ).toBe(true);
    expect(
      Value.Check(resolved.inputSchema, {
        origin: { x: 20, y: 14 },
      })
    ).toBe(false);
    expect(Value.Check(resolved.inputSchema, { destination: { x: 1.5, y: 0 } })).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, { destination: { x: 0, y: 0 }, corridorRadius: 9 })
    ).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, { destination: { x: 0, y: 0 }, host: "127.0.0.1" })
    ).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, {
        destination: { x: 0, y: 0 },
        rawCommand: "readDestinationAnalysis()",
      })
    ).toBe(false);
    expect(Value.Check(resolved.outputSchema, destinationAnalysisResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...destinationAnalysisResult(),
        destinationPressure: {
          ...destinationAnalysisResult().destinationPressure,
          units: [
            {
              ...destinationAnalysisResult().destinationPressure.units[0],
              relationshipProof: "owner-mismatch",
            },
          ],
        },
      })
    ).toBe(false);
    expect(
      Value.Check(resolved.outputSchema, {
        ...destinationAnalysisResult(),
        destinationPressure: {
          ...destinationAnalysisResult().destinationPressure,
          units: [
            {
              ...destinationAnalysisResult().destinationPressure.units[0],
              relationshipLabel: "enemy",
            },
          ],
        },
      })
    ).toBe(false);
    expect(
      Value.Check(resolved.outputSchema, {
        ...destinationAnalysisResult(),
        rawCommand: "readDestinationAnalysis()",
      })
    ).toBe(false);
  });

  test("calls the destination analysis atom through the procedure core without touching the live tuner", async () => {
    const validatedPlayers: number[] = [];
    const validatedLocations: Array<{ x: number; y: number }> = [];
    const boundedIntegerCalls: Array<{ value: number; min: number; max: number; label: string }> =
      [];
    const executeCalls: Array<{ host?: string; port?: number; command: string }> = [];
    const dependencies: DestinationAnalysisDependencies = {
      validatePlayerId: (playerId) => {
        validatedPlayers.push(playerId);
      },
      validateMapLocation: (location) => {
        validatedLocations.push(location);
      },
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
      parseDestinationAnalysis: () => destinationAnalysisResult(),
    };

    const result = await callCiv7DestinationAnalysisProcedure(
      {
        playerId: 0,
        origin: { x: 20, y: 14 },
        destination: { x: 13, y: 17 },
        corridorRadius: 2,
        destinationRadius: 4,
        maxPlayers: 12,
        maxUnits: 16,
        maxCities: 8,
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "destination-analysis-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(destinationAnalysisResult());
    expect(result.output.relationshipLabelPolicy).toEqual({
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance:
        "Destination analysis reports owner/proximity pressure and keeps relationship status unproven without official proof.",
    });
    expect(result.output.destinationPressure.units[0]).toMatchObject({
      owner: 9,
      relationshipProof: "none",
      relationshipLabel: "relationship-unproven",
      destinationDistance: 0,
    });
    expect(result.diagnostics).toMatchObject({
      procedureKey: "strategy.destination.analysis",
      correlationId: "destination-analysis-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(validatedPlayers).toEqual([0]);
    expect(validatedLocations).toEqual([
      { x: 13, y: 17 },
      { x: 20, y: 14 },
    ]);
    expect(boundedIntegerCalls).toEqual([
      { value: 2, min: 0, max: 8, label: "corridorRadius" },
      { value: 4, min: 1, max: 16, label: "destinationRadius" },
      { value: 12, min: 1, max: 128, label: "maxPlayers" },
      { value: 16, min: 1, max: 256, label: "maxUnits" },
      { value: 8, min: 1, max: 128, label: "maxCities" },
    ]);
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(executeCalls[0]?.command).toContain("readDestinationAnalysis");
    expect(executeCalls[0]?.command).toContain('"origin":{"x":20,"y":14}');
    expect(executeCalls[0]?.command).toContain('"destination":{"x":13,"y":17}');
    expect(executeCalls[0]?.command).toContain('"corridorRadius":2');
    expect(executeCalls[0]?.command).not.toContain("sendRequest");
    expect(executeCalls[0]?.command).not.toContain("sendOperation(");
  });

  test("rejects invalid procedure input before destination analysis dependencies run", async () => {
    let executed = false;
    const dependencies: DestinationAnalysisDependencies = {
      validatePlayerId: () => {
        throw new Error("validatePlayerId should not run after procedure input rejection");
      },
      validateMapLocation: () => {
        throw new Error("validateMapLocation should not run after procedure input rejection");
      },
      boundedInteger: (value) => value,
      executeAppUiCommand: async () => {
        executed = true;
        throw new Error("executeAppUiCommand should not run after procedure input rejection");
      },
      parseDestinationAnalysis: () => destinationAnalysisResult(),
    };

    await expect(
      callCiv7DestinationAnalysisProcedure(
        {
          destination: { x: 0, y: 0 },
          corridorRadius: 9,
        },
        {
          procedure: { correlationId: "destination-analysis-invalid-radius" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "strategy.destination.analysis",
        role: "input",
      },
    });
    await expect(
      callCiv7DestinationAnalysisProcedure(
        {
          host: "127.0.0.1",
        } as never,
        {
          procedure: { correlationId: "destination-analysis-context-input" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "strategy.destination.analysis",
        role: "input",
      },
    });
    expect(executed).toBe(false);
  });
});

function destinationAnalysisResult() {
  const otherOwnerUnit = {
    id: { owner: 9, id: 196608, type: 26 },
    owner: 9,
    stance: "other" as const,
    relationshipProof: "none" as const,
    relationshipLabel: "relationship-unproven" as const,
    type: 222,
    typeName: "UNIT_WARRIOR",
    role: "melee",
    location: { x: 13, y: 17 },
    distance: 0,
    nearestOrigin: { x: 13, y: 17 },
    damage: 0,
    wounded: false,
    strength: 20,
    movementMovesRemaining: 2,
    attacksRemaining: 1,
    corridorDistance: 0,
    destinationDistance: 0,
  };
  const otherOwnerCity = {
    id: { owner: 9, id: 589824, type: 1 },
    owner: 9,
    stance: "other" as const,
    relationshipProof: "none" as const,
    relationshipLabel: "relationship-unproven" as const,
    name: "Independent City",
    location: { x: 13, y: 17 },
    distance: 0,
    nearestOrigin: { x: 13, y: 17 },
    population: 3,
    isTown: false,
    destinationDistance: 0,
  };
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    playerId: 0,
    origin: { x: 20, y: 14 },
    destination: { x: 13, y: 17 },
    corridorRadius: 2,
    destinationRadius: 4,
    hiddenInfoPolicy:
      "runtime-debug-summary; may include non-visible units, cities, or plot state until paired with visibility/map reads",
    relationshipLabelPolicy: {
      relationshipSource: "not-classified" as const,
      relationshipProof: "none" as const,
      unprovenLabel: "relationship-unproven" as const,
      guidance:
        "Destination analysis reports owner/proximity pressure and keeps relationship status unproven without official proof.",
    },
    corridor: {
      routeHint: "straight-line-grid-corridor",
      directGridDistance: 7,
      sampleCount: 8,
      sampledPlots: [
        {
          location: { x: 20, y: 14 },
          valid: { ok: true, value: true },
          water: { ok: true, value: true },
        },
      ],
      units: [otherOwnerUnit],
      unitCount: 1,
    },
    destinationPressure: {
      units: [otherOwnerUnit],
      unitCount: 1,
      cities: [otherOwnerCity],
      cityCount: 1,
      apparentOtherStrength: 20,
    },
    pointsOfInterest: [
      {
        kind: "destination-pressure",
        severity: "medium",
        location: otherOwnerUnit.location,
        summary: "1 other-owner unit near destination",
        units: [otherOwnerUnit],
      },
      {
        kind: "destination-city-pressure",
        severity: "high",
        location: otherOwnerCity.location,
        summary: "relationship-unproven city near intended destination",
        cities: [otherOwnerCity],
      },
    ],
    notes: [
      "Read-only destination lens for tactical planning. It does not move units, reserve paths, attack, or validate operations.",
      "The corridor is a straight-line grid approximation, not Civ7 engine pathfinding.",
      "Relationship labels are not classified here. Treat owner and proximity pressure as relationship-unproven until official proof exists.",
    ],
  };
}
