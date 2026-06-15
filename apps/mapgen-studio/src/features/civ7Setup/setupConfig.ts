import {
  DEFAULT_RUN_IN_GAME_SETUP_CONFIG,
  normalizeRunInGameSetupConfig,
  RUN_IN_GAME_CUSTOM_DIFFICULTY_OPTION_IDS,
  RUN_IN_GAME_MAIN_GAME_OPTION_IDS,
  RUN_IN_GAME_PLAYER_OPTION_IDS,
  type RunInGamePlayerSetupConfig,
  type RunInGameSavedSetupConfigRef,
  type RunInGameSetupConfig,
  type RunInGameSetupOptionValue,
} from "@civ7/studio-server/contract";

export type Civ7StudioSetupOptionValue = RunInGameSetupOptionValue;

export type Civ7StudioPlayerSetupConfig = RunInGamePlayerSetupConfig;

export type Civ7StudioSavedConfigRef = RunInGameSavedSetupConfigRef;

/**
 * The authored game-setup state behind the header's Game bar — the single
 * source for what launches in Civ7. At launch the engine loads
 * `savedConfig` (if any) into Civ7 first and then re-applies EVERY key in
 * `gameOptions`/`playerOptions` on top, so these maps must contain only
 * values the user (or an exact saved-config application) authored: any
 * extra key silently overrides the loaded file (see
 * `studioSetupConfigFromSavedConfigFile` / `studioSetupDriftsFromSavedConfig`).
 */
export type Civ7StudioSetupConfig = RunInGameSetupConfig;

export type Civ7SetupParameterSnapshotLike = Readonly<{
  id?: unknown;
  exists?: unknown;
  value?: unknown;
  possibleValues?: unknown;
}>;

export type Civ7SetupSnapshotLike = Readonly<{
  selectedMapRow?: {
    file?: unknown;
    value?: unknown;
  };
  mapRows?: ReadonlyArray<
    Readonly<{
      file?: unknown;
      value?: unknown;
      name?: unknown;
    }>
  >;
  setup?: {
    parameters?: ReadonlyArray<Civ7SetupParameterSnapshotLike>;
    playerParameters?: ReadonlyArray<
      Readonly<{
        playerId?: unknown;
        parameters?: ReadonlyArray<Civ7SetupParameterSnapshotLike>;
      }>
    >;
    localPlayerId?: {
      ok?: unknown;
      value?: unknown;
    };
  };
}>;

export type Civ7SavedSetupConfigFile = Readonly<
  Civ7StudioSavedConfigRef & {
    sizeBytes: number;
    modifiedAt: string;
    source: "local-disk";
    summary: Readonly<{
      gameSpeed?: string;
      mapSize?: string;
      mapName?: string;
      leader?: string;
      civilization?: string;
      difficulty?: string;
      mapSeed?: number;
      gameSeed?: number;
    }>;
    setupOptions: Readonly<Record<string, Civ7StudioSetupOptionValue>>;
    playerOptions: ReadonlyArray<Civ7StudioPlayerSetupConfig>;
  }
>;

export const DEFAULT_CIV7_STUDIO_SETUP_CONFIG = DEFAULT_RUN_IN_GAME_SETUP_CONFIG;

export const CIV7_STUDIO_MAIN_GAME_OPTION_IDS = RUN_IN_GAME_MAIN_GAME_OPTION_IDS;

export const CIV7_STUDIO_CUSTOM_DIFFICULTY_OPTION_IDS = RUN_IN_GAME_CUSTOM_DIFFICULTY_OPTION_IDS;

export const CIV7_STUDIO_PLAYER_OPTION_IDS = RUN_IN_GAME_PLAYER_OPTION_IDS;

const GAME_OPTION_ID_SET = new Set<string>([
  ...CIV7_STUDIO_MAIN_GAME_OPTION_IDS,
  ...CIV7_STUDIO_CUSTOM_DIFFICULTY_OPTION_IDS,
]);

const PLAYER_OPTION_ID_SET = new Set<string>(CIV7_STUDIO_PLAYER_OPTION_IDS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSetupOptionValue(value: unknown): value is Civ7StudioSetupOptionValue {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

export function normalizeStudioSetupConfig(value: unknown): Civ7StudioSetupConfig {
  return normalizeRunInGameSetupConfig(value);
}

export function studioSetupConfigsEqual(
  a: Civ7StudioSetupConfig,
  b: Civ7StudioSetupConfig
): boolean {
  return (
    JSON.stringify(normalizeStudioSetupConfig(a)) === JSON.stringify(normalizeStudioSetupConfig(b))
  );
}

export function isDefaultStudioSetupConfig(config: Civ7StudioSetupConfig): boolean {
  return studioSetupConfigsEqual(config, DEFAULT_CIV7_STUDIO_SETUP_CONFIG);
}

function findParameter(
  parameters: ReadonlyArray<Civ7SetupParameterSnapshotLike> | undefined,
  id: string
): Civ7SetupParameterSnapshotLike | undefined {
  return parameters?.find((parameter) => parameter.id === id && parameter.exists !== false);
}

function parameterValue(
  parameters: ReadonlyArray<Civ7SetupParameterSnapshotLike> | undefined,
  id: string
): Civ7StudioSetupOptionValue | undefined {
  const value = findParameter(parameters, id)?.value;
  return isSetupOptionValue(value) ? value : undefined;
}

export function studioSetupConfigFromLiveSnapshot(
  snapshot: Civ7SetupSnapshotLike
): Civ7StudioSetupConfig {
  const parameters = snapshot.setup?.parameters ?? [];
  const gameOptions: Record<string, Civ7StudioSetupOptionValue> = {};
  for (const id of GAME_OPTION_ID_SET) {
    const value = parameterValue(parameters, id);
    if (value !== undefined) gameOptions[id] = value;
  }

  const localPlayerId = Number(
    snapshot.setup?.localPlayerId?.ok === true ? snapshot.setup.localPlayerId.value : 0
  );
  const selectedPlayer =
    snapshot.setup?.playerParameters?.find((player) => player.playerId === localPlayerId) ??
    snapshot.setup?.playerParameters?.[0];
  const playerId = Number.isInteger(Number(selectedPlayer?.playerId))
    ? Number(selectedPlayer?.playerId)
    : 0;
  const options: Record<string, Civ7StudioSetupOptionValue> = {};
  for (const id of PLAYER_OPTION_ID_SET) {
    const value = parameterValue(selectedPlayer?.parameters, id);
    if (value !== undefined) options[id] = value;
  }

  const selectedMapScript =
    typeof snapshot.selectedMapRow?.file === "string"
      ? snapshot.selectedMapRow.file
      : typeof snapshot.selectedMapRow?.value === "string"
        ? snapshot.selectedMapRow.value
        : parameterValue(parameters, "Map");

  return {
    ...(typeof selectedMapScript === "string" && selectedMapScript.length > 0
      ? { mapScript: selectedMapScript }
      : {}),
    gameOptions,
    playerOptions: [{ playerId, options }],
  };
}

export function getLocalPlayerSetup(config: Civ7StudioSetupConfig): Civ7StudioPlayerSetupConfig {
  return config.playerOptions[0] ?? DEFAULT_CIV7_STUDIO_SETUP_CONFIG.playerOptions[0]!;
}

export function updateStudioSetupGameOption(
  config: Civ7StudioSetupConfig,
  id: string,
  value: Civ7StudioSetupOptionValue | undefined
): Civ7StudioSetupConfig {
  const nextOptions = { ...config.gameOptions };
  if (value === undefined) delete nextOptions[id];
  else nextOptions[id] = value;
  return normalizeStudioSetupConfig({ ...config, gameOptions: nextOptions });
}

export function updateStudioSetupPlayerOption(
  config: Civ7StudioSetupConfig,
  id: string,
  value: Civ7StudioSetupOptionValue | undefined,
  playerId = getLocalPlayerSetup(config).playerId
): Civ7StudioSetupConfig {
  const players = config.playerOptions.length
    ? [...config.playerOptions]
    : [...DEFAULT_CIV7_STUDIO_SETUP_CONFIG.playerOptions];
  const index = players.findIndex((player) => player.playerId === playerId);
  const current = index >= 0 ? players[index]! : { playerId, options: {} };
  const options = { ...current.options };
  if (value === undefined) delete options[id];
  else options[id] = value;
  const next = { playerId, options };
  if (index >= 0) players[index] = next;
  else players.push(next);
  return normalizeStudioSetupConfig({ ...config, playerOptions: players });
}

export function updateStudioSetupMapScript(
  config: Civ7StudioSetupConfig,
  mapScript: string | undefined
): Civ7StudioSetupConfig {
  return normalizeStudioSetupConfig({
    ...config,
    ...(mapScript && mapScript.length > 0 ? { mapScript } : { mapScript: undefined }),
  });
}

/**
 * Selecting a saved config applies the file EXACTLY (config-precedence rule).
 *
 * Why full replacement: at launch the engine loads the saved configuration
 * file into Civ7 first and then re-applies EVERY studio game/player option on
 * top of it (`prepareCiv7SinglePlayerSetup` in @civ7/direct-control), so any
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
  return normalizeStudioSetupConfig({
    savedConfig,
    gameOptions: savedConfig.setupOptions,
    playerOptions:
      savedConfig.playerOptions.length > 0
        ? savedConfig.playerOptions
        : DEFAULT_CIV7_STUDIO_SETUP_CONFIG.playerOptions,
  });
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
  parameter: Civ7SetupParameterSnapshotLike | undefined
): ReadonlyArray<{ value: string; label: string }> {
  const possibleValues = Array.isArray(parameter?.possibleValues) ? parameter.possibleValues : [];
  const rows: Array<{ value: string; label: string }> = [];
  for (const row of possibleValues) {
    const value = isRecord(row) ? (row.value ?? row.Value ?? row.file ?? row.File) : row;
    if (typeof value !== "string" || value.length === 0) continue;
    const name = isRecord(row) ? (row.name ?? row.Name) : undefined;
    rows.push({
      value,
      label:
        typeof name === "string" && !name.startsWith("LOC_") ? name : labelForCiv7SetupValue(value),
    });
  }
  return rows;
}
