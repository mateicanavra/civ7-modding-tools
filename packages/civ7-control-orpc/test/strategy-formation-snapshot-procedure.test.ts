import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7StrategyFormationSnapshotUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
} from "../src/index";
import type {
  Civ7ControlOrpcBattlefieldScanResult,
  Civ7ControlOrpcPlayNotificationViewResult,
  Civ7ControlOrpcReadyUnitViewResult,
} from "../src/dependencies/direct-control";

describe("strategy.formationSnapshot control-oRPC procedure", () => {
  test("composes ready-unit and battlefield evidence into a safe formation view", async () => {
    const fake = fakeContext({});

    const result = await call(
      Civ7ControlOrpcRouter.strategy.formationSnapshot,
      {
        radius: 6,
        screenRadius: 2,
        contactRadius: 4,
        maxUnits: 96,
        maxCities: 40,
      },
      { context: fake.context },
    );

    expect(fake.calls).toEqual({
      notifications: [{
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
        maxNotifications: 10,
      }],
      readyUnit: [{
        input: {
          unitId: { owner: 0, id: 458752, type: 26 },
          radius: 2,
        },
      }],
      battlefield: [{
        input: {
          playerId: undefined,
          origins: [{ x: 17, y: 20 }],
          radius: 6,
          maxUnits: 96,
          maxCities: 40,
        },
      }],
    });
    expect(result).toMatchObject({
      playerId: 0,
      localPlayerId: 0,
      origin: { x: 17, y: 20 },
      sourceStatus: {
        notifications: "read",
        readyUnit: "read",
        battlefieldScan: "read",
      },
      readyUnit: {
        unitId: { owner: 0, id: 458752, type: 26 },
        typeName: "UNIT_ARMY_COMMANDER",
        location: { x: 17, y: 20 },
        legalNoTargetOperationCount: 1,
      },
      formation: {
        posture: "screen-civilian",
        relationshipLabelPolicy: {
          relationshipSource: "not-classified",
          relationshipProof: "none",
          unprovenLabel: "relationship-unproven",
        },
      },
    });
    expect(result.formation.civilians).toHaveLength(1);
    expect(result.formation.screens.length).toBeGreaterThan(0);
    expect(result.formation.otherOwnerContacts.length).toBeGreaterThan(0);
    expect(result.formation.nearbyContacts.length).toBeGreaterThan(0);
    expect(result.formation.nextSteps.map((step) => step.kind)).toContain(
      "inspect-civilian-route",
    );
    expect(JSON.stringify(result.nextSteps)).not.toContain("game play");
    expectSafeFormationOutput(result);
  });

  test("skips ready-unit reads when caller provides an explicit origin", async () => {
    const fake = fakeContext({});
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.strategy.formationSnapshot({
      origin: { x: 22, y: 18 },
      radius: 5,
    });

    expect(fake.calls.readyUnit).toEqual([]);
    expect(fake.calls.battlefield[0]?.input).toMatchObject({
      origins: [{ x: 22, y: 18 }],
      radius: 5,
    });
    expect(result.sourceStatus.readyUnit).toBe("skipped-explicit-origin");
    expect(result.origin).toEqual({ x: 22, y: 18 });
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
          Civ7ControlOrpcRouter.strategy.formationSnapshot,
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
      call(Civ7ControlOrpcRouter.strategy.formationSnapshot, {}, { context }),
    ).rejects.toMatchObject({
      code: "STRATEGY_FORMATION_SNAPSHOT_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "strategy.formationSnapshot",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.strategy.formationSnapshot, {}, {
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

  test("publishes a contract-first strategy.formationSnapshot service leaf", () => {
    expect(
      Civ7ControlOrpcContract.strategy.formationSnapshot["~orpc"],
    ).toMatchObject({
      meta: {
        family: "strategy",
        procedureKey: "strategy.formationSnapshot",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(
      Civ7ControlOrpcContract.strategy.formationSnapshot["~orpc"].errorMap,
    ).toHaveProperty("STRATEGY_FORMATION_SNAPSHOT_UNAVAILABLE");
    expect(Civ7StrategyFormationSnapshotUnavailableError.code).toBe(
      "STRATEGY_FORMATION_SNAPSHOT_UNAVAILABLE",
    );
  });
});

type Calls = ReturnType<typeof emptyCalls>;

function emptyCalls() {
  return {
    notifications: [] as unknown[],
    readyUnit: [] as Array<Readonly<{ input: unknown }>>,
    battlefield: [] as Array<Readonly<{ input: unknown }>>,
  };
}

function fakeContext(
  overrides: Partial<{
    notifications: Civ7ControlOrpcPlayNotificationViewResult;
    readyUnit: Civ7ControlOrpcReadyUnitViewResult;
    battlefield: Civ7ControlOrpcBattlefieldScanResult;
  }>,
): { calls: Calls; context: Civ7ControlOrpcContext } {
  const calls = emptyCalls();
  const results = {
    notifications: playNotificationView(),
    readyUnit: readyUnitView(),
    battlefield: battlefieldScan(),
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
        getCiv7BattlefieldScan: async (input) => {
          calls.battlefield.push({ input });
          return results.battlefield;
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
    hud: {
      nextDecision: null,
      decisionQueue: [],
    },
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
        type: 111,
        typeName: "UNIT_ARMY_COMMANDER",
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
    promotionReadiness: { ok: true, value: null },
    nearby: { ok: true, value: [] },
    notes: ["Read-only ready-unit fixture."],
  } as Civ7ControlOrpcReadyUnitViewResult;
}

function battlefieldScan(): Civ7ControlOrpcBattlefieldScanResult {
  const ownScreen = formationUnit({
    id: { owner: 0, id: 458752, type: 26 },
    role: "ranged",
    typeName: "UNIT_SLINGER",
    location: { x: 17, y: 20 },
    distance: 0,
  });
  const ownCivilian = formationUnit({
    id: { owner: 0, id: 1441800, type: 26 },
    role: "civilian",
    typeName: "UNIT_SETTLER",
    location: { x: 16, y: 18 },
    distance: 1,
  });
  const otherOwnerUnit = formationUnit({
    id: { owner: 9, id: 196608, type: 26 },
    owner: 9,
    stance: "other",
    relationshipProof: "none",
    relationshipLabel: "relationship-unproven",
    role: "melee",
    typeName: "UNIT_WARRIOR",
    location: { x: 13, y: 17 },
    distance: 4,
  });
  return {
    localPlayerId: 0,
    playerId: 0,
    origins: [{ x: 17, y: 20 }],
    radius: 8,
    hiddenInfoPolicy: "runtime-debug-summary; pair with visibility reads",
    relationshipLabelPolicy: {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance: "Owner mismatch is contact evidence only.",
    },
    units: [ownScreen, ownCivilian, otherOwnerUnit],
    cities: [],
    owners: [],
    pointsOfInterest: [{
      kind: "civilian-risk",
      severity: "high",
      location: ownCivilian.location,
      summary: "friendly civilian has other-owner contact within 4 tiles",
      units: [ownCivilian],
    }],
    notes: ["Read-only battlefield lens."],
  };
}

function formationUnit(overrides: Partial<Record<string, unknown>>) {
  return {
    id: { owner: 0, id: 1, type: 26 },
    owner: 0,
    stance: "friendly",
    relationshipProof: "self",
    relationshipLabel: "friendly",
    role: "ranged",
    typeName: "UNIT_SLINGER",
    location: { x: 17, y: 20 },
    distance: 0,
    strength: 10,
    ...overrides,
  };
}

function expectSafeFormationOutput(value: unknown): void {
  const serialized = JSON.stringify(value);
  expect(serialized).not.toContain("\"host\"");
  expect(serialized).not.toContain("\"port\"");
  expect(serialized).not.toContain("\"state\"");
  expect(serialized).not.toContain("\"evidence\"");
  expect(serialized).not.toContain("\"legalOperations\"");
  expect(serialized).not.toContain("Game.turn");
  expect(serialized).not.toContain("rawCommand");
  expect(serialized).not.toMatch(/\bfriendly\b/i);
  expect(serialized).not.toMatch(/\bnon-friendly\b/i);
  expect(serialized).not.toMatch(/\benemy\b/i);
  expect(serialized).not.toMatch(/\bhostile\b/i);
  expect(serialized).not.toMatch(/\bopponent\b/i);
  expect(serialized).not.toMatch(/\bthreat\b/i);
  expect(serialized).not.toMatch(/\bwar\b/i);
  expect(serialized).not.toMatch(/\bally\b/i);
  expect(serialized).not.toMatch(/\bsuzerain\b/i);
}
