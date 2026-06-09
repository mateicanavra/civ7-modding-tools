import { Civ7DirectControlError } from "../direct-control-error.js";
import { executeCiv7AppUiCommand } from "../session/execute.js";

import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
} from "../session/types.js";
import { probeHelperSource, type Civ7RuntimeProbe } from "./probe.js";

export type Civ7AppUiSnapshot = Readonly<{
  network: Readonly<{
    isInSession: Civ7RuntimeProbe<boolean>;
    numPlayers: Civ7RuntimeProbe<number>;
    hostPlayerId: Civ7RuntimeProbe<number>;
    isConnectedToNetwork: Civ7RuntimeProbe<boolean>;
    isAuthenticated: Civ7RuntimeProbe<boolean>;
    isLoggedIn: Civ7RuntimeProbe<boolean>;
  }>;
  autoplay: Readonly<{
    isActive: boolean;
    turns: number;
    isPaused: boolean;
    isPausedOrPending: boolean;
    observeAsPlayer: number;
    returnAsPlayer: number;
  }>;
  game: Readonly<{
    turn: number;
    age: number;
    maxTurns: number;
    turnDate: Civ7RuntimeProbe<string>;
    hash: Civ7RuntimeProbe<number>;
  }>;
  ui: Readonly<{
    inGame: Civ7RuntimeProbe<boolean>;
    inShell: Civ7RuntimeProbe<boolean>;
    inLoading: Civ7RuntimeProbe<boolean>;
    loadingState: Civ7RuntimeProbe<number>;
    loadingStateName: string | null;
    canBeginGame: Civ7RuntimeProbe<boolean>;
    canNotifyUIReady: string;
    skipStartButton: Civ7RuntimeProbe<boolean>;
    automationActive: Civ7RuntimeProbe<boolean>;
  }>;
  gameContext: Readonly<{
    localPlayerID: number;
    localObserverID: number;
    hasRequestedPause: Civ7RuntimeProbe<boolean>;
  }>;
  players: Readonly<{
    maxPlayers: number;
    aliveIds: Civ7RuntimeProbe<ReadonlyArray<number>>;
    aliveHumanIds: Civ7RuntimeProbe<ReadonlyArray<number>>;
    numAliveHumans: Civ7RuntimeProbe<number>;
  }>;
  map: Readonly<{
    width: Civ7RuntimeProbe<number>;
    height: Civ7RuntimeProbe<number>;
    plotCount: Civ7RuntimeProbe<number>;
    mapSize: Civ7RuntimeProbe<number>;
    randomSeed: Civ7RuntimeProbe<number>;
  }>;
}>;

export type Civ7AppUiSnapshotResult = Readonly<{
  host: string;
  port: number;
  state: Civ7CommandResult["state"];
  snapshot: Civ7AppUiSnapshot;
}>;

type AppUiSnapshotDependencies = Readonly<{
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
}>;

export async function getCiv7AppUiSnapshot(
  options: Civ7DirectControlOptions = {},
  dependencies: AppUiSnapshotDependencies = defaultAppUiSnapshotDependencies,
): Promise<Civ7AppUiSnapshotResult> {
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildAppUiSnapshotCommand(),
  });
  return appUiSnapshotFromCommandResult(result);
}

const defaultAppUiSnapshotDependencies: AppUiSnapshotDependencies = {
  executeAppUiCommand: executeCiv7AppUiCommand,
};

export function buildAppUiSnapshotCommand(): string {
  return `(() => {
    const g = globalThis;
    ${probeHelperSource()}
    const probeValueOr = (fallback, fn) => {
      const result = probe(fn);
      return result.ok ? result.value : fallback;
    };
    return JSON.stringify({
      network: {
        isInSession: probe(() => g.Network.isInSession),
        numPlayers: probe(() => g.Network.getNumPlayers()),
        hostPlayerId: probe(() => g.Network.getHostPlayerId()),
        isConnectedToNetwork: probe(() => g.Network.isConnectedToNetwork()),
        isAuthenticated: probe(() => g.Network.isAuthenticated()),
        isLoggedIn: probe(() => g.Network.isLoggedIn()),
      },
      autoplay: {
        isActive: probeValueOr(false, () => typeof g.Autoplay !== "undefined" ? g.Autoplay.isActive : false),
        turns: probeValueOr(0, () => typeof g.Autoplay !== "undefined" ? g.Autoplay.turns : 0),
        isPaused: probeValueOr(false, () => typeof g.Autoplay !== "undefined" ? g.Autoplay.isPaused : false),
        isPausedOrPending: probeValueOr(false, () => typeof g.Autoplay !== "undefined" ? g.Autoplay.isPausedOrPending : false),
        observeAsPlayer: probeValueOr(-1, () => typeof g.Autoplay !== "undefined" ? g.Autoplay.observeAsPlayer : -1),
        returnAsPlayer: probeValueOr(-1, () => typeof g.Autoplay !== "undefined" ? g.Autoplay.returnAsPlayer : -1),
      },
      game: {
        turn: probeValueOr(-1, () => g.Game.turn),
        age: probeValueOr(-1, () => g.Game.age),
        maxTurns: probeValueOr(0, () => g.Game.maxTurns),
        turnDate: probe(() => g.Game.getTurnDate()),
        hash: probe(() => g.Game.getHash()),
      },
      ui: {
        inGame: probe(() => g.UI.isInGame()),
        inShell: probe(() => g.UI.isInShell()),
        inLoading: probe(() => g.UI.isInLoading()),
        loadingState: probe(() => g.UI.getGameLoadingState()),
        loadingStateName: (() => {
          try {
            const state = g.UI.getGameLoadingState();
            return Object.entries(g.UIGameLoadingState).find(([, value]) => value === state)?.[0] ?? null;
          } catch {
            return null;
          }
        })(),
        canBeginGame: probe(() => {
          const state = g.UI.getGameLoadingState();
          return state === g.UIGameLoadingState.WaitingForUIReady || state === g.UIGameLoadingState.WaitingToStart;
        }),
        canNotifyUIReady: typeof g.UI?.notifyUIReady,
        skipStartButton: probe(() => g.Configuration.getGame().skipStartButton),
        automationActive: probe(() => typeof g.Automation !== "undefined" ? g.Automation.isActive : false),
      },
      gameContext: {
        localPlayerID: probeValueOr(-1, () => g.GameContext.localPlayerID),
        localObserverID: probeValueOr(-1, () => g.GameContext.localObserverID),
        hasRequestedPause: probe(() => g.GameContext.hasRequestedPause()),
      },
      players: {
        maxPlayers: probeValueOr(0, () => g.Players.maxPlayers),
        aliveIds: probe(() => g.Players.getAliveIds()),
        aliveHumanIds: probe(() => g.Players.getAliveHumanIds()),
        numAliveHumans: probe(() => g.Players.getNumAliveHumans()),
      },
      map: {
        width: probe(() => g.GameplayMap.getGridWidth()),
        height: probe(() => g.GameplayMap.getGridHeight()),
        plotCount: probe(() => g.GameplayMap.getPlotCount()),
        mapSize: probe(() => g.GameplayMap.getMapSize()),
        randomSeed: probe(() => g.GameplayMap.getRandomSeed()),
      },
    });
  })()`;
}

export function appUiSnapshotFromCommandResult(result: Civ7CommandResult): Civ7AppUiSnapshotResult {
  try {
    return {
      host: result.host,
      port: result.port,
      state: result.state,
      snapshot: JSON.parse(result.output[0] ?? "{}") as Civ7AppUiSnapshot,
    };
  } catch (err) {
    throw new Civ7DirectControlError(
      "command-failed",
      `Civ7 App UI snapshot returned invalid JSON: ${result.output.join("\n") || "<empty>"}`,
      { cause: err, details: result },
    );
  }
}
