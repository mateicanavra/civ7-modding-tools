import { open, readdir, readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, extname, join, resolve } from "node:path";
import { Socket, createConnection } from "node:net";
import { Type, type Static } from "typebox";
import { Value } from "typebox/value";
import {
  assertCiv7ComponentId,
  Civ7ComponentIdSchema,
  type Civ7ComponentId,
  isCiv7ComponentId,
} from "./civ7-component-id.js";
import { Civ7DirectControlError, type Civ7DirectControlErrorCode } from "./direct-control-error.js";
import {
  CIV7_SIGNED_INT_SEED_MAX,
  CIV7_SIGNED_INT_SEED_MIN,
  assessCiv7SignedIntSeed,
} from "./policy/setup.js";
import {
  encodeCiv7TunerRequest,
  parseCiv7TunerFrame,
  type Civ7TunerFrame,
} from "./session/framing.js";
import { progressDashboardSource } from "./play/progression/progress-dashboard.js";
import { readyCityViewSource } from "./play/ready/city.js";
import { unitMovePreviewSource } from "./play/ready/move-preview.js";
import { readyUnitViewSource } from "./play/ready/unit.js";
import { battlefieldScanSource } from "./play/tactical/battlefield.js";
import { destinationAnalysisSource } from "./play/tactical/destination.js";
import { settlementRecommendationsSource } from "./play/tactical/settlement.js";
import { targetCandidatesSource } from "./play/tactical/target-candidates.js";
import { traditionsViewSource } from "./play/progression/traditions.js";

export {
  assertCiv7ComponentId,
  Civ7ComponentIdSchema,
  isCiv7ComponentId,
} from "./civ7-component-id.js";
export type { Civ7ComponentId } from "./civ7-component-id.js";
export { Civ7DirectControlError } from "./direct-control-error.js";
export type { Civ7DirectControlErrorCode } from "./direct-control-error.js";
export {
  encodeCiv7TunerRequest,
  parseCiv7TunerFrame,
} from "./session/framing.js";
export type { Civ7TunerFrame } from "./session/framing.js";

export const DEFAULT_CIV7_TUNER_HOST = "127.0.0.1";
export const DEFAULT_CIV7_TUNER_PORT = 4318;
export const DEFAULT_CIV7_TUNER_TIMEOUT_MS = 10_000;
export const DEFAULT_CIV7_TUNER_STATE_NAME = "App UI";
export const CIV7_TUNER_APP_UI_STATE_NAME = "App UI";
export const CIV7_TUNER_STATE_NAME = "Tuner";
export const CIV7_RESTART_COMMAND = "Network.restartGame()";
export const CIV7_BEGIN_GAME_COMMAND = "UI.notifyUIReady()";
export const CIV7_EXIT_TO_MAIN_MENU_COMMAND = 'engine.call("exitToMainMenu")';
export const CIV7_RELOAD_UI_COMMAND = "UI.reloadUI()";
export { CIV7_SIGNED_INT_SEED_MAX, CIV7_SIGNED_INT_SEED_MIN, assessCiv7SignedIntSeed } from "./policy/setup.js";
export const CIV7_UI_LOADING_STATES = {
  NotStarted: 0,
  WaitingForGameplayData: 1,
  WaitingForLoadingCurtain: 2,
  WaitingForConfiguration: 3,
  WaitingForGameCore: 4,
  WaitingForVisualization: 5,
  WaitingForUIReady: 6,
  WaitingToStart: 7,
  GameStarted: 8,
  WaitingForGameUnloadScreenReady: 9,
} as const;
export const DEFAULT_CIV7_APP_UI_API_ROOTS = [
  "Network",
  "Configuration",
  "GameSetup",
  "Autoplay",
  "Game",
  "UI",
  "GameContext",
  "PlayerIds",
  "Players",
  "GameplayMap",
] as const;
export const DEFAULT_CIV7_TUNER_API_ROOTS = [
  "Game",
  "Autoplay",
  "Players",
  "GameplayMap",
  "ResourceBuilder",
  "GameInfo",
  "PlayerIds",
] as const;
export const DEFAULT_CIV7_CAPABILITY_APP_UI_ROOTS = [
  "Network",
  "Configuration",
  "GameSetup",
  "Autoplay",
  "Game",
  "UI",
  "GameContext",
  "PlayerIds",
  "Players",
  "GameplayMap",
  "GameInfo",
  "Database",
] as const;
export const DEFAULT_CIV7_CAPABILITY_TUNER_ROOTS = [
  "Autoplay",
  "Game",
  "GameplayMap",
  "Players",
  "Units",
  "Cities",
  "MapUnits",
  "MapCities",
  "Visibility",
  "ResourceBuilder",
  "GameInfo",
  "Database",
  "UnitOperationTypes",
  "UnitCommandTypes",
  "CityOperationTypes",
  "CityCommandTypes",
  "PlayerOperationTypes",
] as const;
export const DEFAULT_CIV7_GAMEINFO_TABLES = [
  "Resources",
  "Terrains",
  "Biomes",
  "Features",
  "Units",
  "UnitOperations",
  "UnitCommands",
  "Cities",
  "CityOperations",
  "CityCommands",
  "PlayerOperations",
  "Maps",
  "MapSizes",
] as const;
export const DEFAULT_CIV7_SETUP_PARAMETER_IDS = [
  "Ruleset",
  "Age",
  "Difficulty",
  "DifficultyIndependentsCombat",
  "DifficultyCombat",
  "DifficultyArmyXP",
  "DifficultyUnitProduction",
  "DifficultyBuildingProduction",
  "DifficultyFreeStuff",
  "DifficultyGold",
  "DifficultyScience",
  "DifficultyCulture",
  "DifficultyHappiness",
  "DifficultyTechCost",
  "DifficultyCivicCost",
  "DifficultyOceanDamage",
  "AgeLength",
  "AgeCountdownTimer",
  "AgeTransitionSetting",
  "IndependentHostility",
  "NoCivUnlocks",
  "Map",
  "MapSize",
  "MapRandomSeed",
  "GameRandomSeed",
  "GameSpeeds",
  "StartPosition",
  "TurnLimit",
  "MaxTurns",
  "DisasterIntensity",
  "Crises",
  "EnableScoreVictory",
  "LegacyPaths",
] as const;
export const DEFAULT_CIV7_PLAYER_SETUP_PARAMETER_IDS = [
  "PlayerCivilization",
  "PlayerLeader",
  "PlayerDifficulty",
] as const;
export const DEFAULT_CIV7_MAP_GRID_MAX_PLOTS = 512;
export const HARD_CIV7_MAP_GRID_MAX_PLOTS = 10_000;
export const DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS = 256;
export const HARD_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS = 1_000;
export const DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL = 64;
export const HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL = 256;
export const DEFAULT_CIV7_FEATURE_FEASIBILITY_MAX_CELLS = 256;
export const HARD_CIV7_FEATURE_FEASIBILITY_MAX_CELLS = 1_000;
export const DEFAULT_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL = 64;
export const HARD_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL = 256;
export const DEFAULT_CIV7_GAMEINFO_LIMIT = 100;
export const HARD_CIV7_GAMEINFO_LIMIT = 1_000;
export const DEFAULT_CIV7_ROOT_MAX_KEYS = 100;
export const DEFAULT_CIV7_ROOT_MAX_METHODS = 100;
export const DEFAULT_CIV7_AUTOPLAY_MAX_TURNS = 50;
export const DEFAULT_CIV7_AUTOPLAY_WAIT_MS = 5_000;
export const DEFAULT_CIV7_AUTOPLAY_STOP_WAIT_MS = 30_000;
export const DEFAULT_CIV7_AUTOPLAY_POLL_INTERVAL_MS = 250;
export const DEFAULT_CIV7_AUTOPLAY_STOP_STABILITY_MS = 10_000;
export const DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_WAIT_MS = 1_500;
export const DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_POLL_INTERVAL_MS = 250;
export const DEFAULT_CIV7_SCRIPTING_LOG = join(
  homedir(),
  "Library",
  "Application Support",
  "Civilization VII",
  "Logs",
  "Scripting.log",
);
export const DEFAULT_CIV7_SINGLE_PLAYER_SAVE_DIR = join(
  homedir(),
  "Library",
  "Application Support",
  "Civilization VII",
  "Saves",
  "Single",
);

export type Civ7TunerState = Readonly<{
  id: string;
  name: string;
}>;

export type Civ7TunerStateRole = "app-ui" | "tuner";

export type Civ7TunerStateSelection =
  | string
  | Readonly<{
      id?: string;
      name?: string;
      role?: Civ7TunerStateRole;
    }>;

export type Civ7DirectControlEndpoint = Readonly<{
  host: string;
  port: number;
}>;

export type Civ7DirectControlOptions = Readonly<{
  host?: string;
  hosts?: ReadonlyArray<string>;
  port?: number;
  timeoutMs?: number;
  env?: NodeJS.ProcessEnv;
}>;

export type Civ7UiLoadingStateName = keyof typeof CIV7_UI_LOADING_STATES;

export type Civ7CommandResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  output: ReadonlyArray<string>;
}>;

export type Civ7RuntimeApiRoot = Readonly<{
  name: string;
  type: string;
  exists: boolean;
  ownKeys: ReadonlyArray<string>;
  prototypeKeys: ReadonlyArray<string>;
  enumerableKeys: ReadonlyArray<string>;
  methods: ReadonlyArray<Civ7RuntimeApiMethod>;
  error?: string;
}>;

export type Civ7RuntimeApiMethod = Readonly<{
  name: string;
  owner: "own" | "prototype";
  length: number;
  signature: string;
  error?: string;
}>;

export type Civ7RuntimeApiInspection = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  roots: ReadonlyArray<Civ7RuntimeApiRoot>;
}>;

export type Civ7RuntimeProbe<T> = Readonly<
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: string;
    }
>;

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
  state: Civ7TunerState;
  snapshot: Civ7AppUiSnapshot;
}>;

export type Civ7TunerHealthSnapshot = Readonly<{
  evalOk: number;
  ready: boolean;
  globals: Readonly<{
    Game: string;
    Autoplay: string;
    GameplayMap: string;
    Players: string;
    Network: string;
  }>;
  turn: Civ7RuntimeProbe<number>;
  turnDate: Civ7RuntimeProbe<string>;
  width: Civ7RuntimeProbe<number>;
  height: Civ7RuntimeProbe<number>;
  aliveIds: Civ7RuntimeProbe<ReadonlyArray<number>>;
  aliveHumanIds: Civ7RuntimeProbe<ReadonlyArray<number>>;
  autoplayActive: Civ7RuntimeProbe<boolean>;
}>;

export type Civ7TunerHealthResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  ready: boolean;
  snapshot: Civ7TunerHealthSnapshot;
}>;

export type Civ7MapLocation = Readonly<{
  x: number;
  y: number;
}>;

export type Civ7MapBounds = Readonly<Civ7MapLocation & {
  width: number;
  height: number;
}>;

export type Civ7HiddenInfoPolicy = "include-hidden" | "visibility-filtered" | "not-player-scoped";

export type Civ7PlayableStatusResult = Readonly<{
  host: string;
  port: number;
  playable: boolean;
  readiness:
    | "tuner-ready"
    | "app-ui-game"
    | "begin-ready"
    | "loading"
    | "shell"
    | "unavailable";
  appUi: Civ7AppUiSnapshotResult;
  tuner?: Civ7TunerHealthResult;
  errors: ReadonlyArray<string>;
}>;

export type Civ7MapSummaryOptions = Civ7DirectControlOptions & Readonly<{
  state?: Civ7TunerStateSelection;
  includeAreaRegionCounts?: boolean;
  maxIds?: number;
}>;

export type Civ7MapSummaryResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  map: Readonly<{
    width: Civ7RuntimeProbe<number>;
    height: Civ7RuntimeProbe<number>;
    plotCount: Civ7RuntimeProbe<number>;
    mapSize: Civ7RuntimeProbe<number | string>;
    randomSeed: Civ7RuntimeProbe<number>;
  }>;
  game: Readonly<{
    turn: Civ7RuntimeProbe<number>;
    age: Civ7RuntimeProbe<number>;
    maxTurns: Civ7RuntimeProbe<number>;
    turnDate: Civ7RuntimeProbe<string>;
    hash: Civ7RuntimeProbe<number>;
  }>;
  areas?: Readonly<{
    areaIds: Civ7RuntimeProbe<ReadonlyArray<number>>;
    regionIds: Civ7RuntimeProbe<ReadonlyArray<number>>;
    truncated: boolean;
  }>;
}>;

export type Civ7PlotSnapshotField =
  | "terrain"
  | "biome"
  | "feature"
  | "resource"
  | "climate"
  | "hydrology"
  | "yields"
  | "owner"
  | "visibility"
  | "areaRegion"
  | "tags"
  | "city"
  | "units";

export type Civ7PlotSnapshotInput = Readonly<Civ7MapLocation & {
  playerId?: number;
  fields?: ReadonlyArray<Civ7PlotSnapshotField>;
  includeHidden?: boolean;
}>;

export type Civ7PlotSnapshot = Readonly<{
  location: Readonly<Civ7MapLocation & {
    index: Civ7RuntimeProbe<number>;
  }>;
  revealedState?: Civ7RuntimeProbe<number | string>;
  visible?: Civ7RuntimeProbe<boolean>;
  hiddenInfoPolicy: Civ7HiddenInfoPolicy;
  facts: Readonly<Record<string, Civ7RuntimeProbe<unknown>>>;
}>;

export type Civ7PlotSnapshotResult = Civ7PlotSnapshot & Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
}>;

export type Civ7MapGridInput = Readonly<{
  bounds?: Civ7MapBounds;
  locations?: ReadonlyArray<Civ7MapLocation>;
  fields: ReadonlyArray<Civ7PlotSnapshotField>;
  playerId?: number;
  includeHidden?: boolean;
  maxPlots?: number;
}>;

export type Civ7MapGridResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  bounds?: Civ7MapBounds;
  fields: ReadonlyArray<Civ7PlotSnapshotField>;
  plotCount: number;
  omitted: number;
  hiddenInfoPolicy: Civ7HiddenInfoPolicy;
  plots: ReadonlyArray<Civ7PlotSnapshot>;
}>;

export type Civ7MapGridReadChunk = Readonly<{
  bounds: Civ7MapBounds;
  plotCount: number;
  omitted: number;
}>;

export type Civ7ResourcePlacementFeasibilityCellInput = Readonly<Civ7MapLocation & {
  resourceTypes: ReadonlyArray<number>;
}>;

export type Civ7ResourcePlacementFeasibilityInput = Readonly<{
  cells: ReadonlyArray<Civ7ResourcePlacementFeasibilityCellInput>;
  maxCells?: number;
  maxResourceTypesPerCell?: number;
  ignoreWeight?: boolean;
}>;

export type Civ7ResourcePlacementFeasibilityCell = Readonly<{
  location: Readonly<Civ7MapLocation & {
    index: Civ7RuntimeProbe<number>;
  }>;
  resourceTypes: ReadonlyArray<number>;
  omittedResourceTypes: number;
  feasibility: Readonly<Record<string, Civ7RuntimeProbe<boolean>>>;
}>;

export type Civ7ResourcePlacementFeasibilityResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  cellCount: number;
  omittedCells: number;
  ignoreWeight: boolean;
  cells: ReadonlyArray<Civ7ResourcePlacementFeasibilityCell>;
}>;

export type Civ7FeaturePlacementFeasibilityCellInput = Readonly<Civ7MapLocation & {
  featureTypes: ReadonlyArray<number>;
}>;

export type Civ7FeaturePlacementFeasibilityInput = Readonly<{
  cells: ReadonlyArray<Civ7FeaturePlacementFeasibilityCellInput>;
  maxCells?: number;
  maxFeatureTypesPerCell?: number;
}>;

export type Civ7FeaturePlacementFeasibilityCell = Readonly<{
  location: Readonly<Civ7MapLocation & {
    index: Civ7RuntimeProbe<number>;
  }>;
  featureTypes: ReadonlyArray<number>;
  omittedFeatureTypes: number;
  feasibility: Readonly<Record<string, Civ7RuntimeProbe<boolean>>>;
}>;

export type Civ7FeaturePlacementFeasibilityResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  cellCount: number;
  omittedCells: number;
  cells: ReadonlyArray<Civ7FeaturePlacementFeasibilityCell>;
}>;

export type Civ7ResourceBuilderCutResource = Readonly<{
  hash: number;
  resourceType?: number;
  resourceTypeName?: string;
  row?: unknown;
}>;

export type Civ7ResourceBuilderDiagnosticsResource = Readonly<{
  resourceType: number;
  row: Civ7RuntimeProbe<unknown>;
  hash: Civ7RuntimeProbe<number>;
  count: Civ7RuntimeProbe<number>;
  landmass: Civ7RuntimeProbe<number>;
  validForAge: Civ7RuntimeProbe<boolean>;
  requiredForAge: Civ7RuntimeProbe<boolean>;
  ignoringWeightForRiverPlacement: Civ7RuntimeProbe<boolean>;
}>;

export type Civ7ResourceBuilderDiagnosticsCellResource = Readonly<{
  canHaveResource: Readonly<{
    strict: Civ7RuntimeProbe<boolean>;
    ignoreWeight: Civ7RuntimeProbe<boolean>;
  }>;
  resourceLandmassAtCell: Civ7RuntimeProbe<number>;
  bestMapResourceCutHashes: Civ7RuntimeProbe<ReadonlyArray<number>>;
  bestMapResourceCuts: Civ7RuntimeProbe<ReadonlyArray<Civ7ResourceBuilderCutResource>>;
}>;

export type Civ7ResourceBuilderDiagnosticsCell = Readonly<{
  location: Readonly<Civ7MapLocation & {
    index: Civ7RuntimeProbe<number>;
  }>;
  resourceTypes: ReadonlyArray<number>;
  omittedResourceTypes: number;
  resources: Readonly<Record<string, Civ7ResourceBuilderDiagnosticsCellResource>>;
}>;

export type Civ7ResourceBuilderDiagnosticsInput = Readonly<{
  cells: ReadonlyArray<Civ7ResourcePlacementFeasibilityCellInput>;
  resourceTypes?: ReadonlyArray<number>;
  maxCells?: number;
  maxResourceTypesPerCell?: number;
}>;

export type Civ7ResourceBuilderDiagnosticsResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  cellCount: number;
  omittedCells: number;
  resources: ReadonlyArray<Civ7ResourceBuilderDiagnosticsResource>;
  cells: ReadonlyArray<Civ7ResourceBuilderDiagnosticsCell>;
}>;

export type Civ7FullMapGridIdentityCheck = Readonly<{
  stable: boolean;
  checked: ReadonlyArray<string>;
}>;

export type Civ7FullMapGridInput = Readonly<{
  bounds?: Civ7MapBounds;
  fields: ReadonlyArray<Civ7PlotSnapshotField>;
  playerId?: number;
  includeHidden?: boolean;
  maxPlotsPerRead?: number;
}>;

export type Civ7FullMapGridResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  bounds: Civ7MapBounds;
  fields: ReadonlyArray<Civ7PlotSnapshotField>;
  plotCount: number;
  omitted: number;
  hiddenInfoPolicy: Civ7HiddenInfoPolicy;
  map: Readonly<{ width: number; height: number }>;
  summary: Civ7MapSummaryResult;
  postReadSummary: Civ7MapSummaryResult;
  identityCheck: Civ7FullMapGridIdentityCheck;
  chunks: ReadonlyArray<Civ7MapGridReadChunk>;
  plots: ReadonlyArray<Civ7PlotSnapshot>;
}>;

export type Civ7PlayerSummaryInput = Readonly<{
  playerIds?: ReadonlyArray<number>;
  includeUnits?: boolean;
  includeCities?: boolean;
  maxItems?: number;
}>;

export type Civ7PlayerSummary = Readonly<{
  id: number;
  leaderName: Civ7RuntimeProbe<string>;
  civilizationName: Civ7RuntimeProbe<string>;
  isHuman: Civ7RuntimeProbe<boolean>;
  isAlive: Civ7RuntimeProbe<boolean>;
  isTurnActive: Civ7RuntimeProbe<boolean>;
  unitIds: Civ7RuntimeProbe<ReadonlyArray<Civ7ComponentId>>;
  cityIds: Civ7RuntimeProbe<ReadonlyArray<Civ7ComponentId>>;
}>;

export type Civ7PlayerSummaryResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  players: ReadonlyArray<Civ7PlayerSummary>;
  omitted: number;
}>;

export type Civ7TraditionActionKind = "activate" | "deactivate";

export type Civ7TraditionAction = Readonly<{
  kind: Civ7TraditionActionKind;
  action: number | null;
  operationType: "CHANGE_TRADITION";
  args: Readonly<{
    TraditionType: number;
    Action: number | null;
  }>;
  validation: Civ7RuntimeProbe<unknown>;
  cli: string;
}>;

export type Civ7TraditionSummary = Readonly<{
  id: number;
  type: string | null;
  name: string | null;
  description: string | null;
  ageType: string | null;
  cultureSlotType: string | null;
  traitType: string | null;
  isCrisis: boolean;
  active: boolean;
  unlocked: boolean;
  recentUnlock: boolean;
  actionHints: ReadonlyArray<Civ7TraditionAction>;
}>;

export type Civ7TraditionsViewInput = Readonly<{
  playerId?: number;
}>;

export type Civ7TraditionsViewResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  playerId: number;
  turn: Civ7RuntimeProbe<number>;
  turnDate: Civ7RuntimeProbe<string>;
  governmentType: Civ7RuntimeProbe<number>;
  government: Readonly<{
    type: string | null;
    name: string | null;
  }>;
  slots: Readonly<{
    total: Civ7RuntimeProbe<number>;
    normal: Civ7RuntimeProbe<number>;
    crisis: Civ7RuntimeProbe<number>;
    active: number;
    unlocked: number;
    available: number;
    open: number;
  }>;
  actions: Readonly<{
    activate: number | null;
    deactivate: number | null;
  }>;
  active: ReadonlyArray<Civ7TraditionSummary>;
  available: ReadonlyArray<Civ7TraditionSummary>;
  recentUnlocks: ReadonlyArray<Civ7TraditionSummary>;
  traditions: ReadonlyArray<Civ7TraditionSummary>;
  recommendedCli: ReadonlyArray<string>;
  hiddenInfoPolicy: "player-culture-runtime";
  notes: ReadonlyArray<string>;
}>;

export type Civ7ProgressDashboardInput = Readonly<{
  playerId?: number;
}>;

export type Civ7ProgressDashboardLegacyPath = Readonly<{
  legacyPathType: string | null;
  legacyPathClassType: string | null;
  ageType: string | null;
  name: string | null;
  description: string | null;
  enabledByDefault: boolean;
  enabledForPlayer: boolean | null;
  score: Civ7RuntimeProbe<number>;
  finalRequiredPathPoints: number | null;
  nextMilestone: unknown;
  milestones: ReadonlyArray<unknown>;
}>;

export type Civ7ProgressDashboardResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  playerId: number;
  turn: Civ7RuntimeProbe<number>;
  turnDate: Civ7RuntimeProbe<string>;
  age: Readonly<{
    hash: unknown;
    ageType: string | null;
    name: string | null;
    chronologyIndex: unknown;
    isFinalAge: Civ7RuntimeProbe<boolean>;
    isSingleAge: Civ7RuntimeProbe<boolean>;
    isExtendedGame: Civ7RuntimeProbe<boolean>;
    isAgeOver: Civ7RuntimeProbe<boolean>;
    currentAgeProgressionPoints: Civ7RuntimeProbe<number>;
    maxAgeProgressionPoints: Civ7RuntimeProbe<number>;
    primaryAgeProgression: Civ7RuntimeProbe<unknown>;
  }>;
  player: Readonly<{
    team: unknown;
    historicalLegacyPointCountForTeam: Civ7RuntimeProbe<number>;
  }>;
  legacyPaths: ReadonlyArray<Civ7ProgressDashboardLegacyPath>;
  victories: Readonly<{
    rows: ReadonlyArray<unknown>;
  }>;
  triumphs: Readonly<{
    count: number;
    rows: ReadonlyArray<unknown>;
    source: "runtime-gameinfo";
  }>;
  proof: Readonly<{
    victoryManagerGlobal: Civ7RuntimeProbe<string>;
    sources: ReadonlyArray<string>;
  }>;
  hiddenInfoPolicy: "local-player-runtime-progress";
  notes: ReadonlyArray<string>;
}>;

export type Civ7UnitSummaryInput = Readonly<{
  playerIds?: ReadonlyArray<number>;
  unitIds?: ReadonlyArray<Civ7ComponentId>;
  playerId?: number;
  maxItems?: number;
  includeHidden?: boolean;
}>;

export type Civ7UnitSummary = Readonly<{
  id: Civ7ComponentId;
  owner: Civ7RuntimeProbe<number>;
  name: Civ7RuntimeProbe<string>;
  type: Civ7RuntimeProbe<number | string>;
  location: Civ7RuntimeProbe<Civ7MapLocation>;
  health: Civ7RuntimeProbe<number>;
  damage: Civ7RuntimeProbe<number>;
  movement: Civ7RuntimeProbe<number>;
  activity: Civ7RuntimeProbe<number | string>;
}>;

export type Civ7UnitSummaryResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  units: ReadonlyArray<Civ7UnitSummary>;
  omitted: number;
}>;

export type Civ7CitySummaryInput = Readonly<{
  playerIds?: ReadonlyArray<number>;
  cityIds?: ReadonlyArray<Civ7ComponentId>;
  playerId?: number;
  maxItems?: number;
  includeHidden?: boolean;
}>;

export type Civ7CitySummary = Readonly<{
  id: Civ7ComponentId;
  owner: Civ7RuntimeProbe<number>;
  name: Civ7RuntimeProbe<string>;
  location: Civ7RuntimeProbe<Civ7MapLocation>;
  population: Civ7RuntimeProbe<number>;
  growth: Civ7RuntimeProbe<unknown>;
  production: Civ7RuntimeProbe<unknown>;
}>;

export type Civ7CitySummaryResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  cities: ReadonlyArray<Civ7CitySummary>;
  omitted: number;
}>;

export type Civ7VisibilitySummaryInput = Readonly<{
  playerId: number;
  bounds?: Civ7MapBounds;
  includeGrid?: boolean;
  maxPlots?: number;
}>;

export type Civ7VisibilitySummaryResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  playerId: number;
  numPlotsRevealed: Civ7RuntimeProbe<number>;
  numPlotsVisible: Civ7RuntimeProbe<number>;
  counts: Record<string, number>;
  grid?: Readonly<{
    bounds: Civ7MapBounds;
    plotCount: number;
    omitted: number;
    states: ReadonlyArray<Readonly<Civ7MapLocation & {
      state: Civ7RuntimeProbe<number | string>;
      visible: Civ7RuntimeProbe<boolean>;
    }>>;
  }>;
}>;

export type Civ7GameInfoRowsInput = Readonly<{
  table: string;
  lookup?: string | number | ReadonlyArray<string | number>;
  filter?: Readonly<{
    key: string;
    equals: string | number | boolean;
  }>;
  limit?: number;
  offset?: number;
  includeSchema?: boolean;
  includePrimaryKeys?: boolean;
}>;

export type Civ7GameInfoRowsResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  table: string;
  source: "GameInfo";
  rows: ReadonlyArray<Record<string, unknown>>;
  limit: number;
  offset: number;
  total: Civ7RuntimeProbe<number>;
  omittedUnknown: boolean;
  schema?: Civ7RuntimeProbe<unknown>;
  primaryKeys?: Civ7RuntimeProbe<unknown>;
}>;

export type Civ7SetupPhase = "shell" | "running-game" | "loading" | "begin-ready" | "unavailable";

export type Civ7SetupParameterValue = string | number | boolean | null;

export type Civ7SetupMapRow = Readonly<{
  source: "setup-domain" | "config-db";
  domain?: string;
  file: string;
  value?: string;
  name?: string;
  description?: string;
  sortIndex?: number;
}>;

export type Civ7SetupParameterSnapshot = Readonly<{
  id: string;
  exists: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  invalidReason?: number | string | null;
  value?: Civ7SetupParameterValue;
  rawValue?: unknown;
  possibleValues?: ReadonlyArray<unknown>;
}>;

export type Civ7PlayerSetupParameterSnapshot = Readonly<{
  playerId: number;
  parameters: ReadonlyArray<Civ7SetupParameterSnapshot>;
}>;

export type Civ7SetupSnapshot = Readonly<{
  phase: Civ7SetupPhase;
  ui: Pick<Civ7AppUiSnapshot["ui"], "inGame" | "inShell" | "inLoading" | "loadingState" | "loadingStateName" | "canBeginGame">;
  setup: Readonly<{
    revision: Civ7RuntimeProbe<number>;
    parameters: ReadonlyArray<Civ7SetupParameterSnapshot>;
    playerParameters: ReadonlyArray<Civ7PlayerSetupParameterSnapshot>;
    localPlayerId: Civ7RuntimeProbe<number>;
  }>;
  selectedMapRow?: Civ7SetupMapRow;
  mapRows: ReadonlyArray<Civ7SetupMapRow>;
  config: Readonly<{
    mapScript: Civ7RuntimeProbe<string>;
    mapSize: Civ7RuntimeProbe<string>;
    mapSeed: Civ7RuntimeProbe<number>;
    gameSeed: Civ7RuntimeProbe<number>;
    playerCount: Civ7RuntimeProbe<number>;
  }>;
}>;

export type Civ7SetupSnapshotResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  snapshot: Civ7SetupSnapshot;
}>;

export type Civ7SetupMapRowsInput = Readonly<{
  file?: string;
  limit?: number;
}>;

export type Civ7SetupMapRowsResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  rows: ReadonlyArray<Civ7SetupMapRow>;
  limit: number;
  matchedFile?: string;
}>;

export type Civ7SetupMapRowVisibilityInput = Readonly<{
  file: string;
  limit?: number;
  reloadIfMissing?: "none" | "exit-to-shell";
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
}>;

export type Civ7SetupMapRowVisibilityResult = Readonly<{
  initial: Civ7SetupMapRowsResult;
  final: Civ7SetupMapRowsResult;
  shellBefore?: Civ7SetupSnapshotResult;
  shellAfter?: Civ7SetupSnapshotResult;
  shellExit?: Civ7CommandResult;
  reload?: Civ7CommandResult;
  refreshed: boolean;
  verified: boolean;
}>;

export type Civ7SetupOptionValue = string | number | boolean;

export type Civ7PlayerSetupOptions = Readonly<{
  playerId: number;
  options: Readonly<Record<string, Civ7SetupOptionValue>>;
}>;

export type Civ7SavedGameConfigurationRef = Readonly<{
  id: string;
  displayName: string;
  fileName: string;
  path: string;
}>;

export type Civ7SavedGameConfigurationSummary = Readonly<{
  gameSpeed?: string;
  mapSize?: string;
  mapName?: string;
  leader?: string;
  civilization?: string;
  difficulty?: string;
  mapSeed?: number;
  gameSeed?: number;
}>;

export type Civ7SavedGameConfiguration = Civ7SavedGameConfigurationRef & Readonly<{
  sizeBytes: number;
  modifiedAt: string;
  source: "local-disk";
  summary: Civ7SavedGameConfigurationSummary;
  setupOptions: Readonly<Record<string, Civ7SetupOptionValue>>;
  playerOptions: ReadonlyArray<Civ7PlayerSetupOptions>;
}>;

export type Civ7SavedGameConfigurationListInput = Readonly<{
  directory?: string;
  maxFiles?: number;
}>;

export type Civ7SavedGameConfigurationListResult = Readonly<{
  directory: string;
  configurations: ReadonlyArray<Civ7SavedGameConfiguration>;
}>;

export type Civ7SavedGameConfigurationLoadResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  savedConfig: Civ7SavedGameConfigurationRef;
  before: Civ7SetupSnapshotResult;
  after: Civ7SetupSnapshotResult;
  command: Civ7CommandResult;
  loaded: boolean;
}>;

export type Civ7SinglePlayerSetupInput = Readonly<{
  mapScript: string;
  mapSize: string;
  seed: number;
  gameSeed?: number;
  playerCount?: number;
  savedConfig?: Civ7SavedGameConfigurationRef;
  options?: Readonly<Record<string, Civ7SetupOptionValue>>;
  playerOptions?: ReadonlyArray<Civ7PlayerSetupOptions>;
  requireShell?: boolean;
}>;

export type Civ7PreparedSetupResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  before: Civ7SetupSnapshotResult;
  after: Civ7SetupSnapshotResult;
  command: Civ7CommandResult;
  savedConfigLoad?: Civ7SavedGameConfigurationLoadResult;
  applied: Readonly<Record<string, Civ7SetupOptionValue>>;
  verified: boolean;
}>;

export type Civ7PreparedStartInput = Readonly<{
  expected: Civ7SinglePlayerSetupInput;
  waitForTuner?: boolean;
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
}>;

export type Civ7SinglePlayerStartResult = Readonly<{
  command: Civ7CommandResult;
  begin?: Civ7CommandResult;
  beginAttempted: boolean;
  beginError?: string;
  before: Civ7SetupSnapshotResult;
  finalAppUi: Civ7AppUiSnapshotResult;
  tunerHealth?: Civ7TunerHealthResult;
  mapSummary?: Civ7MapSummaryResult;
  observations: ReadonlyArray<Civ7AppUiSnapshot>;
  verified: boolean;
}>;

export type Civ7SinglePlayerRunInput = Civ7SinglePlayerSetupInput & Readonly<{
  fromRunningGame?: "reject" | "exit-to-shell";
  waitForTuner?: boolean;
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
}>;

export type Civ7SinglePlayerRunResult = Readonly<{
  shellExit?: Civ7CommandResult;
  prepare: Civ7PreparedSetupResult;
  start: Civ7SinglePlayerStartResult;
  verified: boolean;
}>;

export type Civ7RootInspectionInput = Readonly<{
  state?: Civ7TunerStateSelection;
  roots: ReadonlyArray<string>;
  maxRoots?: number;
  maxKeys?: number;
  maxMethods?: number;
  includeEnumerableKeys?: boolean;
  includePrototypeKeys?: boolean;
  includeSignatures?: boolean;
}>;

export type Civ7RootInspectionResult = Civ7RuntimeApiInspection & Readonly<{
  limits: Readonly<{
    maxRoots: number;
    maxKeys: number;
    maxMethods: number;
    truncated: boolean;
  }>;
}>;

export type Civ7AutoplayStatusResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  autoplay: Civ7AppUiSnapshot["autoplay"];
  game: Civ7AppUiSnapshot["game"];
  gameContext: Civ7AppUiSnapshot["gameContext"];
}>;

export type Civ7AutoplayPollOptions = Civ7DirectControlOptions & Readonly<{
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
  stabilityWindowMs?: number;
}>;

export type Civ7AutoplayOptions = Civ7AutoplayPollOptions & Readonly<{
  turns?: number;
  observeAsPlayer?: number;
  returnAsPlayer?: number;
  pause?: boolean;
  maxTurns?: number;
}>;

export type Civ7AutoplayActionResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  before: Civ7AutoplayStatusResult;
  after: Civ7AutoplayStatusResult;
  commands: ReadonlyArray<Civ7CommandResult>;
  verified: boolean;
}>;

export type Civ7RevealMapResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  playerId: number;
  before: Civ7VisibilitySummaryResult;
  after: Civ7VisibilitySummaryResult;
  command: Civ7CommandResult;
  classification: "revealed" | "already-revealed" | "unverified";
}>;

export type Civ7TurnCompletionStatusResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  turn: Civ7RuntimeProbe<number>;
  turnDate: Civ7RuntimeProbe<string>;
  hasSentTurnComplete: Civ7RuntimeProbe<boolean>;
  canEndTurn: Civ7RuntimeProbe<boolean>;
  blocker: Civ7RuntimeProbe<unknown>;
  firstReadyUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
}>;

export type Civ7TurnCompletionActionResult = Readonly<{
  before: Civ7TurnCompletionStatusResult;
  after: Civ7TurnCompletionStatusResult;
  command: Civ7CommandResult;
  verified: boolean;
}>;

export type Civ7PlayDecisionHint = Readonly<{
  category: string;
  operationFamily?: Civ7OperationFamily | "app-ui-action";
  operationType?: string;
  argsShape?: string;
  cli?: string;
  requiredInputs: ReadonlyArray<Civ7PlayDecisionInput>;
  commonActions: ReadonlyArray<Civ7PlayDecisionAction>;
  confidence: "live-proof" | "official-ui" | "heuristic";
  notes: ReadonlyArray<string>;
}>;

export type Civ7PlayDecisionInput = Readonly<{
  name: string;
  source: string;
  required: boolean;
  note?: string;
}>;

export type Civ7PlayDecisionAction = Readonly<{
  label: string;
  cli?: string;
  operationFamily?: Civ7OperationFamily | "app-ui-action";
  operationType?: string;
  argsShape?: string;
  when: string;
}>;

export type Civ7PlayNotificationSummary = Readonly<{
  id: Civ7ComponentId | null;
  type: unknown;
  typeName: string | null;
  groupType: unknown;
  player: unknown;
  summary: string | null;
  message: string | null;
  target: unknown;
  location: unknown;
  canUserDismiss: unknown;
  expired: unknown;
  dismissed: unknown;
  isEndTurnBlocking: boolean;
  decision: Civ7PlayDecisionHint;
  details?: unknown;
}>;

export type Civ7PlayDecisionQueueItem = Readonly<{
  notificationId: Civ7ComponentId | null;
  isEndTurnBlocking: boolean;
  typeName: string | null;
  summary: string | null;
  message: string | null;
  target: unknown;
  location: unknown;
  player: unknown;
  category: string;
  operationFamily?: Civ7OperationFamily | "app-ui-action";
  operationType?: string;
  argsShape?: string;
  cli?: string;
  requiredInputs: ReadonlyArray<Civ7PlayDecisionInput>;
  commonActions: ReadonlyArray<Civ7PlayDecisionAction>;
  notes: ReadonlyArray<string>;
  details?: unknown;
}>;

export type Civ7PlayNotificationViewResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  turn: Civ7RuntimeProbe<number>;
  turnDate: Civ7RuntimeProbe<string>;
  hasSentTurnComplete: Civ7RuntimeProbe<boolean>;
  canEndTurn: Civ7RuntimeProbe<boolean>;
  blocker: Civ7RuntimeProbe<unknown>;
  blockingNotificationId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  selectedUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  selectedCityId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  firstReadyUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  notifications: ReadonlyArray<Civ7PlayNotificationSummary>;
  decisions: ReadonlyArray<Civ7PlayDecisionHint>;
  hud: Readonly<{
    nextDecision: Civ7PlayDecisionQueueItem | null;
    decisionQueue: ReadonlyArray<Civ7PlayDecisionQueueItem>;
  }>;
  limits: Readonly<{
    maxNotifications: number;
    truncated: boolean;
  }>;
}>;

export type Civ7NotificationDismissInput = Readonly<{
  notificationId: Civ7ComponentId;
}>;

export type Civ7NotificationDismissalSummary = Readonly<{
  id: Civ7ComponentId | null;
  exists: boolean;
  type: unknown;
  typeName: string | null;
  summary: string | null;
  message: string | null;
  target: unknown;
  location: unknown;
  canUserDismiss: unknown;
  expired: unknown;
  dismissed: unknown;
  blocksTurnAdvancement: Civ7RuntimeProbe<unknown>;
  endTurnBlockingType: Civ7RuntimeProbe<unknown>;
  isEndTurnBlocking: Civ7RuntimeProbe<boolean>;
  engineQueueCount: Civ7RuntimeProbe<number>;
  engineQueueContains: Civ7RuntimeProbe<boolean>;
  engineQueueFirstId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  isEngineQueueFront: Civ7RuntimeProbe<boolean>;
  notificationTrainCount: Civ7RuntimeProbe<number>;
  notificationTrainContains: Civ7RuntimeProbe<boolean>;
  notificationTrainFirstId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  isNotificationTrainFront: Civ7RuntimeProbe<boolean>;
}>;

export type Civ7NotificationDismissalResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  notificationId: Civ7ComponentId;
  before: Civ7NotificationDismissalSummary;
  after: Civ7NotificationDismissalSummary | null;
  canDismiss: boolean;
  sent: boolean;
  result: unknown;
  closeoutPath?: string | null;
  verificationAttempts?: ReadonlyArray<Civ7NotificationDismissalSummary>;
  verified: boolean;
  notes: ReadonlyArray<string>;
}>;

export type Civ7DiplomacyResponseInput = Readonly<{
  playerId: number;
  actionId: number;
  responseType: number;
  notificationId?: Civ7ComponentId;
  activateNotification?: boolean;
  uiCloseout?: boolean;
}>;

export type Civ7DiplomacyResponseCommandPayload = Readonly<{
  localPlayerId: number;
  playerId: number;
  actionId: number;
  responseType: number;
  args: Readonly<{ ID: number; Type: number }>;
  notificationId: Civ7ComponentId | null;
  discoveredNotification: unknown;
  activated: boolean;
  activationResult: unknown;
  canStart: unknown;
  sent: boolean;
  sendResult: unknown;
  uiCloseout: Readonly<{
    requested: boolean;
    acknowledgeStarted: unknown;
    closeCurrentDiplomacyProject: unknown;
    hide: unknown;
  }>;
  diplomacyState: Readonly<{
    before: unknown;
    after: unknown;
  }>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7DiplomacyResponsePostconditionClassification =
  | "not-sent"
  | "turn-unblocked"
  | "diplomacy-blocker-cleared"
  | "blocking-notification-changed"
  | "validation-changed"
  | "no-state-change";

export type Civ7DiplomacyResponsePostcondition = Readonly<{
  classification: Civ7DiplomacyResponsePostconditionClassification;
  reason: string;
}>;

export type Civ7DiplomacyResponseResult = Readonly<{
  before: Civ7PlayNotificationViewResult;
  beforeValidation: Civ7OperationValidationResult;
  command?: Civ7CommandResult;
  payload?: Civ7DiplomacyResponseCommandPayload;
  after: Civ7PlayNotificationViewResult;
  afterValidation: Civ7OperationValidationResult;
  sent: boolean;
  verified: boolean;
  postcondition: Civ7DiplomacyResponsePostcondition;
}>;

export type Civ7NarrativeChoiceInput = Readonly<{
  playerId: number;
  targetType: string;
  target: Civ7ComponentId;
  action: number;
}>;

export type Civ7NarrativeChoiceCommandPayload = Readonly<{
  localPlayerId: number;
  playerId: number;
  args: Readonly<{ TargetType: string; Target: Civ7ComponentId; Action: number }>;
  canStart: unknown;
  sent: boolean;
  sendResult: unknown;
  ui: Readonly<{
    before: unknown;
    after: unknown;
    panelClose: unknown;
    popupClose: unknown;
  }>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7NarrativeChoicePostconditionClassification =
  | "not-sent"
  | "turn-unblocked"
  | "narrative-blocker-cleared"
  | "narrative-panel-cleared"
  | "validation-changed"
  | "no-state-change";

export type Civ7NarrativeChoicePostcondition = Readonly<{
  classification: Civ7NarrativeChoicePostconditionClassification;
  reason: string;
}>;

export type Civ7NarrativeChoiceResult = Readonly<{
  before: Civ7PlayNotificationViewResult;
  beforeValidation: Civ7OperationValidationResult;
  command?: Civ7CommandResult;
  payload?: Civ7NarrativeChoiceCommandPayload;
  after: Civ7PlayNotificationViewResult;
  afterValidation: Civ7OperationValidationResult;
  sent: boolean;
  verified: boolean;
  postcondition: Civ7NarrativeChoicePostcondition;
}>;

export type Civ7TechnologyChoiceCloseoutInput = Readonly<{
  playerId: number;
  node: number;
  notificationId?: Civ7ComponentId;
  activateNotification?: boolean;
}>;

export type Civ7TechnologyChoiceCloseoutResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  command: Civ7CommandResult;
  payload: unknown;
  sent: boolean;
}>;

export type Civ7CultureChoiceCloseoutInput = Readonly<{
  playerId: number;
  node: number;
  notificationId?: Civ7ComponentId;
  activateNotification?: boolean;
}>;

export type Civ7CultureChoiceCloseoutResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  command: Civ7CommandResult;
  payload: unknown;
  sent: boolean;
}>;

export type Civ7OperationFamily =
  | "unit-operation"
  | "unit-command"
  | "city-operation"
  | "city-command"
  | "player-operation";

export type Civ7OperationTarget =
  | Readonly<{ unitId: Civ7ComponentId }>
  | Readonly<{ cityId: Civ7ComponentId }>
  | Readonly<{ playerId: number }>;

export type Civ7OperationInput = Civ7OperationTarget & Readonly<{
  operationType: string;
  args?: unknown;
}>;

export type Civ7ActionApproval = Readonly<{
  approved: true;
  reason: string;
  disposableSession?: boolean;
}>;

export type Civ7OperationValidationResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  family: Civ7OperationFamily;
  operationType: string;
  enumValue: unknown;
  target: Civ7OperationTarget;
  args: unknown;
  valid: boolean;
  result: unknown;
}>;

export type Civ7UnitOperationPostconditionClassification =
  | "not-sent"
  | "queue-advanced"
  | "selected-unit-changed"
  | "activity-changed"
  | "unit-state-changed"
  | "blocker-changed"
  | "validation-changed"
  | "no-state-change";

export type Civ7UnitOperationPostconditionSnapshot = Readonly<{
  unit: Civ7RuntimeProbe<unknown>;
  selectedUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  firstReadyUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  blocker: Civ7RuntimeProbe<unknown>;
}>;

export type Civ7UnitOperationPostcondition = Readonly<{
  family: "unit-operation" | "unit-command";
  operationType: string;
  classification: Civ7UnitOperationPostconditionClassification;
  before?: Civ7UnitOperationPostconditionSnapshot;
  after?: Civ7UnitOperationPostconditionSnapshot;
  reason: string;
}>;

export type Civ7PopulationPlacementPostconditionClassification =
  | "not-sent"
  | "population-ready-cleared"
  | "placement-state-changed"
  | "validation-changed"
  | "no-state-change";

export type Civ7PopulationPlacementPostconditionSnapshot = Readonly<{
  cityId: Civ7ComponentId | null;
  city: Civ7RuntimeProbe<unknown>;
  isReadyToPlacePopulation: Civ7RuntimeProbe<unknown>;
  cityWorkerCap: Civ7RuntimeProbe<unknown>;
  workablePlotIndexes: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
  blockedPlotIndexes: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
  expansionPlotIndexes: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
}>;

export type Civ7PopulationPlacementPostcondition = Readonly<{
  family: "player-operation" | "city-command";
  operationType: string;
  classification: Civ7PopulationPlacementPostconditionClassification;
  before?: Civ7PopulationPlacementPostconditionSnapshot;
  after?: Civ7PopulationPlacementPostconditionSnapshot;
  readyCleared: boolean;
  placementStateChanged: boolean;
  reason: string;
}>;

export type Civ7OperationRequestResult = Readonly<{
  before: Civ7OperationValidationResult;
  command?: Civ7CommandResult;
  after: Civ7OperationValidationResult;
  sent: boolean;
  verified: boolean;
  postcondition?: Civ7UnitOperationPostcondition;
  populationPostcondition?: Civ7PopulationPlacementPostcondition;
  productionPostcondition?: Civ7ProductionPostcondition;
}>;

export type Civ7ProductionPostconditionClassification =
  | "not-sent"
  | "production-choice-cleared"
  | "production-state-changed"
  | "production-state-changed-blocker-still-live"
  | "validation-changed"
  | "no-state-change";

export type Civ7ProductionPostconditionSnapshot = Readonly<{
  cityId: Civ7ComponentId | null;
  city: Civ7RuntimeProbe<unknown>;
  buildQueue: Civ7RuntimeProbe<unknown>;
  selectedCityId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  blocker: Civ7RuntimeProbe<unknown>;
  canEndTurn: Civ7RuntimeProbe<unknown>;
  blockingProductionNotification: Civ7RuntimeProbe<unknown>;
}>;

export type Civ7ProductionPostcondition = Readonly<{
  family: "city-operation";
  operationType: "BUILD";
  classification: Civ7ProductionPostconditionClassification;
  before?: Civ7ProductionPostconditionSnapshot;
  after?: Civ7ProductionPostconditionSnapshot;
  productionStateChanged: boolean;
  blockerStillLive: boolean;
  reason: string;
}>;

export type Civ7ProductionChoiceInput = Readonly<{
  cityId: Civ7ComponentId;
  args: Readonly<Record<string, number>>;
}>;

export type Civ7ProductionChoiceCommandPayload = Readonly<{
  cityId: Civ7ComponentId;
  args: unknown;
  beforeValidation: unknown;
  afterValidation: unknown;
  sent: boolean;
  sendResult?: Civ7RuntimeProbe<unknown>;
  beforeProductionPostcondition: Civ7ProductionPostconditionSnapshot;
  afterProductionPostcondition: Civ7ProductionPostconditionSnapshot;
  ui?: Readonly<{
    cityActivation?: Civ7RuntimeProbe<unknown>;
    interfaceClose?: Civ7RuntimeProbe<unknown>;
  }>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7ProductionChoiceResult = Civ7OperationRequestResult & Readonly<{
  payload?: Civ7ProductionChoiceCommandPayload;
}>;

export type Civ7UnitTargetActionInput = Readonly<{
  unitId: Civ7ComponentId;
  x: number;
  y: number;
}>;

export type Civ7UnitTargetActionCandidate = Readonly<{
  family: "unit-operation" | "unit-command";
  operationType: string;
  args: unknown;
  valid: boolean;
  result: unknown;
  targetInReturnedPlots: boolean | null;
  rejectedReason?: string;
}>;

export type Civ7UnitTargetActionResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  unitId: Civ7ComponentId;
  target: Readonly<{ x: number; y: number; index: Civ7RuntimeProbe<number> }>;
  beforeUnit: Civ7RuntimeProbe<unknown>;
  beforeTargetUnits: Civ7RuntimeProbe<unknown>;
  candidates: ReadonlyArray<Civ7UnitTargetActionCandidate>;
  selected: Civ7UnitTargetActionCandidate | null;
  sent: boolean;
  sendResult?: unknown;
  afterUnit?: Civ7RuntimeProbe<unknown>;
  afterTargetUnits?: Civ7RuntimeProbe<unknown>;
  verified?: boolean;
  verification?: Readonly<{
    status: "verified" | "no-state-change" | "not-sent";
    classification: "target-reached" | "path-shortfall" | "unit-state-changed" | "target-state-changed" | "no-state-change" | "not-sent";
    unitChanged: boolean;
    targetUnitsChanged: boolean;
    destinationReached: boolean | null;
    requestedLocation: Civ7MapLocation;
    landedLocation?: Civ7MapLocation | null;
    source?: "immediate" | "bounded-poll";
    attempts?: number;
    observedAfterMs?: number;
    reason: string;
  }>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7ReadyUnitViewInput = Readonly<{
  unitId?: Civ7ComponentId;
  radius?: number;
  maxOperations?: number;
}>;

export type Civ7ReadyUnitOperationCandidate = Readonly<{
  family: "unit-operation" | "unit-command";
  operationType: string;
  enumValue: unknown;
  valid: boolean;
  result: unknown;
}>;

export type Civ7ReadyUnitNearbyPlot = Readonly<{
  x: number;
  y: number;
  units: unknown;
}>;

export type Civ7ReadyUnitPromotionReadiness = Readonly<{
  hasExperience: boolean;
  canPromote: unknown;
  promotionClass: string | null;
  level: unknown;
  experiencePoints: unknown;
  experienceToNextLevel: unknown;
  totalPromotionsEarned: unknown;
  storedPromotionPoints: unknown;
  storedCommendations: unknown;
  canPurchase: boolean;
  availablePromotions: ReadonlyArray<Readonly<{
    disciplineType: string;
    promotionType: string;
    name: string | null;
    description: string | null;
    commendation: boolean;
    args: unknown;
    validation: unknown;
  }>>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7ReadyUnitViewResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  requestedUnitId: Civ7ComponentId | null;
  selectedUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  firstReadyUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  unitId: Civ7ComponentId | null;
  unit: Civ7RuntimeProbe<unknown>;
  legalOperations: ReadonlyArray<Civ7ReadyUnitOperationCandidate>;
  promotionReadiness: Civ7RuntimeProbe<Civ7ReadyUnitPromotionReadiness | null>;
  nearby: Civ7RuntimeProbe<ReadonlyArray<Civ7ReadyUnitNearbyPlot>>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7UnitMovePreviewInput = Readonly<{
  unitId?: Civ7ComponentId;
  destination?: Civ7MapLocation;
  maxPlots?: number;
  maxPathPlots?: number;
}>;

export type Civ7UnitMovePreviewResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  requestedUnitId: Civ7ComponentId | null;
  selectedUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  firstReadyUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  unitId: Civ7ComponentId | null;
  unit: Civ7RuntimeProbe<unknown>;
  reachableMovement: Civ7RuntimeProbe<unknown>;
  reachableZonesOfControl: Civ7RuntimeProbe<unknown>;
  reachableTargets: Civ7RuntimeProbe<unknown>;
  queuedDestination: Civ7RuntimeProbe<Civ7MapLocation | null>;
  queuedPath: Civ7RuntimeProbe<unknown>;
  requestedDestination: Civ7MapLocation | null;
  requestedPath: Civ7RuntimeProbe<unknown>;
  relationshipPolicy: Readonly<{
    relationshipSource: "not-classified";
    relationshipProof: "none";
    unprovenLabel: "relationship-unproven";
    guidance: string;
  }>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7ReadyCityViewInput = Readonly<{
  cityId?: Civ7ComponentId;
  maxOperations?: number;
}>;

export type Civ7ReadyCityOperationCandidate = Readonly<{
  family: "city-operation" | "city-command";
  operationType: string;
  enumValue: unknown;
  valid: boolean;
  result: unknown;
}>;

export type Civ7ReadyCityProductionCandidate = Readonly<{
  kind: "unit" | "constructible" | "project";
  type: unknown;
  typeName: string | null;
  name: string | null;
  args: unknown;
  cost?: unknown;
  turns?: unknown;
  productionBasis?: unknown;
  baseYieldSummary?: unknown;
  valid: boolean;
  result: unknown;
  placementPlots?: ReadonlyArray<unknown>;
  cli: string;
}>;

export type Civ7ReadyCityTownFocusOption = Readonly<{
  name: string | null;
  description: string | null;
  args: unknown;
  valid: boolean;
  result: unknown;
  cli: string;
}>;

export type Civ7ReadyCityPopulationPlacement = Readonly<{
  isReadyToPlacePopulation: Civ7RuntimeProbe<unknown>;
  cityWorkerCap: Civ7RuntimeProbe<unknown>;
  yieldTypeOrder: ReadonlyArray<string>;
  allPlacementInfo: Civ7RuntimeProbe<unknown>;
  workablePlotIndexes: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
  blockedPlotIndexes: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
  workablePlots: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
  expansionCandidates: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
  expansionResult: Civ7RuntimeProbe<unknown>;
  cliHints: ReadonlyArray<string>;
}>;

export type Civ7ReadyCityViewResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  requestedCityId: Civ7ComponentId | null;
  selectedCityId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  blockingCityId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  cityId: Civ7ComponentId | null;
  city: Civ7RuntimeProbe<unknown>;
  legalOperations: ReadonlyArray<Civ7ReadyCityOperationCandidate>;
  productionCandidates: Civ7RuntimeProbe<ReadonlyArray<Civ7ReadyCityProductionCandidate>>;
  townFocusOptions: Civ7RuntimeProbe<ReadonlyArray<Civ7ReadyCityTownFocusOption>>;
  populationPlacement: Civ7RuntimeProbe<Civ7ReadyCityPopulationPlacement>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7SettlementRecommendationInput = Readonly<{
  playerId?: number;
  locations?: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  count?: number;
  includeSettlers?: boolean;
  includeCities?: boolean;
}>;

export type Civ7SettlementRecommendationFactor = Readonly<{
  positive: boolean;
  title: string | null;
  description: string | null;
}>;

export type Civ7SettlementRecommendationOrigin = Readonly<{
  kind: "requested" | "settler" | "city";
  location: Readonly<{ x: number; y: number }>;
  plotIndex: Civ7RuntimeProbe<number>;
  unitId?: Civ7ComponentId;
  cityId?: Civ7ComponentId;
  name?: string | null;
}>;

export type Civ7SettlementRecommendation = Readonly<{
  origin: Civ7SettlementRecommendationOrigin;
  suggestions: Civ7RuntimeProbe<ReadonlyArray<Readonly<{
    location: Readonly<{ x: number; y: number }> | null;
    plotIndex: Civ7RuntimeProbe<number>;
    factors: ReadonlyArray<Civ7SettlementRecommendationFactor>;
  }>>>;
}>;

export type Civ7SettlementRecommendationResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  playerId: number;
  count: number;
  requestedLocations: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  origins: ReadonlyArray<Civ7SettlementRecommendationOrigin>;
  recommendations: ReadonlyArray<Civ7SettlementRecommendation>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7TargetCandidatesInput = Readonly<{
  playerId?: number;
  origins?: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  maxCandidates?: number;
  maxPlayers?: number;
  unitRadius?: number;
}>;

export type Civ7TargetCandidate = Readonly<{
  owner: number;
  leaderName: Civ7RuntimeProbe<unknown>;
  civilizationName: Civ7RuntimeProbe<unknown>;
  isHuman: Civ7RuntimeProbe<unknown>;
  cityCount: number;
  unitCount: number;
  cities: unknown;
  nearestCity: unknown;
  nearestDistance: number | null;
  nearbyUnits: unknown;
  nearbyUnitCount: number;
  apparentStrength: number;
  approach: Readonly<{
    nearestOrigin: Readonly<{ x: number; y: number }> | null;
    targetLocation: Readonly<{ x: number; y: number }> | null;
    directGridDistance: number | null;
    routeHint: string;
    routeKind: string;
    originWater: Civ7RuntimeProbe<unknown> | null;
    targetWater: Civ7RuntimeProbe<unknown> | null;
    waterSampleCount: number;
    landSampleCount: number;
    notes: ReadonlyArray<string>;
  }>;
  reasons: ReadonlyArray<string>;
}>;

export type Civ7TargetCandidatesResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  playerId: number;
  origins: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  unitRadius: number;
  hiddenInfoPolicy: string;
  relationshipLabelPolicy: unknown;
  candidates: ReadonlyArray<Civ7TargetCandidate>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7BattlefieldScanInput = Readonly<{
  playerId?: number;
  origins?: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  radius?: number;
  maxPlayers?: number;
  maxUnits?: number;
  maxCities?: number;
}>;

export type Civ7BattlefieldScanResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  playerId: number;
  origins: ReadonlyArray<Readonly<{ x: number; y: number }>>;
  radius: number;
  hiddenInfoPolicy: string;
  relationshipLabelPolicy: unknown;
  units: unknown;
  cities: unknown;
  owners: unknown;
  pointsOfInterest: unknown;
  notes: ReadonlyArray<string>;
}>;

export type Civ7DestinationAnalysisInput = Readonly<{
  playerId?: number;
  origin?: Readonly<{ x: number; y: number }>;
  destination: Readonly<{ x: number; y: number }>;
  corridorRadius?: number;
  destinationRadius?: number;
  maxPlayers?: number;
  maxUnits?: number;
  maxCities?: number;
}>;

export type Civ7DestinationAnalysisResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  playerId: number;
  origin: Readonly<{ x: number; y: number }> | null;
  destination: Readonly<{ x: number; y: number }>;
  corridorRadius: number;
  destinationRadius: number;
  hiddenInfoPolicy: string;
  relationshipLabelPolicy: unknown;
  corridor: unknown;
  destinationPressure: unknown;
  pointsOfInterest: unknown;
  notes: ReadonlyArray<string>;
}>;

export const Civ7CapabilityCatalogEntrySchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  role: Type.Union([Type.Literal("app-ui"), Type.Literal("tuner"), Type.Literal("shared")]),
  kind: Type.Union([
    Type.Literal("root"),
    Type.Literal("method"),
    Type.Literal("read-wrapper"),
    Type.Literal("action-wrapper"),
    Type.Literal("enum"),
    Type.Literal("gameinfo-table"),
  ]),
  owner: Type.String(),
  risk: Type.Union([Type.Literal("read"), Type.Literal("low"), Type.Literal("medium"), Type.Literal("high")]),
  provenance: Type.Array(Type.String()),
  state: Type.Optional(Type.String()),
  root: Type.Optional(Type.String()),
  method: Type.Optional(Type.String()),
  wrapper: Type.Optional(Type.String()),
  confidence: Type.Union([Type.Literal("source"), Type.Literal("recorded-live-proof"), Type.Literal("runtime"), Type.Literal("inference")]),
  description: Type.Optional(Type.String()),
});

export type Civ7CapabilityCatalogEntry = Static<typeof Civ7CapabilityCatalogEntrySchema>;

export const Civ7CapabilityCatalogSchema = Type.Object({
  generatedAt: Type.String(),
  source: Type.Union([Type.Literal("runtime"), Type.Literal("static"), Type.Literal("merged")]),
  version: Type.String(),
  entries: Type.Array(Civ7CapabilityCatalogEntrySchema),
});

export type Civ7CapabilityCatalog = Static<typeof Civ7CapabilityCatalogSchema>;

export type Civ7CapabilityCatalogOptions = Civ7DirectControlOptions & Readonly<{
  includeRuntime?: boolean;
  includeStatic?: boolean;
  appUiRoots?: ReadonlyArray<string>;
  tunerRoots?: ReadonlyArray<string>;
}>;

export type Civ7RestartAndBeginResult = Readonly<{
  restart: Civ7CommandResult;
  begin?: Civ7CommandResult;
  finalAppUi: Civ7AppUiSnapshotResult;
  tunerHealth?: Civ7TunerHealthResult;
  observations: ReadonlyArray<Civ7AppUiSnapshot>;
}>;

export type Civ7DirectControlHealth =
  | Readonly<{
      ok: true;
      status: "ready";
      host: string;
      port: number;
      states: ReadonlyArray<Civ7TunerState>;
      selectedState?: Civ7TunerState;
    }>
  | Readonly<{
      ok: false;
      status: "unavailable" | "no-states" | "state-missing" | "command-failed";
      host?: string;
      port?: number;
      states?: ReadonlyArray<Civ7TunerState>;
      error: Civ7DirectControlError;
    }>;

type PendingCiv7TunerRequest = {
  resolve: (frame: Civ7TunerFrame) => void;
  reject: (err: Error) => void;
  timer: NodeJS.Timeout;
  message: string;
};

let nextListenerId = Math.trunc(Date.now() % 1_000_000);

export function createCiv7ControlRequestId(prefix = "civ7-control"): string {
  return `${prefix}-${Date.now().toString(36)}-${process.pid.toString(36)}`;
}

export function resolveCiv7DirectControlConfig(options: Civ7DirectControlOptions = {}): {
  hosts: string[];
  port: number;
  timeoutMs: number;
} {
  const env = options.env ?? process.env;
  const hosts = uniqueNonEmpty([
    ...(options.hosts ?? []),
    options.host,
    ...splitEnvList(env.CIV7_TUNER_HOSTS),
    env.CIV7_TUNER_HOST,
    DEFAULT_CIV7_TUNER_HOST,
  ]);
  if (hosts.length === 0) {
    throw new Civ7DirectControlError("no-hosts", "No Civ7 tuner hosts were configured");
  }
  return {
    hosts,
    port: options.port ?? portFromEnv(env) ?? DEFAULT_CIV7_TUNER_PORT,
    timeoutMs: options.timeoutMs ?? DEFAULT_CIV7_TUNER_TIMEOUT_MS,
  };
}

export async function discoverCiv7DirectControlEndpoint(
  options: Civ7DirectControlOptions = {},
): Promise<Readonly<{ endpoint: Civ7DirectControlEndpoint; states: ReadonlyArray<Civ7TunerState> }>> {
  const config = resolveCiv7DirectControlConfig(options);
  const errors: Array<{ host: string; error: string }> = [];
  for (const host of config.hosts) {
    try {
      const states = await queryCiv7TunerStates({
        host,
        port: config.port,
        timeoutMs: config.timeoutMs,
      });
      return {
        endpoint: { host, port: config.port },
        states,
      };
    } catch (err) {
      errors.push({ host, error: errorMessage(err) });
    }
  }
  throw new Civ7DirectControlError(
    "all-hosts-unavailable",
    `Unable to reach Civ7 tuner socket on ${config.hosts.join(", ")}:${config.port}`,
    { details: errors },
  );
}

export class Civ7DirectControlSession {
  private readonly config: ReturnType<typeof resolveCiv7DirectControlConfig>;
  private socket: Socket | undefined;
  private endpointValue: Civ7DirectControlEndpoint | undefined;
  private buffer = Buffer.alloc(0);
  private readonly pending = new Map<number, PendingCiv7TunerRequest>();

  constructor(options: Civ7DirectControlOptions = {}) {
    this.config = resolveCiv7DirectControlConfig(options);
  }

  get endpoint(): Civ7DirectControlEndpoint | undefined {
    return this.endpointValue;
  }

  async connect(): Promise<Civ7DirectControlEndpoint> {
    if (this.socket && !this.socket.destroyed && this.endpointValue) {
      return this.endpointValue;
    }

    await this.close();
    const errors: Array<{ host: string; error: string }> = [];
    for (const host of this.config.hosts) {
      try {
        const socket = await openCiv7TunerSocket({
          host,
          port: this.config.port,
          timeoutMs: this.config.timeoutMs,
        });
        this.socket = socket;
        this.endpointValue = { host, port: this.config.port };
        this.buffer = Buffer.alloc(0);
        socket.on("data", (chunk) => this.handleData(chunk));
        socket.once("error", (err) => {
          this.rejectPending(new Civ7DirectControlError("connection-failed", err.message, { cause: err }));
        });
        socket.once("close", () => {
          this.rejectPending(new Civ7DirectControlError("socket-closed", "Civ7 tuner socket closed"));
          this.socket = undefined;
          this.endpointValue = undefined;
        });
        return this.endpointValue;
      } catch (err) {
        errors.push({ host, error: errorMessage(err) });
      }
    }

    throw new Civ7DirectControlError(
      "all-hosts-unavailable",
      `Unable to reach Civ7 tuner socket on ${this.config.hosts.join(", ")}:${this.config.port}`,
      { details: errors },
    );
  }

  async close(): Promise<void> {
    const socket = this.socket;
    this.socket = undefined;
    this.endpointValue = undefined;
    this.buffer = Buffer.alloc(0);
    this.rejectPending(new Civ7DirectControlError("socket-closed", "Civ7 tuner socket closed"));
    if (socket && !socket.destroyed) socket.destroy();
  }

  async queryStates(options: { timeoutMs?: number } = {}): Promise<ReadonlyArray<Civ7TunerState>> {
    const response = await this.request("LSQ:", options.timeoutMs);
    return tunerStatesFromParts(response.parts);
  }

  async executeCommand(options: {
    command: string;
    state?: Civ7TunerStateSelection;
    timeoutMs?: number;
  }): Promise<Civ7CommandResult> {
    const command = options.command.trim();
    if (!command) {
      throw new Civ7DirectControlError("command-failed", "Civ7 command must not be empty");
    }
    const states = await this.queryStates({ timeoutMs: options.timeoutMs });
    const state = selectCiv7TunerState(states, options.state);
    const response = await this.request(`CMD:${state.id}:${command}`, options.timeoutMs);
    const endpoint = this.endpoint;
    if (!endpoint) {
      throw new Civ7DirectControlError("socket-closed", "Civ7 tuner socket closed after command completed");
    }
    return {
      host: endpoint.host,
      port: endpoint.port,
      state,
      output: response.parts,
    };
  }

  async request(message: string, timeoutMs = this.config.timeoutMs): Promise<Civ7TunerFrame> {
    await this.connect();
    const socket = this.socket;
    if (!socket || socket.destroyed) {
      throw new Civ7DirectControlError("socket-closed", `Civ7 tuner socket is closed before ${message}`);
    }
    const listenerId = allocateListenerId();
    const response = new Promise<Civ7TunerFrame>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(listenerId);
        reject(
          new Civ7DirectControlError(
            "response-timeout",
            `Timed out waiting for Civ7 tuner response to ${message}`,
          ),
        );
      }, timeoutMs);
      this.pending.set(listenerId, { resolve, reject, timer, message });
    });
    socket.write(encodeCiv7TunerRequest(listenerId, message));
    return await response;
  }

  private handleData(chunk: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    for (;;) {
      const parsed = parseCiv7TunerFrame(this.buffer);
      if (!parsed) return;
      this.buffer = this.buffer.subarray(parsed.bytesRead);
      const pending = this.pending.get(parsed.frame.listenerId);
      if (!pending) continue;
      clearTimeout(pending.timer);
      this.pending.delete(parsed.frame.listenerId);
      pending.resolve(parsed.frame);
    }
  }

  private rejectPending(err: Civ7DirectControlError): void {
    for (const [listenerId, pending] of this.pending) {
      clearTimeout(pending.timer);
      this.pending.delete(listenerId);
      pending.reject(
        new Civ7DirectControlError(
          err.code,
          err.message === "Civ7 tuner socket closed"
            ? `Civ7 tuner socket closed while waiting for ${pending.message}`
            : err.message,
          { cause: err, details: { message: pending.message } },
        ),
      );
    }
  }
}

export async function queryCiv7TunerStates(options: Civ7DirectControlOptions = {}): Promise<ReadonlyArray<Civ7TunerState>> {
  const session = new Civ7DirectControlSession(options);
  try {
    return await session.queryStates();
  } finally {
    await session.close();
  }
}

export function selectCiv7TunerState(
  states: ReadonlyArray<Civ7TunerState>,
  selection: Civ7TunerStateSelection = { role: "app-ui" },
): Civ7TunerState {
  const requested = normalizeStateSelection(selection);
  const state = states.find((candidate) => {
    if (requested.id && candidate.id === requested.id) return true;
    if (requested.name && candidate.name === requested.name) return true;
    return false;
  });
  if (!state) {
    const requestedLabel = requested.name ?? requested.id ?? "unknown";
    throw new Civ7DirectControlError(
      "state-not-found",
      `Civ7 tuner state "${requestedLabel}" was not available; states: ${states.map((s) => s.name).join(", ")}`,
      { details: { requested, states } },
    );
  }
  return state;
}

export async function executeCiv7Command(options: Civ7DirectControlOptions & {
  command: string;
  state?: Civ7TunerStateSelection;
}): Promise<Civ7CommandResult> {
  const session = new Civ7DirectControlSession(options);
  try {
    return await session.executeCommand(options);
  } finally {
    await session.close();
  }
}

export async function executeCiv7AppUiCommand(options: Civ7DirectControlOptions & {
  command: string;
}): Promise<Civ7CommandResult> {
  return await executeCiv7Command({
    ...options,
    state: { role: "app-ui" },
  });
}

export async function executeCiv7TunerCommand(options: Civ7DirectControlOptions & {
  command: string;
}): Promise<Civ7CommandResult> {
  return await executeCiv7Command({
    ...options,
    state: { role: "tuner" },
  });
}

export async function inspectCiv7RuntimeApi(options: Civ7DirectControlOptions & {
  state?: Civ7TunerStateSelection;
  roots?: ReadonlyArray<string>;
} = {}): Promise<Civ7RuntimeApiInspection> {
  const selection = options.state ?? { role: "app-ui" };
  const roots = options.roots ?? defaultRootsForSelection(selection);
  const result = await executeCiv7Command({
    ...options,
    state: selection,
    command: buildRuntimeApiInspectionCommand(roots),
  });
  const parsed = JSON.parse(result.output[0] ?? "[]") as Civ7RuntimeApiRoot[];
  return {
    host: result.host,
    port: result.port,
    state: result.state,
    roots: parsed,
  };
}

export async function getCiv7AppUiSnapshot(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7AppUiSnapshotResult> {
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildAppUiSnapshotCommand(),
  });
  return appUiSnapshotFromCommandResult(result);
}

export async function beginCiv7Game(options: Civ7DirectControlOptions = {}): Promise<Civ7CommandResult> {
  return await executeCiv7AppUiCommand({
    ...options,
    command: CIV7_BEGIN_GAME_COMMAND,
  });
}

export async function checkCiv7TunerHealth(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7TunerHealthResult> {
  const session = new Civ7DirectControlSession(options);
  try {
    return await checkCiv7TunerHealthWithSession(session, options.timeoutMs);
  } finally {
    await session.close();
  }
}

export async function restartCiv7Game(options: Civ7DirectControlOptions & {
  state?: Civ7TunerStateSelection;
} = {}): Promise<Civ7CommandResult> {
  const result = await executeCiv7Command({
    ...options,
    state: options.state ?? { role: "app-ui" },
    command: CIV7_RESTART_COMMAND,
  });
  if (result.output[0] !== "true") {
    throw new Civ7DirectControlError(
      "command-failed",
      `Civ7 restart returned: ${result.output.join("\n") || "<empty>"}`,
      { details: result },
    );
  }
  return result;
}

export async function restartCiv7GameAndBegin(options: Civ7DirectControlOptions & {
  waitForTuner?: boolean;
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
} = {}): Promise<Civ7RestartAndBeginResult> {
  const waitTimeoutMs = options.waitTimeoutMs ?? options.timeoutMs ?? 120_000;
  const pollIntervalMs = options.pollIntervalMs ?? 1_000;
  const session = new Civ7DirectControlSession(options);
  const observations: Civ7AppUiSnapshot[] = [];
  try {
    const restart = await executeSessionCommandWithReconnect(session, {
      state: { role: "app-ui" },
      command: CIV7_RESTART_COMMAND,
      timeoutMs: options.timeoutMs,
    }, 1);
    if (restart.output[0] !== "true") {
      throw new Civ7DirectControlError(
        "command-failed",
        `Civ7 restart returned: ${restart.output.join("\n") || "<empty>"}`,
        { details: restart },
      );
    }

    let begin: Civ7CommandResult | undefined;
    let beginAttempted = false;
    let beginError: string | undefined;
    let finalAppUi: Civ7AppUiSnapshotResult | undefined;
    const startedAt = Date.now();
    while (Date.now() - startedAt <= waitTimeoutMs) {
      try {
        const snapshotResult = appUiSnapshotFromCommandResult(
          await executeSessionCommandWithReconnect(session, {
            state: { role: "app-ui" },
            command: buildAppUiSnapshotCommand(),
            timeoutMs: options.timeoutMs,
          }),
        );
        observations.push(snapshotResult.snapshot);
        const loadingState = probeValue(snapshotResult.snapshot.ui.loadingState);
        if (!beginAttempted && isCiv7BeginReadyLoadingState(loadingState)) {
          beginAttempted = true;
          try {
            begin = await executeSessionCommandWithReconnect(session, {
              state: { role: "app-ui" },
              command: CIV7_BEGIN_GAME_COMMAND,
              timeoutMs: options.timeoutMs,
            }, 1);
          } catch (err) {
            beginError = errorMessage(err);
            throw err;
          }
        }
        if (
          loadingState === CIV7_UI_LOADING_STATES.GameStarted &&
          snapshotResult.snapshot.ui.inGame.ok &&
          snapshotResult.snapshot.ui.inGame.value
        ) {
          finalAppUi = snapshotResult;
          break;
        }
      } catch (err) {
        if (beginError) throw err;
        await session.close();
      }
      await sleep(pollIntervalMs);
    }

    if (!finalAppUi) {
      throw new Civ7DirectControlError(
        "connection-timeout",
        `Timed out waiting for Civ7 App UI to reach GameStarted after ${waitTimeoutMs}ms`,
        { details: { observations, beginAttempted, beginError } },
      );
    }

    const tunerHealth = options.waitForTuner
      ? await waitForCiv7TunerReadyWithSession(session, {
          timeoutMs: options.timeoutMs,
          waitTimeoutMs,
          pollIntervalMs,
        })
      : undefined;

    return {
      restart,
      begin,
      finalAppUi,
      tunerHealth,
      observations,
    };
  } finally {
    await session.close();
  }
}

export async function checkCiv7DirectControlHealth(options: Civ7DirectControlOptions & {
  state?: Civ7TunerStateSelection;
} = {}): Promise<Civ7DirectControlHealth> {
  try {
    const discovered = await discoverCiv7DirectControlEndpoint(options);
    if (discovered.states.length === 0) {
      return {
        ok: false,
        status: "no-states",
        host: discovered.endpoint.host,
        port: discovered.endpoint.port,
        states: discovered.states,
        error: new Civ7DirectControlError("state-not-found", "Civ7 tuner returned no scripting states"),
      };
    }
    let selectedState: Civ7TunerState | undefined;
    if (options.state) {
      try {
        selectedState = selectCiv7TunerState(discovered.states, options.state);
      } catch (err) {
        return {
          ok: false,
          status: "state-missing",
          host: discovered.endpoint.host,
          port: discovered.endpoint.port,
          states: discovered.states,
          error: toDirectControlError(err, "state-not-found"),
        };
      }
    }
    return {
      ok: true,
      status: "ready",
      host: discovered.endpoint.host,
      port: discovered.endpoint.port,
      states: discovered.states,
      selectedState,
    };
  } catch (err) {
    const error = toDirectControlError(err, "connection-failed");
    return {
      ok: false,
      status: error.code === "state-not-found" ? "state-missing" : "unavailable",
      error,
    };
  }
}

export async function waitForCiv7DirectControl(options: Civ7DirectControlOptions & {
  state?: Civ7TunerStateSelection;
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
} = {}): Promise<Civ7DirectControlHealth & { ok: true }> {
  const waitTimeoutMs = options.waitTimeoutMs ?? options.timeoutMs ?? DEFAULT_CIV7_TUNER_TIMEOUT_MS;
  const pollIntervalMs = options.pollIntervalMs ?? 500;
  const startedAt = Date.now();
  let lastHealth: Civ7DirectControlHealth | undefined;
  while (Date.now() - startedAt <= waitTimeoutMs) {
    const health = await checkCiv7DirectControlHealth(options);
    if (health.ok) return health;
    lastHealth = health;
    await sleep(pollIntervalMs);
  }
  throw new Civ7DirectControlError("connection-timeout", `Timed out waiting for Civ7 tuner readiness after ${waitTimeoutMs}ms`, {
    details: lastHealth,
  });
}

export async function waitForCiv7TunerReady(options: Civ7DirectControlOptions & {
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
} = {}): Promise<Civ7TunerHealthResult & { ready: true }> {
  const session = new Civ7DirectControlSession(options);
  try {
    return await waitForCiv7TunerReadyWithSession(session, options);
  } finally {
    await session.close();
  }
}

export async function getCiv7PlayableStatus(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7PlayableStatusResult> {
  const appUi = await getCiv7AppUiSnapshot(options);
  const errors: string[] = [];
  let tuner: Civ7TunerHealthResult | undefined;
  try {
    tuner = await checkCiv7TunerHealth(options);
  } catch (err) {
    errors.push(errorMessage(err));
  }

  const inGame = probeValue(appUi.snapshot.ui.inGame) === true;
  const inShell = probeValue(appUi.snapshot.ui.inShell) === true;
  const inLoading = probeValue(appUi.snapshot.ui.inLoading) === true;
  const canBegin = probeValue(appUi.snapshot.ui.canBeginGame) === true;
  const playable = tuner?.ready === true;
  const readiness = playable
    ? "tuner-ready"
    : inGame
      ? "app-ui-game"
      : canBegin
        ? "begin-ready"
        : inLoading
          ? "loading"
          : inShell
            ? "shell"
            : "unavailable";

  return {
    host: appUi.host,
    port: appUi.port,
    playable,
    readiness,
    appUi,
    tuner,
    errors,
  };
}

export async function getCiv7MapSummary(
  options: Civ7MapSummaryOptions = {},
): Promise<Civ7MapSummaryResult> {
  const result = await executeCiv7Command({
    ...options,
    state: options.state ?? { role: "tuner" },
    command: buildMapSummaryCommand({
      includeAreaRegionCounts: options.includeAreaRegionCounts === true,
      maxIds: options.maxIds ?? 512,
    }),
  });
  return jsonPayloadFromCommandResult<Civ7MapSummaryResult>(result, "Civ7 map summary");
}

export async function getCiv7PlotSnapshot(
  input: Civ7PlotSnapshotInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7PlotSnapshotResult> {
  validateMapLocation(input);
  const fields = normalizePlotFields(input.fields);
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildPlotSnapshotCommand({ ...input, fields }),
  });
  return jsonPayloadFromCommandResult<Civ7PlotSnapshotResult>(result, "Civ7 plot snapshot");
}

export async function getCiv7MapGrid(
  input: Civ7MapGridInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7MapGridResult> {
  const maxPlots = boundedInteger(input.maxPlots ?? DEFAULT_CIV7_MAP_GRID_MAX_PLOTS, 1, HARD_CIV7_MAP_GRID_MAX_PLOTS, "maxPlots");
  validateMapGridInput(input, maxPlots);
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildMapGridCommand({
      ...input,
      fields: normalizePlotFields(input.fields),
      maxPlots,
    }),
  });
  return jsonPayloadFromCommandResult<Civ7MapGridResult>(result, "Civ7 map grid");
}

export async function getCiv7ResourcePlacementFeasibility(
  input: Civ7ResourcePlacementFeasibilityInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7ResourcePlacementFeasibilityResult> {
  const maxCells = boundedInteger(
    input.maxCells ?? DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS,
    1,
    HARD_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS,
    "maxCells",
  );
  const maxResourceTypesPerCell = boundedInteger(
    input.maxResourceTypesPerCell ?? DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL,
    1,
    HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL,
    "maxResourceTypesPerCell",
  );
  validateResourcePlacementFeasibilityInput(input, maxCells, maxResourceTypesPerCell);
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildResourcePlacementFeasibilityCommand({
      cells: input.cells.slice(0, maxCells).map((cell) => ({
        ...cell,
        resourceTypes: cell.resourceTypes.slice(0, maxResourceTypesPerCell),
        requestedResourceTypeCount: cell.resourceTypes.length,
      })),
      requestedCellCount: input.cells.length,
      maxResourceTypesPerCell,
      ignoreWeight: input.ignoreWeight === true,
    }),
  });
  return jsonPayloadFromCommandResult<Civ7ResourcePlacementFeasibilityResult>(
    result,
    "Civ7 resource placement feasibility",
  );
}

export async function getCiv7FeaturePlacementFeasibility(
  input: Civ7FeaturePlacementFeasibilityInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7FeaturePlacementFeasibilityResult> {
  const maxCells = boundedInteger(
    input.maxCells ?? DEFAULT_CIV7_FEATURE_FEASIBILITY_MAX_CELLS,
    1,
    HARD_CIV7_FEATURE_FEASIBILITY_MAX_CELLS,
    "maxCells",
  );
  const maxFeatureTypesPerCell = boundedInteger(
    input.maxFeatureTypesPerCell ?? DEFAULT_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL,
    1,
    HARD_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL,
    "maxFeatureTypesPerCell",
  );
  validateFeaturePlacementFeasibilityInput(input, maxCells, maxFeatureTypesPerCell);
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildFeaturePlacementFeasibilityCommand({
      cells: input.cells.slice(0, maxCells).map((cell) => ({
        ...cell,
        featureTypes: cell.featureTypes.slice(0, maxFeatureTypesPerCell),
        requestedFeatureTypeCount: cell.featureTypes.length,
      })),
      requestedCellCount: input.cells.length,
      maxFeatureTypesPerCell,
    }),
  });
  return jsonPayloadFromCommandResult<Civ7FeaturePlacementFeasibilityResult>(
    result,
    "Civ7 feature placement feasibility",
  );
}

export async function getCiv7ResourceBuilderDiagnostics(
  input: Civ7ResourceBuilderDiagnosticsInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7ResourceBuilderDiagnosticsResult> {
  const maxCells = boundedInteger(
    input.maxCells ?? DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS,
    1,
    HARD_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS,
    "maxCells",
  );
  const maxResourceTypesPerCell = boundedInteger(
    input.maxResourceTypesPerCell ?? DEFAULT_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL,
    1,
    HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL,
    "maxResourceTypesPerCell",
  );
  validateResourcePlacementFeasibilityInput(input, maxCells, maxResourceTypesPerCell);
  const requestedResourceTypes = uniqueBoundedResourceTypes(input.resourceTypes ?? []);
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildResourceBuilderDiagnosticsCommand({
      cells: input.cells.slice(0, maxCells).map((cell) => ({
        ...cell,
        resourceTypes: cell.resourceTypes.slice(0, maxResourceTypesPerCell),
        requestedResourceTypeCount: cell.resourceTypes.length,
      })),
      resourceTypes: requestedResourceTypes,
      requestedCellCount: input.cells.length,
      maxResourceTypesPerCell,
    }),
  });
  return jsonPayloadFromCommandResult<Civ7ResourceBuilderDiagnosticsResult>(
    result,
    "Civ7 ResourceBuilder diagnostics",
  );
}

export async function getCiv7FullMapGrid(
  input: Civ7FullMapGridInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7FullMapGridResult> {
  const summary = await getCiv7MapSummary({
    ...options,
    includeAreaRegionCounts: false,
  });
  const mapWidth = requiredProbeNumber(summary.map.width, "GameplayMap.getGridWidth");
  const mapHeight = requiredProbeNumber(summary.map.height, "GameplayMap.getGridHeight");
  const bounds = input.bounds ?? { x: 0, y: 0, width: mapWidth, height: mapHeight };
  validateMapBounds(bounds, "bounds");
  const maxPlotsPerRead = boundedInteger(
    input.maxPlotsPerRead ?? HARD_CIV7_MAP_GRID_MAX_PLOTS,
    1,
    HARD_CIV7_MAP_GRID_MAX_PLOTS,
    "maxPlotsPerRead",
  );
  const readBounds = planCiv7MapGridReadBounds(bounds, maxPlotsPerRead);
  const fields = normalizePlotFields(input.fields);
  const plots: Civ7PlotSnapshot[] = [];
  const chunks: Civ7MapGridReadChunk[] = [];
  let omitted = 0;
  let hiddenInfoPolicy: Civ7HiddenInfoPolicy = input.playerId === undefined
    ? "not-player-scoped"
    : input.includeHidden === true
      ? "include-hidden"
      : "visibility-filtered";
  let lastGrid: Civ7MapGridResult | undefined;

  for (const chunkBounds of readBounds) {
    const grid = await getCiv7MapGrid({
      bounds: chunkBounds,
      fields,
      ...(input.playerId === undefined ? {} : { playerId: input.playerId }),
      ...(input.includeHidden === undefined ? {} : { includeHidden: input.includeHidden }),
      maxPlots: maxPlotsPerRead,
    }, options);
    lastGrid = grid;
    hiddenInfoPolicy = grid.hiddenInfoPolicy;
    omitted += grid.omitted;
    chunks.push({
      bounds: chunkBounds,
      plotCount: grid.plotCount,
      omitted: grid.omitted,
    });
    plots.push(...grid.plots);
  }

  plots.sort((a, b) => {
    const ai = probeNumberOr(a.location.index, Number.MAX_SAFE_INTEGER);
    const bi = probeNumberOr(b.location.index, Number.MAX_SAFE_INTEGER);
    return ai - bi;
  });
  const postReadSummary = await getCiv7MapSummary({
    ...options,
    includeAreaRegionCounts: false,
  });
  const identityCheck = assertFullMapGridSummaryIdentityStable(summary, postReadSummary);

  return {
    host: lastGrid?.host ?? summary.host,
    port: lastGrid?.port ?? summary.port,
    state: lastGrid?.state ?? summary.state,
    bounds,
    fields,
    plotCount: bounds.width * bounds.height,
    omitted,
    hiddenInfoPolicy,
    map: { width: mapWidth, height: mapHeight },
    summary,
    postReadSummary,
    identityCheck,
    chunks,
    plots,
  };
}

export async function getCiv7PlayerSummary(
  input: Civ7PlayerSummaryInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7PlayerSummaryResult> {
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildPlayerSummaryCommand({
      ...input,
      playerIds: input.playerIds?.map(validatePlayerId),
      maxItems: boundedInteger(input.maxItems ?? 64, 1, 512, "maxItems"),
    }),
  });
  return jsonPayloadFromCommandResult<Civ7PlayerSummaryResult>(result, "Civ7 player summary");
}

export async function getCiv7UnitSummary(
  input: Civ7UnitSummaryInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7UnitSummaryResult> {
  if (input.playerId !== undefined) validatePlayerId(input.playerId);
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildUnitSummaryCommand({
      ...input,
      playerIds: input.playerIds?.map(validatePlayerId),
      maxItems: boundedInteger(input.maxItems ?? 128, 1, 1_000, "maxItems"),
    }),
  });
  return jsonPayloadFromCommandResult<Civ7UnitSummaryResult>(result, "Civ7 unit summary");
}

export async function getCiv7CitySummary(
  input: Civ7CitySummaryInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7CitySummaryResult> {
  if (input.playerId !== undefined) validatePlayerId(input.playerId);
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildCitySummaryCommand({
      ...input,
      playerIds: input.playerIds?.map(validatePlayerId),
      maxItems: boundedInteger(input.maxItems ?? 128, 1, 1_000, "maxItems"),
    }),
  });
  return jsonPayloadFromCommandResult<Civ7CitySummaryResult>(result, "Civ7 city summary");
}

export async function getCiv7VisibilitySummary(
  input: Civ7VisibilitySummaryInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7VisibilitySummaryResult> {
  validatePlayerId(input.playerId);
  const maxPlots = boundedInteger(input.maxPlots ?? DEFAULT_CIV7_MAP_GRID_MAX_PLOTS, 1, HARD_CIV7_MAP_GRID_MAX_PLOTS, "maxPlots");
  if (input.includeGrid && !input.bounds) {
    throw new Civ7DirectControlError("command-failed", "Visibility grid reads require explicit bounds");
  }
  if (input.bounds) validateMapBounds(input.bounds);
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildVisibilitySummaryCommand({
      ...input,
      maxPlots,
    }),
  });
  return jsonPayloadFromCommandResult<Civ7VisibilitySummaryResult>(result, "Civ7 visibility summary");
}

export async function getCiv7GameInfoRows(
  input: Civ7GameInfoRowsInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7GameInfoRowsResult> {
  const table = validateIdentifier(input.table, "GameInfo table");
  const filterKey = input.filter ? validateIdentifier(input.filter.key, "GameInfo filter key") : undefined;
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildGameInfoRowsCommand({
      ...input,
      table,
      filter: input.filter && filterKey ? { ...input.filter, key: filterKey } : undefined,
      limit: boundedInteger(input.limit ?? DEFAULT_CIV7_GAMEINFO_LIMIT, 1, HARD_CIV7_GAMEINFO_LIMIT, "limit"),
      offset: boundedInteger(input.offset ?? 0, 0, 1_000_000, "offset"),
    }),
  });
  return jsonPayloadFromCommandResult<Civ7GameInfoRowsResult>(result, "Civ7 GameInfo rows");
}

export async function getCiv7SetupSnapshot(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7SetupSnapshotResult> {
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildSetupSnapshotCommand(),
  });
  return jsonPayloadFromCommandResult<Civ7SetupSnapshotResult>(result, "Civ7 setup snapshot");
}

export async function getCiv7SetupMapRows(
  input: Civ7SetupMapRowsInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7SetupMapRowsResult> {
  if (input.file !== undefined) validateMapScript(input.file);
  const limit = boundedInteger(input.limit ?? 100, 1, 1_000, "limit");
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildSetupMapRowsCommand({ ...input, limit }),
  });
  return jsonPayloadFromCommandResult<Civ7SetupMapRowsResult>(result, "Civ7 setup map rows");
}

export async function listCiv7SavedGameConfigurations(
  input: Civ7SavedGameConfigurationListInput = {},
): Promise<Civ7SavedGameConfigurationListResult> {
  const directory = resolve(input.directory ?? DEFAULT_CIV7_SINGLE_PLAYER_SAVE_DIR);
  const entries = await readdir(directory, { withFileTypes: true }).catch((err: unknown) => {
    if (isNodeNotFound(err)) return [];
    throw err;
  });
  const maxFiles = boundedInteger(input.maxFiles ?? 200, 1, 2_000, "maxFiles");
  const configurations: Civ7SavedGameConfiguration[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || extname(entry.name).toLowerCase() !== ".civ7cfg") continue;
    const filePath = join(directory, entry.name);
    configurations.push(await readCiv7SavedGameConfiguration(filePath));
    if (configurations.length >= maxFiles) break;
  }
  configurations.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt) || a.displayName.localeCompare(b.displayName));
  return { directory, configurations };
}

export async function loadCiv7SavedGameConfiguration(
  input: Civ7SavedGameConfigurationRef,
  options: Civ7DirectControlOptions = {},
  wait: { waitTimeoutMs?: number; pollIntervalMs?: number } = {},
): Promise<Civ7SavedGameConfigurationLoadResult> {
  const savedConfig = normalizeSavedGameConfigurationRef(input);
  const before = await getCiv7SetupSnapshot(options);
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildLoadSavedGameConfigurationCommand(savedConfig),
  });
  const waitTimeoutMs = wait.waitTimeoutMs ?? options.timeoutMs ?? 30_000;
  const pollIntervalMs = wait.pollIntervalMs ?? 1_000;
  const after = await waitForCiv7SetupRevisionAfter(before, options, { waitTimeoutMs, pollIntervalMs }).catch(async () => {
    await sleep(Math.min(1_000, pollIntervalMs));
    return getCiv7SetupSnapshot(options);
  });
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    savedConfig,
    before,
    after,
    command,
    loaded: command.output.some((line) => line.includes('"ok":true')),
  };
}

export async function ensureCiv7SetupMapRowVisible(
  input: Civ7SetupMapRowVisibilityInput,
  options: Civ7DirectControlOptions = {},
  approval?: Civ7ActionApproval,
): Promise<Civ7SetupMapRowVisibilityResult> {
  validateMapScript(input.file);
  const limit = boundedInteger(input.limit ?? 100, 1, 1_000, "limit");
  const rowInput = { file: input.file, limit };
  const initial = await getCiv7SetupMapRows(rowInput, options);
  if (initial.rows.length > 0 || input.reloadIfMissing !== "exit-to-shell") {
    return {
      initial,
      final: initial,
      refreshed: false,
      verified: initial.rows.length > 0,
    };
  }

  if (!approval) {
    throw new Civ7DirectControlError("command-failed", "Explicit approval is required before refreshing Civ7 setup map rows");
  }
  assertApproved(approval, "refreshing Civ7 setup map rows");
  const waitTimeoutMs = input.waitTimeoutMs ?? options.timeoutMs ?? 30_000;
  const pollIntervalMs = input.pollIntervalMs ?? 1_000;
  const shellBefore = await getCiv7SetupSnapshot(options).catch(() => undefined);
  const shellExit = shellBefore?.snapshot.phase === "shell"
    ? undefined
    : await executeCiv7AppUiCommand({
        ...options,
        command: CIV7_EXIT_TO_MAIN_MENU_COMMAND,
      });
  const shellAfter = await waitForCiv7SetupPhase("shell", options, { waitTimeoutMs, pollIntervalMs });
  const reload = await executeCiv7AppUiCommand({
    ...options,
    command: CIV7_RELOAD_UI_COMMAND,
  });
  const final = await waitForCiv7SetupMapRows(rowInput, options, { waitTimeoutMs, pollIntervalMs });
  return {
    initial,
    final,
    shellBefore,
    shellAfter,
    shellExit,
    reload,
    refreshed: true,
    verified: final.rows.length > 0,
  };
}

export async function prepareCiv7SinglePlayerSetup(
  input: Civ7SinglePlayerSetupInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7PreparedSetupResult> {
  assertApproved(approval, "preparing a Civ7 single-player setup");
  const normalized = normalizeSinglePlayerSetupInput(input);
  const savedConfigLoad = normalized.savedConfig
    ? await loadCiv7SavedGameConfiguration(normalized.savedConfig, options, {
        waitTimeoutMs: options.timeoutMs,
        pollIntervalMs: 1_000,
      })
    : undefined;
  if (savedConfigLoad && !savedConfigLoad.loaded) {
    throw new Civ7DirectControlError(
      "setup-config-load-failed",
      `Civ7 did not load saved configuration ${savedConfigLoad.savedConfig.fileName}`,
      { details: savedConfigLoad },
    );
  }
  const before = await getCiv7SetupSnapshot(options);
  if (normalized.requireShell !== false && before.snapshot.phase !== "shell") {
    throw new Civ7DirectControlError(
      "setup-phase-invalid",
      `Civ7 setup requires shell/main-menu phase; observed ${before.snapshot.phase}`,
      { details: before },
    );
  }

  const rowProof = findSetupMapRow(before.snapshot, normalized.mapScript);
  if (!rowProof) {
    throw new Civ7DirectControlError(
      "setup-map-row-missing",
      `Civ7 setup map row is not visible for ${normalized.mapScript}`,
      { details: before.snapshot.mapRows },
    );
  }

  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildPrepareSinglePlayerSetupCommand(normalized),
  });
  const payload = jsonPayloadFromCommandResult<{
    before: Civ7SetupSnapshot;
    after: Civ7SetupSnapshot;
    applied: Record<string, Civ7SetupOptionValue>;
  }>(command, "Civ7 setup preparation");
  const after = {
    host: command.host,
    port: command.port,
    state: command.state,
    snapshot: payload.after,
  };
  assertPreparedSetupMatches(normalized, after.snapshot);
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    before,
    after,
    command,
    ...(savedConfigLoad ? { savedConfigLoad } : {}),
    applied: payload.applied,
    verified: true,
  };
}

export async function startPreparedCiv7SinglePlayerGame(
  input: Civ7PreparedStartInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7SinglePlayerStartResult> {
  assertApproved(approval, "starting a prepared Civ7 single-player game");
  const expected = normalizeSinglePlayerSetupInput(input.expected);
  const before = await getCiv7SetupSnapshot(options);
  assertPreparedSetupMatches(expected, before.snapshot);

  const waitTimeoutMs = input.waitTimeoutMs ?? options.timeoutMs ?? 120_000;
  const pollIntervalMs = input.pollIntervalMs ?? 1_000;
  const session = new Civ7DirectControlSession(options);
  const observations: Civ7AppUiSnapshot[] = [];
  try {
    const command = await session.executeCommand({
      state: { role: "app-ui" },
      command: buildStartPreparedSinglePlayerCommand(),
      timeoutMs: options.timeoutMs,
    });
    const startPayload = jsonPayloadFromCommandResult<{ ok: unknown }>(command, "Civ7 prepared single-player start");
    if (startPayload.ok === false) {
      throw new Civ7DirectControlError("command-failed", "Civ7 Network.hostGame returned false", {
        details: { command, startPayload },
      });
    }

    let begin: Civ7CommandResult | undefined;
    let beginAttempted = false;
    let beginError: string | undefined;
    let finalAppUi: Civ7AppUiSnapshotResult | undefined;
    const startedAt = Date.now();
    while (Date.now() - startedAt <= waitTimeoutMs) {
      try {
        const snapshotResult = appUiSnapshotFromCommandResult(
          await executeSessionCommandWithReconnect(session, {
            state: { role: "app-ui" },
            command: buildAppUiSnapshotCommand(),
            timeoutMs: options.timeoutMs,
          }),
        );
        observations.push(snapshotResult.snapshot);
        const loadingState = probeValue(snapshotResult.snapshot.ui.loadingState);
        if (!beginAttempted && isCiv7BeginReadyLoadingState(loadingState)) {
          beginAttempted = true;
          try {
            begin = await executeSessionCommandWithReconnect(session, {
              state: { role: "app-ui" },
              command: CIV7_BEGIN_GAME_COMMAND,
              timeoutMs: options.timeoutMs,
            }, 1);
          } catch (err) {
            beginError = errorMessage(err);
            throw err;
          }
        }
        if (
          loadingState === CIV7_UI_LOADING_STATES.GameStarted &&
          snapshotResult.snapshot.ui.inGame.ok &&
          snapshotResult.snapshot.ui.inGame.value
        ) {
          finalAppUi = snapshotResult;
          break;
        }
      } catch (err) {
        if (beginError) throw err;
        await session.close();
      }
      await sleep(pollIntervalMs);
    }

    if (!finalAppUi) {
      throw new Civ7DirectControlError(
        "setup-start-timeout",
        `Timed out waiting for Civ7 to start prepared single-player game after ${waitTimeoutMs}ms`,
        { details: { before, observations, beginAttempted, beginError } },
      );
    }

    const tunerHealth = input.waitForTuner
      ? await waitForCiv7TunerReadyWithSession(session, { timeoutMs: options.timeoutMs, waitTimeoutMs, pollIntervalMs })
      : undefined;
    const mapSummary = input.waitForTuner
      ? await getCiv7MapSummary({ ...options, timeoutMs: options.timeoutMs })
      : undefined;
    if (mapSummary) assertPostStartMatches(expected, mapSummary);

    return {
      command,
      begin,
      beginAttempted,
      beginError,
      before,
      finalAppUi,
      tunerHealth,
      mapSummary,
      observations,
      verified: mapSummary ? true : finalAppUi.snapshot.ui.inGame.ok && finalAppUi.snapshot.ui.inGame.value,
    };
  } finally {
    await session.close();
  }
}

export async function runCiv7SinglePlayerFromSetup(
  input: Civ7SinglePlayerRunInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7SinglePlayerRunResult> {
  assertApproved(approval, "running Civ7 single-player from setup");
  const normalized = normalizeSinglePlayerSetupInput(input);
  let shellExit: Civ7CommandResult | undefined;
  const initial = await getCiv7SetupSnapshot(options);
  if (initial.snapshot.phase !== "shell") {
    if (input.fromRunningGame !== "exit-to-shell") {
      throw new Civ7DirectControlError(
        "setup-phase-invalid",
        `Civ7 is ${initial.snapshot.phase}; pass fromRunningGame: "exit-to-shell" to leave the current game`,
        { details: initial },
      );
    }
    shellExit = await executeCiv7AppUiCommand({
      ...options,
      command: CIV7_EXIT_TO_MAIN_MENU_COMMAND,
    });
    await waitForCiv7SetupPhase("shell", options, {
      waitTimeoutMs: input.waitTimeoutMs ?? 120_000,
      pollIntervalMs: input.pollIntervalMs ?? 1_000,
    });
  }
  const prepare = await prepareCiv7SinglePlayerSetup(
    { ...normalized, requireShell: true },
    options,
    approval,
  );
  const start = await startPreparedCiv7SinglePlayerGame(
    {
      expected: normalized,
      waitForTuner: input.waitForTuner,
      waitTimeoutMs: input.waitTimeoutMs,
      pollIntervalMs: input.pollIntervalMs,
    },
    options,
    approval,
  );
  return {
    shellExit,
    prepare,
    start,
    verified: prepare.verified && start.verified,
  };
}

export async function inspectCiv7Root(
  input: Civ7RootInspectionInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7RootInspectionResult> {
  const roots = input.roots.map((root) => validateIdentifier(root, "runtime root"));
  if (roots.length === 0) {
    throw new Civ7DirectControlError("command-failed", "At least one runtime root is required");
  }
  const result = await executeCiv7Command({
    ...options,
    state: input.state ?? { role: "tuner" },
    command: buildBoundedRootInspectionCommand({
      ...input,
      roots,
      maxRoots: boundedInteger(input.maxRoots ?? 16, 1, 64, "maxRoots"),
      maxKeys: boundedInteger(input.maxKeys ?? DEFAULT_CIV7_ROOT_MAX_KEYS, 1, 1_000, "maxKeys"),
      maxMethods: boundedInteger(input.maxMethods ?? DEFAULT_CIV7_ROOT_MAX_METHODS, 1, 1_000, "maxMethods"),
    }),
  });
  return jsonPayloadFromCommandResult<Civ7RootInspectionResult>(result, "Civ7 root inspection");
}

export async function getCiv7AutoplayStatus(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7AutoplayStatusResult> {
  const snapshot = await getCiv7AppUiSnapshot(options);
  return {
    host: snapshot.host,
    port: snapshot.port,
    state: snapshot.state,
    autoplay: snapshot.snapshot.autoplay,
    game: snapshot.snapshot.game,
    gameContext: snapshot.snapshot.gameContext,
  };
}

export async function configureCiv7Autoplay(
  options: Civ7AutoplayOptions,
  approval: Civ7ActionApproval,
): Promise<Civ7AutoplayActionResult> {
  assertApproved(approval, "configuring Civ7 autoplay");
  const maxTurns = options.maxTurns ?? DEFAULT_CIV7_AUTOPLAY_MAX_TURNS;
  if (options.turns !== undefined) boundedInteger(options.turns, 1, maxTurns, "turns");
  if (options.observeAsPlayer !== undefined) validatePlayerId(options.observeAsPlayer);
  if (options.returnAsPlayer !== undefined) validatePlayerId(options.returnAsPlayer);
  const before = await getCiv7AutoplayStatus(options);
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildConfigureAutoplayCommand(options),
  });
  const after = await waitForCiv7AutoplayStatus(options, (status) => autoplayConfigMatches(status, options));
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    before,
    after,
    commands: [command],
    verified: autoplayConfigMatches(after, options),
  };
}

export async function startCiv7Autoplay(
  options: Civ7AutoplayOptions,
  approval: Civ7ActionApproval,
): Promise<Civ7AutoplayActionResult> {
  assertApproved(approval, "starting Civ7 autoplay");
  const maxTurns = options.maxTurns ?? DEFAULT_CIV7_AUTOPLAY_MAX_TURNS;
  if (options.turns !== undefined) boundedInteger(options.turns, 1, maxTurns, "turns");
  const before = await getCiv7AutoplayStatus(options);
  const commandOptions = {
    ...materializeAutoplayPlayerOptions(options, before),
    pause: options.pause ?? false,
  };
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildStartAutoplayCommand(commandOptions),
  });
  const after = await waitForCiv7AutoplayStatus(options, (status) => status.autoplay.isActive === true);
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    before,
    after,
    commands: [command],
    verified: after.autoplay.isActive === true,
  };
}

export async function stopCiv7Autoplay(
  options: Civ7AutoplayOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7AutoplayActionResult> {
  assertApproved(approval, "stopping Civ7 autoplay");
  const before = await getCiv7AutoplayStatus(options);
  const commandOptions = materializeAutoplayPlayerOptions(options, before);
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildStopAutoplayCommand(commandOptions),
  });
  const stopProof = await waitForCiv7AutoplayStop(options, commandOptions.returnAsPlayer);
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    before,
    after: stopProof.status,
    commands: [command],
    verified: stopProof.verified,
  };
}

export async function revealCiv7MapForPlayer(
  input: Readonly<{ playerId: number }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7RevealMapResult> {
  assertApproved(approval, "revealing the Civ7 map");
  if (!approval.disposableSession) {
    throw new Civ7DirectControlError("command-failed", "Map reveal requires disposableSession approval");
  }
  const playerId = validatePlayerId(input.playerId);
  const before = await getCiv7VisibilitySummary({ playerId }, options);
  const command = await executeCiv7TunerCommand({
    ...options,
    command: `Visibility.revealAllPlots(${playerId})`,
  });
  const after = await getCiv7VisibilitySummary({ playerId }, options);
  const beforeCount = probeValue(before.numPlotsRevealed);
  const afterCount = probeValue(after.numPlotsRevealed);
  const classification =
    beforeCount !== undefined && afterCount !== undefined && afterCount > beforeCount
      ? "revealed"
      : beforeCount !== undefined && afterCount !== undefined && afterCount === beforeCount
        ? "already-revealed"
        : "unverified";
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    playerId,
    before,
    after,
    command,
    classification,
  };
}

export async function getCiv7TurnCompletionStatus(
  options: Civ7DirectControlOptions = {},
): Promise<Civ7TurnCompletionStatusResult> {
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildTurnCompletionStatusCommand(),
  });
  return jsonPayloadFromCommandResult<Civ7TurnCompletionStatusResult>(result, "Civ7 turn completion status");
}

export async function getCiv7PlayNotificationView(
  options: Civ7DirectControlOptions & { maxNotifications?: number } = {},
): Promise<Civ7PlayNotificationViewResult> {
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildPlayNotificationViewCommand({ maxNotifications: options.maxNotifications }),
  });
  return jsonPayloadFromCommandResult<Civ7PlayNotificationViewResult>(result, "Civ7 play notification view");
}

export async function getCiv7NotificationDismissal(
  input: Civ7NotificationDismissInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7NotificationDismissalResult> {
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildNotificationDismissalCommand(input, { send: false }),
  });
  return jsonPayloadFromCommandResult<Civ7NotificationDismissalResult>(result, "Civ7 notification dismissal");
}

export async function requestCiv7NotificationDismissal(
  input: Civ7NotificationDismissInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7NotificationDismissalResult> {
  assertApproved(approval, "dismissing Civ7 notification");
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildNotificationDismissalCommand(input, { send: true, verificationAttempts: 1 }),
  });
  const initial = jsonPayloadFromCommandResult<Civ7NotificationDismissalResult>(result, "Civ7 notification dismissal");
  if (initial.verified || !initial.sent || initial.before.exists === false) return initial;
  return await waitForCiv7NotificationDismissal(input, options, initial);
}

export async function sendCiv7TurnComplete(
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7TurnCompletionActionResult> {
  assertApproved(approval, "sending Civ7 turn complete");
  const before = await getCiv7TurnCompletionStatus(options);
  if (probeValue(before.canEndTurn) !== true) {
    throw new Civ7DirectControlError("command-failed", "Civ7 turn complete is blocked by current game state", {
      details: before,
    });
  }
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: "GameContext.sendTurnComplete()",
  });
  const after = await getCiv7TurnCompletionStatus(options);
  const verified = probeValue(after.hasSentTurnComplete) === true || probeValue(after.turn) !== probeValue(before.turn);
  return { before, after, command, verified };
}

export async function sendCiv7TurnUnready(
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7TurnCompletionActionResult> {
  assertApproved(approval, "sending Civ7 turn unready");
  const before = await getCiv7TurnCompletionStatus(options);
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: "GameContext.sendUnreadyTurn()",
  });
  const after = await getCiv7TurnCompletionStatus(options);
  return { before, after, command, verified: probeValue(after.hasSentTurnComplete) === false };
}

export async function canStartCiv7UnitOperation(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7OperationValidationResult> {
  return await validateCiv7Operation("unit-operation", input, options);
}

export async function requestCiv7UnitOperation(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7Operation("unit-operation", input, options, approval);
}

export async function canStartCiv7UnitCommand(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7OperationValidationResult> {
  return await validateCiv7Operation("unit-command", input, options);
}

export async function requestCiv7UnitCommand(
  input: Civ7OperationInput & Readonly<{ unitId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7Operation("unit-command", input, options, approval);
}

export async function canStartCiv7CityOperation(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7OperationValidationResult> {
  return await validateCiv7Operation("city-operation", input, options);
}

export async function requestCiv7CityOperation(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7Operation("city-operation", input, options, approval);
}

export async function requestCiv7ProductionChoice(
  input: Civ7ProductionChoiceInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7ProductionChoiceResult> {
  assertApproved(approval, "choosing city production");
  assertCiv7ComponentId(input.cityId, "cityId");
  validateProductionChoiceArgs(input.args);
  const operationInput = {
    cityId: input.cityId,
    operationType: "BUILD",
    args: input.args,
  };
  const before = await canStartCiv7CityOperation(operationInput, options);
  if (!before.valid) {
    const snapshotPayload = await readCiv7ProductionChoicePayload(input, options);
    const productionPostcondition = productionPostconditionFor(
      "city-operation",
      operationInput,
      false,
      before,
      before,
      snapshotPayload.beforeProductionPostcondition,
      snapshotPayload.beforeProductionPostcondition,
    );
    return {
      before,
      after: before,
      sent: false,
      verified: false,
      productionPostcondition,
      payload: snapshotPayload,
    };
  }
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildProductionChoiceRequestCommand(input, { send: true }),
  });
  const payload = jsonPayloadFromCommandResult<Civ7ProductionChoiceCommandPayload>(command, "Civ7 production choice request");
  const afterBundle = await waitForCiv7ProductionChoiceAfter(input, options, before, payload.beforeProductionPostcondition);
  const productionPostcondition = productionPostconditionFor(
    "city-operation",
    operationInput,
    payload.sent === true,
    before,
    afterBundle.validation,
    payload.beforeProductionPostcondition,
    afterBundle.snapshot,
  );
  const verified = productionPostcondition?.classification !== "not-sent"
    && productionPostcondition?.classification !== "no-state-change"
    && productionPostcondition?.classification !== "production-state-changed-blocker-still-live";
  return {
    before,
    command,
    after: afterBundle.validation,
    sent: payload.sent === true,
    verified,
    productionPostcondition,
    payload: {
      ...payload,
      afterValidation: afterBundle.validation.result,
      afterProductionPostcondition: afterBundle.snapshot,
    },
  };
}

export async function canStartCiv7CityCommand(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7OperationValidationResult> {
  return await validateCiv7Operation("city-command", input, options);
}

export async function requestCiv7CityCommand(
  input: Civ7OperationInput & Readonly<{ cityId: Civ7ComponentId }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7Operation("city-command", input, options, approval);
}

export async function canStartCiv7PlayerOperation(
  input: Civ7OperationInput & Readonly<{ playerId: number }>,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7OperationValidationResult> {
  return await validateCiv7Operation("player-operation", input, options);
}

export async function requestCiv7PlayerOperation(
  input: Civ7OperationInput & Readonly<{ playerId: number }>,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7OperationRequestResult> {
  return await requestCiv7Operation("player-operation", input, options, approval);
}

export async function requestCiv7TechnologyChoiceCloseout(
  input: Civ7TechnologyChoiceCloseoutInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7TechnologyChoiceCloseoutResult> {
  assertApproved(approval, "choosing Civ7 technology node through App UI closeout");
  validatePlayerId(input.playerId);
  if (!Number.isInteger(input.node)) throw new Civ7DirectControlError("command-failed", "node must be an integer");
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildTechnologyChoiceCloseoutCommand(input),
  });
  const payload = jsonPayloadFromCommandResult<{
    sent?: boolean;
    chooseResult?: { ok?: boolean };
    clearTargetResult?: { ok?: boolean };
  }>(command, "Civ7 technology choice closeout");
  const sent = payload.sent === true;
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    command,
    payload,
    sent,
  };
}

export async function requestCiv7CultureChoiceCloseout(
  input: Civ7CultureChoiceCloseoutInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7CultureChoiceCloseoutResult> {
  assertApproved(approval, "choosing Civ7 culture node through App UI closeout");
  validatePlayerId(input.playerId);
  if (!Number.isInteger(input.node)) throw new Civ7DirectControlError("command-failed", "node must be an integer");
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildCultureChoiceCloseoutCommand(input),
  });
  const payload = jsonPayloadFromCommandResult<{
    sent?: boolean;
    chooseResult?: { ok?: boolean };
    clearTargetResult?: { ok?: boolean };
  }>(command, "Civ7 culture choice closeout");
  const sent = payload.sent === true;
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    command,
    payload,
    sent,
  };
}

export async function requestCiv7DiplomacyResponse(
  input: Civ7DiplomacyResponseInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7DiplomacyResponseResult> {
  assertApproved(approval, "responding to diplomatic action");
  validatePlayerId(input.playerId);
  if (!Number.isInteger(input.actionId)) throw new Civ7DirectControlError("command-failed", "actionId must be an integer");
  if (!Number.isInteger(input.responseType)) throw new Civ7DirectControlError("command-failed", "responseType must be an integer");
  const before = await getCiv7PlayNotificationView(options);
  const playerId = before.localPlayerId;
  const operationInput = {
    playerId,
    operationType: "RESPOND_DIPLOMATIC_ACTION",
    args: { ID: input.actionId, Type: input.responseType },
  };
  const beforeValidation = await canStartCiv7PlayerOperation(operationInput, options);
  if (!beforeValidation.valid) {
    return {
      before,
      beforeValidation,
      after: before,
      afterValidation: beforeValidation,
      sent: false,
      verified: false,
      postcondition: {
        classification: "not-sent",
        reason: "RESPOND_DIPLOMATIC_ACTION did not validate, so no diplomatic response was sent.",
      },
    };
  }
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildDiplomacyResponseCloseoutCommand({ ...input, playerId }),
  });
  const payload = jsonPayloadFromCommandResult<Civ7DiplomacyResponseCommandPayload>(command, "Civ7 diplomacy response closeout");
  const after = await waitForCiv7DiplomacyResponseAfter(input, options, before, beforeValidation);
  const afterValidation = await canStartCiv7PlayerOperation(operationInput, options);
  const postcondition = diplomacyResponsePostcondition(input, payload.sent === true, before, after, beforeValidation, afterValidation);
  return {
    before,
    beforeValidation,
    command,
    payload,
    after,
    afterValidation,
    sent: payload.sent === true,
    verified: postcondition.classification !== "not-sent" && postcondition.classification !== "no-state-change",
    postcondition,
  };
}

export async function requestCiv7NarrativeChoice(
  input: Civ7NarrativeChoiceInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7NarrativeChoiceResult> {
  assertApproved(approval, "choosing a narrative story direction");
  validatePlayerId(input.playerId);
  if (!input.targetType) throw new Civ7DirectControlError("command-failed", "targetType is required");
  assertCiv7ComponentId(input.target, "target");
  if (!Number.isInteger(input.action)) throw new Civ7DirectControlError("command-failed", "action must be an integer");
  const before = await getCiv7PlayNotificationView(options);
  const operationInput = {
    playerId: input.playerId,
    operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
    args: {
      TargetType: input.targetType,
      Target: input.target,
      Action: input.action,
    },
  };
  const beforeValidation = await canStartCiv7PlayerOperation(operationInput, options);
  if (!beforeValidation.valid) {
    return {
      before,
      beforeValidation,
      after: before,
      afterValidation: beforeValidation,
      sent: false,
      verified: false,
      postcondition: {
        classification: "not-sent",
        reason: "CHOOSE_NARRATIVE_STORY_DIRECTION did not validate, so no narrative choice was sent.",
      },
    };
  }
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildNarrativeChoiceRequestCommand(input),
  });
  const payload = jsonPayloadFromCommandResult<Civ7NarrativeChoiceCommandPayload>(command, "Civ7 narrative choice request");
  const after = await waitForCiv7NarrativeChoiceAfter(input, options, before, beforeValidation);
  const afterValidation = await canStartCiv7PlayerOperation(operationInput, options);
  const postcondition = narrativeChoicePostcondition(input, payload.sent === true, before, after, beforeValidation, afterValidation, payload);
  return {
    before,
    beforeValidation,
    command,
    payload,
    after,
    afterValidation,
    sent: payload.sent === true,
    verified: postcondition.classification !== "not-sent" && postcondition.classification !== "no-state-change",
    postcondition,
  };
}

export async function getCiv7UnitTargetAction(
  input: Civ7UnitTargetActionInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7UnitTargetActionResult> {
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildUnitTargetActionCommand(input, { send: false }),
  });
  return jsonPayloadFromCommandResult<Civ7UnitTargetActionResult>(result, "Civ7 unit target action");
}

export async function getCiv7ReadyUnitView(
  input: Civ7ReadyUnitViewInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7ReadyUnitViewResult> {
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildReadyUnitViewCommand({
      ...input,
      radius: boundedInteger(input.radius ?? 2, 0, 5, "radius"),
      maxOperations: boundedInteger(input.maxOperations ?? 96, 1, 256, "maxOperations"),
    }),
  });
  return jsonPayloadFromCommandResult<Civ7ReadyUnitViewResult>(result, "Civ7 ready unit view");
}

export async function getCiv7UnitMovePreview(
  input: Civ7UnitMovePreviewInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7UnitMovePreviewResult> {
  if (input.destination !== undefined) validateMapLocation(input.destination);
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildUnitMovePreviewCommand({
      ...input,
      maxPlots: boundedInteger(input.maxPlots ?? 80, 1, 512, "maxPlots"),
      maxPathPlots: boundedInteger(input.maxPathPlots ?? 32, 1, 256, "maxPathPlots"),
    }),
  });
  return jsonPayloadFromCommandResult<Civ7UnitMovePreviewResult>(result, "Civ7 unit move preview");
}

export async function getCiv7ReadyCityView(
  input: Civ7ReadyCityViewInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7ReadyCityViewResult> {
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildReadyCityViewCommand({
      ...input,
      maxOperations: boundedInteger(input.maxOperations ?? 96, 1, 256, "maxOperations"),
    }),
  });
  return jsonPayloadFromCommandResult<Civ7ReadyCityViewResult>(result, "Civ7 ready city view");
}

export async function getCiv7SettlementRecommendations(
  input: Civ7SettlementRecommendationInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7SettlementRecommendationResult> {
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildSettlementRecommendationsCommand({
      ...input,
      count: boundedInteger(input.count ?? 5, 1, 12, "count"),
    }),
  });
  return jsonPayloadFromCommandResult<Civ7SettlementRecommendationResult>(result, "Civ7 settlement recommendations");
}

export async function getCiv7TargetCandidates(
  input: Civ7TargetCandidatesInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7TargetCandidatesResult> {
  if (input.playerId !== undefined) validatePlayerId(input.playerId);
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildTargetCandidatesCommand({
      ...input,
      maxCandidates: boundedInteger(input.maxCandidates ?? 8, 1, 64, "maxCandidates"),
      maxPlayers: boundedInteger(input.maxPlayers ?? 32, 1, 128, "maxPlayers"),
      unitRadius: boundedInteger(input.unitRadius ?? 4, 0, 16, "unitRadius"),
    }),
  });
  return jsonPayloadFromCommandResult<Civ7TargetCandidatesResult>(result, "Civ7 target candidates");
}

export async function getCiv7TraditionsView(
  input: Civ7TraditionsViewInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7TraditionsViewResult> {
  if (input.playerId !== undefined) validatePlayerId(input.playerId);
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildTraditionsViewCommand(input),
  });
  return jsonPayloadFromCommandResult<Civ7TraditionsViewResult>(result, "Civ7 traditions view");
}

export async function getCiv7ProgressDashboard(
  input: Civ7ProgressDashboardInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7ProgressDashboardResult> {
  if (input.playerId !== undefined) validatePlayerId(input.playerId);
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildProgressDashboardCommand(input),
  });
  return jsonPayloadFromCommandResult<Civ7ProgressDashboardResult>(result, "Civ7 progress dashboard");
}

export async function getCiv7BattlefieldScan(
  input: Civ7BattlefieldScanInput = {},
  options: Civ7DirectControlOptions = {},
): Promise<Civ7BattlefieldScanResult> {
  if (input.playerId !== undefined) validatePlayerId(input.playerId);
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildBattlefieldScanCommand({
      ...input,
      radius: boundedInteger(input.radius ?? 8, 1, 32, "radius"),
      maxPlayers: boundedInteger(input.maxPlayers ?? 32, 1, 128, "maxPlayers"),
      maxUnits: boundedInteger(input.maxUnits ?? 80, 1, 256, "maxUnits"),
      maxCities: boundedInteger(input.maxCities ?? 32, 1, 128, "maxCities"),
    }),
  });
  return jsonPayloadFromCommandResult<Civ7BattlefieldScanResult>(result, "Civ7 battlefield scan");
}

export async function getCiv7DestinationAnalysis(
  input: Civ7DestinationAnalysisInput,
  options: Civ7DirectControlOptions = {},
): Promise<Civ7DestinationAnalysisResult> {
  if (input.playerId !== undefined) validatePlayerId(input.playerId);
  validateMapLocation(input.destination);
  if (input.origin !== undefined) validateMapLocation(input.origin);
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildDestinationAnalysisCommand({
      ...input,
      corridorRadius: boundedInteger(input.corridorRadius ?? 2, 0, 8, "corridorRadius"),
      destinationRadius: boundedInteger(input.destinationRadius ?? 4, 1, 16, "destinationRadius"),
      maxPlayers: boundedInteger(input.maxPlayers ?? 32, 1, 128, "maxPlayers"),
      maxUnits: boundedInteger(input.maxUnits ?? 96, 1, 256, "maxUnits"),
      maxCities: boundedInteger(input.maxCities ?? 40, 1, 128, "maxCities"),
    }),
  });
  return jsonPayloadFromCommandResult<Civ7DestinationAnalysisResult>(result, "Civ7 destination analysis");
}

export async function requestCiv7UnitTargetAction(
  input: Civ7UnitTargetActionInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
): Promise<Civ7UnitTargetActionResult> {
  assertApproved(approval, "sending Civ7 unit target action");
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildUnitTargetActionCommand(input, { send: true }),
  });
  const immediate = jsonPayloadFromCommandResult<Civ7UnitTargetActionResult>(result, "Civ7 unit target action");
  return await stabilizeCiv7UnitTargetAction(input, options, immediate);
}

async function stabilizeCiv7UnitTargetAction(
  input: Civ7UnitTargetActionInput,
  options: Civ7DirectControlOptions,
  immediate: Civ7UnitTargetActionResult,
): Promise<Civ7UnitTargetActionResult> {
  if (immediate.sent !== true || immediate.verification?.status !== "no-state-change") {
    return withUnitTargetVerificationSource(immediate, "immediate", 0, 0);
  }

  const startedAt = Date.now();
  let attempts = 0;
  let last = immediate;
  while (Date.now() - startedAt < DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_WAIT_MS) {
    const elapsed = Date.now() - startedAt;
    await sleep(Math.min(
      DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_POLL_INTERVAL_MS,
      Math.max(0, DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_WAIT_MS - elapsed),
    ));
    attempts += 1;
    const observed = await getCiv7UnitTargetAction(input, options);
    const reconciled = reconcilePolledUnitTargetAction(immediate, observed, attempts, Date.now() - startedAt);
    last = reconciled;
    if (reconciled.verified === true) return reconciled;
  }

  return {
    ...last,
    verification: last.verification
      ? {
          ...last.verification,
          source: "bounded-poll",
          attempts,
          observedAfterMs: Date.now() - startedAt,
          reason: "Bounded verification polling observed no unit or target-plot change after send; re-read current HUD and ready unit before repeating.",
        }
      : last.verification,
    notes: appendNote(last.notes, `Post-send verification polled ${attempts} time(s) for ${Date.now() - startedAt}ms before returning no-state-change.`),
  };
}

function reconcilePolledUnitTargetAction(
  immediate: Civ7UnitTargetActionResult,
  observed: Civ7UnitTargetActionResult,
  attempts: number,
  observedAfterMs: number,
): Civ7UnitTargetActionResult {
  const unitChanged = stableJson(immediate.beforeUnit) !== stableJson(observed.beforeUnit);
  const targetUnitsChanged = stableJson(immediate.beforeTargetUnits) !== stableJson(observed.beforeTargetUnits);
  if (!unitChanged && !targetUnitsChanged) {
    return withUnitTargetVerificationSource(immediate, "bounded-poll", attempts, observedAfterMs);
  }

  const requestedLocation = { x: immediate.target.x, y: immediate.target.y };
  const beforeLocation = locationFromUnitProbeValue(immediate.beforeUnit);
  const landedLocation = locationFromUnitProbeValue(observed.beforeUnit);
  const destinationReached = landedLocation ? sameMapLocation(landedLocation, requestedLocation) : null;
  const originChanged = beforeLocation && landedLocation ? !sameMapLocation(beforeLocation, landedLocation) : unitChanged;
  const operationType = immediate.selected?.operationType;
  const classification =
    operationType === "MOVE_TO" && destinationReached === true
      ? "target-reached"
      : operationType === "MOVE_TO" && originChanged && destinationReached === false
        ? "path-shortfall"
        : targetUnitsChanged
          ? "target-state-changed"
          : "unit-state-changed";

  return {
    ...immediate,
    afterUnit: observed.beforeUnit,
    afterTargetUnits: observed.beforeTargetUnits,
    verified: true,
    verification: {
      status: "verified",
      classification,
      unitChanged,
      targetUnitsChanged,
      destinationReached,
      requestedLocation,
      landedLocation,
      source: "bounded-poll",
      attempts,
      observedAfterMs,
      reason: unitTargetVerificationReason(classification),
    },
    notes: appendNote(immediate.notes, `Post-send verification stabilized after ${attempts} poll attempt(s) and ${observedAfterMs}ms.`),
  };
}

function withUnitTargetVerificationSource(
  result: Civ7UnitTargetActionResult,
  source: "immediate" | "bounded-poll",
  attempts: number,
  observedAfterMs: number,
): Civ7UnitTargetActionResult {
  if (!result.verification) return result;
  return {
    ...result,
    verification: {
      ...result.verification,
      source,
      attempts,
      observedAfterMs,
    },
  };
}

function unitTargetVerificationReason(classification: NonNullable<Civ7UnitTargetActionResult["verification"]>["classification"]): string {
  switch (classification) {
    case "target-reached":
      return "unit reached the requested target tile after bounded post-send polling";
    case "path-shortfall":
      return "unit moved after bounded post-send polling, but landed short of the requested target tile; re-read before issuing a follow-up move";
    case "target-state-changed":
      return "target-plot unit state changed after bounded post-send polling";
    case "unit-state-changed":
      return "unit state changed after bounded post-send polling";
    case "no-state-change":
      return "bounded post-send polling did not observe a unit or target-plot change";
    case "not-sent":
      return "read-only target resolution; use --send with an approval reason to mutate";
  }
}

function appendNote(notes: ReadonlyArray<string>, note: string): ReadonlyArray<string> {
  return notes.includes(note) ? notes : [...notes, note];
}

export function createStaticCiv7CapabilityCatalog(): Civ7CapabilityCatalog {
  return {
    generatedAt: new Date().toISOString(),
    source: "static",
    version: "direct-control-v1",
    entries: [
      ...STATIC_CIV7_CAPABILITY_ENTRIES,
      ...DEFAULT_CIV7_GAMEINFO_TABLES.map((table): Civ7CapabilityCatalogEntry => ({
        id: `gameinfo.${table}`,
        name: table,
        role: "tuner",
        kind: "gameinfo-table",
        owner: "@civ7/direct-control",
        risk: "read",
        provenance: ["DEFAULT_CIV7_GAMEINFO_TABLES", "capability-inventory"],
        confidence: "source",
        description: `Targeted GameInfo.${table} read surface.`,
      })),
    ],
  };
}

export async function generateCiv7CapabilityCatalog(
  options: Civ7CapabilityCatalogOptions = {},
): Promise<Civ7CapabilityCatalog> {
  const includeStatic = options.includeStatic !== false;
  const includeRuntime = options.includeRuntime !== false;
  const entries: Civ7CapabilityCatalogEntry[] = includeStatic
    ? [...createStaticCiv7CapabilityCatalog().entries]
    : [];
  if (includeRuntime) {
    const [appUi, tuner] = await Promise.all([
      inspectCiv7Root({
        state: { role: "app-ui" },
        roots: options.appUiRoots ?? DEFAULT_CIV7_CAPABILITY_APP_UI_ROOTS,
        maxRoots: 32,
        maxKeys: 128,
        maxMethods: 128,
        includeSignatures: false,
      }, options),
      inspectCiv7Root({
        state: { role: "tuner" },
        roots: options.tunerRoots ?? DEFAULT_CIV7_CAPABILITY_TUNER_ROOTS,
        maxRoots: 32,
        maxKeys: 128,
        maxMethods: 128,
        includeSignatures: false,
      }, options),
    ]);
    entries.push(...capabilityEntriesFromInspection(appUi, "app-ui"));
    entries.push(...capabilityEntriesFromInspection(tuner, "tuner"));
  }
  return dedupeCapabilityCatalog({
    generatedAt: new Date().toISOString(),
    source: includeStatic && includeRuntime ? "merged" : includeRuntime ? "runtime" : "static",
    version: "direct-control-v1",
    entries,
  });
}

export async function loadCiv7OfficialResourceCapabilities(options: {
  resourcesRoot: string;
  maxFiles?: number;
}): Promise<ReadonlyArray<Civ7CapabilityCatalogEntry>> {
  const maxFiles = options.maxFiles ?? 2_000;
  const files = await listFiles(options.resourcesRoot, maxFiles);
  const patterns: ReadonlyArray<Readonly<{ id: string; label: string; pattern: RegExp; risk: Civ7CapabilityCatalogEntry["risk"] }>> = [
    { id: "official.Network.restartGame", label: "Network.restartGame", pattern: /Network\.restartGame/g, risk: "medium" },
    { id: "official.UI.notifyUIReady", label: "UI.notifyUIReady", pattern: /UI\.notifyUIReady/g, risk: "medium" },
    { id: "official.Autoplay", label: "Autoplay setters", pattern: /Autoplay\.set(?:Active|Turns|Pause|ObserveAsPlayer|ReturnAsPlayer)/g, risk: "medium" },
    { id: "official.GameContext.turn", label: "GameContext turn completion", pattern: /GameContext\.(?:sendTurnComplete|sendUnreadyTurn|hasSentTurnComplete)/g, risk: "medium" },
    { id: "official.Visibility.revealAllPlots", label: "Visibility.revealAllPlots", pattern: /Visibility\.revealAllPlots/g, risk: "high" },
    { id: "official.Game.UnitOperations", label: "Game.UnitOperations", pattern: /Game\.UnitOperations\.(?:canStart|sendRequest)/g, risk: "medium" },
    { id: "official.Game.CityOperations", label: "Game.CityOperations", pattern: /Game\.CityOperations\.(?:canStart|sendRequest)/g, risk: "medium" },
    { id: "official.Game.PlayerOperations", label: "Game.PlayerOperations", pattern: /Game\.PlayerOperations\.(?:canStart|sendRequest)/g, risk: "medium" },
  ];
  const found = new Map<string, Civ7CapabilityCatalogEntry>();
  for (const file of files) {
    if (!/\.(js|ts|xml|sql)$/i.test(file)) continue;
    const text = await readFile(file, "utf8").catch(() => "");
    for (const pattern of patterns) {
      if (!pattern.pattern.test(text)) continue;
      pattern.pattern.lastIndex = 0;
      found.set(pattern.id, {
        id: pattern.id,
        name: pattern.label,
        role: pattern.id.includes("Network") || pattern.id.includes("UI.") || pattern.id.includes("GameContext")
          ? "app-ui"
          : "tuner",
        kind: "method",
        owner: "official-resources",
        risk: pattern.risk,
        provenance: [file],
        confidence: "source",
      });
    }
  }
  return Array.from(found.values());
}

export type FileSnapshot = Readonly<{
  exists: boolean;
  size: number;
  mtimeMs: number;
  prefix: string;
  prefixBytes: number;
}>;

export type FreshLogMarkerProof = Readonly<{
  logPath: string;
  observedAt: string;
  startOffset: number;
  matched: ReadonlyArray<string>;
}>;

export async function snapshotFile(path: string): Promise<FileSnapshot> {
  const info = await stat(path).catch((err: unknown) => {
    if (isNodeNotFound(err)) return null;
    throw err;
  });
  return info
    ? {
        exists: true,
        size: info.size,
        mtimeMs: info.mtimeMs,
        ...(await filePrefixSnapshot(path, info.size)),
      }
    : { exists: false, size: 0, mtimeMs: 0, prefix: "", prefixBytes: 0 };
}

async function filePrefixSnapshot(path: string, size: number): Promise<Pick<FileSnapshot, "prefix" | "prefixBytes">> {
  const prefixBytes = Math.min(size, 4096);
  if (prefixBytes === 0) return { prefix: "", prefixBytes: 0 };
  const handle = await open(path, "r");
  try {
    const buffer = Buffer.alloc(prefixBytes);
    const { bytesRead } = await handle.read(buffer, 0, prefixBytes, 0);
    return {
      prefix: buffer.subarray(0, bytesRead).toString("utf8"),
      prefixBytes: bytesRead,
    };
  } finally {
    await handle.close();
  }
}

export function logTextFromSnapshot(args: {
  fullText: string;
  snapshot: FileSnapshot;
  current: FileSnapshot;
}): { text: string; startOffset: number; rewritten: boolean } {
  const { fullText, snapshot, current } = args;
  if (!snapshot.exists) return { text: fullText, startOffset: 0, rewritten: true };

  const rewritten = snapshot.prefixBytes > 0 && !fullText.startsWith(snapshot.prefix);
  if (rewritten) return { text: fullText, startOffset: 0, rewritten };
  if (current.size > snapshot.size) {
    return { text: fullText.slice(snapshot.size), startOffset: snapshot.size, rewritten: false };
  }
  if (current.mtimeMs > snapshot.mtimeMs) return { text: fullText, startOffset: 0, rewritten: true };
  return { text: "", startOffset: snapshot.size, rewritten: false };
}

export async function waitForFreshLogMarkers(options: {
  logPath: string;
  snapshot: FileSnapshot;
  markers: ReadonlyArray<string>;
  timeoutMs?: number;
  pollIntervalMs?: number;
  rejectPattern?: RegExp;
}): Promise<FreshLogMarkerProof> {
  const timeoutMs = options.timeoutMs ?? 90_000;
  const pollIntervalMs = options.pollIntervalMs ?? 1_000;
  const startedAt = Date.now();
  const snapshotOffset = options.snapshot.size;
  let lastStartOffset = snapshotOffset;
  let lastError: string | undefined;

  while (Date.now() - startedAt <= timeoutMs) {
    const current = await snapshotFile(options.logPath);
    if (current.exists && (current.size > snapshotOffset || current.mtimeMs > options.snapshot.mtimeMs)) {
      const fullText = await readFile(options.logPath, "utf8");
      const freshLog = logTextFromSnapshot({ fullText, snapshot: options.snapshot, current });
      lastStartOffset = freshLog.startOffset;
      const proof = matchOrderedMarkers(freshLog.text, options.markers);
      const rejected = options.rejectPattern?.exec(freshLog.text);
      if (rejected) lastError = `Log contains ${rejected[0]}`;
      if (proof.ok && !rejected) {
        return {
          logPath: options.logPath,
          observedAt: new Date().toISOString(),
          startOffset: freshLog.startOffset,
          matched: proof.matched,
        };
      }
    }
    await sleep(pollIntervalMs);
  }

  throw new Civ7DirectControlError(
    "log-timeout",
    lastError ?? `Timed out waiting for fresh log markers in ${options.logPath}`,
    { details: { markers: options.markers, startOffset: lastStartOffset, snapshotOffset } },
  );
}

async function openCiv7TunerSocket(options: {
  host: string;
  port: number;
  timeoutMs: number;
}): Promise<Socket> {
  return await new Promise<Socket>((resolve, reject) => {
    const socket = createConnection({ host: options.host, port: options.port });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(
        new Civ7DirectControlError(
          "connection-timeout",
          `Timed out connecting to Civ7 tuner socket ${options.host}:${options.port}`,
        ),
      );
    }, options.timeoutMs);
    socket.once("connect", () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once("error", (err) => {
      clearTimeout(timer);
      reject(
        new Civ7DirectControlError(
          "connection-failed",
          `Failed connecting to Civ7 tuner socket ${options.host}:${options.port}: ${err.message}`,
          { cause: err },
        ),
      );
    });
  });
}

async function sendCiv7TunerMessage(options: {
  socket: Socket;
  message: string;
  timeoutMs: number;
}): Promise<Civ7TunerFrame> {
  const listenerId = allocateListenerId();
  return await new Promise<Civ7TunerFrame>((resolve, reject) => {
    let buffer = Buffer.alloc(0);
    const timer = setTimeout(() => {
      cleanup();
      reject(
        new Civ7DirectControlError(
          "response-timeout",
          `Timed out waiting for Civ7 tuner response to ${options.message}`,
        ),
      );
    }, options.timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      options.socket.off("data", onData);
      options.socket.off("error", onError);
      options.socket.off("close", onClose);
    };
    const onError = (err: Error) => {
      cleanup();
      reject(new Civ7DirectControlError("connection-failed", err.message, { cause: err }));
    };
    const onClose = () => {
      cleanup();
      reject(
        new Civ7DirectControlError(
          "socket-closed",
          `Civ7 tuner socket closed while waiting for ${options.message}`,
        ),
      );
    };
    const onData = (chunk: Buffer) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const parsed = parseCiv7TunerFrame(buffer);
        if (!parsed) return;
        buffer = buffer.subarray(parsed.bytesRead);
        if (parsed.frame.listenerId === listenerId) {
          cleanup();
          resolve(parsed.frame);
          return;
        }
      }
    };
    options.socket.on("data", onData);
    options.socket.once("error", onError);
    options.socket.once("close", onClose);
    options.socket.write(encodeCiv7TunerRequest(listenerId, options.message));
  });
}

function normalizeStateSelection(selection: Civ7TunerStateSelection): { id?: string; name?: string } {
  if (typeof selection === "string") {
    return selection === CIV7_TUNER_APP_UI_STATE_NAME || selection === CIV7_TUNER_STATE_NAME
      ? { name: selection }
      : { id: selection, name: selection };
  }
  if (selection.role === "app-ui") return { name: CIV7_TUNER_APP_UI_STATE_NAME };
  if (selection.role === "tuner") return { name: CIV7_TUNER_STATE_NAME };
  return { id: selection.id, name: selection.name };
}

function allocateListenerId(): number {
  nextListenerId = (nextListenerId + 1) % 0xffff_ffff;
  if (nextListenerId <= 0) nextListenerId = 1;
  return nextListenerId;
}

function portFromEnv(env: NodeJS.ProcessEnv): number | undefined {
  if (!env.CIV7_TUNER_PORT) return undefined;
  const port = Number(env.CIV7_TUNER_PORT);
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Civ7DirectControlError("invalid-port", `Invalid CIV7_TUNER_PORT: ${env.CIV7_TUNER_PORT}`);
  }
  return port;
}

function splitEnvList(value: string | undefined): string[] {
  return value?.split(",").map((entry) => entry.trim()).filter(Boolean) ?? [];
}

function defaultRootsForSelection(selection: Civ7TunerStateSelection): ReadonlyArray<string> {
  const normalized = normalizeStateSelection(selection);
  return normalized.name === CIV7_TUNER_STATE_NAME ? DEFAULT_CIV7_TUNER_API_ROOTS : DEFAULT_CIV7_APP_UI_API_ROOTS;
}

function buildRuntimeApiInspectionCommand(roots: ReadonlyArray<string>): string {
  return `(() => {
    const roots = ${JSON.stringify(roots)};
    const methodMeta = (owner, target, key) => {
      try {
        const candidate = target == null ? undefined : target[key];
        if (typeof candidate !== "function") return null;
        return {
          name: key,
          owner,
          length: candidate.length,
          signature: Function.prototype.toString.call(candidate).slice(0, 160),
        };
      } catch (err) {
        return {
          name: key,
          owner,
          length: -1,
          signature: "",
          error: String(err),
        };
      }
    };
    const inspect = (name) => {
      try {
        const value = globalThis[name];
        const proto = value == null ? null : Object.getPrototypeOf(value);
        const ownKeys = value == null ? [] : Object.getOwnPropertyNames(value);
        const prototypeKeys = proto == null ? [] : Object.getOwnPropertyNames(proto);
        const enumerableKeys = [];
        if (value != null) {
          for (const key in value) enumerableKeys.push(key);
        }
        const methods = [
          ...ownKeys.map((key) => methodMeta("own", value, key)),
          ...prototypeKeys.filter((key) => key !== "constructor").map((key) => methodMeta("prototype", proto, key)),
        ].filter(Boolean);
        return {
          name,
          type: typeof value,
          exists: value !== undefined,
          ownKeys,
          prototypeKeys,
          enumerableKeys,
          methods,
        };
      } catch (err) {
        return {
          name,
          type: "unknown",
          exists: false,
          ownKeys: [],
          prototypeKeys: [],
          enumerableKeys: [],
          methods: [],
          error: String(err),
        };
      }
    };
    return JSON.stringify(roots.map(inspect));
  })()`;
}

function buildAppUiSnapshotCommand(): string {
  return `(() => {
    const g = globalThis;
    const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };
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

function buildTunerHealthCommand(): string {
  return `(() => {
    const g = globalThis;
    const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };
    const width = probe(() => g.GameplayMap.getGridWidth());
    const height = probe(() => g.GameplayMap.getGridHeight());
    const aliveIds = probe(() => g.Players.getAliveIds());
    const snapshot = {
      evalOk: 1 + 1,
      globals: {
        Game: typeof g.Game,
        Autoplay: typeof g.Autoplay,
        GameplayMap: typeof g.GameplayMap,
        Players: typeof g.Players,
        Network: typeof g.Network,
      },
      turn: probe(() => g.Game.turn),
      turnDate: probe(() => g.Game.getTurnDate()),
      width,
      height,
      aliveIds,
      aliveHumanIds: probe(() => g.Players.getAliveHumanIds()),
      autoplayActive: probe(() => g.Autoplay.isActive),
    };
    snapshot.ready =
      snapshot.evalOk === 2 &&
      snapshot.globals.Game === "object" &&
      snapshot.globals.GameplayMap === "object" &&
      snapshot.globals.Players === "object" &&
      width.ok &&
      width.value > 0 &&
      height.ok &&
      height.value > 0 &&
      aliveIds.ok &&
      Array.isArray(aliveIds.value);
    return JSON.stringify(snapshot);
  })()`;
}

function buildMapSummaryCommand(options: { includeAreaRegionCounts: boolean; maxIds: number }): string {
  return `(() => {
    ${probeHelperSource()}
    const cap = ${jsLiteral(options.maxIds)};
    const map = {
      width: probe(() => GameplayMap.getGridWidth()),
      height: probe(() => GameplayMap.getGridHeight()),
      plotCount: probe(() => GameplayMap.getPlotCount()),
      mapSize: probe(() => GameplayMap.getMapSize()),
      randomSeed: probe(() => GameplayMap.getRandomSeed()),
    };
    const game = {
      turn: probe(() => Game.turn),
      age: probe(() => Game.age),
      maxTurns: probe(() => Game.maxTurns),
      turnDate: probe(() => Game.getTurnDate()),
      hash: probe(() => Game.getHash()),
    };
    const limitIds = (probeResult) => {
      if (!probeResult.ok || !Array.isArray(probeResult.value)) return probeResult;
      return { ok: true, value: probeResult.value.slice(0, cap) };
    };
    const rawAreas = ${options.includeAreaRegionCounts}
      ? {
          areaIds: limitIds(probe(() => typeof MapAreas !== "undefined" ? MapAreas.getAreaIds() : [])),
          regionIds: limitIds(probe(() => typeof MapRegions !== "undefined" ? MapRegions.getRegionIds() : [])),
        }
      : undefined;
    const areas = rawAreas
      ? {
          ...rawAreas,
          truncated:
            (rawAreas.areaIds.ok && rawAreas.areaIds.value.length >= cap) ||
            (rawAreas.regionIds.ok && rawAreas.regionIds.value.length >= cap),
        }
      : undefined;
    return JSON.stringify({ map, game, ...(areas ? { areas } : {}) });
  })()`;
}

function buildPlotSnapshotCommand(input: Civ7PlotSnapshotInput & { fields: ReadonlyArray<Civ7PlotSnapshotField> }): string {
  return `(() => {
    ${plotSnapshotScriptSource()}
    return JSON.stringify(readPlotSnapshot(${jsLiteral(input)}));
  })()`;
}

function buildMapGridCommand(input: Civ7MapGridInput & {
  fields: ReadonlyArray<Civ7PlotSnapshotField>;
  maxPlots: number;
}): string {
  return `(() => {
    ${plotSnapshotScriptSource()}
    const input = ${jsLiteral(input)};
    const width = probe(() => GameplayMap.getGridWidth());
    const height = probe(() => GameplayMap.getGridHeight());
    const locationsFromBounds = (bounds, maxPlots) => {
      const out = [];
      outer: for (let y = bounds.y; y < bounds.y + bounds.height; y += 1) {
        for (let x = bounds.x; x < bounds.x + bounds.width; x += 1) {
          out.push({ x, y });
          if (out.length >= maxPlots) break outer;
        }
      }
      return out;
    };
    const maxPlots = input.maxPlots;
    const requestedCount = input.locations ? input.locations.length : input.bounds.width * input.bounds.height;
    const locations = input.locations ? input.locations.slice(0, maxPlots) : locationsFromBounds(input.bounds, maxPlots);
    return JSON.stringify({
      bounds: input.bounds,
      fields: input.fields,
      plotCount: requestedCount,
      omitted: Math.max(0, requestedCount - locations.length),
      hiddenInfoPolicy: input.playerId === undefined ? "not-player-scoped" : input.includeHidden ? "include-hidden" : "visibility-filtered",
      map: { width, height },
      plots: locations.map((location) => readPlotSnapshot({ ...input, ...location })),
    });
  })()`;
}

function buildResourcePlacementFeasibilityCommand(input: {
  cells: ReadonlyArray<Civ7ResourcePlacementFeasibilityCellInput & {
    requestedResourceTypeCount: number;
  }>;
  requestedCellCount: number;
  maxResourceTypesPerCell: number;
  ignoreWeight: boolean;
}): string {
  return `(() => {
    ${probeHelperSource()}
    const input = ${jsLiteral(input)};
    const rb = typeof ResourceBuilder !== "undefined" ? ResourceBuilder : undefined;
    const canHaveResource = (x, y, resourceType) => {
      if (!rb || typeof rb.canHaveResource !== "function") {
        throw new Error("ResourceBuilder.canHaveResource is unavailable");
      }
      return rb.canHaveResource(x, y, resourceType, input.ignoreWeight === true);
    };
    const readResourcePlacementFeasibility = (cell) => {
      const resourceTypes = cell.resourceTypes.slice(0, input.maxResourceTypesPerCell);
      const feasibility = {};
      for (const resourceType of resourceTypes) {
        feasibility[String(resourceType)] = probe(() => canHaveResource(cell.x, cell.y, resourceType));
      }
      return {
        location: {
          x: cell.x,
          y: cell.y,
          index: probe(() => GameplayMap.getIndexFromXY(cell.x, cell.y)),
        },
        resourceTypes,
        omittedResourceTypes: Math.max(0, (cell.requestedResourceTypeCount ?? resourceTypes.length) - resourceTypes.length),
        feasibility,
      };
    };
    return JSON.stringify({
      cellCount: input.requestedCellCount,
      omittedCells: Math.max(0, input.requestedCellCount - input.cells.length),
      ignoreWeight: input.ignoreWeight === true,
      cells: input.cells.map((cell) => readResourcePlacementFeasibility(cell)),
    });
  })()`;
}

function buildFeaturePlacementFeasibilityCommand(input: {
  cells: ReadonlyArray<Civ7FeaturePlacementFeasibilityCellInput & {
    requestedFeatureTypeCount: number;
  }>;
  requestedCellCount: number;
  maxFeatureTypesPerCell: number;
}): string {
  return `(() => {
    ${probeHelperSource()}
    const input = ${jsLiteral(input)};
    const tb = typeof TerrainBuilder !== "undefined" ? TerrainBuilder : undefined;
    const canHaveFeature = (x, y, featureType) => {
      if (!tb || typeof tb.canHaveFeature !== "function") {
        throw new Error("TerrainBuilder.canHaveFeature is unavailable");
      }
      return tb.canHaveFeature(x, y, featureType);
    };
    const readFeaturePlacementFeasibility = (cell) => {
      const featureTypes = cell.featureTypes.slice(0, input.maxFeatureTypesPerCell);
      const feasibility = {};
      for (const featureType of featureTypes) {
        feasibility[String(featureType)] = probe(() => canHaveFeature(cell.x, cell.y, featureType));
      }
      return {
        location: {
          x: cell.x,
          y: cell.y,
          index: probe(() => GameplayMap.getIndexFromXY(cell.x, cell.y)),
        },
        featureTypes,
        omittedFeatureTypes: Math.max(0, (cell.requestedFeatureTypeCount ?? featureTypes.length) - featureTypes.length),
        feasibility,
      };
    };
    return JSON.stringify({
      cellCount: input.requestedCellCount,
      omittedCells: Math.max(0, input.requestedCellCount - input.cells.length),
      cells: input.cells.map((cell) => readFeaturePlacementFeasibility(cell)),
    });
  })()`;
}

function buildResourceBuilderDiagnosticsCommand(input: {
  cells: ReadonlyArray<Civ7ResourcePlacementFeasibilityCellInput & {
    requestedResourceTypeCount: number;
  }>;
  resourceTypes: ReadonlyArray<number>;
  requestedCellCount: number;
  maxResourceTypesPerCell: number;
}): string {
  return `(() => {
    ${probeHelperSource()}
    const input = ${jsLiteral(input)};
    const rb = typeof ResourceBuilder !== "undefined" ? ResourceBuilder : undefined;
    if (!rb) throw new Error("ResourceBuilder is unavailable");
    const toPlain = (row) => {
      if (row == null || typeof row !== "object") return row;
      try {
        return JSON.parse(JSON.stringify(row));
      } catch {
        const out = {};
        for (const key of Object.getOwnPropertyNames(row)) {
          try {
            const value = row[key];
            if (typeof value !== "function") out[key] = value;
          } catch {}
        }
        return out;
      }
    };
    const resourceRows = (() => {
      const table = typeof GameInfo !== "undefined" ? GameInfo.Resources : undefined;
      if (!table) return [];
      try {
        return Array.from(table).map((row) => toPlain(row));
      } catch {
        return [];
      }
    })();
    const resourceRowsByType = new Map();
    const resourceRowsByHash = new Map();
    for (const row of resourceRows) {
      const type = row?.$index ?? row?.Index ?? row?.ResourceType;
      if (Number.isInteger(type)) resourceRowsByType.set(type, row);
      const hash = row?.$hash ?? row?.Hash;
      if (Number.isInteger(hash)) resourceRowsByHash.set(hash, row);
    }
    const resourceTypes = [...new Set([...input.resourceTypes, ...input.cells.flatMap((cell) => cell.resourceTypes)])].sort((left, right) => left - right);
    const counts = probe(() => rb.getResourceCounts());
    const readCount = (resourceType) => {
      if (!counts.ok || !Array.isArray(counts.value)) return counts.ok ? { ok: false, error: "ResourceBuilder.getResourceCounts did not return an array" } : counts;
      return { ok: true, value: counts.value[resourceType] };
    };
    const readResource = (resourceType) => {
      const row = resourceRowsByType.get(resourceType);
      const hash = row?.$hash ?? row?.Hash;
      return {
        resourceType,
        row: row === undefined ? { ok: false, error: "GameInfo.Resources row not found" } : { ok: true, value: row },
        hash: Number.isInteger(hash) ? { ok: true, value: hash } : { ok: false, error: "GameInfo.Resources hash not found" },
        count: readCount(resourceType),
        landmass: probe(() => rb.getResourceLandmass(resourceType)),
        validForAge: probe(() => rb.isResourceValidForAge(resourceType)),
        requiredForAge: probe(() => rb.isResourceRequiredForAge(resourceType)),
        ignoringWeightForRiverPlacement: probe(() => rb.isResourceIgnoringWeightForRiverPlacement(resourceType)),
      };
    };
    const decodeCuts = (cutHashes) => cutHashes.map((hash) => {
      const row = resourceRowsByHash.get(hash);
      const type = row?.$index ?? row?.Index ?? row?.ResourceType;
      return {
        hash,
        ...(Number.isInteger(type) ? { resourceType: type } : {}),
        ...(typeof row?.ResourceType === "string" ? { resourceTypeName: row.ResourceType } : {}),
        ...(typeof row?.ResourceType === "string" ? {} : typeof row?.ResourceTypeName === "string" ? { resourceTypeName: row.ResourceTypeName } : {}),
        ...(row !== undefined ? { row } : {}),
      };
    });
    const readCellResource = (cell, resourceType) => {
      const cutHashes = probe(() => rb.getBestMapResourceCuts(cell.x, cell.y, resourceType));
      return {
        canHaveResource: {
          strict: probe(() => rb.canHaveResource(cell.x, cell.y, resourceType, false)),
          ignoreWeight: probe(() => rb.canHaveResource(cell.x, cell.y, resourceType, true)),
        },
        resourceLandmassAtCell: probe(() => rb.getResourceLandmass(cell.x, cell.y, resourceType)),
        bestMapResourceCutHashes: cutHashes,
        bestMapResourceCuts: cutHashes.ok && Array.isArray(cutHashes.value)
          ? { ok: true, value: decodeCuts(cutHashes.value) }
          : cutHashes.ok
            ? { ok: false, error: "ResourceBuilder.getBestMapResourceCuts did not return an array" }
            : cutHashes,
      };
    };
    const readCell = (cell) => {
      const resourceTypes = cell.resourceTypes.slice(0, input.maxResourceTypesPerCell);
      const resources = {};
      for (const resourceType of resourceTypes) resources[String(resourceType)] = readCellResource(cell, resourceType);
      return {
        location: {
          x: cell.x,
          y: cell.y,
          index: probe(() => GameplayMap.getIndexFromXY(cell.x, cell.y)),
        },
        resourceTypes,
        omittedResourceTypes: Math.max(0, (cell.requestedResourceTypeCount ?? resourceTypes.length) - resourceTypes.length),
        resources,
      };
    };
    return JSON.stringify({
      cellCount: input.requestedCellCount,
      omittedCells: Math.max(0, input.requestedCellCount - input.cells.length),
      resources: resourceTypes.map((resourceType) => readResource(resourceType)),
      cells: input.cells.map((cell) => readCell(cell)),
    });
  })()`;
}

function buildPlayerSummaryCommand(input: Civ7PlayerSummaryInput & { maxItems: number }): string {
  return `(() => {
    ${probeHelperSource()}
    ${runtimeObjectReaderSource()}
    const input = ${jsLiteral(input)};
    const ids = (input.playerIds ?? probe(() => Players.getAliveIds()).value ?? []).slice(0, input.maxItems);
    const summarize = (id) => {
      const player = probe(() => Players.get(id));
      const value = player.ok ? player.value : undefined;
      return {
        id,
        leaderName: probe(() => readValue(value, ["leaderName", "name"], ["getLeaderName", "getName"])),
        civilizationName: probe(() => readValue(value, ["civilizationName", "civilizationType"], ["getCivilizationName", "getCivilizationType"])),
        isHuman: probe(() => readValue(value, ["isHuman"], ["isHuman"])),
        isAlive: probe(() => readValue(value, ["isAlive"], ["isAlive"])),
        isTurnActive: probe(() => readValue(value, ["isTurnActive", "turnActive"], ["isTurnActive"])),
        unitIds: probe(() => Players.Units.get(id).getUnitIds().slice(0, input.maxItems)),
        cityIds: probe(() => Players.Cities.get(id).getCityIds().slice(0, input.maxItems)),
      };
    };
    return JSON.stringify({
      players: ids.map(summarize),
      omitted: Math.max(0, (input.playerIds?.length ?? ids.length) - ids.length),
    });
  })()`;
}

function buildUnitSummaryCommand(input: Civ7UnitSummaryInput & { maxItems: number }): string {
  return `(() => {
    ${probeHelperSource()}
    ${runtimeObjectReaderSource()}
    const input = ${jsLiteral(input)};
    const collectIds = () => {
      if (input.unitIds) return input.unitIds;
      const playerIds = input.playerIds ?? (input.playerId !== undefined ? [input.playerId] : Players.getAliveIds());
      const ids = [];
      for (const playerId of playerIds) {
        try {
          ids.push(...Players.Units.get(playerId).getUnitIds());
        } catch {}
      }
      return ids;
    };
    const ids = collectIds();
    const selected = ids.slice(0, input.maxItems);
    const summarize = (id) => {
      const unit = probe(() => Units.get(id));
      const value = unit.ok ? unit.value : undefined;
      return {
        id,
        owner: probe(() => readValue(value, ["owner", "player", "playerId"], ["getOwner", "getPlayer"])),
        name: probe(() => readValue(value, ["name"], ["getName"])),
        type: probe(() => readValue(value, ["type", "unitType"], ["getType", "getUnitType"])),
        location: probe(() => readValue(value, ["location"], ["getLocation"])),
        health: probe(() => readValue(value, ["health"], ["getHealth"])),
        damage: probe(() => readValue(value, ["damage"], ["getDamage"])),
        movement: probe(() => readValue(value, ["movement", "movesRemaining"], ["getMovement", "getMovesRemaining"])),
        activity: probe(() => readValue(value, ["activity", "activityType"], ["getActivityType"])),
      };
    };
    return JSON.stringify({ units: selected.map(summarize), omitted: Math.max(0, ids.length - selected.length) });
  })()`;
}

function buildCitySummaryCommand(input: Civ7CitySummaryInput & { maxItems: number }): string {
  return `(() => {
    ${probeHelperSource()}
    ${runtimeObjectReaderSource()}
    const input = ${jsLiteral(input)};
    const collectIds = () => {
      if (input.cityIds) return input.cityIds;
      const playerIds = input.playerIds ?? (input.playerId !== undefined ? [input.playerId] : Players.getAliveIds());
      const ids = [];
      for (const playerId of playerIds) {
        try {
          ids.push(...Players.Cities.get(playerId).getCityIds());
        } catch {}
      }
      return ids;
    };
    const ids = collectIds();
    const selected = ids.slice(0, input.maxItems);
    const summarize = (id) => {
      const city = probe(() => Cities.get(id));
      const value = city.ok ? city.value : undefined;
      return {
        id,
        owner: probe(() => readValue(value, ["owner", "player", "playerId"], ["getOwner", "getPlayer"])),
        name: probe(() => readValue(value, ["name"], ["getName"])),
        location: probe(() => readValue(value, ["location"], ["getLocation"])),
        population: probe(() => readValue(value, ["population"], ["getPopulation"])),
        growth: probe(() => readValue(value, ["growth"], ["getGrowth"])),
        production: probe(() => readValue(value, ["production"], ["getProduction", "getBuildQueue"])),
      };
    };
    return JSON.stringify({ cities: selected.map(summarize), omitted: Math.max(0, ids.length - selected.length) });
  })()`;
}

function buildVisibilitySummaryCommand(input: Civ7VisibilitySummaryInput & { maxPlots: number }): string {
  return `(() => {
    ${probeHelperSource()}
    const input = ${jsLiteral(input)};
    const readState = (x, y) => probe(() => GameplayMap.getRevealedState(input.playerId, x, y));
    const readVisible = (x, y) => probe(() => typeof Visibility !== "undefined" && typeof Visibility.isVisible === "function"
      ? Visibility.isVisible(input.playerId, x, y)
      : false);
    const counts = {};
    const statesFromBounds = () => {
      if (!input.bounds) return [];
      const out = [];
      outer: for (let y = input.bounds.y; y < input.bounds.y + input.bounds.height; y += 1) {
        for (let x = input.bounds.x; x < input.bounds.x + input.bounds.width; x += 1) {
          const state = readState(x, y);
          const key = state.ok ? String(state.value) : "error";
          counts[key] = (counts[key] ?? 0) + 1;
          out.push({ x, y, state, visible: readVisible(x, y) });
          if (out.length >= input.maxPlots) break outer;
        }
      }
      return out;
    };
    const gridStates = input.includeGrid ? statesFromBounds() : [];
    const requestedCount = input.bounds ? input.bounds.width * input.bounds.height : gridStates.length;
    return JSON.stringify({
      playerId: input.playerId,
      numPlotsRevealed: probe(() => typeof Visibility !== "undefined" && typeof Visibility.getPlotsRevealedCount === "function"
        ? Visibility.getPlotsRevealedCount(input.playerId)
        : Players.LiveOpsStats.get(input.playerId).numPlotsRevealed),
      numPlotsVisible: probe(() => typeof Visibility !== "undefined" && typeof Visibility.getPlotsVisibleCount === "function"
        ? Visibility.getPlotsVisibleCount(input.playerId)
        : 0),
      counts,
      ...(input.includeGrid ? {
        grid: {
          bounds: input.bounds,
          plotCount: requestedCount,
          omitted: Math.max(0, requestedCount - gridStates.length),
          states: gridStates,
        },
      } : {}),
    });
  })()`;
}

function buildGameInfoRowsCommand(input: Civ7GameInfoRowsInput & {
  table: string;
  limit: number;
  offset: number;
}): string {
  return `(() => {
    ${probeHelperSource()}
    const input = ${jsLiteral(input)};
    const toPlain = (row) => {
      if (row == null || typeof row !== "object") return row;
      try {
        return JSON.parse(JSON.stringify(row));
      } catch {
        const out = {};
        for (const key of Object.getOwnPropertyNames(row)) {
          try {
            const value = row[key];
            if (typeof value !== "function") out[key] = value;
          } catch {}
        }
        return out;
      }
    };
    const table = GameInfo[input.table];
    const allRows = (() => {
      if (!table) return [];
      if (input.lookup !== undefined) {
        const lookups = Array.isArray(input.lookup) ? input.lookup : [input.lookup];
        return lookups.map((key) => {
          if (typeof table.lookup === "function") return table.lookup(key);
          return Array.from(table).find((row) => row?.Type === key || row?.Hash === key || row?.Name === key || row?.ID === key);
        }).filter(Boolean);
      }
      return Array.from(table);
    })();
    const filtered = input.filter
      ? allRows.filter((row) => row != null && row[input.filter.key] === input.filter.equals)
      : allRows;
    const rows = filtered.slice(input.offset, input.offset + input.limit).map(toPlain);
    return JSON.stringify({
      table: input.table,
      source: "GameInfo",
      rows,
      limit: input.limit,
      offset: input.offset,
      total: { ok: true, value: filtered.length },
      omittedUnknown: filtered.length > input.offset + input.limit,
      ...(input.includeSchema ? { schema: probe(() => typeof Database !== "undefined" ? Database.getTableData(input.table) : undefined) } : {}),
      ...(input.includePrimaryKeys ? { primaryKeys: probe(() => typeof Database !== "undefined" ? Database.getPrimaryKeys(input.table) : undefined) } : {}),
    });
  })()`;
}

function buildSetupSnapshotCommand(): string {
  return `(() => {
    ${setupSnapshotScriptSource()}
    return JSON.stringify({ snapshot: readSetupSnapshot() });
  })()`;
}

function buildSetupMapRowsCommand(input: Civ7SetupMapRowsInput & { limit: number }): string {
  return `(() => {
    ${setupSnapshotScriptSource()}
    const input = ${jsLiteral(input)};
    const rows = readSetupMapRows(input.file).slice(0, input.limit);
    return JSON.stringify({
      rows,
      limit: input.limit,
      ...(input.file ? { matchedFile: input.file } : {}),
    });
  })()`;
}

function buildLoadSavedGameConfigurationCommand(input: Civ7SavedGameConfigurationRef): string {
  return `(() => {
    const input = ${jsLiteral(input)};
    const serverType = typeof ServerType !== "undefined" && ServerType && ServerType.SERVER_TYPE_NONE !== undefined
      ? ServerType.SERVER_TYPE_NONE
      : 0;
    const params = {
      Location: SaveLocations.LOCAL_STORAGE,
      LocationCategories: SaveLocationCategories.NORMAL,
      Type: SaveTypes.SINGLE_PLAYER,
      ContentType: SaveFileTypes.GAME_CONFIGURATION,
      FileName: input.fileName,
      DisplayName: input.displayName,
    };
    return JSON.stringify({
      ok: Network.loadGame(params, serverType),
      serverType,
      params,
    });
  })()`;
}

function buildPrepareSinglePlayerSetupCommand(input: Civ7SinglePlayerSetupInput): string {
  return `(() => {
    ${setupSnapshotScriptSource()}
    const input = ${jsLiteral(input)};
    const before = readSetupSnapshot();
    const applied = {};
    const setSetupParameter = (id, value) => {
      if (typeof GameSetup !== "undefined" && GameSetup && typeof GameSetup.setGameParameterValue === "function") {
        GameSetup.setGameParameterValue(id, value);
      }
    };
    const setPlayerSetupParameter = (playerId, id, value) => {
      if (typeof GameSetup !== "undefined" && GameSetup && typeof GameSetup.setPlayerParameterValue === "function") {
        GameSetup.setPlayerParameterValue(playerId, id, value);
      }
    };
    const editMap = Configuration.editMap();
    const editGame = Configuration.editGame();
    if (!editMap || !editGame) throw new Error("Configuration edit APIs are unavailable");
    editMap.setScript(input.mapScript);
    setSetupParameter("Map", input.mapScript);
    applied.Map = input.mapScript;
    editMap.setMapSize(input.mapSize);
    setSetupParameter("MapSize", input.mapSize);
    applied.MapSize = input.mapSize;
    editMap.setMapSeed(input.seed);
    setSetupParameter("MapRandomSeed", input.seed);
    applied.MapRandomSeed = input.seed;
    if (input.gameSeed !== undefined) {
      editGame.setGameSeed(input.gameSeed);
      setSetupParameter("GameRandomSeed", input.gameSeed);
      applied.GameRandomSeed = input.gameSeed;
    }
    if (input.playerCount !== undefined && typeof editMap.setMaxMajorPlayers === "function") {
      editMap.setMaxMajorPlayers(input.playerCount);
      applied.MaxMajorPlayers = input.playerCount;
    }
    for (const [key, value] of Object.entries(input.options ?? {})) {
      GameSetup.setGameParameterValue(key, value);
      applied[key] = value;
    }
    for (const player of input.playerOptions ?? []) {
      for (const [key, value] of Object.entries(player.options ?? {})) {
        setPlayerSetupParameter(player.playerId, key, value);
        applied["Player:" + player.playerId + ":" + key] = value;
      }
    }
    const after = readSetupSnapshot();
    return JSON.stringify({ before, after, applied });
  })()`;
}

function buildStartPreparedSinglePlayerCommand(): string {
  return `(() => {
    const serverType = typeof ServerType !== "undefined" && ServerType && ServerType.SERVER_TYPE_NONE !== undefined
      ? ServerType.SERVER_TYPE_NONE
      : 0;
    return JSON.stringify({
      ok: Network.hostGame(serverType),
      serverType,
    });
  })()`;
}

function setupSnapshotScriptSource(): string {
  return `${probeHelperSource()}
    const plain = (value) => {
      if (value == null) return value;
      if (typeof value !== "object") return value;
      try {
        return JSON.parse(JSON.stringify(value));
      } catch {
        const out = {};
        for (const key of Object.getOwnPropertyNames(value)) {
          try {
            const next = value[key];
            if (typeof next !== "function") out[key] = next;
          } catch {}
        }
        return out;
      }
    };
    const scalarValue = (value) => {
      if (value == null) return value;
      if (typeof value !== "object") return value;
      if (value.value !== undefined) return value.value;
      if (value.Value !== undefined) return value.Value;
      if (value.file !== undefined) return value.file;
      if (value.File !== undefined) return value.File;
      if (value.name !== undefined && typeof value.name !== "object") return value.name;
      if (value.Name !== undefined && typeof value.Name !== "object") return value.Name;
      return plain(value);
    };
    const rowFile = (row) => {
      if (row == null || typeof row !== "object") return typeof row === "string" ? row : undefined;
      return row.File ?? row.file ?? row.Value ?? row.value;
    };
    const mapRowFrom = (source, row) => {
      const file = rowFile(row);
      if (typeof file !== "string" || file.length === 0) return null;
      return {
        source,
        domain: row.Domain ?? row.domain,
        file,
        value: row.Value ?? row.value,
        name: row.Name ?? row.name,
        description: row.Description ?? row.description,
        sortIndex: row.SortIndex ?? row.sortIndex,
      };
    };
    const uniqueRows = (rows) => {
      const seen = new Set();
      const out = [];
      for (const row of rows) {
        if (!row || seen.has(row.source + ":" + row.file)) continue;
        seen.add(row.source + ":" + row.file);
        out.push(row);
      }
      return out;
    };
    const readParameter = (id) => {
      const parameter = typeof GameSetup !== "undefined" && GameSetup && typeof GameSetup.findGameParameter === "function"
        ? GameSetup.findGameParameter(id)
        : undefined;
      if (!parameter) return { id, exists: false };
      const possibleValues = parameter.domain && Array.isArray(parameter.domain.possibleValues)
        ? parameter.domain.possibleValues.map(plain)
        : [];
      return {
        id,
        exists: true,
        hidden: parameter.hidden,
        readOnly: parameter.readOnly,
        invalidReason: parameter.invalidReason ?? null,
        value: scalarValue(parameter.value),
        rawValue: plain(parameter.value),
        possibleValues,
      };
    };
    const readPlayerParameter = (playerId, id) => {
      const parameter = typeof GameSetup !== "undefined" && GameSetup && typeof GameSetup.findPlayerParameter === "function"
        ? GameSetup.findPlayerParameter(playerId, id)
        : undefined;
      if (!parameter) return { id, exists: false };
      const possibleValues = parameter.domain && Array.isArray(parameter.domain.possibleValues)
        ? parameter.domain.possibleValues.map(plain)
        : [];
      return {
        id,
        exists: true,
        hidden: parameter.hidden,
        readOnly: parameter.readOnly,
        invalidReason: parameter.invalidReason ?? null,
        value: scalarValue(parameter.value),
        rawValue: plain(parameter.value),
        possibleValues,
      };
    };
    const readLocalPlayerId = () => {
      const candidates = [
        () => GameContext.localPlayerID,
        () => PlayerIds.getLocalPlayerId(),
        () => Players.getLocalPlayer(),
      ];
      for (const read of candidates) {
        try {
          const value = read();
          if (Number.isInteger(value) && value >= 0) return value;
        } catch {}
      }
      return 0;
    };
    const readActivePlayerIds = () => {
      const ids = new Set();
      ids.add(readLocalPlayerId());
      try {
        const maxMajorPlayers = Number(Configuration.getMap().maxMajorPlayers);
        const max = Number.isInteger(maxMajorPlayers) && maxMajorPlayers > 0 ? Math.min(maxMajorPlayers, 64) : 0;
        for (let playerId = 0; playerId < max; playerId += 1) {
          const config = typeof Configuration.getPlayer === "function" ? Configuration.getPlayer(playerId) : null;
          const slotStatus = config?.slotStatus;
          const closed = typeof SlotStatus !== "undefined" && SlotStatus && slotStatus === SlotStatus.SS_CLOSED;
          if (!closed) ids.add(playerId);
        }
      } catch {}
      return Array.from(ids).filter((id) => Number.isInteger(id) && id >= 0).sort((a, b) => a - b);
    };
    const readSetupMapRows = (file) => {
      const rows = [];
      const mapParameter = readParameter("Map");
      for (const value of mapParameter.possibleValues ?? []) {
        const row = mapRowFrom("setup-domain", value);
        if (row && (!file || row.file === file || row.value === file)) rows.push(row);
      }
      try {
        if (typeof Database !== "undefined" && Database && typeof Database.query === "function") {
          const dbRows = Array.from(Database.query("config", "SELECT Domain, File, Name, Description, SortIndex FROM Maps"));
          for (const value of dbRows) {
            const row = mapRowFrom("config-db", value);
            if (row && (!file || row.file === file || row.value === file)) rows.push(row);
          }
        }
      } catch {}
      return uniqueRows(rows);
    };
    const readUi = () => {
      const loadingState = probe(() => UI.getGameLoadingState());
      return {
        inGame: probe(() => UI.isInGame()),
        inShell: probe(() => UI.isInShell()),
        inLoading: probe(() => UI.isInLoading()),
        loadingState,
        loadingStateName: (() => {
          try {
            const state = UI.getGameLoadingState();
            return typeof UIGameLoadingState !== "undefined"
              ? Object.entries(UIGameLoadingState).find(([, value]) => value === state)?.[0] ?? null
              : null;
          } catch {
            return null;
          }
        })(),
        canBeginGame: probe(() => {
          const state = UI.getGameLoadingState();
          return typeof UIGameLoadingState !== "undefined" &&
            (state === UIGameLoadingState.WaitingForUIReady || state === UIGameLoadingState.WaitingToStart);
        }),
      };
    };
    const phaseFromUi = (ui) => {
      if (ui.canBeginGame.ok && ui.canBeginGame.value === true) return "begin-ready";
      if (ui.inLoading.ok && ui.inLoading.value === true) return "loading";
      if (ui.inShell.ok && ui.inShell.value === true) return "shell";
      if (ui.inGame.ok && ui.inGame.value === true) return "running-game";
      return "unavailable";
    };
    const readSetupSnapshot = () => {
      const ui = readUi();
      const parameterIds = ${jsLiteral(DEFAULT_CIV7_SETUP_PARAMETER_IDS)};
      const parameters = parameterIds.map(readParameter);
      const playerParameterIds = ${jsLiteral(DEFAULT_CIV7_PLAYER_SETUP_PARAMETER_IDS)};
      const playerParameters = readActivePlayerIds().map((playerId) => ({
        playerId,
        parameters: playerParameterIds.map((id) => readPlayerParameter(playerId, id)),
      }));
      const mapParam = parameters.find((parameter) => parameter.id === "Map");
      const selectedFile = typeof mapParam?.value === "string" ? mapParam.value : undefined;
      const mapRows = readSetupMapRows();
      const selectedMapRow = selectedFile
        ? mapRows.find((row) => row.file === selectedFile || row.value === selectedFile)
        : undefined;
      return {
        phase: phaseFromUi(ui),
        ui,
        setup: {
          revision: probe(() => GameSetup.currentRevision),
          parameters,
          playerParameters,
          localPlayerId: probe(() => readLocalPlayerId()),
        },
        ...(selectedMapRow ? { selectedMapRow } : {}),
        mapRows,
        config: {
          mapScript: probe(() => Configuration.getMap().script),
          mapSize: probe(() => Configuration.getMap().mapSize),
          mapSeed: probe(() => Configuration.getMap().mapSeed),
          gameSeed: probe(() => Configuration.getGame().gameSeed),
          playerCount: probe(() => Configuration.getMap().maxMajorPlayers),
        },
      };
    };`;
}

function buildBoundedRootInspectionCommand(input: Civ7RootInspectionInput & {
  roots: ReadonlyArray<string>;
  maxRoots: number;
  maxKeys: number;
  maxMethods: number;
}): string {
  return `(() => {
    const input = ${jsLiteral(input)};
    const roots = input.roots.slice(0, input.maxRoots);
    let truncated = input.roots.length > roots.length;
    const cap = (items, max) => {
      if (items.length > max) truncated = true;
      return items.slice(0, max);
    };
    const methodMeta = (owner, target, key) => {
      try {
        const candidate = target == null ? undefined : target[key];
        if (typeof candidate !== "function") return null;
        return {
          name: key,
          owner,
          length: candidate.length,
          signature: input.includeSignatures ? Function.prototype.toString.call(candidate).slice(0, 160) : "",
        };
      } catch (err) {
        return { name: key, owner, length: -1, signature: "", error: String(err) };
      }
    };
    const inspect = (name) => {
      try {
        const value = globalThis[name];
        const proto = value == null ? null : Object.getPrototypeOf(value);
        const ownKeys = cap(value == null ? [] : Object.getOwnPropertyNames(value), input.maxKeys);
        const prototypeKeys = input.includePrototypeKeys === false ? [] : cap(proto == null ? [] : Object.getOwnPropertyNames(proto), input.maxKeys);
        const enumerableKeys = input.includeEnumerableKeys === true && value != null
          ? cap(Object.keys(value), input.maxKeys)
          : [];
        const methods = cap([
          ...ownKeys.map((key) => methodMeta("own", value, key)),
          ...prototypeKeys.filter((key) => key !== "constructor").map((key) => methodMeta("prototype", proto, key)),
        ].filter(Boolean), input.maxMethods);
        return { name, type: typeof value, exists: value !== undefined, ownKeys, prototypeKeys, enumerableKeys, methods };
      } catch (err) {
        return { name, type: "unknown", exists: false, ownKeys: [], prototypeKeys: [], enumerableKeys: [], methods: [], error: String(err) };
      }
    };
    return JSON.stringify({
      roots: roots.map(inspect),
      limits: {
        maxRoots: input.maxRoots,
        maxKeys: input.maxKeys,
        maxMethods: input.maxMethods,
        truncated,
      },
    });
  })()`;
}

function buildConfigureAutoplayCommand(options: Civ7AutoplayOptions): string {
  return `(() => {
    ${autoplaySetterSource(options)}
    return JSON.stringify({ ok: true, isActive: Autoplay.isActive, turns: Autoplay.turns });
  })()`;
}

function buildStartAutoplayCommand(options: Civ7AutoplayOptions): string {
  return `(() => {
    ${autoplaySetterSource(options)}
    Autoplay.setActive(true);
    return JSON.stringify({ ok: true, isActive: Autoplay.isActive, turns: Autoplay.turns });
  })()`;
}

function buildStopAutoplayCommand(options: Civ7AutoplayOptions): string {
  return `(() => {
    ${autoplayRestoreSetterSource(options)}
    Autoplay.setPause(true);
    Autoplay.setActive(false);
    return JSON.stringify({
      ok: true,
      isActive: Autoplay.isActive,
      turns: Autoplay.turns,
      isPaused: Autoplay.isPaused,
      isPausedOrPending: Autoplay.isPausedOrPending
    });
  })()`;
}

function buildTurnCompletionStatusCommand(): string {
  return `(() => {
    ${probeHelperSource()}
    return JSON.stringify({
      localPlayerId: GameContext.localPlayerID,
      turn: probe(() => Game.turn),
      turnDate: probe(() => Game.getTurnDate()),
      hasSentTurnComplete: probe(() => GameContext.hasSentTurnComplete()),
      canEndTurn: probe(() => typeof canEndTurn === "function" ? canEndTurn() : false),
      blocker: probe(() => typeof Game !== "undefined" && Game.Notifications && typeof Game.Notifications.getEndTurnBlockingType === "function"
        ? Game.Notifications.getEndTurnBlockingType(GameContext.localPlayerID)
        : "unknown"),
      firstReadyUnitId: probe(() => {
        const id = UI?.Player?.getFirstReadyUnit?.();
        if (!id || typeof id.owner !== "number" || typeof id.id !== "number") return null;
        const out = { owner: id.owner, id: id.id };
        if (typeof id.type === "number") out.type = id.type;
        return out;
      }),
    });
  })()`;
}

function buildPlayNotificationViewCommand(options: { maxNotifications?: number } = {}): string {
  const maxNotifications = options.maxNotifications ?? 25;
  return `(() => {
    ${playNotificationViewSource()}
    return JSON.stringify(readPlayNotifications(${jsLiteral({ maxNotifications })}));
  })()`;
}

function buildOperationValidationCommand(family: Civ7OperationFamily, input: Civ7OperationInput): string {
  return `(() => {
    ${operationRouterSource()}
    return JSON.stringify(validateOperation(${jsLiteral(family)}, ${jsLiteral(input)}));
  })()`;
}

function buildOperationRequestCommand(family: Civ7OperationFamily, input: Civ7OperationInput): string {
  return `(() => {
    ${operationRouterSource()}
    return JSON.stringify(sendOperation(${jsLiteral(family)}, ${jsLiteral(input)}));
  })()`;
}

function buildDiplomacyResponseCloseoutCommand(input: Civ7DiplomacyResponseInput): string {
  return `(() => {
    ${diplomacyResponseCloseoutSource()}
    return JSON.stringify(sendDiplomacyResponseCloseout(${jsLiteral(input)}));
  })()`;
}

function buildTechnologyChoiceCloseoutCommand(input: Civ7TechnologyChoiceCloseoutInput): string {
  return `(() => {
    ${technologyChoiceCloseoutSource()}
    return JSON.stringify(sendTechnologyChoiceCloseout(${jsLiteral(input)}));
  })()`;
}

function buildCultureChoiceCloseoutCommand(input: Civ7CultureChoiceCloseoutInput): string {
  return `(() => {
    ${cultureChoiceCloseoutSource()}
    return JSON.stringify(sendCultureChoiceCloseout(${jsLiteral(input)}));
  })()`;
}

function buildNarrativeChoiceRequestCommand(input: Civ7NarrativeChoiceInput): string {
  return `(() => {
    ${narrativeChoiceRequestSource()}
    return JSON.stringify(sendNarrativeChoice(${jsLiteral(input)}));
  })()`;
}

function buildProductionChoiceRequestCommand(input: Civ7ProductionChoiceInput, options: { send: boolean }): string {
  return `(() => {
    ${productionChoiceRequestSource()}
    return JSON.stringify(readProductionChoice(${jsLiteral(input)}, ${jsLiteral(options)}));
  })()`;
}

function buildUnitTargetActionCommand(input: Civ7UnitTargetActionInput, options: { send: boolean }): string {
  return `(() => {
    ${unitTargetActionSource()}
    return JSON.stringify(readUnitTargetAction(${jsLiteral(input)}, ${jsLiteral(options)}));
  })()`;
}

function buildReadyUnitViewCommand(input: Civ7ReadyUnitViewInput & { radius: number; maxOperations: number }): string {
  return `(() => {
    ${readyUnitViewSource()}
    return JSON.stringify(readReadyUnitView(${jsLiteral(input)}));
  })()`;
}

function buildUnitMovePreviewCommand(input: Civ7UnitMovePreviewInput & { maxPlots: number; maxPathPlots: number }): string {
  return `(() => {
    ${unitMovePreviewSource()}
    return JSON.stringify(readUnitMovePreview(${jsLiteral(input)}));
  })()`;
}

function buildReadyCityViewCommand(input: Civ7ReadyCityViewInput & { maxOperations: number }): string {
  return `(() => {
    ${readyCityViewSource()}
    return JSON.stringify(readReadyCityView(${jsLiteral(input)}));
  })()`;
}

function buildSettlementRecommendationsCommand(input: Civ7SettlementRecommendationInput & { count: number }): string {
  return `(() => {
    ${settlementRecommendationsSource()}
    return JSON.stringify(readSettlementRecommendations(${jsLiteral(input)}));
  })()`;
}

function buildTargetCandidatesCommand(input: Civ7TargetCandidatesInput & { maxCandidates: number; maxPlayers: number; unitRadius: number }): string {
  return `(() => {
    ${targetCandidatesSource()}
    return JSON.stringify(readTargetCandidates(${jsLiteral(input)}));
  })()`;
}

function buildTraditionsViewCommand(input: Civ7TraditionsViewInput): string {
  return `(() => {
    ${traditionsViewSource()}
    return JSON.stringify(readTraditionsView(${jsLiteral(input)}));
  })()`;
}

function buildProgressDashboardCommand(input: Civ7ProgressDashboardInput): string {
  return `(() => {
    ${progressDashboardSource()}
    return JSON.stringify(readProgressDashboard(${jsLiteral(input)}));
  })()`;
}

function buildBattlefieldScanCommand(input: Civ7BattlefieldScanInput & { radius: number; maxPlayers: number; maxUnits: number; maxCities: number }): string {
  return `(() => {
    ${battlefieldScanSource()}
    return JSON.stringify(readBattlefieldScan(${jsLiteral(input)}));
  })()`;
}

function buildDestinationAnalysisCommand(input: Civ7DestinationAnalysisInput & {
  corridorRadius: number;
  destinationRadius: number;
  maxPlayers: number;
  maxUnits: number;
  maxCities: number;
}): string {
  return `(() => {
    ${destinationAnalysisSource()}
    return JSON.stringify(readDestinationAnalysis(${jsLiteral(input)}));
  })()`;
}

function buildNotificationDismissalCommand(input: Civ7NotificationDismissInput, options: { send: boolean; verificationAttempts?: number }): string {
  return `(() => {
    ${notificationDismissalSource()}
    return JSON.stringify(readNotificationDismissal(${jsLiteral(input)}, ${jsLiteral(options)}));
  })()`;
}


function probeHelperSource(): string {
  return `const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };`;
}

function playNotificationViewSource(): string {
  return `${probeHelperSource()}
    const readNumericField = (value, lowerKey, upperKey) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value[lowerKey] === "number") return value[lowerKey];
      if (typeof value[upperKey] === "number") return value[upperKey];
      return null;
    };
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      const owner = readNumericField(value, "owner", "Owner");
      const id = readNumericField(value, "id", "ID");
      if (owner == null || id == null) return null;
      const out = { owner, id };
      const type = readNumericField(value, "type", "Type");
      if (type != null) out.type = type;
      return out;
    };
    const componentKey = (value) => {
      const id = toComponentId(value);
      return id ? [id.owner, id.id, id.type ?? ""].join(":") : "";
    };
    const pushUniqueId = (ids, id) => {
      const normalized = toComponentId(id);
      if (!normalized) return;
      const key = componentKey(normalized);
      if (!ids.some((existing) => componentKey(existing) === key)) ids.push(normalized);
    };
    const notificationIdsForPlayer = (playerId, maxNotifications) => {
      const ids = [];
      const filters = [undefined];
      if (typeof IgnoreNotificationType !== "undefined" && IgnoreNotificationType) {
        for (const key of Object.keys(IgnoreNotificationType)) filters.push(IgnoreNotificationType[key]);
      }
      for (const filter of filters) {
        try {
          const found = filter === undefined
            ? Game.Notifications.getIdsForPlayer(playerId)
            : Game.Notifications.getIdsForPlayer(playerId, filter);
          if (Array.isArray(found)) {
            for (const id of found) pushUniqueId(ids, id);
          }
        } catch {}
      }
      return ids.slice(0, maxNotifications);
    };
    const safeNotificationValue = (notification, key) => {
      try {
        const value = notification == null ? undefined : notification[key];
        if (typeof value === "function") return value.call(notification);
        return value === undefined ? null : value;
      } catch (err) {
        return { error: String(err) };
      }
    };
    const stringIncludes = (value, needle) => String(value ?? "").toUpperCase().includes(needle);
    const loc = (key) => {
      if (key == null || key === "") return null;
      try {
        return typeof Locale !== "undefined" && Locale.compose ? Locale.compose(key) : String(key);
      } catch {
        return String(key);
      }
    };
    const stylize = (text) => {
      if (text == null || text === "") return null;
      try {
        return typeof Locale !== "undefined" && Locale.stylize ? Locale.stylize(text) : String(text);
      } catch {
        return String(text);
      }
    };
    const enumValueFor = (enums, operationType) => {
      if (enums && Object.prototype.hasOwnProperty.call(enums, operationType)) return enums[operationType];
      if (enums && typeof operationType === "string") {
        const normalizedKeys = [
          operationType.replace(/^UNITOPERATION_/, ""),
          operationType.replace(/^UNITCOMMAND_/, ""),
          operationType.replace(/^CITYOPERATION_/, ""),
          operationType.replace(/^CITYCOMMAND_/, ""),
          operationType.replace(/^PLAYEROPERATION_/, ""),
        ];
        for (const key of normalizedKeys) {
          if (Object.prototype.hasOwnProperty.call(enums, key)) return enums[key];
        }
      }
      return operationType;
    };
    const successFromCanStart = (result) => {
      if (result === true) return true;
      if (result === false || result == null) return false;
      if (typeof result === "object") {
        if (result.Success !== undefined) return result.Success === true;
        if (result.success !== undefined) return result.success === true;
        if (result.canStart !== undefined) return result.canStart === true;
      }
      return Boolean(result);
    };
    const safeUnitSummary = (unitId) => {
      const unit = Units.get(unitId);
      if (!unit) return null;
      const type = unit.type ?? null;
      const typeDef = (() => {
        try {
          return type == null ? null : GameInfo.Units.lookup(type);
        } catch {
          return null;
        }
      })();
      return {
        id: toComponentId(unit.id ?? unitId),
        owner: unit.owner ?? unitId.owner ?? null,
        type,
        typeName: typeDef?.UnitType ?? null,
        name: typeof unit.getName === "function" ? unit.getName() : unit.name ?? typeDef?.Name ?? null,
        location: unit.location ?? null,
        movementMovesRemaining: unit.Movement?.movementMovesRemaining ?? null,
        movementTurnsRemaining: unit.Movement?.movementTurnsRemaining ?? null,
        attacksRemaining: unit.Combat?.attacksRemaining ?? null,
        activity: unit.Activity?.activityType ?? unit.activityType ?? null,
      };
    };
    const requiredInput = (name, source, note) => ({ name, source, required: true, note });
    const optionalInput = (name, source, note) => ({ name, source, required: false, note });
    const action = (label, cli, operationFamily, operationType, argsShape, when) => ({
      label,
      cli,
      operationFamily,
      operationType,
      argsShape,
      when,
    });
    const hint = (category, operationFamily, operationType, argsShape, cli, confidence, requiredInputs, commonActions, notes) => ({
      category,
      operationFamily,
      operationType,
      argsShape,
      cli,
      requiredInputs,
      commonActions,
      confidence,
      notes,
    });
    const isValidComponentId = (value) => {
      try {
        return !!(value && typeof ComponentID !== "undefined" && ComponentID.isValid(value));
      } catch {
        return false;
      }
    };
    const firstMeetDetailsFor = (notification, typeName) => {
      if (!stringIncludes(typeName, "PLAYER_MET") && !stringIncludes(typeName, "FIRST_MEET")) return undefined;
      const player1 = GameContext.localPlayerID;
      const rawPlayer2 = safeNotificationValue(notification, "Player");
      const player2 = Number.isFinite(Number(rawPlayer2)) ? Number(rawPlayer2) : null;
      const otherPlayer = player2 == null ? null : probe(() => {
        const player = Players.get(player2);
        if (!player) return null;
        const leader = GameInfo?.Leaders?.lookup?.(player.leaderType);
        const civilization = GameInfo?.Civilizations?.lookup?.(player.civilizationType);
        return {
          id: player2,
          name: player.name ?? null,
          leaderType: player.leaderType ?? null,
          leaderName: leader?.Name ?? leader?.LeaderType ?? null,
          civilizationType: player.civilizationType ?? null,
          civilizationName: civilization?.Name ?? civilization?.CivilizationType ?? null,
        };
      });
      const responseRows = [
        ["friendly", "PLAYER_REALATIONSHIP_FIRSTMEET_FRIENDLY"],
        ["neutral", "PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL"],
        ["unfriendly", "PLAYER_REALATIONSHIP_FIRSTMEET_UNFRIENDLY"],
      ];
      const responses = responseRows.map(([response, key]) => {
        const type = probe(() => (
          (typeof DiplomacyPlayerFirstMeets !== "undefined" ? DiplomacyPlayerFirstMeets?.[key] : undefined)
          ?? GameInfo?.Types?.lookup?.(key)?.Hash
          ?? null
        ));
        const typeValue = type.ok ? type.value : null;
        const costAndRelationship = Number.isFinite(Number(typeValue))
          ? probe(() => Game.Diplomacy.getFirstMeetResponseCostAndRelDelta(typeValue))
          : { ok: false, error: "first-meet response type unavailable" };
        const args = Number.isFinite(Number(typeValue)) && player2 != null
          ? { Player1: player1, Player2: player2, Type: typeValue }
          : null;
        const validation = args
          ? probe(() => Game.PlayerOperations.canStart(
            player1,
            PlayerOperationTypes.RESPOND_DIPLOMATIC_FIRST_MEET,
            args,
            false,
          ))
          : { ok: false, error: "missing Player2 or Type" };
        return {
          response,
          key,
          type,
          influenceCost: costAndRelationship.ok ? costAndRelationship.value?.[0] ?? null : null,
          relationshipDelta: costAndRelationship.ok ? costAndRelationship.value?.[1] ?? null : null,
          args,
          validation,
        };
      });
      return {
        kind: "first-meet-diplomacy",
        player1,
        player2,
        otherPlayer,
        responses,
        recommendedResponse: "neutral",
        recommendedCli: player2 == null
          ? null
          : "game play respond-first-meet --player-id " + String(player1) + " --met-player-id " + String(player2) + " --response neutral",
        note: "Neutral is the conservative default when Influence cost or payoff is not proven.",
      };
    };
    const diplomacyResponseDetailsFor = (notification, typeName, notificationId) => {
      if (!stringIncludes(typeName, "DIPLOMATIC_RESPONSE_REQUIRED")) return undefined;
      const target = safeNotificationValue(notification, "Target");
      const actionId = target && typeof target === "object" && typeof target.id === "number" ? target.id : null;
      const responseData = actionId == null
        ? { ok: false, error: "notification target does not include a diplomatic action id" }
        : probe(() => Game.Diplomacy.getResponseDataForUI(actionId));
      const eventData = actionId == null
        ? { ok: false, error: "notification target does not include a diplomatic action id" }
        : probe(() => Game.Diplomacy.getDiplomaticEventData(actionId));
      const responseList = responseData.ok && Array.isArray(responseData.value?.responseList)
        ? responseData.value.responseList
        : [];
      const options = responseList.map((response) => {
        const responseType = response?.responseType ?? null;
        const args = actionId == null || responseType == null ? null : { ID: actionId, Type: responseType };
        const validation = args
          ? probe(() => Game.PlayerOperations.canStart(
            GameContext.localPlayerID,
            PlayerOperationTypes.RESPOND_DIPLOMATIC_ACTION,
            args,
            false,
          ))
          : { ok: false, error: "missing action id or response type" };
        const enabled = validation.ok && (validation.value?.Success === true || validation.value?.canStart === true);
        return {
          responseType,
          title: loc(response?.titleString ?? response?.name ?? response?.Title ?? null),
          description: loc(response?.descriptionString ?? response?.Description ?? null),
          cost: response?.cost ?? null,
          icon: response?.icon ?? null,
          enabled,
          disabled: !enabled,
          validation,
          cli: enabled && actionId != null && responseType != null
            ? "game play respond-diplomacy --action-id " + actionId
              + " --response-type " + responseType
              + (notificationId ? " --notification-id '" + JSON.stringify(notificationId) + "'" : "")
              + " --send --reason '<why this response was selected>'"
            : null,
        };
      });
      return {
        kind: "diplomacy-response-options",
        actionId,
        notificationId,
        responseData,
        eventData,
        options,
        enabledOptions: options.filter((option) => option.enabled),
        disabledOptions: options.filter((option) => option.disabled),
        notes: [
          "Options mirror Game.Diplomacy.getResponseDataForUI(actionId).responseList and validate through the official local-player RESPOND_DIPLOMATIC_ACTION check.",
          "Use a returned enabled option's cli as the single caller-level response; send mode performs UI closeout and notification postcondition checks.",
        ],
      };
    };
    const diplomacyActionReportDetailsFor = (notification, typeName, notificationId) => {
      if (!stringIncludes(typeName, "DIPLOMATIC_ACTION")) return undefined;
      if (stringIncludes(typeName, "DIPLOMATIC_RESPONSE_REQUIRED")
        || stringIncludes(typeName, "DIPLOMATIC_ACTION_LOW")
        || stringIncludes(typeName, "DIPLOMATIC_ACTION_WARNING")
        || stringIncludes(typeName, "DIPLOMATIC_ACTION_ESPIONAGE")) return undefined;
      const target = safeNotificationValue(notification, "Target");
      const actionId = target && typeof target === "object" && typeof target.id === "number" ? target.id : null;
      const eventData = actionId == null
        ? { ok: false, error: "notification target does not include a diplomatic action id" }
        : probe(() => Game.Diplomacy.getDiplomaticEventData(actionId));
      const responseData = actionId == null
        ? { ok: false, error: "notification target does not include a diplomatic action id" }
        : probe(() => Game.Diplomacy.getResponseDataForUI(actionId));
      const responseList = responseData.ok && Array.isArray(responseData.value?.responseList)
        ? responseData.value.responseList
        : [];
      const options = responseList.map((response) => {
        const responseType = response?.responseType ?? null;
        const args = actionId == null || responseType == null ? null : { ID: actionId, Type: responseType };
        const validation = args
          ? probe(() => Game.PlayerOperations.canStart(
            GameContext.localPlayerID,
            PlayerOperationTypes.RESPOND_DIPLOMATIC_ACTION,
            args,
            false,
          ))
          : { ok: false, error: "missing action id or response type" };
        const enabled = validation.ok && (validation.value?.Success === true || validation.value?.canStart === true);
        return {
          responseType,
          title: loc(response?.titleString ?? response?.name ?? response?.Title ?? null),
          description: loc(response?.descriptionString ?? response?.Description ?? null),
          cost: response?.cost ?? null,
          enabled,
          disabled: !enabled,
          validation,
          cli: enabled && actionId != null && responseType != null
            ? "game play respond-diplomacy --action-id " + actionId
              + " --response-type " + responseType
              + (notificationId ? " --notification-id '" + JSON.stringify(notificationId) + "'" : "")
              + " --send --reason '<why this response was selected>'"
            : null,
        };
      });
      const enabledOptions = options.filter((option) => option.enabled);
      return {
        kind: "diplomatic-action-report",
        classification: enabledOptions.length > 0
          ? "diplomatic-action-response-options-present"
          : "diplomatic-action-report-no-enabled-response-options",
        actionId,
        notificationId,
        eventData,
        responseData,
        responseOptionCount: responseList.length,
        enabledResponseOptionCount: enabledOptions.length,
        options,
        enabledOptions,
        disabledOptions: options.filter((option) => option.disabled),
        notes: [
          "NOTIFICATION_DIPLOMATIC_ACTION uses the official InvestigateDiplomaticAction handler. Its target can be a real diplomatic event id, but that alone is not proof of a response-required operation.",
          "When getResponseDataForUI(actionId).responseList is empty or no options validate, treat this as a reviewed diplomatic action report closeout, not RESPOND_DIPLOMATIC_ACTION.",
        ],
      };
    };
    const technologyChoiceDetailsFor = (notification, typeName, notificationId) => {
      if (!stringIncludes(typeName, "CHOOSE_TECH")) return undefined;
      const localPlayerId = GameContext.localPlayerID;
      const techTrees = probe(() => {
        const trees = [];
        GameInfo.ProgressionTrees.forEach((tree) => {
          if (!stringIncludes(tree?.ProgressionTreeType, "TREE_TECHS")) return;
          const treeType = tree?.$hash ?? tree?.Hash ?? tree?.ProgressionTreeType;
          trees.push({
            treeType,
            treeTypeName: tree?.ProgressionTreeType ?? null,
            name: loc(tree?.Name ?? tree?.ProgressionTreeType ?? null),
            ageType: tree?.AgeType ?? null,
          });
        });
        return trees;
      });
      const currentResearching = probe(() => Players.get(localPlayerId)?.Techs?.getResearching?.() ?? null);
      const targetNode = probe(() => Players.get(localPlayerId)?.Techs?.getTargetNode?.() ?? null);
      const treeRows = techTrees.ok && Array.isArray(techTrees.value) ? techTrees.value : [];
      const options = [];
      for (const tree of treeRows) {
        const structure = probe(() => Game.ProgressionTrees.getTreeStructure(tree.treeType));
        const playerTree = probe(() => Game.ProgressionTrees.getTree(localPlayerId, tree.treeType));
        const playerNodes = playerTree.ok && Array.isArray(playerTree.value?.nodes) ? playerTree.value.nodes : [];
        const playerNodeByType = {};
        for (const node of playerNodes) {
          if (typeof node?.nodeType === "number") playerNodeByType[node.nodeType] = node;
        }
        const structureRows = structure.ok && Array.isArray(structure.value) ? structure.value : [];
        for (const structureNode of structureRows) {
          const nodeType = structureNode?.nodeType;
          if (!Number.isFinite(Number(nodeType))) continue;
          const numericNodeType = Number(nodeType);
          const nodeDef = probe(() => GameInfo.ProgressionTreeNodes.lookup(numericNodeType));
          const node = playerNodeByType[numericNodeType] ?? null;
          const args = { ProgressionTreeNodeType: numericNodeType };
          const chooseValidation = probe(() => Game.PlayerOperations.canStart(
            localPlayerId,
            PlayerOperationTypes.SET_TECH_TREE_NODE,
            args,
            false,
          ));
          const targetValidation = probe(() => Game.PlayerOperations.canStart(
            localPlayerId,
            PlayerOperationTypes.SET_TECH_TREE_TARGET_NODE,
            args,
            false,
          ));
          const chooseEnabled = chooseValidation.ok && successFromCanStart(chooseValidation.value);
          const targetEnabled = targetValidation.ok && successFromCanStart(targetValidation.value);
          const turns = probe(() => Players.get(localPlayerId)?.Techs?.getTurnsForNode?.(numericNodeType) ?? null);
          const cost = probe(() => Players.get(localPlayerId)?.Techs?.getNodeCost?.(numericNodeType) ?? null);
          const canEverUnlock = probe(() => Game.ProgressionTrees.canEverUnlock(localPlayerId, numericNodeType));
          const def = nodeDef.ok ? nodeDef.value : null;
          options.push({
            nodeType: numericNodeType,
            nodeTypeName: def?.ProgressionTreeNodeType ?? null,
            name: loc(def?.Name ?? def?.ProgressionTreeNodeType ?? null),
            description: loc(def?.Description ?? null),
            icon: def?.IconString ?? null,
            treeType: tree.treeType,
            treeTypeName: tree.treeTypeName,
            treeName: tree.name,
            ageType: tree.ageType,
            depth: structureNode?.treeDepth ?? node?.depth ?? null,
            state: node?.state ?? null,
            progress: node?.progress ?? null,
            maxDepth: node?.maxDepth ?? null,
            cost,
            turns,
            canEverUnlock,
            chooseEnabled,
            targetEnabled,
            disabled: !chooseEnabled,
            chooseValidation,
            targetValidation,
            cli: chooseEnabled
              ? "game play choose-tech --player-id " + String(localPlayerId)
                + " --node " + String(numericNodeType)
                + " --send --reason '<why this technology was selected>'"
              : null,
            validateCli: "game play choose-tech --player-id " + String(localPlayerId)
              + " --node " + String(numericNodeType) + " --json",
            targetCli: targetEnabled
              ? "game play set-tech-target --player-id " + String(localPlayerId)
                + " --node " + String(numericNodeType)
                + " --send --reason '<why this technology target was selected>'"
              : null,
          });
        }
      }
      const enabledOptions = options.filter((option) => option.chooseEnabled);
      enabledOptions.sort((left, right) => {
        const leftDepth = Number.isFinite(Number(left.depth)) ? Number(left.depth) : 999;
        const rightDepth = Number.isFinite(Number(right.depth)) ? Number(right.depth) : 999;
        if (leftDepth !== rightDepth) return leftDepth - rightDepth;
        return String(left.name ?? left.nodeTypeName ?? left.nodeType).localeCompare(String(right.name ?? right.nodeTypeName ?? right.nodeType));
      });
      const disabledOptions = options.filter((option) => !option.chooseEnabled);
      return {
        kind: "technology-choice-options",
        notificationId,
        localPlayerId,
        source: "GameInfo.ProgressionTrees + Game.ProgressionTrees + PlayerOperations.canStart",
        currentResearching,
        targetNode,
        techTrees,
        options,
        enabledOptions,
        disabledOptions,
        notes: [
          "Options are read from official progression-tree structures and validated through local-player SET_TECH_TREE_NODE and SET_TECH_TREE_TARGET_NODE checks.",
          "Use an enabled option's cli for one caller-level technology selection; choose-tech send mode clears the chooser target internally.",
        ],
      };
    };
    const cultureChoiceDetailsFor = (notification, typeName, notificationId) => {
      if (!stringIncludes(typeName, "CHOOSE_CULTURE")) return undefined;
      const localPlayerId = GameContext.localPlayerID;
      const currentResearching = probe(() => {
        const culture = Players.get(localPlayerId)?.Culture;
        const activeTree = culture?.getActiveTree?.();
        if (activeTree == null) return null;
        const tree = Game.ProgressionTrees.getTree(localPlayerId, activeTree);
        const activeNodeIndex = tree?.activeNodeIndex;
        return Number.isFinite(Number(activeNodeIndex)) && activeNodeIndex >= 0
          ? tree?.nodes?.[activeNodeIndex]?.nodeType ?? null
          : null;
      });
      const targetNode = probe(() => Players.get(localPlayerId)?.Culture?.getTargetNode?.() ?? null);
      const availableNodeTypes = probe(() => Players.get(localPlayerId)?.Culture?.getAllAvailableNodeTypes?.() ?? []);
      const options = [];
      const nodeRows = availableNodeTypes.ok && Array.isArray(availableNodeTypes.value)
        ? availableNodeTypes.value
        : [];
      for (const row of nodeRows) {
        const numericNodeType = Number(row?.type ?? row?.nodeType ?? row);
        if (!Number.isFinite(numericNodeType)) continue;
        const nodeDef = probe(() => GameInfo.ProgressionTreeNodes.lookup(numericNodeType));
        const node = probe(() => Game.ProgressionTrees.getNode(localPlayerId, numericNodeType));
        const def = nodeDef.ok ? nodeDef.value : null;
        const nodeValue = node.ok ? node.value : null;
        const treeType = def?.ProgressionTree ?? nodeValue?.treeType ?? null;
        const treeDef = treeType == null
          ? { ok: false, error: "culture node does not include ProgressionTree" }
          : probe(() => GameInfo.ProgressionTrees.lookup(treeType));
        const tree = treeDef.ok ? treeDef.value : null;
        const args = { ProgressionTreeNodeType: numericNodeType };
        const chooseValidation = probe(() => Game.PlayerOperations.canStart(
          localPlayerId,
          PlayerOperationTypes.SET_CULTURE_TREE_NODE,
          args,
          false,
        ));
        const targetValidation = probe(() => Game.PlayerOperations.canStart(
          localPlayerId,
          PlayerOperationTypes.SET_CULTURE_TREE_TARGET_NODE,
          args,
          false,
        ));
        const chooseEnabled = chooseValidation.ok && successFromCanStart(chooseValidation.value);
        const targetEnabled = targetValidation.ok && successFromCanStart(targetValidation.value);
        const turns = probe(() => Players.get(localPlayerId)?.Culture?.getTurnsForNode?.(numericNodeType) ?? null);
        const cost = probe(() => Players.get(localPlayerId)?.Culture?.getNodeCost?.(numericNodeType) ?? null);
        const canEverUnlock = probe(() => Game.ProgressionTrees.canEverUnlock(localPlayerId, numericNodeType));
        options.push({
          nodeType: numericNodeType,
          nodeTypeName: def?.ProgressionTreeNodeType ?? null,
          name: loc(def?.Name ?? def?.ProgressionTreeNodeType ?? null),
          description: loc(def?.Description ?? null),
          icon: def?.IconString ?? null,
          treeType,
          treeTypeName: tree?.ProgressionTreeType ?? null,
          treeName: loc(tree?.Name ?? tree?.ProgressionTreeType ?? null),
          ageType: tree?.AgeType ?? null,
          depth: nodeValue?.depth ?? nodeValue?.treeDepth ?? null,
          state: nodeValue?.state ?? null,
          progress: nodeValue?.progress ?? null,
          maxDepth: nodeValue?.maxDepth ?? null,
          cost,
          turns,
          canEverUnlock,
          chooseEnabled,
          targetEnabled,
          disabled: !chooseEnabled,
          chooseValidation,
          targetValidation,
          cli: chooseEnabled
            ? "game play choose-culture --player-id " + String(localPlayerId)
              + " --node " + String(numericNodeType)
              + " --send --closeout --reason '<why this culture node was selected>'"
            : null,
          validateCli: "game play choose-culture --player-id " + String(localPlayerId)
            + " --node " + String(numericNodeType) + " --json",
          targetCli: targetEnabled
            ? "game play set-culture-target --player-id " + String(localPlayerId)
              + " --node " + String(numericNodeType)
              + " --send --reason '<why this culture target was selected>'"
            : null,
        });
      }
      const enabledOptions = options.filter((option) => option.chooseEnabled);
      enabledOptions.sort((left, right) => {
        const leftDepth = Number.isFinite(Number(left.depth)) ? Number(left.depth) : 999;
        const rightDepth = Number.isFinite(Number(right.depth)) ? Number(right.depth) : 999;
        if (leftDepth !== rightDepth) return leftDepth - rightDepth;
        return String(left.name ?? left.nodeTypeName ?? left.nodeType).localeCompare(String(right.name ?? right.nodeTypeName ?? right.nodeType));
      });
      const disabledOptions = options.filter((option) => !option.chooseEnabled);
      return {
        kind: "culture-choice-options",
        notificationId,
        localPlayerId,
        source: "Players.Culture.getAllAvailableNodeTypes + Game.ProgressionTrees + PlayerOperations.canStart",
        currentResearching,
        targetNode,
        availableNodeTypes,
        options,
        enabledOptions,
        disabledOptions,
        notes: [
          "Options are read from the official culture chooser available-node list and validated through local-player SET_CULTURE_TREE_NODE and SET_CULTURE_TREE_TARGET_NODE checks.",
          "Use an enabled option's cli for one caller-level chooser closeout workflow; use validateCli when strategy needs inspection before sending.",
        ],
      };
    };
    const celebrationChoiceDetailsFor = (notification, typeName, notificationId) => {
      if (!stringIncludes(typeName, "CHOOSE_GOLDEN_AGE")) return undefined;
      const localPlayerId = GameContext.localPlayerID;
      const player = probe(() => Players.get(localPlayerId));
      const playerCulture = player.ok ? player.value?.Culture ?? null : null;
      const currentGovernmentType = probe(() => playerCulture?.getGovernmentType?.() ?? null);
      const goldenAgeDuration = probe(() => player.ok ? player.value?.Happiness?.getGoldenAgeDuration?.() ?? null : null);
      const choices = probe(() => playerCulture?.getGoldenAgeChoices?.() ?? []);
      const choiceRows = choices.ok && Array.isArray(choices.value) ? choices.value : [];
      const options = [];
      for (const choice of choiceRows) {
        const goldenAgeDef = probe(() => GameInfo.GoldenAges.lookup(choice)).value ?? null;
        const goldenAgeTypeName = goldenAgeDef?.GoldenAgeType ?? choice ?? null;
        const goldenAgeHash = goldenAgeTypeName == null
          ? { ok: false, error: "missing GoldenAgeType" }
          : probe(() => Database.makeHash(goldenAgeTypeName));
        const args = goldenAgeHash.ok && typeof goldenAgeHash.value === "number"
          ? { GoldenAgeType: goldenAgeHash.value }
          : null;
        const validation = args
          ? probe(() => Game.PlayerOperations.canStart(
            localPlayerId,
            PlayerOperationTypes.CHOOSE_GOLDEN_AGE,
            args,
            false,
          ))
          : { ok: false, error: "missing GoldenAgeType hash" };
        const enabled = validation.ok && successFromCanStart(validation.value);
        options.push({
          goldenAgeType: args?.GoldenAgeType ?? null,
          goldenAgeTypeName,
          sourceChoice: choice,
          name: loc(goldenAgeDef?.Name ?? goldenAgeTypeName),
          description: loc(goldenAgeDef?.Description ?? null),
          duration: goldenAgeDuration.ok ? goldenAgeDuration.value : null,
          currentGovernmentType: currentGovernmentType.ok ? currentGovernmentType.value : null,
          args,
          enabled,
          disabled: !enabled,
          validation,
          cli: enabled && args
            ? "game play choose-celebration --player-id " + String(localPlayerId)
              + " --golden-age-type " + String(args.GoldenAgeType)
              + " --send --reason '<why this celebration was selected>'"
            : null,
          validateCli: args
            ? "game play choose-celebration --player-id " + String(localPlayerId)
              + " --golden-age-type " + String(args.GoldenAgeType)
              + " --json"
            : null,
        });
      }
      const enabledOptions = options.filter((option) => option.enabled);
      enabledOptions.sort((left, right) => String(left.name ?? left.goldenAgeTypeName ?? left.goldenAgeType)
        .localeCompare(String(right.name ?? right.goldenAgeTypeName ?? right.goldenAgeType)));
      const disabledOptions = options.filter((option) => option.disabled);
      return {
        kind: "celebration-choice-options",
        notificationId,
        localPlayerId,
        source: "Players.Culture.getGoldenAgeChoices + GameInfo.GoldenAges + PlayerOperations.canStart",
        currentGovernmentType,
        goldenAgeDuration,
        choices,
        options,
        enabledOptions,
        disabledOptions,
        notes: [
          "Options mirror the official celebration chooser and validate local-player CHOOSE_GOLDEN_AGE with the hashed GoldenAgeType.",
          "This surface is read-only and does not rank celebration choices; choose based on current strategy, then re-read blockers after sending.",
        ],
      };
    };
    const governmentChoiceDetailsFor = (notification, typeName, notificationId) => {
      if (!stringIncludes(typeName, "CHOOSE_GOVERNMENT")) return undefined;
      const localPlayerId = GameContext.localPlayerID;
      const activate = typeof PlayerOperationParameters !== "undefined" ? PlayerOperationParameters.Activate : null;
      const currentGovernmentType = probe(() => Players.get(localPlayerId)?.Culture?.getGovernmentType?.() ?? null);
      const goldenAgeDuration = probe(() => Players.get(localPlayerId)?.Happiness?.getGoldenAgeDuration?.() ?? null);
      const options = [];
      const startingGovernments = probe(() => {
        const rows = [];
        GameInfo.StartingGovernments.forEach((startingGovernmentDef) => rows.push(startingGovernmentDef));
        return rows;
      });
      const startingRows = startingGovernments.ok && Array.isArray(startingGovernments.value)
        ? startingGovernments.value
        : [];
      for (const startingGovernmentDef of startingRows) {
        const governmentType = startingGovernmentDef?.GovernmentType ?? null;
        const governmentDef = governmentType == null
          ? null
          : probe(() => GameInfo.Governments.lookup(governmentType)).value ?? null;
        const governmentIndex = governmentDef?.$index ?? null;
        const args = governmentIndex == null || activate == null
          ? null
          : { GovernmentType: governmentIndex, Action: activate };
        const validation = args
          ? probe(() => Game.PlayerOperations.canStart(
            localPlayerId,
            PlayerOperationTypes.CHANGE_GOVERNMENT,
            args,
            false,
          ))
          : { ok: false, error: "missing government type or activate action" };
        const enabled = validation.ok && successFromCanStart(validation.value);
        const celebrationTypes = governmentDef?.GovernmentType == null
          ? { ok: false, error: "missing government definition" }
          : probe(() => Game.Culture.GetCelebrationTypesForGovernment(governmentDef.GovernmentType));
        const celebrationRows = celebrationTypes.ok && Array.isArray(celebrationTypes.value)
          ? celebrationTypes.value.map((goldenAgeType) => {
            const goldenAgeDef = probe(() => GameInfo.GoldenAges.lookup(goldenAgeType)).value ?? null;
            return {
              goldenAgeType,
              typeName: goldenAgeDef?.GoldenAgeType ?? null,
              name: loc(goldenAgeDef?.Name ?? goldenAgeDef?.GoldenAgeType ?? null),
              description: loc(goldenAgeDef?.Description ?? null),
              duration: goldenAgeDuration.ok ? goldenAgeDuration.value : null,
            };
          })
          : [];
        options.push({
          governmentType: governmentIndex,
          governmentTypeName: governmentDef?.GovernmentType ?? governmentType,
          name: loc(governmentDef?.Name ?? governmentDef?.GovernmentType ?? governmentType),
          description: loc(governmentDef?.Description ?? null),
          startingGovernmentType: governmentType,
          action: activate,
          args,
          celebrationOptions: celebrationRows,
          enabled,
          disabled: !enabled,
          validation,
          cli: enabled && governmentIndex != null && activate != null
            ? "game play choose-government --player-id " + String(localPlayerId)
              + " --government-type " + String(governmentIndex)
              + " --action " + String(activate)
              + " --send --reason '<why this government was selected>'"
            : null,
          validateCli: governmentIndex != null
            ? "game play choose-government --player-id " + String(localPlayerId)
              + " --government-type " + String(governmentIndex)
              + (activate != null ? " --action " + String(activate) : "")
              + " --json"
            : null,
        });
      }
      const enabledOptions = options.filter((option) => option.enabled);
      const disabledOptions = options.filter((option) => option.disabled);
      return {
        kind: "government-choice-options",
        notificationId,
        localPlayerId,
        source: "GameInfo.StartingGovernments + GameInfo.Governments + PlayerOperations.canStart",
        currentGovernmentType,
        startingGovernments,
        action: activate,
        goldenAgeDuration,
        options,
        enabledOptions,
        disabledOptions,
        notes: [
          "Options mirror the official government picker and validate local-player CHANGE_GOVERNMENT with PlayerOperationParameters.Activate.",
          "Celebration options are read for context; choosing a government is the single caller-level operation.",
        ],
      };
    };
    const narrativeChoiceDetailsFor = (notification, typeName, notificationId) => {
      if (!stringIncludes(typeName, "CHOOSE_NARRATIVE_STORY_DIRECTION")
        && !stringIncludes(typeName, "CHOOSE_DISCOVERY_STORY_DIRECTION")
        && !stringIncludes(typeName, "CHOOSE_AUTO_NARRATIVE_STORY_DIRECTION")
        && !stringIncludes(typeName, "CHOOSE_STORY_DIRECTION")) return undefined;
      const localPlayerId = GameContext.localPlayerID;
      const notificationOwner = toComponentId(notificationId)?.owner ?? localPlayerId;
      const activate = typeof PlayerOperationParameters !== "undefined" ? PlayerOperationParameters.Activate : null;
      const storyTextTypesAvailable = typeof StoryTextTypes !== "undefined";
      const playerStories = probe(() => Players.get(notificationOwner)?.Stories ?? null);
      const pendingStoryId = probe(() => playerStories.ok ? playerStories.value?.getFirstPendingMetId?.() ?? null : null);
      const pendingDiscoveryStoryId = probe(() => playerStories.ok ? playerStories.value?.getFirstPendingDiscoveryLastMetID?.() ?? null : null);
      const targetStoryIdSource = stringIncludes(typeName, "CHOOSE_DISCOVERY_STORY_DIRECTION")
        ? (pendingDiscoveryStoryId.ok && pendingDiscoveryStoryId.value ? "Players.Stories.getFirstPendingDiscoveryLastMetID" : "Players.Stories.getFirstPendingMetId")
        : "Players.Stories.getFirstPendingMetId";
      const targetStoryId = targetStoryIdSource === "Players.Stories.getFirstPendingDiscoveryLastMetID" ? pendingDiscoveryStoryId : pendingStoryId;
      const targetStory = probe(() => targetStoryId.ok && targetStoryId.value && playerStories.ok
        ? playerStories.value?.find?.(targetStoryId.value) ?? null
        : null);
      const storyDef = probe(() => targetStory.ok && targetStory.value
        ? GameInfo.NarrativeStories.lookup(targetStory.value.type)
        : null);
      const storyLinks = probe(() => storyDef.ok && storyDef.value
        ? GameInfo.NarrativeStory_Links.filter((def) => def.FromNarrativeStoryType == storyDef.value.NarrativeStoryType)
        : []);
      const textFor = (target, toHash, textTypeName) => {
        if (!playerStories.ok || !target || !storyTextTypesAvailable) return null;
        const textType = StoryTextTypes[textTypeName];
        if (textType == null) return null;
        if (toHash == null) return stylize(playerStories.value?.determineNarrativeInjectionComponentId?.(target, textType));
        return stylize(playerStories.value?.determineNarrativeInjection?.(target, toHash, textType));
      };
      const visiblePanel = probe(() => {
        const root = typeof document !== "undefined" ? document.querySelector?.("small-narrative-event") : null;
        const component = root?._component ?? null;
        const visibleTarget = toComponentId(component?.targetStoryId);
        const buttons = typeof document !== "undefined"
          ? Array.from(document.querySelectorAll?.("fxs-reward-button[small-narrative-choice-key]") ?? [])
          : [];
        return {
          panelType: root?.tagName ?? null,
          componentType: component?.constructor?.name ?? null,
          targetStoryId: visibleTarget,
          storyType: component?.storyType ?? null,
          options: buttons.map((button) => ({
            targetType: button.getAttribute("small-narrative-choice-key"),
            name: button.getAttribute("main-text"),
            reward: button.getAttribute("reward"),
            actionText: button.getAttribute("action-text"),
            icons: button.getAttribute("icons"),
            storyType: button.getAttribute("story-type"),
          })).filter((option) => option.targetType),
        };
      });
      const options = [];
      const target = targetStoryId.ok ? targetStoryId.value : null;
      const linkRows = storyLinks.ok && Array.isArray(storyLinks.value) ? storyLinks.value : [];
      for (const link of linkRows) {
        const linkDef = probe(() => GameInfo.NarrativeStories.lookup(link.ToNarrativeStoryType));
        const toLinkDef = linkDef.ok ? linkDef.value : null;
        if (!toLinkDef) continue;
        const activation = String(toLinkDef.Activation ?? "").toUpperCase();
        const requisiteOk = activation === "LINKED_REQUISITE"
          ? probe(() => playerStories.ok ? playerStories.value?.determineRequisiteLink?.(toLinkDef.NarrativeStoryType) === true : false)
          : { ok: true, value: true };
        const activationEnabled = activation === "LINKED" || (activation === "LINKED_REQUISITE" && requisiteOk.ok && requisiteOk.value === true);
        if (!activationEnabled) continue;
        const canAfford = probe(() => toLinkDef.Cost === 0 || (playerStories.ok && playerStories.value?.canAfford?.(toLinkDef.NarrativeStoryType) === true));
        const args = target && activate != null
          ? { TargetType: link.ToNarrativeStoryType, Target: target, Action: activate }
          : null;
        const validation = args
          ? probe(() => Game.PlayerOperations.canStart(
            localPlayerId,
            PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION,
            args,
            false,
          ))
          : { ok: false, error: "missing target story id or activate action" };
        const enabled = activationEnabled
          && canAfford.ok
          && canAfford.value === true
          && validation.ok
          && successFromCanStart(validation.value);
        const targetJson = target ? JSON.stringify(target) : null;
        options.push({
          targetType: link.ToNarrativeStoryType,
          targetTypeName: toLinkDef.NarrativeStoryType ?? link.ToNarrativeStoryType,
          target,
          action: activate,
          activation,
          name: textFor(target, toLinkDef.$hash ?? -1, "OPTION") ?? loc(toLinkDef.Name ?? toLinkDef.NarrativeStoryType ?? link.ToNarrativeStoryType),
          reward: textFor(target, toLinkDef.$hash ?? -1, "REWARD"),
          imperative: textFor(target, toLinkDef.$hash ?? -1, "IMPERATIVE"),
          cost: toLinkDef.Cost ?? null,
          canAfford,
          args,
          enabled,
          disabled: !enabled,
          validation,
          cli: enabled && targetJson
            ? "game play choose-narrative --player-id " + String(localPlayerId)
              + " --target-type " + String(link.ToNarrativeStoryType)
              + " --target '" + targetJson + "'"
              + " --action " + String(activate)
              + " --send --reason '<why this narrative option was selected>'"
            : null,
          validateCli: targetJson
            ? "game play choose-narrative --player-id " + String(localPlayerId)
              + " --target-type " + String(link.ToNarrativeStoryType)
              + " --target '" + targetJson + "'"
              + (activate != null ? " --action " + String(activate) : "")
              + " --json"
            : null,
        });
      }
      if (options.length === 0 && target) {
        const args = activate == null ? null : { TargetType: "CLOSE", Target: target, Action: activate };
        const validation = args
          ? probe(() => Game.PlayerOperations.canStart(
            localPlayerId,
            PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION,
            args,
            false,
          ))
          : { ok: false, error: "missing activate action" };
        const enabled = validation.ok && successFromCanStart(validation.value);
        const targetJson = JSON.stringify(target);
        options.push({
          targetType: "CLOSE",
          targetTypeName: "CLOSE",
          target,
          action: activate,
          activation: "CLOSE",
          name: loc("LOC_NARRATIVE_STORY_END_STORY_NAME") ?? "Close",
          reward: textFor(target, null, "REWARD"),
          imperative: null,
          cost: 0,
          canAfford: { ok: true, value: true },
          args,
          enabled,
          disabled: !enabled,
          validation,
          cli: enabled
            ? "game play choose-narrative --player-id " + String(localPlayerId)
              + " --target-type CLOSE"
              + " --target '" + targetJson + "'"
              + " --action " + String(activate)
              + " --send --reason '<why this narrative closeout was selected>'"
            : null,
          validateCli: "game play choose-narrative --player-id " + String(localPlayerId)
            + " --target-type CLOSE"
            + " --target '" + targetJson + "'"
            + (activate != null ? " --action " + String(activate) : "")
            + " --json",
        });
      }
      if (options.length === 0 && visiblePanel.ok && visiblePanel.value?.targetStoryId && Array.isArray(visiblePanel.value.options)) {
        const visibleTarget = visiblePanel.value.targetStoryId;
        const targetJson = JSON.stringify(visibleTarget);
        for (const visibleOption of visiblePanel.value.options) {
          if (!visibleOption.targetType) continue;
          const args = activate == null ? null : { TargetType: visibleOption.targetType, Target: visibleTarget, Action: activate };
          const validation = args
            ? probe(() => Game.PlayerOperations.canStart(
              localPlayerId,
              PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION,
              args,
              false,
            ))
            : { ok: false, error: "missing activate action" };
          const enabled = validation.ok && successFromCanStart(validation.value);
          options.push({
            source: "visible-small-narrative-event",
            targetType: visibleOption.targetType,
            targetTypeName: visibleOption.targetType,
            target: visibleTarget,
            action: activate,
            activation: "VISIBLE_PANEL",
            name: stylize(visibleOption.name) ?? visibleOption.targetType,
            reward: stylize(visibleOption.reward),
            imperative: stylize(visibleOption.actionText),
            cost: null,
            canAfford: { ok: true, value: true },
            args,
            enabled,
            disabled: !enabled,
            validation,
            cli: enabled
              ? "game play choose-narrative --player-id " + String(localPlayerId)
                + " --target-type " + String(visibleOption.targetType)
                + " --target '" + targetJson + "'"
                + " --action " + String(activate)
                + " --send --reason '<why this visible narrative option was selected>'"
              : null,
            validateCli: "game play choose-narrative --player-id " + String(localPlayerId)
              + " --target-type " + String(visibleOption.targetType)
              + " --target '" + targetJson + "'"
              + (activate != null ? " --action " + String(activate) : "")
              + " --json",
          });
        }
      }
      const enabledOptions = options.filter((option) => option.enabled);
      const disabledOptions = options.filter((option) => option.disabled);
      const notificationTarget = safeNotificationValue(notification, "Target");
      const hasEnabledOptions = enabledOptions.length > 0;
      const dismissalDiagnosticCli = !hasEnabledOptions && !target && safeNotificationValue(notification, "CanUserDismiss") === true && notificationId
        ? "game play dismiss-notification --target '" + JSON.stringify(notificationId) + "' --json"
        : null;
      const unprovenDismissalCli = !hasEnabledOptions && !target && safeNotificationValue(notification, "CanUserDismiss") === true && notificationId
        ? "game play dismiss-notification --target '" + JSON.stringify(notificationId) + "' --send --reason '<reviewed: narrative notification has no pending story>'"
        : null;
      const classification = hasEnabledOptions
        ? "narrative-choice-options"
        : target
          ? "narrative-choice-no-enabled-options"
          : "narrative-choice-no-pending-story";
      return {
        kind: "narrative-choice-options",
        classification,
        notificationId,
        localPlayerId,
        notificationOwner,
        source: "Players.Stories pending story id + GameInfo.NarrativeStory_Links + PlayerOperations.canStart",
        activateAction: activate,
        targetStoryIdSource,
        pendingStoryId,
        pendingDiscoveryStoryId,
        targetStoryId,
        visiblePanel,
        targetStory,
        storyDef,
        storyLinks,
        notificationTarget,
        options,
        enabledOptions,
        disabledOptions,
        dismissalDiagnosticCli,
        unprovenDismissalCli,
        notes: [
          "Options mirror the official narrative popup buttons. The notification target can be invalid; the official UI derives the target story from Players.Stories.",
          "Discovery notifications are checked against getFirstPendingDiscoveryLastMetID before the regular pending met story id.",
          "When the official panel is already visible, options can be sourced from small-narrative-event._component.targetStoryId and fxs-reward-button choice keys, then validated through CHOOSE_NARRATIVE_STORY_DIRECTION.",
          "When a real story has no linked choices, the official UI emits a CLOSE option with CHOOSE_NARRATIVE_STORY_DIRECTION.",
          "If no pending story id exists, no narrative operation is materialized. Notification dismissal is a separate closeout attempt and is only proven when its postcondition reports verified:true.",
        ],
      };
    };
    const unitCommandDetailsFor = (notification, typeName, notificationId) => {
      if (!stringIncludes(typeName, "COMMAND_UNITS")) return undefined;
      const selectedUnitId = probe(() => toComponentId(UI?.Player?.getHeadSelectedUnit?.()));
      const firstReadyUnitId = probe(() => toComponentId(UI?.Player?.getFirstReadyUnit?.()));
      const hasSentTurnComplete = probe(() => typeof GameContext.hasSentTurnComplete === "function"
        ? GameContext.hasSentTurnComplete()
        : false);
      const blocker = probe(() => typeof Game.Notifications.getEndTurnBlockingType === "function"
        ? Game.Notifications.getEndTurnBlockingType(GameContext.localPlayerID)
        : null);
      const expired = safeNotificationValue(notification, "Expired") === true;
      const skipEnum = enumValueFor(typeof UnitOperationTypes !== "undefined" ? UnitOperationTypes : {}, "SKIP_TURN");
      const unitIds = probe(() => {
        const playerUnits = Players.Units.get(GameContext.localPlayerID);
        return playerUnits?.getUnitIds?.() ?? [];
      });
      const units = unitIds.ok && Array.isArray(unitIds.value) ? unitIds.value : [];
      const closeoutCandidates = units.map((unitId) => {
        const normalizedUnitId = toComponentId(unitId);
        if (!normalizedUnitId) return null;
        const validation = probe(() => Game.UnitOperations.canStart(normalizedUnitId, skipEnum, {}, false));
        const enabled = validation.ok && successFromCanStart(validation.value);
        return {
          unitId: normalizedUnitId,
          unit: probe(() => safeUnitSummary(normalizedUnitId)),
          operationFamily: "unit-operation",
          operationType: "SKIP_TURN",
          argsShape: "{}",
          enabled,
          validation,
          cli: enabled
            ? "game play operation --family unit --type SKIP_TURN --unit-id '"
              + JSON.stringify(normalizedUnitId)
              + "' --send --reason '<why this unit has no better operation this turn>'"
            : null,
        };
      }).filter(Boolean);
      const enabledCloseoutCandidates = closeoutCandidates.filter((candidate) => candidate.enabled);
      const selectedMissing = (selectedUnitId.ok ? selectedUnitId.value : null) == null;
      const firstReadyMissing = (firstReadyUnitId.ok ? firstReadyUnitId.value : null) == null;
      const blockerLooksClean = blocker.ok && blocker.value === 0;
      const staleExpiredWithoutEnabledCloseout = expired
        && selectedMissing
        && firstReadyMissing
        && blockerLooksClean
        && enabledCloseoutCandidates.length === 0;
      const turnCompleteAlreadySent = hasSentTurnComplete.ok && hasSentTurnComplete.value === true;
      const repairCandidates = staleExpiredWithoutEnabledCloseout
        ? [
            turnCompleteAlreadySent
              ? {
                  kind: "wait-for-turn-advance",
                  cli: "game watch --count 3 --interval-ms 1000 --include-ready-unit --include-ready-city --jsonl",
                  proof: "GameContext.hasSentTurnComplete is already true; do not repeat unit operations or turn-complete until a fresh watch shows whether the turn advanced or a new blocker appeared.",
                }
              : {
                  kind: "send-turn-complete",
                  cli: "game play end-turn --send --reason '<stale COMMAND_UNITS has no selected/ready unit and no enabled validator-backed unit closeout>' --json",
                  proof: "Official COMMAND_UNITS activation selects the next ready unit; selectedUnitId and firstReadyUnitId are null, blocker enum is clean, and no validator-backed SKIP_TURN closeout remains.",
                },
          ]
        : [];
      return {
        kind: "unit-command-reconciliation",
        classification: staleExpiredWithoutEnabledCloseout
          ? "unit-command-stale-expired"
          : "unit-command-closeout-candidates",
        notificationId,
        blocker,
        hasSentTurnComplete,
        selectedUnitId,
        firstReadyUnitId,
        unitScan: unitIds,
        closeoutCandidates,
        enabledCloseoutCandidates,
        staleReadyPointerSuspected: (selectedUnitId.ok ? selectedUnitId.value : null) == null
          && (firstReadyUnitId.ok ? firstReadyUnitId.value : null) == null
          && enabledCloseoutCandidates.length > 0,
        staleExpiredWithoutEnabledCloseout,
        repairCandidates,
        notes: [
          "COMMAND_UNITS can remain end-turn blocking even when the ready-unit pointer is null. This detail scans local-player units for validator-backed no-target SKIP_TURN closeouts.",
          "If COMMAND_UNITS is expired, no selected/ready unit exists, blocker enum is clean, and every scanned unit operation is disabled, treat it as stale UI state rather than a unit operation request.",
          "Use these candidates only as unit-command reconciliation. Movement, attack, promotion, fortify, and automation still require ready-unit/unit-target/unit-move-preview evidence.",
        ],
      };
    };
    const detailsFor = (notification, typeName, notificationId) => {
      return firstMeetDetailsFor(notification, typeName)
        ?? diplomacyResponseDetailsFor(notification, typeName, notificationId)
        ?? diplomacyActionReportDetailsFor(notification, typeName, notificationId)
        ?? technologyChoiceDetailsFor(notification, typeName, notificationId)
        ?? cultureChoiceDetailsFor(notification, typeName, notificationId)
        ?? celebrationChoiceDetailsFor(notification, typeName, notificationId)
        ?? governmentChoiceDetailsFor(notification, typeName, notificationId)
        ?? narrativeChoiceDetailsFor(notification, typeName, notificationId)
        ?? unitCommandDetailsFor(notification, typeName, notificationId);
    };
    const decisionHintFor = (notification, typeName, isBlocking) => {
      const haystack = [
        typeName,
        notification?.Type,
        notification?.GroupType,
        notification?.Summary,
        notification?.Message,
      ].map((part) => String(part ?? "").toUpperCase()).join(" ");
      if (stringIncludes(haystack, "CHOOSE_TECH")) {
        return hint(
          "technology-choice",
          "player-operation",
          "SET_TECH_TREE_NODE",
          "{ ProgressionTreeNodeType }",
          "game play choose-tech",
          "live-proof",
          [requiredInput("ProgressionTreeNodeType", "live tech chooser/tree node", "Use the runtime node type hash from GameInfo/progression tree data, not the row index or notification id.")],
          [
            action("choose tech", "game play choose-tech --player-id <id> --node <node> --send --reason '<why this node was selected>'", "sequence", "SET_TECH_TREE_NODE then SET_TECH_TREE_TARGET_NODE", "{ ProgressionTreeNodeType: node } then { ProgressionTreeNodeType: NO_NODE }", "when one caller action should start research and finish the chooser workflow"),
            action("validate tech choice", "game play choose-tech --player-id <id> --node <node>", "player-operation", "SET_TECH_TREE_NODE", "{ ProgressionTreeNodeType }", "after reading the candidate node"),
            action("set tech target", "game play set-tech-target --player-id <id> --node <node>", "player-operation", "SET_TECH_TREE_TARGET_NODE", "{ ProgressionTreeNodeType }", "when the full tree UI targets a node or choose-node alone leaves the blocker unresolved"),
          ],
          ["Read the live tech node id before sending; choose-tech send mode mirrors the chooser by clearing the temporary target internally."],
        );
      }
      if (stringIncludes(haystack, "CHOOSE_CULTURE") || stringIncludes(haystack, "CULTURE_TREE")) {
        return hint(
          "culture-choice",
          "player-operation",
          "SET_CULTURE_TREE_NODE",
          "{ ProgressionTreeNodeType }",
          "game play choose-culture",
          "live-proof",
          [requiredInput("ProgressionTreeNodeType", "live culture chooser/tree node", "Use the runtime node type hash from GameInfo/progression tree data, not the row index or notification id.")],
          [
            action("choose culture and close chooser", "game play choose-culture --player-id <id> --node <node> --send --closeout --reason '<why this node was selected>'", "sequence", "SET_CULTURE_TREE_NODE then SET_CULTURE_TREE_TARGET_NODE", "{ ProgressionTreeNodeType: node } then { ProgressionTreeNodeType: NO_NODE }", "when one caller action should start culture and close the chooser surface"),
            action("read culture options", "game play choose-culture --options --json", undefined, undefined, "enabled culture nodes with validation and ready send templates", "before choosing a culture node"),
            action("validate culture choice", "game play choose-culture --player-id <id> --node <node>", "player-operation", "SET_CULTURE_TREE_NODE", "{ ProgressionTreeNodeType }", "after reading the candidate node"),
            action("set culture target", "game play set-culture-target --player-id <id> --node <node>", "player-operation", "SET_CULTURE_TREE_TARGET_NODE", "{ ProgressionTreeNodeType }", "when the full tree UI targets a node or choose-node alone leaves the blocker unresolved"),
          ],
          ["Read options from the live culture chooser before sending; some UI paths also set the culture target node, so use --closeout for one caller-level selection."],
        );
      }
      if (stringIncludes(haystack, "CHOOSE_GOVERNMENT")) {
        return hint(
          "government-choice",
          "player-operation",
          "CHANGE_GOVERNMENT",
          "{ GovernmentType, Action: Activate }",
          "game play choose-government",
          "official-ui",
          [requiredInput("GovernmentType", "live government picker option", "Use the government index from choose-government --options, not the visible row position.")],
          [
            action("read government options", "game play choose-government --options --json", undefined, undefined, "enabled starting governments with validation and ready send templates", "before choosing a government"),
            action("choose government", "game play choose-government --player-id <id> --government-type <government-type> --action <action> --send --reason '<why this government was selected>'", "player-operation", "CHANGE_GOVERNMENT", "{ GovernmentType, Action: Activate }", "after reading the live government option"),
          ],
          ["Read options from the live government picker before sending; the option surface includes celebration effects for context."],
        );
      }
      if (stringIncludes(haystack, "CHOOSE_GOLDEN_AGE")) {
        return hint(
          "celebration-choice",
          "player-operation",
          "CHOOSE_GOLDEN_AGE",
          "{ GoldenAgeType }",
          "game play choose-celebration",
          "official-ui",
          [requiredInput("GoldenAgeType", "live celebration chooser option", "Use the GoldenAgeType hash from choose-celebration --options, not old examples or visible row position.")],
          [
            action("read celebration options", "game play choose-celebration --options --json", undefined, undefined, "enabled celebration choices with validation and ready send templates", "before choosing a celebration"),
            action("choose celebration", "game play choose-celebration --player-id <id> --golden-age-type <golden-age-type> --send --reason '<why this celebration was selected>'", "player-operation", "CHOOSE_GOLDEN_AGE", "{ GoldenAgeType }", "after reading the live celebration option"),
          ],
          ["Read options from the live celebration chooser before sending; this blocker is not dismissible and should not use notification dismissal."],
        );
      }
      if (stringIncludes(haystack, "NEW_POPULATION")) {
        return hint(
          "population-placement",
          undefined,
          undefined,
          "ASSIGN_WORKER { Location, Amount: 1 } or city-command EXPAND placement args",
          "game play ready-city",
          "official-ui",
          [
            requiredInput("Location", "chosen plot", "The plot choice determines worker assignment vs expansion."),
            optionalInput("City", "notification target or selected city", "Needed when the branch is city expansion rather than worker reassignment."),
          ],
          [
            action("read city placement candidates", "game play ready-city --compact --json", "read-only", "ready-city population placement packet", "workable plots and expansion candidates", "before choosing assign-worker or expand-city"),
            action("assign worker to proven plot", "game play assign-worker --player-id <id> --location <plot-index>", "player-operation", "ASSIGN_WORKER", "{ Location, Amount: 1 }", "when the chosen tile is already workable"),
            action("validate city expansion", "game play expand-city --city-id '<city-id>' --x <x> --y <y>", "city-command", "EXPAND", "{ X, Y }", "when the chosen tile is an expansion purchase"),
          ],
          ["The notification opens acquire-tile mode; the clicked plot determines whether worker assignment or expansion fires. Re-read candidates before choosing either branch."],
        );
      }
      if (stringIncludes(haystack, "ASSIGN_NEW_RESOURCES") || stringIncludes(haystack, "RESOURCE ASSIGNMENTS")) {
        return hint(
          "resource-assignment",
          undefined,
          undefined,
          "screen-resource-allocation",
          undefined,
          "official-ui",
          [
            requiredInput("Resource allocation screen", "official notification handler", "The handler opens screen-resource-allocation; current wrapper support is inspection-only."),
            requiredInput("Available resources and settlement slots", "resource allocation UI or future dedicated read", "Do not dismiss this blocker as an informational report until assignment/closeout behavior is proven."),
          ],
          [
            action("inspect materialized notifications", "game play notifications --json", undefined, undefined, undefined, "before deciding whether a resource-assignment shortcut exists"),
          ],
          ["NOTIFICATION_ASSIGN_NEW_RESOURCES opens the official resource allocation screen. No validator-backed resource assignment shortcut is proven yet, so treat this as a real decision surface."],
        );
      }
      if (stringIncludes(haystack, "TOWN_PROJECT")) {
        return hint(
          "town-focus",
          "city-command",
          "CHANGE_GROWTH_MODE",
          "{ Type, ProjectType, City }",
          "game play set-town-focus",
          "live-proof",
          [
            requiredInput("City", "notification target or selected city", "Use the city ComponentID, not only the numeric city id, for the CLI shortcut."),
            requiredInput("Type", "live town focus option", "Growth mode enum from the town project UI."),
            requiredInput("ProjectType", "live town focus option", "Paired project enum for the selected focus."),
          ],
          [
            action("set town focus and close review", "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type> --send --closeout --reason '<why this focus was selected>'", "sequence", "CHANGE_GROWTH_MODE then CONSIDER_TOWN_PROJECT", "{ Type, ProjectType, City } then {}", "when the selected focus should be applied and the blocker closed as one caller workflow"),
            action("set town focus", "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>", "city-command", "CHANGE_GROWTH_MODE", "{ Type, ProjectType, City }", "when only validation or a single focus operation is wanted"),
            action("close reviewed town project", "game play consider-town-project --city-id '<city-id>'", "city-operation", "CONSIDER_TOWN_PROJECT", "{}", "after the focus has already been set and the UI still needs closeout"),
          ],
          ["Town focus is not city-operation BUILD; use --closeout when one caller action should apply the focus and clear the review surface."],
        );
      }
      if (stringIncludes(haystack, "CHOOSE_CITY_PRODUCTION") || stringIncludes(haystack, "PRODUCTION")) {
        return hint(
          "production-choice",
          "city-operation",
          "BUILD",
          "{ UnitType } or { ConstructibleType, X?, Y? } or { ProjectType }",
          "game play ready-city",
          "live-proof",
          [
            requiredInput("City", "notification target or selected city", "Production choices are city-scoped."),
            requiredInput("Build item type", "live production chooser", "Choose exactly one of UnitType, ConstructibleType, or ProjectType."),
            optionalInput("Placement plot", "validator Plots or placement UI", "Required for constructibles when validation returns placement plots; send X/Y with the ConstructibleType."),
          ],
          [
            action("read production candidates", "game play ready-city --compact --json", "read-only", "ready-city production candidate packet", "city summary and validated production candidates", "before choosing a production item"),
            action("validate production", "game play build-production --city-id '<city-id>' --unit-type <unit-type>", "city-operation", "BUILD", "{ UnitType }", "when the live choice is a unit"),
            action("place constructible production", "game play build-production --city-id '<city-id>' --constructible-type <constructible-type> --x <x> --y <y>", "city-operation", "BUILD", "{ ConstructibleType, X, Y }", "when validator or placement UI returns legal placement plots"),
            action("validate city project production", "game play build-production --city-id '<city-id>' --project-type <project-type>", "city-operation", "BUILD", "{ ProjectType }", "when the live choice is an ordinary city project, not town focus"),
          ],
          ["Use live chooser data to decide the item kind; constructible placement needs X/Y when the validator returns legal plots."],
        );
      }
      if (stringIncludes(haystack, "PLAYER_MET") || stringIncludes(haystack, "FIRST_MEET")) {
        return hint(
          "first-meet-diplomacy",
          "player-operation",
          "RESPOND_DIPLOMATIC_FIRST_MEET",
          "{ Player1, Player2, Type }",
          "game play respond-first-meet",
          "live-proof",
          [
            requiredInput("Player1", "local player id", "Usually the same value used as --player-id."),
            requiredInput("Player2", "met player id", "Read this from the live first-meet notification or diplomacy panel."),
            requiredInput("Type", "chosen first-meet greeting", "Use the first-meet response enum from the live UI, not ordinary Support/Accept/Reject diplomacy response enums."),
          ],
          [
            action("send neutral first-meet greeting", "game play respond-first-meet --player-id <id> --met-player-id <other-player-id> --response neutral", "player-operation", "RESPOND_DIPLOMATIC_FIRST_MEET", "{ Player1, Player2, Type }", "after validating the greeting options from the live first-meet UI"),
          ],
          ["First-meet greetings are real player operations, not notification dismissals. Neutral is the conservative default when Influence cost or strategic payoff is not proven."],
        );
      }
      if ((stringIncludes(haystack, "RESPOND") || stringIncludes(haystack, "RESPONSE")) && stringIncludes(haystack, "DIPLO")) {
        return hint(
          "diplomacy-response",
          "player-operation",
          "RESPOND_DIPLOMATIC_ACTION",
          "{ ID, Type }",
          "game play respond-diplomacy",
          "live-proof",
          [
            requiredInput("ID", "live diplomatic action", "This is the diplomatic action id, not the notification ComponentID."),
            requiredInput("Type", "chosen diplomatic response", "Use one enabled response option returned in notification details; do not infer enum values from stale notes."),
          ],
          [
            action("choose diplomacy response and close blocker", "game play respond-diplomacy --action-id <action-id> --response-type <response-type> --notification-id '<notification-id>' --send --reason '<why this response was selected>'", "player-operation", "RESPOND_DIPLOMATIC_ACTION", "{ ID, Type }", "after choosing one enabled response option from notification details"),
            action("validate diplomacy response", "game play respond-diplomacy --action-id <action-id> --response-type <response-type>", "player-operation", "RESPOND_DIPLOMATIC_ACTION", "{ ID, Type }", "for dry-run validation only"),
          ],
          ["Use the enabled option list from the live notification details; send mode follows the official local-player response panel path and verifies notification/turn closeout."],
        );
      }
      if (stringIncludes(haystack, "DIPLOMATIC_ACTION_LOW")) {
        return hint(
          "informational-notification",
          "app-ui-action",
          "Game.Notifications.dismiss",
          "{ notificationId }",
          "game play dismiss-notification",
          "official-ui",
          [requiredInput("Notification", "notification ComponentID", "Use the live notification id; this is not a diplomatic action response id.")],
          [
            action("dismiss reviewed diplomatic completion", "game play dismiss-notification --target '<notification-id>' --send --reason '<why this diplomatic completion was reviewed>'", "app-ui-action", "Game.Notifications.dismiss", "{ notificationId }", "after confirming the notification only reports a completed low-severity diplomatic action"),
          ],
          ["The official notification train does not register a specialized handler for NOTIFICATION_DIPLOMATIC_ACTION_LOW; it falls through to the default notification handler, so closeout is App UI dismissal after review."],
        );
      }
      const diplomaticActionReport = diplomacyActionReportDetailsFor(notification, typeName, null);
      if (diplomaticActionReport?.classification === "diplomatic-action-report-no-enabled-response-options") {
        return hint(
          "informational-notification",
          "app-ui-action",
          "Game.Notifications.dismiss",
          "{ notificationId }",
          "game play dismiss-notification",
          "official-ui",
          [requiredInput("Notification", "notification ComponentID", "Use the live notification id; this is not a diplomatic response id.")],
          [
            action("dismiss reviewed diplomatic action report", "game play dismiss-notification --target '<notification-id>' --send --reason '<why this diplomatic report was reviewed>'", "app-ui-action", "Game.Notifications.dismiss", "{ notificationId }", "after reviewing the event data/location and confirming getResponseDataForUI exposes no enabled response option"),
          ],
          ["NOTIFICATION_DIPLOMATIC_ACTION can point at a real diplomatic event id, but empty/no-enabled getResponseDataForUI options make it a reviewed report closeout rather than RESPOND_DIPLOMATIC_ACTION."],
        );
      }
      if (stringIncludes(typeName, "DIPLOMATIC_ACTION")
        && !stringIncludes(typeName, "DIPLOMATIC_RESPONSE_REQUIRED")
        && !stringIncludes(typeName, "DIPLOMATIC_ACTION_WARNING")
        && !stringIncludes(typeName, "DIPLOMATIC_ACTION_ESPIONAGE")
        && !isValidComponentId(notification?.Target)
        && (stringIncludes(haystack, "RELATIONSHIP") || stringIncludes(haystack, "AGENDA"))) {
        return hint(
          "informational-notification",
          "app-ui-action",
          "Game.Notifications.dismiss",
          "{ notificationId }",
          "game play dismiss-notification",
          "official-ui",
          [requiredInput("Notification", "notification ComponentID", "Use the live notification id; this is not a diplomatic action response id.")],
          [
            action("dismiss reviewed diplomatic relationship notice", "game play dismiss-notification --target '<notification-id>' --send --reason '<why this relationship/agenda report was reviewed>'", "app-ui-action", "Game.Notifications.dismiss", "{ notificationId }", "after reviewing the relationship/agenda context and confirming the notification target is not a valid diplomatic action id"),
          ],
          ["Agenda and relationship reports can arrive as NOTIFICATION_DIPLOMATIC_ACTION with an invalid target. Review the report for strategy, then use App UI dismissal; do not send RESPOND_DIPLOMATIC_ACTION without a valid action id."],
        );
      }
      if (stringIncludes(haystack, "UNIT_ATTACKED")
        || stringIncludes(haystack, "UNIT_LOST")
        || stringIncludes(haystack, "DISTRICT_ATTACKED")
        || stringIncludes(haystack, "VOLCANO_ACTIVE")
        || stringIncludes(haystack, "VOLCANO_INACTIVE")
        || stringIncludes(haystack, "VOLCANO_ERUPTS")
        || stringIncludes(haystack, "RIVER_FLOODS")
        || stringIncludes(haystack, "STORM_ARRIVED")
        || stringIncludes(haystack, "STORM_MOVED")
        || stringIncludes(haystack, "STORM_DISSIPATED")) {
        return hint(
          "informational-notification",
          "app-ui-action",
          "Game.Notifications.dismiss",
          "{ notificationId }",
          "game play dismiss-notification",
          "official-ui",
          [requiredInput("Notification", "notification ComponentID", "Use the live notification id; this is not an operation target.")],
          [
            action("dismiss reviewed notification", "game play dismiss-notification --target '<notification-id>' --send --reason '<why this was reviewed>'", "app-ui-action", "Game.Notifications.dismiss", "{ notificationId }", "after reviewing the reported attack/disaster location and confirming no specialized decision surface is required"),
          ],
          ["Unit combat and natural-disaster report notifications use the default notification handler; activation looks at the reported plot when present, while closeout is App UI dismissal after the report is reviewed."],
        );
      }
      if (stringIncludes(haystack, "WONDER_COMPLETED") || stringIncludes(haystack, "WONDER_FAILED")) {
        return hint(
          "informational-notification",
          "app-ui-action",
          "Game.Notifications.dismiss",
          "{ notificationId }",
          "game play dismiss-notification",
          "official-ui",
          [requiredInput("Notification", "notification ComponentID", "Use the live notification id; this is not an operation target.")],
          [
            action("dismiss reviewed notification", "game play dismiss-notification --target '<notification-id>' --send --reason '<why this was reviewed>'", "app-ui-action", "Game.Notifications.dismiss", "{ notificationId }", "after confirming the notification only reports completed/failed wonder information"),
          ],
          ["Wonder completed/failed uses the default notification handler; the live target may be invalid, so activation only looks at a plot when one exists."],
        );
      }
      if (stringIncludes(haystack, "LEGACY_COMPLETED")) {
        return hint(
          "informational-notification",
          "app-ui-action",
          "Game.Notifications.dismiss",
          "{ notificationId }",
          "game play dismiss-notification",
          "official-ui",
          [requiredInput("Notification", "notification ComponentID", "Use the live notification id; this is not an operation target.")],
          [
            action("dismiss reviewed legacy completion report", "game play dismiss-notification --target '<notification-id>' --send --reason '<why this legacy completion report was reviewed>'", "app-ui-action", "Game.Notifications.dismiss", "{ notificationId }", "after reviewing the completed legacy/triumph report for score context"),
            action("read current legacy progress", "game play progress-dashboard --compact --json", "read-only", "progress-dashboard", "legacy path scores and age progress", "when the report should be compared with local-player progress before dismissal"),
          ],
          ["Runtime NOTIFICATION_LEGACY_COMPLETED reports completed legacy/triumph context. No specialized operation surface is proven; review the score context, then close through App UI dismissal when canUserDismiss is true."],
        );
      }
      if (stringIncludes(haystack, "GRIEVANCES_AGAINST_YOU")) {
        return hint(
          "informational-notification",
          "app-ui-action",
          "Game.Notifications.dismiss",
          "{ notificationId }",
          "game play dismiss-notification",
          "official-ui",
          [requiredInput("Notification", "notification ComponentID", "Use the live notification id; this is not a diplomatic action id.")],
          [
            action("dismiss reviewed grievance notice", "game play dismiss-notification --target '<notification-id>' --send --reason '<why this grievance notice was reviewed>'", "app-ui-action", "Game.Notifications.dismiss", "{ notificationId }", "after confirming the notification reports grievance/influence information and exposes no response operation"),
          ],
          ["Grievance-against-you reports can block the UI queue but are not RESPOND_DIPLOMATIC_ACTION choices; review the summary for strategic context, then use App UI dismissal if canUserDismiss is true."],
        );
      }
      if (stringIncludes(haystack, "NARRATIVE") || stringIncludes(haystack, "DISCOVERY_STORY")) {
        return hint(
          "narrative-choice",
          "player-operation",
          "CHOOSE_NARRATIVE_STORY_DIRECTION",
          "{ TargetType, Target, Action }",
          "game play choose-narrative",
          "live-proof",
          [
            requiredInput("Target", "notification target or story UI targetStoryId", "Usually the story ComponentID from the notification target."),
            requiredInput("TargetType", "story option button", "If no story links exist, official UI uses CLOSE as the option key."),
            requiredInput("Action", "story option activation", "Official narrative UI sends PlayerOperationParameters.Activate."),
          ],
          [
            action("read narrative options", "game play choose-narrative --options --json", undefined, undefined, "enabled narrative buttons with validation and ready send templates", "before choosing a narrative branch or closeout"),
            action("validate narrative choice", "game play choose-narrative --player-id <id> --target-type <target-type> --target '<target>' --action <action>", "player-operation", "CHOOSE_NARRATIVE_STORY_DIRECTION", "{ TargetType, Target, Action }", "after reading the option key and activation from the story UI"),
          ],
          ["Use the option reader before sending; the notification target can be invalid because official narrative UI derives the target story from Players.Stories. If no pending story id is present, do not synthesize a narrative operation; inspect dismissal postcondition evidence separately."],
        );
      }
      if (stringIncludes(haystack, "TRADITION")) {
        return hint(
          "tradition-review",
          "player-operation",
          "CHANGE_TRADITION",
          "{ TraditionType, Action } then CONSIDER_ASSIGN_TRADITIONS {}",
          "game play traditions",
          "live-proof",
          [
            requiredInput("TraditionType", "live tradition chooser", "Pick the tradition enum that is being activated or deactivated."),
            requiredInput("Action", "live tradition action", "Use the activate/deactivate action enum from the tradition UI."),
          ],
          [
            action("read tradition options", "game play traditions --compact --json", "read-only", "Players.Culture tradition slot/candidate packet", "active and available traditions with action templates", "before choosing a tradition activation or deactivation"),
            action("change tradition and close review", "game play change-tradition --player-id <id> --tradition-type <tradition-type> --action <action> --send --closeout --reason '<why this tradition change was selected>'", "sequence", "CHANGE_TRADITION then CONSIDER_ASSIGN_TRADITIONS", "{ TraditionType, Action } then {}", "when a specific tradition slot change should be applied and the blocker closed as one caller workflow"),
            action("change tradition", "game play change-tradition --player-id <id> --tradition-type <tradition-type> --action <action>", "player-operation", "CHANGE_TRADITION", "{ TraditionType, Action }", "when only validation or a single tradition operation is wanted"),
            action("close tradition review", "game play consider-traditions --player-id <id>", "player-operation", "CONSIDER_ASSIGN_TRADITIONS", "{}", "after valid assignments are already in place"),
          ],
          ["Full slots may need deactivate, activate, then closeout; use --closeout on the final selected change when one caller action should clear the review surface."],
        );
      }
      if (stringIncludes(haystack, "ATTRIBUTE")) {
        return hint(
          "attribute-review",
          "player-operation",
          "BUY_ATTRIBUTE_TREE_NODE",
          "{ ProgressionTreeNodeType } then CONSIDER_ASSIGN_ATTRIBUTE {}",
          "game play buy-attribute",
          "live-proof",
          [requiredInput("ProgressionTreeNodeType", "live attribute tree node", "Use the buyable attribute node id from the runtime tree.")],
          [
            action("buy attribute and close review", "game play buy-attribute --player-id <id> --node <node> --send --closeout --reason '<why this attribute was selected>'", "sequence", "BUY_ATTRIBUTE_TREE_NODE then CONSIDER_ASSIGN_ATTRIBUTE", "{ ProgressionTreeNodeType } then {}", "when a buyable node should be purchased and the blocker closed as one caller workflow"),
            action("buy attribute node", "game play buy-attribute --player-id <id> --node <node>", "player-operation", "BUY_ATTRIBUTE_TREE_NODE", "{ ProgressionTreeNodeType }", "when only validation or a single attribute operation is wanted"),
            action("close attribute review", "game play consider-attributes --player-id <id>", "player-operation", "CONSIDER_ASSIGN_ATTRIBUTE", "{}", "after no attribute purchase is needed or after buying"),
          ],
          ["Use --closeout when one caller action should buy the node and clear the review surface."],
        );
      }
      if (stringIncludes(haystack, "ADVISOR") || stringIncludes(haystack, "WARNING")) {
        return hint(
          "advisor-warning",
          "player-operation",
          "VIEWED_ADVISOR_WARNING",
          "{ Target: notificationComponentId }",
          "game play advisor-warning",
          "live-proof",
          [requiredInput("Target", "notification ComponentID", "Use the notification id itself as Target.")],
          [
            action("mark advisor warning viewed", "game play advisor-warning --player-id <id> --target '<notification-id>'", "player-operation", "VIEWED_ADVISOR_WARNING", "{ Target: notificationComponentId }", "when the warning has been inspected"),
          ],
          ["Do not use raw notification dismissal for advisor blockers."],
        );
      }
      if (stringIncludes(haystack, "COMMAND_UNITS") || stringIncludes(haystack, "UNITS")) {
        return hint(
          "unit-command",
          "unit-operation",
          "SKIP_TURN",
          "selected/ready unit id plus operation-specific args",
          "game play operation --family unit",
          "heuristic",
          [
            requiredInput("Unit", "selectedUnitId, firstReadyUnitId, or unit-command-reconciliation details", "Use the ready unit when present; if the ready pointer is stale, use a validator-backed reconciliation candidate."),
            optionalInput("Target plot", "map coordinates", "Needed for move, attack, and other plot-target actions."),
          ],
          [
            action("read ready-unit view", "game play ready-unit --json", undefined, undefined, "selected/first ready unit, legal operations, nearby occupied plots", "before choosing a unit operation"),
            action("resolve plot target", "game play unit-target --unit-id '<unit-id>' --x <x> --y <y>", "unit-operation", undefined, "official right-click action order", "when choosing a move or attack target"),
            action("validate generic unit operation", "game play operation --family unit --type <operation> --unit-id '<unit-id>' --args '<args>'", "unit-operation", "<operation>", "operation-specific args", "when the operation is not covered by a named shortcut"),
          ],
          [
            "Read the selected or first ready unit before choosing skip, automate, move, or promote.",
            "If selectedUnitId and firstReadyUnitId are stale or null, notification details may expose validator-backed SKIP_TURN reconciliation candidates with exact unit ids.",
          ],
        );
      }
      return hint(
        isBlocking ? "blocking-notification" : "notification",
        undefined,
        undefined,
        undefined,
        undefined,
        "heuristic",
        [requiredInput("Notification handler evidence", "official UI handler or live runtime surface", "Unclassified notifications need handler inspection before sending operations.")],
        [
          action("inspect materialized notifications", "game play notifications --json", undefined, undefined, undefined, "before deciding whether this is a real blocker"),
          action("validate generic operation", "game play operation --family <family> --type <type> --args '<args>'", undefined, undefined, "operation-specific args", "only after the official handler or live UI proves the operation"),
        ],
        ["No specialized shortcut is known; inspect official UI handler or use validate-only generic operation."],
      );
    };
    const summarizeNotification = (id, blockingKey) => {
      const notification = Game.Notifications.find(id);
      const type = (() => {
        try {
          return typeof Game.Notifications.getType === "function"
            ? Game.Notifications.getType(id)
            : notification?.Type ?? null;
        } catch {
          return notification?.Type ?? null;
        }
      })();
      const typeName = (() => {
        try {
          return typeof Game.Notifications.getTypeName === "function"
            ? Game.Notifications.getTypeName(type)
            : null;
        } catch {
          return null;
        }
      })();
      const normalizedId = toComponentId(id);
      const isEndTurnBlocking = normalizedId != null && componentKey(normalizedId) === blockingKey;
      const summary = (() => {
        try {
          return typeof Game.Notifications.getSummary === "function"
            ? Game.Notifications.getSummary(id) ?? null
            : safeNotificationValue(notification, "Summary");
        } catch {
          return safeNotificationValue(notification, "Summary");
        }
      })();
      const message = (() => {
        try {
          return typeof Game.Notifications.getMessage === "function"
            ? Game.Notifications.getMessage(id) ?? null
            : safeNotificationValue(notification, "Message");
        } catch {
          return safeNotificationValue(notification, "Message");
        }
      })();
      return {
        id: normalizedId,
        type,
        typeName,
        groupType: safeNotificationValue(notification, "GroupType"),
        player: safeNotificationValue(notification, "Player"),
        summary,
        message,
        target: safeNotificationValue(notification, "Target"),
        location: safeNotificationValue(notification, "Location"),
        canUserDismiss: safeNotificationValue(notification, "CanUserDismiss"),
        expired: safeNotificationValue(notification, "Expired"),
        dismissed: safeNotificationValue(notification, "Dismissed"),
        isEndTurnBlocking,
        decision: decisionHintFor(notification, typeName, isEndTurnBlocking),
        details: detailsFor(notification, typeName, normalizedId),
      };
    };
    const readPlayNotifications = (input) => {
      const maxNotifications = Math.max(1, Math.min(input.maxNotifications ?? 25, 100));
      const localPlayerId = GameContext.localPlayerID;
      const blocker = probe(() => Game.Notifications.getEndTurnBlockingType(localPlayerId));
      const blockingNotificationId = probe(() => {
        const blockerValue = blocker.ok ? blocker.value : Game.Notifications.getEndTurnBlockingType(localPlayerId);
        const id = Game.Notifications.findEndTurnBlocking(localPlayerId, blockerValue);
        return toComponentId(id);
      });
      const ids = notificationIdsForPlayer(localPlayerId, maxNotifications + 1);
      if (blockingNotificationId.ok) pushUniqueId(ids, blockingNotificationId.value);
      const truncated = ids.length > maxNotifications;
      const selected = ids.slice(0, maxNotifications);
      const blockingKey = blockingNotificationId.ok ? componentKey(blockingNotificationId.value) : "";
      const notifications = selected.map((id) => summarizeNotification(id, blockingKey));
      const decisions = [];
      for (const notification of notifications) {
        const key = JSON.stringify(notification.decision);
        if (!decisions.some((existing) => JSON.stringify(existing) === key)) decisions.push(notification.decision);
      }
      const toDecisionQueueItem = (notification) => ({
        notificationId: notification.id,
        isEndTurnBlocking: notification.isEndTurnBlocking,
        typeName: notification.typeName,
        summary: notification.summary,
        message: notification.message,
        target: notification.target,
        location: notification.location,
        player: notification.player,
        category: notification.decision.category,
        operationFamily: notification.decision.operationFamily,
        operationType: notification.decision.operationType,
        argsShape: notification.decision.argsShape,
        cli: notification.decision.cli,
        requiredInputs: notification.decision.requiredInputs,
        commonActions: notification.decision.commonActions,
        notes: notification.decision.notes,
        details: notification.details,
      });
      const decisionQueue = notifications
        .slice()
        .sort((left, right) => Number(right.isEndTurnBlocking) - Number(left.isEndTurnBlocking))
        .map(toDecisionQueueItem);
      return {
        localPlayerId,
        turn: probe(() => Game.turn),
        turnDate: probe(() => Game.getTurnDate()),
        hasSentTurnComplete: probe(() => GameContext.hasSentTurnComplete()),
        canEndTurn: probe(() => typeof canEndTurn === "function" ? canEndTurn() : false),
        blocker,
        blockingNotificationId,
        selectedUnitId: probe(() => toComponentId(UI?.Player?.getHeadSelectedUnit?.())),
        selectedCityId: probe(() => toComponentId(UI?.Player?.getHeadSelectedCity?.())),
        firstReadyUnitId: probe(() => toComponentId(UI?.Player?.getFirstReadyUnit?.())),
        notifications,
        decisions,
        hud: {
          nextDecision: decisionQueue[0] ?? null,
          decisionQueue,
        },
        limits: { maxNotifications, truncated },
      };
    };`;
}

function runtimeObjectReaderSource(): string {
  return `const callMaybe = (value, key) => {
      const candidate = value == null ? undefined : value[key];
      return typeof candidate === "function" ? candidate.call(value) : undefined;
    };
    const readValue = (value, props, methods) => {
      if (value == null) return undefined;
      for (const prop of props) {
        if (value[prop] !== undefined) return value[prop];
      }
      for (const method of methods) {
        const result = callMaybe(value, method);
        if (result !== undefined) return result;
      }
      return undefined;
    };`;
}

function plotSnapshotScriptSource(): string {
  return `${probeHelperSource()}
    const callPlot = (name, x, y) => {
      const fn = GameplayMap[name];
      if (typeof fn !== "function") throw new Error("GameplayMap." + name + " is not a function");
      try {
        return fn.call(GameplayMap, x, y);
      } catch (first) {
        try {
          return fn.call(GameplayMap, { x, y });
        } catch {
          throw first;
        }
      }
    };
    const safeMapCall = (name, x, y) => probe(() => callPlot(name, x, y));
    const visibilityFor = (input) => {
      if (input.playerId === undefined) return { policy: "not-player-scoped" };
      const revealedState = probe(() => GameplayMap.getRevealedState(input.playerId, input.x, input.y));
      const visible = probe(() => typeof Visibility !== "undefined" && typeof Visibility.isVisible === "function"
        ? Visibility.isVisible(input.playerId, input.x, input.y)
        : revealedState.ok && revealedState.value !== 0);
      const includeFacts = input.includeHidden === true || (visible.ok && visible.value === true) || (revealedState.ok && revealedState.value !== 0);
      return {
        policy: input.includeHidden ? "include-hidden" : "visibility-filtered",
        revealedState,
        visible,
        includeFacts,
      };
    };
    const readPlotSnapshot = (input) => {
      if (!GameplayMap.isValidXY(input.x, input.y)) {
        return {
          location: { x: input.x, y: input.y, index: { ok: false, error: "invalid location" } },
          hiddenInfoPolicy: input.playerId === undefined ? "not-player-scoped" : input.includeHidden ? "include-hidden" : "visibility-filtered",
          facts: {},
        };
      }
      const visibility = visibilityFor(input);
      const fields = input.fields ?? [];
      const facts = {};
      const include = visibility.policy === "not-player-scoped" || visibility.includeFacts === true;
      const add = (key, value) => { facts[key] = value; };
      if (include) {
        if (fields.includes("terrain")) add("terrain", safeMapCall("getTerrainType", input.x, input.y));
        if (fields.includes("biome")) add("biome", safeMapCall("getBiomeType", input.x, input.y));
        if (fields.includes("feature")) add("feature", safeMapCall("getFeatureType", input.x, input.y));
        if (fields.includes("resource")) add("resource", safeMapCall("getResourceType", input.x, input.y));
        if (fields.includes("climate")) {
          add("elevation", safeMapCall("getElevation", input.x, input.y));
          add("rainfall", safeMapCall("getRainfall", input.x, input.y));
          add("fertility", safeMapCall("getFertilityType", input.x, input.y));
        }
        if (fields.includes("hydrology")) {
          add("riverType", safeMapCall("getRiverType", input.x, input.y));
          add("water", safeMapCall("isWater", input.x, input.y));
          add("lake", safeMapCall("isLake", input.x, input.y));
        }
        if (fields.includes("yields")) add("yields", safeMapCall("getYields", input.x, input.y));
        if (fields.includes("owner")) {
          add("owner", safeMapCall("getOwner", input.x, input.y));
          add("ownerName", safeMapCall("getOwnerName", input.x, input.y));
        }
        if (fields.includes("areaRegion")) {
          add("areaId", safeMapCall("getAreaId", input.x, input.y));
          add("regionId", safeMapCall("getRegionId", input.x, input.y));
          add("landmassId", safeMapCall("getLandmassId", input.x, input.y));
        }
        if (fields.includes("tags")) add("plotTag", safeMapCall("getPlotTag", input.x, input.y));
        if (fields.includes("city")) add("city", probe(() => typeof MapCities !== "undefined" ? MapCities.getCity(input.x, input.y) : null));
        if (fields.includes("units")) add("units", probe(() => typeof MapUnits !== "undefined" ? MapUnits.getUnits(input.x, input.y) : []));
      }
      if (fields.includes("visibility")) {
        add("revealedState", visibility.revealedState ?? { ok: false, error: "playerId required" });
        add("visible", visibility.visible ?? { ok: false, error: "playerId required" });
      }
      return {
        location: { x: input.x, y: input.y, index: probe(() => GameplayMap.getIndexFromXY(input.x, input.y)) },
        ...(visibility.revealedState ? { revealedState: visibility.revealedState } : {}),
        ...(visibility.visible ? { visible: visibility.visible } : {}),
        hiddenInfoPolicy: visibility.policy,
        facts,
      };
    };`;
}

function autoplaySetterSource(options: Civ7AutoplayOptions): string {
  const statements: string[] = [];
  if (options.turns !== undefined) statements.push(`Autoplay.setTurns(${jsLiteral(options.turns)});`);
  if (options.observeAsPlayer !== undefined) statements.push(`Autoplay.setObserveAsPlayer(${jsLiteral(options.observeAsPlayer)});`);
  if (options.returnAsPlayer !== undefined) statements.push(`Autoplay.setReturnAsPlayer(${jsLiteral(options.returnAsPlayer)});`);
  if (options.pause !== undefined) statements.push(`Autoplay.setPause(${jsLiteral(options.pause)});`);
  return statements.join("\n    ");
}

function technologyChoiceCloseoutSource(): string {
  return `${probeHelperSource()}
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value.owner !== "number" || typeof value.id !== "number") return null;
      const out = { owner: value.owner, id: value.id };
      if (typeof value.type === "number") out.type = value.type;
      return out;
    };
    const safeCall = (label, fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: label + ": " + String(err) };
      }
    };
    const successFromCanStart = (value) => value?.Success === true || value?.canStart === true;
    const readTechnologyState = (playerId) => ({
      currentResearching: probe(() => Players.get(playerId)?.Techs?.getResearching?.() ?? null),
      targetNode: probe(() => Players.get(playerId)?.Techs?.getTargetNode?.() ?? null),
    });
    const currentTechnologyNotification = () => safeCall("find current technology-choice notification", () => {
      const ids = typeof Game.Notifications.getIdsForPlayer === "function"
        ? Game.Notifications.getIdsForPlayer(GameContext.localPlayerID)
        : [];
      const rows = Array.isArray(ids) ? ids : [];
      for (const id of rows) {
        const type = typeof Game.Notifications.getType === "function"
          ? Game.Notifications.getType(id)
          : Game.Notifications.find(id)?.Type;
        const typeName = typeof Game.Notifications.getTypeName === "function" ? Game.Notifications.getTypeName(type) : null;
        if (String(typeName ?? "").toUpperCase().includes("CHOOSE_TECH")) return toComponentId(id);
      }
      return null;
    });
    const sendTechnologyChoiceCloseout = (input) => {
      const localPlayerId = GameContext.localPlayerID;
      const playerId = Number.isInteger(input.playerId) ? input.playerId : localPlayerId;
      const node = Number(input.node);
      const selectedNotification = toComponentId(input.notificationId) ?? currentTechnologyNotification().value ?? null;
      const beforeTechnology = readTechnologyState(playerId);
      const activationResult = input.activateNotification === false
        ? { ok: false, skipped: true, reason: "activation disabled" }
        : safeCall("Game.Notifications.activate", () => selectedNotification ? Game.Notifications.activate(selectedNotification) : null);
      const chooseArgs = { ProgressionTreeNodeType: node };
      const noNode = typeof ProgressionTreeNodeTypes !== "undefined" && typeof ProgressionTreeNodeTypes.NO_NODE === "number"
        ? ProgressionTreeNodeTypes.NO_NODE
        : -1;
      const clearArgs = { ProgressionTreeNodeType: noNode };
      const canChoose = safeCall("Game.PlayerOperations.canStart SET_TECH_TREE_NODE", () => Game.PlayerOperations.canStart(
        playerId,
        PlayerOperationTypes.SET_TECH_TREE_NODE,
        chooseArgs,
        false,
      ));
      const chooseResult = canChoose.ok && successFromCanStart(canChoose.value)
        ? safeCall("Game.PlayerOperations.sendRequest SET_TECH_TREE_NODE", () => Game.PlayerOperations.sendRequest(
          playerId,
          PlayerOperationTypes.SET_TECH_TREE_NODE,
          chooseArgs,
        ))
        : { ok: false, skipped: true, reason: "SET_TECH_TREE_NODE did not validate" };
      const canClearTarget = safeCall("Game.PlayerOperations.canStart SET_TECH_TREE_TARGET_NODE", () => Game.PlayerOperations.canStart(
        playerId,
        PlayerOperationTypes.SET_TECH_TREE_TARGET_NODE,
        clearArgs,
        false,
      ));
      const clearTargetResult = canClearTarget.ok && successFromCanStart(canClearTarget.value)
        ? safeCall("Game.PlayerOperations.sendRequest SET_TECH_TREE_TARGET_NODE", () => Game.PlayerOperations.sendRequest(
          playerId,
          PlayerOperationTypes.SET_TECH_TREE_TARGET_NODE,
          clearArgs,
        ))
        : { ok: false, skipped: true, reason: "SET_TECH_TREE_TARGET_NODE did not validate" };
      return {
        localPlayerId,
        playerId,
        node,
        notificationId: selectedNotification,
        beforeTechnology,
        activationResult,
        canChoose,
        chooseResult,
        canClearTarget,
        clearTargetResult,
        afterTechnology: readTechnologyState(playerId),
        sent: chooseResult.ok === true && clearTargetResult.ok === true,
        notes: [
          "This uses the App UI owner for technology chooser closeout: optional Game.Notifications.activate, SET_TECH_TREE_NODE, then SET_TECH_TREE_TARGET_NODE with NO_NODE.",
          "The caller must still re-read notification state; successful App UI sends are not proof that the technology-choice blocker cleared."
        ],
      };
    };`;
}

function cultureChoiceCloseoutSource(): string {
  return `${probeHelperSource()}
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value.owner !== "number" || typeof value.id !== "number") return null;
      const out = { owner: value.owner, id: value.id };
      if (typeof value.type === "number") out.type = value.type;
      return out;
    };
    const safeCall = (label, fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: label + ": " + String(err) };
      }
    };
    const successFromCanStart = (value) => value?.Success === true || value?.canStart === true;
    const readCultureState = (playerId) => ({
      currentResearching: probe(() => {
        const culture = Players.get(playerId)?.Culture;
        const activeTree = culture?.getActiveTree?.();
        if (activeTree == null) return null;
        const tree = Game.ProgressionTrees.getTree(playerId, activeTree);
        const activeNodeIndex = tree?.activeNodeIndex;
        return Number.isFinite(Number(activeNodeIndex)) && activeNodeIndex >= 0
          ? tree?.nodes?.[activeNodeIndex]?.nodeType ?? null
          : null;
      }),
      targetNode: probe(() => Players.get(playerId)?.Culture?.getTargetNode?.() ?? null),
      availableNodeTypes: probe(() => Players.get(playerId)?.Culture?.getAllAvailableNodeTypes?.() ?? []),
    });
    const currentCultureNotification = () => safeCall("find current culture-choice notification", () => {
      const ids = typeof Game.Notifications.getIdsForPlayer === "function"
        ? Game.Notifications.getIdsForPlayer(GameContext.localPlayerID)
        : [];
      const rows = Array.isArray(ids) ? ids : [];
      for (const id of rows) {
        const type = typeof Game.Notifications.getType === "function"
          ? Game.Notifications.getType(id)
          : Game.Notifications.find(id)?.Type;
        const typeName = typeof Game.Notifications.getTypeName === "function" ? Game.Notifications.getTypeName(type) : null;
        if (String(typeName ?? "").toUpperCase().includes("CHOOSE_CULTURE")) return toComponentId(id);
      }
      return null;
    });
    const sendCultureChoiceCloseout = (input) => {
      const localPlayerId = GameContext.localPlayerID;
      const playerId = Number.isInteger(input.playerId) ? input.playerId : localPlayerId;
      const node = Number(input.node);
      const selectedNotification = toComponentId(input.notificationId) ?? currentCultureNotification().value ?? null;
      const beforeCulture = readCultureState(playerId);
      const activationResult = input.activateNotification === false
        ? { ok: false, skipped: true, reason: "activation disabled" }
        : safeCall("Game.Notifications.activate", () => selectedNotification ? Game.Notifications.activate(selectedNotification) : null);
      const chooseArgs = { ProgressionTreeNodeType: node };
      const noNode = typeof ProgressionTreeNodeTypes !== "undefined" && typeof ProgressionTreeNodeTypes.NO_NODE === "number"
        ? ProgressionTreeNodeTypes.NO_NODE
        : -1;
      const clearArgs = { ProgressionTreeNodeType: noNode };
      const canChoose = safeCall("Game.PlayerOperations.canStart SET_CULTURE_TREE_NODE", () => Game.PlayerOperations.canStart(
        playerId,
        PlayerOperationTypes.SET_CULTURE_TREE_NODE,
        chooseArgs,
        false,
      ));
      const chooseResult = canChoose.ok && successFromCanStart(canChoose.value)
        ? safeCall("Game.PlayerOperations.sendRequest SET_CULTURE_TREE_NODE", () => Game.PlayerOperations.sendRequest(
          playerId,
          PlayerOperationTypes.SET_CULTURE_TREE_NODE,
          chooseArgs,
        ))
        : { ok: false, skipped: true, reason: "SET_CULTURE_TREE_NODE did not validate" };
      const canClearTarget = safeCall("Game.PlayerOperations.canStart SET_CULTURE_TREE_TARGET_NODE", () => Game.PlayerOperations.canStart(
        playerId,
        PlayerOperationTypes.SET_CULTURE_TREE_TARGET_NODE,
        clearArgs,
        false,
      ));
      const clearTargetResult = canClearTarget.ok && successFromCanStart(canClearTarget.value)
        ? safeCall("Game.PlayerOperations.sendRequest SET_CULTURE_TREE_TARGET_NODE", () => Game.PlayerOperations.sendRequest(
          playerId,
          PlayerOperationTypes.SET_CULTURE_TREE_TARGET_NODE,
          clearArgs,
        ))
        : { ok: false, skipped: true, reason: "SET_CULTURE_TREE_TARGET_NODE did not validate" };
      return {
        localPlayerId,
        playerId,
        node,
        notificationId: selectedNotification,
        beforeCulture,
        activationResult,
        canChoose,
        chooseResult,
        canClearTarget,
        clearTargetResult,
        afterCulture: readCultureState(playerId),
        sent: chooseResult.ok === true && clearTargetResult.ok === true,
        notes: [
          "This uses the App UI owner for culture chooser closeout: optional Game.Notifications.activate, SET_CULTURE_TREE_NODE, then SET_CULTURE_TREE_TARGET_NODE with NO_NODE.",
          "The caller must still re-read notification state; successful App UI sends are not proof that the culture-choice blocker cleared."
        ],
      };
    };`;
}

function diplomacyResponseCloseoutSource(): string {
  return `${probeHelperSource()}
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value.owner !== "number" || typeof value.id !== "number") return null;
      const out = { owner: value.owner, id: value.id };
      if (typeof value.type === "number") out.type = value.type;
      return out;
    };
    const safeCall = (label, fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: label + ": " + String(err) };
      }
    };
    const diplomacyManager = () => typeof DiplomacyManager === "undefined" ? null : DiplomacyManager;
    const interfaceMode = () => typeof InterfaceMode === "undefined" ? null : InterfaceMode;
    const leaderModelManager = () => typeof LeaderModelManager === "undefined" ? null : LeaderModelManager;
    const readDiplomacyState = (input) => ({
      currentProjectReactionDataActionID: diplomacyManager()?.currentProjectReactionData?.actionID ?? null,
      currentProjectReactionRequestActionID: diplomacyManager()?.currentProjectReactionRequest?.actionID ?? null,
      selectedActionID: diplomacyManager()?.selectedActionID ?? null,
      isShowing: safeCall("DiplomacyManager.isShowing", () => diplomacyManager()?.isShowing?.()),
      interfaceMode: safeCall("InterfaceMode.getCurrent", () => interfaceMode()?.getCurrent?.()),
      responseData: safeCall("Game.Diplomacy.getResponseDataForUI", () => Game.Diplomacy.getResponseDataForUI(input.actionId)),
      eventData: safeCall("Game.Diplomacy.getDiplomaticEventData", () => Game.Diplomacy.getDiplomaticEventData(input.actionId)),
    });
    const activateNotification = (notificationId) => {
      if (!notificationId) return { ok: false, skipped: true, reason: "notificationId not provided" };
      return safeCall("activate diplomacy response notification", () => {
        const notification = Game.Notifications.find(notificationId);
        if (!notification) return { found: false };
        if (!notification.Target || notification.Target.id == null) return { found: true, target: notification.Target ?? null, activated: false };
        const manager = diplomacyManager();
        if (!manager) return { found: true, target: notification.Target, activated: false, reason: "DiplomacyManager unavailable" };
        if (notification.Target.id != manager.currentProjectReactionData?.actionID && notification.Target.id != manager.currentProjectReactionRequest?.actionID) {
          manager.currentProjectReactionData = Game.Diplomacy.getResponseDataForUI(notification.Target.id);
          manager.addCurrentDiplomacyProject(manager.currentProjectReactionData);
        }
        return {
          found: true,
          target: notification.Target,
          activated: true,
          currentProjectReactionDataActionID: manager.currentProjectReactionData?.actionID ?? null,
          currentProjectReactionRequestActionID: manager.currentProjectReactionRequest?.actionID ?? null,
        };
      });
    };
    const currentBlockingDiplomacyNotification = (input) => {
      return safeCall("find current blocking diplomatic-response notification", () => {
        const blockerType = Game.Notifications.getEndTurnBlockingType(GameContext.localPlayerID);
        const id = Game.Notifications.findEndTurnBlocking(GameContext.localPlayerID, blockerType);
        const notificationId = toComponentId(id);
        const notification = notificationId ? Game.Notifications.find(notificationId) : null;
        const type = notificationId && typeof Game.Notifications.getType === "function"
          ? Game.Notifications.getType(notificationId)
          : notification?.Type ?? null;
        const typeName = typeof Game.Notifications.getTypeName === "function" ? Game.Notifications.getTypeName(type) : null;
        const actionMatches = notification?.Target?.id === input.actionId;
        return typeName === "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED" && actionMatches ? notificationId : null;
      });
    };
    const sendDiplomacyResponseCloseout = (input) => {
      const localPlayerId = GameContext.localPlayerID;
      const playerId = localPlayerId;
      const args = { ID: input.actionId, Type: input.responseType };
      const discoveredNotification = currentBlockingDiplomacyNotification(input);
      const notificationId = toComponentId(input.notificationId) ?? (discoveredNotification.ok ? discoveredNotification.value : null);
      const before = readDiplomacyState(input);
      const activationResult = input.activateNotification === false ? { ok: false, skipped: true, reason: "activation disabled" } : activateNotification(notificationId);
      const canStart = safeCall("Game.PlayerOperations.canStart", () => Game.PlayerOperations.canStart(
        playerId,
        PlayerOperationTypes.RESPOND_DIPLOMATIC_ACTION,
        args,
        false,
      ));
      let sent = false;
      let sendResult = null;
      if (canStart.ok && (canStart.value?.Success === true || canStart.value?.canStart === true)) {
        sendResult = safeCall("Game.PlayerOperations.sendRequest", () => Game.PlayerOperations.sendRequest(
          playerId,
          PlayerOperationTypes.RESPOND_DIPLOMATIC_ACTION,
          args,
        ));
        sent = sendResult.ok === true;
      }
      const shouldCloseout = input.uiCloseout !== false;
      const acknowledgeStarted = shouldCloseout
        ? safeCall("LeaderModelManager.beginAcknowledgePlayerSequence", () => leaderModelManager()?.beginAcknowledgePlayerSequence?.())
        : { ok: false, skipped: true, reason: "ui closeout disabled" };
      const closeCurrentDiplomacyProject = shouldCloseout
        ? safeCall("DiplomacyManager.closeCurrentDiplomacyProject", () => diplomacyManager()?.closeCurrentDiplomacyProject?.(false))
        : { ok: false, skipped: true, reason: "ui closeout disabled" };
      const hide = shouldCloseout
        ? safeCall("DiplomacyManager.hide", () => diplomacyManager()?.hide?.(false))
        : { ok: false, skipped: true, reason: "ui closeout disabled" };
      return {
        localPlayerId,
        playerId,
        actionId: input.actionId,
        responseType: input.responseType,
        args,
        notificationId,
        discoveredNotification,
        activated: activationResult.ok === true && activationResult.value?.activated === true,
        activationResult,
        canStart,
        sent,
        sendResult,
        uiCloseout: {
          requested: shouldCloseout,
          acknowledgeStarted,
          closeCurrentDiplomacyProject,
          hide,
        },
        diplomacyState: {
          before,
          after: readDiplomacyState(input),
        },
        notes: [
          "This follows the official response-panel path more closely than a raw player-operation send: optional notification activation, RESPOND_DIPLOMATIC_ACTION, leader acknowledgement, and diplomacy UI closeout.",
          "If postcondition remains no-state-change, inspect notification expiry/target state before retrying another response."
        ],
      };
    };`;
}

function narrativeChoiceRequestSource(): string {
  return `${probeHelperSource()}
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value.owner !== "number" || typeof value.id !== "number") return null;
      const out = { owner: value.owner, id: value.id };
      if (typeof value.type === "number") out.type = value.type;
      return out;
    };
    const sameComponentId = (left, right) => {
      const a = toComponentId(left);
      const b = toComponentId(right);
      if (!a || !b) return false;
      return a.owner === b.owner && a.id === b.id && (a.type ?? null) === (b.type ?? null);
    };
    const safeCall = (label, fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: label + ": " + String(err) };
      }
    };
    const narrativeSelectors = [
      "small-narrative-event",
      "graphic-narrative-event",
      "screen-narrative-event",
      "screen-narrative-trial",
    ];
    const viewMethod = () => typeof UIViewChangeMethod !== "undefined" ? UIViewChangeMethod.PlayerInteraction : undefined;
    const narrativePopupManager = () => typeof NarrativePopupManager === "undefined" ? null : NarrativePopupManager;
    const narrativePanels = () => {
      if (typeof document === "undefined") return [];
      return narrativeSelectors.flatMap((selector) => Array.from(document.querySelectorAll?.(selector) ?? []));
    };
    const summarizePanel = (root) => {
      const component = root?._component ?? null;
      return {
        panelType: root?.tagName ?? null,
        componentType: component?.constructor?.name ?? null,
        targetStoryId: toComponentId(component?.targetStoryId),
        storyType: component?.storyType ?? null,
        choiceKeys: Array.from(root?.querySelectorAll?.("fxs-reward-button[small-narrative-choice-key]") ?? [])
          .map((button) => button.getAttribute("small-narrative-choice-key"))
          .filter(Boolean),
      };
    };
    const readNarrativeUiState = (target) => {
      const panels = narrativePanels().map(summarizePanel);
      const matchingPanels = panels.filter((panel) => sameComponentId(panel.targetStoryId, target));
      return {
        panelCount: panels.length,
        panels,
        matchingPanelCount: matchingPanels.length,
        matchingPanels,
        popupShowing: safeCall("NarrativePopupManager.isShowing", () => narrativePopupManager()?.isShowing?.()),
        currentNarrativeData: safeCall("NarrativePopupManager.currentNarrativeData", () => narrativePopupManager()?.currentNarrativeData ?? null),
      };
    };
    const closeVisibleNarrativePanels = (target) => safeCall("visible narrative panel close", () => {
      const panels = narrativePanels()
        .filter((root) => sameComponentId(root?._component?.targetStoryId, target));
      const method = viewMethod();
      const results = panels.map((root) => {
        const component = root?._component ?? null;
        if (typeof component?.close !== "function") {
          return { panelType: root?.tagName ?? null, closed: false, reason: "panel component has no close function" };
        }
        component.close(method);
        return { panelType: root?.tagName ?? null, closed: true };
      });
      return { attempted: panels.length, results };
    });
    const closeNarrativePopup = () => safeCall("NarrativePopupManager.closePopup", () => {
      const manager = narrativePopupManager();
      if (!manager || typeof manager.closePopup !== "function") return { available: false };
      manager.closePopup();
      return { available: true };
    });
    const sendNarrativeChoice = (input) => {
      const localPlayerId = GameContext.localPlayerID;
      const playerId = localPlayerId;
      const args = { TargetType: input.targetType, Target: input.target, Action: input.action };
      const before = readNarrativeUiState(input.target);
      const canStart = safeCall("Game.PlayerOperations.canStart", () => Game.PlayerOperations.canStart(
        playerId,
        PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION,
        args,
        false,
      ));
      let sent = false;
      let sendResult = null;
      if (canStart.ok && (canStart.value?.Success === true || canStart.value?.canStart === true)) {
        sendResult = safeCall("Game.PlayerOperations.sendRequest", () => Game.PlayerOperations.sendRequest(
          playerId,
          PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION,
          args,
        ));
        sent = sendResult.ok === true;
      }
      const popupClose = sent ? closeNarrativePopup() : { ok: false, skipped: true, reason: "operation was not sent" };
      const panelClose = sent ? closeVisibleNarrativePanels(input.target) : { ok: false, skipped: true, reason: "operation was not sent" };
      return {
        localPlayerId,
        playerId,
        args,
        canStart,
        sent,
        sendResult,
        ui: {
          before,
          after: readNarrativeUiState(input.target),
          panelClose,
          popupClose,
        },
        notes: [
          "This mirrors the official narrative button handler: CHOOSE_NARRATIVE_STORY_DIRECTION, NarrativePopupManager.closePopup, and visible narrative panel close.",
        ],
      };
    };`;
}

function productionChoiceRequestSource(): string {
  return `${probeHelperSource()}
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value.owner !== "number" || typeof value.id !== "number") return null;
      const out = { owner: value.owner, id: value.id };
      if (typeof value.type === "number") out.type = value.type;
      return out;
    };
    const componentKey = (value) => {
      const id = toComponentId(value);
      return id ? [id.owner, id.id, id.type ?? ""].join(":") : "";
    };
    const notificationValue = (notification, keys) => {
      for (const key of keys) {
        try {
          const value = notification == null ? undefined : notification[key];
          if (typeof value === "function") return value.call(notification);
          if (value !== undefined) return value;
        } catch {}
      }
      return null;
    };
    const successFromCanStart = (result) => {
      if (result === true) return true;
      if (result === false || result == null) return false;
      if (typeof result === "object") {
        if (result.Success !== undefined) return result.Success === true;
        if (result.success !== undefined) return result.success === true;
        if (result.canStart !== undefined) return result.canStart === true;
      }
      return Boolean(result);
    };
    const summarizeBuildQueue = (city, args) => {
      const buildQueue = city?.BuildQueue ?? city?.buildQueue ?? city?.buildQueueManager ?? null;
      if (!buildQueue) return null;
      return {
        currentProductionTypeHash: buildQueue.currentProductionTypeHash ?? buildQueue.currentProductionType ?? null,
        previousProductionTypeHash: buildQueue.previousProductionTypeHash ?? buildQueue.previousProductionType ?? null,
        productionProgress: (() => {
          try {
            return typeof buildQueue.getProductionProgress === "function"
              ? buildQueue.getProductionProgress()
              : buildQueue.productionProgress ?? buildQueue.progress ?? null;
          } catch {
            return buildQueue.productionProgress ?? buildQueue.progress ?? null;
          }
        })(),
        turnsLeftForRequestedItem: (() => {
          try {
            const requestedType = args?.UnitType ?? args?.ConstructibleType ?? args?.ProjectType ?? null;
            return requestedType == null || typeof buildQueue.getTurnsLeft !== "function"
              ? null
              : buildQueue.getTurnsLeft(requestedType);
          } catch {
            return null;
          }
        })(),
        queueLength: (() => {
          try {
            return typeof buildQueue.getQueue === "function" ? buildQueue.getQueue()?.length ?? null : null;
          } catch {
            return null;
          }
        })(),
      };
    };
    const readProductionPostconditionSnapshot = (input) => {
      const cityId = toComponentId(input.cityId);
      const city = cityId ? globalThis.Cities?.get?.(cityId) : null;
      return {
        cityId,
        city: probe(() => city ? {
          id: toComponentId(cityId),
          observedCityId: toComponentId(city.id),
          population: city.population ?? null,
          isTown: city.isTown ?? null,
          location: city.location ?? null,
        } : null),
        buildQueue: probe(() => summarizeBuildQueue(city, input.args ?? null)),
        selectedCityId: probe(() => toComponentId(globalThis.UI?.Player?.getHeadSelectedCity?.())),
        blocker: probe(() => globalThis.Game?.Notifications?.getEndTurnBlockingType?.(globalThis.GameContext?.localPlayerID)),
        canEndTurn: probe(() => globalThis.Game?.TurnManager?.canEndTurn?.() ?? null),
        blockingProductionNotification: probe(() => {
          const notifications = globalThis.Game?.Notifications;
          const localPlayerId = globalThis.GameContext?.localPlayerID;
          if (!notifications || localPlayerId == null) return null;
          const blockerType = typeof notifications.getEndTurnBlockingType === "function"
            ? notifications.getEndTurnBlockingType(localPlayerId)
            : null;
          const blockerId = typeof notifications.findEndTurnBlocking === "function"
            ? notifications.findEndTurnBlocking(localPlayerId, blockerType)
            : null;
          const id = toComponentId(blockerId);
          if (!id) return null;
          const notification = typeof notifications.find === "function" ? notifications.find(id) : null;
          const type = typeof notifications.getType === "function" ? notifications.getType(id) : notificationValue(notification, ["Type", "type"]);
          const typeName = typeof notifications.getTypeName === "function" ? notifications.getTypeName(type) : null;
          const target = notificationValue(notification, ["Target", "target"]);
          if (!String(typeName ?? "").includes("CHOOSE_CITY_PRODUCTION")) return null;
          return {
            id,
            type,
            typeName,
            target,
            matchesCity: cityId ? componentKey(target) === componentKey(cityId) : null,
            canUserDismiss: notificationValue(notification, ["CanUserDismiss", "canUserDismiss"]),
            expired: notificationValue(notification, ["Expired", "expired"]),
            dismissed: notificationValue(notification, ["Dismissed", "dismissed"]),
          };
        }),
      };
    };
    const activateProductionCity = (cityId) => probe(() => {
      globalThis.UI?.Player?.lookAtID?.(cityId);
      globalThis.UI?.Player?.selectCity?.(cityId);
      const cityLocation = globalThis.Cities?.get?.(cityId)?.location;
      if (cityLocation && globalThis.PlotCursor) {
        globalThis.PlotCursor.plotCursorCoords = cityLocation;
      }
      return { selectedCityId: toComponentId(globalThis.UI?.Player?.getHeadSelectedCity?.()) };
    });
    const closeProductionUi = () => probe(() => {
      globalThis.UI?.Player?.deselectAllCities?.();
      globalThis.InterfaceMode?.switchToDefault?.();
      return {
        selectedCityId: toComponentId(globalThis.UI?.Player?.getHeadSelectedCity?.()),
        interfaceMode: globalThis.InterfaceMode?.getCurrentMode?.() ?? null,
      };
    });
    const readProductionChoice = (input, options) => {
      const cityId = toComponentId(input.cityId);
      if (!cityId) throw new Error("Production choice cityId must be a ComponentID.");
      const itemKeys = ["UnitType", "ConstructibleType", "ProjectType"].filter((key) => Number.isInteger(input.args?.[key]));
      if (itemKeys.length !== 1) throw new Error("Production choice requires exactly one UnitType, ConstructibleType, or ProjectType.");
      const args = { ...input.args };
      const beforeProductionPostcondition = readProductionPostconditionSnapshot({ cityId, args });
      const city = globalThis.Cities?.get?.(cityId) ?? null;
      const cityActivation = options.send ? activateProductionCity(cityId) : { ok: false, skipped: true, reason: "read-only production choice status" };
      const beforeValidation = probe(() => globalThis.Game.CityOperations.canStart(cityId, globalThis.CityOperationTypes.BUILD, args, false));
      let sent = false;
      let sendResult = { ok: false, skipped: true, reason: "send not requested" };
      let interfaceClose = { ok: false, skipped: true, reason: "send not requested" };
      if (options.send && successFromCanStart(beforeValidation.value)) {
        const result = beforeValidation.value;
        if (result && typeof result === "object" && result.InProgress && Array.isArray(result.Plots) && result.Plots.length > 0 && args.X == null && args.Y == null) {
          const loc = globalThis.GameplayMap?.getLocationFromIndex?.(result.Plots[0]);
          if (loc) {
            args.X = loc.x;
            args.Y = loc.y;
          }
        }
        if (Number.isInteger(args.ProjectType) && city?.isTown && globalThis.CityOperationsParametersValues?.Exclusive !== undefined) {
          args.InsertMode = globalThis.CityOperationsParametersValues.Exclusive;
        }
        sendResult = probe(() => globalThis.Game.CityOperations.sendRequest(cityId, globalThis.CityOperationTypes.BUILD, args));
        sent = sendResult.ok === true && sendResult.value !== false;
        interfaceClose = sent ? closeProductionUi() : { ok: false, skipped: true, reason: "sendRequest did not report success" };
      }
      const afterValidation = probe(() => globalThis.Game.CityOperations.canStart(cityId, globalThis.CityOperationTypes.BUILD, args, false));
      const afterProductionPostcondition = readProductionPostconditionSnapshot({ cityId, args });
      return {
        cityId,
        args,
        beforeValidation,
        afterValidation,
        sent,
        sendResult,
        beforeProductionPostcondition,
        afterProductionPostcondition,
        ui: { cityActivation, interfaceClose },
        notes: [
          "This mirrors the official production chooser path: activate the target city, validate BUILD, send Game.CityOperations.BUILD, then clear selected-city/interface state after a successful production choice.",
        ],
      };
    };`;
}

function notificationDismissalSource(): string {
  return `${probeHelperSource()}
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value.owner !== "number" || typeof value.id !== "number") return null;
      const out = { owner: value.owner, id: value.id };
      if (typeof value.type === "number") out.type = value.type;
      return out;
    };
    const componentKey = (value) => {
      const id = toComponentId(value);
      return id ? [id.owner, id.id, id.type ?? ""].join(":") : "";
    };
    const safeNotificationValue = (notification, key) => {
      try {
        const value = notification == null ? undefined : notification[key];
        if (typeof value === "function") return value.call(notification);
        return value === undefined ? null : value;
      } catch (err) {
        return { error: String(err) };
      }
    };
    const notificationTrainModel = () => typeof NotificationModel !== "undefined"
      ? NotificationModel
      : globalThis.NotificationModel;
    const notificationTrainManager = () => notificationTrainModel()?.manager ?? null;
    const notificationTrainQueueIds = () => {
      const model = notificationTrainModel();
      const manager = model?.manager;
      const playerEntry = manager?.findPlayer?.(GameContext.localPlayerID);
      if (!playerEntry || typeof playerEntry.getTypesBy !== "function") return [];
      const queryBy = model?.QueryBy?.Priority ?? 2;
      const entries = playerEntry.getTypesBy(queryBy, true) ?? [];
      const ids = [];
      for (const entry of entries) {
        const notifications = entry?.notifications ?? [];
        for (const id of notifications) {
          const normalized = toComponentId(id);
          if (normalized) ids.push(normalized);
        }
      }
      return ids;
    };
    const summarize = (id) => {
      const normalizedId = toComponentId(id);
      const notification = normalizedId ? Game.Notifications.find(normalizedId) : null;
      const type = (() => {
        try {
          return typeof Game.Notifications.getType === "function"
            ? Game.Notifications.getType(normalizedId)
            : notification?.Type ?? null;
        } catch {
          return notification?.Type ?? null;
        }
      })();
      const typeName = (() => {
        try {
          return typeof Game.Notifications.getTypeName === "function"
            ? Game.Notifications.getTypeName(type)
            : null;
        } catch {
          return null;
        }
      })();
      const endTurnBlockingType = probe(() => Game.Notifications.getEndTurnBlockingType(GameContext.localPlayerID));
      const isEndTurnBlocking = probe(() => {
        const blockerType = endTurnBlockingType.ok ? endTurnBlockingType.value : Game.Notifications.getEndTurnBlockingType(GameContext.localPlayerID);
        const blockerId = Game.Notifications.findEndTurnBlocking(GameContext.localPlayerID, blockerType);
        return componentKey(blockerId) === componentKey(normalizedId);
      });
      const engineQueueIds = probe(() => {
        if (typeof Game.Notifications.getIdsForPlayer !== "function") return [];
        const ids = Game.Notifications.getIdsForPlayer(GameContext.localPlayerID);
        return Array.isArray(ids) ? ids.map((value) => toComponentId(value)).filter(Boolean) : [];
      });
      const engineIds = engineQueueIds.ok ? engineQueueIds.value : [];
      const engineQueueFirstId = probe(() => engineIds.length > 0 ? engineIds[0] : null);
      const engineQueueContains = probe(() => engineIds.some((value) => componentKey(value) === componentKey(normalizedId)));
      const isEngineQueueFront = probe(() => componentKey(engineQueueFirstId.ok ? engineQueueFirstId.value : null) === componentKey(normalizedId));
      const trainQueueIds = probe(() => notificationTrainQueueIds());
      const trainIds = trainQueueIds.ok ? trainQueueIds.value : [];
      const notificationTrainFirstId = probe(() => trainIds.length > 0 ? trainIds[0] : null);
      const notificationTrainContains = probe(() => trainIds.some((value) => componentKey(value) === componentKey(normalizedId)));
      const isNotificationTrainFront = probe(() => componentKey(notificationTrainFirstId.ok ? notificationTrainFirstId.value : null) === componentKey(normalizedId));
      return {
        id: normalizedId,
        exists: notification != null,
        type,
        typeName,
        summary: (() => {
          try {
            return typeof Game.Notifications.getSummary === "function"
              ? Game.Notifications.getSummary(normalizedId) ?? null
              : safeNotificationValue(notification, "Summary");
          } catch {
            return safeNotificationValue(notification, "Summary");
          }
        })(),
        message: (() => {
          try {
            return typeof Game.Notifications.getMessage === "function"
              ? Game.Notifications.getMessage(normalizedId) ?? null
              : safeNotificationValue(notification, "Message");
          } catch {
            return safeNotificationValue(notification, "Message");
          }
        })(),
        target: safeNotificationValue(notification, "Target"),
        location: safeNotificationValue(notification, "Location"),
        canUserDismiss: safeNotificationValue(notification, "CanUserDismiss"),
        expired: safeNotificationValue(notification, "Expired"),
        dismissed: safeNotificationValue(notification, "Dismissed"),
        blocksTurnAdvancement: probe(() => typeof Game.Notifications.getBlocksTurnAdvancement === "function"
          ? Game.Notifications.getBlocksTurnAdvancement(normalizedId)
          : safeNotificationValue(notification, "BlocksTurnAdvancement")),
        endTurnBlockingType,
        isEndTurnBlocking,
        engineQueueCount: probe(() => engineIds.length),
        engineQueueContains,
        engineQueueFirstId,
        isEngineQueueFront,
        notificationTrainCount: probe(() => trainIds.length),
        notificationTrainContains,
        notificationTrainFirstId,
        isNotificationTrainFront,
      };
    };
    const verifiedDismissed = (before, after) => {
      if (after == null) return false;
      if (after.exists === false) return true;
      const engineStillFront = after.isEngineQueueFront?.ok === true && after.isEngineQueueFront.value === true;
      if (engineStillFront) return false;
      if (after.dismissed === true) return true;
      const wasInEngineQueue = before?.engineQueueContains?.ok === true && before.engineQueueContains.value === true;
      if (wasInEngineQueue && after.engineQueueContains?.ok === true && after.engineQueueContains.value === false) return true;
      const wasInTrain = before?.notificationTrainContains?.ok === true && before.notificationTrainContains.value === true;
      if (wasInTrain && after.notificationTrainContains?.ok === true && after.notificationTrainContains.value === false) return true;
      const wasEngineFront = before?.isEngineQueueFront?.ok === true && before.isEngineQueueFront.value === true;
      if (wasEngineFront && after.isEngineQueueFront?.ok === true && after.isEngineQueueFront.value === false) return true;
      const wasTrainFront = before?.isNotificationTrainFront?.ok === true && before.isNotificationTrainFront.value === true;
      if (wasTrainFront && after.isNotificationTrainFront?.ok === true && after.isNotificationTrainFront.value === false) return true;
      return false;
    };
    const notificationTrainManagerDismiss = (notificationId) => {
      const manager = notificationTrainManager();
      if (!manager) return { ok: false, attempted: false, available: false, reason: "NotificationModel.manager unavailable in this App UI eval scope" };
      if (typeof manager.dismiss === "function") {
        try {
          const value = manager.dismiss(notificationId);
          return { ok: true, attempted: true, available: true, path: "NotificationModel.manager.dismiss", value };
        } catch (err) {
          return { ok: false, attempted: true, available: true, path: "NotificationModel.manager.dismiss", error: String(err) };
        }
      }
      if (typeof manager.onDismiss === "function") {
        try {
          const value = manager.onDismiss(notificationId);
          return { ok: true, attempted: true, available: true, path: "NotificationModel.manager.onDismiss", value };
        } catch (err) {
          return { ok: false, attempted: true, available: true, path: "NotificationModel.manager.onDismiss", error: String(err) };
        }
      }
      return { ok: false, attempted: false, available: false, reason: "NotificationModel.manager exposes no dismiss/onDismiss function" };
    };
    const panelCloseControlDismiss = (notificationId, before) => {
      if (typeof Game.Notifications.dismiss !== "function") {
        return { ok: false, attempted: false, available: false, reason: "Game.Notifications.dismiss unavailable in this App UI eval scope" };
      }
      const noneBlocker = globalThis.EndTurnBlockingTypes?.NONE ?? 0;
      const blockingType = before?.endTurnBlockingType?.ok === true ? before.endTurnBlockingType.value : null;
      if (blockingType != null && blockingType !== noneBlocker && before?.isEndTurnBlocking?.ok === true && before.isEndTurnBlocking.value === true) {
        return { ok: false, attempted: false, available: false, path: "Game.Notifications.dismiss", reason: "official panel close control does not dismiss the active end-turn blocker" };
      }
      try {
        return { ok: true, attempted: true, available: true, path: "Game.Notifications.dismiss", value: Game.Notifications.dismiss(notificationId) };
      } catch (err) {
        return { ok: false, attempted: true, available: true, path: "Game.Notifications.dismiss", error: String(err) };
      }
    };
    const waitForDismissalVerification = (notificationId, before, attempts) => {
      const out = [];
      for (let index = 0; index < attempts; index += 1) {
        const current = summarize(notificationId);
        out.push(current);
        if (verifiedDismissed(before, current)) break;
        const waitUntil = Date.now() + 25;
        while (Date.now() < waitUntil) {}
      }
      return out;
    };
    const readNotificationDismissal = (input, options) => {
      const notificationId = input.notificationId;
      const before = summarize(notificationId);
      const noneBlocker = globalThis.EndTurnBlockingTypes?.NONE ?? 0;
      const blockerType = before.endTurnBlockingType?.ok === true ? before.endTurnBlockingType.value : null;
      const canUseExpiredPanelCloseControl = before.exists === true
        && before.expired === true
        && blockerType === noneBlocker;
      const canDismiss = before.exists === true && (before.canUserDismiss === true || canUseExpiredPanelCloseControl);
      const notes = [
        "This is an App UI notification action, not a gameplay operation family.",
        "Use it only for reviewed notifications whose official handler does not require a specialized operation.",
        "Send mode records both official actor routes: notification-train manager dismissal and the visible panel close-control dismissal when that route is available for this item.",
        "Expired front notifications may use the desktop panel close-control route when Civ reports no typed end-turn blocker; success still requires identity-based disappearance or queue/front movement.",
        "Verification is identity-based: disappeared, dismissed, removed from the engine queue or notification train, or moved off a front position it occupied before send. Non-blocking status alone is not proof.",
        "The embedded App UI action records immediate route evidence. The direct-control wrapper performs final verification across separate App UI reads so frame-driven queues can advance."
      ];
      if (options.send !== true) {
        return {
          notificationId,
          before,
          after: null,
          canDismiss,
          sent: false,
          result: null,
          closeoutPath: null,
          verificationAttempts: [],
          verified: false,
          notes,
        };
      }
      if (!canDismiss) {
        return {
          notificationId,
          before,
          after: before,
          canDismiss,
          sent: false,
          result: null,
          closeoutPath: null,
          verificationAttempts: [before],
          verified: false,
          notes: notes.concat(["Notification was not dismissed because canUserDismiss was not true."]),
        };
      }
      const managerResult = notificationTrainManagerDismiss(notificationId);
      const panelCloseControlResult = panelCloseControlDismiss(notificationId, before);
      const verificationAttempts = waitForDismissalVerification(notificationId, before, options.verificationAttempts ?? 3);
      const after = verificationAttempts[verificationAttempts.length - 1] ?? summarize(notificationId);
      const result = {
        notificationTrainManager: managerResult,
        panelCloseControl: panelCloseControlResult,
      };
      const closeoutPath = [managerResult, panelCloseControlResult]
        .filter((value) => value?.attempted && value?.path)
        .map((value) => value.path)
        .join("+") || null;
      return {
        notificationId,
        before,
        after,
        canDismiss,
        sent: true,
        closeoutPath,
        result,
        verificationAttempts,
        verified: verifiedDismissed(before, after),
        notes,
      };
    };`;
}

function operationRouterSource(): string {
  return `${probeHelperSource()}
    const readNumericField = (value, lowerKey, upperKey) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value[lowerKey] === "number") return value[lowerKey];
      if (typeof value[upperKey] === "number") return value[upperKey];
      return null;
    };
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      const owner = readNumericField(value, "owner", "Owner");
      const id = readNumericField(value, "id", "ID");
      if (owner == null || id == null) return null;
      const out = { owner, id };
      const type = readNumericField(value, "type", "Type");
      if (type != null) out.type = type;
      return out;
    };
    const summarizeUnitForPostcondition = (unit) => {
      if (!unit) return null;
      const location = unit.location ?? unit.Location ?? null;
      const movement = unit.Movement ?? unit.movement ?? unit.movementMovesRemaining ?? null;
      const activity = unit.Activity ?? unit.activity ?? unit.currentActivity ?? null;
      const damage = unit.Damage ?? unit.damage ?? null;
      const attacks = unit.Attacks ?? unit.attacks ?? unit.attackCharges ?? null;
      return {
        id: toComponentId(unit.id ?? unit.ID ?? unit.UnitId ?? unit.unitId),
        location,
        movement,
        activity,
        damage,
        attacks,
      };
    };
    const readUnitPostconditionSnapshot = (input) => ({
      unit: probe(() => summarizeUnitForPostcondition(globalThis.Units?.get?.(input.unitId))),
      selectedUnitId: probe(() => toComponentId(globalThis.UI?.Player?.getHeadSelectedUnit?.())),
      firstReadyUnitId: probe(() => toComponentId(globalThis.UI?.Player?.getFirstReadyUnit?.())),
      blocker: probe(() => globalThis.Game?.Notifications?.getEndTurnBlockingType?.(globalThis.GameContext?.localPlayerID)),
    });
    const unitPostconditionEligible = (family) => family === "unit-operation" || family === "unit-command";
    const readyPopulationCityId = () => {
      const player = globalThis.Players?.get?.(globalThis.GameContext?.localPlayerID);
      const cityIds = player?.Cities?.getCityIds?.() ?? [];
      for (const cityId of cityIds) {
        const city = globalThis.Cities?.get?.(cityId);
        if (city?.Growth?.isReadyToPlacePopulation) return toComponentId(cityId);
      }
      return null;
    };
    const populationPostconditionCityId = (family, input) => {
      if (family === "city-command" && input.operationType === "EXPAND") return toComponentId(input.cityId);
      if (family === "player-operation" && input.operationType === "ASSIGN_WORKER") return readyPopulationCityId();
      return null;
    };
    const populationPostconditionEligible = (family, input) => !!populationPostconditionCityId(family, input);
    const readPopulationPlacementPostconditionSnapshot = (cityId) => {
      const city = globalThis.Cities?.get?.(cityId);
      const placementInfo = city?.Workers?.GetAllPlacementInfo?.() ?? [];
      const expansion = (() => {
        try {
          if (typeof globalThis.CityCommandTypes === "undefined") return null;
          return globalThis.Game?.CityCommands?.canStart?.(cityId, globalThis.CityCommandTypes.EXPAND, {}, false);
        } catch {
          return null;
        }
      })();
      return {
        cityId,
        city: probe(() => city ? {
          id: toComponentId(cityId),
          observedCityId: toComponentId(city.id),
          population: city.population ?? null,
          isTown: city.isTown ?? null,
          location: city.location ?? null,
        } : null),
        isReadyToPlacePopulation: probe(() => city?.Growth?.isReadyToPlacePopulation ?? null),
        cityWorkerCap: probe(() => city?.Workers?.getCityWorkerCap?.() ?? null),
        workablePlotIndexes: probe(() => Array.isArray(placementInfo) ? placementInfo.filter((info) => !info?.IsBlocked).map((info) => info?.PlotIndex) : []),
        blockedPlotIndexes: probe(() => Array.isArray(placementInfo) ? placementInfo.filter((info) => info?.IsBlocked).map((info) => info?.PlotIndex) : []),
        expansionPlotIndexes: probe(() => Array.isArray(expansion?.Plots) ? expansion.Plots : []),
      };
    };
    const componentKey = (value) => {
      const id = toComponentId(value);
      return id ? id.owner + ":" + id.id + ":" + (id.type ?? "") : "";
    };
    const notificationValue = (notification, names) => {
      for (const name of names) {
        if (notification && Object.prototype.hasOwnProperty.call(notification, name)) return notification[name];
        const getter = "get" + name;
        if (typeof notification?.[getter] === "function") {
          try {
            return notification[getter]();
          } catch {}
        }
      }
      return null;
    };
    const summarizeBuildQueue = (city, args) => {
      const buildQueue = city?.BuildQueue;
      if (!buildQueue) return null;
      return {
        currentProductionTypeHash: (() => {
          try {
            return typeof buildQueue.getCurrentProductionTypeHash === "function"
              ? buildQueue.getCurrentProductionTypeHash()
              : buildQueue.currentProductionTypeHash ?? buildQueue.productionTypeHash ?? null;
          } catch {
            return buildQueue.currentProductionTypeHash ?? buildQueue.productionTypeHash ?? null;
          }
        })(),
        previousProductionTypeHash: (() => {
          try {
            return typeof buildQueue.getPreviousProductionTypeHash === "function"
              ? buildQueue.getPreviousProductionTypeHash()
              : buildQueue.previousProductionTypeHash ?? null;
          } catch {
            return buildQueue.previousProductionTypeHash ?? null;
          }
        })(),
        productionProgress: (() => {
          try {
            return typeof buildQueue.getProductionProgress === "function"
              ? buildQueue.getProductionProgress()
              : buildQueue.productionProgress ?? buildQueue.progress ?? null;
          } catch {
            return buildQueue.productionProgress ?? buildQueue.progress ?? null;
          }
        })(),
        turnsLeftForRequestedItem: (() => {
          try {
            const requestedType = args?.UnitType ?? args?.ConstructibleType ?? args?.ProjectType ?? null;
            return requestedType == null || typeof buildQueue.getTurnsLeft !== "function"
              ? null
              : buildQueue.getTurnsLeft(requestedType);
          } catch {
            return null;
          }
        })(),
        queueLength: (() => {
          try {
            return typeof buildQueue.getQueue === "function" ? buildQueue.getQueue()?.length ?? null : null;
          } catch {
            return null;
          }
        })(),
      };
    };
    const productionPostconditionEligible = (family, input) => family === "city-operation" && input.operationType === "BUILD";
    const readProductionPostconditionSnapshot = (input) => {
      const cityId = toComponentId(input.cityId);
      const city = cityId ? globalThis.Cities?.get?.(cityId) : null;
      return {
        cityId,
        city: probe(() => city ? {
          id: toComponentId(cityId),
          observedCityId: toComponentId(city.id),
          population: city.population ?? null,
          isTown: city.isTown ?? null,
          location: city.location ?? null,
        } : null),
        buildQueue: probe(() => summarizeBuildQueue(city, input.args ?? null)),
        selectedCityId: probe(() => toComponentId(globalThis.UI?.Player?.getHeadSelectedCity?.())),
        blocker: probe(() => globalThis.Game?.Notifications?.getEndTurnBlockingType?.(globalThis.GameContext?.localPlayerID)),
        canEndTurn: probe(() => globalThis.Game?.TurnManager?.canEndTurn?.() ?? null),
        blockingProductionNotification: probe(() => {
          const notifications = globalThis.Game?.Notifications;
          const localPlayerId = globalThis.GameContext?.localPlayerID;
          if (!notifications || localPlayerId == null) return null;
          const blockerType = typeof notifications.getEndTurnBlockingType === "function"
            ? notifications.getEndTurnBlockingType(localPlayerId)
            : null;
          const blockerId = typeof notifications.findEndTurnBlocking === "function"
            ? notifications.findEndTurnBlocking(localPlayerId, blockerType)
            : null;
          const id = toComponentId(blockerId);
          if (!id) return null;
          const notification = typeof notifications.find === "function" ? notifications.find(id) : null;
          const type = typeof notifications.getType === "function" ? notifications.getType(id) : notificationValue(notification, ["Type", "type"]);
          const typeName = typeof notifications.getTypeName === "function" ? notifications.getTypeName(type) : null;
          const target = notificationValue(notification, ["Target", "target"]);
          if (!String(typeName ?? "").includes("CHOOSE_CITY_PRODUCTION")) return null;
          return {
            id,
            type,
            typeName,
            target,
            matchesCity: cityId ? componentKey(target) === componentKey(cityId) : null,
            canUserDismiss: notificationValue(notification, ["CanUserDismiss", "canUserDismiss"]),
            expired: notificationValue(notification, ["Expired", "expired"]),
            dismissed: notificationValue(notification, ["Dismissed", "dismissed"]),
          };
        }),
      };
    };
    const routerFor = (family) => {
      if (family === "unit-operation") return { router: Game.UnitOperations, enums: UnitOperationTypes, targetKey: "unitId" };
      if (family === "unit-command") return { router: Game.UnitCommands, enums: UnitCommandTypes, targetKey: "unitId" };
      if (family === "city-operation") return { router: Game.CityOperations, enums: CityOperationTypes, targetKey: "cityId" };
      if (family === "city-command") return { router: Game.CityCommands, enums: CityCommandTypes, targetKey: "cityId" };
      if (family === "player-operation") return { router: Game.PlayerOperations, enums: PlayerOperationTypes, targetKey: "playerId" };
      throw new Error("Unsupported operation family " + family);
    };
    const enumValueFor = (enums, operationType) => {
      if (enums && Object.prototype.hasOwnProperty.call(enums, operationType)) return enums[operationType];
      if (enums && typeof operationType === "string") {
        const normalizedKeys = [
          operationType.replace(/^UNITOPERATION_/, ""),
          operationType.replace(/^UNITCOMMAND_/, ""),
          operationType.replace(/^CITYOPERATION_/, ""),
          operationType.replace(/^CITYCOMMAND_/, ""),
          operationType.replace(/^PLAYEROPERATION_/, ""),
        ];
        for (const key of normalizedKeys) {
          if (Object.prototype.hasOwnProperty.call(enums, key)) return enums[key];
        }
      }
      return operationType;
    };
    const callCanStart = (router, target, enumValue, args) => {
      const attempts = [
        () => router.canStart(target, enumValue, args ?? {}, false),
        () => router.canStart(target, enumValue, args ?? {}),
        () => router.canStart(target, enumValue),
      ];
      let last;
      for (const attempt of attempts) {
        try {
          return attempt();
        } catch (err) {
          last = err;
        }
      }
      throw last;
    };
    const successFromCanStart = (result) => {
      if (result === true) return true;
      if (result === false || result == null) return false;
      if (typeof result === "object") {
        if (result.Success !== undefined) return result.Success === true;
        if (result.success !== undefined) return result.success === true;
        if (result.canStart !== undefined) return result.canStart === true;
      }
      return Boolean(result);
    };
    const validateOperation = (family, input) => {
      const meta = routerFor(family);
      const enumValue = enumValueFor(meta.enums, input.operationType);
      const target = input[meta.targetKey];
      const result = callCanStart(meta.router, target, enumValue, input.args);
      return {
        family,
        operationType: input.operationType,
        enumValue,
        target: { [meta.targetKey]: target },
        args: input.args,
        valid: successFromCanStart(result),
        result,
      };
    };
    const sendOperation = (family, input) => {
      const beforePostcondition = unitPostconditionEligible(family) ? readUnitPostconditionSnapshot(input) : undefined;
      const populationCityId = populationPostconditionCityId(family, input);
      const beforePopulationPostcondition = populationCityId ? readPopulationPlacementPostconditionSnapshot(populationCityId) : undefined;
      const beforeProductionPostcondition = productionPostconditionEligible(family, input) ? readProductionPostconditionSnapshot(input) : undefined;
      const before = validateOperation(family, input);
      if (!before.valid) return {
        sent: false,
        before,
        result: null,
        beforePostcondition,
        afterPostcondition: beforePostcondition,
        beforePopulationPostcondition,
        afterPopulationPostcondition: beforePopulationPostcondition,
        beforeProductionPostcondition,
        afterProductionPostcondition: beforeProductionPostcondition,
      };
      const meta = routerFor(family);
      const target = input[meta.targetKey];
      const result = meta.router.sendRequest(target, before.enumValue, input.args ?? {});
      const afterPostcondition = unitPostconditionEligible(family) ? readUnitPostconditionSnapshot(input) : undefined;
      const afterPopulationPostcondition = populationCityId ? readPopulationPlacementPostconditionSnapshot(populationCityId) : undefined;
      const afterProductionPostcondition = productionPostconditionEligible(family, input) ? readProductionPostconditionSnapshot(input) : undefined;
      return { sent: true, before, result, beforePostcondition, afterPostcondition, beforePopulationPostcondition, afterPopulationPostcondition, beforeProductionPostcondition, afterProductionPostcondition };
    };`;
}

function unitTargetActionSource(): string {
  return `${probeHelperSource()}
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value.owner !== "number" || typeof value.id !== "number") return null;
      const out = { owner: value.owner, id: value.id };
      if (typeof value.type === "number") out.type = value.type;
      return out;
    };
    const enumValueFor = (enums, operationType) => {
      if (enums && Object.prototype.hasOwnProperty.call(enums, operationType)) return enums[operationType];
      if (enums && typeof operationType === "string") {
        const normalizedKeys = [
          operationType.replace(/^UNITOPERATION_/, ""),
          operationType.replace(/^UNITCOMMAND_/, ""),
          operationType.replace(/^CITYOPERATION_/, ""),
          operationType.replace(/^CITYCOMMAND_/, ""),
          operationType.replace(/^PLAYEROPERATION_/, ""),
        ];
        for (const key of normalizedKeys) {
          if (Object.prototype.hasOwnProperty.call(enums, key)) return enums[key];
        }
      }
      return operationType;
    };
    const successFromCanStart = (result) => {
      if (result === true) return true;
      if (result === false || result == null) return false;
      if (typeof result === "object") {
        if (result.Success !== undefined) return result.Success === true;
        if (result.success !== undefined) return result.success === true;
        if (result.canStart !== undefined) return result.canStart === true;
      }
      return Boolean(result);
    };
    const callCanStart = (router, target, operationType, args) => {
      try {
        return router.canStart(target, operationType, args ?? {}, false);
      } catch (first) {
        try {
          return router.canStart(target, operationType, args ?? {});
        } catch {
          throw first;
        }
      }
    };
    const targetIndexFor = (x, y) => probe(() => {
      if (typeof GameplayMap.getIndexFromLocation === "function") return GameplayMap.getIndexFromLocation({ x, y });
      return GameplayMap.getIndexFromXY(x, y);
    });
    const resultContainsTarget = (result, targetIndex) => {
      if (!targetIndex.ok || !result || typeof result !== "object" || !Array.isArray(result.Plots)) return null;
      return result.Plots.includes(targetIndex.value);
    };
    const summarizeUnit = (unitId) => {
      const unit = Units.get(unitId);
      if (!unit) return null;
      const movement = unit.Movement;
      const combat = unit.Combat;
      const health = unit.Health;
      return {
        id: toComponentId(unit.id ?? unitId),
        owner: unit.owner ?? unitId.owner,
        type: unit.type ?? null,
        location: unit.location ?? null,
        movementMovesRemaining: movement?.movementMovesRemaining ?? null,
        movementTurnsRemaining: movement?.movementTurnsRemaining ?? null,
        attacksRemaining: combat?.attacksRemaining ?? null,
        rangedStrength: combat?.rangedStrength ?? null,
        bombardStrength: combat?.bombardStrength ?? null,
        meleeStrength: typeof combat?.getMeleeStrength === "function" ? combat.getMeleeStrength(false) : null,
        damage: health?.damage ?? null,
        hitPoints: health?.hitPoints ?? null,
      };
    };
    const targetUnitsAt = (x, y) => {
      const units = typeof MapUnits !== "undefined" && typeof MapUnits.getUnits === "function"
        ? MapUnits.getUnits(x, y)
        : [];
      return Array.isArray(units) ? units.map((id) => toComponentId(id) ?? id) : units;
    };
    const probeValue = (probeResult) => probeResult && probeResult.ok === true ? probeResult.value : null;
    const locationFromUnitProbe = (probeResult) => {
      const unit = probeValue(probeResult);
      const location = unit?.location;
      if (!location || typeof location.x !== "number" || typeof location.y !== "number") return null;
      return { x: location.x, y: location.y };
    };
    const sameLocation = (a, b) => !!(a && b && a.x === b.x && a.y === b.y);
    const moveModifiers = () => {
      const attack = typeof UnitOperationMoveModifiers !== "undefined" ? UnitOperationMoveModifiers.ATTACK ?? 0 : 0;
      const ignore = typeof UnitOperationMoveModifiers !== "undefined" ? UnitOperationMoveModifiers.MOVE_IGNORE_UNEXPLORED_DESTINATION ?? 0 : 0;
      return attack + ignore;
    };
    const candidate = (family, operationType, args, target, targetIndex) => {
      const router = family === "unit-command" ? Game.UnitCommands : Game.UnitOperations;
      const enums = family === "unit-command" ? UnitCommandTypes : UnitOperationTypes;
      const enumValue = enumValueFor(enums, operationType);
      let result;
      try {
        result = callCanStart(router, target, enumValue, args);
      } catch (err) {
        return {
          family,
          operationType,
          args,
          valid: false,
          result: { error: String(err) },
          targetInReturnedPlots: null,
          rejectedReason: "canStart threw",
        };
      }
      const valid = successFromCanStart(result);
      const targetInReturnedPlots = resultContainsTarget(result, targetIndex);
      return {
        family,
        operationType,
        args,
        valid,
        result,
        targetInReturnedPlots,
        ...(valid && targetInReturnedPlots === false ? { rejectedReason: "target not present in canStart returned Plots" } : {}),
      };
    };
    const accepted = (entry) => entry.valid === true && entry.targetInReturnedPlots !== false;
    const sendCandidate = (unitId, entry) => {
      const router = entry.family === "unit-command" ? Game.UnitCommands : Game.UnitOperations;
      const enums = entry.family === "unit-command" ? UnitCommandTypes : UnitOperationTypes;
      const enumValue = enumValueFor(enums, entry.operationType);
      return router.sendRequest(unitId, enumValue, entry.args ?? {});
    };
    const readUnitTargetAction = (input, options) => {
      const unitId = input.unitId;
      const targetIndex = targetIndexFor(input.x, input.y);
      const target = { x: input.x, y: input.y, index: targetIndex };
      const baseArgs = { X: input.x, Y: input.y };
      const attackArgs = { ...baseArgs, Modifiers: moveModifiers() };
      const candidates = [
        candidate("unit-operation", "UNITOPERATION_NAVAL_ATTACK", attackArgs, unitId, targetIndex),
        candidate("unit-operation", "UNITOPERATION_AIR_ATTACK", attackArgs, unitId, targetIndex),
        candidate("unit-operation", "UNITOPERATION_RANGE_ATTACK", attackArgs, unitId, targetIndex),
        candidate("unit-command", "UNITCOMMAND_ARMY_OVERRUN", baseArgs, unitId, targetIndex),
        candidate("unit-operation", "UNITOPERATION_SWAP_UNITS", baseArgs, unitId, targetIndex),
        candidate("unit-operation", "MOVE_TO", attackArgs, unitId, targetIndex),
      ];
      const selected = candidates.find(accepted) ?? null;
      const beforeUnit = probe(() => summarizeUnit(unitId));
      const beforeTargetUnits = probe(() => targetUnitsAt(input.x, input.y));
      const out = {
        unitId,
        target,
        beforeUnit,
        beforeTargetUnits,
        candidates,
        selected,
        sent: false,
        notes: [
          "Selection follows the official right-click WorldInput target order: naval, air, ranged, overrun, swap, then MOVE_TO.",
          "Validator success is not enough by itself; compare before/after unit location, movement, attacks, and target units."
        ],
      };
      if (options.send === true && selected) {
        out.sendResult = sendCandidate(unitId, selected);
        out.sent = true;
        out.afterUnit = probe(() => summarizeUnit(unitId));
        out.afterTargetUnits = probe(() => targetUnitsAt(input.x, input.y));
        const unitChanged = JSON.stringify(out.beforeUnit) !== JSON.stringify(out.afterUnit);
        const targetUnitsChanged = JSON.stringify(out.beforeTargetUnits) !== JSON.stringify(out.afterTargetUnits);
        const requestedLocation = { x: input.x, y: input.y };
        const beforeLocation = locationFromUnitProbe(out.beforeUnit);
        const landedLocation = locationFromUnitProbe(out.afterUnit);
        const destinationReached = landedLocation ? sameLocation(landedLocation, requestedLocation) : null;
        const originChanged = beforeLocation && landedLocation ? !sameLocation(beforeLocation, landedLocation) : unitChanged;
        const classification = !unitChanged && !targetUnitsChanged
          ? "no-state-change"
          : selected.operationType === "MOVE_TO" && destinationReached === true
            ? "target-reached"
            : selected.operationType === "MOVE_TO" && originChanged && destinationReached === false
              ? "path-shortfall"
              : targetUnitsChanged
                ? "target-state-changed"
                : "unit-state-changed";
        out.verified = unitChanged || targetUnitsChanged;
        out.verification = {
          status: out.verified ? "verified" : "no-state-change",
          classification,
          unitChanged,
          targetUnitsChanged,
          destinationReached,
          requestedLocation,
          landedLocation,
          reason: out.verified
            ? classification === "target-reached"
              ? "unit reached the requested target tile"
              : classification === "path-shortfall"
                ? "unit moved, but landed short of the requested target tile; re-read before issuing a follow-up move"
                : classification === "target-state-changed"
                  ? "target-plot unit state changed after send"
                  : "unit state changed after send"
            : "send returned but unit and target-plot probes did not change; re-read before repeating",
        };
      } else {
        out.verification = {
          status: "not-sent",
          classification: "not-sent",
          unitChanged: false,
          targetUnitsChanged: false,
          destinationReached: null,
          requestedLocation: { x: input.x, y: input.y },
          landedLocation: locationFromUnitProbe(beforeUnit),
          reason: "read-only target resolution; use --send with an approval reason to mutate",
        };
      }
      return out;
    };`;
}

const ALL_CIV7_PLOT_FIELDS: ReadonlyArray<Civ7PlotSnapshotField> = [
  "terrain",
  "biome",
  "feature",
  "resource",
  "climate",
  "hydrology",
  "yields",
  "owner",
  "visibility",
  "areaRegion",
  "tags",
  "city",
  "units",
];

const STATIC_CIV7_CAPABILITY_ENTRIES: ReadonlyArray<Civ7CapabilityCatalogEntry> = [
  {
    id: "wrapper.restart-begin",
    name: "Restart and Begin",
    role: "app-ui",
    kind: "action-wrapper",
    owner: "@civ7/direct-control",
    risk: "medium",
    provenance: ["restartCiv7GameAndBegin", "live-owner-proof"],
    wrapper: "restartCiv7GameAndBegin",
    confidence: "recorded-live-proof",
    description: "Runs Network.restartGame, follows native Begin Game readiness, and waits for Tuner readiness.",
  },
  {
    id: "wrapper.playable-status",
    name: "Playable Status",
    role: "shared",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["getCiv7AppUiSnapshot", "checkCiv7TunerHealth"],
    wrapper: "getCiv7PlayableStatus",
    confidence: "runtime",
  },
  {
    id: "wrapper.setup-snapshot",
    name: "Setup Snapshot",
    role: "app-ui",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["Configuration", "GameSetup", "Database", "studio-run-in-game"],
    wrapper: "getCiv7SetupSnapshot|getCiv7SetupMapRows",
    confidence: "runtime",
    description: "Reads Civ7 setup phase, setup parameters, and frontend map-script row visibility.",
  },
  {
    id: "wrapper.setup-start",
    name: "Single-player Setup and Start",
    role: "app-ui",
    kind: "action-wrapper",
    owner: "@civ7/direct-control",
    risk: "high",
    provenance: ["Configuration.editMap", "Network.hostGame", "studio-run-in-game"],
    wrapper: "prepareCiv7SinglePlayerSetup|startPreparedCiv7SinglePlayerGame|runCiv7SinglePlayerFromSetup",
    confidence: "source",
    description: "Applies map script, map size, and map seed through App UI setup APIs, then starts a prepared single-player game.",
  },
  {
    id: "wrapper.map-summary",
    name: "Map Summary",
    role: "tuner",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["GameplayMap", "Game"],
    wrapper: "getCiv7MapSummary",
    confidence: "recorded-live-proof",
  },
  {
    id: "wrapper.plot-grid",
    name: "Plot and Grid Snapshots",
    role: "tuner",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["GameplayMap", "Visibility", "MapUnits", "MapCities"],
    wrapper: "getCiv7PlotSnapshot|getCiv7MapGrid|getCiv7FullMapGrid",
    confidence: "recorded-live-proof",
  },
  {
    id: "wrapper.resource-placement-feasibility",
    name: "Resource Placement Feasibility",
    role: "tuner",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["ResourceBuilder.canHaveResource", "ResourceBuilder.getBestMapResourceCuts", "ResourceBuilder.getResourceCounts", "GameInfo.Resources", "GameplayMap"],
    wrapper: "getCiv7ResourcePlacementFeasibility|getCiv7ResourceBuilderDiagnostics",
    confidence: "source",
    description: "Reads bounded per-cell resource feasibility and ResourceBuilder cut/count diagnostics for parity/source-authority diagnostics without mutating the map.",
  },
  {
    id: "wrapper.feature-placement-feasibility",
    name: "Feature Placement Feasibility",
    role: "tuner",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["TerrainBuilder.canHaveFeature", "GameplayMap"],
    wrapper: "getCiv7FeaturePlacementFeasibility",
    confidence: "source",
    description: "Reads bounded per-cell feature feasibility for parity/source-authority diagnostics without mutating the map.",
  },
  {
    id: "wrapper.autoplay",
    name: "Autoplay Control",
    role: "app-ui",
    kind: "action-wrapper",
    owner: "@civ7/direct-control",
    risk: "medium",
    provenance: ["Autoplay"],
    wrapper: "configureCiv7Autoplay|startCiv7Autoplay|stopCiv7Autoplay",
    confidence: "source",
  },
  {
    id: "wrapper.target-candidates",
    name: "Target Candidates",
    role: "app-ui",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["Players", "Cities", "Units", "GameInfo"],
    wrapper: "getCiv7TargetCandidates",
    confidence: "runtime",
    description: "Ranks candidate other-owner contacts from runtime city/unit summaries and a supplied formation origin.",
  },
  {
    id: "wrapper.battlefield-scan",
    name: "Battlefield Scan",
    role: "app-ui",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["Players", "Cities", "Units", "GameInfo"],
    wrapper: "getCiv7BattlefieldScan",
    confidence: "runtime",
    description: "Summarizes nearby units, cities, owner pressure, and tactical points of interest around supplied origins.",
  },
  {
    id: "wrapper.destination-analysis",
    name: "Destination Analysis",
    role: "app-ui",
    kind: "read-wrapper",
    owner: "@civ7/direct-control",
    risk: "read",
    provenance: ["Players", "Cities", "Units", "GameplayMap", "GameInfo"],
    wrapper: "getCiv7DestinationAnalysis",
    confidence: "runtime",
    description: "Summarizes pressure near an intended destination and along a cheap straight-line corridor without issuing movement.",
  },
  {
    id: "wrapper.operations",
    name: "Validator-backed gameplay operations",
    role: "tuner",
    kind: "action-wrapper",
    owner: "@civ7/direct-control",
    risk: "medium",
    provenance: ["Game.UnitOperations", "Game.UnitCommands", "Game.CityOperations", "Game.CityCommands", "Game.PlayerOperations"],
    wrapper: "canStart*/request*",
    confidence: "recorded-live-proof",
  },
];

function jsonPayloadFromCommandResult<T extends object>(result: Civ7CommandResult, label: string): T {
  try {
    const payload = JSON.parse(result.output[0] ?? "{}") as T;
    return {
      host: result.host,
      port: result.port,
      state: result.state,
      ...payload,
    } as T;
  } catch (err) {
    throw new Civ7DirectControlError(
      "command-failed",
      `${label} returned invalid JSON: ${result.output.join("\n") || "<empty>"}`,
      { cause: err, details: result },
    );
  }
}

function normalizePlotFields(fields: ReadonlyArray<Civ7PlotSnapshotField> | undefined): ReadonlyArray<Civ7PlotSnapshotField> {
  const selected: ReadonlyArray<Civ7PlotSnapshotField> = fields?.length
    ? fields
    : ["terrain", "biome", "feature", "resource", "owner", "visibility", "areaRegion"];
  for (const field of selected) {
    if (!ALL_CIV7_PLOT_FIELDS.includes(field)) {
      throw new Civ7DirectControlError("command-failed", `Unsupported Civ7 plot field: ${field}`);
    }
  }
  return Array.from(new Set(selected));
}

function validateMapGridInput(input: Civ7MapGridInput, maxPlots: number): void {
  if (!input.bounds && !input.locations) {
    throw new Civ7DirectControlError("command-failed", "Map grid reads require explicit bounds or locations");
  }
  if (input.bounds && input.locations) {
    throw new Civ7DirectControlError("command-failed", "Map grid reads accept bounds or locations, not both");
  }
  if (input.bounds) validateMapBounds(input.bounds);
  const locations = input.locations ?? [];
  if (locations.length > HARD_CIV7_MAP_GRID_MAX_PLOTS) {
    throw new Civ7DirectControlError(
      "command-failed",
      `Map grid location lists must not exceed ${HARD_CIV7_MAP_GRID_MAX_PLOTS} entries`,
    );
  }
  for (const location of locations.slice(0, maxPlots)) validateMapLocation(location);
}

function validateResourcePlacementFeasibilityInput(
  input: Civ7ResourcePlacementFeasibilityInput,
  maxCells: number,
  maxResourceTypesPerCell: number,
): void {
  if (!Array.isArray(input.cells) || input.cells.length === 0) {
    throw new Civ7DirectControlError(
      "command-failed",
      "Resource placement feasibility reads require at least one cell",
    );
  }
  if (input.cells.length > HARD_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS) {
    throw new Civ7DirectControlError(
      "command-failed",
      `Resource placement feasibility cell lists must not exceed ${HARD_CIV7_RESOURCE_FEASIBILITY_MAX_CELLS} entries`,
    );
  }
  for (const cell of input.cells.slice(0, maxCells)) {
    validateMapLocation(cell);
    if (!Array.isArray(cell.resourceTypes) || cell.resourceTypes.length === 0) {
      throw new Civ7DirectControlError(
        "command-failed",
        "Resource placement feasibility cells require at least one resource type",
      );
    }
    if (cell.resourceTypes.length > HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL) {
      throw new Civ7DirectControlError(
        "command-failed",
        `Resource placement feasibility resource type lists must not exceed ${HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL} entries`,
      );
    }
    for (const resourceType of cell.resourceTypes.slice(0, maxResourceTypesPerCell)) {
      boundedInteger(resourceType, 0, 1_000_000, "resourceType");
    }
  }
}

function validateFeaturePlacementFeasibilityInput(
  input: Civ7FeaturePlacementFeasibilityInput,
  maxCells: number,
  maxFeatureTypesPerCell: number,
): void {
  if (!Array.isArray(input.cells) || input.cells.length === 0) {
    throw new Civ7DirectControlError(
      "command-failed",
      "Feature placement feasibility reads require at least one cell",
    );
  }
  if (input.cells.length > HARD_CIV7_FEATURE_FEASIBILITY_MAX_CELLS) {
    throw new Civ7DirectControlError(
      "command-failed",
      `Feature placement feasibility cell lists must not exceed ${HARD_CIV7_FEATURE_FEASIBILITY_MAX_CELLS} entries`,
    );
  }
  for (const cell of input.cells.slice(0, maxCells)) {
    validateMapLocation(cell);
    if (!Array.isArray(cell.featureTypes) || cell.featureTypes.length === 0) {
      throw new Civ7DirectControlError(
        "command-failed",
        "Feature placement feasibility cells require at least one feature type",
      );
    }
    if (cell.featureTypes.length > HARD_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL) {
      throw new Civ7DirectControlError(
        "command-failed",
        `Feature placement feasibility feature type lists must not exceed ${HARD_CIV7_FEATURE_FEASIBILITY_MAX_TYPES_PER_CELL} entries`,
      );
    }
    for (const featureType of cell.featureTypes.slice(0, maxFeatureTypesPerCell)) {
      if (!Number.isInteger(featureType) || featureType < 0) {
        throw new Civ7DirectControlError(
          "command-failed",
          `Feature placement feasibility feature types must be non-negative integers: ${featureType}`,
        );
      }
    }
  }
}

function uniqueBoundedResourceTypes(resourceTypes: ReadonlyArray<number>): number[] {
  if (resourceTypes.length > HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL) {
    throw new Civ7DirectControlError(
      "command-failed",
      `ResourceBuilder diagnostic resource type lists must not exceed ${HARD_CIV7_RESOURCE_FEASIBILITY_MAX_TYPES_PER_CELL} entries`,
    );
  }
  return [...new Set(resourceTypes.map((resourceType) => boundedInteger(resourceType, 0, 1_000_000, "resourceType")))]
    .sort((left, right) => left - right);
}

export function planCiv7MapGridReadBounds(
  bounds: Civ7MapBounds,
  maxPlotsPerRead = HARD_CIV7_MAP_GRID_MAX_PLOTS,
): Civ7MapBounds[] {
  validateMapBounds(bounds, "bounds");
  const maxPlots = boundedInteger(maxPlotsPerRead, 1, HARD_CIV7_MAP_GRID_MAX_PLOTS, "maxPlotsPerRead");
  const chunks: Civ7MapBounds[] = [];
  const chunkWidth = Math.min(bounds.width, maxPlots);
  const chunkHeight = Math.max(1, Math.floor(maxPlots / chunkWidth));

  for (let y = bounds.y; y < bounds.y + bounds.height; y += chunkHeight) {
    const height = Math.min(chunkHeight, bounds.y + bounds.height - y);
    for (let x = bounds.x; x < bounds.x + bounds.width; x += chunkWidth) {
      const width = Math.min(chunkWidth, bounds.x + bounds.width - x);
      chunks.push({ x, y, width, height });
    }
  }

  return chunks;
}

function validateMapBounds(bounds: Civ7MapBounds, dimensionLabel = "bounds"): void {
  validateMapLocation(bounds);
  boundedInteger(bounds.width, 1, 1_000_000, `${dimensionLabel}.width`);
  boundedInteger(bounds.height, 1, 1_000_000, `${dimensionLabel}.height`);
}

function validateMapLocation(location: Civ7MapLocation): void {
  boundedInteger(location.x, 0, 1_000_000, "x");
  boundedInteger(location.y, 0, 1_000_000, "y");
}

function validatePlayerId(playerId: number): number {
  return boundedInteger(playerId, 0, 1024, "playerId");
}

function boundedInteger(value: number, min: number, max: number, label: string): number {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Civ7DirectControlError("command-failed", `${label} must be an integer between ${min} and ${max}`);
  }
  return value;
}

function requiredProbeNumber(probe: Civ7RuntimeProbe<number>, label: string): number {
  if (!probe.ok || !Number.isFinite(probe.value)) {
    throw new Civ7DirectControlError("command-failed", `${label} did not return a bounded number`);
  }
  return probe.value;
}

function assertFullMapGridSummaryIdentityStable(
  before: Civ7MapSummaryResult,
  after: Civ7MapSummaryResult,
): Civ7FullMapGridIdentityCheck {
  const fields: ReadonlyArray<Readonly<{ label: string; before: Civ7RuntimeProbe<unknown>; after: Civ7RuntimeProbe<unknown> }>> = [
    { label: "map.width", before: before.map.width, after: after.map.width },
    { label: "map.height", before: before.map.height, after: after.map.height },
    { label: "map.plotCount", before: before.map.plotCount, after: after.map.plotCount },
    { label: "map.randomSeed", before: before.map.randomSeed, after: after.map.randomSeed },
    { label: "game.turn", before: before.game.turn, after: after.game.turn },
    { label: "game.hash", before: before.game.hash, after: after.game.hash },
  ];
  const checked: string[] = [];
  for (const field of fields) {
    if (!field.before.ok || !field.after.ok) {
      throw new Civ7DirectControlError("command-failed", `Civ7 full-grid identity could not verify ${field.label}`);
    }
    checked.push(field.label);
    if (field.before.value !== field.after.value) {
      throw new Civ7DirectControlError(
        "command-failed",
        `Civ7 full-grid identity changed during read: ${field.label} ${String(field.before.value)} -> ${String(field.after.value)}`,
      );
    }
  }
  return { stable: true, checked };
}

function probeNumberOr(probe: Civ7RuntimeProbe<unknown>, fallback: number): number {
  if (!probe.ok) return fallback;
  const value = Number(probe.value);
  return Number.isFinite(value) ? value : fallback;
}

function validateIdentifier(value: string, label: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Civ7DirectControlError("command-failed", `${label} must be a simple identifier`);
  }
  return value;
}

function validateMapScript(value: string): string {
  if (!value.trim() || value.length > 512 || /[\0\r\n]/.test(value)) {
    throw new Civ7DirectControlError("setup-parameter-invalid", "mapScript must be a non-empty single-line string");
  }
  return value;
}

async function readCiv7SavedGameConfiguration(path: string): Promise<Civ7SavedGameConfiguration> {
  const [info, bytes] = await Promise.all([stat(path), readFile(path)]);
  if (bytes.subarray(0, 4).toString("ascii") !== "CIV7") {
    throw new Civ7DirectControlError("command-failed", `Saved configuration is not a Civ7 file: ${path}`);
  }
  const fileName = basename(path);
  const displayName = basename(fileName, extname(fileName));
  const strings = extractAsciiStrings(bytes);
  const summary = summarizeCiv7CfgStrings(strings);
  const setupOptions: Record<string, Civ7SetupOptionValue> = {};
  if (summary.difficulty) setupOptions.Difficulty = summary.difficulty;
  if (summary.gameSpeed) setupOptions.GameSpeeds = summary.gameSpeed;

  const playerSetupOptions: Record<string, Civ7SetupOptionValue> = {};
  if (summary.leader) playerSetupOptions.PlayerLeader = summary.leader;
  if (summary.civilization) playerSetupOptions.PlayerCivilization = summary.civilization;
  if (summary.difficulty) playerSetupOptions.PlayerDifficulty = summary.difficulty;

  return {
    id: displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || fileName,
    displayName,
    fileName,
    path,
    sizeBytes: info.size,
    modifiedAt: info.mtime.toISOString(),
    source: "local-disk",
    summary,
    setupOptions,
    playerOptions: Object.keys(playerSetupOptions).length > 0
      ? [{ playerId: 0, options: playerSetupOptions }]
      : [],
  };
}

function extractAsciiStrings(bytes: Buffer): string[] {
  const strings: string[] = [];
  let start = -1;
  for (let index = 0; index <= bytes.length; index += 1) {
    const byte = index < bytes.length ? bytes[index]! : 0;
    const printable = byte >= 32 && byte <= 126;
    if (printable) {
      if (start < 0) start = index;
      continue;
    }
    if (start >= 0 && index - start >= 3) {
      strings.push(bytes.subarray(start, index).toString("ascii"));
    }
    start = -1;
  }
  return strings;
}

function firstToken(strings: ReadonlyArray<string>, test: (value: string) => boolean): string | undefined {
  return strings.find(test);
}

function firstNumericSeed(strings: ReadonlyArray<string>, afterIndex = 0): number | undefined {
  for (const value of strings.slice(afterIndex)) {
    if (!/^\d{6,10}$/.test(value)) continue;
    const parsed = Number(value);
    if (Number.isSafeInteger(parsed) && parsed >= 0) return parsed;
  }
  return undefined;
}

function summarizeCiv7CfgStrings(strings: ReadonlyArray<string>): Civ7SavedGameConfigurationSummary {
  const mapSeedIndex = strings.findIndex((value) => /^\d{6,10}$/.test(value));
  const mapSeed = mapSeedIndex >= 0 ? firstNumericSeed(strings, mapSeedIndex) : undefined;
  const gameSeed = mapSeedIndex >= 0 ? firstNumericSeed(strings, mapSeedIndex + 1) : undefined;
  const civilization = firstToken(strings, (value) =>
    /^CIVILIZATION_[A-Z0-9_]+$/.test(value) &&
    !value.startsWith("CIVILIZATION_LEVEL_") &&
    value !== "CIVILIZATION_INDEPENDENT" &&
    value !== "CIVILIZATION_NONE"
  );
  const leader = firstToken(strings, (value) =>
    /^LEADER_[A-Z0-9_]+$/.test(value) &&
    value !== "LEADER_DEFAULT" &&
    !value.startsWith("LEADER_MINOR_CIV_") &&
    value !== "LEADER_INDEPENDENT"
  );
  const summary: {
    gameSpeed?: string;
    mapSize?: string;
    mapName?: string;
    leader?: string;
    civilization?: string;
    difficulty?: string;
    mapSeed?: number;
    gameSeed?: number;
  } = {};
  const gameSpeed = firstToken(strings, (value) => /^GAMESPEED_[A-Z0-9_]+$/.test(value));
  const mapSize = firstToken(strings, (value) => /^MAPSIZE_[A-Z0-9_]+$/.test(value));
  const mapName = firstToken(strings, (value) => /^LOC_MAP_[A-Z0-9_]+_NAME$/.test(value));
  const difficulty = firstToken(strings, (value) => /^DIFFICULTY_[A-Z0-9_]+$/.test(value));
  if (gameSpeed !== undefined) summary.gameSpeed = gameSpeed;
  if (mapSize !== undefined) summary.mapSize = mapSize;
  if (mapName !== undefined) summary.mapName = mapName;
  if (leader !== undefined) summary.leader = leader;
  if (civilization !== undefined) summary.civilization = civilization;
  if (difficulty !== undefined) summary.difficulty = difficulty;
  if (mapSeed !== undefined) summary.mapSeed = mapSeed;
  if (gameSeed !== undefined) summary.gameSeed = gameSeed;
  return summary;
}

function validateSavedConfigFileName(value: string): string {
  if (
    !value.trim() ||
    value.length > 512 ||
    /[\0\r\n]/.test(value) ||
    value.includes("/") ||
    value.includes("\\") ||
    extname(value).toLowerCase() !== ".civ7cfg"
  ) {
    throw new Civ7DirectControlError("setup-parameter-invalid", "saved configuration fileName must be a Civ7Cfg file name");
  }
  return value;
}

function normalizeSavedGameConfigurationRef(input: Civ7SavedGameConfigurationRef): Civ7SavedGameConfigurationRef {
  const fileName = validateSavedConfigFileName(input.fileName);
  const displayName = input.displayName.trim() || basename(fileName, extname(fileName));
  const path = input.path.trim();
  if (!path || /[\0\r\n]/.test(path)) {
    throw new Civ7DirectControlError("setup-parameter-invalid", "saved configuration path must be a non-empty single-line string");
  }
  return {
    id: input.id.trim() || basename(fileName, extname(fileName)),
    displayName,
    fileName,
    path,
  };
}

function normalizeSinglePlayerSetupInput(input: Civ7SinglePlayerSetupInput): Civ7SinglePlayerSetupInput {
  validateMapScript(input.mapScript);
  if (!/^MAPSIZE_[A-Z0-9_]+$/.test(input.mapSize)) {
    throw new Civ7DirectControlError("setup-parameter-invalid", "mapSize must be a Civ7 MAPSIZE_* value");
  }
  validateSetupSeed(input.seed, "seed");
  if (input.gameSeed !== undefined) validateSetupSeed(input.gameSeed, "gameSeed");
  if (input.playerCount !== undefined) boundedInteger(input.playerCount, 1, 64, "playerCount");
  const options: Record<string, Civ7SetupOptionValue> = {};
  for (const [key, value] of Object.entries(input.options ?? {})) {
    validateIdentifier(key, "setup option id");
    if (!["string", "number", "boolean"].includes(typeof value)) {
      throw new Civ7DirectControlError("setup-parameter-invalid", `Unsupported setup option value for ${key}`);
    }
    options[key] = value;
  }
  const playerOptions: Civ7PlayerSetupOptions[] = [];
  for (const player of input.playerOptions ?? []) {
    const playerId = boundedInteger(player.playerId, 0, 64, "playerOptions.playerId");
    const normalizedOptions: Record<string, Civ7SetupOptionValue> = {};
    for (const [key, value] of Object.entries(player.options ?? {})) {
      validateIdentifier(key, "player setup option id");
      if (!["string", "number", "boolean"].includes(typeof value)) {
        throw new Civ7DirectControlError("setup-parameter-invalid", `Unsupported player setup option value for ${key}`);
      }
      normalizedOptions[key] = value;
    }
    if (Object.keys(normalizedOptions).length > 0) {
      playerOptions.push({ playerId, options: normalizedOptions });
    }
  }
  return {
    ...input,
    mapScript: input.mapScript,
    mapSize: input.mapSize,
    seed: input.seed,
    ...(input.savedConfig ? { savedConfig: normalizeSavedGameConfigurationRef(input.savedConfig) } : {}),
    options,
    playerOptions,
  };
}

function validateSetupSeed(value: unknown, label: string): number {
  const seed = assessCiv7SignedIntSeed(value);
  if (seed.ok === false) {
    const suffix = seed.reason === "not-integer"
      ? "must be an integer"
      : `must be an integer between ${seed.min} and ${seed.max}`;
    throw new Civ7DirectControlError("setup-parameter-invalid", `${label} ${suffix}`);
  }
  return seed.value;
}

function findSetupParameter(snapshot: Civ7SetupSnapshot, id: string): Civ7SetupParameterSnapshot | undefined {
  return snapshot.setup.parameters.find((parameter) => parameter.id === id);
}

function setupParameterValue(snapshot: Civ7SetupSnapshot, id: string): Civ7SetupParameterValue | undefined {
  return findSetupParameter(snapshot, id)?.value;
}

function findPlayerSetupParameter(snapshot: Civ7SetupSnapshot, playerId: number, id: string): Civ7SetupParameterSnapshot | undefined {
  return snapshot.setup.playerParameters
    .find((player) => player.playerId === playerId)
    ?.parameters.find((parameter) => parameter.id === id);
}

function playerSetupParameterValue(
  snapshot: Civ7SetupSnapshot,
  playerId: number,
  id: string,
): Civ7SetupParameterValue | undefined {
  return findPlayerSetupParameter(snapshot, playerId, id)?.value;
}

function findSetupMapRow(snapshot: Civ7SetupSnapshot, file: string): Civ7SetupMapRow | undefined {
  return snapshot.mapRows.find((row) => row.file === file || row.value === file);
}

function assertPreparedSetupMatches(input: Civ7SinglePlayerSetupInput, snapshot: Civ7SetupSnapshot): void {
  const mapRow = findSetupMapRow(snapshot, input.mapScript);
  if (!mapRow) {
    throw new Civ7DirectControlError(
      "setup-map-row-missing",
      `Civ7 setup map row did not read back for ${input.mapScript}`,
      { details: snapshot.mapRows },
    );
  }
  const script = setupParameterValue(snapshot, "Map");
  const mapSize = setupParameterValue(snapshot, "MapSize");
  const mapSeed = setupParameterValue(snapshot, "MapRandomSeed");
  const gameSeed = setupParameterValue(snapshot, "GameRandomSeed");
  if (script !== input.mapScript) {
    throw new Civ7DirectControlError("setup-readback-mismatch", `Civ7 setup Map readback mismatch: ${String(script)}`, {
      details: { expected: input.mapScript, actual: script, snapshot },
    });
  }
  if (mapSize !== input.mapSize) {
    throw new Civ7DirectControlError("setup-readback-mismatch", `Civ7 setup MapSize readback mismatch: ${String(mapSize)}`, {
      details: { expected: input.mapSize, actual: mapSize, snapshot },
    });
  }
  if (Number(mapSeed) !== input.seed) {
    throw new Civ7DirectControlError("setup-readback-mismatch", `Civ7 setup MapRandomSeed readback mismatch: ${String(mapSeed)}`, {
      details: { expected: input.seed, actual: mapSeed, snapshot },
    });
  }
  if (input.gameSeed !== undefined && Number(gameSeed) !== input.gameSeed) {
    throw new Civ7DirectControlError("setup-readback-mismatch", `Civ7 setup GameRandomSeed readback mismatch: ${String(gameSeed)}`, {
      details: { expected: input.gameSeed, actual: gameSeed, snapshot },
    });
  }
  for (const [key, expected] of Object.entries(input.options ?? {})) {
    const actual = setupParameterValue(snapshot, key);
    if (actual !== expected) {
      throw new Civ7DirectControlError("setup-readback-mismatch", `Civ7 setup ${key} readback mismatch: ${String(actual)}`, {
        details: { expected, actual, snapshot },
      });
    }
  }
  for (const player of input.playerOptions ?? []) {
    for (const [key, expected] of Object.entries(player.options)) {
      const actual = playerSetupParameterValue(snapshot, player.playerId, key);
      if (actual !== expected) {
        throw new Civ7DirectControlError(
          "setup-readback-mismatch",
          `Civ7 player ${player.playerId} setup ${key} readback mismatch: ${String(actual)}`,
          { details: { playerId: player.playerId, expected, actual, snapshot } },
        );
      }
    }
  }
}

function assertPostStartMatches(input: Civ7SinglePlayerSetupInput, summary: Civ7MapSummaryResult): void {
  const seed = probeValue(summary.map.randomSeed);
  if (seed !== undefined && seed !== input.seed) {
    throw new Civ7DirectControlError("setup-seed-mismatch", `Civ7 runtime map seed ${seed} did not match ${input.seed}`, {
      details: { input, summary },
    });
  }
}

async function waitForCiv7SetupPhase(
  phase: Civ7SetupPhase,
  options: Civ7DirectControlOptions,
  wait: { waitTimeoutMs: number; pollIntervalMs: number },
): Promise<Civ7SetupSnapshotResult> {
  const startedAt = Date.now();
  let last: Civ7SetupSnapshotResult | undefined;
  while (Date.now() - startedAt <= wait.waitTimeoutMs) {
    try {
      const snapshot = await getCiv7SetupSnapshot(options);
      last = snapshot;
      if (snapshot.snapshot.phase === phase) return snapshot;
    } catch {
      // Keep polling during shell transitions; callers get timeout details below.
    }
    await sleep(wait.pollIntervalMs);
  }
  throw new Civ7DirectControlError(
    "setup-phase-invalid",
    `Timed out waiting for Civ7 setup phase ${phase}`,
    { details: last },
  );
}

async function waitForCiv7SetupRevisionAfter(
  before: Civ7SetupSnapshotResult,
  options: Civ7DirectControlOptions,
  wait: { waitTimeoutMs: number; pollIntervalMs: number },
): Promise<Civ7SetupSnapshotResult> {
  const beforeRevision = probeValue(before.snapshot.setup.revision);
  const startedAt = Date.now();
  let last: Civ7SetupSnapshotResult | undefined;
  let shellPolls = 0;
  const stableShellMs = Math.min(2_000, wait.waitTimeoutMs);
  while (Date.now() - startedAt <= wait.waitTimeoutMs) {
    try {
      const snapshot = await getCiv7SetupSnapshot(options);
      last = snapshot;
      const nextRevision = probeValue(snapshot.snapshot.setup.revision);
      if (snapshot.snapshot.phase === "shell") {
        shellPolls += 1;
        if (
          beforeRevision !== undefined &&
          nextRevision !== undefined &&
          nextRevision !== beforeRevision
        ) {
          return snapshot;
        }
        if (shellPolls >= 2 && Date.now() - startedAt >= stableShellMs) return snapshot;
      }
    } catch {
      // Keep polling while Civ applies the saved configuration.
    }
    await sleep(wait.pollIntervalMs);
  }
  if (last) return last;
  throw new Civ7DirectControlError(
    "setup-apply-timeout",
    "Timed out waiting for Civ7 saved configuration load to update setup state",
    { details: before },
  );
}

async function waitForCiv7SetupMapRows(
  input: Required<Pick<Civ7SetupMapRowsInput, "file" | "limit">>,
  options: Civ7DirectControlOptions,
  wait: { waitTimeoutMs: number; pollIntervalMs: number },
): Promise<Civ7SetupMapRowsResult> {
  const startedAt = Date.now();
  let last = await getCiv7SetupMapRows(input, options);
  if (last.rows.length > 0) return last;
  while (Date.now() - startedAt <= wait.waitTimeoutMs) {
    await sleep(wait.pollIntervalMs);
    last = await getCiv7SetupMapRows(input, options);
    if (last.rows.length > 0) return last;
  }
  return last;
}

function assertApproved(approval: Civ7ActionApproval, action: string): void {
  if (!approval || approval.approved !== true || !approval.reason.trim()) {
    throw new Civ7DirectControlError("command-failed", `Explicit approval with a reason is required before ${action}`);
  }
}

function isTurnCompletionAllowed(
  status: Civ7TurnCompletionStatusResult,
  fallbackPreflight?: Civ7PlayNotificationViewResult,
): boolean {
  if (probeValue(status.canEndTurn) === true) return true;
  const cleanFallbackState = probeValue(status.hasSentTurnComplete) === false
    && probeValue(status.blocker) === 0
    && probeValue(status.firstReadyUnitId) === null;
  if (!cleanFallbackState) return false;
  if (fallbackPreflight === undefined) return false;
  const blockingNotifications = fallbackPreflight.notifications.filter((notification) => notification.isEndTurnBlocking);
  return blockingNotifications.every((notification) => isTurnCompletionFallbackNotification(notification, status));
}

function isTurnCompletionFallbackNotification(
  notification: Civ7PlayNotificationSummary,
  status: Civ7TurnCompletionStatusResult,
): boolean {
  const typeName = String(notification.typeName ?? "").toUpperCase();
  if (notification.decision.category === "unit-command" && typeName.includes("COMMAND_UNITS")) {
    return probeValue(status.blocker) === 0
      && probeValue(status.firstReadyUnitId) === null
      && notificationDetailsProveStaleCommandUnits(notification.details);
  }
  if (notification.decision.category === "informational-notification") {
    return notification.canUserDismiss === true && isTurnCompletionFallbackInformationalType(typeName);
  }
  return false;
}

const DEFAULT_CIV7_NOTIFICATION_DISMISSAL_WAIT_MS = 2_000;
const DEFAULT_CIV7_NOTIFICATION_DISMISSAL_POLL_MS = 250;

async function waitForCiv7NotificationDismissal(
  input: Civ7NotificationDismissInput,
  options: Civ7DirectControlOptions,
  initial: Civ7NotificationDismissalResult,
): Promise<Civ7NotificationDismissalResult> {
  const timeoutMs = Math.min(
    Math.max(options.timeoutMs ?? DEFAULT_CIV7_NOTIFICATION_DISMISSAL_WAIT_MS, 1_000),
    DEFAULT_CIV7_NOTIFICATION_DISMISSAL_WAIT_MS,
  );
  const verificationAttempts = [...(initial.verificationAttempts ?? [])];
  const startedAt = Date.now();
  let after = initial.after ?? initial.before;
  while (Date.now() - startedAt <= timeoutMs) {
    await sleep(DEFAULT_CIV7_NOTIFICATION_DISMISSAL_POLL_MS);
    const current = await getCiv7NotificationDismissal(input, options);
    after = current.before;
    verificationAttempts.push(after);
    if (notificationDismissalVerified(initial.before, after)) {
      return {
        ...initial,
        after,
        verificationAttempts,
        verified: true,
        notes: appendNote(
          initial.notes,
          "Dismissal verification yielded between App UI reads so frame-driven notification/display queues could advance before the final identity check.",
        ),
      };
    }
  }
  return {
    ...initial,
    after,
    verificationAttempts,
    verified: false,
    notes: appendNote(
      initial.notes,
      "Dismissal verification yielded between App UI reads, but the target notification was still present/front/queued by the final identity check.",
    ),
  };
}

function notificationDismissalVerified(
  before: Civ7NotificationDismissalSummary,
  after: Civ7NotificationDismissalSummary | null,
): boolean {
  if (after == null) return false;
  if (after.exists === false) return true;
  if (probeValue(after.isEngineQueueFront) === true) return false;
  if (after.dismissed === true) return true;
  if (probeValue(before.engineQueueContains) === true && probeValue(after.engineQueueContains) === false) return true;
  if (probeValue(before.notificationTrainContains) === true && probeValue(after.notificationTrainContains) === false) return true;
  const wasEngineFront = probeValue(before.isEngineQueueFront) === true;
  if (wasEngineFront && probeValue(after.isEngineQueueFront) === false) return true;
  const wasTrainFront = probeValue(before.isNotificationTrainFront) === true;
  if (wasTrainFront && probeValue(after.isNotificationTrainFront) === false) return true;
  return false;
}

function notificationDetailsProveStaleCommandUnits(details: unknown): boolean {
  if (!isRecord(details)) return false;
  const enabledCloseoutCandidates = details.enabledCloseoutCandidates;
  return details.kind === "unit-command-reconciliation"
    && details.classification === "unit-command-stale-expired"
    && details.staleExpiredWithoutEnabledCloseout === true
    && Array.isArray(enabledCloseoutCandidates)
    && enabledCloseoutCandidates.length === 0;
}

function isTurnCompletionFallbackInformationalType(typeName: string): boolean {
  return typeName === "NOTIFICATION_UNIT_ATTACKED"
    || typeName === "NOTIFICATION_DISTRICT_ATTACKED"
    || typeName === "NOTIFICATION_RIVER_FLOODS_SEV0"
    || typeName === "NOTIFICATION_RIVER_FLOODS_SEV1"
    || typeName === "NOTIFICATION_RIVER_FLOODS_SEV2"
    || typeName === "NOTIFICATION_STORM_ARRIVED"
    || typeName === "NOTIFICATION_STORM_MOVED"
    || typeName === "NOTIFICATION_STORM_DISSIPATED"
    || typeName === "NOTIFICATION_VOLCANO_ACTIVE"
    || typeName === "NOTIFICATION_VOLCANO_INACTIVE"
    || typeName === "NOTIFICATION_VOLCANO_ERUPTS_SEV0"
    || typeName === "NOTIFICATION_VOLCANO_ERUPTS_SEV1"
    || typeName === "NOTIFICATION_VOLCANO_ERUPTS_SEV2"
    || typeName === "NOTIFICATION_WONDER_COMPLETED"
    || typeName === "NOTIFICATION_WONDER_FAILED"
    || typeName === "NOTIFICATION_LEGACY_COMPLETED";
}

function autoplayConfigMatches(status: Civ7AutoplayStatusResult, options: Civ7AutoplayOptions): boolean {
  if (options.turns !== undefined && status.autoplay.turns !== options.turns) return false;
  if (options.observeAsPlayer !== undefined && status.autoplay.observeAsPlayer !== options.observeAsPlayer) return false;
  if (options.returnAsPlayer !== undefined && status.autoplay.returnAsPlayer !== options.returnAsPlayer) return false;
  if (options.pause !== undefined && status.autoplay.isPaused !== options.pause) return false;
  return true;
}

function materializeAutoplayPlayerOptions(
  options: Civ7AutoplayOptions,
  before: Civ7AutoplayStatusResult,
): Civ7AutoplayOptions {
  const returnAsPlayer = options.returnAsPlayer ?? inferAutoplayReturnPlayer(before);
  const observeAsPlayer = options.observeAsPlayer ?? inferAutoplayObservePlayer(before, returnAsPlayer);
  return {
    ...options,
    ...(returnAsPlayer === undefined ? {} : { returnAsPlayer }),
    ...(observeAsPlayer === undefined ? {} : { observeAsPlayer }),
  };
}

function inferAutoplayReturnPlayer(status: Civ7AutoplayStatusResult): number | undefined {
  if (isConcretePlayerId(status.gameContext.localPlayerID)) return status.gameContext.localPlayerID;
  if (isConcretePlayerId(status.autoplay.returnAsPlayer)) return status.autoplay.returnAsPlayer;
  return undefined;
}

function inferAutoplayObservePlayer(status: Civ7AutoplayStatusResult, returnAsPlayer: number | undefined): number | undefined {
  if (isConcretePlayerId(status.gameContext.localObserverID)) return status.gameContext.localObserverID;
  return returnAsPlayer;
}

function isConcretePlayerId(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value < 1_000;
}

function autoplayRestoreSetterSource(options: Civ7AutoplayOptions): string {
  const statements: string[] = [];
  if (options.returnAsPlayer !== undefined) statements.push(`Autoplay.setReturnAsPlayer(${jsLiteral(options.returnAsPlayer)});`);
  if (options.observeAsPlayer !== undefined) statements.push(`Autoplay.setObserveAsPlayer(${jsLiteral(options.observeAsPlayer)});`);
  return statements.join("\n    ");
}

function isAutoplayStopStatus(status: Civ7AutoplayStatusResult, returnAsPlayer: number | undefined): boolean {
  if (status.autoplay.isActive !== false) return false;
  if (returnAsPlayer !== undefined && status.gameContext.localPlayerID !== returnAsPlayer) return false;
  return true;
}

async function waitForCiv7AutoplayStatus(
  options: Civ7AutoplayPollOptions,
  predicate: (status: Civ7AutoplayStatusResult) => boolean,
): Promise<Civ7AutoplayStatusResult> {
  const waitTimeoutMs = options.waitTimeoutMs ?? DEFAULT_CIV7_AUTOPLAY_WAIT_MS;
  const pollIntervalMs = options.pollIntervalMs ?? DEFAULT_CIV7_AUTOPLAY_POLL_INTERVAL_MS;
  const startedAt = Date.now();
  let lastStatus: Civ7AutoplayStatusResult | undefined;

  while (Date.now() - startedAt <= waitTimeoutMs) {
    const status = await getCiv7AutoplayStatus(options);
    lastStatus = status;
    if (predicate(status)) return status;
    await sleep(pollIntervalMs);
  }

  if (lastStatus) return lastStatus;
  return await getCiv7AutoplayStatus(options);
}

async function waitForCiv7AutoplayStop(
  options: Civ7AutoplayPollOptions,
  returnAsPlayer: number | undefined,
): Promise<{ status: Civ7AutoplayStatusResult; verified: boolean }> {
  const waitTimeoutMs = options.waitTimeoutMs ?? DEFAULT_CIV7_AUTOPLAY_STOP_WAIT_MS;
  const pollIntervalMs = options.pollIntervalMs ?? DEFAULT_CIV7_AUTOPLAY_POLL_INTERVAL_MS;
  const stabilityWindowMs = options.stabilityWindowMs ?? DEFAULT_CIV7_AUTOPLAY_STOP_STABILITY_MS;
  const startedAt = Date.now();
  let lastStatus: Civ7AutoplayStatusResult | undefined;

  while (Date.now() - startedAt <= waitTimeoutMs) {
    const status = await getCiv7AutoplayStatus(options);
    lastStatus = status;
    if (isAutoplayStopStatus(status, returnAsPlayer)) {
      await sleep(stabilityWindowMs);
      const stableStatus = await getCiv7AutoplayStatus(options);
      lastStatus = stableStatus;
      if (isAutoplayStopStatus(stableStatus, returnAsPlayer) && stableStatus.game.turn === status.game.turn) {
        return { status: stableStatus, verified: true };
      }
    }
    await sleep(pollIntervalMs);
  }

  const status = lastStatus ?? await getCiv7AutoplayStatus(options);
  return { status, verified: false };
}

async function validateCiv7Operation(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  options: Civ7DirectControlOptions,
): Promise<Civ7OperationValidationResult> {
  validateOperationInput(family, input);
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildOperationValidationCommand(family, input),
  });
  return jsonPayloadFromCommandResult<Civ7OperationValidationResult>(result, "Civ7 operation validation");
}

async function requestCiv7Operation(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  options: Civ7DirectControlOptions,
  approval: Civ7ActionApproval,
): Promise<Civ7OperationRequestResult> {
  assertApproved(approval, `requesting ${family}`);
  validateOperationInput(family, input);
  const before = await validateCiv7Operation(family, input, options);
  if (!before.valid) {
    return {
      before,
      after: before,
      sent: false,
      verified: false,
      postcondition: unitOperationPostcondition(family, input, false, before, before, undefined, undefined),
    };
  }
  const command = await executeCiv7TunerCommand({
    ...options,
    command: buildOperationRequestCommand(family, input),
  });
  const sentPayload = jsonPayloadFromCommandResult<{
    sent: boolean;
    beforePostcondition?: Civ7UnitOperationPostconditionSnapshot;
    afterPostcondition?: Civ7UnitOperationPostconditionSnapshot;
    beforePopulationPostcondition?: Civ7PopulationPlacementPostconditionSnapshot;
    afterPopulationPostcondition?: Civ7PopulationPlacementPostconditionSnapshot;
    beforeProductionPostcondition?: Civ7ProductionPostconditionSnapshot;
    afterProductionPostcondition?: Civ7ProductionPostconditionSnapshot;
  }>(command, "Civ7 operation request");
  const after = await validateCiv7Operation(family, input, options);
  const sent = sentPayload.sent === true;
  const postcondition = unitOperationPostcondition(
    family,
    input,
    sent,
    before,
    after,
    sentPayload.beforePostcondition,
    sentPayload.afterPostcondition,
  );
  const populationPostcondition = populationPlacementPostcondition(
    family,
    input,
    sent,
    before,
    after,
    sentPayload.beforePopulationPostcondition,
    sentPayload.afterPopulationPostcondition,
  );
  const productionPostcondition = productionPostconditionFor(
    family,
    input,
    sent,
    before,
    after,
    sentPayload.beforeProductionPostcondition,
    sentPayload.afterProductionPostcondition,
  );
  const operationVerified =
    postcondition
      ? postcondition.classification !== "not-sent" && postcondition.classification !== "no-state-change"
      : populationPostcondition
        ? populationPostcondition.classification !== "not-sent" && populationPostcondition.classification !== "no-state-change"
        : productionPostcondition
          ? productionPostcondition.classification !== "not-sent"
            && productionPostcondition.classification !== "no-state-change"
            && productionPostcondition.classification !== "production-state-changed-blocker-still-live"
          : command.output.length > 0 && sent;
  return {
    before,
    command,
    after,
    sent,
    verified: operationVerified,
    postcondition,
    populationPostcondition,
    productionPostcondition,
  };
}

function unitOperationPostcondition(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  sent: boolean,
  before: Civ7OperationValidationResult,
  after: Civ7OperationValidationResult,
  beforeSnapshot: Civ7UnitOperationPostconditionSnapshot | undefined,
  afterSnapshot: Civ7UnitOperationPostconditionSnapshot | undefined,
): Civ7UnitOperationPostcondition | undefined {
  if (family !== "unit-operation" && family !== "unit-command") return undefined;
  const classification = classifyUnitOperationPostcondition(sent, before, after, beforeSnapshot, afterSnapshot);
  return {
    family,
    operationType: input.operationType,
    classification,
    before: beforeSnapshot,
    after: afterSnapshot,
    reason: unitOperationPostconditionReason(classification),
  };
}

function classifyUnitOperationPostcondition(
  sent: boolean,
  before: Civ7OperationValidationResult,
  after: Civ7OperationValidationResult,
  beforeSnapshot: Civ7UnitOperationPostconditionSnapshot | undefined,
  afterSnapshot: Civ7UnitOperationPostconditionSnapshot | undefined,
): Civ7UnitOperationPostconditionClassification {
  if (!sent) return "not-sent";
  if (probeValueChanged(beforeSnapshot?.firstReadyUnitId, afterSnapshot?.firstReadyUnitId)) return "queue-advanced";
  if (probeValueChanged(beforeSnapshot?.selectedUnitId, afterSnapshot?.selectedUnitId)) return "selected-unit-changed";
  if (probeFieldChanged(beforeSnapshot?.unit, afterSnapshot?.unit, "activity")) return "activity-changed";
  if (probeValueChanged(beforeSnapshot?.unit, afterSnapshot?.unit)) return "unit-state-changed";
  if (probeValueChanged(beforeSnapshot?.blocker, afterSnapshot?.blocker)) return "blocker-changed";
  if (before.valid !== after.valid || stableJson(before.result) !== stableJson(after.result)) return "validation-changed";
  return "no-state-change";
}

function unitOperationPostconditionReason(classification: Civ7UnitOperationPostconditionClassification): string {
  switch (classification) {
    case "not-sent":
      return "The operation was not sent, so no unit-side postcondition can be verified.";
    case "queue-advanced":
      return "The first ready unit changed after the request, which shows the unit queue advanced.";
    case "selected-unit-changed":
      return "The selected unit changed after the request, which shows the game consumed the unit action.";
    case "activity-changed":
      return "The unit activity changed after the request.";
    case "unit-state-changed":
      return "The unit summary changed after the request.";
    case "blocker-changed":
      return "The end-turn blocker changed after the request.";
    case "validation-changed":
      return "The operation validation result changed after the request.";
    case "no-state-change":
      return "The request was sent, but no observed unit, queue, blocker, or validation state changed.";
  }
}

function populationPlacementPostcondition(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  sent: boolean,
  before: Civ7OperationValidationResult,
  after: Civ7OperationValidationResult,
  beforeSnapshot: Civ7PopulationPlacementPostconditionSnapshot | undefined,
  afterSnapshot: Civ7PopulationPlacementPostconditionSnapshot | undefined,
): Civ7PopulationPlacementPostcondition | undefined {
  if (!populationPlacementPostconditionEligible(family, input)) return undefined;
  const readyCleared = probeReadyCleared(beforeSnapshot?.isReadyToPlacePopulation, afterSnapshot?.isReadyToPlacePopulation);
  const placementStateChanged =
    probeValueChanged(beforeSnapshot?.city, afterSnapshot?.city)
    || probeValueChanged(beforeSnapshot?.isReadyToPlacePopulation, afterSnapshot?.isReadyToPlacePopulation)
    || probeValueChanged(beforeSnapshot?.cityWorkerCap, afterSnapshot?.cityWorkerCap)
    || probeValueChanged(beforeSnapshot?.workablePlotIndexes, afterSnapshot?.workablePlotIndexes)
    || probeValueChanged(beforeSnapshot?.blockedPlotIndexes, afterSnapshot?.blockedPlotIndexes)
    || probeValueChanged(beforeSnapshot?.expansionPlotIndexes, afterSnapshot?.expansionPlotIndexes);
  const classification = classifyPopulationPlacementPostcondition(sent, before, after, readyCleared, placementStateChanged);
  return {
    family: family as "player-operation" | "city-command",
    operationType: input.operationType,
    classification,
    before: beforeSnapshot,
    after: afterSnapshot,
    readyCleared,
    placementStateChanged,
    reason: populationPlacementPostconditionReason(classification),
  };
}

function populationPlacementPostconditionEligible(family: Civ7OperationFamily, input: Civ7OperationInput): boolean {
  return (family === "player-operation" && input.operationType === "ASSIGN_WORKER")
    || (family === "city-command" && input.operationType === "EXPAND");
}

function probeReadyCleared(before: Civ7RuntimeProbe<unknown> | undefined, after: Civ7RuntimeProbe<unknown> | undefined): boolean {
  return before?.ok === true && before.value === true && after?.ok === true && after.value === false;
}

function classifyPopulationPlacementPostcondition(
  sent: boolean,
  before: Civ7OperationValidationResult,
  after: Civ7OperationValidationResult,
  readyCleared: boolean,
  placementStateChanged: boolean,
): Civ7PopulationPlacementPostconditionClassification {
  if (!sent) return "not-sent";
  if (readyCleared) return "population-ready-cleared";
  if (placementStateChanged) return "placement-state-changed";
  if (before.valid !== after.valid || stableJson(before.result) !== stableJson(after.result)) return "validation-changed";
  return "no-state-change";
}

function populationPlacementPostconditionReason(classification: Civ7PopulationPlacementPostconditionClassification): string {
  switch (classification) {
    case "not-sent":
      return "The operation was not sent, so no population-placement postcondition can be verified.";
    case "population-ready-cleared":
      return "Growth.isReadyToPlacePopulation cleared after the placement request.";
    case "placement-state-changed":
      return "The city population placement snapshot changed after the request, but readiness did not clearly clear.";
    case "validation-changed":
      return "The operation validation result changed after the placement request.";
    case "no-state-change":
      return "The request was sent, but no observed population-placement, city, or validation state changed.";
  }
}

function productionPostconditionFor(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  sent: boolean,
  before: Civ7OperationValidationResult,
  after: Civ7OperationValidationResult,
  beforeSnapshot: Civ7ProductionPostconditionSnapshot | undefined,
  afterSnapshot: Civ7ProductionPostconditionSnapshot | undefined,
): Civ7ProductionPostcondition | undefined {
  if (family !== "city-operation" || input.operationType !== "BUILD") return undefined;
  const productionStateChanged = productionSnapshotChanged(beforeSnapshot, afterSnapshot);
  const blockerStillLive = productionBlockerStillLive(afterSnapshot);
  const classification = classifyProductionPostcondition(sent, before, after, productionStateChanged, blockerStillLive);
  return {
    family: "city-operation",
    operationType: "BUILD",
    classification,
    before: beforeSnapshot,
    after: afterSnapshot,
    productionStateChanged,
    blockerStillLive,
    reason: productionPostconditionReason(classification),
  };
}

function productionSnapshotChanged(
  before: Civ7ProductionPostconditionSnapshot | undefined,
  after: Civ7ProductionPostconditionSnapshot | undefined,
): boolean {
  if (!before || !after) return false;
  return probeValueChanged(before.city, after.city)
    || probeValueChanged(before.buildQueue, after.buildQueue)
    || probeValueChanged(before.selectedCityId, after.selectedCityId);
}

function productionBlockerStillLive(snapshot: Civ7ProductionPostconditionSnapshot | undefined): boolean {
  const value = snapshot ? probeValue(snapshot.blockingProductionNotification) : undefined;
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.matchesCity !== false;
}

function classifyProductionPostcondition(
  sent: boolean,
  before: Civ7OperationValidationResult,
  after: Civ7OperationValidationResult,
  productionStateChanged: boolean,
  blockerStillLive: boolean,
): Civ7ProductionPostconditionClassification {
  if (!sent) return "not-sent";
  if (productionStateChanged && blockerStillLive) return "production-state-changed-blocker-still-live";
  if (!blockerStillLive) return "production-choice-cleared";
  if (productionStateChanged) return "production-state-changed";
  if (before.valid !== after.valid || stableJson(before.result) !== stableJson(after.result)) return "validation-changed";
  return "no-state-change";
}

function productionPostconditionReason(classification: Civ7ProductionPostconditionClassification): string {
  switch (classification) {
    case "not-sent":
      return "The production request was not sent, so no production postcondition can be verified.";
    case "production-choice-cleared":
      return "The sent BUILD request no longer has a matching end-turn-blocking production-choice notification for the city.";
    case "production-state-changed":
      return "The sent BUILD request changed observed city production state.";
    case "production-state-changed-blocker-still-live":
      return "The sent BUILD request changed observed production state, but the matching production-choice notification still blocks turn flow; use notification/chooser closeout diagnostics rather than repeating BUILD blindly.";
    case "validation-changed":
      return "The sent BUILD request changed the subsequent BUILD validation result.";
    case "no-state-change":
      return "The sent BUILD request returned, but observed city production state and the production-choice blocker did not change.";
  }
}

function validateProductionChoiceArgs(args: Readonly<Record<string, number>>): void {
  const itemKeys = ["UnitType", "ConstructibleType", "ProjectType"] as const;
  const selected = itemKeys.filter((key) => Number.isInteger(args[key]));
  if (selected.length !== 1) {
    throw new Civ7DirectControlError(
      "command-failed",
      "production choice requires exactly one UnitType, ConstructibleType, or ProjectType",
      { details: { args } },
    );
  }
  if ((args.X !== undefined || args.Y !== undefined) && (!Number.isInteger(args.X) || !Number.isInteger(args.Y))) {
    throw new Civ7DirectControlError(
      "command-failed",
      "production placement coordinates require integer X and Y",
      { details: { args } },
    );
  }
  if ((args.X !== undefined || args.Y !== undefined) && selected[0] !== "ConstructibleType") {
    throw new Civ7DirectControlError(
      "command-failed",
      "production placement coordinates are only valid for ConstructibleType choices",
      { details: { args } },
    );
  }
}

async function waitForCiv7NarrativeChoiceAfter(
  input: Civ7NarrativeChoiceInput,
  options: Civ7DirectControlOptions,
  before: Civ7PlayNotificationViewResult,
  beforeValidation: Civ7OperationValidationResult,
): Promise<Civ7PlayNotificationViewResult> {
  const waitTimeoutMs = Math.min(Math.max(options.timeoutMs ?? 3_000, 1_000), 6_000);
  const pollIntervalMs = 250;
  const startedAt = Date.now();
  let last = await getCiv7PlayNotificationView(options);
  while (Date.now() - startedAt <= waitTimeoutMs) {
    const candidate = narrativeChoicePostcondition(input, true, before, last, beforeValidation, beforeValidation, undefined);
    if (candidate.classification !== "no-state-change") return last;
    await sleep(pollIntervalMs);
    last = await getCiv7PlayNotificationView(options);
  }
  return last;
}

async function readCiv7ProductionChoicePayload(
  input: Civ7ProductionChoiceInput,
  options: Civ7DirectControlOptions,
): Promise<Civ7ProductionChoiceCommandPayload> {
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: buildProductionChoiceRequestCommand(input, { send: false }),
  });
  return jsonPayloadFromCommandResult<Civ7ProductionChoiceCommandPayload>(result, "Civ7 production choice status");
}

async function waitForCiv7ProductionChoiceAfter(
  input: Civ7ProductionChoiceInput,
  options: Civ7DirectControlOptions,
  before: Civ7OperationValidationResult,
  beforeSnapshot: Civ7ProductionPostconditionSnapshot,
): Promise<{ validation: Civ7OperationValidationResult; snapshot: Civ7ProductionPostconditionSnapshot }> {
  const operationInput = {
    cityId: input.cityId,
    operationType: "BUILD",
    args: input.args,
  };
  const waitTimeoutMs = Math.min(Math.max(options.timeoutMs ?? 3_000, 1_000), 6_000);
  const pollIntervalMs = 250;
  const startedAt = Date.now();
  let lastValidation = await canStartCiv7CityOperation(operationInput, options);
  let lastSnapshot = (await readCiv7ProductionChoicePayload(input, options)).afterProductionPostcondition;
  while (Date.now() - startedAt <= waitTimeoutMs) {
    const postcondition = productionPostconditionFor(
      "city-operation",
      operationInput,
      true,
      before,
      lastValidation,
      beforeSnapshot,
      lastSnapshot,
    );
    if (postcondition && postcondition.classification !== "no-state-change") {
      return { validation: lastValidation, snapshot: lastSnapshot };
    }
    await sleep(pollIntervalMs);
    const payload = await readCiv7ProductionChoicePayload(input, options);
    lastValidation = await canStartCiv7CityOperation(operationInput, options);
    lastSnapshot = payload.afterProductionPostcondition;
  }
  return { validation: lastValidation, snapshot: lastSnapshot };
}

function narrativeChoicePostcondition(
  input: Civ7NarrativeChoiceInput,
  sent: boolean,
  before: Civ7PlayNotificationViewResult,
  after: Civ7PlayNotificationViewResult,
  beforeValidation: Civ7OperationValidationResult,
  afterValidation: Civ7OperationValidationResult,
  payload: Civ7NarrativeChoiceCommandPayload | undefined,
): Civ7NarrativeChoicePostcondition {
  const classification = classifyNarrativeChoicePostcondition(input, sent, before, after, beforeValidation, afterValidation, payload);
  return {
    classification,
    reason: narrativeChoicePostconditionReason(classification),
  };
}

function classifyNarrativeChoicePostcondition(
  input: Civ7NarrativeChoiceInput,
  sent: boolean,
  before: Civ7PlayNotificationViewResult,
  after: Civ7PlayNotificationViewResult,
  beforeValidation: Civ7OperationValidationResult,
  afterValidation: Civ7OperationValidationResult,
  payload: Civ7NarrativeChoiceCommandPayload | undefined,
): Civ7NarrativeChoicePostconditionClassification {
  if (!sent) return "not-sent";
  if (probeValue(after.canEndTurn) === true) return "turn-unblocked";
  const beforeMatch = findNarrativeChoiceNotification(before);
  const afterMatch = findNarrativeChoiceNotification(after);
  if (sameNarrativeChoiceNotification(beforeMatch, afterMatch)) return "no-state-change";
  if (beforeMatch && !afterMatch) return "narrative-blocker-cleared";
  if (payload && narrativePanelCleared(payload)) return "narrative-panel-cleared";
  if (beforeValidation.valid !== afterValidation.valid || stableJson(beforeValidation.result) !== stableJson(afterValidation.result)) {
    return "validation-changed";
  }
  return "no-state-change";
}

function narrativeChoicePostconditionReason(classification: Civ7NarrativeChoicePostconditionClassification): string {
  switch (classification) {
    case "not-sent":
      return "The narrative choice did not validate, so no operation was sent.";
    case "turn-unblocked":
      return "The narrative choice and UI handling left the turn unblocked.";
    case "narrative-blocker-cleared":
      return "The narrative/discovery choice notification is no longer present as a blocking decision.";
    case "narrative-panel-cleared":
      return "The visible narrative panel for the selected story target was closed after the choice.";
    case "validation-changed":
      return "The narrative choice validator changed after the send, but notification/turn state did not clearly clear.";
    case "no-state-change":
      return "The narrative choice was sent, but the same narrative blocker remained live without a turn-unblock or blocker transition.";
  }
}

function findNarrativeChoiceNotification(view: Civ7PlayNotificationViewResult): Civ7PlayNotificationSummary | undefined {
  return view.notifications.find((notification) => {
    const typeName = String(notification.typeName ?? "").toUpperCase();
    return notification.isEndTurnBlocking === true
      && typeName.includes("CHOOSE")
      && (typeName.includes("NARRATIVE_STORY_DIRECTION")
        || typeName.includes("DISCOVERY_STORY_DIRECTION")
        || typeName.includes("AUTO_NARRATIVE_STORY_DIRECTION"));
  });
}

function narrativePanelCleared(payload: Civ7NarrativeChoiceCommandPayload): boolean {
  const beforeCount = numericField(payload.ui.before, "matchingPanelCount");
  const afterCount = numericField(payload.ui.after, "matchingPanelCount");
  return beforeCount !== undefined && beforeCount > 0 && afterCount === 0;
}

function sameNarrativeChoiceNotification(
  before: Civ7PlayNotificationSummary | undefined,
  after: Civ7PlayNotificationSummary | undefined,
): boolean {
  if (!before || !after) return false;
  return sameComponentId(before.id, after.id);
}

function numericField(value: unknown, field: string): number | undefined {
  if (!isRecord(value)) return undefined;
  const candidate = value[field];
  return typeof candidate === "number" ? candidate : undefined;
}

async function waitForCiv7DiplomacyResponseAfter(
  input: Civ7DiplomacyResponseInput,
  options: Civ7DirectControlOptions,
  before: Civ7PlayNotificationViewResult,
  beforeValidation: Civ7OperationValidationResult,
): Promise<Civ7PlayNotificationViewResult> {
  const waitTimeoutMs = Math.min(Math.max(options.timeoutMs ?? 3_000, 1_000), 6_000);
  const pollIntervalMs = 250;
  const startedAt = Date.now();
  let last = await getCiv7PlayNotificationView(options);
  while (Date.now() - startedAt <= waitTimeoutMs) {
    const candidate = diplomacyResponsePostcondition(input, true, before, last, beforeValidation, beforeValidation);
    if (candidate.classification !== "no-state-change") return last;
    await sleep(pollIntervalMs);
    last = await getCiv7PlayNotificationView(options);
  }
  return last;
}

function diplomacyResponsePostcondition(
  input: Civ7DiplomacyResponseInput,
  sent: boolean,
  before: Civ7PlayNotificationViewResult,
  after: Civ7PlayNotificationViewResult,
  beforeValidation: Civ7OperationValidationResult,
  afterValidation: Civ7OperationValidationResult,
): Civ7DiplomacyResponsePostcondition {
  const classification = classifyDiplomacyResponsePostcondition(input, sent, before, after, beforeValidation, afterValidation);
  return {
    classification,
    reason: diplomacyResponsePostconditionReason(classification),
  };
}

function classifyDiplomacyResponsePostcondition(
  input: Civ7DiplomacyResponseInput,
  sent: boolean,
  before: Civ7PlayNotificationViewResult,
  after: Civ7PlayNotificationViewResult,
  beforeValidation: Civ7OperationValidationResult,
  afterValidation: Civ7OperationValidationResult,
): Civ7DiplomacyResponsePostconditionClassification {
  if (!sent) return "not-sent";
  if (probeValue(after.canEndTurn) === true) return "turn-unblocked";
  const beforeMatch = findDiplomacyResponseNotification(before, input);
  const afterMatch = findDiplomacyResponseNotification(after, input);
  if (beforeMatch && !afterMatch) return "diplomacy-blocker-cleared";
  const beforeBlocking = probeValue(before.blockingNotificationId);
  const afterBlocking = probeValue(after.blockingNotificationId);
  if (!sameComponentId(beforeBlocking, afterBlocking)) return "blocking-notification-changed";
  if (beforeValidation.valid !== afterValidation.valid || stableJson(beforeValidation.result) !== stableJson(afterValidation.result)) {
    return "validation-changed";
  }
  return "no-state-change";
}

function diplomacyResponsePostconditionReason(classification: Civ7DiplomacyResponsePostconditionClassification): string {
  switch (classification) {
    case "not-sent":
      return "The diplomacy response did not validate, so no operation was sent.";
    case "turn-unblocked":
      return "The response and UI closeout left the turn unblocked.";
    case "diplomacy-blocker-cleared":
      return "The matching diplomatic-response notification is no longer present as a blocking decision.";
    case "blocking-notification-changed":
      return "The end-turn blocking notification changed after the response closeout.";
    case "validation-changed":
      return "The response validator changed after the send, but the notification/turn state did not clearly clear.";
    case "no-state-change":
      return "The response was sent, but notification, turn-blocking, and validator state did not change; use stale-blocker diagnostics instead of repeating blindly.";
  }
}

function findDiplomacyResponseNotification(
  view: Civ7PlayNotificationViewResult,
  input: Civ7DiplomacyResponseInput,
): Civ7PlayNotificationSummary | undefined {
  return view.notifications.find((notification) => {
    const typeName = String(notification.typeName ?? "").toUpperCase();
    if (typeName !== "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED") return false;
    return notificationActionId(notification) === input.actionId;
  });
}

function notificationActionId(notification: Civ7PlayNotificationSummary): number | undefined {
  if (!isRecord(notification.target)) return undefined;
  return typeof notification.target.id === "number" ? notification.target.id : undefined;
}

function probeValueChanged(left: Civ7RuntimeProbe<unknown> | undefined, right: Civ7RuntimeProbe<unknown> | undefined): boolean {
  if (!left || !right) return false;
  if (left.ok !== right.ok) return true;
  if (!left.ok || !right.ok) return stableJson(left) !== stableJson(right);
  return stableJson(left.value) !== stableJson(right.value);
}

function probeFieldChanged(left: Civ7RuntimeProbe<unknown> | undefined, right: Civ7RuntimeProbe<unknown> | undefined, field: string): boolean {
  if (!left?.ok || !right?.ok) return false;
  if (!isRecord(left.value) || !isRecord(right.value)) return false;
  return stableJson(left.value[field]) !== stableJson(right.value[field]);
}

function locationFromUnitProbeValue(probe: Civ7RuntimeProbe<unknown> | undefined): Civ7MapLocation | null {
  if (!probe?.ok || !isRecord(probe.value)) return null;
  const location = probe.value.location;
  if (!isRecord(location)) return null;
  const x = location.x;
  const y = location.y;
  return typeof x === "number" && typeof y === "number" ? { x, y } : null;
}

function sameMapLocation(left: Civ7MapLocation, right: Civ7MapLocation): boolean {
  return left.x === right.x && left.y === right.y;
}

function sameComponentId(left: Civ7ComponentId | null | undefined, right: Civ7ComponentId | null | undefined): boolean {
  if (left == null || right == null) return left == null && right == null;
  return left.owner === right.owner && left.id === right.id && left.type === right.type;
}

function stableJson(value: unknown): string {
  return JSON.stringify(value, Object.keys(flattenKeys(value)).sort()) ?? String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function flattenKeys(value: unknown, keys: Record<string, true> = {}): Record<string, true> {
  if (Array.isArray(value)) {
    for (const item of value) flattenKeys(item, keys);
  } else if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      keys[key] = true;
      flattenKeys(child, keys);
    }
  }
  return keys;
}

function validateOperationInput(family: Civ7OperationFamily, input: Civ7OperationInput): void {
  validateIdentifier(input.operationType, "operationType");
  if ((family === "unit-operation" || family === "unit-command") && !("unitId" in input)) {
    throw new Civ7DirectControlError("command-failed", `${family} requires unitId`);
  }
  if ((family === "city-operation" || family === "city-command") && !("cityId" in input)) {
    throw new Civ7DirectControlError("command-failed", `${family} requires cityId`);
  }
  if (family === "player-operation" && !("playerId" in input)) {
    throw new Civ7DirectControlError("command-failed", "player-operation requires playerId");
  }
}

function capabilityEntriesFromInspection(
  inspection: Civ7RootInspectionResult,
  role: "app-ui" | "tuner",
): Civ7CapabilityCatalogEntry[] {
  const entries: Civ7CapabilityCatalogEntry[] = [];
  for (const root of inspection.roots) {
    entries.push({
      id: `${role}.root.${root.name}`,
      name: root.name,
      role,
      kind: "root",
      owner: "runtime",
      risk: "read",
      provenance: [`${inspection.state.name}:${root.name}`],
      state: inspection.state.name,
      root: root.name,
      confidence: "runtime",
    });
    for (const method of root.methods) {
      entries.push({
        id: `${role}.method.${root.name}.${method.name}`,
        name: `${root.name}.${method.name}`,
        role,
        kind: "method",
        owner: "runtime",
        risk: method.name.startsWith("get") || method.name.startsWith("is") || method.name.startsWith("has") ? "read" : "medium",
        provenance: [`${inspection.state.name}:${root.name}.${method.name}`],
        state: inspection.state.name,
        root: root.name,
        method: method.name,
        confidence: "runtime",
      });
    }
  }
  return entries;
}

function dedupeCapabilityCatalog(catalog: Civ7CapabilityCatalog): Civ7CapabilityCatalog {
  const byId = new Map<string, Civ7CapabilityCatalogEntry>();
  for (const entry of catalog.entries) {
    const existing = byId.get(entry.id);
    byId.set(entry.id, existing ? { ...existing, provenance: Array.from(new Set([...existing.provenance, ...entry.provenance])) } : entry);
  }
  return { ...catalog, entries: Array.from(byId.values()).sort((a, b) => a.id.localeCompare(b.id)) };
}

async function listFiles(root: string, maxFiles: number): Promise<string[]> {
  const out: string[] = [];
  async function visit(dir: string): Promise<void> {
    if (out.length >= maxFiles) return;
    const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (out.length >= maxFiles) return;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) out.push(path);
    }
  }
  await visit(root);
  return out;
}

function jsLiteral(value: unknown): string {
  const json = JSON.stringify(value);
  if (json === undefined) {
    throw new Civ7DirectControlError("command-failed", "Cannot serialize Civ7 command input");
  }
  return json;
}

function tunerStatesFromParts(parts: ReadonlyArray<string>): Civ7TunerState[] {
  const states: Civ7TunerState[] = [];
  for (let i = 0; i + 1 < parts.length; i += 2) {
    states.push({ id: parts[i] ?? "", name: parts[i + 1] ?? "" });
  }
  return states;
}

function appUiSnapshotFromCommandResult(result: Civ7CommandResult): Civ7AppUiSnapshotResult {
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

function tunerHealthFromCommandResult(result: Civ7CommandResult): Civ7TunerHealthResult {
  try {
    const snapshot = JSON.parse(result.output[0] ?? "{}") as Civ7TunerHealthSnapshot;
    return {
      host: result.host,
      port: result.port,
      state: result.state,
      ready: snapshot.ready,
      snapshot,
    };
  } catch (err) {
    throw new Civ7DirectControlError(
      "command-failed",
      `Civ7 Tuner health returned invalid JSON: ${result.output.join("\n") || "<empty>"}`,
      { cause: err, details: result },
    );
  }
}

async function checkCiv7TunerHealthWithSession(
  session: Civ7DirectControlSession,
  timeoutMs?: number,
): Promise<Civ7TunerHealthResult> {
  return tunerHealthFromCommandResult(
    await executeSessionCommandWithReconnect(session, {
      state: { role: "tuner" },
      command: buildTunerHealthCommand(),
      timeoutMs,
    }, 1),
  );
}

async function waitForCiv7TunerReadyWithSession(
  session: Civ7DirectControlSession,
  options: {
    timeoutMs?: number;
    waitTimeoutMs?: number;
    pollIntervalMs?: number;
  } = {},
): Promise<Civ7TunerHealthResult & { ready: true }> {
  const waitTimeoutMs = options.waitTimeoutMs ?? options.timeoutMs ?? DEFAULT_CIV7_TUNER_TIMEOUT_MS;
  const pollIntervalMs = options.pollIntervalMs ?? 500;
  const startedAt = Date.now();
  let lastHealth: Civ7TunerHealthResult | undefined;
  let lastError: Civ7DirectControlError | undefined;
  while (Date.now() - startedAt <= waitTimeoutMs) {
    try {
      const health = await checkCiv7TunerHealthWithSession(session, options.timeoutMs);
      if (health.ready) return health as Civ7TunerHealthResult & { ready: true };
      lastHealth = health;
    } catch (err) {
      lastError = toDirectControlError(err, "command-failed");
      await session.close();
    }
    await sleep(pollIntervalMs);
  }
  throw new Civ7DirectControlError(
    "connection-timeout",
    `Timed out waiting for Civ7 Tuner readiness after ${waitTimeoutMs}ms`,
    { details: lastHealth ?? lastError },
  );
}

async function executeSessionCommandWithReconnect(
  session: Civ7DirectControlSession,
  options: {
    command: string;
    state?: Civ7TunerStateSelection;
    timeoutMs?: number;
  },
  attempts = 6,
): Promise<Civ7CommandResult> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await session.executeCommand(options);
    } catch (err) {
      lastError = err;
      await session.close();
      await sleep(750 + attempt * 750);
    }
  }
  throw toDirectControlError(lastError, "command-failed");
}

function isCiv7BeginReadyLoadingState(state: number | undefined): boolean {
  return (
    state === CIV7_UI_LOADING_STATES.WaitingForUIReady ||
    state === CIV7_UI_LOADING_STATES.WaitingToStart
  );
}

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
}

function uniqueNonEmpty(values: ReadonlyArray<string | undefined>): string[] {
  return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))));
}

function toDirectControlError(err: unknown, fallbackCode: Civ7DirectControlErrorCode): Civ7DirectControlError {
  if (err instanceof Civ7DirectControlError) return err;
  return new Civ7DirectControlError(fallbackCode, errorMessage(err), { cause: err });
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function isNodeNotFound(err: unknown): boolean {
  return (
    err !== null &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code?: unknown }).code === "ENOENT"
  );
}

function matchOrderedMarkers(text: string, markers: ReadonlyArray<string>): { ok: boolean; matched: string[] } {
  const matched: string[] = [];
  let cursor = 0;
  for (const marker of markers) {
    const next = text.indexOf(marker, cursor);
    if (next < 0) return { ok: false, matched };
    matched.push(marker);
    cursor = next + marker.length;
  }
  return { ok: true, matched };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
