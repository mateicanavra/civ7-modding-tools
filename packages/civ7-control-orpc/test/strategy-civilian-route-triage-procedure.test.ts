import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7StrategyCivilianRouteTriageUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
} from "../src/index";
import type {
  Civ7ControlOrpcBattlefieldScanResult,
  Civ7ControlOrpcDestinationAnalysisResult,
  Civ7ControlOrpcPlayNotificationViewResult,
  Civ7ControlOrpcReadyUnitViewResult,
  Civ7ControlOrpcSettlementRecommendationsResult,
} from "../src/dependencies/direct-control";

describe("strategy.civilianRouteTriage control-oRPC procedure", () => {
  test("composes route evidence into semantic civilian triage", async () => {
    const fake = fakeContext({});

    const result = await call(
      Civ7ControlOrpcRouter.strategy.civilianRouteTriage,
      {
        origin: { x: 15, y: 23 },
        settlementCount: 5,
        scanRadius: 6,
        maxUnits: 96,
        maxCities: 40,
      },
      { context: fake.context },
    );

    expect(fake.calls).toMatchObject({
      notifications: [{ maxNotifications: 10 }],
      readyUnit: [],
      settlement: [{
        input: {
          playerId: undefined,
          locations: [{ x: 15, y: 23 }],
          count: 5,
          includeSettlers: false,
          includeCities: false,
        },
      }],
      battlefield: [{
        input: {
          playerId: undefined,
          origins: [{ x: 15, y: 23 }],
          radius: 6,
          maxUnits: 96,
          maxCities: 40,
        },
      }],
      destinationAnalysis: [{
        input: {
          playerId: undefined,
          origin: { x: 15, y: 23 },
          destination: { x: 20, y: 20 },
          corridorRadius: 2,
          destinationRadius: 4,
          maxUnits: 96,
          maxCities: 40,
        },
      }],
    });
    expect(result).toMatchObject({
      playerId: 0,
      localPlayerId: 0,
      origin: { x: 15, y: 23 },
      destination: { x: 20, y: 20 },
      sourceStatus: {
        notifications: "read",
        readyUnit: "skipped-explicit-origin",
        settlementRecommendations: "read",
        battlefieldScan: "read",
        destinationAnalysis: "read",
      },
      relationshipLabelPolicy: {
        relationshipSource: "not-classified",
        relationshipProof: "none",
        unprovenLabel: "relationship-unproven",
      },
      triage: {
        status: "hold-or-screen",
        summary: "civilian route (15,23) -> (20,20)",
      },
    });
    expect(result.triage.nextSteps.map((step) => step.kind)).toContain(
      "validate-unit-action",
    );
    expect(JSON.stringify(result.nextSteps)).not.toContain("game play");
    expectSafeCivilianTriageOutput(result);
  });

  test("infers ready-unit origin and supports the in-process server client", async () => {
    const fake = fakeContext({});
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.strategy.civilianRouteTriage({});

    expect(fake.calls.readyUnit).toHaveLength(1);
    expect(fake.calls.settlement[0]?.input).toMatchObject({
      locations: [{ x: 17, y: 20 }],
      includeSettlers: false,
    });
    expect(result.origin).toEqual({ x: 17, y: 20 });
    expect(result.destination).toEqual({ x: 20, y: 20 });
    expect(result.sourceStatus.readyUnit).toBe("read");
    expect(result.readyUnit).toMatchObject({
      unitId: { owner: 0, id: 458752, type: 26 },
      typeName: "UNIT_SETTLER",
      location: { x: 17, y: 20 },
      legalOperationCount: 1,
    });
  });

  test("rejects endpoint/session/raw command input before facade reads", async () => {
    const invalidInputs = [
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "tuner" } },
      { session: { state: "Tuner" } },
      { command: "Game.turn" },
      { rawCommand: "Game.turn" },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext({});
      await expect(
        call(
          Civ7ControlOrpcRouter.strategy.civilianRouteTriage,
          input as never,
          { context: fake.context },
        ),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls).toEqual(emptyCalls());
    }
  });

  test("maps source failures to tagged errors without raw command details", async () => {
    const context: Civ7ControlOrpcContext = {
      directControl: {
        getCiv7PlayNotificationView: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:1:Game.turn",
          );
        },
      } as Civ7ControlOrpcContext["directControl"],
    };

    await expect(
      call(Civ7ControlOrpcRouter.strategy.civilianRouteTriage, {}, { context }),
    ).rejects.toMatchObject({
      code: "STRATEGY_CIVILIAN_ROUTE_TRIAGE_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "strategy.civilianRouteTriage",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.strategy.civilianRouteTriage, {}, {
        context,
      });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Game.turn");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first strategy.civilianRouteTriage service leaf", () => {
    expect(
      Civ7ControlOrpcContract.strategy.civilianRouteTriage["~orpc"],
    ).toMatchObject({
      meta: {
        family: "strategy",
        procedureKey: "strategy.civilianRouteTriage",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(
      Civ7ControlOrpcContract.strategy.civilianRouteTriage["~orpc"].errorMap,
    ).toHaveProperty("STRATEGY_CIVILIAN_ROUTE_TRIAGE_UNAVAILABLE");
    expect(Civ7StrategyCivilianRouteTriageUnavailableError.code).toBe(
      "STRATEGY_CIVILIAN_ROUTE_TRIAGE_UNAVAILABLE",
    );
  });
});

type Calls = ReturnType<typeof emptyCalls>;

function emptyCalls() {
  return {
    notifications: [] as unknown[],
    readyUnit: [] as Array<Readonly<{ input: unknown }>>,
    settlement: [] as Array<Readonly<{ input: unknown }>>,
    battlefield: [] as Array<Readonly<{ input: unknown }>>,
    destinationAnalysis: [] as Array<Readonly<{ input: unknown }>>,
  };
}

function fakeContext(
  overrides: Partial<{
    notifications: Civ7ControlOrpcPlayNotificationViewResult;
    readyUnit: Civ7ControlOrpcReadyUnitViewResult;
    settlement: Civ7ControlOrpcSettlementRecommendationsResult;
    battlefield: Civ7ControlOrpcBattlefieldScanResult;
    destinationAnalysis: Civ7ControlOrpcDestinationAnalysisResult;
  }>,
): { calls: Calls; context: Civ7ControlOrpcContext } {
  const calls = emptyCalls();
  const results = {
    notifications: playNotificationView(),
    readyUnit: readyUnitView(),
    settlement: settlementRecommendations(),
    battlefield: battlefieldScan(),
    destinationAnalysis: destinationAnalysis(),
    ...overrides,
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
        getCiv7PlayNotificationView: async (options) => {
          calls.notifications.push(options);
          return results.notifications;
        },
        getCiv7ReadyUnitView: async (input) => {
          calls.readyUnit.push({ input });
          return results.readyUnit;
        },
        getCiv7SettlementRecommendations: async (input) => {
          calls.settlement.push({ input });
          return results.settlement;
        },
        getCiv7BattlefieldScan: async (input) => {
          calls.battlefield.push({ input });
          return results.battlefield;
        },
        getCiv7DestinationAnalysis: async (input) => {
          calls.destinationAnalysis.push({ input });
          return results.destinationAnalysis;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function playNotificationView(): Civ7ControlOrpcPlayNotificationViewResult {
  const unitId = { owner: 0, id: 458752, type: 26 };
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 75 },
    turnDate: { ok: true, value: "2150 BCE" },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: 0 },
    blockingNotificationId: { ok: true, value: null },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: unitId },
    notifications: [],
    decisions: [],
    hud: { nextDecision: null, decisionQueue: [] },
    limits: { maxNotifications: 10, truncated: false },
  };
}

function readyUnitView(): Civ7ControlOrpcReadyUnitViewResult {
  const unitId = { owner: 0, id: 458752, type: 26 };
  return {
    localPlayerId: 0,
    requestedUnitId: unitId,
    selectedUnitId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: unitId },
    unitId,
    unit: {
      ok: true,
      value: {
        id: unitId,
        owner: 0,
        type: 333,
        typeName: "UNIT_SETTLER",
        location: { x: 17, y: 20 },
        movementMovesRemaining: 2,
        attacksRemaining: 0,
        damage: 0,
        hitPoints: 100,
      },
    },
    legalOperations: [{
      family: "unit-operation",
      operationType: "SKIP_TURN",
      enumValue: 1,
      valid: true,
      result: { Success: true },
    }],
    promotionReadiness: {
      ok: true,
      value: {
        canPurchase: false,
        promotionClass: "PROMOTION_CLASS_LAND_COMMANDER",
        promotions: [],
        notes: [],
      },
    },
    nearby: { ok: true, value: [] },
    notes: ["Ready unit fixture."],
  };
}

function settlementRecommendations():
  Civ7ControlOrpcSettlementRecommendationsResult {
  return {
    localPlayerId: 0,
    playerId: 0,
    count: 5,
    requestedLocations: [{ x: 15, y: 23 }],
    origins: [{
      kind: "requested",
      location: { x: 15, y: 23 },
      plotIndex: { ok: true, value: 1927 },
    }],
    recommendations: [{
      origin: {
        kind: "requested",
        location: { x: 15, y: 23 },
        plotIndex: { ok: true, value: 1927 },
      },
      suggestions: {
        ok: true,
        value: [{
          location: { x: 20, y: 20 },
          plotIndex: { ok: true, value: 1660 },
          factors: [{
            positive: true,
            title: "total yield",
            description: "good total yield",
          }],
        }],
      },
    }],
    notes: ["Settlement recommendation fixture."],
  };
}

function battlefieldScan(): Civ7ControlOrpcBattlefieldScanResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    playerId: 0,
    origins: [{ x: 17, y: 20 }],
    radius: 6,
    hiddenInfoPolicy: "runtime-debug-summary",
    relationshipLabelPolicy: relationshipPolicy(),
    units: [],
    cities: [],
    owners: [{
      owner: 0,
      stance: "friendly",
      relationshipProof: "self",
      relationshipLabel: "friendly",
      unitCount: 1,
      cityCount: 0,
      roles: {},
      apparentStrength: 1,
      nearestUnit: { distance: 0 },
      nearestCity: null,
    }],
    pointsOfInterest: [{
      kind: "civilian-risk",
      severity: "high",
      location: { x: 16, y: 18 },
      summary: "friendly civilian has other-owner contact within 4 tiles",
    }],
    notes: ["Battlefield fixture."],
  };
}

function destinationAnalysis(): Civ7ControlOrpcDestinationAnalysisResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    playerId: 0,
    origin: { x: 15, y: 23 },
    destination: { x: 20, y: 20 },
    corridorRadius: 2,
    destinationRadius: 4,
    hiddenInfoPolicy: "runtime-debug-summary",
    relationshipLabelPolicy: relationshipPolicy(),
    corridor: {
      routeHint: "straight-line-grid-corridor",
      directGridDistance: 5,
      sampleCount: 2,
      sampledPlots: [],
      units: [],
      unitCount: 0,
    },
    destinationPressure: {
      units: [],
      unitCount: 1,
      cities: [],
      cityCount: 1,
      apparentOtherStrength: 20,
    },
    pointsOfInterest: [{
      kind: "destination-pressure",
      severity: "medium",
      location: { x: 20, y: 20 },
      summary: "1 other-owner units near destination",
    }],
    notes: ["Destination fixture."],
  };
}

function relationshipPolicy() {
  return {
    relationshipSource: "not-classified" as const,
    relationshipProof: "none" as const,
    unprovenLabel: "relationship-unproven" as const,
    guidance: "neutral relationship policy",
  };
}

function expectSafeCivilianTriageOutput(value: unknown): void {
  const serialized = JSON.stringify(value);
  expect(serialized).not.toContain("\"host\"");
  expect(serialized).not.toContain("\"port\"");
  expect(serialized).not.toContain("\"state\"");
  expect(serialized).not.toContain("Game.turn");
  expect(serialized).not.toContain("rawCommand");
  expect(serialized).not.toMatch(/\benemy\b/i);
  expect(serialized).not.toMatch(/\bhostile\b/i);
  expect(serialized).not.toMatch(/\bopponent\b/i);
  expect(serialized).not.toMatch(/\bthreat\b/i);
  expect(serialized).not.toMatch(/\bwar\b/i);
  expect(serialized).not.toMatch(/\bally\b/i);
  expect(serialized).not.toMatch(/\bsuzerain\b/i);
}
