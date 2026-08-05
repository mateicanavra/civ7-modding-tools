import { Civ7DirectControlError } from "../direct-control-error.js";
import type { Civ7AppUiSnapshot } from "../runtime/app-ui-snapshot.js";
import { jsLiteral } from "../runtime/command-serialization.js";
import { canonicalMapSizeTypeScriptSource } from "../runtime/map-size-type-source.js";
import type { Civ7RuntimeProbe } from "../runtime/probe.js";
import { probeHelperSource } from "../runtime/probe.js";
import { jsonPayloadFromCommandResult } from "../session/command-result.js";
import { executeCiv7AppUiCommand } from "../session/execute.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../session/types.js";
import { boundedInteger } from "../validation.js";
import {
  CIV7_EXIT_TO_MAIN_MENU_COMMAND,
  CIV7_RELOAD_UI_COMMAND,
  DEFAULT_CIV7_PLAYER_SETUP_PARAMETER_IDS,
  DEFAULT_CIV7_SETUP_PARAMETER_IDS,
} from "./constants.js";

export type Civ7SetupPhase = "shell" | "running-game" | "loading" | "begin-ready" | "unavailable";

/** One scalar value exposed by Civ7 GameSetup metadata. */
export type Civ7SetupScalarParameterValue = string | number | boolean | null;

/** One setup value as represented by GameSetup after scalar or array projection. */
export type Civ7SetupParameterValue = Civ7SetupScalarParameterValue | ReadonlyArray<string>;

/** Bounded live-domain evidence used to admit a requested setup value. */
export type Civ7SetupParameterPossibleValue = Readonly<{
  value: Civ7SetupScalarParameterValue;
  destroyed?: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  invalidReason?: number | string | null;
}>;

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
  array?: boolean;
  destroyed?: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  invalidReason?: number | string | null;
  value?: Civ7SetupParameterValue;
  rawValue?: unknown;
  possibleValues?: ReadonlyArray<Civ7SetupParameterPossibleValue>;
}>;

export type Civ7PlayerSetupParameterSnapshot = Readonly<{
  playerId: number;
  exists: Civ7RuntimeProbe<boolean>;
  active: Civ7RuntimeProbe<boolean>;
  slotStatus: Civ7RuntimeProbe<string | number | null>;
  parameters: ReadonlyArray<Civ7SetupParameterSnapshot>;
}>;

export type Civ7SetupSnapshot = Readonly<{
  phase: Civ7SetupPhase;
  ui: Pick<
    Civ7AppUiSnapshot["ui"],
    "inGame" | "inShell" | "inLoading" | "loadingState" | "loadingStateName" | "canBeginGame"
  >;
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
    mapSize: Civ7RuntimeProbe<string | number>;
    mapSizeType: Civ7RuntimeProbe<string>;
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

export type Civ7SetupUiReloadResult = Readonly<{
  command: Civ7CommandResult;
  snapshot: Civ7SetupSnapshot;
  reloaded: boolean;
}>;

export type Civ7SetupShellAdmissionPolicy = "reject" | "exit-active-game";

export type Civ7SetupShellAdmissionResult =
  | Readonly<{
      initial: Civ7SetupSnapshotResult;
      transition: "shell";
    }>
  | Readonly<{
      initial: Civ7SetupSnapshotResult;
      transition: "exit-sent";
      shellExit: Civ7CommandResult;
    }>;

type Civ7SetupShellAdmissionPayload = Readonly<{
  initial: Civ7SetupSnapshot;
  transition: "shell" | "exit-sent" | "refused";
}>;

type Civ7SetupShellReloadPayload = Readonly<{
  snapshot: Civ7SetupSnapshot;
  reloaded: boolean;
}>;

export type SetupReadDependencies = Readonly<{
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>
  ) => Promise<Civ7CommandResult>;
  exitToMainMenuCommand: string;
  jsLiteral: (value: unknown) => string;
  parseSetupMapRows: (result: Civ7CommandResult, label: string) => Civ7SetupMapRowsResult;
  parseSetupSnapshot: (result: Civ7CommandResult, label: string) => Civ7SetupSnapshotResult;
  probeHelperSource: () => string;
  playerSetupParameterIds: readonly string[];
  reloadUiCommand: string;
  setupParameterIds: readonly string[];
}>;

export type Civ7SetupSnapshotSelection = Readonly<{
  setupParameterIds: readonly string[];
  playerSetupParameterIds: readonly string[];
  playerIds: readonly number[];
}>;

/** Reads setup phase and revision without traversing parameter catalogs or player slots. */
export const CIV7_SETUP_PHASE_SNAPSHOT_SELECTION: Civ7SetupSnapshotSelection = Object.freeze({
  setupParameterIds: Object.freeze([]),
  playerSetupParameterIds: Object.freeze([]),
  playerIds: Object.freeze([]),
});

/** Reads the four lifecycle-owned values that identify one prepared map launch. */
export const CIV7_SETUP_IDENTITY_SNAPSHOT_SELECTION: Civ7SetupSnapshotSelection = Object.freeze({
  setupParameterIds: Object.freeze(["Map", "MapSize", "MapRandomSeed", "GameRandomSeed"]),
  playerSetupParameterIds: Object.freeze([]),
  playerIds: Object.freeze([]),
});

export async function getCiv7SetupSnapshot(
  options: Civ7DirectControlOptions = {},
  dependencies: SetupReadDependencies = defaultSetupReadDependencies
): Promise<Civ7SetupSnapshotResult> {
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildSetupSnapshotCommand(dependencies),
  });
  return dependencies.parseSetupSnapshot(result, "Civ7 setup snapshot");
}

/** Reads exactly the setup parameters and player slots requested by one consumer. */
export async function getCiv7SelectedSetupSnapshot(
  selection: Civ7SetupSnapshotSelection,
  options: Civ7DirectControlOptions = {},
  dependencies: SetupReadDependencies = defaultSetupReadDependencies
): Promise<Civ7SetupSnapshotResult> {
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildSetupSnapshotCommand(dependencies, selection),
  });
  return dependencies.parseSetupSnapshot(result, "Selected Civ7 setup snapshot");
}

/** Reads the setup phase and conditionally exits an active game in one App UI command. */
export async function admitCiv7SetupShell(
  policy: Civ7SetupShellAdmissionPolicy,
  options: Civ7DirectControlOptions = {},
  dependencies: SetupReadDependencies = defaultSetupReadDependencies
): Promise<Civ7SetupShellAdmissionResult> {
  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: buildSetupShellAdmissionCommand(policy, dependencies),
  });
  const payload = jsonPayloadFromCommandResult<Civ7SetupShellAdmissionPayload>(
    command,
    "Civ7 setup shell admission"
  );
  const initial = commandResultWithSnapshot(command, payload.initial);
  switch (payload.transition) {
    case "shell":
      return { initial, transition: "shell" };
    case "exit-sent": {
      await options.session?.resetConnection();
      return { initial, transition: "exit-sent", shellExit: command };
    }
    case "refused":
      throw new Civ7DirectControlError(
        "setup-phase-refused",
        `Civ7 setup shell admission refused phase ${payload.initial.phase}`,
        { details: initial }
      );
    default:
      throw new Civ7DirectControlError(
        "command-failed",
        "Civ7 setup shell admission returned an unknown transition",
        { details: { command, payload } }
      );
  }
}

export async function reloadCiv7SetupUiInShell(
  options: Civ7DirectControlOptions = {},
  dependencies: SetupReadDependencies = defaultSetupReadDependencies
): Promise<Civ7SetupUiReloadResult> {
  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: buildSetupShellReloadCommand(dependencies),
  });
  const payload = jsonPayloadFromCommandResult<Civ7SetupShellReloadPayload>(
    command,
    "Civ7 setup shell reload"
  );
  return { command, snapshot: payload.snapshot, reloaded: payload.reloaded };
}

export async function getCiv7SetupMapRows(
  input: Civ7SetupMapRowsInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: SetupReadDependencies = defaultSetupReadDependencies
): Promise<Civ7SetupMapRowsResult> {
  if (input.file !== undefined) validateMapScript(input.file);
  const limit = dependencies.boundedInteger(input.limit ?? 100, 1, 1_000, "limit");
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildSetupMapRowsCommand({ ...input, limit }, dependencies),
  });
  return dependencies.parseSetupMapRows(result, "Civ7 setup map rows");
}

export function buildSetupSnapshotCommand(
  dependencies: SetupReadDependencies,
  selection?: Civ7SetupSnapshotSelection
): string {
  return `(() => {
    ${setupSnapshotScriptSource(dependencies, selection)}
    return JSON.stringify({ snapshot: readSetupSnapshot() });
  })()`;
}

function buildSetupShellAdmissionCommand(
  policy: Civ7SetupShellAdmissionPolicy,
  dependencies: SetupReadDependencies
): string {
  return `(() => {
    ${setupSnapshotScriptSource(dependencies, CIV7_SETUP_PHASE_SNAPSHOT_SELECTION)}
    const policy = ${dependencies.jsLiteral(policy)};
    const initial = readSetupSnapshot();
    if (initial.phase === "shell") {
      return JSON.stringify({ initial, transition: "shell" });
    }
    if (initial.phase === "running-game" && policy === "exit-active-game") {
      ${dependencies.exitToMainMenuCommand};
      return JSON.stringify({ initial, transition: "exit-sent" });
    }
    return JSON.stringify({ initial, transition: "refused" });
  })()`;
}

function buildSetupShellReloadCommand(dependencies: SetupReadDependencies): string {
  return `(() => {
    ${setupSnapshotScriptSource(dependencies, CIV7_SETUP_PHASE_SNAPSHOT_SELECTION)}
    const snapshot = readSetupSnapshot();
    if (snapshot.phase !== "shell") {
      return JSON.stringify({ snapshot, reloaded: false });
    }
    ${dependencies.reloadUiCommand};
    return JSON.stringify({ snapshot, reloaded: true });
  })()`;
}

function buildSetupMapRowsCommand(
  input: Civ7SetupMapRowsInput & { limit: number },
  dependencies: SetupReadDependencies
): string {
  return `(() => {
    ${setupSnapshotScriptSource(dependencies, CIV7_SETUP_PHASE_SNAPSHOT_SELECTION)}
    const input = ${dependencies.jsLiteral(input)};
    const rows = readSetupMapRows(input.file).slice(0, input.limit);
    return JSON.stringify({
      rows,
      limit: input.limit,
      ...(input.file && rows.some((row) => row.file === input.file)
        ? { matchedFile: input.file }
        : {}),
    });
  })()`;
}

export function setupSnapshotScriptSource(
  dependencies: SetupReadDependencies,
  selection?: Civ7SetupSnapshotSelection
): string {
  const setupParameterIds = selection
    ? uniqueSortedStrings(selection.setupParameterIds)
    : dependencies.setupParameterIds;
  const playerSetupParameterIds = selection
    ? uniqueSortedStrings(selection.playerSetupParameterIds)
    : dependencies.playerSetupParameterIds;
  const selectedPlayerIds = selection
    ? Array.from(new Set(selection.playerIds)).sort((left, right) => left - right)
    : undefined;
  return `${dependencies.probeHelperSource()}
    ${canonicalMapSizeTypeScriptSource()}
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
    const boundedPossibleValue = (candidate) => {
      const value = scalarValue(candidate);
      if (value !== null && !["string", "number", "boolean"].includes(typeof value)) return null;
      const source = candidate && typeof candidate === "object" ? candidate : {};
      return {
        value,
        destroyed: source.destroyed === true,
        hidden: source.hidden === true,
        readOnly: source.readOnly === true,
        invalidReason: source.invalidReason ?? null,
      };
    };
    const parameterValue = (parameter) => parameter.array === true
      ? parameter.values.map(scalarValue).filter((value) => typeof value === "string")
      : scalarValue(parameter.value);
    const parameterPossibleValues = (parameter) =>
      Array.isArray(parameter?.domain?.possibleValues)
        ? parameter.domain.possibleValues.map(boundedPossibleValue).filter(Boolean)
        : undefined;
    const rowFile = (row) => {
      if (row == null || typeof row !== "object") return undefined;
      return row.File ?? row.file;
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
      const possibleValues = parameterPossibleValues(parameter);
      return {
        id,
        exists: true,
        array: parameter.array === true,
        destroyed: parameter.destroyed === true,
        hidden: parameter.hidden === true,
        readOnly: parameter.readOnly === true,
        invalidReason: parameter.invalidReason ?? null,
        value: parameterValue(parameter),
        rawValue: plain(parameter.value),
        possibleValues,
      };
    };
    const readPlayerParameter = (playerId, id) => {
      const parameter = typeof GameSetup !== "undefined" && GameSetup && typeof GameSetup.findPlayerParameter === "function"
        ? GameSetup.findPlayerParameter(playerId, id)
        : undefined;
      if (!parameter) return { id, exists: false };
      const possibleValues = parameterPossibleValues(parameter);
      return {
        id,
        exists: true,
        array: parameter.array === true,
        destroyed: parameter.destroyed === true,
        hidden: parameter.hidden === true,
        readOnly: parameter.readOnly === true,
        invalidReason: parameter.invalidReason ?? null,
        value: parameterValue(parameter),
        rawValue: plain(parameter.value),
        possibleValues,
      };
    };
    const readPlayerConfig = (playerId) => {
      if (typeof Configuration === "undefined" || !Configuration || typeof Configuration.getPlayer !== "function") {
        throw new Error("Configuration.getPlayer unavailable");
      }
      return Configuration.getPlayer(playerId);
    };
    const playerConfigIsActive = (config) => {
      if (!config) return false;
      if (typeof SlotStatus === "undefined" || !SlotStatus) return false;
      const slotStatus = config.slotStatus;
      if (!Object.values(SlotStatus).includes(slotStatus)) return false;
      return slotStatus !== SlotStatus.SS_CLOSED && slotStatus !== SlotStatus.SS_OPEN;
    };
    const readPlayerExists = (playerId) => probe(() => readPlayerConfig(playerId) != null);
    const readPlayerActive = (playerId) => probe(() => playerConfigIsActive(readPlayerConfig(playerId)));
    const readPlayerSlotStatus = (playerId) => probe(() => readPlayerConfig(playerId)?.slotStatus ?? null);
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
      try {
        const maxMajorPlayers = Number(Configuration.getMap().maxMajorPlayers);
        const max = Number.isInteger(maxMajorPlayers) && maxMajorPlayers > 0 ? Math.min(maxMajorPlayers, 64) : 0;
        for (let playerId = 0; playerId < max; playerId += 1) {
          const config = readPlayerConfig(playerId);
          if (playerConfigIsActive(config)) ids.add(playerId);
        }
      } catch {}
      return Array.from(ids).filter((id) => Number.isInteger(id) && id >= 0).sort((a, b) => a - b);
    };
    const readSetupMapRows = (file) => {
      const rows = [];
      const mapParameter = typeof GameSetup !== "undefined" && GameSetup && typeof GameSetup.findGameParameter === "function"
        ? GameSetup.findGameParameter("Map")
        : undefined;
      const mapValues = mapParameter?.domain && Array.isArray(mapParameter.domain.possibleValues)
        ? mapParameter.domain.possibleValues
        : [];
      for (const value of mapValues) {
        const row = mapRowFrom("setup-domain", value);
        if (row && (!file || row.file === file)) rows.push(row);
      }
      try {
        if (typeof Database !== "undefined" && Database && typeof Database.query === "function") {
          const dbRows = Array.from(Database.query("config", "SELECT Domain, File, Name, Description, SortIndex FROM Maps"));
          for (const value of dbRows) {
            const row = mapRowFrom("config-db", value);
            if (row && (!file || row.file === file)) rows.push(row);
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
      const parameterIds = ${dependencies.jsLiteral(setupParameterIds)};
      const parameters = parameterIds.map(readParameter);
      const playerParameterIds = ${dependencies.jsLiteral(playerSetupParameterIds)};
      const playerIds = ${
        selectedPlayerIds ? dependencies.jsLiteral(selectedPlayerIds) : "readActivePlayerIds()"
      };
      const playerParameters = playerIds.map((playerId) => ({
        playerId,
        exists: readPlayerExists(playerId),
        active: readPlayerActive(playerId),
        slotStatus: readPlayerSlotStatus(playerId),
        parameters: playerParameterIds.map((id) => readPlayerParameter(playerId, id)),
      }));
      const mapParam = parameters.find((parameter) => parameter.id === "Map");
      const selectedFile = typeof mapParam?.value === "string" ? mapParam.value : undefined;
      const mapRows = readSetupMapRows();
      const selectedMapRow = selectedFile
        ? mapRows.find((row) => row.file === selectedFile)
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
          mapSizeType: probe(() => readCanonicalMapSizeType()),
          mapSeed: probe(() => Configuration.getMap().mapSeed),
          gameSeed: probe(() => Configuration.getGame().gameSeed),
          playerCount: probe(() => Configuration.getMap().maxMajorPlayers),
        },
      };
    };`;
}

function uniqueSortedStrings(values: readonly string[]): readonly string[] {
  return Array.from(new Set(values)).sort();
}

export function validateMapScript(value: string): string {
  if (!value.trim() || value.length > 512 || /[\0\r\n]/.test(value)) {
    throw new Civ7DirectControlError(
      "setup-parameter-invalid",
      "mapScript must be a non-empty single-line string"
    );
  }
  return value;
}

function commandResultWithSnapshot(
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

export const defaultSetupReadDependencies: SetupReadDependencies = {
  boundedInteger,
  executeAppUiCommand: executeCiv7AppUiCommand,
  exitToMainMenuCommand: CIV7_EXIT_TO_MAIN_MENU_COMMAND,
  jsLiteral,
  parseSetupMapRows: (result, label) =>
    jsonPayloadFromCommandResult<Civ7SetupMapRowsResult>(result, label),
  parseSetupSnapshot: (result, label) =>
    jsonPayloadFromCommandResult<Civ7SetupSnapshotResult>(result, label),
  probeHelperSource,
  playerSetupParameterIds: DEFAULT_CIV7_PLAYER_SETUP_PARAMETER_IDS,
  reloadUiCommand: CIV7_RELOAD_UI_COMMAND,
  setupParameterIds: DEFAULT_CIV7_SETUP_PARAMETER_IDS,
};
