import type { Civ7ControllerBridgeContextFactory } from "./bridge/controller-ingress";
import {
  installCiv7IntelligenceBridge,
  type Civ7IntelligenceBridge,
} from "./bridge/intelligence-bridge";
import type {
  Civ7ControlOrpcDirectControlFacade,
  Civ7ControlOrpcPlayableStatusResult,
} from "./dependencies/direct-control";

type RuntimeProbe<T> = Readonly<
  | { ok: true; value: T }
  | { ok: false; error: string }
>;

export type Civ7GameUiRuntimeTarget = {
  Civ7IntelligenceBridge?: Civ7IntelligenceBridge;
  UI?: {
    isInGame?: () => boolean;
    isInShell?: () => boolean;
    isInLoading?: () => boolean;
    getGameLoadingState?: () => number;
    notifyUIReady?: () => void;
  };
  UIGameLoadingState?: Record<string, number>;
  GameContext?: {
    localPlayerID?: number;
    localObserverID?: number;
    hasRequestedPause?: () => boolean;
  };
  Game?: {
    turn?: number;
    age?: number;
    maxTurns?: number;
    getTurnDate?: () => string;
    getHash?: () => number;
  };
  Autoplay?: {
    isActive?: boolean;
    turns?: number;
    isPaused?: boolean;
    isPausedOrPending?: boolean;
    observeAsPlayer?: number;
    returnAsPlayer?: number;
  };
  Network?: {
    isInSession?: boolean;
    getNumPlayers?: () => number;
    getHostPlayerId?: () => number;
    isConnectedToNetwork?: () => boolean;
    isAuthenticated?: () => boolean;
    isLoggedIn?: () => boolean;
  };
  Players?: {
    maxPlayers?: number;
    getAliveIds?: () => number[];
    getAliveHumanIds?: () => number[];
    getNumAliveHumans?: () => number;
  };
  GameplayMap?: {
    getGridWidth?: () => number;
    getGridHeight?: () => number;
    getPlotCount?: () => number;
    getMapSize?: () => number;
    getRandomSeed?: () => number;
  };
  Configuration?: {
    getGame?: () => { skipStartButton?: boolean };
  };
};

export type Civ7GameUiControllerOptions = Readonly<{
  target?: Civ7GameUiRuntimeTarget;
  replaceExisting?: boolean;
  timeoutMs?: number;
}>;

export function installCiv7GameUiIntelligenceBridge(
  options: Civ7GameUiControllerOptions = {},
): Civ7IntelligenceBridge {
  const target = options.target ?? globalThis as Civ7GameUiRuntimeTarget;
  return installCiv7IntelligenceBridge({
    target,
    replaceExisting: options.replaceExisting,
    createContext: createCiv7GameUiControllerContextFactory({
      target,
      timeoutMs: options.timeoutMs,
    }),
  });
}

export function createCiv7GameUiControllerContextFactory(
  options: Readonly<{
    target: Civ7GameUiRuntimeTarget;
    timeoutMs?: number;
  }>,
): Civ7ControllerBridgeContextFactory {
  const directControl = createCiv7GameUiDirectControlFacade(options.target);
  return () => ({
    directControl,
    endpointDefaults: { timeoutMs: options.timeoutMs ?? 1_000 },
  });
}

function createCiv7GameUiDirectControlFacade(
  target: Civ7GameUiRuntimeTarget,
): Civ7ControlOrpcDirectControlFacade {
  const unsupported = async (): Promise<never> => {
    throw new Error(
      "Civ7 game UI controller runtime port is not implemented for this procedure.",
    );
  };

  return {
    requestCiv7ProductionChoice: unsupported,
    requestCiv7NotificationDismissal: unsupported,
    requestCiv7NarrativeChoice: unsupported,
    requestCiv7DiplomacyResponse: unsupported,
    requestCiv7TechnologyChoiceCloseout: unsupported,
    requestCiv7CultureChoiceCloseout: unsupported,
    requestCiv7AssignWorkerPlacement: unsupported,
    requestCiv7ExpandCityPlacement: unsupported,
    requestCiv7UnitTargetAction: unsupported,
    requestCiv7TurnComplete: unsupported,
    getCiv7PlayableStatus: async () => gameUiPlayableStatus(target),
    getCiv7PlayNotificationView: unsupported,
    getCiv7BattlefieldScan: unsupported,
    getCiv7ReadyUnitView: unsupported,
    getCiv7ReadyCityView: unsupported,
    getCiv7TargetCandidates: unsupported,
    getCiv7TurnCompletionStatus: unsupported,
  };
}

function gameUiPlayableStatus(
  target: Civ7GameUiRuntimeTarget,
): Civ7ControlOrpcPlayableStatusResult {
  const snapshot = gameUiSnapshot(target);
  const inGame = probeValue(snapshot.ui.inGame) === true;
  const inShell = probeValue(snapshot.ui.inShell) === true;
  const inLoading = probeValue(snapshot.ui.inLoading) === true;
  const canBegin = probeValue(snapshot.ui.canBeginGame) === true;
  const readiness = inGame
    ? "app-ui-game"
    : canBegin
      ? "begin-ready"
      : inLoading
        ? "loading"
        : inShell
          ? "shell"
          : "unavailable";

  return {
    host: "game-ui",
    port: 0,
    playable: false,
    readiness,
    appUi: {
      host: "game-ui",
      port: 0,
      state: { id: "game-ui", name: "Game UI" },
      snapshot,
    },
    errors: [],
  };
}

function gameUiSnapshot(target: Civ7GameUiRuntimeTarget) {
  return {
    network: {
      isInSession: ok(Boolean(target.Network?.isInSession)),
      numPlayers: probe(() => target.Network?.getNumPlayers?.() ?? 0),
      hostPlayerId: probe(() => target.Network?.getHostPlayerId?.() ?? -1),
      isConnectedToNetwork: probe(() =>
        target.Network?.isConnectedToNetwork?.() ?? false
      ),
      isAuthenticated: probe(() => target.Network?.isAuthenticated?.() ?? false),
      isLoggedIn: probe(() => target.Network?.isLoggedIn?.() ?? false),
    },
    autoplay: {
      isActive: target.Autoplay?.isActive ?? false,
      turns: target.Autoplay?.turns ?? 0,
      isPaused: target.Autoplay?.isPaused ?? false,
      isPausedOrPending: target.Autoplay?.isPausedOrPending ?? false,
      observeAsPlayer: target.Autoplay?.observeAsPlayer ?? -1,
      returnAsPlayer: target.Autoplay?.returnAsPlayer ?? -1,
    },
    game: {
      turn: target.Game?.turn ?? -1,
      age: target.Game?.age ?? -1,
      maxTurns: target.Game?.maxTurns ?? 0,
      turnDate: probe(() => target.Game?.getTurnDate?.() ?? ""),
      hash: probe(() => target.Game?.getHash?.() ?? 0),
    },
    ui: {
      inGame: probe(() => target.UI?.isInGame?.() ?? false),
      inShell: probe(() => target.UI?.isInShell?.() ?? false),
      inLoading: probe(() => target.UI?.isInLoading?.() ?? false),
      loadingState: probe(() => target.UI?.getGameLoadingState?.() ?? -1),
      loadingStateName: loadingStateName(target),
      canBeginGame: canBeginGame(target),
      canNotifyUIReady: typeof target.UI?.notifyUIReady,
      skipStartButton: probe(() =>
        target.Configuration?.getGame?.().skipStartButton ?? false
      ),
      automationActive: ok(false),
    },
    gameContext: {
      localPlayerID: target.GameContext?.localPlayerID ?? -1,
      localObserverID: target.GameContext?.localObserverID ?? -1,
      hasRequestedPause: probe(() =>
        target.GameContext?.hasRequestedPause?.() ?? false
      ),
    },
    players: {
      maxPlayers: target.Players?.maxPlayers ?? 0,
      aliveIds: probe(() => target.Players?.getAliveIds?.() ?? []),
      aliveHumanIds: probe(() => target.Players?.getAliveHumanIds?.() ?? []),
      numAliveHumans: probe(() => target.Players?.getNumAliveHumans?.() ?? 0),
    },
    map: {
      width: probe(() => target.GameplayMap?.getGridWidth?.() ?? 0),
      height: probe(() => target.GameplayMap?.getGridHeight?.() ?? 0),
      plotCount: probe(() => target.GameplayMap?.getPlotCount?.() ?? 0),
      mapSize: probe(() => target.GameplayMap?.getMapSize?.() ?? 0),
      randomSeed: probe(() => target.GameplayMap?.getRandomSeed?.() ?? 0),
    },
  };
}

function canBeginGame(target: Civ7GameUiRuntimeTarget): RuntimeProbe<boolean> {
  return probe(() => {
    const loadingState = target.UI?.getGameLoadingState?.();
    if (loadingState == null) return false;
    const states = target.UIGameLoadingState ?? {};
    return loadingState === states.WaitingForUIReady
      || loadingState === states.WaitingToStart;
  });
}

function loadingStateName(target: Civ7GameUiRuntimeTarget): string | null {
  const loadingState = target.UI?.getGameLoadingState?.();
  if (loadingState == null) return null;
  return Object.entries(target.UIGameLoadingState ?? {}).find(
    ([, value]) => value === loadingState,
  )?.[0] ?? null;
}

function probe<T>(fn: () => T): RuntimeProbe<T> {
  try {
    return ok(fn());
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function ok<T>(value: T): RuntimeProbe<T> {
  return { ok: true, value };
}

function probeValue<T>(probe: RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
}
