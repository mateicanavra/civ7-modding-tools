import { readdir, readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { Socket, createConnection } from "node:net";
import { Type, type Static } from "typebox";

export const DEFAULT_CIV7_TUNER_HOST = "127.0.0.1";
export const DEFAULT_CIV7_TUNER_PORT = 4318;
export const DEFAULT_CIV7_TUNER_TIMEOUT_MS = 10_000;
export const DEFAULT_CIV7_TUNER_STATE_NAME = "App UI";
export const CIV7_TUNER_APP_UI_STATE_NAME = "App UI";
export const CIV7_TUNER_STATE_NAME = "Tuner";
export const CIV7_RESTART_COMMAND = "Network.restartGame()";
export const CIV7_BEGIN_GAME_COMMAND = "UI.notifyUIReady()";
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
  "GameInfo",
  "PlayerIds",
] as const;
export const DEFAULT_CIV7_CAPABILITY_APP_UI_ROOTS = [
  "Network",
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
export const DEFAULT_CIV7_MAP_GRID_MAX_PLOTS = 512;
export const HARD_CIV7_MAP_GRID_MAX_PLOTS = 10_000;
export const DEFAULT_CIV7_GAMEINFO_LIMIT = 100;
export const HARD_CIV7_GAMEINFO_LIMIT = 1_000;
export const DEFAULT_CIV7_ROOT_MAX_KEYS = 100;
export const DEFAULT_CIV7_ROOT_MAX_METHODS = 100;
export const DEFAULT_CIV7_AUTOPLAY_MAX_TURNS = 50;
export const DEFAULT_CIV7_AUTOPLAY_WAIT_MS = 5_000;
export const DEFAULT_CIV7_AUTOPLAY_STOP_WAIT_MS = 30_000;
export const DEFAULT_CIV7_AUTOPLAY_POLL_INTERVAL_MS = 250;
export const DEFAULT_CIV7_AUTOPLAY_STOP_STABILITY_MS = 10_000;
export const DEFAULT_CIV7_SCRIPTING_LOG = join(
  homedir(),
  "Library",
  "Application Support",
  "Civilization VII",
  "Logs",
  "Scripting.log",
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

export type Civ7ComponentId = Readonly<{
  owner: number;
  id: number;
  type?: number;
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
}>;

export type Civ7TurnCompletionActionResult = Readonly<{
  before: Civ7TurnCompletionStatusResult;
  after: Civ7TurnCompletionStatusResult;
  command: Civ7CommandResult;
  verified: boolean;
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

export type Civ7OperationRequestResult = Readonly<{
  before: Civ7OperationValidationResult;
  command?: Civ7CommandResult;
  after: Civ7OperationValidationResult;
  sent: boolean;
  verified: boolean;
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

export type Civ7DirectControlErrorCode =
  | "invalid-port"
  | "connection-timeout"
  | "connection-failed"
  | "response-timeout"
  | "socket-closed"
  | "state-not-found"
  | "no-hosts"
  | "all-hosts-unavailable"
  | "command-failed"
  | "log-timeout";

export class Civ7DirectControlError extends Error {
  readonly code: Civ7DirectControlErrorCode;
  readonly details?: unknown;

  constructor(code: Civ7DirectControlErrorCode, message: string, options?: { cause?: unknown; details?: unknown }) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "Civ7DirectControlError";
    this.code = code;
    this.details = options?.details;
  }
}

type Civ7TunerFrame = Readonly<{
  listenerId: number;
  parts: ReadonlyArray<string>;
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
      } catch {
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
    ? { exists: true, size: info.size, mtimeMs: info.mtimeMs }
    : { exists: false, size: 0, mtimeMs: 0 };
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
  const startOffset = options.snapshot.size;
  let lastError: string | undefined;

  while (Date.now() - startedAt <= timeoutMs) {
    const current = await snapshotFile(options.logPath);
    if (current.exists && (current.size > startOffset || current.mtimeMs > options.snapshot.mtimeMs)) {
      const fullText = await readFile(options.logPath, "utf8");
      const newText = current.size >= startOffset ? fullText.slice(startOffset) : fullText;
      const proof = matchOrderedMarkers(newText, options.markers);
      const rejected = options.rejectPattern?.exec(newText);
      if (rejected) lastError = `Log contains ${rejected[0]}`;
      if (proof.ok && !rejected) {
        return {
          logPath: options.logPath,
          observedAt: new Date().toISOString(),
          startOffset,
          matched: proof.matched,
        };
      }
    }
    await sleep(pollIntervalMs);
  }

  throw new Civ7DirectControlError(
    "log-timeout",
    lastError ?? `Timed out waiting for fresh log markers in ${options.logPath}`,
    { details: { markers: options.markers, startOffset } },
  );
}

export function encodeCiv7TunerRequest(listenerId: number, message: string): Buffer {
  const messageBytes = Buffer.from(`${message}\0`, "utf8");
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}

export function parseCiv7TunerFrame(
  buffer: Buffer,
): { frame: Civ7TunerFrame; bytesRead: number } | null {
  if (buffer.length < 8) return null;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return null;
  const listenerId = buffer.readUInt32LE(4);
  const message = buffer.subarray(8, bytesRead).toString("utf8").replace(/\0$/, "");
  return {
    bytesRead,
    frame: {
      listenerId,
      parts: message.length > 0 ? message.split("\0") : [],
    },
  };
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
    const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };
    return JSON.stringify({
      network: {
        isInSession: probe(() => Network.isInSession),
        numPlayers: probe(() => Network.getNumPlayers()),
        hostPlayerId: probe(() => Network.getHostPlayerId()),
        isConnectedToNetwork: probe(() => Network.isConnectedToNetwork()),
        isAuthenticated: probe(() => Network.isAuthenticated()),
        isLoggedIn: probe(() => Network.isLoggedIn()),
      },
      autoplay: {
        isActive: Autoplay.isActive,
        turns: Autoplay.turns,
        isPaused: Autoplay.isPaused,
        isPausedOrPending: Autoplay.isPausedOrPending,
        observeAsPlayer: Autoplay.observeAsPlayer,
        returnAsPlayer: Autoplay.returnAsPlayer,
      },
      game: {
        turn: Game.turn,
        age: Game.age,
        maxTurns: Game.maxTurns,
        turnDate: probe(() => Game.getTurnDate()),
        hash: probe(() => Game.getHash()),
      },
      ui: {
        inGame: probe(() => UI.isInGame()),
        inShell: probe(() => UI.isInShell()),
        inLoading: probe(() => UI.isInLoading()),
        loadingState: probe(() => UI.getGameLoadingState()),
        loadingStateName: (() => {
          try {
            const state = UI.getGameLoadingState();
            return Object.entries(UIGameLoadingState).find(([, value]) => value === state)?.[0] ?? null;
          } catch {
            return null;
          }
        })(),
        canBeginGame: probe(() => {
          const state = UI.getGameLoadingState();
          return state === UIGameLoadingState.WaitingForUIReady || state === UIGameLoadingState.WaitingToStart;
        }),
        canNotifyUIReady: typeof UI.notifyUIReady,
        skipStartButton: probe(() => Configuration.getGame().skipStartButton),
        automationActive: probe(() => typeof Automation !== "undefined" ? Automation.isActive : false),
      },
      gameContext: {
        localPlayerID: GameContext.localPlayerID,
        localObserverID: GameContext.localObserverID,
        hasRequestedPause: probe(() => GameContext.hasRequestedPause()),
      },
      players: {
        maxPlayers: Players.maxPlayers,
        aliveIds: probe(() => Players.getAliveIds()),
        aliveHumanIds: probe(() => Players.getAliveHumanIds()),
        numAliveHumans: probe(() => Players.getNumAliveHumans()),
      },
      map: {
        width: probe(() => GameplayMap.getGridWidth()),
        height: probe(() => GameplayMap.getGridHeight()),
        plotCount: probe(() => GameplayMap.getPlotCount()),
        mapSize: probe(() => GameplayMap.getMapSize()),
        randomSeed: probe(() => GameplayMap.getRandomSeed()),
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
    });
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

function probeHelperSource(): string {
  return `const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
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

function operationRouterSource(): string {
  return `const routerFor = (family) => {
      if (family === "unit-operation") return { router: Game.UnitOperations, enums: UnitOperationTypes, targetKey: "unitId" };
      if (family === "unit-command") return { router: Game.UnitCommands, enums: UnitCommandTypes, targetKey: "unitId" };
      if (family === "city-operation") return { router: Game.CityOperations, enums: CityOperationTypes, targetKey: "cityId" };
      if (family === "city-command") return { router: Game.CityCommands, enums: CityCommandTypes, targetKey: "cityId" };
      if (family === "player-operation") return { router: Game.PlayerOperations, enums: PlayerOperationTypes, targetKey: "playerId" };
      throw new Error("Unsupported operation family " + family);
    };
    const enumValueFor = (enums, operationType) => {
      if (enums && Object.prototype.hasOwnProperty.call(enums, operationType)) return enums[operationType];
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
      const before = validateOperation(family, input);
      if (!before.valid) return { sent: false, before, result: null };
      const meta = routerFor(family);
      const target = input[meta.targetKey];
      const result = meta.router.sendRequest(target, before.enumValue, input.args ?? {});
      return { sent: true, before, result };
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
    wrapper: "getCiv7PlotSnapshot|getCiv7MapGrid",
    confidence: "recorded-live-proof",
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

function validateMapBounds(bounds: Civ7MapBounds): void {
  validateMapLocation(bounds);
  boundedInteger(bounds.width, 1, HARD_CIV7_MAP_GRID_MAX_PLOTS, "bounds.width");
  boundedInteger(bounds.height, 1, HARD_CIV7_MAP_GRID_MAX_PLOTS, "bounds.height");
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

function validateIdentifier(value: string, label: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Civ7DirectControlError("command-failed", `${label} must be a simple identifier`);
  }
  return value;
}

function assertApproved(approval: Civ7ActionApproval, action: string): void {
  if (!approval || approval.approved !== true || !approval.reason.trim()) {
    throw new Civ7DirectControlError("command-failed", `Explicit approval with a reason is required before ${action}`);
  }
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
    return { before, after: before, sent: false, verified: false };
  }
  const command = await executeCiv7TunerCommand({
    ...options,
    command: buildOperationRequestCommand(family, input),
  });
  const sentPayload = jsonPayloadFromCommandResult<{ sent: boolean }>(command, "Civ7 operation request");
  const after = await validateCiv7Operation(family, input, options);
  return {
    before,
    command,
    after,
    sent: sentPayload.sent === true,
    verified: command.output.length > 0 && sentPayload.sent === true,
  };
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
