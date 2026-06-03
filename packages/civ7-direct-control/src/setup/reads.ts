import { Civ7DirectControlError } from "../direct-control-error";

import type {
  Civ7ActionApproval,
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7SetupMapRowVisibilityInput,
  Civ7SetupMapRowVisibilityResult,
  Civ7SetupMapRowsInput,
  Civ7SetupMapRowsResult,
  Civ7SetupPhase,
  Civ7SetupSnapshotResult,
} from "../index";

export type SetupReadDependencies = Readonly<{
  assertApproved: (approval: Civ7ActionApproval, action: string) => void;
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
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

export async function getCiv7SetupSnapshot(
  options: Civ7DirectControlOptions = {},
  dependencies: SetupReadDependencies,
): Promise<Civ7SetupSnapshotResult> {
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildSetupSnapshotCommand(dependencies),
  });
  return dependencies.parseSetupSnapshot(result, "Civ7 setup snapshot");
}

export async function getCiv7SetupMapRows(
  input: Civ7SetupMapRowsInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: SetupReadDependencies,
): Promise<Civ7SetupMapRowsResult> {
  if (input.file !== undefined) validateMapScript(input.file);
  const limit = dependencies.boundedInteger(input.limit ?? 100, 1, 1_000, "limit");
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildSetupMapRowsCommand({ ...input, limit }, dependencies),
  });
  return dependencies.parseSetupMapRows(result, "Civ7 setup map rows");
}

export async function ensureCiv7SetupMapRowVisible(
  input: Civ7SetupMapRowVisibilityInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval | undefined,
  dependencies: SetupReadDependencies,
): Promise<Civ7SetupMapRowVisibilityResult> {
  validateMapScript(input.file);
  const limit = dependencies.boundedInteger(input.limit ?? 100, 1, 1_000, "limit");
  const rowInput = { file: input.file, limit };
  const initial = await getCiv7SetupMapRows(rowInput, options, dependencies);
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
  dependencies.assertApproved(approval, "refreshing Civ7 setup map rows");
  const waitTimeoutMs = input.waitTimeoutMs ?? options.timeoutMs ?? 30_000;
  const pollIntervalMs = input.pollIntervalMs ?? 1_000;
  const shellBefore = await getCiv7SetupSnapshot(options, dependencies).catch(() => undefined);
  const shellExit = shellBefore?.snapshot.phase === "shell"
    ? undefined
    : await dependencies.executeAppUiCommand({
        ...options,
        command: dependencies.exitToMainMenuCommand,
      });
  const shellAfter = await waitForCiv7SetupPhase("shell", options, { waitTimeoutMs, pollIntervalMs }, dependencies);
  const reload = await dependencies.executeAppUiCommand({
    ...options,
    command: dependencies.reloadUiCommand,
  });
  const final = await waitForCiv7SetupMapRows(rowInput, options, { waitTimeoutMs, pollIntervalMs }, dependencies);
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

export function buildSetupSnapshotCommand(dependencies: SetupReadDependencies): string {
  return `(() => {
    ${setupSnapshotScriptSource(dependencies)}
    return JSON.stringify({ snapshot: readSetupSnapshot() });
  })()`;
}

export function buildSetupMapRowsCommand(
  input: Civ7SetupMapRowsInput & { limit: number },
  dependencies: SetupReadDependencies,
): string {
  return `(() => {
    ${setupSnapshotScriptSource(dependencies)}
    const input = ${dependencies.jsLiteral(input)};
    const rows = readSetupMapRows(input.file).slice(0, input.limit);
    return JSON.stringify({
      rows,
      limit: input.limit,
      ...(input.file ? { matchedFile: input.file } : {}),
    });
  })()`;
}

export function setupSnapshotScriptSource(dependencies: SetupReadDependencies): string {
  return `${dependencies.probeHelperSource()}
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
      const parameterIds = ${dependencies.jsLiteral(dependencies.setupParameterIds)};
      const parameters = parameterIds.map(readParameter);
      const playerParameterIds = ${dependencies.jsLiteral(dependencies.playerSetupParameterIds)};
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

export function validateMapScript(value: string): string {
  if (!value.trim() || value.length > 512 || /[\0\r\n]/.test(value)) {
    throw new Civ7DirectControlError(
      "setup-parameter-invalid",
      "mapScript must be a non-empty single-line string",
    );
  }
  return value;
}

async function waitForCiv7SetupPhase(
  phase: Civ7SetupPhase,
  options: Civ7DirectControlOptions,
  wait: { waitTimeoutMs: number; pollIntervalMs: number },
  dependencies: SetupReadDependencies,
): Promise<Civ7SetupSnapshotResult> {
  const startedAt = Date.now();
  let last: Civ7SetupSnapshotResult | undefined;
  while (Date.now() - startedAt <= wait.waitTimeoutMs) {
    try {
      const snapshot = await getCiv7SetupSnapshot(options, dependencies);
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

async function waitForCiv7SetupMapRows(
  input: Required<Pick<Civ7SetupMapRowsInput, "file" | "limit">>,
  options: Civ7DirectControlOptions,
  wait: { waitTimeoutMs: number; pollIntervalMs: number },
  dependencies: SetupReadDependencies,
): Promise<Civ7SetupMapRowsResult> {
  const startedAt = Date.now();
  let last = await getCiv7SetupMapRows(input, options, dependencies);
  if (last.rows.length > 0) return last;
  while (Date.now() - startedAt <= wait.waitTimeoutMs) {
    await sleep(wait.pollIntervalMs);
    last = await getCiv7SetupMapRows(input, options, dependencies);
    if (last.rows.length > 0) return last;
  }
  return last;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
