import { Civ7DirectControlError } from "../direct-control-error.js";
import { getCiv7MapSummary } from "../play/map/reads.js";
import type { Civ7MapSummaryResult } from "../play/map/types.js";
import {
  appUiSnapshotFromCommandResult,
  buildAppUiSnapshotCommand,
  type Civ7AppUiSnapshot,
  type Civ7AppUiSnapshotResult,
} from "../runtime/app-ui-snapshot.js";
import { probeValue } from "../runtime/probe.js";
import {
  type Civ7TunerHealthResult,
  waitForCiv7TunerReadyWithSession,
} from "../runtime/tuner-health.js";
import {
  jsonPayloadFromCommandResult,
  throwUnexpectedCommandPayloadStatus,
} from "../session/command-result.js";
import { executeSessionCommandWithReconnect } from "../session/reconnect.js";
import { type Civ7DirectControlSession, withCiv7DirectControlSession } from "../session/session.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerStateSelection,
} from "../session/types.js";
import { validateIdentifier } from "../validation.js";
import { CIV7_BEGIN_GAME_COMMAND, CIV7_UI_LOADING_STATES } from "./constants.js";
import {
  assertPreparedSetupMatches,
  type Civ7SinglePlayerSetupInput,
  type Civ7SinglePlayerSetupValues,
  normalizeSinglePlayerSetupInput,
  setupExpectationScriptSource,
  setupSnapshotSelectionFromInput,
} from "./prepare.js";
import {
  type Civ7SetupSnapshot,
  type Civ7SetupSnapshotResult,
  defaultSetupReadDependencies,
  type SetupReadDependencies,
  setupSnapshotScriptSource,
} from "./reads.js";
import { beginGameResultFromCommand, buildBeginGameCommand } from "./restart.js";

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

export type Civ7SinglePlayerHostResult = Readonly<{
  command: Civ7CommandResult;
  before: Civ7SetupSnapshotResult;
  accepted: true;
}>;

type Civ7SinglePlayerHostPayload =
  | Readonly<{
      status: "performed";
      before: Civ7SetupSnapshot;
      accepted: boolean;
    }>
  | Readonly<{
      status: "refused";
      before: Civ7SetupSnapshot;
      mismatch: string;
    }>;

type SetupStartDependencies = SetupReadDependencies &
  Readonly<{
    appUiState: Civ7TunerStateSelection;
    beginGameCommand: string;
    executeSessionCommandWithReconnect: (
      session: Civ7DirectControlSession,
      options: Readonly<{
        command: string;
        state?: Civ7TunerStateSelection;
        timeoutMs?: number;
      }>,
      attempts?: number
    ) => Promise<Civ7CommandResult>;
    getMapSummary: (options: Civ7DirectControlOptions) => Promise<Civ7MapSummaryResult>;
    parseStartPayload: (result: Civ7CommandResult, label: string) => Civ7SinglePlayerHostPayload;
    uiLoadingStates: Readonly<{
      WaitingForUIReady: number;
      WaitingToStart: number;
      GameStarted: number;
    }>;
    validateIdentifier: (value: string, label: string) => string;
    waitForTunerReadyWithSession: (
      session: Civ7DirectControlSession,
      options: {
        timeoutMs?: number;
        waitTimeoutMs?: number;
        pollIntervalMs?: number;
      }
    ) => Promise<Civ7TunerHealthResult & { ready: true }>;
    withSession: <T>(
      options: Civ7DirectControlOptions,
      run: (session: Civ7DirectControlSession) => Promise<T>
    ) => Promise<T>;
  }>;

export async function hostPreparedCiv7SinglePlayerGame(
  expected: Civ7SinglePlayerSetupValues,
  options: Civ7DirectControlOptions = {},
  dependencies: SetupStartDependencies = defaultSetupStartDependencies
): Promise<Civ7SinglePlayerHostResult> {
  const normalized = normalizeSinglePlayerSetupInput(expected, dependencies);
  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: buildStartPreparedSinglePlayerCommand(normalized, dependencies),
  });
  return hostResultFromCommand(command, normalized, dependencies);
}

/** @deprecated Use `lifecycle.singlePlayer.start` from `@civ7/control-orpc`. */
export async function startPreparedCiv7SinglePlayerGame(
  input: Civ7PreparedStartInput,
  options: Civ7DirectControlOptions = {},
  dependencies: SetupStartDependencies = defaultSetupStartDependencies
): Promise<Civ7SinglePlayerStartResult> {
  const expected = normalizeSinglePlayerSetupInput(input.expected, dependencies);
  const waitTimeoutMs = input.waitTimeoutMs ?? options.timeoutMs ?? 120_000;
  const pollIntervalMs = input.pollIntervalMs ?? 1_000;
  const observations: Civ7AppUiSnapshot[] = [];
  return await dependencies.withSession(options, async (session) => {
    const command = await session.executeCommand({
      state: dependencies.appUiState,
      command: buildStartPreparedSinglePlayerCommand(expected, dependencies),
      timeoutMs: options.timeoutMs,
    });
    const host = hostResultFromCommand(command, expected, dependencies);
    const before = host.before;

    let begin: Civ7CommandResult | undefined;
    let beginAttempted = false;
    let beginError: string | undefined;
    let finalAppUi: Civ7AppUiSnapshotResult | undefined;
    const startedAt = Date.now();
    while (Date.now() - startedAt <= waitTimeoutMs) {
      try {
        const snapshotResult = appUiSnapshotFromCommandResult(
          await dependencies.executeSessionCommandWithReconnect(session, {
            state: dependencies.appUiState,
            command: buildAppUiSnapshotCommand(),
            timeoutMs: options.timeoutMs,
          })
        );
        observations.push(snapshotResult.snapshot);
        const loadingState = probeValue(snapshotResult.snapshot.ui.loadingState);
        if (
          !beginAttempted &&
          isCiv7BeginReadyLoadingState(loadingState, dependencies.uiLoadingStates)
        ) {
          beginAttempted = true;
          try {
            begin = await dependencies.executeSessionCommandWithReconnect(
              session,
              {
                state: dependencies.appUiState,
                command: buildBeginGameCommand(dependencies),
                timeoutMs: options.timeoutMs,
              },
              1
            );
            const beginResult = beginGameResultFromCommand(begin);
            if (!beginResult.accepted) {
              throw new Civ7DirectControlError(
                "setup-phase-refused",
                `Civ7 Begin refused: ${beginResult.reason}`,
                { details: beginResult }
              );
            }
          } catch (err) {
            beginError = errorMessage(err);
            throw err;
          }
        }
        if (
          loadingState === dependencies.uiLoadingStates.GameStarted &&
          probeValue(snapshotResult.snapshot.ui.inGame) === true
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
        { details: { before, observations, beginAttempted, beginError } }
      );
    }

    const tunerHealth = input.waitForTuner
      ? await dependencies.waitForTunerReadyWithSession(session, {
          timeoutMs: options.timeoutMs,
          waitTimeoutMs,
          pollIntervalMs,
        })
      : undefined;
    const mapSummary = input.waitForTuner
      ? await dependencies.getMapSummary({ ...options, timeoutMs: options.timeoutMs })
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
      verified: mapSummary ? true : probeValue(finalAppUi.snapshot.ui.inGame) === true,
    };
  });
}

export function buildStartPreparedSinglePlayerCommand(
  expected: Civ7SinglePlayerSetupValues,
  dependencies: SetupReadDependencies
): string {
  return `(() => {
    ${setupSnapshotScriptSource(dependencies, setupSnapshotSelectionFromInput(expected))}
    ${setupExpectationScriptSource()}
    const expected = ${dependencies.jsLiteral(expected)};
    const before = readSetupSnapshot();
    const mismatch = setupExpectationMismatch(expected, before);
    if (mismatch) {
      return JSON.stringify({ status: "refused", before, mismatch });
    }
    const serverType = typeof ServerType !== "undefined" && ServerType && ServerType.SERVER_TYPE_NONE !== undefined
      ? ServerType.SERVER_TYPE_NONE
      : 0;
    return JSON.stringify({
      status: "performed",
      before,
      accepted: Network.hostGame(serverType) === true,
    });
  })()`;
}

function hostResultFromCommand(
  command: Civ7CommandResult,
  expected: Civ7SinglePlayerSetupInput,
  dependencies: Pick<SetupStartDependencies, "parseStartPayload">
): Civ7SinglePlayerHostResult {
  const payload = dependencies.parseStartPayload(command, "Civ7 prepared single-player host");
  const status = payload.status;
  switch (status) {
    case "performed": {
      const before = setupSnapshotResult(command, payload.before);
      if (!payload.accepted) {
        throw new Civ7DirectControlError(
          "setup-host-rejected",
          "Civ7 Network.hostGame returned false",
          {
            details: { before, command },
          }
        );
      }
      assertPreparedSetupMatches(expected, before.snapshot);
      return { command, before, accepted: true };
    }
    case "refused": {
      const before = setupSnapshotResult(command, payload.before);
      const code =
        payload.mismatch === "phase"
          ? "setup-phase-refused"
          : payload.mismatch === "map-row"
            ? "setup-map-row-missing"
            : "setup-readback-mismatch";
      throw new Civ7DirectControlError(
        code,
        `Civ7 prepared setup changed before host: ${payload.mismatch}`,
        { details: { before, mismatch: payload.mismatch } }
      );
    }
    default:
      return throwUnexpectedCommandPayloadStatus(
        command,
        "Civ7 prepared single-player host",
        status
      );
  }
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

function assertPostStartMatches(
  input: Civ7SinglePlayerSetupInput,
  summary: Civ7MapSummaryResult
): void {
  const seed = probeValue(summary.map.randomSeed);
  if (typeof seed !== "number" || !Number.isFinite(seed) || seed !== input.seed) {
    throw new Civ7DirectControlError(
      "setup-seed-mismatch",
      `Civ7 runtime map seed ${seed} did not match ${input.seed}`,
      {
        details: { input, summary },
      }
    );
  }
  const mapSizeType = probeValue(summary.map.mapSizeType);
  if (typeof mapSizeType !== "string" || mapSizeType !== input.mapSize) {
    throw new Civ7DirectControlError(
      "setup-map-size-mismatch",
      `Civ7 runtime map size ${mapSizeType ?? "unavailable"} did not match ${input.mapSize}`,
      { details: { input, summary } }
    );
  }
}

function isCiv7BeginReadyLoadingState(
  state: number | undefined,
  loadingStates: Pick<
    SetupStartDependencies["uiLoadingStates"],
    "WaitingForUIReady" | "WaitingToStart"
  >
): boolean {
  return state === loadingStates.WaitingForUIReady || state === loadingStates.WaitingToStart;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const defaultSetupStartDependencies: SetupStartDependencies = {
  ...defaultSetupReadDependencies,
  appUiState: { role: "app-ui" },
  beginGameCommand: CIV7_BEGIN_GAME_COMMAND,
  executeSessionCommandWithReconnect,
  getMapSummary: getCiv7MapSummary,
  parseStartPayload: (result, label) =>
    jsonPayloadFromCommandResult<Civ7SinglePlayerHostPayload>(result, label),
  uiLoadingStates: CIV7_UI_LOADING_STATES,
  validateIdentifier,
  waitForTunerReadyWithSession: async (session, options) =>
    await waitForCiv7TunerReadyWithSession(session, options, {
      executeSessionCommandWithReconnect,
    }),
  withSession: withCiv7DirectControlSession,
};
