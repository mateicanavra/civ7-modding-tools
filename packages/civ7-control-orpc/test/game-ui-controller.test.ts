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

  test("keeps broad readiness conservative with narrow notification mutation support", async () => {
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
          canObserve: false,
          canMutate: false,
          reason: "The game is open, but runtime control is not ready.",
        },
        controller: {
          supportedProcedures: [{
            procedureKey: "notifications.dismiss.request",
            risk: "mutation",
          }],
        },
      },
    });
    expect(response.ok && response.output.nextSteps).toEqual([{
      kind: "restore-tuner",
      source: "readiness.current",
      label: "Restore runtime control readiness before support reads or actions.",
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
    expect(JSON.stringify(response)).not.toContain("Civ7 game UI controller runtime port");
  });

  test("keeps unsupported game UI reads bounded when notification dismissal is available", async () => {
    const target = gameUiNotificationTarget(notificationId);
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "attention.current",
      input: {},
      correlationId: "game-ui-attention-unsupported-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "attention.current",
      correlationId: "game-ui-attention-unsupported-1",
      output: {
        playable: false,
        readiness: "app-ui-game",
        blockers: [],
        decisions: [],
        readyActors: [],
        sourceStatus: {
          playableStatus: "read",
          notifications: "skipped-not-playable",
          readyUnit: "skipped-not-playable",
          readyCity: "skipped-not-playable",
          turnCompletion: "skipped-not-playable",
        },
        nextSteps: [{
          kind: "restore-readiness",
          source: "readiness",
          label: "Restore playable Tuner/App UI readiness before reading attention.",
        }],
      },
    });
    expect(JSON.stringify(response)).not.toContain("Civ7 game UI controller runtime port");
    expect(JSON.stringify(response)).not.toContain("Game.Notifications");
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
): Civ7GameUiRuntimeTarget {
  const target = gameUiTarget();
  let exists = true;
  const notification = {
    Type: notificationId.type,
    Summary: "Wonder Completed",
    Message: "Wonder Completed",
    Target: { owner: -1, id: -1, type: 0 },
    Location: { x: -9999, y: -9999 },
    CanUserDismiss: true,
    Expired: false,
    Dismissed: false,
    BlocksTurnAdvancement: true,
  };

  return {
    ...target,
    Game: {
      ...target.Game,
      Notifications: {
        find: () => exists ? notification : null,
        getType: () => notificationId.type,
        getTypeName: () => "NOTIFICATION_WONDER_COMPLETED",
        getSummary: () => "Wonder Completed",
        getMessage: () => "Wonder Completed",
        getBlocksTurnAdvancement: () => true,
        getEndTurnBlockingType: () => notificationId.type,
        findEndTurnBlocking: () => exists ? notificationId : null,
        getIdsForPlayer: () => exists ? [notificationId] : [],
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
