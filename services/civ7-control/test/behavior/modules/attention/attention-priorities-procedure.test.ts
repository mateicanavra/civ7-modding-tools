import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";
import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcRouter,
  createCiv7ControlOrpcServerClient,
} from "../../../../src/index";
import type {
  Civ7ControlOrpcBattlefieldScanResult,
  Civ7ControlOrpcPlayableStatusResult,
  Civ7ControlOrpcPlayNotificationViewResult,
  Civ7ControlOrpcReadyCityViewResult,
  Civ7ControlOrpcReadyUnitViewResult,
  Civ7ControlOrpcTurnCompletionCheckResult,
  Civ7ControlOrpcTurnCompletionSnapshot,
} from "../../../../src/service/model/ports/direct-control";
import { directControlFacadeFixture } from "../../../support/direct-control-facade";

describe("attention.priorities control-oRPC procedure", () => {
  test("composes current attention and battlefield evidence into semantic priorities", async () => {
    const unitId = { owner: 0, id: 458_752, type: 26 };
    const cityId = { owner: 0, id: 131_073, type: 1 };
    const fake = fakeContext({
      playableStatus: playableStatusResult(),
      notifications: notificationViewResult({ unitId, cityId }),
      turnCompletion: turnCompletionCheckResult({
        canEndTurn: { ok: true, value: false },
      }),
      readyUnit: readyUnitViewResult(unitId),
      readyCity: readyCityViewResult(cityId),
      battlefield: battlefieldScanResult(),
    });

    const result = await call(
      Civ7ControlOrpcRouter.attention.priorities,
      {
        maxNotifications: 12,
        includeBattlefield: true,
        battlefieldRadius: 6,
      },
      {
        context: fake.context,
      }
    );

    expect(result).toMatchObject({
      playable: true,
      readiness: "tuner-ready",
      localPlayerId: 0,
      sourceStatus: {
        playableStatus: "read",
        notifications: "read",
        turnCompletion: "read",
        readyUnit: "read",
        readyCity: "read",
        battlefield: "read",
      },
      summary: {
        decisionCount: 1,
      },
    });
    expect(result.priorities.map((item) => item.kind)).toEqual([
      "hud:production-choice",
      "ready-unit",
      "ready-city",
      "battlefield:city-front",
    ]);
    expect(result.priorities[0]?.nextStep).toMatchObject({
      kind: "inspect-ready-city",
      source: "ready-city",
      parameters: {
        category: "production-choice",
        operationFamily: "city-operation",
      },
    });
    expect(result.nextSteps.map((step) => step.kind)).toContain("inspect-battlefield-point");
    expect(JSON.stringify(result)).not.toContain("game play");
    expect(JSON.stringify(result)).not.toContain("127.0.0.1");
    expect(JSON.stringify(result)).not.toContain("65535");
    expect(JSON.stringify(result)).not.toContain('"host"');
    expect(JSON.stringify(result)).not.toContain('"port"');
    expect(JSON.stringify(result)).not.toContain('"state"');
    expect(JSON.stringify(result)).not.toContain("rawCommand");

    expect(fake.calls.notifications).toEqual([
      {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
        maxNotifications: 12,
      },
    ]);
    expect(fake.calls.battlefield).toEqual([
      {
        input: {
          origins: [{ x: 12, y: 18 }],
          radius: 6,
          maxUnits: 80,
        },
        options: { host: "127.0.0.1", port: 4318, timeoutMs: 1_000 },
      },
    ]);
  });

  test("does not treat partial HUD probe failures as clean end-turn proof", async () => {
    const gameError = { ok: false as const, error: "ReferenceError: Game is not defined" };
    const fake = fakeContext({
      playableStatus: playableStatusResult(),
      notifications: {
        ...cleanNotificationViewResult(),
        turn: gameError,
        turnDate: gameError,
        blocker: gameError,
        blockingNotificationId: gameError,
      },
      turnCompletion: turnCompletionCheckResult(),
      readyUnit: emptyReadyUnitViewResult(),
      readyCity: emptyReadyCityViewResult(),
    });

    const result = await call(
      Civ7ControlOrpcRouter.attention.priorities,
      {},
      {
        context: fake.context,
      }
    );

    expect(result.priorities[0]).toMatchObject({
      kind: "runtime-state-error",
      blocking: true,
      nextStep: {
        kind: "observe",
      },
    });
    expect(result.priorities.map((item) => item.kind)).not.toContain("clean-read");
    expect(result.nextSteps.map((step) => step.kind)).not.toContain("end-turn");
  });

  test("supports the in-process server-side router client", async () => {
    const fake = fakeContext({
      playableStatus: playableStatusResult(),
      notifications: cleanNotificationViewResult(),
      turnCompletion: turnCompletionCheckResult(),
      readyUnit: emptyReadyUnitViewResult(),
      readyCity: emptyReadyCityViewResult(),
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.attention.priorities({ maxNotifications: 7 });

    expect(result.priorities).toEqual([
      {
        priority: 10,
        kind: "clean-read",
        summary: "native turn completion is available and no higher-priority item surfaced",
        reason:
          "Fresh native canEndTurn and hasSentTurnComplete evidence admits the guarded turn-completion service.",
        blocking: false,
        nextStep: {
          kind: "end-turn",
          source: "attention.priorities",
          label: "Native turn completion is available.",
          parameters: {},
        },
        evidenceLabels: ["native-turn-completion-available"],
      },
    ]);
    expect(JSON.stringify(result)).not.toMatch(/before sending|before any send|send-ready/i);
    expect(fake.calls.battlefield).toEqual([]);
  });

  test("does not advise end turn when native availability is true but notification coverage is truncated", async () => {
    const fake = fakeContext({
      playableStatus: playableStatusResult(),
      notifications: {
        ...cleanNotificationViewResult(),
        limits: {
          maxNotifications: 1,
          truncated: true,
        },
      },
      turnCompletion: turnCompletionCheckResult({
        canEndTurn: { ok: true, value: true },
      }),
      readyUnit: emptyReadyUnitViewResult(),
      readyCity: emptyReadyCityViewResult(),
    });

    const result = await call(
      Civ7ControlOrpcRouter.attention.priorities,
      {
        maxNotifications: 1,
      },
      { context: fake.context }
    );

    expect(result.canEndTurn).toBe(true);
    expect(result.summary).toMatchObject({
      priorityCount: 1,
      blockingPriorityCount: 1,
      decisionCount: 0,
      nextStepCount: 1,
    });
    expect(result.priorities).toEqual([
      {
        priority: 10,
        kind: "notification-coverage-truncated",
        summary: "notification coverage is truncated",
        reason:
          "The notification read reached its configured limit, so unseen blockers may remain even when native turn completion is available.",
        blocking: true,
        nextStep: {
          kind: "observe",
          source: "attention.priorities",
          label: "Inspect complete notification coverage before considering turn completion.",
          parameters: {},
        },
        evidenceLabels: ["notification-coverage-truncated"],
      },
    ]);
    expect(result.nextSteps).toEqual([
      {
        kind: "observe",
        source: "attention.priorities",
        label: "Inspect complete notification coverage before considering turn completion.",
        parameters: {},
      },
    ]);
  });

  test("does not infer end-turn advice from empty item sets without exact native availability", async () => {
    const fake = fakeContext({
      playableStatus: playableStatusResult(),
      notifications: cleanNotificationViewResult(),
      turnCompletion: turnCompletionCheckResult({
        canEndTurn: { ok: true, value: false },
      }),
      readyUnit: emptyReadyUnitViewResult(),
      readyCity: emptyReadyCityViewResult(),
    });

    const result = await call(
      Civ7ControlOrpcRouter.attention.priorities,
      {},
      { context: fake.context }
    );

    expect(result.priorities).toMatchObject([
      {
        kind: "turn-completion-unavailable",
        nextStep: { kind: "observe" },
        evidenceLabels: ["native-turn-completion-unavailable"],
      },
    ]);
    expect(result.nextSteps.map((step) => step.kind)).not.toContain("end-turn");
    expect(result.nextSteps.map((step) => step.kind)).not.toContain("send-turn-complete");
  });

  test("does not use stale notification details as turn-completion authority", async () => {
    const fake = fakeContext({
      playableStatus: playableStatusResult(),
      notifications: staleUnitCommandNotificationViewResult(),
      turnCompletion: turnCompletionCheckResult({
        canEndTurn: { ok: true, value: false },
      }),
      readyUnit: emptyReadyUnitViewResult(),
      readyCity: emptyReadyCityViewResult(),
    });

    const result = await call(
      Civ7ControlOrpcRouter.attention.priorities,
      {},
      { context: fake.context }
    );

    expect(result.priorities[0]).toMatchObject({
      kind: "hud:unit-command-stale-expired",
      nextStep: {
        kind: "observe",
        label: "Refresh native turn-completion availability.",
      },
    });
    expect(result.nextSteps.map((step) => step.kind)).not.toContain("send-turn-complete");
    expect(result.nextSteps.map((step) => step.kind)).not.toContain("end-turn");
  });

  test("does not infer stale-unit turn completion through truncated notification coverage", async () => {
    const fake = fakeContext({
      playableStatus: playableStatusResult(),
      notifications: {
        ...staleUnitCommandNotificationViewResult(),
        limits: {
          maxNotifications: 1,
          truncated: true,
        },
      },
      turnCompletion: turnCompletionCheckResult({
        canEndTurn: { ok: true, value: true },
      }),
      readyUnit: emptyReadyUnitViewResult(),
      readyCity: emptyReadyCityViewResult(),
    });

    const result = await call(
      Civ7ControlOrpcRouter.attention.priorities,
      {
        maxNotifications: 1,
      },
      { context: fake.context }
    );

    expect(result.canEndTurn).toBe(true);
    expect(result.priorities).toEqual([
      {
        priority: 100,
        kind: "hud:unit-command-stale-expired",
        summary: "expired COMMAND_UNITS has no ready unit or enabled unit closeout candidate",
        reason:
          "Stale notification details and incomplete notification coverage do not authorize turn completion, even when the native check is available.",
        blocking: true,
        nextStep: {
          kind: "observe",
          source: "attention.priorities",
          label: "Inspect complete notification coverage before considering turn completion.",
          parameters: {},
        },
        evidenceLabels: ["hud-next-decision"],
      },
    ]);
    expect(result.nextSteps.map((step) => step.kind)).not.toContain("send-turn-complete");
    expect(result.nextSteps.map((step) => step.kind)).not.toContain("end-turn");
  });
});

type FakeContextOptions = Readonly<{
  playableStatus: Civ7ControlOrpcPlayableStatusResult;
  notifications?: Civ7ControlOrpcPlayNotificationViewResult;
  turnCompletion?: Civ7ControlOrpcTurnCompletionCheckResult;
  readyUnit?: Civ7ControlOrpcReadyUnitViewResult;
  readyCity?: Civ7ControlOrpcReadyCityViewResult;
  battlefield?: Civ7ControlOrpcBattlefieldScanResult;
}>;

function fakeContext(options: FakeContextOptions): {
  context: Civ7ControlOrpcContext;
  calls: {
    playableStatus: unknown[];
    notifications: unknown[];
    turnCompletion: unknown[];
    readyUnit: Array<{ input: unknown; options: unknown }>;
    readyCity: Array<{ input: unknown; options: unknown }>;
    battlefield: Array<{ input: unknown; options: unknown }>;
  };
} {
  const calls = {
    playableStatus: [] as unknown[],
    notifications: [] as unknown[],
    turnCompletion: [] as unknown[],
    readyUnit: [] as Array<{ input: unknown; options: unknown }>,
    readyCity: [] as Array<{ input: unknown; options: unknown }>,
    battlefield: [] as Array<{ input: unknown; options: unknown }>,
  };
  const context: Civ7ControlOrpcContext = {
    endpointDefaults: {
      host: "127.0.0.1",
      port: 4318,
      timeoutMs: 1_000,
    },
    directControl: directControlFacadeFixture({
      getCiv7PlayableStatus: async (endpointDefaults) => {
        calls.playableStatus.push(endpointDefaults);
        return options.playableStatus;
      },
      getCiv7PlayNotificationView: async (notificationOptions) => {
        calls.notifications.push(notificationOptions);
        if (options.notifications == null) {
          throw new Error("missing notification fixture");
        }
        return options.notifications;
      },
      getCiv7ReadyCityView: async (input, endpointDefaults) => {
        calls.readyCity.push({ input, options: endpointDefaults });
        if (options.readyCity == null) {
          throw new Error("missing ready-city fixture");
        }
        return options.readyCity;
      },
      getCiv7ReadyUnitView: async (input, endpointDefaults) => {
        calls.readyUnit.push({ input, options: endpointDefaults });
        if (options.readyUnit == null) {
          throw new Error("missing ready-unit fixture");
        }
        return options.readyUnit;
      },
      checkCiv7TurnCompletion: async (_input, endpointDefaults) => {
        calls.turnCompletion.push(endpointDefaults);
        return options.turnCompletion ?? turnCompletionCheckResult();
      },
      getCiv7BattlefieldScan: async (input, endpointDefaults) => {
        calls.battlefield.push({ input, options: endpointDefaults });
        if (options.battlefield == null) {
          throw new Error("missing battlefield fixture");
        }
        return options.battlefield;
      },
    }),
  };

  return { context, calls };
}

function playableStatusResult(
  overrides: Partial<Civ7ControlOrpcPlayableStatusResult> = {}
): Civ7ControlOrpcPlayableStatusResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    playable: true,
    readiness: "tuner-ready",
    appUi: {} as Civ7ControlOrpcPlayableStatusResult["appUi"],
    tuner: {} as Civ7ControlOrpcPlayableStatusResult["tuner"],
    errors: [],
    ...overrides,
  };
}

function notificationViewResult(
  ids: {
    unitId?: { owner: number; id: number; type?: number };
    cityId?: { owner: number; id: number; type?: number };
  } = {}
): Civ7ControlOrpcPlayNotificationViewResult {
  const unitId = ids.unitId ?? { owner: 0, id: 458_752, type: 26 };
  const cityId = ids.cityId ?? { owner: 0, id: 131_073, type: 1 };
  const queueItem = {
    notificationId: { owner: 0, id: 42, type: 20 },
    isEndTurnBlocking: true,
    typeName: "NOTIFICATION_CHOOSE_PRODUCTION",
    summary: "Production needed",
    message: "Choose production in the capital.",
    target: { cityId },
    location: { x: 12, y: 18 },
    player: 0,
    category: "production-choice",
    operationFamily: "city-operation" as const,
    operationType: "BUILDING",
    argsShape: "city-id, production-kind",
    requiredInputs: [
      {
        name: "City",
        source: "notification",
        required: true,
      },
    ],
    commonActions: [],
    notes: [],
  };

  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    turn: { ok: true, value: 12 },
    turnDate: { ok: true, value: "3400 BCE" },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: -2026570723 },
    blockingNotificationId: {
      ok: true,
      value: { owner: 0, id: 42, type: 20 },
    },
    selectedUnitId: { ok: true, value: unitId },
    selectedCityId: { ok: true, value: cityId },
    firstReadyUnitId: { ok: true, value: unitId },
    notifications: [],
    decisions: [],
    hud: {
      nextDecision: queueItem,
      decisionQueue: [queueItem],
    },
    limits: {
      maxNotifications: 25,
      truncated: false,
    },
  };
}

function cleanNotificationViewResult(): Civ7ControlOrpcPlayNotificationViewResult {
  return {
    ...notificationViewResult(),
    canEndTurn: { ok: true, value: true },
    blocker: { ok: true, value: null },
    blockingNotificationId: { ok: true, value: null },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    hud: {
      nextDecision: null,
      decisionQueue: [],
    },
  };
}

function staleUnitCommandNotificationViewResult(): Civ7ControlOrpcPlayNotificationViewResult {
  const view = cleanNotificationViewResult();
  const template = notificationViewResult().hud.decisionQueue[0];
  if (template === undefined) throw new Error("missing notification template");
  const stale = {
    ...template,
    category: "unit-command",
    operationFamily: "unit-operation" as const,
    operationType: "SKIP_TURN",
    details: {
      kind: "unit-command-reconciliation",
      classification: "unit-command-stale-expired",
      staleExpiredWithoutEnabledCloseout: true,
      enabledCloseoutCandidates: [],
      hasSentTurnComplete: { ok: true, value: false },
    },
  };
  return {
    ...view,
    hud: {
      nextDecision: stale,
      decisionQueue: [stale],
    },
  };
}

function turnCompletionCheckResult(
  overrides: Partial<Civ7ControlOrpcTurnCompletionSnapshot> = {}
): Civ7ControlOrpcTurnCompletionCheckResult {
  return {
    snapshot: {
      localPlayerId: 0,
      turn: { ok: true, value: 12 },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: true },
      ...overrides,
    },
  };
}

function readyUnitViewResult(unitId: {
  owner: number;
  id: number;
  type?: number;
}): Civ7ControlOrpcReadyUnitViewResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    requestedUnitId: unitId,
    selectedUnitId: { ok: true, value: unitId },
    firstReadyUnitId: { ok: true, value: unitId },
    unitId,
    unit: {
      ok: true,
      value: {
        id: unitId,
        typeName: "Scout",
        location: { x: 12, y: 18 },
      },
    },
    legalOperations: [
      {
        family: "unit-operation",
        operationType: "SKIP_TURN",
        enumValue: 1,
        valid: true,
        result: { Success: true },
      },
    ],
    promotionReadiness: { ok: true, value: null },
    nearby: { ok: true, value: [] },
    notes: [],
  };
}

function emptyReadyUnitViewResult(): Civ7ControlOrpcReadyUnitViewResult {
  return {
    ...readyUnitViewResult({ owner: 0, id: 458_752, type: 26 }),
    requestedUnitId: null,
    selectedUnitId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    unitId: null,
    unit: { ok: true, value: null },
    legalOperations: [],
  };
}

function readyCityViewResult(cityId: {
  owner: number;
  id: number;
  type?: number;
}): Civ7ControlOrpcReadyCityViewResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    requestedCityId: cityId,
    selectedCityId: { ok: true, value: cityId },
    blockingCityId: { ok: true, value: cityId },
    cityId,
    city: { ok: true, value: { id: cityId, name: "Capital" } },
    legalOperations: [
      {
        family: "city-operation",
        operationType: "CONSIDER_TOWN_PROJECT",
        enumValue: 1,
        valid: true,
        result: { Success: true },
      },
    ],
    productionCandidates: { ok: true, value: [] },
    townFocusOptions: { ok: true, value: [] },
    populationPlacement: { ok: true, value: null },
    notes: [],
  };
}

function emptyReadyCityViewResult(): Civ7ControlOrpcReadyCityViewResult {
  return {
    ...readyCityViewResult({ owner: 0, id: 131_073, type: 1 }),
    requestedCityId: null,
    selectedCityId: { ok: true, value: null },
    blockingCityId: { ok: true, value: null },
    cityId: null,
    city: { ok: true, value: null },
    legalOperations: [],
    productionCandidates: { ok: true, value: [] },
    townFocusOptions: { ok: true, value: [] },
    populationPlacement: { ok: true, value: null },
  };
}

function battlefieldScanResult(): Civ7ControlOrpcBattlefieldScanResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    playerId: 0,
    origins: [{ x: 12, y: 18 }],
    radius: 6,
    hiddenInfoPolicy: "debug-visible-runtime",
    relationshipLabelPolicy: {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance: "Owner mismatch is contact evidence only.",
    },
    units: [],
    cities: [],
    pointsOfInterest: [
      {
        kind: "city-front",
        severity: "high",
        location: { x: 14, y: 18 },
        summary: "relationship-unproven city near ready unit",
      },
    ],
    owners: [],
    notes: [],
  };
}
