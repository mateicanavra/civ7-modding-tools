export type Civ7StudioSetupOptionValue = string | number | boolean;

export type Civ7StudioPlayerSetupConfig = Readonly<{
  playerId: number;
  options: Readonly<Record<string, Civ7StudioSetupOptionValue>>;
}>;

export type Civ7StudioSavedConfigRef = Readonly<{
  id: string;
  displayName: string;
  fileName: string;
  path: string;
}>;

export type Civ7StudioSetupConfig = Readonly<{
  savedConfig?: Civ7StudioSavedConfigRef;
  mapScript?: string;
  gameOptions: Readonly<Record<string, Civ7StudioSetupOptionValue>>;
  playerOptions: ReadonlyArray<Civ7StudioPlayerSetupConfig>;
}>;

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
  mapRows?: ReadonlyArray<Readonly<{
    file?: unknown;
    value?: unknown;
    name?: unknown;
  }>>;
  setup?: {
    parameters?: ReadonlyArray<Civ7SetupParameterSnapshotLike>;
    playerParameters?: ReadonlyArray<Readonly<{
      playerId?: unknown;
      parameters?: ReadonlyArray<Civ7SetupParameterSnapshotLike>;
    }>>;
    localPlayerId?: {
      ok?: unknown;
      value?: unknown;
    };
  };
}>;

export type Civ7SavedSetupConfigFile = Readonly<Civ7StudioSavedConfigRef & {
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
}>;

export const DEFAULT_CIV7_STUDIO_SETUP_CONFIG: Civ7StudioSetupConfig = {
  gameOptions: {},
  playerOptions: [
    {
      playerId: 0,
      options: {},
    },
  ],
};

export const CIV7_STUDIO_MAIN_GAME_OPTION_IDS = [
  "Difficulty",
  "GameSpeeds",
  "StartPosition",
  "AgeTransitionSetting",
  "DisasterIntensity",
  "IndependentHostility",
  "AgeLength",
  "AgeCountdownTimer",
] as const;

export const CIV7_STUDIO_CUSTOM_DIFFICULTY_OPTION_IDS = [
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
] as const;

export const CIV7_STUDIO_PLAYER_OPTION_IDS = [
  "PlayerLeader",
  "PlayerCivilization",
  "PlayerDifficulty",
] as const;

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

function compactOptions(
  value: unknown,
  allowedIds?: ReadonlySet<string>,
): Record<string, Civ7StudioSetupOptionValue> {
  if (!isRecord(value)) return {};
  const out: Record<string, Civ7StudioSetupOptionValue> = {};
  for (const [key, next] of Object.entries(value)) {
    if (allowedIds && !allowedIds.has(key)) continue;
    if (isSetupOptionValue(next)) out[key] = next;
  }
  return out;
}

function compactPlayerOptions(value: unknown): Civ7StudioPlayerSetupConfig[] {
  if (!Array.isArray(value)) return [...DEFAULT_CIV7_STUDIO_SETUP_CONFIG.playerOptions];
  const players: Civ7StudioPlayerSetupConfig[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const playerId = Number(entry.playerId);
    if (!Number.isInteger(playerId) || playerId < 0 || playerId > 64) continue;
    players.push({
      playerId,
      options: compactOptions(entry.options, PLAYER_OPTION_ID_SET),
    });
  }
  return players.length > 0 ? players : [...DEFAULT_CIV7_STUDIO_SETUP_CONFIG.playerOptions];
}

function compactSavedConfigRef(value: unknown): Civ7StudioSavedConfigRef | undefined {
  if (!isRecord(value)) return undefined;
  if (
    typeof value.id !== "string" ||
    typeof value.displayName !== "string" ||
    typeof value.fileName !== "string" ||
    typeof value.path !== "string" ||
    value.fileName.length === 0 ||
    value.path.length === 0
  ) {
    return undefined;
  }
  return {
    id: value.id,
    displayName: value.displayName,
    fileName: value.fileName,
    path: value.path,
  };
}

export function normalizeStudioSetupConfig(value: unknown): Civ7StudioSetupConfig {
  if (!isRecord(value)) return DEFAULT_CIV7_STUDIO_SETUP_CONFIG;
  const savedConfig = compactSavedConfigRef(value.savedConfig);
  return {
    ...(savedConfig ? { savedConfig } : {}),
    ...(typeof value.mapScript === "string" && value.mapScript.length > 0 ? { mapScript: value.mapScript } : {}),
    gameOptions: compactOptions(value.gameOptions, GAME_OPTION_ID_SET),
    playerOptions: compactPlayerOptions(value.playerOptions),
  };
}

export function studioSetupConfigsEqual(a: Civ7StudioSetupConfig, b: Civ7StudioSetupConfig): boolean {
  return JSON.stringify(normalizeStudioSetupConfig(a)) === JSON.stringify(normalizeStudioSetupConfig(b));
}

export function isDefaultStudioSetupConfig(config: Civ7StudioSetupConfig): boolean {
  return studioSetupConfigsEqual(config, DEFAULT_CIV7_STUDIO_SETUP_CONFIG);
}

function findParameter(
  parameters: ReadonlyArray<Civ7SetupParameterSnapshotLike> | undefined,
  id: string,
): Civ7SetupParameterSnapshotLike | undefined {
  return parameters?.find((parameter) => parameter.id === id && parameter.exists !== false);
}

function parameterValue(
  parameters: ReadonlyArray<Civ7SetupParameterSnapshotLike> | undefined,
  id: string,
): Civ7StudioSetupOptionValue | undefined {
  const value = findParameter(parameters, id)?.value;
  return isSetupOptionValue(value) ? value : undefined;
}

export function studioSetupConfigFromLiveSnapshot(snapshot: Civ7SetupSnapshotLike): Civ7StudioSetupConfig {
  const parameters = snapshot.setup?.parameters ?? [];
  const gameOptions: Record<string, Civ7StudioSetupOptionValue> = {};
  for (const id of GAME_OPTION_ID_SET) {
    const value = parameterValue(parameters, id);
    if (value !== undefined) gameOptions[id] = value;
  }

  const localPlayerId = Number(snapshot.setup?.localPlayerId?.ok === true ? snapshot.setup.localPlayerId.value : 0);
  const selectedPlayer =
    snapshot.setup?.playerParameters?.find((player) => player.playerId === localPlayerId) ??
    snapshot.setup?.playerParameters?.[0];
  const playerId = Number.isInteger(Number(selectedPlayer?.playerId)) ? Number(selectedPlayer?.playerId) : 0;
  const options: Record<string, Civ7StudioSetupOptionValue> = {};
  for (const id of PLAYER_OPTION_ID_SET) {
    const value = parameterValue(selectedPlayer?.parameters, id);
    if (value !== undefined) options[id] = value;
  }

  const selectedMapScript = typeof snapshot.selectedMapRow?.file === "string"
    ? snapshot.selectedMapRow.file
    : typeof snapshot.selectedMapRow?.value === "string"
      ? snapshot.selectedMapRow.value
      : parameterValue(parameters, "Map");

  return {
    ...(typeof selectedMapScript === "string" && selectedMapScript.length > 0 ? { mapScript: selectedMapScript } : {}),
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
  value: Civ7StudioSetupOptionValue | undefined,
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
  playerId = getLocalPlayerSetup(config).playerId,
): Civ7StudioSetupConfig {
  const players = config.playerOptions.length ? [...config.playerOptions] : [...DEFAULT_CIV7_STUDIO_SETUP_CONFIG.playerOptions];
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
  mapScript: string | undefined,
): Civ7StudioSetupConfig {
  return normalizeStudioSetupConfig({
    ...config,
    ...(mapScript && mapScript.length > 0 ? { mapScript } : { mapScript: undefined }),
  });
}

export function studioSetupConfigFromSavedConfigFile(savedConfig: Civ7SavedSetupConfigFile): Civ7StudioSetupConfig {
  return normalizeStudioSetupConfig({
    savedConfig,
    gameOptions: savedConfig.setupOptions,
    playerOptions: savedConfig.playerOptions.length > 0
      ? savedConfig.playerOptions
      : DEFAULT_CIV7_STUDIO_SETUP_CONFIG.playerOptions,
  });
}

export function updateStudioSetupSavedConfig(
  config: Civ7StudioSetupConfig,
  savedConfig: Civ7SavedSetupConfigFile | undefined,
): Civ7StudioSetupConfig {
  if (!savedConfig) return normalizeStudioSetupConfig({ ...config, savedConfig: undefined });
  return normalizeStudioSetupConfig({
    ...config,
    savedConfig,
    gameOptions: {
      ...config.gameOptions,
      ...savedConfig.setupOptions,
    },
    playerOptions: savedConfig.playerOptions.length > 0 ? savedConfig.playerOptions : config.playerOptions,
  });
}

export function labelForCiv7SetupValue(value: unknown): string {
  if (typeof value !== "string") return String(value ?? "");
  const stripped = value
    .replace(/^(?:LOC_|LEADER_|CIVILIZATION_|DIFFICULTY_|GAMESPEED_|MAPSIZE_|AGE_LENGTH_|AGE_COUNTDOWN_LENGTH_|AGE_TRANSITION_SETTING_|REALISM_SETTING_|INDEPENDENT_HOSTILITY_|START_POSITION_)/, "")
    .replace(/_NAME$/, "")
    .replace(/_/g, " ")
    .toLowerCase();
  return stripped.replace(/\b\w/g, (match) => match.toUpperCase());
}

export function optionRowsFromParameter(parameter: Civ7SetupParameterSnapshotLike | undefined): ReadonlyArray<{ value: string; label: string }> {
  const possibleValues = Array.isArray(parameter?.possibleValues) ? parameter.possibleValues : [];
  const rows: Array<{ value: string; label: string }> = [];
  for (const row of possibleValues) {
    const value = isRecord(row)
      ? row.value ?? row.Value ?? row.file ?? row.File
      : row;
    if (typeof value !== "string" || value.length === 0) continue;
    const name = isRecord(row) ? row.name ?? row.Name : undefined;
    rows.push({ value, label: typeof name === "string" && !name.startsWith("LOC_") ? name : labelForCiv7SetupValue(value) });
  }
  return rows;
}
