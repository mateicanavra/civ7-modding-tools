import { describe, expect, test } from "vitest";

import {
  createCiv7GameUiControllerContextFactory,
  installCiv7GameUiIntelligenceBridge,
  type Civ7GameUiRuntimeTarget,
} from "../src/game-ui";

describe("Civ7 game UI controller bootstrap", () => {
  const notificationId = { owner: 0, id: 113, type: 20 };

  test("installs the intelligence bridge with a game UI readiness context", async () => {
    const target = gameUiTarget();
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    expect(target.Civ7IntelligenceBridge).toBe(bridge);

    const response = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "game-ui-readiness-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "readiness.current",
      correlationId: "game-ui-readiness-1",
      output: {
        playable: false,
        readiness: "app-ui-game",
        capability: {
          canObserve: false,
          canMutate: false,
        },
        controller: {
          supportedProcedures: [],
        },
        sources: {
          gameUi: {
            inGame: true,
            inShell: false,
            inLoading: false,
            canBeginGame: false,
          },
          runtimeControl: {
            ready: null,
          },
        },
      },
    });
  });

  test("reports narrow notification mutation and attention read support", async () => {
    const target = gameUiNotificationTarget(notificationId);
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "game-ui-readiness-supported-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "readiness.current",
      correlationId: "game-ui-readiness-supported-1",
      output: {
        playable: false,
        readiness: "app-ui-game",
        capability: {
          canObserve: true,
          canMutate: false,
          reason:
            "The game UI controller can read supported attention; broad runtime mutation remains unavailable.",
        },
        controller: {
          supportedProcedures: [
            {
              procedureKey: "attention.current",
              risk: "read-only",
            },
            {
              procedureKey: "notifications.dismiss.request",
              risk: "mutation",
            },
          ],
        },
      },
    });
    expect(response.ok && response.output.nextSteps).toEqual([{
      kind: "read-attention",
      source: "readiness.current",
      label: "Read current attention before choosing support actions.",
    }]);
  });

  test("executes approved notification dismissal through game UI runtime", async () => {
    const target = gameUiNotificationTarget(notificationId);
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "notifications.dismiss.request",
      input: { notificationId },
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved notification dismissal",
      },
      correlationId: "game-ui-notification-dismiss-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "notifications.dismiss.request",
      correlationId: "game-ui-notification-dismiss-1",
      output: {
        notificationId,
        sent: true,
        status: "sent-confirmed",
        validation: {
          beforeExists: true,
          canDismiss: true,
          afterExists: false,
        },
        postcondition: {
          classification: "notification-disappeared",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
      },
    });
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("NotificationModel.manager.dismiss");
    expect(serialized).not.toContain("Game.Notifications.dismiss");
    expect(serialized).not.toContain("controller approved");
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
  });

  test("keeps unsupported mutation ports bounded by the existing bridge projection", async () => {
    const target = gameUiTarget();
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "notifications.dismiss.request",
      input: { notificationId: { owner: 0, id: 113, type: 20 } },
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved notification dismissal",
      },
    });

    expect(response).toEqual({
      ok: false,
      error: {
        code: "MUTATION_READINESS_REQUIRED",
        message: "Playable Civ7 readiness is required before mutation.",
        reason: "procedure-failed",
      },
    });
    expect(JSON.stringify(response)).not.toContain("NotificationModel");
    expect(JSON.stringify(response)).not.toContain("Game.Notifications");
    expect(JSON.stringify(response)).not.toContain("controller approved");
  });

  test("keeps unsupported game UI mutations bounded when notification dismissal is available", async () => {
    const target = gameUiNotificationTarget(notificationId);
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "turn.complete.request",
      input: {},
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved turn completion",
      },
    });

    expect(response).toEqual({
      ok: false,
      error: {
        code: "MUTATION_READINESS_REQUIRED",
        message: "Playable Civ7 readiness is required before mutation.",
        reason: "procedure-failed",
      },
    });
    expect(JSON.stringify(response)).not.toContain("controller approved");
    expect(JSON.stringify(response)).not.toContain("Civ7 game UI controller dependency");
  });

  test("reads supported game UI attention without ready actor overclaim", async () => {
    const target = gameUiNotificationTarget(notificationId);
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "attention.current",
      input: {},
      correlationId: "game-ui-attention-supported-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "attention.current",
      correlationId: "game-ui-attention-supported-1",
      output: {
        playable: false,
        readiness: "app-ui-game",
        summary: {
          blockerCount: 1,
          decisionCount: 1,
          readyActorCount: 0,
        },
        blockers: [{
          source: "notification",
          kind: "blocking-notification",
          label: "Wonder Completed",
          componentId: notificationId,
          evidence: ["end-turn-blocking-notification"],
        }],
        decisions: [{
          source: "notification",
          category: "blocking-notification",
          summary: "Wonder Completed",
          isEndTurnBlocking: true,
          requiredInputs: [],
        }],
        readyActors: [],
        sourceStatus: {
          playableStatus: "read",
          notifications: "read",
          turnCompletion: "read",
          readyUnit: "read",
          readyCity: "skipped-unsupported",
        },
        nextSteps: [{
          kind: "resolve-blocker",
          source: "notification",
          label: "Resolve Wonder Completed.",
        }],
      },
    });
    expect(response.ok && response.output.nextSteps.map((step) => step.kind))
      .not.toContain("end-turn");
    expect(JSON.stringify(response)).not.toContain("Civ7 game UI controller dependency");
    expect(JSON.stringify(response)).not.toContain("Game.Notifications.dismiss");
  });

  test("does not treat selected unit evidence as a ready unit", async () => {
    const selectedUnitId = { owner: 0, id: 501, type: 26 };
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: false,
      selectedUnitId,
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "attention.current",
      input: {},
      correlationId: "game-ui-attention-selected-unit-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sourceStatus: {
          readyUnit: "read",
          readyCity: "skipped-unsupported",
        },
        summary: {
          blockerCount: 0,
          readyActorCount: 0,
          nextStepCount: 1,
        },
        readyActors: [],
        nextSteps: [{
          kind: "observe",
          source: "attention",
          label:
            "Ready actor coverage is incomplete; inspect ready unit and city evidence before concluding there are no blockers.",
        }],
      },
    });
    expect(JSON.stringify(response)).not.toContain("act-ready-unit");
    expect(response.ok && response.output.nextSteps.map((step) => step.kind))
      .not.toContain("end-turn");
  });

  test("uses first-ready-unit evidence without implying full ready actor coverage", async () => {
    const readyUnitId = { owner: 0, id: 502, type: 26 };
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: false,
      firstReadyUnitId: readyUnitId,
      canEndTurn: true,
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "attention.current",
      input: {},
      correlationId: "game-ui-attention-first-ready-unit-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        canEndTurn: true,
        sourceStatus: {
          readyUnit: "read",
          readyCity: "skipped-unsupported",
        },
        summary: {
          blockerCount: 1,
          readyActorCount: 1,
          nextStepCount: 1,
        },
        blockers: [{
          source: "ready-unit",
          componentId: readyUnitId,
          evidence: ["game-ui-ready-unit-source"],
        }],
        readyActors: [{
          kind: "unit",
          componentId: readyUnitId,
          operationCount: 0,
          evidence: ["game-ui-ready-unit-source"],
        }],
        nextSteps: [{
          kind: "act-ready-unit",
          source: "ready-unit",
        }],
      },
    });
    expect(response.ok && response.output.nextSteps.map((step) => step.kind))
      .not.toContain("end-turn");
  });

  test("does not treat selected or notification-target city hints as ready city evidence", async () => {
    const cityId = { owner: 0, id: 703, type: 1 };
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: false,
      selectedCityId: cityId,
      notificationTarget: cityId,
      canEndTurn: true,
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "attention.current",
      input: {},
      correlationId: "game-ui-attention-selected-city-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sourceStatus: {
          readyUnit: "read",
          readyCity: "skipped-unsupported",
        },
        summary: {
          blockerCount: 0,
          readyActorCount: 0,
          nextStepCount: 1,
        },
        readyActors: [],
        nextSteps: [{
          kind: "observe",
          source: "attention",
          label:
            "Ready actor coverage is incomplete; inspect ready unit and city evidence before concluding there are no blockers.",
        }],
      },
    });
    expect(JSON.stringify(response)).not.toContain("act-ready-city");
    expect(response.ok && response.output.nextSteps.map((step) => step.kind))
      .not.toContain("end-turn");
  });

  test("treats truncated game UI notification coverage as incomplete attention evidence", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: false,
      extraIds: [{ owner: 0, id: 114, type: 20 }],
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "attention.current",
      input: { maxNotifications: 1 },
      correlationId: "game-ui-attention-truncated-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "attention.current",
      correlationId: "game-ui-attention-truncated-1",
      output: {
        summary: {
          blockerCount: 0,
          decisionCount: 1,
          readyActorCount: 0,
          nextStepCount: 1,
        },
        nextSteps: [{
          kind: "observe",
          source: "attention",
          label:
            "Notification coverage is truncated; inspect more attention evidence before concluding there are no blockers.",
        }],
      },
    });
    expect(response.ok && response.output.nextSteps.map((step) => step.kind))
      .not.toContain("end-turn");
    expect(response.ok && response.output.nextSteps.map((step) => step.label))
      .not.toContain("No current blockers found.");
  });

  test("requires game-owned mutation proof before bridge dispatch", async () => {
    const target = gameUiTarget({
      Players: {
        maxPlayers: 8,
        getAliveIds: () => [0, 1],
        getAliveHumanIds: () => [0, 1],
        getNumAliveHumans: () => 2,
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "notifications.dismiss.request",
      input: { notificationId: { owner: 0, id: 113, type: 20 } },
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved notification dismissal",
      },
    });

    expect(response).toEqual({
      ok: false,
      error: {
        code: "BRIDGE_CONTROLLER_PROOF_REQUIRED",
        message:
          "Civ7 controller bridge mutation proof is required before dispatch.",
        reason: "invalid-envelope",
      },
    });
    expect(JSON.stringify(response)).not.toContain("controller approved");
  });

  test("creates context without endpoint or raw command inputs", async () => {
    const createContext = createCiv7GameUiControllerContextFactory({
      target: gameUiTarget(),
      timeoutMs: 250,
    });

    const context = await createContext({
      procedureKey: "readiness.current",
      input: {},
    });

    expect(context.endpointDefaults).toEqual({ timeoutMs: 250 });
    expect(context.approval).toBeUndefined();
    expect(context.controller).toEqual({
      supportedReadProcedures: [],
      supportedMutationProcedures: [],
    });
    expect(context.controllerProof).toEqual({
      lifecycle: {
        source: "controller-runtime",
        status: "game-controller-ready",
      },
      localPlayer: {
        source: "GameContext.localPlayerID",
        playerId: 0,
      },
      hotseat: {
        source: "controller-runtime",
        status: "single-local-player",
      },
    });
    expect(await context.directControl.getCiv7PlayableStatus()).toMatchObject({
      host: "game-ui",
      port: 0,
      playable: false,
      readiness: "app-ui-game",
      appUi: {
        state: { id: "game-ui", name: "Game UI" },
      },
    });
  });

  test("creates context with narrow notification dismissal mutation support", async () => {
    const createContext = createCiv7GameUiControllerContextFactory({
      target: gameUiNotificationTarget(notificationId),
      timeoutMs: 250,
    });

    const context = await createContext({
      procedureKey: "notifications.dismiss.request",
      input: { notificationId },
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved notification dismissal",
      },
    });

    expect(context.controller).toEqual({
      supportedReadProcedures: ["attention.current"],
      supportedMutationProcedures: ["notifications.dismiss.request"],
    });
    expect(await context.directControl.getCiv7PlayableStatus()).toMatchObject({
      playable: false,
      readiness: "app-ui-game",
    });
  });
});

function gameUiTarget(
  overrides: Partial<Civ7GameUiRuntimeTarget> = {},
): Civ7GameUiRuntimeTarget {
  const target: Civ7GameUiRuntimeTarget = {
    UI: {
      isInGame: () => true,
      isInShell: () => false,
      isInLoading: () => false,
      getGameLoadingState: () => 8,
      notifyUIReady: () => {},
      Player: {
        getHeadSelectedUnit: () => null,
        getFirstReadyUnit: () => null,
        getHeadSelectedCity: () => null,
      },
    },
    UIGameLoadingState: {
      GameStarted: 8,
      WaitingForUIReady: 5,
      WaitingToStart: 6,
    },
    GameContext: {
      localPlayerID: 0,
      localObserverID: 0,
      hasRequestedPause: () => false,
    },
    Game: {
      turn: 42,
      age: 1,
      maxTurns: 500,
      getTurnDate: () => "Ancient Era",
      getHash: () => 123,
    },
    Autoplay: {
      isActive: false,
      turns: 0,
      isPaused: false,
      isPausedOrPending: false,
      observeAsPlayer: 0,
      returnAsPlayer: 0,
    },
    Network: {
      isInSession: true,
      getNumPlayers: () => 1,
      getHostPlayerId: () => 0,
      isConnectedToNetwork: () => true,
      isAuthenticated: () => true,
      isLoggedIn: () => true,
    },
    Players: {
      maxPlayers: 8,
      getAliveIds: () => [0],
      getAliveHumanIds: () => [0],
      getNumAliveHumans: () => 1,
    },
    GameplayMap: {
      getGridWidth: () => 74,
      getGridHeight: () => 46,
      getPlotCount: () => 3_404,
      getMapSize: () => 1,
      getRandomSeed: () => 99,
    },
    Configuration: {
      getGame: () => ({ skipStartButton: false }),
    },
  };
  return {
    ...target,
    ...overrides,
  };
}

function gameUiNotificationTarget(
  notificationId: { owner: number; id: number; type: number },
  options: Readonly<{
    blocksTurnAdvancement?: boolean;
    extraIds?: Array<{ owner: number; id: number; type: number }>;
    selectedUnitId?: { owner: number; id: number; type: number };
    firstReadyUnitId?: { owner: number; id: number; type: number };
    selectedCityId?: { owner: number; id: number; type: number };
    notificationTarget?: { owner: number; id: number; type: number };
    canEndTurn?: boolean;
  }> = {},
): Civ7GameUiRuntimeTarget {
  const target = gameUiTarget();
  let exists = true;
  const blocksTurnAdvancement = options.blocksTurnAdvancement ?? true;
  const notification = {
    Type: notificationId.type,
    Summary: "Wonder Completed",
    Message: "Wonder Completed",
    Target: options.notificationTarget ?? { owner: -1, id: -1, type: 0 },
    Location: { x: -9999, y: -9999 },
    CanUserDismiss: true,
    Expired: false,
    Dismissed: false,
    BlocksTurnAdvancement: blocksTurnAdvancement,
  };

  return {
    ...target,
    UI: {
      ...target.UI,
      Player: {
        getHeadSelectedUnit: () => options.selectedUnitId ?? null,
        getFirstReadyUnit: () => options.firstReadyUnitId ?? null,
        getHeadSelectedCity: () => options.selectedCityId ?? null,
      },
    },
    canEndTurn: () => options.canEndTurn ?? false,
    Game: {
      ...target.Game,
      Notifications: {
        find: () => exists ? notification : null,
        getType: () => notificationId.type,
        getTypeName: () => "NOTIFICATION_WONDER_COMPLETED",
        getSummary: () => "Wonder Completed",
        getMessage: () => "Wonder Completed",
        getBlocksTurnAdvancement: () => blocksTurnAdvancement,
        getEndTurnBlockingType: () =>
          blocksTurnAdvancement ? notificationId.type : 0,
        findEndTurnBlocking: () =>
          exists && blocksTurnAdvancement ? notificationId : null,
        getIdsForPlayer: () =>
          exists ? [notificationId, ...(options.extraIds ?? [])] : [],
      },
    },
    NotificationModel: {
      QueryBy: { Priority: 2 },
      manager: {
        dismiss: () => {
          exists = false;
          return true;
        },
        findPlayer: () => ({
          getTypesBy: () => exists
            ? [{ notifications: [notificationId] }]
            : [],
        }),
      },
    },
  };
}
