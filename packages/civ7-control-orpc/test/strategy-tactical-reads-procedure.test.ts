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
  Civ7StrategyTacticalReadUnavailableError,
  createCiv7ControlOrpcServerClient,
} from "../src/index";

describe("strategy tactical read control-oRPC procedures", () => {
  test("projects battlefield scan into bounded owner and point summaries", async () => {
    const fake = fakeContext();

    const result = await call(
      Civ7ControlOrpcRouter.strategy.battlefieldScan,
      {
        playerId: 0,
        origins: [{ x: 17, y: 20 }],
        radius: 8,
        maxPlayers: 12,
        maxUnits: 80,
        maxCities: 32,
      },
      { context: fake.context }
    );

    expect(fake.calls.battlefieldScan).toEqual([
      {
        input: {
          playerId: 0,
          origins: [{ x: 17, y: 20 }],
          radius: 8,
          maxPlayers: 12,
          maxUnits: 80,
          maxCities: 32,
        },
        options: { host: "127.0.0.1", port: 4318, timeoutMs: 1_000 },
      },
    ]);
    expect(result).toMatchObject({
      playerId: 0,
      localPlayerId: 0,
      origins: [{ x: 17, y: 20 }],
      radius: 8,
      relationshipLabelPolicy: {
        relationshipSource: "not-classified",
        relationshipProof: "none",
        unprovenLabel: "relationship-unproven",
      },
      summary: {
        unitCount: 3,
        cityCount: 1,
        observedOwnerCount: 2,
        pointOfInterestCount: 2,
        apparentStrengthTotal: 30.6,
      },
    });
    expect(result.owners).toEqual([
      {
        owner: 0,
        relationship: "self",
        relationshipProof: "self",
        unitCount: 2,
        cityCount: 0,
        apparentStrength: 10.6,
        nearestDistance: 0,
        roles: { ranged: 1, civilian: 1 },
      },
      {
        owner: 9,
        relationship: "relationship-unproven",
        relationshipProof: "none",
        unitCount: 1,
        cityCount: 1,
        apparentStrength: 20,
        nearestDistance: 4,
        roles: { melee: 1 },
      },
    ]);
    expect(result.pointsOfInterest[0]).toMatchObject({
      kind: "civilian-risk",
      severity: "high",
      location: { x: 16, y: 18 },
    });
    expect(result.nextSteps.map((step) => step.kind)).toEqual([
      "inspect-battlefield-point",
      "read-visibility",
      "validate-unit-action",
    ]);

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain('"units":[');
    expect(serialized).not.toContain('"cities":[');
    expect(serialized).not.toContain("rawCommand");
    expectNoRelationshipOverclaim(serialized);
  });

  test("projects target candidates into neutral service output without raw runtime samples", async () => {
    const fake = fakeContext();

    const result = await call(
      Civ7ControlOrpcRouter.strategy.targetCandidates,
      {
        playerId: 0,
        origins: [{ x: 18, y: 20 }],
        maxCandidates: 4,
        maxPlayers: 12,
        unitRadius: 4,
      },
      { context: fake.context }
    );

    expect(fake.calls.targetCandidates).toEqual([
      {
        input: {
          playerId: 0,
          origins: [{ x: 18, y: 20 }],
          maxCandidates: 4,
          maxPlayers: 12,
          unitRadius: 4,
        },
        options: { host: "127.0.0.1", port: 4318, timeoutMs: 1_000 },
      },
    ]);
    expect(result).toMatchObject({
      playerId: 0,
      localPlayerId: 0,
      relationshipLabelPolicy: {
        relationshipSource: "not-classified",
        relationshipProof: "none",
        unprovenLabel: "relationship-unproven",
      },
      summary: {
        candidateCount: 1,
        nearestDistance: 5,
        observedOwnerCount: 1,
        apparentStrengthTotal: 42,
      },
    });
    expect(result.candidates[0]).toMatchObject({
      owner: 9,
      relationship: "relationship-unproven",
      relationshipProof: "none",
      leaderName: "Independent Power",
      civilizationName: "Independent",
      cityCount: 2,
      unitCount: 4,
      nearestCityLocation: { x: 13, y: 17 },
      approach: {
        routeKind: "land",
        waterSampleCount: 0,
        landSampleCount: 6,
      },
    });
    expect(result.nextSteps.map((step) => step.kind)).toEqual([
      "inspect-candidate",
      "read-visibility",
      "validate-unit-action",
    ]);

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain("rawCommand");
    expect(serialized).not.toContain('cities":[');
    expect(serialized).not.toContain('"nearbyUnits":[');
    expectNoRelationshipOverclaim(serialized);
  });

  test("projects destination analysis into bounded planning output without raw samples", async () => {
    const fake = fakeContext();
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.strategy.destinationAnalysis({
      playerId: 0,
      origin: { x: 20, y: 14 },
      destination: { x: 13, y: 17 },
      corridorRadius: 2,
      destinationRadius: 4,
    });

    expect(fake.calls.destinationAnalysis).toEqual([
      {
        input: {
          playerId: 0,
          origin: { x: 20, y: 14 },
          destination: { x: 13, y: 17 },
          corridorRadius: 2,
          destinationRadius: 4,
        },
        options: { host: "127.0.0.1", port: 4318, timeoutMs: 1_000 },
      },
    ]);
    expect(result).toMatchObject({
      playerId: 0,
      localPlayerId: 0,
      origin: { x: 20, y: 14 },
      destination: { x: 13, y: 17 },
      relationshipLabelPolicy: {
        relationshipSource: "not-classified",
        relationshipProof: "none",
        unprovenLabel: "relationship-unproven",
      },
      summary: {
        pointOfInterestCount: 1,
        corridorUnitCount: 1,
        destinationUnitCount: 1,
        destinationCityCount: 1,
        apparentOtherStrength: 20,
      },
      corridor: {
        routeHint: "straight-line-grid-corridor",
        directGridDistance: 7,
        sampleCount: 8,
        unitCount: 1,
      },
      destinationPressure: {
        unitCount: 1,
        cityCount: 1,
        apparentOtherStrength: 20,
      },
    });
    expect(result.nextSteps.map((step) => step.kind)).toEqual([
      "inspect-destination",
      "read-visibility",
      "validate-unit-action",
    ]);

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain('"sampledPlots":[');
    expect(serialized).not.toContain('"units":[');
    expect(serialized).not.toContain('"cities":[');
    expectNoRelationshipOverclaim(serialized);
  });

  test("rejects endpoint, session, raw command, and unknown fields before facade execution", async () => {
    const invalidInputs = [
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "tuner" } },
      { session: { state: "App UI" } },
      { command: "Game.turn" },
      { rawCommand: "Game.turn" },
      { approvalReason: "go" },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext();
      await expect(
        call(Civ7ControlOrpcRouter.strategy.battlefieldScan, input as never, {
          context: fake.context,
        })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      await expect(
        call(Civ7ControlOrpcRouter.strategy.targetCandidates, input as never, {
          context: fake.context,
        })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      await expect(
        call(
          Civ7ControlOrpcRouter.strategy.destinationAnalysis,
          {
            destination: { x: 13, y: 17 },
            ...input,
          } as never,
          { context: fake.context }
        )
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls).toEqual({
        battlefieldScan: [],
        targetCandidates: [],
        destinationAnalysis: [],
      });
    }
  });

  test("maps raw-command-bearing read failures to bounded tagged errors", async () => {
    const context: Civ7ControlOrpcContext = {
      directControl: {
        getCiv7BattlefieldScan: async () => {
          throw new Error("Timed out waiting for Civ7 tuner response to CMD:0:Game.turn");
        },
        getCiv7TargetCandidates: async () => {
          throw new Error("Timed out waiting for Civ7 tuner response to CMD:1:Game.turn");
        },
        getCiv7DestinationAnalysis: async () => {
          throw new Error("Timed out waiting for Civ7 tuner response to CMD:2:Game.turn");
        },
      } as Civ7ControlOrpcContext["directControl"],
    };

    await expect(
      call(Civ7ControlOrpcRouter.strategy.battlefieldScan, {}, { context })
    ).rejects.toMatchObject({
      code: "STRATEGY_TACTICAL_READ_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "strategy.battlefieldScan",
        source: "direct-control-facade",
      },
    });
    await expect(
      call(Civ7ControlOrpcRouter.strategy.targetCandidates, {}, { context })
    ).rejects.toMatchObject({
      code: "STRATEGY_TACTICAL_READ_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "strategy.targetCandidates",
        source: "direct-control-facade",
      },
    });
    await expect(
      call(
        Civ7ControlOrpcRouter.strategy.destinationAnalysis,
        {
          destination: { x: 13, y: 17 },
        },
        { context }
      )
    ).rejects.toMatchObject({
      code: "STRATEGY_TACTICAL_READ_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "strategy.destinationAnalysis",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.strategy.targetCandidates, {}, { context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD:");
      expect(serialized).not.toContain("Game.turn");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes contract-first strategy tactical read leaves", () => {
    expect(Civ7ControlOrpcContract.strategy.battlefieldScan["~orpc"]).toMatchObject({
      meta: {
        family: "strategy",
        procedureKey: "strategy.battlefieldScan",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(Civ7ControlOrpcContract.strategy.targetCandidates["~orpc"]).toMatchObject({
      meta: {
        family: "strategy",
        procedureKey: "strategy.targetCandidates",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(Civ7ControlOrpcContract.strategy.destinationAnalysis["~orpc"]).toMatchObject({
      meta: {
        family: "strategy",
        procedureKey: "strategy.destinationAnalysis",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(Civ7ControlOrpcRouter.strategy).toHaveProperty("battlefieldScan");
    expect(Civ7ControlOrpcRouter.strategy).toHaveProperty("targetCandidates");
    expect(Civ7ControlOrpcRouter.strategy).toHaveProperty("destinationAnalysis");
    expect(Civ7ControlOrpcContract.strategy.battlefieldScan["~orpc"].errorMap).toHaveProperty(
      "STRATEGY_TACTICAL_READ_UNAVAILABLE"
    );
    expect(Civ7StrategyTacticalReadUnavailableError.code).toBe(
      "STRATEGY_TACTICAL_READ_UNAVAILABLE"
    );
  });
});

function fakeContext(): {
  calls: {
    battlefieldScan: Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >;
    targetCandidates: Array<
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
    battlefieldScan: [] as Array<
      Readonly<{
        input: unknown;
        options: Civ7ControlOrpcContext["endpointDefaults"];
      }>
    >,
    targetCandidates: [] as Array<
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
      endpointDefaults: { host: "127.0.0.1", port: 4318, timeoutMs: 1_000 },
      directControl: {
        getCiv7BattlefieldScan: async (input, options) => {
          calls.battlefieldScan.push({ input, options });
          return battlefieldScanResult();
        },
        getCiv7TargetCandidates: async (input, options) => {
          calls.targetCandidates.push({ input, options });
          return targetCandidatesResult();
        },
        getCiv7DestinationAnalysis: async (input, options) => {
          calls.destinationAnalysis.push({ input, options });
          return destinationAnalysisResult();
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function battlefieldScanResult(): Civ7ControlOrpcBattlefieldScanResult {
  const friendlyUnit = {
    owner: 0,
    relationshipProof: "self",
    relationshipLabel: "friendly",
    role: "ranged",
    location: { x: 17, y: 20 },
    distance: 0,
    strength: 9.6,
  };
  const civilianUnit = {
    owner: 0,
    relationshipProof: "self",
    relationshipLabel: "friendly",
    role: "civilian",
    location: { x: 16, y: 18 },
    distance: 1,
    strength: 1,
  };
  const otherOwnerUnit = {
    owner: 9,
    relationshipProof: "none",
    relationshipLabel: "relationship-unproven",
    role: "melee",
    location: { x: 13, y: 17 },
    distance: 4,
    strength: 20,
  };
  const city = {
    owner: 9,
    relationshipProof: "none",
    relationshipLabel: "relationship-unproven",
    location: { x: 13, y: 17 },
    distance: 4,
  };
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    playerId: 0,
    origins: [{ x: 17, y: 20 }],
    radius: 8,
    hiddenInfoPolicy: "runtime-debug-summary",
    relationshipLabelPolicy: {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance: "neutral",
    },
    units: [friendlyUnit, civilianUnit, otherOwnerUnit],
    cities: [city],
    owners: [
      {
        owner: 0,
        relationshipProof: "self",
        relationshipLabel: "friendly",
        unitCount: 2,
        cityCount: 0,
        roles: { ranged: 1, civilian: 1 },
        apparentStrength: 10.6,
        nearestUnit: { distance: 0 },
        nearestCity: null,
      },
      {
        owner: 9,
        relationshipProof: "none",
        relationshipLabel: "relationship-unproven",
        unitCount: 1,
        cityCount: 1,
        roles: { melee: 1 },
        apparentStrength: 20,
        nearestUnit: { distance: 4 },
        nearestCity: { distance: 4 },
      },
    ],
    pointsOfInterest: [
      {
        kind: "civilian-risk",
        severity: "high",
        location: civilianUnit.location,
        summary: "friendly civilian has other-owner contact within 4 tiles",
        units: [civilianUnit],
      },
      {
        kind: "city-front",
        severity: "medium",
        location: city.location,
        summary: "nearest relationship-unproven city in scan radius",
        cities: [city],
      },
    ],
    notes: ["Read-only battlefield lens."],
  } as Civ7ControlOrpcBattlefieldScanResult;
}

function targetCandidatesResult(): Civ7ControlOrpcTargetCandidatesResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    playerId: 0,
    origins: [{ x: 18, y: 20 }],
    unitRadius: 4,
    hiddenInfoPolicy: "runtime-debug-summary",
    relationshipLabelPolicy: {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance: "neutral",
    },
    candidates: [
      {
        owner: 9,
        leaderName: { ok: true, value: "Independent Power" },
        civilizationName: { ok: true, value: "Independent" },
        isHuman: { ok: true, value: false },
        cityCount: 2,
        unitCount: 4,
        cities: [{ location: { x: 13, y: 17 } }],
        nearestCity: { location: { x: 13, y: 17 } },
        nearestDistance: 5,
        nearbyUnits: [{ location: { x: 13, y: 16 } }],
        nearbyUnitCount: 4,
        apparentStrength: 42,
        approach: {
          nearestOrigin: { x: 18, y: 20 },
          targetLocation: { x: 13, y: 17 },
          directGridDistance: 5,
          routeHint: "near-low-density",
          routeKind: "land",
          originWater: { ok: true, value: false },
          targetWater: { ok: true, value: false },
          waterSampleCount: 0,
          landSampleCount: 6,
          notes: ["Route kind is a sampled heuristic."],
        },
        reasons: ["nearest target distance 5"],
      },
    ],
    notes: ["Read-only strategic target shortlist."],
  };
}

function destinationAnalysisResult(): Civ7ControlOrpcDestinationAnalysisResult {
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
    hiddenInfoPolicy: "runtime-debug-summary",
    relationshipLabelPolicy: {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance: "neutral",
    },
    corridor: {
      routeHint: "straight-line-grid-corridor",
      directGridDistance: 7,
      sampleCount: 8,
      sampledPlots: [{ location: { x: 20, y: 14 } }],
      units: [{ location: { x: 13, y: 17 } }],
      unitCount: 1,
    },
    destinationPressure: {
      units: [{ location: { x: 13, y: 17 } }],
      unitCount: 1,
      cities: [{ location: { x: 13, y: 17 } }],
      cityCount: 1,
      apparentOtherStrength: 20,
    },
    pointsOfInterest: [
      {
        kind: "destination-pressure",
        severity: "medium",
        location: { x: 13, y: 17 },
        summary: "1 other-owner units near destination",
      },
    ],
    notes: ["Read-only destination lens."],
  };
}

function expectNoRelationshipOverclaim(text: string): void {
  expect(text).not.toMatch(/\benemy\b/i);
  expect(text).not.toMatch(/\bhostile\b/i);
  expect(text).not.toMatch(/\bopponent\b/i);
  expect(text).not.toMatch(/\bthreat\b/i);
  expect(text).not.toMatch(/\bwar\b/i);
  expect(text).not.toMatch(/\bally\b/i);
  expect(text).not.toMatch(/\bsuzerain\b/i);
}
