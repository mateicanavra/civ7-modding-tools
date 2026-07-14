import { readdir, readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, extname, join, resolve } from "node:path";
import { Civ7DirectControlError } from "../direct-control-error.js";
import { assessCiv7SignedIntSeed } from "../policy/setup.js";
import {
  jsonPayloadFromCommandResult,
  throwUnexpectedCommandPayloadStatus,
} from "../session/command-result.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../session/types.js";
import { validateIdentifier } from "../validation.js";
import {
  admitCiv7SetupShell,
  buildSetupSnapshotCommand,
  type Civ7SetupMapRow,
  type Civ7SetupMapRowsResult,
  type Civ7SetupMapRowVisibilityResult,
  type Civ7SetupParameterSnapshot,
  type Civ7SetupParameterValue,
  type Civ7SetupSnapshot,
  type Civ7SetupSnapshotResult,
  type Civ7SetupSnapshotSelection,
  defaultSetupReadDependencies,
  ensureCiv7SetupMapRowVisible,
  getCiv7SetupMapRows,
  type SetupReadDependencies,
  setupSnapshotScriptSource,
  validateMapScript,
  waitForCiv7SetupPhase,
} from "./reads.js";

export type Civ7SetupOptionValue = string | number | boolean;

export const DEFAULT_CIV7_SINGLE_PLAYER_SAVE_DIR = join(
  homedir(),
  "Library",
  "Application Support",
  "Civilization VII",
  "Saves",
  "Single"
);

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

export type Civ7SavedGameConfigurationLoadRequestResult = Readonly<{
  command: Civ7CommandResult;
  savedConfig: Civ7SavedGameConfigurationRef;
  before: Civ7SetupSnapshotResult;
  accepted: boolean;
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

export type Civ7SavedGameConfiguration = Civ7SavedGameConfigurationRef &
  Readonly<{
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

export type Civ7SinglePlayerSetupInput = Readonly<{
  mapScript: string;
  mapSize: string;
  seed: number;
  gameSeed?: number;
  playerCount?: number;
  requiredActiveTargetModId?: string;
  savedConfig?: Civ7SavedGameConfigurationRef;
  options?: Readonly<Record<string, Civ7SetupOptionValue>>;
  playerOptions?: ReadonlyArray<Civ7PlayerSetupOptions>;
  fromRunningGame?: "reject" | "exit-to-shell";
  requireShell?: boolean;
}>;

export type Civ7SinglePlayerSetupValues = Readonly<
  Pick<
    Civ7SinglePlayerSetupInput,
    "mapScript" | "mapSize" | "seed" | "gameSeed" | "playerCount" | "options" | "playerOptions"
  >
>;

export type Civ7TargetModReconciliationResult = Readonly<{
  targetModId: string;
  before: Civ7SetupSnapshotResult;
  command?: Civ7CommandResult;
  result?: Civ7TargetModReconciliationCommandResult;
  refreshed: boolean;
  verified: boolean;
}>;

export type Civ7TargetModReconciliationCommandResult = Readonly<{
  targetModId: string;
  targetInstalled: boolean;
  targetWasEnabled: boolean;
  canEnableResult?: unknown;
  enableResult?: unknown;
  refreshResult?: unknown;
  enabledModCount: number;
  enabledModsMetaSource: string;
  enabledModsMetaUpdated: boolean;
  enabledModsMetaModCount: number;
  enabledModsMetaContainsTarget: boolean;
  targetActive: boolean;
}>;

export type Civ7SetupShellTransitionResult = Readonly<{
  before: Civ7SetupSnapshotResult;
  shellExit?: Civ7CommandResult;
  after: Civ7SetupSnapshotResult;
}>;

export type Civ7PreparedSetupResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  before: Civ7SetupSnapshotResult;
  after: Civ7SetupSnapshotResult;
  command: Civ7CommandResult;
  shellTransition?: Civ7SetupShellTransitionResult;
  savedConfigLoad?: Civ7SavedGameConfigurationLoadResult;
  targetModReconciliation?: Civ7TargetModReconciliationResult;
  rowVisibility: Civ7SetupMapRowVisibilityResult;
  applied: Readonly<Record<string, Civ7SetupOptionValue>>;
  verified: boolean;
}>;

export type Civ7SetupApplicationResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  before: Civ7SetupSnapshotResult;
  after: Civ7SetupSnapshotResult;
  command: Civ7CommandResult;
  applied: Readonly<Record<string, Civ7SetupOptionValue>>;
  verified: true;
}>;

type SavedConfigLoadRequestPayload =
  | Readonly<{
      status: "performed";
      before: Civ7SetupSnapshot;
      accepted: boolean;
    }>
  | Readonly<{
      status: "refused";
      before: Civ7SetupSnapshot;
      reason: "phase" | "revision-unavailable";
    }>;

type SetupPreparePayload =
  | Readonly<{
      status: "performed";
      before: Civ7SetupSnapshot;
      after: Civ7SetupSnapshot;
      applied: Record<string, Civ7SetupOptionValue>;
    }>
  | Readonly<{
      status: "refused";
      before: Civ7SetupSnapshot;
      reason: "phase" | "map-row";
    }>
  | Readonly<{
      status: "unverified";
      before: Civ7SetupSnapshot;
      after: Civ7SetupSnapshot;
      applied: Record<string, Civ7SetupOptionValue>;
      mismatch: string;
    }>;

type TargetModReconciliationPayload =
  | Readonly<{
      status: "performed";
      before: Civ7SetupSnapshot;
      result: Civ7TargetModReconciliationCommandResult;
    }>
  | Readonly<{
      status: "refused";
      before: Civ7SetupSnapshot;
      reason: "phase";
    }>;

type SetupPrepareDependencies = SetupReadDependencies &
  Readonly<{
    loadSavedGameConfiguration: (
      input: Civ7SavedGameConfigurationRef,
      options?: Civ7DirectControlOptions,
      wait?: Readonly<{ waitTimeoutMs?: number; pollIntervalMs?: number }>
    ) => Promise<Civ7SavedGameConfigurationLoadResult>;
    parseSavedConfigLoadRequest: (
      result: Civ7CommandResult,
      label: string
    ) => SavedConfigLoadRequestPayload;
    parseSetupPreparation: (result: Civ7CommandResult, label: string) => SetupPreparePayload;
    validateIdentifier: (value: string, label: string) => string;
  }>;

export async function requestCiv7SavedGameConfigurationLoad(
  input: Civ7SavedGameConfigurationRef,
  options: Civ7DirectControlOptions = {},
  dependencies: SetupPrepareDependencies = defaultSetupPrepareDependencies
): Promise<Civ7SavedGameConfigurationLoadRequestResult> {
  const savedConfig = normalizeSavedGameConfigurationRef(input);
  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: buildLoadSavedGameConfigurationCommand(savedConfig, dependencies),
  });
  const payload = dependencies.parseSavedConfigLoadRequest(
    command,
    "Civ7 saved configuration load request"
  );
  const status = payload.status;
  switch (status) {
    case "performed": {
      const before = setupSnapshotResult(command, payload.before);
      return { command, savedConfig, before, accepted: payload.accepted };
    }
    case "refused": {
      const before = setupSnapshotResult(command, payload.before);
      throw new Civ7DirectControlError(
        payload.reason === "phase" ? "setup-phase-refused" : "setup-config-evidence-missing",
        payload.reason === "phase"
          ? `Civ7 saved configuration load requires shell phase; observed ${payload.before.phase}`
          : "Civ7 setup revision is unavailable before saved configuration load",
        { details: before }
      );
    }
    default:
      return throwUnexpectedCommandPayloadStatus(
        command,
        "Civ7 saved configuration load request",
        status
      );
  }
}

export async function applyCiv7SinglePlayerSetup(
  input: Civ7SinglePlayerSetupValues,
  options: Civ7DirectControlOptions = {},
  dependencies: SetupPrepareDependencies = defaultSetupPrepareDependencies
): Promise<Civ7SetupApplicationResult> {
  const normalized = normalizeSinglePlayerSetupInput(input, dependencies);
  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: buildPrepareSinglePlayerSetupCommand(normalized, dependencies),
  });
  const payload = dependencies.parseSetupPreparation(command, "Civ7 setup application");
  const status = payload.status;
  switch (status) {
    case "performed": {
      const before = setupSnapshotResult(command, payload.before);
      const after = setupSnapshotResult(command, payload.after);
      assertPreparedSetupMatches(normalized, after.snapshot);
      return {
        host: command.host,
        port: command.port,
        state: command.state,
        before,
        after,
        command,
        applied: payload.applied,
        verified: true,
      };
    }
    case "refused": {
      const before = setupSnapshotResult(command, payload.before);
      throw new Civ7DirectControlError(
        payload.reason === "phase" ? "setup-phase-refused" : "setup-map-row-missing",
        payload.reason === "phase"
          ? `Civ7 setup application requires shell phase; observed ${payload.before.phase}`
          : `Civ7 setup map row is not visible for ${normalized.mapScript}`,
        { details: before }
      );
    }
    case "unverified": {
      const before = setupSnapshotResult(command, payload.before);
      const after = setupSnapshotResult(command, payload.after);
      throw new Civ7DirectControlError(
        "setup-readback-mismatch",
        `Civ7 setup application readback mismatch: ${payload.mismatch}`,
        { details: { before, after, mismatch: payload.mismatch, applied: payload.applied } }
      );
    }
    default:
      return throwUnexpectedCommandPayloadStatus(command, "Civ7 setup application", status);
  }
}

/** @deprecated Use `lifecycle.singlePlayer.start` from `@civ7/control-orpc`. */
export async function prepareCiv7SinglePlayerSetup(
  input: Civ7SinglePlayerSetupInput,
  options: Civ7DirectControlOptions = {},
  dependencies: SetupPrepareDependencies = defaultSetupPrepareDependencies
): Promise<Civ7PreparedSetupResult> {
  const normalized = normalizeSinglePlayerSetupInput(input, dependencies);
  const shellTransition = await ensureSetupShell(normalized, options, dependencies);
  const savedConfigLoad = normalized.savedConfig
    ? await dependencies.loadSavedGameConfiguration(normalized.savedConfig, options, {
        waitTimeoutMs: options.timeoutMs,
        pollIntervalMs: 1_000,
      })
    : undefined;
  if (savedConfigLoad && !savedConfigLoad.loaded) {
    throw new Civ7DirectControlError(
      "setup-config-load-failed",
      `Civ7 did not load saved configuration ${savedConfigLoad.savedConfig.fileName}`,
      { details: savedConfigLoad }
    );
  }
  const targetModReconciliation = normalized.requiredActiveTargetModId
    ? await reconcileCiv7RequiredTargetMod(
        normalized.requiredActiveTargetModId,
        options,
        dependencies
      )
    : undefined;
  if (targetModReconciliation && !targetModReconciliation.verified) {
    throw new Civ7DirectControlError(
      "setup-mod-reconciliation-failed",
      `Civ7 setup active mod set does not include ${targetModReconciliation.targetModId}`,
      { details: { targetModReconciliation } }
    );
  }
  const rowVisibility = await ensureCiv7SetupMapRowVisible(
    {
      file: normalized.mapScript,
      limit: 20,
      reloadIfMissing: "reload-in-shell",
      waitTimeoutMs: options.timeoutMs,
      pollIntervalMs: 1_000,
    },
    options,
    dependencies
  );
  if (!rowVisibility.verified) {
    const allRows = await getCiv7SetupMapRows({ limit: 100 }, options, dependencies).catch(
      () => undefined
    );
    throw new Civ7DirectControlError(
      "setup-map-row-missing",
      `Civ7 setup map row is not visible for ${normalized.mapScript}`,
      { details: { rowVisibility, allRows, targetModReconciliation } }
    );
  }
  const before = await dependencies.parseSetupSnapshot(
    await dependencies.executeAppUiCommand({
      ...options,
      command: buildSetupSnapshotCommand(dependencies),
    }),
    "Civ7 setup snapshot"
  );
  if (normalized.requireShell !== false && before.snapshot.phase !== "shell") {
    throw new Civ7DirectControlError(
      "setup-phase-invalid",
      `Civ7 setup requires shell/main-menu phase; observed ${before.snapshot.phase}`,
      { details: before }
    );
  }

  const rowProof = findSetupMapRow(before.snapshot, normalized.mapScript);
  if (!rowProof) {
    throw new Civ7DirectControlError(
      "setup-map-row-missing",
      `Civ7 setup map row is not visible for ${normalized.mapScript}`,
      { details: before.snapshot.mapRows }
    );
  }

  const application = await applyCiv7SinglePlayerSetup(normalized, options, dependencies);
  return {
    host: application.host,
    port: application.port,
    state: application.state,
    before,
    after: application.after,
    command: application.command,
    ...(shellTransition ? { shellTransition } : {}),
    ...(savedConfigLoad ? { savedConfigLoad } : {}),
    ...(targetModReconciliation ? { targetModReconciliation } : {}),
    rowVisibility,
    applied: application.applied,
    verified: application.verified,
  };
}

async function ensureSetupShell(
  input: Civ7SinglePlayerSetupInput,
  options: Civ7DirectControlOptions,
  dependencies: SetupPrepareDependencies
): Promise<Civ7SetupShellTransitionResult | undefined> {
  if (input.requireShell === false) return undefined;
  const admission = await admitCiv7SetupShell(
    input.fromRunningGame === "exit-to-shell" ? "exit-active-game" : "reject",
    options,
    dependencies
  );
  const after =
    admission.transition === "exit-sent"
      ? await waitForCiv7SetupPhase(
          "shell",
          options,
          { waitTimeoutMs: options.timeoutMs ?? 120_000, pollIntervalMs: 1_000 },
          dependencies
        )
      : admission.initial;
  return {
    before: admission.initial,
    ...(admission.transition === "exit-sent" ? { shellExit: admission.shellExit } : {}),
    after,
  };
}

export async function reconcileCiv7RequiredTargetMod(
  targetModId: string,
  options: Civ7DirectControlOptions = {},
  dependencies: SetupReadDependencies = defaultSetupReadDependencies
): Promise<Civ7TargetModReconciliationResult> {
  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: buildReconcileTargetModCommand({ targetModId }, dependencies),
  });
  const payload = jsonPayloadFromCommandResult<TargetModReconciliationPayload>(
    command,
    "Civ7 target mod reconciliation"
  );
  const status = payload.status;
  switch (status) {
    case "performed": {
      const before = setupSnapshotResult(command, payload.before);
      const result = payload.result;
      return {
        targetModId,
        before,
        command,
        result,
        refreshed: true,
        verified: result.targetActive === true && result.enabledModsMetaContainsTarget === true,
      };
    }
    case "refused": {
      const before = setupSnapshotResult(command, payload.before);
      throw new Civ7DirectControlError(
        "setup-phase-refused",
        `Civ7 target mod reconciliation requires shell phase; observed ${payload.before.phase}`,
        { details: before }
      );
    }
    default:
      return throwUnexpectedCommandPayloadStatus(command, "Civ7 target mod reconciliation", status);
  }
}

export async function listCiv7SavedGameConfigurations(
  input: Civ7SavedGameConfigurationListInput = {},
  dependencies: Pick<SetupPrepareDependencies, "boundedInteger">
): Promise<Civ7SavedGameConfigurationListResult> {
  const directory = resolve(input.directory ?? DEFAULT_CIV7_SINGLE_PLAYER_SAVE_DIR);
  const entries = await readdir(directory, { withFileTypes: true }).catch((err: unknown) => {
    if (isNodeNotFound(err)) return [];
    throw err;
  });
  const maxFiles = dependencies.boundedInteger(input.maxFiles ?? 200, 1, 2_000, "maxFiles");
  const configurations: Civ7SavedGameConfiguration[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || extname(entry.name).toLowerCase() !== ".civ7cfg") continue;
    const filePath = join(directory, entry.name);
    configurations.push(await readCiv7SavedGameConfiguration(filePath));
    if (configurations.length >= maxFiles) break;
  }
  configurations.sort(
    (a, b) => b.modifiedAt.localeCompare(a.modifiedAt) || a.displayName.localeCompare(b.displayName)
  );
  return { directory, configurations };
}

function buildLoadSavedGameConfigurationCommand(
  input: Civ7SavedGameConfigurationRef,
  dependencies: SetupReadDependencies
): string {
  return `(() => {
    ${setupSnapshotScriptSource(dependencies)}
    const input = ${dependencies.jsLiteral(input)};
    const before = readSetupSnapshot();
    if (before.phase !== "shell") {
      return JSON.stringify({ status: "refused", before, reason: "phase" });
    }
    if (!before.setup.revision.ok || !Number.isInteger(before.setup.revision.value)) {
      return JSON.stringify({ status: "refused", before, reason: "revision-unavailable" });
    }
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
      status: "performed",
      before,
      accepted: Network.loadGame(params, serverType) === true,
    });
  })()`;
}

/** Defines the single setup expectation law injected into apply and host wire commands. */
export function setupExpectationScriptSource(): string {
  return `const setupProbeValue = (value) => value && value.ok === true ? value.value : undefined;
    const setupParameterValue = (snapshot, id) =>
      snapshot.setup.parameters.find((parameter) => parameter.id === id)?.value;
    const playerSetupParameterValue = (snapshot, playerId, id) =>
      snapshot.setup.playerParameters
        .find((player) => player.playerId === playerId)
        ?.parameters.find((parameter) => parameter.id === id)?.value;
    const playerIdentityVerified = (snapshot, playerId) => {
      const player = snapshot.setup.playerParameters.find((entry) => entry.playerId === playerId);
      return player?.exists?.ok === true && player.exists.value === true;
    };
    const setupExpectationMismatch = (input, snapshot) => {
      if (snapshot.phase !== "shell") return "phase";
      if (!snapshot.mapRows.some((row) => row.file === input.mapScript)) return "map-row";
      if (setupParameterValue(snapshot, "Map") !== input.mapScript) return "setup-map";
      if (setupParameterValue(snapshot, "MapSize") !== input.mapSize) return "setup-map-size";
      if (Number(setupParameterValue(snapshot, "MapRandomSeed")) !== input.seed) return "setup-map-seed";
      if (input.gameSeed !== undefined && Number(setupParameterValue(snapshot, "GameRandomSeed")) !== input.gameSeed) return "setup-game-seed";
      if (input.playerCount !== undefined && setupProbeValue(snapshot.config.playerCount) !== input.playerCount) return "setup-player-count";
      for (const [key, expected] of Object.entries(input.options ?? {})) {
        if (setupParameterValue(snapshot, key) !== expected) return "setup-option:" + key;
      }
      for (const player of input.playerOptions ?? []) {
        if (!playerIdentityVerified(snapshot, player.playerId)) {
          return "player-identity:" + player.playerId;
        }
        for (const [key, expected] of Object.entries(player.options ?? {})) {
          if (playerSetupParameterValue(snapshot, player.playerId, key) !== expected) {
            return "player-option:" + player.playerId + ":" + key;
          }
        }
      }
      if (setupProbeValue(snapshot.config.mapScript) !== input.mapScript) return "runtime-map-script";
      if (setupProbeValue(snapshot.config.mapSizeType) !== input.mapSize) return "runtime-map-size-type";
      if (setupProbeValue(snapshot.config.mapSeed) !== input.seed) return "runtime-map-seed";
      if (input.gameSeed !== undefined && setupProbeValue(snapshot.config.gameSeed) !== input.gameSeed) return "runtime-game-seed";
      if (input.playerCount !== undefined && setupProbeValue(snapshot.config.playerCount) !== input.playerCount) return "runtime-player-count";
      return null;
    };`;
}

export function setupSnapshotSelectionFromInput(
  input: Pick<Civ7SinglePlayerSetupInput, "options" | "playerOptions">
): Civ7SetupSnapshotSelection {
  const playerOptions = input.playerOptions ?? [];
  return {
    setupParameterIds: Object.keys(input.options ?? {}).sort(),
    playerSetupParameterIds: Array.from(
      new Set(playerOptions.flatMap((player) => Object.keys(player.options)))
    ).sort(),
    playerIds: Array.from(new Set(playerOptions.map((player) => player.playerId))).sort(
      (left, right) => left - right
    ),
  };
}

export function buildPrepareSinglePlayerSetupCommand(
  input: Civ7SinglePlayerSetupInput,
  dependencies: SetupReadDependencies
): string {
  return `(() => {
    ${setupSnapshotScriptSource(dependencies, setupSnapshotSelectionFromInput(input))}
    ${setupExpectationScriptSource()}
    const input = ${dependencies.jsLiteral(input)};
    const before = readSetupSnapshot();
    if (before.phase !== "shell") {
      return JSON.stringify({ status: "refused", before, reason: "phase" });
    }
    if (!before.mapRows.some((row) => row.file === input.mapScript)) {
      return JSON.stringify({ status: "refused", before, reason: "map-row" });
    }
    const applied = {};
    const requireFunction = (owner, key, label) => {
      const candidate = owner?.[key];
      if (typeof candidate !== "function") throw new Error(label + " unavailable");
      return candidate;
    };
    if (typeof Configuration === "undefined" || !Configuration) {
      throw new Error("Configuration API unavailable");
    }
    if (typeof GameSetup === "undefined" || !GameSetup) throw new Error("GameSetup API unavailable");
    requireFunction(Configuration, "getMap", "Configuration.getMap");
    requireFunction(Configuration, "getGame", "Configuration.getGame");
    if (typeof GameInfo === "undefined" || !GameInfo?.Maps) throw new Error("GameInfo.Maps unavailable");
    requireFunction(GameInfo.Maps, "lookup", "GameInfo.Maps.lookup");
    requireFunction(GameSetup, "findGameParameter", "GameSetup.findGameParameter");
    const editMapFactory = requireFunction(Configuration, "editMap", "Configuration.editMap");
    const editGameFactory = requireFunction(Configuration, "editGame", "Configuration.editGame");
    const editMap = editMapFactory.call(Configuration);
    const editGame = editGameFactory.call(Configuration);
    if (!editMap || !editGame) throw new Error("Configuration edit APIs are unavailable");
    const setScript = requireFunction(editMap, "setScript", "Configuration.editMap().setScript");
    const setMapSize = requireFunction(editMap, "setMapSize", "Configuration.editMap().setMapSize");
    const setMapSeed = requireFunction(editMap, "setMapSeed", "Configuration.editMap().setMapSeed");
    const setSetupParameter = requireFunction(GameSetup, "setGameParameterValue", "GameSetup.setGameParameterValue");
    const setGameSeed = input.gameSeed === undefined
      ? null
      : requireFunction(editGame, "setGameSeed", "Configuration.editGame().setGameSeed");
    const setMaxMajorPlayers = input.playerCount === undefined
      ? null
      : requireFunction(editMap, "setMaxMajorPlayers", "Configuration.editMap().setMaxMajorPlayers");
    const hasPlayerOptionDemand = (input.playerOptions ?? []).some(
      (player) => Object.keys(player.options ?? {}).length > 0
    );
    const setPlayerSetupParameter = hasPlayerOptionDemand
      ? requireFunction(GameSetup, "setPlayerParameterValue", "GameSetup.setPlayerParameterValue")
      : null;
    if (hasPlayerOptionDemand) {
      requireFunction(GameSetup, "findPlayerParameter", "GameSetup.findPlayerParameter");
    }
    setScript.call(editMap, input.mapScript);
    setSetupParameter.call(GameSetup, "Map", input.mapScript);
    applied.Map = input.mapScript;
    setMapSize.call(editMap, input.mapSize);
    setSetupParameter.call(GameSetup, "MapSize", input.mapSize);
    applied.MapSize = input.mapSize;
    setMapSeed.call(editMap, input.seed);
    setSetupParameter.call(GameSetup, "MapRandomSeed", input.seed);
    applied.MapRandomSeed = input.seed;
    if (input.gameSeed !== undefined) {
      setGameSeed.call(editGame, input.gameSeed);
      setSetupParameter.call(GameSetup, "GameRandomSeed", input.gameSeed);
      applied.GameRandomSeed = input.gameSeed;
    }
    if (input.playerCount !== undefined) {
      setMaxMajorPlayers.call(editMap, input.playerCount);
      applied.MaxMajorPlayers = input.playerCount;
    }
    for (const [key, value] of Object.entries(input.options ?? {})) {
      setSetupParameter.call(GameSetup, key, value);
      applied[key] = value;
    }
    for (const player of input.playerOptions ?? []) {
      for (const [key, value] of Object.entries(player.options ?? {})) {
        setPlayerSetupParameter.call(GameSetup, player.playerId, key, value);
        applied["Player:" + player.playerId + ":" + key] = value;
      }
    }
    const after = readSetupSnapshot();
    const mismatch = setupExpectationMismatch(input, after);
    return mismatch
      ? JSON.stringify({ status: "unverified", before, after, applied, mismatch })
      : JSON.stringify({ status: "performed", before, after, applied });
  })()`;
}

export function buildReconcileTargetModCommand(
  input: Readonly<{ targetModId: string }>,
  dependencies: SetupReadDependencies
): string {
  return `(() => {
    ${setupSnapshotScriptSource(dependencies)}
    const input = ${dependencies.jsLiteral(input)};
    const before = readSetupSnapshot();
    if (before.phase !== "shell") {
      return JSON.stringify({ status: "refused", before, reason: "phase" });
    }
    const asArray = (value) => {
      if (value == null) return [];
      if (Array.isArray(value)) return value;
      if (typeof value[Symbol.iterator] === "function") return Array.from(value);
      return [];
    };
    const modId = String(input.targetModId ?? "").trim();
    if (!modId) throw new Error("targetModId is required");
    if (typeof Modding === "undefined" || !Modding) throw new Error("Modding API unavailable");
    if (typeof Configuration === "undefined" || !Configuration || typeof Configuration.editGame !== "function") {
      throw new Error("Configuration edit game API unavailable");
    }
    const normalizeId = (value) => String(value ?? "").trim().replace(/^\\{|\\}$/g, "").toLowerCase();
    const targetKey = normalizeId(modId);
    const installed = typeof Modding.getInstalledMods === "function"
      ? asArray(Modding.getInstalledMods())
      : [];
    const target = installed.find((mod) => {
      const id = mod?.id ?? mod?.ID ?? mod?.Id ?? mod?.modID ?? mod?.modId ?? mod?.ModID ?? mod?.ModId;
      const packageId = mod?.packageId ?? mod?.PackageId ?? mod?.PackageID;
      return normalizeId(id) === targetKey || normalizeId(packageId) === targetKey;
    });
    const targetId = target?.id ?? target?.ID ?? target?.Id ?? target?.modID ?? target?.modId ?? target?.ModID ?? target?.ModId;
    const targetPackageId = target?.packageId ?? target?.PackageId ?? target?.PackageID;
    const getHandle = (id) =>
      typeof Modding.getModHandle === "function" && id !== undefined && id !== null && String(id).trim()
        ? Modding.getModHandle(id)
        : undefined;
    const handleCandidates = [
      getHandle(modId),
      getHandle(targetId),
      getHandle(targetPackageId),
      target?.handle,
      target?.Handle,
    ];
    const handle = handleCandidates.find((candidate) => candidate !== undefined && candidate !== null && candidate !== -1);
    if (handle === undefined || handle === null || handle === -1) {
      throw new Error("Target mod is not installed: " + modId);
    }
    const editGame = Configuration.editGame();
    if (!editGame || typeof editGame.refreshEnabledMods !== "function") {
      throw new Error("Configuration.editGame().refreshEnabledMods unavailable");
    }
    const readEnabledModIds = () => {
      if (typeof Configuration.getGame !== "function") {
        throw new Error("Configuration.getGame unavailable");
      }
      const game = Configuration.getGame();
      if (!game || typeof game !== "object") {
        throw new Error("Configuration.getGame() unavailable");
      }
      const enabledModCount = game.enabledModCount;
      if (typeof enabledModCount !== "number" || !Number.isInteger(enabledModCount) || enabledModCount < 0) {
        throw new Error("Configuration.getGame().enabledModCount invalid");
      }
      if (typeof game.getEnabledModId !== "function") {
        throw new Error("Configuration.getGame().getEnabledModId unavailable");
      }
      const enabledModIds = [];
      for (let index = 0; index < enabledModCount; index += 1) {
        enabledModIds.push(game.getEnabledModId(index));
      }
      return enabledModIds;
    };
    readEnabledModIds();
    const readEnabledModsMeta = () => {
      const candidates = [
        ["Configuration.editGame", editGame.enableModsMetaString],
        ["Configuration.getGame", typeof Configuration.getGame === "function" ? Configuration.getGame()?.enableModsMetaString : undefined],
      ];
      for (const [source, value] of candidates) {
        if (typeof value !== "string" || !value.trim()) continue;
        try {
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed === "object" && Array.isArray(parsed.mods)) {
            return { source, parsed };
          }
        } catch {}
      }
      throw new Error("Current enabled mod metadata unavailable");
    };
    const enabledModsMetaRead = readEnabledModsMeta();
    const targetEnabled = target?.enabled ?? target?.Enabled ?? target?.isEnabled ?? target?.IsEnabled;
    let canEnableResult = null;
    let enableResult = null;
    if (targetEnabled !== true) {
      if (typeof Modding.canEnableMods === "function") {
        canEnableResult = Modding.canEnableMods([handle], true);
        if (canEnableResult && typeof canEnableResult === "object" && canEnableResult.status !== 0) {
          throw new Error("Target mod cannot be enabled: " + modId);
        }
      }
      if (typeof Modding.enableMods !== "function") throw new Error("Modding.enableMods unavailable");
      enableResult = Modding.enableMods([handle], true);
    }
    const enabledModsMeta = enabledModsMetaRead.parsed;
    const enabledMods = enabledModsMeta.mods;
    const targetAlreadyInMetadata = enabledMods.some((mod) => normalizeId(mod?.modid ?? mod?.id) === targetKey);
    if (!targetAlreadyInMetadata) {
      enabledMods.push({
        modid: modId,
        version: String(target?.version ?? target?.Version ?? "1"),
        title: String(target?.title ?? target?.Title ?? target?.name ?? target?.Name ?? modId),
        subscriptionid: target?.subscriptionid ?? target?.subscriptionId ?? target?.SubscriptionId ?? null,
      });
    }
    enabledModsMeta.mods = enabledMods;
    const nextEnabledModsMeta = JSON.stringify(enabledModsMeta);
    editGame.enableModsMetaString = nextEnabledModsMeta;
    if (typeof editGame.setValue === "function") {
      try {
        editGame.setValue("EnableModsMetaString", nextEnabledModsMeta);
      } catch {}
    }
    const refreshResult = editGame.refreshEnabledMods();
    const enabledModIds = readEnabledModIds();
    return JSON.stringify({
      status: "performed",
      before,
      result: {
        targetModId: modId,
        handle,
        targetInstalled: !!target,
        targetWasEnabled: targetEnabled === true,
        canEnableResult,
        enableResult,
        refreshResult,
        enabledModCount: enabledModIds.length,
        enabledModsMetaSource: enabledModsMetaRead.source,
        enabledModsMetaUpdated: !targetAlreadyInMetadata,
        enabledModsMetaModCount: enabledMods.length,
        enabledModsMetaContainsTarget: enabledMods.some((mod) => normalizeId(mod?.modid ?? mod?.id) === targetKey),
        targetActive: enabledModIds.some((id) => normalizeId(id) === targetKey),
      },
    });
  })()`;
}

export function normalizeSinglePlayerSetupInput(
  input: Civ7SinglePlayerSetupInput,
  dependencies: Pick<SetupPrepareDependencies, "boundedInteger" | "validateIdentifier">
): Civ7SinglePlayerSetupInput {
  validateMapScript(input.mapScript);
  if (!/^MAPSIZE_[A-Z0-9_]+$/.test(input.mapSize)) {
    throw new Civ7DirectControlError(
      "setup-parameter-invalid",
      "mapSize must be a Civ7 MAPSIZE_* value"
    );
  }
  const seed = validateSetupSeed(input.seed, "seed");
  const gameSeed =
    input.gameSeed !== undefined ? validateSetupSeed(input.gameSeed, "gameSeed") : undefined;
  const playerCount =
    input.playerCount !== undefined
      ? dependencies.boundedInteger(input.playerCount, 1, 64, "playerCount")
      : undefined;
  const requiredActiveTargetModId =
    input.requiredActiveTargetModId === undefined
      ? undefined
      : validateModIdentity(input.requiredActiveTargetModId, "requiredActiveTargetModId");
  const options: Record<string, Civ7SetupOptionValue> = {};
  for (const [key, value] of Object.entries(input.options ?? {})) {
    dependencies.validateIdentifier(key, "setup option id");
    if (!["string", "number", "boolean"].includes(typeof value)) {
      throw new Civ7DirectControlError(
        "setup-parameter-invalid",
        `Unsupported setup option value for ${key}`
      );
    }
    options[key] = value;
  }
  const playerOptions: Civ7PlayerSetupOptions[] = [];
  for (const player of input.playerOptions ?? []) {
    const playerId = dependencies.boundedInteger(player.playerId, 0, 64, "playerOptions.playerId");
    const normalizedOptions: Record<string, Civ7SetupOptionValue> = {};
    for (const [key, value] of Object.entries(player.options ?? {})) {
      dependencies.validateIdentifier(key, "player setup option id");
      if (!["string", "number", "boolean"].includes(typeof value)) {
        throw new Civ7DirectControlError(
          "setup-parameter-invalid",
          `Unsupported player setup option value for ${key}`
        );
      }
      normalizedOptions[key] = value;
    }
    playerOptions.push({ playerId, options: normalizedOptions });
  }
  return {
    ...input,
    mapScript: input.mapScript,
    mapSize: input.mapSize,
    seed,
    ...(gameSeed !== undefined ? { gameSeed } : {}),
    ...(playerCount !== undefined ? { playerCount } : {}),
    ...(requiredActiveTargetModId !== undefined ? { requiredActiveTargetModId } : {}),
    ...(input.savedConfig
      ? { savedConfig: normalizeSavedGameConfigurationRef(input.savedConfig) }
      : {}),
    options,
    playerOptions,
  };
}

function validateModIdentity(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized || /[\0\r\n]/.test(normalized)) {
    throw new Civ7DirectControlError(
      "setup-parameter-invalid",
      `${label} must be a non-empty single-line mod id`
    );
  }
  return normalized.replace(/^\{|\}$/g, "");
}

export function normalizeSavedGameConfigurationRef(
  input: Civ7SavedGameConfigurationRef
): Civ7SavedGameConfigurationRef {
  const fileName = validateSavedConfigFileName(input.fileName);
  const displayName = input.displayName.trim() || basename(fileName, extname(fileName));
  const path = input.path.trim();
  if (!path || /[\0\r\n]/.test(path)) {
    throw new Civ7DirectControlError(
      "setup-parameter-invalid",
      "saved configuration path must be a non-empty single-line string"
    );
  }
  return {
    id: input.id.trim() || basename(fileName, extname(fileName)),
    displayName,
    fileName,
    path,
  };
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
    throw new Civ7DirectControlError(
      "setup-parameter-invalid",
      "saved configuration fileName must be a Civ7Cfg file name"
    );
  }
  return value;
}

async function readCiv7SavedGameConfiguration(path: string): Promise<Civ7SavedGameConfiguration> {
  const [info, bytes] = await Promise.all([stat(path), readFile(path)]);
  if (bytes.subarray(0, 4).toString("ascii") !== "CIV7") {
    throw new Civ7DirectControlError(
      "command-failed",
      `Saved configuration is not a Civ7 file: ${path}`
    );
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
    id:
      displayName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || fileName,
    displayName,
    fileName,
    path,
    sizeBytes: info.size,
    modifiedAt: info.mtime.toISOString(),
    source: "local-disk",
    summary,
    setupOptions,
    playerOptions:
      Object.keys(playerSetupOptions).length > 0
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

function firstToken(
  strings: ReadonlyArray<string>,
  test: (value: string) => boolean
): string | undefined {
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

function summarizeCiv7CfgStrings(
  strings: ReadonlyArray<string>
): Civ7SavedGameConfigurationSummary {
  const mapSeedIndex = strings.findIndex((value) => /^\d{6,10}$/.test(value));
  const mapSeed = mapSeedIndex >= 0 ? firstNumericSeed(strings, mapSeedIndex) : undefined;
  const gameSeed = mapSeedIndex >= 0 ? firstNumericSeed(strings, mapSeedIndex + 1) : undefined;
  const civilization = firstToken(
    strings,
    (value) =>
      /^CIVILIZATION_[A-Z0-9_]+$/.test(value) &&
      !value.startsWith("CIVILIZATION_LEVEL_") &&
      value !== "CIVILIZATION_INDEPENDENT" &&
      value !== "CIVILIZATION_NONE"
  );
  const leader = firstToken(
    strings,
    (value) =>
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

function isNodeNotFound(err: unknown): boolean {
  return (
    err !== null &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code?: unknown }).code === "ENOENT"
  );
}

function validateSetupSeed(value: unknown, label: string): number {
  const seed = assessCiv7SignedIntSeed(value);
  if (seed.ok === false) {
    const suffix =
      seed.reason === "not-integer"
        ? "must be an integer"
        : `must be an integer between ${seed.min} and ${seed.max}`;
    throw new Civ7DirectControlError("setup-parameter-invalid", `${label} ${suffix}`);
  }
  return seed.value;
}

export function assertPreparedSetupMatches(
  input: Civ7SinglePlayerSetupInput,
  snapshot: Civ7SetupSnapshot
): void {
  if (snapshot.phase !== "shell") {
    throw new Civ7DirectControlError(
      "setup-phase-refused",
      `Civ7 prepared setup requires shell phase; observed ${snapshot.phase}`,
      { details: snapshot }
    );
  }
  const mapRow = findSetupMapRow(snapshot, input.mapScript);
  if (!mapRow) {
    throw new Civ7DirectControlError(
      "setup-map-row-missing",
      `Civ7 setup map row did not read back for ${input.mapScript}`,
      { details: snapshot.mapRows }
    );
  }
  const script = setupParameterValue(snapshot, "Map");
  const mapSize = setupParameterValue(snapshot, "MapSize");
  const mapSeed = setupParameterValue(snapshot, "MapRandomSeed");
  const gameSeed = setupParameterValue(snapshot, "GameRandomSeed");
  const playerCount = snapshot.config.playerCount.ok
    ? snapshot.config.playerCount.value
    : undefined;
  if (script !== input.mapScript) {
    throw new Civ7DirectControlError(
      "setup-readback-mismatch",
      `Civ7 setup Map readback mismatch: ${String(script)}`,
      {
        details: { expected: input.mapScript, actual: script, snapshot },
      }
    );
  }
  if (mapSize !== input.mapSize) {
    throw new Civ7DirectControlError(
      "setup-readback-mismatch",
      `Civ7 setup MapSize readback mismatch: ${String(mapSize)}`,
      {
        details: { expected: input.mapSize, actual: mapSize, snapshot },
      }
    );
  }
  if (Number(mapSeed) !== input.seed) {
    throw new Civ7DirectControlError(
      "setup-readback-mismatch",
      `Civ7 setup MapRandomSeed readback mismatch: ${String(mapSeed)}`,
      {
        details: { expected: input.seed, actual: mapSeed, snapshot },
      }
    );
  }
  if (input.gameSeed !== undefined && Number(gameSeed) !== input.gameSeed) {
    throw new Civ7DirectControlError(
      "setup-readback-mismatch",
      `Civ7 setup GameRandomSeed readback mismatch: ${String(gameSeed)}`,
      {
        details: { expected: input.gameSeed, actual: gameSeed, snapshot },
      }
    );
  }
  if (input.playerCount !== undefined && playerCount !== input.playerCount) {
    throw new Civ7DirectControlError(
      "setup-readback-mismatch",
      `Civ7 setup player count readback mismatch: ${String(playerCount)}`,
      {
        details: { expected: input.playerCount, actual: playerCount, snapshot },
      }
    );
  }
  assertRuntimeConfigValue(snapshot, "mapScript", input.mapScript);
  assertRuntimeConfigValue(snapshot, "mapSizeType", input.mapSize);
  assertRuntimeConfigValue(snapshot, "mapSeed", input.seed);
  if (input.gameSeed !== undefined) {
    assertRuntimeConfigValue(snapshot, "gameSeed", input.gameSeed);
  }
  if (input.playerCount !== undefined) {
    assertRuntimeConfigValue(snapshot, "playerCount", input.playerCount);
  }
  for (const [key, expected] of Object.entries(input.options ?? {})) {
    const actual = setupParameterValue(snapshot, key);
    if (actual !== expected) {
      throw new Civ7DirectControlError(
        "setup-readback-mismatch",
        `Civ7 setup ${key} readback mismatch: ${String(actual)}`,
        {
          details: { expected, actual, snapshot },
        }
      );
    }
  }
  for (const player of input.playerOptions ?? []) {
    const observedPlayer = snapshot.setup.playerParameters.find(
      (entry) => entry.playerId === player.playerId
    );
    if (observedPlayer?.exists.ok !== true || observedPlayer.exists.value !== true) {
      throw new Civ7DirectControlError(
        "setup-readback-mismatch",
        `Civ7 player ${player.playerId} identity was not observed`,
        { details: { playerId: player.playerId, actual: observedPlayer?.exists, snapshot } }
      );
    }
    for (const [key, expected] of Object.entries(player.options)) {
      const actual = playerSetupParameterValue(snapshot, player.playerId, key);
      if (actual !== expected) {
        throw new Civ7DirectControlError(
          "setup-readback-mismatch",
          `Civ7 player ${player.playerId} setup ${key} readback mismatch: ${String(actual)}`,
          { details: { playerId: player.playerId, expected, actual, snapshot } }
        );
      }
    }
  }
}

type Civ7SetupRuntimeConfigValue = string | number;

function assertRuntimeConfigValue(
  snapshot: Civ7SetupSnapshot,
  key: keyof Civ7SetupSnapshot["config"],
  expected: Civ7SetupRuntimeConfigValue
): void {
  const actual = snapshot.config[key];
  if (!actual.ok || actual.value !== expected) {
    throw new Civ7DirectControlError(
      "setup-readback-mismatch",
      `Civ7 runtime ${key} readback mismatch: ${actual.ok ? String(actual.value) : actual.error}`,
      {
        details: {
          expected,
          actual,
          snapshot,
        },
      }
    );
  }
}

function findSetupParameter(
  snapshot: Civ7SetupSnapshot,
  id: string
): Civ7SetupParameterSnapshot | undefined {
  return snapshot.setup.parameters.find((parameter) => parameter.id === id);
}

function setupParameterValue(
  snapshot: Civ7SetupSnapshot,
  id: string
): Civ7SetupParameterValue | undefined {
  return findSetupParameter(snapshot, id)?.value;
}

function findPlayerSetupParameter(
  snapshot: Civ7SetupSnapshot,
  playerId: number,
  id: string
): Civ7SetupParameterSnapshot | undefined {
  return snapshot.setup.playerParameters
    .find((player) => player.playerId === playerId)
    ?.parameters.find((parameter) => parameter.id === id);
}

function playerSetupParameterValue(
  snapshot: Civ7SetupSnapshot,
  playerId: number,
  id: string
): Civ7SetupParameterValue | undefined {
  return findPlayerSetupParameter(snapshot, playerId, id)?.value;
}

function findSetupMapRow(snapshot: Civ7SetupSnapshot, file: string): Civ7SetupMapRow | undefined {
  return snapshot.mapRows.find((row) => row.file === file);
}

function setupSnapshotResult(
  command: Civ7CommandResult,
  snapshot: Civ7SetupSnapshot
): Civ7SetupSnapshotResult {
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    snapshot,
  };
}

const defaultSetupPrepareDependencies: SetupPrepareDependencies = {
  ...defaultSetupReadDependencies,
  loadSavedGameConfiguration: async () => {
    throw new Civ7DirectControlError(
      "setup-config-load-failed",
      "Saved configuration loading requires caller-provided setup prepare dependencies"
    );
  },
  parseSavedConfigLoadRequest: (result, label) =>
    jsonPayloadFromCommandResult<SavedConfigLoadRequestPayload>(result, label),
  parseSetupPreparation: (result, label) =>
    jsonPayloadFromCommandResult<SetupPreparePayload>(result, label),
  validateIdentifier,
};
