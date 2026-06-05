import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7AttentionCurrentUnavailableError,
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcPlayableStatusResult,
  type Civ7ControlOrpcPlayNotificationViewResult,
  type Civ7ControlOrpcReadyCityViewResult,
  type Civ7ControlOrpcReadyUnitViewResult,
  type Civ7ControlOrpcTurnCompletionStatusResult,
} from "../src/index";

describe("attention.current control-oRPC procedure", () => {
  test("composes playable status, notifications, and ready actors into a semantic attention view", async () => {
    const unitId = { owner: 0, id: 458_752, type: 26 };
    const cityId = { owner: 0, id: 131_073, type: 1 };
    const fake = fakeContext({
      playableStatus: playableStatusResult(),
      notifications: notificationViewResult({ unitId, cityId }),
      turnCompletion: turnCompletionStatusResult({
        canEndTurn: { ok: true, value: false },
        blocker: { ok: true, value: -2026570723 },
        firstReadyUnitId: { ok: true, value: unitId },
      }),
      readyUnit: readyUnitViewResult(unitId),
      readyCity: readyCityViewResult(cityId),
    });

    const result = await call(Civ7ControlOrpcRouter.attention.current, {
      maxNotifications: 12,
    }, {
      context: fake.context,
    });

    expect(result).toMatchObject({
      playable: true,
      readiness: "tuner-ready",
      turn: 12,
      turnDate: "3400 BCE",
      canEndTurn: false,
      sourceStatus: {
        playableStatus: "read",
        notifications: "read",
        turnCompletion: "read",
        readyUnit: "read",
        readyCity: "read",
      },
      turnCompletion: {
        hasSentTurnComplete: false,
        canEndTurn: false,
        firstReadyUnitId: unitId,
        blockerStatus: "blocked",
      },
      summary: {
        blockerCount: 3,
        decisionCount: 1,
        readyActorCount: 2,
        nextStepCount: 3,
      },
    });
    expect(result.blockers.map((blocker) => blocker.source)).toEqual([
      "notification",
      "ready-unit",
      "ready-city",
    ]);
    expect(result.decisions).toEqual([
      {
        source: "notification",
        category: "production-choice",
        summary: "Production needed",
        isEndTurnBlocking: true,
        operationFamily: "city-operation",
        operationType: "BUILDING",
        requiredInputs: ["City"],
      },
    ]);
    expect(result.readyActors.map((actor) => actor.kind)).toEqual([
      "unit",
      "city",
    ]);
    expect(result.nextSteps.map((step) => step.kind)).toEqual([
      "resolve-blocker",
      "act-ready-unit",
      "act-ready-city",
    ]);
    expect(JSON.stringify(result)).not.toContain("127.0.0.1");
    expect(JSON.stringify(result)).not.toContain("65535");
    expect(JSON.stringify(result)).not.toContain("\"host\"");
    expect(JSON.stringify(result)).not.toContain("\"port\"");
    expect(JSON.stringify(result)).not.toContain("\"state\"");
    expect(JSON.stringify(result)).not.toContain("rawCommand");

    expect(fake.calls.playableStatus).toEqual([
      { host: "127.0.0.1", port: 4318, timeoutMs: 1_000 },
    ]);
    expect(fake.calls.notifications).toEqual([
      {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
        maxNotifications: 12,
      },
    ]);
    expect(fake.calls.turnCompletion).toEqual([
      { host: "127.0.0.1", port: 4318, timeoutMs: 1_000 },
    ]);
    expect(fake.calls.readyUnit).toEqual([
      {
        input: { unitId },
        options: { host: "127.0.0.1", port: 4318, timeoutMs: 1_000 },
      },
    ]);
    expect(fake.calls.readyCity).toEqual([
      {
        input: { cityId },
        options: { host: "127.0.0.1", port: 4318, timeoutMs: 1_000 },
      },
    ]);
  });

  test("supports the in-process server-side router client", async () => {
    const fake = fakeContext({
      playableStatus: playableStatusResult(),
      notifications: cleanNotificationViewResult(),
      turnCompletion: turnCompletionStatusResult(),
      readyUnit: emptyReadyUnitViewResult(),
      readyCity: emptyReadyCityViewResult(),
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.attention.current({ maxNotifications: 7 });

    expect(result).toMatchObject({
      playable: true,
      sourceStatus: {
        playableStatus: "read",
        notifications: "read",
        turnCompletion: "read",
        readyUnit: "read",
        readyCity: "read",
      },
      summary: {
        blockerCount: 0,
        decisionCount: 0,
        readyActorCount: 0,
        nextStepCount: 1,
      },
    });
    expect(result.nextSteps).toEqual([
      {
        kind: "end-turn",
        source: "attention",
        label: "No blockers found; end turn is available.",
      },
    ]);
    expect(fake.calls.notifications).toEqual([
      {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
        maxNotifications: 7,
      },
    ]);
    expect(fake.calls.turnCompletion).toEqual([
      {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    ]);
    expect(fake.calls.readyUnit).toEqual([
      {
        input: {},
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
    expect(fake.calls.readyCity).toEqual([
      {
        input: {},
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
  });

  test("uses ready ports to discover actors when notifications do not expose ids", async () => {
    const unitId = { owner: 0, id: 458_752, type: 26 };
    const fake = fakeContext({
      playableStatus: playableStatusResult(),
      notifications: cleanNotificationViewResult(),
      turnCompletion: turnCompletionStatusResult({
        canEndTurn: { ok: true, value: false },
        blocker: { ok: true, value: -2026570723 },
        firstReadyUnitId: { ok: true, value: null },
      }),
      readyUnit: readyUnitViewResult(unitId),
      readyCity: emptyReadyCityViewResult(),
    });

    const result = await call(Civ7ControlOrpcRouter.attention.current, {}, {
      context: fake.context,
    });

    expect(fake.calls.readyUnit).toEqual([
      {
        input: {},
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
    expect(result.sourceStatus.readyUnit).toBe("read");
    expect(result.sourceStatus.turnCompletion).toBe("read");
    expect(result.turnCompletion).toMatchObject({
      canEndTurn: false,
      firstReadyUnitId: null,
      blockerStatus: "blocked",
    });
    expect(result.readyActors).toEqual([
      {
        kind: "unit",
        componentId: unitId,
        operationCount: 1,
        summary: "Ready unit",
        evidence: ["ready-unit-view"],
      },
    ]);
    expect(result.nextSteps.map((step) => step.kind)).toEqual([
      "act-ready-unit",
    ]);
    expect(result.nextSteps.map((step) => step.kind)).not.toContain("end-turn");
  });

  test("uses turn-completion ready-unit evidence as a ready port hint", async () => {
    const unitId = { owner: 0, id: 458_752, type: 26 };
    const fake = fakeContext({
      playableStatus: playableStatusResult(),
      notifications: cleanNotificationViewResult(),
      turnCompletion: turnCompletionStatusResult({
        canEndTurn: { ok: true, value: false },
        blocker: { ok: true, value: -2026570723 },
        firstReadyUnitId: { ok: true, value: unitId },
      }),
      readyUnit: readyUnitViewResult(unitId),
      readyCity: emptyReadyCityViewResult(),
    });

    const result = await call(Civ7ControlOrpcRouter.attention.current, {}, {
      context: fake.context,
    });

    expect(fake.calls.readyUnit).toEqual([
      {
        input: { unitId },
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
    expect(result.turnCompletion.firstReadyUnitId).toEqual(unitId);
    expect(result.nextSteps.map((step) => step.kind)).toEqual([
      "act-ready-unit",
    ]);
  });

  test("does not report clean attention when notification coverage is truncated", async () => {
    const fake = fakeContext({
      playableStatus: playableStatusResult(),
      notifications: {
        ...cleanNotificationViewResult(),
        limits: {
          maxNotifications: 1,
          truncated: true,
        },
      },
      turnCompletion: turnCompletionStatusResult({
        canEndTurn: { ok: true, value: false },
      }),
      readyUnit: emptyReadyUnitViewResult(),
      readyCity: emptyReadyCityViewResult(),
    });

    const result = await call(Civ7ControlOrpcRouter.attention.current, {
      maxNotifications: 1,
    }, {
      context: fake.context,
    });

    expect(result.summary).toMatchObject({
      blockerCount: 0,
      decisionCount: 0,
      readyActorCount: 0,
      nextStepCount: 1,
    });
    expect(result.nextSteps).toEqual([
      {
        kind: "observe",
        source: "attention",
        label:
          "Notification coverage is truncated; inspect more attention evidence before concluding there are no blockers.",
      },
    ]);
    expect(result.nextSteps.map((step) => step.kind)).not.toContain("end-turn");
    expect(result.nextSteps.map((step) => step.label)).not.toContain(
      "No current blockers found.",
    );
  });

  test("does not recommend end turn from notifications alone", async () => {
    const unitId = { owner: 0, id: 458_752, type: 26 };
    const fake = fakeContext({
      playableStatus: playableStatusResult(),
      notifications: cleanNotificationViewResult(),
      turnCompletion: turnCompletionStatusResult({
        canEndTurn: { ok: true, value: false },
        blocker: { ok: true, value: 7 },
        firstReadyUnitId: { ok: true, value: unitId },
      }),
      readyUnit: emptyReadyUnitViewResult(),
      readyCity: emptyReadyCityViewResult(),
    });

    const result = await call(Civ7ControlOrpcRouter.attention.current, {}, {
      context: fake.context,
    });

    expect(result.canEndTurn).toBe(false);
    expect(result.turnCompletion).toEqual({
      hasSentTurnComplete: false,
      canEndTurn: false,
      firstReadyUnitId: unitId,
      blockerStatus: "blocked",
    });
    expect(result.nextSteps.map((step) => step.kind)).toEqual(["observe"]);
    expect(result.nextSteps.map((step) => step.kind)).not.toContain("end-turn");
  });

  test("does not recommend end turn after the turn was already sent", async () => {
    const fake = fakeContext({
      playableStatus: playableStatusResult(),
      notifications: cleanNotificationViewResult(),
      turnCompletion: turnCompletionStatusResult({
        hasSentTurnComplete: { ok: true, value: true },
        canEndTurn: { ok: true, value: true },
      }),
      readyUnit: emptyReadyUnitViewResult(),
      readyCity: emptyReadyCityViewResult(),
    });

    const result = await call(Civ7ControlOrpcRouter.attention.current, {}, {
      context: fake.context,
    });

    expect(result.turnCompletion).toMatchObject({
      hasSentTurnComplete: true,
      canEndTurn: true,
      blockerStatus: "none",
    });
    expect(result.nextSteps.map((step) => step.kind)).toEqual(["observe"]);
    expect(result.nextSteps.map((step) => step.kind)).not.toContain("end-turn");
  });

  test("does not read attention sources when playable status is not ready", async () => {
    const fake = fakeContext({
      playableStatus: playableStatusResult({
        playable: false,
        readiness: "shell",
      }),
      notifications: notificationViewResult(),
    });

    const result = await call(Civ7ControlOrpcRouter.attention.current, {}, {
      context: fake.context,
    });

    expect(result).toMatchObject({
      playable: false,
      readiness: "shell",
      turn: null,
      turnDate: null,
      canEndTurn: null,
      sourceStatus: {
        playableStatus: "read",
        notifications: "skipped-not-playable",
        turnCompletion: "skipped-not-playable",
        readyUnit: "skipped-not-playable",
        readyCity: "skipped-not-playable",
      },
      turnCompletion: {
        hasSentTurnComplete: null,
        canEndTurn: null,
        firstReadyUnitId: null,
        blockerStatus: "unknown",
      },
      summary: {
        blockerCount: 0,
        decisionCount: 0,
        readyActorCount: 0,
        nextStepCount: 1,
      },
      nextSteps: [
        {
          kind: "restore-readiness",
          source: "readiness",
          label: "Restore playable Tuner/App UI readiness before reading attention.",
        },
      ],
    });
    expect(fake.calls.playableStatus).toHaveLength(1);
    expect(fake.calls.notifications).toEqual([]);
    expect(fake.calls.turnCompletion).toEqual([]);
    expect(fake.calls.readyUnit).toEqual([]);
    expect(fake.calls.readyCity).toEqual([]);
  });

  test("keeps endpoint/session/state/raw command fields out of procedure input", async () => {
    const invalidInputs = [
      { maxNotifications: 0 },
      { maxNotifications: 101 },
      { maxNotifications: 1.5 },
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "app-ui" } },
      { stateName: "App UI" },
      { session: { state: "App UI" } },
      { command: "Game.turn" },
      { rawCommand: "Game.turn" },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext({
        playableStatus: playableStatusResult(),
        notifications: cleanNotificationViewResult(),
        readyUnit: emptyReadyUnitViewResult(),
        readyCity: emptyReadyCityViewResult(),
      });

      await expect(
        call(Civ7ControlOrpcRouter.attention.current, input as never, {
          context: fake.context,
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls.playableStatus).toEqual([]);
      expect(fake.calls.notifications).toEqual([]);
      expect(fake.calls.turnCompletion).toEqual([]);
      expect(fake.calls.readyUnit).toEqual([]);
      expect(fake.calls.readyCity).toEqual([]);
    }
  });

  test("maps source failures to a tagged Effect/oRPC error without raw details", async () => {
    const fake = fakeContext({
      playableStatus: playableStatusResult(),
      notificationsError: new Error(
        "Timed out waiting for Civ7 tuner response to CMD:65535:readPlayNotifications()",
      ),
    });

    await expect(
      call(Civ7ControlOrpcRouter.attention.current, {}, {
        context: fake.context,
      }),
    ).rejects.toMatchObject({
      code: "ATTENTION_CURRENT_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "attention.current",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.attention.current, {}, {
        context: fake.context,
      });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("readPlayNotifications");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first attention.current service procedure", () => {
    expect(Civ7ControlOrpcContract.attention.current["~orpc"]).toMatchObject({
      meta: {
        family: "attention",
        procedureKey: "attention.current",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(
      Civ7ControlOrpcContract.attention.current["~orpc"].errorMap,
    ).toHaveProperty("ATTENTION_CURRENT_UNAVAILABLE");
    expect(Civ7AttentionCurrentUnavailableError.code).toBe(
      "ATTENTION_CURRENT_UNAVAILABLE",
    );
  });
});

type FakeContextOptions = Readonly<{
  playableStatus: Civ7ControlOrpcPlayableStatusResult;
  notifications?: Civ7ControlOrpcPlayNotificationViewResult;
  notificationsError?: Error;
  turnCompletion?: Civ7ControlOrpcTurnCompletionStatusResult;
  readyUnit?: Civ7ControlOrpcReadyUnitViewResult;
  readyCity?: Civ7ControlOrpcReadyCityViewResult;
}>;

function fakeContext(options: FakeContextOptions): {
  context: Civ7ControlOrpcContext;
  calls: {
    playableStatus: unknown[];
    notifications: unknown[];
    turnCompletion: unknown[];
    readyUnit: Array<{ input: unknown; options: unknown }>;
    readyCity: Array<{ input: unknown; options: unknown }>;
  };
} {
  const calls = {
    playableStatus: [] as unknown[],
    notifications: [] as unknown[],
    turnCompletion: [] as unknown[],
    readyUnit: [] as Array<{ input: unknown; options: unknown }>,
    readyCity: [] as Array<{ input: unknown; options: unknown }>,
  };
  const context: Civ7ControlOrpcContext = {
    endpointDefaults: {
      host: "127.0.0.1",
      port: 4318,
      timeoutMs: 1_000,
    },
    directControl: {
      getCiv7PlayableStatus: async (endpointDefaults) => {
        calls.playableStatus.push(endpointDefaults);
        return options.playableStatus;
      },
      getCiv7PlayNotificationView: async (notificationOptions) => {
        calls.notifications.push(notificationOptions);
        if (options.notificationsError != null) {
          throw options.notificationsError;
        }
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
      getCiv7TurnCompletionStatus: async (endpointDefaults) => {
        calls.turnCompletion.push(endpointDefaults);
        return options.turnCompletion ?? turnCompletionStatusResult();
      },
    },
  };

  return { context, calls };
}

function playableStatusResult(
  overrides: Partial<Civ7ControlOrpcPlayableStatusResult> = {},
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
  } = {},
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

function turnCompletionStatusResult(
  overrides: Partial<Civ7ControlOrpcTurnCompletionStatusResult> = {},
): Civ7ControlOrpcTurnCompletionStatusResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    turn: { ok: true, value: 12 },
    turnDate: { ok: true, value: "3400 BCE" },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: true },
    blocker: { ok: true, value: 0 },
    firstReadyUnitId: { ok: true, value: null },
    ...overrides,
  };
}

function readyUnitViewResult(
  unitId: { owner: number; id: number; type?: number },
): Civ7ControlOrpcReadyUnitViewResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    requestedUnitId: unitId,
    selectedUnitId: { ok: true, value: unitId },
    firstReadyUnitId: { ok: true, value: unitId },
    unitId,
    unit: { ok: true, value: { id: unitId } },
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

function readyCityViewResult(
  cityId: { owner: number; id: number; type?: number },
): Civ7ControlOrpcReadyCityViewResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    requestedCityId: cityId,
    selectedCityId: { ok: true, value: cityId },
    blockingCityId: { ok: true, value: cityId },
    cityId,
    city: { ok: true, value: { id: cityId } },
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
