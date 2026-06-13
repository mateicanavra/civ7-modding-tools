import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7TargetCandidatesProcedureDescriptor,
  Civ7TargetCandidatesProcedureSchemaArtifacts,
  callCiv7TargetCandidatesProcedure,
  getCiv7TargetCandidates,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  type TargetCandidatesDependencies,
} from "../src/index";

describe("Civ7 target-candidates procedure descriptor", () => {
  test("records the neutral read-only target-candidates atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7TargetCandidatesProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "strategy.target.candidates",
      family: "strategy",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/tactical/target-candidates.ts",
      atomFunction: "getCiv7TargetCandidates",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7TargetCandidates.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7TargetCandidatesProcedureDescriptor,
      Civ7TargetCandidatesProcedureSchemaArtifacts
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7TargetCandidatesProcedureDescriptor.inputFields)
    );
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7TargetCandidatesProcedureDescriptor.outputFields)
    );
    expect(
      Value.Check(resolved.inputSchema, {
        origins: [{ x: 18, y: 20 }],
        maxCandidates: 4,
        maxPlayers: 12,
        unitRadius: 3,
      })
    ).toBe(true);
    expect(Value.Check(resolved.inputSchema, { maxCandidates: 65 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { origins: [{ x: 1.5, y: 0 }] })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { rawCommand: "readTargetCandidates()" })).toBe(false);
    expect(Value.Check(resolved.outputSchema, targetCandidatesResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...targetCandidatesResult(),
        relationshipLabelPolicy: {
          ...targetCandidatesResult().relationshipLabelPolicy,
          relationshipProof: "owner-mismatch",
        },
      })
    ).toBe(false);
    expect(
      Value.Check(resolved.outputSchema, {
        ...targetCandidatesResult(),
        rawCommand: "readTargetCandidates()",
      })
    ).toBe(false);
  });

  test("calls the target-candidates atom through the procedure core without touching the live tuner", async () => {
    const validatedPlayers: number[] = [];
    const boundedIntegerCalls: Array<{ value: number; min: number; max: number; label: string }> =
      [];
    const executeCalls: Array<{ host?: string; port?: number; command: string }> = [];
    const dependencies: TargetCandidatesDependencies = {
      validatePlayerId: (playerId) => {
        validatedPlayers.push(playerId);
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
      parseTargetCandidates: () => targetCandidatesResult(),
    };

    const result = await callCiv7TargetCandidatesProcedure(
      {
        playerId: 0,
        origins: [{ x: 18, y: 20 }],
        maxCandidates: 4,
        maxPlayers: 12,
        unitRadius: 3,
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "target-candidates-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(targetCandidatesResult());
    expect(result.output.relationshipLabelPolicy).toEqual({
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance:
        "Target candidates rank other owners from runtime city and unit summaries. They keep relationship labels unproven without official proof.",
    });
    expect(result.diagnostics).toMatchObject({
      procedureKey: "strategy.target.candidates",
      correlationId: "target-candidates-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(validatedPlayers).toEqual([0]);
    expect(boundedIntegerCalls).toEqual([
      { value: 4, min: 1, max: 64, label: "maxCandidates" },
      { value: 12, min: 1, max: 128, label: "maxPlayers" },
      { value: 3, min: 0, max: 16, label: "unitRadius" },
    ]);
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(executeCalls[0]?.command).toContain("readTargetCandidates");
    expect(executeCalls[0]?.command).toContain('"origins":[{"x":18,"y":20}]');
    expect(executeCalls[0]?.command).toContain('"maxCandidates":4');
    expect(executeCalls[0]?.command).not.toContain("sendRequest");
    expect(executeCalls[0]?.command).not.toContain("sendOperation(");
  });

  test("rejects invalid procedure input before target-candidates dependencies run", async () => {
    let executed = false;
    const dependencies: TargetCandidatesDependencies = {
      validatePlayerId: () => {
        throw new Error("validatePlayerId should not run after procedure input rejection");
      },
      boundedInteger: (value) => value,
      executeAppUiCommand: async () => {
        executed = true;
        throw new Error("executeAppUiCommand should not run after procedure input rejection");
      },
      parseTargetCandidates: () => targetCandidatesResult(),
    };

    await expect(
      callCiv7TargetCandidatesProcedure(
        { maxCandidates: 65 },
        {
          procedure: { correlationId: "target-candidates-invalid-max" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "strategy.target.candidates",
        role: "input",
      },
    });
    await expect(
      callCiv7TargetCandidatesProcedure(
        {
          host: "127.0.0.1",
        } as never,
        {
          procedure: { correlationId: "target-candidates-context-input" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "strategy.target.candidates",
        role: "input",
      },
    });
    expect(executed).toBe(false);
  });
});

function targetCandidatesResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    playerId: 0,
    origins: [{ x: 18, y: 20 }],
    unitRadius: 3,
    hiddenInfoPolicy:
      "runtime-debug-summary; may include non-visible cities or units until paired with visibility reads",
    relationshipLabelPolicy: {
      relationshipSource: "not-classified" as const,
      relationshipProof: "none" as const,
      unprovenLabel: "relationship-unproven" as const,
      guidance:
        "Target candidates rank other owners from runtime city and unit summaries. They keep relationship labels unproven without official proof.",
    },
    candidates: [
      {
        owner: 9,
        leaderName: { ok: true as const, value: "Independent Power" },
        civilizationName: { ok: true as const, value: "Independent" },
        isHuman: { ok: true as const, value: false },
        cityCount: 2,
        unitCount: 4,
        cities: [
          {
            owner: 9,
            name: "Independent City",
            location: { x: 13, y: 17 },
          },
        ],
        nearestCity: {
          owner: 9,
          name: "Independent City",
          location: { x: 13, y: 17 },
        },
        nearestDistance: 5,
        nearbyUnits: [
          {
            owner: 9,
            typeName: "UNIT_WARRIOR",
            location: { x: 13, y: 16 },
          },
        ],
        nearbyUnitCount: 4,
        apparentStrength: 42,
        approach: {
          nearestOrigin: { x: 18, y: 20 },
          targetLocation: { x: 13, y: 17 },
          directGridDistance: 5,
          routeHint: "near-low-density",
          routeKind: "land",
          originWater: { ok: true as const, value: false },
          targetWater: { ok: true as const, value: false },
          waterSampleCount: 0,
          landSampleCount: 6,
          notes: [
            "Distance is a cheap grid heuristic for target ranking, not a pathfinder result.",
            "Route kind is sampled from endpoints and a straight grid line; it is not Civ pathfinding.",
          ],
        },
        reasons: ["nearest target distance 5", "low nearby unit density"],
      },
    ],
    notes: [
      "Read-only target shortlist. It ranks other-owner contacts and sends no operations.",
      "Owner mismatch is contact evidence only. Use relationship-unproven language unless official proof exists.",
    ],
  };
}
