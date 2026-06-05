import { describe, expect, test } from "vitest";

import {
  createCiv7GameUiControllerContextFactory,
  installCiv7GameUiIntelligenceBridge,
  type Civ7GameUiRuntimeTarget,
} from "../src/game-ui";

describe("Civ7 game UI controller bootstrap", () => {
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
