import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7BattlefieldScanProcedureDescriptor,
  Civ7BattlefieldScanProcedureSchemaArtifacts,
  callCiv7BattlefieldScanProcedure,
  getCiv7BattlefieldScan,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  type BattlefieldScanDependencies,
} from "../src/index";

describe("Civ7 battlefield-scan procedure descriptor", () => {
  test("records the neutral read-only battlefield scan atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7BattlefieldScanProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "strategy.battlefield.scan",
      family: "strategy",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/tactical/battlefield.ts",
      atomFunction: "getCiv7BattlefieldScan",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7BattlefieldScan.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7BattlefieldScanProcedureDescriptor,
      Civ7BattlefieldScanProcedureSchemaArtifacts,
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7BattlefieldScanProcedureDescriptor.inputFields),
    );
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7BattlefieldScanProcedureDescriptor.outputFields),
    );
    expect(Value.Check(resolved.inputSchema, {
      origins: [{ x: 17, y: 20 }],
      radius: 8,
      maxPlayers: 12,
      maxUnits: 16,
      maxCities: 8,
    })).toBe(true);
    expect(Value.Check(resolved.inputSchema, { radius: 33 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { origins: [{ x: 1.5, y: 0 }] })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { rawCommand: "readBattlefieldScan()" })).toBe(false);
    expect(Value.Check(resolved.outputSchema, battlefieldScanResult())).toBe(true);
    expect(Value.Check(resolved.outputSchema, {
      ...battlefieldScanResult(),
      units: [
        {
          ...battlefieldScanResult().units[1],
          relationshipProof: "owner-mismatch",
        },
      ],
    })).toBe(false);
    expect(Value.Check(resolved.outputSchema, {
      ...battlefieldScanResult(),
      rawCommand: "readBattlefieldScan()",
    })).toBe(false);
  });

  test("calls the battlefield scan atom through the procedure core without touching the live tuner", async () => {
    const validatedPlayers: number[] = [];
    const boundedIntegerCalls: Array<{ value: number; min: number; max: number; label: string }> = [];
    const executeCalls: Array<{ host?: string; port?: number; command: string }> = [];
    const dependencies: BattlefieldScanDependencies = {
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
      parseBattlefieldScan: () => battlefieldScanResult(),
    };

    const result = await callCiv7BattlefieldScanProcedure({
      playerId: 0,
      origins: [{ x: 17, y: 20 }],
      radius: 8,
      maxPlayers: 12,
      maxUnits: 16,
      maxCities: 8,
    }, {
      directControl: {
        host: "127.0.0.1",
        port: 4318,
      },
      procedure: {
        correlationId: "battlefield-scan-procedure-test",
      },
      dependencies,
    });

    expect(result.output).toEqual(battlefieldScanResult());
    expect(result.output.relationshipLabelPolicy).toEqual({
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance:
        "Battlefield scan can prove owner ids and proximity, but keeps relationship status unproven without official proof.",
    });
    expect(result.output.units[0]).toMatchObject({
      owner: 0,
      relationshipProof: "self",
      relationshipLabel: "friendly",
    });
    expect(result.output.units[1]).toMatchObject({
      owner: 9,
      relationshipProof: "none",
      relationshipLabel: "relationship-unproven",
    });
    expect(result.diagnostics).toMatchObject({
      procedureKey: "strategy.battlefield.scan",
      correlationId: "battlefield-scan-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(validatedPlayers).toEqual([0]);
    expect(boundedIntegerCalls).toEqual([
      { value: 8, min: 1, max: 32, label: "radius" },
      { value: 12, min: 1, max: 128, label: "maxPlayers" },
      { value: 16, min: 1, max: 256, label: "maxUnits" },
      { value: 8, min: 1, max: 128, label: "maxCities" },
    ]);
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(executeCalls[0]?.command).toContain("readBattlefieldScan");
    expect(executeCalls[0]?.command).toContain('"origins":[{"x":17,"y":20}]');
    expect(executeCalls[0]?.command).toContain('"radius":8');
    expect(executeCalls[0]?.command).not.toContain("sendRequest");
    expect(executeCalls[0]?.command).not.toContain("sendOperation(");
  });

  test("rejects invalid procedure input before battlefield scan dependencies run", async () => {
    let executed = false;
    const dependencies: BattlefieldScanDependencies = {
      validatePlayerId: () => {
        throw new Error("validatePlayerId should not run after procedure input rejection");
      },
      boundedInteger: (value) => value,
      executeAppUiCommand: async () => {
        executed = true;
        throw new Error("executeAppUiCommand should not run after procedure input rejection");
      },
      parseBattlefieldScan: () => battlefieldScanResult(),
    };

    await expect(callCiv7BattlefieldScanProcedure({ radius: 33 }, {
      procedure: { correlationId: "battlefield-scan-invalid-radius" },
      dependencies,
    })).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "strategy.battlefield.scan",
        role: "input",
      },
    });
    await expect(callCiv7BattlefieldScanProcedure({
      host: "127.0.0.1",
    } as never, {
      procedure: { correlationId: "battlefield-scan-context-input" },
      dependencies,
    })).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "strategy.battlefield.scan",
        role: "input",
      },
    });
    expect(executed).toBe(false);
  });
});

function battlefieldScanResult() {
  const friendlyUnit = {
    id: { owner: 0, id: 458752, type: 26 },
    owner: 0,
    stance: "friendly" as const,
    relationshipProof: "self" as const,
    relationshipLabel: "friendly" as const,
    type: 111,
    typeName: "UNIT_SLINGER",
    role: "ranged",
    location: { x: 17, y: 20 },
    distance: 0,
    nearestOrigin: { x: 17, y: 20 },
    damage: 36,
    wounded: true,
    strength: 9.6,
    movementMovesRemaining: 2,
    attacksRemaining: 1,
  };
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
    distance: 4,
    nearestOrigin: { x: 17, y: 20 },
    damage: 0,
    wounded: false,
    strength: 20,
    movementMovesRemaining: 2,
    attacksRemaining: 1,
  };
  const otherOwnerCity = {
    id: { owner: 9, id: 589824, type: 1 },
    owner: 9,
    stance: "other" as const,
    relationshipProof: "none" as const,
    relationshipLabel: "relationship-unproven" as const,
    name: "Independent City",
    location: { x: 13, y: 17 },
    distance: 4,
    nearestOrigin: { x: 17, y: 20 },
    population: 3,
    isTown: false,
  };
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    playerId: 0,
    origins: [{ x: 17, y: 20 }],
    radius: 8,
    hiddenInfoPolicy:
      "runtime-debug-summary; may include non-visible units or cities until paired with visibility/map reads",
    relationshipLabelPolicy: {
      relationshipSource: "not-classified" as const,
      relationshipProof: "none" as const,
      unprovenLabel: "relationship-unproven" as const,
      guidance:
        "Battlefield scan can prove owner ids and proximity, but keeps relationship status unproven without official proof.",
    },
    units: [friendlyUnit, otherOwnerUnit],
    cities: [otherOwnerCity],
    owners: [
      {
        owner: 0,
        stance: "friendly" as const,
        relationshipProof: "self" as const,
        relationshipLabel: "friendly" as const,
        unitCount: 1,
        cityCount: 0,
        roles: { ranged: 1 },
        apparentStrength: 9.6,
        nearestUnit: friendlyUnit,
        nearestCity: null,
      },
      {
        owner: 9,
        stance: "other" as const,
        relationshipProof: "none" as const,
        relationshipLabel: "relationship-unproven" as const,
        unitCount: 1,
        cityCount: 1,
        roles: { melee: 1 },
        apparentStrength: 20,
        nearestUnit: otherOwnerUnit,
        nearestCity: otherOwnerCity,
      },
    ],
    pointsOfInterest: [
      {
        kind: "wounded-friendly",
        severity: "medium",
        location: friendlyUnit.location,
        summary: "friendly wounded unit near scan origin",
        units: [friendlyUnit],
      },
      {
        kind: "city-front",
        severity: "medium",
        location: otherOwnerCity.location,
        summary: "nearest relationship-unproven city in scan radius",
        cities: [otherOwnerCity],
      },
    ],
    notes: [
      "Read-only battlefield lens for tactical orientation. It does not path, move, attack, or validate operations.",
      "Owner mismatch is contact evidence, not relationship proof. Use relationship-unproven language unless official proof exists.",
    ],
  };
}
