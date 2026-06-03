import { readdir, readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, extname, join, resolve } from "node:path";
import { Civ7DirectControlError } from "../direct-control-error.js";
import { assessCiv7SignedIntSeed } from "../policy/setup.js";
import { jsonPayloadFromCommandResult } from "../session/command-result.js";
import { validateIdentifier } from "../validation.js";
import {
  buildSetupSnapshotCommand,
  defaultSetupReadDependencies,
  setupSnapshotScriptSource,
  validateMapScript,
  type Civ7SetupMapRow,
  type Civ7SetupParameterSnapshot,
  type Civ7SetupParameterValue,
  type Civ7SetupSnapshot,
  type Civ7SetupSnapshotResult,
  type SetupReadDependencies,
} from "./reads.js";

import type { Civ7ActionApproval } from "../action-approval.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../session/types.js";

export type Civ7SetupOptionValue = string | number | boolean;

export const DEFAULT_CIV7_SINGLE_PLAYER_SAVE_DIR = join(
  homedir(),
  "Library",
  "Application Support",
  "Civilization VII",
  "Saves",
  "Single",
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

type SetupPreparePayload = Readonly<{
  before: Civ7SetupSnapshot;
  after: Civ7SetupSnapshot;
  applied: Record<string, Civ7SetupOptionValue>;
}>;

type SetupPrepareDependencies = SetupReadDependencies & Readonly<{
  loadSavedGameConfiguration: (
    input: Civ7SavedGameConfigurationRef,
    options?: Civ7DirectControlOptions,
    wait?: Readonly<{ waitTimeoutMs?: number; pollIntervalMs?: number }>,
  ) => Promise<Civ7SavedGameConfigurationLoadResult>;
  parseSetupPreparation: (result: Civ7CommandResult, label: string) => SetupPreparePayload;
  validateIdentifier: (value: string, label: string) => string;
}>;

export async function prepareCiv7SinglePlayerSetup(
  input: Civ7SinglePlayerSetupInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
  dependencies: SetupPrepareDependencies = defaultSetupPrepareDependencies,
): Promise<Civ7PreparedSetupResult> {
  dependencies.assertApproved(approval, "preparing a Civ7 single-player setup");
  const normalized = normalizeSinglePlayerSetupInput(input, dependencies);
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
      { details: savedConfigLoad },
    );
  }
  const before = await dependencies.parseSetupSnapshot(
    await dependencies.executeAppUiCommand({
      ...options,
      command: buildSetupSnapshotCommand(dependencies),
    }),
    "Civ7 setup snapshot",
  );
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

  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: buildPrepareSinglePlayerSetupCommand(normalized, dependencies),
  });
  const payload = dependencies.parseSetupPreparation(command, "Civ7 setup preparation");
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

export async function listCiv7SavedGameConfigurations(
  input: Civ7SavedGameConfigurationListInput = {},
  dependencies: Pick<SetupPrepareDependencies, "boundedInteger">,
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
  configurations.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt) || a.displayName.localeCompare(b.displayName));
  return { directory, configurations };
}

export function buildPrepareSinglePlayerSetupCommand(
  input: Civ7SinglePlayerSetupInput,
  dependencies: SetupReadDependencies,
): string {
  return `(() => {
    ${setupSnapshotScriptSource(dependencies)}
    const input = ${dependencies.jsLiteral(input)};
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

export function normalizeSinglePlayerSetupInput(
  input: Civ7SinglePlayerSetupInput,
  dependencies: Pick<SetupPrepareDependencies, "boundedInteger" | "validateIdentifier">,
): Civ7SinglePlayerSetupInput {
  validateMapScript(input.mapScript);
  if (!/^MAPSIZE_[A-Z0-9_]+$/.test(input.mapSize)) {
    throw new Civ7DirectControlError("setup-parameter-invalid", "mapSize must be a Civ7 MAPSIZE_* value");
  }
  const seed = validateSetupSeed(input.seed, "seed");
  const gameSeed = input.gameSeed !== undefined
    ? validateSetupSeed(input.gameSeed, "gameSeed")
    : undefined;
  const playerCount = input.playerCount !== undefined
    ? dependencies.boundedInteger(input.playerCount, 1, 64, "playerCount")
    : undefined;
  const options: Record<string, Civ7SetupOptionValue> = {};
  for (const [key, value] of Object.entries(input.options ?? {})) {
    dependencies.validateIdentifier(key, "setup option id");
    if (!["string", "number", "boolean"].includes(typeof value)) {
      throw new Civ7DirectControlError("setup-parameter-invalid", `Unsupported setup option value for ${key}`);
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
    seed,
    ...(gameSeed !== undefined ? { gameSeed } : {}),
    ...(playerCount !== undefined ? { playerCount } : {}),
    ...(input.savedConfig ? { savedConfig: normalizeSavedGameConfigurationRef(input.savedConfig) } : {}),
    options,
    playerOptions,
  };
}

export function normalizeSavedGameConfigurationRef(
  input: Civ7SavedGameConfigurationRef,
): Civ7SavedGameConfigurationRef {
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
    const suffix = seed.reason === "not-integer"
      ? "must be an integer"
      : `must be an integer between ${seed.min} and ${seed.max}`;
    throw new Civ7DirectControlError("setup-parameter-invalid", `${label} ${suffix}`);
  }
  return seed.value;
}

export function assertPreparedSetupMatches(input: Civ7SinglePlayerSetupInput, snapshot: Civ7SetupSnapshot): void {
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

function findSetupParameter(snapshot: Civ7SetupSnapshot, id: string): Civ7SetupParameterSnapshot | undefined {
  return snapshot.setup.parameters.find((parameter) => parameter.id === id);
}

function setupParameterValue(snapshot: Civ7SetupSnapshot, id: string): Civ7SetupParameterValue | undefined {
  return findSetupParameter(snapshot, id)?.value;
}

function findPlayerSetupParameter(
  snapshot: Civ7SetupSnapshot,
  playerId: number,
  id: string,
): Civ7SetupParameterSnapshot | undefined {
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

const defaultSetupPrepareDependencies: SetupPrepareDependencies = {
  ...defaultSetupReadDependencies,
  loadSavedGameConfiguration: async () => {
    throw new Civ7DirectControlError(
      "setup-config-load-failed",
      "Saved configuration loading requires caller-provided setup prepare dependencies",
    );
  },
  parseSetupPreparation: (result, label) =>
    jsonPayloadFromCommandResult<SetupPreparePayload>(result, label),
  validateIdentifier,
};
