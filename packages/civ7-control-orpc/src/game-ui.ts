import {
  requestCiv7GameUiNotificationDismissal,
  type Civ7GameUiNotificationDismissalTarget,
} from "./game-ui-notification-dismissal";

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
import {
  civ7GameUiProductionChoiceAvailable,
  requestCiv7GameUiProductionChoice,
  type Civ7GameUiProductionTarget,
} from "./game-ui-production";
import {
  civ7GameUiTownFocusAvailable,
  requestCiv7GameUiTownFocusChange,
  requestCiv7GameUiTownFocusReviewCloseout,
  type Civ7GameUiTownFocusTarget,
} from "./game-ui-town-focus";
import {
  civ7GameUiProgressionChoiceAvailable,
  civ7GameUiProgressionRequestAvailable,
  requestCiv7GameUiAttributePurchase,
  requestCiv7GameUiAttributeReviewCloseout,
  requestCiv7GameUiCultureChoiceCloseout,
  requestCiv7GameUiCultureTarget,
  requestCiv7GameUiTechnologyChoiceCloseout,
  requestCiv7GameUiTechnologyTarget,
  requestCiv7GameUiTraditionChange,
  requestCiv7GameUiTraditionReviewCloseout,
  type Civ7GameUiProgressionTarget,
} from "./game-ui-progression";
import {
  civ7GameUiPopulationPlacementAvailable,
  requestCiv7GameUiAssignWorkerPlacement,
  requestCiv7GameUiExpandCityPlacement,
  type Civ7GameUiPopulationTarget,
} from "./game-ui-population";
import {
  civ7GameUiNarrativeChoiceAvailable,
  requestCiv7GameUiNarrativeChoice,
  type Civ7GameUiNarrativeTarget,
} from "./game-ui-narrative";
import {
  civ7GameUiDiplomacyResponseAvailable,
  requestCiv7GameUiDiplomacyResponse,
  type Civ7GameUiDiplomacyTarget,
} from "./game-ui-diplomacy";
import {
  civ7GameUiFirstMeetResponseAvailable,
  requestCiv7GameUiFirstMeetResponse,
  type Civ7GameUiFirstMeetTarget,
} from "./game-ui-first-meet";
import {
  civ7GameUiGovernmentAvailable,
  requestCiv7GameUiCelebrationChoice,
  requestCiv7GameUiGovernmentChoice,
  type Civ7GameUiGovernmentTarget,
} from "./game-ui-government";
import {
  civ7GameUiUnitTargetActionAvailable,
  requestCiv7GameUiUnitTargetAction,
  type Civ7GameUiUnitTargetActionTarget,
} from "./game-ui-unit-target";
import {
  civ7GameUiUnitCommandAvailable,
  requestCiv7GameUiUnitCommand,
  type Civ7GameUiUnitCommandTarget,
} from "./game-ui-unit-command";
import {
  civ7GameUiStrategyFrontAvailable,
  getCiv7GameUiBattlefieldScan,
  getCiv7GameUiDestinationAnalysis,
  getCiv7GameUiTargetCandidates,
  type Civ7GameUiStrategyFrontTarget,
} from "./game-ui-strategy-front";
import {
  civ7GameUiWorldMapReadsAvailable,
  getCiv7GameUiMapGrid,
  getCiv7GameUiPlotSnapshot,
  type Civ7GameUiMapReadTarget,
} from "./game-ui-map";
import type { Civ7ControlOrpcComponentId } from "./model/primitives";
import type {
  Civ7ControlOrpcDirectControlFacade,
  Civ7ControlOrpcPlayableStatusResult,
} from "./dependencies/direct-control";

type Civ7GameUiNotifications = NonNullable<
  NonNullable<Civ7GameUiNotificationDismissalTarget["Game"]>["Notifications"]
> &
  NonNullable<NonNullable<Civ7GameUiAttentionTarget["Game"]>["Notifications"]>;

type RuntimeProbe<T> = Readonly<{ ok: true; value: T } | { ok: false; error: string }>;

export type Civ7GameUiRuntimeTarget = {
  Civ7IntelligenceBridge?: Civ7IntelligenceBridge;
  EndTurnBlockingTypes?: Civ7GameUiNotificationDismissalTarget["EndTurnBlockingTypes"];
  NotificationModel?: Civ7GameUiNotificationDismissalTarget["NotificationModel"];
  Input?: {
    getActiveContext?: () => number;
  };
  InputContext?: Record<string, number>;
  UI?: {
    isInGame?: () => boolean;
    isInShell?: () => boolean;
    isInLoading?: () => boolean;
    getGameLoadingState?: () => number;
    notifyUIReady?: () => void;
    Player?: Civ7GameUiAttentionTarget["UI"] extends infer UI
      ? UI extends { Player?: infer Player }
        ? Player
        : never
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
  GameInfo?: Civ7GameUiStrategyFrontTarget["GameInfo"];
  Game?: Civ7GameUiProductionTarget["Game"] &
    Civ7GameUiTownFocusTarget["Game"] & {
      Diplomacy?: Civ7GameUiDiplomacyTarget["Game"] extends infer Game
        ? Game extends { Diplomacy?: infer Diplomacy }
          ? Diplomacy
          : never
        : never;
      CityCommands?: (Civ7GameUiPopulationTarget["Game"] extends infer Game
        ? Game extends { CityCommands?: infer Commands }
          ? Commands
          : never
        : never) &
        (Civ7GameUiTownFocusTarget["Game"] extends infer Game
          ? Game extends { CityCommands?: infer Commands }
            ? Commands
            : never
          : never);
      PlayerOperations?: {
        canStart?: (
          playerId: number,
          operationType: unknown,
          args: unknown,
          queue?: boolean
        ) => unknown;
        sendRequest?: (playerId: number, operationType: unknown, args: unknown) => unknown;
      };
      UnitCommands?: {
        canStart?: (
          unitId: Civ7ControlOrpcComponentId,
          operationType: unknown,
          args: Readonly<Record<string, number>>,
          queue?: boolean
        ) => unknown;
        sendRequest?: (
          unitId: Civ7ControlOrpcComponentId,
          operationType: unknown,
          args: Readonly<Record<string, number>>
        ) => unknown;
      };
      UnitOperations?: {
        canStart?: (
          unitId: Civ7ControlOrpcComponentId,
          operationType: unknown,
          args: Readonly<Record<string, number>>,
          queue?: boolean
        ) => unknown;
        sendRequest?: (
          unitId: Civ7ControlOrpcComponentId,
          operationType: unknown,
          args: Readonly<Record<string, number>>
        ) => unknown;
      };
      ProgressionTrees?: Civ7GameUiProgressionTarget["Game"] extends infer Game
        ? Game extends { ProgressionTrees?: infer Trees }
          ? Trees
          : never
        : never;
      turn?: number;
      age?: number;
      maxTurns?: number;
      getTurnDate?: () => string;
      getHash?: () => number;
      Notifications?: Civ7GameUiNotifications;
    };
  CityOperationTypes?: Civ7GameUiProductionTarget["CityOperationTypes"] &
    Civ7GameUiTownFocusTarget["CityOperationTypes"];
  CityOperationsParametersValues?: Civ7GameUiProductionTarget["CityOperationsParametersValues"];
  CityCommandTypes?: Civ7GameUiPopulationTarget["CityCommandTypes"] &
    Civ7GameUiTownFocusTarget["CityCommandTypes"];
  PlayerOperationTypes?: Civ7GameUiPopulationTarget["PlayerOperationTypes"] &
    Civ7GameUiProgressionTarget["PlayerOperationTypes"] &
    Civ7GameUiNarrativeTarget["PlayerOperationTypes"] &
    Civ7GameUiDiplomacyTarget["PlayerOperationTypes"] &
    Civ7GameUiFirstMeetTarget["PlayerOperationTypes"] &
    Civ7GameUiGovernmentTarget["PlayerOperationTypes"];
  ProgressionTreeNodeTypes?: Civ7GameUiProgressionTarget["ProgressionTreeNodeTypes"];
  UnitCommandTypes?: Civ7GameUiUnitTargetActionTarget["UnitCommandTypes"] &
    Civ7GameUiUnitCommandTarget["UnitCommandTypes"];
  UnitOperationMoveModifiers?: Civ7GameUiUnitTargetActionTarget["UnitOperationMoveModifiers"];
  UnitOperationTypes?: Civ7GameUiUnitTargetActionTarget["UnitOperationTypes"];
  NarrativePopupManager?: Civ7GameUiNarrativeTarget["NarrativePopupManager"];
  DiplomacyManager?: Civ7GameUiDiplomacyTarget["DiplomacyManager"];
  LeaderModelManager?: Civ7GameUiDiplomacyTarget["LeaderModelManager"];
  document?: Civ7GameUiNarrativeTarget["document"];
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
    get?: Civ7GameUiPopulationTarget["Players"] extends infer Players
      ? Players extends { get?: infer Fn }
        ? Fn
        : never
      : never;
    getAliveIds?: () => number[];
    getAliveHumanIds?: () => number[];
    getNumAliveHumans?: () => number;
    Cities?: Civ7GameUiStrategyFrontTarget["Players"] extends infer Players
      ? Players extends { Cities?: infer Cities }
        ? Cities
        : never
      : never;
    Units?: Civ7GameUiStrategyFrontTarget["Players"] extends infer Players
      ? Players extends { Units?: infer Units }
        ? Units
        : never
      : never;
  };
  GameplayMap?: {
    getGridWidth?: () => number;
    getGridHeight?: () => number;
    getPlotCount?: () => number;
    getMapSize?: () => number;
    getRandomSeed?: () => number;
    getLocationFromIndex?: Civ7GameUiProductionTarget["GameplayMap"] extends infer Map
      ? Map extends { getLocationFromIndex?: infer Fn }
        ? Fn
        : never
      : never;
    getIndexFromLocation?: Civ7GameUiUnitTargetActionTarget["GameplayMap"] extends infer Map
      ? Map extends { getIndexFromLocation?: infer Fn }
        ? Fn
        : never
      : never;
    getIndexFromXY?: Civ7GameUiUnitTargetActionTarget["GameplayMap"] extends infer Map
      ? Map extends { getIndexFromXY?: infer Fn }
        ? Fn
        : never
      : never;
    isWater?: Civ7GameUiStrategyFrontTarget["GameplayMap"] extends infer Map
      ? Map extends { isWater?: infer Fn }
        ? Fn
        : never
      : never;
  } & Civ7GameUiMapReadTarget["GameplayMap"];
  Visibility?: Civ7GameUiMapReadTarget["Visibility"];
  MapCities?: Civ7GameUiMapReadTarget["MapCities"];
  MapUnits?: Civ7GameUiUnitTargetActionTarget["MapUnits"];
  Units?: Civ7GameUiUnitTargetActionTarget["Units"] & Civ7GameUiStrategyFrontTarget["Units"];
  Cities?: Civ7GameUiProductionTarget["Cities"] & Civ7GameUiStrategyFrontTarget["Cities"];
  InterfaceMode?: Civ7GameUiProductionTarget["InterfaceMode"] &
    Civ7GameUiDiplomacyTarget["InterfaceMode"];
  PlotCursor?: Civ7GameUiProductionTarget["PlotCursor"];
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
  options: Civ7GameUiControllerOptions = {}
): Civ7IntelligenceBridge {
  const target = options.target ?? (globalThis as Civ7GameUiRuntimeTarget);
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
  }>
): Civ7ControllerBridgeContextFactory {
  const directControl = createCiv7GameUiDirectControlFacade(options.target);
  return () => ({
    directControl,
    endpointDefaults: { timeoutMs: options.timeoutMs ?? 1_000 },
    controller: {
      supportedReadProcedures: gameUiSupportedReadProcedures(options.target),
      supportedMutationProcedures: gameUiSupportedMutationProcedures(options.target),
    },
    controllerProof: gameUiControllerMutationProof(options.target) ?? undefined,
  });
}

function createCiv7GameUiDirectControlFacade(
  target: Civ7GameUiRuntimeTarget
): Civ7ControlOrpcDirectControlFacade {
  return {
    requestCiv7ProductionChoice: async (input) =>
      await requestCiv7GameUiProductionChoice(input, target),
    requestCiv7NotificationDismissal: async (input) =>
      await requestCiv7GameUiNotificationDismissal(input, target),
    requestCiv7AdvisorWarningViewed: async () => {
      throw new Error("game-ui advisor warning viewed request is not supported");
    },
    requestCiv7NarrativeChoice: async (input) =>
      await requestCiv7GameUiNarrativeChoice(input, target),
    requestCiv7DiplomacyResponse: async (input) =>
      await requestCiv7GameUiDiplomacyResponse(input, target),
    requestCiv7FirstMeetResponse: async (input) =>
      await requestCiv7GameUiFirstMeetResponse(input, target),
    requestCiv7GovernmentChoice: async (input) =>
      await requestCiv7GameUiGovernmentChoice(input, target),
    requestCiv7CelebrationChoice: async (input) =>
      await requestCiv7GameUiCelebrationChoice(input, target),
    requestCiv7TechnologyChoiceCloseout: async (input) =>
      await requestCiv7GameUiTechnologyChoiceCloseout(input, target),
    requestCiv7CultureChoiceCloseout: async (input) =>
      await requestCiv7GameUiCultureChoiceCloseout(input, target),
    requestCiv7TechnologyTarget: async (input) =>
      await requestCiv7GameUiTechnologyTarget(input, target),
    requestCiv7CultureTarget: async (input) => await requestCiv7GameUiCultureTarget(input, target),
    requestCiv7AttributePurchase: async (input) =>
      await requestCiv7GameUiAttributePurchase(input, target),
    requestCiv7AttributeReviewCloseout: async (input) =>
      await requestCiv7GameUiAttributeReviewCloseout(input, target),
    requestCiv7TraditionChange: async (input) =>
      await requestCiv7GameUiTraditionChange(input, target),
    requestCiv7TraditionReviewCloseout: async (input) =>
      await requestCiv7GameUiTraditionReviewCloseout(input, target),
    requestCiv7TownFocusChange: async (input) =>
      await requestCiv7GameUiTownFocusChange(input, target),
    requestCiv7TownFocusReviewCloseout: async (input) =>
      await requestCiv7GameUiTownFocusReviewCloseout(input, target),
    requestCiv7AssignWorkerPlacement: async (input) =>
      await requestCiv7GameUiAssignWorkerPlacement(input, target),
    requestCiv7ExpandCityPlacement: async (input) =>
      await requestCiv7GameUiExpandCityPlacement(input, target),
    requestCiv7UnitTargetAction: async (input) =>
      await requestCiv7GameUiUnitTargetAction(input, target),
    requestCiv7UnitCommand: async (input) => await requestCiv7GameUiUnitCommand(input, target),
    requestCiv7TurnComplete: async () => await requestCiv7GameUiTurnComplete(target),
    getCiv7PlayableStatus: async () => gameUiPlayableStatus(target),
    getCiv7PlayNotificationView: async (options) =>
      await getCiv7GameUiPlayNotificationView(
        {
          maxNotifications: options?.maxNotifications,
        },
        target
      ),
    getCiv7ProgressDashboard: async () => {
      throw new Error("game-ui progress dashboard is not supported");
    },
    getCiv7TraditionsView: async () => {
      throw new Error("game-ui traditions view is not supported");
    },
    getCiv7BattlefieldScan: async (input) => await getCiv7GameUiBattlefieldScan(input, target),
    getCiv7DestinationAnalysis: async (input) =>
      await getCiv7GameUiDestinationAnalysis(input, target),
    getCiv7PlotSnapshot: async (input) => await getCiv7GameUiPlotSnapshot(input, target),
    getCiv7MapGrid: async (input) => await getCiv7GameUiMapGrid(input, target),
    getCiv7ReadyUnitView: async (input) => await getCiv7GameUiReadyUnitView(input, target),
    getCiv7ReadyCityView: async (input) => await getCiv7GameUiReadyCityView(input, target),
    getCiv7SettlementRecommendations: async () => {
      throw new Error("game-ui settlement recommendations are not supported");
    },
    getCiv7TargetCandidates: async (input) => await getCiv7GameUiTargetCandidates(input, target),
    getCiv7TurnCompletionStatus: async () => await getCiv7GameUiTurnCompletionStatus(target),
    getCiv7VisibilitySummary: async () => {
      throw new Error("game-ui visibility summary is not supported");
    },
    readCiv7DisplayQueue: async () => {
      throw new Error("game-ui display queue read is not supported");
    },
    closeCiv7Displays: async () => {
      throw new Error("game-ui display close is not supported");
    },
    suspendCiv7DisplayQueue: async () => {
      throw new Error("game-ui display queue suspend is not supported");
    },
    resumeCiv7DisplayQueue: async () => {
      throw new Error("game-ui display queue resume is not supported");
    },
    applyCiv7ExploreGrant: async () => {
      throw new Error("game-ui explore grant is not supported");
    },
    releaseCiv7ExploreGrant: async () => {
      throw new Error("game-ui explore grant release is not supported");
    },
    focusCiv7Camera: async () => {
      throw new Error("game-ui camera focus is not supported");
    },
    enterCiv7CleanFrame: async () => {
      throw new Error("game-ui clean-frame enter is not supported");
    },
    exitCiv7CleanFrame: async () => {
      throw new Error("game-ui clean-frame exit is not supported");
    },
    captureCiv7WindowShot: async () => {
      throw new Error("game-ui window-shot capture is not supported");
    },
  };
}

function gameUiPlayableStatus(
  target: Civ7GameUiRuntimeTarget
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

function gameUiSupportedMutationProcedures(target: Civ7GameUiRuntimeTarget): readonly string[] {
  if (gameUiControllerMutationProof(target) == null) return [];
  const supported: string[] = [];
  if (gameUiNotificationDismissalAvailable(target)) {
    supported.push("notifications.dismiss.request");
  }
  if (civ7GameUiProductionChoiceAvailable(target)) {
    supported.push("city.production.choice.request");
  }
  if (civ7GameUiPopulationPlacementAvailable(target)) {
    supported.push("city.population.place.request");
  }
  if (civ7GameUiTownFocusAvailable(target)) {
    supported.push("city.townFocus.change.request", "city.townFocus.review.request");
  }
  if (gameUiTurnCompletionAvailable(target)) {
    supported.push("turn.complete.request");
  }
  if (civ7GameUiProgressionChoiceAvailable(target)) {
    supported.push("progression.technology.choice.request", "progression.culture.choice.request");
  }
  if (civ7GameUiProgressionRequestAvailable(target)) {
    supported.push(
      "progression.technology.target.request",
      "progression.culture.target.request",
      "progression.attribute.purchase.request",
      "progression.attribute.review.request",
      "progression.tradition.change.request",
      "progression.tradition.review.request"
    );
  }
  if (civ7GameUiNarrativeChoiceAvailable(target)) {
    supported.push("narrative.choice.request");
  }
  if (civ7GameUiDiplomacyResponseAvailable(target)) {
    supported.push("diplomacy.response.request");
  }
  if (civ7GameUiFirstMeetResponseAvailable(target)) {
    supported.push("diplomacy.firstMeet.response.request");
  }
  if (civ7GameUiGovernmentAvailable(target)) {
    supported.push("government.choice.request", "government.celebration.choice.request");
  }
  if (civ7GameUiUnitTargetActionAvailable(target)) {
    supported.push("unit.target.action.request");
  }
  if (civ7GameUiUnitCommandAvailable(target)) {
    supported.push("unit.upgrade.request", "unit.resettle.request");
  }
  return supported;
}

function gameUiSupportedReadProcedures(target: Civ7GameUiRuntimeTarget): readonly string[] {
  if (gameUiControllerMutationProof(target) == null) {
    return [];
  }
  const supported: string[] = [];
  if (gameUiAttentionReadAvailable(target)) {
    supported.push("attention.current");
  }
  if (civ7GameUiStrategyFrontAvailable(target)) {
    supported.push("strategy.frontSummary");
  }
  if (gameUiWorldCurrentAvailable(target)) {
    supported.push("world.current");
  }
  if (civ7GameUiWorldMapReadsAvailable(target)) {
    supported.push("world.plot.read", "world.grid.read");
  }
  return supported;
}

function gameUiNotificationDismissalAvailable(target: Civ7GameUiRuntimeTarget): boolean {
  const notifications = target.Game?.Notifications;
  const manager = target.NotificationModel?.manager;
  return (
    typeof notifications?.find === "function" &&
    (typeof notifications.dismiss === "function" ||
      typeof manager?.dismiss === "function" ||
      typeof manager?.onDismiss === "function")
  );
}

function gameUiAttentionReadAvailable(target: Civ7GameUiRuntimeTarget): boolean {
  return (
    typeof target.Game?.Notifications?.getIdsForPlayer === "function" &&
    typeof target.Game?.Notifications?.find === "function" &&
    typeof target.UI?.Player?.getFirstReadyUnit === "function" &&
    isControllerPlayerId(target.GameContext?.localPlayerID)
  );
}

function gameUiWorldCurrentAvailable(target: Civ7GameUiRuntimeTarget): boolean {
  return (
    typeof target.UI?.isInGame === "function" &&
    typeof target.GameplayMap?.getGridWidth === "function" &&
    typeof target.GameplayMap?.getGridHeight === "function" &&
    typeof target.Game?.getTurnDate === "function" &&
    typeof target.Players?.getAliveIds === "function" &&
    typeof target.Players?.getAliveHumanIds === "function" &&
    typeof target.Players?.getNumAliveHumans === "function" &&
    isControllerPlayerId(target.GameContext?.localPlayerID)
  );
}

function gameUiTurnCompletionAvailable(target: Civ7GameUiRuntimeTarget): boolean {
  return (
    gameUiAttentionReadAvailable(target) &&
    typeof target.GameContext?.hasSentTurnComplete === "function" &&
    typeof target.GameContext?.sendTurnComplete === "function" &&
    typeof target.canEndTurn === "function" &&
    typeof target.Game?.getTurnDate === "function" &&
    typeof target.Game?.Notifications?.getEndTurnBlockingType === "function"
  );
}

function gameUiSnapshot(target: Civ7GameUiRuntimeTarget) {
  return {
    network: {
      isInSession: ok(Boolean(target.Network?.isInSession)),
      numPlayers: probe(() => target.Network?.getNumPlayers?.() ?? 0),
      hostPlayerId: probe(() => target.Network?.getHostPlayerId?.() ?? -1),
      isConnectedToNetwork: probe(() => target.Network?.isConnectedToNetwork?.() ?? false),
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
      skipStartButton: probe(() => target.Configuration?.getGame?.().skipStartButton ?? false),
      automationActive: ok(false),
      activeInputContext: probe(() => {
        const context = target.Input?.getActiveContext?.();
        if (context === undefined) throw new Error("Input.getActiveContext unavailable");
        return context;
      }),
      activeInputContextName: (() => {
        try {
          const context = target.Input?.getActiveContext?.();
          if (context === undefined) return null;
          return (
            Object.entries(target.InputContext ?? {}).find(([, value]) => value === context)?.[0] ??
            null
          );
        } catch {
          return null;
        }
      })(),
    },
    gameContext: {
      localPlayerID: target.GameContext?.localPlayerID ?? -1,
      localObserverID: target.GameContext?.localObserverID ?? -1,
      hasRequestedPause: probe(() => target.GameContext?.hasRequestedPause?.() ?? false),
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
  target: Civ7GameUiRuntimeTarget
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

function isSingleLocalHuman(target: Civ7GameUiRuntimeTarget, localPlayerId: number): boolean {
  const aliveHumanIds = probe(() => target.Players?.getAliveHumanIds?.());
  if (aliveHumanIds.ok && Array.isArray(aliveHumanIds.value)) {
    return aliveHumanIds.value.length === 1 && aliveHumanIds.value[0] === localPlayerId;
  }

  const aliveHumanCount = probe(() => target.Players?.getNumAliveHumans?.());
  return aliveHumanCount.ok && aliveHumanCount.value === 1;
}

function isControllerPlayerId(playerId: unknown): playerId is number {
  return (
    typeof playerId === "number" && Number.isInteger(playerId) && playerId >= 0 && playerId <= 255
  );
}

function canBeginGame(target: Civ7GameUiRuntimeTarget): RuntimeProbe<boolean> {
  return probe(() => {
    const loadingState = target.UI?.getGameLoadingState?.();
    if (loadingState == null) return false;
    const states = target.UIGameLoadingState ?? {};
    return loadingState === states.WaitingForUIReady || loadingState === states.WaitingToStart;
  });
}

function loadingStateName(target: Civ7GameUiRuntimeTarget): string | null {
  const loadingState = target.UI?.getGameLoadingState?.();
  if (loadingState == null) return null;
  return (
    Object.entries(target.UIGameLoadingState ?? {}).find(
      ([, value]) => value === loadingState
    )?.[0] ?? null
  );
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
