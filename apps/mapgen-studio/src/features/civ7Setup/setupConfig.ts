import { type Civ7StandardMapSizeId, findCiv7StandardMapSizePreset } from "@civ7/adapter";
import {
  CIV7_GAME_OPTION_IDS,
  CIV7_MAP_OPTION_IDS,
  CIV7_PLAYER_OPTION_IDS,
  type Civ7GameOptions,
  type Civ7PlayerOptions,
} from "@civ7/map-policy/setup";
import {
  type Civ7SavedSetupConfiguration,
  type Civ7SetupParameter,
  type Civ7SetupSnapshot,
  createDefaultRunInGameSetupConfig,
  normalizeRunInGameSetupConfig,
  type RunInGamePlayerSetupConfig,
  type RunInGameSavedSetupConfigRef,
  type RunInGameSetupConfig,
  type RunInGameSetupOptionValue,
  validateRunInGameSetupConfig,
} from "@civ7/studio-contract";
import { parseCiv7StudioSeed } from "./seedPolicy";

type Civ7StudioSetupOptionValue = RunInGameSetupOptionValue;

export type Civ7StudioPlayerSetupConfig = RunInGamePlayerSetupConfig;

type Civ7StudioSavedConfigRef = RunInGameSavedSetupConfigRef;

/**
 * The authored game-setup state behind the header's Game bar — the single
 * source for what launches in Civ7. At launch the engine loads
 * `savedConfig` (if any) into Civ7 first and then re-applies EVERY key in
 * `gameOptions`/`mapOptions`/`playerOptions` on top, so these maps must contain only
 * values the user (or an exact saved-config application) authored: any
 * extra key silently overrides the loaded file (see
 * `studioSetupConfigFromSavedConfigFile` / `studioSetupDriftsFromSavedConfig`).
 */
export type Civ7StudioSetupConfig = RunInGameSetupConfig;

/** One filesystem-backed Civ7Cfg projected into the same grouped setup model used at launch. */
export type Civ7SavedSetupConfigFile = Civ7SavedSetupConfiguration;

export function createDefaultCiv7StudioSetupConfig(): Civ7StudioSetupConfig {
  return createDefaultRunInGameSetupConfig();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSetupOptionValue(value: unknown): value is Civ7StudioSetupOptionValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    (Array.isArray(value) && value.every((entry) => typeof entry === "string"))
  );
}

/** Normalizes trusted Studio-local state to one immutable grouped launch setup. */
export function normalizeStudioSetupConfig(value: unknown): Civ7StudioSetupConfig {
  return normalizeRunInGameSetupConfig(value);
}

/** Migrates one exact former combined option map by partitioning official setup identities. */
export function migrateLegacyStudioSetupConfig(value: unknown): Civ7StudioSetupConfig | undefined {
  if (
    !isRecord(value) ||
    !Object.keys(value).every((key) =>
      ["savedConfig", "mapScript", "gameOptions", "playerOptions"].includes(key)
    ) ||
    !isRecord(value.gameOptions) ||
    !Array.isArray(value.playerOptions)
  )
    return undefined;
  const combined = isRecord(value.gameOptions) ? value.gameOptions : {};
  const admittedOptionIds = new Set<string>([...CIV7_GAME_OPTION_IDS, ...CIV7_MAP_OPTION_IDS]);
  if (
    Object.entries(combined).some(
      ([id, option]) => !admittedOptionIds.has(id) || !isSetupOptionValue(option)
    )
  )
    return undefined;
  const gameOptions: Record<string, Civ7StudioSetupOptionValue> = {};
  const mapOptions: Record<string, Civ7StudioSetupOptionValue> = {};
  for (const id of CIV7_GAME_OPTION_IDS) {
    const option = combined[id];
    if (isSetupOptionValue(option)) gameOptions[id] = Array.isArray(option) ? [...option] : option;
  }
  for (const id of CIV7_MAP_OPTION_IDS) {
    const option = combined[id];
    if (isSetupOptionValue(option)) mapOptions[id] = Array.isArray(option) ? [...option] : option;
  }
  const migrated = validateRunInGameSetupConfig({
    ...value,
    gameOptions,
    mapOptions,
  });
  return migrated.ok ? migrated.value : undefined;
}

function studioSetupConfigsEqual(a: Civ7StudioSetupConfig, b: Civ7StudioSetupConfig): boolean {
  return (
    JSON.stringify(normalizeStudioSetupConfig(a)) === JSON.stringify(normalizeStudioSetupConfig(b))
  );
}

function findParameter(
  parameters: ReadonlyArray<Civ7SetupParameter> | undefined,
  id: string
): Civ7SetupParameter | undefined {
  return parameters?.find(
    (parameter) => parameter.id === id && isAuthorableCiv7SetupParameter(parameter)
  );
}

function parameterValue(
  parameters: ReadonlyArray<Civ7SetupParameter> | undefined,
  id: string
): Civ7StudioSetupOptionValue | undefined {
  const value = findParameter(parameters, id)?.value;
  return isSetupOptionValue(value) ? (Array.isArray(value) ? [...value] : value) : undefined;
}

function projectOptionGroup(
  parameters: ReadonlyArray<Civ7SetupParameter>,
  ids: readonly string[]
): Record<string, Civ7StudioSetupOptionValue> {
  const options: Record<string, Civ7StudioSetupOptionValue> = {};
  for (const id of ids) {
    const value = parameterValue(parameters, id);
    if (value !== undefined) options[id] = value;
  }
  return options;
}

function hasNoSetupRefusal(evidence: {
  destroyed?: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  invalidReason?: string | number | null;
}): boolean {
  const { invalidReason } = evidence;
  return (
    evidence.destroyed !== true &&
    evidence.hidden !== true &&
    evidence.readOnly !== true &&
    (invalidReason === undefined ||
      invalidReason === null ||
      invalidReason === 0 ||
      invalidReason === "")
  );
}

/** True only when live GameSetup evidence permits Studio to author the parameter. */
export function isAuthorableCiv7SetupParameter(parameter: Civ7SetupParameter): boolean {
  return parameter.exists === true && hasNoSetupRefusal(parameter);
}

function admitStudioSetupUpdate(value: unknown, label: string): Civ7StudioSetupConfig {
  const admitted = validateRunInGameSetupConfig(value);
  if (!admitted.ok) throw new TypeError(`${label}: ${admitted.message}`);
  return admitted.value;
}

/** Projects every observed official live setup field into its owned launch group. */
export function studioSetupConfigFromLiveSnapshot(
  snapshot: Civ7SetupSnapshot
): Civ7StudioSetupConfig {
  const parameters = snapshot.parameters;
  const gameOptions = projectOptionGroup(parameters, CIV7_GAME_OPTION_IDS);
  const mapOptions = projectOptionGroup(parameters, CIV7_MAP_OPTION_IDS);
  const playerOptions = snapshot.players.map(({ playerId, parameters: playerParameters }) => ({
    playerId,
    options: projectOptionGroup(playerParameters, CIV7_PLAYER_OPTION_IDS),
  }));

  const selectedMapScript =
    typeof snapshot.selectedMap?.file === "string"
      ? snapshot.selectedMap.file
      : typeof snapshot.selectedMap?.value === "string"
        ? snapshot.selectedMap.value
        : parameterValue(parameters, "Map");

  return admitStudioSetupUpdate(
    {
      ...(typeof selectedMapScript === "string" && selectedMapScript.length > 0
        ? { mapScript: selectedMapScript }
        : {}),
      gameOptions,
      mapOptions,
      playerOptions,
    },
    "Live Civ7 setup snapshot is invalid"
  );
}

export function getLocalPlayerSetup(config: Civ7StudioSetupConfig): Civ7StudioPlayerSetupConfig {
  return config.playerOptions[0] ?? createDefaultCiv7StudioSetupConfig().playerOptions[0]!;
}

/**
 * Updates one official game-option key while preserving every neighboring setup field.
 * An undefined value removes the override so Civ7 may retain its loaded value; the complete
 * grouped setup is re-admitted before it returns.
 */
export function updateStudioSetupGameOption<Key extends keyof Civ7GameOptions>(
  config: Civ7StudioSetupConfig,
  id: Key,
  value: Civ7GameOptions[Key] | undefined
): Civ7StudioSetupConfig {
  const nextOptions = { ...config.gameOptions };
  if (value === undefined) delete nextOptions[id];
  else nextOptions[id] = value;
  return admitStudioSetupUpdate(
    { ...config, gameOptions: nextOptions },
    `Civ7 game option ${String(id)} is invalid`
  );
}

/**
 * Updates one official option for an exact Civ7 player slot without disturbing neighboring state.
 * The optional player identity defaults to Studio's local authored slot; an absent slot is created,
 * an undefined value removes its override, and the complete grouped setup is re-admitted.
 */
export function updateStudioSetupPlayerOption<Key extends keyof Civ7PlayerOptions>(
  config: Civ7StudioSetupConfig,
  id: Key,
  value: Civ7PlayerOptions[Key] | undefined,
  playerId = getLocalPlayerSetup(config).playerId
): Civ7StudioSetupConfig {
  const players = config.playerOptions.length
    ? [...config.playerOptions]
    : [...createDefaultCiv7StudioSetupConfig().playerOptions];
  const index = players.findIndex((player) => player.playerId === playerId);
  const current = index >= 0 ? players[index]! : { playerId, options: {} };
  const options = { ...current.options };
  if (value === undefined) delete options[id];
  else options[id] = value;
  const next = { playerId, options };
  if (index >= 0) players[index] = next;
  else players.push(next);
  return admitStudioSetupUpdate(
    { ...config, playerOptions: players },
    `Civ7 player option ${String(id)} is invalid`
  );
}

export function updateStudioSetupMapScript(
  config: Civ7StudioSetupConfig,
  mapScript: string | undefined
): Civ7StudioSetupConfig {
  const { mapScript: _currentMapScript, ...neighboringState } = config;
  return admitStudioSetupUpdate(
    {
      ...neighboringState,
      ...(mapScript === undefined ? {} : { mapScript }),
    },
    "Civ7 map script is invalid"
  );
}

/**
 * Selecting a saved config applies the file EXACTLY (config-precedence rule).
 *
 * Why full replacement: at launch the engine loads the saved configuration
 * file into Civ7 first and then re-applies EVERY studio game/player option on
 * top of it (`lifecycle.singlePlayer.start` in @civ7/control-orpc), so any
 * studio key the file does not specify would silently override the loaded
 * file. The only state in which "the selected config is what launches" holds
 * is studio state that equals the file-derived state — stale keys from
 * earlier sessions, live syncs, or dropdown edits are deliberately wiped
 * here. Anything the user changes afterwards flips the selector to "Custom"
 * (see `studioSetupDriftsFromSavedConfig`).
 */
export function studioSetupConfigFromSavedConfigFile(
  savedConfig: Civ7SavedSetupConfigFile
): Civ7StudioSetupConfig {
  const savedConfigRef = {
    id: savedConfig.id,
    displayName: savedConfig.displayName,
    fileName: savedConfig.fileName,
  } satisfies Civ7StudioSavedConfigRef;

  const admitted = validateRunInGameSetupConfig({
    savedConfig: savedConfigRef,
    gameOptions: savedConfig.gameOptions,
    mapOptions: savedConfig.mapOptions,
    playerOptions: savedConfig.playerOptions,
  });
  if (!admitted.ok) {
    throw new TypeError(`Saved Civ7 setup configuration is invalid: ${admitted.message}`);
  }
  return admitted.value;
}

/**
 * Deselect the saved config while keeping the current options as free-form
 * custom setup state. Clearing the ref is not a reset — it only stops
 * claiming that a file governs the next launch.
 */
export function clearStudioSetupSavedConfig(config: Civ7StudioSetupConfig): Civ7StudioSetupConfig {
  return normalizeStudioSetupConfig({ ...config, savedConfig: undefined });
}

/**
 * Drift detection for the saved-config selector (config-precedence rule):
 * the studio launches the selected saved config exactly when the authored
 * setup state equals the file-derived state
 * (`studioSetupConfigFromSavedConfigFile`). ANY difference — a dropdown
 * edit, a live sync, or a stray key rehydrated from persistence — means the
 * launch would not be the file, so the selector must show "Custom".
 * Re-selecting the config (re-apply) is always the way back to clean.
 */
export function studioSetupDriftsFromSavedConfig(
  config: Civ7StudioSetupConfig,
  savedConfig: Civ7SavedSetupConfigFile
): boolean {
  return !studioSetupConfigsEqual(config, studioSetupConfigFromSavedConfigFile(savedConfig));
}

/**
 * Proves that a selected saved file governs the complete next launch.
 *
 * Setup equality alone is insufficient because Civ7 persists map and game seeds beside the
 * option maps. Every seed must be valid and the currently authored pair must exactly match the
 * saved summary pair; missing or malformed summary evidence therefore fails closed to Custom.
 */
export function studioLaunchMatchesSavedConfig(args: {
  setupConfig: Civ7StudioSetupConfig;
  seed: unknown;
  gameSeed: unknown;
  mapSize: unknown;
  playerCount: unknown;
  savedConfig: Civ7SavedSetupConfigFile;
}): boolean {
  if (studioSetupDriftsFromSavedConfig(args.setupConfig, args.savedConfig)) return false;
  const seed = parseCiv7StudioSeed(args.seed);
  const gameSeed = parseCiv7StudioSeed(args.gameSeed);
  const savedMapSeed = parseCiv7StudioSeed(args.savedConfig.summary.mapSeed);
  const savedGameSeed = parseCiv7StudioSeed(args.savedConfig.summary.gameSeed);
  const savedWorldSettings = studioSavedWorldSettingsFromConfigFile(args.savedConfig);
  return (
    seed.ok &&
    gameSeed.ok &&
    savedMapSeed.ok &&
    savedGameSeed.ok &&
    savedWorldSettings.mapSize !== undefined &&
    savedWorldSettings.playerCount !== undefined &&
    seed.value === savedMapSeed.value &&
    gameSeed.value === savedGameSeed.value &&
    args.mapSize === savedWorldSettings.mapSize &&
    args.playerCount === savedWorldSettings.playerCount
  );
}

/**
 * Projects only world-setting identities that a saved Civ7 file proves exactly.
 * Missing or unknown evidence stays absent so Studio cannot present a partially interpreted file
 * as governing the complete launch.
 */
export function studioSavedWorldSettingsFromConfigFile(
  savedConfig: Civ7SavedSetupConfigFile
): Readonly<{ mapSize?: Civ7StandardMapSizeId; playerCount?: number }> {
  const mapSize =
    typeof savedConfig.summary.mapSize === "string"
      ? (findCiv7StandardMapSizePreset(savedConfig.summary.mapSize)?.id ?? undefined)
      : undefined;
  const playerCount = savedConfig.summary.playerCount;
  return {
    ...(mapSize === undefined ? {} : { mapSize }),
    ...(Number.isInteger(playerCount) &&
    playerCount !== undefined &&
    playerCount >= 1 &&
    playerCount <= 64
      ? { playerCount }
      : {}),
  };
}

export function labelForCiv7SetupValue(value: unknown): string {
  if (typeof value !== "string") return String(value ?? "");
  const stripped = value
    .replace(
      /^(?:LOC_|LEADER_|CIVILIZATION_|DIFFICULTY_|GAMESPEED_|MAPSIZE_|AGE_LENGTH_|AGE_COUNTDOWN_LENGTH_|AGE_TRANSITION_SETTING_|REALISM_SETTING_|INDEPENDENT_HOSTILITY_|START_POSITION_)/,
      ""
    )
    .replace(/_NAME$/, "")
    .replace(/_/g, " ")
    .toLowerCase();
  return stripped.replace(/\b\w/g, (match) => match.toUpperCase());
}

export function optionRowsFromParameter(
  parameter: Civ7SetupParameter | undefined
): ReadonlyArray<{ value: string; label: string }> {
  if (!parameter || !isAuthorableCiv7SetupParameter(parameter)) return [];
  const possibleValues = parameter.possibleValues ?? [];
  const rows: Array<{ value: string; label: string }> = [];
  for (const row of possibleValues) {
    if (!hasNoSetupRefusal(row)) continue;
    const value = row.value;
    if (typeof value !== "string" || value.length === 0) continue;
    rows.push({
      value,
      label: labelForCiv7SetupValue(value),
    });
  }
  return rows;
}
