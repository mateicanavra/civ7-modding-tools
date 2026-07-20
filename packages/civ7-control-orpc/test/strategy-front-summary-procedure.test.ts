import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";
import type {
  Civ7ControlOrpcBattlefieldScanResult,
  Civ7ControlOrpcDestinationAnalysisResult,
  Civ7ControlOrpcTargetCandidatesResult,
} from "../src/dependencies/direct-control";
import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7StrategyFrontSummaryUnavailableError,
  createCiv7ControlOrpcServerClient,
} from "../src/index";
import { directControlFacadeFixture } from "./support/direct-control-facade";

describe("strategy.frontSummary control-oRPC procedure", () => {
  test("composes target candidates and battlefield scan into a neutral planning view", async () => {
    const fake = fakeContext({
      targetCandidates: targetCandidatesResult(),
      battlefieldScan: battlefieldScanResult(),
      destinationAnalysis: destinationAnalysisResult(),
    });

    const result = await call(
      Civ7ControlOrpcRouter.strategy.frontSummary,
      {
        playerId: 0,
        origins: [{ x: 10, y: 20 }],
        candidateLimit: 3,
        scanRadius: 6,
        maxPlayers: 12,
        target: { x: 15, y: 20 },
      },
      {
        context: fake.context,
      }
    );

    expect(fake.calls).toEqual({
      targetCandidates: [
        {
          input: {
            playerId: 0,
            origins: [{ x: 10, y: 20 }],
            maxCandidates: 3,
            maxPlayers: 12,
            unitRadius: 6,
          },
          options: {
            host: "127.0.0.1",
            port: 4318,
            timeoutMs: 1_000,
          },
        },
      ],
      battlefieldScan: [
        {
          input: {
            playerId: 0,
            origins: [{ x: 10, y: 20 }],
            radius: 6,
            maxPlayers: 12,
            maxUnits: 48,
            maxCities: 24,
          },
          options: {
            host: "127.0.0.1",
            port: 4318,
            timeoutMs: 1_000,
          },
        },
      ],
      destinationAnalysis: [
        {
          input: {
            playerId: 0,
            origin: { x: 10, y: 20 },
            destination: { x: 15, y: 20 },
            corridorRadius: 2,
            destinationRadius: 4,
            maxPlayers: 12,
            maxUnits: undefined,
            maxCities: undefined,
          },
          options: {
            host: "127.0.0.1",
            port: 4318,
            timeoutMs: 1_000,
          },
        },
      ],
    });
    expect(result).toMatchObject({
      playerId: 0,
      localPlayerId: 0,
      origins: [{ x: 10, y: 20 }],
      sourceStatus: {
        targetCandidates: "read",
        battlefieldScan: "read",
        destinationAnalysis: "read",
      },
      relationshipLabelPolicy: {
        relationshipSource: "not-classified",
        relationshipProof: "none",
        unprovenLabel: "relationship-unproven",
      },
      summary: {
        targetCandidateCount: 1,
        pointOfInterestCount: 2,
        observedOwnerCount: 2,
        nextStepCount: 4,
      },
      target: { x: 15, y: 20 },
    });
    expect(result.targetCandidates).toEqual([
      {
        owner: 1,
        relationship: "relationship-unproven",
        relationshipProof: "none",
        nearestDistance: 5,
        cityCount: 1,
        unitCount: 3,
        nearbyUnitCount: 2,
        apparentStrength: 17.5,
        routeKind: "land",
        routeHint: "near",
        reasons: ["nearest target distance 5"],
      },
    ]);
    expect(result.pointsOfInterest).toEqual([
      {
        kind: "nearby-other-owners",
        severity: "medium",
        location: { x: 11, y: 21 },
        summary: "2 other-owner units within 3 tiles of an origin",
        source: "battlefield",
      },
      {
        kind: "destination-contact",
        severity: "high",
        location: { x: 15, y: 20 },
        summary: "destination contact near intended front",
        source: "destination",
      },
    ]);
    expect(result.front).toMatchObject({
      posture: "stage-before-entering-target-contact",
      headline: "origin (10,20) toward target/front (15,20); leading candidate: owner 1",
      risks: [
        "destination contact near intended front",
        "2 other-owner units near intended front",
        "1 relationship-unproven cities near intended front",
        "apparent destination contact 10",
      ],
    });
    expect(JSON.stringify(result.front.nextInspections)).not.toContain("game play");
    expect(result.observedOwners).toEqual([
      {
        owner: 0,
        relationship: "self",
        relationshipProof: "self",
        unitCount: 1,
        cityCount: 1,
        apparentStrength: 12,
        nearestDistance: 0,
      },
      {
        owner: 1,
        relationship: "relationship-unproven",
        relationshipProof: "none",
        unitCount: 2,
        cityCount: 1,
        apparentStrength: 20,
        nearestDistance: 2,
      },
    ]);
    expect(result.nextSteps.map((step) => step.kind)).toEqual([
      "inspect-target-candidate",
      "inspect-battlefield-point",
      "read-visibility",
      "validate-unit-action",
    ]);

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain("Game.turn");
    expect(serialized).not.toContain("rawCommand");
    expect(serialized).not.toMatch(/\benemy\b/i);
    expect(serialized).not.toMatch(/\bhostile\b/i);
    expect(serialized).not.toMatch(/\bopponent\b/i);
    expect(serialized).not.toMatch(/\bthreat\b/i);
    expect(serialized).not.toMatch(/\bwar\b/i);
    expect(serialized).not.toMatch(/\bally\b/i);
    expect(serialized).not.toMatch(/\bsuzerain\b/i);
  });

  test("supports the in-process server-side router client", async () => {
    const fake = fakeContext({
      targetCandidates: targetCandidatesResult({ candidates: [] }),
      battlefieldScan: battlefieldScanResult({
        owners: [],
        pointsOfInterest: [],
      }),
      destinationAnalysis: destinationAnalysisResult(),
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.strategy.frontSummary({});

    expect(result.summary).toMatchObject({
      targetCandidateCount: 0,
      pointOfInterestCount: 0,
      observedOwnerCount: 0,
    });
    expect(result.nextSteps).toEqual([
      {
        kind: "observe",
        source: "strategy.frontSummary",
        label: "No front planning evidence found; refresh attention or narrow the scan origins.",
      },
    ]);
  });

  test("keeps endpoint/session/state/raw command fields out of procedure input", async () => {
    const invalidInputs = [
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "tuner" } },
      { session: { state: "Tuner" } },
      { command: "Game.turn" },
      { rawCommand: "Game.turn" },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext({
        targetCandidates: targetCandidatesResult(),
        battlefieldScan: battlefieldScanResult(),
        destinationAnalysis: destinationAnalysisResult(),
      });

      await expect(
        call(Civ7ControlOrpcRouter.strategy.frontSummary, input as never, {
          context: fake.context,
        })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls).toEqual({
        targetCandidates: [],
        battlefieldScan: [],
        destinationAnalysis: [],
      });
    }
  });

  test("maps source read failures to a tagged Effect/oRPC error without raw details", async () => {
    const context: Civ7ControlOrpcContext = {
      directControl: directControlFacadeFixture({
        getCiv7TargetCandidates: async () => {
          throw new Error("Timed out waiting for Civ7 tuner response to CMD:1:Game.turn");
        },
        getCiv7BattlefieldScan: async () => battlefieldScanResult(),
        getCiv7DestinationAnalysis: async () => destinationAnalysisResult(),
      }),
    };

    await expect(
      call(Civ7ControlOrpcRouter.strategy.frontSummary, {}, { context })
    ).rejects.toMatchObject({
      code: "STRATEGY_FRONT_SUMMARY_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "strategy.frontSummary",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.strategy.frontSummary, {}, { context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Game.turn");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first strategy.frontSummary service leaf", () => {
    expect(Civ7ControlOrpcContract.strategy.frontSummary["~orpc"]).toMatchObject({
      meta: {
        family: "strategy",
        procedureKey: "strategy.frontSummary",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(Civ7ControlOrpcContract.strategy.frontSummary["~orpc"].errorMap).toHaveProperty(
      "STRATEGY_FRONT_SUMMARY_UNAVAILABLE"
    );
    expect(Civ7StrategyFrontSummaryUnavailableError.code).toBe(
      "STRATEGY_FRONT_SUMMARY_UNAVAILABLE"
    );
  });
});

function fakeContext(
  results: Readonly<{
    targetCandidates: Civ7ControlOrpcTargetCandidatesResult;
    battlefieldScan: Civ7ControlOrpcBattlefieldScanResult;
    destinationAnalysis: Civ7ControlOrpcDestinationAnalysisResult;
  }>
): {
  calls: {
    targetCandidates: Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >;
    battlefieldScan: Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >;
    destinationAnalysis: Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >;
  };
  context: Civ7ControlOrpcContext;
} {
  const calls = {
    targetCandidates: [] as Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >,
    battlefieldScan: [] as Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >,
    destinationAnalysis: [] as Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >,
  };

  return {
    calls,
    context: {
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      directControl: {
        getCiv7TargetCandidates: async (input, options) => {
          calls.targetCandidates.push({ input, options });
          return results.targetCandidates;
        },
        getCiv7BattlefieldScan: async (input, options) => {
          calls.battlefieldScan.push({ input, options });
          return results.battlefieldScan;
        },
        getCiv7DestinationAnalysis: async (input, options) => {
          calls.destinationAnalysis.push({ input, options });
          return results.destinationAnalysis;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function targetCandidatesResult(
  overrides: Partial<Civ7ControlOrpcTargetCandidatesResult> = {}
): Civ7ControlOrpcTargetCandidatesResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    playerId: 0,
    origins: [{ x: 10, y: 20 }],
    unitRadius: 6,
    hiddenInfoPolicy: "runtime-debug-summary",
    relationshipLabelPolicy: {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance: "neutral",
    },
    candidates: [
      {
        owner: 1,
        leaderName: { ok: true, value: "Leader" },
        civilizationName: { ok: true, value: "Civilization" },
        isHuman: { ok: true, value: false },
        cityCount: 1,
        unitCount: 3,
        cities: [],
        nearestCity: null,
        nearestDistance: 5,
        nearbyUnits: [],
        nearbyUnitCount: 2,
        apparentStrength: 17.5,
        approach: {
          nearestOrigin: { x: 10, y: 20 },
          targetLocation: { x: 15, y: 20 },
          directGridDistance: 5,
          routeHint: "near",
          routeKind: "land",
          originWater: null,
          targetWater: null,
          waterSampleCount: 0,
          landSampleCount: 4,
          notes: ["Use validators before sends."],
        },
        reasons: ["nearest target distance 5"],
      },
    ],
    notes: ["Target candidates are planning support."],
    ...overrides,
  };
}

function destinationAnalysisResult(
  overrides: Partial<Civ7ControlOrpcDestinationAnalysisResult> = {}
): Civ7ControlOrpcDestinationAnalysisResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    playerId: 0,
    origin: { x: 10, y: 20 },
    destination: { x: 15, y: 20 },
    corridorRadius: 2,
    destinationRadius: 4,
    hiddenInfoPolicy: "runtime-debug-summary",
    relationshipLabelPolicy: {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance: "neutral",
    },
    corridor: {
      routeHint: "land",
      directGridDistance: 5,
      sampleCount: 2,
      sampledPlots: [],
      units: [],
      unitCount: 0,
    },
    destinationPressure: {
      units: [],
      unitCount: 2,
      cities: [],
      cityCount: 1,
      apparentOtherStrength: 10,
    },
    pointsOfInterest: [
      {
        kind: "destination-contact",
        severity: "high",
        location: { x: 15, y: 20 },
        summary: "destination pressure near intended front",
      },
    ],
    notes: ["Destination analysis is read-only."],
    ...overrides,
  };
}

function battlefieldScanResult(
  overrides: Partial<Civ7ControlOrpcBattlefieldScanResult> = {}
): Civ7ControlOrpcBattlefieldScanResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    playerId: 0,
    origins: [{ x: 10, y: 20 }],
    radius: 6,
    hiddenInfoPolicy: "runtime-debug-summary",
    relationshipLabelPolicy: {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance: "neutral",
    },
    units: [],
    cities: [],
    owners: [
      {
        owner: 0,
        stance: "friendly",
        relationshipProof: "self",
        relationshipLabel: "friendly",
        unitCount: 1,
        cityCount: 1,
        roles: {},
        apparentStrength: 12,
        nearestUnit: { distance: 0 },
        nearestCity: null,
      },
      {
        owner: 1,
        stance: "other",
        relationshipProof: "none",
        relationshipLabel: "relationship-unproven",
        unitCount: 2,
        cityCount: 1,
        roles: {},
        apparentStrength: 20,
        nearestUnit: { distance: 2 },
        nearestCity: { distance: 4 },
      },
    ],
    pointsOfInterest: [
      {
        kind: "nearby-other-owners",
        severity: "medium",
        location: { x: 11, y: 21 },
        summary: "2 other-owner units within 3 tiles of an origin",
      },
    ],
    notes: ["Battlefield scan is read-only."],
    ...overrides,
  };
}
