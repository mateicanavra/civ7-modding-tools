import {
  requestCiv7GameUiNotificationDismissal,
  type Civ7GameUiNotificationDismissalTarget,
} from "@civ7/direct-control/play/notifications/game-ui-dismissal";

import type { Civ7ControllerBridgeContextFactory } from "./bridge/controller-ingress";
import type { Civ7ControllerBridgeMutationProof } from "./bridge/controller-ingress";
import {
  installCiv7IntelligenceBridge,
  type Civ7IntelligenceBridge,
} from "./bridge/intelligence-bridge";
import {
  getCiv7GameUiPlayNotificationView,
  getCiv7GameUiReadyCityView,
  getCiv7GameUiReadyUnitView,
  getCiv7GameUiTurnCompletionStatus,
  requestCiv7GameUiTurnComplete,
  type Civ7GameUiAttentionTarget,
} from "./game-ui-attention";
import type {
  Civ7ControlOrpcDirectControlFacade,
  Civ7ControlOrpcPlayableStatusResult,
} from "./dependencies/direct-control";

type Civ7GameUiNotifications = NonNullable<
  NonNullable<Civ7GameUiNotificationDismissalTarget["Game"]>["Notifications"]
> & NonNullable<NonNullable<Civ7GameUiAttentionTarget["Game"]>["Notifications"]>;

type RuntimeProbe<T> = Readonly<
  | { ok: true; value: T }
  | { ok: false; error: string }
>;

export type Civ7GameUiRuntimeTarget = {
  Civ7IntelligenceBridge?: Civ7IntelligenceBridge;
  EndTurnBlockingTypes?: Civ7GameUiNotificationDismissalTarget["EndTurnBlockingTypes"];
  NotificationModel?: Civ7GameUiNotificationDismissalTarget["NotificationModel"];
  UI?: {
    isInGame?: () => boolean;
    isInShell?: () => boolean;
    isInLoading?: () => boolean;
    getGameLoadingState?: () => number;
    notifyUIReady?: () => void;
    Player?: Civ7GameUiAttentionTarget["UI"] extends infer UI
      ? UI extends { Player?: infer Player } ? Player : never
      : never;
  };
  UIGameLoadingState?: Record<string, number>;
  GameContext?: {
    localPlayerID?: number;
    localObserverID?: number;
    hasRequestedPause?: () => boolean;
    hasSentTurnComplete?: () => boolean;
    sendTurnComplete?: () => unknown;
  };
  Game?: {
    turn?: number;
    age?: number;
    maxTurns?: number;
    getTurnDate?: () => string;
    getHash?: () => number;
    Notifications?: Civ7GameUiNotifications;
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
  canEndTurn?: () => boolean;
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
    controller: {
      supportedReadProcedures:
        gameUiSupportedReadProcedures(options.target),
      supportedMutationProcedures:
        gameUiSupportedMutationProcedures(options.target),
    },
    controllerProof: gameUiControllerMutationProof(options.target) ?? undefined,
  });
}

function createCiv7GameUiDirectControlFacade(
  target: Civ7GameUiRuntimeTarget,
): Civ7ControlOrpcDirectControlFacade {
  const unsupported = async (): Promise<never> => {
    throw new Error(
      "Civ7 game UI controller dependency is not implemented for this procedure.",
    );
  };

  return {
    requestCiv7ProductionChoice: unsupported,
    requestCiv7NotificationDismissal: async (input) =>
      await requestCiv7GameUiNotificationDismissal(input, target),
    requestCiv7NarrativeChoice: unsupported,
    requestCiv7DiplomacyResponse: unsupported,
    requestCiv7TechnologyChoiceCloseout: unsupported,
    requestCiv7CultureChoiceCloseout: unsupported,
    requestCiv7AssignWorkerPlacement: unsupported,
    requestCiv7ExpandCityPlacement: unsupported,
    requestCiv7UnitTargetAction: unsupported,
    requestCiv7TurnComplete: async () =>
      await requestCiv7GameUiTurnComplete(target),
    getCiv7PlayableStatus: async () => gameUiPlayableStatus(target),
    getCiv7PlayNotificationView: async (options) =>
      await getCiv7GameUiPlayNotificationView({
        maxNotifications: options?.maxNotifications,
      }, target),
    getCiv7BattlefieldScan: unsupported,
    getCiv7ReadyUnitView: async (input) =>
      await getCiv7GameUiReadyUnitView(input, target),
    getCiv7ReadyCityView: async (input) =>
      await getCiv7GameUiReadyCityView(input, target),
    getCiv7TargetCandidates: unsupported,
    getCiv7TurnCompletionStatus: async () =>
      await getCiv7GameUiTurnCompletionStatus(target),
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

function gameUiSupportedMutationProcedures(
  target: Civ7GameUiRuntimeTarget,
): readonly string[] {
  if (gameUiControllerMutationProof(target) == null) return [];
  const supported: string[] = [];
  if (gameUiNotificationDismissalAvailable(target)) {
    supported.push("notifications.dismiss.request");
  }
  if (gameUiTurnCompletionAvailable(target)) {
    supported.push("turn.complete.request");
  }
  return supported;
}

function gameUiSupportedReadProcedures(
  target: Civ7GameUiRuntimeTarget,
): readonly string[] {
  if (
    gameUiControllerMutationProof(target) != null
    && gameUiAttentionReadAvailable(target)
  ) {
    return ["attention.current"];
  }
  return [];
}

function gameUiNotificationDismissalAvailable(
  target: Civ7GameUiRuntimeTarget,
): boolean {
  const notifications = target.Game?.Notifications;
  const manager = target.NotificationModel?.manager;
  return typeof notifications?.find === "function"
    && (
      typeof notifications.dismiss === "function"
      || typeof manager?.dismiss === "function"
      || typeof manager?.onDismiss === "function"
    );
}

function gameUiAttentionReadAvailable(target: Civ7GameUiRuntimeTarget): boolean {
  return typeof target.Game?.Notifications?.getIdsForPlayer === "function"
    && typeof target.Game?.Notifications?.find === "function"
    && typeof target.UI?.Player?.getFirstReadyUnit === "function"
    && isControllerPlayerId(target.GameContext?.localPlayerID);
}

function gameUiTurnCompletionAvailable(target: Civ7GameUiRuntimeTarget): boolean {
  return gameUiAttentionReadAvailable(target)
    && typeof target.GameContext?.hasSentTurnComplete === "function"
    && typeof target.GameContext?.sendTurnComplete === "function"
    && typeof target.canEndTurn === "function"
    && typeof target.Game?.getTurnDate === "function"
    && typeof target.Game?.Notifications?.getEndTurnBlockingType === "function";
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

function gameUiControllerMutationProof(
  target: Civ7GameUiRuntimeTarget,
): Civ7ControllerBridgeMutationProof | null {
  if (probeValue(probe(() => target.UI?.isInGame?.() ?? false)) !== true) {
    return null;
  }

  const localPlayerId = target.GameContext?.localPlayerID;
  if (!isControllerPlayerId(localPlayerId)) return null;
  if (!isSingleLocalHuman(target, localPlayerId)) return null;

  return {
    lifecycle: {
      source: "controller-runtime",
      status: "game-controller-ready",
    },
    localPlayer: {
      source: "GameContext.localPlayerID",
      playerId: localPlayerId,
    },
    hotseat: {
      source: "controller-runtime",
      status: "single-local-player",
    },
  };
}

function isSingleLocalHuman(
  target: Civ7GameUiRuntimeTarget,
  localPlayerId: number,
): boolean {
  const aliveHumanIds = probe(() => target.Players?.getAliveHumanIds?.());
  if (aliveHumanIds.ok && Array.isArray(aliveHumanIds.value)) {
    return aliveHumanIds.value.length === 1
      && aliveHumanIds.value[0] === localPlayerId;
  }

  const aliveHumanCount = probe(() => target.Players?.getNumAliveHumans?.());
  return aliveHumanCount.ok && aliveHumanCount.value === 1;
}

function isControllerPlayerId(playerId: unknown): playerId is number {
  return typeof playerId === "number"
    && Number.isInteger(playerId)
    && playerId >= 0
    && playerId <= 255;
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
